//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndustryCatalog
 * @description
 * Production on Awtsmoos.com is declared as labor, inputs, outputs, buildings,
 * and ecological pressure. The Awtsmoos creates from nothing; industries may
 * only transform what their finite contracts honestly contain.
 */
export const INDUSTRY_CATALOG = Object.freeze({
	farming: industry('farm', 18, {}, { grain: 22, food: 10 }, 0.8),
	wells: industry('well', 10, {}, { water: 36 }, 0.2),
	forestry: industry('sawmill', 14, {}, { wood: 15 }, 1.1),
	carpentry: industry('workshop', 12, { wood: 10 }, { timber: 7 }, 0.4),
	quarrying: industry('quarry', 16, {}, { stone: 13 }, 1.4),
	toolmaking: industry('workshop', 10, { timber: 3, stone: 2 }, { tools: 5 }, 0.5),
	healing: industry('clinic', 8, { herbs: 4, water: 2 }, { medicine: 3 }, 0.1),
	weaving: industry('workshop', 11, {}, { textiles: 6 }, 0.3),
	fishing: industry('harbor', 13, {}, { fish: 14, food: 5 }, 0.6),
	herding: industry('pasture', 12, { water: 3 }, { livestock: 2, food: 6 }, 0.7)
});

function industry(building, labor, inputs, outputs, pollution) {
	return Object.freeze({ building, labor, inputs, outputs, pollution });
}
