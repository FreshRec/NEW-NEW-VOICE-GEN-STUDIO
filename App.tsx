import React, { useState } from 'react';
import Header from './components/Header';
import TranscriptionTab from './components/TranscriptionTab';
import EditorTab from './components/EditorTab';
import TabButton from './components/TabButton';
import { MicIcon, PencilIcon } from './components/icons';

type Tab = 'transcribe' | 'edit';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('transcribe');
  const [text, setText] = useState<string>('');

  const handleTranscriptionComplete = (transcribedText: string) => {
    setText(transcribedText);
    setActiveTab('edit');
  };

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
