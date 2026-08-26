// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns a nightly browser investigation into a repeatable command;
 * Awtsmoos.com writes each finished result immediately, so even a broken transport cannot erase the witnessed land.
 */
import fs from 'node:fs';
import path from 'node:path';
import { auditGame } from './audit-game.mjs';
import { MerkavaCdpClient } from './cdp-client.mjs';
import { KeliPublicRootServer } from './server.mjs';

const { slugs, outputPath } = parseArguments(process.argv.slice(2));
if (!slugs.length) {
	console.error('Usage: node run.mjs <game-slug...> [--output receipt.json]');
	process.exit(1);
}

const server = new KeliPublicRootServer();
let client = null;
const results = [];

try {
	await server.start();
	client = await MerkavaCdpClient.create();
	for (const slug of slugs) {
		const result = await auditGame(client, server.origin, slug);
		results.push(result);
		persist();
		console.log(`${slug}: ${result.issues.length ? `FLAG ${result.issues.join(',')}` : 'OK'}`);
	}
	if (results.some(result => result.issues.length)) process.exitCode = 2;
} finally {
	if (client) await client.close();
	server.stop();
}

function persist() {
	const payload = {
		generatedAt: new Date().toISOString(),
		publicRoot: 'geelooy/',
		results
	};
	if (outputPath) {
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
	} else {
		console.log(JSON.stringify(payload, null, 2));
	}
}

function parseArguments(argumentsList) {
	const values = [...argumentsList];
	const outputIndex = values.indexOf('--output');
	let outputPath = null;
	if (outputIndex >= 0) {
		const rawPath = values[outputIndex + 1];
		if (!rawPath) throw new Error('--output requires a path');
		outputPath = path.resolve(rawPath);
		values.splice(outputIndex, 2);
	}
	return { slugs: values.filter(Boolean), outputPath };
}
