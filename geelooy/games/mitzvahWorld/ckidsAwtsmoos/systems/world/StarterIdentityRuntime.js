// B"H
/**
 * @file StarterIdentityRuntime.js
 * @description
 * Starter identity is now owned by StarterExperienceBootstrap.
 *
 * Chapter: the player wakes inside a remembered village. The Awtsmoos does not
 * ask this file to invent a new world; it asks it to name the existing doorway
 * so the starter bootstrap can speak with one voice.
 */
export const STARTER_IDENTITY_OWNER = Object.freeze({
  owner:'StarterExperienceBootstrap',
  path:'ckidsAwtsmoos/systems/tutorial/StarterExperienceBootstrap.js',
  role:'starter-zone-catalog-identity',
  startsLoop:false,
  writesPersistence:false
});

export function identityQuestion(path = {}) {
  const title = path.title || 'Learner';
  return {
    who:`You are a ${title} in a village that remembers kindness.`,
    why:'Mitzvos matter here because every act changes relationships, services, and trust.',
    next:'Choose one helpful action and let the world answer.',
    owner:STARTER_IDENTITY_OWNER.owner
  };
}

export function starterIdentityCatalog(path = {}) {
  return Object.freeze({
    owner:STARTER_IDENTITY_OWNER,
    question:identityQuestion(path)
  });
}

export default Object.freeze({ STARTER_IDENTITY_OWNER, identityQuestion, starterIdentityCatalog });
