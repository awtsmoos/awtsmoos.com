
// B"H
import { EditorCore } from './core.js';

export const Editor = {
    ...EditorCore,
    init() {
        console.log("B\"H - Editor System Awakened.");
    },
    getContent: () => document.getElementById('editor').value,
    getCursorInfo: () => {
        const el = document.getElementById('editor');
        const lines = (el.value.substring(0, el.selectionStart)).split("\n");
        return { line: lines.length, col: lines[lines.length - 1].length + 1 };
    },
    focus: () => document.getElementById('editor').focus()
};
