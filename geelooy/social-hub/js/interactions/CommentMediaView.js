//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentMediaView
 * @description
 * Pending image, voice, and video vessels render with playback, alt text, captions,
 * status, and removal. The Awtsmoos gives every medium one inward voice while
 * Awtsmoos.com keeps accessibility and upload truth beside the visible preview.
 */

function previewElement(document, item) {
	if (item.type === 'audio') {
		const audio = document.createElement('audio');
		audio.controls = true;
		audio.preload = 'metadata';
		audio.src = item.previewUrl || item.publicPath || '';
		return audio;
	}
	if (item.type === 'video') {
		const video = document.createElement('video');
		video.controls = true;
		video.preload = 'metadata';
		video.playsInline = true;
		video.src = item.previewUrl || item.publicPath || '';
		return video;
	}
	const image = document.createElement('img');
	image.src = item.previewUrl || item.publicPath || '';
	image.alt = item.alt || item.name || 'Pending comment image';
	return image;
}

function field(document, placeholder, value, onInput) {
	const input = document.createElement('input');
	input.placeholder = placeholder;
	input.value = value || '';
	input.addEventListener('input', event => onInput(event.target.value));
	return input;
}

export function mediaCard({ document, item, onUpdate, onRemove }) {
	const card = document.createElement('article');
	card.className = 'commentMediaCard riftCard';
	card.dataset.status = item.status;
	const preview = previewElement(document, item);
	const details = document.createElement('div');
	details.className = 'mediaDetails';
	const title = document.createElement('strong');
	title.textContent = item.name || item.id || `${item.type} attachment`;
	const status = document.createElement('span');
	status.className = 'mediaStatus';
	status.textContent = item.error
		? `${item.status}: ${item.error}`
		: item.status;
	const alt = field(document, 'Alt text', item.alt, value => {
		onUpdate(item.localId, 'alt', value);
	});
	const caption = field(document, 'Caption', item.caption, value => {
		onUpdate(item.localId, 'caption', value);
	});
	const remove = document.createElement('button');
	remove.type = 'button';
	remove.className = 'dangerButton';
	remove.textContent = 'Remove';
	remove.addEventListener('click', () => onRemove(item.localId));
	details.append(title, status, alt, caption, remove);
	card.append(preview, details);
	return card;
}

export function renderMediaQueue({ document, container, items, onUpdate, onRemove }) {
	container.replaceChildren();
	if (!items.length) {
		const empty = document.createElement('p');
		empty.className = 'emptyState';
		empty.textContent = 'No image, voice note, or video report attached.';
		container.append(empty);
		return;
	}
	for (const item of items) {
		container.append(mediaCard({ document, item, onUpdate, onRemove }));
	}
}

export {
	previewElement,
	field
};
