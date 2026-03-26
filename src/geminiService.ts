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

export const fetchSongData = async (category: string): Promise<SongData> => {
  const prompt = `Find a popular ${category} song.
  Return ONLY a valid JSON object with the following fields:
  - videoId: the YouTube video ID. IMPORTANT: Prefer lyric videos or audio-only versions, as official music videos often block embedding.
  - title: the song title.
  - artist: the artist name.
  - originalLyrics: the first 10-15 lines of the lyrics.
  - info: a fun fact or background about the band/song, written in plain English that is easy for a 12-year-old to understand (max 2 sentences).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const data = JSON.parse(response.text || '{}');

  // Now simplify the lyrics
  const simplifyPrompt = `Write a short summary in plain English explaining the main gist and topic of these lyrics. What is the song about? Keep it very simple, concrete, and easy for a 12-year-old to understand. Lyrics: \n${data.originalLyrics}`;
  
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
