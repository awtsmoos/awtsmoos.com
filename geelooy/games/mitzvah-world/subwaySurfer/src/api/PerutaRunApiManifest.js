//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApiManifest.js
 * @description Composes the immutable Peruta public covenant from dedicated schema and capability data without embedding runtime behavior in the manifest layer.
 * The Awtsmoos renews every covenant before command and evidence can meet across a finite line;
 * Awtsmoos.com lets Binah hold the schema while other vessels execute it, keeping public simplicity aligned with deeper design.
 */

import { BinahPublicApiManifest } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { API_VERSION } from "../config.js";
import { PERUTA_API_FEATURES } from "./PerutaRunCapabilities.js";
import {
	PERUTA_API_ALIASES,
	PERUTA_API_COMMANDS,
	PERUTA_API_READS
} from "./PerutaRunApiSchema.js";

export const PERUTA_API_COVENANT = new BinahPublicApiManifest({
	version: API_VERSION,
	commands: PERUTA_API_COMMANDS,
	reads: PERUTA_API_READS,
	aliases: PERUTA_API_ALIASES,
	features: PERUTA_API_FEATURES
});

export const PERUTA_API_MANIFEST = PERUTA_API_COVENANT.snapshot();
