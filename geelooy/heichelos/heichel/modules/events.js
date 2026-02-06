// B"H 
//- Centralized Event Listener attachment.

import { DOMElements } from './dom.js';
import * as ui from './ui.js';
import { initializeModal } from './modal.js';
import { appState } from '../state.js';

export function initializeEventListeners(navigator) {
    
    // Initialize Modal System first so it's ready.
    initializeModal();
    DOMElements.editorsSection.addEventListener("click", () => {
        DOMElements.editorHolder.classList.toggle("extended");
        DOMElements.editorHeaderArrow.classList.toggle("expanded")
    })
    // Main Tab Navigation
    DOMElements.postsTab.addEventListener('click', () => navigator.switchView('posts'));
    DOMElements.seriesTab.addEventListener('click', () => navigator.switchView('series'));

    // Search Listener
    if (DOMElements.searchInput) {
        DOMElements.searchInput.addEventListener('input', (e) => {
            navigator.filterContent(e.target.value);
        });
    }

    // Sidebar Toggle Listener
    if(DOMElements.sidebarToggleBtn) {
        DOMElements.sidebarToggleBtn.addEventListener('click', () => {
            const isCollapsed = DOMElements.pageContainer.classList.toggle('sidebar-collapsed');
            DOMElements.sidebarToggleBtn.innerHTML = isCollapsed ? '‹' : '›';
            DOMElements.sidebarToggleBtn.title = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
        });
    }

    // Selection Mode Controls
    //DOMElements.selectionBtn.addEventListener('click', () => ui.toggleSelectionMode(!appState.isSelectionMode, navigator));
    DOMElements.exitSelectionBtn.addEventListener('click', () => ui.toggleSelectionMode(false, navigator));
    DOMElements.bulkDeleteBtn.addEventListener('click', () => navigator.deleteSelectedItems());

    // Browser Back/Forward Navigation
    window.addEventListener('popstate', () => {
        const newParams = new URLSearchParams(window.location.search);
        navigator.currentView = newParams.get('view') || 'posts';
        navigator.loadContent(newParams.get('series') || 'root');
    });
    DOMElements.editorControlsHeader.addEventListener("click", () => {
        DOMElements.editorControlsArrow.classList.toggle("expanded");
        DOMElements.controlsContainer.classList.toggle("expanded");
    })
    /*
    // Card Hover Mouse Tracking for CSS effect
    DOMElements.heichelPageContainer.addEventListener('mousemove', e => {
        const containerRect = DOMElements.heichelPageContainer.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        DOMElements.heichelPageContainer.style.setProperty('--mouse-x-page', `${x}px`);
        DOMElements.heichelPageContainer.style.setProperty('--mouse-y-page', `${y}px`);
    });
    */
}