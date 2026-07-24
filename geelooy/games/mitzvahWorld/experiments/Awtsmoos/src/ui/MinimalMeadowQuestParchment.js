// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchment.js
 * @description Renders one modal parchment only while explicitly open and one compact tracker.
 * The Awtsmoos gives shlichus dignity without stealing the unopened world; Awtsmoos.com binds
 * hidden state, ARIA, pointer ownership, offer, choice, progress, reward, and cleanup to one truth.
 */

export class MinimalMeadowQuestParchment {
	constructor(quest, bus, documentValue) {
		this.quest = quest;
		this.bus = bus;
		this.documentValue = documentValue;
		this.opened = false;
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-quest-parchment-backdrop';
		this.root.dataset.open = 'false';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		this.tracker = documentValue.createElement('aside');
		this.tracker.className = 'Awtsmoos-quest-mini-tracker';
		this.tracker.hidden = true;
		documentValue.body.append(this.root, this.tracker);
		this.onClick = event => this.click(event);
		this.root.addEventListener('click', this.onClick);
		this.unsubscribeOffer = bus.on('quest:offer', snapshot => this.open(snapshot));
		this.unsubscribeState = quest.onChange(snapshot => this.refresh(snapshot));
	}

	open(snapshot = this.quest.snapshot()) {
		this.opened = true;
		this.root.dataset.open = 'true';
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.render(snapshot);
	}

	close() {
		this.opened = false;
		this.root.dataset.open = 'false';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
	}

	refresh(snapshot) {
		this.renderTracker(snapshot);
		if (this.opened) this.render(snapshot);
	}

	render(snapshot) {
		const definition = snapshot.definition;
		this.root.innerHTML = `
			<article class="Awtsmoos-quest-parchment" role="dialog" aria-modal="true">
				<button type="button" data-close aria-label="Close parchment">×</button>
				<p class="Awtsmoos-quest-seal">ב״ה · Shlichus</p>
				<h2>${escapeHtml(definition.name)}</h2>
				<p class="Awtsmoos-quest-giver">${escapeHtml(definition.giver.name)}</p>
				<p>${escapeHtml(bodyText(snapshot))}</p>
				<div class="Awtsmoos-quest-objective">${escapeHtml(objectiveText(snapshot))}</div>
				<p class="Awtsmoos-quest-reward">Reward: ${definition.reward.xp} XP · ${definition.reward.perutas} perutas</p>
				<div class="Awtsmoos-quest-actions">${actionsMarkup(snapshot.status)}</div>
			</article>`;
	}

	renderTracker(snapshot) {
		const visible = snapshot.status === 'active' || snapshot.status === 'ready';
		this.tracker.hidden = !visible;
		if (!visible) return;
		this.tracker.dataset.ready = String(snapshot.status === 'ready');
		this.tracker.innerHTML = `<b>📜 ${escapeHtml(snapshot.definition.name)}</b><span>${escapeHtml(objectiveText(snapshot))}</span>`;
	}

	click(event) {
		if (event.target === this.root || event.target.closest('[data-close]')) return this.close();
		if (event.target.closest('[data-accept]')) return void this.quest.accept();
		if (event.target.closest('[data-decline]')) {
			this.quest.decline();
			return this.close();
		}
		if (event.target.closest('[data-complete]')) this.quest.complete();
	}

	destroy() {
		this.unsubscribeOffer();
		this.unsubscribeState();
		this.root.removeEventListener('click', this.onClick);
		this.root.remove();
		this.tracker.remove();
	}
}

function bodyText(snapshot) {
	if (snapshot.status === 'completed') return snapshot.definition.thanks;
	if (snapshot.status === 'ready') return 'You have done what was asked. Return the count and receive the promised reward.';
	if (snapshot.status === 'active') return 'The shadows still wander. Keep your footing, and return after three distinct demons have fallen.';
	return snapshot.definition.description;
}

function objectiveText(snapshot) {
	const objective = snapshot.definition.objective;
	if (snapshot.status === 'ready') return `${objective.description}: complete — return to Reb Mendel`;
	if (snapshot.status === 'completed') return `${objective.description}: ${objective.count}/${objective.count}`;
	return `${objective.description}: ${snapshot.progress}/${objective.count}`;
}

function actionsMarkup(status) {
	if (status === 'available') return '<button type="button" data-decline>Not now</button><button type="button" data-accept>Accept shlichus</button>';
	if (status === 'ready') return '<button type="button" data-close>Wait</button><button type="button" data-complete>Receive reward</button>';
	return '<button type="button" data-close>Close parchment</button>';
}

function escapeHtml(value) {
	return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
