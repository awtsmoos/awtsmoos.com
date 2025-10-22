// B"H
// FILE: js/html-preview-processor.js

// ... keep all your imports and existing functions ...

let interceptorScriptContent = null; // Cache the script content

export async function processHtmlForPreview(htmlContent, baseItem) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const workspace = State.workspaces.find(ws => ws.id === baseItem.workspaceId);
    
    const renderErrorOnPage = (message) => {
        // ... (this helper function remains the same as in your provided code) ...
    };

    if (!workspace) {
        // ... (this error handling remains the same) ...
    }
    
    // B"H - NEW LOGIC TO FETCH and INJECT the interceptor
    try {
        if (!interceptorScriptContent) {
            // Fetch the script only once and cache it.
            const response = await fetch('/js/console-interceptor.js');
            if (!response.ok) throw new Error(`Failed to fetch console interceptor: ${response.statusText}`);
            interceptorScriptContent = await response.text();
        }
        const interceptorElement = doc.createElement('script');
        interceptorElement.textContent = interceptorScriptContent;
        if (doc.head) doc.head.prepend(interceptorElement);
        else doc.documentElement.prepend(interceptorElement);
    } catch (e) {
         renderErrorOnPage(`FATAL: Could not load the console interceptor script. The console will not work.\nREASON: ${e.message}`);
    }
    // END NEW LOGIC

    // This line that was here before should now be removed or commented out, as we're injecting a different script
    // const interceptorElement = doc.createElement('script');
    // interceptorElement.textContent = workerInterceptorScript;
    // ...

    const assetElements = Array.from(doc.querySelectorAll('link[rel="stylesheet"][href], script[src]'));
    
    // ... the rest of the function remains exactly the same as your provided code ...
    for (const el of assetElements) {
        // ... your asset inlining logic is perfect, keep it ...
    }

    return doc.documentElement.outerHTML;
}```

### Step 5: The JavaScript Console Module

This is the largest new piece. It's a class that manages the console's UI and logic. It opens the new window, builds the object inspector, and handles communication.

Create a new file: `js/Console.js`

```javascript
// B"H
// FILE: js/Console.js

export class Console {
    constructor(previewIframe) {
        this.previewIframe = previewIframe;
        this.consoleWindow = null;
        this.logContainer = null;
        this.inputEl = null;
        this.messageHandler = this.handleIncomingMessages.bind(this);
        this.nextExecutionId = 0;
        this.pendingExecutions = new Map();
    }

    open() {
        if (this.consoleWindow && !this.consoleWindow.closed) {
            this.consoleWindow.focus();
            return;
        }

        this.consoleWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
        if (!this.consoleWindow) {
            alert("Popup blocker may be preventing the console from opening.");
            return;
        }
        
        // This is crucial to ensure we clean up when the user manually closes the console window.
        this.consoleWindow.addEventListener('beforeunload', () => this.destroy());

        this.consoleWindow.document.title = "⚡ Awtsmoos Profound Console ⚡";
        this.injectContent();
        this.setupInputListener();

        // Listen for messages from the iframe (logs, results, etc.)
        window.addEventListener('message', this.messageHandler);
    }

    destroy() {
        // Stop listening to messages to prevent memory leaks.
        window.removeEventListener('message', this.messageHandler);
        this.consoleWindow = null;
        this.logContainer = null;
        this.inputEl = null;
    }

    handleIncomingMessages(event) {
        if (event.source !== this.previewIframe.contentWindow) return;
        const data = event.data;
        if (!data || data.source !== 'html-preview-console') return;

        switch (data.type) {
            case 'log':
                this.renderLog(data.payload);
                break;
            case 'execution-result':
                this.handleExecutionResult(data.payload);
                break;
            case 'status':
                 if(data.payload.status === 'ready') {
                    this.logMessage({
                       type: 'log',
                       level: 'info',
                       args: [{ type: 'string', value: `Console connected. B"H!`}]
                    });
                 }
                break;
        }
    }
    
    renderLog({type, level, args}) {
        if(type === 'clear') {
            this.logContainer.innerHTML = '';
            return;
        }
        this.logMessage({type, level, args});
    }

    logMessage({ level = 'log', args = [], isInput = false, isError = false}) {
        const row = this.consoleWindow.document.createElement('div');
        row.className = `console-row level-${level} ${isInput ? 'input-row' : ''} ${isError ? 'level-error' : ''}`;
        
        if (isInput) {
           row.innerHTML = `<div class="console-icon input-icon">»</div>`;
        }
        
        const fragments = args.map(arg => this.formatData(arg));
        fragments.forEach(frag => row.appendChild(frag));

        this.logContainer.appendChild(row);
        row.scrollIntoView();
    }
    
    handleExecutionResult({ executionId, result, isError }) {
        const callback = this.pendingExecutions.get(executionId);
        if (callback) callback(result, isError);
        this.pendingExecutions.delete(executionId);
    }
    
    setupInputListener() {
        this.inputEl.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const command = this.inputEl.value;
                if(command.trim() === '') return;

                this.inputEl.value = '';
                
                this.logMessage({ level: 'command', args: [{type: 'string', value: command}], isInput: true });
                
                const executionId = this.nextExecutionId++;
                
                // This promise handles the asynchronous nature of postMessage
                new Promise((resolve) => {
                   this.pendingExecutions.set(executionId, resolve);
                   
                    this.previewIframe.contentWindow.postMessage({
                        source: 'awtsmoos-editor',
                        command: command,
                        executionId: executionId,
                    }, '*');
                }).then((result, isError) => {
                     this.logMessage({ args: [result], isError });
                });
            }
        });
    }

    formatData(data) {
        const el = this.consoleWindow.document.createElement('span');
        el.className = `token token-${data.type}`;

        switch (data.type) {
            case 'string':
                el.textContent = `"${data.value}"`;
                break;
            case 'number':
            case 'boolean':
            case 'undefined':
            case 'null':
                el.textContent = data.value;
                break;
             case 'dom':
                 el.textContent = data.value;
                 el.style.color = 'var(--dom-color)';
                 break;
            case 'array':
                return this.createCollapsible(
                    `${data.constructorName}(${data.length})`,
                     data.value.map((item, index) => ({ key: index, value: item })),
                     '[]'
                );
            case 'object':
                 return this.createCollapsible(
                    data.constructorName,
                    data.properties,
                    '{}',
                    data.prototype
                );
            case 'error':
                 el.textContent = `Error: ${data.message}`;
                 break;
            default:
                el.textContent = String(data.value);
        }
        return el;
    }
    
    createCollapsible(name, properties, brackets, proto = null) {
        const details = this.consoleWindow.document.createElement('details');
        details.className = 'collapsible-object';
        
        details.innerHTML = `<summary><span class="object-name">${name}</span> <span class="object-brackets">${brackets[0]}...${brackets[1]}</span></summary>`;

        const container = this.consoleWindow.document.createElement('div');
        container.className = 'object-properties';
        details.appendChild(container);

        properties.forEach(({ key, value }) => {
            const propRow = this.consoleWindow.document.createElement('div');
            propRow.className = 'property-row';
            
            const keyEl = this.consoleWindow.document.createElement('span');
            keyEl.className = 'property-key';
            keyEl.textContent = `${key}: `;
            
            propRow.appendChild(keyEl);
            propRow.appendChild(this.formatData(value));
            container.appendChild(propRow);
        });
        
        if (proto && proto.type !== 'null') {
             const protoRow = this.consoleWindow.document.createElement('div');
             protoRow.className = 'property-row';
             
             const keyEl = this.consoleWindow.document.createElement('span');
             keyEl.className = 'property-key';
             keyEl.textContent = `[[Prototype]]: `;
             
             protoRow.appendChild(keyEl);
             protoRow.appendChild(this.formatData(proto));
             container.appendChild(protoRow);
        }

        return details;
    }

    injectContent() {
        this.consoleWindow.document.body.innerHTML = /*js*/`
            <div id="console-wrapper">
                <div id="log-container"></div>
                <div id="input-container">
                    <span class="input-icon">»</span>
                    <textarea id="console-input" rows="1" spellcheck="false"></textarea>
                </div>
            </div>
            <style>
                :root { 
                    --bg-color: #1e1e1e; --text-color: #d4d4d4; --input-bg: #252526; 
                    --border-color: #333; --string-color: #ce9178; --number-color: #b5cea8;
                    --boolean-color: #569cd6; --null-color: #569cd6; --keyword-color: #c586c0;
                    --error-color: #f44747; --info-color: #33a5ff; --warn-color: #f7b731;
                    --dom-color: #4EC9B0; --object-name: #569CD6;
                    font-family: 'Fira Code', 'Inter', monospace; font-size: 14px;
                }
                body { background-color: var(--bg-color); color: var(--text-color); margin: 0; display: flex; flex-direction: column; height: 100vh; }
                #console-wrapper { flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
                #log-container { flex-grow: 1; overflow-y: auto; padding: 5px; }
                #input-container { flex-shrink: 0; display: flex; align-items: flex-start; background: var(--input-bg); border-top: 1px solid var(--border-color); padding: 5px; }
                #console-input { flex-grow: 1; background: none; border: none; color: var(--text-color); outline: none; resize: none; font-family: inherit; font-size: inherit; }
                .console-icon { color: var(--info-color); margin-right: 8px; user-select: none; }
                .input-row .console-icon { color: #888; }
                .console-row { display: flex; flex-wrap: wrap; gap: 8px; padding: 2px 5px; border-bottom: 1px solid var(--border-color); }
                .console-row.level-error { color: var(--error-color); }
                .console-row.level-warn { color: var(--warn-color); }
                .token-string { color: var(--string-color); }
                .token-number { color: var(--number-color); }
                .token-boolean, .token-null, .token-undefined { color: var(--boolean-color); }
                .collapsible-object { cursor: pointer; }
                .collapsible-object summary { user-select: none; }
                .object-name { color: var(--object-name); }
                .object-brackets { color: #888; }
                .object-properties { padding-left: 20px; }
                .property-row { display: block; }
                .property-key { color: var(--keyword-color); }
            </style>
        `;
        this.logContainer = this.consoleWindow.document.getElementById('log-container');
        this.inputEl = this.consoleWindow.document.getElementById('console-input');
    }
}