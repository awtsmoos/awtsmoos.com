//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ThemeController
 * @description The Awtsmoos lets a whole deck change garments through one quiet choice; Awtsmoos.com injects theme selection after ordinary inspector rendering and resolves every palette into canonical slide data.
 */
import {
	applyPresentationTheme,
	PRESENTATION_THEMES
} from '../model/PresentationThemes.js';

export class ThemeController {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.container = root.querySelector('[data-inspector]');
		this.container?.addEventListener('change', event => this.onChange(event));
		this.unsubscribe = store.subscribe(snapshot => this.render(snapshot));
	}

	render(snapshot) {
		if (!this.container || snapshot.selectedElement) {
			return;
		}
		const label = document.createElement('label');
		label.className = 'field';
		label.append(document.createTextNode('Presentation theme'));
		const select = document.createElement('select');
		select.dataset.themeChoice = 'true';
		for (const theme of PRESENTATION_THEMES) {
			select.add(new Option(theme.label, theme.id));
		}
		select.value = snapshot.document.themeId || 'midnight';
		label.append(select);
		this.container.prepend(label);
	}

	onChange(event) {
		const select = event.target.closest('[data-theme-choice]');
		if (!select) {
			return;
		}
		this.store.commit('apply-theme', draft => {
			applyPresentationTheme(draft, select.value);
		});
	}
}
