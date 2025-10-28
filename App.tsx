import React, { useState } from 'react';
import Header from './components/Header';
import TranscriptionTab from './components/TranscriptionTab';
import EditorTab from './components/EditorTab';
import TabButton from './components/TabButton';
import { MicIcon, PencilIcon } from './components/icons';
// FIX: Removed API key management imports as the key is now handled by environment variables, per guidelines.

type Tab = 'transcribe' | 'edit';

// FIX: Removed ApiKeyErrorScreen component. The UI should not prompt for an API key.
// The API key must be provided via the `process.env.API_KEY` environment variable.

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('transcribe');
  const [text, setText] = useState<string>('');
  
  // FIX: Removed all state and effects related to checking for a user-provided API key.
  // The application now assumes the API key is correctly configured in the environment.

  const handleTranscriptionComplete = (transcribedText: string) => {
    setText(transcribedText);
    setActiveTab('edit');
  };

  // FIX: Removed conditional rendering for loading and API key screen.
  // The main application UI is rendered directly.

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-2 md:space-x-4 mb-8 bg-gray-800 p-2 rounded-xl shadow-lg">
            <TabButton 
              isActive={activeTab === 'transcribe'} 
              onClick={() => setActiveTab('transcribe')}
            >
              <MicIcon />
              <span>Транскрипция</span>
            </TabButton>
            <TabButton 
              isActive={activeTab === 'edit'} 
              onClick={() => setActiveTab('edit')}
            >
              <PencilIcon />
              <span>Редактор и Синтез</span>
            </TabButton>
          </div>
          
          <div className="transition-opacity duration-300">
            {activeTab === 'transcribe' && (
              <TranscriptionTab onTranscriptionComplete={handleTranscriptionComplete} />
            )}
            {activeTab === 'edit' && (
              <EditorTab initialText={text} onTextChange={setText} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
