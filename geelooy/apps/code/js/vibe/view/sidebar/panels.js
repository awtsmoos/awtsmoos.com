
// B"H
import { TimelineUI } from '../timeline-ui.js';

export const VibeSidebarPanels = {
    sync(container, tab, controller) {
        const active = tab.vibeSession.viewState.activeSidebarTab || 'tree';
        console.log(`[VibeSidebarPanels] B"H - Syncing panels. Active: ${active}`);
        
        const views = {
            'tree': container.querySelector('#vibe-tree-container'),
            'manifest': container.querySelector('#vibe-manifest-container'),
            'timeline': container.querySelector('#vibe-timeline-container')
        };

        Object.entries(views).forEach(([id, el]) => {
            if (!el) {
                console.warn(`[VibeSidebarPanels] Element not found: ${id}`);
                return;
            }
            const isVisible = (id === active);
            // B"H - Use flex for manifest so its inner wrapper can expand
            el.style.display = isVisible ? (id === 'manifest' ? 'flex' : 'block') : 'none';
            
            if (id === 'manifest' && isVisible) {
                el.style.flexDirection = 'column';
            }
            if (id === 'timeline' && isVisible) {
                TimelineUI.render(el, tab, controller);
            }
        });

        container.querySelectorAll('.vibe-sb-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === active);
        });
    }
};
