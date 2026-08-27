
// B"H
/**
 * @file TabRegistry.js
 * @brief THE LEDGER OF UNIQUE MANIFESTATIONS.
 */

import { State } from '../../state.js';
import { TripleSealForge } from '../../core/identity/TripleSealForge.js';
import { IntentDiscriminator } from './registry/IntentDiscriminator.js';

export const TabRegistry = {
    /**
     * @function getCanonicalKey
     * @description Weaves the Triple Seal with a strictly discriminated Intent.
     */
    getCanonicalKey(item) {
        const seal = TripleSealForge.cast(item);
        const intent = IntentDiscriminator.determine(item);
        return `${intent}::${seal}`;
    },

    /**
     * @function findMatch
     * @description Seeks an existing tab that matches the EXACT intent and identity.
     */
    findMatch(item) {
        const targetKey = this.getCanonicalKey(item);
        
        return State.tabs.find(existingTab => {
            const existingKey = this.getCanonicalKey({
                ...existingTab.item,
                fileType: existingTab.fileType
            });
            return existingKey === targetKey;
        });
    }
};
