
// B"H
/**
 * @file index.js
 * @brief The Chronomantic Console Orchestrator.
 */

import { ConsoleSerializer } from './serializer.js';

export class Console {
    constructor(iframe, container, tabId) {
        this.iframe = iframe;
        this.container = container;
        this.tabId = tabId;
        this.logs = [];
    }

    render() {
        this.container.innerHTML = `
            <div class="console-wrapper" style="height:100%; display:flex; flex-direction:column;">
                <div class="console-output" style="flex-grow:1; overflow-y:auto; padding:10px; background:#050505;"></div>
                <div class="console-input-area" style="padding:10px; border-top:1px solid #222;">
                    <input type="text" class="console-input" style="width:100%; background:transparent; color:#0f0; border:none; outline:none;" placeholder="B\"H - Command?">
                </div>
            </div>`;
        this.outputEl = this.container.querySelector('.console-output');
        this.inputEl = this.container.querySelector('.console-input');
        this.inputEl.onkeydown = (e) => { if(e.key === 'Enter') this.execute(this.inputEl.value); };
        window.addEventListener('message', (e) => this.handleMessage(e));
    }

    handleMessage(event) {
        if (event.data.source === 'html-preview-console') {
            this.print(event.data.payload);
        }
    }

    print(log) {
        const div = document.createElement('div');
        div.style.color = log.level === 'error' ? '#f55' : '#0f0';
        div.textContent = `[${new Date().toLocaleTimeString()}] ${JSON.stringify(log.args)}`;
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    execute(cmd) {
        this.inputEl.value = '';
        this.iframe.contentWindow.postMessage({ source: 'awtsmoos-editor', command: cmd }, '*');
    }

    destroy() {
        window.removeEventListener('message', this.handleMessage);
        this.container.innerHTML = '';
    }
}
