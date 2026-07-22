// B"H
// Boruch Hashem
// Blessed is He
/** Particle WGSL composes coordinates, deposition, fused PIC transfer, and compatibility output. */

import { WEB_GPU_LIQUID_COORDINATES_WGSL } from "./webGpuLiquidCoordinatesWgsl.js";
import { WEB_GPU_LIQUID_DEPOSIT_WGSL } from "./webGpuLiquidDepositWgsl.js";
import { WEB_GPU_LIQUID_OUTPUT_WGSL } from "./webGpuLiquidOutputWgsl.js";
import { WEB_GPU_LIQUID_TRANSFER_WGSL } from "./webGpuLiquidTransferWgsl.js";

export const WEB_GPU_LIQUID_PARTICLE_WGSL = [
	WEB_GPU_LIQUID_COORDINATES_WGSL,
	WEB_GPU_LIQUID_DEPOSIT_WGSL,
	WEB_GPU_LIQUID_TRANSFER_WGSL,
	WEB_GPU_LIQUID_OUTPUT_WGSL
].join("\n");
