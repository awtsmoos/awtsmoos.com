// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('reference village material graphs use current docs-base public paths', () => {
	const path = fileURLToPath(new URL('../../../../../movies/projects/reference-village-60s.json', import.meta.url));
	const project = JSON.parse(fs.readFileSync(path, 'utf8'));
	const urls = project.materialGraphs
		.flatMap(graph => graph.nodes)
		.filter(node => node.type === 'texture')
		.map(node => node.url);
	assert.equal(urls.length, 2);
	for (const url of urls) {
		assert.match(url, /^https:\/\/awtsmoos-docs-base\.web\.app\/full-resolution\//);
		assert.doesNotMatch(url, /materials\/FULL|FULL%20SIZE/);
	}
});
