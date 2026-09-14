//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file index.js
 * @description Public initializer for optional external-library-free native 3D presentation.
 * The shared Games runtime calls this once; unsupported routes remain untouched.
 */
import { supportsOptionalNative3D } from './catalog.js';
import { Native3DModeController } from './Native3DModeController.js';

let controller = null;

/** Install the presentation option exactly once for supported Games routes. */
export function installOptionalNative3DMode(documentObject = document) {
	if (!supportsOptionalNative3D() || controller) {
		return controller;
	}
	controller = new Native3DModeController(documentObject).mount();
	return controller;
}
