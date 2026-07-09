// B"H
/**
 * Public Olam gate.
 *
 * This is the single supported doorway for code that wants the Olam class. The
 * worker must be allowed to import Olam through this gate, and this gate must
 * faithfully expose the constructable class from the core vessel.
 */
import Olam from "./core/OlamVessel.js";
export { Olam };
export const OlamClass = Olam;
export default Olam;
