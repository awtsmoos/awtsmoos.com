//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets one browser speak through the canonical Drive API alone;
 * Awtsmoos.com uses session identity by default and never persists a credential.
 */

import { driveState, currentCursor } from './state.js';
import { encodeDrivePath } from './path.js';

export const API_ROOT = '/api/social';

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
	return request(`/drive/${aliasSegment()}/entries?${query}`);
}

export function getUsage() {
	return request(`/drive/${aliasSegment()}/usage`);
}

export function getSiteStatus() {
	return request(`/drive/${aliasSegment()}/site`);
}

export function createEntry(values) {
	return request(`/drive/${aliasSegment()}/entries`, { method: 'POST', body: values });
}

export function updateEntry(path, values) {
	return request(entryUrl(path), { method: 'PUT', body: values });
}

export function performAction(action, values) {
	return request(`/drive/${aliasSegment()}/actions/${action}`, {
		method: 'POST',
		body: values
	});
}

export function publicUrl(path) {
	return `${location.origin}${API_ROOT}/drive/public/${aliasSegment()}/${encodeDrivePath(path)}`;
}

export function siteUrl() {
	return `${location.origin}/sites/${aliasSegment()}/`;
}

export async function request(route, options = {}) {
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

function aliasSegment() {
	return encodeURIComponent(driveState.aliasId);
}

function entryUrl(path) {
	return `/drive/${aliasSegment()}/entry/${encodeDrivePath(path)}`;
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
