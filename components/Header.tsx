import React from 'react';
// FIX: Corrected import path for icons to be relative.
import { LogoIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm py-4 border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <LogoIcon />
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            VoiceGen Studio
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
