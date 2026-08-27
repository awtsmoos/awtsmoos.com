// B"H
/**
 * @file ModelLimitsModal.js
 * @brief Quick-access modal to view model limits from the chat view.
 */

import { UI } from '../../../../ui.js';
import { ModelManager } from '../../../model-manager.js';
import { HTML } from '../../../../html-generator.js';
import { buildModelLimitRecords } from '../../model-limits/ModelLimitsData.js';
import { renderModelLimitsTable } from '../../model-limits/ModelLimitsTable.js';

function normalizeQuery(q) {
    return String(q || '').trim().toLowerCase();
}

function filter(records, query) {
    const q = normalizeQuery(query);
    if (!q) return records;
    return records.filter((r) => (`${r.id} ${r.displayName} ${r.provider}`.toLowerCase().includes(q)));
}

export const ModelLimitsModal = {
    async show() {
        const models = ModelManager.availableModels || [];
        const base = buildModelLimitRecords(models);

        const result = await UI.showDialog({
            title: 'B"H - Model Usage Limits',
            contentHTML: '',
            okText: 'Close',
            cancelText: null
        });

        const diagContent = document.querySelector('.dialog-content');
        if (!diagContent) return result;

        const wrap = HTML({
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    className: 'model-limits-controls',
                    children: [
                        { tag: 'input', id: 'vibe-model-limits-q', type: 'text', placeholder: 'Search...' },
                        { tag: 'button', id: 'vibe-model-limits-refresh', className: 'secondary-btn', text: 'REFRESH MODELS' },
                        { tag: 'button', id: 'vibe-model-limits-copy', className: 'secondary-btn', text: 'COPY JSON' }
                    ]
                },
                { id: 'vibe-model-limits-table', children: [renderModelLimitsTable({ records: base })] }
            ]
        });

        diagContent.insertBefore(wrap, diagContent.querySelector('.dialog-button-bar'));

        const q = document.getElementById('vibe-model-limits-q');
        const table = document.getElementById('vibe-model-limits-table');
        const refreshBtn = document.getElementById('vibe-model-limits-refresh');
        const copyBtn = document.getElementById('vibe-model-limits-copy');

        const rerender = () => {
            if (!table) return;
            const records = filter(buildModelLimitRecords(ModelManager.availableModels || []), q ? q.value : '');
            table.innerHTML = '';
            table.appendChild(renderModelLimitsTable({ records }));
        };

        if (q) q.oninput = rerender;
        if (refreshBtn) refreshBtn.onclick = async () => { await ModelManager.refreshModels(); rerender(); };
        if (copyBtn) copyBtn.onclick = async () => {
            const records = filter(buildModelLimitRecords(ModelManager.availableModels || []), q ? q.value : '');
            const payload = JSON.stringify({ generatedAt: new Date().toISOString(), models: records }, null, 2);
            try { await navigator.clipboard.writeText(payload); } catch {}
        };

        window.addEventListener('awtsmoos-models-updated', rerender);
        return result;
    }
};

