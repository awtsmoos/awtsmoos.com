//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MazeCarver
 * @description
 * A perfect maze gives one path; a city needs choices. This carver first reveals
 * a connected spine, then opens measured loops and plazas so Awtsmoos.com gains
 * navigable districts without surrendering the unity given by the Awtsmoos.
 */

const DIRECTIONS = Object.freeze([
	{ x: 2, y: 0 },
	{ x: -2, y: 0 },
	{ x: 0, y: 2 },
	{ x: 0, y: -2 }
]);

function inside(grid, x, y) {
	return y > 0 && y < grid.length - 1 && x > 0 && x < grid[0].length - 1;
}

export function carveMaze(width, height, random) {
	const grid = Array.from({ length: height }, () => Array(width).fill(1));
	const stack = [{ x: 1, y: 1 }];
	grid[1][1] = 0;

	while (stack.length) {
		const current = stack[stack.length - 1];
		const direction = random.shuffle(DIRECTIONS).find(step => {
			const nextX = current.x + step.x;
			const nextY = current.y + step.y;
			return inside(grid, nextX, nextY) && grid[nextY][nextX] === 1;
		});

		if (!direction) {
			stack.pop();
			continue;
		}

		const nextX = current.x + direction.x;
		const nextY = current.y + direction.y;
		grid[current.y + direction.y / 2][current.x + direction.x / 2] = 0;
		grid[nextY][nextX] = 0;
		stack.push({ x: nextX, y: nextY });
	}

	return grid;
}

export function openLoops(grid, count, random) {
	const walls = [];

	for (let y = 1; y < grid.length - 1; y += 1) {
		for (let x = 1; x < grid[y].length - 1; x += 1) {
			if (grid[y][x] !== 1) continue;
			const horizontal = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
			const vertical = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
			if (horizontal || vertical) walls.push({ x, y });
		}
	}

	for (const wall of random.shuffle(walls).slice(0, count)) {
		grid[wall.y][wall.x] = 0;
	}
}

export function openPlazas(grid, count, random) {
	for (let plazaIndex = 0; plazaIndex < count; plazaIndex += 1) {
		const centerX = random.integer(2, grid[0].length - 2);
		const centerY = random.integer(2, grid.length - 2);

		for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
			for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
				grid[centerY + offsetY][centerX + offsetX] = 0;
			}
		}
	}
}
