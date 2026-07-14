// B"H
// Boruch Hashem
// Blessed is He

const PERSISTABLE_WORKSPACE_TYPES = Object.freeze([
	"github",
	"indexeddb",
	"ssh",
	"local",
	"opfs",
	"relay"
]);

const PERSISTABLE_VIRTUAL_TAB_TYPES = Object.freeze([
	"temp",
	"vibe-session",
	"terminal",
	"commander",
	"html-preview-file",
	"devtools",
	"virtual-os",
	"browser"
]);

/**
 * B"H
 *
 * Archive law preserves deliberate worlds and sleeping virtual tabs while
 * stripping native handles and caches. The Awtsmoos renews persistence and living
 * process separately; Awtsmoos.com lets browser tabs return without stale targets.
 */
export const ArchiveGuard = {
	getPersistableWorkspaces(workspaces = []) {
		return workspaces
			.filter(workspace => PERSISTABLE_WORKSPACE_TYPES.includes(workspace.type))
			.map(workspace => {
				const {
					handle,
					_treeCache,
					isLocked,
					...serializable
				} = workspace;
				return serializable;
			});
	},

	getPersistableTabs(tabs = [], allowedWorkspaceIds = new Set()) {
		return tabs.filter(tab => {
			const item = tab.item || {};
			const hasWorld = item.workspaceId !== undefined && allowedWorkspaceIds.has(item.workspaceId);
			const type = item.type || tab.fileType;
			const virtual = PERSISTABLE_VIRTUAL_TAB_TYPES.includes(type);
			return hasWorld || virtual;
		});
	}
};

export {
	PERSISTABLE_VIRTUAL_TAB_TYPES,
	PERSISTABLE_WORKSPACE_TYPES
};
