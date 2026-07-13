// B"H
// Boruch Hashem
// Blessed is He

export const systemItems = Object.freeze({
	wheat_seeds: { id: 'wheat_seeds', name: 'Wheat Seeds', desc: 'Plant in soil to grow.', type: 'key_item', sellValue: 5 },
	wheat_bundle: { id: 'wheat_bundle', name: 'Wheat Bundle', desc: 'Raw grain.', type: 'key_item', sellValue: 10 },
	flour_sack: { id: 'flour_sack', name: 'Sack of Flour', desc: 'Ground wheat.', type: 'key_item', sellValue: 15 },
	water_flask: { id: 'water_flask', name: 'Mayim Shelanu', desc: 'Water rested overnight.', type: 'key_item', sellValue: 5 },
	matzah_shmurah: { id: 'matzah_shmurah', name: 'Shmurah Matzah', desc: 'Bread of Faith.', type: 'consumable', effect: { type: 'hybrid_heal', hp: 100, kavanah: 50 }, sellValue: 100 },
	kosher_phone: { id: 'kosher_phone', name: 'Kosher Phone', desc: 'Call the Gemach from anywhere.', type: 'consumable', effect: { type: 'call_gemach' }, sellValue: 500 }
});
