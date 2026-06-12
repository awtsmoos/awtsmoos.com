// B"H
/**
 * Chapter 373: The Three name became a synthetic constellation. This is not a
 * GPU; it is enough structure for node-dom boot tests to pass through scene,
 * camera, renderer, mesh, math, and loader setup without pretending Chrome.
 */
class Vector3 { constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } set(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; return this; } copy(v){ return this.set(v.x,v.y,v.z); } }
class Vector2 { constructor(x=0,y=0){ this.x=x; this.y=y; } set(x=0,y=0){ this.x=x; this.y=y; return this; } }
class Color { constructor(value=0xffffff){ this.value=value; } set(value){ this.value=value; return this; } }
class Object3D { constructor(){ this.children=[]; this.position=new Vector3(); this.rotation=new Vector3(); this.scale=new Vector3(1,1,1); this.visible=true; } add(...items){ this.children.push(...items); return this; } remove(...items){ this.children=this.children.filter(x=>!items.includes(x)); return this; } }
class Scene extends Object3D { constructor(){ super(); this.type='Scene'; this.background=null; } }
class Camera extends Object3D { updateProjectionMatrix(){} lookAt(){} }
class PerspectiveCamera extends Camera { constructor(fov=50,aspect=1,near=.1,far=2000){ super(); Object.assign(this,{fov,aspect,near,far,type:'PerspectiveCamera'}); } }
class Geometry { constructor(){ this.attributes={}; this.type=this.constructor.name; } setAttribute(k,v){ this.attributes[k]=v; return this; } }
class BoxGeometry extends Geometry {} class PlaneGeometry extends Geometry {} class SphereGeometry extends Geometry {} class BufferGeometry extends Geometry {}
class Material { constructor(options={}){ Object.assign(this,options); this.type=this.constructor.name; } }
class MeshBasicMaterial extends Material {} class MeshStandardMaterial extends Material {} class LineBasicMaterial extends Material {} class ShaderMaterial extends Material {}
class Mesh extends Object3D { constructor(geometry=new Geometry(),material=new Material()){ super(); this.geometry=geometry; this.material=material; this.type='Mesh'; } }
class Group extends Object3D { constructor(){ super(); this.type='Group'; } }
class WebGLRenderer { constructor(options={}){ this.options=options; this.domElement=options.canvas || document.createElement('canvas'); this.shadowMap={enabled:false}; this.calls=[]; } setSize(w,h){ this.width=w; this.height=h; this.domElement.width=w; this.domElement.height=h; } setPixelRatio(v){ this.pixelRatio=v; } render(scene,camera){ this.calls.push({scene,camera,at:Date.now()}); } dispose(){} }
class Clock { constructor(){ this.start=Date.now(); } getElapsedTime(){ return (Date.now()-this.start)/1000; } getDelta(){ return 0.016; } }
class TextureLoader { load(url,onLoad){ const tex={url,image:null,needsUpdate:true}; if(onLoad) setTimeout(()=>onLoad(tex),0); return tex; } }
class Raycaster { setFromCamera(){} intersectObjects(){ return []; } }
const MathUtils={degToRad:d=>d*Math.PI/180,radToDeg:r=>r*180/Math.PI,clamp:(x,a,b)=>Math.min(b,Math.max(a,x))};
export { Vector2, Vector3, Color, Object3D, Scene, Camera, PerspectiveCamera, BoxGeometry, PlaneGeometry, SphereGeometry, BufferGeometry, Material, MeshBasicMaterial, MeshStandardMaterial, LineBasicMaterial, ShaderMaterial, Mesh, Group, WebGLRenderer, Clock, TextureLoader, Raycaster, MathUtils };
export const DoubleSide=2, FrontSide=0, BackSide=1, SRGBColorSpace='srgb', ACESFilmicToneMapping=1;
export default { Vector2, Vector3, Color, Object3D, Scene, Camera, PerspectiveCamera, BoxGeometry, PlaneGeometry, SphereGeometry, BufferGeometry, Material, MeshBasicMaterial, MeshStandardMaterial, LineBasicMaterial, ShaderMaterial, Mesh, Group, WebGLRenderer, Clock, TextureLoader, Raycaster, MathUtils, DoubleSide, FrontSide, BackSide, SRGBColorSpace, ACESFilmicToneMapping };
