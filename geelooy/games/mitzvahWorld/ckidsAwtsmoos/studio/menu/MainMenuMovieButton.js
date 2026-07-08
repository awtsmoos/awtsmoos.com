// B"H
import { studioRoute } from "../core/StudioRouter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function createMainMenuMovieButton() {
  return { text:"MOVIE MAKER", href:studioRoute("movie"), action:"OPEN_MOVIE_MAKER" };
}
export default createMainMenuMovieButton;
