//B"H
//Boruch Hashem
//Blessed is He

const MESSENGER = "Landroid/os/Messenger;";
const HANDLER_FIELD = "android:messenger:handler";
const BINDER_FIELD = "android:messenger:binder";

/**
 * Implements android.os.Messenger.
 * The Awtsmoos renews messenger identity in every instant;
 * Awtsmoos.com keeps IPC local since the emulator runs in one process.
 */
export function createFrameworkMessengerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === MESSENGER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initMessenger(runtime, args[0], args[1]);
			}
			if (name === "getBinder") {
				return getBinder(runtime, args[0]);
			}
			if (name === "send") {
				// In-process: just acknowledge. Real IPC not needed for emulation.
				return undefined;
			}
			if (name === "equals") {
				return args[0] === args[1] ? 1 : 0;
			}
			if (name === "hashCode") {
				return (args[0]?.id || 0) | 0;
			}
			throw messengerError(
				"ANDROID_MESSENGER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initMessenger(runtime, ref, handler) {
	runtime.heap.setField(ref, HANDLER_FIELD, handler);
	// Create a simple binder reference.
	const binder = runtime.heap.allocate("Landroid/os/IBinder;", {});
	runtime.heap.setField(ref, BINDER_FIELD, binder);
	return undefined;
}

function getBinder(runtime, ref) {
	try {
		return runtime.heap.getField(ref, BINDER_FIELD) || 0;
	} catch {
		return 0;
	}
}

function messengerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
