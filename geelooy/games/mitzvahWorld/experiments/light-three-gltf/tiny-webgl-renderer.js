// B"H
import { identity, lookAt, multiply, perspective } from './tiny-math.js';
import { skeletonLinePositions, updateTinySkeletons } from './tiny-skin-system.js';
import { defaultRenderOptions } from './tiny-render-policy.js';
import { collectMeshes, isLitMode, pointSizeForMode, triangleCountForMode } from './tiny-render-draw-list.js';
import { fragmentShader, rigidVertexShader, skinTextureVertexShader, uniformSkinVertexShader } from './tiny-render-shaders.js';
import { alphaModeCode, attributeType, createProgram, drawMode, locations, materialColor } from './tiny-render-webgl-utils.js';
import { MaterialTextureBinder } from './tiny-render-textures.js';

/** Renderer: custom WebGL skinning, grass texture, no THREE, no unbound samplers. */
export class TinyWebGLRenderer {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!this.gl) throw new Error('WebGL unavailable');
    this.cache = new WeakMap();
    this.errors = [];
    this.options = defaultRenderOptions();
    this.stats = { draws: 0, triangles: 0 };
    this.initPrograms();
    this.textures = new MaterialTextureBinder(this.gl);
  }

  initPrograms() {
    const gl = this.gl;
    this.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
    this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
    this.floatTexture = !!gl.getExtension('OES_texture_float');
    this.maxUniformJoints = Math.max(8, Math.min(64, Math.floor((this.maxVertexUniformVectors - 32) / 4)));
    this.jointMode = this.maxVertexTextures > 0 && this.floatTexture ? 'texture' : 'uniform';
    this.programs = { rigid: createProgram(gl, rigidVertexShader, fragmentShader, 'rigid', this.errors) };
    const skinVertex = this.jointMode === 'texture' ? skinTextureVertexShader : uniformSkinVertexShader(this.maxUniformJoints);
    this.programs.skin = createProgram(gl, skinVertex, fragmentShader, `skin-${this.jointMode}`, this.errors);
    this.loc = { rigid: locations(gl, this.programs.rigid), skin: locations(gl, this.programs.skin) };
    this.skinTexture = gl.createTexture();
  }

  setSize(width, height) {
    this.canvas.width = Math.max(1, width | 0);
    this.canvas.height = Math.max(1, height | 0);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  makeBuffer(attribute, target) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, attribute.array, gl.STATIC_DRAW);
    return buffer;
  }

  buffers(mesh) {
    if (this.cache.has(mesh.geometry)) return this.cache.get(mesh.geometry);
    const geometry = mesh.geometry;
    const position = geometry?.attributes?.position;
    if (!position) return null;
    const result = this.baseBuffers(geometry, position);
    if (geometry.attributes.joints) result.joints = this.makeBuffer(geometry.attributes.joints, this.gl.ARRAY_BUFFER);
    if (geometry.attributes.weights) result.weights = this.makeBuffer(geometry.attributes.weights, this.gl.ARRAY_BUFFER);
    if (geometry.index) this.addIndexBuffer(result, geometry.index);
    this.cache.set(geometry, result);
    return result;
  }

  baseBuffers(geometry, position) {
    const gl = this.gl;
    return {
      positionAttribute: position,
      position: this.makeBuffer(position, gl.ARRAY_BUFFER),
      normalAttribute: geometry.attributes.normal,
      normal: geometry.attributes.normal ? this.makeBuffer(geometry.attributes.normal, gl.ARRAY_BUFFER) : null,
      colorAttribute: geometry.attributes.color,
      color: geometry.attributes.color ? this.makeBuffer(geometry.attributes.color, gl.ARRAY_BUFFER) : null,
      uvAttribute: geometry.attributes.uv,
      uv: geometry.attributes.uv ? this.makeBuffer(geometry.attributes.uv, gl.ARRAY_BUFFER) : null,
      jointsAttribute: geometry.attributes.joints,
      weightsAttribute: geometry.attributes.weights,
      joints: null,
      weights: null,
      count: position.count,
      index: null,
      indexType: null,
      mode: geometry.mode ?? 4,
    };
  }

  addIndexBuffer(result, index) {
    const gl = this.gl;
    if (index.array instanceof Uint32Array) gl.getExtension('OES_element_index_uint');
    result.index = this.makeBuffer(index, gl.ELEMENT_ARRAY_BUFFER);
    result.indexType = index.array instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    result.count = index.count;
  }

  attrib(location, attribute, buffer, fallback) {
    const gl = this.gl;
    if (location < 0) return;
    if (!attribute || !buffer) {
      gl.disableVertexAttribArray(location);
      gl.vertexAttrib4f(location, fallback[0], fallback[1], fallback[2], fallback[3] ?? 1);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, attribute.itemSize, attributeType(gl, attribute), attribute.normalized, 0, 0);
  }

  render(scene, camera) {
    const gl = this.gl;
    const skeletonStats = updateTinySkeletons(scene);
    const list = collectMeshes(scene, this.options);
    this.stats = { draws: 0, triangles: 0, rigidMeshes: 0, transparentMeshes: 0, hiddenHelpers: list.hidden, errors: this.errors, jointMode: this.jointMode, maxVertexUniformVectors: this.maxVertexUniformVectors, ...skeletonStats };
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const pv = multiply(perspective(camera.fov, camera.aspect || 1, camera.near, camera.far), lookAt(camera.position.toArray(), camera.target || [0, 0, 4]));
    gl.disable(gl.BLEND); gl.depthMask(true); for (const mesh of list.opaque) this.drawMesh(mesh, pv, false);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); for (const mesh of list.transparent) this.drawMesh(mesh, pv, true);
    gl.depthMask(true); gl.disable(gl.BLEND);
    if (this.options.showSkeleton) this.drawSkeleton(scene, pv);
  }

  drawMesh(mesh, pv, transparent) {
    const buffers = this.buffers(mesh);
    if (!buffers) return;
    const gl = this.gl;
    const skinned = mesh.isSkinnedMesh && mesh.skeleton && buffers.joints && buffers.weights;
    const kind = skinned ? 'skin' : 'rigid';
    const loc = this.loc[kind];
    const model = mesh.matrixWorld || identity();
    gl.useProgram(this.programs[kind]);
    this.bindCommonAttributes(loc, buffers);
    if (skinned) this.bindSkin(loc, mesh.skeleton, buffers);
    gl.uniformMatrix4fv(loc.mvp, false, multiply(pv, model));
    gl.uniformMatrix4fv(loc.model, false, model);
    gl.uniform4fv(loc.colorUniform, materialColor(mesh.material));
    gl.uniform1f(loc.alphaCutoff, mesh.material?.alphaCutoff ?? 0.5);
    gl.uniform1i(loc.alphaMode, alphaModeCode(mesh.material));
    gl.uniform1i(loc.lit, isLitMode(buffers.mode) ? 1 : 0);
    gl.uniform1f(loc.pointSize, pointSizeForMode(buffers.mode));
    this.textures.bind(loc, mesh.material, this.stats);
    this.issueDraw(buffers);
    this.stats.draws++;
    this.stats.triangles += triangleCountForMode(buffers.mode, buffers.count);
    if (!skinned) this.stats.rigidMeshes++;
    if (transparent) this.stats.transparentMeshes++;
  }

  bindCommonAttributes(loc, buffers) {
    this.attrib(loc.position, buffers.positionAttribute, buffers.position, [0, 0, 0, 1]);
    this.attrib(loc.normal, buffers.normalAttribute, buffers.normal, [0, 1, 0, 0]);
    this.attrib(loc.color, buffers.colorAttribute, buffers.color, [1, 1, 1, 1]);
    this.attrib(loc.uv, buffers.uvAttribute, buffers.uv, [0, 0, 0, 1]);
  }

  bindSkin(loc, skeleton, buffers) {
    this.attrib(loc.joints, buffers.jointsAttribute, buffers.joints, [0, 0, 0, 0]);
    this.attrib(loc.weights, buffers.weightsAttribute, buffers.weights, [1, 0, 0, 0]);
    this.uploadJoints(skeleton, loc);
  }

  issueDraw(buffers) {
    const gl = this.gl;
    const mode = drawMode(gl, buffers.mode);
    if (buffers.index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
      gl.drawElements(mode, buffers.count, buffers.indexType, 0);
    } else {
      gl.drawArrays(mode, 0, buffers.count);
    }
  }

  uploadJoints(skeleton, loc) {
    const gl = this.gl;
    const count = skeleton.jointCount;
    if (this.jointMode === 'texture') {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.skinTexture);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, Math.max(1, count), 0, gl.RGBA, gl.FLOAT, skeleton.jointMatrices);
      gl.uniform1i(loc.jointTexture, 0);
      gl.uniform1f(loc.jointTextureHeight, Math.max(1, count));
      return;
    }
    if (count > this.maxUniformJoints) this.errors.push(`Joint uniform overflow: ${count} > ${this.maxUniformJoints}`);
    gl.uniformMatrix4fv(loc.jointMatrices, false, skeleton.jointMatrices.subarray(0, Math.min(count, this.maxUniformJoints) * 16));
  }

  drawSkeleton(scene, pv) {
    const gl = this.gl;
    const points = skeletonLinePositions(scene);
    if (!points.length) return;
    if (!this.skeletonBuffer) this.skeletonBuffer = gl.createBuffer();
    const loc = this.loc.rigid;
    gl.useProgram(this.programs.rigid);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skeletonBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc.position);
    gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 0, 0);
    this.attrib(loc.normal, null, null, [0, 1, 0, 0]);
    this.attrib(loc.color, null, null, [1, 1, 1, 1]);
    this.attrib(loc.uv, null, null, [0, 0, 0, 1]);
    gl.uniformMatrix4fv(loc.mvp, false, pv);
    gl.uniformMatrix4fv(loc.model, false, identity());
    gl.uniform4fv(loc.colorUniform, new Float32Array([0.2, 1, 0.9, 1]));
    gl.uniform1f(loc.alphaCutoff, 0.5);
    gl.uniform1i(loc.alphaMode, 0);
    gl.uniform1i(loc.lit, 0);
    gl.uniform1f(loc.pointSize, 1);
    this.textures.bind(loc, null, this.stats);
    gl.drawArrays(gl.LINES, 0, points.length / 3);
    this.stats.skeletonSegments = points.length / 6;
  }
}
export default TinyWebGLRenderer;
