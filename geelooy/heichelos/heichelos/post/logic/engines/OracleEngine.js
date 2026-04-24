
/**
 * B"H
 * @class OracleEngine
 * @description The Manifested Wisdom.
 * This engine communicates with the AI (The Oracle) to provide 
 * insights on the text. Every word returned is a new creation 
 * of meaning from the void of the prompt.
 */
export class OracleEngine {
    constructor() {
        this.history = [];
        this.isTransmitting = false;
    }

    /**
     * @method query
     * @description Sends a spark of inquiry to the Oracle.
     */
    async query(prompt, contextText, onStream) {
        if (this.isTransmitting) return;
        this.isTransmitting = true;
        
        console.log("B\"H - Oracle Engine Querying...");
        
        const fullPrompt = `B"H\nYou are an AI Oracle of the Awtsmoos platform.\nContext: ${contextText}\nUser: ${prompt}`;
        
        try {
            const response = await window.awtsmoosAi({
                prompt: fullPrompt,
                onstream: (chunk) => {
                    if (onStream) onStream(chunk);
                }
            });
            
            this.history.push({ prompt, response });
            this.isTransmitting = false;
            return response;
        } catch (e) {
            this.isTransmitting = false;
            throw new Error("Oracle connection severed: " + e.message);
        }
    }
}
