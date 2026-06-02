// B"H
/**
 * @file markup.js
 * @brief Pure markup for the Code AI Studio, memory, and live helper surface.
 */

import { AiStudioSettings } from './settings.js';

export function renderAiStudioHtml() {
  return `<div class="ai-studio-shell">
    <div class="ai-studio-title">Unified AI Studio</div>
    <p class="ai-studio-helper">Chat, tools, per-file memory, and optional live typing suggestions share one context.</p>
    <textarea id="ai-studio-ask" class="ai-studio-input" rows="4" aria-label="AI request">Help improve this file safely.</textarea>
    <div class="ai-studio-actions">
      <button class="primary-btn" data-ai-mode="chat">Chat</button>
      <button class="secondary-btn" data-ai-mode="suggest">Suggest</button>
      <button class="secondary-btn" data-ai-mode="function">Function</button>
      <button class="secondary-btn" data-ai-mode="file">File</button>
    </div>
    ${AiStudioSettings.html()}
    <section class="ai-studio-card ai-memory-card">
      <h5>Per-file shared memory</h5>
      <textarea id="ai-file-memory" class="ai-studio-output ai-memory-box" rows="7" aria-label="Per-file AI memory"></textarea>
      <div class="ai-studio-actions ai-memory-actions">
        <button class="secondary-btn" id="ai-memory-save">Save memory</button>
        <button class="secondary-btn" id="ai-memory-clear">Clear this file</button>
        <button class="secondary-btn" id="ai-memory-compact">Compact old notes</button>
      </div>
    </section>
    <div class="ai-studio-tool-row">
      <input id="ai-studio-tool-name" value="read" aria-label="Tool action name">
      <input id="ai-studio-tool-path" value="/README.awt" aria-label="Tool path">
      <button id="ai-studio-run-tool" class="secondary-btn">Run tool</button>
    </div>
    <textarea id="ai-studio-output" class="ai-studio-output" rows="15" readonly aria-label="AI answer"></textarea>
    <div class="ai-studio-actions ai-studio-footer-actions">
      <button class="secondary-btn" id="ai-studio-insert">Insert answer</button>
      <button class="secondary-btn" id="ai-studio-copy">Copy answer</button>
      <button class="secondary-btn" id="ai-studio-save-settings">Save settings</button>
    </div>
  </div>`;
}
