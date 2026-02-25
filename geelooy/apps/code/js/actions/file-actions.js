
// B"H
// FILE: js/actions/file-actions.js

import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces/index.js';

/**
 * @class FileActions
 * @classdesc The vessel of Action (Asiyah), where the user's commands 
 * to create, destroy, or rename the physical vessels are carried out.
 * Every file created is a new name spoken into the void of the disk.
 */
export const FileActions = {
    /**
     * @async
     * @function handle
     * @description Dispatches specific filesystem rituals based on the command given.
     * @param {string} action The name of the ritual (new-file, delete, etc.)
     * @param {object} item The target directory or file.
     */
    async handle(action, item) {
        if (!item) return;

        const maps = {
            "new-file": () => this.createItem(item, 'file'),
            "new-folder": () => this.createItem(item, 'directory'),
            "rename": () => this.renameItem(item),
            "delete": () => this.deleteItem(item)
        };

        if (maps[action]) await maps[action]();
    },

    /**
     * @async
     * @function createItem
     * @description B"H. As the speech of the Awtsmoos brings matter from 
     * absolute nothing, this function prompts for a name and brings a 
     * new vessel into being on the disk.
     */
    async createItem(parent, kind) {
        const name = await UI.showDialog({
            title: `Create New ${kind}`,
            hasInput: true,
            placeholder: `Enter ${kind} name...`
        });

        if (name) {
            await FileSystemProvider.create(parent, name, kind);
            UI.showToast(`${kind} '${name}' manifested.`, "success");
            await Workspaces.refreshNode(parent);
        }
    },

    /**
     * @async
     * @function deleteItem
     * @description An act of Tzimtzum (Contraction). It removes a vessel, 
     * returning its allocated space to the potential of the disk.
     */
    async deleteItem(item) {
        const confirmed = await UI.showDialog({
            title: "Confirm Retraction",
            message: `Retract '${item.name}' from reality?`,
            okText: "Delete"
        });

        if (confirmed) {
            await FileSystemProvider.delete(item);
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
            const parent = { ...item, path: parentPath, kind: 'directory' };
            await Workspaces.refreshNode(parent);
            UI.showToast(`'${item.name}' retracted.`, "info");
        }
    }
};
