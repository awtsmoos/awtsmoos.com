
// B"H
/**
 * @file TabIdentityManager.js
 * @brief The Master of the Canonical Seal. Generates collision-proof hashes for all tabs.
 * 
 * THE POEM OF THE FLAWLESS SEAL:
 * A name is a shadow, a path is a line,
 * But the Hash is the truth, absolute and divine.
 * We weave the Intent with the World and the Source,
 * Leaving no room for confusion or force.
 * Every Vibe is unique, every Preview is clear,
 * Banishing overlap, banishing fear!
 */
import { IntentRecognizer } from './IntentRecognizer.js';
import { PathSanitizer } from './PathSanitizer.js';

export const TabIdentityManager = {
    generateHash(item) {
        if (!item) return `void-tab-${Date.now()}-${Math.random()}`;

        const intent = IntentRecognizer.getIntent(item);
        const path = PathSanitizer.sanitize(item.path);
        
        if (intent === 'zip-entry') {
            return `intent[${intent}]::dim[zip]::parent[${item.zipTabId}]::path[${path}]`;
        }

        const worldId = String(item.workspaceId ?? item.id ?? 'global');
        const dimension = String(item.originalType ?? item.type ?? 'virtual').toLowerCase();

        // B"H - The ultimate, collision-proof hash
        return `intent[${intent}]::dim[${dimension}]::world[${worldId}]::path[${path}]`;
    }
};
