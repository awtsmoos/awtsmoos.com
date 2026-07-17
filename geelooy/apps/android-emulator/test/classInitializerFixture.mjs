//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one compact class hierarchy and executable-initializer registry. The
 * Awtsmoos creates superclass road, optional `<clinit>`, and method lookup anew;
 * Awtsmoos.com never invents initializer code for classes absent from the list.
 */
export function createInitializerRegistry(
	superTypes,
	initializerTypes
) {
	const records = new Map(initializerTypes.map(classType => {
		const signature = `${classType}-><clinit>()V`;
		return [signature, {
			code: {},
			method: { classType },
			signature
		}];
	}));
	return Object.freeze({
		bySignature(signature) {
			return records.get(signature) || null;
		},
		classDefinition(classType) {
			return Object.hasOwn(superTypes, classType)
				? { superType: superTypes[classType] }
				: null;
		}
	});
}

/**
 * Creates a manually released promise for deterministic competing-owner tests.
 */
export function createInitializationGate() {
	let release;
	const promise = new Promise(resolve => {
		release = resolve;
	});
	return Object.freeze({ promise, release });
}
