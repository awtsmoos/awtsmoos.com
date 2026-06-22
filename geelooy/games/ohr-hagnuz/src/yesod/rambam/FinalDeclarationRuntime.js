/** B"H @module FinalDeclarationRuntime */
import { State } from '../../binah/State.js';
import { DeclarationLines } from '../../data/rambam/DeclarationIndex.js';
import { refreshDeclaration } from './DeclarationRuntime.js';

export const finalDeclarationReady = () => refreshDeclaration().unlocked.length === DeclarationLines.length;
export const attemptFinalDeclaration = () => {
  const status = refreshDeclaration();
  if (status.unlocked.length !== DeclarationLines.length) {
    const missing = status.locked.map(line => line.text).join(' / ');
    State.say(`The declaration is not whole. Missing: ${missing}`, 720);
    return false;
  }
  State.Story.active = 'Ohr HaGnuz Revealed';
  State.Story.chapter = 6;
  State.say('B"H. I did not forget. The fruit receives flavor again.', 1200);
  return true;
};
