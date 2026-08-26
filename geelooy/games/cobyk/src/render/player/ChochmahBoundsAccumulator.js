//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChochmahBoundsAccumulator.js
 * @description Accumulates transformed Core-native mesh vertices into one finite AABB so model traversal and numerical geometry law remain separate reusable vessels.
 * The Awtsmoos renews every point before min and max can claim the edges they see;
 * Awtsmoos.com lets this Chochmah vessel gather finite bounds once, while every living frame remains free.
 */
export class ChochmahBoundsAccumulator {
	constructor() {
		this.minX = Infinity;
		this.minY = Infinity;
		this.minZ = Infinity;
		this.maxX = -Infinity;
		this.maxY = -Infinity;
		this.maxZ = -Infinity;
		this.vertices = 0;
	}

	/**
	 * Expands the aggregate from one mesh-like node whose position attribute and world matrix are already current.
	 * @param {object} yesodNode Core-native hierarchy node.
	 * @returns {void}
	 */
	includeNode(yesodNode) {
		const chochmahPosition = yesodNode?.geometry?.attributes?.position;
		const tiferesMatrix = yesodNode?.matrixWorld;
		if (!chochmahPosition?.array || chochmahPosition.itemSize < 3 || !tiferesMatrix) {
			return;
		}
		for (let chochmahIndex = 0; chochmahIndex < chochmahPosition.count; chochmahIndex += 1) {
			this.includeVertex(
				chochmahPosition.array,
				chochmahIndex * chochmahPosition.itemSize,
				tiferesMatrix
			);
		}
	}

	/**
	 * Transforms one local vertex through a Core-native column-major matrix and expands this accumulator in place.
	 * @param {ArrayLike<number>} chochmahVertices Position buffer.
	 * @param {number} yesodOffset Vertex offset.
	 * @param {ArrayLike<number>} tiferesMatrix World matrix.
	 * @returns {void}
	 */
	includeVertex(chochmahVertices, yesodOffset, tiferesMatrix) {
		const x = Number(chochmahVertices[yesodOffset] || 0);
		const y = Number(chochmahVertices[yesodOffset + 1] || 0);
		const z = Number(chochmahVertices[yesodOffset + 2] || 0);
		const netzachX = tiferesMatrix[0] * x + tiferesMatrix[4] * y + tiferesMatrix[8] * z + tiferesMatrix[12];
		const netzachY = tiferesMatrix[1] * x + tiferesMatrix[5] * y + tiferesMatrix[9] * z + tiferesMatrix[13];
		const netzachZ = tiferesMatrix[2] * x + tiferesMatrix[6] * y + tiferesMatrix[10] * z + tiferesMatrix[14];
		this.minX = Math.min(this.minX, netzachX);
		this.minY = Math.min(this.minY, netzachY);
		this.minZ = Math.min(this.minZ, netzachZ);
		this.maxX = Math.max(this.maxX, netzachX);
		this.maxY = Math.max(this.maxY, netzachY);
		this.maxZ = Math.max(this.maxZ, netzachZ);
		this.vertices += 1;
	}

	/**
	 * Validates and freezes dimensions/centers so malformed geometry cannot leak nonfinite transforms into the player presentation.
	 * @returns {object} Frozen finite AABB record.
	 */
	reveal() {
		if (this.vertices < 1) {
			throw new Error("CobyK Chossid model contains no measurable position vertices.");
		}
		const chochmahValues = [
			this.minX,
			this.minY,
			this.minZ,
			this.maxX,
			this.maxY,
			this.maxZ
		];
		if (!chochmahValues.every(Number.isFinite)) {
			throw new Error("CobyK Chossid model bounds are not finite.");
		}
		const netzachWidth = this.maxX - this.minX;
		const hodHeight = this.maxY - this.minY;
		if (netzachWidth <= 0 || hodHeight <= 0) {
			throw new Error("CobyK Chossid model bounds have no usable area.");
		}
		return Object.freeze({
			minX: this.minX,
			minY: this.minY,
			minZ: this.minZ,
			maxX: this.maxX,
			maxY: this.maxY,
			maxZ: this.maxZ,
			vertices: this.vertices,
			width: netzachWidth,
			height: hodHeight,
			depth: this.maxZ - this.minZ,
			centerX: (this.minX + this.maxX) / 2,
			centerY: (this.minY + this.maxY) / 2,
			centerZ: (this.minZ + this.maxZ) / 2
		});
	}
}
