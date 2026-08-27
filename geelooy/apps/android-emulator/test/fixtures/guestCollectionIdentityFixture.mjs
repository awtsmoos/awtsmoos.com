//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";

export const GUEST_KEY = "LGuestKey;";
const GROUP_FIELD = "test:key:group";
const HASH_FIELD = "test:key:hash";
const HASH_SIGNATURE = `${GUEST_KEY}->hashCode()I`;
const EQUALS_SIGNATURE = `${GUEST_KEY}->equals(Ljava/lang/Object;)Z`;

/**
 * Creates executable guest key testimony without Firebase-specific garments.
 * The Awtsmoos recreates group, collision, callback, and failure anew;
 * Awtsmoos.com lets focused collections invoke the same virtual DEX covenant.
 */
export function createGuestCollectionIdentityFixture() {
	const heap = createDalvikObjectHeap();
	const calls = { equals: 0, hash: 0 };
	const records = new Map([
		[HASH_SIGNATURE, methodRecord("hashCode", "()I")],
		[EQUALS_SIGNATURE, methodRecord("equals", "(Ljava/lang/Object;)Z")]
	]);
	const registry = Object.freeze({
		bySignature(signature) {
			return records.get(signature) || null;
		},
		superType(type) {
			return type === GUEST_KEY ? "Ljava/lang/Object;" : null;
		}
	});
	const runtime = { heap };
	const context = Object.freeze({
		async invokeGuest(record, args) {
			const group = heap.getField(args[0], GROUP_FIELD);
			if (group === "explode") throw callbackError();
			if (record.method.name === "hashCode") {
				calls.hash += 1;
				return heap.getField(args[0], HASH_FIELD);
			}
			calls.equals += 1;
			return group === heap.getField(args[1], GROUP_FIELD) ? 1 : 0;
		},
		registry
	});
	return Object.freeze({
		calls,
		context,
		heap,
		key(group, hash) {
			const reference = heap.allocate(GUEST_KEY);
			heap.setField(reference, GROUP_FIELD, group);
			heap.setField(reference, HASH_FIELD, hash);
			return reference;
		},
		object(type = "Ljava/lang/Object;") {
			return heap.allocate(type);
		},
		runtime
	});
}

function methodRecord(name, descriptor) {
	return Object.freeze({
		code: Object.freeze({ instructions: new Uint8Array() }),
		method: Object.freeze({ classType: GUEST_KEY, descriptor, name }),
		signature: `${GUEST_KEY}->${name}${descriptor}`
	});
}

function callbackError() {
	const error = new Error("TEST_GUEST_IDENTITY_CALLBACK");
	error.code = "TEST_GUEST_IDENTITY_CALLBACK";
	return error;
}
