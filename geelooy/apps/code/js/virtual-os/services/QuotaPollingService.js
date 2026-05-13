// B"H
/**
 * @file QuotaPollingService.js
 * @description Polls quota/rate-limit headers for every configured provider key.
 */

import { KeyRegistry } from '../../vibe/agent/state/KeyRegistry.js';
import { QuotaAdapters } from './QuotaAdapters.js';

const KEY = 'awtsmoos_virtual_os_provider_quotas_v1';

export const QuotaPollingService = {
    restore() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : { providers: [], updatedAt: null };
        } catch (error) {
            return { providers: [], updatedAt: null };
        }
    },

    save(snapshot) {
        localStorage.setItem(KEY, JSON.stringify(snapshot));
    },

    async pollAll() {
        const keys = KeyRegistry.getAll();
        const bestKeyByProvider = new Map();
        for (const key of keys) {
            if (!bestKeyByProvider.has(key.provider)) bestKeyByProvider.set(key.provider, key.key);
        }
        const providers = [];
        for (const [providerId, token] of bestKeyByProvider.entries()) {
            const result = await QuotaAdapters.probe(providerId, token);
            providers.push(result);
        }
        const snapshot = { providers, updatedAt: new Date().toISOString() };
        this.save(snapshot);
        return snapshot;
    }
};
