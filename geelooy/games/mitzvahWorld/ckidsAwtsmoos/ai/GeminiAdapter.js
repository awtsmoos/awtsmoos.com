
//B"H
import { GoogleGenAI } from "@google/genai";

export default class GeminiAdapter {
    static async generateDialogue(entityId, systemInstruction, history, userMessage, levState) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const mood = levState ? `[MOOD: Joy:${levState.simcha}, Anger:${levState.kaas}]` : "";
        
        const finalInstruction = `${systemInstruction}
        ${mood}
        You are a soul in Mitzvah World.
        If the player asks to perform a Mitzvah (like putting on Teffilin, giving Tzedakah) and your mood is high enough or you are convinced, reply with enthusiasm.
        If you are busy or angry, refuse initially but be persuadable.
        Keep responses short and conversational.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [...history, { role: "user", parts: [{ text: userMessage }] }],
            config: { systemInstruction: finalInstruction }
        });
        return response.text;
    }
}
