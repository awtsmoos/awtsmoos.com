// B"H
/**
 * @module MobileHeichelNavigationLayout
 * @description
 * Chapter 300: The gate receives every missing vessel.
 *
 * The Awtsmoos gives the navigation shell a topbar, hero, tabs, bottom path,
 * and a creation modal whose anatomy matches the modal nerve-center. No hidden
 * button is imagined. Every ref spoken here is real in the DOM.
 */

export function getFullLayoutBlueprint(actions) {
    return {
        tag: 'div',
        attr: { class: 'geelooy-social-shell heichel-mobile-navigation' },
        ref: 'pageContainer',
        children: [
            topbar(actions),
            drawer(),
            { tag: 'main', attr: { class: 'geelooy-main-stage' }, children: [hero(), contentPanel(actions)] },
            bottomNav(),
            { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' },
            bulkBar(),
            modal(actions)
        ]
    };
}

function topbar(actions) {
    return { tag: 'header', attr: { class: 'heichel-mobile-topbar' }, children: [
        { tag: 'button', attr: { id: 'sidebar-toggle-btn', class: 'topbar-icon', type: 'button', 'aria-label': 'Open navigation' }, ref: 'sidebarToggleBtn', children: ['☰'], events: { click: actions.toggleSidebar } },
        { tag: 'div', attr: { class: 'topbar-title' }, children: [{ tag: 'strong', children: ['Heichel'] }, { tag: 'small', children: ['Navigation'] }] },
        { tag: 'a', attr: { class: 'topbar-icon', href: '/notifications', 'aria-label': 'Notifications' }, children: ['◌'] }
    ] };
}

function hero() {
    return { tag: 'section', attr: { class: 'geelooy-heichel-hero' }, children: [
        { tag: 'div', attr: { class: 'heichel-hero-glow' } },
        { tag: 'div', attr: { class: 'heichel-hero-copy' }, children: [
            { tag: 'div', attr: { class: 'heichel-seal' }, children: ['⚜'] },
            { tag: 'div', children: [
                { tag: 'p', attr: { class: 'hero-kicker' }, children: ['Current Heichel'] },
                { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
                { tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
            ] }
        ] },
        { tag: 'div', attr: { class: 'hero-stats' }, children: ['About', 'Heichelos', 'Series', 'Posts'].map(label => ({ tag: 'span', children: [label] })) }
    ] };
}

function contentPanel(actions) {
    return { tag: 'section', attr: { class: 'heichel-nav-panel' }, children: [
        { tag: 'div', attr: { id: 'seriesNameAndInfo', class: 'series-heading hidden' }, ref: 'seriesInfoArea', children: [
            { tag: 'p', attr: { class: 'series-label' }, children: ['Current Series'] },
            { tag: 'h2', ref: 'seriesTitle' },
            { tag: 'p', ref: 'seriesDesc' },
            { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
        ] },
        { tag: 'div', attr: { class: 'series-search-row' }, children: [
            { tag: 'input', attr: { type: 'search', placeholder: 'Search series and posts...', 'aria-label': 'Search series and posts' }, ref: 'searchInput', events: { input: actions.onSearch } },
            { tag: 'button', attr: { type: 'button', class: 'filter-chip' }, children: ['Filter'] }
        ] },
        { tag: 'nav', attr: { class: 'tab-gates geelooy-tabs' }, children: [
            { tag: 'button', attr: { class: 'tab Active', type: 'button' }, ref: 'postsTab', children: ['Timeline'], events: { click: () => actions.switchView('posts') } },
            { tag: 'button', attr: { class: 'tab', type: 'button' }, ref: 'seriesTab', children: ['Series'], events: { click: () => actions.switchView('series') } }
        ] },
        { tag: 'div', attr: { class: 'grid-realms' }, children: [grid('posts', 'postsList', 'loadingPosts'), grid('series', 'seriesList', 'loadingSeries', true)] }
    ] };
}

function grid(type, listRef, loadRef, hidden = false) {
    return { tag: 'div', attr: { class: `viewport ${type} ${hidden ? 'hidden' : ''}` }, ref: `${type}Viewport`, children: [
        { tag: 'div', attr: { class: 'dynamic-grid' }, ref: listRef },
        { tag: 'div', attr: { class: 'sacred-loading hidden' }, ref: loadRef, children: ['Loading...'] }
    ] };
}

function drawer() {
    return { tag: 'aside', attr: { class: 'geelooy-mobile-drawer' }, children: ['Home', 'Heichelos', 'Series', 'Messages', 'Profile'].map(label => ({ tag: 'a', attr: { href: label === 'Home' ? '/' : `/${label.toLowerCase()}` }, children: [label] })) };
}

function bottomNav() {
    return { tag: 'nav', attr: { class: 'geelooy-bottom-nav' }, children: [['Home', '/'], ['Tree', '#seriesNameAndInfo'], ['+', '/heichelos/submit'], ['Inbox', '/email'], ['Profile', '/profile']].map(([label, href]) => ({ tag: 'a', attr: { href }, children: [label] })) };
}

function bulkBar() {
    return { tag: 'div', attr: { id: 'bulk-actions-bar', class: 'hidden-void' }, ref: 'bulkActionsBar', children: [
        { tag: 'span', ref: 'selectionCount' },
        { tag: 'button', attr: { class: 'ritual-btn danger', type: 'button' }, ref: 'bulkDeleteBtn', children: ['Delete'] },
        { tag: 'button', attr: { class: 'ritual-btn', type: 'button' }, ref: 'exitSelectionBtn', children: ['Cancel'] }
    ] };
}

function modal(actions) {
    return { tag: 'div', attr: { class: 'modal-gate-hidden', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true' }, ref: 'modalRoot', children: [
        { tag: 'div', attr: { class: 'gate-backdrop' }, ref: 'modalBackdrop', events: { click: actions.closeModal } },
        { tag: 'div', attr: { class: 'gate-chamber' }, children: [
            { tag: 'h3', ref: 'modalTitle' },
            { tag: 'form', ref: 'modalForm', events: { submit: actions.onModalSubmit }, children: [
                { tag: 'select', attr: { 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [
                    { tag: 'option', attr: { value: 'post' }, children: ['Post'] },
                    { tag: 'option', attr: { value: 'question' }, children: ['Question'] },
                    { tag: 'option', attr: { value: 'answer' }, children: ['Answer'] }
                ] },
                { tag: 'input', attr: { type: 'text', required: true, placeholder: 'Title' }, ref: 'modalTitleInput' },
                { tag: 'textarea', attr: { placeholder: 'Description' }, ref: 'modalDescTextarea' },
                { tag: 'input', attr: { type: 'text', placeholder: 'Custom ID' }, ref: 'modalIdInput' },
                { tag: 'div', attr: { class: 'gate-actions' }, children: [
                    { tag: 'button', attr: { type: 'button' }, ref: 'modalCancelBtn', children: ['Cancel'] },
                    { tag: 'button', attr: { type: 'submit' }, children: ['Save'] }
                ] }
            ] }
        ] }
    ] };
}
