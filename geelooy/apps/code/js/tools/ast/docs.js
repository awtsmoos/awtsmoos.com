
// B"H
import { ASTSummary } from './summary.js';

export const ASTDocs = {
    extractDocs(code, node) {
        const prevText = code.substring(Math.max(0, node.start - 2000), node.start).trimEnd();
        const commentMatch = prevText.match(/(\/\*\*[\s\S]*?\*\/)$/);
        if (!commentMatch) {
            const lineStart = code.lastIndexOf('\n', node.start - 1) + 1;
            const indentMatch = code.substring(lineStart, node.start).match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            const params = ASTSummary.getParamNames(node);
            let template = `/**\n${indent} * \n`; 
            if (params.length > 0) {
                params.forEach(p => template += `${indent} * @param {any} ${p}\n`);
            }
            template += `${indent} */`;
            const encoded = encodeURIComponent(template);
            return `
                <div class="jsdoc-empty">
                    <span>No documentation</span>
                    <button class="generate-docs-link" data-start="${node.start}" data-template="${encoded}" title="Insert JSDoc Template">
                        Generate
                    </button>
                </div>`;
        }
        return this._parseJSDocHTML(commentMatch[1]);
    },

    _parseJSDocHTML(rawComment) {
        const lines = rawComment.split('\n');
        let html = '<div class="jsdoc-container">';
        let hasContent = false;
        lines.forEach(line => {
            let clean = line.replace(/^\s*\/?\*+\/?\s?/, '').trim();
            if (!clean) return;
            hasContent = true;
            if (clean.startsWith('@')) {
                const parts = clean.split(' ');
                const tag = parts[0]; 
                let rest = parts.slice(1).join(' ');
                let type = '';
                let name = '';
                if (rest.startsWith('{')) {
                    const endBrace = rest.indexOf('}');
                    if (endBrace !== -1) {
                        type = rest.substring(1, endBrace);
                        rest = rest.substring(endBrace + 1).trim();
                    }
                }
                if (['@param', '@arg', '@property'].includes(tag)) {
                    const spaceIdx = rest.indexOf(' ');
                    if (spaceIdx !== -1) {
                        name = rest.substring(0, spaceIdx);
                        rest = rest.substring(spaceIdx + 1).trim();
                    } else { name = rest; rest = ''; }
                }
                html += `<div class="jsdoc-row">
                    <span class="jsdoc-tag">${tag}</span>
                    ${type ? `<span class="jsdoc-type">${type}</span>` : ''}
                    ${name ? `<span class="jsdoc-name">${name}</span>` : ''}
                    <span class="jsdoc-desc">${rest}</span>
                </div>`;
            } else {
                html += `<div class="jsdoc-text">${clean}</div>`;
            }
        });
        html += '</div>';
        return hasContent ? html : '<div class="jsdoc-empty">No documentation</div>';
    }
};
