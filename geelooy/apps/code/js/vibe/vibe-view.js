// B"H
// FILE: js/vibe/vibe-view.js
import { ChatUI } from './view/chat-ui.js';
import { SidebarUI } from './view/sidebar-ui.js';
import { ModelManager } from './model-manager.js';

export const VibeView = {
    container: null,
    scrollTether: true,

    init() { this.container = document.getElementById('vibe-editor-wrapper'); },

    async render(tab, controller) {
        if (!this.container) this.init();
        const session = tab.vibeSession;
        if (!session) return;

        if (!session.viewState) session.viewState = { activeSidebarTab: 'tree', isSidebarCollapsed: false, currentStreamContent: '' };

        if (this.container.dataset.tabId !== String(tab.id)) {
            this.container.dataset.tabId = tab.id;
            this._injectTemplate(tab);
            this._bindEvents(tab, controller);
            
            const root = controller.getRootItem(tab);
            await SidebarUI.refreshTree(this.container, root, controller);
        }

        ChatUI.renderHistory(this.container, session.history, tab, controller);
        SidebarUI.render(this.container, tab, controller);
        
        if (session.viewState.currentStreamContent) {
            SidebarUI.updateStreamContent(this.container, session.viewState.currentStreamContent);
        }
    },

    _injectTemplate(tab) {
        this.container.innerHTML = `
            <div class="vibe-container">
                <div class="vibe-chat-panel">
                    <div class="vibe-chat-history" id="vibe-chat-history"></div>
                    <div class="vibe-input-area">
                        <div class="vibe-input-wrapper">
                            <textarea id="vibe-input" class="vibe-textarea" placeholder="Manifest your will..."></textarea>
                            <button id="vibe-send-btn" class="primary-btn">➤</button>
                        </div>
                        
                        <!-- Actions Bar -->
                        <div class="vibe-actions">
                            <div class="vibe-actions-left">
                                <button id="vibe-stop-btn" class="secondary-btn danger hidden" style="font-size:0.8em; padding:4px 8px;">Stop</button>
                                <button id="vibe-reset-btn" class="secondary-btn" style="font-size:0.8em; padding:4px 8px;">Reset</button>
                                <button id="vibe-settings-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-settings"></use></svg></button>
                            </div>
                            <button id="vibe-sidebar-toggle-btn" class="icon-button" title="Toggle Assets Panel">
                                <svg class="svg-icon"><use href="#icon-sidebar"></use></svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="vibe-resizer" id="vibe-resizer"></div>
                
                <div class="vibe-side-panel" id="vibe-side-panel">
                    <div class="vibe-panel-header">
                        <span>Vibe Assets</span>
                        <button id="vibe-refresh-tree" class="icon-button" style="padding:0;"><svg class="svg-icon"><use href="#icon-refresh"></use></svg></button>
                    </div>
                    
                    <div class="vibe-sidebar-tabs">
                        <div class="vibe-sb-tab" data-tab="tree">Tree</div>
                        <div class="vibe-sb-tab" data-tab="stream">Active Vessel</div>
                    </div>

                    <div id="vibe-tree-container" class="vibe-context-list"></div>
                    <div id="vibe-stream-container" class="vibe-stream-view">
                        <div style="text-align:center; color:gray; padding-top:20px; font-style:italic;">No active creation...</div>
                    </div>

                    <div class="vibe-settings-area">
                        <div id="vibe-model-badge" style="font-size:0.85em; color:var(--neon-cyan); cursor:pointer;">${ModelManager.currentModel}</div>
                        <div id="vibe-iter-badge" style="font-size:0.8em; color:var(--neon-lime);"></div>
                    </div>
                </div>
            </div>`;
            
        this._setupResizer();
    },

    _bindEvents(tab, controller) {
        document.getElementById('vibe-send-btn').onclick = () => controller.sendMessage(tab);
        document.getElementById('vibe-input').onkeydown = (e) => { 
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); controller.sendMessage(tab); } 
        };
        document.getElementById('vibe-stop-btn').onclick = () => controller.stopLoop();
        document.getElementById('vibe-reset-btn').onclick = () => controller.resetChat(tab);
        document.getElementById('vibe-settings-btn').onclick = () => controller.openSettings();
        document.getElementById('vibe-refresh-tree').onclick = async () => {
            const root = controller.getRootItem(tab);
            await SidebarUI.refreshTree(this.container, root, controller);
        };
        
        document.getElementById('vibe-sidebar-toggle-btn').onclick = () => {
            tab.vibeSession.viewState.isSidebarCollapsed = !tab.vibeSession.viewState.isSidebarCollapsed;
            SidebarUI.render(this.container, tab, controller);
        };

        const tabs = this.container.querySelectorAll('.vibe-sb-tab');
        tabs.forEach(t => t.onclick = () => {
            tab.vibeSession.viewState.activeSidebarTab = t.dataset.tab;
            SidebarUI.render(this.container, tab, controller);
        });
    },

    updateStream(tab, content) {
        tab.vibeSession.viewState.currentStreamContent = content;
        SidebarUI.updateStreamContent(this.container, content);
        const streamTab = this.container.querySelector('[data-tab="stream"]');
        if (streamTab && tab.vibeSession.viewState.activeSidebarTab !== 'stream') {
            streamTab.classList.add('pulse');
        } else if (streamTab) {
            streamTab.classList.remove('pulse');
        }
    },

    updateStreamingMessage(tab, controller) {
        const hist = document.getElementById('vibe-chat-history');
        if (!hist) return;

        let lastMsgEl = hist.lastElementChild;
        if (!lastMsgEl || !lastMsgEl.classList.contains('model')) {
            lastMsgEl = ChatUI.showStreamingMessage(hist);
        }
        
        // B"H - FIX: Actually update the UI content based on the session state
        const session = tab.vibeSession;
        if (session.history.length > 0) {
            const currentContent = session.history[session.history.length - 1].content;
            ChatUI.updateLastMessage(hist, currentContent, tab, controller);
        }
    },

    refreshView(tab, controller) {
        ChatUI.renderHistory(this.container, tab.vibeSession.history, tab, controller);
        SidebarUI.render(this.container, tab, controller);
    },

    _setupResizer() {
        const resizer = document.getElementById('vibe-resizer');
        const panel = document.getElementById('vibe-side-panel');
        let isResizing = false;
        if (!resizer || !panel) return;

        const start = () => { isResizing = true; resizer.classList.add('resizing'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; };
        const move = (e) => {
            if (!isResizing || panel.classList.contains('collapsed')) return;
            const container = this.container.querySelector('.vibe-container');
            const rect = container.getBoundingClientRect();
            const width = rect.right - e.clientX;
            if (width > 150 && width < rect.width * 0.7) panel.style.width = `${width}px`;
        };
        const stop = () => { isResizing = false; resizer.classList.remove('resizing'); document.body.style.cursor = ''; document.body.style.userSelect = ''; };

        resizer.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stop);
    }
};