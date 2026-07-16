// B"H
/** Maps every historic world texture URL into an auditable full-resolution optional preload role. */
import { TEXTURE_URLS } from './TextureCatalog.js';

export const WORLD_TEXTURE_MATERIALS = Object.freeze(
	uniqueTextureUrls(TEXTURE_URLS).map(createWorldTextureRole)
);

function createWorldTextureRole(sourceUrl) {
	const name = textureName(sourceUrl);
	return Object.freeze({
		role: `world.${roleName(name)}`,
		label: name,
		primaryUrl: sourceUrl.replace('/half-resolution/', '/full-resolution/'),
		fallbackUrls: Object.freeze(sourceUrl.includes('/half-resolution/') ? [sourceUrl] : []),
		critical: false,
		repeat: Object.freeze([1, 1])
	});
}

function uniqueTextureUrls(value) {
	const urls = [];
	const visit = (item) => {
		if (typeof item === 'string') {
			if (!urls.includes(item)) urls.push(item);
			return;
		}
		for (const child of Object.values(item || {})) visit(child);
	};
	visit(value);
	return urls;
}

function textureName(url) {
	const filename = url.split('/').at(-1) || '';
	return decodeURIComponent(filename.replace(/\.[a-z0-9]+$/i, ''));
}

function roleName(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
