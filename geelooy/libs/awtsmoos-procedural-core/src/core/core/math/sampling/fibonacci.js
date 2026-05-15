
// B"H
/**
 * @file fibonacci.js
 * @brief Generates points evenly distributed on a sphere using the Fibonacci Spiral.
 *        Prevents "bald spots" caused by random sampling.
 */

export function getFibonacciSpherePoints(samples) {
    const points = [];
    const phi = Math.PI * (3.0 - Math.sqrt(5.0)); // Golden Angle

    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2; // y goes from 1 to -1
        const radius = Math.sqrt(1 - y * y);   // radius at y
        
        const theta = phi * i;                 // Golden angle increment

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        points.push([x, y, z]);
    }
    return points;
}
