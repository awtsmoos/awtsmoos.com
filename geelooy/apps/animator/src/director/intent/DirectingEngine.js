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

export class DirectingEngine {
  static outdoorStormLantern(scene) {
    const storyArc = StoryArcGraph.outdoorStormLantern(), relationships = RelationshipMatrix.build();
    const plan = {
      storyArc, relationships, lighting: EmotionalLightingEngine.build(storyArc),
      performance: PerformanceGraph.build(scene.initialCharacters, storyArc),
      eyeContact: EyeContactDirector.build(relationships, storyArc), weatherNarrative: WeatherNarrativeTimeline.build(storyArc),
      directorNotes: DirectorNotesEngine.build(storyArc), composition: CinematicCompositionSolver.build(scene.cameras, storyArc),
      rhythm: RhythmEngine.build(storyArc), silenceBeats: SilenceBeatEngine.build(storyArc),
      propStates: LivingPropStateEngine.build(scene.initialProps, storyArc), environmentalMemory: EnvironmentalMemoryEngine.build(storyArc)
    };
    const withDashboard = { ...plan, dashboard: DirectorDashboard.build(scene, plan) };
    return { ...withDashboard, continuity: ContinuityValidator.audit(scene, withDashboard) };
  }
}
