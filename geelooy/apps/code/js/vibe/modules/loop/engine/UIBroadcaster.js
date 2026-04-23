
// B"H
/**
 * @file UIBroadcaster.js
 * @brief Signals the physical tabs that reality has shifted beneath them.
 */

import { State } from '../../../../state.js';

export const UIBroadcaster = {
    /**
     * B"H
     * Finds open tabs representing the altered file and refreshes them.
     * @param {Object} shiftObjRef - The change payload.
     * @param {string|number} systemWSIDKey - The Workspace ID.
     */
    broadcast(shiftObjRef, systemWSIDKey) {
        const visualOpenedDocumentRef = State.tabs.find(t => t.item.path === shiftObjRef.path && String(t.item.workspaceId) === String(systemWSIDKey));
        if (visualOpenedDocumentRef && shiftObjRef.operation !== 'delete') {
            visualOpenedDocumentRef.content = shiftObjRef.content;
            visualOpenedDocumentRef.isDirty = false;
            visualOpenedDocumentRef.isUncommitted = true;
            if (State.activeTabId === visualOpenedDocumentRef.id) {
                import('../../../../editor.js').then(({ Editor }) => {
                    if (Editor && Editor.setCurrentContent) Editor.setCurrentContent(shiftObjRef.content);
                });
            }
        }
    }
};
