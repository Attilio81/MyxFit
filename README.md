# CrossFit PR Tracker

Questa è un'applicazione web completa progettata per aiutare gli atleti di CrossFit a monitorare i loro progressi, registrare i record personali (PR), consultare i WOD (Workout of the Day) di riferimento e utilizzare strumenti utili come un calcolatore di percentuali. L'applicazione include anche un assistente AI integrato per fornire analisi e motivazione.

## ✨ Funzionalità Principali

- **Autenticazione Utente**: Sistema di registrazione e login sicuro gestito tramite Supabase.
- **Dashboard dei PR**: Una vista chiara e immediata degli ultimi record personali registrati per ogni movimento, ordinati alfabeticamente.
- **Storico dei Movimenti**: Cliccando su un record, è possibile visualizzare la cronologia completa di tutti i PR per quel specifico movimento, permettendo di tracciare i miglioramenti nel tempo.
- **Registrazione PR**: Un modulo intuitivo per aggiungere nuovi record personali, con la possibilità di selezionare il movimento, inserire il valore (peso o tempo), la data e note aggiuntive.
- **Gestione Movimenti**: Se un movimento non è presente nella lista, può essere aggiunto dinamicamente attraverso un comodo modale.
- **Benchmark WODs**: Una sezione dedicata ai più famosi WOD di CrossFit (come "Fran", "Murph", "Cindy", ecc.). Per ogni WOD è possibile visualizzare la descrizione e registrare il proprio punteggio.
- **Storico Punteggi WOD**: Tutti i punteggi dei WOD vengono salvati e mostrati in una lista dedicata.
- **Calcolatore di Percentuali**: Uno strumento per calcolare rapidamente le percentuali di carico basandosi sui propri massimali registrati, utile per la programmazione degli allenamenti.
- **Assistente AI (Coach Virtuale)**: Un chatbot basato sull'API di Google Gemini che ha accesso ai dati di performance dell'utente. È possibile porre domande come "Quali sono i miei punti deboli?" o "Mostrami i miei progressi nel Deadlift" per ricevere risposte intelligenti e motivazionali.
- **Design Moderno e Responsivo**: Interfaccia utente pulita, scura e completamente responsiva, costruita con Tailwind CSS per un'esperienza ottimale su desktop e mobile.

## 🚀 Tecnologie Utilizzate

- **Frontend**:
  - **React**: Libreria principale per la costruzione dell'interfaccia utente.
  - **TypeScript**: Per un codice più robusto e manutenibile.
  - **Tailwind CSS**: Per uno styling rapido e personalizzato.

- **Backend & Database**:
  - **Supabase**: Utilizzato come backend-as-a-service per l'autenticazione, il database PostgreSQL e le API.

- **Intelligenza Artificiale**:
  - **Google Gemini API (`@google/genai`)**: Per alimentare le funzionalità del chatbot e dell'assistente AI.

## 🛠️ Installazione e Avvio

1.  **Clona il repository**:
    ```bash
    git clone <URL_DEL_REPOSITORY>
    cd <NOME_DELLA_CARTELLA>
    ```

2.  **Configura Supabase**:
    - Vai su [supabase.com](https://supabase.com), crea un nuovo progetto.
    - Nello "SQL Editor", esegui lo script SQL per creare le tabelle necessarie (`movements`, `personal_records`, `wod_records`).
    - Vai su "Project Settings" > "API" per trovare il tuo URL e la `anon key`.

3.  **Configura le Variabili d'Ambiente**:
    Per far funzionare l'applicazione, è necessario configurare alcune variabili d'ambiente nella tua piattaforma di hosting (come Vercel, Netlify, ecc.). Questo garantisce che le chiavi segrete non siano esposte nel codice.

    - `SUPABASE_URL`: L'URL del tuo progetto Supabase. Lo trovi nelle impostazioni API del tuo progetto.
    - `SUPABASE_ANON_KEY`: La chiave pubblica (anon key) del tuo progetto Supabase. Anche questa si trova nelle impostazioni API.
    - `API_KEY`: La tua chiave API per Google Gemini, necessaria per l'assistente AI. Puoi ottenerla da [Google AI Studio](https://aistudio.google.com/).

    L'applicazione è già configurata per leggere queste variabili. Assicurati di impostarle correttamente nel pannello di controllo del tuo servizio di hosting.

4.  **Avvia l'applicazione**:
    - Apri il file `index.html` in un browser web. Per un'esperienza di sviluppo migliore, si consiglia di utilizzare un server locale (ad es. l'estensione "Live Server" per VS Code).
