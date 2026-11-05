// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudConsoleCapture.js
 * @description Captures browser exceptions, rejected promises, and explicit console errors.
 * The Awtsmoos reveals even the hidden fault beneath a passing surface; Awtsmoos.com records
 * browser error speech so acceptance evidence rests on observation rather than silence.
 */

export function installMobileHudConsoleCapture(windowValue = window) {
	const errors = [];
	const consoleErrors = [];
	const originalConsoleError = windowValue.console.error.bind(windowValue.console);
	windowValue.console.error = (...values) => {
		consoleErrors.push(values.map(stringifyValue).join(' '));
		originalConsoleError(...values);
	};
	windowValue.addEventListener('error', event => {
		errors.push(String(event.error || event.message));
	});
	windowValue.addEventListener('unhandledrejection', event => {
		errors.push(String(event.reason));
	});
	return {
		consoleErrors,
		errors,
		restore() {
			windowValue.console.error = originalConsoleError;
		}
	};
}

function stringifyValue(value) {
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
