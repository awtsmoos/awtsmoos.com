// B"H
/**
 * @file ModelLimitsData.js
 * @brief Normalizes model metadata into user-visible “limits” records.
 */

import { AgentCapabilities } from '../../agent/logic/AgentCapabilities.js';

function safeJson(value) {
    try { return value ? JSON.stringify(value) : ''; } catch { return ''; }
}

function pricingString(model) {
    if (!model) return 'Unknown';
    if (AgentCapabilities.isFree(model)) {
        return model.provider === 'openrouter' ? '[FREE] OpenRouter $0 routes (if available)' : '[FREE/TIER] Provider key limits apply';
    }
    if (model.costPrompt !== undefined && model.costPrompt !== null) {
        return `Prompt: $${model.costPrompt}/1M | Completion: $${model.costCompletion}/1M`;
    }
    return 'Unknown';
}

/**
 * @param {Array<object>} models
 * @returns {Array<object>}
 */
export function buildModelLimitRecords(models = []) {
    return (Array.isArray(models) ? models : []).map((m) => ({
        id: m.id,
        displayName: m.displayName || m.id,
        provider: m.provider || 'unknown',
        isFree: AgentCapabilities.isFree(m),
        supportsTools: AgentCapabilities.supportsTools(m),
        isReasoning: AgentCapabilities.isReasoning(m),
        contextWindow: m.context_length || 'Unknown',
        maxCompletionTokens: m.max_completion_tokens || null,
        perRequestLimits: m.per_request_limits || null,
        pricing: pricingString(m),
        rawLimits: safeJson(m.per_request_limits)
    }));
}

