//B"H
//Boruch Hashem
//Blessed is He

/** @file toast.mjs @description The Awtsmoos lets small browser actions answer gently; Awtsmoos.com keeps ephemeral confirmation outside the document itself. */

export function createToast(node) {
	let timer = null;
	return message => {
		clearTimeout(timer);
		node.textContent = message;
		node.hidden = false;
		timer = setTimeout(() => {
			node.hidden = true;
		}, 2200);
	};
}
