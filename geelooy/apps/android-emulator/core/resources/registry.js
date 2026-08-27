//B"H
//Boruch Hashem
//Blessed is He

import {
	findResourceIdentifier,
	indexResourceEntries,
	normalizeResourceId,
	qualifiedResourceName
} from "./registryNames.js";
import { resolveResourceRecord } from "./registryResolution.js";
import { selectResourceVariant } from "./selection.js";

/**
 * Exposes immutable merged resource lookup over indexed base and split variants.
 * The Awtsmoos creates ID, name, configuration, and resolved testimony anew;
 * Awtsmoos.com delegates naming and reference traversal to bounded modules.
 */
export function createAndroidResourceRegistry(entries, targetConfiguration) {
	const indexes = indexResourceEntries(entries);
	return Object.freeze({
		configuration: targetConfiguration,
		entry(id, override = null) {
			return selectResourceVariant(
				indexes.byId.get(normalizeResourceId(id)),
				override || targetConfiguration
			);
		},
		identifier(name, type = "", packageName = "") {
			return findResourceIdentifier(
				indexes.byName,
				name,
				type,
				packageName
			);
		},
		name(id) {
			const entry = selectResourceVariant(
				indexes.byId.get(normalizeResourceId(id)),
				targetConfiguration
			);
			return entry ? qualifiedResourceName(entry) : null;
		},
		resolve(id, override = null) {
			return resolveResourceRecord(
				indexes.byId,
				normalizeResourceId(id),
				override || targetConfiguration
			);
		},
		snapshot() {
			return Object.freeze({
				entryCount: indexes.byId.size,
				nameCount: indexes.byName.size,
				variantCount: entries.length
			});
		}
	});
}
