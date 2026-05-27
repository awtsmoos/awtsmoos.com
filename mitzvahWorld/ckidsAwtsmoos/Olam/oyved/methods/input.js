
/**
 * B"H
 * Input Event Methods for Worker
 */
export default function(me) {
    return {
        mouseup(e){ if(me.olam) me.olam.ayshPeula("mouseup", e); },
        rightmousedown(e) { if(me.olam) me.olam.ayshPeula("rightmousedown", e); },
        rightmouseup(e) { if(me.olam) me.olam.ayshPeula("rightmouseup", e); },
        mousedown(e){ if(me.olam) me.olam.ayshPeula("mousedown", e); },
        presskey(e) { if(me.olam) me.olam.ayshPeula("presskey", e); },
        keyup(e){ if(me.olam) me.olam.ayshPeula("keyup", e); },
        keydown(e){ if(me.olam) me.olam.ayshPeula("keydown", e); },
        wheel(e){ if(me.olam) me.olam.ayshPeula("wheel", e); },
        mousemove(e){ if(me.olam) me.olam.ayshPeula("mousemove", e); },
        resize(e) { if(me.olam) me.olam.ayshPeula("resize", e); }
    };
}
