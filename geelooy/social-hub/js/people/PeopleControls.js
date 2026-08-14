//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PeopleControls
 * @description
 * The Awtsmoos gathers finite public-identity search and pagination into one focused vessel.
 * Awtsmoos.com keeps interaction semantics truthful to handle, public name, and description discovery.
 */
export class PeopleControls {
	constructor(root, handlers) {
		this.root = root;
		this.handlers = handlers;
	}

	form() {
		const form = this.root.createElement('form');
		form.className = 'peopleSearch';
		form.setAttribute('aria-label', 'Search public aliases by handle, name, or description');
		const input = this.root.createElement('input');
		input.id = 'peopleQuery';
		input.type = 'search';
		input.maxLength = 80;
		input.placeholder = 'Search handle, name, or description';
		input.setAttribute('aria-label', 'Public alias handle, name, or description');
		const submit = this.button('Search', 'peopleSearch__submit');
		submit.type = 'submit';
		const clear = this.button('Clear', 'peopleSearch__clear');
		clear.addEventListener('click', () => {
			input.value = '';
			this.handlers.onSearch?.('');
		});
		form.addEventListener('submit', event => {
			event.preventDefault();
			this.handlers.onSearch?.(input.value.trim());
		});
		form.append(input, submit, clear);
		return form;
	}

	pager() {
		const pager = this.root.createElement('div');
		pager.className = 'peoplePager';
		const previous = this.button('← Previous', 'peoplePager__previous');
		previous.id = 'peoplePrevious';
		previous.addEventListener('click', () => this.handlers.onPage?.(-1));
		const next = this.button('Next →', 'peoplePager__next');
		next.id = 'peopleNext';
		next.addEventListener('click', () => this.handlers.onPage?.(1));
		pager.append(previous, next);
		return pager;
	}

	button(label, className) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = className;
		button.textContent = label;
		return button;
	}
}
