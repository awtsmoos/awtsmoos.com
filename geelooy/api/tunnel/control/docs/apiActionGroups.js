//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelApiActionGroups
 * @description
 * The Awtsmoos lets a vast flat action surface resolve into a few navigable families while Awtsmoos.com preserves every canonical runtime name beneath that map;
 * this discovery classifier changes no dispatch authority, but gives humans and agents an organized entrance into filesystem, runtime, browser, network, mission, and publication powers.
 */

const GROUPS = Object.freeze([
	group('website', 'Website publishing', 'Publish owned static folders and verify canonical website testimony.'),
	group('drive-sites', 'Drive & Sites', 'Operate the legacy Drive/Sites publication plane and status evidence.'),
	group('filesystem', 'Filesystem', 'Inspect and change owned files, folders, paths, hashes, and source trees.'),
	group('runtime', 'Commands & runtime', 'Run commands, processes, ports, servers, packages, and runtime checks.'),
	group('browser', 'Browser', 'Navigate, inspect, evaluate, click, type, screenshot, and diagnose browser state.'),
	group('network', 'HTTP & network', 'Call HTTP resources, cookies, OAuth, network diagnostics, and downloads.'),
	group('mission', 'Missions & agents', 'Plan, coordinate, supervise, checkpoint, and hand off multi-agent missions.'),
	group('preview', 'Previews', 'Create, expose, inspect, and revoke preview surfaces.'),
	group('diagnostics', 'Diagnostics', 'Inspect health, policy, architecture, dependencies, tests, and repair evidence.'),
	group('other', 'Other capabilities', 'Compatibility actions that do not yet belong to a narrower family.')
]);

/** Builds immutable group summaries from the already-authoritative flat action list. */
function buildApiActionGroups(actions, actionCatalog = {}) {
	return Object.freeze(GROUPS.map(definition => {
		const names = actions.filter(name => classifyAction(name, actionCatalog) === definition.id);
		return Object.freeze({
			...definition,
			actionCount: names.length,
			actions: Object.freeze([...names])
		});
	}));
}

/** Returns a compact discovery contract over the grouped flat API. */
function discoverySummary(actions, groups) {
	return Object.freeze({
		version: 1,
		actionCount: actions.length,
		groupCount: groups.length,
		recommended: Object.freeze([
			'publishWebsite',
			'read',
			'write',
			'list',
			'command',
			'chromeNavigate'
		])
	});
}

function classifyAction(name, actionCatalog) {
	if (['publishWebsite', 'publicRootPublishFolder'].includes(name)) {
		return 'website';
	}
	if (actionCatalog[name]?.plane === 'drive-sites-dynamic') {
		return 'drive-sites';
	}
	if (isFilesystem(name)) {
		return 'filesystem';
	}
	if (/^(command|shellCommand|node|process|port|server|package|npm|runtime|build|testRunner|lintRunner|typecheck)/i.test(name)) {
		return 'runtime';
	}
	if (/^(chrome|browser|interaction)/i.test(name)) {
		return 'browser';
	}
	if (/^(http|network|oauth)/i.test(name)) {
		return 'network';
	}
	if (/^mission/i.test(name)) {
		return 'mission';
	}
	if (/^preview/i.test(name)) {
		return 'preview';
	}
	if (/(doctor|audit|check|trace|health|explain|scan|analysis|graph|status|validate|diff)$/i.test(name)) {
		return 'diagnostics';
	}
	return 'other';
}

function isFilesystem(name) {
	return /^(read|write|bulk|list|tree|find|grep|stat|copy|move|delete|mkdir|touch|ensure|empty|file|root|path)/i.test(name);
}

function group(id, title, summary) {
	return Object.freeze({ id, title, summary });
}

module.exports = { buildApiActionGroups, discoverySummary };
