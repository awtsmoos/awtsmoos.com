
// B"H
import { Linter } from '../linter.js';
import { DOM, State } from '../../state.js';

export const ASTFolding = {
    _editor: null,

    setEditor(editor) {
        this._editor = editor;
    },

    getFoldableLines(code) {
        if (!Linter.isReady) return [];
        try {
            const ast = Linter.getAST(code);
            if (!ast || ast.error) return [];
            const lines = new Set();
            const traverse = (node) => {
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
        if (!this._editor) return;
        
        const editorEl = DOM.editor;
        const scrollTop = editorEl.scrollTop; 
        
        const code = this._editor.getContent();
        const lines = code.split('\n');
        const targetLineText = lines[line - 1];
        
        const foldedRegex = /\/\* \[FOLD:(\d+)\] \*\//;
        const match = targetLineText.match(foldedRegex);

        if (match) {
            if (match[1]) this.unfoldById(match[1]);
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
            const startInner = targetBlock.start + 1;
            const endInner = targetBlock.end - 1;
            
            const originalContent = code.substring(startInner, endInner);
            const foldId = State.nextFoldId++;
            State.foldedRegistry.set(String(foldId), originalContent);
            
            const placeholder = ` /* [FOLD:${foldId}] */ `;
            const newCode = code.substring(0, startInner) + placeholder + code.substring(endInner);
            
            this._editor.setCurrentContent(newCode);
            
            requestAnimationFrame(() => {
                editorEl.scrollTop = scrollTop;
                import('../../ui.js').then(m => {
                    m.UI.updateLineNumbers();
                    m.UI.syncScroll();
                });
            });
        }
    },

    unfoldById(foldId) {
        if (!this._editor) return;
        
        const editorEl = DOM.editor;
        const scrollTop = editorEl.scrollTop;
        
        const originalContent = State.foldedRegistry.get(String(foldId));
        if (!originalContent) return;
        const code = this._editor.getContent();
        
        const markerRegex = new RegExp(`\\s*\\/\\* \\[FOLD:${foldId}\\] \\*\\/\\s*`);
        const newCode = code.replace(markerRegex, originalContent);
        
        if (newCode !== code) {
            this._editor.setCurrentContent(newCode);
            State.foldedRegistry.delete(String(foldId));
            
            requestAnimationFrame(() => {
                editorEl.scrollTop = scrollTop;
                import('../../ui.js').then(m => {
                    m.UI.updateLineNumbers();
                    m.UI.syncScroll();
                });
            });
        }
    },

    unfoldAll() {
        if (!this._editor) return false;
        
        let code = this._editor.getContent();
        let changed = false;
        
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
        
        if (changed) this._editor.setCurrentContent(code);
        return changed;
    },

    async foldBlocks() {
        if (!this._editor) return;
        
        const code = this._editor.getContent();
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
        
        this._editor.setCurrentContent(newCode);
        const { UI } = await import('../../ui.js');
        UI.updateLineNumbers();
    }
};
