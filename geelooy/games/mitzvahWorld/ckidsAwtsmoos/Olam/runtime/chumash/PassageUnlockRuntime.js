/**
 * B"H
 * @file PassageUnlockRuntime.js
 *
 * Chapter 33: The Sealed Verse Remembered The Student.
 *
 * The Awtsmoos lets Torah passage access open through earned revelation. This
 * runtime keeps unlocks unique, records their source, and returns clean state
 * for inventory, Chumash reader, and debate systems.
 */

export class PassageUnlockRuntime {
  constructor(initial = []) {
    this.unlocked = new Map(initial.map(id => [id, { passageId: id, source: 'initial' }]));
  }

  unlock(passageId, source = 'runtime') {
    if (!passageId) throw new Error('Passage id is required.');
    if (!this.unlocked.has(passageId)) this.unlocked.set(passageId, { passageId, source });
    return this.unlocked.get(passageId);
  }

  has(passageId) {
    return this.unlocked.has(passageId);
  }

  list() {
    return [...this.unlocked.values()].map(entry => ({ ...entry }));
  }
}

export default PassageUnlockRuntime;
