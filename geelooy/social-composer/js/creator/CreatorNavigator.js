//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorNavigator
 * @description
 * The Awtsmoos lets a compact creator action reveal the already-existing canonical control;
 * Awtsmoos.com opens panels, media doors, and creator details rather than creating duplicate state behind the visible soul.
 */
export class CreatorNavigator {
	constructor(root = document) {
		this.root = root;
	}

	panel(name) {
		const panel = this.root.querySelector(`[data-mobile-panel="${name}"]`);
		if (!panel) return false;
		panel.open = true;
		panel.scrollIntoView({ behavior: this.behavior(), block: 'start' });
		return true;
	}

	media(kind) {
		const media = this.root.getElementById('rootMedia');
		const panel = media?.closest('details');
		if (panel) panel.open = true;
		const input = media?.querySelector(
			`[data-media-kind="${kind}"] input[type="file"]`
		);
		if (!input) return false;
		input.click();
		return true;
	}

	verses() {
		const sectionList = this.root.getElementById('sectionList');
		const panel = sectionList?.closest('details');
		if (!panel) return false;
		panel.open = true;
		panel.scrollIntoView({ behavior: this.behavior(), block: 'start' });
		return true;
	}

	metadata(fieldName = '') {
		const panel = this.root.querySelector('.creatorMetadata');
		if (!panel) return false;
		panel.open = true;
		panel.scrollIntoView({ behavior: this.behavior(), block: 'nearest' });
		const field = fieldName
			? panel.querySelector(`[data-creator-meta="${fieldName}"]`)
			: null;
		field?.focus({ preventScroll: true });
		return true;
	}

	platform(fieldName = '') {
		const panel = this.root.querySelector('.creatorPlatform');
		if (!panel) return false;
		panel.open = true;
		panel.scrollIntoView({ behavior: this.behavior(), block: 'nearest' });
		const field = fieldName
			? panel.querySelector(`[data-platform-meta="${fieldName}"]`)
			: null;
		field?.focus({ preventScroll: true });
		return true;
	}

	advanced() {
		const button = this.root.querySelector(
			'[data-composer-mode-choice="advanced"]'
		);
		button?.click();
		return Boolean(button);
	}

	preview() {
		const button = this.root.getElementById('previewButton');
		button?.click();
		return Boolean(button);
	}

	behavior() {
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 'auto'
			: 'smooth';
	}
}
