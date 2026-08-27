// B"H
/**
 * @file GeminiEngine.js
 * @description
 * THE ORACLE OF THOUGHT (Ba'al HaMachshava).
 * B"H - Pure REST fetch, no npm imports, runs directly in the browser.
 */
export class GeminiEngine {
  static async invoke(text, statusEl) {
    if (statusEl) statusEl.innerText = 'Connecting to the Oracle...';
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || prompt('Enter Gemini API Key (leave blank to simulate):');
      if (apiKey) {
        localStorage.setItem('gemini_api_key', apiKey);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ parts: [{ text: `You are the structural orchestrator of this digital reality.\nUser Request: ${text}\nB"H\nAlways reply with an epic, poetic chapter detailing how the Awtsmoos executes this action...` }] }]
        };
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]) {
          if (statusEl) statusEl.innerText = 'Revelation received.';
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error('Malformed response from the Infinite.');
      } else {
        return this.simulate();
      }
    } catch (err) {
      console.warn('B"H - Oracle request failed. Falling back to simulation.', err);
      return this.simulate();
    }
  }

  static simulate() {
    return new Promise(resolve => {
      setTimeout(() => resolve('B"H\nThe Awtsmoos has heard your request. Simulation complete — the api key was not provided, but the thought remains eternal in the upper worlds.'), 1000);
    });
  }
}