// B"H
// FILE: js/Console.js

export class Console {
    constructor(previewIframe, containerElement, consoleTabId) {
        this.previewIframe = previewIframe;
        this.container = containerElement;
        this.consoleTabId = consoleTabId; // Unique ID for styles/elements
        this.logs = [];
        this.activeFilter = 'all'; // 'all', 'error', 'warn', 'info', 'log'
        this.elements = {}; // Cache for DOM elements
        this.messageHandler = this.handleIncomingMessages.bind(this);
        this.nextExecutionId = 0;
        this.pendingExecutions = new Map();
        window.addEventListener('message', this.messageHandler);
    }

    render() {
        this.injectContent();
        this.setupEventListeners();
    }

    destroy() {
        window.removeEventListener('message', this.messageHandler);
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
                this.logs = [];
                this._renderFilteredLogs();
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
    
    _renderFilteredLogs() {
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
                acc[log.level]++;
            }
            return acc;
        }, { error: 0, warn: 0, info: 0, log: 0 });
        
        this.elements.errorBtn.dataset.count = counts.error;
        this.elements.warnBtn.dataset.count = counts.warn;
        this.elements.infoBtn.dataset.count = counts.info;
        this.elements.logBtn.dataset.count = counts.log;
    }

    _renderLogMessage(log) {
        const { level, args, timestamp, isInput = false, isError = false } = log;
        const row = document.createElement('div');
        row.className = `console-row level-${level} ${isInput ? 'input-row' : ''} ${isError ? 'level-error' : ''}`;
        
        const iconDefs = {
            error: `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm7.03-3.03a.75.75 0 011.06 0L10 6.94l1.97-1.97a.75.75 0 111.06 1.06L11.06 8l1.97 1.97a.75.75 0 11-1.06 1.06L10 9.06l-1.97 1.97a.75.75 0 11-1.06-1.06L8.94 8 6.97 6.03a.75.75 0 010-1.06z"></path></svg>`,
            warn: `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8.22 1.754a.75.75 0 00-1.44 0L1.698 13.132a.75.75 0 00.645 1.118h11.314a.75.75 0 00.644-1.118L8.22 1.754zM2.81 12.632L8 2.918l5.19 9.714H2.81zM7.5 5.5a.5.5 0 011 0v3a.5.5 0 01-1 0v-3zm0 5.5a.5.5 0 111 0 .5.5 0 01-1 0z"></path></svg>`,
            info: `<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.47 7l.03.03.002.002.002.002.003.003.003.002.003.002.002.002h.003c.244.073.427.29.427.561v3.25a.75.75 0 11-1.5 0V9.664l-.004-.002-.002-.002-.003-.002-.003-.003h-.002L7.22 9.5H7.22A.75.75 0 016.5 8.75zM8 5a.75.75 0 110 1.5A.75.75 0 018 5z"></path></svg>`,
            input: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>`,
            output: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.53 1.97a.75.75 0 010 1.06L6.06 7.5l4.47 4.47a.75.75 0 11-1.06 1.06L4.47 8.03a.75.75 0 010-1.06l5.03-5.03a.75.75 0 011.03 0z"></path></svg>`
        }
        
        const iconHtml = `<div class="console-icon">${ isInput ? iconDefs.input : isError ? iconDefs.output : iconDefs[level] || '' }</div>`;
        const contentHtml = `<div class="console-content">${args.map(arg => this.formatData(arg).outerHTML).join(' ')}</div>`;
        const timestampHtml = `<span class="console-timestamp">${timestamp || ''}</span>`;
        
        row.innerHTML = iconHtml + contentHtml + timestampHtml;
        this.elements.logContainer.appendChild(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    _executeCommand() {
        const command = this.elements.input.value;
        if (command.trim() === '') return;
        this.elements.input.value = '';

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

    setupEventListeners() {
        this.elements.clearBtn.addEventListener('click', () => this.previewIframe.contentWindow.console.clear());
        
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
    }
    
    // B"H The next two functions are the heart of the "VIVID" object viewer
    formatData(data) { /* ... This function has been rewritten to delegate complex types to createCollapsible ... */ }
    createCollapsible(data, topLevel = true) { /* ... This has been rewritten and expanded to handle everything beautifully ... */ }
    
    injectContent() { /* ... This function is rewritten to create the entire new UI ... */ }
}

// B"H --- REPLACED METHODS ---
// Replace the empty formatData, createCollapsible, and injectContent in the class above with these full versions.

Console.prototype.injectContent = function() {
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
        <div id="input-container-${this.consoleTabId}" class="input-container">
            <svg class="input-prompt-icon" viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>
            <textarea id="console-input-${this.consoleTabId}" rows="1" spellcheck="false" placeholder="Run JavaScript in preview..."></textarea>
            <button id="console-run-btn-${this.consoleTabId}" class="console-tool-btn">Run</button>
        </div>
    `;

    // Inject styles into the main document's head
    if (!document.head.querySelector(`#console-styles-${this.consoleTabId}`)) {
        const style = document.createElement('style');
        style.id = `console-styles-${this.consoleTabId}`;
        style.textContent = `
            :root { /* Shared CSS variables... */
                --console-bg: #181818; --console-text: #d4d4d4; --console-input-bg: #1e1e1e;
                --console-border: #333; --console-string: #ce9178; --console-number: #b5cea8;
                --console-boolean: #569cd6; --console-null: #569cd6; --console-key: #9cdcfe;
                --console-meta: #808080; --console-error-bg: rgba(253, 90, 90, 0.1); --console-error-border: #f44747;
                --console-warn-bg: rgba(247, 183, 49, 0.1); --console-warn-border: #f7b731;
            }
            #console-host { height: 100%; display: flex; flex-direction: column; background: var(--console-bg); color: var(--console-text); font-family: 'Fira Code', Menlo, monospace; font-size: 13px; }
            .console-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 2px 8px; border-bottom: 1px solid var(--console-border); flex-shrink: 0; }
            .console-filters { display: flex; gap: 4px; }
            .console-filters button { background: none; border: 1px solid var(--console-border); color: var(--console-text); padding: 2px 8px; border-radius: 4px; cursor: pointer; position: relative; }
            .console-filters button.active, .console-filters button:hover { background: var(--color-bg-light); }
            .console-filters button[data-count]:not([data-count="0"])::after { content: attr(data-count); position: absolute; top: -5px; right: -5px; background: var(--console-boolean); color: white; border-radius: 50%; font-size: 9px; min-width: 14px; height: 14px; line-height: 14px; text-align: center; }
            .console-filters button[data-filter="error"][data-count]:not([data-count="0"])::after { background: var(--console-error-border); }
            .console-tool-btn { display: flex; align-items: center; gap: 4px; background: none; border: 1px solid transparent; color: var(--console-text); padding: 4px 8px; cursor: pointer; }
            .console-tool-btn svg { width: 14px; height: 14px; fill: currentColor; }
            .log-container { flex-grow: 1; overflow-y: auto; padding: 5px; }
            .input-container { display: flex; align-items: flex-start; gap: 5px; background: var(--console-input-bg); border-top: 1px solid var(--console-border); padding: 5px; flex-shrink: 0; }
            .input-prompt-icon { width: 16px; height: 16px; flex-shrink: 0; fill: #505050; margin-top: 2px; }
            .input-container textarea { flex-grow: 1; background: none; border: none; color: var(--console-text); outline: none; resize: none; font-family: inherit; font-size: inherit; max-height: 150px; }
            .console-row { display: grid; grid-template-columns: 20px 1fr auto; align-items: baseline; gap: 8px; padding: 4px; border-bottom: 1px solid var(--console-border); }
            .console-row.level-error { background: var(--console-error-bg); border-left: 2px solid var(--console-error-border); }
            .console-row.level-warn { background: var(--console-warn-bg); border-left: 2px solid var(--console-warn-border); }
            .console-icon svg { width: 14px; height: 14px; fill: var(--console-meta); }
            .console-row.level-error .console-icon svg { fill: var(--console-error-border); }
            .console-row.level-warn .console-icon svg { fill: var(--console-warn-border); }
            .console-row.level-info .console-icon svg { fill: var(--console-boolean); }
            .console-content { word-break: break-all; }
            .console-timestamp { color: var(--console-meta); font-size: 11px; }
            .token { display: inline-block; }
            .token-string { color: var(--console-string); }
            .token-number, .token-boolean { color: var(--console-number); }
            .token-null, .token-undefined { color: var(--console-null); }
            .token-meta { color: var(--console-meta); font-style: italic; }
            .token-key { color: var(--console-key); }
            .token-function::before { content: 'ƒ'; color: var(--console-boolean); }
            details.token-object { display: inline-flex; flex-direction: column; vertical-align: top; }
            details.token-object summary { cursor: pointer; user-select: none; }
            details.token-object summary:hover .token-meta { text-decoration: underline; }
            .object-preview { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }
            .property-list { padding-left: 20px; display: grid; grid-template-columns: auto 1fr; align-items: baseline; gap: 0 8px;}
        `;
        document.head.appendChild(style);
    }
    
    // Cache DOM Elements
    this.elements = {
        logContainer: this.container.querySelector(`#log-container-${this.consoleTabId}`),
        input: this.container.querySelector(`#console-input-${this.consoleTabId}`),
        clearBtn: this.container.querySelector(`#console-clear-btn-${this.consoleTabId}`),
        runBtn: this.container.querySelector(`#console-run-btn-${this.consoleTabId}`),
        filterToolbar: this.container.querySelector(`#console-toolbar-${this.consoleTabId} .console-filters`),
        errorBtn: this.container.querySelector('[data-filter="error"]'),
        warnBtn: this.container.querySelector('[data-filter="warn"]'),
        infoBtn: this.container.querySelector('[data-filter="info"]'),
        logBtn: this.container.querySelector('[data-filter="log"]')
    };
};

Console.prototype.formatData = function(data) {
    const el = document.createElement('span');
    el.className = `token token-${data.type}`;

    switch (data.type) {
        case 'string': el.textContent = `"${data.value}"`; break;
        case 'number': case 'boolean': case 'undefined': case 'null': el.textContent = data.value; break;
        case 'function': el.className += ' token-meta'; el.innerHTML = `<span class="token-function"></span> ${data.name}`; break;
        case 'array': case 'object': case 'map': case 'set': case 'error': return this.createCollapsible(data);
        default:
            el.className += ' token-meta';
            el.textContent = data.value || data.constructorName;
            break;
    }
    return el;
};

Console.prototype.createCollapsible = function(data) {
    const details = document.createElement('details');
    details.className = 'token-object';
    
    const summary = document.createElement('summary');
    
    let previewContent = '';
    if(data.type === 'array') previewContent = `${data.constructorName}(${data.length}) [${data.value.slice(0, 5).map(v => v.value).join(', ')}${data.length > 5 ? ', ...': ''}]`;
    else if (data.type === 'map' || data.type === 'set') previewContent = `${data.constructorName}(${data.size})`
    else if (data.type === 'error') previewContent = `${data.constructorName}: ${data.message}`;
    else previewContent = `${data.constructorName} {...}`;

    summary.innerHTML = `<span class="object-preview">${previewContent}</span>`;
    
    const propertyList = document.createElement('div');
    propertyList.className = 'property-list';

    // Lazy load properties on first expand
    details.addEventListener('toggle', () => {
        if (details.open && !propertyList.hasChildNodes()) {
            if (data.type === 'array') {
                data.value.forEach((item, index) => {
                    propertyList.innerHTML += `<div class="token-key">${index}:</div><div>${this.formatData(item).outerHTML}</div>`;
                });
                propertyList.innerHTML += `<div class="token-meta">length:</div><div class="token-number">${data.length}</div>`;
            } else if (data.type === 'map') {
                 data.entries.forEach(([key, val], index) => {
                     propertyList.innerHTML += `<div>${index}:</div><div>${this.formatData(key).outerHTML} => ${this.formatData(val).outerHTML}</div>`;
                 });
            } else if (data.type === 'set') {
                 data.values.forEach((val, index) => {
                     propertyList.innerHTML += `<div>${index}:</div><div>${this.formatData(val).outerHTML}</div>`;
                 });
            } else if (data.type === 'error' && data.stack) {
                const stackEl = document.createElement('div');
                stackEl.style.gridColumn = '1 / -1';
                stackEl.style.whiteSpace = 'pre-wrap';
                stackEl.textContent = data.stack;
                propertyList.appendChild(stackEl);
            } else if(data.properties) { // Generic Object
                data.properties.forEach(({ key, value, isAccessor }) => {
                    if (isAccessor) {
                         propertyList.innerHTML += `<div class="token-key">(...)</div><div class="token-key">${key}</div>`;
                    } else {
                         propertyList.innerHTML += `<div class="token-key">${key}:</div><div>${this.formatData(value).outerHTML}</div>`;
                    }
                });
            }

            if(data.prototype && data.prototype.type !== 'null') {
                const protoDiv = document.createElement('div');
                protoDiv.style.gridColumn = '1 / -1';
                protoDiv.innerHTML = `<span class="token-meta">[[Prototype]]:</span> ${this.formatData(data.prototype).outerHTML}`;
                propertyList.appendChild(protoDiv);
            }
        }
    }, { once: true });
    
    details.appendChild(summary);
    details.appendChild(propertyList);
    return details;
};