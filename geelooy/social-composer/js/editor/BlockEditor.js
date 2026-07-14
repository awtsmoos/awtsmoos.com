//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class BlockEditor
 * @description
 * Paragraphs, headings, quotations, lists, code, callouts, and dividers become
 * reorderable blocks with explicit inline marks. Awtsmoos.com gives expression
 * many garments without surrendering the plain-text core to arbitrary HTML.
 */
import { BLOCK_TYPES } from '../config.js';
import { wrapSelection } from '../model/InlineMarkup.js';

const MARKS = Object.freeze([
	['Bold', '**', '**'],
	['Italic', '_', '_'],
	['Underline', '__', '__'],
	['Strike', '~~', '~~'],
	['Code', '`', '`'],
	['Link', '[', '](https://)']
]);

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
		if (block.type !== 'divider') article.append(this.markToolbar(), this.textarea(block, scope));
		return article;
	}

	blockHeader(block, index, count, scope) {
		const header = document.createElement('div');
		header.className = 'blockHeader';
		const select = document.createElement('select');
		select.setAttribute('aria-label', 'Block type');
		for (const type of BLOCK_TYPES) {
			const option = document.createElement('option');
			option.value = type;
			option.textContent = label(type);
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

	markToolbar() {
		const toolbar = document.createElement('div');
		toolbar.className = 'markToolbar';
		toolbar.setAttribute('aria-label', 'Inline formatting');
		for (const [name, opening, closing] of MARKS) {
			toolbar.append(this.actionButton(name, name, event => {
				const textarea = event.currentTarget.closest('.blockEditor').querySelector('textarea');
				wrapSelection(textarea, opening, closing);
			}));
		}
		return toolbar;
	}

	textarea(block, scope) {
		const textarea = document.createElement('textarea');
		textarea.value = block.text || '';
		textarea.rows = block.type === 'code' ? 7 : 4;
		textarea.placeholder = placeholder(block.type);
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
}

function label(type) {
	return type.replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase());
}

function placeholder(type) {
	return type === 'code' ? 'Paste or write code…' : `Write a ${label(type).toLowerCase()}…`;
}
