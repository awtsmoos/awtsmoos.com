//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ContentKindPicker
 * @description
 * The Awtsmoos precedes every category, yet intention needs a vessel that can shine;
 * Awtsmoos.com lets Post, Question, Answer, and Reference become obvious before configuration by design.
 */

const KETER_COPY = Object.freeze({
	post: ['Post', 'Share an idea, story, update, teaching, or media.'],
	question: ['Question', 'Invite formal answers while ordinary discussion stays open.'],
	answer: ['Answer', 'Respond directly with a first-class post that can keep growing.'],
	reference: ['Reference', 'Place canonical work elsewhere without copying its authorship.']
});

function createTiferesChoice(document, kind, onChoose) {
	const button = document.createElement('button');
	const crown = document.createElement('strong');
	const ray = document.createElement('span');
	button.type = 'button';
	button.className = 'composerKindChoice';
	button.dataset.kind = kind;
	button.addEventListener('click', () => onChoose(kind));
	crown.textContent = KETER_COPY[kind][0];
	ray.textContent = KETER_COPY[kind][1];
	button.append(crown, ray);
	return button;
}

export class KeterContentKindPicker {
	constructor({ document, state }) {
		this.document = document;
		this.state = state;
		this.root = null;
	}

	initialize() {
		const advanced = this.document.getElementById('postKind')?.closest('details');
		if (!advanced || this.document.getElementById('composerKindPicker')) return;
		this.root = this.document.createElement('section');
		this.root.id = 'composerKindPicker';
		this.root.className = 'composerKindPicker';
		this.root.setAttribute('aria-label', 'Choose what you are creating');
		advanced.before(this.root);
		this.render(this.state.snapshot());
	}

	choose(kind) {
		if (!['post', 'question'].includes(kind)) return;
		this.state.set('postKind', kind);
		this.state.set('presentationKind', kind);
	}

	render(snapshot) {
		if (!this.root) return;
		this.root.textContent = '';
		const lockedKind = snapshot.questionId ? 'answer' : snapshot.canonicalSource ? 'reference' : '';
		const kinds = lockedKind ? [lockedKind] : ['post', 'question'];
		const heading = this.document.createElement('div');
		const eyebrow = this.document.createElement('span');
		const title = this.document.createElement('strong');
		const choices = this.document.createElement('div');
		heading.className = 'composerKindPicker__heading';
		eyebrow.textContent = 'Start with intent';
		title.textContent = 'What are you creating?';
		choices.className = 'composerKindPicker__choices';
		heading.append(eyebrow, title);
		for (const kind of kinds) {
			const button = createTiferesChoice(this.document, kind, value => this.choose(value));
			const active = lockedKind ? true : snapshot.postKind === kind;
			button.classList.toggle('is-active', active);
			button.setAttribute('aria-pressed', String(active));
			button.disabled = Boolean(lockedKind);
			choices.append(button);
		}
		this.root.append(heading, choices);
	}
}
