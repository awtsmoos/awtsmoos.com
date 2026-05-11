
// B"H
/**
 * @file GatekeeperBox.js
 * @brief THE PALACE OF THE DIMENSIONAL KEYS.
 */

import { ModelManager } from '../../model-manager.js';
import { UI } from '../../../ui.js';

export const GatekeeperBox = {
    /**
     * B"H - Constructs the API Credentials Sphere.
     */
    build(gKey, orKey, models) {
        return {
            className: 'vibe-manager-box gatekeepers',
            children: [
                {
                    className: 'vibe-manager-title-row',
                    children: [
                        { tag: 'h3', className: 'vibe-manager-box-title', text: '◈ The Gatekeepers' },
                        { tag: 'span', style: { color: 'var(--neon-lime)', fontSize: '0.7em', fontWeight: 'bold' }, text: 'API INTEGRITY :: ACTIVE' }
                    ]
                },
                // Google Section
                this._credentialPalace('Google Gemini', 'AIzaSy...', gKey, 'mgr-api-key-google', 'mgr-save-key-g'),
                // OpenRouter Section
                this._credentialPalace('OpenRouter Multi-Vessel', 'sk-or-v1-...', orKey, 'mgr-api-key-or', 'mgr-save-key-o', 'https://openrouter.ai/keys'),
                
                // Model Selection Sphere
                {
                    style: { marginTop: '10px' },
                    children: [
                        { tag: 'label', className: 'vibe-manager-label', style: { color: 'var(--neon-magenta)', fontSize: '0.85em' }, text: 'Manifestation Vessel (Current Model)' },
                        {
                            tag: 'select', id: 'mgr-model-select', className: 'vibe-manager-select',
                            children: models.length > 0 ? models.map(m => {
                                const pIcon = m.provider === 'openrouter' ? '🌐' : '⚡';
                                let info = '';
                                if (m.costPrompt !== undefined && m.costPrompt !== null) {
                                    info = ' ($' + m.costPrompt + ' / $' + m.costCompletion + ')';
                                }
                                
                                return {
                                    tag: 'option', value: m.id,
                                    attributes: m.id === ModelManager.currentModel ? { selected: 'true' } : {},
                                    text: pIcon + ' ' + m.displayName + info
                                };
                            }) : [{ tag: 'option', text: 'Synthesize Credentials to View Models' }]
                        }
                    ]
                }
            ]
        };
    },

    _credentialPalace(title, hint, val, inputId, btnId, link = null) {
        const parts = [
            { tag: 'label', className: 'vibe-manager-label', text: title + ' Identifier' },
            {
                className: 'vibe-manager-input-group',
                children: [
                    { tag: 'input', type: 'password', id: inputId, className: 'vibe-manager-input', value: val, placeholder: hint },
                    { tag: 'button', id: btnId, className: 'primary-btn', style: { minHeight: 0, padding: '0 25px', borderRadius: '4px' }, text: 'BIND' }
                ]
            }
        ];

        if (link) {
            parts.push({ 
                tag: 'a', href: link, target: '_blank', 
                style: { display: 'inline-block', marginBottom: '15px', color: 'var(--neon-cyan)', fontSize: '0.7em', textDecoration: 'underline' }, 
                text: 'Invoke Portal for New Key' 
            });
        }

        return { children: parts };
    },

    bind(container, refresh) {
        const bindKey = async (id, provider) => {
            const el = container.querySelector(id);
            if (el) {
                const k = el.value.trim();
                await ModelManager.addKey(provider, k);
                refresh();
                UI.showToast('Credential Bound: ' + provider, 'success');
            }
        };

        const gBtn = container.querySelector('#mgr-save-key-g');
        if (gBtn) gBtn.onclick = () => bindKey('#mgr-api-key-google', 'google');
        
        const oBtn = container.querySelector('#mgr-save-key-o');
        if (oBtn) oBtn.onclick = () => bindKey('#mgr-api-key-or', 'openrouter');

        const sel = container.querySelector('#mgr-model-select');
        if (sel) {
            sel.onchange = (e) => {
                ModelManager.currentModel = e.target.value;
                ModelManager.save();
                UI.showToast('Active Portal Shipped: ' + e.target.value, 'info');
            };
        }
    }
};
