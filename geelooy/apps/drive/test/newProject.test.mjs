//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { PROJECT_TEMPLATES, scaffoldProject } from '../js/newProject.js';

function mockFs(existing = new Set()) {
	const folders = new Set();
	const files = new Map(existing);
	return {
		folders,
		files,
		async createFolder(path) {
			if (folders.has(path)) {
				const error = new Error(`Folder already exists: ${path}`);
				error.code = 'EEXIST';
				throw error;
			}
			folders.add(path);
		},
		async writeFile(path, content) {
			files.set(path, content);
		},
		async exists(path) {
			return files.has(path) || folders.has(path);
		}
	};
}

test('scaffoldProject creates the nested folder and starter files', async () => {
	const fs = mockFs();
	const result = await scaffoldProject({ name: 'My Demo', parentFolder: '/Sites', fs });
	assert.equal(result.projectPath, '/Sites/my-demo');
	assert.deepEqual(result.files, [
		'/Sites/my-demo/index.html',
		'/Sites/my-demo/styles.css',
		'/Sites/my-demo/app.js',
		'/Sites/my-demo/README.md'
	]);
	assert.ok(result.created.includes('/Sites/my-demo'));
	assert.deepEqual(result.skipped, []);
	const html = fs.files.get('/Sites/my-demo/index.html');
	assert.match(html, /<title>My Demo<\/title>/);
	assert.match(html, /styles\.css/);
	assert.match(html, /app\.js/);
	assert.match(fs.files.get('/Sites/my-demo/README.md'), /# My Demo/);
});

test('scaffoldProject is idempotent: re-run skips existing files', async () => {
	const fs = mockFs();
	const first = await scaffoldProject({ name: 'Demo', parentFolder: '/', fs });
	assert.equal(first.skipped.length, 0);
	fs.files.set('/demo/index.html', '<!-- user edits -->');
	const second = await scaffoldProject({ name: 'Demo', parentFolder: '/', fs });
	assert.deepEqual(second.created, []);
	assert.ok(second.skipped.includes('/demo/index.html'));
	assert.ok(second.skipped.includes('/demo/styles.css'));
	assert.equal(fs.files.get('/demo/index.html'), '<!-- user edits -->');
	assert.ok(fs.files.has('/demo/app.js'));
});

test('scaffoldProject rejects bad names and unknown templates', async () => {
	const fs = mockFs();
	await assert.rejects(() => scaffoldProject({ name: '   ', fs }), /at least one letter/);
	await assert.rejects(() => scaffoldProject({ name: 'ok', template: 'nope', fs }), /Unknown project template/);
	await assert.rejects(() => scaffoldProject({ name: 'ok' }), /fs\.createFolder/);
});

test('starter templates cover every declared template file', () => {
	for (const [name, files] of Object.entries(PROJECT_TEMPLATES)) {
		for (const [relative, render] of Object.entries(files)) {
			const content = render({ name: 'Probe' });
			assert.equal(typeof content, 'string', `${name}/${relative}`);
			assert.ok(content.length > 0, `${name}/${relative}`);
		}
	}
});
