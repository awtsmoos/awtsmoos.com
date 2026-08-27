
// B"H
/**
 * @file output.js
 * @brief Orchestrates the display of the system's revelations.
 */

import { HTML } from '../../../../html-generator.js';
import { ConsoleDOMCache } from './dom/domCache.js';
import { EternalConsoleState } from './state/eternalState.js';

export const ConsoleOutput = {
    attach(parentContainer, state) {
        EternalConsoleState.sync(state);

        if (ConsoleDOMCache.outputArea) {
            parentContainer.appendChild(ConsoleDOMCache.outputArea);
            this._scroll();
            return this.logFn.bind(this);
        }

        const wrapper = HTML({
            style: { flexGrow: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
        });

        const container = HTML({
            className: 'dt-console-logs',
            style: { flexGrow: '1', overflowY: 'auto', padding: '10px', fontFamily: 'monospace', fontSize: '13px' }
        });

        wrapper.appendChild(container);
        parentContainer.appendChild(wrapper);

        ConsoleDOMCache.outputArea = wrapper;
        ConsoleDOMCache.logContainer = container;

        // Render History
        EternalConsoleState.logs.forEach(log => this.renderLog(log));
        this._scroll();

        return this.logFn.bind(this);
    },

    logFn(logObj) {
        this.renderLog(logObj);
        this._scroll();
    },

    renderLog(logObj) {
        if (!ConsoleDOMCache.logContainer) return;
        
        const row = HTML({
            style: { borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '4px 0' }
        });

        if (logObj.level === 'input') {
            row.style.color = '#fff';
            row.innerHTML = `<span style="color:#0ff; margin-right:8px;">></span>${logObj.args[0].value}`;
        } else {
            let color = '#ccc';
            if (logObj.level === 'error') color = '#f66';
            if (logObj.level === 'warn') color = '#fc0';
            row.style.color = color;
            row.textContent = logObj.args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        }

        ConsoleDOMCache.logContainer.appendChild(row);
    },

    _scroll() {
        if (ConsoleDOMCache.logContainer) {
            ConsoleDOMCache.logContainer.scrollTop = ConsoleDOMCache.logContainer.scrollHeight;
        }
    }
};
