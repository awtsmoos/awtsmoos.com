// B"H
/**
 * @module AwtsmoosCivilizationLayout
 * @description
 * The Heichel shell becomes the first continent of the Awtsmoos OS: a command
 * galaxy, dock, living pulse, object context rail, hero, grids, drawer, and
 * modal all breathing through one blueprint instead of scattered markup.
 */
import { osKernel } from '../awtsmoos-os/kernel-blueprint.js';
import { heichelWorldPanel } from '../heichel-os/world-panel.js';

export function getFullLayoutBlueprint(actions) {
    return {
        tag: 'div', attr: { class: 'geelooy-social-shell heichel-mobile-navigation awtsmoos-os-shell' }, ref: 'pageContainer',
        children: [topbar(actions), drawer(), { tag: 'main', attr: { class: 'geelooy-main-stage' }, children: [osKernel(actions), hero(), heichelWorldPanel(actions), contentPanel(actions)] }, bottomNav(), toast(), bulkBar(), modal(actions)]
    };
}

function topbar(actions) {
    return { tag: 'header', attr: { class: 'heichel-mobile-topbar' }, children: [
        { tag: 'button', attr: { id: 'sidebar-toggle-btn', class: 'topbar-icon', type: 'button', 'aria-label': 'Open navigation', 'aria-expanded': 'false' }, ref: 'sidebarToggleBtn', children: ['☰'], events: { click: actions.toggleSidebar } },
        { tag: 'div', attr: { class: 'topbar-title' }, children: [{ tag: 'strong', children: ['Awtsmoos OS'] }, { tag: 'small', children: ['Heichel Civilization'] }] },
        { tag: 'button', attr: { class: 'topbar-icon', type: 'button', 'aria-label': 'Focus command' }, children: ['⌘'], events: { click: actions.focusCommand } }
    ] };
}

function hero() {
    return { tag: 'section', attr: { class: 'geelooy-heichel-hero' }, children: [
        { tag: 'div', attr: { class: 'heichel-hero-glow' } },
        { tag: 'div', attr: { class: 'heichel-hero-copy' }, children: [
            { tag: 'div', attr: { class: 'heichel-seal' }, children: ['⚜'] },
            { tag: 'p', attr: { class: 'hero-kicker' }, children: ['Current Heichel'] },
            { tag: 'h1', attr: { id: 'heichel-main-title' }, ref: 'mainTitle' },
            { tag: 'p', attr: { class: 'hero-description' }, ref: 'heichelDescription' }
        ] },
        { tag: 'div', attr: { class: 'hero-stats' }, children: ['Objects', 'Graph', 'Events', 'AwtsmoosDB'].map(label => ({ tag: 'span', children: [label] })) }
    ] };
}

function contentPanel(actions) {
    return { tag: 'section', attr: { class: 'heichel-nav-panel' }, children: [
        seriesInfo(), searchRow(actions), tabs(actions), { tag: 'div', attr: { class: 'grid-realms' }, children: [grid('posts', 'postsList', 'loadingPosts'), grid('series', 'seriesList', 'loadingSeries', true)] }
    ] };
}

function seriesInfo() {
    return { tag: 'div', attr: { id: 'seriesNameAndInfo', class: 'series-heading hidden' }, ref: 'seriesInfoArea', children: [
        { tag: 'p', attr: { class: 'series-label' }, children: ['Current Series'] }, { tag: 'h2', ref: 'seriesTitle' },
        { tag: 'p', ref: 'seriesDesc' }, { tag: 'div', attr: { id: 'seriesControls' }, ref: 'seriesControls' }
    ] };
}

function searchRow(actions) {
    return { tag: 'div', attr: { class: 'series-search-row' }, children: [
        { tag: 'input', attr: { type: 'search', placeholder: 'Search this heichel timeline...', 'aria-label': 'Search series and posts' }, ref: 'searchInput', events: { input: actions.onSearch } },
        { tag: 'button', attr: { type: 'button', class: 'filter-chip', 'aria-pressed': 'false' }, ref: 'filterButton', children: ['Filter'], events: { click: actions.applyFilter } }
    ] };
}

function tabs(actions) {
    return { tag: 'nav', attr: { class: 'tab-gates geelooy-tabs' }, children: [
        { tag: 'button', attr: { class: 'tab Active', type: 'button' }, ref: 'postsTab', children: ['Timeline'], events: { click: () => actions.switchView('posts') } },
        { tag: 'button', attr: { class: 'tab', type: 'button' }, ref: 'seriesTab', children: ['Series'], events: { click: () => actions.switchView('series') } }
    ] };
}

function grid(type, listRef, loadRef, hidden = false) {
    return { tag: 'div', attr: { class: `viewport ${type} ${hidden ? 'hidden' : ''}` }, ref: `${type}Viewport`, children: [
        { tag: 'div', attr: { class: 'dynamic-grid' }, ref: listRef }, { tag: 'div', attr: { class: 'sacred-loading hidden' }, ref: loadRef, children: ['Loading...'] }
    ] };
}

function drawer() {
    const links = [['Home', '/'], ['Universe', '#awtsmoos-os-command'], ['Heichelos', '/heichelos'], ['Objects', '/objects'], ['People', '/profiles'], ['Messages', '/email'], ['Civilization', '#awtsmoos-civilization'], ['Profile', '/profile']];
    return { tag: 'aside', attr: { class: 'geelooy-mobile-drawer' }, children: links.map(([label, href]) => ({ tag: 'a', attr: { href }, children: [label] })) };
}

function bottomNav() {
    return { tag: 'nav', attr: { class: 'geelooy-bottom-nav' }, children: [['Home', '/'], ['Command', '#awtsmoos-os-command'], ['Create', '/heichelos/submit'], ['Inbox', '/email'], ['Profile', '/profile']].map(([label, href]) => ({ tag: 'a', attr: { href }, children: [label] })) };
}

function toast() { return { tag: 'div', attr: { id: 'toast-container' }, ref: 'toastContainer' }; }

function bulkBar() {
    return { tag: 'div', attr: { id: 'bulk-actions-bar', class: 'hidden-void' }, ref: 'bulkActionsBar', children: [{ tag: 'span', ref: 'selectionCount' }, { tag: 'button', attr: { class: 'ritual-btn danger', type: 'button' }, ref: 'bulkDeleteBtn', children: ['Delete'] }, { tag: 'button', attr: { class: 'ritual-btn', type: 'button' }, ref: 'exitSelectionBtn', children: ['Cancel'] }] };
}

function modal(actions) {
    return { tag: 'div', attr: { class: 'modal-gate-hidden', role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true' }, ref: 'modalRoot', children: [
        { tag: 'div', attr: { class: 'gate-backdrop' }, ref: 'modalBackdrop', events: { click: actions.closeModal } },
        { tag: 'div', attr: { class: 'gate-chamber' }, children: [{ tag: 'h3', ref: 'modalTitle' }, form(actions)] }
    ] };
}

function form(actions) {
    return { tag: 'form', ref: 'modalForm', events: { submit: actions.onModalSubmit }, children: [
        { tag: 'select', attr: { class: 'heichel-content-type-select', 'aria-label': 'Content type' }, ref: 'modalContentTypeSelect', children: [option('post', 'Post'), option('question', 'Question'), option('answer', 'Answer'), option('series', 'Series')] },
        { tag: 'input', attr: { type: 'text', required: true, placeholder: 'Title' }, ref: 'modalTitleInput' },
        { tag: 'textarea', attr: { placeholder: 'Description' }, ref: 'modalDescTextarea' },
        { tag: 'input', attr: { type: 'text', placeholder: 'Custom ID' }, ref: 'modalIdInput' },
        { tag: 'div', attr: { class: 'gate-actions' }, children: [{ tag: 'button', attr: { type: 'button' }, ref: 'modalCancelBtn', children: ['Cancel'] }, { tag: 'button', attr: { type: 'submit' }, children: ['Save'] }] }
    ] };
}

function option(value, label) { return { tag: 'option', attr: { value }, children: [label] }; }
