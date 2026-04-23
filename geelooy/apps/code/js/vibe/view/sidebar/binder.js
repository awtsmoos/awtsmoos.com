
// B"H
import { VibeHeaderActions } from './header-actions.js';
import { SidebarController } from './controller.js';

export const VibeSidebarBinder = {
    bind(container, tab, onUpdate) {
        VibeHeaderActions.bind(container, tab, onUpdate);
        SidebarController.bind(container, tab, onUpdate);
    }
};
