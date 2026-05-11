
// B"H
import { TimelineUI } from '../timeline-ui.js';

export const VibeSidebarPanels = {
    sync(container, tab, controller) {
        const active = tab.vibeSession.viewState.activeSidebarTab || 'tree';
        console.log('[VibeSidebarPanels] B"H - Syncing panels. Active: ' + active);
        
        const views = {
            'tree': container.querySelector('#vibe-tree-container'),
            'manifest': container.querySelector('#vibe-manifest-container'),
            'timeline': container.querySelector('#vibe-timeline-container'),
            'chats': container.querySelector('#vibe-chats-container')
        };

        Object.entries(views).forEach(([id, el]) => {
            if (!el) return;
            const isVisible = (id === active);
            el.style.display = isVisible ? (id === 'manifest' ? 'flex' : 'block') : 'none';
            
            if (id === 'manifest' && isVisible) {
                el.style.flexDirection = 'column';
            }
            if (id === 'timeline' && isVisible) {
                TimelineUI.render(el, tab, controller);
            }
            // B"H - Trigger the rendering of the Project Chats Ledger
            if (id === 'chats' && isVisible) {
                import('./chats-ui.js').then(m => m.ChatsUI.render(el, tab, controller));
            }
        });

        container.querySelectorAll('.vibe-sb-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === active);
        });
    }
};
