//B"H
import { GoogleGenAI } from "@google/genai";

/**
 * GeminiAdapter - Orchestrates the divine spark of AI dialogue.
 * Refined to ensure stable instruction formatting and proper API usage.
 */
export default class GeminiAdapter {
    /**
     * B"H
     * Generates dialogue based on entity state and history.
     * @param {string} entityId 
     * @param {string} systemInstruction 
     * @param {Array} history 
     * @param {string} userMessage 
     * @param {Object} levState 
     */
    static async generateDialogue(entityId, systemInstruction, history, userMessage, levState) {
        // B"H: Initializing the bridge to the Infinite Knowledge
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // B"H: Using string concatenation for stability in various execution contexts
        const mood = levState ? ("[MOOD: Joy:" + levState.simcha + ", Anger:" + levState.kaas + "]") : "";
        
        // B"H: Constructing the sacred instruction via explicit concatenation for parser stability
        const finalInstruction = systemInstruction + "\n" +
            mood + "\n" +
            "You are a soul in Mitzvah World.\n" +
            "If the player asks to perform a Mitzvah (like putting on Teffilin, giving Tzedakah) and your mood is high enough or you are convinced, reply with enthusiasm.\n" +
            "If you are busy or angry, refuse initially but be persuadable.\n" +
            "Keep responses short and conversational.";

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [...history, { role: "user", parts: [{ text: userMessage }] }],
            config: { systemInstruction: finalInstruction }
        });

        // B"H: Directly accessing the .text property as mandated by the divine coding guidelines
        return response.text;
    }
}
