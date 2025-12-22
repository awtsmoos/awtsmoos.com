// B"H
// FILE: js/file-commander/index.js

import { FileCommanderCore } from './core.js';
import { FileCommanderUI } from './ui.js';

export const FileCommander = {
    overlay: null, // Exposed for external checks

    init() {
        FileCommanderUI.init(this);
        this.overlay = FileCommanderUI.overlay;
    },

    show(startItem) {
        if (!FileCommanderUI.overlay) this.init();
        
        if (!startItem) {
            startItem = { kind: 'root', name: 'Workspaces', path: '/' };
        }
        
        this.navigate(startItem);
        FileCommanderUI.show();
    },

    hide() {
        FileCommanderUI.hide();
    },

    navigate(item) {
        FileCommanderCore.navigate(item, () => {
            FileCommanderUI.render(this.getData());
        });
    },

    goUp() {
        const parent = FileCommanderCore.getParent();
        if (parent) {
            this.navigate(parent);
        }
    },

    getData() {
        return {
            currentPathItem: FileCommanderCore.currentPathItem,
            currentFiles: FileCommanderCore.currentFiles
        };
    }
};