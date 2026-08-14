//B"H
// Boruch Hashem
// Blessed is He

import { driveState } from './state.js';

/**
 * @module DriveApiTransport
 * @description
 * The Awtsmoos gives every Drive request one guarded mouth and no secret memory;
 * Awtsmoos.com sends session or explicit credential authority only across the canonical API boundary.
 */

export const API_ROOT = '/api/social';

export async function request(route, options = {}) {
	assertConnected();
	const headers = authenticationHeaders();
	let body;
	if (options.body) {
		headers.set('content-type', 'application/x-www-form-urlencoded');
		body = new URLSearchParams(normalizeBody(options.body));
	}
	headers.set('x-request-id', crypto.randomUUID());
	const response = await fetch(`${API_ROOT}${route}`, {
		method: options.method || 'GET',
		headers,
		body,
		cache: 'no-store',
		credentials: 'same-origin'
	});
	const text = await response.text();
	const value = text ? safeJson(text) : {};
	if (!response.ok) throw apiError(response.status, value);
	return value;
}

export function authenticationHeaders() {
	const headers = new Headers();
	if (driveState.credentialType === 'user') {
		headers.set('x-awtsmoos-api-key', driveState.credential);
	}
	if (driveState.credentialType === 'drive') {
		headers.set('authorization', `Bearer ${driveState.credential}`);
	}
	return headers;
}

export function assertConnected() {
	if (!driveState.aliasId) throw new Error('Enter an alias ID first.');
	if (driveState.credentialType !== 'session' && !driveState.credential) {
		throw new Error('Enter the selected credential or use the current session.');
	}
}

export function aliasSegment() {
	return encodeURIComponent(driveState.aliasId);
}

function normalizeBody(values) {
	return Object.fromEntries(
		Object.entries(values)
			.filter(([, value]) => value !== undefined && value !== null)
			.map(([key, value]) => [key, String(value)])
	);
}

function safeJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return { message: text };
	}
}

function apiError(status, value) {
	const code = value?.error?.code || value?.code || `HTTP_${status}`;
	const error = new Error(value?.error?.message || value?.message || code);
	error.code = code;
	error.status = status;
	return error;
}
