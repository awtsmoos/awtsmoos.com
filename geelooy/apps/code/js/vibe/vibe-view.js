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
        if (!sess.viewState) sess.viewState = { activeSidebarTab: 'tree', isSidebarCollapsed: false };

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
                    /* B"H --- THIS IS THE CORRECTED, COMPLETE HTML FOR THE SIDEBAR --- */
	                '<div class="vibe-sidebar-tabs">' +
	                    '<div class="vibe-sb-tab" data-tab="tree">Tree</div>' +
	                    '<div class="vibe-sb-tab" data-tab="manifest">External</div>' +
	                    '<div class="vibe-sb-tab" data-tab="checkpoints">Checkpoints</div>' +
	                '</div>' +
	                '<div id="vibe-tree-container" class="vibe-context-list" style="flex-grow:1; overflow-y:auto;"></div>' +
	                '<div id="vibe-manifest-container" class="vibe-manifest-view" style="display:none; flex-grow:1; overflow:hidden;"></div>' +
	                '<div id="vibe-checkpoints-container" style="display:none; flex-grow:1; overflow-y:auto; padding:15px;"></div>' +
	                '<div class="vibe-settings-area"><div id="vibe-model-badge" style="font-size:0.8em; opacity:0.6; cursor:pointer;">...</div></div>' +
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

	    // --- Event Listeners ---
        if (sendBtn) sendBtn.onclick = () => controller.sendMessage(tab);
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); controller.sendMessage(tab); }};
	    if (resetBtn) resetBtn.onclick = () => controller.resetChat(tab);
	    if (mgrBtn) mgrBtn.onclick = () => controller.openManager(); 
	    if(sideToggle) sideToggle.onclick = () => {
	        tab.vibeSession.viewState.isSidebarCollapsed = !tab.vibeSession.viewState.isSidebarCollapsed;
	        self.render(tab, controller);
	    };
        tabs.forEach(t => {
            t.onclick = () => {
                tab.vibeSession.viewState.activeSidebarTab = t.dataset.tab;
                self.render(tab, controller);
            };
        });

        // B"H --- FULL DRAGGABLE RESIZER LOGIC ---

        const verticalResizer = this.container.querySelector('#vibe-resizer-vertical');
        const horizontalResizer = this.container.querySelector('#vibe-resizer-horizontal');
        const chatPanel = this.container.querySelector('.vibe-chat-panel');
        const sidePanel = this.container.querySelector('.vibe-side-panel');
        const vibeContainer = this.container.querySelector('.vibe-container');
        
        // --- DESKTOP (DRAG LEFT/RIGHT) ---
        const handleVerticalMove = (e) => {
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            if (clientX === undefined) return;
            const containerRight = vibeContainer.getBoundingClientRect().right;
            const newSideWidth = containerRight - clientX;
            sidePanel.style.width = `${newSideWidth}px`; // Directly set the width
        };

        const stopVerticalResize = () => {
            document.body.classList.remove('is-resizing', 'is-resizing-horizontal');
            document.removeEventListener('mousemove', handleVerticalMove);
            document.removeEventListener('mouseup', stopVerticalResize);
        };

        verticalResizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing', 'is-resizing-horizontal');
            document.addEventListener('mousemove', handleVerticalMove);
            document.addEventListener('mouseup', stopVerticalResize);
        });

        // --- MOBILE (DRAG UP/DOWN) ---
        const handleHorizontalMove = (e) => {
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientY === undefined) return;
            const newChatHeight = clientY - vibeContainer.getBoundingClientRect().top;
            chatPanel.style.flexBasis = `${newChatHeight}px`; // Use flex-basis for height
        };
        
        const stopHorizontalResize = () => {
            document.body.classList.remove('is-resizing', 'is-resizing-vertical');
            document.removeEventListener('mousemove', handleHorizontalMove);
            document.removeEventListener('mouseup', stopHorizontalResize);
        };

        horizontalResizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            document.body.classList.add('is-resizing', 'is-resizing-vertical');
            document.addEventListener('mousemove', handleHorizontalMove);
            document.addEventListener('mouseup', stopHorizontalResize);
        });
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
	    if(inputArea) inputArea.style.display = (active === 'tree' ? 'flex' : 'none');
	
	    if (active === 'checkpoints') {
	        import('./view/checkpoint-ui.js').then(m => m.CheckpointUI.render(checkpointsC, tab, controller));
	    }
	}
};