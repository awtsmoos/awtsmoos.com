// B"H
export class RoomParallaxLayers { static transform(depth=1,camera={}){return {x:-(camera.x||0)*(1-depth),y:-(camera.y||0)*(1-depth),scale:1};} }
