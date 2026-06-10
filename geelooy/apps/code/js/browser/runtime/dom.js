// B"H
/**
 * @file dom.js
 * @description
 * Chapter 2: The Awtsmoos hid the forge behind a deliberate gate. The normal
 * browser view is now readable first; HTML and JS lightning open only when the
 * human asks for the custom preview chamber.
 */

import { HTML } from '../../../html-generator.js';

/** @param {object|string|HTMLElement} schema Data shape. @returns {HTMLElement|Text|null} DOM node. */
export function H(schema) {
    return HTML(schema);
}

/** @param {object} state Browser state. @returns {object} Data blueprint. */
export function browserBlueprint(state) {
    return {
        tag: 'div',
        className: `browser-runtime${state.consoleVisible ? ' has-console' : ''}${state.studioVisible ? ' has-studio' : ''}`,
        children: [toolbarBlueprint(state), studioBlueprint(state), frameBlueprint()]
    };
}

function toolbarBlueprint(state) {
    return { tag: 'div', className: 'browser-runtime-toolbar', children: [
        button('←', 'back'), button('↻', 'reload'), button('Home', 'home'),
        { tag: 'input', className: 'vos-app-input browser-runtime-address', value: state.currentUrl || 'about:blank' },
        button('Go', 'go'), button(state.studioVisible ? 'Hide Dev' : 'Dev', 'studio'),
        button('Console', 'console')
    ] };
}

function studioBlueprint(state) {
    return { tag: 'details', className: 'browser-runtime-studio', open: Boolean(state.studioVisible), children: [
        { tag: 'summary', text: 'Custom HTML / JS preview forge' },
        { className: 'browser-runtime-studio-grid', children: [
            { tag: 'textarea', className: 'browser-runtime-code', text: state.customHtml || starterHtml() },
            { tag: 'textarea', className: 'browser-runtime-js', text: state.customJs || "document.body.dataset.awtsmoos = 'revealed';" }
        ] },
        { className: 'browser-runtime-studio-actions', children: [button('Run HTML', 'run-html'), button('Run JS', 'run-js')] }
    ] };
}

function frameBlueprint() {
    return { tag: 'div', className: 'browser-runtime-frame-wrap', children: [
        { tag: 'iframe', className: 'browser-runtime-frame', attrs: { sandbox: 'allow-scripts allow-forms allow-same-origin allow-popups allow-modals' } },
        { tag: 'div', className: 'browser-runtime-console', children: [
            { tag: 'div', className: 'browser-runtime-console-head', text: 'Console' },
            { tag: 'div', className: 'browser-runtime-console-lines' }
        ] }
    ] };
}

function button(text, action) {
    return { tag: 'button', className: 'vos-app-button', text, dataset: { action }, attrs: { type: 'button' } };
}

function starterHtml() {
    return '<!doctype html><html><body><h1>B"H Virtual Preview</h1><p>The Awtsmoos reveals this custom HTML.</p></body></html>';
}
