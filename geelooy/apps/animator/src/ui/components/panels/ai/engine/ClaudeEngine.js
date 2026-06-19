// B"H
/**
 * Browser REST adapter for Claude-compatible messages.
 * Offline and keyless execution returns a deterministic simulation so the
 * provider surface can be tested without leaking secrets or blocking UI.
 */
export class ClaudeEngine {
  static async invoke(text, statusEl) {
    if (statusEl) statusEl.innerText = 'Connecting to Claude...';
    try {
      const apiKey = localStorage.getItem('claude_api_key') || prompt('Enter Claude API Key (leave blank to simulate):');
      if (!apiKey) return this.simulate();
      localStorage.setItem('claude_api_key', apiKey);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': localStorage.getItem('claude_version') || '2023-06-01'
        },
        body: JSON.stringify({
          model: localStorage.getItem('claude_model') || 'claude-3-5-sonnet-latest',
          max_tokens: 2048,
          system: 'B"H. You are an Awtsmoos coding orchestration assistant.',
          messages: [{ role: 'user', content: text }]
        })
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const content = data.content?.map(part => part.text || '').join('').trim();
      if (!content) throw new Error('Malformed Claude response.');
      if (statusEl) statusEl.innerText = 'Claude revelation received.';
      return content;
    } catch (error) {
      console.warn('B"H - Claude request failed. Falling back to simulation.', error);
      return this.simulate();
    }
  }

  static simulate() {
    return Promise.resolve('B"H\nClaude adapter simulation complete. No live key was used.');
  }
}
