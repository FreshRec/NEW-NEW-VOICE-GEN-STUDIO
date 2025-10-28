import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI;

function getAi() {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY_MISSING");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const handleGeminiError = (error: unknown, defaultMessage: string): Error => {
    console.error(defaultMessage, error);
    if (error instanceof Error) {
        if (error.message === "API_KEY_MISSING") {
            return new Error("Ключ API не настроен. Пожалуйста, установите переменную окружения API_KEY в настройках вашего проекта.");
        }
        if (error.message.includes('API key not valid')) {
            return new Error("Неверный API ключ. Пожалуйста, проверьте ваш API ключ.");
        }
    }
    return new Error(defaultMessage);
};

export const transcribeAudio = async (base64Data: string, mimeType: string, enableDiarization: boolean): Promise<string> => {
  try {
    const ai = getAi();
    const model = 'gemini-2.5-pro'; 

    const prompt = enableDiarization 
      ? "Транскрибируйте следующее аудио, определяя разных дикторов. Ответ должен содержать только транскрипцию с метками дикторов (например, Диктор 1, Диктор 2)."
      : "Транскрибируйте следующее аудио. Ответ должен содержать только транскрипцию.";

    const audioPart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [textPart, audioPart] }],
    });

    const transcription = response.text;
    if (!transcription) {
      throw new Error("Не удалось получить транскрипцию от API.");
    }
    return transcription;
  } catch (error) {
    throw handleGeminiError(error, "Не удалось транскрибировать аудио. Пожалуйста, попробуйте еще раз.");
  }
};

export const rewriteText = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Перепиши следующий текст, чтобы он стал более ясным, лаконичным и увлекательным. Не добавляй никакого вступления или заключения, просто верни переписанный текст. Вот текст: "${text}"`,
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, "Не удалось переписать текст.");
    }
};

export const generatePoem = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Ты талантливый поэт. Напиши красивое стихотворение, вдохновленное следующей строкой или идеей. Не добавляй никакого вступления или заключения, просто верни стихотворение. Вот строка: "${text}"`,
        });
        return response.text;
    } catch (error) {
        throw handleGeminiError(error, "Не удалось сгенерировать стихотворение.");
    }
};

export const synthesizeSpeech = async (
  text: string, 
  voice: string, 
  mood: string,
  speakingRate: number,
  pitch: number
): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `Озвучь следующий текст ${mood}: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
              speakingRate: speakingRate,
              pitch: pitch,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("API не вернул аудио данные.");
    }
    return base64Audio;
  } catch (error) {
    throw handleGeminiError(error, "Не удалось синтезировать речь. Пожалуйста, попробуйте еще раз.");
  }
};

export const synthesizeMultiSpeakerSpeech = async (
  text: string,
  speakerVoices: Record<string, string>
): Promise<string> => {
  try {
    const ai = getAi();
    const speakerVoiceConfigs = Object.entries(speakerVoices).map(([speaker, voice]) => ({
      speaker,
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: voice },
      },
    }));

    if (speakerVoiceConfigs.length !== 2) {
      throw new Error("Для синтеза речи с несколькими дикторами требуется ровно 2 диктора.");
    }

    const prompt = `Озвучь следующий диалог:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs,
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("API не вернул аудио данные.");
    }
    return base64Audio;
  } catch (error) {
    throw handleGeminiError(error, "Не удалось синтезировать речь с несколькими дикторами. Убедитесь, что в тексте ровно два диктора.");
  }
};
