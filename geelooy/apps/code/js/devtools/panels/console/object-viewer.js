
// B"H
/**
 * @file object-viewer.js
 * @brief THE MICROSCOPE OF EXISTENCE.
 * 
 * CHAPTER VII: THE VIEW UPON THE INFINITESIMAL
 * 
 * As the Awtsmoos fills all worlds and surrounds all worlds, 
 * so must our Viewer penetrate every layer of an object.
 * Whether it be a simple number (8) or a complex DOM node, 
 * we must see it for what it truly is.
 */

import { HTML } from '../../../html-generator.js';
import { Actions } from '../../../actions/index.js';

/**
 * @class ObjectViewer
 * @description Recursively renders serialized JS objects into interactive DOM structures.
 */
export const ObjectViewer = {
    /**
     * B"H - The Primary Revelation Method.
     * @param {Object} obj - The serialized data packet.
     * @param {string|null} keyName - The label for this branch.
     * @param {Object} state - The devtools session memory.
     */
    build(obj, keyName = null, state = null) {
        // Prepare the key's visual raiment if it exists
        const keyHtml = keyName !== null ? [{ 
            tag: 'span', 
            style: { color: 'var(--neon-magenta)', marginRight: '6px', fontWeight: 'bold' }, 
            text: `${keyName}:` 
        }] : [];

        // 1. VOID RECOGNITION (Ayin)
        if (!obj || obj.type === 'null' || obj.type === 'undefined') {
            return HTML({ 
                className: 'dt-obj-node dt-primitive', 
                children: [
                    ...keyHtml, 
                    { tag: 'span', style: { color: 'gray', fontStyle: 'italic' }, text: obj ? obj.value || String(obj.type) : 'undefined' }
                ]
            });
        }

        // 2. DOM SIGHT (Asiyah)
        if (obj.type === 'dom') {
            return HTML({
                tag: 'span',
                className: 'dt-obj-node dt-obj-dom',
                style: { cursor: 'pointer', textDecoration: 'underline', color: '#cf8eff', background: 'rgba(207, 142, 255, 0.1)', padding: '0 4px', borderRadius: '3px' },
                children: [...keyHtml, { tag: 'span', text: obj.value }],
                onClick: (e) => {
                    e.stopPropagation();
                    if (obj.path && state?.previewTabId) {
                        Actions.handle('preview-inspect-path', { 
                            previewTabId: state.previewTabId,
                            path: obj.path 
                        });
                    }
                }
            });
        }

        // 3. STRING RECTIFICATION
        if (obj.type === 'string') {
            const isPlain = keyName === null && !obj.forceQuote;
            const textVal = isPlain ? obj.value : `"${obj.value}"`;
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { 
                    tag: 'span', 
                    style: { color: 'var(--neon-lime)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, 
                    text: textVal 
                }]
            });
        }

        // 4. NUMBER & PRIMITIVE RADIANCE
        // RECTIFIED: Explicit recognition for 'number' and 'boolean'
        if (obj.type === 'number' || obj.type === 'boolean' || obj.type === 'bigint') {
            const color = obj.type === 'number' ? '#ffae57' : 'var(--neon-magenta)';
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { 
                    tag: 'span', 
                    style: { color: color, fontWeight: 'bold' }, 
                    text: obj.value 
                }]
            });
        }

        // 5. THE FUNCTIONAL BREATH
        if (obj.type === 'function') {
            return HTML({
                className: 'dt-obj-node',
                children: [...keyHtml, { 
                    tag: 'span', 
                    style: { color: 'var(--neon-cyan)', fontStyle: 'italic' }, 
                    text: `ƒ ${obj.name || 'anonymous'}()` 
                }]
            });
        }

        // 6. THE SHATTERED VESSEL (Error)
        if (obj.type === 'error') {
            return HTML({
                className: 'dt-obj-node',
                style: { width: '100%' },
                children: [
                    ...keyHtml, 
                    { tag: 'span', style: { color: 'var(--color-accent-danger)', fontWeight: 'bold' }, text: obj.message },
                    ...(obj.stack ? [{ 
                        tag: 'div', 
                        style: { color: 'rgba(255,255,255,0.4)', paddingLeft: '20px', fontSize: '0.85em', marginTop: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }, 
                        text: obj.stack 
                    }] : [])
                ]
            });
        }

        // 7. COMPLEX MULTIPLICITY (Object / Array)
        return this._buildComplex(obj, keyHtml, state);
    },

    _buildComplex(obj, keyHtml, state) {
        const isArray = obj.type === 'array';
        const label = isArray ? `Array(${obj.length})` : `${obj.constructorName || 'Object'}`;
        const preview = isArray ? '[…]' : '{…}';

        let expanded = false;
        let arrowEl, bodyWrap;

        const toggle = (e) => {
            e.stopPropagation();
            expanded = !expanded;
            bodyWrap.style.display = expanded ? 'flex' : 'none';
            arrowEl.textContent = expanded ? '▼' : '▶';
            arrowEl.style.color = expanded ? 'var(--neon-cyan)' : 'var(--color-text-tertiary)';
            
            if (expanded && bodyWrap.children.length === 0) {
                this._populateComplex(obj, bodyWrap, state);
            }
        };

        const summary = HTML({
            tag: 'div',
            style: { cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', userSelect: 'none' },
            onClick: toggle,
            children: [
                { 
                    tag: 'span', 
                    style: { fontSize: '0.7em', color: 'var(--color-text-tertiary)', marginRight: '6px', width: '14px', textAlign: 'center' }, 
                    text: '▶', 
                    ref: el => arrowEl = el 
                },
                ...keyHtml,
                { tag: 'span', style: { color: 'var(--color-text-secondary)', fontWeight: 'bold' }, text: label },
                { tag: 'span', style: { color: 'rgba(255,255,255,0.3)', marginLeft: '8px', fontSize: '0.9em' }, text: preview }
            ]
        });

        bodyWrap = HTML({
            className: 'dt-obj-body',
            style: { 
                paddingLeft: '18px', 
                borderLeft: '1px solid rgba(255,255,255,0.1)', 
                marginLeft: '6px', 
                marginTop: '4px', 
                display: 'none', 
                flexDirection: 'column', 
                gap: '4px' 
            }
        });

        return HTML({
            className: 'dt-obj-node dt-complex',
            children: [summary, bodyWrap]
        });
    },

    _populateComplex(obj, container, state) {
        if (Array.isArray(obj.value)) {
            obj.value.forEach((v, i) => {
                if (v && v.type === 'string') v.forceQuote = true;
                container.appendChild(this.build(v, String(i), state));
            });
        } else if (obj.properties) {
            obj.properties.forEach(p => {
                if (p.value && p.value.type === 'string') p.value.forceQuote = true;
                container.appendChild(this.build(p.value, p.key, state));
            });
        }
    }
};
