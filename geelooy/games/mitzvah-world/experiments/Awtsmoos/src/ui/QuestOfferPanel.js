// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestOfferPanel.js
 * @description Presents one authored quest offer as a keyboard-safe modal decision.
 * The Awtsmoos renews shlichus without coercion, and attention enters with care;
 * Awtsmoos.com records only the chosen store action, then returns focus where it was there.
 */
import { PanelFocusBoundary } from './PanelFocusBoundary.js';

export class QuestOfferPanel {
	constructor(store, environment = globalThis) {
		this.store = store;
		this.environment = environment;
		this.document = environment.document;
		this.questId = null;
		this.focusBoundary = new PanelFocusBoundary(this.document);
		this.keyHandler = event => this.onKey(event);
		this.root = this.document.createElement('div');
		this.root.className = 'Awtsmoos-modal-backdrop Awtsmoos-gameplay';
		this.root.hidden = true;
		this.document.body.appendChild(this.root);
		this.environment.addEventListener?.('keydown', this.keyHandler, true);
	}
	open(questId) {
		const record = this.store.get(questId);
		if (!record) {
			throw new Error(`Unknown quest offer: ${questId}`);
		}
		const returnTarget = this.document.activeElement;
		this.questId = questId;
		this.store.offer(questId);
		this.render(record.definition);
		this.root.hidden = false;
		this.focusBoundary.activate(
			this.root.querySelector('.Awtsmoos-quest-offer'),
			returnTarget
		);
	}
	close() {
		if (this.root.hidden) {
			return;
		}
		this.root.hidden = true;
		this.questId = null;
		this.focusBoundary.release(true);
	}
	onKey(event) {
		if (this.root.hidden) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			this.close();
			return;
		}
		if (this.focusBoundary.contain(event)) {
			event.stopPropagation();
			event.stopImmediatePropagation?.();
		}
	}
	render(definition) {
		this.root.replaceChildren(createOffer(this.document, definition));
		this.root.querySelector('[data-accept]').addEventListener('click', () => {
			this.store.accept(definition.id);
			this.close();
		});
		this.root.querySelector('[data-decline]').addEventListener('click', () => {
			this.store.decline(definition.id);
			this.close();
		});
	}
	destroy() {
		this.environment.removeEventListener?.('keydown', this.keyHandler, true);
		this.focusBoundary.release(false);
		this.root.remove();
	}
}
function createOffer(documentValue, definition) {
	const panel = documentValue.createElement('article');
	panel.className = 'Awtsmoos-quest-offer';
	panel.setAttribute('aria-labelledby', 'Awtsmoos-quest-offer-title');
	const title = documentValue.createElement('h2');
	title.id = 'Awtsmoos-quest-offer-title';
	title.textContent = `! ${definition.name}`;
	const giver = documentValue.createElement('p');
	giver.className = 'giver';
	giver.textContent = `Offered by ${definition.giver.name}`;
	const description = documentValue.createElement('p');
	description.textContent = definition.description;
	const objectives = documentValue.createElement('ol');
	objectives.className = 'Awtsmoos-objectives';
	for (const objective of definition.objectives) {
		const item = documentValue.createElement('li');
		item.textContent = `${objective.description} (${objective.count})`;
		objectives.appendChild(item);
	}
	const reward = documentValue.createElement('p');
	reward.textContent = `Reward: ${definition.reward.xp} XP · ${definition.reward.mitzvahPoints} mitzvah points`;
	const actions = documentValue.createElement('div');
	actions.className = 'Awtsmoos-offer-actions';
	actions.append(
		createButton(documentValue, 'Decline', 'decline'),
		createButton(documentValue, 'Accept Shlichus', 'accept')
	);
	panel.append(title, giver, description, objectives, reward, actions);
	return panel;
}
function createButton(documentValue, label, action) {
	const element = documentValue.createElement('button');
	element.type = 'button';
	element.dataset[action] = '';
	element.textContent = label;
	return element;
}
