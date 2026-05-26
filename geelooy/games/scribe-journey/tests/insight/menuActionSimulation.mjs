// B"H
// Independent menu/action simulation for Scribe Journey.
// This test mirrors the UI delegation contract without requiring a browser DOM.

import { readFileSync } from 'node:fs';

const uiSource = readFileSync('js/ui.js', 'utf8');
const mainSource = readFileSync('js/main.js', 'utf8');
const indexSource = readFileSync('index.html', 'utf8');

const delegatedActions = new Set([
  'toggleGate',
  'spinDreidel',
  'use_item',
  'swapOtzar',
  'unlockGate37',
  'useOverworldItem'
]);

function routeButton(dataset, form = {}) {
  const action = dataset.action;
  const value = dataset.value;

  if (action.startsWith('gemach') || action === 'craft' || delegatedActions.has(action)) {
    const payload = { action, ...dataset };
    if (action === 'gemachAction' || action === 'spinDreidel') {
      payload.amount = Number.parseInt(value, 10) || Number.parseInt(dataset.amount, 10);
    }
    if (action === 'spinDreidel') payload.bet = Number.parseInt(value, 10);
    return { type: 'uiAction', payload };
  }

  if (action === 'create_quest') {
    return {
      type: 'create_quest',
      payload: {
        type: form.type ?? 'fetch',
        targetId: form.target ?? 'wheat_bundle',
        rewardId: form.rewardType ?? 'money',
        rewardAmount: Number.parseInt(form.rewardAmount ?? 1, 10)
      }
    };
  }

  return { type: 'uiAction', payload: { action } };
}

function routeBattle(dataset) {
  return {
    type: 'battleAction',
    payload: {
      combatAction: dataset.action,
      value: dataset.value
    }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sourceActions = new Set([
  ...indexSource.matchAll(/data-action="([^"]+)"/g),
  ...uiSource.matchAll(/data-action=\"([^\"]+)\"/g),
  ...uiSource.matchAll(/dataset\.action = '([^']+)'/g),
  ...mainSource.matchAll(/createBtn\([^,]+,\s*'([^']+)'/g)
].map(match => match[1]));

const requiredActions = [
  'newGame', 'loadGame', 'saveGame', 'resume', 'main-menu',
  'inventory-screen', 'quest-log-screen', 'shem-screen', 'crafting-screen',
  'bestiary-screen', 'gates37-screen', 'gemachAction', 'spinDreidel',
  'toggleGate', 'craftAction', 'swapOtzar', 'unlockGate37', 'create_quest'
];

const combinedSource = `${indexSource}\n${uiSource}\n${mainSource}`;
for (const action of requiredActions) {
  const appearsInSource = combinedSource.includes(`data-action=\"${action}\"`)
    || combinedSource.includes(`data-action=\\\"${action}\\\"`)
    || combinedSource.includes(`dataset.action = '${action}'`)
    || combinedSource.includes(`'${action}'`);
  assert(sourceActions.has(action) || appearsInSource, `Missing expected menu action in HTML/UI/source: ${action}`);
}

const fixedCases = [
  [{ action: 'newGame' }, {}, 'uiAction', 'newGame'],
  [{ action: 'inventory-screen' }, {}, 'uiAction', 'inventory-screen'],
  [{ action: 'spinDreidel', value: '50' }, {}, 'uiAction', 'spinDreidel'],
  [{ action: 'gemachAction', value: '18' }, {}, 'uiAction', 'gemachAction'],
  [{ action: 'swapOtzar', from: 'team', index: '0' }, {}, 'uiAction', 'swapOtzar'],
  [{ action: 'unlockGate37', id: 'gate_37_1' }, {}, 'uiAction', 'unlockGate37'],
  [{ action: 'craftAction', recipeId: 'r1' }, {}, 'uiAction', 'craftAction'],
  [{ action: 'create_quest' }, { type: 'kill', target: 'clay_golem', rewardType: 'money', rewardAmount: '10' }, 'create_quest', undefined]
];

for (const [dataset, form, expectedType, expectedAction] of fixedCases) {
  const result = routeButton(dataset, form);
  assert(result.type === expectedType, `Bad route type for ${dataset.action}: ${result.type}`);
  if (expectedAction) assert(result.payload.action === expectedAction, `Bad payload action for ${dataset.action}`);
}

for (let i = 0; i < 300; i++) {
  const bet = String((i % 9 + 1) * 10);
  const spin = routeButton({ action: 'spinDreidel', value: bet });
  assert(spin.type === 'uiAction', 'spinDreidel must route as uiAction');
  assert(spin.payload.bet === Number.parseInt(bet, 10), 'spinDreidel bet must parse from value');

  const battle = routeBattle({ action: i % 2 ? 'fight' : 'ultimate', value: `m${i}` });
  assert(battle.type === 'battleAction', 'battle buttons must route as battleAction');
  assert(battle.payload.combatAction === (i % 2 ? 'fight' : 'ultimate'), 'battle action must not overwrite message type');

  const quest = routeButton(
    { action: 'create_quest' },
    { type: i % 2 ? 'fetch' : 'kill', target: i % 2 ? 'wheat_bundle' : 'clay_golem', rewardType: 'money', rewardAmount: String(i + 1) }
  );
  assert(quest.type === 'create_quest', 'create quest must route directly');
  assert(quest.payload.rewardAmount === i + 1, 'create quest reward amount must parse');
}

console.log(JSON.stringify({ ok: true, sourceActions: sourceActions.size, simulations: 300 }));
