
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
    build(gKey, orKey, groqKey, cerebrasKey, openaiKey, xaiKey, togetherKey, minimaxKey, models) {
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
                // Groq Section
                this._credentialPalace('Groq', 'gsk_...', groqKey, 'mgr-api-key-groq', 'mgr-save-key-groq', 'https://console.groq.com/keys'),
                // Cerebras Section
                this._credentialPalace('Cerebras', 'csk-...', cerebrasKey, 'mgr-api-key-cerebras', 'mgr-save-key-cerebras', 'https://cloud.cerebras.ai/platform/api-keys'),
                // OpenAI Section
                this._credentialPalace('OpenAI', 'sk-...', openaiKey, 'mgr-api-key-openai', 'mgr-save-key-openai', 'https://platform.openai.com/api-keys'),
                // xAI Section
                this._credentialPalace('xAI (Grok)', 'xai-...', xaiKey, 'mgr-api-key-xai', 'mgr-save-key-xai', 'https://console.x.ai'),
                // Together Section
                this._credentialPalace('Together AI', 'together-...', togetherKey, 'mgr-api-key-together', 'mgr-save-key-together', 'https://api.together.xyz/settings/api-keys'),
                // MiniMax Section
                this._credentialPalace('MiniMax', 'sk-cp-...', ModelManager.getKey('minimax') || '', 'mgr-api-key-minimax', 'mgr-save-key-minimax', 'https://api.minimax.io/'),
                
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
                await ModelManager.addKey(k);
                refresh();
                UI.showToast('Credential Bound: ' + provider, 'success');
            }
        };

        const gBtn = container.querySelector('#mgr-save-key-g');
        if (gBtn) gBtn.onclick = () => bindKey('#mgr-api-key-google', 'google');
        
        const oBtn = container.querySelector('#mgr-save-key-o');
        if (oBtn) oBtn.onclick = () => bindKey('#mgr-api-key-or', 'openrouter');

        const groqBtn = container.querySelector('#mgr-save-key-groq');
        if (groqBtn) groqBtn.onclick = () => bindKey('#mgr-api-key-groq', 'groq');

        const cerebrasBtn = container.querySelector('#mgr-save-key-cerebras');
        if (cerebrasBtn) cerebrasBtn.onclick = () => bindKey('#mgr-api-key-cerebras', 'cerebras');

        const openaiBtn = container.querySelector('#mgr-save-key-openai');
        if (openaiBtn) openaiBtn.onclick = () => bindKey('#mgr-api-key-openai', 'openai');

        const xaiBtn = container.querySelector('#mgr-save-key-xai');
        if (xaiBtn) xaiBtn.onclick = () => bindKey('#mgr-api-key-xai', 'xai');

        const togetherBtn = container.querySelector('#mgr-save-key-together');
        if (togetherBtn) togetherBtn.onclick = () => bindKey('#mgr-api-key-together', 'together');

        const minimaxBtn = container.querySelector('#mgr-save-key-minimax');
        if (minimaxBtn) minimaxBtn.onclick = () => bindKey('#mgr-api-key-minimax', 'minimax');

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
