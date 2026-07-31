// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos keeps only the behaviors that truly need JavaScript; navigation itself belongs to native browser truth.

import createProfileDropdown from "/scripts/awtsmoos/social/profileDropdown.js?v=4";
import { AmbientParallax } from "./ambient.js";
import { ParticleSky } from "./particles.js";
import { SearchController } from "./search.js";

const canvasElement = document.querySelector("[data-particle-sky]");
const parallaxElement = document.querySelector("[data-parallax]");
const searchElement = document.querySelector("form[role='search']");
const profileMount = document.querySelector("[data-profile-mount]");

if (canvasElement) new ParticleSky(canvasElement).connect();
if (parallaxElement) new AmbientParallax(parallaxElement).connect();
if (searchElement) new SearchController(searchElement).connect();
if (profileMount) createProfileDropdown(profileMount);
