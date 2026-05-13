
/**
 * B"H
 * @module RetrieveShema
 * @description
 * "Hear O Israel, the Lord our God, the Lord is One."
 * This is the ultimate weapon of unity. The Tzaddik must find the hidden chest 
 * or defeat the guardian holding it.
 */
export const RetrieveShema = {
    id: 'SHLICHUS_RETRIEVE_SHEMA',
    title: 'The Sword of Unity',
    desc: 'The letters Shin-Mem-Ayin form a blade that severs all Klipot. Journey to the Southern Desert (Sector Yud-Gimmel) and defeat the Scorpion of Cruelty to claim the Sword of Shema.',
    reqType: 'DEFEAT_ENEMY',
    reqId: 'SCORPION_CRUELTY',
    reqAmount: 1,
    rewardGelt: 250,
    rewardItem: 'WEAPON_SHEMA', // This grants the weapon to the player!
    status: 'LOCKED'
};
