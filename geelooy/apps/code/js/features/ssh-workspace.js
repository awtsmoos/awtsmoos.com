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

function decodePassword(profile = {}) {
    if (!profile.password) return '';
    try { return atob(profile.password); }
    catch { return profile.password || ''; }
}

function normalizeInitial(initial = {}) {
    return {
        profileId: initial.profileId || initial.id || null,
        name: String(initial.name || '').replace(/^SSH:\s*/i, ''),
        host: initial.host || '',
        user: initial.user || '',
        port: initial.port || 22,
        initialPath: initial.initialPath || '/',
        authMethod: initial.authMethod || (initial.privateKey || initial.pem ? 'privateKey' : 'password'),
        password: initial.password || '',
        privateKey: initial.privateKey || initial.pem || '',
        passphrase: initial.passphrase || ''
    };
}

function profileOptions(selectedId = '') {
    const profiles = State.sshProfiles || [];
    const options = ['<option value="">New SSH profile</option>'];
    for (const profile of profiles) {
        const selected = String(profile.id || '') === String(selectedId || '') ? ' selected' : '';
        options.push(`<option value="${escapeHtml(profile.id)}"${selected}>${escapeHtml(profile.name || profile.host)}</option>`);
    }
    return options.join('');
}

function buildDialogHtml(initial = {}, mode = 'add', errorMessage = '') {
    const seed = normalizeInitial(initial);
    const recovery = mode === 'recover'
        ? `<div class="ssh-recovery-box">
                <strong>SSH credentials need attention.</strong>
                <ol>
                    <li>Confirm host, port, username, and path.</li>
                    <li>Paste the password or private key again.</li>
                    <li>Keep “Save this SSH profile” checked so it reconnects later.</li>
                </ol>
                ${errorMessage ? `<div class="ssh-recovery-error">${escapeHtml(errorMessage)}</div>` : ''}
           </div>`
        : '';

    return `
        <div class="ssh-workspace-form">
            ${recovery}
            <label>Saved SSH Profile</label>
            <select id="ssh-profile-select">${profileOptions(seed.profileId)}</select>
            <label>Workspace Name</label>
            <input id="ssh-name-input" placeholder="Production server" value="${escapeHtml(seed.name)}">
            <label>Host</label>
            <input id="ssh-host-input" placeholder="awtsmoos.com" value="${escapeHtml(seed.host)}">
            <label>Port</label>
            <input id="ssh-port-input" type="number" min="1" max="65535" value="${escapeHtml(seed.port)}">
            <label>Username</label>
            <input id="ssh-user-input" placeholder="root" value="${escapeHtml(seed.user)}">
            <label>Initial Path</label>
            <input id="ssh-path-input" value="${escapeHtml(seed.initialPath)}" placeholder="/var/www">
            <label>Authentication</label>
            <select id="ssh-auth-method">
                <option value="password"${seed.authMethod === 'password' ? ' selected' : ''}>Password</option>
                <option value="privateKey"${seed.authMethod !== 'password' ? ' selected' : ''}>Private Key</option>
            </select>
            <div id="ssh-password-row">
                <label>Password</label>
                <input id="ssh-password-input" type="password" autocomplete="new-password" value="${escapeHtml(decodePassword(seed))}">
            </div>
            <div id="ssh-key-row" style="display:none;">
                <label>Private Key</label>
                <textarea id="ssh-key-input" rows="8" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----">${escapeHtml(seed.privateKey)}</textarea>
                <label>Passphrase</label>
                <input id="ssh-passphrase-input" type="password" autocomplete="new-password" value="${escapeHtml(seed.passphrase)}">
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
            .ssh-recovery-box {
                border:1px solid var(--neon-lime);
                background:rgba(168,255,0,.08);
                color:var(--color-text-primary,#fff);
                border-radius:10px;
                padding:10px 12px;
                line-height:1.45;
            }
            .ssh-recovery-box strong { color:var(--neon-lime); }
            .ssh-recovery-box ol { margin:6px 0 0 18px; padding:0; }
            .ssh-recovery-error {
                margin-top:8px;
                color:var(--color-accent-danger,#ff5570);
                overflow-wrap:anywhere;
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

async function promptForSshInfo({ initial = {}, mode = 'add', errorMessage = '' } = {}) {
    const dialogPromise = UI.showDialog({
        title: mode === 'recover' ? 'Recover SSH Workspace' : 'Add SSH Workspace',
        contentHTML: buildDialogHtml(initial, mode, errorMessage),
        okText: mode === 'recover' ? 'Save & Reconnect' : 'Connect',
        cancelText: 'Cancel'
    });

    SSHWorkspace.bindDialogEvents(document.getElementById('generic-dialog'));
    const accepted = await dialogPromise;
    if (!accepted) return null;

    return collect(document.getElementById('generic-dialog'));
}

export const SSHWorkspace = {
    async add() {
        try {
            const collected = await promptForSshInfo();
            if (!collected) return;

            let { sshInfo, shouldSaveProfile } = collected;
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

    async recoverWorkspace(workspace, error = null) {
        if (!workspace) return;

        try {
            const collected = await promptForSshInfo({
                initial: {
                    ...(workspace.sshInfo || {}),
                    name: workspace.sshInfo?.name || workspace.name || ''
                },
                mode: 'recover',
                errorMessage: error?.message || ''
            });
            if (!collected) return;

            let { sshInfo, shouldSaveProfile } = collected;
            if (shouldSaveProfile) {
                sshInfo = upsertProfile(sshInfo);
                App.saveSettings();
            }

            await FileSystemProvider.SSH.testConnection(sshInfo);
            workspace.sshInfo = sshInfo;
            workspace.name = `SSH: ${sshInfo.name}`;
            App.saveSession();
            Workspaces.render();
            UI.showToast('B"H - SSH credentials saved and workspace reconnected.', 'success');
        } catch (e) {
            UI.showToast(e.message, 'error', 9000);
        }
    },

    bindDialogEvents(root = document) {
        const profileSelect = root.querySelector('#ssh-profile-select');
        const auth = root.querySelector('#ssh-auth-method');
        const passwordRow = root.querySelector('#ssh-password-row');
        const keyRow = root.querySelector('#ssh-key-row');
        const profiles = State.sshProfiles || [];
        if (!profileSelect || !auth || !passwordRow || !keyRow) return;

        const syncAuth = () => {
            const isKey = auth.value === 'privateKey';
            passwordRow.style.display = isKey ? 'none' : '';
            keyRow.style.display = isKey ? '' : 'none';
        };

        auth.onchange = syncAuth;
        profileSelect.onchange = () => {
            const profile = profiles.find(p => String(p.id) === String(profileSelect.value));
            if (!profile) return;
            root.querySelector('#ssh-name-input').value = profile.name || '';
            root.querySelector('#ssh-host-input').value = profile.host || '';
            root.querySelector('#ssh-port-input').value = profile.port || 22;
            root.querySelector('#ssh-user-input').value = profile.user || '';
            root.querySelector('#ssh-path-input').value = profile.initialPath || '/';
            auth.value = profile.authMethod || 'password';
            root.querySelector('#ssh-password-input').value = decodePassword(profile);
            root.querySelector('#ssh-key-input').value = profile.privateKey || profile.pem || '';
            root.querySelector('#ssh-passphrase-input').value = profile.passphrase || '';
            syncAuth();
        };
        syncAuth();
    }
};
