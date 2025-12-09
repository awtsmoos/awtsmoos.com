//B"H
import { VS_SOURCE, FS_SOURCE } from './shaders.js';
import { createTextureAtlas } from './atlas.js';

export class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    this.cameraX = 0;
    this.cameraY = 0;
    this.world = 0;
    this.time = 0;
    this.shake = 0;
    this.aberration = 0;
    this.luminosity = 0;
    this.underwater = 0;
    this.lens = 0;
    
    if (!this.gl) throw new Error("WebGL not supported");

    this.gl.enable(this.gl.BLEND);
    // SWITCHED TO STANDARD BLENDING FOR SOLID OBJECTS
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    this.program = this.createProgram(VS_SOURCE, FS_SOURCE);
    this.locations = {
      position: this.gl.getAttribLocation(this.program, "a_position"),
      texCoord: this.gl.getAttribLocation(this.program, "a_texCoord"),
      color: this.gl.getAttribLocation(this.program, "a_color"),
      resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
      camera: this.gl.getUniformLocation(this.program, "u_camera"),
      time: this.gl.getUniformLocation(this.program, "u_time"),
      world: this.gl.getUniformLocation(this.program, "u_world"),
      shake: this.gl.getUniformLocation(this.program, "u_shake"),
      aberration: this.gl.getUniformLocation(this.program, "u_aberration"),
      luminosity: this.gl.getUniformLocation(this.program, "u_luminosity"),
      underwater: this.gl.getUniformLocation(this.program, "u_underwater"),
      lens: this.gl.getUniformLocation(this.program, "u_lens"),
    };

    this.MAX_SPRITES = 10000;
    this.FLOAT_PER_VERT = 8;
    this.VERT_PER_SPRITE = 6;
    this.bufferData = new Float32Array(this.MAX_SPRITES * this.VERT_PER_SPRITE * this.FLOAT_PER_VERT);
    this.spriteCount = 0;

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.bufferData.byteLength, this.gl.DYNAMIC_DRAW);

    const atlas = createTextureAtlas(this.gl);
    this.texture = atlas.texture;
    this.uvs = atlas.uvs;
  }

  setCamera(x, y) {
    this.cameraX = x;
    this.cameraY = y;
  }
  
  setWorldState(world, time, shake, aberration) {
      this.world = world;
      this.time = time;
      this.shake = shake;
      this.aberration = aberration;
  }
  
  setSpecialEffects(lum, underwater, lens) {
      this.luminosity = lum;
      this.underwater = underwater;
      this.lens = lens;
  }

  createProgram(vsSource, fsSource) {
    const vs = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
    const p = this.gl.createProgram();
    this.gl.attachShader(p, vs);
    this.gl.attachShader(p, fs);
    this.gl.linkProgram(p);
    return p;
  }

  compileShader(type, source) {
    const s = this.gl.createShader(type);
    this.gl.shaderSource(s, source);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(s));
      this.gl.deleteShader(s);
      return null;
    }
    return s;
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
  }

  begin() {
    this.spriteCount = 0;
  }

  drawSprite(spriteId, x, y, w, h, rot, color) {
    if (this.spriteCount >= this.MAX_SPRITES) return;
    const uvs = this.uvs[spriteId];
    if(!uvs) return;
    
    const hw = w/2, hh = h/2;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    
    const x0 = -hw*cos - -hh*sin + x, y0 = -hw*sin + -hh*cos + y;
    const x1 =  hw*cos - -hh*sin + x, y1 =  hw*sin + -hh*cos + y;
    const x2 = -hw*cos -  hh*sin + x, y2 = -hw*sin +  hh*cos + y;
    const x3 =  hw*cos -  hh*sin + x, y3 =  hw*sin +  hh*cos + y;

    let idx = this.spriteCount * this.VERT_PER_SPRITE * this.FLOAT_PER_VERT;
    const b = this.bufferData;
    const {u0, v0, u1, v1} = uvs;
    const [r,g,bl,a] = color;

    // V1
    b[idx++] = x0; b[idx++] = y0; b[idx++] = u0; b[idx++] = v0; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;
    // V2
    b[idx++] = x1; b[idx++] = y1; b[idx++] = u1; b[idx++] = v0; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;
    // V3
    b[idx++] = x2; b[idx++] = y2; b[idx++] = u0; b[idx++] = v1; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;
    // V2
    b[idx++] = x1; b[idx++] = y1; b[idx++] = u1; b[idx++] = v0; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;
    // V3
    b[idx++] = x2; b[idx++] = y2; b[idx++] = u0; b[idx++] = v1; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;
    // V4
    b[idx++] = x3; b[idx++] = y3; b[idx++] = u1; b[idx++] = v1; b[idx++] = r; b[idx++] = g; b[idx++] = bl; b[idx++] = a;

    this.spriteCount++;
  }

  flush() {
    if (this.spriteCount === 0) return;
    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.locations.camera, this.cameraX, this.cameraY);
    this.gl.uniform1f(this.locations.time, this.time);
    this.gl.uniform1f(this.locations.world, this.world);
    this.gl.uniform1f(this.locations.shake, this.shake);
    this.gl.uniform1f(this.locations.aberration, this.aberration);
    
    if(this.locations.luminosity) this.gl.uniform1f(this.locations.luminosity, this.luminosity);
    if(this.locations.underwater) this.gl.uniform1f(this.locations.underwater, this.underwater);
    if(this.locations.lens) this.gl.uniform1f(this.locations.lens, this.lens);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.bufferData.subarray(0, this.spriteCount * 48));
    
    const stride = 32;
    this.gl.enableVertexAttribArray(this.locations.position);
    this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.enableVertexAttribArray(this.locations.texCoord);
    this.gl.vertexAttribPointer(this.locations.texCoord, 2, this.gl.FLOAT, false, stride, 8);
    this.gl.enableVertexAttribArray(this.locations.color);
    this.gl.vertexAttribPointer(this.locations.color, 4, this.gl.FLOAT, false, stride, 16);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.spriteCount * 6);
  }

  clear() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}