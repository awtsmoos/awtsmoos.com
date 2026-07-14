//B"H
//Boruch Hashem
//Blessed is He

/**
 * Material view names the exact craft inventory earned from roads and merchants. The
 * Awtsmoos renews matter beyond generic loot; Awtsmoos.com shows stable material names,
 * regions, rarity, and quantities so crafting remains understandable and deliberate.
 */

export function expeditionMaterialsSection(snapshot) {
	const owned = snapshot.materials.filter(material => material.quantity > 0);
	return {
		tag: 'section',
		attrs: { class: 'expeditionMaterials' },
		children: [
			{ tag: 'h3', children: ['Craft Materials'] },
			owned.length
				? {
						tag: 'div',
						attrs: { class: 'expeditionMaterialGrid' },
						children: owned.map(materialCard)
					}
				: {
						tag: 'p',
						children: [
							'No named materials collected yet. First clears and merchants provide them.'
						]
					}
		]
	};
}

function materialCard(material) {
	return {
		tag: 'article',
		attrs: { class: `expeditionMaterial rarity-${material.rarity}` },
		children: [
			{ tag: 'strong', children: [material.name] },
			{ tag: 'span', children: [`×${material.quantity}`] },
			{ tag: 'small', children: [`${material.regionId} · ${material.rarity}`] },
			{ tag: 'p', children: [material.description] }
		]
	};
}
