
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';

import AddMovementModal from './AddMovementModal';
import AddWODScoreModal from './AddWODScoreModal';
import BottomNav from './common/BottomNav';
import LatestPRsList from './LatestPRsList';
import PRHistoryView from './PRHistoryView';
import Chatbot from './Chatbot';
import CalculatorView from './views/CalculatorView';
import AddPRView from './views/AddPRView';
import WODsView from './views/WODsView';

import { DumbbellIcon, ChatBubbleOvalLeftEllipsisIcon } from './common/Icons';
import type { Session } from '@supabase/supabase-js';
import type { Movement, PersonalRecord, WODRecord, ChatMessage } from '../types';

type View = 'prs' | 'calculator' | 'add' | 'wods';
type PRPageState = 'list' | 'history';

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

  // Chatbot states
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const [isAiAvailable, setIsAiAvailable] = useState(false);
  
  const geminiApiKey = import.meta.env.VITE_API_KEY;


  const fetchData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize AI Chat
  useEffect(() => {
    // In a Vite project, environment variables are exposed on the client via `import.meta.env`.
    // To be exposed, they MUST be prefixed with `VITE_`.
    if (!geminiApiKey) {
      console.warn("Gemini API key not found. Chatbot will be disabled.");
      setIsAiAvailable(false);
      return;
    }
    
    setIsAiAvailable(true);

    const initializeChat = () => {
        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            const prData = records.map(r => ({
                movement: r.movements?.name,
                value: r.value,
                date: r.date,
                notes: r.notes
            }));
            const wodData = wodRecords.map(w => ({
                wod: w.wod_name,
                score: w.score,
                date: w.date,
                notes: w.notes
            }));
    
            const systemInstruction = `You are a helpful and encouraging CrossFit coaching assistant. The user's personal records (PRs) and workout-of-the-day (WOD) scores are provided below in JSON format. Analyze this data to answer the user's questions. Always be positive and motivational in your responses. Keep answers concise.
    
            User's PR Data:
            ${JSON.stringify(prData)}
    
            User's WOD Score Data:
            ${JSON.stringify(wodData)}
            `;
    
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction,
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
    
    // Initialize only when there's data, or if the data changes.
    if ((records.length > 0 || wodRecords.length > 0) && !chatRef.current) {
        initializeChat();
    } else if (chatRef.current) {
        // If data updates, re-initialize to get latest context
        initializeChat();
    }

  }, [records, wodRecords, geminiApiKey]);

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
      const response = await chatRef.current.sendMessageStream({ message });
      let currentResponse = '';
      setChatMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        currentResponse += chunk.text;
        setChatMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentResponse;
          return newMessages;
        });
      }
    } catch (e) {
      console.error("Error sending message to AI:", e);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'prs':
        if (prPageState === 'list') {
          return <LatestPRsList records={latestRecords} onSelectMovement={handleSelectMovement} loading={loading} />;
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
        {renderContent()}
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
      
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
        isAvailable={isAiAvailable}
      />
      
      <AddMovementModal 
        isOpen={isAddMovementModalOpen}
        onClose={() => setIsAddMovementModalOpen(false)}
        onSuccess={handleMovementAdded}
      />
      
      {selectedWOD && (
          <AddWODScoreModal
            isOpen={isAddWODScoreModalOpen}
            onClose={() => { setIsAddWODScoreModalOpen(false); setSelectedWOD(null); }}
            onSuccess={handleWODScoreAdded}
            wodName={selectedWOD}
        />
      )}
    </div>
  );
};

export default Dashboard;