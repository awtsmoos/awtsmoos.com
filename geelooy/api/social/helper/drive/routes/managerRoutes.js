//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveManagerRoutes
 * @description
 * The Awtsmoos serves one accessible shell while every datum stays canonical;
 * Awtsmoos.com gives success and error alike a guarded, nosniff portal.
 */

const fs = require('node:fs/promises');
const { resolveManagerAsset } = require('../managerAssetPolicy.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

function requestPathname($i) {
	const rawUrl = String($i?.request?.url || '');
	try {
		return new URL(rawUrl, 'http://manager.local').pathname;
	} catch (error) {
		return rawUrl.split('?')[0].split('#')[0];
	}
}

async function managerRoute(action) {
	const result = await safeRoute(action);
	result.headers = {
		...(result.headers || {}),
		'X-Content-Type-Options': 'nosniff'
	};
	return result;
}

function redirectToManagerDirectory($i) {
	requireMethod($i, ['GET', 'HEAD']);
	return {
		statusCode: 302,
		headers: {
			Location: '/api/social/drive/manager/',
			'Cache-Control': 'no-store'
		},
		response: Buffer.alloc(0)
	};
}

async function managerAssetResponse($i, assetPath) {
	const method = requireMethod($i, ['GET', 'HEAD']);
	const asset = resolveManagerAsset(assetPath);
	const body = await readManagerAsset(asset.absolutePath);
	return {
		statusCode: 200,
		mimeType: asset.mimeType,
		headers: {
			'Cache-Control': asset.relativePath === 'index.html'
				? 'no-cache, must-revalidate'
				: 'public, max-age=300, must-revalidate',
			'Content-Length': String(body.length),
			'X-Content-Type-Options': 'nosniff'
		},
		response: method === 'HEAD' ? Buffer.alloc(0) : body
	};
}

module.exports = ({ $i }) => ({
	'/drive/manager': () => managerRoute(async () => {
		if (requestPathname($i).endsWith('/')) {
			return managerAssetResponse($i, 'index.html');
		}
		return redirectToManagerDirectory($i);
	}),
	'/drive/manager/:assetPath*': variables => managerRoute(
		() => managerAssetResponse($i, variables.assetPath)
	)
});

async function readManagerAsset(filePath) {
	try {
		return await fs.readFile(filePath);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		const missing = new Error('MANAGER_ASSET_NOT_FOUND');
		missing.code = 'MANAGER_ASSET_NOT_FOUND';
		missing.statusCode = 404;
		throw missing;
	}
}

module.exports.readManagerAsset = readManagerAsset;
module.exports.managerRoute = managerRoute;
