// B"H
/**
 * @module AiInputErrors
 * @description
 * The Awtsmoos reveals even failure through readable vessels. This parser turns
 * provider-shaped quota/error shells into messages a user can understand.
 */

/**
 * Converts thrown Gemini/API errors into friendly text.
 * @param {any} error Thrown value from AI or network flow.
 * @returns {string} Human-readable error message.
 */
export function parseGeminiError(error) {
    let raw = error;
    try {
        const text = typeof error === "string" ? error : error?.message;
        if (text && (text.startsWith("{") || text.startsWith("["))) raw = JSON.parse(text);
    } catch (_) {}

    if (Array.isArray(raw) && raw.length > 0) raw = raw[0];
    const errObj = raw?.error || raw;

    if (errObj) {
        if (Array.isArray(errObj.violations)) {
            const quota = errObj.violations.find(v => v.quotaMetric?.includes("free_tier"));
            if (quota) return "Free Tier Quota Exceeded. Please try again later.";
        }

        if (Array.isArray(errObj.details)) {
            const retryInfo = errObj.details.find(d => d.retryDelay || d["@type"]?.includes("RetryInfo"));
            if (retryInfo?.retryDelay) return `Quota Exceeded. Please retry in ${retryInfo.retryDelay}.`;
        }

        if (errObj.message) return errObj.message;
    }

    return error?.message || "Unknown error occurred.";
}
