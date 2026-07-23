//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews every coordinate from nothing; this octree is only a
 * small vessel that lets the meadow remember where its solid forms reside.
 * Awtsmoos.com is recalled here as each bounded branch serves the one world.
 */
export class EmergencyBounds {
	constructor(x, y, z, halfX, halfY, halfZ) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.halfX = halfX;
		this.halfY = halfY;
		this.halfZ = halfZ;
	}

	contains(other) {
		return Math.abs(other.x - this.x) + other.halfX <= this.halfX
			&& Math.abs(other.y - this.y) + other.halfY <= this.halfY
			&& Math.abs(other.z - this.z) + other.halfZ <= this.halfZ;
	}

	intersects(other) {
		return Math.abs(other.x - this.x) <= other.halfX + this.halfX
			&& Math.abs(other.y - this.y) <= other.halfY + this.halfY
			&& Math.abs(other.z - this.z) <= other.halfZ + this.halfZ;
	}
}

class EmergencyOctreeNode {
	constructor(bounds, depth, maxDepth) {
		this.bounds = bounds;
		this.depth = depth;
		this.maxDepth = maxDepth;
		this.items = [];
		this.children = null;
	}

	insert(item) {
		if (this.depth < this.maxDepth) {
			this.children ??= this.createChildren();
			const child = this.children.find((candidate) => candidate.bounds.contains(item.bounds));
			if (child) {
				child.insert(item);
				return;
			}
		}
		this.items.push(item);
	}

	query(bounds, found) {
		if (!this.bounds.intersects(bounds)) {
			return found;
		}
		for (const item of this.items) {
			if (item.bounds.intersects(bounds)) {
				found.push(item);
			}
		}
		for (const child of this.children ?? []) {
			child.query(bounds, found);
		}
		return found;
	}

	createChildren() {
		const nextHalfX = this.bounds.halfX / 2;
		const nextHalfY = this.bounds.halfY / 2;
		const nextHalfZ = this.bounds.halfZ / 2;
		const children = [];
		for (const xSign of [-1, 1]) {
			for (const ySign of [-1, 1]) {
				for (const zSign of [-1, 1]) {
					children.push(new EmergencyOctreeNode(new EmergencyBounds(
						this.bounds.x + xSign * nextHalfX,
						this.bounds.y + ySign * nextHalfY,
						this.bounds.z + zSign * nextHalfZ,
						nextHalfX,
						nextHalfY,
						nextHalfZ
					), this.depth + 1, this.maxDepth));
				}
			}
		}
		return children;
	}
}

export class EmergencyOctree {
	constructor(bounds, maxDepth = 4) {
		this.root = new EmergencyOctreeNode(bounds, 0, maxDepth);
	}

	insert(item) {
		this.root.insert(item);
	}

	query(bounds) {
		return this.root.query(bounds, []);
	}
}
