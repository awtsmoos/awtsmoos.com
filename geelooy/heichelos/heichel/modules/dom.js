
/**
 * B"H
 * @module DOM
 * @description The Sacred Map of the Library's Physical Form.
 */

export const DOMElements = {};

export function initializeDOMElements() {
    // 1. Core Structures
    DOMElements.pageContainer = document.querySelector('.heichel-page-container');
    DOMElements.mainStage = document.querySelector('.main');
    DOMElements.scrollView = document.querySelector('.scroll-view-wrapper');
    DOMElements.sidebar = document.querySelector('.sidebar');
    
    // 2. Head & Search
    DOMElements.mainTitle = document.getElementById('heichel-main-title');
    DOMElements.searchInput = document.getElementById('heichel-search-input');
    
    // 3. Lists & Grids
    DOMElements.postsList = document.getElementById('postsList');
    DOMElements.seriesList = document.getElementById('seriesList');
    DOMElements.loadingPosts = document.getElementById('loadingPosts');
    DOMElements.loadingSeries = document.getElementById('loadingSeries');

    // 4. Tabs
    DOMElements.postsTab = document.getElementById('postsTab');
    DOMElements.seriesTab = document.getElementById('seriesTab');

    // 5. Modals & Overlays
    DOMElements.modalRoot = document.getElementById('creation-modal');
    DOMElements.toastContainer = document.getElementById('toast-container');
    
    // B"H - NEW VESSELS
    DOMElements.floatingArk = document.querySelector('.awtsmoos-floating-controls');
    DOMElements.lensOverlay = document.getElementById('scribeLensOverlay');
    
    console.log("B\"H - DOM Map manifested.");
}
