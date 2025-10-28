import React, { useState, useEffect, useRef } from 'react';
import { synthesizeSpeech, rewriteText, generatePoem, synthesizeMultiSpeakerSpeech } from '../services/geminiService';
import { decode, decodeAudioData, createWavBlob } from '../utils/audioUtils';
import { VOICES, MOODS, Mood } from '../types';
import Spinner from './Spinner';
import { PlayIcon, StopIcon, DownloadIcon, SpeakerIcon, RecordVoiceIcon, PencilIcon, PoemIcon, InfoIcon } from './icons';

// FIX: Add an interface for the Web Speech API's SpeechRecognition to resolve TypeScript error.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: { error: string }) => void;
  onstart: () => void;
  onend: () => void;
}

interface EditorTabProps {
  initialText: string;
  onTextChange: (text: string) => void;
}

const ComparisonView: React.FC<{
    original: string;
    newText: string;
    type: 'rewrite' | 'poem';
    onAccept: () => void;
    onReject: () => void;
}> = ({ original, newText, type, onAccept, onReject }) => {
    const title = type === 'rewrite' ? 'Результат переписывания' : 'Сгенерированное стихотворение';
    
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <h3 className="font-semibold mb-2 text-gray-300">Оригинал</h3>
                    <div className="h-64 p-4 bg-gray-900/50 border border-gray-600 rounded-lg overflow-y-auto whitespace-pre-wrap text-gray-300">
                        {original}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-cyan-300">Новая версия</h3>
                    <div className="h-64 p-4 bg-gray-900/50 border border-cyan-700 rounded-lg overflow-y-auto whitespace-pre-wrap text-white">
                        {newText}
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
                <button onClick={onAccept} className="px-8 py-3 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg">
                    Принять
                </button>
                <button onClick={onReject} className="px-8 py-3 font-semibold text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                    Отклонить
                </button>
            </div>
        </div>
    );
};


const EditorTab: React.FC<EditorTabProps> = ({ initialText, onTextChange }) => {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0].id);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [comparisonView, setComparisonView] = useState<{
    original: string;
    newText: string;
    type: 'rewrite' | 'poem';
  } | null>(null);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [speakerVoices, setSpeakerVoices] = useState<Record<string, string>>({});


  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const words = initialText.trim().split(/\s+/).filter(Boolean);
    setWordCount(initialText.trim() === '' ? 0 : words.length);
    setCharCount(initialText.length);

    // Speaker detection logic
    const speakerRegex = /(?:^|\n)\s*([^:\n]+):/g;
    const matches = initialText.matchAll(speakerRegex);
    const detectedSpeakers = [...new Set(Array.from(matches, m => m[1].trim()))];
    
    // The multi-speaker API currently supports exactly 2 speakers.
    if (detectedSpeakers.length === 2) {
        setSpeakers(detectedSpeakers);
        // Assign default voices, preserving existing choices if speakers are the same
        setSpeakerVoices(prev => {
            const newSpeakerVoices: Record<string, string> = {};
            detectedSpeakers.forEach((speaker, index) => {
                newSpeakerVoices[speaker] = prev[speaker] || VOICES[index % VOICES.length].id;
            });
            return newSpeakerVoices;
        });
    } else {
        setSpeakers([]);
        setSpeakerVoices({});
    }
  }, [initialText]);

  // Effect to initialize and clean up AudioContext. Runs only once on mount/unmount.
  useEffect(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    } else {
      setError("Ваш браузер не поддерживает Web Audio API.");
    }

    return () => {
      audioSourceRef.current?.stop();
      audioContextRef.current?.close().catch(console.error);
    };
  }, []);

  // Effect to handle SpeechRecognition.
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTextChange(prevText => (prevText ? prevText + ' ' : '') + finalTranscript.trim());
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error', event.error);
      setError(`Ошибка распознавания: ${event.error}`);
      setIsRecording(false);
    };
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    return () => {
      recognition.stop();
    };
  }, [onTextChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };
  
  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  const stopPlayback = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };
  
  const handleAction = async (action: 'rewrite' | 'poem') => {
    if (!initialText.trim()) return;
    stopPlayback();
    setError(null);
    const actionFunc = action === 'rewrite' ? rewriteText : generatePoem;
    const message = action === 'rewrite' ? 'Переписываю текст...' : 'Создаю стихотворение...';
    setStatus({ loading: true, message, type: action });
    try {
        const originalText = initialText;
        const resultText = await actionFunc(initialText);
        setComparisonView({ original: originalText, newText: resultText, type: action });
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка.');
    } finally {
        setStatus({ loading: false, message: '', type: '' });
    }
  };

  const handleSynthesize = async () => {
    if (!initialText.trim()) { setError("Текстовое поле не может быть пустым."); return; }
    if (!audioContextRef.current) { setError("AudioContext не инициализирован."); return; }

    stopPlayback();
    setError(null);
    setStatus({ loading: true, message: 'Генерация аудио...', type: 'synthesis' });
    audioBufferRef.current = null;

    try {
      let base64Audio: string;
      if (speakers.length === 2) {
        base64Audio = await synthesizeMultiSpeakerSpeech(initialText, speakerVoices);
      } else {
        base64Audio = await synthesizeSpeech(initialText, selectedVoice, selectedMood, speakingRate, pitch);
      }
      const audioData = decode(base64Audio);
      const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      audioBufferRef.current = buffer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка при синтезе.');
      console.error(err);
    } finally {
      setStatus({ loading: false, message: '', type: '' });
    }
  };

  const handlePlay = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    if (isPlaying) {
      stopPlayback();
    } else {
       if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      source.start(0);
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioBufferRef.current) { setError('Сначала синтезируйте аудио, чтобы его можно было скачать.'); return; }
    const blob = createWavBlob(audioBufferRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synthesis.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSpeakerVoiceChange = (speaker: string, voiceId: string) => {
    setSpeakerVoices(prev => ({ ...prev, [speaker]: voiceId }));
  };
  
  const isMultiSpeaker = speakers.length === 2;

  return (
    <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-700/50 backdrop-blur-lg space-y-6">
      {comparisonView ? (
        <ComparisonView 
            {...comparisonView}
            onAccept={() => {
                onTextChange(comparisonView.newText);
                setComparisonView(null);
            }}
            onReject={() => setComparisonView(null)}
        />
      ) : (
      <>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Редактор Текста</h2>
        <div className="relative">
          <textarea
            value={initialText}
            onChange={handleTextChange}
            placeholder="Введите, вставьте или надиктуйте текст здесь..."
            className="w-full h-64 p-4 pr-12 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 transition resize-y"
          />
          <button
              onClick={toggleRecording}
              title={isRecording ? 'Остановить запись' : 'Начать запись'}
              className="absolute top-3 right-3 p-2 rounded-full transition-colors bg-gray-800 hover:bg-gray-700"
              disabled={status.loading}
          >
              <RecordVoiceIcon isRecording={isRecording} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
            <div className="flex flex-wrap gap-2">
                <button onClick={() => handleAction('rewrite')} disabled={status.loading || !initialText.trim()} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {status.loading && status.type === 'rewrite' ? <Spinner small /> : <PencilIcon />}
                    <span>Переписать</span>
                </button>
                <button onClick={() => handleAction('poem')} disabled={status.loading || !initialText.trim()} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {status.loading && status.type === 'poem' ? <Spinner small /> : <PoemIcon />}
                    <span>сгенерировать стихотворение</span>
                </button>
            </div>
            <div className="text-right text-sm text-gray-400">
                Символов: {charCount} | Слов: {wordCount}
            </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">Синтез Речи</h2>
        
        {isMultiSpeaker && (
            <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-cyan-700/50 animate-fade-in">
                <h3 className="font-semibold text-lg text-cyan-300 mb-3">Настройка голосов дикторов</h3>
                <div className="space-y-3">
                    {speakers.map(speaker => (
                        <div key={speaker} className="grid grid-cols-3 items-center gap-3">
                            <label className="text-gray-300 truncate col-span-1" htmlFor={`voice-for-${speaker}`}>{speaker}</label>
                            <div className="relative col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SpeakerIcon /></div>
                                <select 
                                    id={`voice-for-${speaker}`}
                                    value={speakerVoices[speaker]} 
                                    onChange={(e) => handleSpeakerVoiceChange(speaker, e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none"
                                >
                                    {VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className={`space-y-4 ${isMultiSpeaker ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SpeakerIcon /></div>
                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} disabled={isMultiSpeaker} className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none disabled:bg-gray-800 disabled:cursor-not-allowed">
                        {VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <select value={selectedMood} onChange={(e) => setSelectedMood(e.target.value as Mood)} disabled={isMultiSpeaker} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 transition appearance-none disabled:bg-gray-800 disabled:cursor-not-allowed">
                        {MOODS.map(mood => <option key={mood.id} value={mood.id}>{mood.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="relative" title={isMultiSpeaker ? "Недоступно в режиме нескольких дикторов" : ""}>
                     <label htmlFor="speed-slider" className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
                         <span>Скорость чтения</span>
                         <span className="font-mono text-cyan-400">{speakingRate.toFixed(2)}x</span>
                     </label>
                     <input
                         id="speed-slider"
                         type="range"
                         min="0.5"
                         max="2.0"
                         step="0.05"
                         value={speakingRate}
                         onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                         disabled={isMultiSpeaker}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan disabled:cursor-not-allowed"
                     />
                </div>
                <div className="relative" title={isMultiSpeaker ? "Недоступно в режиме нескольких дикторов" : ""}>
                     <label htmlFor="pitch-slider" className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
                         <span>Высота голоса</span>
                         <span className="font-mono text-cyan-400">{pitch.toFixed(1)}</span>
                     </label>
                     <input
                         id="pitch-slider"
                         type="range"
                         min="-20"
                         max="20"
                         step="0.5"
                         value={pitch}
                         onChange={(e) => setPitch(parseFloat(e.target.value))}
                         disabled={isMultiSpeaker}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb-cyan disabled:cursor-not-allowed"
                     />
                </div>
            </div>
        </div>

        {isMultiSpeaker && (
             <div className="mt-4 text-xs bg-gray-900 border border-gray-700 text-gray-400 p-3 rounded-lg flex items-start space-x-2">
                <InfoIcon />
                <span>
                    <strong>Режим нескольких дикторов активен.</strong> Настройки голоса, тона, скорости и высоты ниже отключены. Используйте панель выше для выбора голосов для каждого диктора.
                </span>
            </div>
        )}

        <div className="pt-2 mt-4">
             <button onClick={handleSynthesize} disabled={status.loading} className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg">
                {status.loading && status.type === 'synthesis' ? <Spinner /> : 'Озвучить'}
            </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}
      
      {status.loading && (
          <div className="flex justify-center items-center mt-4 text-sm text-cyan-300">
            <Spinner small />
            <span className="ml-2">{status.message}</span>
          </div>
        )}

      {(audioBufferRef.current && !status.loading) && (
        <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-center space-x-4">
          <button onClick={handlePlay} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" title={isPlaying ? "Стоп" : "Воспроизвести"}>
            {isPlaying ? <StopIcon /> : <PlayIcon />}
          </button>
          <button onClick={handleDownload} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" title="Скачать WAV">
            <DownloadIcon />
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default EditorTab;
