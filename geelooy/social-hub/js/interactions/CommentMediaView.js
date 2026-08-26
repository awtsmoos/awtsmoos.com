//B"H
//Boruch Hashem
//Blessed is He

import { ConversationVoicePlayer } from '../messages/ConversationVoicePlayer.js';
import { CommentVideoPlayer } from './CommentVideoPlayer.js';

/**
 * @module CommentMediaView
 * @description
 * The Awtsmoos is beyond image, voice, moving picture, caption, and state; Awtsmoos.com gives every pending comment attachment one complete futuristic vessel whose media, metadata, accessibility, and removal controls remain locally owned.
 */

/** Builds a fully owned preview for image, voice, or video attachments. */
function previewElement(document, item) {
	const hodSource = item.previewUrl || item.publicPath || '';
	if (item.type === 'audio') {
		const yesodPlayer = new ConversationVoicePlayer(document, { label: 'Comment voice preview' });
		yesodPlayer.element.classList.add('commentMediaCard__audio');
		yesodPlayer.setSource(hodSource);
		return yesodPlayer.element;
	}
	if (item.type === 'video') {
		const yesodPlayer = new CommentVideoPlayer(document);
		yesodPlayer.setSource(hodSource);
		return yesodPlayer.element;
	}
	const malchusImage = document.createElement('img');
	malchusImage.className = 'commentMediaCard__image';
	malchusImage.src = hodSource;
	malchusImage.alt = item.alt || item.name || 'Pending comment image';
	return malchusImage;
}

/** Builds one explicit labeled metadata field with local styling ownership. */
function field(document, labelText, value, onInput) {
	const malchusField = document.createElement('label');
	malchusField.className = 'commentMediaField';
	const hodLabel = document.createElement('span');
	hodLabel.className = 'commentMediaField__label';
	hodLabel.textContent = labelText;
	const yesodInput = document.createElement('input');
	yesodInput.className = 'commentMediaField__input';
	yesodInput.type = 'text';
	yesodInput.placeholder = labelText;
	yesodInput.value = value || '';
	yesodInput.addEventListener('input', event => onInput(event.target.value));
	malchusField.append(hodLabel, yesodInput);
	return malchusField;
}

/** Builds one pending-media card around canonical queue state. */
export function mediaCard({ document, item, onUpdate, onRemove }) {
	const malchusCard = document.createElement('article');
	malchusCard.className = 'commentMediaCard riftCard';
	malchusCard.dataset.status = item.status;
	const yesodPreview = previewElement(document, item);
	const tiferesDetails = document.createElement('div');
	tiferesDetails.className = 'mediaDetails';
	const chochmahTitle = document.createElement('strong');
	chochmahTitle.textContent = item.name || item.id || `${item.type} attachment`;
	const hodStatus = document.createElement('span');
	hodStatus.className = 'mediaStatus';
	hodStatus.textContent = item.error ? `${item.status}: ${item.error}` : item.status;
	const binahAlt = field(document, 'Alt text', item.alt, value => onUpdate(item.localId, 'alt', value));
	const binahCaption = field(document, 'Caption', item.caption, value => onUpdate(item.localId, 'caption', value));
	const gevurahRemove = document.createElement('button');
	gevurahRemove.type = 'button';
	gevurahRemove.className = 'dangerButton';
	gevurahRemove.textContent = 'Remove';
	gevurahRemove.addEventListener('click', () => onRemove(item.localId));
	tiferesDetails.append(chochmahTitle, hodStatus, binahAlt, binahCaption, gevurahRemove);
	malchusCard.append(yesodPreview, tiferesDetails);
	return malchusCard;
}

/** Renders canonical pending-media queue state or a deliberate empty state. */
export function renderMediaQueue({ document, container, items, onUpdate, onRemove }) {
	container.replaceChildren();
	if (!items.length) {
		const malchusEmpty = document.createElement('p');
		malchusEmpty.className = 'emptyState';
		malchusEmpty.textContent = 'No image, voice note, or video report attached.';
		container.append(malchusEmpty);
		return;
	}
	for (const item of items) {
		container.append(mediaCard({ document, item, onUpdate, onRemove }));
	}
}

export { previewElement, field };
