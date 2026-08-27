// B"H
/**
 * @file ModelLimitsTable.js
 * @brief Pure JSON -> DOM table builder for model limits.
 */

import { HTML } from '../../../html-generator.js';

function tag(text, cls) {
    return { tag: 'span', className: `model-limits-tag ${cls}`, text };
}

function formatContext(value) {
    if (value === null || value === undefined) return 'Unknown';
    const n = Number(value);
    return Number.isFinite(n) ? String(n) : String(value);
}

function formatLimits(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

/**
 * @param {object} args
 * @param {Array<object>} args.records
 * @returns {HTMLElement}
 */
export function renderModelLimitsTable({ records }) {
    const rows = (Array.isArray(records) ? records : []).map((r) => ({
        tag: 'tr',
        children: [
            {
                tag: 'td',
                children: [
                    r.isFree ? tag('FREE', 'free') : null,
                    r.supportsTools ? tag('TOOLS', 'tools') : null,
                    r.isReasoning ? tag('REASON', 'reason') : null,
                    { tag: 'div', className: 'model-limits-mono', text: r.displayName || r.id },
                    { tag: 'div', style: { opacity: 0.65, marginTop: '6px' }, text: r.id }
                ].filter(Boolean)
            },
            { tag: 'td', className: 'model-limits-mono', text: r.provider },
            { tag: 'td', className: 'model-limits-mono', text: formatContext(r.contextWindow) },
            { tag: 'td', className: 'model-limits-mono', text: r.maxCompletionTokens ? String(r.maxCompletionTokens) : '' },
            { tag: 'td', className: 'model-limits-mono', text: r.pricing || 'Unknown' },
            { tag: 'td', className: 'model-limits-mono', text: formatLimits(r.perRequestLimits) }
        ]
    }));

    return HTML({
        tag: 'table',
        className: 'model-limits-table',
        children: [
            {
                tag: 'thead',
                children: [{
                    tag: 'tr',
                    children: [
                        { tag: 'th', text: 'Model' },
                        { tag: 'th', text: 'Provider' },
                        { tag: 'th', text: 'Context' },
                        { tag: 'th', text: 'Max Out' },
                        { tag: 'th', text: 'Pricing' },
                        { tag: 'th', text: 'Per-request limits' }
                    ]
                }]
            },
            { tag: 'tbody', children: rows }
        ]
    });
}

