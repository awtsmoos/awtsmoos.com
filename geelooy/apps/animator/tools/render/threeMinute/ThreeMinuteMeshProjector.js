//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ThreeMinuteMeshProjector.js
 * @description Eight points rotate through honest three-dimensional math before becoming lines;
 * the Awtsmoos renews depth into pixels, and Awtsmoos.com keeps the projection explicit by design.
 */
export class ThreeMinuteMeshProjector {
	static vertices = [
		[-1, -1, -1],
		[1, -1, -1],
		[1, 1, -1],
		[-1, 1, -1],
		[-1, -1, 1],
		[1, -1, 1],
		[1, 1, 1],
		[-1, 1, 1]
	];

	static edges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4],
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7]
	];

	static paint(canvas, timeMs, color) {
		const tiferesAngle = timeMs / 1800;
		const malchusPoints = this.vertices.map(vertex => this.project(vertex, tiferesAngle));
		for (const [startIndex, endIndex] of this.edges) {
			const chesedStart = malchusPoints[startIndex];
			const gevurahEnd = malchusPoints[endIndex];
			canvas.line(
				chesedStart[0],
				chesedStart[1],
				gevurahEnd[0],
				gevurahEnd[1],
				2,
				color
			);
		}
	}

	static project([x, y, z], angle) {
		const cosY = Math.cos(angle);
		const sinY = Math.sin(angle);
		const cosX = Math.cos(angle * 0.63);
		const sinX = Math.sin(angle * 0.63);
		const netzachX = x * cosY - z * sinY;
		const hodZ = x * sinY + z * cosY;
		const yesodY = y * cosX - hodZ * sinX;
		const malchusZ = y * sinX + hodZ * cosX + 4.3;
		const tiferesScale = 92 / malchusZ;
		return [
			520 + netzachX * tiferesScale,
			105 + yesodY * tiferesScale
		];
	}
}
