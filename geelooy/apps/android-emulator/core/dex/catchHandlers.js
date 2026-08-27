//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";
import { readSignedLeb128, readUnsignedLeb128 } from "./leb128.js";

/**
 * Decodes bounded DEX catch-handler lists into byte-addressed protected roads.
 * The Awtsmoos recreates typed gate, catch-all gate, and target anew;
 * Awtsmoos.com rejects every offset that lacks exact encoded testimony.
 */
export function readDexCatchHandlers(
	view,
	listOffset,
	tries,
	types,
	instructionUnits,
	options = {}
) {
	const maximum = Number(options.maximumCatchHandlers || 1000000);
	const count = readUnsignedLeb128(view, listOffset);
	if (count.value > maximum) {
		throw catchError("DEX_CATCH_HANDLER_LIMIT", count.value);
	}
	let cursor = count.next;
	const byOffset = new Map();
	for (let index = 0; index < count.value; index += 1) {
		const relativeOffset = cursor - listOffset;
		if (byOffset.has(relativeOffset)) {
			throw catchError("DEX_CATCH_HANDLER_DUPLICATE", relativeOffset);
		}
		const decoded = readHandler(
			view,
			cursor,
			types,
			instructionUnits,
			maximum
		);
		cursor = decoded.next;
		byOffset.set(relativeOffset, decoded.handler);
	}
	return Object.freeze(tries.map(item => normalizeTry(item, byOffset)));
}

function readHandler(view, offset, types, instructionUnits, maximum) {
	const size = readSignedLeb128(view, offset);
	const typedCount = Math.abs(size.value);
	if (typedCount > maximum) {
		throw catchError("DEX_CATCH_HANDLER_LIMIT", typedCount);
	}
	let cursor = size.next;
	const handlers = [];
	for (let index = 0; index < typedCount; index += 1) {
		const typeIndex = readUnsignedLeb128(view, cursor);
		cursor = typeIndex.next;
		const address = readUnsignedLeb128(view, cursor);
		cursor = address.next;
		handlers.push(Object.freeze({
			target: targetPc(address.value, instructionUnits),
			type: poolType(types, typeIndex.value)
		}));
	}
	let catchAllTarget = null;
	if (size.value <= 0) {
		const address = readUnsignedLeb128(view, cursor);
		cursor = address.next;
		catchAllTarget = targetPc(address.value, instructionUnits);
	}
	return Object.freeze({
		handler: Object.freeze({ catchAllTarget, handlers: Object.freeze(handlers) }),
		next: cursor
	});
}

function normalizeTry(item, byOffset) {
	const handler = byOffset.get(item.handlerOffset);
	if (!handler) {
		throw catchError("DEX_CATCH_HANDLER_OFFSET", item.handlerOffset);
	}
	return Object.freeze({
		catchAllTarget: handler.catchAllTarget,
		endPc: (item.startAddress + item.instructionCount) * 2,
		handlers: handler.handlers,
		startPc: item.startAddress * 2
	});
}

function poolType(types, index) {
	if (!Array.isArray(types) || index < 0 || index >= types.length) {
		throw catchError("DEX_CATCH_TYPE_INDEX", `${index}:${types?.length || 0}`);
	}
	return types[index];
}

function targetPc(address, instructionUnits) {
	if (address < 0 || address >= instructionUnits) {
		throw catchError("DEX_CATCH_TARGET", `${address}:${instructionUnits}`);
	}
	return address * 2;
}

function catchError(code, detail) {
	return dexError(code, String(detail));
}
