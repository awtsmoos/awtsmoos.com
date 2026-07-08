/**
 * B"H
 * @file registry.js
 * @description
 * 📜 THE BOOK OF MISSIONS REGISTRY 📜
 * 
 * Aggregates all modular mission files into a single holy collection.
 */

import { refinement_missions } from './refinement/northern_forest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scholar_debate_missions } from './clarification/scholar_debates.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { collection_missions } from './collection/village_collection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const SHLICHUS_REGISTRY = {
    ...refinement_missions,
    ...scholar_debate_missions,
    ...collection_missions
};
