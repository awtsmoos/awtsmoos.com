// B"H
// Rendering contract simulation: visual resolver and renderer templates stay safe under repeated varied inputs.

import { resolveTileVisual } from '../../js/rendering/tileVisualResolver.js';
import { renderInventory, renderQuestLog, renderGates37 } from '../../js/ui/renderers.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const map = {
  entityByGlyph: {
    A: { visual: '🧔', emoji: '👤', glyph: 'A' },
    B: { emoji: '📜', glyph: 'B' },
    C: { glyph: 'C' }
  }
};

assert(resolveTileVisual(map, 'A') === '🧔', 'visual should win over emoji/glyph');
assert(resolveTileVisual(map, 'B') === '📜', 'emoji should win over glyph when visual absent');
assert(resolveTileVisual(map, 'C') === 'C', 'glyph should remain when no visual/emoji');
assert(resolveTileVisual(map, '⬜') === '⬜', 'plain tiles should pass through');
assert(resolveTileVisual(map, null) === null, 'null tile should stay null');

for (let i = 0; i < 600; i++) {
  const inventory = [
    { id: `food_${i}`, name: `Food ${i}`, description: 'Heals.', type: 'consumable', rarity: i % 2 ? 'common' : 'holy' },
    { id: `quest_${i}`, name: `Quest ${i}`, description: 'Quest vessel.', type: 'key_item', isQuestItem: true }
  ];
  const inventoryHtml = renderInventory(inventory);
  assert(inventoryHtml.includes('data-action="use_item"'), 'Consumable inventory should render use action');
  assert(inventoryHtml.includes('(QUEST)'), 'Quest item should be marked');
  assert(!inventoryHtml.includes('style='), 'Inventory renderer must not emit inline styles');

  const questHtml = renderQuestLog([
    {
      name: `Quest ${i}`,
      status: i % 2 ? 'active' : 'completed',
      description: 'Walk, learn, refine.',
      objectives: [
        { text: 'Find spark', completed: i % 2 === 0 },
        { text: 'Return spark', completed: false }
      ]
    }
  ]);
  assert(questHtml.includes('quest-objective'), 'Quest log should render objectives');
  assert(!questHtml.includes('style='), 'Quest renderer must not emit inline styles');

  const gatesHtml = renderGates37({
    points: 100,
    gates: [
      { id: `gate_${i}`, name: 'Gate', icon: '🔐', desc: 'A gate.', cost: 1, unlocked: i % 3 === 0, canUnlock: i % 3 !== 0 }
    ]
  });
  assert(gatesHtml.includes('The 37 Gates of Wisdom'), 'Gate renderer should keep title');
  assert(!gatesHtml.includes('style='), 'Gate renderer must not emit inline styles');
}

console.log(JSON.stringify({ ok: true, simulations: 600 }));
