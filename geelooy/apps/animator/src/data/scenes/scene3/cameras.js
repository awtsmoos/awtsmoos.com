// B"H

/** Stable mobile shots; no face-flood closeups. */
export const SCENE3_CAMERAS = [
  { id: 's3_master', type: 'wide', x: 0, y: 145, zoom: 0.56, transition: 'cut', renderDetailMode: 'wide' },
  { id: 's3_group', type: 'group', x: 0, y: 175, zoom: 0.72, transition: 'ease', renderDetailMode: 'wide' },
  { id: 's3_two_left', type: 'twoShot', targetMode: 'multi', targetActors: ['guide', 'builder'], y: 190, zoom: 0.95, transition: 'ease', renderDetailMode: 'medium' },
  { id: 's3_builder_medium', type: 'medium', targetMode: 'actor', targetActors: ['builder'], y: 205, zoom: 1.08, transition: 'ease', renderDetailMode: 'medium' },
  { id: 's3_prop_safe', type: 'insert', targetMode: 'prop', targetProp: 'idea_sun', y: 190, zoom: 1.12, transition: 'cut', renderDetailMode: 'medium' }
];
