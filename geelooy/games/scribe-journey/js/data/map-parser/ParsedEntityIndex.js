// B"H
// js/data/map-parser/ParsedEntityIndex.js

import { getEntityGlyph } from './entityGlyph.js';

/**
 * Chapter 1: The Awtsmoos speaks one world into many names, and this class refuses
 * to let two active souls wear one logical crown. Coordinates may move like dust;
 * the glyph remains the covenant of identity.
 */
export class ParsedEntityIndex {
    /**
     * @param {string} levelId Stable map or level id.
     */
    constructor(levelId) {
        this.levelId = levelId;
        this.entityByGlyph = {};
        this.entityById = {};
        this.entityByCoord = {};
        this.duplicateGlyphs = [];
        this.missingGlyphPlacements = [];
    }

    /**
     * @param {string} entityKey Author key from the raw map file.
     * @param {object} entityData Entity data after x/y are known.
     * @returns {object} Parsed entity with id, levelId, glyph, and optional x/y.
     */
    add(entityKey, entityData) {
        const glyph = getEntityGlyph(entityData);
        const parsed = { ...entityData, id: entityData.id || entityKey, levelId: this.levelId, glyph };

        this.entityById[parsed.id] = parsed;

        this.entityById[parsed.id] = parsed;

        if (glyph) {
            if (this.entityByGlyph[glyph]) {
                this.duplicateGlyphs.push({ glyph, first: this.entityByGlyph[glyph].id, second: parsed.id });
            }
            this.entityByGlyph[glyph] = parsed;
        }

        if (Number.isInteger(parsed.x) && Number.isInteger(parsed.y)) {
            this.entityByCoord[`${parsed.x},${parsed.y}`] = parsed;
        } else if (glyph) {
            this.missingGlyphPlacements.push({ id: parsed.id, glyph });
        }

        return parsed;
    }

    /**
     * @returns {object} Plain serializable index for the game state.
     */
    toJSON() {
        return {
            levelId: this.levelId,
            entityByGlyph: this.entityByGlyph,
            entityById: this.entityById,
            entityByCoord: this.entityByCoord,
            duplicateGlyphs: this.duplicateGlyphs,
            missingGlyphPlacements: this.missingGlyphPlacements
        };
    }
}
