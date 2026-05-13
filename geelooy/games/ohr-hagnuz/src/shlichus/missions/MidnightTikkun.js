
/**
 * B"H
 * @module MidnightTikkun
 * @description
 * "At midnight I will rise to give thanks unto Thee..." (Psalms 119:62).
 * Tikkun Chatzot is the weeping over the exile of the Shechinah.
 */
export const MidnightTikkun = {
    id: 'SHLICHUS_MIDNIGHT_TIKKUN',
    title: 'The Midnight Lament',
    desc: 'The darkest time is just before the dawn. When the clock turns to NIGHT, enter Sector Vav and redeem 5 Sparks of the Panther.',
    reqType: 'GATHER_TIME_ITEM',
    reqId: 'PANTHER_WILD_ESSENCE', // Acquired by redeeming the Panther
    reqAmount: 5,
    reqTime: 'NIGHT',
    rewardGelt: 360,
    rewardItem: 'WEAPON_TEHILLIM', // Grants the Shield of Psalms
    status: 'LOCKED'
};
