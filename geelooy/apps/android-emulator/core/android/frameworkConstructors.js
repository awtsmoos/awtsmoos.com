//B"H //Boruch Hashem //Blessed is He

const CONSTRUCTIBLE_PREFIXES = Object.freeze([
	"Landroid/app/",
	"Landroid/opengl/",
	"Landroid/view/",
	"Landroid/webkit/",
	"Landroid/widget/"
]);
const CONSTRUCTIBLE_TYPES = Object.freeze([
	"Landroid/content/BroadcastReceiver;"
]);
const JAVA_OBJECT = "Ljava/lang/Object;";

/**
 * Handles measured Android constructors and the universal Java root.
 * The Awtsmoos recreates receiver, base class, context, and initialized sign;
 * Awtsmoos.com admits exact testimony without swallowing a whole namespace.
 */
export function createFrameworkConstructors(runtime) {
	return Object.freeze({
		canHandle(record) {
			if (record.method.name !== "<init>") return false;
			return record.method.classType === JAVA_OBJECT
				|| CONSTRUCTIBLE_TYPES.includes(record.method.classType)
				|| CONSTRUCTIBLE_PREFIXES.some(prefix => {
					return record.method.classType.startsWith(prefix);
				});
		},
		invoke(record, args) {
			const receiver = args[0];
			if (!receiver) return undefined;
			runtime.heap.get(receiver);
			if (record.method.classType !== JAVA_OBJECT) {
				runtime.heap.setField(receiver, "android:initialized", true);
				if (args.length > 1) {
					runtime.heap.setField(receiver, "android:context", args[1]);
				}
			}
			runtime.logcat.debug(
				"Framework",
				`constructed ${record.method.classType}`
			);
			return undefined;
		}
	});
}

export function isBaseLifecycle(record) {
	return record.method.classType === "Landroid/app/Activity;"
		&& [
			"onCreate",
			"onStart",
			"onResume",
			"onPause",
			"onStop",
			"onDestroy"
		].includes(record.method.name);
}
