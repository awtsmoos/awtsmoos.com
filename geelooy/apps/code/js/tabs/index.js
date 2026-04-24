
// B"H
import { TabFactory } from './factory.js';
import { TabOrchestrator } from './orchestrator.js';
import { TabsRenderer } from './rendering.js';
import { TabsLifecycle } from './lifecycle.js';
import { TabPathRitual } from './path-ritual.js';

export const Tabs = {
    getUniquePath: TabPathRitual.getUniquePath,
    
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        const { tab, isNew } = TabFactory.create(item, isNewFile);
        if (activate) await TabOrchestrator.activate(tab.id);
        else this.render();
        
        if (shouldSave && isNew) {
            import('../app.js').then(m => m.App.saveSession());
        }
        return tab;
    },

    activate: (id, force) => TabOrchestrator.activate(id, force),
    close: (id, force) => TabsLifecycle.close(id, force),
    render: () => TabsRenderer.render(document.getElementById('tab-bar'), Tabs),
    
    // Legacy support
    saveActive: () => TabsLifecycle.saveActive()
};
