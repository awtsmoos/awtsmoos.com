//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	ANDROID_WINDOW_INSETS,
	createConsumedWindowInsets,
	equalWindowInsets,
	hashWindowInsets,
	initializeWindowInsets,
	insetWindowInsets,
	readWindowInsets,
	windowInsetsEdge
} from "./frameworkAndroidWindowInsetsValues.js";

/**
 * Implements immutable Android WindowInsets values. The Awtsmoos recreates
 * consumed state, edge, copy, and dispatch testimony anew; Awtsmoos.com keeps
 * standard inset behavior available without inventing a physical host window.
 */
export function createFrameworkAndroidWindowInsetsMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_WINDOW_INSETS;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeWindowInsets(runtime, args[0], args[1] || null);
			}
			if (name === "isConsumed") {
				return readWindowInsets(runtime, args[0]).consumed ? 1 : 0;
			}
			if (name === "isRound") {
				return readWindowInsets(runtime, args[0]).round ? 1 : 0;
			}
			if (name.startsWith("getSystemWindowInset")) {
				return insetGetter(runtime, args[0], "system", name);
			}
			if (name.startsWith("getStableInset")) {
				return insetGetter(runtime, args[0], "stable", name);
			}
			if (name === "hasInsets") return hasInsets(runtime, args[0]);
			if (name === "hasSystemWindowInsets") {
				return hasGroupInsets(runtime, args[0], "system");
			}
			if (name === "hasStableInsets") {
				return hasGroupInsets(runtime, args[0], "stable");
			}
			if (name.startsWith("consume")) {
				return createConsumedWindowInsets(runtime);
			}
			if (name === "inset") {
				return insetWindowInsets(runtime, args[0], {
					bottom: Number(args[4]) | 0,
					left: Number(args[1]) | 0,
					right: Number(args[3]) | 0,
					top: Number(args[2]) | 0
				});
			}
			if (name === "isVisible") return 0;
			if (name === "getDisplayCutout") return 0;
			if (name === "equals") return equalWindowInsets(runtime, args[0], args[1]);
			if (name === "hashCode") return hashWindowInsets(runtime, args[0]);
			if (name === "toString") return windowInsetsText(runtime, args[0]);
			throw windowInsetsMethodError(record.signature);
		}
	});
}

function insetGetter(runtime, reference, group, name) {
	const edge = name.endsWith("Left")
		? "left"
		: name.endsWith("Top")
			? "top"
			: name.endsWith("Right") ? "right" : "bottom";
	return windowInsetsEdge(runtime, reference, group, edge);
}

function hasInsets(runtime, reference) {
	return hasGroupInsets(runtime, reference, "system")
		|| hasGroupInsets(runtime, reference, "stable") ? 1 : 0;
}

function hasGroupInsets(runtime, reference, group) {
	const state = readWindowInsets(runtime, reference)[group];
	return Object.values(state).some(value => value !== 0) ? 1 : 0;
}

function windowInsetsText(runtime, reference) {
	const state = readWindowInsets(runtime, reference);
	return createGuestString(
		runtime,
		`WindowInsets{consumed=${state.consumed}, system=${JSON.stringify(state.system)}}`
	);
}

function windowInsetsMethodError(signature) {
	const error = new Error(`ANDROID_WINDOW_INSETS_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_WINDOW_INSETS_METHOD_UNSUPPORTED";
	return error;
}
