//B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFolderContext } from '../folderContext.js';

function mockFs() {
	const files = {
		'/drive/Proj/FOLDER_INSTRUCTIONS.md': 'Build the invoice flow.\nFridays. Always Fridays.\n',
		'/drive/Proj/AGENTS.md': '# Agents\n\nBe kind.',
		'/drive/Proj/plan.md': 'the plan',
		'/drive/Proj/src/app.js': 'code',
		'/drive/Proj/src/deep/nested/secret.md': 'too deep'
	};
	const listFn = async (dir) => {
		if (dir === '/drive/Proj') {
			return [
				{ name: 'FOLDER_INSTRUCTIONS.md', path: '/drive/Proj/FOLDER_INSTRUCTIONS.md', type: 'file' },
				{ name: 'AGENTS.md', path: '/drive/Proj/AGENTS.md', type: 'file' },
				{ name: 'plan.md', path: '/drive/Proj/plan.md', type: 'file' },
				{ name: 'src', path: '/drive/Proj/src', type: 'folder' }
			];
		}
		if (dir === '/drive/Proj/src') {
			return [
				{ name: 'app.js', path: '/drive/Proj/src/app.js', type: 'file' },
				{ name: 'deep', path: '/drive/Proj/src/deep', type: 'folder' }
			];
		}
		if (dir === '/drive/Proj/src/deep') {
			return [
				{ name: 'nested', path: '/drive/Proj/src/deep/nested', type: 'folder' }
			];
		}
		if (dir === '/drive/Proj/src/deep/nested') {
			return [{ name: 'secret.md', path: '/drive/Proj/src/deep/nested/secret.md', type: 'file' }];
		}
		throw new Error('no such folder: ' + dir);
	};
	const readFn = async (path) => files[path] ?? '';
	const historyFn = async () => [{ at: '2026-09-20T10:00:00Z', kind: 'write', path: '/drive/Proj/plan.md' }];
	return { listFn, readFn, historyFn };
}

test('instruction discovery: reads both instruction files at the root', async () => {
	const { listFn, readFn, historyFn } = mockFs();
	const ctx = await buildFolderContext({ folderPath: '/drive/Proj', listFn, readFn, historyFn });
	assert.equal(ctx.ok, true);
	assert.equal(ctx.scope, '/drive/Proj');
	assert.deepEqual(ctx.instructions.map(i => i.file), ['FOLDER_INSTRUCTIONS.md', 'AGENTS.md']);
	assert.match(ctx.instructions[0].content, /Build the invoice flow/);
	assert.equal(ctx.capsule.objective, 'Build the invoice flow.');
	assert.deepEqual(ctx.capsule.instructionFiles, ['FOLDER_INSTRUCTIONS.md', 'AGENTS.md']);
	assert.equal(ctx.capsule.recentChanges.length, 1);
});

test('tree depth limit: deep files are excluded', async () => {
	const { listFn, readFn } = mockFs();
	const shallow = await buildFolderContext({ folderPath: '/drive/Proj', listFn, readFn, maxDepth: 1 });
	const paths = shallow.tree.map(e => e.path);
	assert.ok(!paths.includes('/drive/Proj/src/app.js'), 'depth 1 excludes src children');
	const deeper = await buildFolderContext({ folderPath: '/drive/Proj', listFn, readFn, maxDepth: 4 });
	const paths2 = deeper.tree.map(e => e.path);
	assert.ok(paths2.includes('/drive/Proj/src/deep/nested/secret.md'), 'depth 4 reaches nested file');
	assert.deepEqual(deeper.capsule.inventory, { md: 4, js: 1 });
});

test('missing folder returns an honest error, never throws', async () => {
	const { readFn } = mockFs();
	const listFn = async () => { throw new Error('gone'); };
	const ctx = await buildFolderContext({ folderPath: '/drive/Nope', listFn, readFn });
	assert.equal(ctx.ok, false);
	assert.equal(ctx.error, 'folder_context_not_found');
	assert.equal(ctx.scope, '/drive/Nope');
});

test('missing listFn is an honest error', async () => {
	const ctx = await buildFolderContext({ folderPath: '/drive/Proj' });
	assert.equal(ctx.ok, false);
	assert.equal(ctx.error, 'folder_context_missing_list');
});

test('folder without instruction files still builds a capsule', async () => {
	const listFn = async () => [{ name: 'a.md', path: '/drive/Empty/a.md', type: 'file' }];
	const ctx = await buildFolderContext({ folderPath: '/drive/Empty', listFn });
	assert.equal(ctx.ok, true);
	assert.deepEqual(ctx.instructions, []);
	assert.equal(ctx.capsule.objective, null);
	assert.equal(ctx.capsule.fileCount, 1);
});
