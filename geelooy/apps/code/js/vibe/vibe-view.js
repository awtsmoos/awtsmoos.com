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

    

    _bind(tab, controller) {
        document.getElementById('vibe-send-btn').onclick = async () => {
            if (tab.vibeSession.viewState.activeSidebarTab === 'manifest' && tab.vibeSession.pendingChanges) {
                if (await ExternalManifest.execute(tab, controller.getRootItem(tab))) {
                    const xmlInp = this.container.querySelector('#em-xml');
                    if(xmlInp) xmlInp.value = '';
                    this.render(tab, controller);
                }
            } else controller.sendMessage(tab);
        };
        document.getElementById('vibe-reset-btn').onclick = () => controller.resetChat(tab);
        
        const sideToggle = document.getElementById('vibe-sidebar-toggle-btn');
        if(sideToggle) sideToggle.onclick = () => {
            tab.vibeSession.viewState.isSidebarCollapsed = !tab.vibeSession.viewState.isSidebarCollapsed;
            this.render(tab, controller);
        };

        this.container.querySelectorAll('.vibe-sb-tab').forEach(t => t.onclick = () => {
            tab.vibeSession.viewState.activeSidebarTab = t.dataset.tab;
            this.render(tab, controller);
        });
    },

    // B"H - Updated _inject in vibe-view.js
	_inject: function() {
	    // Breaking up tags manually
	    var chatHtml = '<div id="vibe-chat-history" class="vibe-chat-history"></div>';
	    var inputHtml = '<div id="vibe-input-area" class="vibe-input-area">' +
	                        '<div class="vibe-input-wrapper">' +
	                            '<textarea id="vibe-input" class="vibe-textarea" placeholder="Speak your will..."></textarea>' +
	                            '<button id="vibe-send-btn" class="primary-btn">➤</button>' +
	                        '</div>' +
	                        '<div class="vibe-actions">' +
	                            '<button id="vibe-reset-btn" class="secondary-btn">Reset Chat</button>' +
	                            '<button id="vibe-sidebar-toggle-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-sidebar"></use></svg></button>' +
	                        '</div>' +
	                    '</div>';
	
	    this.container.innerHTML = 
	        '<div class="vibe-container">' +
	            // LEFT PANEL: ALWAYS VISIBLE
	            '<div class="vibe-chat-panel">' +
	                chatHtml +
	                inputHtml +
	            '</div>' +
	            '<div class="vibe-resizer"></div>' +
	            // RIGHT PANEL: TOGGLES TREE / EXTERNAL
	            '<div class="vibe-side-panel" id="vibe-side-panel">' +
	                '<div class="vibe-sidebar-tabs">' +
	                    '<div class="vibe-sb-tab" data-tab="tree">Tree</div>' +
	                    '<div class="vibe-sb-tab" data-tab="manifest">External</div>' +
	                '</div>' +
	                '<div id="vibe-tree-container" class="vibe-context-list" style="flex-grow:1;"></div>' +
	                '<div id="vibe-manifest-container" class="vibe-manifest-view" style="flex-grow:1;"></div>' +
	                '<div class="vibe-settings-area"><div id="vibe-model-badge" style="font-size:0.8em; opacity:0.6;">...</div></div>' +
	            '</div>' +
	        '</div>';
	},
	
	// B"H - Updated _sync in js/vibe/vibe-view.js
	_sync: function(tab, controller) {
	    var active = tab.vibeSession.viewState.activeSidebarTab || 'tree';
	    var panel = this.container.querySelector('#vibe-side-panel');
	    var inputArea = document.getElementById('vibe-input-area');
	    var treeCont = document.getElementById('vibe-tree-container');
	    var manifestCont = document.getElementById('vibe-manifest-container');
	
	    var tabEls = panel.querySelectorAll('.vibe-sb-tab');
	    for(var i = 0; i < tabEls.length; i++) {
	        tabEls[i].classList.toggle('active', tabEls[i].dataset.tab === active);
	    }
	    
	    // B"H - Layout Fix: Ensure containers use flex and scroll correctly
	    if (treeCont) {
	        treeCont.style.display = (active === 'tree') ? 'block' : 'none';
	    }
	    if (manifestCont) {
	        manifestCont.style.display = (active === 'manifest') ? 'flex' : 'none';
	        manifestCont.style.flexDirection = 'column';
	        manifestCont.style.height = '100%';
	        manifestCont.style.overflow = 'hidden'; // Inner div will handle scrolling
	    }
	    
	    if (inputArea) inputArea.style.display = (active === 'manifest') ? 'none' : 'flex';
	    
	    if (tab.vibeSession.viewState.isSidebarCollapsed) panel.classList.add('collapsed');
	    else panel.classList.remove('collapsed');
	}
};
