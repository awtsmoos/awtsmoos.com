// B"H
import { AIHeader } from '../components/AIHeader.js';
import { AITextArea } from '../components/AITextArea.js';
import { AIVoiceButton } from '../components/AIVoiceButton.js';
import { AIGenerateButton } from '../components/AIGenerateButton.js';
import { AIStatus } from '../components/AIStatus.js';

/**
 * @file AILayout.js
 * @description
 * THE ARCHITECTURE OF THE ORACLE (Binyan HaNavi).
 * B"H - Assembles all AI sub-components into one HTML string vessel.
 */
export class AILayout {
  static render() {
    return `
      <div class="ai-panel" style="padding: 1rem; border-top: 1px solid var(--border-color);">
        ${AIHeader.render()}
        <div class="ai-input-container" style="display: flex; gap: 0.5rem; align-items: stretch; margin-bottom: 0.5rem;">
          ${AITextArea.render()}
          ${AIVoiceButton.render()}
        </div>
        ${AIGenerateButton.render()}
        ${AIStatus.render()}
      </div>
    `;
  }
}