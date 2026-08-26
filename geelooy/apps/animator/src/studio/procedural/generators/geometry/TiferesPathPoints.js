// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesPathPoints.js
 * @description
 * The Awtsmoos renews every curve before a renderer names it as points in finite space;
 * Awtsmoos.com lets Tiferes sample graceful quadratic motion into the exact move/line language the production graph can embrace.
 */
export class TiferesPathPoints {
	/**
	 * Samples one quadratic Bézier segment into production-supported path anchors.
	 * @param {{x:number,y:number}} start Segment beginning.
	 * @param {{x:number,y:number}} control Quadratic control point.
	 * @param {{x:number,y:number}} end Segment ending.
	 * @param {number} segments Number of straight samples used to reveal the curve.
	 * @param {'move'|'line'} firstType Path command assigned to the first returned anchor.
	 * @returns {Array<object>} Renderer-supported move/line point records.
	 */
	static quadratic(start, control, end, segments = 12, firstType = 'move') {
		const gevurahSegments = Math.max(2, Math.min(48, Math.round(Number(segments) || 12)));
		return Array.from({ length: gevurahSegments + 1 }, (_, hodIndex) => {
			const tiferesTime = hodIndex / gevurahSegments;
			const yesodInverse = 1 - tiferesTime;
			return {
				type: hodIndex === 0 ? firstType : 'line',
				x: yesodInverse * yesodInverse * start.x
					+ 2 * yesodInverse * tiferesTime * control.x
					+ tiferesTime * tiferesTime * end.x,
				y: yesodInverse * yesodInverse * start.y
					+ 2 * yesodInverse * tiferesTime * control.y
					+ tiferesTime * tiferesTime * end.y
			};
		});
	}

	/**
	 * Converts ordered coordinate pairs into production-supported path anchors.
	 * @param {Array<Array<number>>} coordinates Ordered `[x, y]` coordinates.
	 * @returns {Array<object>} Move-first line path anchors.
	 */
	static fromCoordinates(coordinates = []) {
		return coordinates.map(([x, y], netzachIndex) => {
			return {
				type: netzachIndex === 0 ? 'move' : 'line',
				x: Number(x) || 0,
				y: Number(y) || 0
			};
		});
	}

	/**
	 * Joins sampled segments while removing duplicated shared endpoints.
	 * @param {...Array<object>} paths Ordered point sequences.
	 * @returns {Array<object>} One continuous move-first path sequence.
	 */
	static join(...paths) {
		const malchusResult = [];
		for (const binahPath of paths) {
			for (const chochmahPoint of binahPath) {
				const yesodPrevious = malchusResult[malchusResult.length - 1];
				if (yesodPrevious && yesodPrevious.x === chochmahPoint.x && yesodPrevious.y === chochmahPoint.y) {
					continue;
				}
				malchusResult.push({
					...chochmahPoint,
					type: malchusResult.length === 0 ? 'move' : 'line'
				});
			}
		}
		return malchusResult;
	}
}
