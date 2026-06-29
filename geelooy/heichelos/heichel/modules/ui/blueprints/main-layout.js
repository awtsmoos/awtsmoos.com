// B"H
/**
 * @module MobileHeichelNavigationLayout
 * @description
 * Chapter 737: The browsing palace receives a visible breadcrumb river.
 * The Awtsmoos breathes through classes, shells, and quiet labels; no post viewer,
 * parser, editor, API, route, or rendering algorithm is touched by this crown.
 */
export function getFullLayoutBlueprint(actions) {
    return {
        tag: 'div', attr: { class: 'geelooy-social-shell heichel-mobile-navigation' }, ref: 'pageContainer',
        children: [topbar(actions), drawer(), { tag: 'main', attr: { class: 'geelooy-main-stage' }, children: [hero(), contentPanel(actions)] }, bottomNav(), { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' }, bulkBar(), modal(actions)]
    };
}

function topbar(actions) {
    return { tag: 'header', attr: { class: 'heichel-mobile-topbar' }, children: [
        { tag: 'button', attr: { id: 'sidebar-toggle-btn', class: 'topbar-icon', type: 'button', 'aria-label': 'Open navigation', 'aria-expanded': 'false' }, ref: 'sidebarToggleBtn', children: ['☰'], events: { click: actions.toggleSidebar } },
        { tag: 'div', attr: { class: 'topbar-title' }, children: [{ tag: 'strong', children: ['Heichel'] }, { tag: 'small', children: ['Collection navigation'] }] },
        { tag: 'details', attr: { class: 'topbar-notification-menu' }, children: [
            { tag: 'summary', attr: { class: 'topbar-icon', 'aria-label': 'Navigation utilities' }, children: ['◌'] },
            { tag: 'div', attr: { class: 'topbar-menu-panel' }, children: [{ tag: 'a', attr: { href: '#platform-panel' }, children: ['Open inline panel'] }, { tag: 'a', attr: { href: '/notifications', target: '_blank', rel: 'noopener' }, children: ['Open notifications tab'] }] }
        ] }
    ] };
}

function hero() {
    return { tag: 'section', attr: { class: 'geelooy-heichel-hero', 'aria-labelledby': 'heichel-main-title' }, children: [
        { tag: 'div', attr: { class: 'heichel-hero-glow', 'aria-hidden': 'true' } },
        { tag: 'div', attr: { class: 'heichel-hero-copy' }, children: [
            { tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['⚜'] },
            { tag: 'p', attr: { class: 'hero-kicker' }, children: ['Current Heichel'] },
            { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
            { tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
        ] },
        { tag: 'div', attr: { class: 'hero-stats', 'aria-label': 'Collection areas' }, children: ['About', 'Heichelos', 'Series', 'Posts'].map(label => ({ tag: 'span', children: [label] })) }
    ] };
}

function contentPanel(actions) {
    return { tag: 'section', attr: { class: 'heichel-nav-panel', 'aria-label': 'Heichel browsing' }, children: [
        { tag: 'nav', attr: { id: 'breadcrumb-container', class: 'breadcrumb-river', 'aria-label': 'Series path' }, ref: 'breadcrumb' },
        { tag: 'div', attr: { id: 'seriesNameAndInfo', class: 'series-heading hidden' }, ref: 'seriesInfoArea', children: [
            { tag: 'p', attr: { class: 'series-label' }, children: ['Current Series'] }, { tag: 'h2', ref: 'seriesTitle' },
            { tag: 'p', ref: 'seriesDesc' }, { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
        ] },
        { tag: 'div', attr: { class: 'series-search-row' }, children: [
            { tag: 'input', attr: { type: 'search', placeholder: 'Search series and posts...', 'aria-label': 'Search series and posts' }, ref: 'searchInput', events: { input: actions.onSearch } },
            { tag: 'button', attr: { type: 'button', class: 'filter-chip', 'aria-pressed': 'false' }, ref: 'filterButton', children: ['Filter'], events: { click: actions.applyFilter } }
        ] },
        { tag: 'nav', attr: { class: 'tab-gates geelooy-tabs', 'aria-label': 'Browse content type' }, children: [{ tag: 'button', attr: { class: 'tab Active', type: 'button' }, ref: 'postsTab', children: ['Timeline'], events: { click: () => actions.switchView('posts') } }, { tag: 'button', attr: { class: 'tab', type: 'button' }, ref: 'seriesTab', children: ['Series'], events: { click: () => actions.switchView('series') } }] },
        { tag: 'div', attr: { class: 'grid-realms' }, children: [grid('posts', 'postsList', 'loadingPosts'), grid('series', 'seriesList', 'loadingSeries', true)] }
    ] };
}

function grid(type, listRef, loadRef, hidden = false) {
    return { tag: 'div', attr: { class: `viewport ${type} ${hidden ? 'hidden' : ''}` }, ref: `${type}Viewport`, children: [{ tag: 'div', attr: { class: 'dynamic-grid', 'aria-live': 'polite' }, ref: listRef }, { tag: 'div', attr: { class: 'sacred-loading hidden', 'aria-label': `Loading ${type}` }, ref: loadRef }] };
}

function drawer() {
    return { tag: 'aside', attr: { class: 'geelooy-mobile-drawer' }, children: ['Home', 'Heichelos', 'Series', 'Messages', 'Profile'].map(label => ({ tag: 'a', attr: { href: label === 'Home' ? '/' : `/${label.toLowerCase()}` }, children: [label] })) };
}

function bottomNav() {
    return { tag: 'nav', attr: { class: 'geelooy-bottom-nav', 'aria-label': 'Primary mobile navigation' }, children: [['Home', '/'], ['Tree', '#seriesNameAndInfo'], ['Create', '/heichelos/submit'], ['Inbox', '/email'], ['Profile', '/profile']].map(([label, href]) => ({ tag: 'a', attr: { href }, children: [label] })) };
}

function bulkBar() {
    return { tag: 'div', attr: { id: 'bulk-actions-bar', class: 'hidden-void' }, ref: 'bulkActionsBar', children: [{ tag: 'span', ref: 'selectionCount' }, { tag: 'button', attr: { class: 'ritual-btn danger', type: 'button' }, ref: 'bulkDeleteBtn', children: ['Delete'] }, { tag: 'button', attr: { class: 'ritual-btn', type: 'button' }, ref: 'exitSelectionBtn', children: ['Cancel'] }] };
}

function modal(actions) {
    return { tag: 'div', attr: { class: 'modal-gate-hidden', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true' }, ref: 'modalRoot', children: [
        { tag: 'div', attr: { class: 'gate-backdrop' }, ref: 'modalBackdrop', events: { click: actions.closeModal } },
        { tag: 'div', attr: { class: 'gate-chamber' }, children: [{ tag: 'h3', ref: 'modalTitle' }, { tag: 'form', ref: 'modalForm', events: { submit: actions.onModalSubmit }, children: [
            { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [option('post', 'Post'), option('question', 'Question'), option('answer', 'Answer'), option('series', 'Series')] },
            { tag: 'input', attr: { type: 'text', required: true, placeholder: 'Title' }, ref: 'modalTitleInput' }, { tag: 'textarea', attr: { placeholder: 'Description' }, ref: 'modalDescTextarea' }, { tag: 'input', attr: { type: 'text', placeholder: 'Custom ID' }, ref: 'modalIdInput' },
            { tag: 'div', attr: { class: 'gate-actions' }, children: [{ tag: 'button', attr: { type: 'button' }, ref: 'modalCancelBtn', children: ['Cancel'] }, { tag: 'button', attr: { type: 'submit' }, children: ['Save'] }] }
        ] }] }
    ] };
}

function option(value, label) { return { tag: 'option', attr: { value }, children: [label] }; }
