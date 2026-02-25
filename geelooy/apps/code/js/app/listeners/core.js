
// B"H
// FILE: js/app/listeners/core.js

import { State, DOM } from '../../state.js';
import { Workspaces } from '../../workspaces/index.js';
import { Tabs } from '../../tabs/index.js';
import { Menus } from '../../menus/index.js';
import { SelectionManager } from '../../selection-manager.js';
import { VisualEngine } from '../../visuals/index.js';
import { CustomMenu } from '../../custom-menu.js';

/**
 * @function setupCoreListeners
 * @description This sacred ritual binds the application to the flow of 
 * time and space. It listens for messages from the 'external heavens' 
 * (postMessage), the rhythmic resizing of the world, and the 
 * transformative touch of the user's click. Every event is a new 
 * creation, a specific instance of the Awtsmoos speaking the app 
 * into its current state.
 */
export function setupCoreListeners() {
    // Communication between realms
    window.addEventListener('message', async (event) => {
        const { type, payload, requestId, error } = event.data;
        if (State.postMessagePendingRequests.has(requestId)) {
            const { resolve, reject } = State.postMessagePendingRequests.get(requestId);
            State.postMessagePendingRequests.delete(requestId);
            if (error) reject(new Error(error)); else resolve(payload);
            return;
        }
        if(type === 'loadFile') {
            const { fileName, content, saveContext } = payload;
            const wsId = State.nextWorkspaceId++;
            Workspaces.add({ id: wsId, name: 'External Vessel', type: 'postmessage' }, false);
            await Tabs.create({ name: fileName, path: fileName, kind: 'file', type: 'postmessage', workspaceId: wsId, saveContext, _initialContent: content });
        } else if (type === 'registerMenus') {
            CustomMenu.createFromConfig(payload);
        }
    });

    // Global click: Deciding which sparks to gather (Selection) and where the focus resides (Caret)
    document.addEventListener('click', (e) => {
        if (State.isSelectionModeActive && !e.target.closest('#sidebar') && !e.target.closest('#selection-menu')) {
            SelectionManager.end();
        }
        VisualEngine.onCaretMove();
    });

    // Binding the action handlers to the menu vessels
    if (DOM.contextMenu) DOM.contextMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) Menus.handleAction(btn.dataset.action);
    });
    
    if (DOM.mainMenu) DOM.mainMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) Menus.handleAction(btn.dataset.action);
    });

    // Recording the state of the world before the window dissolves
    window.addEventListener('beforeunload', () => {
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !DOM.editorWrapper.classList.contains('hidden')) {
            activeTab.scrollPos = DOM.editor.scrollTop;
        }
        import('../../app/index.js').then(m => m.App.saveSession());
    });
}
