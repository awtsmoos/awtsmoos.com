// B"H
/**
 * @file entrySceneManifest.js
 * @description Chapter 407: The first visible screen is named as a scene, not
 * an accident: title, quest, guide, tree, HUD, and target composition.
 */
export const ENTRY_SCENE_MANIFEST = Object.freeze({
  id: 'emerald_first_entry_scene',
  title: 'EMERALD VILLAGE',
  subtitle: 'FIRST ENTRY LEVEL',
  prompt: 'Press [E] to Talk',
  quest: { title: 'A New Beginning', text: 'Speak to the Mitzvah Level Guide near the Tree of Life.' },
  guideNpcId: 'central_level_guide',
  landmarkId: 'entry_giant_etz_chayim'
});
