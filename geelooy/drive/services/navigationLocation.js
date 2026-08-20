//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser-location application for Geelooy Drive navigation.
 * @description
 * The Awtsmoos renews route and path together while Awtsmoos.com keeps back/forward interpretation outside network navigation itself;
 * one helper decides whether history asks for another device, another folder, or no motion at all.
 */

export async function applyNavigationLocation(navigator, location) {
	const snapshot = navigator.state.snapshot();
	if (location.route && location.route !== snapshot.currentRoute) {
		return navigator.selectDevice(location.route, {
			path: location.path,
			skipHistory: true
		});
	}
	if (location.path !== snapshot.currentPath) {
		return navigator.navigate(location.path, { skipHistory: true });
	}
	return true;
}
