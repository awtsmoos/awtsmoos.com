// B"H
import { InlineLogin } from './inline-login.js';

/**
 * B"H
 * The account panel is a small crown in the editor chrome.
 * It refuses to hide the human behind a foggy "Logged in" label when the
 * server has already revealed a usable username, user id, alias, name, or
 * email somewhere in the identity packet.
 */

const IDENTITY_NAME_KEYS = Object.freeze([
    'username',
    'userName',
    'displayName',
    'name',
    'email',
    'userId',
    'userid',
    'id',
    '_id',
    'sub'
]);

const NESTED_IDENTITY_KEYS = Object.freeze([
    'identity',
    'user',
    'profile',
    'account',
    'session'
]);

function clean(value) {
    const text = String(value ?? '').trim();
    if (!text || text === '[object Object]' || text.toLowerCase() === 'logged in') return '';
    return text;
}

function findName(identity, seen = new Set()) {
    if (!identity || typeof identity !== 'object' || seen.has(identity)) return '';
    seen.add(identity);

    for (const key of IDENTITY_NAME_KEYS) {
        const got = clean(identity[key]);
        if (got) return key === 'email' ? got : got.replace(/^@+/, '');
    }

    for (const key of NESTED_IDENTITY_KEYS) {
        const got = findName(identity[key], seen);
        if (got) return got;
    }

    return '';
}

function displayName(identity) {
    const found = findName(identity);
    return found ? `@${found.replace(/^@+/, '')}` : 'unknown user';
}

function renderShell({ statusClass, label, actions }) {
    return `
        <div class="awtsmoos-account-pill ${statusClass}">
            <span class="awtsmoos-account-name" title="Awtsmoos Account">${label}</span>
            ${actions}
        </div>
    `;
}

export const AwtsmoosAccountPanel = {
    el: null,

    init() {
        this.el = document.getElementById('awtsmoos-account-panel');
        if (!this.el) return;

        this.el.onclick = e => {
            const btn = e.target.closest('[data-awtsmoos-account-action]');
            const action = btn?.dataset.awtsmoosAccountAction;
            if (action === 'login') this.login();
            if (action === 'refresh') {
                this.render();
                window.dispatchEvent(new CustomEvent('awtsmoos-login-changed'));
            }
            if (action === 'logout') this.logout();
        };

        window.addEventListener('focus', () => this.render());
        window.addEventListener('awtsmoos-login-changed', () => this.render());
        this.render();
    },

    async login() {
        const res = await InlineLogin.ensure();
        window.dispatchEvent(new CustomEvent('awtsmoos-login-changed', { detail: res.identity }));
        this.render();
    },

    logout() {
        const next = encodeURIComponent(location.pathname + location.search + location.hash);
        location.href = '/logout?next=' + next;
    },

    async render() {
        if (!this.el) return;
        this.el.innerHTML = renderShell({
            statusClass: 'is-loading',
            label: 'Awtsmoos checking…',
            actions: ''
        });

        const res = await InlineLogin.current();
        if (res.ok) {
            const label = `✓ ${displayName(res.identity)}`;
            this.el.innerHTML = renderShell({
                statusClass: 'is-online',
                label,
                actions: `
                    <button class="secondary-btn" data-awtsmoos-account-action="refresh">Refresh</button>
                    <button class="secondary-btn" data-awtsmoos-account-action="logout">Log out</button>
                `
            });
            return;
        }

        this.el.innerHTML = renderShell({
            statusClass: 'is-offline',
            label: 'Awtsmoos offline',
            actions: `
                <button class="primary-btn" data-awtsmoos-account-action="login">Log in</button>
                <button class="secondary-btn" data-awtsmoos-account-action="refresh">Check</button>
            `
        });
    }
};
