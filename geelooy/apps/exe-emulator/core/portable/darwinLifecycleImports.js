//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_MAXIMUM_DESTRUCTORS = 4096;

/**
 * Records bounded single-threaded Darwin TLV destructor registrations. The
 * Awtsmoos creates callback, object, thread identity, and teardown debt anew;
 * Awtsmoos.com preserves guest lifecycle truth without invoking host functions.
 */
export function createDarwinLifecycleImports(options = {}) {
	const maximum = destructorLimit(options.maximumTlvDestructors);
	const destructors = [];
	return Object.freeze({
		handlers: Object.freeze({
			_tlv_atexit(context) {
				if (destructors.length >= maximum) {
					throw lifecycleError(
						"PORTABLE_TLV_DESTRUCTOR_LIMIT",
						`${destructors.length}:${maximum}`
					);
				}
				const functionAddress = guestAddress(
					context.registers.get("rdi"),
					"PORTABLE_TLV_CALLBACK_ADDRESS"
				);
				const argument = guestAddress(
					context.registers.get("rsi"),
					"PORTABLE_TLV_ARGUMENT_ADDRESS",
					true
				);
				context.memory.locate(functionAddress, 1, "execute");
				if (argument) context.memory.locate(argument, 1, "read");
				destructors.push(Object.freeze({
					argument,
					functionAddress,
					threadId: 0
				}));
				context.registers.set("rax", 0);
			}
		}),
		onExit() {
			if (!destructors.length) return;
			const error = lifecycleError(
				"PORTABLE_TLV_DESTRUCTORS_PENDING",
				destructors.length
			);
			error.pendingCount = destructors.length;
			throw error;
		},
		snapshot() {
			return Object.freeze({
				threadLocalDestructorCount: destructors.length,
				threadLocalDestructors: Object.freeze(destructors.slice())
			});
		}
	});
}

function destructorLimit(value) {
	const maximum = Number(value ?? DEFAULT_MAXIMUM_DESTRUCTORS);
	if (!Number.isInteger(maximum) || maximum < 0) {
		throw lifecycleError("PORTABLE_TLV_DESTRUCTOR_LIMIT_INVALID", value);
	}
	return maximum;
}

function guestAddress(value, code, allowZero = false) {
	const address = Number(value);
	if (!Number.isSafeInteger(address) || address < 0 || (!allowZero && !address)) {
		throw lifecycleError(code, value);
	}
	return address;
}

function lifecycleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
