// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = [
  'src/data/scenes/default/professional2d/outdoor/OutdoorBeats.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorCameras.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorCharacters.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorExpressions.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorProfessionalScene.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorProps.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorQualityGate.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorWeather.js',
  'src/data/scenes/default/professional2d/outdoor/OutdoorWorld.js',
  'src/core/renderer/scene/worlds/ProfessionalWorkshopWorld.js',
  'src/core/renderer/scene/worlds/professionalOutdoor/OutdoorLayerPainter.js',
  'src/core/renderer/scene/worlds/professionalOutdoor/OutdoorSkyPainter.js',
  'src/core/renderer/scene/worlds/professionalOutdoor/OutdoorWeatherPainter.js',
  ...['CinematicCompositionSolver','DirectingEngine','DirectorDashboard','DirectorNotesEngine','EmotionalLightingEngine','EyeContactDirector','PerformanceGraph','RelationshipMatrix','RhythmEngine','StoryArcGraph'].map(name => `src/director/intent/${name}.js`),
  'tools/verify/directingEngineSmoke.js',
  'tools/verify/outdoorProfessionalDefaultSmoke.js',
  'tools/verify/outdoorProfessionalSceneContractSmoke.js'
];
const blocked = ['pi' + 'xar', 'dis' + 'ney', 'dream' + 'works', 'ghi' + 'bli', 'illu' + 'mination'];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  assert.ok(text.split('\n').length <= 120, `${file} too long`);
  assert.ok(text.startsWith('// B"H'), `${file} missing B\"H header`);
  for (const term of blocked) assert.equal(text.toLowerCase().includes(term), false, `${file} contains blocked term`);
}
console.log('B"H outdoor professional file health smoke passed');
