//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ComposerFields
 * @description
 * Content type, presentation lens, title, summary, comments, and advanced IDs
 * remain plain reflections of observable state. The Awtsmoos gives the inward
 * meaning while Awtsmoos.com keeps every visible shell synchronized and inspectable.
 */

export class ComposerFields {
	constructor(root, state) {
		this.root = root;
		this.state = state;
	}

	bind() {
		for (const field of ['aliasId', 'heichelId', 'seriesId']) {
			this.element(field).addEventListener('input', event => {
				this.state.setIdentity(field, event.target.value);
			});
		}
		for (const field of ['title', 'summary']) {
			this.element(field).addEventListener('input', event => {
				this.state.set(field, event.target.value);
			});
		}
		this.element('postKind').addEventListener('change', event => {
			this.state.set('postKind', event.target.value);
			if (['question', 'answer'].includes(event.target.value)) {
				this.state.set('presentationKind', event.target.value);
			}
		});
		this.element('presentationKind').addEventListener('change', event => {
			this.state.set('presentationKind', event.target.value);
		});
		this.element('commentsEnabled').addEventListener('change', event => {
			this.state.set('commentsEnabled', event.target.checked);
		});
	}

	render(snapshot) {
		this.value('aliasId', snapshot.identity.aliasId);
		this.value('heichelId', snapshot.identity.heichelId);
		this.value('seriesId', snapshot.identity.seriesId);
		this.value('postKind', snapshot.postKind);
		this.value('presentationKind', snapshot.presentationKind);
		this.value('title', snapshot.title);
		this.value('summary', snapshot.summary);
		this.element('commentsEnabled').checked = snapshot.commentsEnabled;
		const answerMode = Boolean(snapshot.questionId);
		this.element('postKind').disabled = answerMode;
		this.element('answerContext').hidden = !answerMode;
		this.element('answerQuestionId').textContent = snapshot.questionId;
		this.element('composerTitle').textContent = answerMode
			? 'Write a rich answer'
			: snapshot.postKind === 'question'
				? 'Ask a rich question'
				: snapshot.canonicalSource
					? 'Reference an existing post'
					: 'Create a rich post';
		this.element('destinationMode').textContent = snapshot.canonicalSource
			? 'Existing canonical source: new destinations become references.'
			: 'New content: choose one canonical home and optional references.';
	}

	value(id, value) {
		const element = this.element(id);
		if (document.activeElement !== element) element.value = value || '';
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
