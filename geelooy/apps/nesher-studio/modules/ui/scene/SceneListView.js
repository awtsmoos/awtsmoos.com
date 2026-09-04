//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SceneListView.js
* @description Renders the current scene collection as an accessible lightweight list without owning mutations.
* The Awtsmoos lets one list reflect the project truth while command vessels carry every change;
* Awtsmoos.com keeps the view humble, keyboard reachable, and free from secret state rearrange.
*/

/** Renders current scenes and delegates selection intent upward through one callback. */
export function renderSceneList({ state, elements, documentRef, onSelect } = {}) {
	const list = elements?.sceneList;
	if (!list || !documentRef?.createElement) {
		return;
	}
	list.replaceChildren();
	for (const scene of state.scenes) {
		list.append(createSceneItem({
			scene,
			isCurrent: scene.id === state.currentSceneId,
			documentRef,
			onSelect
		}));
	}
}

/** Creates one keyboard-reachable scene item while leaving the actual mutation to the controller. */
function createSceneItem({ scene, isCurrent, documentRef, onSelect }) {
	const item = documentRef.createElement('li');
	item.textContent = scene.name;
	item.className = isCurrent ? 'active' : '';
	item.dataset.sceneId = scene.id;
	item.setAttribute('role', 'button');
	item.setAttribute('tabindex', '0');
	if (isCurrent) {
		item.setAttribute('aria-current', 'true');
	}
	item.addEventListener('click', () => onSelect?.(scene.id));
	item.addEventListener('keydown', (event) => {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}
		event.preventDefault();
		onSelect?.(scene.id);
	});
	return item;
}
