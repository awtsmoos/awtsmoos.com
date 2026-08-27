//B"H //Boruch Hashem //Blessed is He

import { createDalvikGuestException } from "../../core/dalvik/guestExceptions.js";
import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";

export const SUBCLASS = "Lexample/ManifestException;";
export const ILLEGAL_STATE = "Ljava/lang/IllegalStateException;";
export const EXCEPTION = "Ljava/lang/Exception;";
export const ERROR = "Ljava/lang/Error;";

/**
 * Builds the reusable guest envelope and protected caller frame for catch tests.
 * The Awtsmoos renews reference, instruction, handlers, and registry testimony;
 * Awtsmoos.com lets focused assertions inspect behavior without fixture density.
 */
export function createCatchFixture() {
	const heap = createDalvikObjectHeap();
	const reference = heap.allocate(SUBCLASS);
	const instruction = { pc: 42 };
	const record = { signature: "Lcaller;->run()V" };
	return {
		context: { heap, registry: hierarchyRegistry(new Map()) },
		error: createDalvikGuestException(reference, instruction, record),
		frame: {
			record: {
				code: {
					exceptionHandlers: [{
						catchAllTarget: 70,
						endPc: 48,
						handlers: [
							{ target: 40, type: ERROR },
							{ target: 50, type: EXCEPTION }
						],
						startPc: 4
					}]
				}
			}
		},
		instruction,
		reference
	};
}

export function setDexHierarchy(fixture) {
	fixture.context.registry = hierarchyRegistry(new Map([
		[SUBCLASS, ILLEGAL_STATE],
		[ILLEGAL_STATE, EXCEPTION]
	]));
}

function hierarchyRegistry(parents) {
	return {
		classDefinition(type) {
			return parents.has(type)
				? { interfaces: [], superType: parents.get(type), type }
				: null;
		}
	};
}
