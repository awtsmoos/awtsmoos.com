/**
 * B"H
 * @module SoulLoader
 * @description
 * The breath of the souls. Extracts the Nivrayim manifest, pours it into the
 * Olam, then runs Mitzvah World postbuild repairs for any selected world path.
 */

import { runMitzvahWorldPostBuild } from "../../../worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js";

export class SoulLoader {
    /**
     * B"H
     * Loads world souls and then applies universal Mitzvah World population repairs.
     *
     * @param {any} olam Olam instance.
     * @param {Object} payload Worker payload.
     * @returns {Promise<any>} loadNivrayim result.
     */
    static async load(olam, payload) {
        const worldData = payload.userInfo || payload;
        const nivrayimData = worldData.nivrayim || {};

        const loadStart = performance.now();

        const nivrayim = await olam.loadNivrayim(nivrayimData);

        const loadTime = (performance.now() - loadStart).toFixed(2);
        console.log(`B"H - ⏱️ Souls materialized in ${loadTime}ms.`);

        await runMitzvahWorldPostBuild({
            olam,
            scene: olam?.scene,
            nivrayim,
            worldData,
            source: "SoulLoader"
        });

        return nivrayim;
    }
}
