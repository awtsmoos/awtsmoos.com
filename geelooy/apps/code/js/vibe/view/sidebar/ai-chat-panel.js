// B"H
/**
 * @file ai-chat-panel.js
 * @brief A standalone AI chat panel in the sidebar — uses any available model.
 */

import { HTML } from '../../../html-generator.js';
import { ModelManager } from '../../model-manager.js';
import { VibeAPI } from '../../api/client.js';
import { ToolSchemas } from '../../agent/schemas/index.js';

export const AIChatPanel = {
    async render(container, tab, controller) {
        const models = ModelManager.availableModels;
        const currentModel = ModelManager.currentModel;
        const apiKey = ModelManager.getActiveKey();

        container.innerHTML = '';

        if (!apiKey) {
            container.appendChild(HTML({
                style: { padding: '20px', textAlign: 'center', color: 'var(--neon-cyan)', opacity: 0.7 },
                children: [
                    { tag: 'div', style: { fontSize: '2em', marginBottom: '10px' }, text: '🔑' },
                    { tag: 'p', text: 'No API key bound.' },
                    { tag: 'p', style: { fontSize: '0.8em', opacity: 0.6 }, text: 'Open Settings (⚙) to bind a key.' }
                ]
            }));
            return;
        }

        const textareaId = 'ai-chat-prompt';
        const sendBtnId = 'ai-chat-send';
        const modelSelId = 'ai-chat-model';
        const outputId = 'ai-chat-output';

        container.appendChild(HTML({
            style: { display: 'flex', flexDirection: 'column', height: '100%', padding: '10px', gap: '8px' },
            children: [
                {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    children: [
                        { tag: 'span', style: { color: 'var(--neon-cyan)', fontSize: '0.85em', fontWeight: 'bold' }, text: '⚡ AI CHAT' },
                        { tag: 'select', id: modelSelId, className: 'vibe-manager-select', style: { fontSize: '0.75em', padding: '2px 6px' }, children: models.map(m => ({ tag: 'option', value: m.id, text: m.displayName || m.id, attributes: m.id === currentModel ? { selected: 'true' } : {} })) }
                    ]
                },
                { tag: 'textarea', id: textareaId, className: 'vibe-textarea', style: { flexGrow: 0, minHeight: '60px', fontSize: '0.8em', resize: 'none' }, placeholder: 'Ask anything...' },
                { tag: 'button', id: sendBtnId, className: 'primary-btn', style: { minHeight: 0, padding: '5px 12px', fontSize: '0.85em' }, text: 'SEND ✦' },
                {
                    id: outputId,
                    className: 'vibe-context-list',
                    style: { flexGrow: 1, overflowY: 'auto', fontSize: '0.8em', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' },
                    text: ''
                }
            ]
        }));

        const textarea = container.querySelector('#' + textareaId);
        const sendBtn = container.querySelector('#' + sendBtnId);
        const modelSel = container.querySelector('#' + modelSelId);
        const output = container.querySelector('#' + outputId);

        const doSend = async () => {
            const prompt = textarea.value.trim();
            if (!prompt) return;

            const selectedModel = modelSel.value;
            const key = ModelManager.getKeyForModel(selectedModel) || apiKey;
            output.textContent = '⏳ Thinking...';

            try {
                let fullText = '';
                let fullReasoning = '';

                await VibeAPI.streamChat(
                    [{ role: 'user', content: prompt }],
                    key,
                    selectedModel,
                    ToolSchemas,
                    () => { output.textContent = '⏳ Igniting...'; },
                    (chunk) => { fullText += chunk; output.textContent = fullText + (fullReasoning ? '\n\n[reasoning] ' + fullReasoning.slice(-200) : ''); },
                    (thought) => { fullReasoning += thought; output.textContent = fullText + '\n\n[reasoning] ' + fullReasoning.slice(-200); },
                    (tools) => { output.textContent = fullText + `\n\n[${tools.length} tool call(s)]`; },
                    (finalText, finalReasoning, finalTools) => {
                        let result = finalText;
                        if (finalReasoning) result += '\n\n[Reasoning]: ' + finalReasoning.slice(-500);
                        if (finalTools.length) result += '\n\n[Tool Calls]: ' + finalTools.map(t => t.function.name).join(', ');
                        output.textContent = result;
                    },
                    (err) => { output.textContent = '✗ Error: ' + (err.message || String(err)); }
                );
            } catch (e) {
                output.textContent = '✗ Error: ' + e.message;
            }
        };

        sendBtn.onclick = doSend;
        textarea.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
        };
    }
};