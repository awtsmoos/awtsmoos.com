
// B"H
/**
 * @file object-viewer.js
 * @brief The recursive microscope to reveal complex data structures.
 */

import { HTML } from '../../../html-generator.js';

export const ObjectViewer = {
    build(obj, keyName = null) {
        const keyHtml = keyName !== null ? [{ tag: 'span', style: { color: 'var(--neon-magenta)', marginRight: '6px' }, text: `${keyName}:` }] : [];

        if (!obj || obj.type === 'null' || obj.type === 'undefined') {
            return HTML({ 
                className: 'dt-obj-node', 
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [...keyHtml, { tag: 'span', style: { color: 'gray', fontStyle: 'italic' }, text: obj ? obj.value || 'null' : 'undefined' }]
            });
        }

        if (obj.type === 'string') {
            const shouldQuote = keyName !== null || obj.forceQuote;
            const textVal = shouldQuote ? `"${obj.value}"` : obj.value;
            return HTML({
                className: 'dt-obj-node',
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [...keyHtml, { tag: 'span', style: { color: 'var(--neon-lime)', whiteSpace: 'pre-wrap' }, text: textVal }]
            });
        }

        if (['number', 'boolean', 'bigint'].includes(obj.type)) {
            return HTML({
                className: 'dt-obj-node',
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [...keyHtml, { tag: 'span', style: { color: '#ffae57' }, text: obj.value }]
            });
        }

        if (obj.type === 'function') {
            return HTML({
                className: 'dt-obj-node',
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [...keyHtml, { tag: 'span', style: { color: 'var(--neon-cyan)', fontStyle: 'italic' }, text: `ƒ ${obj.name || 'anonymous'}()` }]
            });
        }

        if (obj.type === 'error') {
            return HTML({
                className: 'dt-obj-node',
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [
                    ...keyHtml, 
                    { tag: 'span', style: { color: 'var(--color-accent-danger)', fontWeight: 'bold' }, text: obj.message },
                    ...(obj.stack ? [{ tag: 'div', style: { color: 'gray', paddingLeft: '10px', fontSize: '0.9em', marginTop: '4px' }, text: obj.stack }] : [])
                ]
            });
        }
        
        if (obj.type === 'dom') {
             return HTML({
                className: 'dt-obj-node',
                style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
                children: [
                    ...keyHtml, 
                    { tag: 'span', style: { color: '#cf8eff', background: 'rgba(207, 142, 255, 0.1)', padding: '0 4px', borderRadius: '3px' }, text: obj.value }
                ]
            });
        }

        return this._buildCollapsible(obj, keyHtml);
    },

    _buildCollapsible(obj, keyHtml) {
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
                this._populateBody(obj, bodyWrap, isArray);
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
            style: { display: 'inline-block', verticalAlign: 'top', fontFamily: 'var(--font-code)' },
            children: [summary, bodyWrap]
        });
    },

    _populateBody(obj, container, isArray) {
        if (isArray && Array.isArray(obj.value)) {
            obj.value.forEach((val, idx) => {
                if (val && val.type === 'string') val.forceQuote = true;
                container.appendChild(this.build(val, String(idx)));
            });
            // Arrays have prototypes
            if (obj.prototype && obj.prototype.type !== 'null') {
                container.appendChild(this.build(obj.prototype, '[[Prototype]]'));
            }
        } else if (obj.properties) {
            obj.properties.forEach(p => {
                if (p.value && p.value.type === 'string') p.value.forceQuote = true;
                container.appendChild(this.build(p.value, p.key));
            });
            // Objects have prototypes
            if (obj.prototype && obj.prototype.type !== 'null') {
                container.appendChild(this.build(obj.prototype, '[[Prototype]]'));
            }
        } else if (obj.entries) {
            obj.entries.forEach((entry, idx) => {
                const row = HTML({
                    style: { display: 'flex', flexDirection: 'column', marginBottom: '4px' },
                    children: [
                        { tag: 'span', style: { color: 'gray' }, text: `${idx}:` },
                        { 
                            style: { paddingLeft: '10px', display: 'flex', gap: '10px' }, 
                            children: Array.isArray(entry) && entry.length === 2 
                                ? [ this.build(entry[0], 'key'), this.build(entry[1], 'value') ] 
                                : [ this.build(entry, 'value') ]
                        }
                    ]
                });
                container.appendChild(row);
            });
            if (obj.prototype && obj.prototype.type !== 'null') {
                container.appendChild(this.build(obj.prototype, '[[Prototype]]'));
            }
        } else {
            container.appendChild(HTML({ tag: 'span', style: { color: 'gray', fontStyle: 'italic' }, text: 'No properties to manifest' }));
        }
    }
};
