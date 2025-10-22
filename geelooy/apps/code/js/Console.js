// B"H
// FILE: js/Console.js
// FINAL "VIVID EXTREME" VERSION - NO PLACEHOLDERS

import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export class Console {
	constructor(previewIframe, containerElement, consoleTabId) {
		this.previewIframe = previewIframe;
		this.container = containerElement;
		this.consoleTabId = consoleTabId;
		this.logs = [];
		this.activeFilter = 'all';
		this.elements = {};
		this.inputHighlighter = null;
		this.outputHighlighters = new Map();
		this.messageHandler = this.handleIncomingMessages.bind(this);
		this.nextExecutionId = 0;
		this.pendingExecutions = new Map();
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
		if (this.elements.input) {
			this.elements.input.removeEventListener('scroll', this._syncScroll);
			this.elements.input.removeEventListener('input', this._updateLineNumbers);
		}
		if (this.inputHighlighter) this.inputHighlighter.destroy();
		this.outputHighlighters.forEach(h => h.destroy());
		this.outputHighlighters.clear();
		const styleEl = document.head.querySelector(`#console-styles-${this.consoleTabId}`);
		if (styleEl) styleEl.remove();
		this.container.innerHTML = '';
	}

	handleIncomingMessages(event) {
		if (event.source !== this.previewIframe.contentWindow || !event.data || event.data.source !== 'html-preview-console') return;
		switch (event.data.type) {
			case 'clear':
				this._clearLogs();
				break;
			case 'log':
				this.logs.push(event.data.payload);
				if (this.activeFilter === 'all' || this.activeFilter === event.data.payload.level) {
					this._renderLogMessage(event.data.payload);
				}
				this._updateFilterCounts();
				break;
			case 'execution-result':
				this.handleExecutionResult(event.data.payload);
				break;
			case 'status':
				if (event.data.payload.status === 'ready') {
					const readyMessage = {
						level: 'info',
						args: [{
							type: 'string',
							value: `Console connected to preview. B"H!`
						}],
						timestamp: new Date().toLocaleTimeString([], {
							hour12: false,
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit'
						})
					};
					this.logs.push(readyMessage);
					this._renderLogMessage(readyMessage);
					this._updateFilterCounts();
				}
				break;
		}
	}

	handleExecutionResult({
		executionId,
		result,
		isError
	}) {
		const callback = this.pendingExecutions.get(executionId);
		if (callback) callback(result, isError);
		this.pendingExecutions.delete(executionId);
	}

	_prettyPrint(data) {
		return data.type === 'string' ? `"${data.value}"` : `${data.value}`;
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
			if (log.level === 'error' || log.level === 'warn' || log.level === 'info' || log.level === 'log') {
				acc[log.level] = (acc[log.level] || 0) + 1;
			}
			return acc;
		}, {
			error: 0,
			warn: 0,
			info: 0,
			log: 0
		});
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
		else if (data.type === 'array') previewContent = `${data.constructorName}(${data.length}) <span class="token-meta">[${data.value.slice(0, 5).map(v => v.type === 'string' ? `"${v.value}"` : (v.value || '...')).join(', ')}${data.length > 5 ? ', ...': ''}]</span>`;
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
						valEl.innerHTML = `<span class="token token-${value.type}">${this._prettyPrint(value)}</span>`
					}
					propertyList.appendChild(keyEl);
					propertyList.appendChild(valEl);
				}
				if (data.type === 'array') data.value.forEach((v, i) => renderProp(i, v, 'token-number'));
				else if (data.properties) data.properties.forEach(p => renderProp(p.key, p.value));
				if (data.prototype && data.prototype.type !== 'null') {
					propertyList.appendChild(this._createVividInspector(data.prototype, true));
				}
				details.appendChild(propertyList);
			}
		}, {
			once: true
		});
		return details;
	}

	// B"H
// FILE: js/Console.js
// ACTION: Replace this entire method.

_renderLogMessage(log) {
    const { level, args, timestamp, isInput = false, isError = false } = log;
    const row = document.createElement('div');
    row.className = `console-row level-${level} ${isInput ? 'input-row' : ''} ${isError ? 'level-error' : ''}`;
    const iconDefs = {
        error: `<svg viewBox="0 0 16 16"><path d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"></path></svg>`,
        warn: `<svg viewBox="0 0 16 16"><path d="M8.22 1.754a.75.75 0 00-1.44 0L1.698 13.132a.75.75 0 00.645 1.118h11.314a.75.75 0 00.644-1.118L8.22 1.754zM8 11.25a.75.75 0 110 1.5.75.75 0 010-1.5zM8.25 5a.25.25 0 00-.5 0v4.5a.25.25 0 00.5 0V5z"></path></svg>`,
        info: `<svg viewBox="0 0 16 16"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 5a1 1 0 012 0v1H7V5zm1 10a1 1 0 01-1-1V9a1 1 0 012 0v5a1 1 0 01-1 1z"></path></svg>`,
        input: `<svg viewBox="0 0 16 16"><path d="M5.47 13.53a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06L6.53 1.97a.75.75 0 10-1.06 1.06l4.72 4.72-4.72 4.72a.75.75 0 000 1.06z"></path></svg>`,
        output: `<svg viewBox="0 0 16 16"><path d="M10.53 1.97a.75.75 0 010 1.06L6.06 7.5l4.47 4.47a.75.75 0 11-1.06 1.06L4.47 8.03a.75.75 0 010-1.06l5.03-5.03a.75.75 0 011.03 0z"></path></svg>`
    };
    const iconEl = document.createElement('div');
    iconEl.className = 'console-icon';
    iconEl.innerHTML = isInput ? iconDefs.input : isError ? iconDefs.output : iconDefs[level] || '';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'console-content';
    
    const timestampEl = document.createElement('span');
    timestampEl.className = 'console-timestamp';
    timestampEl.textContent = timestamp || '';

    row.appendChild(iconEl);
    row.appendChild(contentContainer);
    row.appendChild(timestampEl);
    
    this.elements.logContainer.appendChild(row);

    args.forEach(arg => {
        if (['array', 'object', 'map', 'set', 'error'].includes(arg.type)) {
            contentContainer.appendChild(this._createVividInspector(arg));
        } else {
            // STEP 1: Create the textarea and set its value.
            const textarea = document.createElement('textarea');
           // textarea.setAttribute('readonly', true);
            textarea.value = this._prettyPrint(arg);
            
            // STEP 2: Add the textarea directly to the page.
            contentContainer.appendChild(textarea);
            
            // STEP 3: Call `new pnimi` on the textarea after it's on the page.
            // We use a timeout to ensure the browser has rendered it first.
            setTimeout(() => {
                const highlighter = new pnimi(textarea, 'js');
                // Store the instance only for later cleanup. Do not touch it otherwise.
                this.outputHighlighters.set(textarea, highlighter); 
            }, 0);
        }
    });
    
    

    
    row.scrollIntoView({ behavior: 'smooth', block: 'end' });


}

	_executeCommand() {
		const command = this.elements.input.value;
		if (command.trim() === '') return;
		this.inputHighlighter.update(''); // Use the new reliable update method
		this._updateLineNumbers();
		const executionLog = {
			level: 'input',
			isInput: true,
			args: [{
				type: 'string',
				value: command
			}],
			timestamp: new Date().toLocaleTimeString([], {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			})
		};
		this.logs.push(executionLog);
		this._renderLogMessage(executionLog);
		const executionId = this.nextExecutionId++;
		new Promise((resolve) => {
			this.pendingExecutions.set(executionId, resolve);
			this.previewIframe.contentWindow.postMessage({
				source: 'awtsmoos-editor',
				command: command,
				executionId: executionId
			}, '*');
		}).then((result, isError) => {
			const resultLog = {
				level: isError ? 'error' : 'output',
				isError,
				args: [result],
				timestamp: new Date().toLocaleTimeString([], {
					hour12: false,
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				})
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
		this.elements.lineNumbers.innerHTML = Array.from({
			length: lineCount
		}, (_, i) => `<div>${i + 1}</div>`).join('');
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
			if (button && button.dataset.filter) {
				this.elements.filterToolbar.querySelector('.active').classList.remove('active');
				button.classList.add('active');
				this.activeFilter = button.dataset.filter;
				this._renderFilteredLogs();
			}
		});
		this.elements.input.addEventListener('scroll', this._syncScroll);
		this.elements.input.addEventListener('input', this._updateLineNumbers);
	}

	injectContent() {
		this.container.innerHTML = `<div id="console-toolbar-${this.consoleTabId}" class="console-toolbar"><div class="console-filters"><button data-filter="all" class="active" title="Show All">All</button><button data-filter="error" data-count="0" title="Errors"></button><button data-filter="warn" data-count="0" title="Warnings"></button><button data-filter="info" data-count="0" title="Info"></button><button data-filter="log" data-count="0" title="Logs"></button></div><button id="console-clear-btn-${this.consoleTabId}" class="console-tool-btn" title="Clear Console"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 101.06 1.06L8 9.06l1.72 1.72a.75.75 0 101.06-1.06L9.06 8l1.72-1.72a.75.75 0 00-1.06-1.06L8 6.94 6.28 5.22z"></path><path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0z"></path></svg> Clear</button></div><div id="log-container-${this.consoleTabId}" class="log-container"></div><div id="input-area-${this.consoleTabId}" class="input-area"><div class="line-numbered-input"><div id="console-line-numbers-${this.consoleTabId}" class="line-numbers-gutter"></div><textarea id="console-input-${this.consoleTabId}" spellcheck="false" placeholder="Run JavaScript..."></textarea></div><button id="console-run-btn-${this.consoleTabId}" class="console-run-btn" title="Run (Enter)"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 16A8 8 0 108 0a8 8 0 000 16zM6 4.5v7l5-3.5-5-3.5z"></path></svg></button></div>`;
		const style = document.createElement('style');
		style.id = `console-styles-${this.consoleTabId}`;
		style.textContent = `
            :root { --c-bg-deep:#121212; --c-bg-med:#1e1e1e; --c-bg-light:#2a2a2a; --c-border:#383838; --c-text-pri:#e0e0e0; --c-text-sec:#888; --c-accent-pri:#00aaff; --c-accent-sec:#0e639c; --c-error-pri:#f47174; --c-error-sec:#4d181d; --c-warn-pri:#f7b731; --c-warn-sec:#594416; --c-string:#ce9178; --c-number:#b5cea8; --c-key:#4fc1ff; }
            #console-host * { box-sizing:border-box; }
            #console-host { height:100%; display:flex; flex-direction:column; background:var(--c-bg-med); color:var(--c-text-pri); font-family:'Fira Code', Menlo, monospace; font-size:13px; }
            .console-toolbar { display:flex; justify-content:space-between; align-items:center; padding:2px 8px; flex-shrink:0; background:var(--c-bg-deep); border-bottom:1px solid var(--c-border); }
            .console-filters { display:flex; gap:4px; }
            .console-filters button { background:var(--c-bg-light); border:1px solid var(--c-border); color:var(--c-text-sec); padding:2px 8px; border-radius:4px; cursor:pointer; position:relative; transition:all .2s ease; }
            .console-filters button.active, .console-filters button:hover { background:var(--c-accent-sec); color:white; border-color:var(--c-accent-pri); }
            .console-filters button[data-count]:not([data-count="0"])::after { content:attr(data-count); position:absolute; top:-5px; right:-5px; background:var(--c-accent-pri); color:white; border-radius:50%; font-size:9px; width:14px; height:14px; line-height:14px; text-align:center; }
            .console-filters button[data-filter="error"][data-count]:not([data-count="0"])::after { background:var(--c-error-pri); }
            .console-tool-btn { display:flex; align-items:center; gap:4px; background:none; border:none; color:var(--c-text-sec); padding:4px 8px; cursor:pointer; transition:color .2s ease; }
            .console-tool-btn:hover { color:var(--c-text-pri); }
            .console-tool-btn svg { width:14px; height:14px; fill:currentColor; }
            .log-container { flex-grow:1; overflow-y:auto; padding:5px; }
            .input-area { display:flex; align-items:flex-end; gap:8px; background:var(--c-bg-deep); border-top:1px solid var(--c-border); padding:8px; flex-shrink:0; }
            .line-numbered-input { position:relative; flex-grow:1; border:1px solid var(--c-border); border-radius:4px; background:var(--c-bg-med); overflow:hidden; display:flex; }
            .line-numbers-gutter { background:var(--c-bg-light); color:var(--c-text-sec); padding:8px 4px 8px 12px; font-size:12px; line-height:1.5; text-align:right; user-select:none; }
            .line-numbers-gutter div { min-width:2ch; }
            .line-numbered-input textarea { flex-grow:1;  border:none; outline:none;  caret-color:var(--c-accent-pri); line-height:1.5; padding:8px; margin:0; max-height:200px; width:100%; }
            .line-numbered-input > div:not(.line-numbers-gutter) { line-height:1.5 !important; padding:8px !important; margin:0 !important; width:100%; }
            .console-run-btn { background:var(--c-accent-pri); color:white; border:none; border-radius:4px; padding:6px; cursor:pointer; transition:background .2s ease; display:flex; align-items:center; justify-content:center; }
            .console-run-btn:hover { background:#33baff; }
            .console-run-btn svg { width:16px; height:16px; }
            .console-row { display:grid; grid-template-columns:20px 1fr auto; align-items:start; gap:8px; padding:4px; border-bottom:1px solid var(--c-border); }
            .console-row:hover { background:var(--c-bg-light); }
            .console-row.level-error { background:var(--c-error-sec); border-left:2px solid var(--c-error-pri); padding-left:2px;}
            .console-row.level-warn { background:var(--c-warn-sec); border-left:2px solid var(--c-warn-pri); padding-left:2px; }
            .console-icon { margin-top:1px; }
            .console-icon svg { width:14px; height:14px; fill:var(--c-text-sec); }
            .console-row.level-error .console-icon svg, .console-row.level-output.level-error .console-icon svg { fill:var(--c-error-pri); }
            .console-row.level-warn .console-icon svg { fill:var(--c-warn-pri); }
            .console-row.level-info .console-icon svg { fill:var(--c-accent-pri); }
            .console-content { word-break:break-all; min-width:0; }
            .console-timestamp { color:var(--c-text-sec); font-size:11px; margin-top:2px;}
            .highlighted-output { position:relative; width:100%; }
            .highlighted-output .virtualized-editor-wrapper { width:100% !important; height:auto !important; padding:0 !important; margin:0 !important; border:none !important; position:relative !important; }
            .highlighted-output textarea { color:var(--c-text-pri);  border:none; overflow:hidden; resize:none; white-space:pre; padding:0; margin:0; width:100%; }
            .vivid-inspector { display:block; }
            .vivid-inspector summary { cursor:pointer; user-select:none; list-style:none; display:flex; align-items:center; }
            .vivid-inspector summary::before { content:'▶'; color:var(--c-text-sec); display:inline-block; width:1.5em; flex-shrink:0; transition:transform .1s ease; }
            .vivid-inspector[open] > summary::before { transform:rotate(90deg); }
            .vivid-inspector[open] > summary { color:var(--c-text-pri); }
            .property-list { padding-left:1em; border-left:1px solid var(--c-border); margin-left:.75em; display:grid; grid-template-columns:auto 1fr; align-items:start; gap:2px 8px; }
            .prototype-inspector { border-top:1px dashed var(--c-border); padding-top:4px; margin-top:4px; grid-column:1 / -1; }
            .token-key { text-align:right; color:var(--c-key); opacity:.9; }
            .token-string { color:var(--c-string); }
            .token-number { color:var(--c-number); }
            .token-error { color:var(--c-error-pri); }
            .token-meta { color:var(--c-text-sec); font-style:italic; }
        `;
		document.head.appendChild(style);
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