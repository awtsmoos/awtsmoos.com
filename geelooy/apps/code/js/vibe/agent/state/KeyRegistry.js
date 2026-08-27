
// B"H
/**
 * @file KeyRegistry.js
 * @brief The Master Ledger of Access.
 */

import { ProviderUtils } from './ProviderRegistry.js';

export const KeyRegistry = {
    getAll() {
        const stored = localStorage.getItem('awtsmoos_key_registry');
        if (!stored) return [];
        try { return JSON.parse(stored); } catch(e) { return []; }
    },

    save(keys) {
        localStorage.setItem('awtsmoos_key_registry', JSON.stringify(keys));
    },

    add(rawKey, label = null) {
        const keys = this.getAll();
        
        // Prevent duplicate keys
        if (keys.some(k => k.key === rawKey)) return keys.find(k => k.key === rawKey);

        const provider = ProviderUtils.detect(rawKey);
        const providerId = provider ? provider.id : 'unknown';
        const displayLabel = label || `${providerId.toUpperCase()} (..${rawKey.slice(-4)})`;
        
        const newKey = {
            id: 'k_' + Math.random().toString(36).substr(2, 9),
            label: displayLabel,
            key: rawKey,
            provider: providerId,
            addedAt: Date.now()
        };

        keys.push(newKey);
        this.save(keys);
        return newKey;
    },

    remove(id) {
        const keys = this.getAll().filter(k => k.id !== id);
        this.save(keys);
    }
};
