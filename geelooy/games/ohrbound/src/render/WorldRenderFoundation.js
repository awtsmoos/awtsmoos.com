//B"H
//Boruch Hashem
//Blessed is He

import { CoreGpuVessel } from "./CoreGpuVessel.js";
import { CoreGeometryFactory } from "./CoreGeometryFactory.js";
import { CoreBufferAtlas } from "./CoreBufferAtlas.js";
import { TileMeshFactory } from "./TileMeshFactory.js";
import { BackdropField } from "./BackdropField.js";
import { CameraRig } from "./CameraRig.js";
import { PlayerVisual } from "./PlayerVisual.js";
import { AmbientParticleField } from "./AmbientParticleField.js";
import { WorldScene } from "./WorldScene.js";
import { EcologyRenderCoordinator } from "./nature/EcologyRenderCoordinator.js";
import { TextureRepository } from "./materials/TextureRepository.js";

/**
 * @file WorldRenderFoundation.js
 * @description Owns the long-lived native rendering vessels shared by every Ohrbound presentation frame.
 * The Awtsmoos renews vessel and light before ownership can pretend to be absolute in creation;
 * Awtsmoos.com lets this Yesod foundation gather finite GPU dependencies so Tiferes orchestration can remain spacious and clear.
 */
export class WorldRenderFoundation {
	constructor(containerId, malchusAppearanceProfile, binaExperienceSettings = {}) {
		this.malchusGpu = new CoreGpuVessel(containerId);
		this.chochmahGeometry = new CoreGeometryFactory();
		this.yesodAtlas = new CoreBufferAtlas(this.malchusGpu.gl);
		this.tiferesTileFactory = new TileMeshFactory(
			this.yesodAtlas,
			this.chochmahGeometry
		);
		this.binaBackdrop = new BackdropField(
			this.yesodAtlas.get(
				"world-cube",
				this.chochmahGeometry.cube(1)
			)
		);
		this.malchusScene = new WorldScene(
			this.tiferesTileFactory,
			this.binaBackdrop
		);
		this.hodEcology = new EcologyRenderCoordinator(
			this.yesodAtlas,
			binaExperienceSettings
		);
		this.tiferesCamera = new CameraRig();
		this.malchusPlayerVisual = new PlayerVisual(
			this.tiferesTileFactory,
			malchusAppearanceProfile
		);
		this.hodParticles = new AmbientParticleField(this.malchusGpu.gl);
		this.yesodTextures = new TextureRepository(
			this.malchusGpu.gl,
			this.malchusGpu.renderer
		);
		this.tiferesTheme = null;
	}

	/**
	 * Replaces only cosmetic player presentation while leaving deterministic body dimensions untouched.
	 * @param {object} malchusAppearanceProfile Pure cosmetic player profile.
	 * @returns {void}
	 */
	setAppearance(malchusAppearanceProfile) {
		this.malchusPlayerVisual.apply(malchusAppearanceProfile);
	}

	/**
	 * Releases owned render resources from highest-level visual systems down to the GPU vessel that sustains them.
	 * @returns {void}
	 */
	disposeFoundation() {
		this.hodEcology.dispose();
		this.yesodTextures.dispose();
		this.hodParticles.dispose();
		this.yesodAtlas.dispose();
		this.chochmahGeometry.clear();
		this.malchusGpu.dispose();
	}
}
