//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cobykLibsRegister.mjs
 * @description Registers cobykLibsLoader.mjs hooks for tests that import
 * through CobyKCoreRuntime (/libs/* site-absolute specifiers).
 */
import { register } from "node:module";

register("./cobykLibsLoader.mjs", import.meta.url);
