// B"H
import { toggleModal } from '../../ui.js';
import * as persistence from '../../persistence.js';

export function setupEditorListeners(uiManager, elements) {
    const { buttons, healthTuner, ai } = elements;

    // --- Custom Level Editor ---
    buttons.newLevel.addEventListener('click', () => uiManager.editor.showLevelEditor(null));
    buttons.editorBack.addEventListener('click', () => uiManager.showCustomLevels());
    buttons.saveLevel.addEventListener('click', () => uiManager.editor.saveLevel());
    buttons.eraser.addEventListener('click', (e) => uiManager.editor.toggleEraser(e.currentTarget));
    buttons.importLevel.addEventListener('change', (e) => uiManager.editor.importLevel(e));
    buttons.addRowAbove.addEventListener('click', () => uiManager.editor.addRowAbove());

    elements.levelNameInput.addEventListener('input', (e) => {
        e.target.style.borderColor = '';
        e.target.placeholder = 'Enter Level Name';
    });

    // --- AI Modal ---
    buttons.aiGenerate.addEventListener('click', () => {
        const providerId = ai.providerSelect.value;
        uiManager.ai.showAiModal(providerId);
    });

    ai.providerSelect.addEventListener('change', (e) => {
        // Future-proofing: could save last selected provider
    });

    ai.modalCancelKey.addEventListener('click', () => toggleModal(false, 'ai-modal'));
    ai.modalCancelGenerate.addEventListener('click', () => toggleModal(false, 'ai-modal'));
    ai.modalGenerate.addEventListener('click', () => uiManager.ai.handleGenerate());
    ai.keySave.addEventListener('click', () => uiManager.ai.saveKeyAndFetchModels());
    ai.keyForget.addEventListener('click', () => uiManager.ai.forgetKey());
    ai.modelSelect.addEventListener('change', (e) => {
        const providerId = uiManager.ai.currentProviderId;
        persistence.setAiModelForProvider(providerId, e.target.value);
    });

    // --- Health Tuner Modal ---
    buttons.brushHealthDisplay.addEventListener('click', () => uiManager.editor.showBrushHealthTuner());
    healthTuner.set.addEventListener('click', () => uiManager.editor.healthTuner.set());
    healthTuner.cancel.addEventListener('click', () => uiManager.editor.healthTuner.hide());
    healthTuner.plus.addEventListener('click', () => uiManager.editor.healthTuner.increment());
    healthTuner.minus.addEventListener('click', () => uiManager.editor.healthTuner.decrement());
    healthTuner.slider.addEventListener('input', (e) => uiManager.editor.healthTuner.update(e.target.value));
    healthTuner.input.addEventListener('input', (e) => uiManager.editor.healthTuner.update(e.target.value));
}