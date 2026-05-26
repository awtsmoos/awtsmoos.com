// /heichelos/heichel/modules/modal.js
// B"H - Handles the logic for the creation modal.

import { DOMElements } from './dom.js';
import * as api from '../api.js';
import { appState } from '../state.js';
import { notify } from './ui.js';

let currentModalType = null;
let currentModalMode = "create";
let editingSeriesId = null;
let navigatorRef = null;

// This function is called by event listeners and other modules to show the modal.
export function openModal(type, navigator, options = {}) {
    currentModalType = type;
    currentModalMode = options.mode || "create";
    editingSeriesId = options.seriesId || null;
    navigatorRef = navigator;

    DOMElements.modalTitle.textContent = currentModalMode === "edit"
        ? "Edit Series"
        : `Create New ${creationLabel(type, options.contentType || "post")}`;
    DOMElements.modalTitleInput.value = options.title || "";
    DOMElements.modalDescTextarea.value = options.description || "";
    DOMElements.modalIdInput.value = options.inputId || "";
    if (DOMElements.modalContentTypeSelect) {
        DOMElements.modalContentTypeSelect.value = options.contentType || "post";
        DOMElements.modalContentTypeSelect.disabled = currentModalMode === "edit" || type === "series";
    }
    DOMElements.modalIdInput.disabled = currentModalMode === "edit";
    DOMElements.modalRoot.classList.remove("modal-hidden");
    DOMElements.modalTitleInput.focus();
}

// Hides the modal and resets the form.
export function closeModal() {
    DOMElements.modalRoot.classList.add('modal-hidden');
    DOMElements.modalForm.reset();
    DOMElements.modalIdInput.disabled = false;
    if (DOMElements.modalContentTypeSelect) DOMElements.modalContentTypeSelect.disabled = false;
    currentModalMode = "create";
    editingSeriesId = null;
}

function creationLabel(type, contentType) {
    if (type === "series") return "Series";
    return ({ question: "Question", answer: "Answer", post: "Post" })[contentType] || "Post";
}

// Handles the form submission logic.
async function handleSubmit(event) {
    event.preventDefault();
    if (!navigatorRef) return;

    const title = DOMElements.modalTitleInput.value.trim();
    const description = DOMElements.modalDescTextarea.value.trim();
    const id = DOMElements.modalIdInput.value.trim();
    const contentType = DOMElements.modalContentTypeSelect?.value || "post";

    if (!title) {
        notify('Title is required.', 'error');
        return;
    }
    
    const label = creationLabel(currentModalType, contentType);
    notify(`Creating new ${label.toLowerCase()}...`, 'info');

    try {
        if (currentModalMode === "edit" && editingSeriesId) {
            await api.editSeriesDetails({
                heichelId: appState.heichelId,
                seriesId: editingSeriesId,
                aliasId: window.curAlias,
                title,
                description
            });
            notify('Series updated successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(editingSeriesId);
        } else if (currentModalType === "post" && contentType === "question") {
            await api.createQuestion({
                heichelId: appState.heichelId,
                aliasId: window.curAlias,
                postId: id,
                title,
                content: description,
                seriesId: appState.currentSeries
            });
            notify('Question created successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(appState.currentSeries);
        } else if (currentModalType === "post" && contentType === "answer") {
            await api.createAnswer({
                heichelId: appState.heichelId,
                questionId: appState.currentSeries,
                aliasId: window.curAlias,
                answerId: id,
                title,
                content: description,
                seriesId: appState.currentSeries
            });
            notify('Answer created successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(appState.currentSeries);
        } else if (currentModalType === "post") {
            await api.createPost({
                heichelId: appState.heichelId,
                seriesId: appState.currentSeries,
                aliasId: window.curAlias,
                title,
                content: description
            });
            notify('Post created successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(appState.currentSeries);
        } else {
            await api.createSeries({
                heichelId: appState.heichelId,
                aliasId: window.curAlias,
                parentSeriesId: appState.currentSeries,
                inputId: id,
                title,
                description
            });
            notify('Series created successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(appState.currentSeries);
        }

    } catch (error) {
        notify(`Error creating ${label.toLowerCase()}: ${error.message}`, 'error');
        console.error(`Failed to create ${label.toLowerCase()}:`, error);
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
