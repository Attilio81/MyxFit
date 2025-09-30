
// FIX: Corrected local type definitions for import.meta.env by using `declare global`
// to properly augment TypeScript's global `ImportMeta` interface. This resolves
// TypeScript errors when the project's tsconfig.json is not correctly configured
// to include Vite's client types.
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { supabase } from '../services/supabase';
import { GoogleGenAI } from '@google/genai';
import type { Chat, FunctionCall, FunctionDeclaration, GenerateContentResponse, Type } from '@google/genai';

import BottomNav from './common/BottomNav';
import LatestPRsList from './LatestPRsList';
import PRHistoryView from './PRHistoryView';

import { DumbbellIcon, ChatBubbleOvalLeftEllipsisIcon } from './common/Icons';
import type { Session } from '@supabase/supabase-js';
import type { Movement, PersonalRecord, WODRecord, ChatMessage } from '../types';

// Lazy load components for code-splitting and performance optimization
const AddMovementModal = lazy(() => import('./AddMovementModal'));
const AddWODScoreModal = lazy(() => import('./AddWODScoreModal'));
const Chatbot = lazy(() => import('./Chatbot'));
const CalculatorView = lazy(() => import('./views/CalculatorView'));
const AddPRView = lazy(() => import('./views/AddPRView'));
const WODsView = lazy(() => import('./views/WODsView'));


type View = 'prs' | 'calculator' | 'add' | 'wods';
type PRPageState = 'list' | 'history';

const addPrToolDeclaration: FunctionDeclaration = {
    name: 'addPersonalRecord',
    description: 'Adds a new personal record for a specific movement.',
    parameters: {
      type: 'OBJECT' as Type.OBJECT,
      properties: {
        movementName: {
          type: 'STRING' as Type.STRING,
          description: 'The name of the movement, e.g., "Back Squat" or "Deadlift".',
        },
        value: {
          type: 'STRING' as Type.STRING,
          description: 'The result achieved, e.g., "150kg" or "5:21".',
        },
        date: {
            type: 'STRING' as Type.STRING,
            description: 'The date the PR was achieved, in YYYY-MM-DD format. Defaults to today if not provided.',
        },
        notes: {
          type: 'STRING' as Type.STRING,
          description: 'Any additional notes about the record.',
        },
      },
      required: ['movementName', 'value'],
    },
};

const Dashboard: React.FC<{ session: Session; onLogout: () => void; }> = ({ session, onLogout }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [wodRecords, setWodRecords] = useState<WODRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [currentView, setCurrentView] = useState<View>('prs');
  const [prPageState, setPRPageState] = useState<PRPageState>('list');
  const [selectedMovementId, setSelectedMovementId] = useState<number | null>(null);

  // Modal states
  const [isAddMovementModalOpen, setIsAddMovementModalOpen] = useState(false);
  const [isAddWODScoreModalOpen, setIsAddWODScoreModalOpen] = useState(false);
  const [selectedWOD, setSelectedWOD] = useState<string | null>(null);

  // Search state
  const [prSearchTerm, setPrSearchTerm] = useState('');

  // Chatbot states
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const chatInitialized = useRef(false);
  const [isAiAvailable, setIsAiAvailable] = useState(false);
  
  const geminiApiKey = import.meta.env.VITE_API_KEY;


  const fetchData = useCallback(async (options: { keepLoading?: boolean } = {}) => {
    if (!options.keepLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const movementsPromise = supabase.from('movements').select('*').order('name');
      const recordsPromise = supabase.from('personal_records').select('*, movements(name, type)').eq('user_id', session.user.id).order('date', { ascending: false });
      const wodRecordsPromise = supabase.from('wod_records').select('*').eq('user_id', session.user.id).order('date', { ascending: false });

      const [{ data: movementsData, error: movementsError }, { data: recordsData, error: recordsError }, { data: wodRecordsData, error: wodRecordsError }] = await Promise.all([movementsPromise, recordsPromise, wodRecordsPromise]);

      if (movementsError) throw movementsError;
      if (recordsError) throw recordsError;
      if (wodRecordsError) throw wodRecordsError;

      setMovements(movementsData || []);
      setRecords(recordsData as PersonalRecord[] || []);
      setWodRecords(wodRecordsData as WODRecord[] || []);

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      setError(`Could not fetch data: ${error.message}`);
    } finally {
      if (!options.keepLoading) {
        setLoading(false);
      }
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear search term when navigating away from PRs view
  useEffect(() => {
    if (currentView !== 'prs') {
        setPrSearchTerm('');
    }
  }, [currentView]);

  // Initialize AI Chat ONCE
  useEffect(() => {
    if (chatInitialized.current) return;

    if (!geminiApiKey) {
      console.warn("Gemini API key not found. Chatbot will be disabled.");
      setIsAiAvailable(false);
      return;
    }
    
    setIsAiAvailable(true);
    chatInitialized.current = true;

    const initializeChat = async () => {
        try {
            // Fetch initial data for the prompt
            const { data: recordsData } = await supabase.from('personal_records').select('*, movements(name, type)').eq('user_id', session.user.id);
            const { data: wodRecordsData } = await supabase.from('wod_records').select('*').eq('user_id', session.user.id);

            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            const prData = (recordsData as PersonalRecord[] || []).map(r => ({
                movement: r.movements?.name,
                value: r.value,
                date: r.date,
                notes: r.notes
            }));
            const wodData = (wodRecordsData || []).map(w => ({
                wod: w.wod_name,
                score: w.score,
                date: w.date,
                notes: w.notes
            }));
    
            const systemInstruction = `You are a helpful and encouraging CrossFit coaching assistant. Use the information below to answer the user's questions about their performance and how to use the app. Always be positive and motivational. Keep answers concise.

Application Functionality Guide:
- **PRs Tab ('prs'):** Users can view their latest personal records for each movement. They can search for movements and click on any record to see a detailed history for that specific exercise.
- **Calculator Tab ('calculator'):** This tool allows users to calculate weight percentages based on their saved, weight-based PRs. It's useful for planning training sessions.
- **Add PR Tab ('add'):** This is where users can log new PRs. They can select an existing movement or add a new one if it's not in the list.
- **WODs Tab ('wods'):** This section lists famous benchmark WODs (like Murph, Fran). Users can view WOD details, log their scores, and see a history of their completed WODs.
- **Your Role:** In addition to answering questions, you can directly help the user by adding new PRs using the 'addPersonalRecord' function when they ask you to.

User's PR Data:
${JSON.stringify(prData)}

User's WOD Score Data:
${JSON.stringify(wodData)}
`;
    
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: [addPrToolDeclaration] }],
                },
            });

            setChatMessages([
                { role: 'model', text: 'Hi! I am your AI coaching assistant. How can I help you with your performance today?' }
            ]);
        } catch (e) {
            console.error("Failed to initialize AI Chat:", e);
            setIsAiAvailable(false);
            setChatMessages([{ role: 'model', text: 'Sorry, the AI assistant could not be initialized.' }]);
        }
    };
    
    initializeChat();

  }, [geminiApiKey, session.user.id]);

  const latestRecords = useMemo(() => {
    const recordMap = new Map<number, PersonalRecord>();
    records.forEach(record => {
      if (!recordMap.has(record.movement_id)) {
        recordMap.set(record.movement_id, record);
      }
    });
    return Array.from(recordMap.values()).sort((a, b) => {
        const nameA = a.movements?.name || '';
        const nameB = b.movements?.name || '';
        return nameA.localeCompare(nameB);
    });
  }, [records]);

  const filteredLatestRecords = useMemo(() => {
    if (!prSearchTerm) {
        return latestRecords;
    }
    return latestRecords.filter(record =>
        record.movements?.name.toLowerCase().includes(prSearchTerm.toLowerCase())
    );
  }, [latestRecords, prSearchTerm]);

  const handleMovementAdded = useCallback(() => {
    setIsAddMovementModalOpen(false);
    fetchData();
  }, [fetchData]);

  const handleWODScoreAdded = useCallback(() => {
    setIsAddWODScoreModalOpen(false);
    setSelectedWOD(null);
    fetchData();
  }, [fetchData]);

  const handleDeleteRecord = async (id: number) => {
    await supabase.from('personal_records').delete().match({ id, user_id: session.user.id });
    fetchData();
  };

  const handleDeleteWODRecord = async (id: number) => {
    await supabase.from('wod_records').delete().match({ id, user_id: session.user.id });
    fetchData();
  };
  
  const handleAddScoreClick = (wodName: string) => {
    setSelectedWOD(wodName);
    setIsAddWODScoreModalOpen(true);
  };

  const handleSelectMovement = (movementId: number) => {
    setSelectedMovementId(movementId);
    setPRPageState('history');
  };

  const handleSendMessage = async (message: string) => {
    if (!chatRef.current || !isAiAvailable) return;

    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message });
      let currentResponseText = '';
      let toolCalls: FunctionCall[] | undefined;
      
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        if (chunk.text) {
          currentResponseText += chunk.text;
          setChatMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = currentResponseText;
            return newMessages;
          });
        }
        if (chunk.functionCalls) {
            toolCalls = chunk.functionCalls;
        }
      }

      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        if (toolCall.name === 'addPersonalRecord') {
            const args = toolCall.args;
            const confirmationMessage = `I'm ready to add this PR:
- **Movement:** ${args.movementName}
- **Value:** ${args.value}
- **Date:** ${args.date || 'Today'}
- **Notes:** ${args.notes || 'None'}

Shall I proceed?`;
            
            setChatMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'model',
                    text: '',
                    pendingToolConfirmation: {
                        toolCall,
                        message: confirmationMessage
                    }
                };
                return newMessages;
            });
        }
      }

    } catch (e) {
      console.error("Error sending message to AI:", e);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleToolConfirmation = async (confirmed: boolean, toolCall: FunctionCall) => {
    setChatMessages(prev => prev.filter(m => !m.pendingToolConfirmation));

    if (!confirmed) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Okay, I've cancelled the request." }]);
        return;
    }

    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'model', text: 'Roger that! Saving your PR...' }]);

    const args = toolCall.args;
    const movementNameArg = (args.movementName as string) || '';
    const movement = movements.find(m => m.name.toLowerCase() === movementNameArg.toLowerCase());

    let functionResponsePayload;

    if (!movement) {
        setChatMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length-1].text = `I couldn't find the movement "${movementNameArg}". You can add new movements from the 'Add PR' tab.`;
            return newMessages;
        });
        setIsChatLoading(false);
        return; 
    } else {
        const { error: insertError } = await supabase.from('personal_records').insert({
            user_id: session.user.id,
            movement_id: movement.id,
            value: args.value,
            date: args.date || new Date().toISOString().split('T')[0],
            notes: args.notes,
        });

        if (insertError) {
             functionResponsePayload = { success: false, error: insertError.message };
        } else {
            await fetchData({ keepLoading: true });
            functionResponsePayload = { success: true, message: 'The PR was successfully saved.' };
        }
    }
    
    if (!chatRef.current) {
        setIsChatLoading(false);
        return;
    }

    try {
        const responseStream = await chatRef.current.sendMessageStream({ message: [ 
            { functionResponse: { name: toolCall.name, response: functionResponsePayload } } 
        ]});
        let finalResponseText = '';
        
        for await (const chunk of responseStream) {
            finalResponseText += chunk.text;
            setChatMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.text = finalResponseText;
                }
                return newMessages;
            });
        }

    } catch(e) {
        console.error("Error sending tool response to AI:", e);
        setChatMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'model') {
               lastMessage.text = "I've saved your PR, but had a little trouble getting a final response from the AI.";
            }
            return newMessages;
        });
    } finally {
        setIsChatLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'prs':
        if (prPageState === 'list') {
          return <LatestPRsList 
            records={filteredLatestRecords} 
            onSelectMovement={handleSelectMovement} 
            loading={loading}
            searchTerm={prSearchTerm}
            onSearchChange={setPrSearchTerm}
          />;
        }
        if (prPageState === 'history' && selectedMovementId) {
          return <PRHistoryView 
            movementId={selectedMovementId} 
            allRecords={records} 
            movements={movements}
            onDelete={handleDeleteRecord}
            onBack={() => setPRPageState('list')} 
          />;
        }
        return null;
      case 'calculator':
        return <CalculatorView records={records} />;
      case 'add':
        return <AddPRView 
          movements={movements} 
          onAddSuccess={fetchData} 
          onAddNewMovementClick={() => setIsAddMovementModalOpen(true)}
        />;
      case 'wods':
        return <WODsView
            wodRecords={wodRecords}
            onDeleteWODRecord={handleDeleteWODRecord}
            onAddScore={handleAddScoreClick}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 border-b border-dark-border sticky top-0 bg-dark-bg z-10">
        <div className="flex items-center space-x-2">
          <DumbbellIcon className="h-8 w-8 text-brand-primary"/>
          <h1 className="text-2xl font-bold">PR Tracker</h1>
        </div>
        <button
          onClick={onLogout}
          className="bg-dark-card hover:bg-dark-border text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Logout
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-4 pb-24">
        {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4" onClick={() => setError(null)}>{error}</div>}
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          {renderContent()}
        </Suspense>
      </main>

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {isAiAvailable && (
        <button
            onClick={() => setIsChatbotOpen(true)}
            className="fixed bottom-24 right-4 bg-brand-secondary hover:bg-orange-500 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 z-30"
            aria-label="Open AI Assistant"
        >
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8"/>
        </button>
      )}
      
      <Suspense>
        {isChatbotOpen && (
          <Chatbot
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onToolConfirm={handleToolConfirmation}
            isLoading={isChatLoading}
            isAvailable={isAiAvailable}
          />
        )}
      </Suspense>
      
      <Suspense>
        {isAddMovementModalOpen && (
          <AddMovementModal 
            isOpen={isAddMovementModalOpen}
            onClose={() => setIsAddMovementModalOpen(false)}
            onSuccess={handleMovementAdded}
          />
        )}
      </Suspense>
      
      <Suspense>
        {selectedWOD && isAddWODScoreModalOpen && (
            <AddWODScoreModal
              isOpen={isAddWODScoreModalOpen}
              onClose={() => { setIsAddWODScoreModalOpen(false); setSelectedWOD(null); }}
              onSuccess={handleWODScoreAdded}
              wodName={selectedWOD}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Dashboard;
