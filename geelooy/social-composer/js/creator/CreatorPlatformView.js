//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorPlatformView
 * @description
 * The Awtsmoos lets social context and distribution law rest behind one second disclosure;
 * Awtsmoos.com keeps Facebook-like expression and upload-era controls available without flooding the primary writing canvas.
 */
export class CreatorPlatformView {
	constructor(root = document) {
		this.root = root;
	}

	mount() {
		const metadata = this.root.querySelector('.creatorMetadata');
		if (!metadata || this.root.querySelector('.creatorPlatform')) return null;
		this.panel = this.root.createElement('details');
		this.panel.className = 'creatorPlatform';
		this.panel.innerHTML = [
			'<summary><strong>Audience & distribution</strong><span>Mood · music · poll · audience · upload settings</span></summary>',
			'<div class="creatorPlatformGrid">',
			this.text('social.mood', 'Mood', 'Inspired'),
			this.text('social.activity', 'Activity', 'Studying'),
			this.text('social.music.title', 'Music title', 'Track title'),
			this.text('social.music.artist', 'Music artist', 'Artist'),
			this.text('social.music.url', 'Music URL', 'https://…', 'url'),
			this.text('social.audienceLabels', 'Audience labels', 'students, community'),
			this.text('social.contentWarnings', 'Content warnings', 'flashing lights'),
			this.area('social.poll.options', 'Poll options', 'Option one&#10;Option two'),
			this.checkbox('social.poll.multiple', 'Allow multiple poll choices'),
			this.text('social.poll.endsAt', 'Poll ends', '', 'datetime-local'),
			this.text('distribution.category', 'Category', 'Education'),
			this.audience(),
			this.text('distribution.recordingDate', 'Recording date', '', 'date'),
			this.checkbox('distribution.allowEmbedding', 'Allow embedding'),
			this.checkbox('distribution.allowRemix', 'Allow remix / derivatives'),
			this.checkbox('distribution.paidPromotion', 'Paid promotion disclosure'),
			this.checkbox('distribution.alteredMediaDisclosure', 'Altered / synthetic media disclosure'),
			'<p class="creatorPlatformNote">Audience and disclosure fields are saved metadata; creators remain responsible for policy and legal classification.</p>',
			'</div>'
		].join('');
		metadata.after(this.panel);
		return this.panel;
	}

	text(path, label, placeholder, type = 'text') {
		return `<label>${label}<input type="${type}" data-platform-meta="${path}" placeholder="${placeholder}"></label>`;
	}

	area(path, label, placeholder) {
		return `<label class="creatorPlatformWide">${label}<textarea rows="4" data-platform-meta="${path}" placeholder="${placeholder}"></textarea></label>`;
	}

	checkbox(path, label) {
		return `<label class="creatorPlatformCheck"><input type="checkbox" data-platform-meta="${path}"><span>${label}</span></label>`;
	}

	audience() {
		return [
			'<label>Audience class<select data-platform-meta="distribution.audienceClass">',
			'<option value="general">General</option>',
			'<option value="children">Children</option>',
			'<option value="mature">Mature</option>',
			'</select></label>'
		].join('');
	}

	fields() {
		return [...this.panel?.querySelectorAll('[data-platform-meta]') || []];
	}
}
