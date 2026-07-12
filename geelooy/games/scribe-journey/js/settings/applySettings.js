// B"H

/** Applies normalized preferences through semantic attributes and CSS variables. */
export function applySettings(settings, {
	root = document.documentElement,
	body = document.body
} = {}) {
	body.dataset.haptics = String(settings.haptics);
	body.dataset.highContrast = String(settings.highContrast);
	body.dataset.joystickSensitivity = String(settings.joystickSensitivity);
	body.dataset.leftHanded = String(settings.leftHanded);
	body.dataset.reducedMotion = String(settings.reducedMotion);
	body.dataset.showCoordinates = String(settings.showCoordinates);
	body.dataset.weatherEffects = String(settings.weatherEffects);
	root.style.setProperty('--ui-scale', String(settings.uiScale));
	root.style.setProperty('--touch-scale', String(settings.touchScale));
	root.style.setProperty('--touch-opacity', String(settings.touchOpacity));
	return settings;
}
