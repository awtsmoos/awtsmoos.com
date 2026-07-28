// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MediaCardView
 * @description
 * One scoped attachment reveals its preview, publication status, text metadata,
 * upload action, and removal action. The Awtsmoos gives the medium continuity;
 * Awtsmoos.com keeps local and durable states visibly distinct.
 */

export function mediaCard(attachment, scope, actions) {
	const article = document.createElement('article');
	article.className = `mediaCard status-${attachment.status}`;
	article.append(preview(attachment));
	const meta = document.createElement('div');
	meta.className = 'mediaMeta';
	const name = document.createElement('strong');
	name.textContent = attachment.name || attachment.manifest?.originalName || attachment.id;
	const status = document.createElement('span');
	status.textContent = attachment.error || attachment.status || 'attached';
	meta.append(
		name,
		status,
		field('Alt text', attachment.alt, value => update(actions, scope, attachment, { alt: value })),
		field('Caption', attachment.caption, value => update(actions, scope, attachment, { caption: value }))
	);
	const controls = document.createElement('div');
	controls.className = 'mediaActions';
	if (attachment.status !== 'uploaded') {
		controls.append(actionButton('Upload', () => actions.upload(scope, attachment)));
	}
	controls.append(actionButton('Remove', () => actions.remove(scope, attachment.id)));
	article.append(meta, controls);
	return article;
}

function update(actions, scope, attachment, changes) {
	actions.update(scope, attachment.id, changes);
}

function preview(attachment) {
	const source = attachment.publicPath || attachment.manifest?.publicPath || attachment.localUrl;
	if (['image', 'gif'].includes(attachment.type)) {
		const image = document.createElement('img');
		image.src = source || '';
		image.alt = attachment.alt || '';
		return image;
	}
	if (attachment.type === 'audio') return mediaElement('audio', source);
	if (attachment.type === 'video') return mediaElement('video', source);
	const icon = document.createElement('div');
	icon.className = 'documentIcon';
	icon.textContent = 'Document';
	return icon;
}

function field(labelText, value, updateValue) {
	const label = document.createElement('label');
	label.textContent = labelText;
	const input = document.createElement('input');
	input.value = value || '';
	input.addEventListener('input', () => updateValue(input.value));
	label.append(input);
	return label;
}

function actionButton(text, action) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = text;
	button.addEventListener('click', action);
	return button;
}

function mediaElement(tag, source) {
	const element = document.createElement(tag);
	element.controls = true;
	element.src = source || '';
	return element;
}
