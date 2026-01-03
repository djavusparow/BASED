
import { GoogleGenAI } from "@google/genai";
import { BadgeTier } from "../types";

export const getBasedMessage = async (name: string, rank: number, score: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a hype-man for the Base Ecosystem and Farcaster. A user named ${name} has a rank of ${rank} and a score of ${score} in the "BASED IMPRESSION" contribution event. Write a short, energetic, "based" message (max 20 words) congratulating them. Mention $LAMBOLESS, Farcaster, and use emojis like 🔵 🏎️ 🎩.`
    });
    return response.text || "You are officially BASED. Keep casting on the blue chain! 🔵🎩";
  } catch (error) {
    console.error("Gemini text error:", error);
    return "The most based contribution in the ecosystem. 🔵🏎️";
  }
};

export const generateAppLogo = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional, sleek, and futuristic app logo for "BASED IMPRESSION". The background features a high-performance blue Lamborghini supercar with glowing electric-blue accents. The car is positioned dynamically. Superimposed is the text "BASED IMPRESSION" in bold, metallic silver futuristic font with a subtle blue glow. Cinematic lighting, 8k resolution, minimalist but powerful logo composition.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Logo generation error:", error);
    return null;
  }
};

export const generateBadgeImage = async (tier: BadgeTier, name: string, rank: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let styleDescription = "";
    switch (tier) {
      case BadgeTier.PLATINUM:
        styleDescription = "platinum model with sparkling rainbow colors, pearlescent finish, and iridescent crystalline shards";
        break;
      case BadgeTier.GOLD:
        styleDescription = "luxurious 24k gold model with deep polished shine and warm golden embers";
        break;
      case BadgeTier.SILVER:
        styleDescription = "polished silver model with industrial metallic chrome finish and cool blue reflections";
        break;
      case BadgeTier.BRONZE:
        styleDescription = "bronze model with distinct purple neon glowing veins and weathered bronze textures";
        break;
      default:
        styleDescription = "modern tech style";
    }

    const prompt = `A unique NFT badge for a user named '${name}' (Rank #${rank}). 
    Central focus: A cool 'Warplet' character (a stylized, friendly digital creature) standing triumphantly on top of a futuristic Lamborghini supercar. 
    Theme: ${styleDescription}. 
    Environment: A glowing blue holographic grid background with floating $LAMBOLESS coin particles. 
    A subtle, glowing purple Farcaster logo integrated into the character's outfit or the car's hood. 
    Cinematic 3D render, Octane render style, 8k, vibrant colors, extremely detailed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image error:", error);
    return null;
  }
};
