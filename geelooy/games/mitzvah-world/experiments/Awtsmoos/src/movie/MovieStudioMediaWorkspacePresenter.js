// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspacePresenter.js
 * @description Paints deterministic media results, folders, saved searches, tracks, and source state.
 * The Awtsmoos knows every asset before the list appears; Awtsmoos.com renders text-only
 * identities and native previews so no imported metadata becomes executable atmosphere.
 */

import { listMovieMediaFolders, searchMovieMedia } from './MovieMediaSearch.js';
import { normalizeMovieMediaWorkspace } from './MovieMediaWorkspaceContract.js';
import { paintMovieStudioMediaPreview } from './MovieStudioMediaPreview.js';

export function paintMovieStudioMediaWorkspace(view, project, filter = {}) {
	const workspace = normalizeMovieMediaWorkspace(project.mediaWorkspace, project.media);
	const selected = (project.media || []).find(item => item.id === workspace.source.mediaId) || null;
	paintFilters(view, project, filter);
	paintSavedSearches(view, workspace.savedSearches);
	paintMediaList(view, searchMovieMedia(project, filter.query, filter), selected);
	paintSource(view, project, workspace.source, selected);
	return workspace;
}

function paintFilters(view, project, filter) {
	view.query.value = String(filter.query || '');
	view.kind.value = String(filter.kind || '');
	view.recursive.checked = Boolean(filter.recursive);
	replaceOptions(view.folder, [
		['', 'All folders'],
		...listMovieMediaFolders(project).filter(Boolean).map(folder => [folder, folder])
	], String(filter.folder || ''));
}

function paintSavedSearches(view, searches) {
	const selected = view.saved.value;
	replaceOptions(view.saved, [
		['', 'Choose saved search'],
		...searches.map(search => [search.id, search.label])
	], selected);
}

function paintMediaList(view, items, selected) {
	const documentValue = view.scope.ownerDocument;
	const nodes = items.map(item => {
		const button = documentValue.createElement('button');
		button.className = 'movie-media-workspace-item';
		button.dataset.mediaId = item.id;
		button.setAttribute('role', 'option');
		button.setAttribute('aria-selected', String(item.id === selected?.id));
		const label = documentValue.createElement('strong');
		label.textContent = item.label;
		const detail = documentValue.createElement('small');
		detail.textContent = mediaDetail(item);
		button.append(label, detail);
		return button;
	});
	if (!nodes.length) {
		const empty = documentValue.createElement('p');
		empty.className = 'movie-utility-empty';
		empty.textContent = 'No media matches this bin search.';
		nodes.push(empty);
	}
	view.list.replaceChildren(...nodes);
	view.status.textContent = `${items.length} media assets shown.`;
}

function paintSource(view, project, source, media) {
	view.sourceLabel.textContent = media?.label || 'No source selected';
	view.inPoint.value = String(source.inPoint);
	view.outPoint.value = String(source.outPoint);
	view.range.textContent = `In ${seconds(source.inPoint)} · Out ${seconds(source.outPoint)}`;
	view.duration.disabled = media?.kind !== 'image';
	paintMovieStudioMediaPreview(view, media, source.inPoint);
	const expectedType = media?.kind === 'audio' ? 'audio' : 'video';
	const tracks = (project.tracks || []).filter(track => track.type === expectedType);
	replaceOptions(view.track, [
		['', `Automatic ${expectedType} track`],
		...tracks.map(track => [track.id, track.label || track.id])
	], view.track.value);
}

function replaceOptions(select, options, selected) {
	const documentValue = select.ownerDocument;
	select.replaceChildren(...options.map(([value, label]) => {
		const option = documentValue.createElement('option');
		option.value = value;
		option.textContent = label;
		return option;
	}));
	select.value = options.some(([value]) => value === selected) ? selected : '';
}

function mediaDetail(item) {
	return [item.kind, item.folder || 'Root', item.status, seconds(item.duration)].join(' · ');
}

function seconds(value) {
	return `${Number(value || 0).toFixed(3)}s`;
}
