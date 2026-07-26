//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets one browser speak through the canonical Drive API alone;
 * Awtsmoos.com adds measured credentials without recreating service or throne.
 */

import { driveState, currentCursor } from './state.js';
import { encodeDrivePath } from './path.js';

const API_ROOT = '/api/social';

export async function listEntries() {
	const query = new URLSearchParams({
		path: driveState.currentPath,
		search: driveState.filters.search,
		type: driveState.filters.type,
		visibility: driveState.filters.visibility,
		includeTrash: String(driveState.filters.includeTrash),
		sort: driveState.filters.sort,
		direction: driveState.filters.direction,
		limit: '50'
	});
	const cursor = currentCursor();
	if (cursor) query.set('cursor', cursor);
	return request(`/drive/${encodeURIComponent(driveState.aliasId)}/entries?${query}`);
}

export function getUsage() {
	return request(`/drive/${encodeURIComponent(driveState.aliasId)}/usage`);
}

export function createEntry(values) {
	return request(`/drive/${encodeURIComponent(driveState.aliasId)}/entries`, {
		method: 'POST',
		body: values
	});
}

export function updateEntry(path, values) {
	return request(entryUrl(path), { method: 'PUT', body: values });
}

export function performAction(action, values) {
	return request(`/drive/${encodeURIComponent(driveState.aliasId)}/actions/${action}`, {
		method: 'POST',
		body: values
	});
}

export function publicUrl(path) {
	return `${location.origin}${API_ROOT}/drive/public/${encodeURIComponent(driveState.aliasId)}/${encodeDrivePath(path)}`;
}

async function request(route, options = {}) {
	assertConnected();
	const headers = authenticationHeaders();
	let body;
	if (options.body) {
		headers.set('content-type', 'application/x-www-form-urlencoded');
		body = new URLSearchParams(options.body);
	}
	headers.set('x-request-id', crypto.randomUUID());
	const response = await fetch(`${API_ROOT}${route}`, {
		method: options.method || 'GET',
		headers,
		body,
		cache: 'no-store'
	});
	const text = await response.text();
	const value = text ? safeJson(text) : {};
	if (!response.ok) throw apiError(response.status, value);
	return value;
}

function entryUrl(path) {
	return `/drive/${encodeURIComponent(driveState.aliasId)}/entry/${encodeDrivePath(path)}`;
}

function authenticationHeaders() {
	const headers = new Headers();
	if (driveState.credentialType === 'user') {
		headers.set('x-awtsmoos-api-key', driveState.credential);
	} else {
		headers.set('authorization', `Bearer ${driveState.credential}`);
	}
	return headers;
}

function assertConnected() {
	if (!driveState.aliasId || !driveState.credential) {
		throw new Error('Connect with an alias and credential first.');
	}
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
