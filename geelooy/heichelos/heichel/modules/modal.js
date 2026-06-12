// B"H
/**
 * @module HeichelCreationModal
 * @description
 * Chapter 299: The gate stops shattering on a missing hinge.
 *
 * The Awtsmoos creates every vessel from nothing every instant, yet a browser
 * event listener still needs a real node. This module treats modal pieces as
 * named vessels: required gates are checked, optional gates are blessed if they
 * exist, and repeated imports cannot bind duplicate nerves.
 */

import { DOMElements } from './dom.js';
import * as api from '../api.js';
import { appState } from '../state.js';
import { notify } from './ui.js';

let currentModalType = null;
let currentModalMode = 'create';
let editingSeriesId = null;
let navigatorRef = null;
let listenersBound = false;

function creationLabel(type, contentType) {
    if (type === 'series') return 'Series';
    return ({ question: 'Question', answer: 'Answer', post: 'Post' })[contentType] || 'Post';
}

function el(name) {
    return DOMElements[name] || null;
}

function setText(node, value) {
    if (node) node.textContent = value;
}

function setValue(node, value) {
    if (node) node.value = value || '';
}

function setDisabled(node, value) {
    if (node) node.disabled = Boolean(value);
}

function setOpen(isOpen) {
    const root = el('modalRoot');
    if (!root) return;
    root.classList.toggle('modal-gate-hidden', !isOpen);
    root.classList.toggle('modal-hidden', !isOpen);
    root.classList.toggle('modal-root-open', isOpen);
    root.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
}

export function openModal(type, navigator, options = {}) {
    currentModalType = type;
    currentModalMode = options.mode || 'create';
    editingSeriesId = options.seriesId || null;
    navigatorRef = navigator;

    const contentType = options.contentType || 'post';
    setText(el('modalTitle'), currentModalMode === 'edit'
        ? 'Edit Series'
        : `Create New ${creationLabel(type, contentType)}`);
    setValue(el('modalTitleInput'), options.title);
    setValue(el('modalDescTextarea'), options.description);
    setValue(el('modalIdInput'), options.inputId);

    const typeSelect = el('modalContentTypeSelect');
    if (typeSelect) {
        typeSelect.value = contentType;
        setDisabled(typeSelect, currentModalMode === 'edit' || type === 'series');
    }
    setDisabled(el('modalIdInput'), currentModalMode === 'edit');
    setOpen(true);
    el('modalTitleInput')?.focus?.();
}

export function closeModal() {
    setOpen(false);
    el('modalForm')?.reset?.();
    setDisabled(el('modalIdInput'), false);
    setDisabled(el('modalContentTypeSelect'), false);
    currentModalMode = 'create';
    editingSeriesId = null;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!navigatorRef) return;

    const title = (el('modalTitleInput')?.value || '').trim();
    const description = (el('modalDescTextarea')?.value || '').trim();
    const id = (el('modalIdInput')?.value || '').trim();
    const contentType = el('modalContentTypeSelect')?.value || 'post';

    if (!title) {
        notify('Title is required.', 'error');
        return;
    }

    const label = creationLabel(currentModalType, contentType);
    notify(`${currentModalMode === 'edit' ? 'Saving' : 'Creating'} ${label.toLowerCase()}...`, 'info');

    try {
        if (currentModalMode === 'edit' && editingSeriesId) {
            await api.editSeriesDetails({ heichelId: appState.heichelId, seriesId: editingSeriesId, aliasId: window.curAlias, title, description });
            notify('Series updated successfully!', 'success');
            closeModal();
            await navigatorRef.loadContent(editingSeriesId);
            return;
        }

        if (currentModalType === 'post' && contentType === 'question') {
            await api.createQuestion({ heichelId: appState.heichelId, aliasId: window.curAlias, postId: id, title, content: description, seriesId: appState.currentSeries });
        } else if (currentModalType === 'post' && contentType === 'answer') {
            await api.createAnswer({ heichelId: appState.heichelId, questionId: appState.currentSeries, aliasId: window.curAlias, answerId: id, title, content: description, seriesId: appState.currentSeries });
        } else if (currentModalType === 'post') {
            await api.createPost({ heichelId: appState.heichelId, seriesId: appState.currentSeries, aliasId: window.curAlias, title, content: description });
        } else {
            await api.createSeries({ heichelId: appState.heichelId, aliasId: window.curAlias, parentSeriesId: appState.currentSeries, inputId: id, title, description });
        }

        notify(`${label} created successfully!`, 'success');
        closeModal();
        await navigatorRef.loadContent(appState.currentSeries);
    } catch (error) {
        notify(`Error with ${label.toLowerCase()}: ${error.message}`, 'error');
        console.error(`B"H - Failed modal action for ${label.toLowerCase()}:`, error);
    }
}

export function initializeModal() {
    if (listenersBound) return;
    const form = el('modalForm');
    const cancel = el('modalCancelBtn');
    const backdrop = el('modalBackdrop');
    if (!form || !backdrop) {
        console.warn('B"H - Modal vessels are not present yet; creation modal remains dormant.', { hasForm: Boolean(form), hasBackdrop: Boolean(backdrop) });
        return;
    }
    listenersBound = true;
    form.addEventListener('submit', handleSubmit);
    cancel?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    setOpen(false);
}
