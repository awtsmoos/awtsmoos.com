// B"H
/**
 * Minimal DeepSeek client.
 * No batch thunder, no corpus ocean: one whisper enters, one XML vessel returns.
 */
export async function callDeepSeek({ prompt, model = 'deepseek-chat' }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');
  const requestBody = {
    model,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }]
  };
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(requestBody)
  });
  const responseText = await response.text();
  let json = null;
  try { json = JSON.parse(responseText); } catch {}
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${responseText.slice(0, 1200)}`);
  return {
    sanitizedRequest: { url: 'https://api.deepseek.com/chat/completions', body: requestBody },
    rawResponse: json || responseText,
    xml: json?.choices?.[0]?.message?.content || '',
    usage: json?.usage || null
  };
}
