// B"H
/**
 * StarterIdentityRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function identityQuestion(path){ return { who:'You are a '+(path?.title||'Learner')+' in a village that remembers kindness.', why:'Mitzvos matter here because every act changes relationships, services, and trust.', next:'Choose one helpful action and let the world answer.' }; }
export default { identityQuestion };
