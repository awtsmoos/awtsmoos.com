
// B"H
/**
 * @file symbol-outline.js
 * @brief THE MAP OF THE MIND.
 */

import { Linter } from './linter.js';
import { DOM, State } from '../state.js';

export const SymbolOutline = {
    /**
     * @function getSymbols
     * @description Traverses the AST to find high-level logical vessels.
     */
    getSymbols(code) {
        if (!Linter.isReady) return [];
        const ast = Linter.getAST(code);
        if (!ast || ast.error) return [];

        const symbols = [];
        const walk = (node) => {
            if (!node || typeof node !== 'object') return;

            let sym = null;
            if (node.type === 'FunctionDeclaration') {
                sym = { name: node.id?.name || '(anon)', type: 'function', line: node.loc.start.line, start: node.start };
            } else if (node.type === 'ClassDeclaration') {
                sym = { name: node.id?.name || '(anon)', type: 'class', line: node.loc.start.line, start: node.start };
            } else if (node.type === 'MethodDefinition') {
                sym = { name: node.key.name || node.key.value, type: 'method', line: node.loc.start.line, start: node.start };
            }

            if (sym) symbols.push(sym);

            for (const key in node) {
                const child = node[key];
                if (Array.isArray(child)) child.forEach(walk);
                else walk(child);
            }
        };

        walk(ast);
        return symbols;
    },

    /**
     * @function jumpTo
     * @description Moves the editor's focus to a specific logical coordinate.
     */
    jumpTo(offset) {
        DOM.editor.focus();
        DOM.editor.setSelectionRange(offset, offset);
        
        const textBefore = DOM.editor.value.substring(0, offset);
        const line = textBefore.split('\n').length;
        const style = window.getComputedStyle(DOM.editor);
        const lh = parseFloat(style.lineHeight) || 24;
        
        DOM.editor.scrollTop = (line * lh) - (DOM.editor.clientHeight / 2);
    }
};
