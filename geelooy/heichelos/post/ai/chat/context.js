// B"H
/** @module AiChatContext */
import { stripTags } from "/heichelos/post/functions/utils.js";

/**
 * Reads the current verse or full post context.
 * @param {string|null} idx Selected verse index.
 * @returns {string} Context text.
 */
export function getContextContent(idx) {
    if (idx !== null && window.sectionDayuh && window.sectionDayuh[idx]) {
        const section = window.sectionDayuh[idx];
        return Array.isArray(section) ? section.flat(Infinity).join("\n") : section;
    }
    if (window.sectionDayuh) return window.sectionDayuh.flat(Infinity).join("\n\n");
    return document.getElementById("realPost")?.innerText || "";
}

/**
 * Builds the Torah assistant prompt from context and history.
 * @param {string} currentMsg User message.
 * @param {string} context Source context.
 * @param {Array<object>} history Conversation history.
 * @returns {string} Prompt sent to the AI provider.
 */
export function constructPrompt(currentMsg, context, history) {
    const cleanContext = stripTags(context);
    let prompt = `B"H\nYou are a helpful, knowledgeable Torah assistant analyzing the following text:\n\n---\n${cleanContext}\n---\n\n`;
    if (history.length > 1) {
        prompt += "Conversation History:\n";
        history.slice(0, -1).forEach(h => {
            prompt += `${h.role === "user" ? "User" : "AI"}: ${h.text}\n`;
        });
        prompt += "\n";
    }
    return prompt + `User: ${currentMsg}\nAI:`;
}

/**
 * Extracts streamed text while suppressing provider metadata fragments.
 * @param {any} chunk Stream chunk.
 * @returns {string} Extracted text.
 */
export function extractTextFromChunk(chunk) {
    if (typeof chunk === "object" && chunk !== null) return chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (typeof chunk !== "string" || chunk.includes("[AIS_METADATA")) return "";

    try {
        const data = JSON.parse(chunk);
        return Array.isArray(data) ? data[0]?.candidates?.[0]?.content?.parts?.[0]?.text || "" : data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (_) {}

    let extracted = "";
    let parsedAny = false;
    for (const line of chunk.split("\n")) {
        const clean = line.trim().replace(/^,+|^\[|\]$/g, "");
        if (!clean) continue;
        try {
            const text = JSON.parse(clean)?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) { extracted += text; parsedAny = true; }
        } catch (_) {}
    }
    if (parsedAny) return extracted;
    const trimmed = chunk.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.includes("\"candidates\":") ? "" : chunk;
}
