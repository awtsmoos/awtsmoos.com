// B"H
// FILE: js/Console.js
// THE VIVID BRUTALITY ENGINE - FINAL, COMPLETE, NO PLACEHOLDERS

import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

/**
 * This is not a console. This is a command-line chasm. A chroniton-flux-stabilized
 * data conduit. Messages do not arrive; they MANIFEST. It is built to withstand
 * temporal paradoxes, infinite loops, and the unfiltered fury of a thousand
 * console.log statements per millisecond.
 *
 * Every function is a piston in a brutalist engine. Every line of CSS is a
 * sharpened edge. There are no safe corners here.
 *
 * Welcome to the machine.
 */
export class Console {
    constructor(previewIframe, containerElement, consoleTabId) {
        // --- The Core Configuration ---
        this.previewIframe = previewIframe;
        this.container = containerElement;
        this.consoleTabId = `chasm-${consoleTabId}`; // Isolate our abyss

        // --- The Source of Truth: The Unblinking Eye ---
        this.logs = []; // All manifested realities (log entries) are stored here.
        this.activeFilter = 'all'; // The current lens through which we view the abyss.
        this.highlighters = new Map(); // A registry of summoned pnimi light-shapers.
        this.pendingExecutions = new Map(); // Souls awaiting return from the preview realm.
        this.nextExecutionId = 0;

        // --- The Brutality Engine: The Render Accelerator ---
        this.renderQueue = []; // A temporal buffer of realities yet to be painted.
        this.isRenderScheduled = false; // The engine's ignition switch.
        this.renderFrameRequest = null; // A handle to the fabric of spacetime (the animation frame).

        // --- Binding the Engine's Soul to its Body ---
        this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
        this._processRenderQueue = this._processRenderQueue.bind(this);
    }

    /**
     * IGNITION SEQUENCE. Injects the DOM, forges the styles, binds the listeners,
     * and opens the conduit. This is the only way in.
     */
    initialize() {
        this._injectDOM();
        this._attachEventListeners();
        window.addEventListener('message', this.handleIncomingMessages);
        this._manifest({ level: 'info', args: [{ type: 'string', value: `Vivid Brutality Engine online. Conduit open. B"H.` }] });
    }

    /**
     * THE GREAT UNMAKING. Returns all matter and energy to the void.
     * Severs the conduit, banishes all light-shapers, and collapses the DOM
     * to prevent catastrophic memory paradoxes.
     */
    destroy() {
        window.removeEventListener('message', this.handleIncomingMessages);

        if (this.renderFrameRequest) {
            cancelAnimationFrame(this.renderFrameRequest);
        }

        this.highlighters.forEach(highlighter => highlighter.destroy());
        this.highlighters.clear();

        this.logs = [];
        this.renderQueue = [];
        this.pendingExecutions.clear();
        
        const styleEl = document.head.querySelector(`#console-styles-${this.consoleTabId}`);
        if (styleEl) styleEl.remove();

        this.container.innerHTML = '';
    }

    // --- Conduit & Manifestation ---

    handleIncomingMessages(event) {
        if (event.source !== this.previewIframe.contentWindow || !event.data || event.data.source !== 'html-preview-console') return;
        
        switch (event.data.type) {
            case 'clear':
                this._collapseReality();
                break;
            case 'log':
                this._manifest(event.data.payload);
                break;
            case 'execution-result':
                this._handleExecutionResult(event.data.payload);
                break;
        }
    }

    /**
     * The single point of entry into the abyss. It does not touch the DOM.
     * It forges a log entry, stamps it with a temporal signature, and hurls
     * it into the render queue for future manifestation.
     */
    _manifest(logData) {
        const logEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            ...logData
        };
        this.logs.push(logEntry);
        
        this.renderQueue.push(logEntry);
        this._scheduleRender();
    }

    // --- The Brutality Engine ---

    /**
     * Primes the render accelerator. If it's already primed, it does nothing.
     * Ensures the engine fires only once per spacetime frame.
     */
    _scheduleRender() {
        if (this.isRenderScheduled) return;
        this.isRenderScheduled = true;
        this.renderFrameRequest = requestAnimationFrame(this._processRenderQueue);
    }
    
    /**
     * THE ENGINE'S ROAR. The piston fires. All queued realities are ripped from
     * the temporal buffer and slammed into a DocumentFragment in a single,
     * violent burst. The fragment is then grafted onto the living DOM.
     */
    _processRenderQueue() {
        if (this.renderQueue.length === 0) {
            this.isRenderScheduled = false;
            return;
        }

        const fragment = document.createDocumentFragment();
        const logsToManifest = [...this.renderQueue];
        this.renderQueue = [];

        for (const log of logsToManifest) {
            if (this.activeFilter === 'all' || this.activeFilter === log.level) {
                const rowElement = this._forgeLogRow(log);
                fragment.appendChild(rowElement);
            }
        }

        if (fragment.children.length > 0) {
            const scrollContainer = this.elements.logContainer;
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 20;

            scrollContainer.appendChild(fragment);

            if (isAtBottom) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
        
        this._updateFilterCounts();
        this.isRenderScheduled = false;
    }

    /**
     * Re-calibrates the lens. Destroys the current visual reality and
     * re-manifests everything from the source of truth, seen through the new filter.
     */
    _rematerializeAllLogs() {
        this.highlighters.forEach(h => h.destroy());
        this.highlighters.clear();
        this.elements.logContainer.innerHTML = '';
        
        this.renderQueue = this.logs.filter(log => this.activeFilter === 'all' || this.activeFilter === log.level);
        this._scheduleRender();
    }

    // --- The Forge: Where Reality is Shaped ---
    
    /**
     * Forges a single row of reality from a log entry's data.
     */
    _forgeLogRow(log) {
        const row = document.createElement('div');
        row.className = `console-row level-${log.level || 'output'} ${log.isInput ? 'input-row' : ''}`;

        const iconDefs = {
            error: `<svg viewBox="0 0 16 16"><path d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"></path></svg>`,
            warn: `<svg viewBox="0 0 16 16"><path d="M8.22 1.754a.75.75 0 00-1.44 0L1.698 13.132a.75.75 0 00.645 1.118h11.314a.75.75 0 00.644-1.118L8.22 1.754zM8 11.25a.75.75 0 110 1.5.75.75 0 010-1.5zM8.25 5a.25.25 0 00-.5 0v4.5a.25.25 0 00.5 0V5z"></path></svg>`,
            info: `<svg viewBox="0 0 16 16"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 5a1 1 0 012 0v1H7V5zm1 10a1 1 0 01-1-1V9a1 1 0 012 0v5a1 1 0 01-1 1z"></path></svg>`,
            input: `<svg viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>`,
            output: `<svg viewBox="0 0 16 16"><path d="M10.53 1.97a.75.75 0 010 1.06L6.06 7.5l4.47 4.47a.75.75 0 11-1.06 1.06L4.47 8.03a.75.75 0 010-1.06l5.03-5.03a.75.75 0 011.03 0z"></path></svg>`
        };
        const iconEl = document.createElement('div');
        iconEl.className = 'console-icon';
        iconEl.innerHTML = log.isInput ? iconDefs.input : log.level === 'error' ? iconDefs.output : iconDefs[log.level] || '';

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'console-message-wrapper';

        (log.args || []).forEach(arg => {
            const argContainer = (['array', 'object', 'map', 'set', 'error'].includes(arg.type))
                ? this._createVividInspector(arg)
                : this._createHighlightedOutput(arg, log);
            messageWrapper.appendChild(argContainer);
        });

        const timestampEl = document.createElement('span');
        timestampEl.className = 'console-timestamp';
        timestampEl.textContent = log.timestamp;

        row.appendChild(iconEl);
        row.appendChild(messageWrapper);
        row.appendChild(timestampEl);
        
        requestAnimationFrame(() => row.classList.add('vivid-enter'));
        return row;
    }
    
    _prettyPrint(data) {
        if (data.type === 'string') return data.value;
        if (data.value === null) return 'null';
        if (data.value === undefined) return 'undefined';
        return String(data.value);
    }
    
    _createHighlightedOutput(arg, log) {
        const textarea = document.createElement('textarea');
        const content = this._prettyPrint(arg);
        textarea.value = content;
        textarea.rows = content.split('\n').length;
        textarea.setAttribute('readonly', true);
        
        try {
            const highlighter = new pnimi(textarea, 'js');
            this.highlighters.set(`${log.id}-${arg.value}`, highlighter);
        } catch (e) {
            console.error("pnimi failed to shape the light:", e);
        }
        return textarea;
    }
    
    _createVividInspector(data, isPrototype = false) {
        const details = document.createElement('details');
        details.className = 'vivid-inspector';
        if (isPrototype) details.classList.add('prototype-inspector');

        const summary = document.createElement('summary');
        let previewContent = '';
        if (isPrototype) {
            previewContent = `<span class="token-meta">[[Prototype]]:</span> <span class="token-key">${data.constructorName}</span>`;
        } else if (data.type === 'array') {
            previewContent = `${data.constructorName}(${data.length}) <span class="token-meta">[${data.value.slice(0, 5).map(v => v.type === 'string' ? `"${v.value}"` : (v.value || '...')).join(', ')}${data.length > 5 ? ', ...': ''}]</span>`;
        } else if (data.type === 'map' || data.type === 'set') {
            previewContent = `${data.constructorName}(${data.size}) <span class="token-meta">{...}</span>`;
        } else if (data.type === 'error') {
            previewContent = `<span class="token-error">${data.constructorName}: ${data.message}</span>`;
        } else {
            previewContent = `<span class="token-key">${data.constructorName}</span> <span class="token-meta">{...}</span>`;
        }
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
                        valEl.innerHTML = `<span class="token token-${value.type}">${this._prettyPrint(value)}</span>`;
                    }
                    propertyList.appendChild(keyEl);
                    propertyList.appendChild(valEl);
                };

                if (data.type === 'array') data.value.forEach((v, i) => renderProp(i, v, 'token-number'));
                else if (data.properties) data.properties.forEach(p => renderProp(p.key, p.value));
                if (data.prototype && data.prototype.type !== 'null') {
                    propertyList.appendChild(this._createVividInspector(data.prototype, true));
                }
                details.appendChild(propertyList);
            }
        }, { once: true });

        return details;
    }

    // --- Command & Control ---

    _executeCommand() {
        const command = this.elements.input.value;
        if (command.trim() === '') return;
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';
        this.elements.input.style.height = '41px'; // Reset to base height
        
        this._manifest({ level: 'input', args: [{ type: 'string', value: command }], isInput: true });

        const executionId = this.nextExecutionId++;
        this.previewIframe.contentWindow.postMessage({
			source: 'awtsmoos-editor',
			command: command,
			executionId: executionId
		}, '*');
        
        this.pendingExecutions.set(executionId, (result, isError) => {
            this._manifest({ level: isError ? 'error' : 'output', args: [result] });
            this.pendingExecutions.delete(executionId);
        });
    }
    
    _handleExecutionResult({ executionId, result, isError }) {
        const callback = this.pendingExecutions.get(executionId);
        if (callback) callback(result, isError);
    }

    _collapseReality() {
        this.logs = [];
        this.renderQueue = [];
        if (this.renderFrameRequest) {
            cancelAnimationFrame(this.renderFrameRequest);
            this.isRenderScheduled = false;
        }
        this.highlighters.forEach(h => h.destroy());
        this.highlighters.clear();
        this.elements.logContainer.innerHTML = '';
        this._updateFilterCounts();
    }

    _updateFilterCounts() {
        const counts = this.logs.reduce((acc, log) => {
            const level = log.level;
            if (acc.hasOwnProperty(level)) {
                acc[level]++;
            }
            return acc;
        }, { error: 0, warn: 0, info: 0, log: 0, input: 0, output: 0 });

        this.elements.filterToolbar.querySelectorAll('button[data-filter]').forEach(btn => {
            const filter = btn.dataset.filter;
            const count = (filter === 'all') ? this.logs.length : counts[filter] || 0;
            btn.dataset.count = count;
        });
    }
    
    // --- The Forge: Structure & Style Schematics ---
    
    _injectDOM() {
        this.container.innerHTML = this._getHTML();
        const style = document.createElement('style');
        style.id = `console-styles-${this.consoleTabId}`;
        style.textContent = this._getCSS();
        document.head.appendChild(style);

        this.elements = {
            logContainer: this.container.querySelector('.log-container'),
            input: this.container.querySelector('.console-input'),
            runBtn: this.container.querySelector('.console-run-btn'),
            toolbar: this.container.querySelector('.console-toolbar'),
            filterToolbar: this.container.querySelector('.console-filters'),
        };
    }
    
    _attachEventListeners() {
        this.elements.runBtn.addEventListener('click', () => this._executeCommand());
        this.elements.input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._executeCommand();
            }
        });
        
        this.elements.input.addEventListener('input', e => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
        });

        this.elements.toolbar.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.dataset.action === 'clear') {
                this._collapseReality();
            }
            if (button.dataset.filter) {
                this.elements.filterToolbar.querySelector('.active').classList.remove('active');
                button.classList.add('active');
                this.activeFilter = button.dataset.filter;
                this._rematerializeAllLogs();
            }
        });
    }
    
    _getHTML() {
        return `
            <div class="console-toolbar">
                <div class="console-filters">
                    <button data-filter="all" class="active" title="Show All Realities">All</button>
                    <button data-filter="error" title="Show Errors & Collapsed Waveforms"></button>
                    <button data-filter="warn" title="Show Warnings & Paradoxes"></button>
                    <button data-filter="info" title="Show Informational Constructs"></button>
                    <button data-filter="log" title="Show Standard Logs"></button>
                </div>
                <button data-action="clear" class="console-tool-btn" title="Collapse Reality">
                    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0z"></path><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"></path></svg>
                    Clear
                </button>
            </div>
            <div class="log-container"></div>
            <div class="console-input-area">
                <textarea class="console-input" spellcheck="false" placeholder="Inject command..." rows="1"></textarea>
                <button class="console-run-btn" title="Execute (Enter)">
                    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM6 4.5v7l5-3.5-5-3.5z"></path></svg>
                </button>
            </div>
        `;
    }

    _getCSS() {
        return `
            :root {
                --c-bg-deep: #101010; --c-bg-med: #1e1e1e; --c-bg-light: #2a2a2a;
                --c-border: #383838; --c-border-active: #00aaff;
                --c-text-pri: #e0e0e0; --c-text-sec: #888;
                --c-accent-pri: #00aaff; --c-accent-sec: #0e639c;
                --c-error-pri: #f47174; --c-error-sec: #4d181d;
                --c-warn-pri: #f7b731; --c-warn-sec: #594416;
                --c-string: #ce9178; --c-number: #b5cea8; --c-key: #4fc1ff;
            }
            .console-container, .console-container * { box-sizing: border-box; }
            .console-container { height:100%; display:flex; flex-direction:column; background:var(--c-bg-deep); color:var(--c-text-pri); font-family:'Fira Code', Menlo, monospace; font-size:13px; }
            
            .console-toolbar { display:flex; justify-content:space-between; align-items:center; padding:2px 8px; flex-shrink:0; background:var(--c-bg-deep); border-bottom:1px solid var(--c-border); }
            .console-filters { display:flex; gap:4px; }
            .console-filters button { background:var(--c-bg-light); border:1px solid var(--c-border); color:var(--c-text-sec); padding:2px 8px; border-radius:4px; cursor:pointer; position:relative; transition:all .2s ease; }
            .console-filters button.active, .console-filters button:hover { background:var(--c-accent-sec); color:white; border-color:var(--c-accent-pri); }
            .console-filters button[data-count]:not([data-count="0"])::after { content:attr(data-count); position:absolute; top:-6px; right:-6px; background:var(--c-accent-pri); color:white; border-radius:50%; font-size:9px; font-weight:bold; width:16px; height:16px; line-height:16px; text-align:center; }
            .console-filters button[data-filter="error"][data-count]:not([data-count="0"])::after { background:var(--c-error-pri); }
            .console-tool-btn { display:flex; align-items:center; gap:4px; background:none; border:none; color:var(--c-text-sec); padding:4px 8px; cursor:pointer; transition:color .2s ease; }
            .console-tool-btn:hover { color:var(--c-text-pri); }
            .console-tool-btn svg { width:14px; height:14px; }

            .log-container { flex-grow:1; overflow-y:auto; padding:5px; }

            .console-row { display: flex; align-items: flex-start; gap: 8px; padding: 4px; border-bottom: 1px solid var(--c-border); opacity: 0; transform: translateY(10px); transition: opacity 0.3s ease, transform 0.3s ease; }
            .console-row.vivid-enter { opacity: 1; transform: translateY(0); }
            .console-row:hover { background: var(--c-bg-light); }
            .console-row.level-error { background: var(--c-error-sec); border-left: 2px solid var(--c-error-pri); padding-left: 2px;}
            .console-row.level-warn { background: var(--c-warn-sec); border-left: 2px solid var(--c-warn-pri); padding-left: 2px; }
            .console-row.level-input { border-left: 2px solid var(--c-accent-pri); padding-left: 2px; }
            
            .console-icon { flex-shrink: 0; margin-top: 1px; }
            .console-icon svg { width: 14px; height: 14px; fill: var(--c-text-sec); }
            .console-row.level-error .console-icon svg { fill: var(--c-error-pri); }
            .console-row.level-warn .console-icon svg { fill: var(--c-warn-pri); }
            .console-row.level-info .console-icon svg { fill: var(--c-accent-pri); }

            .console-message-wrapper { flex-grow: 1; min-width: 0; position: relative; display: flex; flex-direction: column; gap: 4px; }
            .console-message-wrapper > textarea { width: 100%; border: none; padding: 0; margin: 0; background: transparent; color: inherit; font: inherit; line-height: 1.5; resize: none; overflow: hidden; }
            .console-message-wrapper .virtualized-editor-wrapper { position: relative !important; height: auto !important; }

            .console-timestamp { color:var(--c-text-sec); font-size:11px; margin-top:2px; white-space: nowrap; }

            .console-input-area { display:flex; align-items:flex-end; padding:8px; gap:8px; border-top:1px solid var(--c-border); background: var(--c-bg-deep); flex-shrink: 0; }
            .console-input { flex-grow:1; background:var(--c-bg-med); border:1px solid var(--c-border); border-radius:4px; color:var(--c-text-pri); font-family:inherit; font-size:13px; padding:8px; resize:none; overflow-y:auto; max-height:200px; line-height:1.5; transition: border-color 0.2s ease; }
            .console-input:focus { border-color: var(--c-border-active); outline: none; }
            .console-run-btn { background:var(--c-accent-pri); color:white; border:none; border-radius:4px; padding:8px; cursor:pointer; transition:background .2s ease; display:flex; align-items:center; justify-content:center; flex-shrink: 0; }
            .console-run-btn:hover { background:#33baff; }
            .console-run-btn svg { width:16px; height:16px; }

            .vivid-inspector { font-size: 12px; }
            .vivid-inspector summary { cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; }
            .vivid-inspector summary::before { content: '▶'; color: var(--c-text-sec); display: inline-block; width: 1.5em; flex-shrink: 0; transition: transform .1s ease; }
            .vivid-inspector[open] > summary::before { transform: rotate(90deg); }
            .property-list { padding-left: 1em; border-left: 1px solid var(--c-border); margin-left: .75em; display: grid; grid-template-columns: auto 1fr; align-items: start; gap: 2px 8px; }
            .token-meta { color: var(--c-text-sec); }
            .token-key { color: var(--c-key); }
            .token-string { color: var(--c-string); }
            .token-number { color: var(--c-number); }
            .token-error { color: var(--c-error-pri); }
        `;
    }
}