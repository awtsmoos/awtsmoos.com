// B"H
/**
 * @file AgentRoleRegistry.js
 * @brief Stores per-role preferred models (Planner/Builder/Tester/Reviewer).
 */

import { ModelManager } from '../../model-manager.js';
import { AgentCapabilities } from '../logic/AgentCapabilities.js';

const STORAGE_KEY = 'awtsmoos_agent_roles_v1';

export const AgentRoles = Object.freeze({
    auto: 'auto',
    planner: 'planner',
    builder: 'builder',
    tester: 'tester',
    reviewer: 'reviewer'
});

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function save(map) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map || {})); } catch {}
}

function normalizeRole(role) {
    const r = String(role || '').toLowerCase().trim();
    return Object.values(AgentRoles).includes(r) ? r : AgentRoles.auto;
}

export const AgentRoleRegistry = {
    get(role) {
        const r = normalizeRole(role);
        const map = load();
        return map[r] || null;
    },

    set(role, modelId) {
        const r = normalizeRole(role);
        const id = String(modelId || '').trim();
        const map = load();
        map[r] = id || null;
        save(map);
    },

    /**
     * @param {string} role
     * @param {object} opts
     * @param {boolean} opts.requireTools
     * @param {boolean} opts.requireFree
     * @returns {string|null}
     */
    chooseModelId(role, { requireTools = false, requireFree = false } = {}) {
        const r = normalizeRole(role);
        if (r === AgentRoles.auto) return ModelManager.currentModel;

        const preferred = this.get(r);
        if (preferred && ModelManager.getModel(preferred)) {
            const m = ModelManager.getModel(preferred);
            if (requireFree && !AgentCapabilities.isFree(m)) return null;
            if (requireTools && !AgentCapabilities.supportsTools(m)) return null;
            return preferred;
        }

        const pick = ModelManager.getPreferredModel({ requireTools, requireFree });
        return pick ? pick.id : ModelManager.currentModel;
    }
};

