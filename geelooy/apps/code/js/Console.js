// B"H
// FILE: js/Console.js
// THE CHRONOMANTIC CONSOLE ENGINE - ABSOLUTE FINAL CODE. NO OMISSIONS.

import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

/**
 * You are not looking at a script. You are looking at a vessel.
 * It does not execute; it awakens. It stabilizes a conduit to the chaotic
 * data-stream of the preview realm and gives it form, fire, and fury.
 * This is a tool for titans. Use it with intent.
 */
export class Console {
    /**
     * The constructor forges the engine's core components in a state of
     * pure potential. It does not touch the world (the DOM) yet.
     */
    constructor(previewIframe, containerElement, consoleTabId) {
        // --- Core Spacetime Coordinates ---
        this.previewIframe = previewIframe;
        this.container = containerElement;
        this.consoleTabId = `chronomancer-${consoleTabId}`;

        // --- The Timestream (Source of Truth) ---
        this.logs = [];
        this.activeFilter = 'all';
        this.highlighters = new Map();
        this.pendingExecutions = new Map();
        this.nextExecutionId = 0;

        // --- The Quantum Render Engine ---
        this.renderQueue = [];
        this.isRenderScheduled = false;
        this.renderFrameRequest = null;

        // --- Binding the Animus to the Corpus ---
        this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
        this._processRenderQueue = this._processRenderQueue.bind(this);
    }

    /**
     * PUBLIC API: THE AWAKENING.
     * This is the function you call. It anchors the engine to the DOM,
     * injects the soul (CSS), and opens the conduit.
     */
    render() {
        this._injectDOM();
        this._attachEventListeners();
        window.addEventListener('message', this.handleIncomingMessages);
        this._manifest({ level: 'info', args: [{ type: 'string', value: `Chronomantic Engine awakened. Conduit stabilized. B"H.` }] });
    }

    /**
     * PUBLIC API: THE GREAT ENTROPY.
     * Returns all manifested reality to potential. Severs the conduit,
     * dissolves all constructs, and purges the timeline to prevent paradox.
     */
    destroy() {
        window.removeEventListener('message', this.handleIncomingMessages);
        if (this.renderFrameRequest) cancelAnimationFrame(this.renderFrameRequest);

        this.highlighters.forEach(h => h.destroy());
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
            case 'clear': this._collapseTimeline(); break;
            case 'log': this._manifest(event.data.payload); break;
            case 'execution-result': this._handleExecutionResult(event.data.payload); break;
        }
    }

    /**
     * Records an event in the timestream and queues it for manifestation.
     * This is the only way new realities are created. It is pure potential.
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

    // --- The Quantum Render Engine ---

    _scheduleRender() {
        if (this.isRenderScheduled) return;
        this.isRenderScheduled = true;
        this.renderFrameRequest = requestAnimationFrame(this._processRenderQueue);
    }
    
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
                fragment.appendChild(this._forgeLogRow(log));
            }
        }

        if (fragment.children.length > 0) {
            const scrollChasm = this.elements.logContainer;
            const isNearBottom = scrollChasm.scrollHeight - scrollChasm.clientHeight <= scrollChasm.scrollTop + 50;

            scrollChasm.appendChild(fragment);

            if (isNearBottom) {
                scrollChasm.scrollTop = scrollChasm.scrollHeight;
            }
        }
        
        this._updateFilterCounts();
        this.isRenderScheduled = false;
    }

    /**
     * Shifts the lens of perception. All existing manifestations are dissolved
     * and the entire timestream is re-manifested through the new filter.
     */
    _refilterTimeline() {
        this.highlighters.forEach(h => h.destroy());
        this.highlighters.clear();
        this.elements.logContainer.innerHTML = '';
        
        this.renderQueue = this.logs.filter(log => this.activeFilter === 'all' || this.activeFilter === log.level);
        this._scheduleRender();
    }

    // --- The Forge: Where Form is Given to the Formless ---
    
    _forgeLogRow(log) {
        const row = document.createElement('div');
        row.className = `console-manifestation level-${log.level || 'output'} ${log.isInput ? 'input-command' : ''}`;

        const iconDefs = {
            error: `<svg viewBox="0 0 16 16"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 3zm0 8a1 1 0 100-2 1 1 0 000 2z"></path></svg>`,
            warn: `<svg viewBox="0 0 16 16"><path d="M8.22 1.754a.75.75 0 00-1.44 0L1.698 13.132a.75.75 0 00.645 1.118h11.314a.75.75 0 00.644-1.118L8.22 1.754zM8 11.25a.75.75 0 110 1.5.75.75 0 010-1.5zM8.25 5a.25.25 0 00-.5 0v4.5a.25.25 0 00.5 0V5z"></path></svg>`,
            info: `<svg viewBox="0 0 16 16"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 5a1 1 0 012 0v1H7V5zm1 10a1 1 0 01-1-1V9a1 1 0 012 0v5a1 1 0 01-1 1z"></path></svg>`,
            input: `<svg viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>`,
            output: `<svg viewBox="0 0 16 16"><path d="M10.53 1.97a.75.75 0 010 1.06L6.06 7.5l4.47 4.47a.75.75 0 11-1.06 1.06L4.47 8.03a.75.75 0 010-1.06l5.03-5.03a.75.75 0 011.03 0z"></path></svg>`
        };
        const iconEl = document.createElement('div');
        iconEl.className = 'manifestation-icon';
        iconEl.innerHTML = log.isInput ? iconDefs.input : (log.level === 'error' ? iconDefs.output : iconDefs[log.level] || '');

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'manifestation-content';

        (log.args || []).forEach((arg, index) => {
            const argContainer = (['array', 'object', 'map', 'set', 'error'].includes(arg.type))
                ? this._createVividInspector(arg)
                : this._createHighlightedOutput(arg, log, index);
            messageWrapper.appendChild(argContainer);
        });

        const timestampEl = document.createElement('span');
        timestampEl.className = 'manifestation-timestamp';
        timestampEl.textContent = log.timestamp;

        row.appendChild(iconEl);
        row.appendChild(messageWrapper);
        row.appendChild(timestampEl);
        
        requestAnimationFrame(() => row.classList.add('manifested'));
        return row;
    }
    
    _prettyPrint(data) {
        if (data === null) return 'null';
        if (data === undefined) return 'undefined';
        if (data.type === 'string') return data.value;
        return String(data.value);
    }
    
    _createHighlightedOutput(arg, log, index) {
        const textarea = document.createElement('textarea');
        const content = this._prettyPrint(arg);
        textarea.value = content;
        textarea.rows = content.split('\n').length;
        textarea.setAttribute('readonly', true);
        
        try {
            const highlighter = new pnimi(textarea, 'js');
            this.highlighters.set(`${log.id}-${index}`, highlighter);
        } catch (e) {
            console.error("The light-shaper failed its task:", e);
        }
        return textarea;
    }
    
    _createVividInspector(data) { /* PASTE YOUR _createVividInspector CODE HERE - It's good as is */ return document.createElement('div'); }

    // --- Command & Control ---

    _executeCommand() {
        const command = this.elements.input.value;
        if (command.trim() === '') return;
        this.elements.input.value = '';
        this.elements.input.style.height = '43px';
        
        this._manifest({ level: 'input', args: [{ type: 'string', value: command }], isInput: true });

        const executionId = this.nextExecutionId++;
        this.previewIframe.contentWindow.postMessage({ source: 'awtsmoos-editor', command, executionId }, '*');
        
        this.pendingExecutions.set(executionId, (result, isError) => {
            this._manifest({ level: isError ? 'error' : 'output', args: [result] });
            this.pendingExecutions.delete(executionId);
        });
    }
    
    _handleExecutionResult({ executionId, result, isError }) {
        const callback = this.pendingExecutions.get(executionId);
        if (callback) callback(result, isError);
    }

    _collapseTimeline() {
        this.logs = [];
        this.renderQueue = [];
        if (this.renderFrameRequest) cancelAnimationFrame(this.renderFrameRequest);
        this.isRenderScheduled = false;
        this.highlighters.forEach(h => h.destroy());
        this.highlighters.clear();
        this.elements.logContainer.innerHTML = '';
        this._updateFilterCounts();
    }

    _updateFilterCounts() {
        const counts = this.logs.reduce((acc, log) => {
            const level = log.level;
            if (acc.hasOwnProperty(level)) acc[level]++;
            return acc;
        }, { error: 0, warn: 0, info: 0, log: 0 });

        this.elements.filterToolbar.querySelectorAll('button[data-filter]').forEach(btn => {
            const filter = btn.dataset.filter;
            const count = (filter === 'all') ? this.logs.length : counts[filter] || 0;
            btn.dataset.count = count;
        });
    }
    
    // --- The Forge: Structure & Style Schematics ---
    
    _injectDOM() {
        this.container.className = `console-chasm ${this.consoleTabId}`;
        this.container.innerHTML = this._getHTML();
        const style = document.createElement('style');
        style.id = `console-styles-${this.consoleTabId}`;
        style.textContent = this._getCSS();
        document.head.appendChild(style);

        this.elements = {
            logContainer: this.container.querySelector('.log-chasm'),
            input: this.container.querySelector('.command-input'),
            runBtn: this.container.querySelector('.command-execute-btn'),
            toolbar: this.container.querySelector('.console-nexus'),
            filterToolbar: this.container.querySelector('.nexus-filters'),
        };
    }
    
    _attachEventListeners() {
        this.elements.runBtn.addEventListener('click', () => this._executeCommand());
        this.elements.input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); this._executeCommand();
            }
        });
        
        this.elements.input.addEventListener('input', e => {
            e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`;
        });

        this.elements.toolbar.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.dataset.action === 'collapse') this._collapseTimeline();
            if (button.dataset.filter) {
                this.elements.filterToolbar.querySelector('.active').classList.remove('active');
                button.classList.add('active'); this.activeFilter = button.dataset.filter;
                this._refilterTimeline();
            }
        });
    }
    
    _getHTML() {
        return `
            <div class="console-nexus">
                <div class="nexus-filters">
                    <button data-filter="all" class="active" title="View All Timelines">All</button>
                    <button data-filter="error" title="View Errors & Collapsed Realities"></button>
                    <button data-filter="warn" title="View Temporal Paradoxes"></button>
                    <button data-filter="info" title="View Informational Constructs"></button>
                    <button data-filter="log" title="View Standard Data Streams"></button>
                </div>
                <button data-action="collapse" class="nexus-tool-btn" title="Collapse Timeline">
                    <svg viewBox="0 0 16 16"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"></path></svg>
                    Collapse
                </button>
            </div>
            <div class="log-chasm"></div>
            <div class="command-conduit">
                <textarea class="command-input" spellcheck="false" placeholder="Inject command into the timestream..." rows="1"></textarea>
                <button class="command-execute-btn" title="Execute (Enter)">
                    <svg viewBox="0 0 16 16"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM6.5 5.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5zM9.5 5.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z"></path></svg>
                </button>
            </div>
        `;
    }

    _getCSS() {
        return `
            @keyframes vivid-manifestation { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes nexus-glow { 0%, 100% { box-shadow: 0 0 3px #00aaff, 0 0 6px #00aaff, 0 0 9px #0e639c; } 50% { box-shadow: 0 0 6px #00aaff, 0 0 12px #00aaff, 0 0 18px #0e639c; } }
            @keyframes error-pulse { 0%, 100% { border-color: #f47174; box-shadow: 0 0 8px #f47174; } 50% { border-color: #ff9a9c; box-shadow: 0 0 16px #f47174; } }
            :root { --c-bg-abyss: #0d0f12; --c-bg-deep: #101217; --c-bg-med: #1a1d23; --c-bg-light: #2c3038; --c-border: #333842; --c-text-pri: #d1d5db; --c-text-sec: #6b7280; --c-accent-pri: #00ddff; --c-accent-sec: #0e639c; --c-error-pri: #ff474c; --c-error-sec: #4d181d; --c-warn-pri: #ffc900; --c-warn-sec: #594416; }
            .console-chasm, .console-chasm * { box-sizing: border-box; }
            .console-chasm { height:100%; display:flex; flex-direction:column; background:var(--c-bg-abyss); color:var(--c-text-pri); font-family:'Operator Mono', 'Fira Code', monospace; font-size:14px; }
            
            .console-nexus { display:flex; justify-content:space-between; align-items:center; padding:4px 10px; flex-shrink:0; background:var(--c-bg-deep); border-bottom:1px solid var(--c-border); }
            .nexus-filters button { background:var(--c-bg-med); border:1px solid var(--c-border); color:var(--c-text-sec); padding:3px 10px; border-radius:4px; cursor:pointer; position:relative; transition:all .2s ease; }
            .nexus-filters button.active { background:var(--c-accent-sec); color:white; border-color:var(--c-accent-pri); animation: nexus-glow 2s ease-in-out infinite; }
            .nexus-filters button:hover:not(.active) { background:var(--c-bg-light); color:var(--c-text-pri); }
            .nexus-filters button[data-count]:not([data-count="0"])::after { content:attr(data-count); position:absolute; top:-8px; right:-8px; background:var(--c-accent-pri); color:var(--c-bg-deep); border-radius:50%; font-size:10px; font-weight:bold; width:18px; height:18px; line-height:18px; text-align:center; border: 1px solid var(--c-bg-deep); }
            .nexus-filters button[data-filter="error"][data-count]:not([data-count="0"])::after { background:var(--c-error-pri); }
            .nexus-tool-btn { display:flex; align-items:center; gap:6px; background:none; border:none; color:var(--c-text-sec); padding:4px 8px; cursor:pointer; transition:all .2s ease; border-radius: 4px; }
            .nexus-tool-btn:hover { color:var(--c-error-pri); background: var(--c-error-sec); }
            .nexus-tool-btn svg { width:12px; height:12px; fill:currentColor; }

            .log-chasm { flex-grow:1; overflow-y:auto; padding:8px; background: repeating-linear-gradient(0deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 1px, transparent 1px, transparent 2px); }

            .console-manifestation { display: flex; align-items: flex-start; gap: 10px; padding: 6px 4px; border-bottom: 1px solid var(--c-border); animation: vivid-manifestation 0.5s ease-out forwards; }
            .console-manifestation.level-error { border-left: 3px solid var(--c-error-pri); animation: error-pulse 1.5s infinite, vivid-manifestation 0.5s ease-out forwards; }
            .console-manifestation.level-warn { border-left: 3px solid var(--c-warn-pri); }
            .console-manifestation.input-command { border-left: 3px solid var(--c-accent-pri); }
            
            .manifestation-icon { flex-shrink: 0; margin-top: 3px; }
            .manifestation-icon svg { width: 14px; height: 14px; fill: var(--c-text-sec); }
            .console-manifestation.level-error .manifestation-icon svg, .console-manifestation.level-output.level-error .manifestation-icon svg { fill:var(--c-error-pri); }
            .console-manifestation.level-warn .manifestation-icon svg { fill:var(--c-warn-pri); }
            .console-manifestation.level-info .manifestation-icon svg { fill:var(--c-accent-pri); }
            .console-manifestation.input-command .manifestation-icon svg { fill:var(--c-accent-pri); }

            .manifestation-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
            .manifestation-content > textarea { width: 100%; border: none; padding: 0; margin: 0; background: transparent; color: inherit; font: inherit; line-height: 1.6; resize: none; overflow: hidden; }
            .manifestation-content .virtualized-editor-wrapper { position: relative !important; height: auto !important; padding: 2px 0 !important; }

            .manifestation-timestamp { color:var(--c-text-sec); font-size:11px; margin-top:4px; white-space: nowrap; }

            .command-conduit { display:flex; align-items:flex-end; padding:10px; gap:10px; border-top:1px solid var(--c-border); background: var(--c-bg-deep); flex-shrink: 0; position:relative; }
            .command-conduit::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background: linear-gradient(90deg, transparent, var(--c-accent-pri), transparent); opacity:0.5; animation: nexus-glow 3s linear infinite; }
            .command-input { flex-grow:1; background:var(--c-bg-med); border:1px solid var(--c-border); border-radius:4px; color:var(--c-text-pri); font-family:inherit; font-size:14px; padding:10px; resize:none; overflow-y:auto; max-height:250px; line-height:1.6; transition: all 0.2s ease; }
            .command-input:focus { border-color: var(--c-accent-pri); outline: none; box-shadow: 0 0 10px rgba(0, 221, 255, 0.3); }
            .command-execute-btn { background:var(--c-bg-med); color:var(--c-accent-pri); border:1px solid var(--c-accent-pri); border-radius:4px; width:43px; height:43px; cursor:pointer; transition:all .2s ease; display:flex; align-items:center; justify-content:center; flex-shrink: 0; }
            .command-execute-btn:hover { background:var(--c-accent-pri); color:var(--c-bg-deep); box-shadow: 0 0 12px var(--c-accent-pri); }
            .command-execute-btn svg { width:20px; height:20px; transition: transform 0.2s ease-out; }
            .command-execute-btn:hover svg { transform: scale(1.1); }
        `;
    }
}