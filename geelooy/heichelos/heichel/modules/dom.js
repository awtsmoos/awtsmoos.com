//B"H
// /heichelos/heichel/modules/dom.js
// The sacred map, charting the physical layout of the Library.

export const DOMElements = {};

/**
 * @function initializeDOMElements
 * @description The holy act of recognizing the physical form. This function maps every critical DOM element 
 * to the DOMElements object, ensuring that the application's soul (JavaScript) can interact with its body (HTML). 
 * It is the bridge between potentiality and actuality, a microcosm of the Awtsmoos giving form to the void.
 */
export function initializeDOMElements() {
    const requiredIds = [
        'heichel-main-title', 'sidebar-title', 'postsTab', 'seriesTab',
        'postsList', 'seriesList', 'toast-container', 'creation-modal',
        'editorControlsHeader', 'editorHeaderArrow', 'sidebar-toggle-btn',
        'editorsHeader'
    ];
    for (const id of requiredIds) {
        if (!document.getElementById(id)) {
            throw new Error(`CRITICAL VESSEL MISSING: Element #${id} was not found.`);
        }
    }

    DOMElements.pageContainer = document.querySelector('.heichel-page-container');
    DOMElements.mainTitle = document.getElementById('heichel-main-title');
    DOMElements.searchInput = document.getElementById('heichel-search-input');
    DOMElements.sidebarTitle = document.getElementById('sidebar-title');
    DOMElements.sidebarDesc = document.getElementById('sidebar-description');
    DOMElements.postsTab = document.getElementById('postsTab');
    DOMElements.seriesTab = document.getElementById('seriesTab');
    DOMElements.breadcrumbContainer = document.getElementById('breadcrumb-container');
    DOMElements.postsContainer = document.querySelector('.view.posts');
    DOMElements.seriesContainer = document.querySelector('.view.series');
    DOMElements.postsControls = document.querySelector('.posts-controls');
    DOMElements.seriesControlsContainer = document.querySelector('.series-controls');
    DOMElements.seriesControls = document.getElementById('seriesControls');
    DOMElements.postsList = document.getElementById('postsList');
    DOMElements.seriesList = document.getElementById('seriesList');
    DOMElements.loadingPosts = document.getElementById('loadingPosts');
    DOMElements.loadingSeries = document.getElementById('loadingSeries');
    DOMElements.toastContainer = document.getElementById('toast-container');
    DOMElements.authorName = document.getElementById('author-name');
    DOMElements.controlsArea = document.querySelector('.editor-controls-area');
    DOMElements.editorControlsHeader = document.getElementById('editorControlsHeader');
    DOMElements.controlsContainer = document.querySelector('.editor-controls-area .controls-container');
    DOMElements.editorControlsArrow = document.querySelector('.editor-controls-area .controls-arrow');
    DOMElements.editorsSection = document.getElementById('editorsHeader');
    DOMElements.editorHolder = document.querySelector('.editors-holder');
    DOMElements.editorHeaderArrow = document.getElementById('editorHeaderArrow');
    DOMElements.modalRoot = document.getElementById('creation-modal');
    DOMElements.modalBackdrop = DOMElements.modalRoot.querySelector('.modal-backdrop');
    DOMElements.modalForm = document.getElementById('creation-form');
    DOMElements.modalTitle = document.getElementById('modal-title');
    DOMElements.modalTitleInput = document.getElementById('modal-input-title');
    DOMElements.modalDescTextarea = document.getElementById('modal-input-description');
    DOMElements.modalIdInput = document.getElementById('modal-input-id');
    DOMElements.modalCancelBtn = document.getElementById('modal-cancel-btn');
    DOMElements.modalSubmitBtn = document.getElementById('modal-submit-btn');
    DOMElements.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

    // B"H - Mapping the vessels for bulk actions, which were previously lost in the void.
    DOMElements.bulkActionsBar = document.getElementById('bulk-actions-bar');
    DOMElements.selectionCount = document.getElementById('selection-count');
    DOMElements.bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    DOMElements.exitSelectionBtn = document.getElementById('exit-selection-mode-btn');
}