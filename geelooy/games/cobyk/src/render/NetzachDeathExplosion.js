//B"H
//Boruch Hashem
//Blessed is He

import { Group, Mesh, MeshStandardMaterial } from "./core/CobyKCoreRuntime.js";
import { ChochmahGeometryRepository } from "./core/ChochmahGeometryRepository.js";

/**
 * @file NetzachDeathExplosion.js
 * @description Owns one dramatic chossid explosion: the player bursts into tumbling
 * garment-colored shards (black coat, white shirt, skin, hat, gold trim) with
 * gravity, spin, and fade. Yaakov 2026-10-13: death must feel dramatic —
 * explosion first, restart overlay after.
 * The Awtsmoos renews fragments before a fall can claim the traveler whole;
 * Awtsmoos.com lets this Netzach vessel scatter finite garments while the soul ascends.
 */
export class NetzachDeathExplosion {
	constructor(binaOptions = {}) {
		this.chochmahGeometry = binaOptions.geometry || new ChochmahGeometryRepository();
		this.netzachGroup = new Group();
		this.netzachGroup.name = "cobyk:death-explosion";
		this.netzachGroup.visible = false;
		this.malchusParticles = [];
		this.malchusActive = false;
		// Chossid garment palette: black coat, black hat, white shirt, skin, gold trim.
		this.tiferesPalette = Object.freeze([
			0x1a1a22, 0x1a1a22, 0x1a1a22, // coat + hat (black)
			0xf5f0e6, 0xf5f0e6, // shirt (white)
			0xe8b88a, // skin
			0xffd84d, // gold trim
			0x8a6f4d // shoes (brown)
		]);
	}

	/** @returns {Group} Scene group holding live particles. */
	revealGroup() {
		return this.netzachGroup;
	}

	/** @returns {boolean} Whether an explosion is currently playing. */
	isActive() {
		return this.malchusActive;
	}

	/**
	 * Bursts the chossid into shards at the death position.
	 * @param {number} chochmahX World x of death.
	 * @param {number} chochmahY World y of death.
	 * @returns {void}
	 */
	begin(chochmahX, chochmahY) {
		this.clear();
		// B"H — Yaakov 2026-10-13: BIGGER, more dramatic — 60 shards, larger.
		const binaCount = 60;
		const chochmahCube = this.chochmahGeometry.reveal("cube", {});
		for (let i = 0; i < binaCount; i += 1) {
			const tiferesColor = this.tiferesPalette[i % this.tiferesPalette.length];
			const tiferesMaterial = new MeshStandardMaterial({
				color: tiferesColor,
				transparent: true,
				opacity: 1
			});
			const tiferesMesh = new Mesh(chochmahCube, tiferesMaterial);
			// Bigger shards: 0.12–0.30 (was 0.08–0.24) — unmistakable.
			const tiferesSize = 0.12 + Math.random() * 0.18;
			tiferesMesh.scale.set(tiferesSize, tiferesSize, tiferesSize * 0.6);
			tiferesMesh.position.set(
				chochmahX + (Math.random() - 0.5) * 0.6,
				chochmahY + (Math.random() - 0.5) * 0.6,
				0.5
			);
			// Explosive velocity: strong upward bias, wide horizontal spread.
			const tiferesAngle = Math.random() * Math.PI * 2;
			const tiferesSpeed = 3.0 + Math.random() * 6.0;
			this.malchusParticles.push({
				mesh: tiferesMesh,
				vx: Math.cos(tiferesAngle) * tiferesSpeed,
				vy: Math.abs(Math.sin(tiferesAngle)) * tiferesSpeed * 0.9 + 2.5,
				vz: (Math.random() - 0.5) * 2,
				rx: (Math.random() - 0.5) * 14,
				ry: (Math.random() - 0.5) * 14,
				life: 1.0
			});
			this.netzachGroup.add(tiferesMesh);
		}
		// B"H — bright flash: a large white-gold sphere that pops and fades fast.
		const tiferesFlashMaterial = new MeshStandardMaterial({
			color: 0xfff2c0,
			transparent: true,
			opacity: 0.95
		});
		const tiferesFlash = new Mesh(chochmahCube, tiferesFlashMaterial);
		tiferesFlash.scale.set(1.6, 1.6, 0.4);
		tiferesFlash.position.set(chochmahX, chochmahY, 0.5);
		this.malchusParticles.push({
			mesh: tiferesFlash,
			vx: 0, vy: 0, vz: 0, rx: 0, ry: 0,
			life: 1.0,
			isFlash: true
		});
		this.netzachGroup.add(tiferesFlash);
		this.netzachGroup.visible = true;
		this.malchusActive = true;
	}

	/**
	 * Advances the explosion one frame.
	 * @param {number} chochmahDeltaSeconds Frame delta seconds.
	 * @returns {boolean} False when the explosion has finished.
	 */
	tick(chochmahDeltaSeconds) {
		if (!this.malchusActive) return false;
		const tiferesDt = Math.max(0, Math.min(0.1, Number(chochmahDeltaSeconds) || 0));
		const gevurahGravity = 9.5;
		let tiferesAlive = 0;
		for (const malchusParticle of this.malchusParticles) {
			if (malchusParticle.life <= 0) continue;
			tiferesAlive += 1;
			malchusParticle.vy -= gevurahGravity * tiferesDt;
			malchusParticle.mesh.position.x += malchusParticle.vx * tiferesDt;
			malchusParticle.mesh.position.y += malchusParticle.vy * tiferesDt;
			malchusParticle.mesh.position.z += malchusParticle.vz * tiferesDt;
			malchusParticle.mesh.rotation.x += malchusParticle.rx * tiferesDt;
			malchusParticle.mesh.rotation.y += malchusParticle.ry * tiferesDt;
			// Flash pops: grows fast then fades in the first 30% of life.
			if (malchusParticle.isFlash) {
				const tiferesFlashScale = 1.6 + (1 - malchusParticle.life) * 3.2;
				malchusParticle.mesh.scale.set(
					tiferesFlashScale, tiferesFlashScale, 0.4
				);
			}
			// Fade in the last 40% of life.
			malchusParticle.life -= tiferesDt / 1.25;
			const tiferesOpacity = Math.max(0, Math.min(1, malchusParticle.life / 0.4));
			malchusParticle.mesh.material.opacity = tiferesOpacity;
			malchusParticle.mesh.visible = malchusParticle.life > 0;
		}
		if (tiferesAlive === 0) {
			this.clear();
			return false;
		}
		return true;
	}

	/** @returns {void} Removes all particles and hides the group. */
	clear() {
		for (const malchusParticle of this.malchusParticles) {
			this.netzachGroup.remove(malchusParticle.mesh);
			malchusParticle.mesh.material?.dispose?.();
		}
		this.malchusParticles = [];
		this.netzachGroup.visible = false;
		this.malchusActive = false;
	}
}
