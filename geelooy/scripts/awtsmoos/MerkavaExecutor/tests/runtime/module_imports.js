// B"H
import add, { message } from "./module_child.js";
console.log("module imports", message, add(2, 3));
if (message !== "module-ok") throw new Error("named import failed");
if (add(2, 3) !== 5) throw new Error("default import failed");
