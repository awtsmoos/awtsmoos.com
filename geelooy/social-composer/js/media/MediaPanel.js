//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MediaPanel
 * @description
 * Image, audio, video, GIF, and document candidates appear with honest local,
 * uploading, failed, or durable status. Awtsmoos.com never disguises a preview as
 * a published asset while the Awtsmoos carries each file toward its native home.
 */
export class MediaPanel {
	constructor(actions) {
		this.actions = actions;
	}
	render(container, attachments, scope) {
		container.textContent = '';
		container.append(this.dropZone(scope));
		const grid = document.createElement('div');
		grid.className = 'mediaGrid';
		for (const attachment of attachments) grid.append(this.card(attachment, scope));
		container.append(grid);
	}
	dropZone(scope) {
		const label = document.createElement('label');
		label.className = 'mediaDrop';
		label.textContent = 'Add image, GIF, audio, video, or document';
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = 'image/*,audio/*,video/*,.pdf,.txt,.md';
		input.addEventListener('change', () => {
			this.actions.add(scope, input.files);
			input.value = '';
		});
		for (const eventName of ['dragenter', 'dragover']) {
			label.addEventListener(eventName, event => {
				event.preventDefault();
				label.classList.add('dragging');
			});
		}
		for (const eventName of ['dragleave', 'drop']) {
			label.addEventListener(eventName, event => {
				event.preventDefault();
				label.classList.remove('dragging');
				if (eventName === 'drop') this.actions.add(scope, event.dataTransfer.files);
			});
		}
		label.append(input);
		return label;
	}
	card(attachment, scope) {
		const article = document.createElement('article');
		article.className = `mediaCard status-${attachment.status}`;
		article.append(this.preview(attachment));
		const meta = document.createElement('div');
		meta.className = 'mediaMeta';
		const name = document.createElement('strong');
		name.textContent = attachment.name || attachment.manifest?.originalName || attachment.id;
		const status = document.createElement('span');
		status.textContent = attachment.error || attachment.status || 'attached';
		meta.append(
			name,
			status,
			this.field('Alt text', attachment.alt, value => this.actions.update(scope, attachment.id, { alt: value })),
			this.field('Caption', attachment.caption, value => this.actions.update(scope, attachment.id, { caption: value }))
		);
		const actions = document.createElement('div');
		actions.className = 'mediaActions';
		if (attachment.status !== 'uploaded') {
			actions.append(this.button('Upload', () => this.actions.upload(scope, attachment)));
		}
		actions.append(this.button('Remove', () => this.actions.remove(scope, attachment.id)));
		article.append(meta, actions);
		return article;
	}
	preview(attachment) {
		const source = attachment.publicPath || attachment.manifest?.publicPath || attachment.localUrl;
		if (attachment.type === 'image' || attachment.type === 'gif') {
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
	field(labelText, value, update) {
		const label = document.createElement('label');
		label.textContent = labelText;
		const input = document.createElement('input');
		input.value = value || '';
		input.addEventListener('input', () => update(input.value));
		label.append(input);
		return label;
	}
	button(text, action) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = text;
		button.addEventListener('click', action);
		return button;
	}
}
function mediaElement(tag, source) {
	const element = document.createElement(tag);
	element.controls = true;
	element.src = source || '';
	return element;
}
