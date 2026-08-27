//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveEntryRoutes
 * @description
 * The Awtsmoos gives owners and measured service agents one canonical doorway.
 * Awtsmoos.com requires every compound operation to carry every needed scope.
 */

const { requireDriveActor } = require('../authorization.js');
const { createDriveFolder } = require('../folderService.js');
const { writeDriveFile } = require('../writeService.js');
const { listDriveEntries, getDriveEntry } = require('../queryService.js');
const { updateDriveMetadata } = require('../metadataService.js');
const { trashDriveEntry } = require('../trashService.js');
const { buildPrivatePathResponse } = require('../privateResponse.js');
const { getDriveUsage } = require('../usageService.js');
const { bodyFor, contentFromBody, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/entries': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		const body = method === 'POST' ? bodyFor($i) : {};
		const scope = method === 'GET' ? 'drive.read' : creationScopes(body);
		const actor = await actorFor(variables.aliasId, scope, $i, userid);
		if (method === 'GET') return listEntries(variables.aliasId, $i);
		const common = operationOptions(actor, variables.aliasId, body.path, $i);
		if (body.type === 'folder') {
			return createDriveFolder({ ...common, visibility: body.visibility });
		}
		return writeDriveFile({
			...common,
			content: contentFromBody(body),
			mime: body.mime,
			visibility: body.visibility,
			cachePolicy: body.cachePolicy
		});
	}),
	'/drive/:aliasId/entry/:path*': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'HEAD', 'PUT', 'DELETE']);
		const body = method === 'PUT' ? bodyFor($i) : {};
		const actor = await actorFor(
			variables.aliasId,
			entryScopes(method, body),
			$i,
			userid
		);
		if (method === 'GET' || method === 'HEAD') {
			return readEntry(variables.aliasId, variables.path, method, $i);
		}
		if (method === 'DELETE') {
			return trashDriveEntry(operationOptions(actor, variables.aliasId, variables.path, $i));
		}
		if (hasContent(body)) {
			return writeDriveFile({
				...operationOptions(actor, variables.aliasId, variables.path, $i),
				content: contentFromBody(body),
				mime: body.mime,
				visibility: body.visibility,
				cachePolicy: body.cachePolicy
			});
		}
		return updateDriveMetadata({
			...operationOptions(actor, variables.aliasId, variables.path, $i),
			visibility: body.visibility,
			cachePolicy: body.cachePolicy
		});
	}),
	'/drive/:aliasId/usage': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await actorFor(variables.aliasId, 'drive.read', $i, userid);
		return getDriveUsage(variables.aliasId, $i);
	})
});

async function actorFor(aliasId, requiredScope, $i, userid) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: requestId($i),
		$i,
		userid
	});
}

function listEntries(aliasId, $i) {
	return listDriveEntries({
		aliasId,
		$i,
		parent: $i.$_GET.path,
		search: $i.$_GET.search,
		type: $i.$_GET.type,
		visibility: $i.$_GET.visibility,
		includeTrash: truthy($i.$_GET.includeTrash),
		recursive: truthy($i.$_GET.recursive),
		sort: $i.$_GET.sort,
		direction: $i.$_GET.direction,
		limit: $i.$_GET.limit,
		cursor: $i.$_GET.cursor
	});
}

async function readEntry(aliasId, path, method, $i) {
	if (method === 'HEAD' || truthy($i.$_GET.content)) {
		return buildPrivatePathResponse({
			aliasId,
			path,
			method,
			headers: $i.request.headers,
			$i
		});
	}
	const entry = await getDriveEntry({ aliasId, path, $i });
	if (!entry) throw routeError('ENTRY_NOT_FOUND');
	return { entry };
}

function operationOptions(actor, aliasId, path, $i) {
	return {
		aliasId,
		path,
		actorUserId: actor.actorUserId,
		credentialId: actor.credentialId,
		requestId: requestId($i),
		$i
	};
}

function creationScopes(body) {
	const scopes = ['drive.write'];
	if (body.visibility !== undefined || body.cachePolicy !== undefined) scopes.push('drive.public');
	return scopes;
}

function entryScopes(method, body) {
	if (method === 'GET' || method === 'HEAD') return 'drive.read';
	if (method === 'DELETE') return 'drive.delete';
	if (hasContent(body)) return creationScopes(body);
	return body.visibility !== undefined || body.cachePolicy !== undefined
		? 'drive.public'
		: 'drive.write';
}

function hasContent(body) {
	return ['content', 'contentBase64', 'text', 'json'].some(key => body[key] !== undefined);
}

function truthy(value) {
	return value === true || value === 'true' || value === '1';
}

function requestId($i) {
	return $i.request.headers?.['x-request-id'] || null;
}

function routeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
