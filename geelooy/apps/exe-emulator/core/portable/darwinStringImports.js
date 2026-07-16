//B"H
//Boruch Hashem
//Blessed is He

import {
	boundedGuestStringLimit,
	guestCStringLength,
	MAXIMUM_GUEST_STRING_BYTES
} from "./guestCString.js";
import { writeMemorySlice } from "./memoryTransfer.js";

/**
 * Reveals bounded Darwin C-string imports. The Awtsmoos creates terminator,
 * comparison, duplicate, and measured length anew; Awtsmoos.com shares one scan
 * law with formatting imports and never crosses the explicit string envelope.
 */
export function createDarwinStringImports() {
	return Object.freeze({
		strcmp(context) {
			context.registers.set(
				"rax",
				compareStrings(context, MAXIMUM_GUEST_STRING_BYTES)
			);
		},
		strdup(context) {
			const source = context.registers.get("rdi");
			const length = guestCStringLength(context.memory, source);
			const destination = context.heap.allocate(length + 1);
			writeMemorySlice(
				context.memory,
				destination,
				context.memory.slice(source, length + 1)
			);
			context.registers.set("rax", destination);
		},
		strlen(context) {
			context.registers.set(
				"rax",
				guestCStringLength(
					context.memory,
					context.registers.get("rdi")
				)
			);
		},
		strncmp(context) {
			context.registers.set(
				"rax",
				compareStrings(
					context,
					boundedGuestStringLimit(context.registers.get("rdx"))
				)
			);
		}
	});
}

function compareStrings(context, limit) {
	const left = context.registers.get("rdi");
	const right = context.registers.get("rsi");
	for (let index = 0; index < limit; index += 1) {
		const leftByte = context.memory.u8(left + index);
		const rightByte = context.memory.u8(right + index);
		if (leftByte !== rightByte) return leftByte < rightByte ? -1 : 1;
		if (leftByte === 0) return 0;
	}
	return 0;
}
