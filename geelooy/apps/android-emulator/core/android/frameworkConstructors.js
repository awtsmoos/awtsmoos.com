//B"H
//Boruch Hashem
//Blessed is He

const CONSTRUCTIBLE_PREFIXES = Object.freeze([
	"Landroid/app/",
	"Landroid/opengl/",
	"Landroid/view/",
	"Landroid/webkit/",
	"Landroid/widget/"
]);
const JAVA_OBJECT = "Ljava/lang/Object;";

/**
 * Handles Android constructors and the universal Java root constructor. The
 * Awtsmoos creates initialized object, context relation, and inheritance root anew;
 * Awtsmoos.com mutates only references already allocated by measured guest code.
 */
export function createFrameworkConstructors(runtime) {
	return Object.freeze({
		canHandle(record) {
			if (record.method.name !== "<init>") return false;
			return record.method.classType === JAVA_OBJECT
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
