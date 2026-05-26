
/**
 * B"H
 * @module LibraryBlueprint
 * @description
 * Before a stone was laid in the physical heavens, the blueprints 
 * were drawn in the Wisdom of the Awtsmoos. This module contains 
 * the JSON mappings that define every gate, pillar, and shelf 
 * within the Great Library.
 */

/**
 * @function getLibraryLayout
 * @description Returns the JSON structure of the entire page.
 * @param {Object} actions - Event handlers to be woven into the manifestation.
 */
export function getLibraryLayout(actions) {
    return {
        tag: 'div',
        attr: { class: 'heichel-page-container' },
        ref: 'pageContainer',
        children: [
            {
                tag: 'div',
                attr: { class: 'main-content-wrapper' },
                children: [
                    {
                        tag: 'button',
                        attr: { id: 'sidebar-toggle-btn', class: 'sidebar-toggle', title: 'Toggle Sidebar' },
                        ref: 'sidebarToggleBtn',
                        children: ['›'],
                        events: { click: actions.toggleSidebar }
                    },
                    {
                        tag: 'div',
                        attr: { class: 'heichel-main-stage' },
                        children: [
                            // 1. Header Chamber
                            {
                                tag: 'header',
                                attr: { class: 'heichel-header' },
                                children: [
                                    { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
                                    {
                                        tag: 'div',
                                        attr: { class: 'heichel-search-wrapper' },
                                        children: [
                                            { 
                                                tag: 'input', 
                                                attr: { type: 'text', id: 'heichel-search-input', placeholder: 'Search...' },
                                                ref: 'searchInput',
                                                events: { input: actions.onSearch }
                                            }
                                        ]
                                    },
                                    {
                                        tag: 'div',
                                        attr: { id: 'seriesNameAndInfo', class: 'hidden' },
                                        ref: 'seriesInfoArea',
                                        children: [
                                            { tag: 'h2', attr: { id: 'seriesNm' }, ref: 'seriesTitle' },
                                            { tag: 'p', attr: { id: 'seriesDesc' }, ref: 'seriesDesc' },
                                            { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
                                        ]
                                    }
                                ]
                            },
                            // 2. Content Viewports
                            {
                                tag: 'div',
                                attr: { class: 'heichel-content-panel' },
                                children: [
                                    {
                                        tag: 'nav',
                                        attr: { class: 'content-tabs' },
                                        children: [
                                            { tag: 'button', attr: { id: 'postsTab', class: 'tab Active' }, ref: 'postsTab', children: ['Posts'], events: { click: () => actions.switchView('posts') } },
                                            { tag: 'button', attr: { id: 'seriesTab', class: 'tab' }, ref: 'seriesTab', children: ['Series'], events: { click: () => actions.switchView('series') } }
                                        ]
                                    },
                                    {
                                        tag: 'div',
                                        attr: { class: 'content-views' },
                                        children: [
                                            createGridStructure('posts', 'postsList', 'loadingPosts'),
                                            createGridStructure('series', 'seriesList', 'loadingSeries', true)
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // 3. Sidebar Anchor
                    {
                        tag: 'aside',
                        attr: { class: 'heichel-sidebar' },
                        ref: 'sidebar',
                        children: [
                            { tag: 'div', attr: { id: 'breadcrumb-container' }, ref: 'breadcrumb' },
                            { tag: 'h2', attr: { id: 'sidebar-title' }, children: ['About this Realm'] },
                            {
                                tag: 'div',
                                attr: { class: 'editor-controls-area' },
                                ref: 'controlsArea',
                                children: [
                                    { tag: 'div', attr: { class: 'series-controls' }, ref: 'seriesControlsContainer' },
                                    { tag: 'div', attr: { class: 'posts-controls hidden' }, ref: 'postsControls' }
                                ]
                            },
                            {
                                tag: 'div',
                                attr: { class: 'editors-section' },
                                ref: 'editorsSection',
                                children: [
                                    { tag: 'div', attr: { class: 'editors-title' }, children: ['Editors:'] },
                                    { tag: 'div', attr: { class: 'editors-holder' }, ref: 'editorHolder' }
                                ]
                            },
                            { tag: 'p', attr: { id: 'sidebar-description' }, ref: 'heichelDescription' }
                        ]
                    }
                ]
            },
            // Overlays
            { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' },
            createBulkActionBar(),
            createCreationModal(actions.onModalSubmit, actions.closeModal)
        ]
    };
}

function createGridStructure(cls, listRef, loadRef, hidden = false) {
    return {
        tag: 'div',
        attr: { class: `view ${cls} ${hidden ? 'hidden' : ''}` },
        children: [
            { tag: 'div', attr: { id: listRef, class: 'grid-container' }, ref: listRef },
            { tag: 'div', attr: { id: loadRef, class: 'loading-spinner hidden' }, ref: loadRef, children: ['B"H - Manifesting...'] }
        ]
    };
}

function createBulkActionBar() {
    return {
        tag: 'div',
        attr: { id: 'bulk-actions-bar', class: 'hidden' },
        ref: 'bulkActionsBar',
        children: [
            { tag: 'span', attr: { id: 'selection-count' }, ref: 'selectionCount' },
            { 
                tag: 'div', 
                attr: { class: 'actions' }, 
                children: [{ tag: 'button', attr: { id: 'bulk-delete-btn', class: 'danger' }, ref: 'bulkDeleteBtn', children: ['Delete Selected'] }] 
            },
            { tag: 'button', attr: { id: 'exit-selection-mode-btn' }, ref: 'exitSelectionBtn', children: ['Done'] }
        ]
    };
}

function createCreationModal(onSubmit, onCancel) {
    return {
        tag: 'div',
        attr: { id: 'creation-modal', class: 'modal-hidden' },
        ref: 'modalRoot',
        children: [
            { tag: 'div', attr: { class: 'modal-backdrop' }, ref: 'modalBackdrop', events: { click: onCancel } },
            {
                tag: 'div',
                attr: { class: 'modal-content' },
                children: [
                    { tag: 'h3', attr: { id: 'modal-title' }, ref: 'modalTitle' },
                    {
                        tag: 'form',
                        attr: { id: 'creation-form' },
                        ref: 'modalForm',
                        events: { submit: onSubmit },
                        children: [
                            { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [
                                { tag: 'option', attr: { value: 'post' }, children: ['Regular Post'] },
                                { tag: 'option', attr: { value: 'question' }, children: ['Question'] },
                                { tag: 'option', attr: { value: 'answer' }, children: ['Answer'] }
                            ] },
                            { tag: 'input', attr: { type: 'text', id: 'modal-input-title', required: true, placeholder: 'Title' }, ref: 'modalTitleInput' },
                            { tag: 'textarea', attr: { id: 'modal-input-description', placeholder: 'Description' }, ref: 'modalDescTextarea' },
                            { tag: 'input', attr: { type: 'text', id: 'modal-input-id', placeholder: 'Custom ID (Optional)' }, ref: 'modalIdInput' },
                            {
                                tag: 'div',
                                attr: { class: 'modal-actions' },
                                children: [
                                    { tag: 'button', attr: { type: 'button', id: 'modal-cancel-btn' }, ref: 'modalCancelBtn', children: ['Cancel'], events: { click: onCancel } },
                                    { tag: 'button', attr: { type: 'submit', id: 'modal-submit-btn' }, children: ['Manifest'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
}
