//B"H
//Boruch Hashem
//Blessed be He

import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Creates production-shaped composite memory for platform-loop AArch64 fixtures.
 *
 * The executable/buffer/stack region is real mutable anonymous guest memory, while
 * the primary route deliberately faults. Composite memory supplies the AArch64
 * `readU32`/`readU64` fetch API and provenance behavior used by production machines.
 *
 * @returns {object} Composite guest memory covering 0x1000 through 0x3fff.
 */
export function createPlatformPumpMemory() {
	const region = createNativeAnonymousMemory(
		0x1000n,
		0x3000,
		"platform-pump-test"
	);
	return createNativeCompositeMemory(
		faultingPrimary(),
		[region],
		"platform-pump-composite"
	);
}

/** Rejects accesses outside the explicitly modeled platform-pump test region. */
function faultingPrimary() {
	return Object.freeze({
		read(address, size) {
			throw new Error(`PLATFORM_PUMP_PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PLATFORM_PUMP_PRIMARY_WRITE:${address}:${bytes.length}`);
		}
	});
}
