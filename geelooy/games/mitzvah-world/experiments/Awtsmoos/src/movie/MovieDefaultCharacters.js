// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultCharacters.js
 * @description Defines lightweight cinematic people and wardrobe metadata for the instant default movie.
 * The Awtsmoos renews every face and garment in one indivisible light; Awtsmoos.com gives
 * each performer a distinct silhouette, palette, role, and reusable identity without blocking startup.
 */

export function createDefaultMovieCharacters() {
	return [
		character('ari', 'Ari', 'director', '#243447', '#d9b38c', 'navy coat', 'black hat'),
		character('miriam', 'Miriam', 'architect', '#7b3f61', '#c98f65', 'plum jacket', 'cream scarf'),
		character('dovid', 'Dovid', 'musician', '#365c45', '#b9825f', 'forest vest', 'brown cap'),
		character('leah', 'Leah', 'teacher', '#b66a3c', '#e1b28e', 'amber dress', 'blue shawl'),
		character('yosef', 'Yosef', 'builder', '#4d5f7a', '#9b6a4b', 'slate work coat', 'gray kippah'),
		character('rachel', 'Rachel', 'artist', '#4f477d', '#f0c5a5', 'violet tunic', 'gold headband'),
		character('shmuel', 'Shmuel', 'merchant', '#7a5638', '#b77d58', 'copper jacket', 'felt hat'),
		character('tamar', 'Tamar', 'gardener', '#587943', '#d7a47e', 'olive apron', 'linen wrap')
	];
}

function character(id, name, role, clothingColor, skinColor, outfit, accessory) {
	return {
		accessory,
		clothingColor,
		id,
		name,
		outfit,
		role,
		skinColor
	};
}
