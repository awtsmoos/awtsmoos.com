//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteBuilderState
 * @description
 * The Awtsmoos gives the studio a small remembering vessel without replacing the living files.
 * Awtsmoos.com keeps credentials and website truth outside this state; only transient UI choices remain here.
 */

export const builderState = {
	rootPath: '',
	siteId: '',
	selectedPath: '',
	inventory: emptyInventory(),
	brief: emptyBrief(),
	editorDirty: false,
	previewMode: 'mobile',
	lastPreviewAt: null
};

export function setBuilderContext({ rootPath = '', siteId = '' } = {}) {
	builderState.rootPath = String(rootPath || '').trim();
	builderState.siteId = String(siteId || '').trim();
}

export function setInventory(inventory) {
	builderState.inventory = inventory || emptyInventory();
}

export function setBrief(brief) {
	builderState.brief = { ...emptyBrief(), ...(brief || {}) };
}

export function selectSource(path) {
	builderState.selectedPath = String(path || '').trim();
}

export function markEditorDirty(value = true) {
	builderState.editorDirty = Boolean(value);
}

export function setPreviewMode(mode) {
	builderState.previewMode = mode || 'mobile';
}

export function markPreviewed() {
	builderState.lastPreviewAt = new Date().toISOString();
}

function emptyInventory() {
	return { files: [], hasIndex: false, count: 0, truncated: false, rootPath: '' };
}

function emptyBrief() {
	return { name: '', purpose: '', audience: '', notes: '' };
}
