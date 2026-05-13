/**
 * B"H
 * @file registry.js
 * @description
 * 📜 THE BOOK OF MISSIONS REGISTRY 📜
 * 
 * Aggregates all modular mission files into a single holy collection.
 */

import { refinement_missions } from './refinement/northern_forest.js';
import { scholar_debate_missions } from './clarification/scholar_debates.js';
import { collection_missions } from './collection/village_collection.js';

export const SHLICHUS_REGISTRY = {
    ...refinement_missions,
    ...scholar_debate_missions,
    ...collection_missions
};
