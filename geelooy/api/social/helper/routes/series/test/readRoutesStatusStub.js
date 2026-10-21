//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file readRoutesStatusStub.js
 * @description Stub interface + result helpers extracted verbatim from readRoutesStatus.test.js.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { clearCache } = require('../../../packed/keyIndex.js');
const { normalizeDynamicReturn } = require('../../../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');

const PRATEEM = { id: 's1', name: 'Series One', description: 'd' };

function stubInterface({ method = 'GET', get = {}, details = false } = {}) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-routes-'));
	const $i = {
		request: { method },
		$_GET: details ? { details: 'true' } : {},
		$_POST: {},
		db: {
			directory: dir,
			get: async target => {
				if (target in get) {
					const value = get[target];
					if (value instanceof Error) throw value;
					return value;
				}
				const e = new Error('Path does not exist');
				throw e;
			},
			getObjectKeys: async target => {
				if (target in get) {
					const value = get[target];
					if (value instanceof Error) throw value;
					return value;
				}
				const e = new Error('Path does not exist');
				throw e;
			}
		},
		__dir: dir
	};
	return $i;
}

function cleanup($i) {
	fs.rmSync($i.__dir, { recursive: true, force: true });
	clearCache();
}

function statusOf(result) {
	return normalizeDynamicReturn(result).statusCode;
}

function bodyOf(result) {
	return JSON.parse(normalizeDynamicReturn(result).body);
}

module.exports = { PRATEEM, stubInterface, cleanup, statusOf, bodyOf };