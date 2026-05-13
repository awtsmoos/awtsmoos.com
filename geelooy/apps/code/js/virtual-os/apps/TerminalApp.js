
// B"H
/**
 * @file TerminalApp.js
 * @description
 * Virtual OS terminal host that reuses the existing terminal renderer.
 */

import { H } from '../ui/h.js';
import { makeTerminalLikeTab } from './terminal/TerminalWindowHost.js';

/**
 * @function renderFallbackTerminal
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount node.
 * @param {object} env Environment.
 * @returns {void}
 */
function renderFallbackTerminal(windowState, container, env) {
    const payload = windowState.payload || (windowState.payload = {});
    payload.lines = Array.isArray(payload.lines) ? payload.lines : ['B"H fallback terminal ready.'];

    const output = H({ tag: 'pre', className: 'vos-terminal-output', text: payload.lines.join('\n') });
    const input = H({ tag: 'input', className: 'terminal-input', attrs: { autocomplete: 'off', spellcheck: 'false' } });

    const run = () => {
        const command = input.value.trim();
        if (!command) return;

        input.value = '';
        payload.lines.push('$ ' + command);
        payload.lines.push('Existing terminal renderer unavailable.');
        env.requestRender();
    };

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') run();
    });

    container.replaceChildren(H({
        tag: 'div',
        className: 'vos-app vos-terminal-app',
        children: [
            {
                tag: 'div',
                className: 'vos-terminal-head',
                children: [
                    { tag: 'strong', text: 'B"H Awtsmoos Console' },
                    { tag: 'span', text: 'Fallback mode.' }
                ]
            },
            output,
            {
                tag: 'div',
                className: 'vos-terminal-row',
                children: [
                    { tag: 'span', className: 'vos-terminal-prompt', text: '$' },
                    input,
                    { tag: 'button', className: 'terminal-run', text: 'Run', events: { click: run } }
                ]
            }
        ]
    }));
}

/**
 * @function renderTerminalApp
 * @param {object} windowState Window state.
 * @param {HTMLElement} container Mount node.
 * @param {object} desktopState Desktop state.
 * @param {object} env Environment.
 * @returns {Promise<void>}
 */
export async function renderTerminalApp(windowState, container, desktopState, env) {
    try {
        const mod = await import('../../terminal/renderer.js');
        const renderer = mod.TerminalRenderer || mod.default || mod;

        if (!renderer?.render) {
            renderFallbackTerminal(windowState, container, env);
            return;
        }

        const tabLike = makeTerminalLikeTab(windowState, env);
        await renderer.render(tabLike, container);
    } catch (error) {
        console.warn('[VirtualOS] B"H - Existing terminal renderer unavailable, using fallback.', error);
        renderFallbackTerminal(windowState, container, env);
    }
}
