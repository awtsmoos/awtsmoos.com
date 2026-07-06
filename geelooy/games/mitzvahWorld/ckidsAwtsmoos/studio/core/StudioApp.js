// B"H
import { mountWorldStudioApp } from "../world/WorldStudioApp.js";
import { mountMovieMakerApp } from "../movie/MovieMakerApp.js";

export function mountStudioApp(root = document.body, mode = new URL(location.href).searchParams.get("mode") || "studio") {
  if (mode === "movie") return mountMovieMakerApp(root);
  return mountWorldStudioApp(root);
}

export default { mountStudioApp };
