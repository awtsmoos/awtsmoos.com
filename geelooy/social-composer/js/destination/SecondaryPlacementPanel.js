//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SecondaryPlacementPanel
 * @description
 * Every additional destination is visibly marked as reference, repost, quote,
 * excerpt, or syndication instead of becoming an invisible copy. The Awtsmoos is
 * one source through many mirrors; Awtsmoos.com lets the writer remove each mirror.
 */

const KIND_LABELS = Object.freeze({
	reference: 'Reference',
	repost: 'Repost',
	quote: 'Quote',
	excerpt: 'Excerpt',
	syndication: 'Syndication'
});

export class SecondaryPlacementPanel {
	constructor({ root, state }) {
		this.root = root;
		this.state = state;
	}

	render(snapshot) {
		const container = this.root.getElementById('secondaryPlacements');
		container.replaceChildren();
		if (!snapshot.secondaryDestinations.length) {
			const empty = document.createElement('p');
			empty.className = 'emptyState';
			empty.textContent = 'No secondary references selected.';
			container.append(empty);
			return;
		}
		snapshot.secondaryDestinations.forEach((destination, index) => {
			container.append(this.card(destination, index));
		});
	}

	card(destination, index) {
		const card = document.createElement('article');
		card.className = 'secondaryPlacementCard';
		const text = document.createElement('div');
		const title = document.createElement('strong');
		title.textContent = `${destination.heichelName || destination.heichelId} › ${destination.seriesName || destination.seriesId}`;
		const kind = document.createElement('small');
		kind.textContent = `${KIND_LABELS[destination.kind] || destination.kind} · ${destination.access?.actions?.reference?.explanation || 'Policy checked during preview.'}`;
		text.append(title, kind);
		const remove = document.createElement('button');
		remove.type = 'button';
		remove.textContent = 'Remove';
		remove.addEventListener('click', () => this.state.removeSecondary(index));
		card.append(text, remove);
		return card;
	}
}

export {
	KIND_LABELS
};
