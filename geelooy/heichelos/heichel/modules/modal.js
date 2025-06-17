// /heichelos/heichel/modules/modal.js
// B"H - Handles the logic for the creation modal.

import { DOMElements } from './dom.js';
import * as api from '../api.js';
import { appState } from '../state.js';
import { notify } from './ui.js';

let currentModalType = null;
let navigatorRef = null;

// This function is called by event listeners and other modules to show the modal.
export function openModal(type, navigator) {
    currentModalType = type;
    navigatorRef = navigator;

    DOMElements.modalTitle.textContent = type === 'series' ? 'Create New Series' : 'Create New Post';
    DOMElements.modalRoot.classList.remove('modal-hidden');
    DOMElements.modalTitleInput.focus();
}

// Hides the modal and resets the form.
export function closeModal() {
    DOMElements.modalRoot.classList.add('modal-hidden');
    DOMElements.modalForm.reset();
}

// Handles the form submission logic.
async function handleSubmit(event) {
    event.preventDefault();
    if (!navigatorRef) return;

    const title = DOMElements.modalTitleInput.value.trim();
    const description = DOMElements.modalDescTextarea.value.trim();
    const id = DOMElements.modalIdInput.value.trim();

    if (!title) {
        notify('Title is required.', 'error');
        return;
    }
    
    notify(`Creating new ${currentModalType}...`, 'info');
    closeModal(); // Close modal immediately for better UX

    try {
        await api.createSeries({
            heichelId: appState.heichelId,
            aliasId: window.curAlias,
            parentSeriesId: appState.currentSeries,
            inputId: id,
            title: name,
            descrption
                
        });

        notify('Series created successfully!', 'success');
        // Refresh the content to show the new series
        await navigatorRef.loadContent(appState.currentSeries);

    } catch (error) {
        notify(`Error creating series: ${error.message}`, 'error');
        console.error('Failed to create series:', error);
    }
}

// This function is called once at startup by events.js
export function initializeModal() {
    // The DOMElements are now populated centrally before this runs.
    // This is the line that was previously causing the error.
    DOMElements.modalForm.addEventListener('submit', handleSubmit);
    DOMElements.modalCancelBtn.addEventListener('click', closeModal);
    DOMElements.modalBackdrop.addEventListener('click', closeModal);
}