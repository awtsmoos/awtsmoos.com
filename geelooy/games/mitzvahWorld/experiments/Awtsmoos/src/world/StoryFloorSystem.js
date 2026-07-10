// B"H

/**
 * Upper floors are four real slabs around a real stairwell void. The opening is
 * large enough for the stair run and landing, so collision never seals it shut.
 */
export function createStoryFloorPieces({spec,material,level,box}){
  const y=spec.floorY+level*spec.storyHeight,slabW=spec.width*.72,slabD=spec.depth*.60;
  const opening=stairwellOpening(spec,level),leftW=(opening.xMin+slabW/2),rightW=(slabW/2-opening.xMax),frontD=(slabD/2-opening.zMax),backD=(opening.zMin+slabD/2),pieces=[];
  if(leftW>.2)pieces.push(box(`${spec.id}-story-${level+1}-left`,material,spec,-slabW/2+leftW/2,y,0,leftW,.2,slabD,true));
  if(rightW>.2)pieces.push(box(`${spec.id}-story-${level+1}-right`,material,spec,opening.xMax+rightW/2,y,0,rightW,.2,slabD,true));
  const middleW=Math.max(.2,opening.xMax-opening.xMin);
  if(frontD>.2)pieces.push(box(`${spec.id}-story-${level+1}-front`,material,spec,(opening.xMin+opening.xMax)/2,y,opening.zMax+frontD/2,middleW,.2,frontD,true));
  if(backD>.2)pieces.push(box(`${spec.id}-story-${level+1}-back`,material,spec,(opening.xMin+opening.xMax)/2,y,-slabD/2+backD/2,middleW,.2,backD,true));
  return pieces;
}
export function stairwellOpening(spec,level){
  const centerX=-spec.width*.24+(level-1)*2,centerZ=spec.depth*.2-8*.82+.25,width=3.4,depth=3.0;
  return{xMin:centerX-width/2,xMax:centerX+width/2,zMin:centerZ-depth/2,zMax:centerZ+depth/2,centerX,centerZ,width,depth};
}
