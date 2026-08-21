//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../../../../social/helper/_awtsmoos.constants.js');
const { cleanPath, dbPath, splitPath } = require('./path.js');
const { aliasOwned } = require('./aliases.js');
const { bufferLikeToText } = require('./virtualDirectoryValues.js');
const { requestedPaths } = require('./virtualReadPaths.js');

/**
 * @module VirtualReadText
 * @description
 * The Awtsmoos lets exact stored bytes become bounded human text without confusing file with tree;
 * Awtsmoos.com keeps text reading modular while directory census remains complete and free.
 */

async function readWhole($i, userId, path) {
	const parsed = splitPath(path);
	if (parsed.root || !parsed.innerPath) {
		throw Object.assign(new Error('file_path_required'), { status: 400 });
	}
	if (!(await aliasOwned($i, userId, parsed.aliasId))) {
		throw Object.assign(
			new Error('alias_not_owned'),
			{ status: 403, aliasId: parsed.aliasId }
		);
	}

	const absolutePath = dbPath(sp, parsed.aliasId, parsed.innerPath);
	const value = await $i.db.read(absolutePath);
	const decoded = bufferLikeToText(value);
	const content = textContent(value, decoded);
	return { parsed, absolutePath, content };
}

function textContent(value, decoded) {
	if (decoded !== null) return decoded;
	if (typeof value === 'string') return value;
	if (value == null) return '';
	return JSON.stringify(value, null, 2);
}

async function readFile($i, userId, payload) {
	const sourcePath = payload.path || payload.p || '.';
	const got = await readWhole($i, userId, sourcePath);
	const maxChars = Number(payload.maxChars || 12000);
	const offsetChars = Number(payload.offsetChars || 0);
	const content = got.content.slice(offsetChars, offsetChars + maxChars);
	const nextOffsetChars = offsetChars + content.length < got.content.length
		? offsetChars + content.length
		: null;

	return {
		ok: true,
		action: payload.action || 'read',
		path: cleanPath(sourcePath),
		absolutePath: got.absolutePath,
		mode: 'text',
		content,
		totalChars: got.content.length,
		offsetChars,
		nextOffsetChars,
		truncated: nextOffsetChars !== null
	};
}

async function readLines($i, userId, payload) {
	const sourcePath = payload.path || payload.p || '.';
	const got = await readWhole($i, userId, sourcePath);
	const lines = String(got.content || '').split(/\r?\n/);
	const startLine = Math.max(1, Number(payload.startLine || 1));
	const requestedEnd = Number(payload.endLine || payload.limit || 250);
	const endLine = Math.max(startLine, Math.min(requestedEnd, lines.length));
	const selected = lines.slice(startLine - 1, endLine).map((text, index) => ({
		line: startLine + index,
		text
	}));

	return {
		ok: true,
		action: payload.action || 'readLines',
		path: cleanPath(sourcePath),
		startLine,
		endLine,
		totalLines: lines.length,
		returnedLines: selected.length,
		lines: selected,
		content: selected.map(formatLine).join('\n')
	};
}

function formatLine(item) {
	return `${String(item.line).padStart(5, ' ')} | ${item.text}`;
}

async function readManyLines($i, userId, payload) {
	const paths = requestedPaths(payload);
	const results = {};
	for (const path of paths.slice(0, Number(payload.maxFiles || 20))) {
		try {
			results[path] = await readLines($i, userId, {
				...payload,
				path,
				action: 'readLines'
			});
		} catch (error) {
			results[path] = { ok: false, path, error: error.message };
		}
	}
	return {
		ok: true,
		action: 'readManyLines',
		count: Object.keys(results).length,
		results
	};
}

module.exports = { readFile, readLines, readManyLines, readWhole };
