//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../..');
const read = relative => fs.readFile(path.join(root, relative), 'utf8');
const moduleUrl = relative => pathToFileURL(path.join(root, relative)).href;
const { planTranches } = await import(moduleUrl('social/migrate/js/publish/PlanTranches.js'));
const { AssetUploader } = await import(moduleUrl('social/migrate/js/upload/AssetUploader.js'));
const { paceFromRate } = await import(moduleUrl('social/migrate/js/upload/RatePacer.js'));

const long = Array.from({ length: 601 }, (_, index) => index);
assert.deepEqual(planTranches(long, 250).map(items => items.length), [250, 250, 101]);

let uploads = 0;
const uploader = new AssetUploader(async (_url, options) => {
	uploads += 1;
	const files = options.body.getAll('files');
	return new Response(JSON.stringify({
		success: files.map((file, index) => ({
			id: `asset-${uploads}-${index}`,
			type: 'image',
			mime: file.type,
			size: file.size,
			publicPath: `/api/social/assets/a/image/asset-${uploads}-${index}.jpg`
		})),
		rate: { success: true, remaining: 9, resetAt: Date.now() + 60000 }
	}), { status: 200 });
});
const paths = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'];
const uploaded = await uploader.uploadPaths({
	aliasId: 'a',
	paths,
	maxFilesPerRequest: 2,
	resolveMedia: async pathValue => ({
		path: pathValue,
		file: new File(['x'], pathValue, { type: 'image/jpeg' })
	})
});
assert.equal(uploads, 3);
assert.equal(Object.keys(uploaded).length, 5);
assert(uploaded['a.jpg'].publicPath.startsWith('/api/social/assets/'));

const started = Date.now();
await paceFromRate({ remaining: 5, resetAt: started + 1000 }, started);
assert(Date.now() - started < 200);

const official = [
	'https://www.facebook.com/help/212802592074644',
	'https://www.facebook.com/help/181231772500920',
	'https://support.google.com/accounts/answer/3024190?hl=en',
	'https://takeout.google.com/',
	'https://support.google.com/youtube/answer/56100?hl=en',
	'https://studio.youtube.com/'
];
const docs = `${await read('social/migrate/DOCUMENTATION.md')}\n${await read('youtube/DOCUMENTATION.md')}`;
for (const url of official) assert(docs.includes(url));

const commands = await read('social-composer/js/creator/CreatorCommandCatalog.js');
const actions = await read('social-composer/js/creator/CreatorCommandActions.js');
assert(commands.includes('Import social archive'));
assert(/facebook instagram youtube archive takeout migration import/i.test(commands));
assert(actions.includes("location.href = '/social/migrate/'"));

const routes = await read('api/social/helper/migrations/meta/MetaMigrationRoutes.js');
assert(routes.includes("'/migrations/meta/preflight'"));
assert(routes.includes("'/migrations/meta/plan'"));

const cssFiles = await fs.readdir(path.join(root, 'social/migrate/styles'));
let css = await read('social/migrate/style.css');
for (const file of cssFiles.filter(name => name.endsWith('.css'))) {
	css += `\n${await read(`social/migrate/styles/${file}`)}`;
}
assert(css.includes('prefers-reduced-motion'));
assert(css.includes('forced-colors'));
assert.equal(/transition\s*:\s*all/i.test(css), false);
console.log('integration-contracts: ok');
