
// B"H
import { SidebarUI } from '../sidebar-ui.js';
import { TimelineUI } from '../timeline-ui.js';
import { ExternalManifest } from '../../modules/ExternalManifest.js';

export const VibeSidebarManager = {
    sync(container, tab, controller) {
        const sess = tab.vibeSession;
        const active = sess.viewState.activeSidebarTab || 'tree';
        
        const treeC = container.querySelector('#vibe-tree-container');
        const manifestC = container.querySelector('#vibe-manifest-container');
        const timelineC = container.querySelector('#vibe-timeline-container');

        if (treeC) treeC.style.display = (active === 'tree' ? 'block' : 'none');
        if (manifestC) manifestC.style.display = (active === 'manifest' ? 'block' : 'none');
        if (timelineC) {
            timelineC.style.display = (active === 'timeline' ? 'block' : 'none');
            if (active === 'timeline') TimelineUI.render(timelineC, tab, controller);
        }

        const tabs = container.querySelectorAll('.vibe-sb-tab');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === active));
    }
};
