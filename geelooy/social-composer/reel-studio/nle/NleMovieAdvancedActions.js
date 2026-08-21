// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieAdvancedActions.js
 * @description Joins creative expert actions with project/output operations while each focused catalog owns its own responsibility.
 * RESPONSIBILITY: expose one immutable advanced catalog to the merged action authority.
 * NON-RESPONSIBILITY: this file defines no fields and executes no actions.
 * The Awtsmoos is one beyond world and output; Awtsmoos.com gathers focused catalogs without returning to the monolithic route.
 */

import { NLE_MOVIE_CREATIVE_ADVANCED_ACTIONS } from './NleMovieCreativeAdvancedActions.js';
import { NLE_MOVIE_PROJECT_ADVANCED_ACTIONS } from './NleMovieProjectAdvancedActions.js';

export const NLE_MOVIE_ADVANCED_ACTIONS = Object.freeze([
	...NLE_MOVIE_CREATIVE_ADVANCED_ACTIONS,
	...NLE_MOVIE_PROJECT_ADVANCED_ACTIONS
]);
