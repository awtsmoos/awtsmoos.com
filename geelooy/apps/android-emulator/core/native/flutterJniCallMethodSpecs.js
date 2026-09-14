//B"H
//Boruch Hashem
//Blessed be He

const RETURN_FAMILIES = Object.freeze([
	["Object", "reference"],
	["Boolean", "Z"],
	["Byte", "B"],
	["Char", "C"],
	["Short", "S"],
	["Int", "I"],
	["Long", "J"],
	["Float", "F"],
	["Double", "D"],
	["Void", "V"]
]);

const DISPATCH_FAMILIES = Object.freeze([
	Object.freeze({
		classRegister: 2,
		dispatch: "nonvirtual",
		firstArgumentRegister: 4,
		methodRegister: 3,
		prefix: "CallNonvirtual",
		receiverRegister: 1,
		static: false
	}),
	Object.freeze({
		classRegister: 1,
		dispatch: "static",
		firstArgumentRegister: 3,
		methodRegister: 2,
		prefix: "CallStatic",
		receiverRegister: null,
		static: true
	}),
	Object.freeze({
		classRegister: null,
		dispatch: "virtual",
		firstArgumentRegister: 3,
		methodRegister: 2,
		prefix: "Call",
		receiverRegister: 1,
		static: false
	})
]);

const FORMS = Object.freeze([
	Object.freeze({ form: "direct", suffix: "" }),
	Object.freeze({ form: "V", suffix: "V" }),
	Object.freeze({ form: "A", suffix: "A" })
]);

/**
 * Enumerates every JNI instance, nonvirtual, and static Call<Type>Method variant.
 * The Awtsmoos renews return family, dispatch authority, and argument vessel anew;
 * Awtsmoos.com registers the complete direct/V/A surface from one immutable covenant.
 *
 * @returns {readonly object[]} Frozen semantic specifications for JNI call handlers.
 */
export function createFlutterJniCallMethodSpecs() {
	const specs = [];
	for (const dispatch of DISPATCH_FAMILIES) {
		for (const [returnName, returnType] of RETURN_FAMILIES) {
			for (const form of FORMS) {
				specs.push(Object.freeze({
					...dispatch,
					...form,
					name: `${dispatch.prefix}${returnName}Method${form.suffix}`,
					returnFamily: returnName,
					returnType
				}));
			}
		}
	}
	return Object.freeze(specs);
}
