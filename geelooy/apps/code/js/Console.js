// B"H
// FILE: js/Console.js
// FINAL "VIVID EXTREME" VERSION

import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export class Console {
    constructor(previewIframe, containerElement, consoleTabId) {
        this.previewIframe = previewIframe;
        this.container = containerElement;
        this.consoleTabId = consoleTabId;
        this.logs = [];
        this.activeFilter = 'all';
        this.elements = {};
        
        // --- Highlighter Management ---
        this.inputHighlighter = null;
        this.outputHighlighters = new Map(); // Maps a row element to its highlighter instance
        
        // --- Core Logic ---
        this.messageHandler = this.handleIncomingMessages.bind(this);
        this.nextExecutionId = 0;
        this.pendingExecutions = new Map();

        // --- Line Numbered Input Logic ---
        this._syncScroll = this._syncScroll.bind(this);
        this._updateLineNumbers = this._updateLineNumbers.bind(this);
    }

    render() {
        this.injectContent();
        this.setupEventListeners();
        
        this.inputHighlighter = new pnimi(this.elements.input, 'js');
        this._updateLineNumbers();
    }

    destroy() {
        window.removeEventListener('message', this.messageHandler);
        
        // Critical cleanup for event listeners to prevent memory leaks
        if(this.elements.input) {
             this.elements.input.removeEventListener('scroll', this._syncScroll);
             this.elements.input.removeEventListener('input', this._updateLineNumbers);
        }

        // Destroy all highlighter instances
        if (this.inputHighlighter) this.inputHighlighter.destroy();
        this.outputHighlighters.forEach(h => h.destroy());
        this.outputHighlighters.clear();

        const styleEl = document.head.querySelector(`#console-styles-${this.consoleTabId}`);
        if(styleEl) styleEl.remove();
        this.container.innerHTML = '';
    }

    handleIncomingMessages(event) {
        if (event.source !== this.previewIframe.contentWindow) return;
        const data = event.data;
        if (!data || data.source !== 'html-preview-console') return;

        switch (data.type) {
            case 'clear':
                this._clearLogs();
                break;
            case 'log':
                this.logs.push(data.payload);
                if (this.activeFilter === 'all' || this.activeFilter === data.payload.level) {
                   this._renderLogMessage(data.payload);
                }
                this._updateFilterCounts();
                break;
            case 'execution-result':
                 this.handleExecutionResult(data.payload);
                break;
            case 'status':
                if(data.payload.status === 'ready') {
                    const readyMessage = {
                       level: 'info',
                       args: [{ type: 'string', value: `Console connected to preview. B"H!`}],
                       timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
                    };
                    this.logs.push(readyMessage);
                    this._renderLogMessage(readyMessage);
                    this._updateFilterCounts();
                }
                break;
        }
    }
    
    handleExecutionResult({ executionId, result, isError }) {
        const callback = this.pendingExecutions.get(executionId);
        if(callback) callback(result, isError);
        this.pendingExecutions.delete(executionId);
    }
    
    _prettyPrint(data) {
        if (data.type === 'string') return `"${data.value}"`;
        return data.value;
    }
    
    _clearLogs() {
        this.logs = [];
        this.outputHighlighters.forEach(h => h.destroy());
        this.outputHighlighters.clear();
        this.elements.logContainer.innerHTML = '';
        this._updateFilterCounts();
    }

    _renderFilteredLogs() {
        this.outputHighlighters.forEach(h => h.destroy());
        this.outputHighlighters.clear();
        this.elements.logContainer.innerHTML = '';
        this.logs.forEach(log => {
            if (this.activeFilter === 'all' || this.activeFilter === log.level) {
                this._renderLogMessage(log);
            }
        });
        this._updateFilterCounts();
    }

    _updateFilterCounts() {
        const counts = this.logs.reduce((acc, log) => {
            if(log.level === 'error' || log.level === 'warn' || log.level === 'info' || log.level === 'log') {
                acc[log.level] = (acc[log.level] || 0) + 1;
            }
            return acc;
        }, { error: 0, warn: 0, info: 0, log: 0 });
        
        this.elements.errorBtn.dataset.count = counts.error;
        this.elements.warnBtn.dataset.count = counts.warn;
        this.elements.infoBtn.dataset.count = counts.info;
        this.elements.logBtn.dataset.count = counts.log;
    }

    _createVividInspector(data, isPrototype = false) {
        const details = document.createElement('details');
        details.className = 'vivid-inspector';
        if (isPrototype) details.classList.add('prototype-inspector');

        const summary = document.createElement('summary');
        let previewContent = '';
        
        if (isPrototype) previewContent = `<span class="token-meta">[[Prototype]]:</span> <span class="token-key">${data.constructorName}</span>`;
        else if (data.type === 'array') previewContent = `${data.constructorName}(${data.length}) <span class="token-meta">[${data.value.slice(0, 5).map(v => v.value || '...').join(', ')}${data.length > 5 ? ', ...': ''}]</span>`;
        else if (data.type === 'map' || data.type === 'set') previewContent = `${data.constructorName}(${data.size}) <span class="token-meta">{...}</span>`
        else if (data.type === 'error') previewContent = `<span class="token-error">${data.constructorName}: ${data.message}</span>`;
        else previewContent = `<span class="token-key">${data.constructorName}</span> <span class="token-meta">{...}</span>`;
        
        summary.innerHTML = `<span class="object-preview">${previewContent}</span>`;
        details.appendChild(summary);

        details.addEventListener('toggle', () => {
            if (details.open && !details.querySelector('.property-list')) {
                const propertyList = document.createElement('div');
                propertyList.className = 'property-list';

                const renderProp = (key, value, keyClass = 'token-key') => {
                    const keyEl = document.createElement('div');
                    keyEl.className = keyClass;
                    keyEl.textContent = `${key}:`;

                    const valEl = document.createElement('div');
                    if (['array', 'object', 'map', 'set', 'error'].includes(value.type)) {
                        valEl.appendChild(this._createVividInspector(value));
                    } else {
                         valEl.innerHTML = `<span class="token token-${value.type}">${value.value}</span>`
                    }
                    propertyList.appendChild(keyEl);
                    propertyList.appendChild(valEl);
                }

                if (data.type === 'array') data.value.forEach((v, i) => renderProp(i, v, 'token-number'));
                else if(data.properties) data.properties.forEach(p => renderProp(p.key, p.value));
                
                if (data.prototype && data.prototype.type !== 'null') {
                    propertyList.appendChild(this._createVividInspector(data.prototype, true));
                }
                details.appendChild(propertyList);
            }
        }, { once: true });
        
        return details;
    }

    _renderLogMessage(log) {
        const { level, args, timestamp, isInput = false, isError = false } = log;
        const row = document.createElement('div');
        row.className = `console-row level-${level} ${isInput ? 'input-row' : ''} ${isError ? 'level-error' : ''}`;
        
        const iconDefs = {
            error: `<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm7.03-3.03a.75.75 0 011.06 0L10 6.94l1.97-1.97a.75.75 0 111.06 1.06L11.06 8l1.97 1.97a.75.75 0 11-1.06 1.06L10 9.06l-1.97 1.97a.75.75 0 11-1.06-1.06L8.94 8 6.97 6.03a.75.75 0 010-1.06z"></path></svg>`,
            warn: `<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.22 1.754a.75.75 0 00-1.44 0L1.698 13.132a.75.75 0 00.645 1.118h11.314a.75.75 0 00.644-1.118L8.22 1.754zM2.81 12.632L8 2.918l5.19 9.714H2.81zM7.5 5.5a.5.5 0 011 0v3a.5.5 0 01-1 0v-3zm0 5.5a.5.5 0 111 0 .5.5 0 01-1 0z"></path></svg>`,
            info: `<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.47 7l.03.03.002.002.002.002.003.003.003.002.003.002.002.002h.003c.244.073.427.29.427.561v3.25a.75.75 0 11-1.5 0V9.664l-.004-.002-.002-.002-.003-.002-.003-.003h-.002L7.22 9.5H7.22A.75.75 0 016.5 8.75zM8 5a.75.75 0 110 1.5A.75.75 0 018 5z"></path></svg>`,
            input: `<svg viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>`,
            output: `<svg viewBox="0 0 16 16"><path d="M10.53 1.97a.75.75 0 010 1.06L6.06 7.5l4.47 4.47a.75.75 0 11-1.06 1.06L4.47 8.03a.75.75 0 010-1.06l5.03-5.03a.75.75 0 011.03 0z"></path></svg>`
        };
        
        const iconHtml = `<div class="console-icon">${ isInput ? iconDefs.input : isError ? iconDefs.output : iconDefs[level] || '' }</div>`;
        const timestampHtml = `<span class="console-timestamp">${timestamp || ''}</span>`;
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'console-content';

        args.forEach(arg => {
            if (['array', 'object', 'map', 'set', 'error'].includes(arg.type)) {
                contentContainer.appendChild(this._createVividInspector(arg));
            } else {
                const el = document.createElement('div');
                el.className = 'highlighted-output';
                const textarea = document.createElement('textarea');
                textarea.setAttribute('readonly', true);
                textarea.value = this._prettyPrint(arg);
                el.appendChild(textarea);
                contentContainer.appendChild(el);
                this.outputHighlighters.set(el, new pnimi(textarea, 'js'));
            }
        });
        
        row.innerHTML = iconHtml;
        row.appendChild(contentContainer);
        row.innerHTML += timestampHtml;

        this.elements.logContainer.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    _executeCommand() {
        const command = this.elements.input.value;
        if (command.trim() === '') return;
        this.elements.input.value = '';
        //this.inputHighlighter.update(''); // Force highlighter to update
        this._updateLineNumbers(); // Reset line numbers to 1

        const executionLog = {
            level: 'input', isInput: true, args: [{ type: 'string', value: command }],
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
        };
        this.logs.push(executionLog);
        this._renderLogMessage(executionLog);

        const executionId = this.nextExecutionId++;
        new Promise((resolve) => {
            this.pendingExecutions.set(executionId, resolve);
            this.previewIframe.contentWindow.postMessage({
                source: 'awtsmoos-editor', command: command, executionId: executionId,
            }, '*');
        }).then((result, isError) => {
             const resultLog = {
                level: isError ? 'error' : 'output', isError, args: [result],
                timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
            };
             this.logs.push(resultLog);
             this._renderLogMessage(resultLog);
             this._updateFilterCounts();
        });
    }

    _syncScroll() {
        this.elements.lineNumbers.scrollTop = this.elements.input.scrollTop;
    }

    _updateLineNumbers() {
        const lineCount = this.elements.input.value.split('\n').length;
        this.elements.lineNumbers.innerHTML = Array.from({length: lineCount}, (_, i) => `<div>${i + 1}</div>`).join('');
        this._syncScroll();
    }
    
    setupEventListeners() {
        this.elements.clearBtn.addEventListener('click', () => this._clearLogs());
        this.elements.runBtn.addEventListener('click', () => this._executeCommand());
        
        this.elements.input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._executeCommand();
            }
        });
        
        this.elements.filterToolbar.addEventListener('click', e => {
            const button = e.target.closest('button');
            if(button && button.dataset.filter) {
                this.elements.filterToolbar.querySelector('.active').classList.remove('active');
                button.classList.add('active');
                this.activeFilter = button.dataset.filter;
                this._renderFilteredLogs();
            }
        });

        // Event Listeners for the line-numbered input
        this.elements.input.addEventListener('scroll', this._syncScroll);
        this.elements.input.addEventListener('input', this._updateLineNumbers);
    }
    
    injectContent() {
        this.container.innerHTML = `
            <div id="console-toolbar-${this.consoleTabId}" class="console-toolbar">
                <div class="console-filters">
                    <button data-filter="all" class="active" title="Show All">All</button>
                    <button data-filter="error" data-count="0" title="Errors"></button>
                    <button data-filter="warn" data-count="0" title="Warnings"></button>
                    <button data-filter="info" data-count="0" title="Info"></button>
                    <button data-filter="log" data-count="0" title="Logs"></button>
                </div>
                <button id="console-clear-btn-${this.consoleTabId}" class="console-tool-btn" title="Clear Console">
                     <svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm5.78-2.22a.75.75 0 0 1 1.06 0L8 6.94l1.16-1.16a.75.75 0 1 1 1.06 1.06L9.06 8l1.16 1.16a.75.75 0 1 1-1.06 1.06L8 9.06 6.84 10.22a.75.75 0 1 1-1.06-1.06L6.94 8 5.78 6.78a.75.75 0 0 1 0-1.06z"></path></svg>
                     Clear
                </button>
            </div>
            <div id="log-container-${this.consoleTabId}" class="log-container"></div>
            <div id="input-area-${this.consoleTabId}" class="input-area">
                <div class="input-prompt-icon">
                    <svg viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>
                </div>
                <div class="line-numbered-input">
                    <div id="console-line-numbers-${this.consoleTabId}" class="line-numbers-gutter"></div>
                    <textarea id="console-input-${this.consoleTabId}" spellcheck="false" placeholder="Run JavaScript in preview (Shift+Enter for new line)"></textarea>
                </div>
                <button id="console-run-btn-${this.consoleTabId}" class="console-run-btn">Run</button>
            </div>
        `;

        if (!document.head.querySelector(`#console-styles-${this.consoleTabId}`)) {
            const style = document.createElement('style');
            style.id = `console-styles-${this.consoleTabId}`;
            style.textContent = `
                :root {
                    --console-bg-deep: #121212; --console-bg-medium: #1e1e1e; --console-bg-light: #2a2a2a;
                    --console-border: #333; --console-text-primary: #d4d4d4; --console-text-secondary: #808080;
                    --console-accent-primary: #33a5ff; --console-accent-secondary: #0e639c;
                    --console-error-primary: #f48771; --console-error-secondary: #5f2a24;
                    --console-warn-primary: #f7b731; --console-warn-secondary: #594416;
                    --console-string: #ce9178; --console-number: #b5cea8; --console-key: #9cdcfe;
                }
                #console-host { height: 100%; display: flex; flex-direction: column; background: var(--console-bg-medium); color: var(--console-text-primary); font-family: 'Fira Code', Menlo, monospace; font-size: 13px; }
                .console-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 8px; flex-shrink: 0; background: linear-gradient(to bottom, var(--console-bg-light), var(--console-bg-medium)); border-bottom: 1px solid var(--console-border); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .console-filters button { background: none; border: 1px solid var(--console-border); color: var(--console-text-secondary); padding: 2px 8px; border-radius: 4px; cursor: pointer; position: relative; transition: all 0.2s ease; }
                .console-filters button.active, .console-filters button:hover { background: var(--console-accent-secondary); color: white; border-color: var(--console-accent-primary); }
                .console-filters button[data-count]:not([data-count="0"])::after { content: attr(data-count); position: absolute; top: -5px; right: -5px; background: var(--console-accent-primary); color: white; border-radius: 50%; font-size: 9px; min-width: 14px; height: 14px; line-height: 14px; text-align: center; box-shadow: 0 0 3px rgba(0,0,0,0.5); }
                .console-filters button[data-filter="error"][data-count]:not([data-count="0"])::after { background: var(--console-error-primary); }
                .console-tool-btn { display: flex; align-items: center; gap: 4px; background: none; border: 1px solid transparent; color: var(--console-text-secondary); padding: 4px 8px; cursor: pointer; transition: color 0.2s ease; }
                .console-tool-btn:hover { color: var(--console-text-primary); }
                .console-tool-btn svg { width: 14px; height: 14px; fill: currentColor; }
                .log-container { flex-grow: 1; overflow-y: auto; padding: 5px; }
                .input-area { display: flex; align-items: flex-start; gap: 8px; background: var(--console-bg-deep); border-top: 1px solid var(--console-border); padding: 8px; flex-shrink: 0; }
                .input-prompt-icon { width: 16px; height: 16px; flex-shrink: 0; fill: var(--console-text-secondary); margin-top: 2px; }
                .line-numbered-input { position: relative; flex-grow: 1; border: 1px solid var(--console-border); border-radius: 4px; background: var(--console-bg-medium); overflow: hidden; display: flex; }
                .line-numbers-gutter { background: var(--console-bg-light); color: var(--console-text-secondary); padding: 8px 8px 8px 12px; font-family: inherit; font-size: inherit; line-height: 1.5; text-align: right; user-select: none; }
                .line-numbers-gutter div { min-width: 2ch; }
                .line-numbered-input textarea { flex-grow: 1; background: transparent; border: none; outline: none; resize: none; color: transparent; caret-color: var(--console-text-primary); font-family: inherit; font-size: inherit; line-height: 1.5; padding: 8px; margin: 0; max-height: 200px; }
                .line-numbered-input > div:not(.line-numbers-gutter) { line-height: 1.5 !important; padding: 8px !important; margin: 0 !important; } /* Pnimi overlay */
                .console-run-btn { background: var(--console-accent-primary); color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-weight: bold; transition: background 0.2s ease; }
                .console-run-btn:hover { background: #55b9ff; }
                .console-row { display: grid; grid-template-columns: 20px 1fr auto; align-items: baseline; gap: 8px; padding: 4px; border-bottom: 1px solid #2a2a2a; }
                .console-row.level-error { background: var(--console-error-secondary); border-left: 2px solid var(--console-error-primary); }
                .console-row.level-warn { background: var(--console-warn-secondary); border-left: 2px solid var(--console-warn-primary); }
                .console-icon svg { width: 14px; height: 14px; fill: var(--console-text-secondary); }
                .console-row.level-error .console-icon svg { fill: var(--console-error-primary); }
                .console-row.level-warn .console-icon svg { fill: var(--console-warn-primary); }
                .console-row.level-info .console-icon svg { fill: var(--console-accent-primary); }
                .console-content { word-break: break-all; }
                .console-timestamp { color: var(--console-text-secondary); font-size: 11px; }
                .highlighted-output, .highlighted-output textarea, .highlighted-output > div { font-family: inherit !important; font-size: inherit !important; line-height: 1.5 !important; }
                .highlighted-output { position: relative; }
                .highlighted-output textarea { background: transparent; border: none; color: transparent; caret-color: transparent; overflow: hidden; resize: none; white-space: pre; padding: 0; margin: 0; }
                .highlighted-output > div { padding: 0 !important; margin: 0 !important; } /* Pnimi overlay */
                .vivid-inspector { display: block; }
                .vivid-inspector summary { cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; }
                .vivid-inspector summary::before { content: '▶'; display: inline-block; width: 1.5em; flex-shrink: 0; transition: transform 0.1s ease; }
                .vivid-inspector[open] > summary::before { transform: rotate(90deg); }
                .vivid-inspector[open] > summary .object-preview { font-weight: bold; }
                .property-list { padding-left: 1em; border-left: 1px solid var(--console-border); margin-left: 0.75em; display: grid; grid-template-columns: auto 1fr; align-items: baseline; gap: 2px 8px; }
                .prototype-inspector { border-top: 1px dashed var(--console-border); padding-top: 2px; margin-top: 2px; grid-column: 1 / -1; }
                .token-key { text-align: right; color: var(--console-key); opacity: 0.9; }
                .token-string { color: var(--console-string); }
                .token-number { color: var(--console-number); }
                .token-error { color: var(--console-error-primary); }
                .token-meta { color: var(--console-text-secondary); font-style: italic; }
            `;
            document.head.appendChild(style);
        }
        
        this.elements = {
            logContainer: this.container.querySelector(`#log-container-${this.consoleTabId}`),
            input: this.container.querySelector(`#console-input-${this.consoleTabId}`),
            lineNumbers: this.container.querySelector(`#console-line-numbers-${this.consoleTabId}`),
            clearBtn: this.container.querySelector(`#console-clear-btn-${this.consoleTabId}`),
            runBtn: this.container.querySelector(`#console-run-btn-${this.consoleTabId}`),
            filterToolbar: this.container.querySelector(`#console-toolbar-${this.consoleTabId} .console-filters`),
            errorBtn: this.container.querySelector('[data-filter="error"]'),
            warnBtn: this.container.querySelector('[data-filter="warn"]'),
            infoBtn: this.container.querySelector('[data-filter="info"]'),
            logBtn: this.container.querySelector('[data-filter="log"]')
        };
    }
}