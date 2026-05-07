
/**
 * B"H
 * @chapter The Seder of Depth
 * @description
 * In the world of Asiyah, two objects cannot occupy the same space. 
 * When we project the 3D reality onto a 2D canvas, we must sort the 
 * entities by their Y-coordinate.
 */
export class DepthSorter {
    /**
     * @description Sorts items for correct layering.
     */
    static sort(queue) {
        return queue.sort((a, b) => a.sortY - b.sortY);
    }
}
