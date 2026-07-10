// B"H

/** One exact frame governs wall, panel, hinge, and mezuzah. */
export function normalizeDoorFrame(spec={}){
  const floorY=number(spec.floorY,0),yaw=snapAngle(number(spec.yaw,0));
  const x=number(spec.x,number(spec.position?.x,0)),z=number(spec.z,number(spec.position?.z,0));
  const doorW=number(spec.doorW,number(spec.width,2.4)),panelGap=number(spec.panelGap,.10);
  return{
    wallId:spec.wallId||`${spec.id||'Awtsmoos'}-doorway-wall`,doorId:spec.doorId||spec.id||`${spec.id||'Awtsmoos'}-hinged-door`,
    x,z,floorY,yaw,wallW:number(spec.wallW,8),wallH:number(spec.wallH,3.5),wallT:number(spec.wallT,.55),
    doorW,doorH:number(spec.doorH,number(spec.height,2.7)),doorThickness:number(spec.doorThickness,number(spec.thickness,.22)),
    panelGap,doorDepth:spec.doorDepth??spec.depth,openAngle:number(spec.openAngle,-Math.PI*.56),noEdge:!!spec.noEdge,
    wallColor:spec.wallColor||'#ddd3c6',doorColor:spec.doorColor||spec.color||'#8a5228',
    hingeSide:'entry-right',entryDirection:'local-negative-z',rightJambLocalX:-doorW/2
  };
}
export function localToWorld(frame,lx,lz){const c=Math.cos(frame.yaw),s=Math.sin(frame.yaw);return{x:frame.x+lx*c+lz*s,z:frame.z+lx*s-lz*c};}
export function doorPanelDepth(frame){return frame.doorDepth??(frame.wallT/2+frame.doorThickness/2+.012);}
export function doorHingeWorld(spec){const frame=normalizeDoorFrame(spec),panelWidth=frame.doorW-frame.panelGap,p=localToWorld(frame,-panelWidth/2,doorPanelDepth(frame));return{x:p.x,y:0,z:p.z};}
export function entryRightJambWorld(spec,offset=.12){const frame=normalizeDoorFrame(spec);return localToWorld(frame,-frame.doorW/2-offset,frame.wallT/2+.035);}
export function snapAngle(value){const quarter=Math.PI/2,nearest=Math.round(value/quarter)*quarter;return Math.abs(value-nearest)<.0005?nearest:value;}
function number(value,fallback){return Number.isFinite(value)?value:fallback;}
