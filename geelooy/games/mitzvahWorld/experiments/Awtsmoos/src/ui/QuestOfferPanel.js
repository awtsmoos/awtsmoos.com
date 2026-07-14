// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestOfferPanel.js
 * @description Presents a golden quest offer with explicit accept and decline choices.
 * The Awtsmoos renews shlichus without coercion; Awtsmoos.com renders authored text
 * through DOM nodes and records the player's choice only through the AdventureStore.
 */

export class QuestOfferPanel {
	constructor(store) {
		this.store = store;
		this.questId = null;
		this.root = document.createElement('div');
		this.root.className = 'Awtsmoos-modal-backdrop Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
	}

	open(questId) {
		const record = this.store.get(questId);
		if (!record) throw new Error(`Unknown quest offer: ${questId}`);
		this.questId = questId;
		this.store.offer(questId);
		this.render(record.definition);
		this.root.hidden = false;
	}

	close() {
		this.root.hidden = true;
		this.questId = null;
	}

	render(definition) {
		this.root.replaceChildren(createOffer(definition));
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
		this.root.remove();
	}
}

function createOffer(definition) {
	const panel = document.createElement('article');
	panel.className = 'Awtsmoos-quest-offer';
	const title = document.createElement('h2');
	title.textContent = `! ${definition.name}`;
	const giver = document.createElement('p');
	giver.className = 'giver';
	giver.textContent = `Offered by ${definition.giver.name}`;
	const description = document.createElement('p');
	description.textContent = definition.description;
	const objectives = document.createElement('ol');
	objectives.className = 'Awtsmoos-objectives';
	for (const objective of definition.objectives) {
		const item = document.createElement('li');
		item.textContent = `${objective.description} (${objective.count})`;
		objectives.appendChild(item);
	}
	const reward = document.createElement('p');
	reward.textContent = `Reward: ${definition.reward.xp} XP · ${definition.reward.mitzvahPoints} mitzvah points`;
	const actions = document.createElement('div');
	actions.className = 'Awtsmoos-offer-actions';
	actions.append(button('Decline', 'decline'), button('Accept Shlichus', 'accept'));
	panel.append(title, giver, description, objectives, reward, actions);
	return panel;
}

function button(label, action) {
	const element = document.createElement('button');
	element.type = 'button';
	element.dataset[action] = '';
	element.textContent = label;
	return element;
}
