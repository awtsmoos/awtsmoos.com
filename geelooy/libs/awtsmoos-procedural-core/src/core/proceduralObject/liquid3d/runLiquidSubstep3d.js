// B"H
// Boruch Hashem
// Blessed is He
/** One liquid substep transfers, constrains, projects, returns, and collides. */

import { collideParticleSystemWithSolids3d } from "../solid3d/collideParticleSystemWithSolids3d.js";
import { constrainLiquidGridToSolids3d } from "../solid3d/constrainLiquidGridToSolids3d.js";
import { advectLiquidParticles3d } from "./advectLiquidParticles3d.js";
import { applyLiquidGridForces3d } from "./applyLiquidGridForces3d.js";
import { measureGridDivergenceL1 } from "./measureLiquidState3d.js";
import { projectLiquidVelocity3d } from "./projectLiquidVelocity3d.js";
import { transferGridToParticles3d } from "./transferGridToParticles3d.js";
import { transferParticlesToGrid3d } from "./transferParticlesToGrid3d.js";

export function runLiquidSubstep3d(input) {
	const {
		particleSystem,
		grid,
		blend,
		solidColliders,
		deltaTime,
		options
	} = input;
	const transfer = transferParticlesToGrid3d(particleSystem, grid);
	const forced = applyLiquidGridForces3d(
		transfer.velocityGrid,
		transfer.massGrid,
		{ ...options, deltaTime }
	);
	const beforePressure = constrainLiquidGridToSolids3d(
		forced,
		solidColliders,
		options
	);
	const pressure = projectLiquidVelocity3d(beforePressure.velocityGrid, options);
	const afterPressure = constrainLiquidGridToSolids3d(
		pressure.velocityGrid,
		solidColliders,
		options
	);
	let nextParticles = transferGridToParticles3d(
		particleSystem,
		afterPressure.velocityGrid,
		transfer.velocityGrid,
		blend
	);
	nextParticles = advectLiquidParticles3d(
		nextParticles,
		grid,
		{ ...options, deltaTime }
	);
	const collision = collideParticleSystemWithSolids3d(
		nextParticles,
		solidColliders,
		{
			...options,
			collisionIterations: options.solidCollisionIterations
				?? options.collisionIterations
		}
	);
	return Object.freeze({
		particleSystem: collision.particleSystem,
		massGrid: transfer.massGrid,
		velocityGrid: afterPressure.velocityGrid,
		previousVelocityGrid: transfer.velocityGrid,
		report: Object.freeze({
			activeCellCount: transfer.activeCellCount,
			divergenceBefore: pressure.divergenceBefore,
			divergenceAfter: measureGridDivergenceL1(afterPressure.velocityGrid),
			projectionAccepted: pressure.projectionAccepted,
			acceptedIterations: pressure.acceptedIterations,
			solidContactCount: collision.contactCount,
			solidProjectedParticleEvents: collision.projectedParticleCount,
			solidConstrainedCellCount: beforePressure.constrainedCellCount
				+ afterPressure.constrainedCellCount,
			solidInteriorCellCount: beforePressure.interiorCellCount
				+ afterPressure.interiorCellCount
		})
	});
}
