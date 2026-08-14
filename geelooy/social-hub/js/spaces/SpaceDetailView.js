//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SpaceDetailView
 * @description
 * The Awtsmoos lets one chosen channel reveal policy, descendants, creation, activity, review, and guarded member governance;
 * Awtsmoos.com keeps the shell small while independent readers fill public conversation and authorized institutional responsibility anew.
 */
import { createHereLink } from './SpaceActions.js';

/** Renders one canonical Heichel/series shell into the supplied region. */
export function renderSpaceDetail(document, region, detail, onOpenSeries) {
	const title = document.createElement('h3');
	title.textContent = `${detail.heichel.name} › ${detail.series.name}`;
	const policy = document.createElement('p');
	policy.className = 'spacePolicy';
	policy.textContent = detail.access?.actions?.content?.explanation
		|| 'Access policy available from the community.';
	const create = createHereLink(
		document,
		detail.heichel.heichelId,
		detail.series.seriesId
	);
	const channels = (detail.flatSeries || []).map(series => {
		return seriesButton(document, detail.heichel, series, onOpenSeries);
	});
	region?.replaceChildren(
		title,
		policy,
		create,
		channelGroup(document, channels),
		surface(document, 'spaceActivity', 'Channel activity'),
		surface(document, 'spaceReview', 'Moderator review'),
		surface(document, 'spaceMembers', 'Members and roles', true)
	);
}

function channelGroup(document, channels) {
	const group = document.createElement('div');
	group.className = 'spaceChannelTree';
	group.setAttribute('aria-label', 'Nested channels');
	group.append(...channels);
	return group;
}

function surface(document, id, label, hidden = false) {
	const section = document.createElement('section');
	section.id = id;
	section.className = 'spaceChannelSurface';
	section.setAttribute('aria-label', label);
	section.setAttribute('aria-live', 'polite');
	section.hidden = hidden;
	if (!hidden) {
		const message = document.createElement('p');
		message.className = 'spaceChannelMessage';
		message.textContent = `Loading ${label.toLowerCase()}…`;
		section.append(message);
	}
	return section;
}

function seriesButton(document, heichel, series, onOpenSeries) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'spaceChannel';
	const breadcrumb = (series.breadcrumb || [])
		.map(part => part.name)
		.join(' › ');
	button.textContent = breadcrumb || series.name || series.seriesId;
	button.addEventListener('click', () => {
		onOpenSeries(heichel.heichelId, series.seriesId);
	});
	return button;
}
