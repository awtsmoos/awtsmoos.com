// B"H
/**
 * @file panel.js
 * @brief Controller for the repaired AI Chat sidebar.
 *
 * Chapter 1: In the narrow panel, the Awtsmoos reveals order. Rendering,
 * transcript, model selection, and streaming each stand in their own chamber;
 * the Send button no longer drowns in the scroll, and errors are spoken plainly.
 */

import { ModelManager } from '../../../model-manager.js';
import { AI_CHAT_COPY, systemPromptForTab } from './config.js';
import { chatView, noKeyView, refs } from './dom.js';
import { clearLines, modelMessages, paintTranscript, pushLine } from './transcript.js';
import { keyForModel, streamAiChat } from './streamer.js';

/**
 * B"H. Full AI Chat sidebar panel implementation.
 */
export const AIChatSidebarPanel = {
    /**
     * B"H. Renders and binds the panel.
     * @param {HTMLElement} container Sidebar body.
     * @param {object} tab Active Vibe tab.
     * @returns {Promise<void>}
     */
    async render(container, tab) {
        const models = ModelManager.availableModels || [];
        const currentModel = ModelManager.currentModel || models[0]?.id || '';
        container.innerHTML = '';

        if (!models.length || !keyForModel(currentModel)) {
            container.appendChild(noKeyView());
            return;
        }

        container.appendChild(chatView(models, currentModel));
        const ui = refs(container);
        paintTranscript(ui.output, tab);
        bindComposer(ui, tab);
    }
};

function bindComposer(ui, tab) {
    ui.send.onclick = () => sendPrompt(ui, tab);
    ui.clear.onclick = () => {
        clearLines(tab);
        ui.status.textContent = AI_CHAT_COPY.empty;
        paintTranscript(ui.output, tab);
    };
    ui.prompt.onkeydown = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendPrompt(ui, tab);
        }
    };
}

async function sendPrompt(ui, tab) {
    const prompt = ui.prompt.value.trim();
    const modelId = ui.model.value;
    if (!prompt) return;

    setBusy(ui, true, AI_CHAT_COPY.thinking);
    pushLine(tab, 'user', prompt);
    ui.prompt.value = '';
    paintTranscript(ui.output, tab);

    try {
        const answer = await streamAiChat({
            modelId,
            messages: modelMessages(tab, prompt, systemPromptForTab(tab)),
            onStatus: status => { ui.status.textContent = status || AI_CHAT_COPY.igniting; },
            onDraft: draft => paintTranscript(ui.output, tab, 'ASSISTANT: ' + draft)
        });
        pushLine(tab, 'assistant', answer || '(empty response)');
        ui.status.textContent = 'Complete.';
        paintTranscript(ui.output, tab);
    } catch (error) {
        const message = error?.message || String(error);
        pushLine(tab, 'assistant', 'Error: ' + message);
        ui.status.textContent = 'Error: ' + message;
        paintTranscript(ui.output, tab);
    } finally {
        setBusy(ui, false);
    }
}

function setBusy(ui, busy, status = '') {
    ui.send.disabled = busy;
    ui.prompt.disabled = busy;
    ui.model.disabled = busy;
    ui.send.textContent = busy ? 'Sending…' : 'Send ✦';
    if (status) ui.status.textContent = status;
}
