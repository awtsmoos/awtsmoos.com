//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PROJECT_ID_KEY,
	getFolderProject,
	getProjectLibrary,
	linkProjectAndFolder,
	linkProjectLibrary,
	setFolderProject
} from '../js/projectLinks.js';

function mockProjects(records = []) {
	const saved = new Map(records.map(record => [record.id, { ...record }]));
	return {
		saved,
		async list() { return [...saved.values()]; },
		async save(id, values) { saved.set(id, { ...values, id }); }
	};
}

function mockMetadata() {
	const map = new Map();
	return {
		async getMetadata(path) { return map.get(path) || {}; },
		async updateMetadata(path, patch) { map.set(path, { ...(map.get(path) || {}), ...patch }); }
	};
}

test('linkProjectLibrary stores libraryPath on the project record and reads it back', async () => {
	const projects = mockProjects([{ id: 'p1', name: 'Demo' }]);
	const linked = await linkProjectLibrary(projects, 'p1', '/Sites/demo');
	assert.deepEqual(linked, { projectId: 'p1', libraryPath: '/Sites/demo' });
	const read = await getProjectLibrary(projects, 'p1');
	assert.equal(read.libraryPath, '/Sites/demo');
	assert.equal(read.project.name, 'Demo');
});

test('getProjectLibrary returns null libraryPath when unlinked', async () => {
	const projects = mockProjects([{ id: 'p1', name: 'Demo' }]);
	const read = await getProjectLibrary(projects, 'p1');
	assert.equal(read.libraryPath, null);
	assert.equal(read.projectId, 'p1');
});

test('folder -> project round-trip through the metadata contract', async () => {
	const metadata = mockMetadata();
	const set = await setFolderProject('/Sites/demo', 'p1', { metadata });
	assert.equal(set.via, 'entryMetadata');
	const got = await getFolderProject('/Sites/demo', { metadata });
	assert.equal(got.projectId, 'p1');
	const missing = await getFolderProject('/Sites/other', { metadata });
	assert.equal(missing.projectId, null);
});

test('setFolderProject falls back to direct entry fields without metadata', async () => {
	const entry = { path: '/Sites/demo', type: 'folder' };
	const set = await setFolderProject('/Sites/demo', 'p9', { entry, metadata: null });
	assert.equal(entry[PROJECT_ID_KEY], 'p9');
	const got = await getFolderProject('/Sites/demo', { entry, metadata: null });
	assert.equal(got.projectId, 'p9');
	assert.equal(set.via, 'entry');
});

test('linkProjectAndFolder links both directions at once', async () => {
	const projects = mockProjects([{ id: 'p1', name: 'Demo' }]);
	const metadata = mockMetadata();
	const result = await linkProjectAndFolder({ projects, metadata }, 'p1', '/Sites/demo');
	assert.equal(result.projectLink.libraryPath, '/Sites/demo');
	assert.equal(result.folderLink.projectId, 'p1');
	const read = await getProjectLibrary(projects, 'p1');
	assert.equal(read.libraryPath, '/Sites/demo');
});

test('linkProjectLibrary rejects missing resource or projectId', async () => {
	await assert.rejects(() => linkProjectLibrary(null, 'p1', '/x'), /projects resource/);
	await assert.rejects(() => linkProjectLibrary(mockProjects(), '', '/x'), /projectId/);
	await assert.rejects(() => setFolderProject('/x', '', { metadata: mockMetadata() }), /projectId/);
});
