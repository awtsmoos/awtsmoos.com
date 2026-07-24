// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardMenuActions
 * @description
 * The Awtsmoos creates every secondary intention without crowding the card face.
 * Awtsmoos.com builds verified follow, guarded bookmark, share, comments, manage,
 * and open actions as small plans consumed by one menu shell.
 */

import { showContextMenu } from '../../contextmenu.js';
import { renderSidebarComments } from '../../sidebar-comments.js';
import { notify } from '../toast.js';
import { toggleFollow } from '../../../living-path/follow-service.js';
import { createStorageGateway } from '../../../living-path/storage-gateway.js';

const storage = createStorageGateway();
const BOOKMARK_KEY = 'BH_GELOOY_BOOKMARKS';

export function openAction(data, item, navigator, appState, close) {
	return action('Open', event => {
		stop(event);
		close();
		if (['series', 'grouping'].includes(data.type)) navigator.navigateTo(data.id);
		else location.href = postHref(data, item, appState);
	});
}

export function followAction(data, appState, close) {
	if (data.type !== 'series') return null;
	return action('Follow / Unfollow', async event => {
		stop(event);
		try {
			const target = `${appState.heichelId}/${data.id}`;
			const active = await toggleFollow(window.curAlias, 'series', target);
			notify(active ? 'Series followed.' : 'Series unfollowed.', 'success');
		} catch (error) {
			notify(error.message, 'error');
		}
		close();
	});
}

export function bookmarkAction(data, item, appState, close) {
	return action('Bookmark', event => {
		stop(event);
		const current = storage.read(BOOKMARK_KEY, []);
		const records = Array.isArray(current) ? current : [];
		records.unshift({
			id: data.id,
			type: data.type,
			title: data.title,
			href: ['series', 'grouping'].includes(data.type)
				? `${location.pathname}?view=series&series=${encodeURIComponent(data.id)}`
				: postHref(data, item, appState),
			savedAt: Date.now()
		});
		const written = storage.write(BOOKMARK_KEY, records.slice(0, 120));
		notify(written ? 'Bookmark saved.' : 'Bookmark could not be saved.', written ? 'success' : 'error');
		close();
	});
}

export function shareAction(data, navigator, appState, close) {
	return action('Copy path', event => {
		stop(event);
		navigator.handleShareClick({ id: data.id, type: data.type, parentId: appState.currentSeries });
		close();
	});
}

export function commentsAction(data, appState, close) {
	if (data.type !== 'post') return null;
	return action('Show comments', async event => {
		stop(event);
		close();
		await renderSidebarComments({
			heichelId: appState.heichelId,
			postId: data.id,
			title: data.title,
			seriesId: appState.currentSeries || 'root'
		});
	});
}

export function manageAction(data, navigator, appState, close) {
	if (!appState.ownsIt) return null;
	return action('Manage', event => {
		stop(event);
		close();
		showContextMenu(event.currentTarget, {
			id: data.id,
			type: data.type,
			parentId: appState.currentSeries,
			title: data.title,
			description: data.description
		}, navigator);
	});
}

function action(label, handler) {
	return {
		tag: 'button',
		attr: { type: 'button', class: 'card-menu-action', role: 'menuitem' },
		children: [label],
		events: { click: handler }
	};
}

function postHref(data, item, appState) {
	const key = item.indexInSeries !== undefined ? item.indexInSeries : data.id;
	return `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${key}`;
}

function stop(event) {
	event.preventDefault();
	event.stopPropagation();
}
