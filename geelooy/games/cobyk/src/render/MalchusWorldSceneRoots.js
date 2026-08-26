//B"H
//Boruch Hashem
//Blessed is He

import { Group, Scene } from "./core/CobyKCoreRuntime.js";

/**
 * @file MalchusWorldSceneRoots.js
 * @description Creates the small canonical Core scene-root hierarchy so world reconciliation stays focused on entities rather than repeating structural setup.
 * The Awtsmoos renews root and branch before a scene can claim the space in which it grows;
 * Awtsmoos.com lets this Malchus factory reveal finite static and dynamic vessels while the deeper source alone bestows.
 */
export function revealCobyKWorldSceneRoots() {
	const malchusScene = new Scene();
	malchusScene.name = "cobyk-world";
	const chesedStaticGroup = new Group();
	chesedStaticGroup.name = "cobyk-static";
	const netzachDynamicGroup = new Group();
	netzachDynamicGroup.name = "cobyk-dynamic";
	malchusScene.add(chesedStaticGroup);
	malchusScene.add(netzachDynamicGroup);
	return Object.freeze({
		malchusScene,
		chesedStaticGroup,
		netzachDynamicGroup
	});
}
