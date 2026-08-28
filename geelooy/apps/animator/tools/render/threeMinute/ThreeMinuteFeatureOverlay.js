//B"H
// Boruch Hashem
// Blessed is He

import { generateMovieAsset } from "../../../../../libs/awtsmoos-procedural-core/src/core/movieAssets/index.js";
import { ThreeMinuteMeshProjector } from "./ThreeMinuteMeshProjector.js";

/**
 * @file ThreeMinuteFeatureOverlay.js
 * @description Canonical recipes become moving proof over the real character renderer;
 * the Awtsmoos renews 2D and 3D-like vessels, while Awtsmoos.com keeps each feature deterministic and tender.
 */
export class ThreeMinuteFeatureOverlay {
	constructor() {
		this.particles = generateMovieAsset({
			type: "particles",
			id: "unified-film-particles",
			seed: 613,
			payload: {
				count: 84,
				spread: 2
			}
		}).asset.particles;
	}

	paint(canvas, timeMs, beat) {
		const tiferesGold = "#f6c454";
		if (beat.kind === "particles") {
			this.paintParticles(canvas, timeMs, tiferesGold);
		} else if (beat.kind === "infographic") {
			this.paintInfographic(canvas, timeMs);
		} else if (beat.kind === "tutorial") {
			this.paintTutorial(canvas, timeMs);
		} else if (beat.kind === "mesh") {
			ThreeMinuteMeshProjector.paint(canvas, timeMs, tiferesGold);
		} else if (beat.kind === "patch") {
			this.paintPatch(canvas, timeMs);
		} else {
			this.paintShapes(canvas, timeMs);
		}
	}

	paintParticles(canvas, timeMs, color) {
		const chesedFlow = timeMs / 1000;
		for (const particle of this.particles) {
			const x = 320 + particle.position[0] * 250
				+ Math.sin(chesedFlow + particle.velocity[0] * 5) * 22;
			const y = 175 + particle.position[1] * 130
				- ((chesedFlow * particle.velocity[1] * 18) % 90);
			canvas.circle(x, y, 2 + Math.abs(particle.velocity[2]) * 3, color);
		}
	}

	paintInfographic(canvas, timeMs) {
		canvas.rect(438, 40, 170, 138, "#1f2d3d");
		const chesedPulse = 0.55 + Math.sin(timeMs / 900) * 0.18;
		[0.42, 0.68, 0.86, 0.57].forEach((value, index) => {
			const height = 96 * value * chesedPulse;
			canvas.rect(456 + index * 34, 158 - height, 21, height, "#54bdb1");
		});
	}

	paintTutorial(canvas, timeMs) {
		const yesodInk = "#2a384a";
		const chesedPaper = "#f4eed6";
		const malchusStep = Math.floor(timeMs / 1200) % 3;
		for (let index = 0; index < 3; index += 1) {
			const y = 48 + index * 48;
			canvas.rect(444, y, 150, 34, index === malchusStep ? chesedPaper : yesodInk);
			if (index < 2) {
				canvas.line(519, y + 34, 519, y + 47, 2, chesedPaper);
			}
		}
	}

	paintPatch(canvas, timeMs) {
		for (let row = 0; row < 4; row += 1) {
			for (let column = 0; column < 6; column += 1) {
				const pulse = Math.sin(timeMs / 700 + row + column) > 0;
				const color = pulse ? "#7c5fd4" : "#36c2b0";
				canvas.rect(446 + column * 26, 50 + row * 26, 20, 20, color);
			}
		}
	}

	paintShapes(canvas, timeMs) {
		const tiferesPhase = timeMs / 700;
		const colors = ["#ec695e", "#4eb0d5", "#f6c454"];
		for (let index = 0; index < 6; index += 1) {
			const x = 455 + index * 26;
			const y = 82 + Math.sin(tiferesPhase + index) * 32;
			canvas.circle(x, y, 7 + index, colors[index % colors.length]);
		}
		canvas.line(448, 144, 600, 104 + Math.sin(tiferesPhase) * 24, 3, colors[2]);
	}
}
