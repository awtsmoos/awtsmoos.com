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
        if (!sess.viewState) sess.viewState = { activeSidebarTab: 'chat', isSidebarCollapsed: false };

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

    

    // B"H - Updated _bind in js/vibe/vibe-view.js
	_bind: function(tab, controller) {
	    var self = this;
	    var sendBtn = document.getElementById('vibe-send-btn');
	    if (sendBtn) sendBtn.onclick = function() { controller.sendMessage(tab); };
	    
	    var resetBtn = document.getElementById('vibe-reset-btn');
	    if (resetBtn) resetBtn.onclick = function() { controller.resetChat(tab); };
	    
	    // B"H - FIXED: Call controller explicitly
	    var mgrBtn = document.getElementById('vibe-mgr-btn');
	    if (mgrBtn) mgrBtn.onclick = function() { controller.openManager(); };
	    
	    var sideToggle = document.getElementById('vibe-sidebar-toggle-btn');
	    if(sideToggle) sideToggle.onclick = function() {
	        tab.vibeSession.viewState.isSidebarCollapsed = !tab.vibeSession.viewState.isSidebarCollapsed;
	        self.render(tab, controller);
	    };
	
	    var tabs = this.container.querySelectorAll('.vibe-sb-tab');
	    for(var i = 0; i < tabs.length; i++) {
	        (function(idx) {
	            tabs[idx].onclick = function() {
	                tab.vibeSession.viewState.activeSidebarTab = tabs[idx].dataset.tab;
	                self.render(tab, controller);
	            };
	        })(i);
	    }
	},

    // B"H - Updated _inject in js/vibe/vibe-view.js
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
	                        '<button id="vibe-mgr-btn" class="secondary-btn" title="Vibe Manager">Manager</button>' +
	                        '<button id="vibe-reset-btn" class="secondary-btn">Reset</button>' +
	                        '<button id="vibe-sidebar-toggle-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-sidebar"></use></svg></button>' +
	                    '</div>' +
	                '</div>' +
	            '</div>' +
	            '<div class="vibe-resizer"></div>' +
	            '<div class="vibe-side-panel" id="vibe-side-panel">' +
	                '<div class="vibe-sidebar-tabs">' +
	                    '<div class="vibe-sb-tab" data-tab="tree">Tree</div>' +
	                    '<div class="vibe-sb-tab" data-tab="manifest">External</div>' +
	                    '<div class="vibe-sb-tab" data-tab="checkpoints">Checkpoints</div>' +
	                '</div>' +
	                // B"H - Each container is now allowed to scroll internally
	                '<div id="vibe-tree-container" class="vibe-context-list" style="display:none; flex-grow:1; overflow-y:auto;"></div>' +
	                '<div id="vibe-manifest-container" class="vibe-manifest-view" style="display:none; flex-grow:1; overflow:hidden;"></div>' +
	                '<div id="vibe-checkpoints-container" style="display:none; flex-grow:1; overflow-y:auto; padding:15px;"></div>' +
	                '<div class="vibe-settings-area"><div id="vibe-model-badge" style="font-size:0.8em; opacity:0.6; cursor:pointer;">...</div></div>' +
	            '</div>' +
	        '</div>';
	},
	
	// B"H - Updated _sync in js/vibe/vibe-view.js
	_sync: function(tab, controller) {
	    var session = tab.vibeSession;
	    var active = session.viewState.activeSidebarTab || 'tree';
	    var panel = this.container.querySelector('#vibe-side-panel');
	    
	    var treeC = document.getElementById('vibe-tree-container');
	    var manifestC = document.getElementById('vibe-manifest-container');
	    var checkpointsC = document.getElementById('vibe-checkpoints-container');
	    var inputArea = document.getElementById('vibe-input-area');
	
	    // Toggle Tab Highlights
	    var tabs = panel.querySelectorAll('.vibe-sb-tab');
	    for (var i = 0; i < tabs.length; i++) {
	        tabs[i].classList.toggle('active', tabs[i].dataset.tab === active);
	    }
	    
	    // Toggle Containers
	    if(treeC) treeC.style.display = (active === 'tree' ? 'block' : 'none');
	    if(manifestC) manifestC.style.display = (active === 'manifest' ? 'flex' : 'none');
	    if(checkpointsC) checkpointsC.style.display = (active === 'checkpoints' ? 'block' : 'none');
	    
	    // Hide input in External or Checkpoint mode
	    if(inputArea) inputArea.style.display = (active === 'tree' ? 'flex' : 'none');
	
	    // Render Checkpoints if active
	    if (active === 'checkpoints') {
	        import('./view/checkpoint-ui.js').then(function(m) { m.CheckpointUI.render(checkpointsC, tab, controller); });
	    }
	}
	
};
