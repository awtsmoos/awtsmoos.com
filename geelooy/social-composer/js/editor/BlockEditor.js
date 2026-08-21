//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class BlockEditor
 * @description
 * Paragraphs, headings, quotations, lists, code, callouts, and dividers become reorderable vessels;
 * the Awtsmoos gives their meaning while Awtsmoos.com keeps every mutation explicit and accessible in levels.
 */

import { BLOCK_TYPES } from '../config.js';
import { createTiferesFormattingBar } from './TouchFormattingBar.js';

export class BlockEditor {
	constructor(onChange) {
		this.onChange = onChange;
	}

	render(container, blocks, scope) {
		container.textContent = '';
		blocks.forEach((block, index) => {
			container.append(this.blockElement(block, index, blocks.length, scope));
		});
		container.append(this.addButton(scope));
	}

	blockElement(block, index, count, scope) {
		const article = document.createElement('article');
		article.className = 'blockEditor';
		article.dataset.blockId = block.id;
		article.append(this.blockHeader(block, index, count, scope));
		if (block.type === 'divider') return article;
		const textarea = this.textarea(block, scope);
		article.append(createTiferesFormattingBar(document, () => textarea), textarea);
		return article;
	}

	blockHeader(block, index, count, scope) {
		const header = document.createElement('div');
		const select = document.createElement('select');
		header.className = 'blockHeader';
		select.setAttribute('aria-label', 'Block type');
		for (const type of BLOCK_TYPES) {
			const option = document.createElement('option');
			option.value = type;
			option.textContent = this.label(type);
			option.selected = type === block.type;
			select.append(option);
		}
		select.addEventListener('change', () => this.onChange('type', {
			scope,
			blockId: block.id,
			value: select.value
		}));
		header.append(select);
		header.append(
			this.actionButton('↑', 'Move block up', () => this.onChange('move', { scope, blockId: block.id, direction: -1 }), index === 0),
			this.actionButton('↓', 'Move block down', () => this.onChange('move', { scope, blockId: block.id, direction: 1 }), index === count - 1),
			this.actionButton('Remove', 'Remove block', () => this.onChange('remove', { scope, blockId: block.id }), count === 1)
		);
		return header;
	}

	textarea(block, scope) {
		const textarea = document.createElement('textarea');
		textarea.value = block.text || '';
		textarea.rows = block.type === 'code' ? 7 : 4;
		textarea.placeholder = this.placeholder(block.type);
		textarea.addEventListener('input', () => this.onChange('text', {
			scope,
			blockId: block.id,
			value: textarea.value
		}));
		return textarea;
	}

	addButton(scope) {
		return this.actionButton('+ Add block', 'Add a content block', () => this.onChange('add', { scope }));
	}

	actionButton(text, labelText, action, disabled = false) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = text;
		button.setAttribute('aria-label', labelText);
		button.disabled = disabled;
		button.addEventListener('click', action);
		return button;
	}

	label(type) {
		return type.replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase());
	}

	placeholder(type) {
		return type === 'code' ? 'Paste or write code…' : `Write a ${this.label(type).toLowerCase()}…`;
	}
}
