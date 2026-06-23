/**
 * B"H
 * @module FinalDeclarationRuntime
 * @description Final declaration gate and action-shaped ending.
 */
import { State } from '../../binah/State.js';
import { generatedDeclarationText, refreshDeclaration, declarationTruthReport } from './DeclarationRuntime.js';

export const finalDeclarationReady = () => declarationTruthReport().ready;

export const attemptFinalDeclaration = () => {
  const status = refreshDeclaration();
  const report = declarationTruthReport();
  const lines = generatedDeclarationText();
  State.Inventory.journal.notes.unshift(...lines);
  if (!report.ready) {
    const missing = [...status.missingGifts, ...status.locked.map(line => line.text), ...report.houseMissing.map(id => `House room: ${id}`)].join(' / ');
    State.Story.active = 'Declaration Not Yet True';
    State.Story.act = 6;
    State.Story.region = 'Final Declaration';
    State.Story.objective = `Restore what is missing: ${missing}.`;
    State.Story.nextStep = 'Return to the receivers before speaking the final words.';
    State.say(`The declaration is not whole. Missing: ${missing}`, 900);
    return { ok: false, lines, report };
  }
  State.Story.active = 'Ohr HaGnuz Revealed';
  State.Story.chapter = 6;
  State.Story.act = 6;
  State.Story.region = 'Ohr HaGanuz Realm';
  State.Story.objective = 'Postgame: walk the hidden orchard and master every Musag.';
  State.Story.nextStep = 'The world now hangs together: complete the Dex, skills, and hidden orchard.';
  State.Gifts.declaration.ready = true;
  State.say('B"H. I did not forget. The fruit receives flavor again.', 1200);
  return { ok: true, lines, report };
};
