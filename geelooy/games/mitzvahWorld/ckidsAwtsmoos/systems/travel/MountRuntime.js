// B"H
/**
 * MountRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createMountRuntime(){ let mounted=false; return { mount(){mounted=true;return mounted;}, dismount(){mounted=false;return mounted;}, speed(){return mounted?1.35:1;} }; }
export default createMountRuntime;
