// B"H
// FILE: js/tools/ast-engine.js

import { Linter } from './linter.js';
import { DOM, State } from '../state.js';

export const ASTEngine = {
    editor: null,

    setEditor(editorInstance) {
        this.editor = editorInstance;
    },
    
    async getSummaryAtOffset(code, offset) {
        if (Linter.isReady) {
            return this._getASTSummary(code, offset);
        }
        return null;
    },

    _getASTSummary(code, offset) {
        try {
            const ast = Linter.getAST(code);
            if (!ast || ast.error) return null;
            
            let bestMatch = null;
            
            const traverse = (node) => {
                if (!node || typeof node !== 'object') return;
                
                if (node.end < offset - 100 && node.type !== 'Program') return; 
                if (node.start > offset + 100 && node.type !== 'Program') return;

                let targetRange = null;
                let targetNode = node;

                if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
                    if (node.id) targetRange = node.id;
                } 
                else if (node.type === 'MethodDefinition' || node.type === 'Property') {
                    if (node.key) targetRange = node.key;
                } 
                else if (node.type === 'VariableDeclarator') {
                    if (node.init && (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) {
                        if (node.id) targetRange = node.id;
                    }
                }

                if (targetRange) {
                    if (offset >= targetRange.start && offset <= targetRange.end) {
                        bestMatch = targetNode;
                    }
                }

                for (const key in node) {
                    if (key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) node[key].forEach(traverse);
                        else traverse(node[key]);
                    }
                }
            };
            
            traverse(ast);
            
            if (bestMatch) {
                return {
                    type: 'function',
                    summary: this._formatNodeSummary(bestMatch),
                    signature: this._extractSignature(code, bestMatch),
                    docs: this._extractDocs(code, bestMatch)
                };
            }
        } catch(e) { console.warn("AST Summary Error", e); }
        return null;
    },

    _formatNodeSummary(node) {
        if (node.type === 'ClassDeclaration') return 'Class';
        let type = 'Function';
        if (node.type === 'MethodDefinition') {
            type = node.kind === 'constructor' ? 'Constructor' : 'Method';
            if (node.static) type = 'Static ' + type;
        }
        else if (node.type === 'Property') {
            if (node.kind === 'get') type = 'Getter';
            else if (node.kind === 'set') type = 'Setter';
            else type = 'Method';
        }
        const funcNode = (node.value && (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression')) 
            ? node.value 
            : (node.init ? node.init : node);
        if (funcNode?.async) type = 'Async ' + type;
        if (funcNode?.generator) type = 'Generator ' + type;
        return type;
    },

    _extractSignature(code, node) {
        let name = '';
        let funcNode = node;
        if (node.type === 'VariableDeclarator') {
            name = node.id.name;
            funcNode = node.init;
        } else if (node.type === 'MethodDefinition' || node.type === 'Property') {
            name = node.key.name || node.key.value; 
            funcNode = node.value;
        } else if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
            name = node.id ? node.id.name : '(anonymous)';
        }
        const formatParams = (params) => {
            if(!params || params.length === 0) return '';
            return params.map(p => {
                if (p.type === 'Identifier') return p.name;
                if (p.type === 'AssignmentPattern') return `${p.left.name}?`; 
                if (p.type === 'RestElement') return `...${p.argument.name}`;
                return 'arg';
            }).join(', ');
        };
        const params = funcNode.params || (funcNode.value && funcNode.value.params) || [];
        const paramStr = formatParams(params);
        if (node.type === 'ClassDeclaration') return `class ${name}`;
        if (node.kind === 'get') return `get ${name}()`;
        if (node.kind === 'set') return `set ${name}(${paramStr})`;
        return `${name}(${paramStr})`;
    },
    
    _getParamNames(node) {
        let funcNode = node;
        if (node.type === 'VariableDeclarator') funcNode = node.init;
        else if (node.type === 'MethodDefinition' || node.type === 'Property') funcNode = node.value;
        const params = funcNode?.params || (funcNode?.value && funcNode.value.params) || [];
        return params.map(p => {
            if (p.type === 'Identifier') return p.name;
            if (p.type === 'AssignmentPattern') return p.left.name;
            if (p.type === 'RestElement') return p.argument.name;
            return 'arg';
        });
    },

    _extractDocs(code, node) {
        const prevText = code.substring(Math.max(0, node.start - 2000), node.start).trimEnd();
        const commentMatch = prevText.match(/(\/\*\*[\s\S]*?\*\/)$/);
        if (!commentMatch) {
            const lineStart = code.lastIndexOf('\n', node.start - 1) + 1;
            const indentMatch = code.substring(lineStart, node.start).match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            const params = this._getParamNames(node);
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
    },

    getFoldableLines(code) {
        if (!Linter.isReady) return [];
        try {
            const ast = Linter.getAST(code);
            if (!ast || ast.error) return [];
            const lines = new Set();
            const traverse = (node) => {
                // B"H - Restrict to BlockStatements for safety
                if (node.type === 'BlockStatement' && (node.loc.end.line - node.loc.start.line > 2)) {
                    lines.add(node.loc.start.line);
                }
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) node[key].forEach(traverse);
                        else traverse(node[key]);
                    }
                }
            };
            traverse(ast);
            return Array.from(lines);
        } catch(e) {
            return [];
        }
    },

    async toggleFoldAtLine(line) {
        if (!this.editor) return;
        
        const editorEl = DOM.editor;
        const scrollTop = editorEl.scrollTop; 
        
        const code = this.editor.getContent();
        const lines = code.split('\n');
        const targetLineText = lines[line - 1];
        
        // B"H - Improved Fold Detection using Valid Comment Syntax
        const foldedRegex = /\/\* \[FOLD:(\d+)\] \*\//;
        const match = targetLineText.match(foldedRegex);

        if (match) {
            const foldId = match[1];
            if (foldId) {
                this.unfoldById(foldId);
            }
            return;
        }

        await Linter.init();
        const ast = Linter.getAST(code);
        if (!ast || ast.error) return;

        let targetBlock = null;
        const traverse = (node) => {
            if (node.type === 'BlockStatement' && node.loc.start.line === line) {
                targetBlock = node;
                return;
            }
            for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                    if (Array.isArray(node[key])) node[key].forEach(traverse);
                    else traverse(node[key]);
                }
            }
        };
        traverse(ast);

        if (targetBlock) {
            // B"H - Syntax-Safe Folding with Comments
            // We replace content between braces with a special comment block.
            const startInner = targetBlock.start + 1;
            const endInner = targetBlock.end - 1;
            
            const originalContent = code.substring(startInner, endInner);
            const foldId = State.nextFoldId++;
            State.foldedRegistry.set(String(foldId), originalContent);
            
            // Replaced content is a valid block comment containing the ID
            const placeholder = ` /* [FOLD:${foldId}] */ `;
            
            const newCode = code.substring(0, startInner) + placeholder + code.substring(endInner);
            this.editor.setCurrentContent(newCode);
            
            requestAnimationFrame(() => {
                editorEl.scrollTop = scrollTop;
                const { UI } = import('../ui.js').then(m => {
                    m.UI.updateLineNumbers();
                    m.UI.syncScroll();
                });
            });
        }
    },

    unfoldById(foldId) {
        if (!this.editor) return;
        
        const editorEl = DOM.editor;
        const scrollTop = editorEl.scrollTop;
        
        const originalContent = State.foldedRegistry.get(String(foldId));
        if (!originalContent) return;
        const code = this.editor.getContent();
        
        // Robust regex to find the fold comment anywhere
        const markerRegex = new RegExp(`\\s*\\/\\* \\[FOLD:${foldId}\\] \\*\\/\\s*`);
        const newCode = code.replace(markerRegex, originalContent);
        
        if (newCode !== code) {
            this.editor.setCurrentContent(newCode);
            State.foldedRegistry.delete(String(foldId));
            
            requestAnimationFrame(() => {
                editorEl.scrollTop = scrollTop;
                const { UI } = import('../ui.js').then(m => {
                    m.UI.updateLineNumbers();
                    m.UI.syncScroll();
                });
            });
        }
    },

    unfoldAll() {
        if (!this.editor) return false;
        
        let code = this.editor.getContent();
        let changed = false;
        
        // Iterate all active folds
        const ids = Array.from(State.foldedRegistry.keys());
        for (const id of ids) {
            const content = State.foldedRegistry.get(id);
            const markerRegex = new RegExp(`\\s*\\/\\* \\[FOLD:${id}\\] \\*\\/\\s*`);
            
            if (markerRegex.test(code)) {
                code = code.replace(markerRegex, content);
                changed = true;
            }
            State.foldedRegistry.delete(id);
        }
        
        if (changed) this.editor.setCurrentContent(code);
        return changed;
    },

    async foldBlocks() {
        if (!this.editor) return;
        
        const code = this.editor.getContent();
        await Linter.init();
        const ast = Linter.getAST(code);
        if (!ast || ast.error) return;
        const blocks = [];
        const traverse = (node) => {
            if (node.type === 'BlockStatement' && (node.loc.end.line - node.loc.start.line > 5)) {
                blocks.push(node);
            }
            for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                    if (Array.isArray(node[key])) node[key].forEach(traverse);
                    else traverse(node[key]);
                }
            }
        };
        traverse(ast);
        if (blocks.length === 0) return;
        blocks.sort((a, b) => b.start - a.start);
        
        let newCode = code;
        for (const block of blocks) {
            const startInner = block.start + 1;
            const endInner = block.end - 1;
            const original = code.substring(startInner, endInner);
            
            const foldId = State.nextFoldId++;
            State.foldedRegistry.set(String(foldId), original);
            
            const placeholder = ` /* [FOLD:${foldId}] */ `;
            
            newCode = newCode.substring(0, startInner) + placeholder + newCode.substring(endInner);
        }
        this.editor.setCurrentContent(newCode);
        const { UI } = await import('../ui.js');
        UI.updateLineNumbers();
    }
};