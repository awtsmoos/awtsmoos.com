// B"H

/**
 * One frame of reference governs wall, panel, hinge, and mezuzah. Outside is
 * local +Z; a person entering faces local -Z, so that person's right jamb is
 * local -X. Tiny yaw drift is snapped away before geometry is created.
 */
export function normalizeDoorFrame(spec={}){
  const floorY=number(spec.floorY,0),yaw=snapAngle(number(spec.yaw,0));
  return{
    wallId:spec.wallId||`${spec.id||'Awtsmoos'}-doorway-wall`,
    doorId:spec.doorId||`${spec.id||'Awtsmoos'}-hinged-door`,
    x:number(spec.x,0),z:number(spec.z,0),floorY,yaw,
    wallW:number(spec.wallW,8),wallH:number(spec.wallH,3.5),wallT:number(spec.wallT,.55),
    doorW:number(spec.doorW,2.4),doorH:number(spec.doorH,2.7),doorThickness:number(spec.doorThickness,.22),
    panelGap:number(spec.panelGap,.10),doorDepth:spec.doorDepth,
    openAngle:number(spec.openAngle,-Math.PI*.56),noEdge:!!spec.noEdge,
    wallColor:spec.wallColor||'#ddd3c6',doorColor:spec.doorColor||'#8a5228',
    hingeSide:'entry-right',entryDirection:'local-negative-z',rightJambLocalX:-number(spec.doorW,2.4)/2
  };
}
export function localToWorld(frame,lx,lz){const c=Math.cos(frame.yaw),s=Math.sin(frame.yaw);return{x:frame.x+lx*c+lz*s,z:frame.z+lx*s-lz*c};}
export function doorPanelDepth(frame){return frame.doorDepth??(frame.wallT/2+frame.doorThickness/2+.012);}
export function doorHingeWorld(frame){const p=localToWorld(frame,-(frame.doorW-frame.panelGap)/2,doorPanelDepth(frame));return{x:p.x,y:0,z:p.z};}
export function entryRightJambWorld(frame,offset=.12){return localToWorld(frame,-frame.doorW/2-offset,frame.wallT/2+.035);}
export function snapAngle(value){const quarter=Math.PI/2,nearest=Math.round(value/quarter)*quarter;return Math.abs(value-nearest)<.0005?nearest:value;}
function number(value,fallback){return Number.isFinite(value)?value:fallback;}
