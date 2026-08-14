//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ProfileRelationships
 * @description
 * The Awtsmoos reveals public relationship context without pretending every followed object is a person.
 * Awtsmoos.com renders bounded alias navigation, honest counts, and quiet typed context while mutation remains elsewhere.
 */
function aliasTarget(entry) {
	if (typeof entry === 'string') return entry;
	if (!entry || typeof entry !== 'object') return '';
	if (entry.type && entry.type !== 'alias') return '';
	return entry.id || entry.aliasId || '';
}
function itemLabel(entry) {
	if (typeof entry === 'string') return `@${entry}`;
	if (!entry || typeof entry !== 'object') return 'Unknown relationship';
	const id = entry.id || entry.aliasId || 'unknown';
	return entry.type && entry.type !== 'alias'
		? `${entry.type}: ${id}`
		: `@${id}`;
}
export class ProfileRelationships {
	constructor({ root, onOpenAlias }) {
		Object.assign(this, { root, onOpenAlias });
	}
	render(livingCard = null) {
		const host = this.ensureHost();
		const relationships = livingCard?.relationships || {};
		const counts = relationships.counts || {};
		host.replaceChildren(
			this.column('Followers', counts.followers || 0, relationships.followers || []),
			this.column('Following', counts.follows || 0, relationships.follows || [])
		);
	}
	ensureHost() {
		let host = this.root.getElementById('profileRelationships');
		if (host) return host;
		host = this.root.createElement('section');
		host.id = 'profileRelationships';
		host.className = 'profileRelationships';
		host.setAttribute('aria-label', 'Public relationships');
		const stats = this.root.getElementById('profileStats');
		stats?.insertAdjacentElement('afterend', host);
		return host;
	}
	column(title, count, items) {
		const section = this.root.createElement('div');
		section.className = 'profileRelationshipGroup';
		const heading = this.root.createElement('h3');
		heading.textContent = `${title} · ${count}`;
		section.append(heading);
		const list = this.root.createElement('div');
		list.className = 'profileRelationshipList';
		const visible = items.slice(0, 12);
		if (!visible.length) {
			const empty = this.root.createElement('p');
			empty.className = 'profileRelationshipEmpty';
			empty.textContent = `No public ${title.toLowerCase()} yet.`;
			list.append(empty);
		} else {
			for (const item of visible) list.append(this.item(item));
		}
		section.append(list);
		return section;
	}
	item(entry) {
		const aliasId = aliasTarget(entry);
		if (!aliasId) {
			const label = this.root.createElement('span');
			label.className = 'profileRelationshipContext';
			label.textContent = itemLabel(entry);
			return label;
		}
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'profileRelationshipAlias';
		button.textContent = itemLabel(entry);
		button.addEventListener('click', () => this.onOpenAlias?.(aliasId));
		return button;
	}
}
export { aliasTarget, itemLabel };
