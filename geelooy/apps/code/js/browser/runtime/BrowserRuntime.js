
// B"H
/**
 * @file BrowserRuntime.js
 * @description
 * Shared browser runtime for normal tabs and Virtual OS windows.
 */

import { HTML } from '../../../html-generator.js';
import { PreviewManager } from '../../editor/preview-manager.js';
import { App } from '../../app.js';
import { SimulatedServerRegistry } from '../../virtual-os/simulated/SimulatedServerRegistry.js';

/**
 * @function H
 * @param {object|string|HTMLElement} schema Schema.
 * @returns {HTMLElement|Text|null} Node.
 */
function H(schema) {
    return HTML(schema);
}

/**
 * @function normalizeAddress
 * @param {string} address Address.
 * @returns {string} Normalized address.
 */
function normalizeAddress(address) {
    const text = String(address || '').trim();
    if (!text) return 'about:blank';
    if (text === 'localhost') return 'http://localhost:3000/';
    if (text.startsWith('localhost:')) return `http://${text}`;
    if (text.startsWith('sim:')) return text.replace('sim:', 'http://simulated.localhost:');
    if (/^[a-z]+:\/\//i.test(text)) return text;
    return 'http://' + text;
}

/**
 * @function resolveRoute
 * @param {string} address Address.
 * @returns {object} Route.
 */
function resolveRoute(address) {
    const url = normalizeAddress(address);
    const simulated = SimulatedServerRegistry.resolve(url);

    if (simulated) {
        return {
            type: 'srcdoc',
            url,
            html: simulated.html
        };
    }

    if (url === 'about:blank') {
        return {
            type: 'srcdoc',
            url,
            html: '<!doctype html><html><body></body></html>'
        };
    }

    return {
        type: 'url',
        url
    };
}

/**
 * @function browserBlueprint
 * @param {object} state Browser state.
 * @returns {object} Blueprint.
 */
function browserBlueprint(state) {
    return {
        tag: 'div',
        className: `browser-runtime${state.consoleVisible ? ' has-console' : ''}`,
        children: [
            {
                tag: 'div',
                className: 'browser-runtime-toolbar',
                children: [
                    { tag: 'button', className: 'vos-app-button', text: '←', dataset: { action: 'back' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: '↻', dataset: { action: 'reload' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'Home', dataset: { action: 'home' }, attrs: { type: 'button' } },
                    { tag: 'input', className: 'vos-app-input browser-runtime-address', value: state.currentUrl || 'about:blank' },
                    { tag: 'button', className: 'vos-app-button', text: 'Go', dataset: { action: 'go' }, attrs: { type: 'button' } },
                    { tag: 'button', className: 'vos-app-button', text: 'Console', dataset: { action: 'console' }, attrs: { type: 'button' } }
                ]
            },
            {
                tag: 'div',
                className: 'browser-runtime-frame-wrap',
                children: [
                    { tag: 'iframe', className: 'browser-runtime-frame', attrs: { sandbox: 'allow-scripts allow-forms allow-same-origin allow-popups allow-modals' } },
                    {
                        tag: 'div',
                        className: 'browser-runtime-console',
                        children: [
                            { tag: 'div', className: 'browser-runtime-console-head', text: 'Console' },
                            { tag: 'div', className: 'browser-runtime-console-lines' }
                        ]
                    }
                ]
            }
        ]
    };
}

/**
 * @function appendConsole
 * @param {HTMLElement} lines Lines element.
 * @param {string} type Type.
 * @param {string} text Text.
 * @returns {void}
 */
function appendConsole(lines, type, text) {
    lines.appendChild(H({
        tag: 'div',
        className: `browser-runtime-console-line ${type || 'log'}`,
        text: `[${type || 'log'}] ${text}`
    }));

    lines.scrollTop = lines.scrollHeight;
}

export class BrowserRuntime {
    constructor(host) {
        this.host = host;
        this.container = host.container;
        this.state = host.state;
        this.id = host.id;
    }

    mount() {
        this.state.currentUrl = this.state.currentUrl || this.state.url || 'about:blank';
        this.state.history = Array.isArray(this.state.history) ? this.state.history : [];
        this.state.consoleVisible = Boolean(this.state.consoleVisible);

        const root = H(browserBlueprint(this.state));
        this.container.replaceChildren(root);

        this.root = root;
        this.address = root.querySelector('.browser-runtime-address');
        this.frame = root.querySelector('.browser-runtime-frame');
        this.lines = root.querySelector('.browser-runtime-console-lines');

        PreviewManager.registerIframe(this.id, this.frame);

        root.querySelector('[data-action="go"]').onclick = () => this.navigate(this.address.value);
        root.querySelector('[data-action="reload"]').onclick = () => this.navigate(this.state.currentUrl, false);
        root.querySelector('[data-action="home"]').onclick = () => this.navigate('about:blank');
        root.querySelector('[data-action="console"]').onclick = () => this.toggleConsole();
        root.querySelector('[data-action="back"]').onclick = () => this.back();

        this.address.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') this.navigate(this.address.value);
        });

        this.frame.addEventListener('load', () => {
            appendConsole(this.lines, 'info', 'Frame loaded.');
        });

        this.loadCurrent();
    }

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

    navigate(nextUrl, addHistory = true) {
        const route = resolveRoute(nextUrl);

        if (addHistory && this.state.currentUrl && this.state.currentUrl !== route.url) {
            this.state.history.push(this.state.currentUrl);
        }

        this.state.currentUrl = route.url;
        this.loadCurrent();
        this.save();
    }

    back() {
        const previous = this.state.history.pop();
        if (!previous) return;
        this.state.currentUrl = previous;
        this.loadCurrent();
        this.save();
    }

    toggleConsole() {
        this.state.consoleVisible = !this.state.consoleVisible;
        this.root.classList.toggle('has-console', this.state.consoleVisible);
        this.save();
    }

    save() {
        if (this.host.save) this.host.save();
        else App.saveSessionDebounced();
    }
}
