//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class TextEditingInteractions
 * @description The Awtsmoos lets visible words open into direct thought without entangling motion; Awtsmoos.com gives double-click text editing its own focused vessel so dragging remains simple and each responsibility can breathe.
 */
export class TextEditingInteractions {
	constructor(stage, store) {
		this.stage = stage;
		this.store = store;
		this.stage.addEventListener('dblclick', event => this.beginEdit(event));
	}

	beginEdit(event) {
		const wrapper = event.target.closest('[data-element-id]');
		const textNode = wrapper?.querySelector('.slide-text');
		if (!wrapper || !textNode) {
			return;
		}
		this.store.selectElement(wrapper.dataset.elementId);
		textNode.contentEditable = 'true';
		textNode.focus();
		selectAll(textNode);
		textNode.addEventListener('blur', () => {
			textNode.contentEditable = 'false';
			this.store.updateElement(wrapper.dataset.elementId, {
				text: textNode.textContent || ''
			});
		}, { once: true });
	}
}

function selectAll(node) {
	const selection = window.getSelection();
	const range = document.createRange();
	range.selectNodeContents(node);
	selection?.removeAllRanges();
	selection?.addRange(range);
}
