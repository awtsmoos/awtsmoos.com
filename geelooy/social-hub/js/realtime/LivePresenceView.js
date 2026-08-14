//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class LivePresenceView
 * @description
 * The Awtsmoos lets realtime become visible without confusing remembered light for current witness;
 * Awtsmoos.com renders connection truth, stale freshness, and server-proven aliases in one accessible mobile vessel.
 */
export class LivePresenceView {
	constructor(root) {
		this.root = root;
	}

	ensure() {
		if (this.panel) return this.panel;
		const host = this.root.querySelector('.contextRibbon')
			|| this.root.querySelector('.hubHeader')
			|| this.root.body;
		this.panel = this.root.createElement('details');
		this.panel.className = 'livePresencePanel';
		this.summary = this.root.createElement('summary');
		this.status = this.root.createElement('span');
		this.status.className = 'livePresenceStatus';
		this.freshness = this.root.createElement('small');
		this.freshness.className = 'livePresenceFreshness';
		this.roster = this.root.createElement('div');
		this.roster.className = 'livePresenceRoster';
		this.roster.setAttribute('aria-label', 'People present in this Space');
		this.panel.append(this.summary, this.freshness, this.roster);
		host.append(this.panel);
		return this.panel;
	}

	render(state, options = {}) {
		this.ensure();
		this.panel.dataset.status = state.status || 'idle';
		this.panel.dataset.stale = String(Boolean(state.stale));
		this.summary.replaceChildren(this.dot(), this.label(state));
		this.freshness.textContent = this.freshnessText(state);
		this.renderRoster(state, Boolean(options.spaceActive));
	}

	dot() {
		const dot = this.root.createElement('span');
		dot.className = 'livePresenceDot';
		dot.setAttribute('aria-hidden', 'true');
		return dot;
	}

	label(state) {
		const label = this.root.createElement('span');
		label.className = 'livePresenceLabel';
		if (state.status === 'live') {
			label.textContent = `Live · ${state.count || 0}`;
			return label;
		}
		if (state.status === 'reconnecting') {
			label.textContent = state.stale ? `Reconnecting · ${state.count || 0} last known` : 'Reconnecting';
			return label;
		}
		if (state.status === 'connecting' || state.status === 'connected') {
			label.textContent = 'Connecting live presence';
			return label;
		}
		label.textContent = state.status === 'error' ? 'Live connection error' : 'Live presence offline';
		return label;
	}

	freshnessText(state) {
		if (!state.lastPresenceAt) return 'Waiting for an authoritative room roster.';
		const time = new Date(state.lastPresenceAt).toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		});
		return state.stale ? `Last verified roster ${time}.` : `Roster verified ${time}.`;
	}

	renderRoster(state, spaceActive) {
		this.roster.replaceChildren();
		this.roster.hidden = !spaceActive || !state.people?.length;
		if (this.roster.hidden) return;
		for (const person of state.people) {
			const aliasId = typeof person === 'string' ? person : person?.aliasId;
			if (!aliasId) continue;
			const chip = this.root.createElement('span');
			chip.className = 'livePresencePerson';
			chip.textContent = `@${aliasId}`;
			this.roster.append(chip);
		}
	}
}
