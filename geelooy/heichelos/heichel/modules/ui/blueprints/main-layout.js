// B"H
/**
 * @module MobileHeichelNavigationLayout
 * @description
 * Chapter 606: the Heichel becomes an OS district. The main layout now carries
 * both the browse panel and the world panel so timeline, graph, people, assets,
 * moderation, and storage can live beside the simple mobile flow.
 * @contracts Exports `getFullLayoutBlueprint(actions)` and preserves refs used
 * by navigation, modal, bulk actions, mini-mail, and OS district modules.
 */
export function getFullLayoutBlueprint(actions) {
  return box('geelooy-social-shell heichel-mobile-navigation', [
    topbar(actions), drawer(), stage(actions), bottomNav(actions), miniMail(actions),
    { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' },
    bulkBar(), modal(actions)
  ], { ref: 'pageContainer' });
}

function stage(actions) {
  return { tag: 'main', attr: { class: 'geelooy-main-stage' }, children: [hero(), contentPanel(actions), heichelWorldPanel(actions)] };
}
function topbar(actions) {
  return { tag: 'header', attr: { class: 'heichel-mobile-topbar' }, children: [
    button('☰', 'Open navigation', actions.toggleSidebar, { id: 'sidebar-toggle-btn', class: 'topbar-icon', 'aria-expanded': 'false' }, 'sidebarToggleBtn'),
    box('topbar-title', [{ tag: 'strong', ref: 'topbarHeichelTitle', children: ['Heichel'] }, { tag: 'small', ref: 'topbarHeichelContext', children: ['Collection navigation'] }]),
    { tag: 'details', attr: { class: 'topbar-notification-menu' }, children: [{ tag: 'summary', attr: { class: 'topbar-icon', 'aria-label': 'Open menu' }, children: ['⋯'] }, box('topbar-menu-panel', [link('/', 'Home'), link('/heichelos', 'Heichelos'), link('/profile', 'Profile')])] }
  ] };
}
function hero() {
  return { tag: 'section', attr: { class: 'geelooy-heichel-hero', 'aria-labelledby': 'heichel-main-title' }, children: [
    { tag: 'div', attr: { class: 'heichel-hero-glow', 'aria-hidden': 'true' } },
    box('heichel-hero-copy', [{ tag: 'div', attr: { class: 'heichel-seal', 'aria-hidden': 'true' }, children: ['⚜'] }, { tag: 'p', attr: { class: 'hero-kicker' }, children: ['Current Heichel'] }, { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' }, { tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }]),
    box('hero-stats', ['About', 'Heichelos', 'Series', 'Posts'].map(label => ({ tag: 'span', children: [label] })), { attr: { 'aria-label': 'Collection areas' } })
  ] };
}
function contentPanel(actions) {
  return { tag: 'section', attr: { class: 'heichel-nav-panel', 'aria-label': 'Heichel browsing' }, ref: 'browsePanel', children: [
    { tag: 'nav', attr: { id: 'breadcrumb-container', class: 'breadcrumb-river', 'aria-label': 'Series path' }, ref: 'breadcrumb' },
    box('series-heading hidden', [{ tag: 'p', attr: { class: 'series-label' }, children: ['Current Series'] }, { tag: 'h2', ref: 'seriesTitle' }, { tag: 'p', ref: 'seriesDesc' }, { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }], { attr: { id: 'seriesNameAndInfo' }, ref: 'seriesInfoArea' }),
    box('series-search-row', [search(actions.onSearch), button('Filter', null, actions.applyFilter, { class: 'filter-chip', 'aria-pressed': 'false' }, 'filterButton')]),
    { tag: 'nav', attr: { class: 'tab-gates geelooy-tabs', 'aria-label': 'Browse content type' }, children: [tab('Timeline', 'posts', actions, true), tab('Tree', 'series', actions)] },
    box('grid-realms', [grid('posts', 'postsList', 'loadingPosts'), grid('series', 'seriesList', 'loadingSeries', true)])
  ] };
}
function heichelWorldPanel(actions) {
  return { tag: 'section', attr: { class: 'heichel-os-world-panel', 'aria-label': 'Heichel OS district' }, ref: 'heichelWorldPanel', children: [
    box('heichel-os-district-buttons', ['Overview', 'Timeline', 'Knowledge', 'People', 'Assets', 'Events', 'Moderation', 'Graph', 'Storage'].map(name => button(name, null, () => actions.activateDistrict?.(name)))),
    box('heichel-os-status-grid', [], { ref: 'heichelWorldStatusGrid' }),
    box('heichel-os-district-viewport', [], { ref: 'heichelWorldViewport' })
  ] };
}
function modal(actions) {
  return { tag: 'div', attr: { id: 'creation-modal', class: 'modal-gate-hidden', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true' }, ref: 'modalRoot', children: [
    { tag: 'div', attr: { class: 'gate-backdrop modal-backdrop' }, ref: 'modalBackdrop', events: { click: actions.closeModal } },
    box('modal-content', [{ tag: 'h3', attr: { id: 'modal-title' }, ref: 'modalTitle' }, form(actions)])
  ] };
}
function form(actions) { return { tag: 'form', attr: { id: 'creation-form' }, ref: 'modalForm', events: { submit: actions.onModalSubmit }, children: [contentTypeSelect(), input('modal-input-title', 'Title', 'modalTitleInput', true), { tag: 'textarea', attr: { id: 'modal-input-description', placeholder: 'Description' }, ref: 'modalDescTextarea' }, input('modal-input-id', 'Custom ID (Optional)', 'modalIdInput'), modalActions(actions.closeModal)] }; }
function contentTypeSelect() { return { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [option('post', 'Regular Post'), option('question', 'Question'), option('answer', 'Answer')] }; }
function drawer() { return { tag: 'aside', attr: { class: 'geelooy-mobile-drawer' }, children: ['Home', 'Heichelos', 'Series', 'Messages', 'Profile'].map(label => link(label === 'Home' ? '/' : `/${label.toLowerCase()}`, label)) }; }
function bottomNav(actions) { return { tag: 'nav', attr: { class: 'geelooy-bottom-nav', 'aria-label': 'Primary mobile navigation' }, children: [link('/', 'Home'), navButton('Tree', actions.openTree), link('/heichelos/submit', 'Create'), navButton('Inbox', actions.openMiniMail), link('/profile', 'Profile')] }; }
function miniMail(actions) { return { tag: 'aside', attr: { class: 'mini-mail-panel hidden', 'aria-label': 'Mini mail' }, ref: 'miniMailPanel', children: [{ tag: 'header', children: [{ tag: 'strong', children: ['Mini Mail'] }, button('×', 'Close mini mail', actions.closeMiniMail)] }, { tag: 'iframe', attr: { title: 'Awtsmoos Mail', src: '/email?embedded=1' } }, { tag: 'a', attr: { href: '/email', target: '_blank', rel: 'noopener' }, children: ['Open full mail'] }] }; }
function bulkBar() { return box('hidden-void', [{ tag: 'span', ref: 'selectionCount' }, { tag: 'button', attr: { class: 'ritual-btn danger', type: 'button' }, ref: 'bulkDeleteBtn', children: ['Delete'] }, { tag: 'button', attr: { class: 'ritual-btn', type: 'button' }, ref: 'exitSelectionBtn', children: ['Cancel'] }], { attr: { id: 'bulk-actions-bar' }, ref: 'bulkActionsBar' }); }
function tab(label, view, actions, active = false) { return button(label, null, () => actions.switchView(view), { class: `tab ${active ? 'Active' : ''}` }, view === 'posts' ? 'postsTab' : 'seriesTab'); }
function grid(type, listRef, loadRef, hidden = false) { return box(`viewport ${type} ${hidden ? 'hidden' : ''}`, [{ tag: 'div', attr: { class: 'dynamic-grid', 'aria-live': 'polite' }, ref: listRef }, { tag: 'div', attr: { class: 'sacred-loading hidden', 'aria-label': `Loading ${type}` }, ref: loadRef }], { ref: `${type}Viewport` }); }
function modalActions(close) { return box('modal-actions', [button('Cancel', null, close, { id: 'modal-cancel-btn' }, 'modalCancelBtn'), { tag: 'button', attr: { type: 'submit', id: 'modal-submit-btn' }, children: ['Manifest'] }]); }
function navButton(label, click) { return button(label, null, click); }
function button(label, ariaLabel, click, attr = {}, ref) { return { tag: 'button', attr: { type: 'button', ...(ariaLabel ? { 'aria-label': ariaLabel } : {}), ...attr }, ...(ref ? { ref } : {}), children: [label], events: { click } }; }
function input(id, placeholder, ref, required = false) { return { tag: 'input', attr: { type: 'text', id, required, placeholder }, ref }; }
function option(value, label) { return { tag: 'option', attr: { value }, children: [label] }; }
function search(onInput) { return { tag: 'input', attr: { type: 'search', placeholder: 'Search series and posts...', 'aria-label': 'Search series and posts' }, ref: 'searchInput', events: { input: onInput } }; }
function link(href, label) { return { tag: 'a', attr: { href }, children: [label] }; }
function box(className, children, extra = {}) { return { tag: 'div', attr: { class: className, ...(extra.attr || {}) }, ...(extra.ref ? { ref: extra.ref } : {}), children }; }
