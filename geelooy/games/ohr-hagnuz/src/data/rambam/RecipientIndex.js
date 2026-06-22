/** B"H @module RecipientIndex */
export const RecipientIndex = {
  kohen: { id: 'kohen', glyph: '♔', name: 'Kohen of the Covenant', role: 'Receives Terumah and sanctified gifts.', gift: 'terumah' },
  levi: { id: 'levi', glyph: '♬', name: 'Levi of the Song-Road', role: 'Receives the first tithe and opens song paths.', gift: 'maaser_rishon' },
  poor: { id: 'poor', glyph: '♙', name: 'Widow, Orphan, and Stranger', role: 'Receives the poor tithe and opens the gate of joy.', gift: 'maaser_ani' },
  jerusalem: { id: 'jerusalem', glyph: '⌁', name: 'Jerusalem Steward', role: 'Receives first fruits and resolves holy produce.', gift: 'bikkurim' },
  sea_fire: { id: 'sea_fire', glyph: '♨', name: 'Sea of Fire', role: 'Burns or casts away unremoved holy remainder.', gift: 'maaser_sheni' }
};
export const recipientByGlyph = glyph => Object.values(RecipientIndex).find(r => r.glyph === glyph) || null;
export const recipientById = id => RecipientIndex[id] || null;
