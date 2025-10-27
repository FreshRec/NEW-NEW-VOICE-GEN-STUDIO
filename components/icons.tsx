import React from 'react';

const iconProps = {
  className: "w-5 h-5",
};

export const MicIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
  </svg>
);

export const PencilIcon: React.FC = () => (
  <svg {...iconProps} stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
  </svg>
);

export const LogoIcon: React.FC = () => (
  <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5C16.81 2.5 20.83 6.03 21.41 10.69C21.45 11.02 21.23 11.33 20.9 11.38C20.57 11.42 20.26 11.2 20.21 10.87C19.7 6.84 16.2 3.75 12 3.75C7.44 3.75 3.75 7.44 3.75 12C3.75 16.56 7.44 20.25 12 20.25C13.43 20.25 14.77 19.85 15.93 19.14C16.23 18.96 16.62 19.03 16.8 19.33C16.98 19.63 16.91 20.02 16.61 20.2C15.22 21.07 13.66 21.5 12 21.5C6.75 21.5 2.5 17.25 2.5 12C2.5 6.75 6.75 2.5 12 2.5ZM12 6.5C11.17 6.5 10.5 7.17 10.5 8V12.5C10.5 12.91 10.16 13.25 9.75 13.25C9.34 13.25 9 12.91 9 12.5V8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8V12.5C15 14.16 13.66 15.5 12 15.5C10.34 15.5 9 14.16 9 12.5C9 12.09 9.34 11.75 9.75 11.75C10.16 11.75 10.5 12.09 10.5 12.5C10.5 13.33 11.17 14 12 14C12.83 14 13.5 13.33 13.5 12.5V8C13.5 7.17 12.83 6.5 12 6.5Z" />
  </svg>
);

export const UploadIcon: React.FC<{ small?: boolean }> = ({ small }) => (
  <svg className={small ? "w-6 h-6 text-gray-400" : "w-8 h-8 text-gray-500"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z"></path>
    <path d="M7 11.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zM7.5 8a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"></path>
  </svg>
);

export const LinkIcon: React.FC = () => (
  <svg {...iconProps} className="w-5 h-5 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
  </svg>
);

export const InfoIcon: React.FC = () => (
    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
    </svg>
);

export const PlayIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const StopIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6h12v12H6z" />
    </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export const SpeakerIcon: React.FC = () => (
  <svg {...iconProps} className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

export const RecordVoiceIcon: React.FC<{ isRecording?: boolean }> = ({ isRecording = false }) => (
    <svg className={`w-5 h-5 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-cyan-400'}`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path>
    </svg>
);

export const PoemIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const YoutubeIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
    </svg>
);

export const DownloadArrowIcon: React.FC = () => (
    <svg className="w-6 h-6 transform -rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);