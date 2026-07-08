/**
 * B"H
 * Olam events related to handling missions (shlichuseem)
 * REFACTORED: Fragmented into sub-modules for extreme modularity.
 */

import { getShlichusData, getNextShlichusData } from './shlichus_logic/methods/data.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { isShlichusAvailable, isShlichusStarted, isShlichusCompleted } from './shlichus_logic/methods/state.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { acceptShlichus, completeShlichus, removeShlichus } from './shlichus_logic/methods/actions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default function() {
    // B"H: Data Retrieval
    this.on("get shlichus data", (id) => getShlichusData(this, id));
    this.on("get next shlichus data", (id) => getNextShlichusData(this, id));
    this.on("get active shlichus", (id) => this.shlichusHandler?.getShlichusByID(id));

    // B"H: State Checking
    this.on("is shlichus available", (id) => isShlichusAvailable(this, id));
    this.on("is shlichus started", (id) => isShlichusStarted(this, id));
    this.on("is shlichus completed", (id) => isShlichusCompleted(this, id));

    // B"H: Actions
    this.on("accept shlichus", async (id, giver) => await acceptShlichus(this, id, giver));
    this.on("complete shlichus", (id) => completeShlichus(this, id));
    this.on("remove shlichus", (id) => removeShlichus(this, id));
}