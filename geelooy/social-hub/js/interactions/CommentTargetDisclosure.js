//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class CommentTargetDisclosure
 * @description
 * The Awtsmoos holds every exact coordinate while the visible vessel stays clear;
 * Awtsmoos.com reveals canonical targeting only when a person asks for its deeper layer.
 */
export class CommentTargetDisclosure {
	constructor({ root }) {
		this.root = root;
		this.summary = null;
		this.detailsLabel = null;
	}

	/** Wraps the existing target grid without replacing or renaming any field. */
	initialize() {
		const grid = this.root.getElementById('commentHeichelId')?.closest('.targetGrid');
		if (!grid || grid.closest('[data-target-disclosure]')) {
			return;
		}
		const summary = document.createElement('div');
		summary.className = 'target-human-summary';
		summary.setAttribute('role', 'status');
		summary.setAttribute('aria-live', 'polite');
		const label = document.createElement('strong');
		label.textContent = 'Destination';
		const value = document.createElement('span');
		value.textContent = 'No exact destination selected yet.';
		summary.append(label, value);

		const details = document.createElement('details');
		details.className = 'target-advanced';
		details.dataset.targetDisclosure = 'true';
		const detailsLabel = document.createElement('summary');
		detailsLabel.textContent = 'Advanced destination details';
		const guidance = document.createElement('p');
		guidance.className = 'target-advanced-guidance';
		guidance.textContent = 'Use exact Heichel, series, entity, verse, subsection, or reply coordinates when needed.';
		grid.before(summary, details);
		details.append(detailsLabel, guidance, grid);
		this.summary = value;
		this.detailsLabel = detailsLabel;
	}

	/** Reflects state in readable language while exact controls remain unchanged. */
	render(snapshot) {
		if (!this.summary) {
			return;
		}
		const target = snapshot?.comment?.target || {};
		const destination = this.describe(target);
		this.summary.textContent = destination;
		if (this.detailsLabel) {
			this.detailsLabel.textContent = target.heichelId
				? `Advanced destination · ${target.heichelId}`
				: 'Advanced destination details';
		}
	}

	describe(target) {
		if (!target.heichelId) {
			return 'No exact destination selected yet.';
		}
		const pieces = [`Heichel ${target.heichelId}`];
		if (target.seriesId && target.seriesId !== 'root') {
			pieces.push(`series ${target.seriesId}`);
		}
		if (target.entityId) {
			pieces.push(`${target.entityType || 'entity'} ${target.entityId}`);
		}
		if (target.parentCommentId) {
			pieces.push('replying to a comment');
		}
		return pieces.join(' · ');
	}
}
