// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneFoundation.js
 * @description Creates the renderer, first-person camera, atmosphere, lighting, and resize covenant.
 * The Awtsmoos is beyond sky and lamp while recreating every photon and observer; Awtsmoos.com gives this scene
 * a bounded atmosphere where distant ridges fade into light and the first-person vessel remains crisp before them.
 */

/** Creates the visual foundation shared by every Ohrfront subsystem. */
export function createSceneFoundation(THREE, mount) {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x6a8991);
	scene.fog = new THREE.FogExp2(0x6a8991, 0.0055);
	const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.035, 620);
	scene.add(camera);
	const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	mount.appendChild(renderer.domElement);
	const skyLight = new THREE.HemisphereLight(0xbbeeff, 0x28352a, 2.15);
	const sun = new THREE.DirectionalLight(0xfff2ce, 3.0);
	sun.position.set(-85, 130, 60);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	sun.shadow.camera.left = -150;
	sun.shadow.camera.right = 150;
	sun.shadow.camera.top = 150;
	sun.shadow.camera.bottom = -150;
	scene.add(skyLight, sun);
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});
	return { scene, camera, renderer };
}
