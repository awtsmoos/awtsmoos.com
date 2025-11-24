// B"H

function generateFullMaze(width, height) {
    let maze = createPerfectMaze(width, height);
    addLoopsToMaze(maze, WALL_REMOVAL_PERCENTAGE);
    addSideTunnels(maze);
    return maze;
}

function createPerfectMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1));
    const stack = [];
    const startX = 1;
    const startY = 1;
    maze[startY][startX] = 0;
    stack.push([startX, startY]);

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = [];
        if (x > 1 && maze[y][x - 2] === 1) neighbors.push([x - 2, y, 'left']);
        if (x < width - 2 && maze[y][x + 2] === 1) neighbors.push([x + 2, y, 'right']);
        if (y > 1 && maze[y - 2][x] === 1) neighbors.push([x, y - 2, 'up']);
        if (y < height - 2 && maze[y + 2][x] === 1) neighbors.push([x, y + 2, 'down']);

        if (neighbors.length > 0) {
            const [nextX, nextY, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (dir === 'left') maze[y][x - 1] = 0;
            else if (dir === 'right') maze[y][x + 1] = 0;
            else if (dir === 'up') maze[y - 1][x] = 0;
            else if (dir === 'down') maze[y + 1][x] = 0;
            maze[nextY][nextX] = 0;
            stack.push([nextX, nextY]);
        } else {
            stack.pop();
        }
    }
    return maze;
}

function addLoopsToMaze(maze, removalPercentage) {
    const height = maze.length;
    const width = maze[0].length;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Consider removing a wall if it's between two paths
            if (maze[y][x] === 1 && Math.random() < removalPercentage) {
                // Horizontal wall between two vertical paths
                if (maze[y - 1][x] === 0 && maze[y + 1][x] === 0) {
                    maze[y][x] = 0;
                }
                // Vertical wall between two horizontal paths
                else if (maze[y][x - 1] === 0 && maze[y][x + 1] === 0) {
                    maze[y][x] = 0;
                }
            }
        }
    }
}

function addSideTunnels(maze) {
    const tunnelY = Math.floor(maze.length / 2);
    maze[tunnelY][0] = 0; // Left entrance
    maze[tunnelY][maze[0].length - 1] = 0; // Right entrance
}