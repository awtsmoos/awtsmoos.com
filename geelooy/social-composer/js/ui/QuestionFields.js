//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class QuestionFields
 * @description
 * A question may invite open, one-per-alias, or moderated answers while ordinary
 * comments remain separately available. Awtsmoos.com therefore distinguishes an
 * answer from a reaction without separating either from the one Awtsmoos.
 */

export class QuestionFields {
	constructor(container, state) {
		this.container = container;
		this.state = state;
	}

	render(snapshot) {
		const visible = snapshot.postKind === 'question' && !snapshot.questionId;
		this.container.hidden = !visible;
		if (!visible) return;
		this.value('answersEnabled', snapshot.questionOptions.answersEnabled);
		this.value('answerPolicy', snapshot.questionOptions.answerPolicy);
		this.value('answerGuidance', snapshot.questionOptions.answerGuidance);
	}

	bind() {
		this.element('answersEnabled').addEventListener('change', event => {
			this.update('answersEnabled', event.target.checked);
		});
		this.element('answerPolicy').addEventListener('change', event => {
			this.update('answerPolicy', event.target.value);
		});
		this.element('answerGuidance').addEventListener('input', event => {
			this.update('answerGuidance', event.target.value);
		});
	}

	update(field, value) {
		this.state.mutate(`question:${field}`, snapshot => {
			snapshot.questionOptions[field] = value;
		});
	}

	value(id, value) {
		const element = this.element(id);
		if (element.type === 'checkbox') element.checked = Boolean(value);
		else element.value = value || '';
	}

	element(id) {
		return this.container.querySelector(`#${id}`);
	}
}
