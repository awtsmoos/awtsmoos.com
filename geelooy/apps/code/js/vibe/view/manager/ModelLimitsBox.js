// B"H
/**
 * @file ModelLimitsBox.js
 * @brief Manager dashboard box: show model usage limits + filters.
 */

import { ModelManager } from '../../model-manager.js';
import { AgentCapabilities } from '../../agent/logic/AgentCapabilities.js';
import { HTML } from '../../../html-generator.js';
import { buildModelLimitRecords } from '../model-limits/ModelLimitsData.js';
import { renderModelLimitsTable } from '../model-limits/ModelLimitsTable.js';

function applyFilters(records, { q, freeOnly, toolsOnly } = {}) {
    const query = String(q || '').trim().toLowerCase();
    return records.filter((r) => {
        if (freeOnly && !r.isFree) return false;
        if (toolsOnly && !r.supportsTools) return false;
        if (!query) return true;
        const hay = `${r.id} ${r.displayName} ${r.provider}`.toLowerCase();
        return hay.includes(query);
    });
}

export const ModelLimitsBox = {
    build() {
        const models = ModelManager.availableModels || [];
        const records = buildModelLimitRecords(models).sort((a, b) => {
            const aFree = a.isFree ? 1 : 0;
            const bFree = b.isFree ? 1 : 0;
            if (aFree !== bFree) return bFree - aFree;
            const aTools = a.supportsTools ? 1 : 0;
            const bTools = b.supportsTools ? 1 : 0;
            if (aTools !== bTools) return bTools - aTools;
            return String(a.displayName || a.id).localeCompare(String(b.displayName || b.id));
        });

        const freeCount = models.filter((m) => AgentCapabilities.isFree(m)).length;
        const toolCount = models.filter((m) => AgentCapabilities.supportsTools(m)).length;

        return {
            className: 'vibe-manager-box model-limits',
            children: [
                {
                    className: 'vibe-manager-title-row',
                    children: [
                        { tag: 'h3', className: 'vibe-manager-box-title', text: '◈ Model Limits' },
                        { tag: 'button', id: 'mgr-refresh-models', className: 'secondary-btn', text: 'REFRESH' }
                    ]
                },
                {
                    className: 'model-limits-controls',
                    children: [
                        { tag: 'input', id: 'mgr-model-q', type: 'text', placeholder: 'Search model id / name / provider...' },
                        { tag: 'label', className: 'pill', children: [{ tag: 'input', id: 'mgr-free-only', type: 'checkbox' }, { tag: 'span', text: `Free-only (${freeCount})` }] },
                        { tag: 'label', className: 'pill', children: [{ tag: 'input', id: 'mgr-tools-only', type: 'checkbox' }, { tag: 'span', text: `Tools-only (${toolCount})` }] },
                        { tag: 'button', id: 'mgr-copy-limits', className: 'secondary-btn', text: 'COPY JSON' }
                    ]
                },
                {
                    id: 'mgr-model-limits-table',
                    children: [renderModelLimitsTable({ records })]
                }
            ]
        };
    },

    bind(container, refresh) {
        const tableWrap = container.querySelector('#mgr-model-limits-table');
        if (!tableWrap) return;

        const getState = () => ({
            q: container.querySelector('#mgr-model-q')?.value || '',
            freeOnly: !!container.querySelector('#mgr-free-only')?.checked,
            toolsOnly: !!container.querySelector('#mgr-tools-only')?.checked
        });

        const render = () => {
            const records = buildModelLimitRecords(ModelManager.availableModels || []);
            const filtered = applyFilters(records, getState());
            tableWrap.innerHTML = '';
            tableWrap.appendChild(renderModelLimitsTable({ records: filtered }));
        };

        const q = container.querySelector('#mgr-model-q');
        const freeOnly = container.querySelector('#mgr-free-only');
        const toolsOnly = container.querySelector('#mgr-tools-only');
        if (q) q.oninput = render;
        if (freeOnly) freeOnly.onchange = render;
        if (toolsOnly) toolsOnly.onchange = render;

        const copyBtn = container.querySelector('#mgr-copy-limits');
        if (copyBtn) {
            copyBtn.onclick = async () => {
                const records = buildModelLimitRecords(ModelManager.availableModels || []);
                const filtered = applyFilters(records, getState());
                const payload = JSON.stringify({ generatedAt: new Date().toISOString(), models: filtered }, null, 2);
                try { await navigator.clipboard.writeText(payload); } catch {}
            };
        }

        const refreshBtn = container.querySelector('#mgr-refresh-models');
        if (refreshBtn) refreshBtn.onclick = async () => { await ModelManager.refreshModels(); refresh(); };

        window.addEventListener('awtsmoos-models-updated', render);
        render();
    }
};

