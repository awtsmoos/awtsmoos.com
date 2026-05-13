
/**
 * B"H
 * @module LogicOfTheMasters
 * @description
 * To wield the Talmud, one must prove mastery over the material world.
 * "If two hold a garment, they must divide it."
 */
export const LogicOfTheMasters = {
    id: 'SHLICHUS_TALMUD_LOGIC',
    title: 'The Logic of the Masters',
    desc: 'The Gemara contains the ultimate logic to bind the physical world. Travel to Sector Chet (The South Gate) and defeat the Ox of Severity to earn the tractate of Bava Metzia.',
    reqType: 'DEFEAT_ENEMY',
    reqId: 'OX_STUBBORN',
    reqAmount: 1,
    rewardGelt: 150,
    rewardItem: 'P_BAVAMETZIA_1', // Grants the Gemara directly!
    status: 'LOCKED'
};
