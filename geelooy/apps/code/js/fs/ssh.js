// B"H
// FILE: js/fs/ssh.js
import { State } from '../state.js';

export const SSHProvider = {
    // A helper to make API calls to theNode.js server
    async _api(endpoint, sshInfo, body) {
        const { host, user } = sshInfo;
        const url = `/api/ssh/${endpoint}/${encodeURIComponent(user)}/${encodeURIComponent(host)}`;

        const formData = new URLSearchParams();

        // This logic sends the correct credential to the API
        if (sshInfo.port) formData.append('port', String(sshInfo.port));

        if (sshInfo.authMethod === 'password' && sshInfo.password) {
            formData.append('password', atob(sshInfo.password));
        } else if ((sshInfo.authMethod === 'privateKey' || sshInfo.authMethod === 'pem') && (sshInfo.privateKey || sshInfo.pem)) {
            formData.append('privateKey', sshInfo.privateKey || sshInfo.pem);
            if (sshInfo.passphrase) formData.append('passphrase', sshInfo.passphrase);
        } else {
            throw new Error("Missing credentials for SSH request.");
        }

        for (const key in body) {
            formData.append(key, body[key]);
        }

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'An unknown error occurred on the server.');
        }
        return result;
    },

    _workspace(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId || ws.id === item.id);
        if (!workspace || !workspace.sshInfo) throw new Error("SSH workspace context not found.");
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
