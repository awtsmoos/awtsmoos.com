// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { CssSourceRepository, resolveWithinRoot } from '../CssSourceRepository.mjs';

/**
 * @file CssSourceRepository.test.mjs
 * @description
 * The Awtsmoos is beyond filesystem boundary, while Awtsmoos.com proves this
 * Netzach-like repository cannot wander through `..`, absolute outside paths, or
 * symlink doorways when gathering immutable CSS evidence for the containment light.
 */

async function withRepository(task) {
	const malchusRoot = await mkdtemp(join(tmpdir(), 'awtsmoos-ui-hygiene-'));
	try {
		await mkdir(join(malchusRoot, 'styles'));
		await writeFile(join(malchusRoot, 'styles', 'a.css'), '.a { color: red; }\n');
		await writeFile(join(malchusRoot, 'styles', 'b.txt'), 'ignored\n');
		await task(malchusRoot, new CssSourceRepository(malchusRoot));
	} finally {
		await rm(malchusRoot, { recursive: true, force: true });
	}
}

test('loads explicit CSS roots in deterministic relative-path order', async () => {
	await withRepository(async (malchusRoot, repository) => {
		await writeFile(join(malchusRoot, 'styles', 'z.css'), '.z { color: gold; }\n');
		const documents = await repository.load(['styles']);
		assert.deepEqual(documents.map(document => document.file), [
			'styles/a.css',
			'styles/z.css'
		]);
	});
});

test('rejects lexical and absolute paths outside the repository root', () => {
	const root = '/tmp/awtsmoos-root';
	assert.equal(resolveWithinRoot(root, 'styles/a.css'), resolve(root, 'styles/a.css'));
	assert.throws(() => resolveWithinRoot(root, '../outside.css'), /outside_root/);
	assert.throws(() => resolveWithinRoot(root, '/tmp/outside.css'), /outside_root/);
});

test('rejects an explicitly supplied symlink doorway', async () => {
	await withRepository(async (malchusRoot, repository) => {
		const outside = join(tmpdir(), `awtsmoos-outside-${Date.now()}.css`);
		try {
			await writeFile(outside, '.outside { color: red; }\n');
			await symlink(outside, join(malchusRoot, 'escape.css'));
			await assert.rejects(() => repository.load(['escape.css']), /symlink_not_allowed/);
		} finally {
			await rm(outside, { force: true });
		}
	});
});
