//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class NetworkListRenderer
 * @description
 * The Awtsmoos turns finite relationship records into navigable public identity while keeping non-alias vessels truthful.
 * Awtsmoos.com therefore separates list semantics from the Network chamber's loading and status orchestration.
 */
import { aliasTarget, itemLabel } from '../profile/ProfileRelationships.js';

export class NetworkListRenderer {
	constructor(root, { onOpenAlias }) {
		this.root = root;
		this.onOpenAlias = onOpenAlias;
	}

	group(title, items, followers) {
		const group = this.root.createElement('section');
		group.className = 'networkGroup';
		const heading = this.root.createElement('h3');
		heading.textContent = `${title} · ${items.length}`;
		const list = this.root.createElement('div');
		list.className = 'networkList';
		if (!items.length) list.append(this.text(`No public ${title.toLowerCase()} yet.`, 'networkEmpty'));
		for (const item of items.slice(0, 100)) list.append(this.item(item, followers));
		group.append(heading, list);
		return group;
	}

	item(entry, followerList) {
		const aliasId = followerList && typeof entry === 'string' ? entry : aliasTarget(entry);
		if (!aliasId) return this.text(itemLabel(entry), 'networkContext');
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'networkAlias';
		button.textContent = `@${aliasId}`;
		button.addEventListener('click', () => this.onOpenAlias?.(aliasId));
		return button;
	}

	text(message, className) {
		const element = this.root.createElement('p');
		element.className = className;
		element.textContent = message;
		return element;
	}
}
