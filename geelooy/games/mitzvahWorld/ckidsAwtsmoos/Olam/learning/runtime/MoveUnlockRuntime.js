// B\"H
/** Moves unlock through earned vessels: level, trainer, books, practice, kavod, quests. */
export function canUnlockMove(move, learner = {}) {
  const gates = move.gates || {};
  if ((learner.level || 0) < (gates.level || 0)) return false;
  if (gates.trainer && !learner.trainers?.includes(gates.trainer)) return false;
  if (gates.book && !learner.books?.includes(gates.book)) return false;
  if ((learner.practice || 0) < (gates.practice || 0)) return false;
  if ((learner.kavod || 0) < (gates.kavod || 0)) return false;
  if (gates.quest && !learner.quests?.includes(gates.quest)) return false;
  if (gates.prior && !learner.moves?.includes(gates.prior)) return false;
  return true;
}

export function unlockedMoves(catalog = [], learner = {}) {
  return catalog.filter(move => canUnlockMove(move, learner)).map(move => move.id);
}
