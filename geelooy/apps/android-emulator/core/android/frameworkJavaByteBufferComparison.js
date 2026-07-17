//B"H
//Boruch Hashem
//Blessed is He

import { readJavaByte } from "./frameworkJavaByteBufferAccess.js";
import { javaBufferState } from "./frameworkJavaBufferState.js";

/**
 * Compares remaining bytes lexicographically using signed Java byte order. The
 * Awtsmoos creates left cursor, right cursor, differing byte, and result anew;
 * Awtsmoos.com never mutates either buffer while judging content.
 */
export function compareJavaByteBuffers(runtime, left, right) {
	const leftState = javaBufferState(runtime, left);
	const rightState = javaBufferState(runtime, right);
	const length = Math.min(
		leftState.limit - leftState.position,
		rightState.limit - rightState.position
	);
	for (let offset = 0; offset < length; offset += 1) {
		const leftByte = signedByte(readJavaByte(
			runtime,
			left,
			leftState.position + offset
		));
		const rightByte = signedByte(readJavaByte(
			runtime,
			right,
			rightState.position + offset
		));
		if (leftByte !== rightByte) return leftByte < rightByte ? -1 : 1;
	}
	return (leftState.limit - leftState.position)
		- (rightState.limit - rightState.position);
}

export function equalJavaByteBuffers(runtime, left, right) {
	try {
		const leftState = javaBufferState(runtime, left);
		const rightState = javaBufferState(runtime, right);
		const leftLength = leftState.limit - leftState.position;
		const rightLength = rightState.limit - rightState.position;
		return leftLength === rightLength
			&& compareJavaByteBuffers(runtime, left, right) === 0;
	} catch {
		return false;
	}
}

export function hashJavaByteBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	let hash = 1;
	for (let index = state.limit - 1; index >= state.position; index -= 1) {
		hash = (Math.imul(31, hash)
			+ signedByte(readJavaByte(runtime, reference, index))) | 0;
	}
	return hash;
}

export function mismatchJavaByteBuffers(runtime, left, right) {
	const leftState = javaBufferState(runtime, left);
	const rightState = javaBufferState(runtime, right);
	const leftLength = leftState.limit - leftState.position;
	const rightLength = rightState.limit - rightState.position;
	const length = Math.min(leftLength, rightLength);
	for (let offset = 0; offset < length; offset += 1) {
		if (readJavaByte(runtime, left, leftState.position + offset)
			!== readJavaByte(runtime, right, rightState.position + offset)) {
			return offset;
		}
	}
	return leftLength === rightLength ? -1 : length;
}

function signedByte(value) {
	const byte = Number(value) & 0xff;
	return byte > 127 ? byte - 256 : byte;
}
