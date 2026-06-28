// B"H
import { EmotionalLightingEngine } from './EmotionalLightingEngine.js';
import { PerformanceGraph } from './PerformanceGraph.js';
import { EyeContactDirector } from './EyeContactDirector.js';
import { WeatherNarrativeTimeline } from './WeatherNarrativeTimeline.js';
import { DirectorNotesEngine } from './DirectorNotesEngine.js';
import { RelationshipMatrix } from './RelationshipMatrix.js';
import { CinematicCompositionSolver } from './CinematicCompositionSolver.js';
import { RhythmEngine } from './RhythmEngine.js';
import { StoryArcGraph } from './StoryArcGraph.js';
import { DirectorDashboard } from './DirectorDashboard.js';
import { SilenceBeatEngine } from './SilenceBeatEngine.js';
import { LivingPropStateEngine } from './LivingPropStateEngine.js';
import { EnvironmentalMemoryEngine } from './EnvironmentalMemoryEngine.js';
import { ContinuityValidator } from './ContinuityValidator.js';
import { SceneIntentScorer } from './SceneIntentScorer.js';
import { CameraPsychologyValidator } from './CameraPsychologyValidator.js';
import { DirectorReportExporter } from './DirectorReportExporter.js';
import { ShotTransitionPlanner } from './ShotTransitionPlanner.js';
import { AudioNarrativeDirector } from './AudioNarrativeDirector.js';
import { GestureSynthesisEngine } from './GestureSynthesisEngine.js';
import { BlockingSolver } from './BlockingSolver.js';
import { LensLanguagePlanner } from './LensLanguagePlanner.js';
import { CrowdBehaviorDirector } from './CrowdBehaviorDirector.js';
import { SceneContinuityMemory } from './SceneContinuityMemory.js';

export class DirectingEngine {
  static outdoorStormLantern(scene) {
    const storyArc = StoryArcGraph.outdoorStormLantern(), relationships = RelationshipMatrix.build();
    const weatherNarrative = WeatherNarrativeTimeline.build(storyArc);
    const base = { storyArc, relationships, lighting: EmotionalLightingEngine.build(storyArc), performance: PerformanceGraph.build(scene.initialCharacters, storyArc), eyeContact: EyeContactDirector.build(relationships, storyArc), weatherNarrative, directorNotes: DirectorNotesEngine.build(storyArc), composition: CinematicCompositionSolver.build(scene.cameras, storyArc), rhythm: RhythmEngine.build(storyArc), silenceBeats: SilenceBeatEngine.build(storyArc), propStates: LivingPropStateEngine.build(scene.initialProps, storyArc), environmentalMemory: EnvironmentalMemoryEngine.build(storyArc), transitions: ShotTransitionPlanner.build(scene.cameras, storyArc), audioNarrative: AudioNarrativeDirector.build(storyArc, weatherNarrative), gestures: GestureSynthesisEngine.build(scene.initialCharacters, storyArc), blocking: BlockingSolver.build(scene.initialCharacters, storyArc), lensLanguage: LensLanguagePlanner.build(scene.cameras, storyArc), crowdBehavior: CrowdBehaviorDirector.build(storyArc) };
    const continuityMemory = SceneContinuityMemory.build(scene, base);
    const continuity = ContinuityValidator.audit(scene, { ...base, continuityMemory }), intentScore = SceneIntentScorer.score(scene, { ...base, continuity });
    const cameraPsychology = CameraPsychologyValidator.audit(scene, base);
    const plan = { ...base, continuityMemory, continuity, intentScore, cameraPsychology };
    const withDashboard = { ...plan, dashboard: DirectorDashboard.build(scene, plan) };
    return { ...withDashboard, report: DirectorReportExporter.export(scene, withDashboard) };
  }
}
