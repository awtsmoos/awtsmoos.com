// B"H
export function sceneDisplay(os) { return { display:os.display, scene:os.scene?.(), damage:os.damage?.consume?.() || [] }; }
