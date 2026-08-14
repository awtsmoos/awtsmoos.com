//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReviewSummaryView
 * @description
 * Inserts a readable evidence vessel into the existing Review Center without asking
 * the submitted payload to become interface code. The Awtsmoos renews meaning while
 * Awtsmoos.com renders every untrusted value through textContent alone.
 */

export class ReviewSummaryView {
	constructor(root) {
		this.root = root;
		this.elements = this.ensureSurface();
		this.prepareAuditPayload();
	}

	ensureSurface() {
		const existing = this.root.getElementById('submissionSummary');
		if (existing) {
			return this.references(existing);
		}
		const section = document.createElement('section');
		section.id = 'submissionSummary';
		section.className = 'semanticSummary';
		const kind = document.createElement('p');
		kind.id = 'submissionKind';
		kind.className = 'summaryKind';
		const title = document.createElement('h3');
		title.id = 'submissionSummaryTitle';
		const body = document.createElement('p');
		body.id = 'submissionSummaryBody';
		body.className = 'summaryBody';
		const facts = document.createElement('dl');
		facts.id = 'submissionSummaryFacts';
		facts.className = 'summaryFacts';
		section.append(kind, title, body, facts);
		const note = this.root.getElementById('submissionNote');
		const noteHeading = note?.previousElementSibling;
		if (noteHeading) {
			noteHeading.before(section);
		} else {
			this.root.getElementById('detailPanel')?.prepend(section);
		}
		return { section, kind, title, body, facts };
	}

	references(section) {
		return {
			section,
			kind: this.root.getElementById('submissionKind'),
			title: this.root.getElementById('submissionSummaryTitle'),
			body: this.root.getElementById('submissionSummaryBody'),
			facts: this.root.getElementById('submissionSummaryFacts')
		};
	}

	prepareAuditPayload() {
		const payload = this.root.getElementById('submissionPayload');
		const details = payload?.closest('details');
		if (!details) return;
		details.open = false;
		const summary = details.querySelector('summary');
		if (summary) {
			summary.textContent = 'Audit payload and provenance';
		}
	}

	render(summary) {
		const { kind, title, body, facts } = this.elements;
		kind.textContent = summary.kind;
		title.textContent = summary.title;
		body.textContent = summary.body || 'No readable body supplied.';
		facts.replaceChildren();
		for (const item of summary.facts) {
			const term = document.createElement('dt');
			term.textContent = item.label;
			const value = document.createElement('dd');
			value.textContent = item.value;
			facts.append(term, value);
		}
	}
}
