
// B"H
/**
 * @file TabRegistrySentinel.js
 * @brief THE GUARD OF THE OPEN SCROLLS.
 */

import { State } from '../../state.js';
import { CanonicalSeal } from '../../core/identity/CanonicalSeal.js';
import { IntentIsolation } from './registry/IntentIsolation.js';

export const TabRegistrySentinel = {
    /**
     * @function findExisting
     * @description Seeks a tab that matches the EXACT intent and coordinate.
     */
    findExisting(item) {
        const intent = IntentIsolation.identify(item);
        const searchSeal = CanonicalSeal.cast(item, intent);

        return State.tabs.find(t => {
            // When checking existing tabs, we must look at their assigned fileType/type
            const existingIntent = IntentIsolation.identify({ ...t.item, fileType: t.fileType });
            const existingSeal = CanonicalSeal.cast(t.item, existingIntent);
            return existingSeal === searchSeal;
        });
    },

    /**
     * @function generateKey
     * @description Creates the unique key for State storage.
     */
    generateKey(item) {
        const intent = IntentIsolation.identify(item);
        return CanonicalSeal.cast(item, intent);
    }
};
