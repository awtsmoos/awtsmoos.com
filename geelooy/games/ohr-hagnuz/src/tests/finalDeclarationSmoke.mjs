/** B"H @file finalDeclarationSmoke.mjs */
const assert = (condition, message) => { if (!condition) throw new Error(message); };
globalThis.window = { AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 } };
const { State } = await import('../binah/State.js');
const { collectGift, giveGift } = await import('../yesod/rambam/GiftRuntime.js');
const { refreshDeclaration, declarationRows } = await import('../yesod/rambam/DeclarationRuntime.js');
const { finalDeclarationReady, attemptFinalDeclaration } = await import('../yesod/rambam/FinalDeclarationRuntime.js');
State.Gifts = { inventory: {}, given: {}, blessingRemembered: false, joyShared: false, declaration: { unlocked: [], total: 6 }, history: [] };
for (const id of ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim']) collectGift(id);
for (const [gift, receiver] of [['terumah','kohen'], ['maaser_rishon','levi'], ['maaser_ani','poor'], ['maaser_sheni','jerusalem'], ['bikkurim','jerusalem']]) giveGift(gift, receiver);
const status = refreshDeclaration();
assert(status.unlocked.length === 6, `expected 6 declaration lines, got ${status.unlocked.length}`);
assert(finalDeclarationReady(), 'final declaration not ready');
assert(attemptFinalDeclaration(), 'final declaration failed');
assert(State.Story.active === 'Ohr HaGnuz Revealed', 'story finale not set');
console.log(JSON.stringify({ ok: true, active: State.Story.active, rows: declarationRows() }, null, 2));
