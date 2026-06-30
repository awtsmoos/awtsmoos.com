// B"H
/** B"H — Plain English fragments, selected by logic rather than shouting. */
const opening = {
  recover: 'Something is blocking the room, so stabilize that first.',
  continueQueue: 'There is useful queued work available.',
  executeClaim: 'A claimed piece of work is still active.',
  discover: 'The room is quiet, which makes this a good moment to discover more.',
  steer: 'You are allowed to steer the mission when evidence points to better work.',
  continue: 'The mission is still active.'
};
const middle = {
  recover: 'Recover without erasing progress, then return to the next useful action.',
  continueQueue: 'Choose the item that unlocks the most progress or removes the most uncertainty.',
  executeClaim: 'Advance it, verify what changed, and leave a clear receipt.',
  discover: 'Inspect nearby architecture, tests, docs, names, or unfinished queues before stopping.',
  steer: 'Explain why the new direction is better, then continue from that point.',
  continue: 'Treat this as one step in a longer mission, not as a final answer.'
};
const ending = 'Keep going until the user gives a verified stop or a safety rule blocks progress.';
module.exports = { opening, middle, ending };
