// B"H
import tokens from "./tokens.js";
import main from "./main.js";
import navbar from "./navbar.js";
import driveShelf from "./driveShelf.js";
import sidebar from "./sidebar.js";
import view from "./view.js";
import details from "./details.js";
import badges from "./badges.js";
import dialogs from "./dialogs.js";
import responsive from "./responsive.js";

export default [
  tokens,
  main,
  navbar,
  driveShelf,
  sidebar,
  view,
  details,
  badges,
  dialogs,
  responsive
].join(String.fromCharCode(10));

/**
 * B"H
 * The explorer style is split into small chambers: the palace breathes better
 * when every vessel knows which glow it carries.
 */
