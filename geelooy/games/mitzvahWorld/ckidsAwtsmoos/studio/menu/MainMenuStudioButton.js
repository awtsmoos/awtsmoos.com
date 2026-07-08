// B"H
import { studioRoute } from "../core/StudioRouter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function createMainMenuStudioButton() {
  return { text:"WORLD STUDIO", href:studioRoute("studio"), action:"OPEN_WORLD_STUDIO" };
}
export default createMainMenuStudioButton;
