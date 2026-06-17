// B"H
export function mobileLayoutTuning(mode = {}) { return { hudScale:mode.mobile ? .72 : 1, dockScale:mode.mobile ? .84 : 1, modalWidth:mode.mobile ? "94vw" : "min(620px, 92vw)", modalMaxHeight:mode.mobile ? "calc(100vh - 150px - env(safe-area-inset-bottom,0px))" : "min(80vh, 720px)", hideWorldMarkers:mode.mobile, reduceBlur:mode.mobile }; }
export default mobileLayoutTuning;
