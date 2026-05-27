
//B"H

/**
 * GeminiAdapter - Orchestrates the divine spark of AI dialogue and world-building.
 * Refined to support Iterative Refinement (Bezalel Logic) using raw REST API.
 * UPDATED: Now uses user-provided keys via ApiKeyManager.
 */
import ApiKeyManager from "./ApiKeyManager.js";

export default class GeminiAdapter {

    /**
     * generateDialogue - Standard sentient interaction.
     */
    static async generateDialogue(entityId, systemInstruction, history, userMessage, levState) {
        // Construct the mood context
        const mood = levState ? (`[MOOD: Joy:${levState.simcha}, Anger:${levState.kaas}]`) : "";

        const finalInstruction = systemInstruction + "\n" +
            mood + "\n" +
            "You are a soul in Mitzvah World.\n" +
            "If the player asks to perform a Mitzvah (like putting on Teffilin, giving Tzedakah) and your mood is high enough, reply with enthusiasm.\n" +
            "Keep responses short and conversational.";

        const contents = [
            ...history,
            { role: "user", parts: [{ text: userMessage }] }
        ];

        try {
            const responseText = await this.tryRequest({
                contents: contents,
                systemInstruction: { parts: [{ text: finalInstruction }] }
            }, {
                model: "gemini-2.5-flash-lite", 
                temperature: 1.0, 
                maxOutputTokens: 500
            });

            return responseText;
        } catch (error) {
            console.error("B\"H\n - Dialogue generation failed:", error);
            return "..."; 
        }
    }

    /**
     * refineWorldExistence - The Bezalel Process.
     */
    static async refineWorldExistence(worldState, customPrompt) {
        const systemInstructionText = `
            B"H
            You are Bezalel, the Architect of the Mishkan. 
            You are given a JSON state of the current 'Mitzvah World' Nivrayim.
            Your task is to refine this existence. 
            Suggest and create NEW Nivrayim (trees, structures, coins, NPCs) that follow the prompt: "${customPrompt}".
            
            RULES:
            1. Output ONLY a valid JSON object matching the world blueprint format: { "NivraType": [ { name, position, ... } ] }.
            2. Use existing archetypes: ProceduralTree, Brick, CustomNpc, Coin, Portal, Mazik.
            3. Position new items harmoniously relative to the existing player position.
            4. Do not delete existing items, only manifest new 'Yesh' (Something) from the 'Ayin' (Nothingness).
        `;

        const contents = [{
            role: "user",
            parts: [{ text: `CURRENT WORLD STATE: ${JSON.stringify(worldState)}\n\nREFINEMENT COMMAND: ${customPrompt}` }]
        }];

        try {
            const jsonText = await this.tryRequest({
                contents: contents,
                systemInstruction: { parts: [{ text: systemInstructionText }] }
            }, {
                responseMimeType: "application/json", 
                temperature: 0.2, 
                thinkingBudget: 0
            });

            return JSON.parse(jsonText);
        } catch (e) {
            console.error("B\"H - The AI Forge encountered a veil:", e);
            return null;
        }
    }

    /**
     * tryRequest - Wraps the fetch in key management logic.
     */
    static async tryRequest(body, config) {
        if (!ApiKeyManager.hasKeys()) {
            this.requestUserKeys();
            throw new Error("No Divine Keys found.");
        }

        let key = await ApiKeyManager.getActiveKey();
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                return await getGeminiResponse(body, key, config);
            } catch (error) {
                if (error.message.includes("429")) { // Quota exceeded
                    console.warn("B\"H - Quota Exceeded. Rotating Keys...");
                    key = ApiKeyManager.rotateKey();
                    attempts++;
                } else {
                    throw error; // Other error
                }
            }
        }
        
        // If we ran out of attempts/keys
        this.requestUserKeys();
        throw new Error("All Divine Keys exhausted or rate limited.");
    }

    static requestUserKeys() {
        // Send event to UI to open the modal
        // Assuming access to global event bus or UI structure via window
        // In Worker context, we post a message. In main thread, we trigger event.
        if (typeof postMessage === 'function' && typeof window === 'undefined') {
            postMessage({ 
                sendUiEvent: { 
                    shaym: "apiKeyModal", 
                    ob: { open: true } 
                } 
            });
        } else if (typeof window !== 'undefined') {
             const evt = new CustomEvent("olamPeula", {
                detail: {
                    sendUiEvent: { 
                        shaym: "apiKeyModal", 
                        ob: { open: true } 
                    } 
                }
            });
            const ikar = document.getElementById("ikar");
            if(ikar) ikar.dispatchEvent(evt);
        }
    }
}

// --------------------------------------------------------------------------
// Internal REST Helper (The Engine)
// --------------------------------------------------------------------------

async function getGeminiResponse(chatBody, apiKey, {
    temperature = 0.2,
    topP = 0.95,
    topK = 40,
    maxOutputTokens = 65536,
    model = "gemini-2.5-flash-lite",
    responseMimeType = "text/plain",
    thinkingBudget = 0
} = {}) {

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    const generationConfig = {
        temperature,
        topP,
        topK,
        maxOutputTokens,
        responseMimeType
    };

    if (thinkingBudget > 0) {
        generationConfig.thinkingConfig = { includeThoughts: true }; 
    }

    const requestBody = {
        ...chatBody, 
        generationConfig
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            // Check for 429 specifically to help the caller
            if (response.status === 429) {
                 throw new Error("429");
            }
            const errText = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            const part = data.candidates[0].content.parts[0];
            return part.text;
        } else {
            return ""; 
        }

    } catch (error) {
        throw error;
    }
}
