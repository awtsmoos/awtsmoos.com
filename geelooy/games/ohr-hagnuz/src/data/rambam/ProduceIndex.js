/** B"H @module ProduceIndex */
import { GiftLawIndex } from './GiftLawIndex.js';
export const ProduceIndex = Object.fromEntries(Object.values(GiftLawIndex).map(gift => [gift.id, {
  id: gift.id, glyph: gift.glyph, name: gift.name, receiver: gift.receiver, order: gift.order
}]));
export const produceByGlyph = glyph => Object.values(ProduceIndex).find(p => p.glyph === glyph) || null;
