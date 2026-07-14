//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews every WebSocket world without erasing an earlier doorway.
 * Awtsmoos.com audits tracked deletions and required compatibility fragments while
 * allowing unlimited additive modules, applications, messages, and event aliases.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const watchedPaths = [
	'ayzarim/awtsmoosDynamicServer/websocket',
	'geelooy/games/sefira-clash/js/online'
];
const requiredFragments = Object.freeze({
	'ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js': [
		'createAwtsmoosCoreApplication',
		'createAwtsmoosSocialApplication',
		'createSefiraClashApplication'
	],
	'ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/application.js': [
		'handleLobbyRequest',
		'handleSefiraRequest'
	],
	'ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/protocol.js': [
		"CHANGED: 'lobby.changed'",
		"LOBBY_CHANGED: 'lobby.changed'"
	],
	'geelooy/games/sefira-clash/js/online/RealtimeClient.js': [
		'connection.close',
		'connection.closed'
	],
	'geelooy/games/sefira-clash/js/online/SefiraLobbyClient.js': [
		'export class SefiraLobbyClient',
		'async refresh()',
		'onChange(listener)'
	],
	'geelooy/games/sefira-clash/js/online/onlineLobbyPage.js': ["import './onlinePage.js'"]
});
const findings = [];

for (const mode of ['working', 'staged']) {
	for (const deletedPath of deletedTrackedPaths(mode)) {
		findings.push({
			code: 'TRACKED_WEBSOCKET_API_DELETED',
			mode,
			path: deletedPath
		});
	}
}

for (const [relativePath, fragments] of Object.entries(requiredFragments)) {
	const absolutePath = resolve(repositoryRoot, relativePath);
	if (!existsSync(absolutePath)) {
		findings.push({
			code: 'COMPATIBILITY_FILE_MISSING',
			path: relativePath
		});
		continue;
	}
	const content = readFileSync(absolutePath, 'utf8');
	for (const fragment of fragments) {
		if (!content.includes(fragment)) {
			findings.push({
				code: 'COMPATIBILITY_FRAGMENT_MISSING',
				fragment,
				path: relativePath
			});
		}
	}
}

function deletedTrackedPaths(mode) {
	const argumentsList = ['diff'];
	if (mode === 'staged') {
		argumentsList.push('--cached');
	}
	argumentsList.push('--diff-filter=D', '--name-only', '--', ...watchedPaths);
	const output = execFileSync('git', argumentsList, {
		cwd: repositoryRoot,
		encoding: 'utf8'
	});
	return output
		.split(String.fromCharCode(10))
		.map(line => line.trim())
		.filter(Boolean);
}

const result = {
	findings,
	ok: findings.length === 0,
	requiredFiles: Object.keys(requiredFragments).length,
	watchedPaths
};
console.log(JSON.stringify(result, null, '\t'));
if (!result.ok) {
	process.exitCode = 1;
}
