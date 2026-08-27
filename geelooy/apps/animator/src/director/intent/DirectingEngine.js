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
import { AttentionEngine } from './AttentionEngine.js';
import { MotivationGraph } from './MotivationGraph.js';
import { MicroExpressionTimeline } from './MicroExpressionTimeline.js';
import { SecondaryMotionDirector } from './SecondaryMotionDirector.js';
import { VisualHierarchySolver } from './VisualHierarchySolver.js';
import { EmotionalColorScript } from './EmotionalColorScript.js';
import { SceneStateMachine } from './SceneStateMachine.js';
import { DirectorBrain } from './DirectorBrain.js';
import { InteractionEngine } from './InteractionEngine.js';
import { EnvironmentalPhysicsLayer } from './EnvironmentalPhysicsLayer.js';
import { LiveCameraDirector } from './LiveCameraDirector.js';
import { FacialPerformanceEngine } from './FacialPerformanceEngine.js';
import { ProceduralActingEngine } from './ProceduralActingEngine.js';
import { WorldEventScheduler } from './WorldEventScheduler.js';
import { DirectorQA } from './DirectorQA.js';

export class DirectingEngine {
  static outdoorStormLantern(scene) {
    const storyArc = StoryArcGraph.outdoorStormLantern(), relationships = RelationshipMatrix.build();
    const weatherNarrative = WeatherNarrativeTimeline.build(storyArc), lighting = EmotionalLightingEngine.build(storyArc);
    const attention = AttentionEngine.build(scene.initialCharacters, storyArc), motivation = MotivationGraph.build(scene.initialCharacters, storyArc);
    const microExpressions = MicroExpressionTimeline.build(scene.initialCharacters, storyArc), visualHierarchy = VisualHierarchySolver.build(scene, storyArc);
    const blocking = BlockingSolver.build(scene.initialCharacters, storyArc), gestures = GestureSynthesisEngine.build(scene.initialCharacters, storyArc);
    const base = { storyArc, relationships, lighting, performance: PerformanceGraph.build(scene.initialCharacters, storyArc), eyeContact: EyeContactDirector.build(relationships, storyArc), weatherNarrative, directorNotes: DirectorNotesEngine.build(storyArc), composition: CinematicCompositionSolver.build(scene.cameras, storyArc), rhythm: RhythmEngine.build(storyArc), silenceBeats: SilenceBeatEngine.build(storyArc), propStates: LivingPropStateEngine.build(scene.initialProps, storyArc), environmentalMemory: EnvironmentalMemoryEngine.build(storyArc), transitions: ShotTransitionPlanner.build(scene.cameras, storyArc), audioNarrative: AudioNarrativeDirector.build(storyArc, weatherNarrative), gestures, blocking, lensLanguage: LensLanguagePlanner.build(scene.cameras, storyArc), crowdBehavior: CrowdBehaviorDirector.build(storyArc), attention, motivation, microExpressions, secondaryMotion: SecondaryMotionDirector.build(scene.initialCharacters, scene.initialProps, weatherNarrative), visualHierarchy, emotionalColorScript: EmotionalColorScript.build(storyArc) };
    const reactive = { ...base, interaction: InteractionEngine.build(scene.initialCharacters, relationships, storyArc), environmentalPhysics: EnvironmentalPhysicsLayer.build(scene, weatherNarrative, lighting), liveCamera: LiveCameraDirector.build(scene.cameras, visualHierarchy, blocking), facialPerformance: FacialPerformanceEngine.build(scene.initialCharacters, microExpressions, attention), proceduralActing: ProceduralActingEngine.build(scene.initialCharacters, motivation, gestures), worldEvents: WorldEventScheduler.build(storyArc, weatherNarrative) };
    const sceneState = SceneStateMachine.build(scene, reactive), continuityMemory = SceneContinuityMemory.build(scene, reactive);
    const living = { ...reactive, sceneState, continuityMemory };
    const directorBrain = DirectorBrain.audit(scene, living), continuity = ContinuityValidator.audit(scene, living), intentScore = SceneIntentScorer.score(scene, { ...living, continuity });
    const cameraPsychology = CameraPsychologyValidator.audit(scene, living);
    const qa = DirectorQA.audit(scene, { ...living, directorBrain });
    const plan = { ...living, directorBrain, continuity, intentScore, cameraPsychology, qa };
    const withDashboard = { ...plan, dashboard: DirectorDashboard.build(scene, plan) };
    return { ...withDashboard, report: DirectorReportExporter.export(scene, withDashboard) };
  }
}
