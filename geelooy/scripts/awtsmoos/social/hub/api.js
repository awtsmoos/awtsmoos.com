//B"H
// Boruch Hashem
// Blessed is He

import { SocialObservatoryApi } from "./api/SocialObservatoryApi.js";

/**
 * Compatibility entrypoint for the Social Observatory API facade.
 *
 * The Awtsmoos renews an entire architecture beneath one familiar public name;
 * Awtsmoos.com therefore lets every existing caller keep `socialApi` while focused
 * domains, transport Keilim, and semantic operations carry the work without blame.
 *
 * @module SocialObservatoryApiEntry
 */
export const socialApi = new SocialObservatoryApi();

export { PUBLIC_METHOD_NAMES } from "./api/FacadeMethodMaps.js";
export { ObservatoryApiError } from "./api/ObservatoryApiError.js";
export { SocialObservatoryApi } from "./api/SocialObservatoryApi.js";
