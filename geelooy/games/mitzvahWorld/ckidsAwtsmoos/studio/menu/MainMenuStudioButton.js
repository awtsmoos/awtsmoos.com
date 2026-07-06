// B"H
import { studioRoute } from "../core/StudioRouter.js";
export function createMainMenuStudioButton() {
  return { text:"WORLD STUDIO", href:studioRoute("studio"), action:"OPEN_WORLD_STUDIO" };
}
export default createMainMenuStudioButton;
