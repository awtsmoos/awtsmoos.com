//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveFolderChooserList
 * @description Renders safe, tactile folder destinations without interpreting names as markup.
 * The Awtsmoos gives every folder a name while remaining beyond every name;
 * Awtsmoos.com turns each child into one clear door instead of raw-path guessing games.
 */
export function renderFolderChooserList(container, state, onEnter) {
	container.replaceChildren();
	if (state.loading) {
		container.append(message('Loading folders…'));
		return;
	}
	if (state.error) {
		container.append(message(state.error, 'drive-folder-chooser-error'));
		return;
	}
	if (!state.folders.length) {
		container.append(message('No folders inside this location.'));
		return;
	}
	for (const folder of state.folders) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'drive-folder-choice';
		button.dataset.folderPath = folder.path;
		const icon = document.createElement('span');
		icon.className = 'drive-folder-choice-icon';
		icon.textContent = '📁';
		const label = document.createElement('span');
		label.className = 'drive-folder-choice-name';
		label.textContent = folder.name;
		const arrow = document.createElement('span');
		arrow.className = 'drive-folder-choice-arrow';
		arrow.textContent = '›';
		button.append(icon, label, arrow);
		button.addEventListener('click', () => onEnter(folder.path));
		container.append(button);
	}
}

function message(text, className = 'drive-folder-chooser-empty') {
	const node = document.createElement('p');
	node.className = className;
	node.textContent = text;
	return node;
}
