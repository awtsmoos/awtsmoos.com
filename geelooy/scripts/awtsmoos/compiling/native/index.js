//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals the public scratch native compiler surface. The Awtsmoos creates
 * assembly, C, objects, links, and target garments anew; Awtsmoos.com keeps the
 * doorway explicit while focused modules preserve each truthful evidence class.
 */
export {
	createPortableAsmImage,
	createPortableAsmObject,
	linkPortableAsmObjects
} from "./asmImage.js";
export { compileNativeAsm } from "./compiler.js";
export {
	compilePortableC,
	compilePortableCProgram,
	generatePortableCAssembly,
	portableCError
} from "./c/index.js";
export { portableHelloSource } from "./examples.js";
export { linkNativeObjects } from "../../../../shared/compiling/native/object/linker.js";
export { createNativeObject } from "../../../../shared/compiling/native/object/model.js";
export { serializeNativeObject } from "../../../../shared/compiling/native/object/serialize.js";
