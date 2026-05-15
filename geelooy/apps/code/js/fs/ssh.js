// B"H
// FILE: js/fs/ssh.js
import { State } from '../state.js';

/**
 * B"H
 * Shapes SSH credential failures into a recognizable vessel so the tree UI can
 * open the recovery dialog instead of leaving the user with a red sentence.
 */
function createCredentialError(message, sshInfo = {}) {
    const error = new Error(message);
    error.code = 'SSH_CREDENTIALS_REQUIRED';
    error.sshInfo = sshInfo;
    return error;
}

function decodeSecret(encoded = '') {
    try { return atob(encoded); }
    catch (_) { return encoded || ''; }
}

export const SSHProvider = {
    /**
     * B"H
     * Sends a request to the server-side SSH route.
     *
     * @param {string} endpoint API endpoint name.
     * @param {object} sshInfo SSH profile information.
     * @param {object} body Request body fields.
     * @returns {Promise<object>} Parsed server response.
     */
    async _api(endpoint, sshInfo = {}, body = {}) {
        const { host, user } = sshInfo;
        if (!host || !user) {
            throw createCredentialError('SSH host and username are required.', sshInfo);
        }

        const url = `/api/ssh/${endpoint}/${encodeURIComponent(user)}/${encodeURIComponent(host)}`;
        const formData = new URLSearchParams();

        if (sshInfo.port) formData.append('port', String(sshInfo.port));

        if (sshInfo.authMethod === 'password' && sshInfo.password) {
            formData.append('password', decodeSecret(sshInfo.password));
        } else if ((sshInfo.authMethod === 'privateKey' || sshInfo.authMethod === 'pem') && (sshInfo.privateKey || sshInfo.pem)) {
            formData.append('privateKey', sshInfo.privateKey || sshInfo.pem);
            if (sshInfo.passphrase) formData.append('passphrase', sshInfo.passphrase);
        } else {
            throw createCredentialError('Missing credentials for SSH request.', sshInfo);
        }

        for (const key in body) {
            formData.append(key, body[key]);
        }

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        let result = null;
        try { result = await response.json(); }
        catch (_) { result = { success: false, message: response.statusText }; }

        if (!response.ok || !result.success) {
            const message = result?.message || result?.error || `SSH API Error: ${response.statusText}`;
            const error = new Error(message);
            error.code = /auth|credential|password|permission|key/i.test(message) ? 'SSH_AUTH_FAILED' : 'SSH_API_FAILED';
            error.sshInfo = sshInfo;
            error.status = response.status;
            throw error;
        }

        return result;
    },

    _workspace(item = {}) {
        const workspace = State.workspaces.find(ws =>
            String(ws.id) === String(item.workspaceId) ||
            String(ws.id) === String(item.id)
        );
        if (!workspace || !workspace.sshInfo) {
            throw createCredentialError('SSH workspace context not found.', item.sshInfo || {});
        }
        return workspace;
    },

    _remotePath(workspace, itemPath = '/') {
        const base = workspace.sshInfo.initialPath || '/';
        const suffix = itemPath === '/' ? '' : itemPath;
        return `${base}${suffix}`.replace(/\/+/g, '/');
    },

    async testConnection(sshInfo) {
        return await this._api('connect', sshInfo, {});
    },

    async execute(item, command, options = {}) {
        const workspace = this._workspace(item);
        const cwd = this._remotePath(workspace, item.path || '/');
        const wrappedCommand = options.cwd === false
            ? command
            : `cd ${this._quote(cwd)} && ${command}`;

        const result = await this._api('execute', workspace.sshInfo, {
            command: wrappedCommand,
            input: options.input || '',
            pty: options.pty ? '1' : '',
            env: options.env ? JSON.stringify(options.env) : ''
        });

        return result.result;
    },

    _quote(value) {
        return `'${String(value).replace(/'/g, `'\\''`)}'`;
    },

    async list(item) {
        const workspace = this._workspace(item);
        const fullPath = this._remotePath(workspace, item.path);
        const result = await this._api('getFolderList', workspace.sshInfo, { folderPath: fullPath });
        return result.files.map(file => ({
            name: file.name,
            kind: file.kind,
            path: (item.path === '/' ? '' : item.path) + '/' + file.name
        }));
    },

    async read(item) {
        const workspace = this._workspace(item);
        const fullPath = this._remotePath(workspace, item.path);
        const result = await this._api('getFileContent', workspace.sshInfo, { filePath: fullPath });
        return result.content;
    },

    async write(item, content) {
        const workspace = this._workspace(item);
        const fullPath = this._remotePath(workspace, item.path);
        await this._api('writeFile', workspace.sshInfo, { filePath: fullPath, content: content });
    },

    async create(parentDir, name, kind) {
        const workspace = this._workspace(parentDir);
        const parentFullPath = this._remotePath(workspace, parentDir.path);
        const newFullPath = `${parentFullPath}/${name}`;

        if (kind === 'directory') {
            await this._api('makeFolder', workspace.sshInfo, { folderPath: newFullPath });
        } else {
            await this._api('writeFile', workspace.sshInfo, { filePath: newFullPath, content: '' });
        }
    },

    async delete(item) {
        const workspace = this._workspace(item);
        const fullPath = this._remotePath(workspace, item.path);
        await this._api('deleteAtPath', workspace.sshInfo, { deletePath: fullPath });
    }
};
