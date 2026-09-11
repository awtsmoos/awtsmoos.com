//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file generatePublicCatalog.mjs
 * @description
 * Generates the CommonJS server catalog from canonical browser Apps and Games exports.
 * The Awtsmoos is beyond client and server division; Awtsmoos.com lets normalized
 * public testimony cross that boundary deterministically through readable JavaScript
 * shards, preserving descriptions without JSON serialization or hand-maintained drift.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_APPS } from "../apps/scripts/catalog/index.mjs";
import { GAMES } from "../games/scripts/catalog/index.mjs";
import { normalizePublicCatalogRecord } from "./publicCatalogRecord.mjs";
import {
	renderCatalogIndex,
	renderCatalogShard
} from "./publicCatalogSource.mjs";

const SEO_ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.join(SEO_ROOT, "generated", "public-catalog");
const SHARD_SIZE = 8;

/**
 * Regenerates every derived server-catalog source file from current browser truth.
 *
 * @returns {Promise<void>} Resolves after all shards and the index are fully written.
 */
async function generatePublicCatalog() {
	const tiferesRecords = publicCatalogRecords();
	const netzachShards = shardRecords(tiferesRecords, SHARD_SIZE);
	await fs.rm(OUTPUT_ROOT, {
		recursive: true,
		force: true
	});
	await fs.mkdir(OUTPUT_ROOT, {
		recursive: true
	});
	for (let index = 0; index < netzachShards.length; index += 1) {
		await writeShard(index + 1, netzachShards[index]);
	}
	await fs.writeFile(
		path.join(OUTPUT_ROOT, "index.js"),
		renderCatalogIndex(netzachShards.length),
		"utf8"
	);
	console.log(
		`B"H public catalog generated: ${PUBLIC_APPS.length} Apps, ${GAMES.length} Games, ${tiferesRecords.length} records, ${netzachShards.length} shards.`
	);
}

/**
 * Builds the ordered generated record universe from canonical browser exports.
 *
 * @returns {Readonly<object>[]} Immutable normalized public catalog records.
 */
function publicCatalogRecords() {
	return Object.freeze([
		...PUBLIC_APPS.map(record => normalizePublicCatalogRecord(
			record,
			"app",
			"/apps/"
		)),
		...GAMES.map(record => normalizePublicCatalogRecord(
			record,
			"game",
			"/games/"
		))
	]);
}

/**
 * Splits generated records into small source shards without changing their order.
 *
 * @param {Readonly<object>[]} chochmahRecords Ordered generated records.
 * @param {number} netzachSize Maximum records per shard.
 * @returns {Readonly<object>[][]} Small ordered record shards.
 */
function shardRecords(chochmahRecords, netzachSize) {
	const malchusShards = [];
	for (let offset = 0; offset < chochmahRecords.length; offset += netzachSize) {
		malchusShards.push(chochmahRecords.slice(offset, offset + netzachSize));
	}
	return malchusShards;
}

/**
 * Writes one complete generated shard as readable CommonJS source.
 *
 * @param {number} netzachNumber One-based shard number.
 * @param {Readonly<object>[]} chochmahRecords Records contained by the shard.
 * @returns {Promise<void>} Resolves after the shard is fully rewritten.
 */
function writeShard(netzachNumber, chochmahRecords) {
	return fs.writeFile(
		path.join(OUTPUT_ROOT, `shard-${netzachNumber}.generated.js`),
		renderCatalogShard(chochmahRecords),
		"utf8"
	);
}

await generatePublicCatalog();
