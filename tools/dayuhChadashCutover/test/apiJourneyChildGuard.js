// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file apiJourneyChildGuard.js
 * @description
 * The Awtsmoos confines every private-test DosDB instance to the temporary root,
 * proving real HTTP mutations can never cross into living production data.
 */

const fs = require('fs');
const Module = require('module');
const path = require('path');

const receipt = process.env.AWTSMOOS_TEST_DB_RECEIPT;
const expectedRoot = process.env.AWTSMOOS_DB_ROOT;

function append(value) {
	if (!receipt) return;
	fs.appendFileSync(receipt, `${JSON.stringify(value)}\n`);
}

append({
	type: 'environment',
	pid: process.pid,
	cwd: process.cwd(),
	AWTSMOOS_DB_ROOT: expectedRoot || null,
	AWTS_DB_ROOT: process.env.AWTS_DB_ROOT || null
});

const originalLoad = Module._load;
Module._load = function guardedLoad(request, parent, isMain) {
	const loaded = originalLoad.apply(this, arguments);
	let resolved;
	try {
		resolved = Module._resolveFilename(request, parent, isMain);
	} catch {
		return loaded;
	}
	if (!/[/\\]DosDB[/\\]index\.js$/.test(resolved) || typeof loaded !== 'function') {
		return loaded;
	}
	return new Proxy(loaded, {
		construct(target, args, newTarget) {
			const root = path.resolve(String(args[0] || ''));
			append({ type: 'DosDB', pid: process.pid, request, resolved, root });
			if (expectedRoot && root !== path.resolve(expectedRoot)) {
				throw new Error(`B"H private server attempted foreign DosDB root: ${root}`);
			}
			return Reflect.construct(target, args, newTarget);
		}
	});
};
