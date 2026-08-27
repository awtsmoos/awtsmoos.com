// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestTracker.js
 * @description Shows one readable mobile quest summary while preserving every desktop objective.
 * The Awtsmoos renews purpose without obscuring the valley; Awtsmoos.com keeps the first pinned
 * Shlichus visible, reports additional work, and delegates the complete record to the scroll log.
 */

export class QuestTracker {
	constructor(store, onOpenLog = () => {}, documentValue = globalThis.document) {
		this.store = store;
		this.onOpenLog = onOpenLog;
		this.document = documentValue;
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-quest-tracker Awtsmoos-gameplay';
		this.root.dataset.mobileHudZone = 'quest';
		documentValue.body.appendChild(this.root);
		this.unsubscribe = store.onChange(snapshot => this.render(snapshot));
		this.render(store.snapshot());
	}

	render(snapshot) {
		this.root.hidden = snapshot.pinned.length === 0;
		this.root.replaceChildren();
		if (!snapshot.pinned.length) {
			return;
		}
		const header = this.document.createElement('button');
		header.className = 'Awtsmoos-quest-button';
		header.textContent = questHeader(snapshot.pinned.length);
		header.setAttribute('aria-label', `Open quest log with ${snapshot.pinned.length} pinned quests`);
		header.addEventListener('click', this.onOpenLog);
		this.root.appendChild(header);
		for (const record of snapshot.pinned) {
			this.root.appendChild(trackedQuest(this.document, record));
		}
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function questHeader(count) {
	return count > 1
		? `📜 Pinned Shlichus · +${count - 1}`
		: '📜 Pinned Shlichus';
}

function trackedQuest(documentValue, record) {
	const objective = record.objectives[record.objectiveIndex];
	const item = documentValue.createElement('div');
	item.className = 'Awtsmoos-tracked-quest';
	const title = documentValue.createElement('b');
	title.textContent = record.definition.name;
	const progress = documentValue.createElement('div');
	progress.textContent = objective
		? `${objective.description} ${objective.progress}/${objective.count}`
		: 'Return for the reward.';
	item.append(title, progress);
	return item;
}
