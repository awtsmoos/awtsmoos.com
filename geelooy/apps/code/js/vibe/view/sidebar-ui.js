// B"H
// FILE: js/vibe/view/sidebar-ui.js
import { WorkspaceTreeRenderer } from '../../workspaces/tree-rendering.js';
import { State } from '../../state.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export const SidebarUI = {
    render(container, tab, controller) {
        const session = tab.vibeSession;
        const panel = container.querySelector('#vibe-side-panel');
        if (!panel) return;
        
        if (session.viewState.isSidebarCollapsed) {
            panel.classList.add('collapsed');
        } else {
            panel.classList.remove('collapsed');
        }

        const toggleBtn = container.querySelector('#vibe-sidebar-toggle-btn');
        if (toggleBtn) {
            if (session.viewState.isSidebarCollapsed) {
                toggleBtn.classList.add('active'); 
                toggleBtn.innerHTML = '<svg class="svg-icon"><use href="#icon-sidebar"></use></svg>'; 
            } else {
                toggleBtn.classList.remove('active');
            }
        }

        const activeTab = session.viewState.activeSidebarTab;
        const tabTree = panel.querySelector('[data-tab="tree"]');
        const tabStream = panel.querySelector('[data-tab="stream"]');
        
        if (activeTab === 'tree') {
            tabTree?.classList.add('active');
            tabStream?.classList.remove('active');
            panel.querySelector('#vibe-tree-container')?.classList.add('visible');
            panel.querySelector('#vibe-stream-container')?.classList.remove('visible');
        } else {
            tabTree?.classList.remove('active');
            tabStream?.classList.add('active');
            panel.querySelector('#vibe-tree-container')?.classList.remove('visible');
            panel.querySelector('#vibe-stream-container')?.classList.add('visible');
        }

        const iterBadge = panel.querySelector('#vibe-iter-badge');
        if(iterBadge) iterBadge.textContent = `Loops: ${State.vibeIterations}`;
    },

    async refreshTree(container, rootItem, controller) {
        const treeContainer = container.querySelector('#vibe-tree-container');
        if (!treeContainer) return;
        
        treeContainer.innerHTML = '<ul class="workspace-tree" style="padding-left:0;"></ul>';
        const ul = treeContainer.querySelector('ul');
        
        await WorkspaceTreeRenderer.renderTree(ul, rootItem, 0, true, {
            onFileClick: (item) => controller.previewFile(null, item.path)
        });
    },

    updateStreamContent(container, content) {
        const streamContainer = container.querySelector('#vibe-stream-container');
        if (!streamContainer) return;

        // B"H - Syntax Highlighting Logic
        // We look for a header to determine extension, default to js
        let lang = 'js';
        const firstLine = content.split('\n')[0] || '';
        if (firstLine.includes('.html')) lang = 'html';
        else if (firstLine.includes('.css')) lang = 'css';
        else if (firstLine.includes('.json')) lang = 'json';
        else if (firstLine.includes('.md')) lang = 'markdown';

        // Clear and rebuild to allow highlighter to run
        streamContainer.innerHTML = '';
        
        const pre = document.createElement('pre');
        pre.style.margin = '0';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontFamily = 'var(--font-code)';
        pre.textContent = content; // Set text first
        
        streamContainer.appendChild(pre);
        
        // Apply highlighting
        try {
            if (content.length < 50000) { // Safety limit for huge streams
                new pnimi(pre, lang);
            }
        } catch(e) {
            console.warn("Highlighter failed on stream", e);
        }

        streamContainer.scrollTop = streamContainer.scrollHeight;
    }
};