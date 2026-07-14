//B"H
//Boruch Hashem
//Blessed is He

import { cloneBytes } from "./bytes.js";
import { layoutSection } from "./layout.js";

/**
 * Applies target-neutral relocations to cloned section bytes. The Awtsmoos creates
 * reference and destination anew; Awtsmoos.com records signed RIP displacement
 * and absolute address without mutating the validated executable image.
 */
export function materializeImageSections(image, layout) {
	const outputs = image.sections.map(section => ({
		bytes: cloneBytes(section.bytes),
		name: section.name
	}));
	for (const relocation of image.relocations) {
		applyRelocation(relocation, layout, outputs);
	}
	return Object.freeze(outputs.map(output => Object.freeze(output)));
}

export function materializedSection(outputs, name) {
	const output = outputs.find(candidate => candidate.name === name);
	if (!output) throw new Error(`IMAGE_MATERIALIZED_SECTION:${name}`);
	return output;
}

function applyRelocation(relocation, layout, outputs) {
	const sourceLayout = layoutSection(layout, relocation.sourceSection);
	const targetLayout = layoutSection(layout, relocation.targetSection);
	const output = materializedSection(outputs, relocation.sourceSection);
	const targetAddress = targetLayout.address
		+ relocation.targetOffset
		+ relocation.addend;
	const view = new DataView(
		output.bytes.buffer,
		output.bytes.byteOffset,
		output.bytes.byteLength
	);
	if (relocation.kind === "rip32") {
		const nextAddress = sourceLayout.address + relocation.sourceOffset + 4;
		const displacement = targetAddress - nextAddress;
		if (displacement < -0x80000000 || displacement > 0x7fffffff) {
			throw new Error(`IMAGE_RELOCATION_RIP32_RANGE:${displacement}`);
		}
		view.setInt32(relocation.sourceOffset, displacement, true);
		return;
	}
	if (relocation.kind === "abs64") {
		if (!Number.isSafeInteger(targetAddress) || targetAddress < 0) {
			throw new Error(`IMAGE_RELOCATION_ABS64_RANGE:${targetAddress}`);
		}
		view.setBigUint64(relocation.sourceOffset, BigInt(targetAddress), true);
		return;
	}
	throw new Error(`IMAGE_RELOCATION_KIND:${relocation.kind}`);
}
