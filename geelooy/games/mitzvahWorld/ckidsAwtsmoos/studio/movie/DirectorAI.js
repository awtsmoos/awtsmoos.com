// B"H
import { generateProceduralMovie } from "./ProceduralMovieGenerator.js";
export function directMovie(prompt = "mitzvah story") { return generateProceduralMovie({ theme:prompt }); }
export default { directMovie };
