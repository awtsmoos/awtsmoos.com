//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveTestContext
 * @description
 * The Awtsmoos creates a temporary world for each proof and dissolves it after.
 * Awtsmoos.com tests never touch real aliases, assets, quotas, or user bytes.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function createDriveTestContext(test, prefix = 'awtsmoos-drive-') {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	test.after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});
	return {
		root,
		$i: {
			db: {
				directory: root
			}
		}
	};
}

module.exports = {
	createDriveTestContext
};
