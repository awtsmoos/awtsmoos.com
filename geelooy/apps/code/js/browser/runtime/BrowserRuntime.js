// B"H
/**
 * @file BrowserRuntime.js
 * @description
 * Chapter 15: The Awtsmoos made one browser vessel with three revelations:
 * URL rivers, custom HTML earth, and JavaScript lightning. The old iframe did
 * not die; it became a fuller virtual preview chamber.
 */

import { PreviewManager } from '../../editor/preview-manager.js';
import { App } from '../../app.js';
import { browserBlueprint, H } from './dom.js';
import { resolveRoute } from './address.js';
import { appendConsole } from './console.js';
import { rememberCustomCode, runCustomHtml, runCustomJs } from './customRunner.js';

export class BrowserRuntime {
    /** @param {object} host Runtime host with id, container, state, and save callback. */
    constructor(host) {
        this.host = host;
        this.container = host.container;
        this.state = host.state;
        this.id = host.id;
    }

    /** @returns {void} Mounts the browser UI and loads its current route. */
    mount() {
        this.prepareState();
        const root = H(browserBlueprint(this.state));
        this.container.replaceChildren(root);
        this.bindNodes(root);
        this.bindEvents(root);
        PreviewManager.registerIframe(this.id, this.frame);
        this.loadCurrent();
    }

    /** @returns {void} Ensures state fields exist. */
    prepareState() {
        this.state.currentUrl = this.state.currentUrl || this.state.url || 'about:blank';
        this.state.history = Array.isArray(this.state.history) ? this.state.history : [];
        this.state.consoleVisible = Boolean(this.state.consoleVisible);
    }

    /** @param {HTMLElement} root Root node. @returns {void} Captures useful elements. */
    bindNodes(root) {
        this.root = root;
        this.address = root.querySelector('.browser-runtime-address');
        this.frame = root.querySelector('.browser-runtime-frame');
        this.lines = root.querySelector('.browser-runtime-console-lines');
        this.htmlBox = root.querySelector('.browser-runtime-code');
        this.jsBox = root.querySelector('.browser-runtime-js');
    }

    /** @param {HTMLElement} root Root node. @returns {void} Attaches event handlers. */
    bindEvents(root) {
        root.querySelector('[data-action="go"]').onclick = () => this.navigate(this.address.value);
        root.querySelector('[data-action="reload"]').onclick = () => this.navigate(this.state.currentUrl, false);
        root.querySelector('[data-action="home"]').onclick = () => this.navigate('about:blank');
        root.querySelector('[data-action="console"]').onclick = () => this.toggleConsole();
        root.querySelector('[data-action="back"]').onclick = () => this.back();
        root.querySelector('[data-action="run-html"]').onclick = () => this.runHtml();
        root.querySelector('[data-action="run-js"]').onclick = () => this.runJs();
        this.address.addEventListener('keydown', e => { if (e.key === 'Enter') this.navigate(this.address.value); });
        this.frame.addEventListener('load', () => appendConsole(this.lines, 'info', 'Frame loaded.'));
    }

    /** @returns {void} Loads current URL or srcdoc route. */
    loadCurrent() {
        const route = resolveRoute(this.state.currentUrl);
        this.address.value = route.url;
        this.state.currentUrl = route.url;
        if (route.type === 'url') {
            this.frame.removeAttribute('srcdoc');
            this.frame.src = route.url;
        } else {
            this.frame.removeAttribute('src');
            this.frame.srcdoc = route.html;
        }
        appendConsole(this.lines, 'nav', route.url);
    }

    /** @returns {void} Runs custom HTML in the iframe. */
    runHtml() {
        rememberCustomCode(this.state, this.htmlBox, this.jsBox);
        runCustomHtml(this.frame, this.state.customHtml);
        appendConsole(this.lines, 'html', 'Custom HTML rendered.');
        this.save();
    }

    /** @returns {void} Runs custom JavaScript inside the iframe window. */
    runJs() {
        rememberCustomCode(this.state, this.htmlBox, this.jsBox);
        runCustomJs(this.frame, this.lines, this.state.customJs);
        this.save();
    }

    /** @param {string} nextUrl New URL. @param {boolean} addHistory History flag. @returns {void} */
    navigate(nextUrl, addHistory = true) {
        const route = resolveRoute(nextUrl);
        if (addHistory && this.state.currentUrl && this.state.currentUrl !== route.url) this.state.history.push(this.state.currentUrl);
        this.state.currentUrl = route.url;
        this.loadCurrent();
        this.save();
    }

    /** @returns {void} Navigates back. */
    back() {
        const previous = this.state.history.pop();
        if (!previous) return;
        this.state.currentUrl = previous;
        this.loadCurrent();
        this.save();
    }

    /** @returns {void} Toggles console panel. */
    toggleConsole() {
        this.state.consoleVisible = !this.state.consoleVisible;
        this.root.classList.toggle('has-console', this.state.consoleVisible);
        this.save();
    }

    /** @returns {void} Persists session state. */
    save() {
        if (this.host.save) this.host.save();
        else App.saveSessionDebounced();
    }
}
