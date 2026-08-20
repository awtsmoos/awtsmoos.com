//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../ui/IconCatalog.js';
import { createIconButton } from '../ui/fields/IconButton.js';
import { createSmartTextField } from '../ui/fields/SmartTextField.js';

/**
 * @class PeopleControls
 * @description
 * The Awtsmoos gathers public identity search into one clear current while Awtsmoos.com replaces naked search chrome with an icon-led, clearable field and compact directional actions;
 * the user sees people first and controls second, while keyboard semantics and exact discovery behavior remain bright beneath the vessel.
 */
export class PeopleControls {
	constructor(root, handlers) {
		this.root = root;
		this.handlers = handlers;
	}

	form() {
		const form = this.root.createElement('form');
		form.className = 'peopleSearch peopleSearch--smart';
		form.setAttribute('aria-label', 'Search public aliases');
		const field = createSmartTextField(this.root, {
			id: 'peopleQuery',
			kind: 'search',
			label: 'Search people by handle, name, or description',
			placeholder: 'Find people…',
			maxLength: 80,
			icon: hubIcon('search'),
			onClear: () => this.handlers.onSearch?.('')
		});
		const submit = createIconButton(this.root, {
			action: 'search',
			label: 'Search people',
			type: 'submit',
			className: 'peopleSearch__submit'
		});
		form.addEventListener('submit', event => {
			event.preventDefault();
			this.handlers.onSearch?.(field.value());
		});
		form.append(field.element, submit);
		return form;
	}

	pager() {
		const pager = this.root.createElement('div');
		pager.className = 'peoplePager peoplePager--icons';
		const previous = createIconButton(this.root, {
			action: 'back',
			label: 'Previous people page',
			className: 'peoplePager__previous',
			onClick: () => this.handlers.onPage?.(-1)
		});
		previous.id = 'peoplePrevious';
		const next = createIconButton(this.root, {
			icon: '→',
			label: 'Next people page',
			className: 'peoplePager__next',
			onClick: () => this.handlers.onPage?.(1)
		});
		next.id = 'peopleNext';
		pager.append(previous, next);
		return pager;
	}
}
