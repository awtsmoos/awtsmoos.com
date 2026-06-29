// B"H

const cam = (id, type, at, zoom, y, extra = {}) => ({
  id, name: id.replaceAll('_', ' '), type, at, x: 0, y, zoom,
  transition: at === 0 ? 'cut' : 'ease', duration: 220, ...extra
});

export const PROFESSIONAL_CAMERAS = [
  cam('opening_storybook_wide', 'establishingShot', 0, .72, 116, { targetMode: 'multi', targetActors: ['inventor_hero', 'elder_mentor', 'pompous_mayor'] }),
  cam('hero_lantern_insert', 'objectInsert', 1800, 1.74, 130, { targetMode: 'prop', targetProp: 'hero_lantern', renderDetailMode: 'closeup' }),
  cam('hero_face_close', 'reactionShot', 3400, 2.05, 128, { targetMode: 'actor', targetActors: ['inventor_hero'], renderDetailMode: 'closeup' }),
  cam('mentor_soft_two', 'twoShot', 5200, 1.15, 130, { targetMode: 'multi', targetActors: ['inventor_hero', 'elder_mentor'] }),
  cam('sidekick_gag_low', 'lowAngle', 7200, 1.52, 146, { targetMode: 'actor', targetActors: ['tiny_sidekick'] }),
  cam('mayor_pressure_close', 'reactionShot', 9200, 1.92, 130, { targetMode: 'actor', targetActors: ['pompous_mayor'], renderDetailMode: 'closeup' }),
  cam('spark_reveal_insert', 'objectInsert', 11200, 1.82, 132, { targetMode: 'prop', targetProp: 'lantern_core', renderDetailMode: 'closeup' }),
  cam('ensemble_resolution', 'wideShot', 14800, .82, 116, { targetMode: 'multi', targetActors: ['inventor_hero', 'elder_mentor', 'tiny_sidekick', 'pompous_mayor'] })
];

export const PROFESSIONAL_SHOT_FLOW = PROFESSIONAL_CAMERAS.map(({ at, type, id }) => ({
  at, name: type, purpose: id.replaceAll('_', ' ')
}));
