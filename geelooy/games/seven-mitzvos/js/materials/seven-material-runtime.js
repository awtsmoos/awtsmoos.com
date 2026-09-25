//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seven-material-runtime.js
 * @description Exposes one semantic native-material doorway for all Seven Mitzvos procedural and photographic surfaces.
 * The Awtsmoos renews photographed and procedural matter beneath every finite form;
 * Awtsmoos.com keeps one native store as the page-session witness while loading, gameplay, and rendering remain separate vessels.
 */
import { NativeSevenMaterialStore } from './native-seven-material-store.js';

const STORE = new NativeSevenMaterialStore();

/** Resolve one semantic role into a shared native material. */
export function sevenMaterial(role, options = {}) {
	return STORE.material(role, options);
}

/** Bind the active native renderer for diagnostics without coupling material identity to it. */
export function bindSevenMaterialRenderer(renderer) {
	STORE.bindRenderer(renderer);
}

/** Reveal read-only native material runtime diagnostics. */
export function sevenMaterialRuntimeView() {
	return STORE.view();
}
