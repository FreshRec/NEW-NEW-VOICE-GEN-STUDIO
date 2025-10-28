import { GoogleGenAI, Modality } from "@google/genai";
import { Mood } from '../types';

// FIX: Initialize GoogleGenAI with the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transcribes an audio or video file using the Gemini API.
 * @param base64Data The base64-encoded audio/video data.
 * @param mimeType The MIME type of the file.
 * @param enableDiarization Whether to identify and label different speakers.
 * @returns The transcribed text.
 */
export const transcribeAudio = async (
  base64Data: string,
  mimeType: string,
  enableDiarization: boolean
): Promise<string> => {
  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const prompt = enableDiarization
      ? "Transcribe this audio. Please identify and label each speaker (e.g., Speaker 1, Speaker 2)."
      : "Transcribe this audio.";

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [audioPart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error during transcription:", error);
    throw new Error("Не удалось транскрибировать аудио. Проверьте консоль для получения дополнительной информации.");
  }
};

/**
 * Rewrites the given text for clarity and style.
 * @param text The original text to rewrite.
 * @returns The rewritten text.
 */
export const rewriteText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following text to improve its clarity and style, while preserving the original meaning. Do not add any introductory phrases like "Here's the rewritten text:". Just provide the rewritten text directly.\n\nOriginal text:\n"""\n${text}\n"""`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error rewriting text:", error);
    throw new Error("Не удалось переписать текст. Проверьте консоль для получения дополнительной информации.");
  }
};

/**
 * Generates a poem based on the given text.
 * @param text The source text for inspiration.
 * @returns A generated poem.
 */
export const generatePoem = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following text, write a short, creative poem. The poem should capture the essence and mood of the text. Do not add any introductory phrases like "Here is a poem:". Just provide the poem directly.\n\nText:\n"""\n${text}\n"""`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating poem:", error);
    throw new Error("Не удалось сгенерировать стихотворение. Проверьте консоль для получения дополнительной информации.");
  }
};


const getMoodPrefix = (mood: Mood): string => {
    switch (mood) {
        case 'весело':
            return 'Say cheerfully: ';
        case 'грустно':
            return 'Say sadly: ';
        case 'официально':
            return 'Say formally: ';
        case 'загадочно':
            return 'Say mysteriously: ';
        case 'нейтрально':
        default:
            return '';
    }
};

/**
 * Synthesizes speech from text using a single voice.
 * @param text The text to synthesize.
 * @param voice The desired voice ID.
 * @param mood The desired mood for the speech.
 * @returns A base64-encoded string of the audio data.
 */
export const synthesizeSpeech = async (
    text: string, 
    voice: string, 
    mood: Mood, 
    speakingRate: number,
    pitch: number
): Promise<string> => {
  try {
    const moodPrefix = getMoodPrefix(mood);
    const prompt = `${moodPrefix}${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          // FIX: Moved speakingRate and pitch into voiceConfig to resolve the TypeScript error.
          // These are properties related to the voice's characteristics.
          voiceConfig: {
            speakingRate: speakingRate,
            pitch: pitch,
            prebuiltVoiceConfig: { 
              voiceName: voice,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('Аудиоданные не найдены в ответе API.');
    }
    return base64Audio;
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw new Error("Не удалось синтезировать речь. Проверьте консоль для получения дополнительной информации.");
  }
};

/**
 * Synthesizes speech from a multi-speaker script.
 * @param text The conversational text with speaker labels.
 * @param speakerVoices A map of speaker names to voice IDs.
 * @returns A base64-encoded string of the audio data.
 */
export const synthesizeMultiSpeakerSpeech = async (
    text: string, 
    speakerVoices: Record<string, string>
): Promise<string> => {
    try {
        const speakerVoiceConfigs = Object.entries(speakerVoices).map(([speaker, voiceName]) => ({
            speaker,
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
            },
        }));

        if (speakerVoiceConfigs.length !== 2) {
            throw new Error(`Синтез с несколькими дикторами в настоящее время поддерживает ровно 2 диктора, но было предоставлено ${speakerVoiceConfigs.length}.`);
        }

        const speakers = Object.keys(speakerVoices).join(' and ');
        const prompt = `TTS the following conversation between ${speakers}:\n${text}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error('Аудиоданные не найдены в ответе API.');
        }
        return base64Audio;
    } catch (error) {
        console.error("Error synthesizing multi-speaker speech:", error);
        throw new Error("Не удалось синтезировать речь с несколькими дикторами. Проверьте консоль для получения дополнительной информации.");
    }
};
