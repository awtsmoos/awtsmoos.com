// /heichelos/heichel/modules/dom.js
// B"H 
//- Centralized DOM element access. The single point of interaction with the HTML structure.
//- The object is populated by initializeDOMElements() after the DOM has loaded.

export const DOMElements = {};

export function initializeDOMElements() {
    // FIX: All critical elements, including the form and its inputs, are now checked.
    const requiredElementIds = [
        'heichel-main-title', 'sidebar-title', 'sidebar-description', 'postsTab', 
        'seriesTab',  'postsControls', 'seriesControlsContainer',
        'postsList', 'seriesList', 'toast-container', 'bulk-actions-bar',
        // --- Modal Element Checklist ---
        'creation-modal', 'creation-form', 'modal-title', 'modal-input-title',
        'modal-input-description', 'modal-cancel-btn', 'modal-submit-btn'
    ];
    
    for (const id of requiredElementIds) {
        if (!document.getElementById(id)) {
            // This provides a precise error message if any part of the HTML is broken or missing.
            throw new Error(`CRITICAL DOM ERROR: Element with ID '#${id}' was not found. The application cannot start.`);
        }
    }

    DOMElements.heichelPageContainer = document.querySelector('.heichel-page-container');
    DOMElements.mainTitle = document.getElementById('heichel-main-title');
    DOMElements.sidebarTitle = document.getElementById('sidebar-title');
    DOMElements.sidebarDesc = document.getElementById('sidebar-description');
    
    DOMElements.postsTab = document.getElementById('postsTab');
    DOMElements.seriesTab = document.getElementById('seriesTab');
    //DOMElements.selectionBtn = document.getElementById('selectionModeBtn');
    
    DOMElements.seriesNameInfo = document.getElementById('seriesNameAndInfo');
    DOMElements.breadcrumbContainer = document.getElementById('breadcrumb-container');
    DOMElements.seriesName = document.getElementById('seriesNm');
    DOMElements.seriesDesc = document.getElementById('seriesDesc');
    DOMElements.seriesControls = document.getElementById('seriesControls');
    
    DOMElements.postsContainer = document.querySelector('.posts');
    DOMElements.seriesContainer = document.querySelector('.series');
    
    DOMElements.postsControls = document.getElementById('postsControls');
    DOMElements.seriesControlsContainer = document.getElementById('seriesControlsContainer');
    
    DOMElements.postsList = document.getElementById('postsList');
    DOMElements.seriesList = document.getElementById('seriesList');
    
    DOMElements.loadingPosts = document.getElementById('loadingPosts');
    DOMElements.loadingSeries = document.getElementById('loadingSeries');
    
    DOMElements.toastContainer = document.getElementById('toast-container');
    
    DOMElements.bulkActionsBar = document.getElementById('bulk-actions-bar');
    DOMElements.selectionCount = document.getElementById('selection-count');
    DOMElements.bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    DOMElements.exitSelectionBtn = document.getElementById('exit-selection-mode-btn');

    // FIX: All modal elements are now guaranteed to be found because of the check above.
    DOMElements.modalRoot = document.getElementById('creation-modal');
    DOMElements.modalBackdrop = DOMElements.modalRoot.querySelector('.modal-backdrop');
    DOMElements.modalForm = document.getElementById('creation-form');
    DOMElements.modalTitle = document.getElementById('modal-title');
    DOMElements.modalTitleInput = document.getElementById('modal-input-title');
    DOMElements.modalDescTextarea = document.getElementById('modal-input-description');
    DOMElements.modalIdInput = document.getElementById('modal-input-id');
    DOMElements.modalCancelBtn = document.getElementById('modal-cancel-btn');
    DOMElements.modalSubmitBtn = document.getElementById('modal-submit-btn');
}