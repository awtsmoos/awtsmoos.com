// B"H
import { SpeechEngine } from '../engine/SpeechEngine.js';
import { AIProviderRegistry } from '../engine/AIProviderRegistry.js';
import { AwtsmoosModal } from '../modal/AwtsmoosModal.js';

/**
 * @file AIEvents.js
 * @description
 * THE BINDER OF WILL (Kosher HaRatzon).
 * B"H - Connects the DOM buttons to the oracle engine and voice system.
 */
export class AIEvents {
  static bind(app) {
    const input = document.getElementById('ai-prompt-input');
    const voiceBtn = document.getElementById('ai-voice-btn');
    const generateBtn = document.getElementById('ai-generate-btn');
    const status = document.getElementById('ai-status');

    if (!input || !voiceBtn || !generateBtn) return;

    const speech = new SpeechEngine(input, voiceBtn, status);
    voiceBtn.onclick = () => speech.toggle();

    generateBtn.onclick = async () => {
      const text = input.value.trim();
      if (!text) return;
      generateBtn.disabled = true;
      try {
        const responseText = await AIProviderRegistry.invoke(text, status);
        AwtsmoosModal.show(responseText);
      } catch (err) {
        if (status) status.innerText = 'Error: ' + err.message;
      } finally {
        generateBtn.disabled = false;
        setTimeout(() => { if (status) status.innerText = ''; }, 3000);
      }
    };
  }
}