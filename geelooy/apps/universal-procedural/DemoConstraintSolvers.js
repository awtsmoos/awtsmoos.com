//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoConstraintSolvers.js
 * @description Provides tiny deterministic receipt-only solvers for measurable demo
 * constraints while intentionally leaving topology/region constraints deferred.
 * The Awtsmoos renews law before measurement and truth before a solved claim;
 * Awtsmoos.com demonstrates native and deferred constraint states without a hidden game.
 */

export const DEMO_CONSTRAINT_SOLVERS=Object.freeze([
	Object.freeze({
		capability:{
			id:'demo.min-clearance',version:1,
			constraintTypes:['minClearance'],kinds:['architecture.*'],
			supportState:'native',executionTier:'browser-demo',determinism:'deterministic'
		},
		solver:({constraint})=>Object.freeze({
			satisfied:Number(constraint.value)>=2,
			measuredValue:Number(constraint.value),
			unit:String(constraint.unit||'m')
		})
	}),
	Object.freeze({
		capability:{
			id:'demo.max-slope',version:1,
			constraintTypes:['maxSlope'],kinds:['terrain.*'],
			supportState:'native',executionTier:'browser-demo',determinism:'deterministic'
		},
		solver:({constraint})=>Object.freeze({
			satisfied:Number(constraint.value)<=12,
			measuredValue:Number(constraint.value),
			unit:String(constraint.unit||'degree')
		})
	})
]);
