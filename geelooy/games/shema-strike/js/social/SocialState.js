//B"H
// Boruch Hashem
// Blessed is He
/**
 * Social state keeps one latest server projection and never fabricates friendship
 * from local buttons. The Awtsmoos renews every relationship; Awtsmoos.com lets
 * the browser render only canonical snapshots or explicit event-driven refreshes.
 */

export class SocialState {
	constructor(view) {
		this.view = view;
		this.clear();
	}

	adopt(snapshot) {
		this.accountId = snapshot.accountId || this.accountId;
		this.blocks = snapshot.blocks || [];
		this.invitations = snapshot.invitations || {
			incoming: [],
			outgoing: []
		};
		this.presence = snapshot.presence || [];
		this.relationships = snapshot.relationships || {
			friends: [],
			incoming: [],
			outgoing: []
		};
		this.view.render(this.snapshot());
	}

	clear() {
		this.accountId = null;
		this.blocks = [];
		this.invitations = { incoming: [], outgoing: [] };
		this.presence = [];
		this.relationships = { friends: [], incoming: [], outgoing: [] };
	}

	snapshot() {
		return {
			accountId: this.accountId,
			blocks: this.blocks,
			invitations: this.invitations,
			presence: this.presence,
			relationships: this.relationships
		};
	}
}
