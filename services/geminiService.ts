import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const transcribeAudio = async (base64Data: string, mimeType: string, enableDiarization: boolean): Promise<string> => {
  try {
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
    console.error("Ошибка при транскрибации:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("Неверный API ключ. Пожалуйста, проверьте ваш API ключ.");
    }
    throw new Error("Не удалось транскрибировать аудио. Пожалуйста, попробуйте еще раз.");
  }
};

export const rewriteText = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Перепиши следующий текст, чтобы он стал более ясным, лаконичным и увлекательным. Не добавляй никакого вступления или заключения, просто верни переписанный текст. Вот текст: "${text}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Ошибка при переписывании текста:", error);
        throw new Error("Не удалось переписать текст.");
    }
};

export const generatePoem = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Ты талантливый поэт. Напиши красивое стихотворение, вдохновленное следующей строкой или идеей. Не добавляй никакого вступления или заключения, просто верни стихотворение. Вот строка: "${text}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Ошибка при генерации стихотворения:", error);
        throw new Error("Не удалось сгенерировать стихотворение.");
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
    // FIX: Updated the prompt for single-speaker synthesis for better reliability.
    const prompt = `Озвучь следующий текст ${mood}: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // FIX: Moved speakingRate and pitch into the prebuiltVoiceConfig object to resolve the type error.
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
    console.error("Ошибка при синтезе речи:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("Неверный API ключ. Пожалуйста, проверьте ваш API ключ.");
    }
    throw new Error("Не удалось синтезировать речь. Пожалуйста, попробуйте еще раз.");
  }
};

export const synthesizeMultiSpeakerSpeech = async (
  text: string,
  speakerVoices: Record<string, string>
): Promise<string> => {
  try {
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
    console.error("Ошибка при синтезе речи с несколькими дикторами:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new Error("Неверный API ключ. Пожалуйста, проверьте ваш API ключ.");
    }
    throw new Error("Не удалось синтезировать речь с несколькими дикторами. Убедитесь, что в тексте ровно два диктора.");
  }
};