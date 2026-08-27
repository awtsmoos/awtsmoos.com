// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { ERROR_CODES } from "./constants.js";
import { UniversalApiError } from "./errors.js";
import { normalizeResource } from "./world.js";

export function createResource(context, bucket, input) {
	if (!input?.id) throw new UniversalApiError(ERROR_CODES.VALIDATION_FAILED, "Resource id is required.");
	const resources = context.document.resources[bucket];
	if (resources[input.id]) {
		throw new UniversalApiError(ERROR_CODES.RESOURCE_EXISTS, `Resource already exists: ${input.id}`);
	}
	const resource = normalizeResource(bucket, input);
	resources[input.id] = resource;
	context.created.push(`${bucket}:${input.id}`);
	return { resource, resourceId: input.id };
}

export function updateResource(context, bucket, input) {
	const resources = context.document.resources[bucket];
	const previous = resources[input.id];
	if (!previous) {
		throw new UniversalApiError(ERROR_CODES.RESOURCE_NOT_FOUND, `Resource not found: ${input.id}`, {
			resourceId: input.id
		});
	}
	const resource = normalizeResource(bucket, { ...previous, ...input }, previous);
	resources[input.id] = resource;
	context.updated.push(`${bucket}:${input.id}`);
	return { resource, resourceId: input.id };
}

export function deleteResource(context, bucket, input) {
	const resources = context.document.resources[bucket];
	if (!resources[input.id]) {
		throw new UniversalApiError(ERROR_CODES.RESOURCE_NOT_FOUND, `Resource not found: ${input.id}`);
	}
	delete resources[input.id];
	context.deleted.push(`${bucket}:${input.id}`);
	return { resourceId: input.id };
}
