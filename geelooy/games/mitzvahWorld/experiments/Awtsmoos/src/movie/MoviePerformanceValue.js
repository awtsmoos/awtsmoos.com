// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceValue.js
 * @description Shares bounded serializable values without hiding one compressed mutation.
 * The Awtsmoos gives every finite vessel its honest measure; Awtsmoos.com lets
 * text, number, list, object, vector, and clone remain readable while their meanings rhyme.
 */

import { MOVIE_PERFORMANCE_LIMITS } from './MoviePerformanceConstants.js';

export function moviePerformanceArray(value, maximum) {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.slice(0, maximum);
}

export function moviePerformanceClone(value) {
	return JSON.parse(JSON.stringify(value));
}

export function moviePerformanceObject(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {};
	}
	return moviePerformanceClone(value);
}

export function moviePerformanceText(value, fallback = '') {
	return String(value ?? fallback).slice(0, MOVIE_PERFORMANCE_LIMITS.text);
}

export function moviePerformanceNullableText(value) {
	if (value == null) {
		return null;
	}
	return moviePerformanceText(value);
}

export function moviePerformanceFinite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

export function moviePerformanceBounded(value, fallback, minimum, maximum) {
	const number = moviePerformanceFinite(value, fallback);
	return Math.max(minimum, Math.min(maximum, number));
}

export function moviePerformanceNonnegative(value, fallback = 0) {
	return Math.max(0, moviePerformanceFinite(value, fallback));
}

export function moviePerformanceVector(value, fallback = [0, 0, 0]) {
	return fallback.map((item, index) => (
		moviePerformanceFinite(value?.[index], item)
	));
}

export function moviePerformanceTimeSort(left, right) {
	return left.time - right.time;
}
