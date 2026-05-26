
/**
 * B"H
 * @module LayoutBlueprint
 * @description
 * The dimensions of the Library as envisioned in Atzilus.
 * This sacred text defines the structural vessels of the Heichel.
 */
export function getFullLayoutBlueprint(actions) {
    return {
        tag: 'div',
        attr: { class: 'heichel-sovereign-wrapper' },
        ref: 'pageContainer',
        children:[
            {
                tag: 'div',
                attr: { class: 'main-content-flow' },
                children:[
                    {
                        tag: 'button',
                        attr: { id: 'sidebar-toggle-btn', class: 'sidebar-toggle-btn' },
                        ref: 'sidebarToggleBtn',
                        children: ['›'],
                        events: { click: actions.toggleSidebar }
                    },
                    {
                        tag: 'div',
                        attr: { class: 'heichel-stage-center' },
                        children: [
                            getHeaderBlueprint(actions),
                            getContentPanelBlueprint(actions)
                        ]
                    },
                    getSidebarBlueprint(actions)
                ]
            },
            // Holy Overlays
            { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' },
            getBulkActionsBlueprint(actions),
            getCreationModalBlueprint(actions)
        ]
    };
}

function getHeaderBlueprint(actions) {
    return {
        tag: 'header',
        attr: { class: 'heichel-arch-header' },
        children:[
            { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
            {
                tag: 'div',
                attr: { class: 'search-altar' },
                children:[
                    {
                        tag: 'input',
                        attr: { type: 'text', placeholder: 'Seek through the expanse...' },
                        ref: 'searchInput',
                        events: { input: actions.onSearch }
                    }
                ]
            },
            {
                tag: 'div',
                attr: { id: 'seriesNameAndInfo', class: 'hidden' },
                ref: 'seriesInfoArea',
                children:[
                    { tag: 'h2', ref: 'seriesTitle' },
                    { tag: 'p', ref: 'seriesDesc' },
                    { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
                ]
            }
        ]
    };
}

function getContentPanelBlueprint(actions) {
    return {
        tag: 'div',
        attr: { class: 'heichel-viewport-panel' },
        children:[
            {
                tag: 'nav',
                attr: { class: 'tab-gates' },
                children:[
                    { tag: 'button', attr: { class: 'tab Active' }, ref: 'postsTab', children: ['Posts'], events: { click: () => actions.switchView('posts') } },
                    { tag: 'button', attr: { class: 'tab' }, ref: 'seriesTab', children: ['Series'], events: { click: () => actions.switchView('series') } }
                ]
            },
            {
                tag: 'div',
                attr: { class: 'grid-realms' },
                children:[
                    createGridContainer('posts', 'postsList', 'loadingPosts'),
                    createGridContainer('series', 'seriesList', 'loadingSeries', true)
                ]
            }
        ]
    };
}

function getSidebarBlueprint(actions) {
    return {
        tag: 'aside',
        attr: { class: 'heichel-library-sidebar' },
        ref: 'sidebar',
        children:[
            { tag: 'div', attr: { class: 'breadcrumb-trail' }, ref: 'breadcrumb' },
            { tag: 'h2', children:['Realm Memory'] },
            {
                tag: 'div',
                attr: { class: 'owner-action-vessels' },
                ref: 'controlsArea',
                children:[
                    { tag: 'div', attr: { class: 'grouping' }, ref: 'seriesControlsContainer' },
                    { tag: 'div', attr: { class: 'grouping hidden' }, ref: 'postsControls' }
                ]
            },
            {
                tag: 'div',
                attr: { class: 'guardians-chamber' },
                ref: 'editorsSection',
                children:[
                    { tag: 'div', attr: { class: 'section-header' }, children: ['Guiding Guardians'] },
                    { tag: 'div', attr: { class: 'guardians-list' }, ref: 'editorHolder' }
                ]
            },
            { tag: 'p', attr: { class: 'realm-whisper' }, ref: 'heichelDescription' }
        ]
    };
}

function createGridContainer(type, listRef, loadRef, hidden = false) {
    return {
        tag: 'div',
        attr: { class: `viewport ${type} ${hidden ? 'hidden' : ''}` },
        children:[
            { tag: 'div', attr: { class: 'dynamic-grid' }, ref: listRef },
            { tag: 'div', attr: { class: 'sacred-loading hidden' }, ref: loadRef, children:['Illuminating...'] }
        ]
    };
}

function getBulkActionsBlueprint(actions) {
    return {
        tag: 'div',
        attr: { id: 'bulk-actions-bar', class: 'hidden-void' },
        ref: 'bulkActionsBar',
        children:[
            { tag: 'span', ref: 'selectionCount' },
            { tag: 'button', attr: { class: 'ritual-btn danger' }, ref: 'bulkDeleteBtn', children: ['Consume Selected'] },
            { tag: 'button', attr: { class: 'ritual-btn' }, ref: 'exitSelectionBtn', children: ['Cease Selection'] }
        ]
    };
}

function getCreationModalBlueprint(actions) {
    return {
        tag: 'div',
        attr: { class: 'modal-gate-hidden' },
        ref: 'modalRoot',
        children:[
            { tag: 'div', attr: { class: 'gate-backdrop' }, ref: 'modalBackdrop', events: { click: actions.closeModal } },
            {
                tag: 'div',
                attr: { class: 'gate-chamber' },
                children:[
                    { tag: 'h3', ref: 'modalTitle' },
                    {
                        tag: 'form',
                        ref: 'modalForm',
                        events: { submit: actions.onModalSubmit },
                        children:[
                            { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [
                                { tag: 'option', attr: { value: 'post' }, children: ['Regular Post'] },
                                { tag: 'option', attr: { value: 'question' }, children: ['Question'] },
                                { tag: 'option', attr: { value: 'answer' }, children: ['Answer'] }
                            ] },
                            { tag: 'input', attr: { type: 'text', required: true, placeholder: 'Holy Title' }, ref: 'modalTitleInput' },
                            { tag: 'textarea', attr: { placeholder: 'Essence Description' }, ref: 'modalDescTextarea' },
                            { tag: 'input', attr: { type: 'text', placeholder: 'Custom ID' }, ref: 'modalIdInput' },
                            {
                                tag: 'div',
                                attr: { class: 'ritual-controls' },
                                children:[
                                    { tag: 'button', attr: { type: 'button' }, ref: 'modalCancelBtn', children: ['Retreat'], events: { click: actions.closeModal } },
                                    { tag: 'button', attr: { type: 'submit' }, children: ['Breathe Life'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
}
