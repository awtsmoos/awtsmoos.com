// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const names = ['AttentionEngine','AudioNarrativeDirector','BlockingSolver','CameraPsychologyValidator','CinematicCompositionSolver','ContinuityValidator','CrowdBehaviorDirector','DirectingEngine','DirectorBrain','DirectorDashboard','DirectorNotesEngine','DirectorQA','DirectorReportExporter','EmotionalColorScript','EmotionalLightingEngine','EnvironmentalMemoryEngine','EnvironmentalPhysicsLayer','EyeContactDirector','FacialPerformanceEngine','GestureSynthesisEngine','InteractionEngine','LensLanguagePlanner','LiveCameraDirector','LivingPropStateEngine','MicroExpressionTimeline','MotivationGraph','PerformanceGraph','ProceduralActingEngine','RelationshipMatrix','RhythmEngine','SceneContinuityMemory','SceneIntentScorer','SceneStateMachine','SecondaryMotionDirector','ShotTransitionPlanner','SilenceBeatEngine','StoryArcGraph','VisualHierarchySolver','WeatherNarrativeTimeline','WorldEventScheduler'];
const files = ['src/data/scenes/default/professional2d/outdoor/OutdoorProfessionalScene.js', ...names.map(name => `src/director/intent/${name}.js`), 'tools/verify/directingEngineSmoke.js', 'tools/verify/outdoorProfessionalDefaultSmoke.js', 'tools/verify/outdoorProfessionalSceneContractSmoke.js'];
const blocked = ['pi' + 'xar', 'dis' + 'ney', 'dream' + 'works', 'ghi' + 'bli', 'illu' + 'mination'];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  assert.ok(text.split('\n').length <= 120, `${file} too long`);
  assert.ok(text.startsWith('// B"H'), `${file} missing B\"H header`);
  for (const term of blocked) assert.equal(text.toLowerCase().includes(term), false, `${file} contains blocked term`);
}
console.log('B"H outdoor professional file health smoke passed');
