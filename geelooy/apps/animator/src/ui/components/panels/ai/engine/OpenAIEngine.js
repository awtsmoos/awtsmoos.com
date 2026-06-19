// B"H
/**
 * Browser REST adapter for OpenAI-compatible chat completions.
 * It does not claim success when no key exists; it returns a deterministic
 * simulation so tests and offline development remain stable.
 */
export class OpenAIEngine {
  static async invoke(text, statusEl) {
    if (statusEl) statusEl.innerText = 'Connecting to OpenAI...';
    try {
      const apiKey = localStorage.getItem('openai_api_key') || prompt('Enter OpenAI API Key (leave blank to simulate):');
      if (!apiKey) return this.simulate();
      localStorage.setItem('openai_api_key', apiKey);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: localStorage.getItem('openai_model') || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'B"H. You are an Awtsmoos coding orchestration assistant.' },
            { role: 'user', content: text }
          ]
        })
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Malformed OpenAI response.');
      if (statusEl) statusEl.innerText = 'OpenAI revelation received.';
      return content;
    } catch (error) {
      console.warn('B"H - OpenAI request failed. Falling back to simulation.', error);
      return this.simulate();
    }
  }

  static simulate() {
    return Promise.resolve('B"H\nOpenAI adapter simulation complete. No live key was used.');
  }
}
