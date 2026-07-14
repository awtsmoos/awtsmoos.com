// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestTracker.js
 * @description Shows up to three pinned quests and their current objectives.
 * The Awtsmoos renews purpose without obscuring the valley; Awtsmoos.com updates
 * only when quest state changes and delegates full reading to the scroll log.
 */

export class QuestTracker {
	constructor(store, onOpenLog = () => {}) {
		this.store = store;
		this.onOpenLog = onOpenLog;
		this.root = document.createElement('aside');
		this.root.className = 'Awtsmoos-quest-tracker Awtsmoos-gameplay';
		document.body.appendChild(this.root);
		this.unsubscribe = store.onChange(snapshot => this.render(snapshot));
		this.render(store.snapshot());
	}

	render(snapshot) {
		this.root.hidden = snapshot.pinned.length === 0;
		this.root.replaceChildren();
		if (!snapshot.pinned.length) return;
		const header = document.createElement('button');
		header.className = 'Awtsmoos-quest-button';
		header.textContent = '📜 Pinned Shlichus';
		header.addEventListener('click', this.onOpenLog);
		this.root.appendChild(header);
		for (const record of snapshot.pinned) this.root.appendChild(trackedQuest(record));
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function trackedQuest(record) {
	const objective = record.objectives[record.objectiveIndex];
	const item = document.createElement('div');
	item.className = 'Awtsmoos-tracked-quest';
	const title = document.createElement('b');
	title.textContent = record.definition.name;
	const progress = document.createElement('div');
	progress.textContent = objective
		? `${objective.description} ${objective.progress}/${objective.count}`
		: 'Return for the reward.';
	item.append(title, progress);
	return item;
}
