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

export class DirectingEngine {
  static outdoorStormLantern(scene) {
    const storyArc = StoryArcGraph.outdoorStormLantern();
    const relationships = RelationshipMatrix.build();
    const plan = {
      storyArc, relationships,
      lighting: EmotionalLightingEngine.build(storyArc),
      performance: PerformanceGraph.build(scene.initialCharacters, storyArc),
      eyeContact: EyeContactDirector.build(relationships, storyArc),
      weatherNarrative: WeatherNarrativeTimeline.build(storyArc),
      directorNotes: DirectorNotesEngine.build(storyArc),
      composition: CinematicCompositionSolver.build(scene.cameras, storyArc),
      rhythm: RhythmEngine.build(storyArc)
    };
    return { ...plan, dashboard: DirectorDashboard.build(scene, plan) };
  }
}
