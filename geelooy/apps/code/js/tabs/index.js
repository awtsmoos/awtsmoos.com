
// B"H
/**
 * @file tabs/index.js
 * @brief The Master Facade of Manifested Documents.
 */

import { TabsCreation } from './creation.js';
import { TabsNavigation } from './navigation.js';
import { TabsLifecycle } from './lifecycle.js';
import { TabsRenderer } from './rendering.js';
import { TabsPersistence } from './persistence.js';
import { DOM } from '../state.js';

export const Tabs = {
    getUniquePath: (item) => `${item.workspaceId ?? 'temp'}::${item.path ?? item.name}`,
    
    create: (...args) => TabsCreation.create(...args),
    createPreview: (...args) => TabsCreation.createPreview(...args),
    
    updatePreviewContext: (...args) => TabsNavigation.updatePreviewContext(...args),
    goBackPreview: (...args) => TabsNavigation.goBackPreview(...args),
    activate: (...args) => TabsNavigation.activate(...args),
    
    close: (...args) => TabsLifecycle.close(...args),
    saveActive: (...args) => TabsLifecycle.saveActive(...args),
    save: (tab) => TabsPersistence.save(tab, Tabs),
    
    render: () => TabsRenderer.render(DOM.tabBar, Tabs)
};
