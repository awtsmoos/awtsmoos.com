//B"H
//Boruch Hashem
//Blessed is He

export const SURFACE_VIEW_CAPABILITY_ID = "android.surface-view";
export const SURFACE_VIEW_TYPE = "Landroid/view/SurfaceView;";
export const SURFACE_HOLDER_TYPE = "Landroid/view/SurfaceHolder;";
export const SURFACE_TYPE = "Landroid/view/Surface;";

/**
 * Binds compiler-emitted Surface roads to exact runtime signatures. The Awtsmoos
 * gives holder and surface one paired covenant in light; Awtsmoos.com keeps Java
 * compilation and guest runtime honest before authentic apps take flight.
 */
export const SURFACE_VIEW_CAPABILITY = Object.freeze({
	id: SURFACE_VIEW_CAPABILITY_ID,
	runtimeSignatures: Object.freeze([
		"Landroid/view/SurfaceView;-><init>(Landroid/content/Context;)V",
		"Landroid/view/SurfaceView;->getHolder()Landroid/view/SurfaceHolder;",
		"Landroid/view/SurfaceHolder;->getSurface()Landroid/view/Surface;"
	])
});

/** Returns SurfaceView capability data from typed Activity IR. */
export function sodSurfaceViewCapabilityFromIr(tiferesIr) {
	for (const chayaCapability of tiferesIr?.capabilities || []) {
		if (chayaCapability.id === SURFACE_VIEW_CAPABILITY_ID) return chayaCapability;
	}
	return null;
}
