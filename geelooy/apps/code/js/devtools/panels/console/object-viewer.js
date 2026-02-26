
// B"H
/**
 * @file object-viewer.js
 * @brief The recursive microscope with interactive DOM links.
 */

import { HTML } from '../../../html-generator.js';
import { Actions } from '../../../actions/index.js';

export const ObjectViewer = {
    /**
     * @function build
     * @description Generates an interactive visual form for any JS object.
     */
    build(obj, keyName = null, state = null) {
        const keyHtml = keyName !== null ? [{ tag: 'span', style: { color: 'var(--neon-magenta)', marginRight: '6px' }, text: `${keyName}:` }] : [];

        if (!obj || obj.type === 'null' || obj.type === 'undefined') {
            return HTML({ 
                className: 'dt-obj-node', 
                children: [...keyHtml, { tag: 'span', style: { color: 'gray', fontStyle: 'italic' }, text: obj ? obj.value || 'null' : 'undefined' }]
            });
        }

        if (obj.type === 'dom') {
            return HTML({
                tag: 'span',
                className: 'dt-obj-node dt-obj-dom',
                style: { cursor: 'pointer', textDecoration: 'underline', color: '#cf8eff' },
                children: [
                    ...keyHtml, 
                    { tag: 'span', text: obj.value }
                ],
                onClick: (e) => {
                    e.stopPropagation();
                    // B"H - The Sacred Inspection Ritual
                    // Uses the captured path to tell the DevTools where to look.
                    if (obj.path && state?.previewTabId) {
                        console.log("B\"H - ObjectViewer: Inspecting path from console log ->", obj.path);
                        Actions.handle('preview-inspect-path', { 
                            previewTabId: state.previewTabId,
                            path: obj.path 
                        });
                    }
                }
            });
        }

        if (obj.type === 'string') {
            const shouldQuote = keyName !== null || obj.forceQuote;
            const textVal = shouldQuote ? `"${obj.value}"` : obj.value;
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { tag: 'span', style: { color: 'var(--neon-lime)', whiteSpace: 'pre-wrap' }, text: textVal }]
            });
        }

        if (['number', 'boolean', 'bigint'].includes(obj.type)) {
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { tag: 'span', style: { color: '#ffae57' }, text: obj.value }]
            });
        }

        if (obj.type === 'function') {
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { tag: 'span', style: { color: 'var(--neon-cyan)', fontStyle: 'italic' }, text: `ƒ ${obj.name || 'anonymous'}()` }]
            });
        }

        if (obj.type === 'error') {
            return HTML({
                className: 'dt-obj-node',
                children: [
                    ...keyHtml, 
                    { tag: 'span', style: { color: 'var(--color-accent-danger)', fontWeight: 'bold' }, text: obj.message },
                    ...(obj.stack ? [{ tag: 'div', style: { color: 'gray', paddingLeft: '10px', fontSize: '0.9em', marginTop: '4px', whiteSpace: 'pre-wrap' }, text: obj.stack }] : [])
                ]
            });
        }

        return this._buildCollapsible(obj, keyHtml, state);
    },

    _buildCollapsible(obj, keyHtml, state) {
        const isArray = obj.type === 'array';
        const previewText = isArray ? `Array(${obj.length})` : `${obj.constructorName || 'Object'} {…}`;

        let isLoaded = false;
        let arrowEl = null;
        let bodyWrap = null;

        const toggleDetails = (e) => {
            e.stopPropagation();
            const isHidden = bodyWrap.style.display === 'none';
            bodyWrap.style.display = isHidden ? 'flex' : 'none';
            arrowEl.textContent = isHidden ? '▼' : '▶';
            arrowEl.style.color = isHidden ? 'var(--neon-cyan)' : 'gray';
            
            if (isHidden && !isLoaded) {
                isLoaded = true;
                this._populateBody(obj, bodyWrap, state);
            }
        };

        const summary = HTML({
            tag: 'div',
            style: { cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', userSelect: 'none' },
            onClick: toggleDetails,
            children: [
                { tag: 'span', text: '▶', style: { fontSize: '0.8em', color: 'gray', marginRight: '4px', width: '12px', textAlign: 'center' }, ref: (el) => arrowEl = el },
                ...keyHtml,
                { tag: 'span', style: { color: 'var(--color-text-secondary)', fontStyle: 'italic', opacity: '0.8' }, text: previewText }
            ]
        });

        bodyWrap = HTML({
            className: 'dt-obj-body',
            style: { paddingLeft: '18px', borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '6px', marginTop: '4px', display: 'none', flexDirection: 'column', gap: '4px' }
        });

        return HTML({
            className: 'dt-obj-node dt-complex',
            children: [summary, bodyWrap]
        });
    },

    _populateBody(obj, container, state) {
        if (Array.isArray(obj.value)) {
            obj.value.forEach((val, idx) => {
                if (val && val.type === 'string') val.forceQuote = true;
                container.appendChild(this.build(val, String(idx), state));
            });
        } else if (obj.properties) {
            obj.properties.forEach(p => {
                if (p.value && p.value.type === 'string') p.value.forceQuote = true;
                container.appendChild(this.build(p.value, p.key, state));
            });
        }
    }
};
