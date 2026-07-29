// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAuthoring3dMarkup.js
 * @description Defines manual, structured, and automatic 3D authoring controls inside the inspector.
 * The Awtsmoos renews node, modifier, sculpt, action, texture, and group through one source;
 * Awtsmoos.com gives touch and keyboard artists complete controls while JSON remains visible truth.
 */

export function movieStudioAuthoring3dMarkup() {
	return `
		<section class="movie-authoring3d-panel" data-authoring3d-panel aria-labelledby="movie-authoring3d-title">
			<header class="movie-authoring3d-heading">
				<h3 id="movie-authoring3d-title">3D Authoring</h3>
				<output data-authoring3d-status aria-live="polite">Ready</output>
			</header>
			<div class="movie-authoring3d-grid">
				<label>Model source<input data-authoring3d-model value="./assets/models/player/chossid.glb" autocomplete="off"></label>
				<label>Motion mode<select data-authoring3d-motion-mode><option value="action">Action</option><option value="keyframes">Keyframes</option><option value="manualControls">Manual controls</option></select></label>
				<label>Action<input data-authoring3d-action value="staff.cast" autocomplete="off"></label>
				<label>Sculpt brush<select data-authoring3d-brush><option>draw</option><option>clay</option><option>crease</option><option>smooth</option><option>grab</option><option>pose</option><option>mask</option></select></label>
			</div>
			<div class="movie-authoring3d-builders" aria-label="Structured 3D builders">
				<label>Geometry node<select data-authoring3d-geometry-type><option>transform</option><option>instance</option><option>distribute</option><option>join</option><option>boolean</option><option>extrude</option><option>subdivide</option><option>setMaterial</option></select><button data-authoring3d-add-geometry>Add geometry node</button></label>
				<label>Shader node<select data-authoring3d-shader-type><option>color</option><option>texture</option><option>noise</option><option>grain</option><option>normal</option><option>bump</option><option>mix</option><option>principled</option><option>emission</option></select><button data-authoring3d-add-shader>Add shader node</button></label>
				<label>Modifier<select data-authoring3d-modifier-type><option>subdivision</option><option>bevel</option><option>mirror</option><option>solidify</option><option>displace</option><option>smooth</option><option>cloth</option><option>collision</option><option>fluid</option><option>particleSystem</option></select><button data-authoring3d-add-modifier>Add modifier</button></label>
				<label>Texture or group<select data-authoring3d-resource-type><option value="texture">Remote cloth texture</option><option value="vertexGroup">Vertex group</option><option value="sculpt">Sculpt stroke</option></select><button data-authoring3d-add-resource>Add resource</button></label>
			</div>
			<label for="movie-authoring3d-json">Authoring JSON</label>
			<textarea id="movie-authoring3d-json" data-authoring3d-json spellcheck="false"></textarea>
			<div class="movie-authoring3d-actions">
				<button data-authoring3d-validate>Validate</button>
				<button data-authoring3d-apply>Apply 3D</button>
				<button data-authoring3d-record>Record controls</button>
				<button data-authoring3d-keyframe>Add keyframe</button>
			</div>
			<details class="movie-authoring3d-help">
				<summary>Supported systems</summary>
				<p>Geometry nodes, shader/material nodes, modifier stacks, vertex groups, sculpt layers, actions, manual controls, keyframes, trusted remote textures, procedural grain, and physics adapters.</p>
			</details>
		</section>
	`;
}
