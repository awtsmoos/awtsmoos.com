
// B"H
// FILE: js/app/listeners/shortcuts.js

import { State, DOM } from '../../state.js';
import { CommandPalette } from '../../command-palette.js';
import { Tabs } from '../../tabs/index.js';
import { Editor } from '../../editor.js';
import { FindReplace } from '../../find-replace.js';
import { Menus } from '../../menus/index.js';
import { App } from '../../app.js';
import { Effects } from '../../effects.js';
import { VibeController } from '../../vibe/vibe-controller.js';

/**
 * @function setupShortcutListeners
 * @description The vessel that perceives the user's will expressed through the sacred
 * combinations of keys. It listens to the entire cosmos (window) for these commands and
 * translates them into actions, a bridge between intention and manifestation.
 */
export function setupShortcutListeners() {
    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        if (!hasModifier && e.key.length === 1) {
            Effects.playKeystrokeSound(e.key);
        }

        if (e.key === 'Escape') {
            // ... (Escape logic remains)
        }

        if (hasModifier && shift && e.key.toLowerCase() === 'p') {
            e.preventDefault(); CommandPalette.toggle();
        }
        if (hasModifier && shift && e.key.toLowerCase() === 't') {
            e.preventDefault(); Tabs.reopenLastClosed();
        }
        if (hasModifier && e.key.toLowerCase() === 'g') {
            e.preventDefault(); Editor.promptGoToLine();
        }
        if (hasModifier && e.key.toLowerCase() === 's') {
            e.preventDefault();
            const activeTab = State.tabs.find(t => t.id === State.activeTabId);
            if (activeTab?.fileType === 'vibe') VibeController.saveSessionToFile(activeTab);
            else Tabs.saveActive();
        }
        if (hasModifier && e.key.toLowerCase() === 'f') {
            e.preventDefault(); FindReplace.show(DOM.editor.value.substring(DOM.editor.selectionStart, DOM.editor.selectionEnd));
        }
    });

    // Editor-specific shortcuts
    DOM.editor.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        if (hasModifier && shift && e.key.toLowerCase() === 'd') { e.preventDefault(); Editor.duplicateLine(); }
        else if (hasModifier && shift && e.key.toLowerCase() === 'k') { e.preventDefault(); Editor.deleteLine(); }
        else if (hasModifier && e.key === '/') { e.preventDefault(); Editor.toggleComment(); }
        else if (hasModifier && !shift && e.key === 'Enter') { e.preventDefault(); Editor.insertLine('after'); }
        else if (hasModifier && shift && e.key === 'Enter') { e.preventDefault(); Editor.insertLine('before'); }
        else if (alt && e.key === 'ArrowUp') { e.preventDefault(); Editor.moveLine(-1); }
        else if (alt && e.key === 'ArrowDown') { e.preventDefault(); Editor.moveLine(1); }
    });
}
