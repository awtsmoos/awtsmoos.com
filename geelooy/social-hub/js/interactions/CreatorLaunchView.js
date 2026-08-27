//B"H
//Boruch Hashem
//Blessed is He

import { CREATOR_INTENTS } from './CreatorLaunchModel.js';

/**
 * @class CreatorLaunchView
 * @description
 * The Awtsmoos lets a social conversation open into full creation without confusing post and comment;
 * Awtsmoos.com renders one clean intent rail while the exact comment studio remains visibly separate below.
 */
export class CreatorLaunchView {
	constructor(root = document) {
		this.root = root;
		this.links = new Map();
	}

	mount() {
		const panel = this.root.querySelector('[data-panel="interact"]');
		const commentStudio = panel?.querySelector('.commentComposer');
		if (!panel || !commentStudio || panel.querySelector('.creatorLaunch')) return null;
		this.element = this.root.createElement('section');
		this.element.className = 'creatorLaunch riftCard';
		const heading = this.root.createElement('div');
		heading.className = 'creatorLaunchHeading';
		const eyebrow = this.root.createElement('span');
		eyebrow.className = 'creatorLaunchEyebrow';
		eyebrow.textContent = 'Create new';
		const title = this.root.createElement('h3');
		title.textContent = 'Post, video, voice, verse, or branch';
		const copy = this.root.createElement('p');
		copy.textContent = 'Create a new canonical object here. The comment studio below replies to the current conversation.';
		heading.append(eyebrow, title, copy);
		const rail = this.root.createElement('nav');
		rail.className = 'creatorLaunchRail';
		rail.setAttribute('aria-label', 'Create new content');
		for (const intent of CREATOR_INTENTS) rail.append(this.link(intent));
		this.context = this.root.createElement('p');
		this.context.className = 'creatorLaunchContext';
		this.element.append(heading, rail, this.context);
		commentStudio.before(this.element);
		return this.element;
	}

	link(intent) {
		const anchor = this.root.createElement('a');
		anchor.className = 'creatorLaunchButton';
		anchor.dataset.creatorLaunch = intent.id;
		const icon = this.root.createElement('span');
		icon.textContent = intent.icon;
		icon.setAttribute('aria-hidden', 'true');
		const label = this.root.createElement('strong');
		label.textContent = intent.label;
		anchor.append(icon, label);
		this.links.set(intent.id, anchor);
		return anchor;
	}

	render(snapshot, urlFor) {
		for (const [intentId, anchor] of this.links) {
			anchor.href = urlFor(snapshot, intentId);
		}
		const alias = snapshot.identity?.aliasId
			? `@${snapshot.identity.aliasId}`
			: 'choose an alias in the composer';
		const target = snapshot.comment?.target || {};
		const destination = target.heichelId
			? `${target.heichelId}/${target.seriesId || 'root'}`
			: 'choose a destination in the composer';
		if (this.context) this.context.textContent = `${alias} - ${destination}`;
	}
}
