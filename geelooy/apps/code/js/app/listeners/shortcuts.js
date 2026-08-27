
// B"H
/**
 * @file shortcuts.js
 * @brief The Interpreter of the User's Will.
 * 
 * POEM OF THE SACRED COMBINATION:
 * Two keys pressed together, a command is reborn,
 * Like the blast of the Shofar on a holy dawn.
 * But if the scroll is empty, if the tabs are not found,
 * The logic falls silent, with a hollow sound.
 * We check for the array, we look for the length,
 * To give every shortcut its wisdom and strength.
 * From Ctrl-S to the Vibe, the manifestation is clear,
 * Guarding the vessel from every shadow of fear.
 */

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
 * @description Establishes the nervous system for keyboard interaction.
 * B"H - Rectified: Added protection against undefined tab arrays during init/refresh.
 */
export function setupShortcutListeners() {
    console.log('[Shortcuts] B"H - Binding global listeners.');

    window.addEventListener('keydown', (e) => {
        const hasModifier = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        
        // B"H - Audio feedback ritual
        if (!hasModifier && e.key.length === 1) {
            Effects.playKeystrokeSound(e.key);
        }

        if (e.key === 'Escape') {
            Menus.hideAll();
            CommandPalette.hide();
            FindReplace.hide();
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
            
            // B"H - THE RECTIFICATION: Safe access to tabs array
            const tabList = State.tabs || [];
            if (tabList.length === 0) {
                console.warn('[Shortcuts] B"H - Save ignored: No tabs manifested.');
                return;
            }

            const activeTab = tabList.find(t => t.id === State.activeTabId);
            if (activeTab) {
                if (activeTab.fileType === 'vibe') {
                    VibeController.saveSessionToFile(activeTab);
                } else {
                    Tabs.saveActive();
                }
            }
        }

        if (hasModifier && e.key.toLowerCase() === 'f') {
            const editorVal = DOM.editor ? DOM.editor.value : "";
            const selStart = DOM.editor ? DOM.editor.selectionStart : 0;
            const selEnd = DOM.editor ? DOM.editor.selectionEnd : 0;
            
            e.preventDefault(); 
            FindReplace.show(editorVal.substring(selStart, selEnd));
        }
    });

    // B"H - Editor-specific interactions
    if (DOM.editor) {
        DOM.editor.addEventListener('keydown', (e) => {
            const hasModifier = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            const alt = e.altKey;

            if (hasModifier && shift && e.key.toLowerCase() === 'd') { 
                e.preventDefault(); Editor.duplicateLine(); 
            }
            else if (hasModifier && shift && e.key.toLowerCase() === 'k') { 
                e.preventDefault(); Editor.deleteLine(); 
            }
            else if (hasModifier && e.key === '/') { 
                e.preventDefault(); Editor.toggleComment(); 
            }
            else if (hasModifier && !shift && e.key === 'Enter') { 
                e.preventDefault(); Editor.insertLine('after'); 
            }
            else if (hasModifier && shift && e.key === 'Enter') { 
                e.preventDefault(); Editor.insertLine('before'); 
            }
            else if (alt && e.key === 'ArrowUp') { 
                e.preventDefault(); Editor.moveLine(-1); 
            }
            else if (alt && e.key === 'ArrowDown') { 
                e.preventDefault(); Editor.moveLine(1); 
            }
        });
    }
}
