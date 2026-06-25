// B"H
/**
 * BossEncounterRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createBossEncounterRuntime(){ let hp=100; return { hit(n=10){hp=Math.max(0,hp-n);return {hp,phase:hp>50?1:2,done:hp<=0};}, mechanic(){return hp>50?'step_out_of_glow':'use_peace_ability';} }; }
export default createBossEncounterRuntime;
