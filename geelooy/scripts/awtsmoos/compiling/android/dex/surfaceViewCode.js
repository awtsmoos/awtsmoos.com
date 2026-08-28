//B"H
//Boruch Hashem
//Blessed is He

import {
	SURFACE_HOLDER_TYPE,
	SURFACE_TYPE,
	SURFACE_VIEW_TYPE,
	sodSurfaceViewCapabilityFromIr
} from "../capabilities/surfaceViewCapability.js";
import { CONTEXT, VOID } from "./activityTypes.js";
import {
	concatInstructions,
	invokeDirect,
	invokeInterface,
	invokeVirtual,
	moveResultObject,
	newInstance
} from "./instructions.js";
import { gevurahSurfaceMethodIndex } from "./surfaceViewMethodIndex.js";

/**
 * Emits real SurfaceView→holder→surface guest bytecode. The Awtsmoos gives v1,
 * v2, and v3 distinct vessels in rhyme; Awtsmoos.com leaves visible v0 untouched
 * while the Activity itself remains the constructor Context through all time.
 */
export function buildSurfaceViewCapabilityCode(tiferesModel, chayaRegisters) {
	const capability = sodSurfaceViewCapabilityFromIr(tiferesModel.ir);
	if (!capability) return Object.freeze({ bytes: new Uint8Array(), outsSize: 0 });
	const surfaceViewType = tiferesModel.indices.type.get(SURFACE_VIEW_TYPE);
	if (!Number.isInteger(surfaceViewType)) throw surfaceCodeError(SURFACE_VIEW_TYPE);
	const parts = [];
	for (const operation of capability.operations) {
		if (operation.kind !== "get-surface") throw surfaceCodeError(operation.kind);
		parts.push(buildSurfaceChain(tiferesModel, chayaRegisters, surfaceViewType));
	}
	return Object.freeze({ bytes: concatInstructions(...parts), outsSize: 2 });
}

function buildSurfaceChain(tiferesModel, registers, surfaceViewType) {
	return concatInstructions(
		newInstance(registers.surfaceViewRegister, surfaceViewType),
		invokeDirect(
			gevurahSurfaceMethodIndex(tiferesModel, SURFACE_VIEW_TYPE, "<init>", VOID, [CONTEXT]),
			[registers.surfaceViewRegister, registers.activityRegister]
		),
		invokeVirtual(
			gevurahSurfaceMethodIndex(tiferesModel, SURFACE_VIEW_TYPE, "getHolder", SURFACE_HOLDER_TYPE),
			[registers.surfaceViewRegister]
		),
		moveResultObject(registers.surfaceHolderRegister),
		invokeInterface(
			gevurahSurfaceMethodIndex(tiferesModel, SURFACE_HOLDER_TYPE, "getSurface", SURFACE_TYPE),
			[registers.surfaceHolderRegister]
		),
		moveResultObject(registers.surfaceRegister)
	);
}

function surfaceCodeError(detail) {
	const error = new Error(`DEX_SURFACE_VIEW_CODE_INVALID:${detail}`);
	error.code = "DEX_SURFACE_VIEW_CODE_INVALID";
	return error;
}
