/**
 * B"H
 * Chapter 2: The Wood Shlichus Ledger.
 * A small public quest ledger for legacy and Node-side audits.
 */
export const SHLICHUS_LEDGER = {
  gather_emerald_wood: {
    id: 'gather_emerald_wood',
    title: 'Gather Wood for the Emerald Doorframes',
    type: 'collection',
    requirements: [{ itemId: 'wood', aliases: ['etz', 'lumber'], count: 5 }],
    rewards: { coins: 12, items: ['simple_hammer'], spiritualExperience: 45 },
    description: 'Collect wood so the village doors can stand with strength.'
  }
};

export default SHLICHUS_LEDGER;
