import React, { useState, useCallback } from 'react';
import { transcribeAudio } from '../services/geminiService';
import { fileToBase64 } from '../utils/audioUtils';
import Spinner from './Spinner';
import { UploadIcon, InfoIcon, YoutubeIcon, DownloadArrowIcon } from './icons';

interface TranscriptionTabProps {
  onTranscriptionComplete: (text: string) => void;
}

const TranscriptionTab: React.FC<TranscriptionTabProps> = ({ onTranscriptionComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState({ loading: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [enableDiarization, setEnableDiarization] = useState(false);

  const processFile = (selectedFile: File) => {
    const isAllowedType = 
        selectedFile.type.startsWith('audio/') || 
        selectedFile.type.startsWith('video/');

    const allowedExtensions = ['.mp3', '.wav', '.mp4', '.mov', '.avi', '.flac', '.ogg', '.aac', '.aiff', '.webm', '.mkv', '.flv'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const isAllowedExtension = allowedExtensions.includes(fileExtension);
    
    if (!isAllowedType && !isAllowedExtension) {
      setError(`Неподдерживаемый тип файла. Пожалуйста, выберите аудио или видео файл.`);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      setError('Пожалуйста, загрузите файл.');
      return;
    }
    setError(null);
    setStatus({ loading: true, message: 'Преобразование файла...' });
    try {
      const base64Data = await fileToBase64(file);
      setStatus({ loading: true, message: 'Загрузка и транскрибирование...' });
      const result = await transcribeAudio(base64Data, file.type, enableDiarization);
      onTranscriptionComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка.');
      console.error(err);
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  const borderColorClass = error
    ? 'border-red-500 hover:border-red-400'
    : dragOver
    ? 'border-cyan-400'
    : 'border-gray-600 hover:border-gray-400';

  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-700/50 backdrop-blur-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Извлечь текст</h2>
        <p className="text-gray-400 mt-2">Загрузите аудио/видео файл для транскрипции.</p>
         <div className="mt-4 text-xs bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-3 rounded-lg flex items-start space-x-2">
          <InfoIcon />
          <span>
            <strong>Важно:</strong> Обработка больших файлов (более 500 МБ) может занять значительное время. Пожалуйста, будьте терпеливы.
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex justify-center w-full h-32 px-4 transition bg-gray-900/50 border-2 ${borderColorClass} border-dashed rounded-md appearance-none cursor-pointer focus:outline-none`}>
            <span className="flex items-center space-x-2">
              <UploadIcon />
              <span className="font-medium text-gray-400">
                {file ? file.name : <>Перетащите файл или <span className="text-cyan-400">нажмите для загрузки</span></>}
              </span>
            </span>
            <input type="file" name="file_upload" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
        
        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">ИЛИ</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-white mb-3">Транскрипция с YouTube, VK и др.</h3>
            <p className="text-sm text-gray-400 mb-4">
                Прямая транскрипция по ссылке невозможна из-за ограничений безопасности браузеров.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 text-cyan-400">
                    <YoutubeIcon />
                    <span className="font-semibold">Шаг 1: Скачайте</span>
                </div>
                <div className="text-gray-500 hidden md:block">
                    <DownloadArrowIcon />
                </div>
                 <div className="flex items-center space-x-2 text-cyan-400">
                    <UploadIcon small />
                    <span className="font-semibold">Шаг 2: Загрузите</span>
                </div>
            </div>
        </div>


        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="flex items-center justify-center pt-4">
          <label htmlFor="diarization-checkbox" className="flex items-center cursor-pointer">
            <input
              id="diarization-checkbox"
              type="checkbox"
              checked={enableDiarization}
              onChange={(e) => setEnableDiarization(e.target.checked)}
              className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-500 rounded focus:ring-cyan-600 ring-offset-gray-800 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-300">Определить дикторов</span>
          </label>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={status.loading || !file}
          className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {status.loading ? <Spinner /> : 'Транскрибировать'}
        </button>

        {status.loading && (
          <div className="flex justify-center items-center mt-4 text-sm text-cyan-300">
            <Spinner small />
            <span className="ml-2">{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionTab;
