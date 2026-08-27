
// B"H
/**
 * @file render.js
 * @description
 * Paints the terminal body without letting HTML fragments become visible tags.
 */

import { escapeHtml } from '../../lib/html.js';

export function renderTerminalDom(container, payload) {
    container.innerHTML = `
        <div class="vos-terminal-app">
            <div class="vos-terminal-head">
                <strong>B"H</strong>
                <span>Awtsmoos Shell v5.1</span>
                <span>Anchored to: ${escapeHtml(payload.cwd)}</span>
            </div>
            <pre class="vos-terminal-output">${escapeHtml(payload.lines.join('\n'))}</pre>
            <div class="vos-terminal-row">
                <span class="vos-terminal-prompt">$</span>
                <input class="terminal-input" autocomplete="off" spellcheck="false" />
                <button class="terminal-run">Run</button>
            </div>
        </div>
    `;
}
