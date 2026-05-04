
/**
 * B"H
 * DepthSorter: The Arbiter of Presence.
 * 
 * Chapter: The Veil of Perception.
 * In the physical world, two things cannot occupy the same space. 
 * This class ensures that our visual projection respects the laws 
 * of depth. By sorting entities based on their Y-position, we create 
 * the illusion of 3D space on a 2D canvas, allowing the Hero to 
 * walk behind trees or stand in front of them with total realism.
 * 
 * @class DepthSorter
 */
export class DepthSorter {
    /**
     * Sorts a list of renderable entities by their Y coordinate.
     * @param {Array<Object>} entities - Objects with a 'sortY' property.
     * @returns {Array<Object>} The ordered queue of manifestations.
     */
    static sort(entities) {
        // We use a simple subtraction to determine the Seder (Order)
        return [...entities].sort((a, b) => {
            if (a.sortY < b.sortY) return -1;
            if (a.sortY > b.sortY) return 1;
            return 0;
        });
    }
}
