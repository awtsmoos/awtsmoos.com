// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const names = ['AudioNarrativeDirector','BlockingSolver','CameraPsychologyValidator','CinematicCompositionSolver','ContinuityValidator','CrowdBehaviorDirector','DirectingEngine','DirectorDashboard','DirectorNotesEngine','DirectorReportExporter','EmotionalLightingEngine','EnvironmentalMemoryEngine','EyeContactDirector','GestureSynthesisEngine','LensLanguagePlanner','LivingPropStateEngine','PerformanceGraph','RelationshipMatrix','RhythmEngine','SceneContinuityMemory','SceneIntentScorer','ShotTransitionPlanner','SilenceBeatEngine','StoryArcGraph','WeatherNarrativeTimeline'];
const files = ['src/data/scenes/default/professional2d/outdoor/OutdoorProfessionalScene.js', ...names.map(name => `src/director/intent/${name}.js`), 'tools/verify/directingEngineSmoke.js', 'tools/verify/outdoorProfessionalDefaultSmoke.js', 'tools/verify/outdoorProfessionalSceneContractSmoke.js'];
const blocked = ['pi' + 'xar', 'dis' + 'ney', 'dream' + 'works', 'ghi' + 'bli', 'illu' + 'mination'];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  assert.ok(text.split('\n').length <= 120, `${file} too long`);
  assert.ok(text.startsWith('// B"H'), `${file} missing B\"H header`);
  for (const term of blocked) assert.equal(text.toLowerCase().includes(term), false, `${file} contains blocked term`);
}
console.log('B"H outdoor professional file health smoke passed');
