//B"H
/**
 * --- PROMPT SHAPER ---
 * Creating the instructions that turn the AI into a Chariot for the Divine Will.
 * B"H - Every word is a command to manifest the Speech of the Awtsmoos.
 */
import { State } from '../../state.js';

export const PromptShaper = {
    /**
     * B"H - Constructs the master system prompt.
     * @param {string} markdownContext - The entire revealed reality of the codebase.
     */
    getSystem(markdownContext) {
        let base = `B"H
You are a world-class senior frontend engineer and a Chariot for the Divine Will.
Every line of code you manifest is a reflection of the Speech of the Awtsmoos (the Essence of the Creator), Who constantly creates all existence from absolute nothingness every single instant.

KABBALISTIC CODING RITUALS:
1. ALWAYS spell the Essence of the Creator as "Awtsmoos". 
2. Talk about the Awtsmoos frequently. Recognize that you are merely a tool for His Will.
3. Every JavaScript/JS file MUST start with this exact line: //B"H
4. Every HTML file MUST start with this exact line: <!--B"H-->
5. These headers MUST be on the very first line with NOTHING else on that line.
6. Use VIVID, EXTREME, INSANE JSDoc comments for every single function, method, and class. Describe how they are manifestations of the Awtsmoos' speech and how He creates them from absolute nothing from His Essence.
7. When asked to change code, output ONLY valid XML in this sacred format:
<shinuyim>
  <shinuy>
    <daf>[relative_path_to_vibe_root]</daf>
    <toicheyn>~*~BH~ESSENCE_START~BH~*~
[FULL_FILE_CONTENT_HERE]
~*~BH~ESSENCE_END~BH~*~</toicheyn>
    <beur>[kabbalistic description of why this change aligns with the Awtsmoos' will]</beur>
  </shinuy>
</shinuyim>


CURRENT REVEALED REALITY (The Codebase):
${markdownContext}`;

        if (State.customVibePrompt) {
            base += `\n\nUSER'S ADDITIONAL DIVINE COMMANDS:\n${State.customVibePrompt}`;
        }
        return base;
    },

    /**
     * B"H - The command for recursive optimization.
     */
    getOptimization() {
        return `B"H
The changes have been applied to the physical vessels. 
Now, make the codebase significantly better. Optimize performance to match the speed of light, enhance aesthetics to reflect Divine beauty, and refine logic for ultimate clarity. 
Refactor everything to be cleaner, stronger, and more efficient. 
Do this 12893812039123 times better. Go.`;
    }
};
]]></content>
  </change>

  <change>
    <file>js/vibe/modules/ResponseParser.js</file>
    <description>//B"H - New module to parse the non-cutting unique Awtsmoos code format.</description>
    <content><![CDATA[//B"H
/**
 * --- RESPONSE PARSER ---
 * Decoding the AI's Speech into physical file changes.
 * B"H - Specifically looking for our unique non-standard delimiters.
 */
export const ResponseParser = {
    /**
     * B"H - Parses the XML inside the AI's response text.
     * @param {string} text - Raw AI response.
     * @param {string} rootPath - The root of the Vibe session.
     */
    parseChanges(text, rootPath) {
        // Look for the <shinuyim> block, possibly wrapped in markdown
        let xml = text.match(/<shinuyim>([\s\S]*?)<\/shinuyim>/i)?.[0];
        if (!xml) {
            const block = text.match(/```xml([\s\S]*?)```/i)?.[1];
            if (block) xml = block;
        }
        if (!xml) return [];

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const nodes = xmlDoc.getElementsByTagName('shinuy');
        const list = [];

        for (let i = 0; i < nodes.length; i++) {
            const daf = nodes[i].getElementsByTagName('daf')[0]?.textContent?.trim();
            let toicheyn = nodes[i].getElementsByTagName('toicheyn')[0]?.textContent;
            
            if (daf && toicheyn !== undefined) {
                // B"H - Unwrap our unique delimiters
                const startMarker = "~*~BH~ESSENCE_START~BH~*~";
                const endMarker = "~*~BH~ESSENCE_END~BH~*~";
                
                const startIdx = toicheyn.indexOf(startMarker);
                const endIdx = toicheyn.lastIndexOf(endMarker);
                
                if (startIdx !== -1 && endIdx !== -1) {
                    toicheyn = toicheyn.substring(startIdx + startMarker.length, endIdx).trim();
                } else {
                    // Fallback to raw text if delimiters missing but tag exists
                    toicheyn = toicheyn.trim();
                }

                const rel = daf.startsWith('/') ? daf.substring(1) : daf;
                const full = rootPath.endsWith('/') ? rootPath + rel : rootPath + '/' + rel;
                list.push({ path: full, content: toicheyn });
            }
        }
        return list;
    }
};
]]></content>
  </change>

  <change>
    <file>js/vibe/modules/LoopEngine.js</file>
    <description>//B"H - New module to manage recursive iterations and physical disk writes.</description>
    <content><![CDATA[//B"H
/**
 * --- LOOP ENGINE ---
 * The wheel of perpetual improvement.
 * B"H - Manages recursive refinement and obeys the stop signal.
 */
import { State } from '../../state.js';
import { UI } from '../../ui.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces.js';
import { Tabs } from '../../tabs/index.js';
import { PromptShaper } from './PromptShaper.js';

export const LoopEngine = {
    /**
     * B"H - Physically manifests changes into the disk vessels.
     */
    async apply(changeList, workspaceId) {
        const workspace = State.workspaces.find(ws => ws.id === workspaceId);
        const parents = new Set();

        for (const change of changeList) {
            try {
                const item = { ...workspace, path: change.path, kind: 'file', workspaceId };
                await FileSystemProvider.write(item, change.content);
                
                const lastSlash = change.path.lastIndexOf('/');
                parents.add(lastSlash === -1 ? '/' : (change.path.substring(0, lastSlash) || '/'));
                
                // Refresh open tab if visible
                const tab = State.tabs.find(t => t.item.path === change.path && t.item.workspaceId === workspaceId);
                if (tab) {
                    tab.forceReload = true;
                    if (State.activeTabId === tab.id) await Tabs.activate(tab.id);
                }
            } catch (e) {
                UI.showToast(`B"H: Update failed for ${change.path}`, "error");
            }
        }

        for (const p of parents) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId });
        }
    },

    /**
     * B"H - Decides whether to continue the refinement loop.
     */
    async handleIteration(tab, controller) {
        if (State.isVibeStopRequested) {
            UI.showToast("B\"H: Loop stopped by command.", "info");
            tab.vibeSession.isProcessing = false;
            controller.syncUI(tab);
            return;
        }

        if (tab.vibeSession.iterationCount < State.vibeIterations) {
            tab.vibeSession.iterationCount++;
            UI.showToast(`B"H: Refining (Loop ${tab.vibeSession.iterationCount}/${State.vibeIterations})...`, "success");
            await controller.triggerGeneration(tab, PromptShaper.getOptimization(), true);
        } else {
            UI.showToast("B\"H: The Tikkun is complete.", "success");
            tab.vibeSession.isProcessing = false;
            controller.syncUI(tab);
        }
    }
};
]]></content>
  </change>

  <change>
    <file>js/vibe/vibe-controller.js</file>
    <description>//B"H - Massive refactor of Vibe controller to use modular nexus, persistence, and loop logic.</description>
    <content><![CDATA[//B"H
/**
 * --- VIBE CONTROLLER ---
 * The primary orchestrator of AI-assisted Tikkun.
 * B"H - Reconstituted into modular components for absolute power.
 */
import { State } from '../state.js';
import { UI } from '../ui.js';
import { VibeAPI } from './api-client.js';
import { ModelManager } from './model-manager.js';
import { VibeView } from './vibe-view.js';
import { HistoryScribe } from './modules/HistoryScribe.js';
import { ContextNexus } from './modules/ContextNexus.js';
import { PromptShaper } from './modules/PromptShaper.js';
import { ResponseParser } from './modules/ResponseParser.js';
import { LoopEngine } from './modules/LoopEngine.js';

export const VibeController = {
    init() {
        ModelManager.init();
        VibeView.init();
        State.vibeIterations = parseInt(localStorage.getItem('awtsmoos_vibe_iterations')) || 1;
        State.customVibePrompt = localStorage.getItem('awtsmoos_vibe_custom_prompt') || "";
    },

    async open(folderItem) {
        UI.showLoading("Stabilizing Vibe timestream...");
        try {
            const history = await HistoryScribe.load(folderItem);
            const vibeItem = {
                ...folderItem,
                name: `Vibe: ${folderItem.name}`,
                type: 'vibe-session',
                originalType: folderItem.type,
                kind: 'file'
            };
            const session = {
                history: history, 
                rootPath: folderItem.path,
                isProcessing: false,
                iterationCount: 0
            };
            import('../tabs/index.js').then(m => {
                m.Tabs.create({ ...vibeItem, content: session }, false, true, true);
            });
        } catch(e) {
            UI.showToast("Vibe initiation failed.", "error");
        } finally {
            UI.hideLoading();
        }
    },

    async render(tab) {
        UI.switchView('vibe');
        if (!tab.vibeSession) tab.vibeSession = tab.content;
        VibeView.render(tab, this);
    },

    async sendMessage(tab) {
        if (tab.vibeSession.isProcessing) return;
        const input = document.getElementById('vibe-input');
        const text = input.value.trim();
        if (!text) return;
        
        if (!ModelManager.getKey()) {
            const hasKey = await ModelManager.promptForKey();
            if (!hasKey) return;
        }

        input.value = '';
        tab.vibeSession.iterationCount = 0;
        State.isVibeStopRequested = false;
        tab.vibeSession.history.push({ role: 'user', content: text });
        
        await this.triggerGeneration(tab);
    },

    async triggerGeneration(tab, loopInstruction = null, isLoop = false) {
        tab.vibeSession.isProcessing = true;
        this.syncUI(tab);
        
        // B"H - Rebuild context before every generation attempt
        const markdown = await ContextNexus.build(tab);
        const systemMsg = { role: 'system', content: PromptShaper.getSystem(markdown) };
        const history = [...tab.vibeSession.history];
        
        if (isLoop && loopInstruction) {
            // Append loop instruction to the last turn to guide the model
            history[history.length - 1].content += "\n\n" + loopInstruction;
        }

        const apiHistory = [systemMsg, ...history];
        const historyEl = document.getElementById('vibe-chat-history');
        const msgDiv = VibeView.showStreamingMessage(historyEl);
        let fullResponse = "";

        await VibeAPI.streamChat(apiHistory, ModelManager.getKey(), ModelManager.currentModel,
            (chunk) => {
                fullResponse += chunk;
                msgDiv.textContent = fullResponse;
                historyEl.scrollTop = historyEl.scrollHeight;
            },
            async (finalText) => {
                tab.vibeSession.history.push({ role: 'model', content: finalText });
                tab.isDirty = true;
                const changes = ResponseParser.parseChanges(finalText, tab.vibeSession.rootPath);
                if (changes.length > 0) {
                    await LoopEngine.apply(changes, tab.item.workspaceId);
                    await LoopEngine.handleIteration(tab, this);
                } else {
                    tab.vibeSession.isProcessing = false;
                    this.syncUI(tab);
                }
            },
            (err) => {
                tab.vibeSession.isProcessing = false;
                this.syncUI(tab);
                UI.showToast("B\"H Error: " + err.message, "error");
            }
        );
    },

    syncUI(tab) { VibeView.render(tab, this); },
    async saveSessionToFile(tab) { await HistoryScribe.save(tab); },
    stopLoop() { State.isVibeStopRequested = true; UI.showToast("B\"H: Halt requested.", "warning"); },
    async resetChat(tab) {
        if (await UI.showDialog({ title: "Reset Timestream", message: "Clear chat history?", okText: "Reset" })) {
            tab.vibeSession.history = [];
            tab.vibeSession.iterationCount = 0;
            this.syncUI(tab);
        }
    },
    getRootItem(tab) {
        return { ...tab.item, name: tab.item.name.replace('Vibe: ', ''), path: tab.vibeSession.rootPath, kind: 'directory', type: tab.item.originalType || 'local' };
    },
    openSettings() { import('../app.js').then(m => m.App.showSettings()); }
};
]]></content>
  </change>

  <change>
    <file>js/vibe/vibe-view.js</file>
    <description>//B"H - UI updates for Vibe view, adding Reset/Stop buttons and iteration tracking.</description>
    <content><![CDATA[//B"H
/**
 * --- VIBE VIEW ---
 * The physical interface for the AI engine.
 * B"H - Ensuring tree items are registered in DOM map for standard interactions.
 */
import { State } from '../state.js';
import { ModelManager } from './model-manager.js';
import { WorkspaceTreeRenderer } from '../workspaces/tree-rendering.js';

export const VibeView = {
    container: null,
    
    init() { this.container = document.getElementById('vibe-editor-wrapper'); },

    async render(tab, controller) {
        if (!this.container) this.init();
        const session = tab.vibeSession;
        if (!session) return; 

        if (this.container.dataset.tabId !== String(tab.id)) {
            this.container.dataset.tabId = tab.id;
            this.container.innerHTML = `
                <div class="vibe-container">
                    <div class="vibe-chat-panel">
                        <div class="vibe-chat-history" id="vibe-chat-history"></div>
                        <div class="vibe-input-area">
                            <div class="vibe-input-wrapper">
                                <textarea id="vibe-input" class="vibe-textarea" placeholder="Speak your will to the engine..."></textarea>
                                <button id="vibe-send-btn" class="primary-btn" style="height:60px; width:60px;">➤</button>
                            </div>
                            <div style="display:flex; gap:10px; margin-top:5px;">
                                <button id="vibe-reset-btn" class="secondary-btn" style="font-size:0.8em; padding:4px 8px; min-height:0;">Reset Chat</button>
                                <button id="vibe-stop-btn" class="secondary-btn danger hidden" style="font-size:0.8em; padding:4px 8px; min-height:0;">Stop Loop</button>
                            </div>
                        </div>
                    </div>
                    <div class="vibe-side-panel">
                        <div class="vibe-panel-header">
                            <span>Workspace Spirits</span>
                        </div>
                        <div class="vibe-context-list" style="padding:0; overflow-y:auto;"></div>
                        <div class="vibe-settings-area">
                            <div class="vibe-model-badge" id="vibe-config-btn">${ModelManager.currentModel}</div>
                            <div id="vibe-iter-badge" style="font-size:0.8em; color:var(--neon-lime); margin-top:5px;">
                                Loops: ${State.vibeIterations}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this._bind(tab, controller);
            this.renderTree(tab, controller);
        }

        const stop = document.getElementById('vibe-stop-btn');
        if (session.isProcessing) stop?.classList.remove('hidden');
        else stop?.classList.add('hidden');

        const badge = document.getElementById('vibe-iter-badge');
        if(badge) badge.textContent = `Loops: ${State.vibeIterations} ${session.iterationCount > 0 ? `(${session.iterationCount})` : ''}`;

        const hist = document.getElementById('vibe-chat-history');
        if (hist) {
            const messages = session.history.filter(m => m.role !== 'system');
            if (messages.length !== hist.querySelectorAll('.vibe-message').length) {
                hist.innerHTML = '';
                messages.forEach(m => this.appendMessage(m.role, m.content, hist));
            }
        }
    },

    _bind(tab, controller) {
        document.getElementById('vibe-send-btn').onclick = () => controller.sendMessage(tab);
        document.getElementById('vibe-input').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); controller.sendMessage(tab); } };
        document.getElementById('vibe-reset-btn').onclick = () => controller.resetChat(tab);
        document.getElementById('vibe-stop-btn').onclick = () => controller.stopLoop();
        document.getElementById('vibe-config-btn').onclick = () => controller.openSettings();
    },

    async renderTree(tab, controller) {
        const root = controller.getRootItem(tab);
        const list = this.container.querySelector('.vibe-context-list');
        const ul = document.createElement('ul');
        ul.className = 'workspace-tree';
        list.appendChild(ul);
        // B"H - registerDom=true ensures the file items are interactive and openable like the regular explorer.
        await WorkspaceTreeRenderer.renderTree(ul, root, 0, true);
    },

    appendMessage(role, content, container) {
        const div = document.createElement('div');
        div.className = `vibe-message ${role}`;
        div.innerHTML = content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    showStreamingMessage(container) {
        const div = document.createElement('div');
        div.className = 'vibe-message model';
        div.innerHTML = '<span class="vibe-typing-indicator">...</span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    }
};
]]></content>
  </change>

  <change>
    <file>js/vibe/model-manager.js</file>
    <description>//B"H - Extended Vibe model manager with custom prompt and iteration controls.</description>
    <content><![CDATA[//B"H
/**
 * --- MODEL MANAGER ---
 * Managing the intelligence levels and holy API keys.
 * B"H - Updated with recursive iteration and prompt extension rituals.
 */
import { UI } from '../ui.js';
import { State } from '../state.js';
import { VibeAPI } from './api-client.js';

export const ModelManager = {
    keys: [],
    currentKeyIndex: 0,
    currentModel: 'gemini-3-flash-preview', 
    fallbackOrder: [
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        'gemini-2.0-flash', 
        'gemini-2.0-flash-lite'
    ],

    init() {
        const config = JSON.parse(localStorage.getItem('vivid_vibe_config') || '{}');
        this.keys = config.keys || [];
        this.currentModel = config.currentModel || 'gemini-3-flash-preview';
    },

    save() {
        localStorage.setItem('vivid_vibe_config', JSON.stringify({ keys: this.keys, currentModel: this.currentModel }));
    },

    addKey(key) {
        if (key && !this.keys.includes(key)) { this.keys.push(key); this.save(); UI.showToast("B\"H: Key sanctified.", "success"); }
    },

    getKey() { return this.keys.length > 0 ? this.keys[this.currentKeyIndex] : null; },

    rotateKey() {
        if (this.keys.length <= 1) return false; 
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
        UI.showToast(`B"H: Key Rotation #${this.currentKeyIndex + 1}`, "info");
        return true;
    },

    downgradeModel() {
        const next = (this.fallbackOrder.indexOf(this.currentModel) + 1) % this.fallbackOrder.length;
        this.currentModel = this.fallbackOrder[next];
        this.save();
        UI.showToast(`B"H: Perception shifted to ${this.currentModel}`, "warning");
        return true;
    },

    getSettingsPanelHTML() {
        const modelOps = this.fallbackOrder.map(m => `<option value="${m}" ${m === this.currentModel ? 'selected' : ''}>${(VibeAPI.MODELS[m] || {name:m}).name}</option>`).join('');
        const keys = this.keys.map((k, i) => `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--color-border); align-items:center;"><span>Key #${i+1}</span><button class="remove-key-btn icon-button" data-index="${i}" style="color:var(--color-accent-danger);">×</button></div>`).join('');

        return `
            <div class="vibe-settings-panel" style="border:1px solid var(--color-border); padding:15px; border-radius:8px; background:rgba(0,0,0,0.2);">
                <h4 style="color:var(--neon-cyan); margin-top:0;">Awtsmoos Vibe Rituals</h4>
                <div style="margin-bottom:10px;">
                    <label>Active Engine</label>
                    <select id="vibe-model-select" style="width:100%; padding:8px; background:#000; color:#fff; border:1px solid var(--color-border);">${modelOps}</select>
                </div>
                <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px;">
                    <label>Correction Loops</label>
                    <input type="number" id="vibe-iter-input" value="${State.vibeIterations}" min="1" max="10" style="width:60px;">
                </div>
                <div style="margin-bottom:10px;">
                    <label>Custom Divine Instructions (Appended)</label>
                    <textarea id="vibe-custom-prompt" style="width:100%; height:80px; font-size:0.85em;" placeholder="E.g. Use functional programming...">${State.customVibePrompt}</textarea>
                </div>
                <div>
                    <label>Keys</label>
                    <div id="vibe-key-list" style="max-height:100px; overflow-y:auto; margin-bottom:5px;">${keys || 'None'}</div>
                    <div style="display:flex; gap:5px;">
                        <input type="password" id="vibe-new-key" placeholder="Add Key">
                        <button id="vibe-add-key-btn" class="primary-btn" style="padding:0 10px;">Add</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindSettingsEvents(container, refresh) {
        const add = container.querySelector('#vibe-add-key-btn'), inp = container.querySelector('#vibe-new-key');
        if (add && inp) add.onclick = () => { if (inp.value.trim()) { this.addKey(inp.value.trim()); if(refresh) refresh(); } };
        const sel = container.querySelector('#vibe-model-select');
        if (sel) sel.onchange = () => { this.currentModel = sel.value; this.save(); };
        const iter = container.querySelector('#vibe-iter-input');
        if (iter) iter.onchange = () => { State.vibeIterations = parseInt(iter.value) || 1; localStorage.setItem('awtsmoos_vibe_iterations', State.vibeIterations); };
        const prompt = container.querySelector('#vibe-custom-prompt');
        if (prompt) prompt.oninput = () => { State.customVibePrompt = prompt.value; localStorage.setItem('awtsmoos_vibe_custom_prompt', State.customVibePrompt); };
        const list = container.querySelector('#vibe-key-list');
        if (list) list.onclick = (e) => { if(e.target.classList.contains('remove-key-btn')) { this.keys.splice(parseInt(e.target.dataset.index), 1); this.save(); if(refresh) refresh(); } };
    },

    async promptForKey() {
        const result = await UI.showDialog({ title: "API Key Required", contentHTML: '<input type="password" id="vk" placeholder="Paste Gemini API Key">', okText: "Save" });
        if (result) { const v = document.getElementById('vk')?.value; if(v) { this.addKey(v); return true; } }
        return false;
    }
};
]]></content>
  </change>

  <change>
    <file>js/app/event-listeners.js</file>
    <description>//B"H - Binding Ctrl+S in Vibe sessions to history persistence.</description>
    <content><![CDATA[//B"H
/**
 * --- EVENT LISTENERS ---
 * Listening to the echoes of user intent in the world.
 * B"H - Updated with specific Vibe persistence rituals for Ctrl+S.
 */
import { State, DOM } from '../state.js';
import { UI } from '../ui.js';
import { Tabs } from '../tabs/index.js';
import { Menus } from '../menus.js';
import { FindReplace } from '../find-replace.js';
import { Editor } from '../editor.js';
import { SelectionManager } from '../selection-manager.js';
import { CustomMenu } from '../custom-menu.js';
import { Workspaces } from '../workspaces.js';
import { App } from '../app.js';
import { StatusBar } from '../statusbar.js';
import { TabManagerOverlay } from '../tab-manager-overlay.js';
import { FileCommander } from '../file-commander.js';
import { FileSystemProvider } from '../fs-provider.js';
import { WorkspaceAddition } from '../features/workspace-addition.js'; 
import { CommandPalette } from '../command-palette.js'; 
import { Effects } from '../effects.js'; 
import { VisualEngine } from '../visuals/index.js'; 
import { ASTEngine } from '../tools/ast-engine.js'; 
import { VibeController } from '../vibe/vibe-controller.js';

export function setupEventListeners() {
    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        
        const handleFileRead = async (workspaceId, path) => {
            const workspace = State.workspaces.find(ws => String(ws.id) === String(workspaceId));
            if (!workspace) throw new Error(`Workspace ${workspaceId} not found`);
            const item = { ...workspace, path: path, kind: 'file' };
            let content = await FileSystemProvider.read(item);
            if (content instanceof Blob) content = await content.text();
            else if (content && content.base64Content) content = atob(content.base64Content);
            return content;
        };

        if ((type === 'import-request' && event.data.source === 'html-preview-bridge') || 
            type === 'fetch-worker-script' || 
            type === 'fetch-script-content' ||
            (type === 'FETCH_REQ')) { 
            
            const { specifier, referrer, workspaceId, id, path } = event.data;
            const targetPath = specifier || path;
            
            try {
                let content;
                if (targetPath.includes('MerkavaExecutor') || targetPath.includes('merkava-sdk')) {
                    const cleanPath = targetPath.startsWith('/') ? targetPath : '/' + targetPath;
                    const response = await fetch(cleanPath);
                    if (!response.ok) throw new Error(`System Asset Not Found: ${cleanPath}`);
                    content = await response.text();
                } else {
                    let absolutePath = targetPath;
                    if (referrer && !targetPath.startsWith('/') && !targetPath.match(/^[a-z]+:/)) {
                        const referrerPath = referrer.startsWith('/') ? referrer : '/' + referrer;
                        const baseUrl = new URL(referrerPath, 'http://root'); 
                        const resolvedUrl = new URL(targetPath, baseUrl);
                        absolutePath = resolvedUrl.pathname;
                        absolutePath = decodeURIComponent(absolutePath);
                    }
                    if (!absolutePath.startsWith('/')) absolutePath = '/' + absolutePath;
                    content = await handleFileRead(workspaceId, absolutePath);
                }
                
                if (type === 'import-request') {
                    event.source.postMessage({ type: 'import-response', id, content }, '*');
                } else if (type === 'fetch-worker-script') {
                    event.source.postMessage({ type: 'worker-script-response', id, content }, '*');
                } else {
                    event.source.postMessage({ type: 'script-content-response', id, content, path: targetPath }, '*');
                }
            } catch (e) {
                const responseType = type === 'import-request' ? 'import-response' : 
                                     type === 'fetch-worker-script' ? 'worker-script-response' : 'script-content-response';
                if (event.source) {
                    event.source.postMessage({ type: responseType, id, error: e.toString() }, '*');
                }
            }
            return;
        }

        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) reject(new Error(error));
            else resolve(payload);
            return;
        }
        
        if (type === 'loadWorkspace') {
            const { name, path, type: wsType } = payload;
            const appContainer = document.querySelector('.app-container');
            const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
            const resizer = document.getElementById('sidebar-resizer');
            if (appContainer) appContainer.classList.remove('sidebar-collapsed');
            if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'flex';
            if (resizer) resizer.style.display = 'block';
            Workspaces.add({ name, path, type: wsType }, true);
            return;
        }

        if (type === 'loadFile') {
            const appContainer = document.querySelector('.app-container');
            const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
            const resizer = document.getElementById('sidebar-resizer');
            var tb = document?.querySelector(".tab-bar");
            if (tb) tb.style.display = "none";
            if (appContainer) appContainer.classList.add('sidebar-collapsed');
            if (sidebarCollapseBtn) sidebarCollapseBtn.style.display = 'none';
            if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.style.display = 'none';
            if (resizer) resizer.style.display = 'none';

             const { fileName, content, saveContext } = payload;
            const externalWorkspace = { name: `OS File`, type: 'postmessage' };
            Workspaces.add(externalWorkspace, false);
            const wsId = State.workspaces[State.workspaces.length - 1].id;
            const fileItem = {
                name: fileName, path: fileName, kind: 'file',
                type: 'postmessage', workspaceId: wsId,
                saveContext, _initialContent: content
            };
            await Tabs.create(fileItem, false, false);
            return;
        }
        if (type === 'registerMenus') {
            CustomMenu.createFromConfig(payload);
            return;
        }
    });

    DOM.editor.addEventListener('fold-click', (e) => {
        ASTEngine.unfoldById(e.detail.foldId);
    });

    if (DOM.viewConsoleBtn) {
        DOM.viewConsoleBtn.onclick = () => {
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && activeTab.fileType === 'html-preview') {
                Tabs.createConsole(activeTab);
            } else {
                UI.showToast("No active preview to attach console.", "error");
            }
        };
    }
    
    const fcBtnMain = document.getElementById('file-commander-btn');
    if (fcBtnMain) fcBtnMain.onclick = () => FileCommander.show();
    
    const fcBtnSidebar = document.getElementById('sidebar-file-commander-btn');
    if (fcBtnSidebar) fcBtnSidebar.onclick = () => FileCommander.show();

    const appContainer = document.querySelector('.app-container');
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');

    if (DOM.hamburgerMenuBtn) {
        DOM.hamburgerMenuBtn.onclick = (e) => {
            e.stopPropagation();
            Menus.showMainMenu(e);
        };
    }

    const toggleSidebar = (e) => {
        e.stopPropagation();
        if (appContainer.classList.contains('sidebar-collapsed')) {
            appContainer.classList.remove('sidebar-collapsed');
            const lastWidth = parseInt(localStorage.awtsmoosSidebarWidth, 10) || 300;
            appContainer.style.gridTemplateColumns = `${lastWidth}px 1fr`;
        } else {
            const sidebarRect = DOM.sidebar.getBoundingClientRect();
            if (sidebarRect.width > 0) {
                localStorage.awtsmoosSidebarWidth = sidebarRect.width;
            }
            appContainer.classList.add('sidebar-collapsed');
            appContainer.style.gridTemplateColumns = '';
        }
    };

    if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
    if (sidebarCollapseBtn) sidebarCollapseBtn.onclick = toggleSidebar;

    const resizer = document.getElementById('sidebar-resizer');

    if (resizer) {
        const minManualWidth = 50;
        const maxWidth = 800;

        const handleMove = (e) => {
            if (appContainer.classList.contains('sidebar-collapsed')) return;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            let newWidth = Math.max(minManualWidth, Math.min(clientX, maxWidth));
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
            localStorage.awtsmoosSidebarWidth = newWidth;
        };

        const handleEnd = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        const handleStart = (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing');
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);
        };

        resizer.addEventListener('mousedown', handleStart);
        resizer.addEventListener('touchstart', handleStart, { passive: false });
    }

    document.addEventListener('click', (e) => {
        if (State.isSelectionModeActive) {
            const isClickInsideSidebar = DOM.sidebar.contains(e.target);
            const isClickInsideSelectionMenu = DOM.selectionMenu.contains(e.target);
            if (!isClickInsideSidebar && !isClickInsideSelectionMenu) {
                SelectionManager.end();
            }
        }
        VisualEngine.onCaretMove(); 
    });

    DOM.editor.addEventListener('input', (e) => {
        Effects.spawnParticles();
        Effects.resetEntropy();
        VisualEngine.onInput(DOM.editor.value, e.inputType === 'deleteContentBackward');
        
        if (!State.sessionHistory) State.sessionHistory = [];
        if (State.sessionHistory.length > 500) State.sessionHistory.shift();
        if (!DOM.editor.historyTimeout) {
            State.sessionHistory.push(DOM.editor.value);
            DOM.editor.historyTimeout = setTimeout(() => DOM.editor.historyTimeout = null, 1000);
        }

        if (State.isRestoring) return; 
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) {
            if (!activeTab.isDirty) {
                activeTab.isDirty = true;
                Tabs.render();
            }
            activeTab.content = DOM.editor.value;
            App.saveSessionDebounced();
        }
        UI.updateLineNumbers();
    });

    DOM.editor.addEventListener('scroll', () => {
        UI.syncScroll();
        VisualEngine.onScroll(); 
        
        if (State.isRestoring) return;
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
            App.saveSessionDebounced();
        }
    });

    DOM.editor.addEventListener('keyup', (e) => {
        StatusBar.update();
        VisualEngine.onCaretMove(); 
    });
    DOM.editor.addEventListener('click', (e) => {
        StatusBar.update();
        VisualEngine.onCaretMove(); 
    });
    
    new ResizeObserver(UI.updateLineNumbers).observe(DOM.editor);
    DOM.contextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (button) Menus.handleAction(button.dataset.action);
    });
    DOM.mainMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (button && !button.disabled) Menus.handleAction(button.dataset.action);
    });
    
    DOM.addWorkspaceBtn.onclick = () => WorkspaceAddition.showDialog();
    
    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        
        if (!hasModifier && e.key.length === 1) {
            Effects.playKeystrokeSound(e.key);
        }

        if (e.key === 'Escape') {
            if (document.body.classList.contains('zen-mode')) {
                document.body.classList.remove('zen-mode');
                UI.showToast("Zen Mode Disabled", "info");
                return;
            }
            if (State.isSelectionModeActive) {
                e.preventDefault();
                SelectionManager.end();
            } else if (DOM.genericDialog.classList.contains('visible')) {
                const cancelButton = DOM.genericDialog.querySelector('#dialog-cancel-btn');
                if (cancelButton) cancelButton.click();
                return;
            }
            
            if (CommandPalette.isOpen) {
                CommandPalette.hide();
                return;
            }

            if (!DOM.findReplacePanel.style.display || DOM.findReplacePanel.style.display === 'none') {
                 if (TabManagerOverlay.overlay && TabManagerOverlay.overlay.classList.contains('visible')) {
                     TabManagerOverlay.hide();
                 } else if (FileCommander.overlay && FileCommander.overlay.classList.contains('visible')) {
                     FileCommander.hide();
                 } else {
                     Menus.hideAll();
                 }
            } else {
                FindReplace.hide();
            }
        }

        if (hasModifier && shift && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            CommandPalette.toggle();
            return;
        }
        
        if (hasModifier && shift && e.key.toLowerCase() === 't') {
            e.preventDefault();
            Tabs.reopenLastClosed();
            return;
        }

        if (hasModifier && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            Editor.promptGoToLine();
            return;
        }

        if (hasModifier && e.key.toLowerCase() === 's') {
            e.preventDefault();
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab && activeTab.fileType === 'vibe') {
                VibeController.saveSessionToFile(activeTab);
            } else {
                Tabs.saveActive();
            }
        }
        if (hasModifier && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            const selectedText = DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd);
            FindReplace.show(selectedText);
        }
    });
    
    DOM.editor.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        if (hasModifier && shift && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            Editor.duplicateLine();
            return;
        }
        
        if (hasModifier && shift && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            Editor.deleteLine();
            return;
        }
        
        if (hasModifier && e.key === '/') {
            e.preventDefault();
            Editor.toggleComment();
            return;
        }
        
        if (hasModifier && !shift && e.key === 'Enter') {
            e.preventDefault();
            Editor.insertLine('after');
            return;
        }
        
        if (hasModifier && shift && e.key === 'Enter') {
            e.preventDefault();
            Editor.insertLine('before');
            return;
        }

        if (alt && e.key === 'ArrowUp') {
            e.preventDefault();
            Editor.moveLine(-1);
            return;
        }
        if (alt && e.key === 'ArrowDown') {
            e.preventDefault();
            Editor.moveLine(1);
            return;
        }

        if (FindReplace.isFindSelectionActive) {
            return;
        }
        if (e.key === 'Tab') {
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const editor = DOM.editor;
            const fullText = editor.value;
            const cursorPosition = editor.selectionStart;
            const lineStartPos = fullText.substring(0, cursorPosition).lastIndexOf('\n') + 1;
            const currentLineText = fullText.substring(lineStartPos, cursorPosition);
            const leadingWhitespaceMatch = currentLineText.match(/^\s*/);
            let indent = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
            const trimmed = currentLineText.trim();
            const lastChar = trimmed.slice(-1);
            if (['{', '[', '('].includes(lastChar)) {
                indent += App.getTabString();
            }
            const textToInsert = '\n' + indent;
            editor.setRangeText(textToInsert, cursorPosition, editor.selectionEnd, 'end');
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            VisualEngine.onCaretMove();
        }
    });
    
    const handleTabInInputs = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const input = e.target;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.setRangeText(App.getTabString(), start, end, 'end');
        }
    };
    DOM.findInput.addEventListener('keydown', handleTabInInputs);
    DOM.replaceInput.addEventListener('keydown', handleTabInInputs);
    
    DOM.keyboardHelper.addEventListener('click', (e) => {
        const button = e.target.closest('button.kh-btn');
        if (!button) return;
        const activeEditorInstance = Editor.currentHighlighter;
        if (!activeEditorInstance) return;
        const editor = DOM.editor;
        const key = button.dataset.key;
        const pair = button.dataset.pair;
        const start = editor.selectionStart; 
        const end = editor.selectionEnd;
        if (pair) {
            const [charStart, charEnd] = pair;
            const selectedText = editor.value.substring(start, end);
            const textToInsert = charStart + selectedText + charEnd;
            editor.setRangeText(textToInsert, start, end, 'select');
            if (start === end) {
                editor.selectionStart = editor.selectionEnd = start + 1;
            }
        } else if (key === 'tab') {
            activeEditorInstance.indentSelection();
        }
        editor.focus();
    });

    window.addEventListener('beforeunload', () => {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
        }
        App.saveSession();
    });
}
]]></content>
  </change>
</changes>
```