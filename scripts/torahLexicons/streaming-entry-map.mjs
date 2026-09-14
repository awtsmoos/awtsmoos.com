//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module StreamingLexiconEntryMap
 * @description
 * Builds one immutable serving B-tree from an already sorted stream.
 * Values are exact-length binary primitives; the completed tree is published
 * once through a stable anchor, avoiding incremental B-tree rewrite history.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const StreamingMapBulkBuilder = require(
	'../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/structure/map/streamingBulkBuilder.js'
);
const StableAnchor = require(
	'../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/structure/anchor/stable.js'
);
const constants = require(
	'../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/constants.js'
);

/** Creates one bounded-memory entry-map builder bound to a writable database. */
export function createStreamingEntryMap(database, rootKey = 'entries') {
	const builder = new StreamingMapBulkBuilder(database.allocator);
	return {
		/** Appends one exact compact record under a strictly increasing key. */
		append(key, encodedRecord) {
			const pointer = database.builder.build(encodedRecord);
			builder.append(key, pointer);
		},

		/** Publishes the completed B-tree once and returns its final entry count. */
		publish() {
			const mapSeal = builder.finish();
			const anchor = new StableAnchor(database);
			const anchorSeal = anchor.create(constants.VAL_TYPE.MAP, mapSeal);
			const rootState = database.root?.[constants.SYMBOLS.INTERNALS];
			if (!rootState?.writer) throw new Error('lexicon_root_writer_missing');
			rootState.writer.set(rootKey, anchorSeal, {
				isPtr: true,
				skipFree: true,
				assumeNew: true
			});
			return builder.count;
		}
	};
}
