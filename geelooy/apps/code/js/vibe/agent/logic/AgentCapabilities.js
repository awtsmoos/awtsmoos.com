// B"H
/**
 * @file AgentCapabilities.js
 * @brief The taxonomy of digital intellect, economy, tools, vision, audio, and video.
 *
 * Chapter 5: The model census was once blind to eyes and ears. The Awtsmoos
 * now marks each vessel by what it can receive: tools for action, images for
 * seeing, audio for hearing, video for motion, and text for speech.
 */

import { multimodalSupport } from '../../api/multimodal-adapter.js';

export const AgentCapabilities = {
    toNumericCost(value) {
        if (value === null || value === undefined || value === "") return null;
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    },

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
        if (supportedParameters.includes('tools') || supportedParameters.includes('tool_choice')) return true;
        const id = model.id.toLowerCase();
        const toolFamilies = ['claude-3', 'gpt-4', 'gpt-3.5', 'gemini-1.5', 'gemini-pro', 'gemini-2', 'mistral-large', 'mixtral-8x22b', 'llama-3.1', 'llama-3.2', 'llama-3.3', 'qwen-2.5', 'deepseek-chat', 'deepseek-v3', 'minimax-m'];
        return toolFamilies.some(f => id.includes(f)) || (model.description || "").toLowerCase().includes('tool use');
    },

    supportsImages(model) { return multimodalSupport(model, model?.provider).images; },
    supportsAudio(model) { return multimodalSupport(model, model?.provider).audio; },
    supportsVideo(model) { return multimodalSupport(model, model?.provider).video; },

    isReasoning(model) {
        const id = model?.id?.toLowerCase() || "";
        return id.includes('r1') || id.includes('o1-') || id.includes('reasoning') || id.includes('minimax-m');
    },

    getCategory(model) {
        const freePrefix = this.isFree(model) ? 'Free' : 'Premium';
        const media = [this.supportsImages(model) ? 'Vision' : '', this.supportsAudio(model) ? 'Audio' : '', this.supportsVideo(model) ? 'Video' : ''].filter(Boolean).join(' + ');
        if (media && this.supportsTools(model)) return `${freePrefix} Multimodal Agents (${media} + Tools)`;
        if (media) return `${freePrefix} Multimodal Scribes (${media})`;
        if (this.isReasoning(model)) return `${freePrefix} Architects (Reasoning + Tools)`;
        if (this.supportsTools(model)) return `${freePrefix} Agents (Tools Included)`;
        return `${freePrefix} Scribes (Text Only)`;
    },

    compareModels(a, b) {
        const aFree = this.isFree(a);
        const bFree = this.isFree(b);
        if (aFree !== bFree) return aFree ? -1 : 1;
        const aMedia = Number(this.supportsImages(a)) + Number(this.supportsAudio(a)) + Number(this.supportsVideo(a));
        const bMedia = Number(this.supportsImages(b)) + Number(this.supportsAudio(b)) + Number(this.supportsVideo(b));
        if (aMedia !== bMedia) return bMedia - aMedia;
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
