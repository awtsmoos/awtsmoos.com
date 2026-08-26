//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusBookshelfCardFactory
 * @description
 * The Awtsmoos gives every saved teaching a finite vessel without letting saved
 * words become executable markup; Awtsmoos.com lets this Malchus-like factory
 * reveal title, path, year, and actions through safe semantic DOM alone.
 */
export class MalchusBookshelfCardFactory {
	/** Creates one factory around the owning document. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
	}

	/** Builds one grouped bookshelf section. */
	section(hodType, tiferesItems, tiferesHandlers) {
		const malchusSection = this.root.createElement('section');
		malchusSection.className = 'book-shelf-section';
		const tiferesHeading = this.text('h3', hodType === 'folder' ? 'Folders' : 'Sichos', 'book-section-title');
		const yesodRail = this.root.createElement('div');
		yesodRail.className = 'book-rail';
		yesodRail.setAttribute('role', 'list');
		for (const tiferesItem of tiferesItems) {
			yesodRail.append(this.card(tiferesItem, tiferesHandlers));
		}
		malchusSection.append(tiferesHeading, yesodRail);
		return malchusSection;
	}

	/** Builds one safe folder/track memory card. */
	card(tiferesItem = {}, tiferesHandlers = {}) {
		const gevurahFolder = tiferesItem.type === 'folder';
		const malchusCard = this.root.createElement('div');
		malchusCard.className = `book-card ${gevurahFolder ? 'book-folder' : 'book-track'}`;
		malchusCard.setAttribute('role', 'listitem');
		const hodSpine = this.text('span', gevurahFolder ? '📁' : '🔖', 'book-spine');
		hodSpine.setAttribute('aria-hidden', 'true');
		const tiferesBody = this.root.createElement('div');
		tiferesBody.className = 'book-body';
		tiferesBody.append(
			this.text('span', tiferesItem.year || '----', 'book-year'),
			this.text('strong', tiferesItem.title || tiferesItem.folder || 'Untitled', 'book-title'),
			this.text('span', tiferesItem.folder || tiferesItem.path || '', 'book-meta'),
			this.actions(tiferesItem, tiferesHandlers)
		);
		malchusCard.append(hodSpine, tiferesBody);
		return malchusCard;
	}

	/** Builds explicit Open and Remove actions while preserving callbacks exactly. */
	actions(tiferesItem, tiferesHandlers) {
		const malchusActions = this.root.createElement('div');
		malchusActions.className = 'book-actions';
		const chesedOpen = this.action('Open', 'book-action book-open');
		const gevurahRemove = this.action('Remove', 'book-action book-remove');
		chesedOpen.addEventListener('click', () => tiferesHandlers.onOpen?.(tiferesItem));
		gevurahRemove.addEventListener('click', () => tiferesHandlers.onRemove?.(tiferesItem.id));
		malchusActions.append(chesedOpen, gevurahRemove);
		return malchusActions;
	}

	/** Creates one safe text-bearing element. */
	text(tag, hodText, malchusClass) {
		const malchusElement = this.root.createElement(tag);
		malchusElement.className = malchusClass;
		malchusElement.textContent = String(hodText ?? '');
		return malchusElement;
	}

	/** Creates one semantic bookshelf action. */
	action(hodText, malchusClass) {
		const malchusButton = this.root.createElement('button');
		malchusButton.type = 'button';
		malchusButton.className = malchusClass;
		malchusButton.textContent = hodText;
		return malchusButton;
	}
}
