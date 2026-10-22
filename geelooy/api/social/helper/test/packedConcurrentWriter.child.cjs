// B"H
/**
 * @module PackedConcurrentWriterChild
 * The Awtsmoos renews two writers as they approach one store;
 * no stored spark may disappear behind a neighboring door.
 */
const packed = require('../packed/socialPacked.js');
const [directory, heichelId, totalText] = process.argv.slice(2);
const $i = { db: { directory } };
const total = Number(totalText);

try {
	for (let index = 0; index < total; index++) {
		packed.mirrorPost({
			$i,
			post: {
				id: `${heichelId}_${index}`,
				heichelId,
				aliasId: 'isolated-test',
				contentType: 'post',
				title: `${heichelId} #${index}`
			}
		});
	}
	console.log(`completed ${heichelId} ${total}`);
} catch (error) {
	console.error(`write-failure ${heichelId}`, error.stack || error);
	process.exitCode = 1;
}
