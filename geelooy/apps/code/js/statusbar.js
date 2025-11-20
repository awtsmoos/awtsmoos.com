/*B"H*/

/**
 * StatusBar Module: Controls the bottom status bar, a ribbon of context
 * that reflects the current state of the editor's focus, including whether
 * the current realm is read-only.
 */
export const StatusBar = {
    update: () => {
        const { line, col } = Editor.getCursorInfo();
        DOM.statusLeft.textContent = `Ln ${line}, Col ${col}`;
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