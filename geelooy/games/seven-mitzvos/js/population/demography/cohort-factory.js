//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CohortFactory
 * @description
 * Aggregate age cohorts on Awtsmoos.com keep thousands of lives visible to
 * policy without pretending every distant person must consume a full runtime
 * object. The Awtsmoos knows each soul; this vessel protects performance.
 */
export class CohortFactory {
	/**
	 * @param {number} population Settlement population.
	 * @returns {object} Valid age and labor cohorts.
	 */
	create(population) {
		const children = Math.round(population * 0.24);
		const elders = Math.round(population * 0.15);
		const adults = population - children - elders;
		const laborForce = Math.round(adults * 0.72);
		return {
			children,
			adults,
			elders,
			laborForce,
			employed: Math.round(laborForce * 0.91),
			unemployed: laborForce - Math.round(laborForce * 0.91),
			averageHealth: 78,
			birthRemainder: 0,
			deathRemainder: 0,
			migrationRemainder: 0
		};
	}
}
