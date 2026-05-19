//B"H

export async function simpleGeminiResponse({ prompt, apiKey, onstream, temperature, topP, topK, model } = {}) {
  if (!apiKey || !prompt) return null;
  return await getGeminiResponse(blankPrompt(prompt), apiKey, { onstream, temperature, topP, topK, model });
}

export async function getGeminiResponse(chat, apiKey, options = {}) {
  const { onstream, temperature = 0.2, topP = 0.95, topK = 40, maxOutputTokens = 65536, model = "gemini-2.5-flash-lite", thinkingBudget = 0 } = options;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...chat,
      generationConfig: { temperature, topP, topK, maxOutputTokens, thinkingConfig: { thinkingBudget } }
    })
  });
  if (!response.ok) throw new Error(`Gemini error: ${response.statusText}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    onstream?.(result);
  }
  return result;
}

export function blankPrompt(userMessage) {
  return { contents: [{ role: "user", parts: [{ text: userMessage }] }] };
}

export function parseGeminiStreamText(streamText = "") {
  const text = String(streamText || "").trim();
  if (!text) return "";
  const jsonText = text.endsWith("]") ? text : `${text}]`;
  const chunks = JSON.parse(jsonText);
  return chunks.map(chunk => chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "").join("");
}
