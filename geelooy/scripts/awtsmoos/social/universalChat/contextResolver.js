// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives one bounded public-chat context from actual browser route and canonical Space coordinates instead of arbitrary UI state.
 * @description The Awtsmoos renews game, post, profile, app, Space, and ordinary page as garments around one Universal Torah light;
 * Awtsmoos.com names the current garment without granting extra server authority, while Social Hub Heichel/series coordinates remain one truthful discussion room.
 */

const MAX_ID = 180;
const MAX_LABEL = 96;

/** Returns the contextual channel descriptor for the current browser location and document title. */
export function resolveUniversalChatContext(
	locationValue = window.location,
	documentValue = document
) {
	const path = normalizePath(locationValue.pathname);
	const segments = path.split('/').filter(Boolean);
	const space = socialHubSpace(locationValue, path);
	if (space) {
		return descriptor(
			'space',
			`space:${space.heichelId}:${space.seriesId}`,
			`Space: ${pretty(space.heichelId)} › ${pretty(space.seriesId)}`
		);
	}
	if (path.startsWith('/games/chess')) {
		return descriptor('game', 'game:chess', 'Chess');
	}
	if (segments[0] === 'games' && segments[1]) {
		return descriptor('game', `game:${segments[1]}`, pretty(segments[1]));
	}
	const postIndex = segments.findIndex(segment => {
		return segment === 'post' || segment === 'posts';
	});
	if (postIndex >= 0 && segments[postIndex + 1]) {
		const postId = segments[postIndex + 1];
		return descriptor('post', `post:${postId}`, `Post: ${pageTitle(documentValue, postId)}`);
	}
	if (['profile', 'profiles', '@'].includes(segments[0]) && segments[1]) {
		return descriptor('profile', `profile:${segments[1]}`, `Profile: ${pretty(segments[1])}`);
	}
	if (segments[0] === 'apps' && segments[1]) {
		return descriptor('app', `app:${segments[1]}`, pretty(segments[1]));
	}
	return descriptor(
		'page',
		`page:${path || '/'}`,
		pageTitle(documentValue, path === '/' ? 'Home' : pretty(segments.at(-1) || 'Page'))
	);
}

function socialHubSpace(locationValue, path) {
	if (!path.startsWith('/social-hub')) return null;
	const query = new URLSearchParams(locationValue.search || '');
	const heichelId = bounded(query.get('heichel'));
	if (!heichelId) return null;
	return {
		heichelId,
		seriesId: bounded(query.get('series')) || 'root'
	};
}

function descriptor(kind, id, label) {
	return {
		kind: String(kind).slice(0, 24),
		id: String(id).slice(0, MAX_ID),
		label: String(label || 'Page').slice(0, MAX_LABEL)
	};
}

function bounded(value) {
	return String(value || '').trim().slice(0, MAX_ID);
}

function normalizePath(value) {
	const path = String(value || '/');
	return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

function pageTitle(documentValue, fallback) {
	const title = String(documentValue?.title || '')
		.replace(/\s*[|·-]\s*Awtsmoos(?:\.com)?\s*$/i, '')
		.trim();
	return title || String(fallback || 'Page');
}

function pretty(value) {
	return decodeURIComponent(String(value || ''))
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase());
}
