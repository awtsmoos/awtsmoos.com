// B"H
/**
 * @file BuildingManifestor.js
 * @description
 * Chapter 340: The architect imports the freshly carved manifestation limb.
 *
 * The Awtsmoos joins grounding, material, and the new dual-body house pipeline:
 * visual bricks for the eye, hidden carved slabs for the feet.
 */
import grounding from './building/grounding.js';
import textures from './building/textures.js';
import manifestation from './building/manifestation.js?v=dual-body-house-20260603-bh340';
import ChasveiAwtsmoos from "../../../utils/ChasveiAwtsmoos.js";

export default class BuildingManifestor {}

ChasveiAwtsmoos.emanate(BuildingManifestor, [grounding, textures, manifestation]);
