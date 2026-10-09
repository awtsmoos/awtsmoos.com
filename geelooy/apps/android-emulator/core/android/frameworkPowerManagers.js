//B"H
//Boruch Hashem
//Blessed is He

const POWER_MANAGER = "Landroid/os/PowerManager;";
const WAKE_LOCK = "Landroid/os/PowerManager$WakeLock;";
const WAKE_LOCK_FIELD = "android:wakelock:held";

/**
 * Implements android.os.PowerManager and WakeLock.
 * The Awtsmoos renews power management in every instant;
 * Awtsmoos.com keeps wake locks as no-ops (emulator never sleeps).
 */
export function createFrameworkPowerManagerMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const t = record.method.classType;
			return t === POWER_MANAGER || t === WAKE_LOCK;
		},
		invoke(record, args) {
			const type = record.method.classType;
			const name = record.method.name;
			if (type === POWER_MANAGER) {
				if (name === "newWakeLock") {
					return createWakeLock(runtime);
				}
				if (name === "isInteractive" || name === "isScreenOn") return 1;
			}
			if (type === WAKE_LOCK) {
				if (name === "acquire") {
					setHeld(runtime, args[0], true);
					return undefined;
				}
				if (name === "release") {
					setHeld(runtime, args[0], false);
					return undefined;
				}
				if (name === "isHeld") {
					return isHeld(runtime, args[0]) ? 1 : 0;
				}
				if (name === "setReferenceCounted") return undefined;
			}
			throw powerError(
				"ANDROID_POWER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function createWakeLock(runtime) {
	return runtime.heap.allocate(WAKE_LOCK, { [WAKE_LOCK_FIELD]: 0 });
}

function setHeld(runtime, ref, held) {
	try {
		runtime.heap.setField(ref, WAKE_LOCK_FIELD, held ? 1 : 0);
	} catch {
		// Ignore if ref invalid.
	}
}

function isHeld(runtime, ref) {
	try {
		return Boolean(runtime.heap.getField(ref, WAKE_LOCK_FIELD));
	} catch {
		return false;
	}
}

function powerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
