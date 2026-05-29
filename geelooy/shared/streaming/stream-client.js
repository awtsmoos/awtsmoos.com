// B"H
/**
 * @file stream-client.js
 * @brief Shared SSE streaming client — usable in browser and Node.js.
 *
 * CHAPTER 29: THE SHARED STREAM — One river, two shores.
 */

export function parseSSEDataLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === 'data:[DONE]' || trimmed === 'data: [DONE]') return null;
  if (!trimmed.startsWith('data: ')) return null;
  try {
    return JSON.parse(trimmed.substring(6));
  } catch (_) { return null; }
}

/**
 * B"H
 * Extracts separated thought text from OpenAI-compatible stream deltas.
 *
 * MiniMax with `reasoning_split` uses `reasoning_details`, while other
 * compatible providers commonly use `reasoning` or `reasoning_content`.
 *
 * @param {object} delta Provider stream delta.
 * @returns {string} Reasoning text, or an empty string.
 */
export function extractReasoningDelta(delta = {}) {
  if (delta.reasoning) return delta.reasoning;
  if (delta.reasoning_content) return delta.reasoning_content;
  if (!Array.isArray(delta.reasoning_details)) return "";
  return delta.reasoning_details.map(part => part?.text || "").join("");
}

/**
 * Reads a streaming fetch response, calling back for each logical event.
 *
 * @param {ReadableStreamDefaultReader} reader — From response.body.getReader()
 * @param {string} providerId
 * @param {object} callbacks — { onActive, onChunk, onReasoning, onToolCall, onComplete, onError }
 * @param {Function} [reasoningExtractor] — (delta) => string|null for non-standard reasoning fields
 */
export async function readSSEStream(reader, providerId, {
  onActive,
  onChunk,
  onReasoning,
  onToolCall,
  onComplete,
  onError
}, reasoningExtractor = null) {
  const decoder = new TextDecoder();
  let fullText = '';
  let fullReasoning = '';
  let buffer = '';
  let activeToolCalls = [];
  let isActiveFired = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (onActive && !isActiveFired) { isActiveFired = true; onActive(); }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();

    let hasToolUpdate = false;
    for (const line of lines) {
      const data = parseSSEDataLine(line);
      if (!data) continue;
      if (data.error) {
        if (onError) onError(data.error);
        return { text: fullText, reasoning: fullReasoning, tools: activeToolCalls.filter(Boolean) };
      }

      const delta = data.choices?.[0]?.delta || {};

      // Text delta — shared by all providers
      if (delta.content) {
        fullText += delta.content;
        if (onChunk) onChunk(delta.content);
      }

      // Reasoning — custom extractor for non-standard providers (e.g. MiniMax reasoning_details)
      const reasonText = reasoningExtractor ? reasoningExtractor(delta) : extractReasoningDelta(delta);
      if (reasonText) {
        fullReasoning += reasonText;
        if (onReasoning) onReasoning(reasonText);
      }

      // Tool calls — shared by all OpenAI-compatible providers
      if (delta.tool_calls) {
        hasToolUpdate = true;
        delta.tool_calls.forEach(tc => {
          const toolIndex = Number.isInteger(tc.index) ? tc.index : activeToolCalls.length;
          if (!activeToolCalls[toolIndex]) {
            activeToolCalls[toolIndex] = {
              id: tc.id || ('call_' + Math.random().toString(36).substr(2, 9)),
              type: tc.type || 'function',
              function: { name: tc.function?.name || '', arguments: tc.function?.arguments || '' }
            };
          }
          if (tc.id) activeToolCalls[toolIndex].id = tc.id;
          if (tc.type) activeToolCalls[toolIndex].type = tc.type;
          if (tc.function?.name) activeToolCalls[toolIndex].function.name = tc.function.name;
          if (typeof tc.function?.arguments === 'string' && tc.function.arguments.length > 0) {
            activeToolCalls[toolIndex].function.arguments += tc.function.arguments;
          }
        });
      }
    }

    if (hasToolUpdate && onToolCall) onToolCall(activeToolCalls.filter(Boolean));
  }

  const finalized = activeToolCalls.filter(Boolean);
  if (!fullText && !fullReasoning && finalized.length === 0) {
    if (onError) onError(new Error(`${providerId} stream completed without text, reasoning, or tool calls.`));
    return { text: fullText, reasoning: fullReasoning, tools: finalized };
  }
  if (onComplete) onComplete(fullText, fullReasoning, finalized);
  return { text: fullText, reasoning: fullReasoning, tools: finalized };
}
