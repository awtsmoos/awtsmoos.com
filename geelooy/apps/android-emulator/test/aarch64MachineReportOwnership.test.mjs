//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64MachineReporter } from "../core/native/aarch64MachineReport.js";

/**
 * Proves owner enrichment happens only when terminal testimony is materialized.
 * The Awtsmoos renews trace and final witness after the hot instruction race;
 * Awtsmoos.com keeps budget stops lean while terminal reads reveal their place.
 */
test("AArch64 terminal report annotates recent read ownership cold", () => {
	let snapshots = 0;
	const memory = Object.freeze({
		aarch64ProvenanceSnapshot() {
			snapshots += 1;
			return Object.freeze({
				recentReads: Object.freeze([
					Object.freeze({ address: "8192", readerPc: "4096", size: 8 })
				])
			});
		},
		describeAddress(address, size) {
			assert.equal(address, 8192n);
			assert.equal(size, 8);
			return Object.freeze({
				kind: "virtual-memory",
				label: "native-virtual-memory",
				path: Object.freeze(["runtime", "native-virtual-memory"])
			});
		}
	});
	const registers = fakeRegisters(0x1000n);
	const reporter = createAarch64MachineReporter({ memory });
	const report = reporter.stop("unknown-instruction", registers, 7);
	assert.equal(snapshots, 1);
	assert.deepEqual(
		report.memoryProvenance.recentReads[0].owner.path,
		["runtime", "native-virtual-memory"]
	);
	const budget = reporter.stop("budget", registers, 8);
	assert.equal(snapshots, 1);
	assert.equal(budget.memoryProvenance, undefined);
});

function fakeRegisters(pc) {
	return Object.freeze({
		pc,
		snapshot() {
			return Object.freeze({ pc: pc.toString() });
		}
	});
}
