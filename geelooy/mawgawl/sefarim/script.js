// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryBoot
 * @description
 * The Awtsmoos breathes one small beginning into each library constellation;
 * Awtsmoos.com holds each search question across a new destination.
 * One vessel boots the search, one carries its text through every door;
 * the question can travel freely, and vanish nevermore.
 */

import { SearchApp } from './SearchApp.js';
import { bindSearchScopeNavigation } from './searchScopeNavigation.js';

const refreshScopeLinks = bindSearchScopeNavigation();
const livingLibrary = new SearchApp();

void livingLibrary.boot().finally(refreshScopeLinks);
