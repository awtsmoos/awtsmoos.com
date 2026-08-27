
// B"H
/**
 * @file DirectiveBox.js
 * @brief THE PALACE OF SACRED DIRECTIVES (System Prompt).
 */

import { ModelManager } from '../../model-manager.js';
import { PromptBuilder } from '../../modules/prompt-builder.js';
import { UI } from '../../../ui.js';

export const DirectiveBox = {
    /**
     * B"H - Builds the instruction editor vessel.
     */
    build(customPrompt) {
        return {
            className: 'vibe-manager-box directive',
            children: [
                {
                    className: 'vibe-manager-title-row',
                    children: [
                        { tag: 'h3', className: 'vibe-manager-box-title', text: '◈ Sacred Directive' },
                        { 
                            tag: 'button', id: 'mgr-reset-prompt', className: 'secondary-btn', 
                            style: { minHeight: 0, padding: '5px 15px', fontSize: '0.7em', borderColor: 'var(--neon-magenta)', color: 'var(--neon-magenta)' }, 
                            text: 'TOHU RESET' 
                        }
                    ]
                },
                { 
                    tag: 'p', 
                    style: { fontSize: '0.8em', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '15px' }, 
                    text: 'The fundamental logic that sustains the Oracle\'s consciousness.' 
                },
                { 
                    tag: 'textarea', id: 'mgr-system-prompt', 
                    className: 'vibe-manager-textarea', 
                    text: customPrompt,
                    placeholder: 'Enter the primordial commandments...' 
                },
                {
                    style: { marginTop: '20px', display: 'flex', justifyContent: 'flex-end' },
                    children: [
                        { 
                            tag: 'button', id: 'mgr-save-prompt', 
                            className: 'primary-btn', 
                            style: { padding: '15px 40px', fontWeight: 'bold', fontSize: '1.1em', borderRadius: '4px', boxShadow: '0 0 25px var(--glow-magenta)' }, 
                            text: 'UPDATE SYSTEM BLUEPRINT' 
                        }
                    ]
                }
            ]
        };
    },

    bind(container) {
        const area = container.querySelector('#mgr-system-prompt');
        const save = container.querySelector('#mgr-save-prompt');
        const reset = container.querySelector('#mgr-reset-prompt');

        if (save) {
            save.onclick = () => {
                const val = area ? area.value.trim() : '';
                ModelManager.setCustomPrompt(val);
                UI.showToast('Sacred Instruction Manifested.', 'success');
            };
        }

        if (reset) {
            reset.onclick = async () => {
                const msg = 'Restore the primordial default blueprint? Your manual edits will return to the potential.';
                const confirmed = await UI.showDialog({ 
                    title: 'B"H - Reconstitute Order', 
                    message: msg, 
                    okText: 'RESET' 
                });
                if (confirmed) {
                    const def = PromptBuilder.getDefaultSystemBase();
                    if (area) area.value = def;
                    ModelManager.setCustomPrompt(def);
                    UI.showToast('Prime Instructions Restored.', 'info');
                }
            };
        }
    }
};
