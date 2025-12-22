/*B"H*/
import { State, DOM } from './state.js';
import { Editor } from './editor.js';

/**
 * StatusBar Module: Controls the bottom status bar, a ribbon of context.
 */
export const StatusBar = {
    update: () => {
        // Line/Col
        const { line, col } = Editor.getCursorInfo();
        let leftText = `Ln ${line}, Col ${col}`;
        
        // B"H - Word Count Calculation
        if (State.activeTabId && !DOM.editorWrapper.classList.contains('hidden')) {
            const text = DOM.editor.value;
            const wordCount = text.trim().split(/\s+/).length;
            leftText += `  |  Words: ${wordCount}`;
        }
        
        DOM.statusLeft.textContent = leftText;

        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) {
            StatusBar.updateLanguage(activeTab.item.name);
            const workspace = State.workspaces.find(ws => ws.id === activeTab.item.workspaceId);
            if (workspace?.readOnly) {
                DOM.statusRight.textContent += '  |  [Read-Only]';
            }
            if (activeTab.item.type === 'github') {
                StatusBar.updateGit(activeTab.item.branch);
            }
        } else {
            StatusBar.clear();
        }
    },
    updateLanguage: (filename) => {
        const extension = filename ? filename.split('.').pop().toLowerCase() : '';
        const langMap = { 
            js: 'JavaScript', html: 'HTML', css: 'CSS', md: 'Markdown', 
            json: 'JSON', py: 'Python', default: 'Plain Text' 
        };
        DOM.statusRight.textContent = langMap[extension] || langMap.default;
    },
    updateGit: (branch) => {
        if (branch) DOM.statusRight.textContent += `  |  ${branch}`;
    },
    clear: () => {
        DOM.statusLeft.textContent = '';
        DOM.statusRight.textContent = '';
    }
};