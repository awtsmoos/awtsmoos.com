// B"H
/**
 * @module LibraryBlueprint
 * @description
 * Chapter 44: The old map folds into a smaller parchment without losing a gate.
 * The Awtsmoos contracts the palace into fewer lines, and every shelf, modal,
 * sidebar, and grid still stands exactly where the visitor expects it.
 */
export function getLibraryLayout(actions) {
    return div('heichel-page-container', [
        div('main-content-wrapper', [
            sidebarToggle(actions.toggleSidebar),
            mainStage(actions),
            sidebar()
        ], { ref: 'pageContainer' }),
        { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' },
        createBulkActionBar(),
        createCreationModal(actions.onModalSubmit, actions.closeModal)
    ]);
}

function mainStage(actions) {
    return div('heichel-main-stage', [header(actions), contentPanel(actions)]);
}

function header(actions) {
    return {
        tag: 'header',
        attr: { class: 'heichel-header' },
        children: [
            { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
            div('heichel-search-wrapper', [searchInput(actions.onSearch)]),
            seriesInfo()
        ]
    };
}

function contentPanel(actions) {
    return div('heichel-content-panel', [
        { tag: 'nav', attr: { class: 'content-tabs' }, children: tabs(actions) },
        div('content-views', [
            createGridStructure('posts', 'postsList', 'loadingPosts'),
            createGridStructure('series', 'seriesList', 'loadingSeries', true)
        ])
    ]);
}

function sidebarToggle(onClick) {
    return {
        tag: 'button',
        attr: { id: 'sidebar-toggle-btn', class: 'sidebar-toggle', title: 'Toggle Sidebar' },
        ref: 'sidebarToggleBtn',
        children: ['›'],
        events: { click: onClick }
    };
}

function searchInput(onInput) {
    return {
        tag: 'input',
        attr: { type: 'text', id: 'heichel-search-input', placeholder: 'Search...' },
        ref: 'searchInput',
        events: { input: onInput }
    };
}

function seriesInfo() {
    return {
        tag: 'div',
        attr: { id: 'seriesNameAndInfo', class: 'hidden' },
        ref: 'seriesInfoArea',
        children: [
            { tag: 'h2', attr: { id: 'seriesNm' }, ref: 'seriesTitle' },
            { tag: 'p', attr: { id: 'seriesDesc' }, ref: 'seriesDesc' },
            { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
        ]
    };
}

function tabs(actions) {
    return [
        tab('postsTab', 'Posts', 'tab Active', () => actions.switchView('posts')),
        tab('seriesTab', 'Series', 'tab', () => actions.switchView('series'))
    ];
}

function tab(ref, label, className, onClick) {
    return { tag: 'button', attr: { id: ref, class: className }, ref, children: [label], events: { click: onClick } };
}

function sidebar() {
    return {
        tag: 'aside',
        attr: { class: 'heichel-sidebar' },
        ref: 'sidebar',
        children: [
            { tag: 'div', attr: { id: 'breadcrumb-container' }, ref: 'breadcrumb' },
            { tag: 'h2', attr: { id: 'sidebar-title' }, children: ['About this Realm'] },
            editorControls(),
            editorsSection(),
            { tag: 'p', attr: { id: 'sidebar-description' }, ref: 'heichelDescription' }
        ]
    };
}

function editorControls() {
    return div('editor-controls-area', [
        div('series-controls', [], { ref: 'seriesControlsContainer' }),
        div('posts-controls hidden', [], { ref: 'postsControls' })
    ], { ref: 'controlsArea' });
}

function editorsSection() {
    return div('editors-section', [
        div('editors-title', ['Editors:']),
        div('editors-holder', [], { ref: 'editorHolder' })
    ], { ref: 'editorsSection' });
}

function createGridStructure(cls, listRef, loadRef, hidden = false) {
    return div(`view ${cls} ${hidden ? 'hidden' : ''}`, [
        { tag: 'div', attr: { id: listRef, class: 'grid-container' }, ref: listRef },
        { tag: 'div', attr: { id: loadRef, class: 'loading-spinner hidden' }, ref: loadRef, children: ['B"H - Manifesting...'] }
    ]);
}

function createBulkActionBar() {
    return {
        tag: 'div',
        attr: { id: 'bulk-actions-bar', class: 'hidden' },
        ref: 'bulkActionsBar',
        children: [
            { tag: 'span', attr: { id: 'selection-count' }, ref: 'selectionCount' },
            div('actions', [{ tag: 'button', attr: { id: 'bulk-delete-btn', class: 'danger' }, ref: 'bulkDeleteBtn', children: ['Delete Selected'] }]),
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
            div('modal-content', [
                { tag: 'h3', attr: { id: 'modal-title' }, ref: 'modalTitle' },
                modalForm(onSubmit, onCancel)
            ])
        ]
    };
}

function modalForm(onSubmit, onCancel) {
    return {
        tag: 'form',
        attr: { id: 'creation-form' },
        ref: 'modalForm',
        events: { submit: onSubmit },
        children: [contentTypeSelect(), textInput('modal-input-title', 'Title', 'modalTitleInput', true), textarea(), textInput('modal-input-id', 'Custom ID (Optional)', 'modalIdInput'), modalActions(onCancel)]
    };
}

function contentTypeSelect() {
    return { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [option('post', 'Regular Post'), option('question', 'Question'), option('answer', 'Answer')] };
}

function option(value, label) { return { tag: 'option', attr: { value }, children: [label] }; }
function textarea() { return { tag: 'textarea', attr: { id: 'modal-input-description', placeholder: 'Description' }, ref: 'modalDescTextarea' }; }
function textInput(id, placeholder, ref, required = false) { return { tag: 'input', attr: { type: 'text', id, required, placeholder }, ref }; }
function modalActions(onCancel) { return div('modal-actions', [{ tag: 'button', attr: { type: 'button', id: 'modal-cancel-btn' }, ref: 'modalCancelBtn', children: ['Cancel'], events: { click: onCancel } }, { tag: 'button', attr: { type: 'submit', id: 'modal-submit-btn' }, children: ['Manifest'] }]); }
function div(className, children, rest = {}) { return { tag: 'div', attr: { class: className }, children, ...rest }; }
