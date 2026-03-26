import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SongData {
  videoId: string;
  title: string;
  artist: string;
  originalLyrics: string;
  simplifiedLyrics: string;
  info: string;
}

export const fetchSongData = async (category: string, retries = 3): Promise<SongData> => {
  const prompt = `Find a popular ${category} song.
  Return ONLY a valid JSON object with the following fields:
  - videoId: the YouTube video ID. IMPORTANT: Prefer lyric videos or audio-only versions, as official music videos often block embedding.
  - title: the song title.
  - artist: the artist name.
  - originalLyrics: the first 10-15 lines of the lyrics.
  - info: A short, concrete fact about the song or band. Use very simple, everyday words. Use short, clear sentences. Do not use metaphors, idioms, or hard words. Write at an early primary school reading level. (max 2 sentences).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const data = JSON.parse(response.text || '{}');

  // Check if video is embeddable using noembed (supports CORS)
  try {
    const embedCheck = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${data.videoId}`);
    const embedData = await embedCheck.json();
    if (embedData.error && retries > 0) {
      console.log(`Video ${data.videoId} not embeddable, retrying...`);
      return fetchSongData(category, retries - 1);
    }
  } catch (e) {
    console.warn("Could not verify video embeddability", e);
  }

  // Now simplify the lyrics
  const simplifyPrompt = `Write a short summary explaining what this song is about. 
  You MUST follow these rules for the reader:
  - Use very simple, everyday words and high-frequency vocabulary.
  - Use short, clear sentences.
  - Write at an early primary school reading level ("Easy Read" format).
  - Translate any abstract lyrics or metaphors into literal, concrete concepts.
  - Do NOT use idioms, complex sentences, or abstract content.
  Lyrics: \n${data.originalLyrics}`;
  
  const simplifyResponse = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: simplifyPrompt,
  });

  return {
    ...data,
    simplifiedLyrics: simplifyResponse.text || data.originalLyrics,
  };
};

export const analyzeVideo = async (videoId: string, title: string): Promise<string> => {
  // Since we can't easily pass the actual video bytes from a YouTube URL to Gemini directly in this environment,
  // we will ask Gemini to analyze the video based on its knowledge and search grounding.
  const prompt = `Analyze the music video for "${title}" (YouTube ID: ${videoId}). Explain what is happening in the video simply and concretely. What do you see? Max 3 sentences.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text || 'Could not analyze video.';
};
