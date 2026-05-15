// B"H

import { State } from '../state.js';
import { UI } from '../ui.js';
import { Workspaces } from '../workspaces/index.js';
import { FileSystemProvider } from '../fs-provider.js';
import { App } from '../app.js';

function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[ch]);
}

function profileOptions() {
    const profiles = State.sshProfiles || [];
    if (!profiles.length) return '<option value="">New SSH profile</option>';
    return [
        '<option value="">New SSH profile</option>',
        ...profiles.map(profile => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name || profile.host)}</option>`)
    ].join('');
}

function buildDialogHtml() {
    return `
        <div class="ssh-workspace-form">
            <label>Saved SSH Profile</label>
            <select id="ssh-profile-select">${profileOptions()}</select>
            <label>Workspace Name</label>
            <input id="ssh-name-input" placeholder="Production server">
            <label>Host</label>
            <input id="ssh-host-input" placeholder="awtsmoos.com">
            <label>Port</label>
            <input id="ssh-port-input" type="number" min="1" max="65535" value="22">
            <label>Username</label>
            <input id="ssh-user-input" placeholder="root">
            <label>Initial Path</label>
            <input id="ssh-path-input" value="/" placeholder="/var/www">
            <label>Authentication</label>
            <select id="ssh-auth-method">
                <option value="password">Password</option>
                <option value="privateKey">Private Key</option>
            </select>
            <div id="ssh-password-row">
                <label>Password</label>
                <input id="ssh-password-input" type="password" autocomplete="new-password">
            </div>
            <div id="ssh-key-row" style="display:none;">
                <label>Private Key</label>
                <textarea id="ssh-key-input" rows="8" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"></textarea>
                <label>Passphrase</label>
                <input id="ssh-passphrase-input" type="password" autocomplete="new-password">
            </div>
            <label style="display:flex; align-items:center; gap:8px; margin-top:10px;">
                <input id="ssh-save-profile" type="checkbox" checked>
                <span>Save this SSH profile in App Settings</span>
            </label>
        </div>
        <style>
            .ssh-workspace-form { display:grid; gap:8px; text-align:left; }
            .ssh-workspace-form label { font-size:0.82em; font-weight:700; color:var(--neon-cyan); }
            .ssh-workspace-form input,
            .ssh-workspace-form select,
            .ssh-workspace-form textarea {
                width:100%;
                background:#050505;
                color:#fff;
                border:1px solid var(--color-border);
                border-radius:6px;
                padding:8px;
                font-family:var(--font-code);
            }
        </style>`;
}

function collect(dialog) {
    const get = id => dialog.querySelector(id);
    const authMethod = get('#ssh-auth-method').value;
    const profileId = get('#ssh-profile-select').value || null;
    const host = get('#ssh-host-input').value.trim();
    const user = get('#ssh-user-input').value.trim();
    const name = get('#ssh-name-input').value.trim() || `${user}@${host}`;
    const initialPath = get('#ssh-path-input').value.trim() || '/';
    const port = Number(get('#ssh-port-input').value || 22);

    if (!host) throw new Error('SSH host is required.');
    if (!user) throw new Error('SSH username is required.');

    const sshInfo = {
        profileId,
        name,
        host,
        user,
        port,
        initialPath,
        authMethod
    };

    if (authMethod === 'password') {
        const password = get('#ssh-password-input').value;
        if (!password) throw new Error('SSH password is required.');
        sshInfo.password = btoa(password);
    } else {
        const privateKey = get('#ssh-key-input').value.trim();
        if (!privateKey) throw new Error('SSH private key is required.');
        sshInfo.privateKey = privateKey;
        sshInfo.passphrase = get('#ssh-passphrase-input').value || '';
    }

    return {
        sshInfo,
        shouldSaveProfile: get('#ssh-save-profile').checked
    };
}

function upsertProfile(sshInfo) {
    const profiles = Array.isArray(State.sshProfiles) ? [...State.sshProfiles] : [];
    const id = sshInfo.profileId || `ssh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const safeProfile = { ...sshInfo, id, profileId: id };
    const index = profiles.findIndex(profile => profile.id === id);
    if (index >= 0) profiles[index] = safeProfile;
    else profiles.push(safeProfile);
    State.sshProfiles = profiles;
    return safeProfile;
}

export const SSHWorkspace = {
    async add() {
        const dialogPromise = UI.showDialog({
            title: 'Add SSH Workspace',
            contentHTML: buildDialogHtml(),
            okText: 'Connect',
            cancelText: 'Cancel'
        });
        this.bindDialogEvents(document.getElementById('generic-dialog'));
        const accepted = await dialogPromise;
        if (!accepted) return;

        const dialog = document.getElementById('generic-dialog');
        try {
            let { sshInfo, shouldSaveProfile } = collect(dialog);
            if (shouldSaveProfile) {
                sshInfo = upsertProfile(sshInfo);
                App.saveSettings();
            }

            await FileSystemProvider.SSH.testConnection(sshInfo);
            Workspaces.add({
                name: `SSH: ${sshInfo.name}`,
                type: 'ssh',
                path: '/',
                sshInfo
            }, true);
            UI.showToast('B"H - SSH workspace connected.', 'success');
        } catch (error) {
            UI.showToast(error.message, 'error', 9000);
        }
    },

    bindDialogEvents(root = document) {
        const profileSelect = root.querySelector('#ssh-profile-select');
        const auth = root.querySelector('#ssh-auth-method');
        const passwordRow = root.querySelector('#ssh-password-row');
        const keyRow = root.querySelector('#ssh-key-row');
        const profiles = State.sshProfiles || [];

        const syncAuth = () => {
            const isKey = auth.value === 'privateKey';
            passwordRow.style.display = isKey ? 'none' : '';
            keyRow.style.display = isKey ? '' : 'none';
        };

        auth.onchange = syncAuth;
        profileSelect.onchange = () => {
            const profile = profiles.find(p => p.id === profileSelect.value);
            if (!profile) return;
            root.querySelector('#ssh-name-input').value = profile.name || '';
            root.querySelector('#ssh-host-input').value = profile.host || '';
            root.querySelector('#ssh-port-input').value = profile.port || 22;
            root.querySelector('#ssh-user-input').value = profile.user || '';
            root.querySelector('#ssh-path-input').value = profile.initialPath || '/';
            auth.value = profile.authMethod || 'password';
            root.querySelector('#ssh-password-input').value = profile.password ? atob(profile.password) : '';
            root.querySelector('#ssh-key-input').value = profile.privateKey || '';
            root.querySelector('#ssh-passphrase-input').value = profile.passphrase || '';
            syncAuth();
        };
        syncAuth();
    }
};
