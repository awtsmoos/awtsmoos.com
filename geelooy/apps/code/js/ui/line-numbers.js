
// B"H
import { DOM } from '../state.js';
import { ASTEngine } from '../tools/ast-engine.js';
import { VisualSettings } from '../visuals/settings.js';
import { ColorOrbs } from '../visuals/color-orbs.js';

export const UILineNumbers = {
    /**
     * @function update
     * @description Forges the physical numbers in the gutter.
     */
    update(errors = []) {
        const editor = DOM.editor;
        if (!editor || !DOM.lineNumbers) return;

        const text = editor.value;
        const lines = text.split('\n');
        
        // Use AST for folding markers if enabled
        let foldable = (VisualSettings.get && VisualSettings.get('folding')) 
            ? ASTEngine.getFoldableLines(text) 
            : [];
            
        const errorMap = new Map(errors.map(e => [e.line, e]));
        let html = '';

        for (let i = 1; i <= lines.length; i++) {
            const lineText = lines[i-1] || "";
            const isFolded = lineText.includes('/* [FOLD:');
            const canFold = foldable.includes(i);
            
            const cls = errorMap.has(i) ? 'lint-marker' : '';
            const foldIcon = isFolded ? '▶' : (canFold ? '▼' : '');

            // B"H - Enforced pixel height (24px) to match Pnimi editor
            html += `
                <div class="${cls}" style="height: 24px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; font-size: 14px;">
                    <span class="fold-gutter-icon" style="width: 18px; text-align: center; cursor: pointer; color: var(--neon-cyan);" data-line="${i}">
                        ${foldIcon}
                    </span>
                    ${i}
                </div>`;
        }
        
        DOM.lineNumbers.innerHTML = html;
        
        // Scan for color orbs after gutter update
        if (ColorOrbs && ColorOrbs.scanAndRender) {
            requestAnimationFrame(() => ColorOrbs.scanAndRender(DOM.lineNumbers));
        }
    },

    syncScroll() {
        if (DOM.lineNumbers && DOM.editor) {
            DOM.lineNumbers.scrollTop = DOM.editor.scrollTop;
        }
    }
};
