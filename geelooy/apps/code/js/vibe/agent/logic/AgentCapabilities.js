
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
    toNumericCost(value) {
        if (value === null || value === undefined || value === "") return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    },

    /**
     * B"H
     * Detects if a model is free ($0 cost).
     */
    isFree(model) {
        if (!model) return false;
        if (['google', 'groq', 'cerebras', 'minimax'].includes(model.provider)) return true;
        if (model.isFreeTier === true) return true;
        const promptCost = this.toNumericCost(model.costPrompt);
        const completionCost = this.toNumericCost(model.costCompletion);
        return (promptCost === 0 || promptCost === null) && (completionCost === 0 || completionCost === null);
    },

    supportsTools(model) {
        if (!model || !model.id) return false;
        const supportedParameters = Array.isArray(model.supported_parameters)
            ? model.supported_parameters.map(p => String(p).toLowerCase())
            : [];
        if (supportedParameters.includes('tools') || supportedParameters.includes('tool_choice')) {
            return true;
        }
        const id = model.id.toLowerCase();
        const toolFamilies = [
            'claude-3', 'gpt-4', 'gpt-3.5', 'gemini-1.5', 'gemini-pro',
            'mistral-large', 'mixtral-8x22b', 'llama-3.1', 'llama-3.2', 'llama-3.3',
            'qwen-2.5', 'deepseek-chat', 'deepseek-v3', 'minimax-m'
        ];
        return toolFamilies.some(f => id.includes(f)) || (model.description || "").toLowerCase().includes('tool use');
    },

    isReasoning(model) {
        const id = model?.id?.toLowerCase() || "";
        return id.includes('r1') || id.includes('o1-') || id.includes('reasoning') || id.includes('minimax-m');
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
    },

    compareModels(a, b) {
        const aFree = this.isFree(a);
        const bFree = this.isFree(b);
        if (aFree !== bFree) return aFree ? -1 : 1;

        const aTools = this.supportsTools(a);
        const bTools = this.supportsTools(b);
        if (aTools !== bTools) return aTools ? -1 : 1;

        const aReasoning = this.isReasoning(a);
        const bReasoning = this.isReasoning(b);
        if (aReasoning !== bReasoning) return aReasoning ? -1 : 1;

        const aContext = Number(a?.context_length || 0);
        const bContext = Number(b?.context_length || 0);
        if (aContext !== bContext) return bContext - aContext;

        return String(a?.displayName || a?.id || '').localeCompare(String(b?.displayName || b?.id || ''));
    }
};
