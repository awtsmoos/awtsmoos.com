
/*B"H*/
import { State, DOM } from './state.js';
import { Editor } from './editor.js';
import { CommandPalette } from './command-palette.js';

/**
 * StatusBar Module: Controls the bottom status bar and the top window title.
 */
export const StatusBar = {
    _bound: false,

    update: () => {
        // B"H - Bind Interactive Element
        if (!StatusBar._bound && DOM.statusRight) {
            DOM.statusRight.style.cursor = 'pointer';
            DOM.statusRight.title = 'Change Language / Format';
            DOM.statusRight.onclick = () => {
                CommandPalette.show();
                setTimeout(() => {
                    const input = document.getElementById('cp-input');
                    if (input) {
                        input.value = 'Code: ';
                        input.dispatchEvent(new Event('input'));
                    }
                }, 50);
            };
            StatusBar._bound = true;
        }

        // Line/Col
        const { line, col } = Editor.getCursorInfo();
        let leftText = `Ln ${line}, Col ${col}`;
        
        // B"H - Word Count Calculation
        if (State.activeTabId && !DOM.editorWrapper.classList.contains('hidden')) {
            const text = DOM.editor.value;
            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
            leftText += `  |  Words: ${wordCount}`;
        }
        
        DOM.statusLeft.textContent = leftText;

        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab) {
            StatusBar.updateLanguage(activeTab.item.name);
            
            // B"H - Dynamic Document Title Injection
            document.title = `${activeTab.item.name} - Awtsmoos Editor`;
            
            const workspace = State.workspaces.find(ws => ws.id === activeTab.item.workspaceId);
            if (workspace?.readOnly) {
                DOM.statusRight.textContent += '  |  [Read-Only]';
            }
            if (activeTab.item.type === 'github') {
                StatusBar.updateGit(activeTab.item.branch);
            }
        } else {
            StatusBar.clear();
            document.title = 'Awtsmoos Editor';
        }
    },
    updateLanguage: (filename) => {
        const extension = filename ? filename.split('.').pop().toLowerCase() : '';
        const langMap = { 
            js: 'JavaScript', html: 'HTML', css: 'CSS', md: 'Markdown', 
            json: 'JSON', py: 'Python', sh: 'Shell', default: 'Plain Text' 
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
