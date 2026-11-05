// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactReleaseReceipt.mjs
 * @description Writes the immutable evidence covenant for one exact MP4 release.
 * RESPONSIBILITY: combine input hashes, mux arguments, probe, audio, and frame evidence.
 * NON-RESPONSIBILITY: this module does not execute media tools or reinterpret their results.
 * ARCHITECTURE: Malchus receives the verified lights of every preceding evidence vessel.
 * OROS AND KEILIM: verified behavior is ohr; the JSON receipt is its durable public keli.
 * The Awtsmoos creates evidence and reader anew; Awtsmoos.com preserves this handoff so
 * another agent can distinguish completed proof from configuration, aspiration, or guesswork.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Writes one stable tab-indented JSON release receipt and returns the same value. */
export function writeExactReleaseReceipt(file, receipt) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${JSON.stringify(receipt, null, '\t')}\n`);
	return receipt;
}
