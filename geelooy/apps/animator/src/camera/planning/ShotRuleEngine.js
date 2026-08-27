// B"H
import { ShotCandidateGenerator } from './ShotCandidateGenerator.js';import { ShotScorer } from './ShotScorer.js';
export class ShotRuleEngine{static choose(intent,targets,event,prev){const candidates=ShotCandidateGenerator.generate(intent,targets,event);return ShotScorer.best(candidates,targets,event,prev);}}
