// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QuestLogPanel.js
 * @description Renders the scroll quest log with active, available, and complete tabs.
 * The Awtsmoos renews remembered obligations without hiding their progress;
 * Awtsmoos.com provides pin, abandon, accept, and inspect actions through one store.
 */

export class QuestLogPanel {
	constructor(store) {
		this.store = store;
		this.open = false;
		this.tab = 'active';
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-quest-log Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
		this.unsubscribe = store.onChange(() => this.render());
		this.render();
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.root.hidden = !this.open;
		if (this.open) this.render();
	}

	toggle() {
		this.setOpen(!this.open);
	}

	render() {
		const snapshot = this.store.snapshot();
		this.root.innerHTML = `
			<header class="Awtsmoos-panel-header">
				<h2>📜 Shlichus Log</h2><span>${snapshot.active.length} active</span>
				<button class="Awtsmoos-quest-button" data-close>Close</button>
			</header>
			<nav class="Awtsmoos-quest-tabs" aria-label="Quest states">
				${tabButton('active', snapshot.active.length, this.tab)}
				${tabButton('available', snapshot.available.length, this.tab)}
				${tabButton('completed', snapshot.completed.length, this.tab)}
			</nav>
			<div data-quest-list></div>
		`;
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelectorAll('[data-tab]').forEach(button => {
			button.addEventListener('click', () => {
				this.tab = button.dataset.tab;
				this.render();
			});
		});
		const records = snapshot[this.tab] || [];
		this.root.querySelector('[data-quest-list]').replaceChildren(...records.map(record => this.questCard(record)));
	}

	questCard(record) {
		const card = document.createElement('article');
		card.className = 'Awtsmoos-quest-card';
		const objective = record.objectives[record.objectiveIndex] || record.objectives.at(-1);
		const progress = objective ? objective.progress / objective.count : 1;
		card.innerHTML = `
			<h3>${record.pinned ? '📌 ' : ''}${escapeHtml(record.definition.name)}</h3>
			<p>${escapeHtml(record.definition.description)}</p>
			${objective ? `<p><b>${escapeHtml(objective.description)}</b> ${objective.progress}/${objective.count}</p><div class="Awtsmoos-progress"><span style="width:${Math.min(100, progress * 100)}%"></span></div>` : ''}
			<p>Reward: ${record.definition.reward.xp} XP · ${record.definition.reward.mitzvahPoints} points</p>
			<footer></footer>
		`;
		const footer = card.querySelector('footer');
		if (record.status === 'active') {
			footer.append(
				actionButton(record.pinned ? 'Unpin' : 'Pin', () => this.store.togglePin(record.definition.id)),
				actionButton('Abandon', () => this.store.abandon(record.definition.id))
			);
		}
		if (['available', 'declined', 'offered'].includes(record.status)) {
			footer.append(actionButton('Accept', () => this.store.accept(record.definition.id)));
		}
		return card;
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function tabButton(id, count, selected) {
	return `<button data-tab="${id}" aria-selected="${id === selected}">${id} (${count})</button>`;
}

function actionButton(label, action) {
	const button = document.createElement('button');
	button.className = 'Awtsmoos-quest-button';
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', action);
	return button;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
