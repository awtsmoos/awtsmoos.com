
// B"H
/**
 * @file AgentCapabilities.js
 * @brief The Taxonomy of Digital Intellect and Economy.
 * 
 * CHAPTER CXIII: THE PRIORITY OF CHESED
 * 
 * In the realm of emanation, the highest light often arrives without cost—as a gift 
 * from the Creator. This module identifies the "Free Conduits" (Models with $0 cost).
 * We reorganize the taxonomy to prioritize these free vessels, ensuring the user 
 * can manifest their will without the burden of credits until absolutely necessary.
 */

export const AgentCapabilities = {
    /**
     * B"H
     * Detects if a model is free ($0 cost).
     */
    isFree(model) {
        if (!model) return false;
        // Google models are often free-tier by default if no billing is tied.
        // OpenRouter explicitly provides pricing.
        const cost = model.costPrompt;
        return cost === 0 || cost === "0" || cost === null || cost === undefined;
    },

    supportsTools(model) {
        if (!model || !model.id) return false;
        const id = model.id.toLowerCase();
        const toolFamilies = [
            'claude-3', 'gpt-4', 'gpt-3.5', 'gemini-1.5', 'gemini-pro',
            'mistral-large', 'mixtral-8x22b', 'llama-3.1', 'llama-3.2', 'llama-3.3',
            'qwen-2.5', 'deepseek-chat', 'deepseek-v3'
        ];
        return toolFamilies.some(f => id.includes(f)) || (model.description || "").toLowerCase().includes('tool use');
    },

    isReasoning(model) {
        const id = model?.id?.toLowerCase() || "";
        return id.includes('r1') || id.includes('o1-') || id.includes('reasoning');
    },

    /**
     * B"H
     * Determines the display category, prioritizing the Free state.
     */
    getCategory(model) {
        const freePrefix = this.isFree(model) ? 'Free' : 'Premium';
        
        if (this.isReasoning(model)) return `${freePrefix} Architects (Reasoning + Tools)`;
        if (this.supportsTools(model)) return `${freePrefix} Agents (Tools Included)`;
        
        return `${freePrefix} Scribes (Text Only)`;
    }
};
