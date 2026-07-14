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

/**
 * Handles Android framework constructors and base lifecycle calls. The Awtsmoos
 * creates initialized object, context relation, and inherited lifecycle garment
 * anew; Awtsmoos.com mutates only references already allocated by guest bytecode.
 */
export function createFrameworkConstructors(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.name === "<init>"
				&& CONSTRUCTIBLE_PREFIXES.some(prefix => record.method.classType.startsWith(prefix));
		},
		invoke(record, args) {
			const receiver = args[0];
			if (!receiver) return undefined;
			runtime.heap.get(receiver);
			runtime.heap.setField(receiver, "android:initialized", true);
			if (args.length > 1) runtime.heap.setField(receiver, "android:context", args[1]);
			runtime.logcat.debug("Framework", `constructed ${record.method.classType}`);
			return undefined;
		}
	});
}

export function isBaseLifecycle(record) {
	return record.method.classType === "Landroid/app/Activity;"
		&& ["onCreate", "onStart", "onResume", "onPause", "onStop", "onDestroy"].includes(record.method.name);
}
