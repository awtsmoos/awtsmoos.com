// B"H
import { mountWorldStudioApp } from "../world/WorldStudioApp.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { mountMovieMakerApp } from "../movie/MovieMakerApp.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function mountStudioApp(root = document.body, mode = new URL(location.href).searchParams.get("mode") || "studio") {
  if (mode === "movie") return mountMovieMakerApp(root);
  return mountWorldStudioApp(root);
}

export default { mountStudioApp };
