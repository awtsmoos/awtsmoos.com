
// B"H
// FILE: js/vibe/vibe-view.js
import { ChatUI } from './view/chat-ui.js';
import { SidebarUI } from './view/sidebar-ui.js';
import { ExternalManifest } from './modules/ExternalManifest.js';

export const VibeView = {
    container: null,
    init() { this.container = document.getElementById('vibe-editor-wrapper'); },

    async render(tab, controller) {
        if (!this.container) this.init();
        const sess = tab.vibeSession;
        if (!sess.viewState) sess.viewState = { activeSidebarTab: 'tree', isSidebarCollapsed: false, isPanelMaximized: false, isPanelMinimized: false };

        if (this.container.dataset.tabId !== String(tab.id)) {
            this.container.dataset.tabId = tab.id;
            this._inject();
            this._bind(tab, controller);
            const root = controller.getRootItem(tab);
            await SidebarUI.refreshTree(this.container, root, controller);
            ExternalManifest.injectUI(this.container.querySelector('#vibe-manifest-container'), tab, root);
        }

        ChatUI.renderHistory(this.container, sess.history, tab, controller);
        SidebarUI.render(this.container, tab, controller);
        this._sync(tab, controller);
    },

    _inject: function() {
	    this.container.innerHTML = 
	        '<div class="vibe-container">' +
	            '<div class="vibe-chat-panel">' +
	                '<div id="vibe-chat-history" class="vibe-chat-history"></div>' +
	                '<div id="vibe-input-area" class="vibe-input-area">' +
	                    '<div class="vibe-input-wrapper">' +
	                        '<textarea id="vibe-input" class="vibe-textarea" placeholder="Speak your will..."></textarea>' +
	                        '<button id="vibe-send-btn" class="primary-btn">➤</button>' +
	                    '</div>' +
	                    '<div class="vibe-actions">' +
                            '<button id="vibe-reset-btn" class="secondary-btn">Reset</button>' +
	                        '<button id="vibe-mgr-btn" class="secondary-btn" title="Vibe Manager">Manager</button>' +
	                        '<button id="vibe-sidebar-toggle-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-sidebar"></use></svg></button>' +
	                    '</div>' +
	                '</div>' +
	            '</div>' +
                /* B"H - BOTH RESIZERS FOR DESKTOP AND MOBILE */
	            '<div class="vibe-resizer" id="vibe-resizer-vertical"></div>' +
                '<div class="vibe-resizer-horizontal" id="vibe-resizer-horizontal"></div>' +
	            '<div class="vibe-side-panel" id="vibe-side-panel">' +
                    /* B"H - Restore Button for Minimized State */
                    '<div id="vibe-panel-restore-btn" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; cursor:pointer; color:var(--neon-cyan); background:var(--color-bg-secondary);">' +
                        '<svg class="svg-icon" style="width: 24px; height: 24px;"><use href="#icon-plus"></use></svg>' +
                    '</div>' +
                    /* B"H - Inner Wrapper to Hide Content when Minimized */
                    '<div class="vibe-panel-inner" style="display:flex; flex-direction:column; width:100%; height:100%;">' +
                        /* B"H - Panel Controls Included */
                        '<div class="vibe-sidebar-tabs" style="align-items: center; padding-right: 5px;">' +
                            '<div class="vibe-sb-tab" data-tab="tree">Tree</div>' +
                            '<div class="vibe-sb-tab" data-tab="manifest">External</div>' +
                            '<div class="vibe-sb-tab" data-tab="checkpoints">Checkpoints</div>' +
                            '<div style="flex-grow:1;"></div>' +
                            '<button id="vibe-panel-max-btn" class="icon-button" style="width: 28px; height: 28px; padding: 4px;" title="Toggle Fullscreen"><svg class="svg-icon"><use href="#icon-fullscreen"></use></svg></button>' +
                            '<button id="vibe-panel-min-btn" class="icon-button" style="width: 28px; height: 28px; padding: 4px;" title="Minimize"><svg viewBox="0 0 24 24" class="svg-icon" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg></button>' +
                        '</div>' +
                        '<div id="vibe-tree-container" class="vibe-context-list" style="flex-grow:1; overflow-y:auto;"></div>' +
                        '<div id="vibe-manifest-container" class="vibe-manifest-view" style="display:none; flex-grow:1; overflow:hidden;"></div>' +
                        '<div id="vibe-checkpoints-container" style="display:none; flex-grow:1; overflow-y:auto; padding:15px;"></div>' +
                        '<div class="vibe-settings-area"><div id="vibe-model-badge" style="font-size:0.8em; opacity:0.6; cursor:pointer;">...</div></div>' +
                    '</div>' +
	            '</div>' +
	        '</div>';
	},

	_bind: function(tab, controller) {
        var self = this;
        // B"H --- DOM element references ---
        var sendBtn = this.container.querySelector('#vibe-send-btn');
        var input = this.container.querySelector('#vibe-input');
        var resetBtn = this.container.querySelector('#vibe-reset-btn');
        var mgrBtn = this.container.querySelector('#vibe-mgr-btn');
        var sideToggle = this.container.querySelector('#vibe-sidebar-toggle-btn');
        var tabs = this.container.querySelectorAll('.vibe-sb-tab');
        
        var maxBtn = this.container.querySelector('#vibe-panel-max-btn');
        var minBtn = this.container.querySelector('#vibe-panel-min-btn');
        var restoreBtn = this.container.querySelector('#vibe-panel-restore-btn');

	    // --- Event Listeners ---
        if (sendBtn) sendBtn.onclick = () => controller.sendMessage(tab);
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); controller.sendMessage(tab); }};
	    if (resetBtn) resetBtn.onclick = () => controller.resetChat(tab);
	    if (mgrBtn) mgrBtn.onclick = () => controller.openManager(); 
	    if(sideToggle) sideToggle.onclick = () => {
	        tab.vibeSession.viewState.isSidebarCollapsed = !tab.vibeSession.viewState.isSidebarCollapsed;
	        self.render(tab, controller);
	    };

        if (maxBtn) {
            maxBtn.onclick = () => {
                tab.vibeSession.viewState.isPanelMaximized = !tab.vibeSession.viewState.isPanelMaximized;
                if (tab.vibeSession.viewState.isPanelMaximized) tab.vibeSession.viewState.isPanelMinimized = false;
                self.render(tab, controller);
            };
        }

        if (minBtn) {
            minBtn.onclick = () => {
                tab.vibeSession.viewState.isPanelMinimized = true;
                tab.vibeSession.viewState.isPanelMaximized = false; // ensure not maximized
                self.render(tab, controller);
            };
        }

        if (restoreBtn) {
            restoreBtn.onclick = () => {
                tab.vibeSession.viewState.isPanelMinimized = false;
                self.render(tab, controller);
            };
        }

        tabs.forEach(t => {
            t.onclick = () => {
                tab.vibeSession.viewState.activeSidebarTab = t.dataset.tab;
                self.render(tab, controller);
            };
        });

        // B"H --- FULL DRAGGABLE RESIZER LOGIC ---

        const verticalResizer = this.container.querySelector('#vibe-resizer-vertical');
        const horizontalResizer = this.container.querySelector('#vibe-resizer-horizontal');
        const vibeContainer = this.container.querySelector('.vibe-container');

        // --- DESKTOP (DRAG LEFT/RIGHT) ---
        const handleVerticalMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            
            const containerRect = vibeContainer.getBoundingClientRect();
            let newSideWidth = containerRect.right - clientX;
            
            // Constrain
            if (newSideWidth < 0) newSideWidth = 0;
            if (newSideWidth > containerRect.width) newSideWidth = containerRect.width;
            
            vibeContainer.style.setProperty('--side-panel-width', `${newSideWidth}px`);
        };

        const stopVerticalResize = () => {
            document.body.classList.remove('is-resizing', 'is-resizing-horizontal');
            document.removeEventListener('mousemove', handleVerticalMove);
            document.removeEventListener('mouseup', stopVerticalResize);
            document.removeEventListener('touchmove', handleVerticalMove);
            document.removeEventListener('touchend', stopVerticalResize);
        };

        if (verticalResizer) {
            verticalResizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                document.body.classList.add('is-resizing', 'is-resizing-horizontal');
                document.addEventListener('mousemove', handleVerticalMove);
                document.addEventListener('mouseup', stopVerticalResize);
                document.addEventListener('touchmove', handleVerticalMove, { passive: false });
                document.addEventListener('touchend', stopVerticalResize);
            });
        }

        // --- MOBILE (DRAG UP/DOWN) ---
        const handleHorizontalMove = (e) => {
            const finalClientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (finalClientY === undefined) return;
            
            const containerRect = vibeContainer.getBoundingClientRect();
            
            // Absolute height mapped directly from the top of the container
            let newChatHeight = finalClientY - containerRect.top;
            
            // Constrain
            if (newChatHeight < 0) newChatHeight = 0;
            if (newChatHeight > containerRect.height) newChatHeight = containerRect.height;
            
            vibeContainer.style.setProperty('--chat-panel-basis', `${newChatHeight}px`);
        };
        
        const stopHorizontalResize = () => {
            document.body.classList.remove('is-resizing', 'is-resizing-vertical');
            document.removeEventListener('mousemove', handleHorizontalMove);
            document.removeEventListener('mouseup', stopHorizontalResize);
            document.removeEventListener('touchmove', handleHorizontalMove);
            document.removeEventListener('touchend', stopHorizontalResize);
        };

        if (horizontalResizer) {
            horizontalResizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                document.body.classList.add('is-resizing', 'is-resizing-vertical');
                document.addEventListener('mousemove', handleHorizontalMove);
                document.addEventListener('mouseup', stopHorizontalResize);
                document.addEventListener('touchmove', handleHorizontalMove, { passive: false });
                document.addEventListener('touchend', stopHorizontalResize);
            });
        }
	},
	
	_sync: function(tab, controller) {
	    var session = tab.vibeSession;
	    var active = session.viewState.activeSidebarTab || 'tree';
	    var panel = this.container.querySelector('#vibe-side-panel');
	    
	    var treeC = document.getElementById('vibe-tree-container');
	    var manifestC = document.getElementById('vibe-manifest-container');
	    var checkpointsC = document.getElementById('vibe-checkpoints-container');
	    var inputArea = document.getElementById('vibe-input-area');
	
	    var tabs = panel.querySelectorAll('.vibe-sb-tab');
	    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === active));
	    
	    if(treeC) treeC.style.display = (active === 'tree' ? 'block' : 'none');
	    if(manifestC) manifestC.style.display = (active === 'manifest' ? 'flex' : 'none');
	    if(checkpointsC) checkpointsC.style.display = (active === 'checkpoints' ? 'block' : 'none');
	    
        // B"H - CRITICAL FIX: The Input Area and Chat History must ALWAYS remain visible
        // even when External is active, to avoid the "Black Void" issue!
	    if(inputArea) inputArea.style.display = 'flex';
	
	    if (active === 'checkpoints') {
	        import('./view/checkpoint-ui.js').then(m => m.CheckpointUI.render(checkpointsC, tab, controller));
	    }

        // B"H - Sync Maximized State and SVG Icons
        var containerEl = this.container.querySelector('.vibe-container');
        var maxBtn = this.container.querySelector('#vibe-panel-max-btn');

        if (session.viewState.isPanelMaximized) {
            containerEl.classList.add('panel-maximized');
            if (maxBtn) maxBtn.innerHTML = '<svg viewBox="0 0 24 24" class="svg-icon" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'; // Exit fullscreen icon
        } else {
            containerEl.classList.remove('panel-maximized');
            if (maxBtn) maxBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-fullscreen"></use></svg>'; // Standard fullscreen icon
        }

        // B"H - Sync Minimized State
        var restoreBtn = this.container.querySelector('#vibe-panel-restore-btn');
        var innerPanel = this.container.querySelector('.vibe-panel-inner');

        if (session.viewState.isPanelMinimized) {
            containerEl.classList.add('panel-minimized');
            if (restoreBtn) restoreBtn.style.display = 'flex';
            if (innerPanel) innerPanel.style.display = 'none';
        } else {
            containerEl.classList.remove('panel-minimized');
            if (restoreBtn) restoreBtn.style.display = 'none';
            if (innerPanel) innerPanel.style.display = 'flex';
        }
	}
};
