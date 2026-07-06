// B"H
import { studioRoute } from "../core/StudioRouter.js";
export function createMainMenuMovieButton() {
  return { text:"MOVIE MAKER", href:studioRoute("movie"), action:"OPEN_MOVIE_MAKER" };
}
export default createMainMenuMovieButton;
