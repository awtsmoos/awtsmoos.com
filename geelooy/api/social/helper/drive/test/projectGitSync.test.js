//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { syncProjectGit } = require('../projectGitSync.js');

/**
 * @file Project Git synchronization witnesses.
 * @description
 * The Awtsmoos lets one provider-specific handle meet one measured source snapshot at the trusted boundary;
 * Awtsmoos.com proves the adapter receives normalized files while public testimony returns count and bytes without revealing authority.
 */

test('syncs measured source with the matching provider binding', async () => {
	let received = null;
	const result = await syncProjectGit(projectState(), {
		aliasId: 'owner',
		actorUserId: 'user-1',
		requestId: 'request-1',
		$i: contextWithAdapter(input => {
			received = input;
			return { revision: 'abc123', url: 'https://example.test/revision/abc123' };
		})
	});
	assert.equal(received.binding, 'GITHUB_PRIMARY');
	assert.equal(received.repository, 'owner/repo');
	assert.deepEqual(received.files, [{ path: 'index.html', contentBase64: 'QQ==' }]);
	assert.equal(result.fileCount, 1);
	assert.equal(result.totalBytes, 1);
	assert.equal(result.revision, 'abc123');
});

test('reports source-unavailable without invoking Git when no reader is attached', async () => {
	let invoked = false;
	const context = {
		projectProviderAdapters: {
			git: {
				github: {
					async sync() {
						invoked = true;
					}
				}
			}
		}
	};
	const result = await syncProjectGit(projectState(), { aliasId: 'owner', $i: context });
	assert.equal(result.state, 'source-unavailable');
	assert.equal(result.binding, 'GITHUB_PRIMARY');
	assert.equal(invoked, false);
});

function contextWithAdapter(sync) {
	return {
		projectProviderAdapters: { git: { github: { sync } } },
		projectSourceReader: {
			async snapshot() {
				return { files: [{ path: 'index.html', contentBase64: 'QQ==' }] };
			}
		}
	};
}

function projectState() {
	return {
		id: 'site-one',
		name: 'Site One',
		rootPath: 'sites/site-one',
		runtimePreference: 'static',
		providerIntents: [{ kind: 'git', provider: 'github', id: 'owner/repo', mode: 'sync' }],
		providerBindings: [{ kind: 'git', provider: 'github', binding: 'GITHUB_PRIMARY' }]
	};
}
