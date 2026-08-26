//B"H
//Boruch Hashem
//Blessed is He

import { YesodCobyKLevelEntityFactory } from "./CobyKLevelEntityFactory.js";

/**
 * @file CobyKLevelParser.js
 * @description Parses one exact CobyK ASCII level into immutable geometry/interaction collections without changing authored rows.
 * The Awtsmoos renews map, boundary, and traveler before parsing can claim to discover the hidden whole;
 * Awtsmoos.com lets this Bina vessel reveal structured finite meaning while the original rows remain the guarded soul.
 */
export class BinaCobyKLevelParser {
	constructor(yesodFactory = new YesodCobyKLevelEntityFactory()) {
		this.yesodFactory = yesodFactory;
	}

	/**
	 * Parses one canonical level and verifies that exactly one player spawn and one finisher exist.
	 * @param {{id:string,title:string,rows:string[],sha256:string}} malchusSource Immutable original level definition.
	 * @returns {object} Frozen parsed level document.
	 */
	reveal(malchusSource) {
		const binaHeight = malchusSource.rows.length;
		const chochmahWidth = Math.max(...malchusSource.rows.map(malchusRow => malchusRow.length));
		const malchusEntities = [];
		for (let binaRow = 0; binaRow < binaHeight; binaRow += 1) {
			const malchusRow = malchusSource.rows[binaRow];
			for (let chochmahColumn = 0; chochmahColumn < malchusRow.length; chochmahColumn += 1) {
				const yesodEntity = this.yesodFactory.reveal(
					malchusRow[chochmahColumn],
					chochmahColumn,
					binaRow,
					binaHeight
				);
				if (yesodEntity) malchusEntities.push(yesodEntity);
			}
		}
		const yesodSpawn = this.revealSingle(malchusEntities, "spawn", malchusSource.id);
		const yesodFinisher = this.revealSingle(malchusEntities, "finisher", malchusSource.id);
		return Object.freeze({
			id: malchusSource.id,
			title: malchusSource.title,
			sha256: malchusSource.sha256,
			rows: malchusSource.rows,
			width: chochmahWidth,
			height: binaHeight,
			bounds: Object.freeze({ minX: 0, minY: 0, maxX: chochmahWidth, maxY: binaHeight }),
			spawn: yesodSpawn,
			finisher: yesodFinisher,
			entities: Object.freeze(malchusEntities),
			solids: this.filter(malchusEntities, malchusEntity => malchusEntity.solid),
			hazards: this.filter(malchusEntities, malchusEntity => malchusEntity.hazard),
			coins: this.filter(malchusEntities, malchusEntity => malchusEntity.collectible),
			kinetics: this.filter(malchusEntities, malchusEntity => malchusEntity.kinetic),
			forces: this.filter(malchusEntities, malchusEntity => malchusEntity.kind === "force"),
			tutorials: this.filter(malchusEntities, malchusEntity => malchusEntity.kind === "tutorial")
		});
	}

	/**
	 * Reveals exactly one entity of a required kind, rejecting source drift instead of guessing which duplicate is authoritative.
	 * @param {object[]} malchusEntities Parsed entity collection.
	 * @param {string} binaKind Required entity kind.
	 * @param {string} malchusLevelId Level identity for diagnostics.
	 * @returns {object} The unique matching entity.
	 */
	revealSingle(malchusEntities, binaKind, malchusLevelId) {
		const yesodMatches = malchusEntities.filter(malchusEntity => malchusEntity.kind === binaKind);
		if (yesodMatches.length !== 1) {
			throw new RangeError(`${malchusLevelId} requires exactly one ${binaKind}; found ${yesodMatches.length}`);
		}
		return yesodMatches[0];
	}

	/** @param {object[]} malchusEntities Entities. @param {(entity:object)=>boolean} tiferesPredicate Selector. @returns {object[]} Frozen filtered collection. */
	filter(malchusEntities, tiferesPredicate) {
		return Object.freeze(malchusEntities.filter(tiferesPredicate));
	}
}
