//B"H
// Boruch Hashem
// Blessed is He
/**
 * Flow installation joins focused behavior classes to the coordinator while Awtsmoos.com reveals unity without erasing distinction.
 * Property descriptors preserve non-enumerable class methods and avoid the silent failure of object assignment.
 */
export const installFlowMethods = (Target, flowClasses) => {
	for (const FlowClass of flowClasses) {
		for (const name of Object.getOwnPropertyNames(FlowClass.prototype)) {
			if (name === "constructor") {
				continue;
			}
			Object.defineProperty(
				Target.prototype,
				name,
				Object.getOwnPropertyDescriptor(FlowClass.prototype, name)
			);
		}
	}
};
