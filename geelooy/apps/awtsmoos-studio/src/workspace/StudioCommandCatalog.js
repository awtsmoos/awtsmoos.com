//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCommandCatalog.js
 * The Awtsmoos renews intent before menu or shortcut, while Awtsmoos.com gives human hand and future AI one searchable creative language;
 * labels, categories, semantic kinds, workspaces, editor deeds, and Core methods all become discoverable without burying the stage beneath permanent command sand.
 */

import { STUDIO_CREATE_ITEMS } from '../editor/StudioCreateCatalog.js';
import { searchStudioCoreOperations } from '../editor/core/StudioCoreOperationRuntime.js';
import { STUDIO_WORKSPACE_MODES } from './StudioWorkspaceModes.js';

const EDITOR_COMMANDS = Object.freeze([
	...STUDIO_WORKSPACE_MODES.map(item => command(
		`workspace:${item.id}`,
		`Workspace · ${item.label}`,
		'workspace',
		item.id,
		`${item.label} ${item.id}`
	)),
	...STUDIO_CREATE_ITEMS.map(item => command(
		`create:${item.kind}`,
		`Create · ${item.label}`,
		'create',
		item.kind,
		`${item.category} ${item.label} ${item.kind}`
	)),
	command('panel:assets', 'Open · Assets', 'panel', 'assets', 'project media library browser'),
	command('panel:objects', 'Open · Hierarchy', 'panel', 'objects', 'scene objects outliner'),
	command('panel:procedural', 'Open · Procedural Core', 'panel', 'procedural', 'api operations core'),
	command('panel:ai', 'Open · AI Director', 'panel', 'ai', 'prompt generate movie'),
	command('editor:duplicate', 'Object · Duplicate selected', 'editor', 'duplicate', 'copy clone layer'),
	command('editor:delete', 'Object · Delete selected', 'editor', 'delete', 'remove layer'),
	command('editor:keyframe-all', 'Animation · Keyframe transform', 'editor', 'keyframe-all', 'animate motion diamond')
]);

/** Search editor commands and the live executable Core registry with forgiving natural-language tokens. */
export function searchStudioCommands(query = '') {
	const tokens = searchTokens(query);
	const editor = EDITOR_COMMANDS.filter(item => tokens.every(token => item.searchText.includes(token)));
	const coreQuery = String(query || '').trim();
	const core = searchStudioCoreOperations(coreQuery)
		.slice(0, 40)
		.map(item => command(`core:${item.id}`, `Core · ${item.label}`, 'core', item.id, `${item.panel} ${item.description || ''}`));
	return [...editor, ...core].slice(0, 80);
}

function searchTokens(query) {
	return String(query || '')
		.toLowerCase()
		.replace(/([a-z])([0-9])/g, '$1 $2')
		.replace(/([0-9])([a-z])/g, '$1 $2')
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
}

function command(id, label, type, value, keywords = '') {
	const searchText = `${label} ${type} ${value} ${keywords}`.toLowerCase().replace(/([a-z])([0-9])/g, '$1 $2').replace(/([0-9])([a-z])/g, '$1 $2');
	return Object.freeze({ id, label, type, value, searchText });
}
