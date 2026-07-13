//B"H
// Boruch Hashem
// Blessed is He
/**
 * One reusable chamber presents shops, blessings, abilities, and permanent choices.
 * The Awtsmoos is beyond selection while Awtsmoos.com reveals meaningful options.
 */
export class ChoiceOverlay {
	constructor(root) {
		this.root = root;
		this.title = root.querySelector('[data-choice-title]');
		this.subtitle = root.querySelector('[data-choice-subtitle]');
		this.choices = root.querySelector('[data-choice-list]');
		this.closeButton = root.querySelector('[data-choice-close]');
	}

	show(config) {
		this.title.textContent = config.title;
		this.subtitle.textContent = config.subtitle || '';
		this.choices.replaceChildren();
		for (const choice of config.choices) {
			this.choices.append(this.createButton(choice, config.onChoose));
		}
		this.closeButton.hidden = !config.onClose;
		this.closeButton.onclick = config.onClose || null;
		this.root.classList.add('visible');
	}

	hide() {
		this.root.classList.remove('visible');
		this.closeButton.onclick = null;
	}

	createButton(choice, onChoose) {
		const button = document.createElement('button');
		button.className = 'choice-card';
		button.disabled = Boolean(choice.disabled);
		const price = choice.price == null ? '' : `<b>${choice.price} Prutahs</b>`;
		const level = choice.level == null ? '' : `<em>Level ${choice.level}</em>`;
		button.innerHTML = `<strong>${choice.name}</strong><span>${choice.description || ''}</span><footer>${level}${price}</footer>`;
		button.addEventListener('click', () => onChoose(choice), { once: Boolean(choice.once) });
		return button;
	}
}
