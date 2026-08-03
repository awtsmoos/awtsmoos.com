/* B\"H compact live import helpers */
function __awtsmoosLiveImport(getModule, name) {
  const read = () => {
    const module = getModule();
    return module && module[name];
  };
  return new Proxy(function __awtsmoosLiveBinding(...args) {
    const value = read();
    if (typeof value !== "function") return value;
    return value(...args);
  }, {
    apply(_target, thisArg, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a function");
      return Reflect.apply(value, thisArg, args);
    },
    construct(_target, args) {
      const value = read();
      if (typeof value !== "function") throw new TypeError(String(name) + " is not a constructor");
      return Reflect.construct(value, args);
    },
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) return () => read();
      if (prop === "valueOf") return () => read();
      if (prop === "toString") return () => String(read());
      const value = read();
      return value == null ? undefined : value[prop];
    },
    set(_target, prop, newValue) {
      const targetValue = read();
      if (targetValue == null) return false;
      targetValue[prop] = newValue;
      return true;
    }
  });
}
function __awtsmoosLiveNamespace(getModule) {
  return new Proxy({}, { get(_target, prop) {
    const module = getModule();
    return module == null ? undefined : module[prop];
  }});
}
var __awtsmoosModule_8;
var __awtsmoosModule_9;
var __awtsmoosModule_10;
var __awtsmoosModule_11;
var __awtsmoosModule_7;
var __awtsmoosModule_12;
var __awtsmoosModule_13;
var __awtsmoosModule_6;
var __awtsmoosModule_14;
var __awtsmoosModule_15;
var __awtsmoosModule_16;
var __awtsmoosModule_5;
var __awtsmoosModule_4;
var __awtsmoosModule_3;
var __awtsmoosModule_18;
var __awtsmoosModule_20;
var __awtsmoosModule_19;
var __awtsmoosModule_17;
var __awtsmoosModule_2;
var __awtsmoosModule_25;
var __awtsmoosModule_24;
var __awtsmoosModule_23;
var __awtsmoosModule_26;
var __awtsmoosModule_27;
var __awtsmoosModule_22;
var __awtsmoosModule_30;
var __awtsmoosModule_29;
var __awtsmoosModule_31;
var __awtsmoosModule_28;
var __awtsmoosModule_32;
var __awtsmoosModule_36;
var __awtsmoosModule_35;
var __awtsmoosModule_34;
var __awtsmoosModule_38;
var __awtsmoosModule_37;
var __awtsmoosModule_39;
var __awtsmoosModule_40;
var __awtsmoosModule_33;
var __awtsmoosModule_21;
var __awtsmoosModule_42;
var __awtsmoosModule_41;
var __awtsmoosModule_44;
var __awtsmoosModule_45;
var __awtsmoosModule_43;
var __awtsmoosModule_46;
var __awtsmoosModule_1;
var __awtsmoosModule_54;
var __awtsmoosModule_55;
var __awtsmoosModule_53;
var __awtsmoosModule_52;
var __awtsmoosModule_56;
var __awtsmoosModule_57;
var __awtsmoosModule_58;
var __awtsmoosModule_59;
var __awtsmoosModule_60;
var __awtsmoosModule_51;
var __awtsmoosModule_50;
var __awtsmoosModule_61;
var __awtsmoosModule_62;
var __awtsmoosModule_49;
var __awtsmoosModule_65;
var __awtsmoosModule_64;
var __awtsmoosModule_66;
var __awtsmoosModule_63;
var __awtsmoosModule_67;
var __awtsmoosModule_48;
var __awtsmoosModule_68;
var __awtsmoosModule_71;
var __awtsmoosModule_70;
var __awtsmoosModule_74;
var __awtsmoosModule_75;
var __awtsmoosModule_76;
var __awtsmoosModule_77;
var __awtsmoosModule_73;
var __awtsmoosModule_79;
var __awtsmoosModule_82;
var __awtsmoosModule_81;
var __awtsmoosModule_83;
var __awtsmoosModule_80;
var __awtsmoosModule_78;
var __awtsmoosModule_84;
var __awtsmoosModule_72;
var __awtsmoosModule_88;
var __awtsmoosModule_87;
var __awtsmoosModule_89;
var __awtsmoosModule_90;
var __awtsmoosModule_86;
var __awtsmoosModule_92;
var __awtsmoosModule_91;
var __awtsmoosModule_93;
var __awtsmoosModule_85;
var __awtsmoosModule_94;
var __awtsmoosModule_96;
var __awtsmoosModule_98;
var __awtsmoosModule_97;
var __awtsmoosModule_100;
var __awtsmoosModule_99;
var __awtsmoosModule_102;
var __awtsmoosModule_101;
var __awtsmoosModule_104;
var __awtsmoosModule_105;
var __awtsmoosModule_106;
var __awtsmoosModule_107;
var __awtsmoosModule_108;
var __awtsmoosModule_109;
var __awtsmoosModule_103;
var __awtsmoosModule_95;
var __awtsmoosModule_111;
var __awtsmoosModule_112;
var __awtsmoosModule_110;
var __awtsmoosModule_114;
var __awtsmoosModule_115;
var __awtsmoosModule_116;
var __awtsmoosModule_113;
var __awtsmoosModule_117;
var __awtsmoosModule_118;
var __awtsmoosModule_121;
var __awtsmoosModule_122;
var __awtsmoosModule_120;
var __awtsmoosModule_123;
var __awtsmoosModule_119;
var __awtsmoosModule_124;
var __awtsmoosModule_126;
var __awtsmoosModule_127;
var __awtsmoosModule_128;
var __awtsmoosModule_125;
var __awtsmoosModule_130;
var __awtsmoosModule_129;
var __awtsmoosModule_133;
var __awtsmoosModule_134;
var __awtsmoosModule_132;
var __awtsmoosModule_136;
var __awtsmoosModule_137;
var __awtsmoosModule_135;
var __awtsmoosModule_139;
var __awtsmoosModule_140;
var __awtsmoosModule_142;
var __awtsmoosModule_143;
var __awtsmoosModule_141;
var __awtsmoosModule_138;
var __awtsmoosModule_131;
var __awtsmoosModule_69;
var __awtsmoosModule_146;
var __awtsmoosModule_149;
var __awtsmoosModule_148;
var __awtsmoosModule_147;
var __awtsmoosModule_145;
var __awtsmoosModule_153;
var __awtsmoosModule_152;
var __awtsmoosModule_151;
var __awtsmoosModule_157;
var __awtsmoosModule_158;
var __awtsmoosModule_156;
var __awtsmoosModule_155;
var __awtsmoosModule_154;
var __awtsmoosModule_159;
var __awtsmoosModule_150;
var __awtsmoosModule_161;
var __awtsmoosModule_160;
var __awtsmoosModule_163;
var __awtsmoosModule_164;
var __awtsmoosModule_162;
var __awtsmoosModule_167;
var __awtsmoosModule_166;
var __awtsmoosModule_165;
var __awtsmoosModule_168;
var __awtsmoosModule_173;
var __awtsmoosModule_172;
var __awtsmoosModule_174;
var __awtsmoosModule_171;
var __awtsmoosModule_179;
var __awtsmoosModule_181;
var __awtsmoosModule_182;
var __awtsmoosModule_183;
var __awtsmoosModule_184;
var __awtsmoosModule_185;
var __awtsmoosModule_180;
var __awtsmoosModule_188;
var __awtsmoosModule_190;
var __awtsmoosModule_189;
var __awtsmoosModule_191;
var __awtsmoosModule_192;
var __awtsmoosModule_187;
var __awtsmoosModule_186;
var __awtsmoosModule_193;
var __awtsmoosModule_195;
var __awtsmoosModule_194;
var __awtsmoosModule_196;
var __awtsmoosModule_197;
var __awtsmoosModule_200;
var __awtsmoosModule_201;
var __awtsmoosModule_202;
var __awtsmoosModule_199;
var __awtsmoosModule_204;
var __awtsmoosModule_203;
var __awtsmoosModule_206;
var __awtsmoosModule_205;
var __awtsmoosModule_207;
var __awtsmoosModule_208;
var __awtsmoosModule_209;
var __awtsmoosModule_210;
var __awtsmoosModule_212;
var __awtsmoosModule_211;
var __awtsmoosModule_198;
var __awtsmoosModule_213;
var __awtsmoosModule_214;
var __awtsmoosModule_215;
var __awtsmoosModule_178;
var __awtsmoosModule_220;
var __awtsmoosModule_219;
var __awtsmoosModule_222;
var __awtsmoosModule_223;
var __awtsmoosModule_225;
var __awtsmoosModule_224;
var __awtsmoosModule_221;
var __awtsmoosModule_218;
var __awtsmoosModule_217;
var __awtsmoosModule_226;
var __awtsmoosModule_228;
var __awtsmoosModule_227;
var __awtsmoosModule_216;
var __awtsmoosModule_177;
var __awtsmoosModule_229;
var __awtsmoosModule_176;
var __awtsmoosModule_231;
var __awtsmoosModule_230;
var __awtsmoosModule_232;
var __awtsmoosModule_233;
var __awtsmoosModule_175;
var __awtsmoosModule_234;
var __awtsmoosModule_240;
var __awtsmoosModule_239;
var __awtsmoosModule_242;
var __awtsmoosModule_241;
var __awtsmoosModule_238;
var __awtsmoosModule_244;
var __awtsmoosModule_243;
var __awtsmoosModule_237;
var __awtsmoosModule_247;
var __awtsmoosModule_246;
var __awtsmoosModule_249;
var __awtsmoosModule_248;
var __awtsmoosModule_245;
var __awtsmoosModule_250;
var __awtsmoosModule_236;
var __awtsmoosModule_253;
var __awtsmoosModule_254;
var __awtsmoosModule_252;
var __awtsmoosModule_257;
var __awtsmoosModule_258;
var __awtsmoosModule_259;
var __awtsmoosModule_260;
var __awtsmoosModule_256;
var __awtsmoosModule_255;
var __awtsmoosModule_251;
var __awtsmoosModule_264;
var __awtsmoosModule_266;
var __awtsmoosModule_267;
var __awtsmoosModule_265;
var __awtsmoosModule_263;
var __awtsmoosModule_268;
var __awtsmoosModule_262;
var __awtsmoosModule_261;
var __awtsmoosModule_235;
var __awtsmoosModule_269;
var __awtsmoosModule_270;
var __awtsmoosModule_170;
var __awtsmoosModule_169;
var __awtsmoosModule_144;
var __awtsmoosModule_272;
var __awtsmoosModule_271;
var __awtsmoosModule_47;
var __awtsmoosModule_0;
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js */
__awtsmoosModule_8 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-matrix-core.js
 * @description Direct column-major matrix operations for the Mitzvah World.
 * The Awtsmoos renews every coordinate without waste; Awtsmoos.com forms each matrix
 * directly so no intermediate vessel stands between intention and visible revelation.
 */

const EPSILON = 1e-8;
__exports.EPSILON = EPSILON;


function identity() {
	return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}


__exports.identity = identity;
function copyMat4(source) {
	return new Float32Array(source || identity());
}


__exports.copyMat4 = copyMat4;
function mat4FromArray(source, offset = 0) {
	const result = new Float32Array(16);
	for (let index = 0; index < 16; index += 1) {
		result[index] = Number(source?.[offset + index] ?? (index % 5 === 0 ? 1 : 0));
	}
	return result;
}


__exports.mat4FromArray = mat4FromArray;
function multiply(left, right) {
	const result = new Float32Array(16);
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
	return result;
}


__exports.multiply = multiply;
function inverse(matrix) {
	const result = new Float32Array(16);
	const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = matrix;
	const b00 = a00 * a11 - a01 * a10;
	const b01 = a00 * a12 - a02 * a10;
	const b02 = a00 * a13 - a03 * a10;
	const b03 = a01 * a12 - a02 * a11;
	const b04 = a01 * a13 - a03 * a11;
	const b05 = a02 * a13 - a03 * a12;
	const b06 = a20 * a31 - a21 * a30;
	const b07 = a20 * a32 - a22 * a30;
	const b08 = a20 * a33 - a23 * a30;
	const b09 = a21 * a32 - a22 * a31;
	const b10 = a21 * a33 - a23 * a31;
	const b11 = a22 * a33 - a23 * a32;
	let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	if (Math.abs(determinant) < EPSILON) return identity();
	determinant = 1 / determinant;
	result.set([
		(a11 * b11 - a12 * b10 + a13 * b09) * determinant,
		(-a01 * b11 + a02 * b10 - a03 * b09) * determinant,
		(a31 * b05 - a32 * b04 + a33 * b03) * determinant,
		(-a21 * b05 + a22 * b04 - a23 * b03) * determinant,
		(-a10 * b11 + a12 * b08 - a13 * b07) * determinant,
		(a00 * b11 - a02 * b08 + a03 * b07) * determinant,
		(-a30 * b05 + a32 * b02 - a33 * b01) * determinant,
		(a20 * b05 - a22 * b02 + a23 * b01) * determinant,
		(a10 * b10 - a11 * b08 + a13 * b06) * determinant,
		(-a00 * b10 + a01 * b08 - a03 * b06) * determinant,
		(a30 * b04 - a31 * b02 + a33 * b00) * determinant,
		(-a20 * b04 + a21 * b02 - a23 * b00) * determinant,
		(-a10 * b09 + a11 * b07 - a12 * b06) * determinant,
		(a00 * b09 - a01 * b07 + a02 * b06) * determinant,
		(-a30 * b03 + a31 * b01 - a32 * b00) * determinant,
		(a20 * b03 - a21 * b01 + a22 * b00) * determinant
	]);
	return result;
}


__exports.inverse = inverse;
function translate(x = 0, y = 0, z = 0) {
	const result = identity();
	result[12] = x;
	result[13] = y;
	result[14] = z;
	return result;
}


__exports.translate = translate;
function scale(x = 1, y = 1, z = 1) {
	const result = identity();
	result[0] = x;
	result[5] = y;
	result[10] = z;
	return result;
}

__exports.scale = scale;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-math.js */
__awtsmoosModule_9 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-transform-math.js
 * @description Direct quaternion and TRS composition for animated village forms.
 * The Awtsmoos turns stillness into movement each instant; Awtsmoos.com composes the
 * complete local vessel in one pass so no temporary translation or scale matrix is born.
 */

var identity = __awtsmoosModule_8.identity;

function quatNormalize(quaternion) {
	const x = quaternion?.[0] || 0;
	const y = quaternion?.[1] || 0;
	const z = quaternion?.[2] || 0;
	const w = quaternion?.[3] ?? 1;
	const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
	return [x * inverseLength, y * inverseLength, z * inverseLength, w * inverseLength];
}


__exports.quatNormalize = quatNormalize;
function quatMatrix(quaternion = [0, 0, 0, 1]) {
	const [x, y, z, w] = quatNormalize(quaternion);
	return composeNormalizedQuaternion(x, y, z, w, 0, 0, 0, 1, 1, 1);
}


__exports.quatMatrix = quatMatrix;
function composeTRS(position, quaternion, scaling) {
	const source = quaternion.toArray ? quaternion.toArray() : quaternion;
	const [x, y, z, w] = quatNormalize(source);
	return composeNormalizedQuaternion(
		x,
		y,
		z,
		w,
		position.x,
		position.y,
		position.z,
		scaling.x,
		scaling.y,
		scaling.z
	);
}


__exports.composeTRS = composeTRS;
function composeNormalizedQuaternion(x, y, z, w, px, py, pz, sx, sy, sz) {
	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;
	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;
	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;
	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;
	const result = identity();
	result[0] = (1 - yy - zz) * sx;
	result[1] = (xy + wz) * sx;
	result[2] = (xz - wy) * sx;
	result[4] = (xy - wz) * sy;
	result[5] = (1 - xx - zz) * sy;
	result[6] = (yz + wx) * sy;
	result[8] = (xz + wy) * sz;
	result[9] = (yz - wx) * sz;
	result[10] = (1 - xx - yy) * sz;
	result[12] = px;
	result[13] = py;
	result[14] = pz;
	return result;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-camera-math.js */
__awtsmoosModule_10 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-camera-math.js
 * @description Camera projection and world-point revelation for the mountain village.
 * The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera
 * vessel directly so each ridge, flower, and Chossid reaches the screen without waste.
 */

var identity = __awtsmoosModule_8.identity;

function perspective(fovDegrees, aspect, near, far) {
	const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
	const depth = 1 / (near - far);
	const result = new Float32Array(16);
	result[0] = factor / aspect;
	result[5] = factor;
	result[10] = (far + near) * depth;
	result[11] = -1;
	result[14] = 2 * far * near * depth;
	return result;
}


__exports.perspective = perspective;
function lookAt(eye, target, up = [0, 1, 0]) {
	const forward = normalize3([
		eye[0] - target[0],
		eye[1] - target[1],
		eye[2] - target[2]
	]);
	const right = normalize3(cross3(up, forward));
	const upward = cross3(forward, right);
	const result = identity();
	result[0] = right[0];
	result[1] = upward[0];
	result[2] = forward[0];
	result[4] = right[1];
	result[5] = upward[1];
	result[6] = forward[1];
	result[8] = right[2];
	result[9] = upward[2];
	result[10] = forward[2];
	result[12] = -dot3(right, eye);
	result[13] = -dot3(upward, eye);
	result[14] = -dot3(forward, eye);
	return result;
}


__exports.lookAt = lookAt;
function transformPoint(matrix, x, y, z) {
	return [
		matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
	];
}


__exports.transformPoint = transformPoint;
function cross3(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot3(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function normalize3(vector) {
	const inverseLength = 1 / (Math.hypot(vector[0], vector[1], vector[2]) || 1);
	return vector.map(value => value * inverseLength);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-interpolation-math.js */
__awtsmoosModule_11 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-interpolation-math.js
 * @description Smooth array and quaternion transitions for living motion.
 * The Awtsmoos joins every before and after in one present; Awtsmoos.com gives the
 * visible traveler a measured path between samples without changing either endpoint.
 */

var quatNormalize = __awtsmoosModule_9.quatNormalize;

function quatSlerp(left, right, amount) {
	const [ax, ay, az, aw] = left;
	let [bx, by, bz, bw] = right;
	let cosine = ax * bx + ay * by + az * bz + aw * bw;
	if (cosine < 0) {
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
		cosine = -cosine;
	}
	if (cosine > 0.9995) {
		return quatNormalize([
			ax + (bx - ax) * amount,
			ay + (by - ay) * amount,
			az + (bz - az) * amount,
			aw + (bw - aw) * amount
		]);
	}
	const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
	const sine = Math.sin(angle);
	const leftWeight = Math.sin((1 - amount) * angle) / sine;
	const rightWeight = Math.sin(amount * angle) / sine;
	return [
		ax * leftWeight + bx * rightWeight,
		ay * leftWeight + by * rightWeight,
		az * leftWeight + bz * rightWeight,
		aw * leftWeight + bw * rightWeight
	];
}


__exports.quatSlerp = quatSlerp;
function lerpArray(left, right, amount) {
	return left.map((value, index) => value + (right[index] - value) * amount);
}

__exports.lerpArray = lerpArray;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-math.js */
__awtsmoosModule_7 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-math.js
 * @description Stable public gateway to focused mathematical vessels.
 * The Awtsmoos contains every coordinate without confusion; Awtsmoos.com reveals
 * matrix, transform, camera, and interpolation responsibilities in their proper rooms.
 */

__exports.copyMat4 = __awtsmoosModule_8.copyMat4;
__exports.EPSILON = __awtsmoosModule_8.EPSILON;
__exports.identity = __awtsmoosModule_8.identity;
__exports.inverse = __awtsmoosModule_8.inverse;
__exports.mat4FromArray = __awtsmoosModule_8.mat4FromArray;
__exports.multiply = __awtsmoosModule_8.multiply;
__exports.scale = __awtsmoosModule_8.scale;
__exports.translate = __awtsmoosModule_8.translate;
__exports.composeTRS = __awtsmoosModule_9.composeTRS;
__exports.quatMatrix = __awtsmoosModule_9.quatMatrix;
__exports.quatNormalize = __awtsmoosModule_9.quatNormalize;
__exports.lookAt = __awtsmoosModule_10.lookAt;
__exports.perspective = __awtsmoosModule_10.perspective;
__exports.transformPoint = __awtsmoosModule_10.transformPoint;
__exports.lerpArray = __awtsmoosModule_11.lerpArray;
__exports.quatSlerp = __awtsmoosModule_11.quatSlerp;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js */
__awtsmoosModule_12 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-transform-cache.js
 * @description Reuses transform snapshots and matrix storage until source values change.
 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
 */

var identity = __awtsmoosModule_7.identity;

const MATRIX_SNAPSHOT = 1;
const TRS_SNAPSHOT = 2;

const ROOT_WORLD_MATRIX = identity();
__exports.ROOT_WORLD_MATRIX = ROOT_WORLD_MATRIX;


function cachedLocalMatrix(object) {
	if (!localTransformChanged(object)) return object._localMatrixCache;
	captureLocalTransform(object);
	object._localMatrixCache ||= new Float32Array(16);
	if (object.matrix) copyMatrixInto(object._localMatrixCache, object.matrix);
	else composeTrsInto(object._localMatrixCache, object);
	object._localRevision = (object._localRevision || 0) + 1;
	return object._localMatrixCache;
}


__exports.cachedLocalMatrix = cachedLocalMatrix;
function updateCachedWorldMatrix(
	object,
	parentWorld = ROOT_WORLD_MATRIX,
	parentRevision = null
) {
	const localMatrix = cachedLocalMatrix(object);
	const localRevision = object._localRevision || 0;
	const inheritedRevision = parentRevision
		?? object.parent?._worldRevision
		?? 0;
	const unchanged = object._worldParentMatrix === parentWorld
		&& object._worldParentRevision === inheritedRevision
		&& object._worldLocalRevision === localRevision;
	if (unchanged) return false;
	if (object.isMesh || !validMatrix(object.matrixWorld)) {
		object.matrixWorld = multiplyInto(
			new Float32Array(16),
			parentWorld,
			localMatrix
		);
	} else {
		multiplyInto(object.matrixWorld, parentWorld, localMatrix);
	}
	object._worldParentMatrix = parentWorld;
	object._worldParentRevision = inheritedRevision;
	object._worldLocalRevision = localRevision;
	object._worldRevision = (object._worldRevision || 0) + 1;
	return true;
}


__exports.updateCachedWorldMatrix = updateCachedWorldMatrix;
function invalidateTransformCache(object) {
	object._localTransformSnapshot = null;
	object._worldParentMatrix = null;
	object._worldParentRevision = -1;
	object._worldLocalRevision = -1;
}


__exports.invalidateTransformCache = invalidateTransformCache;
function localTransformChanged(object) {
	const snapshot = object._localTransformSnapshot;
	if (object.matrix) {
		if (!snapshot || snapshot.length !== 17 || snapshot[0] !== MATRIX_SNAPSHOT) {
			return true;
		}
		for (let index = 0; index < 16; index += 1) {
			if (snapshot[index + 1] !== object.matrix[index]) return true;
		}
		return false;
	}
	if (!snapshot || snapshot.length !== 11 || snapshot[0] !== TRS_SNAPSHOT) {
		return true;
	}
	return snapshot[1] !== object.position.x
		|| snapshot[2] !== object.position.y
		|| snapshot[3] !== object.position.z
		|| snapshot[4] !== object.quaternion.x
		|| snapshot[5] !== object.quaternion.y
		|| snapshot[6] !== object.quaternion.z
		|| snapshot[7] !== object.quaternion.w
		|| snapshot[8] !== object.scale.x
		|| snapshot[9] !== object.scale.y
		|| snapshot[10] !== object.scale.z;
}

function captureLocalTransform(object) {
	if (object.matrix) {
		const snapshot = reusableSnapshot(object, 17);
		snapshot[0] = MATRIX_SNAPSHOT;
		for (let index = 0; index < 16; index += 1) {
			snapshot[index + 1] = object.matrix[index];
		}
		return;
	}
	const snapshot = reusableSnapshot(object, 11);
	snapshot[0] = TRS_SNAPSHOT;
	snapshot[1] = object.position.x;
	snapshot[2] = object.position.y;
	snapshot[3] = object.position.z;
	snapshot[4] = object.quaternion.x;
	snapshot[5] = object.quaternion.y;
	snapshot[6] = object.quaternion.z;
	snapshot[7] = object.quaternion.w;
	snapshot[8] = object.scale.x;
	snapshot[9] = object.scale.y;
	snapshot[10] = object.scale.z;
}

function reusableSnapshot(object, length) {
	if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length) {
		object._localTransformSnapshot = new Array(length);
	}
	return object._localTransformSnapshot;
}

function copyMatrixInto(target, source) {
	for (let index = 0; index < 16; index += 1) target[index] = source[index];
}

function composeTrsInto(target, object) {
	const quaternion = object.quaternion;
	const x = quaternion.x || 0;
	const y = quaternion.y || 0;
	const z = quaternion.z || 0;
	const w = quaternion.w ?? 1;
	const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
	const normalizedX = x * inverseLength;
	const normalizedY = y * inverseLength;
	const normalizedZ = z * inverseLength;
	const normalizedW = w * inverseLength;
	const x2 = normalizedX + normalizedX;
	const y2 = normalizedY + normalizedY;
	const z2 = normalizedZ + normalizedZ;
	const xx = normalizedX * x2;
	const xy = normalizedX * y2;
	const xz = normalizedX * z2;
	const yy = normalizedY * y2;
	const yz = normalizedY * z2;
	const zz = normalizedZ * z2;
	const wx = normalizedW * x2;
	const wy = normalizedW * y2;
	const wz = normalizedW * z2;
	target[0] = (1 - yy - zz) * object.scale.x;
	target[1] = (xy + wz) * object.scale.x;
	target[2] = (xz - wy) * object.scale.x;
	target[3] = 0;
	target[4] = (xy - wz) * object.scale.y;
	target[5] = (1 - xx - zz) * object.scale.y;
	target[6] = (yz + wx) * object.scale.y;
	target[7] = 0;
	target[8] = (xz + wy) * object.scale.z;
	target[9] = (yz - wx) * object.scale.z;
	target[10] = (1 - xx - yy) * object.scale.z;
	target[11] = 0;
	target[12] = object.position.x;
	target[13] = object.position.y;
	target[14] = object.position.z;
	target[15] = 1;
}

function multiplyInto(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
	return target;
}

function validMatrix(matrix) {
	return matrix?.length === 16;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-vector.js */
__awtsmoosModule_13 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-vector.js
 * @description Mutable vector and quaternion vessels used throughout the tiny runtime.
 * The Awtsmoos renews every direction and rotation; Awtsmoos.com gives those values
 * readable forms whose identity remains stable while their present coordinates change.
 */

class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.set(x, y, z);
	}

	set(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	fromArray(values = [0, 0, 0]) {
		return this.set(values[0] || 0, values[1] || 0, values[2] || 0);
	}

	copy(vector) {
		return this.set(vector.x || 0, vector.y || 0, vector.z || 0);
	}

	clone() {
		return new Vector3(this.x, this.y, this.z);
	}

	toArray() {
		return [this.x, this.y, this.z];
	}
}


__exports.Vector3 = Vector3;
class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.set(x, y, z, w);
	}

	set(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}

	fromArray(values = [0, 0, 0, 1]) {
		return this.set(values[0] || 0, values[1] || 0, values[2] || 0, values[3] ?? 1);
	}

	copy(quaternion) {
		return this.set(
			quaternion.x || 0,
			quaternion.y || 0,
			quaternion.z || 0,
			quaternion.w ?? 1
		);
	}

	clone() {
		return new Quaternion(this.x, this.y, this.z, this.w);
	}

	toArray() {
		return [this.x, this.y, this.z, this.w];
	}
}

__exports.Quaternion = Quaternion;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-object3d.js */
__awtsmoosModule_6 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-object3d.js
 * @description Cached scene hierarchy with structural and visibility revision evidence.
 * The Awtsmoos recreates every parent and child together; Awtsmoos.com marks real hierarchy
 * changes so settled material and renderer systems stop rediscovering an unchanged village tree.
 */

var copyMat4 = __awtsmoosModule_7.copyMat4;
var identity = __awtsmoosModule_7.identity;
var cachedLocalMatrix = __awtsmoosModule_12.cachedLocalMatrix;
var invalidateTransformCache = __awtsmoosModule_12.invalidateTransformCache;
var ROOT_WORLD_MATRIX = __awtsmoosModule_12.ROOT_WORLD_MATRIX;
var updateCachedWorldMatrix = __awtsmoosModule_12.updateCachedWorldMatrix;
var Quaternion = __awtsmoosModule_13.Quaternion;
var Vector3 = __awtsmoosModule_13.Vector3;

class Object3D {
	constructor() {
		this.children = [];
		this.parent = null;
		this.position = new Vector3();
		this.quaternion = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		this.matrix = null;
		this.matrixWorld = identity();
		this.name = '';
		this._visible = true;
		this._sceneGraphRevision = 0;
		this.userData = {};
		this.isBone = false;
	}

	get visible() {
		return this._visible;
	}

	set visible(value) {
		const next = value !== false;
		if (this._visible === next) return;
		this._visible = next;
		markSceneGraphChanged(this);
	}

	add(object) {
		if (!object) return this;
		if (object.parent) object.parent.remove(object);
		object.parent = this;
		invalidateTransformCache(object);
		this.children.push(object);
		markSceneGraphChanged(this);
		return this;
	}

	remove(object) {
		const index = this.children.indexOf(object);
		if (index < 0) return this;
		this.children.splice(index, 1);
		markSceneGraphChanged(this);
		object.parent = null;
		invalidateTransformCache(object);
		return this;
	}

	traverse(visitor) {
		visitor(this);
		for (const child of this.children) child.traverse(visitor);
	}

	setBaseTransform() {
		this._base = {
			position: this.position.clone(),
			quaternion: this.quaternion.clone(),
			scale: this.scale.clone(),
			matrix: this.matrix ? copyMat4(this.matrix) : null
		};
		return this;
	}

	resetToBase() {
		if (!this._base) return;
		this.position.copy(this._base.position);
		this.quaternion.copy(this._base.quaternion);
		this.scale.copy(this._base.scale);
		this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null;
		invalidateTransformCache(this);
	}

	localMatrix() {
		return cachedLocalMatrix(this);
	}

	updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
		updateCachedWorldMatrix(this, parentWorld);
		for (const child of this.children) child.updateWorldMatrix(this.matrixWorld);
		return this.matrixWorld;
	}
}


__exports.Object3D = Object3D;
class Group extends Object3D {
	constructor() {
		super();
		this.isGroup = true;
	}
}


__exports.Group = Group;
class Scene extends Group {
	constructor() {
		super();
		this.isScene = true;
	}
}


__exports.Scene = Scene;
class Bone extends Object3D {
	constructor() {
		super();
		this.isBone = true;
	}
}


__exports.Bone = Bone;
function markSceneGraphChanged(object) {
	let root = object;
	while (root.parent) root = root.parent;
	root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-mesh-object.js */
__awtsmoosModule_14 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-mesh-object.js
 * @description Renderable scene-graph vessel joining geometry and material.
 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
 * contract focused so rigid stone and animated Chossid may share one clear doorway.
 */

var Object3D = __awtsmoosModule_6.Object3D;

class Mesh extends Object3D {
	constructor(geometry = null, material = null) {
		super();
		this.geometry = geometry;
		this.material = material;
		this.isMesh = true;
		this.isSkinnedMesh = false;
		this.skinIndex = null;
		this.skeleton = null;
		this.primitiveMode = 4;
		this.nodeIndex = null;
	}
}

__exports.Mesh = Mesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-geometry.js */
__awtsmoosModule_15 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-geometry.js
 * @description Buffer and material vessels shared by imported and procedural forms.
 * The Awtsmoos gives finite arrays the power to reveal mountains and faces; Awtsmoos.com
 * keeps geometry, attributes, and garments small, explicit, and reusable.
 */

class BufferGeometry {
	constructor() {
		this.attributes = {};
		this.index = null;
		this.mode = 4;
		this.userData = {};
	}

	setAttribute(key, value) {
		this.attributes[key] = value;
		return this;
	}

	setIndex(value) {
		this.index = value;
		return this;
	}
}


__exports.BufferGeometry = BufferGeometry;
class BufferAttribute {
	constructor(array, itemSize, normalized = false, componentType = null) {
		this.array = array;
		this.itemSize = itemSize;
		this.normalized = normalized;
		this.componentType = componentType;
		this.count = Math.floor((array?.length || 0) / itemSize);
	}
}


__exports.BufferAttribute = BufferAttribute;
class MeshStandardMaterial {
	constructor(parameters = {}) {
		const color = parameters.color || [0.74, 0.68, 0.58, 1];
		const opacity = parameters.opacity ?? color[3] ?? 1;
		const alphaMode = parameters.alphaMode || 'OPAQUE';
		const autoTransparent = alphaMode === 'BLEND' || opacity < 1;
		this.name = parameters.name || 'material';
		this.color = color;
		this.opacity = opacity;
		this.alphaMode = alphaMode;
		this.alphaCutoff = parameters.alphaCutoff ?? 0.5;
		this.transparent = parameters.transparent ?? autoTransparent;
		this.doubleSided = parameters.doubleSided === true;
	}
}

__exports.MeshStandardMaterial = MeshStandardMaterial;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js */
__awtsmoosModule_16 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-camera.js
 * @description Perspective camera vessel for the mountain-village revelation.
 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
 * rooted in the same cached scene graph as every visible flower and traveler.
 */

var Object3D = __awtsmoosModule_6.Object3D;

class PerspectiveCamera extends Object3D {
	constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
		super();
		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;
	}
}

__exports.PerspectiveCamera = PerspectiveCamera;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-runtime.js */
__awtsmoosModule_5 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-runtime.js
 * @description Stable public gateway to the focused tiny scene-graph runtime.
 * The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture;
 * Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel.
 */

var Bone = __awtsmoosModule_6.Bone;
var Group = __awtsmoosModule_6.Group;
var Object3D = __awtsmoosModule_6.Object3D;
var Scene = __awtsmoosModule_6.Scene;
var Mesh = __awtsmoosModule_14.Mesh;
var BufferAttribute = __awtsmoosModule_15.BufferAttribute;
var BufferGeometry = __awtsmoosModule_15.BufferGeometry;
var MeshStandardMaterial = __awtsmoosModule_15.MeshStandardMaterial;
var PerspectiveCamera = __awtsmoosModule_16.PerspectiveCamera;
var Quaternion = __awtsmoosModule_13.Quaternion;
var Vector3 = __awtsmoosModule_13.Vector3;

__exports.Bone = Bone;
__exports.BufferAttribute = BufferAttribute;
__exports.BufferGeometry = BufferGeometry;
__exports.Group = Group;
__exports.Mesh = Mesh;
__exports.MeshStandardMaterial = MeshStandardMaterial;
__exports.Object3D = Object3D;
__exports.PerspectiveCamera = PerspectiveCamera;
__exports.Quaternion = Quaternion;
__exports.Scene = Scene;
__exports.Vector3 = Vector3;

function resetTreeToBase(root) {
	root.traverse(object => object.resetToBase?.());
}


__exports.resetTreeToBase = resetTreeToBase;
const __awtsmoosDefault_1kr0uzg = {
	Bone,
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Quaternion,
	Scene,
	Vector3
};
__exports.default = __awtsmoosDefault_1kr0uzg;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js */
__awtsmoosModule_4 = (() => {
const __exports = {};
// B"H
var BufferAttribute = __awtsmoosModule_5.BufferAttribute;

/** Accessors: the hidden letters of GLTF made exact before the body moves. */
const COMPONENTS={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
__exports.COMPONENTS = COMPONENTS;

const TYPE_SIZES={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
__exports.TYPE_SIZES = TYPE_SIZES;

function componentName(t){return ({5120:'BYTE',5121:'UNSIGNED_BYTE',5122:'SHORT',5123:'UNSIGNED_SHORT',5125:'UNSIGNED_INT',5126:'FLOAT'})[t]||String(t);}

__exports.componentName = componentName;
function normalizedScale(Ctor){if(Ctor===Int8Array)return 1/127;if(Ctor===Uint8Array)return 1/255;if(Ctor===Int16Array)return 1/32767;if(Ctor===Uint16Array)return 1/65535;return 1;}


__exports.normalizedScale = normalizedScale;
function scalar(view,off,Ctor){if(Ctor===Float32Array)return view.getFloat32(off,true);if(Ctor===Uint32Array)return view.getUint32(off,true);if(Ctor===Uint16Array)return view.getUint16(off,true);if(Ctor===Uint8Array)return view.getUint8(off);if(Ctor===Int16Array)return view.getInt16(off,true);return view.getInt8(off);}
function writeTuple(target,index,values,itemSize){for(let k=0;k<itemSize;k++)target[index*itemSize+k]=values[k]??0;}

function readAccessor(doc,buffers,index){
  const a=doc.accessors[index],Ctor=COMPONENTS[a?.componentType],itemSize=TYPE_SIZES[a?.type]||1;if(!a||!Ctor)throw new Error(`Unsupported accessor ${index}`);
  const normalized=a.normalized===true;let array;
  if(a.bufferView===undefined){array=new Ctor(a.count*itemSize);}else{
    const bv=doc.bufferViews[a.bufferView],buffer=buffers[bv.buffer],base=(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||Ctor.BYTES_PER_ELEMENT*itemSize;
    if(stride===Ctor.BYTES_PER_ELEMENT*itemSize){array=new Ctor(buffer,base,a.count*itemSize);}else{array=new Ctor(a.count*itemSize);const view=new DataView(buffer);for(let i=0;i<a.count;i++)for(let k=0;k<itemSize;k++)array[i*itemSize+k]=scalar(view,base+i*stride+k*Ctor.BYTES_PER_ELEMENT,Ctor);}
  }
  if(a.sparse){array=new Ctor(array);applySparse(doc,buffers,a,array,itemSize,Ctor);}
  const attr=new BufferAttribute(array,itemSize,normalized,a.componentType);attr.accessorIndex=index;attr.min=a.min;attr.max=a.max;return attr;
}


__exports.readAccessor = readAccessor;
function applySparse(doc,buffers,a,array,itemSize,Ctor){
  const s=a.sparse,iv=doc.bufferViews[s.indices.bufferView],vv=doc.bufferViews[s.values.bufferView],ICtor=COMPONENTS[s.indices.componentType];
  const ib=buffers[iv.buffer],vb=buffers[vv.buffer],iBase=(iv.byteOffset||0)+(s.indices.byteOffset||0),vBase=(vv.byteOffset||0)+(s.values.byteOffset||0);
  const iView=new DataView(ib),vView=new DataView(vb);for(let n=0;n<s.count;n++){const idx=scalar(iView,iBase+n*ICtor.BYTES_PER_ELEMENT,ICtor),vals=[];for(let k=0;k<itemSize;k++)vals[k]=scalar(vView,vBase+(n*itemSize+k)*Ctor.BYTES_PER_ELEMENT,Ctor);writeTuple(array,idx,vals,itemSize);}
}

function accessorFloatArray(attr){
  const src=attr.array;if(src instanceof Float32Array&&!attr.normalized)return src;const out=new Float32Array(src.length),scale=attr.normalized?normalizedScale(src.constructor):1;
  for(let i=0;i<src.length;i++){let v=src[i]*scale;if(attr.normalized&&(src instanceof Int8Array||src instanceof Int16Array))v=Math.max(-1,v);out[i]=v;}return out;
}


__exports.accessorFloatArray = accessorFloatArray;
function normalizeWeightsAttribute(attr){
  const src=accessorFloatArray(attr),out=new Float32Array(src.length),size=attr.itemSize;for(let i=0;i<attr.count;i++){let sum=0;for(let k=0;k<size;k++)sum+=Math.abs(src[i*size+k]||0);if(sum>0){for(let k=0;k<size;k++)out[i*size+k]=(src[i*size+k]||0)/sum;}else out[i*size]=1;}return new BufferAttribute(out,size,false,5126);
}


__exports.normalizeWeightsAttribute = normalizeWeightsAttribute;
function accessorSummary(doc,index){const a=doc.accessors[index];return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;}

__exports.accessorSummary = accessorSummary;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-parser.js */
__awtsmoosModule_3 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-parser.js
 * @description Decodes GLTF animation channels into stable scalar sampling vessels.
 * The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com
 * preserves each source channel exactly while separating parsing from living playback.
 */

var accessorFloatArray = __awtsmoosModule_4.accessorFloatArray;

const TARGET_SIZE = {
	rotation: 4,
	scale: 3,
	translation: 3,
	weights: 1
};

function summarizeAnimations(document) {
	return (document.animations || []).map((animation, index) => ({
		channels: (animation.channels || []).length,
		index,
		name: animation.name || `animation_${index}`,
		paths: [...new Set(
			(animation.channels || [])
				.map(channel => channel.target?.path)
				.filter(Boolean)
		)],
		samplers: (animation.samplers || []).length
	}));
}


__exports.summarizeAnimations = summarizeAnimations;
function parseTinyAnimations(document, accessors, nodeMap) {
	return (document.animations || []).map((animation, index) => (
		parseAnimation(animation, index, accessors, nodeMap)
	));
}


__exports.parseTinyAnimations = parseTinyAnimations;
function parseAnimation(animation, index, accessors, nodeMap) {
	const channels = [];
	let duration = 0;
	for (const sourceChannel of animation.channels || []) {
		const channel = parseChannel(
			sourceChannel,
			animation.samplers || [],
			accessors,
			nodeMap
		);
		if (!channel) {
			continue;
		}
		channels.push(channel);
		duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
	}
	return {
		channels,
		duration,
		index,
		name: animation.name || `animation_${index}`
	};
}

function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
	const sampler = samplers[sourceChannel.sampler];
	const target = sourceChannel.target || {};
	const node = nodeMap.get(target.node);
	const size = TARGET_SIZE[target.path];
	if (!sampler || !node || !size) {
		return null;
	}
	return {
		input: accessorFloatArray(accessors[sampler.input]),
		interpolation: sampler.interpolation || 'LINEAR',
		node,
		nodeIndex: target.node,
		output: accessorFloatArray(accessors[sampler.output]),
		path: target.path,
		size
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-bindings.js */
__awtsmoosModule_18 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-bindings.js
 * @description Remembers only properties truly governed by imported animation channels.
 * The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels,
 * preserving exact bind values without traversing unrelated cottages, garments, or helpers.
 */

function createAnimationBindings(clips) {
	const bindingByNode = new Map();
	const bindings = [];
	for (const clip of clips) {
		for (const channel of clip.channels || []) {
			let paths = bindingByNode.get(channel.node);
			if (!paths) {
				paths = new Map();
				bindingByNode.set(channel.node, paths);
			}
			if (paths.has(channel.path)) {
				continue;
			}
			const binding = {
				base: readBaseValue(channel.node, channel.path),
				node: channel.node,
				path: channel.path
			};
			paths.set(channel.path, binding);
			bindings.push(binding);
		}
	}
	return bindings;
}


__exports.createAnimationBindings = createAnimationBindings;
function captureClipPose(clip) {
	const pose = new Map();
	for (const channel of clip?.channels || []) {
		pose.set(channel, readNodeValue(channel.node, channel.path));
	}
	return pose;
}


__exports.captureClipPose = captureClipPose;
function resetAnimationBindings(bindings) {
	for (const binding of bindings) {
		writeNodeValue(binding.node, binding.path, binding.base);
	}
}


__exports.resetAnimationBindings = resetAnimationBindings;
function writeNodeValue(node, path, values) {
	if (path === 'translation') {
		node.position.set(values[0], values[1], values[2]);
		return;
	}
	if (path === 'rotation') {
		node.quaternion.set(values[0], values[1], values[2], values[3]);
		return;
	}
	if (path === 'scale') {
		node.scale.set(values[0], values[1], values[2]);
	}
}


__exports.writeNodeValue = writeNodeValue;
function readBaseValue(node, path) {
	const base = node._base;
	if (path === 'translation') {
		const value = base?.position || node.position;
		return [value.x, value.y, value.z];
	}
	if (path === 'rotation') {
		const value = base?.quaternion || node.quaternion;
		return [value.x, value.y, value.z, value.w];
	}
	if (path === 'scale') {
		const value = base?.scale || node.scale;
		return [value.x, value.y, value.z];
	}
	return [0];
}

function readNodeValue(node, path) {
	if (path === 'translation') {
		return [node.position.x, node.position.y, node.position.z];
	}
	if (path === 'rotation') {
		return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
	}
	if (path === 'scale') {
		return [node.scale.x, node.scale.y, node.scale.z];
	}
	return [0];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-quaternion.js */
__awtsmoosModule_20 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-quaternion.js
 * @description Writes one normalized quaternion interpolation into a reusable vessel.
 * The Awtsmoos turns without division; Awtsmoos.com reveals that rotation through a
 * stable destination whose identity survives every sampled instant.
 */

function slerpQuaternionInto(
	output,
	ax,
	ay,
	az,
	aw,
	bx,
	by,
	bz,
	bw,
	amount
) {
	let cosine = ax * bx + ay * by + az * bz + aw * bw;
	if (cosine < 0) {
		bx = -bx;
		by = -by;
		bz = -bz;
		bw = -bw;
		cosine = -cosine;
	}
	if (cosine > 0.9995) {
		return normalizeInto(
			output,
			ax + (bx - ax) * amount,
			ay + (by - ay) * amount,
			az + (bz - az) * amount,
			aw + (bw - aw) * amount
		);
	}
	const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
	const sine = Math.sin(angle);
	const leftWeight = Math.sin((1 - amount) * angle) / sine;
	const rightWeight = Math.sin(amount * angle) / sine;
	return normalizeInto(
		output,
		ax * leftWeight + bx * rightWeight,
		ay * leftWeight + by * rightWeight,
		az * leftWeight + bz * rightWeight,
		aw * leftWeight + bw * rightWeight
	);
}


__exports.slerpQuaternionInto = slerpQuaternionInto;
function normalizeInto(output, x, y, z, w) {
	const scale = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
	output[0] = x * scale;
	output[1] = y * scale;
	output[2] = z * scale;
	output[3] = w * scale;
	return output;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-sampler.js */
__awtsmoosModule_19 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-sampler.js
 * @description Samples scalar animation channels without transient per-frame arrays.
 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
 * same measured pose while temporary numbers pass through stable, reusable vessels.
 */

var slerpQuaternionInto = __awtsmoosModule_20.slerpQuaternionInto;

function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
	const span = resolveSpan(channel, time);
	if (channel.path === 'rotation') {
		applyRotation(channel, span, fadeFrom, fadeAmount);
		return;
	}
	if (channel.path === 'translation' || channel.path === 'scale') {
		applyVector(channel, span, fadeFrom, fadeAmount);
	}
}


__exports.applyChannelSample = applyChannelSample;
function applyVector(channel, span, fadeFrom, fadeAmount) {
	const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
	for (let index = 0; index < 3; index += 1) {
		const sampled = sampleComponent(channel, span, index);
		values[index] = fadeFrom
			? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount
			: sampled;
	}
	const target = channel.path === 'translation'
		? channel.node.position
		: channel.node.scale;
	target.set(values[0], values[1], values[2]);
}

function applyRotation(channel, span, fadeFrom, fadeAmount) {
	const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
	const left = span.left * channel.size;
	const right = span.right * channel.size;
	const source = channel.output;
	if (span.step) {
		for (let index = 0; index < 4; index += 1) {
			output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
		}
	} else {
		slerpQuaternionInto(output,
			source[left] || 0, source[left + 1] || 0,
			source[left + 2] || 0, source[left + 3] ?? 1,
			source[right] || 0, source[right + 1] || 0,
			source[right + 2] || 0, source[right + 3] ?? 1,
			span.amount);
	}
	if (fadeFrom) {
		slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
	}
	channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
}

function sampleComponent(channel, span, componentIndex) {
	const left = span.left * channel.size + componentIndex;
	const valueA = channel.output[left] ?? 0;
	if (span.step) return valueA;
	const right = span.right * channel.size + componentIndex;
	const valueB = channel.output[right] ?? valueA;
	return valueA + (valueB - valueA) * span.amount;
}

function resolveSpan(channel, time) {
	const times = channel.input;
	const span = channel._sampleSpan || (channel._sampleSpan = {});
	const last = times.length - 1;
	if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
	if (time >= times[last]) return assignSpan(span, last, last, 0, true);
	let low = 0;
	let high = last;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (times[middle] <= time) low = middle;
		else high = middle;
	}
	const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
	return assignSpan(span, low, high, amount, channel.interpolation === 'STEP');
}

function assignSpan(span, left, right, amount, step) {
	span.left = left;
	span.right = right;
	span.amount = amount;
	span.step = step || left === right;
	return span;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-player.js */
__awtsmoosModule_17 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-player.js
 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
 */

var captureClipPose = __awtsmoosModule_18.captureClipPose;
var createAnimationBindings = __awtsmoosModule_18.createAnimationBindings;
var resetAnimationBindings = __awtsmoosModule_18.resetAnimationBindings;
var applyChannelSample = __awtsmoosModule_19.applyChannelSample;

class TinyAnimationPlayer {
	constructor(root, clips = []) {
		this.root = root;
		this.clips = clips;
		this.bindings = createAnimationBindings(clips);
		this.currentIndex = clips.length ? 0 : -1;
		this.time = 0;
		this.playing = true;
		this.bindPose = false;
		this.lastApplied = null;
		this.fadeDuration = 0.18;
		this.fadeTime = 0;
		this.fadePose = null;
	}

	get current() {
		return this.clips[this.currentIndex] || null;
	}

	get names() {
		return this.clips.map(clip => clip.name);
	}

	play(indexOrName) {
		const index = resolveClipIndex(this.clips, indexOrName);
		if (index < 0) return this.current;
		const target = this.clips[index];
		const alreadyApplied = this.lastApplied === target?.name;
		if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
			this.playing = true;
			return this.current;
		}
		const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== 'bind';
		this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
		this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
		this.currentIndex = index;
		this.time = 0;
		this.bindPose = false;
		this.playing = true;
		this.apply(0);
		return this.current;
	}

	next() {
		return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
	}

	setBindPose(enabled) {
		this.bindPose = Boolean(enabled);
		this.time = 0;
		this.fadePose = null;
		resetAnimationBindings(this.bindings);
		this.lastApplied = this.bindPose ? 'bind' : null;
	}

	update(deltaTime) {
		if (this.bindPose || !this.current) return;
		const delta = Math.max(0, Number(deltaTime) || 0);
		if (this.playing) this.time += delta;
		if (this.fadePose) this.fadeTime += delta;
		const duration = this.current.duration || 1;
		this.apply(duration ? this.time % duration : 0);
	}

	apply(time) {
		const clip = this.current;
		if (!clip) return;
		resetAnimationBindings(this.bindings);
		const fadeAmount = this.fadePose
			? smooth(Math.min(1, this.fadeTime / Math.max(0.001, this.fadeDuration)))
			: 1;
		for (const channel of clip.channels) {
			applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
		}
		if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
		this.lastApplied = clip.name;
	}

	diagnostics() {
		const clip = this.current;
		return {
			bindPose: this.bindPose,
			channels: clip?.channels.length || 0,
			clipCount: this.clips.length,
			currentAnimation: clip?.name || null,
			currentIndex: this.currentIndex,
			duration: Number((clip?.duration || 0).toFixed(3)),
			fade: this.fadePose
				? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3))
				: 0,
			playing: this.playing,
			time: Number(this.time.toFixed(3))
		};
	}
}


__exports.TinyAnimationPlayer = TinyAnimationPlayer;
function resolveClipIndex(clips, indexOrName) {
	return typeof indexOrName === 'number'
		? indexOrName
		: clips.findIndex(clip => clip.name === indexOrName);
}

function smooth(amount) {
	return amount * amount * (3 - 2 * amount);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-animation.js */
__awtsmoosModule_2 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation.js
 * @description Stable public doorway to parsed clips and allocation-free playback.
 * The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing,
 * sampling, bindings, and playback in small vessels behind one familiar import.
 */

__exports.parseTinyAnimations = __awtsmoosModule_3.parseTinyAnimations;
__exports.summarizeAnimations = __awtsmoosModule_3.summarizeAnimations;
__exports.TinyAnimationPlayer = __awtsmoosModule_17.TinyAnimationPlayer;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionConstants.js */
__awtsmoosModule_25 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionConstants.js
 * @description Names the stable phases, layers, and distinct staff and sword messages.
 * The Awtsmoos precedes every finite deed; Awtsmoos.com gives each intention a separate,
 * inspectable vessel so future AI-authored actions never dissolve into controller branches.
 */

const PLAYER_ACTION_PHASES = Object.freeze([
	'start',
	'progress',
	'release',
	'cancel'
]);
__exports.PLAYER_ACTION_PHASES = PLAYER_ACTION_PHASES;


const PLAYER_ACTION_LAYERS = Object.freeze([
	'upper-body',
	'full-body',
	'additive'
]);
__exports.PLAYER_ACTION_LAYERS = PLAYER_ACTION_LAYERS;


const PLAYER_ACTION_MESSAGES = Object.freeze({
	dispatch: 'player.action.dispatch',
	staffCast: 'player.action.staff.cast',
	swordCast: 'player.action.sword.cast'
});
__exports.PLAYER_ACTION_MESSAGES = PLAYER_ACTION_MESSAGES;


const PLAYER_ACTION_BONE_ROLES = Object.freeze([
	'hips',
	'spine',
	'spine1',
	'spine2',
	'neck',
	'head',
	'leftShoulder',
	'leftArm',
	'leftForeArm',
	'leftHand',
	'rightShoulder',
	'rightArm',
	'rightForeArm',
	'rightHand',
	'leftUpLeg',
	'leftLeg',
	'leftFoot',
	'rightUpLeg',
	'rightLeg',
	'rightFoot'
]);
__exports.PLAYER_ACTION_BONE_ROLES = PLAYER_ACTION_BONE_ROLES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionDefinitionValidator.js */
__awtsmoosModule_24 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionDefinitionValidator.js
 * @description Rejects malformed or unsafe declarative player-action definitions.
 * The Awtsmoos grants possibility without chaos; Awtsmoos.com limits each authored gesture
 * to finite timing, known roles, one message, and data that the runtime can inspect.
 */

var PLAYER_ACTION_BONE_ROLES = __awtsmoosModule_25.PLAYER_ACTION_BONE_ROLES;
var PLAYER_ACTION_LAYERS = __awtsmoosModule_25.PLAYER_ACTION_LAYERS;

const ROLE_SET = new Set(PLAYER_ACTION_BONE_ROLES);
const LAYER_SET = new Set(PLAYER_ACTION_LAYERS);

function validatePlayerActionDefinition(definition) {
	requireText(definition?.id, 'ACTION_ID_REQUIRED');
	requireText(definition?.messageType, 'ACTION_MESSAGE_REQUIRED');
	requireNumber(definition?.version, 'ACTION_VERSION_REQUIRED', 1);
	requireNumber(definition?.duration, 'ACTION_DURATION_REQUIRED', 0.05);
	requireNumber(definition?.releaseAt, 'ACTION_RELEASE_AT_REQUIRED', 0, 1);
	if (!LAYER_SET.has(definition.layer)) {
		throw new Error('ACTION_LAYER_INVALID');
	}
	if (!Array.isArray(definition.keyframes) || definition.keyframes.length < 2) {
		throw new Error('ACTION_KEYFRAMES_REQUIRED');
	}
	validateEquipment(definition.requiredEquipment);
	validateKeyframes(definition.keyframes);
	return Object.freeze({
		...definition,
		keyframes: Object.freeze(definition.keyframes.map(freezeFrame))
	});
}


__exports.validatePlayerActionDefinition = validatePlayerActionDefinition;
function validateEquipment(requirement) {
	if (!requirement) {
		return;
	}
	requireText(requirement.slot, 'ACTION_EQUIPMENT_SLOT_REQUIRED');
	if (!Array.isArray(requirement.itemIds) || !requirement.itemIds.length) {
		throw new Error('ACTION_EQUIPMENT_ITEMS_REQUIRED');
	}
	for (const itemId of requirement.itemIds) {
		requireText(itemId, 'ACTION_EQUIPMENT_ITEM_INVALID');
	}
}

function validateKeyframes(keyframes) {
	let previous = -1;
	for (const frame of keyframes) {
		requireNumber(frame?.at, 'ACTION_KEYFRAME_TIME_INVALID', 0, 1);
		if (frame.at < previous) {
			throw new Error('ACTION_KEYFRAME_ORDER_INVALID');
		}
		previous = frame.at;
		for (const [role, rotation] of Object.entries(frame.pose || {})) {
			if (!ROLE_SET.has(role)) {
				throw new Error(`ACTION_BONE_ROLE_INVALID:${role}`);
			}
			if (!Array.isArray(rotation) || rotation.length !== 3) {
				throw new Error(`ACTION_ROTATION_INVALID:${role}`);
			}
			for (const value of rotation) {
				requireNumber(value, `ACTION_ROTATION_INVALID:${role}`);
			}
		}
	}
	if (keyframes[0].at !== 0 || keyframes.at(-1).at !== 1) {
		throw new Error('ACTION_KEYFRAME_BOUNDARIES_REQUIRED');
	}
}

function freezeFrame(frame) {
	const pose = {};
	for (const [role, rotation] of Object.entries(frame.pose || {})) {
		pose[role] = Object.freeze([...rotation]);
	}
	return Object.freeze({ at: frame.at, pose: Object.freeze(pose) });
}

function requireText(value, code) {
	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(code);
	}
}

function requireNumber(value, code, minimum = -Infinity, maximum = Infinity) {
	if (!Number.isFinite(value) || value < minimum || value > maximum) {
		throw new Error(code);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionRegistry.js */
__awtsmoosModule_23 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRegistry.js
 * @description Stores validated custom actions without changing the player controller.
 * The Awtsmoos creates every new authored possibility now; Awtsmoos.com preserves unique
 * identities, message lookup, versions, and finite evidence for human and AI workers.
 */

var validatePlayerActionDefinition = __awtsmoosModule_24.validatePlayerActionDefinition;

class PlayerActionRegistry {
	constructor(definitions = []) {
		this.byId = new Map();
		this.byMessage = new Map();
		for (const definition of definitions) {
			this.register(definition);
		}
	}

	register(candidate) {
		const definition = validatePlayerActionDefinition(candidate);
		if (this.byId.has(definition.id)) {
			throw new Error(`ACTION_ID_DUPLICATE:${definition.id}`);
		}
		if (this.byMessage.has(definition.messageType)) {
			throw new Error(`ACTION_MESSAGE_DUPLICATE:${definition.messageType}`);
		}
		this.byId.set(definition.id, definition);
		this.byMessage.set(definition.messageType, definition);
		return definition;
	}

	get(actionId) {
		return this.byId.get(actionId) || null;
	}

	forMessage(messageType) {
		return this.byMessage.get(messageType) || null;
	}

	has(actionId) {
		return this.byId.has(actionId);
	}

	list() {
		return [...this.byId.values()].map(definition => ({
			duration: definition.duration,
			id: definition.id,
			layer: definition.layer,
			messageType: definition.messageType,
			version: definition.version
		}));
	}
}

__exports.PlayerActionRegistry = PlayerActionRegistry;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/definitions/staff/StaffCastAction.js */
__awtsmoosModule_26 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StaffCastAction.js
 * @description Defines a two-handed staff focus and release absent from the canonical GLB.
 * The Awtsmoos creates support and direction as one deed; Awtsmoos.com keeps the staff
 * message, equipment law, timing, and semantic-bone arc wholly separate from sword work.
 */

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_25.PLAYER_ACTION_MESSAGES;

const STAFF_CAST_ACTION = Object.freeze({
	autoRelease: false,
	duration: 1.35,
	id: 'staff.cast',
	keyframes: Object.freeze([
		frame(0, {
			leftArm: [-0.18, 0.02, -0.12],
			leftForeArm: [-0.26, 0.02, 0.12],
			rightArm: [-0.24, -0.04, 0.14],
			rightForeArm: [-0.34, -0.04, -0.12],
			spine2: [-0.03, 0.02, 0]
		}),
		frame(0.24, {
			leftArm: [-0.48, 0.08, -0.28],
			leftForeArm: [-0.72, 0.12, 0.22],
			leftHand: [-0.12, 0.2, 0.08],
			rightArm: [-0.56, -0.08, 0.26],
			rightForeArm: [-0.78, -0.1, -0.18],
			rightHand: [-0.14, -0.22, -0.08],
			spine2: [-0.09, 0.08, 0]
		}),
		frame(0.58, {
			head: [0.03, 0.1, 0],
			leftArm: [-0.68, 0.1, -0.34],
			leftForeArm: [-0.92, 0.14, 0.3],
			leftHand: [-0.2, 0.32, 0.12],
			neck: [0.05, 0.08, 0],
			rightArm: [-0.74, -0.12, 0.34],
			rightForeArm: [-0.96, -0.14, -0.26],
			rightHand: [-0.22, -0.34, -0.1],
			spine1: [-0.05, 0, 0],
			spine2: [-0.15, 0.09, 0]
		}),
		frame(0.82, {
			head: [0.02, -0.08, 0],
			leftArm: [-0.42, 0.16, -0.18],
			leftForeArm: [-0.66, 0.1, 0.12],
			rightArm: [-0.98, -0.1, 0.1],
			rightForeArm: [-0.3, -0.06, -0.04],
			rightHand: [-0.06, -0.26, 0],
			spine2: [-0.19, -0.08, 0]
		}),
		frame(1, {})
	]),
	layer: 'upper-body',
	messageType: PLAYER_ACTION_MESSAGES.staffCast,
	priority: 50,
	recovery: 0.24,
	releaseAt: 0.82,
	releaseEvent: 'player.action.staff.release',
	requiredEquipment: Object.freeze({
		itemIds: Object.freeze(['wooden-staff']),
		slot: 'hand'
	}),
	version: 1
});
__exports.STAFF_CAST_ACTION = STAFF_CAST_ACTION;


function frame(at, pose) {
	return Object.freeze({ at, pose: Object.freeze(pose) });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/definitions/sword/SwordCastAction.js */
__awtsmoosModule_27 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SwordCastAction.js
 * @description Defines a charged sword guard, arc, and follow-through absent from the GLB.
 * The Awtsmoos creates restraint and release together; Awtsmoos.com gives the Spark Blade
 * its own message, equipment law, timing, and semantic-bone language apart from the staff.
 */

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_25.PLAYER_ACTION_MESSAGES;

const SWORD_CAST_ACTION = Object.freeze({
	autoRelease: false,
	duration: 1.05,
	id: 'sword.cast',
	keyframes: Object.freeze([
		frame(0, {
			rightArm: [-0.1, -0.12, 0.22],
			rightForeArm: [-0.4, 0.04, -0.14],
			rightHand: [-0.08, 0.12, 0.04],
			spine2: [0.03, -0.06, 0]
		}),
		frame(0.2, {
			head: [0, 0.08, 0],
			leftArm: [-0.18, 0.1, -0.12],
			rightArm: [0.16, -0.42, 0.56],
			rightForeArm: [-0.78, 0.08, -0.22],
			rightHand: [-0.12, 0.2, 0.1],
			spine2: [0.1, -0.28, 0]
		}),
		frame(0.52, {
			head: [0.02, 0.12, 0],
			leftArm: [-0.28, 0.14, -0.18],
			rightArm: [-0.18, -0.58, 0.62],
			rightForeArm: [-0.92, 0.12, -0.2],
			rightHand: [-0.16, 0.26, 0.12],
			spine1: [0.05, -0.12, 0],
			spine2: [0.12, -0.38, 0]
		}),
		frame(0.74, {
			head: [0, -0.08, 0],
			leftArm: [-0.12, -0.08, -0.06],
			rightArm: [-1.08, 0.16, 0.06],
			rightForeArm: [-0.14, -0.04, -0.02],
			rightHand: [-0.05, -0.22, -0.06],
			spine1: [-0.08, 0.12, 0],
			spine2: [-0.22, 0.24, 0]
		}),
		frame(0.9, {
			rightArm: [-0.62, 0.06, 0.14],
			rightForeArm: [-0.34, 0, -0.08],
			spine2: [-0.1, 0.12, 0]
		}),
		frame(1, {})
	]),
	layer: 'upper-body',
	messageType: PLAYER_ACTION_MESSAGES.swordCast,
	priority: 55,
	recovery: 0.28,
	releaseAt: 0.74,
	releaseEvent: 'player.action.sword.release',
	requiredEquipment: Object.freeze({
		itemIds: Object.freeze(['spark-blade']),
		slot: 'hand'
	}),
	version: 1
});
__exports.SWORD_CAST_ACTION = SWORD_CAST_ACTION;


function frame(at, pose) {
	return Object.freeze({ at, pose: Object.freeze(pose) });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/BuiltInPlayerActions.js */
__awtsmoosModule_22 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuiltInPlayerActions.js
 * @description Registers the first custom actions without altering imported GLB clips.
 * The Awtsmoos creates distinct staff and sword possibility; Awtsmoos.com presents one
 * registry doorway through which later validated AI-authored actions may also enter.
 */

var PlayerActionRegistry = __awtsmoosModule_23.PlayerActionRegistry;
var STAFF_CAST_ACTION = __awtsmoosModule_26.STAFF_CAST_ACTION;
var SWORD_CAST_ACTION = __awtsmoosModule_27.SWORD_CAST_ACTION;

function createBuiltInPlayerActionRegistry() {
	return new PlayerActionRegistry([
		STAFF_CAST_ACTION,
		SWORD_CAST_ACTION
	]);
}

__exports.createBuiltInPlayerActionRegistry = createBuiltInPlayerActionRegistry;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseLibrary.js */
__awtsmoosModule_30 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerPoseLibrary.js
 * @description Declares finite Mixamo roles and deliberate cast, melee, and hit gestures.
 * The Awtsmoos gives every shoulder and hand a measured turn; Awtsmoos.com keeps static pose data
 * immutable, shared, inspectable, and separate from the runtime binder that applies it each frame.
 */

const MINIMAL_MEADOW_BONE_ROLES = Object.freeze({
	head: 'mixamorighead',
	leftArm: 'mixamorigleftarm',
	leftForeArm: 'mixamorigleftforearm',
	leftHand: 'mixamoriglefthand',
	leftShoulder: 'mixamorigleftshoulder',
	neck: 'mixamorigneck',
	rightArm: 'mixamorigrightarm',
	rightForeArm: 'mixamorigrightforearm',
	rightHand: 'mixamorigrighthand',
	rightShoulder: 'mixamorigrightshoulder',
	spine: 'mixamorigspine',
	spine1: 'mixamorigspine1',
	spine2: 'mixamorigspine2'
});
__exports.MINIMAL_MEADOW_BONE_ROLES = MINIMAL_MEADOW_BONE_ROLES;


const MINIMAL_MEADOW_PLAYER_POSES = Object.freeze({
	'cast-windup': Object.freeze([
		['spine2', -0.08, 0.12, 0], ['leftShoulder', -0.26, 0, -0.34],
		['leftArm', -0.42, 0.05, -0.2], ['leftForeArm', -0.68, 0.08, 0.2],
		['leftHand', -0.12, 0.22, 0.08], ['rightShoulder', -0.2, 0, 0.34],
		['rightArm', -0.52, -0.04, 0.24], ['rightForeArm', -0.72, -0.08, -0.16],
		['rightHand', -0.16, -0.24, -0.08], ['neck', 0.04, 0.08, 0],
		['head', 0.02, 0.1, 0]
	]),
	'cast-channel': Object.freeze([
		['spine1', -0.06, 0, 0], ['spine2', -0.14, 0.08, 0],
		['leftShoulder', -0.32, 0, -0.42], ['leftArm', -0.62, 0.08, -0.28],
		['leftForeArm', -0.88, 0.12, 0.28], ['leftHand', -0.2, 0.3, 0.12],
		['rightShoulder', -0.3, 0, 0.42], ['rightArm', -0.66, -0.08, 0.3],
		['rightForeArm', -0.9, -0.12, -0.24], ['rightHand', -0.22, -0.32, -0.1],
		['neck', 0.06, 0.1, 0], ['head', 0.04, 0.14, 0]
	]),
	'cast-release': Object.freeze([
		['spine2', -0.18, -0.08, 0], ['leftArm', -0.46, 0.18, -0.2],
		['leftForeArm', -0.74, 0.12, 0.16], ['rightShoulder', -0.24, 0, 0.28],
		['rightArm', -0.92, -0.12, 0.12], ['rightForeArm', -0.34, -0.08, -0.06],
		['rightHand', -0.08, -0.28, 0], ['neck', 0.02, -0.08, 0],
		['head', 0.02, -0.12, 0]
	]),
	'melee-windup': Object.freeze([
		['spine2', 0.08, -0.24, 0], ['rightShoulder', -0.12, 0, 0.22],
		['rightArm', 0.12, -0.32, 0.48], ['rightForeArm', -0.72, 0.06, -0.2],
		['rightHand', -0.1, 0.14, 0.08], ['head', 0, 0.12, 0]
	]),
	'melee-impact': Object.freeze([
		['spine2', -0.18, 0.18, 0], ['rightShoulder', -0.28, 0, 0.12],
		['rightArm', -0.98, 0.08, 0.08], ['rightForeArm', -0.18, 0, -0.04],
		['rightHand', -0.08, -0.18, 0], ['head', 0, -0.08, 0]
	]),
	'melee-recovery': Object.freeze([
		['spine2', -0.08, 0.08, 0], ['rightArm', -0.42, 0, 0.16],
		['rightForeArm', -0.44, 0, -0.08]
	]),
	'hit-reaction': Object.freeze([
		['spine1', 0.18, 0, 0.12], ['spine2', 0.26, -0.12, 0],
		['head', 0.14, 0.1, 0.08]
	])
});
__exports.MINIMAL_MEADOW_PLAYER_POSES = MINIMAL_MEADOW_PLAYER_POSES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerPoseMath.js */
__awtsmoosModule_29 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerPoseMath.js
 * @description Resolves bone roles, phase weights, and allocation-free additive quaternion turns.
 * The Awtsmoos joins imported pose and deliberate gesture in one normalized vessel; Awtsmoos.com
 * keeps trigonometry, easing, and naming outside the cached binder's smaller responsibility.
 */

var ROLES = __awtsmoosModule_30.MINIMAL_MEADOW_BONE_ROLES;

function minimalMeadowBoneRole(name) {
	const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
	return Object.keys(ROLES).find(role => ROLES[role] === normalized) || '';
}


__exports.minimalMeadowBoneRole = minimalMeadowBoneRole;
function minimalMeadowPoseAmount(controller) {
	const ratio = controller.duration && Number.isFinite(controller.duration)
		? Math.min(1, controller.elapsed / controller.duration)
		: controller.progress;
	if (controller.state === 'cast-windup') {
		return smooth(Math.min(1, controller.progress / 0.3));
	}
	if (controller.state === 'cast-channel') {
		return 0.95 + Math.sin(controller.elapsed * 8) * 0.05;
	}
	if (controller.state === 'cast-release') return 1 - ratio * 0.3;
	if (controller.state === 'hit-reaction') return Math.sin(Math.PI * ratio);
	if (controller.state.endsWith('recovery')) return 1 - smooth(ratio);
	return smooth(ratio || 1);
}


__exports.minimalMeadowPoseAmount = minimalMeadowPoseAmount;
function applyMinimalMeadowEuler(node, x, y, z) {
	if (!node) return;
	const halfX = x * 0.5;
	const halfY = y * 0.5;
	const halfZ = z * 0.5;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	const offsetX = sinX * cosY * cosZ + cosX * sinY * sinZ;
	const offsetY = cosX * sinY * cosZ - sinX * cosY * sinZ;
	const offsetZ = cosX * cosY * sinZ + sinX * sinY * cosZ;
	const offsetW = cosX * cosY * cosZ - sinX * sinY * sinZ;
	const quaternion = node.quaternion;
	const sourceX = quaternion.x;
	const sourceY = quaternion.y;
	const sourceZ = quaternion.z;
	const sourceW = quaternion.w;
	quaternion.set(
		sourceW * offsetX + sourceX * offsetW + sourceY * offsetZ - sourceZ * offsetY,
		sourceW * offsetY - sourceX * offsetZ + sourceY * offsetW + sourceZ * offsetX,
		sourceW * offsetZ + sourceX * offsetY - sourceY * offsetX + sourceZ * offsetW,
		sourceW * offsetW - sourceX * offsetX - sourceY * offsetY - sourceZ * offsetZ
	);
}


__exports.applyMinimalMeadowEuler = applyMinimalMeadowEuler;
function smooth(value) {
	return value * value * (3 - 2 * value);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBoneResolver.js */
__awtsmoosModule_31 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBoneResolver.js
 * @description Resolves semantic roles against one hydrated Mixamo-compatible skeleton.
 * The Awtsmoos is not divided by bone names; Awtsmoos.com translates finite exporter
 * spellings once so custom actions remain portable, inspectable, and actor-neutral.
 */

const ROLE_SUFFIXES = Object.freeze({
	hips: ['hips'],
	spine: ['spine'],
	spine1: ['spine1'],
	spine2: ['spine2'],
	neck: ['neck'],
	head: ['head'],
	leftShoulder: ['leftshoulder'],
	leftArm: ['leftarm', 'leftupperarm'],
	leftForeArm: ['leftforearm', 'leftlowerarm'],
	leftHand: ['lefthand'],
	rightShoulder: ['rightshoulder'],
	rightArm: ['rightarm', 'rightupperarm'],
	rightForeArm: ['rightforearm', 'rightlowerarm'],
	rightHand: ['righthand'],
	leftUpLeg: ['leftupleg', 'leftupperleg'],
	leftLeg: ['leftleg', 'leftlowerleg'],
	leftFoot: ['leftfoot'],
	rightUpLeg: ['rightupleg', 'rightupperleg'],
	rightLeg: ['rightleg', 'rightlowerleg'],
	rightFoot: ['rightfoot']
});

function resolvePlayerActionBones(model) {
	const records = {};
	const ambiguities = {};
	model?.traverse?.(node => {
		const normalized = normalizeBoneName(node.name);
		for (const [role, suffixes] of Object.entries(ROLE_SUFFIXES)) {
			if (!suffixes.some(suffix => normalized.endsWith(suffix))) {
				continue;
			}
			if (records[role]) {
				ambiguities[role] ||= [records[role].name];
				ambiguities[role].push(node.name || '');
				continue;
			}
			records[role] = node;
		}
	});
	return {
		ambiguities,
		records,
		roles: Object.keys(records)
	};
}


__exports.resolvePlayerActionBones = resolvePlayerActionBones;
function normalizeBoneName(name) {
	return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

__exports.normalizeBoneName = normalizeBoneName;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionActor.js */
__awtsmoosModule_28 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionActor.js
 * @description Applies custom action rotations from immutable bind-pose quaternions.
 * The Awtsmoos creates base and gesture without cumulative distortion; Awtsmoos.com keeps
 * every unsampled arm from multiplying yesterday's offset into a visible T-pose.
 */

var applyMinimalMeadowEuler = __awtsmoosModule_29.applyMinimalMeadowEuler;
var resolvePlayerActionBones = __awtsmoosModule_31.resolvePlayerActionBones;

class PlayerActionActor {
	constructor(options) {
		this.id = options.id || 'actor';
		this.bus = options.bus || null;
		this.equipment = options.equipment || null;
		this.model = null;
		this.bones = {};
		this.bindQuaternions = {};
		this.ambiguities = {};
		this.bindModel(options.model);
	}

	bindModel(model) {
		this.model = model || null;
		const result = resolvePlayerActionBones(model);
		this.bones = result.records;
		this.ambiguities = result.ambiguities;
		this.bindQuaternions = Object.fromEntries(
			Object.entries(this.bones).map(([role, node]) => [
				role,
				quaternionRecord(node.quaternion)
			])
		);
		return this.diagnostics();
	}

	equipped(slot) {
		if (typeof this.equipment?.equipped === 'function') {
			return this.equipment.equipped(slot);
		}
		if (slot === 'hand') {
			return this.equipment?.weaponItemId || null;
		}
		return this.equipment?.[slot] || null;
	}

	canPerform(definition) {
		const requirement = definition.requiredEquipment;
		if (!requirement) {
			return { accepted: true };
		}
		const itemId = this.equipped(requirement.slot);
		return requirement.itemIds.includes(itemId)
			? { accepted: true, itemId }
			: { accepted: false, itemId, reason: 'ACTION_EQUIPMENT_REQUIRED' };
	}

	apply(pose, weight) {
		for (const [role, rotation] of pose) {
			const bone = this.bones[role];
			const base = this.bindQuaternions[role];
			if (!bone || !base) {
				continue;
			}
			bone.quaternion.set(base.x, base.y, base.z, base.w);
			applyMinimalMeadowEuler(
				bone,
				rotation[0] * weight,
				rotation[1] * weight,
				rotation[2] * weight
			);
		}
	}

	diagnostics() {
		return {
			actorId: this.id,
			ambiguities: { ...this.ambiguities },
			bindQuaternionCount: Object.keys(this.bindQuaternions).length,
			boundBones: Object.keys(this.bones).length,
			model: this.model?.name || null,
			roles: Object.keys(this.bones)
		};
	}
}


__exports.PlayerActionActor = PlayerActionActor;
function quaternionRecord(quaternion = {}) {
	return Object.freeze({
		w: Number.isFinite(quaternion.w) ? quaternion.w : 1,
		x: Number(quaternion.x) || 0,
		y: Number(quaternion.y) || 0,
		z: Number(quaternion.z) || 0
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionMessageBridge.js */
__awtsmoosModule_32 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionMessageBridge.js
 * @description Translates real combat lifecycle into distinct staff and sword action messages.
 * The Awtsmoos is one before weapon and spell; Awtsmoos.com preserves separate public
 * contracts while letting future AI messages enter the same validated action runtime.
 */

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_25.PLAYER_ACTION_MESSAGES;

class PlayerActionMessageBridge {
	constructor(options) {
		this.bus = options.bus;
		this.equipment = options.equipment;
		this.runtime = options.runtime;
		this.activeMessageType = null;
		this.unsubscribers = [];
		this.install();
	}

	install() {
		this.listen('combat:cast-start', detail => this.beginCombatAction(detail));
		this.listen('combat:cast-progress', detail => this.progressCombatAction(detail));
		this.listen('combat:cast-launch', detail => this.finishCombatAction(detail));
		this.listen('combat:cast-cancel', detail => this.cancelCombatAction(detail));
		this.listen(PLAYER_ACTION_MESSAGES.staffCast, detail => {
			this.runtime.dispatch({ ...detail, type: PLAYER_ACTION_MESSAGES.staffCast });
		});
		this.listen(PLAYER_ACTION_MESSAGES.swordCast, detail => {
			this.runtime.dispatch({ ...detail, type: PLAYER_ACTION_MESSAGES.swordCast });
		});
		this.listen(PLAYER_ACTION_MESSAGES.dispatch, detail => {
			this.runtime.dispatch(detail);
		});
	}

	beginCombatAction(detail) {
		this.activeMessageType = messageForEquipment(this.equipment);
		this.bus.emit(this.activeMessageType, {
			...detail,
			phase: 'start',
			source: 'combat'
		});
	}

	progressCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		this.bus.emit(this.activeMessageType, {
			...detail,
			phase: 'progress',
			source: 'combat'
		});
	}

	finishCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		const messageType = this.activeMessageType;
		this.activeMessageType = null;
		this.bus.emit(messageType, {
			...detail,
			phase: 'release',
			source: 'combat'
		});
	}

	cancelCombatAction(detail) {
		if (!this.activeMessageType) {
			return;
		}
		const messageType = this.activeMessageType;
		this.activeMessageType = null;
		this.bus.emit(messageType, {
			...detail,
			phase: 'cancel',
			source: 'combat'
		});
	}

	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.unsubscribers = [];
	}
}


__exports.PlayerActionMessageBridge = PlayerActionMessageBridge;
function messageForEquipment(equipment) {
	return equipment?.weaponItemId === 'spark-blade'
		? PLAYER_ACTION_MESSAGES.swordCast
		: PLAYER_ACTION_MESSAGES.staffCast;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskMath.js */
__awtsmoosModule_36 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskMath.js
 * @description Constrains additive turns and composes them from a supplied imported base.
 * The Awtsmoos is unlimited while a creature's neck is measured; Awtsmoos.com gives each
 * quaternion a normalized vessel so repeated revelation never becomes accumulated distortion.
 */

const LIMITS = Object.freeze({
	head: 0.12,
	neck: 0.12,
	spine: 0.35,
	spine1: 0.45,
	spine2: 0.45,
	leftShoulder: 1.2,
	rightShoulder: 1.2,
	leftArm: 1.8,
	rightArm: 1.8,
	leftForeArm: 2,
	rightForeArm: 2,
	leftHand: 1.2,
	rightHand: 1.2
});

function constrainedPlayerActionEuler(role, rotation, weight, target) {
	const limit = LIMITS[role] || 0;
	const amount = Math.max(0, Math.min(1, Number(weight) || 0));
	for (let index = 0; index < 3; index += 1) {
		const value = Number(rotation?.[index]) || 0;
		target[index] = Math.max(-limit, Math.min(limit, value)) * amount;
	}
	return target;
}


__exports.constrainedPlayerActionEuler = constrainedPlayerActionEuler;
function setPlayerActionQuaternionFromEuler(node, base, rotation) {
	const halfX = rotation[0] * 0.5;
	const halfY = rotation[1] * 0.5;
	const halfZ = rotation[2] * 0.5;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	const ox = sinX * cosY * cosZ + cosX * sinY * sinZ;
	const oy = cosX * sinY * cosZ - sinX * cosY * sinZ;
	const oz = cosX * cosY * sinZ + sinX * sinY * cosZ;
	const ow = cosX * cosY * cosZ - sinX * sinY * sinZ;
	const x = base.w * ox + base.x * ow + base.y * oz - base.z * oy;
	const y = base.w * oy - base.x * oz + base.y * ow + base.z * ox;
	const z = base.w * oz + base.x * oy - base.y * ox + base.z * ow;
	const w = base.w * ow - base.x * ox - base.y * oy - base.z * oz;
	const length = Math.hypot(x, y, z, w) || 1;
	node.quaternion.set(x / length, y / length, z / length, w / length);
}


__exports.setPlayerActionQuaternionFromEuler = setPlayerActionQuaternionFromEuler;
function playerActionQuaternionDistanceSquared(left, right) {
	const direct = square(left.x - right.x)
		+ square(left.y - right.y)
		+ square(left.z - right.z)
		+ square(left.w - right.w);
	const negated = square(left.x + right.x)
		+ square(left.y + right.y)
		+ square(left.z + right.z)
		+ square(left.w + right.w);
	return Math.min(direct, negated);
}


__exports.playerActionQuaternionDistanceSquared = playerActionQuaternionDistanceSquared;
function square(value) {
	return value * value;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBodyMask.js */
__awtsmoosModule_35 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMask.js
 * @description Applies custom poses only to a bounded semantic upper-body mask.
 * The Awtsmoos fills every limb without confusing its purpose; Awtsmoos.com permits the
 * spine and hands to cast while root, hips, and legs remain faithful to imported locomotion.
 */

var constrainedPlayerActionEuler = __awtsmoosModule_36.constrainedPlayerActionEuler;
var playerActionQuaternionDistanceSquared = __awtsmoosModule_36.playerActionQuaternionDistanceSquared;
var setPlayerActionQuaternionFromEuler = __awtsmoosModule_36.setPlayerActionQuaternionFromEuler;

const PLAYER_ACTION_UPPER_BODY_ROLES = Object.freeze([
	'spine', 'spine1', 'spine2', 'neck', 'head',
	'leftShoulder', 'leftArm', 'leftForeArm', 'leftHand',
	'rightShoulder', 'rightArm', 'rightForeArm', 'rightHand'
]);
__exports.PLAYER_ACTION_UPPER_BODY_ROLES = PLAYER_ACTION_UPPER_BODY_ROLES;


const ROLE_SET = new Set(PLAYER_ACTION_UPPER_BODY_ROLES);
const WORK_EULER = [0, 0, 0];

function capturePlayerActionBasePose(actor, target = new Map()) {
	for (const role of PLAYER_ACTION_UPPER_BODY_ROLES) {
		const quaternion = actor.bones?.[role]?.quaternion;
		if (!quaternion) {
			target.delete(role);
			continue;
		}
		const record = target.get(role) || {};
		Object.assign(record, quaternionRecord(quaternion));
		target.set(role, record);
	}
	return target;
}


__exports.capturePlayerActionBasePose = capturePlayerActionBasePose;
function restorePlayerActionBasePose(actor, basePose) {
	for (const [role, base] of basePose) {
		actor.bones?.[role]?.quaternion?.set(base.x, base.y, base.z, base.w);
	}
}


__exports.restorePlayerActionBasePose = restorePlayerActionBasePose;
function applyPlayerActionBodyMask(actor, basePose, pose, weight) {
	restorePlayerActionBasePose(actor, basePose);
	let applied = 0;
	let filtered = 0;
	for (const [role, rotation] of pose) {
		const node = actor.bones?.[role];
		const base = basePose.get(role);
		if (!ROLE_SET.has(role) || !node || !base) {
			filtered += 1;
			continue;
		}
		constrainedPlayerActionEuler(role, rotation, weight, WORK_EULER);
		setPlayerActionQuaternionFromEuler(node, base, WORK_EULER);
		applied += 1;
	}
	return { applied, filtered };
}


__exports.applyPlayerActionBodyMask = applyPlayerActionBodyMask;
function recordPlayerActionPose(actor, target = new Map()) {
	return capturePlayerActionBasePose(actor, target);
}


__exports.recordPlayerActionPose = recordPlayerActionPose;function playerActionPoseMatches(actor, records, tolerance = 1e-12) {
	if (!records.size) {
		return false;
	}
	for (const [role, record] of records) {
		const current = actor.bones?.[role]?.quaternion;
		if (!current || playerActionQuaternionDistanceSquared(current, record) > tolerance) {
			return false;
		}
	}
	return true;
}

function quaternionRecord(quaternion) {
	return {
		w: Number.isFinite(quaternion.w) ? quaternion.w : 1,
		x: Number(quaternion.x) || 0,
		y: Number(quaternion.y) || 0,
		z: Number(quaternion.z) || 0
	};
}

__exports.playerActionPoseMatches = playerActionPoseMatches;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskRuntime.js */
__awtsmoosModule_34 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskRuntime.js
 * @description Preserves fresh imported samples and rejects prior-frame overlay accumulation.
 * The Awtsmoos creates every frame anew; Awtsmoos.com distinguishes the new locomotion base
 * from the old gesture so recovery returns to moving truth instead of a frozen bind pose.
 */

var applyPlayerActionBodyMask = __awtsmoosModule_35.applyPlayerActionBodyMask;
var capturePlayerActionBasePose = __awtsmoosModule_35.capturePlayerActionBasePose;
var playerActionPoseMatches = __awtsmoosModule_35.playerActionPoseMatches;
var recordPlayerActionPose = __awtsmoosModule_35.recordPlayerActionPose;
var restorePlayerActionBasePose = __awtsmoosModule_35.restorePlayerActionBasePose;

class PlayerActionBodyMaskRuntime {
	constructor(actor) {
		this.actor = actor;
		this.basePose = new Map();
		this.appliedPose = new Map();
		this.explicitCapture = false;
		this.lastMask = { applied: 0, filtered: 0 };
	}

	captureImportedPose() {
		capturePlayerActionBasePose(this.actor, this.basePose);
		this.explicitCapture = true;
		return this.basePose.size;
	}

	apply(pose, weight) {
		this.prepareBasePose();
		this.lastMask = applyPlayerActionBodyMask(
			this.actor,
			this.basePose,
			pose,
			weight
		);
		recordPlayerActionPose(this.actor, this.appliedPose);
		return this.lastMask;
	}

	restore() {
		restorePlayerActionBasePose(this.actor, this.basePose);
		this.appliedPose.clear();
	}

	diagnostics() {
		return {
			baseBones: this.basePose.size,
			...this.lastMask
		};
	}

	prepareBasePose() {
		if (this.explicitCapture) {
			this.explicitCapture = false;
			return;
		}
		if (!this.basePose.size) {
			this.captureImportedPose();
			this.explicitCapture = false;
			return;
		}
		if (this.appliedPose.size && !playerActionPoseMatches(this.actor, this.appliedPose)) {
			capturePlayerActionBasePose(this.actor, this.basePose);
		}
	}
}

__exports.PlayerActionBodyMaskRuntime = PlayerActionBodyMaskRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionRuntimeState.js */
__awtsmoosModule_38 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntimeState.js
 * @description Advances finite action playback while recovery preserves its sampled moment.
 * The Awtsmoos creates beginning and return in one intention; Awtsmoos.com fades a gesture
 * toward the freshly imported pose without rewinding its timeline or snapping to bind.
 */

function createPlayerActionState(definition, message, sequence) {
	return {
		cancelReason: null,
		definition,
		duration: positive(message.duration, definition.duration),
		elapsed: 0,
		externalProgress: bounded(message.progress),
		message,
		phase: 'playing',
		progress: 0,
		recoveryElapsed: 0,
		recoveryStartWeight: 0,
		releaseCount: 0,
		released: false,
		sequence,
		weight: 0
	};
}


__exports.createPlayerActionState = createPlayerActionState;
function advancePlayerActionState(action, deltaSeconds) {
	const delta = Math.max(0, Number(deltaSeconds) || 0);
	if (action.phase === 'recovering') {
		action.recoveryElapsed += delta;
		const duration = positive(action.definition.recovery, 0.001);
		action.weight = Math.max(
			0,
			action.recoveryStartWeight * (1 - action.recoveryElapsed / duration)
		);
	} else {
		action.elapsed += delta;
		const timedProgress = bounded(action.elapsed / action.duration);
		action.progress = Math.max(action.progress, timedProgress, action.externalProgress);
		action.weight = Math.min(1, action.weight + delta * 10);
	}
	return {
		finished: action.phase === 'recovering' && action.weight <= 0,
		progress: action.progress,
		releaseDue: action.definition.autoRelease !== false
			&& !action.released
			&& action.progress >= action.definition.releaseAt,
		timelineComplete: action.progress >= 1 && action.phase === 'playing'
	};
}


__exports.advancePlayerActionState = advancePlayerActionState;
function beginPlayerActionRecovery(action, cancelReason = null) {
	if (!action || action.phase === 'recovering') {
		return action;
	}
	action.phase = 'recovering';
	action.recoveryElapsed = 0;
	action.recoveryStartWeight = action.weight;
	action.cancelReason = cancelReason;
	return action;
}


__exports.beginPlayerActionRecovery = beginPlayerActionRecovery;
function playerActionStateSnapshot(action) {
	return {
		activeActionId: action?.definition.id || null,
		cancelReason: action?.cancelReason || null,
		elapsed: action?.elapsed || 0,
		phase: action?.phase || 'idle',
		progress: action?.progress || 0,
		releaseCount: action?.releaseCount || 0,
		weight: action?.weight || 0
	};
}


__exports.playerActionStateSnapshot = playerActionStateSnapshot;
function boundedPlayerActionProgress(value) {
	return bounded(value);
}


__exports.boundedPlayerActionProgress = boundedPlayerActionProgress;
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function bounded(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskLifecycle.js */
__awtsmoosModule_37 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskLifecycle.js
 * @description Emits singular releases and shapes inspectable runtime receipts.
 * The Awtsmoos is one before event and record; Awtsmoos.com keeps finite lifecycle
 * bookkeeping outside the quaternion vessel so each module reveals one responsibility.
 */

var playerActionStateSnapshot = __awtsmoosModule_38.playerActionStateSnapshot;

function emitPlayerActionRelease(runtime, message = {}) {
	const action = runtime.active;
	if (!action || action.released) {
		return false;
	}
	action.released = true;
	action.releaseCount += 1;
	runtime.bus?.emit?.(action.definition.releaseEvent, {
		actionId: action.definition.id,
		actorId: runtime.actor.id,
		message,
		sequence: action.sequence
	});
	return true;
}


__exports.emitPlayerActionRelease = emitPlayerActionRelease;
function playerActionResultRecord(actionId, result, reason = null) {
	return { actionId, reason, result };
}


__exports.playerActionResultRecord = playerActionResultRecord;
function playerActionRuntimeSnapshot(runtime) {
	return {
		...playerActionStateSnapshot(runtime.active),
		actor: runtime.actor.diagnostics(),
		composition: runtime.composition.diagnostics(),
		lastResult: runtime.lastResult,
		sequence: runtime.sequence
	};
}

__exports.playerActionRuntimeSnapshot = playerActionRuntimeSnapshot;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionPoseSampler.js */
__awtsmoosModule_39 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionPoseSampler.js
 * @description Interpolates declarative semantic-bone keyframes without per-frame objects.
 * The Awtsmoos unites beginning and completion; Awtsmoos.com reveals each measured instant
 * through one reusable pose vessel instead of hidden imperative bone mutations.
 */

class PlayerActionPoseSampler {
	constructor() {
		this.output = new Map();
	}

	sample(definition, progress) {
		const frames = definition.keyframes;
		const value = Math.max(0, Math.min(1, Number(progress) || 0));
		let rightIndex = 1;
		while (rightIndex < frames.length - 1 && frames[rightIndex].at < value) {
			rightIndex += 1;
		}
		const left = frames[rightIndex - 1];
		const right = frames[rightIndex];
		const span = Math.max(0.000001, right.at - left.at);
		const amount = smooth((value - left.at) / span);
		this.output.clear();
		const roles = new Set([
			...Object.keys(left.pose),
			...Object.keys(right.pose)
		]);
		for (const role of roles) {
			const start = left.pose[role] || ZERO;
			const end = right.pose[role] || ZERO;
			this.output.set(role, [
				mix(start[0], end[0], amount),
				mix(start[1], end[1], amount),
				mix(start[2], end[2], amount)
			]);
		}
		return this.output;
	}
}


__exports.PlayerActionPoseSampler = PlayerActionPoseSampler;
const ZERO = Object.freeze([0, 0, 0]);

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function smooth(value) {
	const bounded = Math.max(0, Math.min(1, value));
	return bounded * bounded * (3 - 2 * bounded);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionRuntimeCommands.js */
__awtsmoosModule_40 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntimeCommands.js
 * @description Validates phase routing and starts finite registered action records.
 * The Awtsmoos is one before command and response; Awtsmoos.com separates message
 * interpretation from bone application so future actions need no controller edits.
 */

var PLAYER_ACTION_PHASES = __awtsmoosModule_25.PLAYER_ACTION_PHASES;
var boundedPlayerActionProgress = __awtsmoosModule_38.boundedPlayerActionProgress;
var createPlayerActionState = __awtsmoosModule_38.createPlayerActionState;

function dispatchPlayerAction(runtime, message = {}) {
	if (!PLAYER_ACTION_PHASES.includes(message.phase)) {
		return runtime.reject('ACTION_PHASE_INVALID', message);
	}
	const definition = runtime.registry.forMessage(message.type);
	if (!definition) {
		return runtime.reject('ACTION_MESSAGE_UNKNOWN', message);
	}
	if (message.phase === 'start') {
		return startPlayerAction(runtime, definition, message);
	}
	if (!runtime.active || runtime.active.definition.id !== definition.id) {
		return runtime.reject('ACTION_NOT_ACTIVE', message);
	}
	if (message.phase === 'progress') {
		runtime.active.externalProgress = boundedPlayerActionProgress(message.progress);
		return runtime.snapshot();
	}
	if (message.phase === 'release') {
		return runtime.release(message);
	}
	return runtime.cancel(message.reason || 'cancelled');
}


__exports.dispatchPlayerAction = dispatchPlayerAction;
function startPlayerAction(runtime, definition, message) {
	const permission = runtime.actor.canPerform(definition);
	if (!permission.accepted) {
		return runtime.reject(permission.reason, message);
	}
	if (runtime.active && definition.priority < runtime.active.definition.priority) {
		return runtime.reject('ACTION_PRIORITY_BLOCKED', message);
	}
	if (runtime.active) {
		runtime.cancel('replaced');
	}
	runtime.sequence += 1;
	runtime.active = createPlayerActionState(definition, message, runtime.sequence);
	runtime.publish();
	return runtime.snapshot();
}

__exports.startPlayerAction = startPlayerAction;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionRuntime.js */
__awtsmoosModule_33 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntime.js
 * @description Composes registered actions over each fresh imported upper-body sample.
 * The Awtsmoos renews locomotion and deed without rivalry; Awtsmoos.com keeps hips and legs
 * untouched, release singular, cancellation smooth, and future registry actions inspectable.
 */

var PlayerActionBodyMaskRuntime = __awtsmoosModule_34.PlayerActionBodyMaskRuntime;
var emitPlayerActionRelease = __awtsmoosModule_37.emitPlayerActionRelease;
var playerActionResultRecord = __awtsmoosModule_37.playerActionResultRecord;
var playerActionRuntimeSnapshot = __awtsmoosModule_37.playerActionRuntimeSnapshot;
var PlayerActionPoseSampler = __awtsmoosModule_39.PlayerActionPoseSampler;
var dispatchPlayerAction = __awtsmoosModule_40.dispatchPlayerAction;
var advancePlayerActionState = __awtsmoosModule_38.advancePlayerActionState;
var beginPlayerActionRecovery = __awtsmoosModule_38.beginPlayerActionRecovery;

class PlayerActionRuntime {
	constructor(options) {
		this.actor = options.actor;
		this.registry = options.registry;
		this.bus = options.bus || null;
		this.sampler = new PlayerActionPoseSampler();
		this.composition = new PlayerActionBodyMaskRuntime(this.actor);
		this.active = null;
		this.sequence = 0;
		this.lastResult = null;
	}
	dispatch(message = {}) {
		return dispatchPlayerAction(this, message);
	}
	captureImportedPose() {
		return this.composition.captureImportedPose();
	}
	update(deltaSeconds) {
		const action = this.active;
		if (!action) {
			return;
		}
		const result = advancePlayerActionState(action, deltaSeconds);
		const pose = this.sampler.sample(action.definition, result.progress);
		this.composition.apply(pose, action.weight);
		if (result.releaseDue) {
			this.fireRelease({ source: 'timeline-threshold' });
		}
		if (result.timelineComplete) {
			this.release({ source: 'timeline-complete' });
		}
		if (result.finished) {
			this.complete(action.cancelReason ? 'cancelled' : 'completed');
		}
	}
	release(message = {}) {
		if (!this.active) {
			return null;
		}
		this.fireRelease(message);
		beginPlayerActionRecovery(this.active);
		this.publish();
		return this.snapshot();
	}
	cancel(reason) {
		if (!this.active) {
			return null;
		}
		beginPlayerActionRecovery(this.active, reason || 'cancelled');
		this.lastResult = playerActionResultRecord(
			this.active.definition.id,
			'cancelled',
			reason
		);
		this.publish();
		return this.snapshot();
	}
	fireRelease(message = {}) {
		return emitPlayerActionRelease(this, message);
	}
	complete(result) {
		const actionId = this.active?.definition.id || null;
		const reason = this.active?.cancelReason || null;
		this.composition.restore();
		this.lastResult = playerActionResultRecord(actionId, result, reason);
		this.active = null;
		this.publish();
	}
	reject(reason, message) {
		this.lastResult = {
			messageType: message?.type || null,
			reason,
			result: 'rejected'
		};
		this.publish();
		return this.snapshot();
	}
	publish() {
		this.bus?.emit?.('player:action-state', this.snapshot());
	}
	snapshot() {
		return playerActionRuntimeSnapshot(this);
	}
	destroy() {
		this.composition.restore();
		this.active = null;
	}
}

__exports.PlayerActionRuntime = PlayerActionRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionSystem.js */
__awtsmoosModule_21 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionSystem.js
 * @description Installs an actor-neutral registry, runtime, and optional combat message bridge.
 * The Awtsmoos joins model and deed without replacing either; Awtsmoos.com exposes narrow
 * registration and dispatch APIs for the player, friendly Chossids, and future AI actions.
 */

var createBuiltInPlayerActionRegistry = __awtsmoosModule_22.createBuiltInPlayerActionRegistry;
var PlayerActionActor = __awtsmoosModule_28.PlayerActionActor;
var PlayerActionMessageBridge = __awtsmoosModule_32.PlayerActionMessageBridge;
var PlayerActionRuntime = __awtsmoosModule_33.PlayerActionRuntime;

function createPlayerActionSystem(options) {
	const registry = options.registry || createBuiltInPlayerActionRegistry();
	const actor = new PlayerActionActor({
		bus: options.bus,
		equipment: options.equipment,
		id: options.actorId,
		model: options.model
	});
	const runtime = new PlayerActionRuntime({
		actor,
		bus: options.bus,
		registry
	});
	const bridge = options.bridge === false
		? null
		: new PlayerActionMessageBridge({
			bus: options.bus,
			equipment: options.equipment,
			runtime
		});
	return {
		actor,
		bridge,
		destroy() {
			bridge?.destroy();
			runtime.destroy();
		},
		dispatch: message => runtime.dispatch(message),
		register: definition => registry.register(definition),
		registry,
		runtime,
		snapshot: () => runtime.snapshot(),
		update: deltaSeconds => runtime.update(deltaSeconds)
	};
}

__exports.createPlayerActionSystem = createPlayerActionSystem;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAnimationClipPolicy.js */
__awtsmoosModule_42 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationClipPolicy.js
 * @description Chooses imported clips while grounding outranks stale airborne labels.
 * The Awtsmoos gives rise and return their truthful boundaries; Awtsmoos.com preserves
 * genuine jump and fall in the air, yet never lets yesterday's fall possess grounded feet.
 */

const POLICIES = Object.freeze({
	falling: [/^falling_Armature$/i, /fall/i],
	jumping: [/^jump_Armature$/i, /jump/i],
	running: [/^run_Armature$/i, /run/i],
	standing: [/^stand_Armature$/i, /^stand 2_Armature$/i, /neutral/i],
	walking: [/^walk_Armature$/i, /walk/i]
});

function minimalMeadowClipForState(names, stateName, options = {}) {
	const patterns = policyFor(stateName, options.weaponKind);
	return findFirst(names, patterns)
		|| findFirst(names, POLICIES.standing)
		|| names[0]
		|| '';
}


__exports.minimalMeadowClipForState = minimalMeadowClipForState;
function minimalMeadowLocomotionState(runtime) {
	const state = runtime.state || {};
	if (state.grounded === false) {
		return risingAirPhase(state) ? 'jumping' : 'falling';
	}
	if (!state.moving) {
		return 'standing';
	}
	return state.runMode ? 'running' : 'walking';
}


__exports.minimalMeadowLocomotionState = minimalMeadowLocomotionState;
function minimalMeadowClipPolicyEvidence(names) {
	return {
		castBase: minimalMeadowClipForState(names, 'cast-channel'),
		castUsesAttack: /punch|stab|attack/i.test(minimalMeadowClipForState(names, 'cast-channel')),
		meleeBase: minimalMeadowClipForState(names, 'melee-impact'),
		standingBase: minimalMeadowClipForState(names, 'standing')
	};
}


__exports.minimalMeadowClipPolicyEvidence = minimalMeadowClipPolicyEvidence;
function risingAirPhase(state) {
	const phase = state.airPhase || state.action || '';
	return phase === 'jump-one'
		|| phase === 'jump-two'
		|| Number(state.velY) > 0;
}

function policyFor(stateName, weaponKind) {
	if (stateName.startsWith('cast-')) return POLICIES.standing;
	if (stateName.startsWith('melee-')) {
		return weaponKind === 'sword'
			? [/^stab$/i, /^punch$/i]
			: [/^punch$/i, /^stab$/i];
	}
	if (stateName === 'hit-reaction') return [/neutral/i, /^stand 2_Armature$/i];
	if (stateName === 'death') return POLICIES.falling;
	return POLICIES[stateName] || POLICIES.standing;
}

function findFirst(names, patterns) {
	for (const pattern of patterns) {
		const match = names.find(name => pattern.test(name));
		if (match) return match;
	}
	return '';
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAnimationComposition.js */
__awtsmoosModule_41 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationComposition.js
 * @description Orders imported locomotion, bounded overlays, and living-root orientation.
 * The Awtsmoos creates feet and prayer in one instant; Awtsmoos.com lets the legs keep
 * their truthful journey while the upper body reveals a finite deed without falling sideways.
 */

var minimalMeadowLocomotionState = __awtsmoosModule_42.minimalMeadowLocomotionState;

function minimalMeadowImportedAnimationState(runtime, animation, semanticState) {
	if (semanticState === 'death') {
		return semanticState;
	}
	const layer = animation.actions.runtime.active?.definition.layer || '';
	const upperBodyAction = layer === 'upper-body' || layer === 'additive';
	return semanticState.startsWith('cast-') || upperBodyAction
		? minimalMeadowLocomotionState(runtime)
		: semanticState;
}


__exports.minimalMeadowImportedAnimationState = minimalMeadowImportedAnimationState;
function updateMinimalMeadowLegacyOverlay(animation, deltaSeconds) {
	const actionActive = Boolean(animation.actions.runtime.active);
	const casting = animation.controller.state.startsWith('cast-');
	if (actionActive) {
		animation.legacyPoseSuppressed = true;
	}
	if (animation.legacyPoseSuppressed) {
		animation.pose.weight = 0;
		if (!actionActive && !casting) {
			animation.legacyPoseSuppressed = false;
		}
		return;
	}
	animation.pose.update(
		animation.controller,
		deltaSeconds,
		animation.player.names.length > 0
	);
}


__exports.updateMinimalMeadowLegacyOverlay = updateMinimalMeadowLegacyOverlay;
function stabilizeMinimalMeadowLivingRoot(runtime, semanticState) {
	if (!isGroundedLivingPlayer(runtime, semanticState)) {
		return false;
	}
	const quaternion = runtime.model?.quaternion;
	if (!quaternion) {
		return false;
	}
	const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w) || 1;
	const x = quaternion.x / length;
	const y = quaternion.y / length;
	const z = quaternion.z / length;
	const w = quaternion.w / length;
	const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));
	setQuaternion(quaternion, 0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	return true;
}


__exports.stabilizeMinimalMeadowLivingRoot = stabilizeMinimalMeadowLivingRoot;
function minimalMeadowRootUpDot(runtime) {
	const quaternion = runtime.model?.quaternion;
	if (!quaternion) {
		return 1;
	}
	const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w) || 1;
	const x = quaternion.x / length;
	const z = quaternion.z / length;
	return 1 - 2 * (x * x + z * z);
}


__exports.minimalMeadowRootUpDot = minimalMeadowRootUpDot;
function isGroundedLivingPlayer(runtime, semanticState) {
	const state = runtime.state || {};
	const health = Number(state.health);
	const living = semanticState !== 'death'
		&& state.defeated !== true
		&& (!Number.isFinite(health) || health > 0);
	return state.grounded !== false && living;
}

function setQuaternion(quaternion, x, y, z, w) {
	if (typeof quaternion.set === 'function') {
		quaternion.set(x, y, z, w);
		return;
	}
	Object.assign(quaternion, { w, x, y, z });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationEvents.js */
__awtsmoosModule_44 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationEvents.js
 * @description Binds existing combat events and publishes finite animation priorities.
 * The Awtsmoos carries deed into gesture without owning combat; Awtsmoos.com keeps listener names,
 * precedence, duration sanitation, and cleanup outside the state machine's smaller vessel.
 */

const MINIMAL_ANIMATION_PRIORITY = Object.freeze({
	death: 100,
	'cast-channel': 80,
	'cast-release': 80,
	'cast-windup': 80,
	'hit-reaction': 60,
	'melee-impact': 70,
	'melee-recovery': 70,
	'melee-windup': 70,
	standing: 0
});
__exports.MINIMAL_ANIMATION_PRIORITY = MINIMAL_ANIMATION_PRIORITY;


function bindMinimalMeadowCombatAnimation(bus, controller) {
	return [
		bus.on('combat:cast-start', payload => controller.castStart(payload)),
		bus.on('combat:cast-progress', payload => controller.castProgress(payload)),
		bus.on('combat:cast-launch', payload => controller.castLaunch(payload)),
		bus.on('combat:cast-cancel', payload => controller.castCancel(payload)),
		bus.on('player:attack', payload => controller.meleeStart(payload)),
		bus.on('combat:melee-result', payload => controller.meleeResult(payload)),
		bus.on('enemy:attack', payload => controller.hit(payload)),
		bus.on('player:defeated', payload => controller.defeat(payload))
	];
}


__exports.bindMinimalMeadowCombatAnimation = bindMinimalMeadowCombatAnimation;
function minimalAnimationDuration(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}


__exports.minimalAnimationDuration = minimalAnimationDuration;
function minimalAnimationProgress(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

__exports.minimalAnimationProgress = minimalAnimationProgress;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationTimeline.js */
__awtsmoosModule_45 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationTimeline.js
 * @description Advances finite combat phases without owning bus listeners or clip selection.
 * The Awtsmoos gives wind-up, impact, recovery, channel, and release their measured borders;
 * Awtsmoos.com keeps transition arithmetic outside the controller's event-facing vessel.
 */

var duration = __awtsmoosModule_44.minimalAnimationDuration;
var progress = __awtsmoosModule_44.minimalAnimationProgress;

function advanceMinimalCombatAnimation(controller, deltaSeconds) {
	controller.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	syncMinimalCastProgress(controller);
	if (controller.state === 'melee-windup' && finished(controller)) {
		controller.enter('melee-impact', 0.13, controller.payload);
		return;
	}
	if (controller.state === 'melee-impact' && finished(controller)) {
		controller.enter('melee-recovery', 0.22, controller.payload);
		return;
	}
	if (endsWhenFinished(controller.state) && finished(controller)) {
		controller.clear();
		return;
	}
	if (controller.state === 'cast-channel'
		&& !controller.runtime.combat?.cast
		&& controller.elapsed > controller.duration + 0.3) {
		controller.enter('cast-release', 0.24, controller.payload);
	}
}


__exports.advanceMinimalCombatAnimation = advanceMinimalCombatAnimation;
function syncMinimalCastProgress(controller) {
	const cast = controller.runtime.combat?.cast;
	if (!cast || !controller.state.startsWith('cast-') || controller.state === 'cast-release') return;
	controller.progress = progress(cast.progress);
	if (controller.progress >= 0.3 && controller.state === 'cast-windup') {
		controller.enter(
			'cast-channel',
			duration(cast.action?.castTime, controller.duration),
			controller.payload,
			false
		);
	}
}


__exports.syncMinimalCastProgress = syncMinimalCastProgress;
function finished(controller) {
	return controller.elapsed >= controller.duration;
}

function endsWhenFinished(state) {
	return state === 'melee-recovery' || state === 'hit-reaction' || state === 'cast-release';
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCombatAnimationController.js */
__awtsmoosModule_43 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationController.js
 * @description Locks cast, melee, hit, and death phases above locomotion through existing events.
 * The Awtsmoos joins intention, duration, release, and recovery; Awtsmoos.com prevents movement,
 * selection, or hydration from dissolving a deed before its measured animation boundary.
 */

var minimalMeadowLocomotionState = __awtsmoosModule_42.minimalMeadowLocomotionState;
var bindMinimalMeadowCombatAnimation = __awtsmoosModule_44.bindMinimalMeadowCombatAnimation;
var PRIORITY = __awtsmoosModule_44.MINIMAL_ANIMATION_PRIORITY;
var duration = __awtsmoosModule_44.minimalAnimationDuration;
var progress = __awtsmoosModule_44.minimalAnimationProgress;
var advanceMinimalCombatAnimation = __awtsmoosModule_45.advanceMinimalCombatAnimation;

class MinimalMeadowCombatAnimationController {
	constructor(runtime) {
		this.runtime = runtime;
		this.state = 'standing';
		this.elapsed = 0;
		this.duration = 0;
		this.progress = 0;
		this.payload = null;
		this.sequence = 0;
		this.unsubscribers = bindMinimalMeadowCombatAnimation(runtime.bus, this);
	}
	update(deltaSeconds) {
		advanceMinimalCombatAnimation(this, deltaSeconds);
	}
	animationState() {
		return this.locked ? this.state : minimalMeadowLocomotionState(this.runtime);
	}
	castStart(payload = {}) {
		this.runtime.bus.emit('equipment:draw', { source: 'cast-animation' });
		this.enter('cast-windup', duration(payload.duration, 1), payload);
	}
	castProgress(payload = {}) {
		if (!this.state.startsWith('cast-') || this.state === 'cast-release') return;
		this.payload = payload;
		this.progress = progress(payload.progress);
		if (this.progress >= 0.3 && this.state === 'cast-windup') {
			this.enter('cast-channel', duration(payload.duration, this.duration), payload, false);
		}
	}
	castLaunch(payload = {}) {
		this.progress = 1;
		this.enter('cast-release', 0.34, payload);
	}
	castCancel(payload = {}) {
		if (this.state.startsWith('cast-')) this.enter('cast-release', 0.18, payload);
	}
	meleeStart(payload = {}) {
		this.runtime.bus.emit('equipment:draw', { source: 'melee-animation' });
		const milliseconds = payload.attack?.windupMilliseconds
			|| payload.attack?.impactDelayMilliseconds;
		this.enter('melee-windup', duration(milliseconds / 1000, 0.22), payload);
	}
	meleeResult(payload = {}) {
		if (this.state.startsWith('melee-')) this.enter('melee-impact', 0.14, payload);
	}
	hit(payload = {}) {
		this.enter('hit-reaction', 0.28, payload);
	}
	defeat(payload = {}) {
		this.enter('death', Infinity, payload, true, true);
	}
	enter(state, nextDuration, payload, resetTime = true, force = false) {
		if (!force && priority(state) < priority(this.state)) return false;
		this.state = state;
		this.duration = nextDuration;
		this.payload = payload;
		if (resetTime) this.elapsed = 0;
		if (!state.startsWith('cast-')) this.progress = 0;
		this.sequence += 1;
		this.runtime.bus.emit('animation:state', this.snapshot());
		return true;
	}
	clear() {
		if (this.state === 'death') return;
		this.state = 'standing';
		this.elapsed = 0;
		this.duration = 0;
		this.progress = 0;
		this.payload = null;
		this.sequence += 1;
	}
	snapshot() {
		return {
			duration: this.duration,
			elapsed: this.elapsed,
			locked: this.locked,
			progress: this.progress,
			sequence: this.sequence,
			state: this.state
		};
	}
	get locked() {
		return priority(this.state) > 0;
	}
	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}


__exports.MinimalMeadowCombatAnimationController = MinimalMeadowCombatAnimationController;
function priority(state) {
	return PRIORITY[state] || 0;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerBonePose.js */
__awtsmoosModule_46 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerBonePose.js
 * @description Adds deliberate cast, melee, and hit gestures to cached Mixamo bones after GLB clips.
 * The Awtsmoos bends shoulder, hand, staff, torso, neck, and head without replacing the living rig;
 * Awtsmoos.com traverses once, allocates no frame geometry, and fades every deed back into travel.
 */

var POSES = __awtsmoosModule_30.MINIMAL_MEADOW_PLAYER_POSES;
var applyMinimalMeadowEuler = __awtsmoosModule_29.applyMinimalMeadowEuler;
var minimalMeadowBoneRole = __awtsmoosModule_29.minimalMeadowBoneRole;
var minimalMeadowPoseAmount = __awtsmoosModule_29.minimalMeadowPoseAmount;

class MinimalMeadowPlayerBonePose {
	constructor(model) {
		this.records = {};
		this.bound = [];
		this.weight = 0;
		this.lastPose = 'cast-windup';
		this.bind(model);
	}

	bind(model) {
		model?.traverse?.(node => {
			const role = minimalMeadowBoneRole(node.name);
			if (!role || this.records[role]) return;
			const quaternion = node.quaternion;
			const record = {
				base: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
				node,
				role
			};
			this.records[role] = record;
			this.bound.push(record);
		});
	}

	update(controller, deltaSeconds, animated) {
		const pose = POSES[controller.state];
		if (pose) this.lastPose = controller.state;
		const target = pose ? 1 : 0;
		const response = Math.min(1, Math.max(0, deltaSeconds) * 10);
		this.weight += (target - this.weight) * response;
		if (!animated) this.restoreBase();
		if (this.weight < 0.001) return;
		const definition = POSES[this.lastPose];
		const amount = this.weight * minimalMeadowPoseAmount(controller);
		for (const [role, x, y, z] of definition) {
			applyMinimalMeadowEuler(this.records[role]?.node, x * amount, y * amount, z * amount);
		}
	}

	restoreBase() {
		for (const record of this.bound) record.node.quaternion.set(...record.base);
	}

	diagnostics() {
		return {
			boundBones: this.bound.length,
			lastPose: this.lastPose,
			roles: Object.keys(this.records),
			weight: this.weight
		};
	}
}

__exports.MinimalMeadowPlayerBonePose = MinimalMeadowPlayerBonePose;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAnimationState.js */
__awtsmoosModule_1 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationState.js
 * @description Samples imported GLB motion before one bounded custom-action composition pass.
 * The Awtsmoos creates travel and special deed together; Awtsmoos.com preserves authoritative
 * stand, walk, run, jump, fall, punch, and stab beneath controlled upper-body revelation.
 */

var TinyAnimationPlayer = __awtsmoosModule_2.TinyAnimationPlayer;
var createPlayerActionSystem = __awtsmoosModule_21.createPlayerActionSystem;
var minimalMeadowImportedAnimationState = __awtsmoosModule_41.minimalMeadowImportedAnimationState;
var minimalMeadowRootUpDot = __awtsmoosModule_41.minimalMeadowRootUpDot;
var stabilizeMinimalMeadowLivingRoot = __awtsmoosModule_41.stabilizeMinimalMeadowLivingRoot;
var updateMinimalMeadowLegacyOverlay = __awtsmoosModule_41.updateMinimalMeadowLegacyOverlay;
var minimalMeadowClipForState = __awtsmoosModule_42.minimalMeadowClipForState;
var MinimalMeadowCombatAnimationController = __awtsmoosModule_43.MinimalMeadowCombatAnimationController;
var MinimalMeadowPlayerBonePose = __awtsmoosModule_46.MinimalMeadowPlayerBonePose;

function installMinimalMeadowAnimation(runtime) {
	destroyInstalledAnimation(runtime);
	const player = new TinyAnimationPlayer(runtime.model, runtime.playerGltf?.animations || []);
	const controller = new MinimalMeadowCombatAnimationController(runtime);
	const pose = new MinimalMeadowPlayerBonePose(runtime.model);
	const actions = createPlayerActionSystem({
		actorId: 'player',
		bus: runtime.bus,
		equipment: runtime.equipment,
		model: runtime.model
	});
	const animation = {
		actions,
		controller,
		legacyPoseSuppressed: false,
		model: runtime.model,
		player,
		pose
	};
	runtime.player = player;
	runtime.playerAnimation = animation;
	exposePlayerActionApi(runtime, actions);
	playCurrentClip(runtime, 'standing');
	player.update(0);
	actions.runtime.captureImportedPose();
	runtime.animationDiagnostics = () => diagnostics(runtime, animation);
	return player;
}


__exports.installMinimalMeadowAnimation = installMinimalMeadowAnimation;
function updateMinimalMeadowAnimation(runtime, deltaSeconds) {
	let animation = runtime.playerAnimation;
	if (!animation || animation.model !== runtime.model) {
		installMinimalMeadowAnimation(runtime);
		animation = runtime.playerAnimation;
	}
	animation.controller.update(deltaSeconds);
	const semanticState = animation.controller.animationState();
	const importedState = minimalMeadowImportedAnimationState(
		runtime,
		animation,
		semanticState
	);
	playCurrentClip(runtime, importedState);
	animation.player.update(deltaSeconds);
	animation.actions.runtime.captureImportedPose();
	updateMinimalMeadowLegacyOverlay(animation, deltaSeconds);
	animation.actions.update(deltaSeconds);
	stabilizeMinimalMeadowLivingRoot(runtime, semanticState);
	recordAnimationState(runtime, animation, semanticState, importedState);
	runtime.model?.updateWorldMatrix?.();
}


__exports.updateMinimalMeadowAnimation = updateMinimalMeadowAnimation;
function destroyInstalledAnimation(runtime) {
	runtime.playerAnimation?.controller?.destroy?.();
	runtime.playerAnimation?.actions?.destroy?.();
}

function exposePlayerActionApi(runtime, actions) {
	runtime.playerActionRegistry = actions.registry;
	runtime.playerActions = actions.runtime;
	runtime.registerPlayerAction = definition => actions.register(definition);
	runtime.dispatchPlayerAction = message => actions.dispatch(message);
}

function playCurrentClip(runtime, stateName) {
	const animation = runtime.playerAnimation;
	const itemId = runtime.equipment?.weaponItemId || '';
	const weaponKind = /blade|sword/i.test(itemId) ? 'sword' : 'staff';
	const clip = minimalMeadowClipForState(animation.player.names, stateName, { weaponKind });
	if (clip && animation.player.current?.name !== clip) {
		animation.player.play(clip);
	}
}

function recordAnimationState(runtime, animation, semanticState, importedState) {
	runtime.state.animationState = semanticState;
	runtime.state.animationBaseState = importedState;
	runtime.state.animationLocked = animation.controller.locked;
	runtime.state.castAnimationProgress = animation.controller.progress;
	runtime.state.customAction = animation.actions.snapshot();
	runtime.state.clip = animation.player.current?.name || '';
	runtime.state.rootUpDot = minimalMeadowRootUpDot(runtime);
}

function diagnostics(runtime, animation) {
	return {
		clip: animation.player.diagnostics(),
		controller: animation.controller.snapshot(),
		customAction: animation.actions.snapshot(),
		model: animation.model?.name || '',
		pose: animation.pose.diagnostics(),
		registeredActions: animation.actions.registry.list(),
		rootUpDot: minimalMeadowRootUpDot(runtime)
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryRarity.js */
__awtsmoosModule_54 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryRarity.js
 * @description Derives one stable rarity rank from canonical item purpose, value, and statistics.
 * The Awtsmoos distinguishes finite vessels without confusing price with essence; Awtsmoos.com
 * gives loot, Bag, comparison, and reward panels one shared label, rank, accent, and value covenant.
 */

const RARITIES = Object.freeze({
	common: Object.freeze({ accent: '#b8c5c2', label: 'Common', rank: 0 }),
	uncommon: Object.freeze({ accent: '#77dc91', label: 'Uncommon', rank: 1 }),
	rare: Object.freeze({ accent: '#6eb5ff', label: 'Rare', rank: 2 }),
	epic: Object.freeze({ accent: '#c98cff', label: 'Epic', rank: 3 }),
	quest: Object.freeze({ accent: '#ffd36b', label: 'Shlichus', rank: 4 })
});

function inventoryRarity(options = {}) {
	const explicit = String(options.rarity || '').toLowerCase();
	if (RARITIES[explicit]) return explicit;
	if (options.required || options.category === 'quest') return 'quest';
	if (options.category === 'currency' || options.category === 'material') return materialRarity(options);
	const score = equipmentScore(options);
	if (score >= 42 || Number(options.price) >= 100) return 'epic';
	if (score >= 24 || Number(options.price) >= 55) return 'rare';
	if (score >= 10 || Number(options.price) >= 20) return 'uncommon';
	return 'common';
}


__exports.inventoryRarity = inventoryRarity;
function inventoryRarityDetails(value) {
	return RARITIES[value] || RARITIES.common;
}


__exports.inventoryRarityDetails = inventoryRarityDetails;
function inventoryRarityCatalog() {
	return RARITIES;
}


__exports.inventoryRarityCatalog = inventoryRarityCatalog;
function equipmentScore(options) {
	const stats = options.stats || {};
	const spiritual = options.spiritual || {};
	return Math.max(0, Number(stats.damage) || 0)
		+ Math.max(0, Number(stats.defense) || 0) * 1.4
		+ Math.max(0, Number(stats.focus) || 0) * 1.1
		+ Object.values(spiritual).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function materialRarity(options) {
	const price = Number(options.price) || 0;
	if (price >= 12) return 'rare';
	if (price >= 6) return 'uncommon';
	return 'common';
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/SpiritualStats.js */
__awtsmoosModule_55 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpiritualStats.js
 * @description Defines the ten inspectable soul attributes carried by real equipment.
 * The Awtsmoos is beyond every measured sefirah; Awtsmoos.com lets each finite garment
 * contribute Chochmah through Malchus without replacing legacy combat statistics.
 */

const SPIRITUAL_STAT_KEYS = Object.freeze([
	'chochmah',
	'binah',
	'daas',
	'chesed',
	'gevurah',
	'tiferes',
	'netzach',
	'hod',
	'yesod',
	'malchus'
]);
__exports.SPIRITUAL_STAT_KEYS = SPIRITUAL_STAT_KEYS;


function spiritualStats(values = {}) {
	return Object.freeze(Object.fromEntries(
		SPIRITUAL_STAT_KEYS.map(key => [key, finiteStat(values[key])])
	));
}


__exports.spiritualStats = spiritualStats;
function addSpiritualStats(target, values = {}) {
	for (const key of SPIRITUAL_STAT_KEYS) {
		target[key] = finiteStat(target[key]) + finiteStat(values[key]);
	}
	return target;
}


__exports.addSpiritualStats = addSpiritualStats;
function emptySpiritualStats() {
	return Object.fromEntries(SPIRITUAL_STAT_KEYS.map(key => [key, 0]));
}


__exports.emptySpiritualStats = emptySpiritualStats;
function spiritualStatLabel(key) {
	return key.charAt(0).toUpperCase() + key.slice(1);
}


__exports.spiritualStatLabel = spiritualStatLabel;
function finiteStat(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryItemDefinition.js */
__awtsmoosModule_53 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryItemDefinition.js
 * @description Creates immutable inventory definitions with rarity, effects, and spiritual attributes.
 * The Awtsmoos renews name, icon, value, rarity, model, action, and consequence together;
 * Awtsmoos.com prevents one panel from inventing an effect another runtime cannot enforce.
 */

var inventoryRarity = __awtsmoosModule_54.inventoryRarity;
var spiritualStats = __awtsmoosModule_55.spiritualStats;

function inventoryItem(options) {
	const spiritual = spiritualStats(options.spiritual);
	const stats = Object.freeze({
		damage: Number(options.stats?.damage) || 0,
		defense: Number(options.stats?.defense) || 0,
		focus: Number(options.stats?.focus) || 0
	});
	return Object.freeze({
		actions: Object.freeze([...(options.actions || ['inspect'])]),
		appearance: freezeAppearance(options.appearance),
		category: options.category,
		description: options.description || `${options.name} is a real ${options.category} vessel.`,
		effect: freezeEffect(options.effect),
		garment: options.garment ? Object.freeze({ ...options.garment }) : null,
		icon: options.icon,
		id: options.id,
		modelId: options.modelId || null,
		name: options.name,
		price: Number.isFinite(options.price) ? options.price : null,
		rarity: inventoryRarity({ ...options, spiritual, stats }),
		required: options.required === true,
		slot: options.slot || null,
		spiritual,
		stackLimit: Math.max(1, Number(options.stackLimit) || 1),
		stats
	});
}


__exports.inventoryItem = inventoryItem;
function freezeAppearance(value) {
	if (!value) return null;
	return Object.freeze({
		colors: Object.freeze([...(value.colors || [])]),
		defaultColor: value.defaultColor || value.colors?.[0] || 'black',
		defaultFabric: value.defaultFabric || value.fabrics?.[0] || 'plain',
		fabrics: Object.freeze([...(value.fabrics || [])])
	});
}

function freezeEffect(value) {
	return value ? Object.freeze({ ...value }) : null;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/GarmentCatalog.js */
__awtsmoosModule_52 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentCatalog.js
 * @description Maps canonical Chossid GLB garments and body materials to real inventory items.
 * The Awtsmoos clothes boxes, straps, hat, glasses, jacket, shirt, trousers, and shoes as one;
 * Awtsmoos.com groups exporter fragments into meaningful wearable vessels with lawful stats.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const COMMON = Object.freeze(['black', 'blue', 'brown', 'burgundy', 'gray', 'green']);
const CLOTH = Object.freeze(['plain', 'wool', 'linen', 'velvet', 'satin']);

const GARMENT_CATALOG = Object.freeze(Object.fromEntries([
	garment('scholar-glasses', 'Scholar Glasses', '👓', 'eyes', 'glasses', 48, [0, 1, 3], { chochmah: 3, binah: 2, daas: 2 }, ['black', 'blue', 'gold'], ['plain']),
	garment('shabbos-top-hat', 'Shabbos Top Hat', '🎩', 'hat', 'top-hat', 92, [0, 2, 2], { hod: 3, malchus: 4, tiferes: 2 }, COMMON, ['plain', 'wool', 'velvet']),
	garment('wool-kippah', 'Wool Yarmulke', '⚫', 'kippah', 'yarmulka', 25, [0, 1, 2], { daas: 2, hod: 2, yesod: 2 }, COMMON, ['wool', 'velvet']),
	garment('tefillin-shel-rosh', 'Tefillin Shel Rosh', '⬛', 'tefillinHead', 'tefillin-head', null, [0, 2, 5], { chochmah: 4, binah: 4, daas: 5 }, ['black'], ['leather']),
	garment('tefillin-shel-yad', 'Tefillin Shel Yad', '▪️', 'tefillinArm', 'tefillin-arm', null, [0, 3, 4], { gevurah: 4, chesed: 3, tiferes: 3 }, ['black'], ['leather']),
	garment('black-coat', 'Long Black Shabbos Jacket', '🧥', 'coat', 'jacket', 80, [0, 6, 2], { gevurah: 2, hod: 3, malchus: 4 }, COMMON, CLOTH),
	garment('white-outer-shirt', 'White Outer Shirt', '👔', 'outerShirt', 'outer-shirt', 36, [0, 2, 3], { chesed: 3, tiferes: 2, yesod: 2 }, ['white', 'cream', 'blue'], ['linen', 'plain', 'satin']),
	garment('base-shirt', 'Everyday Inner Shirt', '👕', 'shirt', 'body-shirt', null, [0, 1, 1], { chesed: 1, tiferes: 1 }, ['white', 'cream', 'blue', 'gray'], ['linen', 'plain'], true),
	garment('black-trousers', 'Tailored Black Trousers', '👖', 'pants', 'body-pants', null, [0, 2, 0], { netzach: 2, yesod: 2 }, ['black', 'gray', 'brown', 'blue'], ['plain', 'wool'], true),
	garment('walking-boots', 'Walking Shoes', '👞', 'feet', 'body-shoes', 42, [0, 2, 1], { netzach: 3, hod: 1 }, ['black', 'brown'], ['leather'], true),
	garment('blue-scholar-glasses', 'Blue Scholar Glasses', '🕶️', 'eyes', 'glasses', 75, [0, 1, 5], { chochmah: 4, binah: 3, daas: 3 }, ['blue', 'black'], ['plain']),
	garment('velvet-top-hat', 'Velvet Festival Hat', '🎩', 'hat', 'top-hat', 130, [0, 3, 3], { hod: 4, malchus: 5, tiferes: 3 }, ['black', 'burgundy', 'blue'], ['velvet']),
	garment('brown-kapote', 'Brown Market Kapote', '🧥', 'coat', 'jacket', 118, [0, 8, 1], { gevurah: 4, malchus: 3, netzach: 2 }, ['brown', 'black', 'green'], ['wool', 'linen']),
	garment('linen-outer-shirt', 'Fine Linen Outer Shirt', '👔', 'outerShirt', 'outer-shirt', 68, [0, 2, 6], { chesed: 4, tiferes: 4, yesod: 2 }, ['white', 'cream', 'blue'], ['linen', 'satin'])
]));
__exports.GARMENT_CATALOG = GARMENT_CATALOG;


const GLB_GARMENT_COVERAGE = Object.freeze({
	extras: Object.freeze(['glasses', 'head-teffilin-straps', 'teffilin-head-box', 'top-hat', 'yarmulka', 'teffiln-arm-box', 'jacket', 'jacket-teffilin', 'outer-shirt', 'teffilin-arm-straps']),
	bodyMaterials: Object.freeze(['shirt', 'pants', 'shoes'])
});
__exports.GLB_GARMENT_COVERAGE = GLB_GARMENT_COVERAGE;


const REQUIRED_GARMENT_EQUIPMENT = Object.freeze({ feet: 'walking-boots', pants: 'black-trousers', shirt: 'base-shirt' });
__exports.REQUIRED_GARMENT_EQUIPMENT = REQUIRED_GARMENT_EQUIPMENT;

const GARMENT_ITEM_IDS = Object.freeze(Object.keys(GARMENT_CATALOG));
__exports.GARMENT_ITEM_IDS = GARMENT_ITEM_IDS;


function garment(id, name, icon, slot, visualId, price, legacy, spiritual, colors, fabrics, required = false) {
	return [id, inventoryItem({ actions: ['equip', 'inspect', 'next-color', 'next-fabric'], appearance: { colors, defaultColor: colors[0], defaultFabric: fabrics[0], fabrics }, category: 'clothing', garment: { visualId }, icon, id, name, price, required, slot, spiritual, stats: { damage: legacy[0], defense: legacy[1], focus: legacy[2] } })];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/HealingAmuletCatalog.js */
__awtsmoosModule_56 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCatalog.js
 * @description Defines three respectful fictional healing amulets inspired by historical Jewish forms.
 * The Awtsmoos is beyond every written vessel; Awtsmoos.com remembers expert certification,
 * roots, parchment, and witnessed practice without presenting a game effect as real-world medicine.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const HEALING_AMULET_IDS = Object.freeze([
	'written-healing-kamea',
	'root-herb-kamea',
	'kamea-mumcheh'
]);
__exports.HEALING_AMULET_IDS = HEALING_AMULET_IDS;


const HEALING_AMULET_CATALOG = Object.freeze(Object.fromEntries([
	amulet({
		healing: 22,
		icon: '📜',
		id: 'written-healing-kamea',
		name: 'Kamea Shel Ketav',
		price: 24,
		stackLimit: 6,
		tradition: 'written'
	}),
	amulet({
		healing: 38,
		icon: '🌿',
		id: 'root-herb-kamea',
		name: 'Kamea Shel Ikkarin',
		price: 42,
		stackLimit: 4,
		tradition: 'roots-and-herbs'
	}),
	amulet({
		certifiedUses: 3,
		healing: 62,
		icon: '🧿',
		id: 'kamea-mumcheh',
		name: 'Kamea Mumcheh',
		price: 75,
		stackLimit: 3,
		tradition: 'expert-certified'
	})
]));
__exports.HEALING_AMULET_CATALOG = HEALING_AMULET_CATALOG;


function healingAmuletDefinition(itemId) {
	return HEALING_AMULET_CATALOG[itemId] || null;
}


__exports.healingAmuletDefinition = healingAmuletDefinition;
function amulet(options) {
	const certification = options.certifiedUses
		? ` Its game-world expert certification records ${options.certifiedUses} witnessed successes.`
		: '';
	return [options.id, inventoryItem({
		actions: ['use', 'inspect'],
		category: 'amulet',
		description: `A fictional Mitzvah World healing amulet based on the ${options.tradition} historical form.${certification} It is not medical advice or a real treatment.`,
		effect: {
			certifiedUses: options.certifiedUses || 0,
			healing: options.healing,
			tradition: options.tradition,
			type: 'heal'
		},
		icon: options.icon,
		id: options.id,
		name: options.name,
		price: options.price,
		stackLimit: options.stackLimit,
		stats: {},
		spiritual: { chesed: Math.ceil(options.healing / 10) }
	})];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryConsumableCatalog.js */
__awtsmoosModule_57 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryConsumableCatalog.js
 * @description Defines bounded healing and cleansing stacks for inventory, loot, and quick use.
 * The Awtsmoos gives recovery no magical independence; Awtsmoos.com keeps name, icon,
 * quantity, action, description, value, and finite stack law aligned with the gameplay runtime.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const INVENTORY_CONSUMABLE_CATALOG = Object.freeze({
	'healing-broth': inventoryItem({
		actions: ['use', 'inspect'],
		category: 'consumable',
		description: 'A warm broth that restores a bounded measure of health after a short use.',
		icon: '🥣',
		id: 'healing-broth',
		name: 'Healing Broth',
		price: 18,
		stackLimit: 10
	}),
	'purifying-water': inventoryItem({
		actions: ['use', 'inspect'],
		category: 'consumable',
		description: 'Clear water that cleanses harmful statuses and steadies posture.',
		icon: '💧',
		id: 'purifying-water',
		name: 'Purifying Water',
		price: 24,
		stackLimit: 10
	})
});
__exports.INVENTORY_CONSUMABLE_CATALOG = INVENTORY_CONSUMABLE_CATALOG;


const STARTER_CONSUMABLES = Object.freeze([
	Object.freeze({ itemId: 'healing-broth', quantity: 2 }),
	Object.freeze({ itemId: 'purifying-water', quantity: 1 })
]);
__exports.STARTER_CONSUMABLES = STARTER_CONSUMABLES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryCoreCatalog.js */
__awtsmoosModule_58 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCoreCatalog.js
 * @description Defines equipment, books, quests, accessories, and currency carried by the player.
 * The Awtsmoos renews every named vessel beneath one inspectable law; Awtsmoos.com
 * keeps slot, value, model, action, stack, and derived combat meaning visibly aligned.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const INVENTORY_CORE_CATALOG = Object.freeze(Object.fromEntries([
	entry('forest-axe', 'Forest Axe', '🪓', 'tool', 'tool', [5, 0, 2], 45, 'axe-small'),
	entry('wooden-staff', 'Wooden Staff', '🪄', 'weapon', 'hand', [18, 2, 4], 32, 'wooden-staff'),
	entry('spark-blade', 'Spark Blade', '⚔️', 'weapon', 'hand', [26, 4, 1], 110, 'sword'),
	entry('village-shield', 'Village Shield', '🛡️', 'shield', 'offhand', [0, 10, 0], 75, 'shield'),
	entry('chalaf', 'Chalaf', '🔪', 'tool', 'tool', [8, 0, 1], 40, null),
	entry('siddur', 'Siddur', '📖', 'book', 'book', [0, 4, 5], 10, 'book', bookActions()),
	entry('chumash-light', 'Chumash of Light', '📚', 'book', 'book', [0, 7, 8], 55, 'book', bookActions()),
	entry('tanya-pocket', 'Pocket Tanya', '📕', 'book', 'book', [0, 8, 6], 65, 'book', bookActions()),
	entry('quest-scroll', 'Shlichus Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll', bookActions()),
	entry('lost-scroll', 'Lost Stream Scroll', '📜', 'quest', null, [0, 0, 0], null, 'scroll'),
	entry('community-badge', 'Community Badge', '🏅', 'accessory', 'accessory', [0, 4, 3], 25, null),
	entry('chest-key', 'Old Chest Key', '🗝️', 'quest', null, [0, 0, 0], null, null),
	entry('perutas', 'Perutas', '🪙', 'currency', null, [0, 0, 0], null, null, ['inspect'], 9999)
]));
__exports.INVENTORY_CORE_CATALOG = INVENTORY_CORE_CATALOG;


function entry(
	id,
	name,
	icon,
	category,
	slot,
	legacy,
	price,
	modelId,
	actions = ['equip', 'inspect'],
	stackLimit = 1
) {
	return [id, inventoryItem({
		actions,
		category,
		icon,
		id,
		modelId,
		name,
		price,
		slot,
		stackLimit,
		stats: {
			damage: legacy[0],
			defense: legacy[1],
			focus: legacy[2]
		}
	})];
}

function bookActions() {
	return ['open', 'pin', 'inspect'];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryMaterialCatalog.js */
__awtsmoosModule_59 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryMaterialCatalog.js
 * @description Defines stackable materials and remnants without crowding equipment law.
 * The Awtsmoos renews wood, flower, thread, hide, and shadow as bounded carried signs;
 * Awtsmoos.com keeps stack limits, prices, actions, and zero combat stats honest and aligned.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const INVENTORY_MATERIAL_CATALOG = Object.freeze(Object.fromEntries([
	material('wood-log', 'Fallen Wood', '🪵', 4, 20),
	material('cottage-flower', 'Cottage Flower', '🌸', 3, 24),
	material('wool-thread', 'Wool Thread', '🧶', 8, 20),
	material('prepared-hide', 'Prepared Hide', '🟫', 6, 20),
	material('shadow-remnant', 'Shadow Remnant', '🜏', null, 99, ['inspect'])
]));
__exports.INVENTORY_MATERIAL_CATALOG = INVENTORY_MATERIAL_CATALOG;


function material(
	id,
	name,
	icon,
	price,
	stackLimit,
	actions = ['inspect', 'drop']
) {
	return [id, inventoryItem({
		actions,
		category: 'material',
		icon,
		id,
		modelId: null,
		name,
		price,
		slot: null,
		stackLimit,
		stats: {
			damage: 0,
			defense: 0,
			focus: 0
		}
	})];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryRewardCatalog.js */
__awtsmoosModule_60 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryRewardCatalog.js
 * @description Defines play-style rewards whose tradeoffs alter decisions instead of flat damage.
 * The Awtsmoos joins mercy and restraint in one equipped vessel; Awtsmoos.com
 * widens deliberate release while slowing preparation movement through visible lawful cost.
 */

var inventoryItem = __awtsmoosModule_53.inventoryItem;

const MEASURED_INTENT_REWARD_ID = 'vessel-of-measured-intent';
__exports.MEASURED_INTENT_REWARD_ID = MEASURED_INTENT_REWARD_ID;


const INVENTORY_REWARD_CATALOG = Object.freeze({
	[MEASURED_INTENT_REWARD_ID]: inventoryItem({
		actions: ['equip', 'inspect'],
		category: 'focus',
		description: 'Widens Kavanah release timing by twenty-two percent while reducing movement during preparation by twenty-eight percent.',
		icon: '◉',
		id: MEASURED_INTENT_REWARD_ID,
		modelId: null,
		name: 'Vessel of Measured Intent',
		price: null,
		slot: 'accessory',
		stackLimit: 1,
		stats: {
			damage: 0,
			defense: 0,
			focus: 0
		}
	})
});
__exports.INVENTORY_REWARD_CATALOG = INVENTORY_REWARD_CATALOG;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryCatalog.js */
__awtsmoosModule_51 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryCatalog.js
 * @description Composes core, material, reward, garment, amulet, and consumable definitions.
 * The Awtsmoos unites many carried vessels without erasing their responsibilities;
 * Awtsmoos.com keeps starter ownership, recovery quantities, and every later lookup stable and inspectable.
 */

var GARMENT_CATALOG = __awtsmoosModule_52.GARMENT_CATALOG;
var GARMENT_ITEM_IDS = __awtsmoosModule_52.GARMENT_ITEM_IDS;
var HEALING_AMULET_CATALOG = __awtsmoosModule_56.HEALING_AMULET_CATALOG;
var INVENTORY_CONSUMABLE_CATALOG = __awtsmoosModule_57.INVENTORY_CONSUMABLE_CATALOG;
var STARTER_CONSUMABLES = __awtsmoosModule_57.STARTER_CONSUMABLES;
var INVENTORY_CORE_CATALOG = __awtsmoosModule_58.INVENTORY_CORE_CATALOG;
var INVENTORY_MATERIAL_CATALOG = __awtsmoosModule_59.INVENTORY_MATERIAL_CATALOG;
var INVENTORY_REWARD_CATALOG = __awtsmoosModule_60.INVENTORY_REWARD_CATALOG;

const INVENTORY_CATALOG = Object.freeze({
	...INVENTORY_CORE_CATALOG,
	...INVENTORY_MATERIAL_CATALOG,
	...INVENTORY_REWARD_CATALOG,
	...HEALING_AMULET_CATALOG,
	...INVENTORY_CONSUMABLE_CATALOG,
	...GARMENT_CATALOG
});
__exports.INVENTORY_CATALOG = INVENTORY_CATALOG;


const STARTER_INVENTORY = Object.freeze([
	stack('perutas', 120),
	...starterToolsAndBooks().map(itemId => stack(itemId, 1)),
	...STARTER_CONSUMABLES.map(entry => stack(entry.itemId, entry.quantity)),
	...starterGarments().map(itemId => stack(itemId, 1))
]);
__exports.STARTER_INVENTORY = STARTER_INVENTORY;


function inventoryDefinition(itemId) {
	return INVENTORY_CATALOG[itemId] || null;
}


__exports.inventoryDefinition = inventoryDefinition;
function starterToolsAndBooks() {
	return [
		'siddur',
		'wooden-staff',
		'spark-blade',
		'chalaf',
		'quest-scroll'
	];
}

function starterGarments() {
	const excluded = new Set([
		'blue-scholar-glasses',
		'velvet-top-hat',
		'brown-kapote',
		'linen-outer-shirt'
	]);
	return GARMENT_ITEM_IDS.filter(itemId => !excluded.has(itemId));
}

function stack(itemId, quantity) {
	return Object.freeze({ itemId, quantity });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryAppearanceRules.js */
__awtsmoosModule_50 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryAppearanceRules.js
 * @description Validates, restores, and cycles per-item garment color and fabric choices.
 * The Awtsmoos contains every appearance while remaining one; Awtsmoos.com keeps each
 * selection bounded by the garment definition and durable across save restoration.
 */

var inventoryDefinition = __awtsmoosModule_51.inventoryDefinition;

function inventoryAppearanceFor(appearance, itemId) {
	const definition = inventoryDefinition(itemId);
	const options = definition?.appearance;
	if (!options) return null;
	const saved = appearance?.[itemId] || {};
	return {
		colorId: options.colors.includes(saved.colorId) ? saved.colorId : options.defaultColor,
		fabricId: options.fabrics.includes(saved.fabricId) ? saved.fabricId : options.defaultFabric
	};
}


__exports.inventoryAppearanceFor = inventoryAppearanceFor;
function setInventoryAppearance(appearance, itemId, patch) {
	const current = inventoryAppearanceFor(appearance, itemId);
	const definition = inventoryDefinition(itemId);
	if (!current || !definition?.appearance) throw new Error('ITEM_NOT_CUSTOMIZABLE');
	const next = { ...current, ...patch };
	if (!definition.appearance.colors.includes(next.colorId)) throw new Error('INVALID_GARMENT_COLOR');
	if (!definition.appearance.fabrics.includes(next.fabricId)) throw new Error('INVALID_GARMENT_FABRIC');
	return { ...appearance, [itemId]: next };
}


__exports.setInventoryAppearance = setInventoryAppearance;
function cycleInventoryAppearance(appearance, itemId, dimension) {
	const current = inventoryAppearanceFor(appearance, itemId);
	const options = inventoryDefinition(itemId)?.appearance;
	if (!current || !options) throw new Error('ITEM_NOT_CUSTOMIZABLE');
	const key = dimension === 'fabric' ? 'fabricId' : 'colorId';
	const values = dimension === 'fabric' ? options.fabrics : options.colors;
	const nextValue = values[(values.indexOf(current[key]) + 1) % values.length];
	return setInventoryAppearance(appearance, itemId, { [key]: nextValue });
}


__exports.cycleInventoryAppearance = cycleInventoryAppearance;
function restoreInventoryAppearance(value) {
	const result = {};
	for (const itemId of Object.keys(value || {})) {
		const normalized = inventoryAppearanceFor(value, itemId);
		if (normalized) result[itemId] = normalized;
	}
	return result;
}

__exports.restoreInventoryAppearance = restoreInventoryAppearance;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStoreRules.js */
__awtsmoosModule_61 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreRules.js
 * @description Provides pure stack, equipment-stat, appearance, and snapshot rules.
 * The Awtsmoos renews every quantity and attribute without illusion; Awtsmoos.com
 * derives combat and ten spiritual measures from the garments actually equipped.
 */

var INVENTORY_CATALOG = __awtsmoosModule_51.INVENTORY_CATALOG;
var inventoryAppearanceFor = __awtsmoosModule_50.inventoryAppearanceFor;
var addSpiritualStats = __awtsmoosModule_55.addSpiritualStats;
var emptySpiritualStats = __awtsmoosModule_55.emptySpiritualStats;

function normalizeInventoryQuantity(quantity) {
	const numeric = Number(quantity);
	if (!Number.isFinite(numeric) || numeric <= 0 || !Number.isInteger(numeric)) {
		throw new Error('INVALID_ITEM_QUANTITY');
	}
	return numeric;
}


__exports.normalizeInventoryQuantity = normalizeInventoryQuantity;
function inventoryItemQuantity(items, itemId) {
	return items.reduce((total, stack) =>
		stack.itemId === itemId ? total + stack.quantity : total, 0);
}


__exports.inventoryItemQuantity = inventoryItemQuantity;
function addInventoryItem(items, itemId, quantity, definition) {
	let remaining = normalizeInventoryQuantity(quantity);
	const limit = Math.max(1, Math.trunc(Number(definition.stackLimit) || 1));
	for (const stack of items) {
		if (stack.itemId !== itemId || stack.quantity >= limit) continue;
		const added = Math.min(limit - stack.quantity, remaining);
		stack.quantity += added;
		remaining -= added;
	}
	while (remaining > 0) {
		const added = Math.min(limit, remaining);
		items.push({ itemId, quantity: added });
		remaining -= added;
	}
	return items;
}


__exports.addInventoryItem = addInventoryItem;
function removeInventoryItem(items, itemId, quantity) {
	let remaining = normalizeInventoryQuantity(quantity);
	if (inventoryItemQuantity(items, itemId) < remaining) throw new Error('INSUFFICIENT_ITEM_QUANTITY');
	const result = [];
	for (const stack of items) {
		if (stack.itemId !== itemId || remaining === 0) {
			result.push({ ...stack });
			continue;
		}
		const removed = Math.min(stack.quantity, remaining);
		remaining -= removed;
		if (stack.quantity > removed) result.push({ ...stack, quantity: stack.quantity - removed });
	}
	return result;
}


__exports.removeInventoryItem = removeInventoryItem;
function derivedInventoryStats(equipment) {
	const total = { damage: 0, defense: 0, focus: 20, spiritual: emptySpiritualStats() };
	for (const itemId of Object.values(equipment)) {
		const definition = INVENTORY_CATALOG[itemId];
		if (!definition) continue;
		total.damage += definition.stats.damage;
		total.defense += definition.stats.defense;
		total.focus += definition.stats.focus;
		addSpiritualStats(total.spiritual, definition.spiritual);
	}
	return total;
}


__exports.derivedInventoryStats = derivedInventoryStats;
function inventorySnapshot(store) {
	return structuredClone({
		appearance: Object.fromEntries(Object.keys(store.appearance || {}).map(itemId => [itemId, inventoryAppearanceFor(store.appearance, itemId)]).filter(([, value]) => value)),
		equipment: store.equipment,
		items: store.items.map(stack => ({ ...stack, definition: INVENTORY_CATALOG[stack.itemId] })),
		lastUsedAt: store.lastUsedAt,
		learned: store.learned,
		pinnedBooks: store.pinnedBooks,
		pinnedPassages: store.pinnedPassages,
		stats: derivedInventoryStats(store.equipment)
	});
}


__exports.inventorySnapshot = inventorySnapshot;
function togglePinnedValue(values, id, maximum, label) {
	if (values.includes(id)) return values.filter(value => value !== id);
	if (values.length >= maximum) throw new Error(`Only ${maximum} ${label} may be pinned.`);
	return [...values, id];
}

__exports.togglePinnedValue = togglePinnedValue;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStoreTransactions.js */
__awtsmoosModule_62 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreTransactions.js
 * @description Builds atomic drafts and complete model-backed starting equipment.
 * The Awtsmoos joins ownership, tefillin, clothing, weapon, cost, and slot without partial truth;
 * Awtsmoos.com starts every visible canonical garment equipped because the Bag already owns it.
 */

var REQUIRED_GARMENT_EQUIPMENT = __awtsmoosModule_52.REQUIRED_GARMENT_EQUIPMENT;
var STARTER_INVENTORY = __awtsmoosModule_51.STARTER_INVENTORY;
var inventoryDefinition = __awtsmoosModule_51.inventoryDefinition;
var addInventoryItem = __awtsmoosModule_61.addInventoryItem;
var inventoryItemQuantity = __awtsmoosModule_61.inventoryItemQuantity;
var normalizeInventoryQuantity = __awtsmoosModule_61.normalizeInventoryQuantity;
var removeInventoryItem = __awtsmoosModule_61.removeInventoryItem;

const DEFAULT_EQUIPMENT = Object.freeze({
	...REQUIRED_GARMENT_EQUIPMENT,
	coat: 'black-coat',
	eyes: 'scholar-glasses',
	hand: 'wooden-staff',
	hat: 'shabbos-top-hat',
	kippah: 'wool-kippah',
	outerShirt: 'white-outer-shirt',
	tefillinArm: 'tefillin-shel-yad',
	tefillinHead: 'tefillin-shel-rosh',
	tool: 'chalaf'
});
__exports.DEFAULT_EQUIPMENT = DEFAULT_EQUIPMENT;


function initialInventoryState(options = {}) {
	return {
		appearance: options.appearance ?? {},
		equipment: {
			...DEFAULT_EQUIPMENT,
			...(options.equipment || {})
		},
		items: options.items ?? STARTER_INVENTORY,
		lastUsedAt: options.lastUsedAt ?? {},
		learned: options.learned ?? ['modeh-ani'],
		pinnedBooks: options.pinnedBooks ?? ['siddur'],
		pinnedPassages: options.pinnedPassages ?? ['modeh-ani']
	};
}


__exports.initialInventoryState = initialInventoryState;
function requireInventoryItem(itemId) {
	const definition = inventoryDefinition(itemId);
	if (!definition) {
		throw new Error(`Unknown inventory item: ${itemId}`);
	}
	return definition;
}


__exports.requireInventoryItem = requireInventoryItem;
function inventoryAdditionDraft(items, entries) {
	if (!Array.isArray(entries)) {
		throw new Error('INVALID_INVENTORY_BATCH');
	}
	const draft = structuredClone(items);
	for (const entry of entries) {
		const definition = requireInventoryItem(entry?.itemId);
		addInventoryItem(draft, definition.id, entry.quantity, definition);
	}
	return draft;
}


__exports.inventoryAdditionDraft = inventoryAdditionDraft;
function inventoryPurchaseDraft(items, itemId, quantity) {
	const definition = requireInventoryItem(itemId);
	const count = normalizeInventoryQuantity(quantity);
	if (!Number.isFinite(definition.price)) {
		throw new Error('ITEM_NOT_FOR_SALE');
	}
	const cost = definition.price * count;
	const draft = removeInventoryItem(items, 'perutas', cost);
	addInventoryItem(draft, itemId, count, definition);
	return draft;
}


__exports.inventoryPurchaseDraft = inventoryPurchaseDraft;
function reconciledInventoryEquipment(equipment, items) {
	const result = {};
	const supplied = {
		...REQUIRED_GARMENT_EQUIPMENT,
		...(equipment || {})
	};
	for (const [slot, itemId] of Object.entries(supplied)) {
		const definition = inventoryDefinition(itemId);
		const owned = inventoryItemQuantity(items, itemId) > 0;
		if (definition?.slot === slot && owned) {
			result[slot] = itemId;
		}
	}
	return result;
}

__exports.reconciledInventoryEquipment = reconciledInventoryEquipment;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStoreMutation.js */
__awtsmoosModule_49 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreMutation.js
 * @description Applies atomic stack, equipment, purchase, and appearance mutations.
 * The Awtsmoos gives each carried vessel a lawful transition; Awtsmoos.com
 * reconciles ownership, required garments, slots, prices, colors, and fabrics before publication.
 */

var cycleInventoryAppearance = __awtsmoosModule_50.cycleInventoryAppearance;
var setInventoryAppearance = __awtsmoosModule_50.setInventoryAppearance;
var removeInventoryItem = __awtsmoosModule_61.removeInventoryItem;
var inventoryAdditionDraft = __awtsmoosModule_62.inventoryAdditionDraft;
var inventoryPurchaseDraft = __awtsmoosModule_62.inventoryPurchaseDraft;
var reconciledInventoryEquipment = __awtsmoosModule_62.reconciledInventoryEquipment;
var requireInventoryItem = __awtsmoosModule_62.requireInventoryItem;

function addInventoryEntries(store, entries) {
	store.items = inventoryAdditionDraft(store.items, entries);
	reconcile(store);
	return store.publish();
}


__exports.addInventoryEntries = addInventoryEntries;
function removeInventoryEntry(store, itemId, quantity) {
	const definition = requireInventoryItem(itemId);
	if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_DROP');
	store.items = removeInventoryItem(store.items, itemId, quantity);
	reconcile(store);
	return store.publish();
}


__exports.removeInventoryEntry = removeInventoryEntry;
function buyInventoryEntry(store, itemId, quantity) {
	store.items = inventoryPurchaseDraft(store.items, itemId, quantity);
	reconcile(store);
	return store.publish();
}


__exports.buyInventoryEntry = buyInventoryEntry;
function equipInventoryItem(store, itemId) {
	const definition = requireInventoryItem(itemId);
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	if (!definition.slot) throw new Error('ITEM_NOT_EQUIPPABLE');
	store.equipment[definition.slot] = itemId;
	return store.publish();
}


__exports.equipInventoryItem = equipInventoryItem;
function unequipInventorySlot(store, slot) {
	const itemId = store.equipment[slot];
	if (!itemId) return store.publish();
	const definition = requireInventoryItem(itemId);
	if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_UNEQUIP');
	delete store.equipment[slot];
	return store.publish();
}


__exports.unequipInventorySlot = unequipInventorySlot;
function setInventoryItemAppearance(store, itemId, patch) {
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	store.appearance = setInventoryAppearance(store.appearance, itemId, patch);
	return store.publish();
}


__exports.setInventoryItemAppearance = setInventoryItemAppearance;
function cycleInventoryItemAppearance(store, itemId, dimension) {
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	store.appearance = cycleInventoryAppearance(
		store.appearance,
		itemId,
		dimension
	);
	return store.publish();
}


__exports.cycleInventoryItemAppearance = cycleInventoryItemAppearance;
function reconcile(store) {
	store.equipment = reconciledInventoryEquipment(
		store.equipment,
		store.items
	);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/TorahPassageCatalog.js */
__awtsmoosModule_65 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahPassageCatalog.js
 * @description Defines short learning passages with bounded symbolic combat statistics.
 * The Awtsmoos renews Torah as wisdom rather than violence; Awtsmoos.com represents
 * attacks as fictional light against hostile husks while quotes remain brief and respectful.
 */

const TORAH_BOOKS = Object.freeze([
	book('siddur', 'Siddur', '📖', [
		passage('modeh-ani', 'Grateful Awakening', 'Gratitude awakens the soul.', 12, 8, 700, 'gratitude'),
		passage('shema-unity', 'Unity of the Shema', 'Everything rests within one Source.', 18, 12, 900, 'unity'),
		passage('peace-prayer', 'Prayer for Peace', 'Peace joins divided sparks.', 10, 16, 650, 'peace')
	]),
	book('chumash-light', 'Chumash of Light', '📚', [
		passage('creation-light', 'Light of Creation', 'Light is called into darkness.', 24, 9, 1100, 'light'),
		passage('guardian-path', 'The Guarded Path', 'Courage walks beside responsibility.', 20, 14, 1000, 'courage'),
		passage('living-water', 'Living Water', 'Wisdom flows toward thirsty ground.', 16, 18, 900, 'water')
	]),
	book('tanya-pocket', 'Pocket Tanya', '📕', [
		passage('two-souls', 'Two Souls', 'Choice can redirect inner struggle.', 22, 15, 1050, 'choice'),
		passage('small-city', 'The Small City', 'Awareness governs the inner city.', 19, 20, 950, 'awareness'),
		passage('joy-breaks-barriers', 'Joy Breaks Barriers', 'Holy joy opens a blocked road.', 28, 10, 1250, 'joy')
	])
]);
__exports.TORAH_BOOKS = TORAH_BOOKS;


function torahBook(bookId) {
	return TORAH_BOOKS.find(item => item.id === bookId) || null;
}


__exports.torahBook = torahBook;
function torahPassage(passageId) {
	for (const bookValue of TORAH_BOOKS) {
		const found = bookValue.passages.find(item => item.id === passageId);
		if (found) return { ...found, bookId: bookValue.id, bookName: bookValue.name };
	}
	return null;
}


__exports.torahPassage = torahPassage;
function book(id, name, icon, passages) {
	return Object.freeze({ icon, id, name, passages: Object.freeze(passages) });
}

function passage(id, name, text, damage, focusCost, cooldownMs, aspect) {
	return Object.freeze({
		aspect,
		cooldownMs,
		damage,
		focusCost,
		id,
		name,
		text
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryLearningRules.js */
__awtsmoosModule_64 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryLearningRules.js
 * @description Applies learning, book pinning, passage pinning, and passage-use times.
 * The Awtsmoos renews knowledge without confusing it with ordinary inventory quantity;
 * Awtsmoos.com keeps every learning transition pure enough for direct testing.
 */

var torahPassage = __awtsmoosModule_65.torahPassage;
var togglePinnedValue = __awtsmoosModule_61.togglePinnedValue;

function learnInventoryPassage(store, passageId) {
	if (!torahPassage(passageId)) throw new Error('UNKNOWN_TORAH_PASSAGE');
	if (!store.learned.includes(passageId)) store.learned.push(passageId);
}


__exports.learnInventoryPassage = learnInventoryPassage;
function toggleInventoryPassage(store, passageId) {
	if (!store.learned.includes(passageId)) throw new Error('PASSAGE_NOT_LEARNED');
	store.pinnedPassages = togglePinnedValue(
		store.pinnedPassages,
		passageId,
		5,
		'passages'
	);
}


__exports.toggleInventoryPassage = toggleInventoryPassage;
function toggleInventoryBook(store, bookId) {
	store.pinnedBooks = togglePinnedValue(
		store.pinnedBooks,
		bookId,
		3,
		'books'
	);
}


__exports.toggleInventoryBook = toggleInventoryBook;
function markInventoryPassageUsed(store, passageId, at) {
	if (!torahPassage(passageId)) throw new Error('UNKNOWN_TORAH_PASSAGE');
	store.lastUsedAt[passageId] = at;
}

__exports.markInventoryPassageUsed = markInventoryPassageUsed;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryPersistenceRules.js */
__awtsmoosModule_66 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPersistenceRules.js
 * @description Restores stacks, required equipment, learning, and garment appearance.
 * The Awtsmoos renews remembered color and fabric without confusing yesterday with today;
 * Awtsmoos.com validates every saved item, slot, palette choice, passage, and timestamp.
 */

var restoreInventoryAppearance = __awtsmoosModule_50.restoreInventoryAppearance;
var inventoryDefinition = __awtsmoosModule_51.inventoryDefinition;
var addInventoryItem = __awtsmoosModule_61.addInventoryItem;
var reconciledInventoryEquipment = __awtsmoosModule_62.reconciledInventoryEquipment;
var torahBook = __awtsmoosModule_65.torahBook;
var torahPassage = __awtsmoosModule_65.torahPassage;

function serializableInventoryState(store) {
	return structuredClone({
		appearance: store.appearance,
		equipment: store.equipment,
		items: store.items,
		lastUsedAt: store.lastUsedAt,
		learned: store.learned,
		pinnedBooks: store.pinnedBooks,
		pinnedPassages: store.pinnedPassages
	});
}


__exports.serializableInventoryState = serializableInventoryState;
function restoreInventoryState(store, saved = {}) {
	store.items = validStacks(saved.items);
	store.equipment = reconciledInventoryEquipment(saved.equipment, store.items);
	store.appearance = restoreInventoryAppearance(saved.appearance);
	store.learned = uniqueStrings(saved.learned).filter(id => torahPassage(id));
	store.pinnedBooks = uniqueStrings(saved.pinnedBooks).filter(id => torahBook(id)).slice(0, 3);
	store.pinnedPassages = uniqueStrings(saved.pinnedPassages).filter(id => store.learned.includes(id)).slice(0, 5);
	store.lastUsedAt = validUsage(saved.lastUsedAt);
}


__exports.restoreInventoryState = restoreInventoryState;
function validStacks(stacks) {
	const result = [];
	for (const stack of Array.isArray(stacks) ? stacks : []) {
		const definition = inventoryDefinition(stack?.itemId);
		const quantity = savedQuantity(stack?.quantity);
		if (definition && quantity > 0) addInventoryItem(result, definition.id, quantity, definition);
	}
	return result;
}

function validUsage(lastUsedAt) {
	return Object.fromEntries(Object.entries(lastUsedAt || {}).filter(([id, value]) =>
		torahPassage(id) && Number.isFinite(Number(value)) && Number(value) >= 0));
}

function savedQuantity(value) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? Math.trunc(numeric) : 0;
}

function uniqueStrings(values) {
	return Array.isArray(values) ? [...new Set(values.filter(value => typeof value === 'string'))] : [];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStoreLearning.js */
__awtsmoosModule_63 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreLearning.js
 * @description Delegates learning, persistence, ownership, snapshots, and equipment reconciliation.
 * The Awtsmoos joins remembered Torah and carried vessels without crowding transaction code;
 * Awtsmoos.com keeps every learned passage, pin, quantity, restore, and equipped slot explicit.
 */

var learnInventoryPassage = __awtsmoosModule_64.learnInventoryPassage;
var markInventoryPassageUsed = __awtsmoosModule_64.markInventoryPassageUsed;
var toggleInventoryBook = __awtsmoosModule_64.toggleInventoryBook;
var toggleInventoryPassage = __awtsmoosModule_64.toggleInventoryPassage;
var restoreInventoryState = __awtsmoosModule_66.restoreInventoryState;
var serializableInventoryState = __awtsmoosModule_66.serializableInventoryState;
var inventoryItemQuantity = __awtsmoosModule_61.inventoryItemQuantity;
var inventorySnapshot = __awtsmoosModule_61.inventorySnapshot;
var reconciledInventoryEquipment = __awtsmoosModule_62.reconciledInventoryEquipment;

function learnInventory(store, passageId) {
	learnInventoryPassage(store, passageId);
}


__exports.learnInventory = learnInventory;
function toggleInventoryPassagePin(store, passageId) {
	toggleInventoryPassage(store, passageId);
}


__exports.toggleInventoryPassagePin = toggleInventoryPassagePin;
function toggleInventoryBookPin(store, bookId) {
	toggleInventoryBook(store, bookId);
}


__exports.toggleInventoryBookPin = toggleInventoryBookPin;
function markInventoryPassage(store, passageId, usedAt) {
	markInventoryPassageUsed(store, passageId, usedAt);
}


__exports.markInventoryPassage = markInventoryPassage;
function inventoryStoreQuantity(store, itemId) {
	return inventoryItemQuantity(store.items, itemId);
}


__exports.inventoryStoreQuantity = inventoryStoreQuantity;
function inventoryStoreOwns(store, itemId) {
	return inventoryStoreQuantity(store, itemId) > 0;
}


__exports.inventoryStoreOwns = inventoryStoreOwns;
function restoreInventoryStore(store, saved) {
	restoreInventoryState(store, saved);
}


__exports.restoreInventoryStore = restoreInventoryStore;
function serializableInventoryStore(store) {
	return serializableInventoryState(store);
}


__exports.serializableInventoryStore = serializableInventoryStore;
function snapshotInventoryStore(store) {
	return inventorySnapshot(store);
}


__exports.snapshotInventoryStore = snapshotInventoryStore;
function reconcileInventoryStoreEquipment(store) {
	store.equipment = reconciledInventoryEquipment(store.equipment, store.items);
}

__exports.reconcileInventoryStoreEquipment = reconcileInventoryStoreEquipment;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStorePublication.js */
__awtsmoosModule_67 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStorePublication.js
 * @description Publishes complete immutable-facing inventory snapshots to bounded listeners.
 * The Awtsmoos renews every observer from one shared truth; Awtsmoos.com prevents
 * equipment, appearance, learning, quantity, and derived stats from drifting apart.
 */

var inventorySnapshot = __awtsmoosModule_61.inventorySnapshot;

function subscribeInventoryStore(store, listener) {
	if (typeof listener !== 'function') {
		throw new TypeError('INVENTORY_LISTENER_REQUIRED');
	}
	store.listeners.add(listener);
	return () => {
		store.listeners.delete(listener);
	};
}


__exports.subscribeInventoryStore = subscribeInventoryStore;
function publishInventoryStore(store) {
	const snapshot = inventorySnapshot(store);
	for (const listener of store.listeners) {
		listener(snapshot);
	}
	return snapshot;
}

__exports.publishInventoryStore = publishInventoryStore;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStore.js */
__awtsmoosModule_48 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
 * @description Coordinates inventory transactions, learning, persistence, and publication.
 * The Awtsmoos is one before stack, garment, passage, appearance, and listener;
 * Awtsmoos.com delegates each responsibility without compressed hidden work.
 */

var addInventoryEntries = __awtsmoosModule_49.addInventoryEntries;
var buyInventoryEntry = __awtsmoosModule_49.buyInventoryEntry;
var cycleInventoryItemAppearance = __awtsmoosModule_49.cycleInventoryItemAppearance;
var equipInventoryItem = __awtsmoosModule_49.equipInventoryItem;
var removeInventoryEntry = __awtsmoosModule_49.removeInventoryEntry;
var setInventoryItemAppearance = __awtsmoosModule_49.setInventoryItemAppearance;
var unequipInventorySlot = __awtsmoosModule_49.unequipInventorySlot;
var inventoryStoreOwns = __awtsmoosModule_63.inventoryStoreOwns;
var inventoryStoreQuantity = __awtsmoosModule_63.inventoryStoreQuantity;
var learnInventory = __awtsmoosModule_63.learnInventory;
var markInventoryPassage = __awtsmoosModule_63.markInventoryPassage;
var reconcileInventoryStoreEquipment = __awtsmoosModule_63.reconcileInventoryStoreEquipment;
var restoreInventoryStore = __awtsmoosModule_63.restoreInventoryStore;
var serializableInventoryStore = __awtsmoosModule_63.serializableInventoryStore;
var snapshotInventoryStore = __awtsmoosModule_63.snapshotInventoryStore;
var toggleInventoryBookPin = __awtsmoosModule_63.toggleInventoryBookPin;
var toggleInventoryPassagePin = __awtsmoosModule_63.toggleInventoryPassagePin;
var publishInventoryStore = __awtsmoosModule_67.publishInventoryStore;
var subscribeInventoryStore = __awtsmoosModule_67.subscribeInventoryStore;
var initialInventoryState = __awtsmoosModule_62.initialInventoryState;

class InventoryStore {
	constructor(options = {}) {
		this.listeners = new Set();
		restoreInventoryStore(this, initialInventoryState(options));
	}

	onChange(listener) {
		return subscribeInventoryStore(this, listener);
	}

	add(itemId, quantity = 1) {
		return this.addMany([{ itemId, quantity }]);
	}

	addMany(entries) {
		return addInventoryEntries(this, entries);
	}

	remove(itemId, quantity = 1) {
		return removeInventoryEntry(this, itemId, quantity);
	}

	buy(itemId, quantity = 1) {
		return buyInventoryEntry(this, itemId, quantity);
	}

	equip(itemId) {
		return equipInventoryItem(this, itemId);
	}

	unequip(slot) {
		return unequipInventorySlot(this, slot);
	}

	setAppearance(itemId, patch) {
		return setInventoryItemAppearance(this, itemId, patch);
	}

	cycleAppearance(itemId, dimension) {
		return cycleInventoryItemAppearance(this, itemId, dimension);
	}

	learn(id) {
		learnInventory(this, id);
		return this.publish();
	}

	togglePassagePin(id) {
		toggleInventoryPassagePin(this, id);
		return this.publish();
	}

	toggleBookPin(id) {
		toggleInventoryBookPin(this, id);
		return this.publish();
	}

	markPassageUsed(id, at = Date.now()) {
		markInventoryPassage(this, id, at);
		return this.publish();
	}

	quantity(itemId) {
		return inventoryStoreQuantity(this, itemId);
	}

	owns(itemId) {
		return inventoryStoreOwns(this, itemId);
	}

	restore(saved) {
		restoreInventoryStore(this, saved);
		return this.publish();
	}

	serializableState() {
		return serializableInventoryStore(this);
	}

	snapshot() {
		return snapshotInventoryStore(this);
	}

	reconcileEquipment() {
		reconcileInventoryStoreEquipment(this);
	}

	publish() {
		return publishInventoryStore(this);
	}
}

__exports.InventoryStore = InventoryStore;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/AwtsmoosEventBus.js */
__awtsmoosModule_68 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosEventBus.js
 * @description Carries small gameplay intentions between buttons, runtime systems, and diagnostics.
 * RESPONSIBILITY: subscribe, unsubscribe, emit, and retain a bounded recent event history.
 * NON-RESPONSIBILITY: this bus does not interpret events or own gameplay state.
 * ARCHITECTURE: Yesod transmits intent while Malchus receives it in concrete runtime systems.
 * OROS AND KEILIM: intention is ohr; event names, details, and listeners are finite keilim.
 * The Awtsmoos creates sender, message, and receiver anew; Awtsmoos.com keeps those vessels
 * readable so camera switches and every other command remain inspectable rather than compressed.
 */

const HISTORY_LIMIT = 24;

class AwtsmoosEventBus {
	constructor() {
		this.listeners = new Map();
		this.history = [];
	}

	on(type, listener) {
		const listeners = this.listeners.get(type) || [];
		listeners.push(listener);
		this.listeners.set(type, listeners);
		return () => this.off(type, listener);
	}

	off(type, listener) {
		const listeners = this.listeners.get(type) || [];
		this.listeners.set(
			type,
			listeners.filter(candidate => candidate !== listener)
		);
	}

	emit(type, detail = {}) {
		this.history.unshift({
			at: currentTime(),
			detail,
			type
		});
		this.history.length = Math.min(HISTORY_LIMIT, this.history.length);
		for (const listener of this.listeners.get(type) || []) {
			listener(detail);
		}
		if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
			window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail }));
		}
	}
}


__exports.AwtsmoosEventBus = AwtsmoosEventBus;
function currentTime() {
	return typeof performance !== 'undefined'
		? performance.now()
		: Date.now();
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/HealingAmuletUse.js */
__awtsmoosModule_71 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletUse.js
 * @description Applies one local amulet charge only when bounded player healing succeeds.
 * The Awtsmoos joins possession, need, restoration, and consequence in one indivisible deed;
 * Awtsmoos.com consumes no vessel at full health and never revives a defeated traveler by accident.
 */

var healingAmuletDefinition = __awtsmoosModule_56.healingAmuletDefinition;

function useHealingAmulet(runtime, itemId) {
	const definition = healingAmuletDefinition(itemId);
	if (!definition) throw new Error('That item is not a healing amulet.');
	const inventory = runtime.inventory || runtime.inventoryStore;
	const stats = runtime.playerStats;
	if (!inventory || !stats) throw new Error('Healing is not available in this runtime.');
	if (inventory.quantity(itemId) < 1) throw new Error('That amulet is not in the Bag.');
	const health = Number(stats.health) || 0;
	const maximumHealth = Math.max(1, Number(stats.maxHealth) || 1);
	if (health <= 0) throw new Error('A defeated traveler must recover before using an amulet.');
	if (health >= maximumHealth) throw new Error('Health is already full.');
	const healing = Math.min(definition.effect.healing, maximumHealth - health);
	inventory.remove(itemId, 1);
	stats.health = health + healing;
	const receipt = Object.freeze({
		after: stats.health,
		before: health,
		healing,
		itemId,
		maximumHealth,
		remaining: inventory.quantity(itemId)
	});
	runtime.bus?.emit?.('profile:state', {
		health: stats.health,
		maxHealth: maximumHealth
	});
	runtime.bus?.emit?.('player:healed', receipt);
	runtime.bus?.emit?.('amulet:used', receipt);
	return receipt;
}

__exports.useHealingAmulet = useHealingAmulet;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/HealingAmuletCommerce.js */
__awtsmoosModule_70 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletCommerce.js
 * @description Unifies local amulet commerce with authoritative multiplayer purchase and healing receipts.
 * The Awtsmoos joins one Bag across solitary and connected worlds; Awtsmoos.com reconciles only
 * expert stock, wallet, and health so unrelated garments never vanish beneath a narrow server response.
 */

var HEALING_AMULET_IDS = __awtsmoosModule_56.HEALING_AMULET_IDS;
var useHealingAmulet = __awtsmoosModule_71.useHealingAmulet;

function healingAmuletCommerce(runtime) {
	runtime.amuletCommerce ||= createHealingAmuletCommerce(runtime);
	return runtime.amuletCommerce;
}


__exports.healingAmuletCommerce = healingAmuletCommerce;
function createHealingAmuletCommerce(runtime) {
	return Object.freeze({
		async buy(itemId, quantity, vendorId) {
			const economy = authoritativeEconomy(runtime);
			if (!economy) return runtime.inventory.buy(itemId, quantity);
			const message = await economy.buy(itemId, quantity, vendorId);
			const payload = responsePayload(message);
			reconcileAmuletAuthority(runtime, payload.state);
			runtime.bus?.emit?.('amulet:purchased', payload);
			return payload;
		},
		async use(itemId) {
			const economy = authoritativeEconomy(runtime);
			if (!economy) return useHealingAmulet(runtime, itemId);
			const message = await economy.useAmulet(itemId);
			const payload = responsePayload(message);
			reconcileAmuletAuthority(runtime, payload.state, payload.combat);
			runtime.bus?.emit?.('player:healed', payload);
			runtime.bus?.emit?.('amulet:used', payload);
			return payload;
		}
	});
}


__exports.createHealingAmuletCommerce = createHealingAmuletCommerce;
function reconcileAmuletAuthority(runtime, state, combat = null) {
	if (state) reconcileInventory(runtime.inventory, state);
	if (combat && runtime.playerStats) {
		runtime.playerStats.health = Number(combat.health) || 0;
		runtime.playerStats.maxHealth = Math.max(
			1,
			Number(combat.maximumHealth) || 1
		);
		runtime.bus?.emit?.('profile:state', {
			health: runtime.playerStats.health,
			maxHealth: runtime.playerStats.maxHealth
		});
	}
	const receipt = Object.freeze({
		health: runtime.playerStats?.health ?? null,
		items: amuletQuantities(runtime.inventory),
		perutas: runtime.inventory?.quantity?.('perutas') || 0
	});
	runtime.bus?.emit?.('amulet:authority', receipt);
	return receipt;
}


__exports.reconcileAmuletAuthority = reconcileAmuletAuthority;
function authoritativeEconomy(runtime) {
	const multiplayer = runtime.multiplayerBridge;
	if (!multiplayer || multiplayer.transport === 'local-tab') return null;
	if (multiplayer.state !== 'connected') return null;
	return multiplayer.client?.mmorpg?.economy || null;
}

function reconcileInventory(inventory, state) {
	if (!inventory?.serializableState || !inventory?.restore) return;
	const current = inventory.serializableState();
	const protectedIds = new Set([...HEALING_AMULET_IDS, 'perutas']);
	const items = current.items.filter(stack => !protectedIds.has(stack.itemId));
	const coins = Math.max(0, Number(state.wallet?.mitzvahCoins) || 0);
	if (coins > 0) items.push({ itemId: 'perutas', quantity: coins });
	for (const stack of state.inventory || []) {
		if (!HEALING_AMULET_IDS.includes(stack.itemId)) continue;
		if (Number(stack.quantity) > 0) {
			items.push({ itemId: stack.itemId, quantity: Number(stack.quantity) });
		}
	}
	inventory.restore({ ...current, items });
}

function amuletQuantities(inventory) {
	return Object.fromEntries(HEALING_AMULET_IDS.map(itemId => [
		itemId,
		inventory?.quantity?.(itemId) || 0
	]));
}

function responsePayload(message) {
	if (!message?.payload) throw new Error('INVALID_AMULET_AUTHORITY_RECEIPT');
	return message.payload;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalInteractionGuard.js */
__awtsmoosModule_74 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalInteractionGuard.js
 * @description Captures world input outside the Bag and keeps keyboard focus within its dialog.
 * The Awtsmoos grants action its proper vessel and silence to every competing surface;
 * Awtsmoos.com protects the open Bag without weakening its close button or inner controls.
 */

const BLOCKED_EVENTS = Object.freeze([
	'pointerdown',
	'pointerup',
	'click',
	'dblclick',
	'touchstart',
	'touchend',
	'wheel',
	'contextmenu',
	'focusin',
	'keydown'
]);

class InventoryModalInteractionGuard {
	constructor(documentValue, panel) {
		this.document = documentValue;
		this.panel = panel;
		this.active = false;
		this.onEvent = event => this.handleEvent(event);
	}

	activate() {
		if (this.active) {
			return;
		}
		this.active = true;
		for (const name of BLOCKED_EVENTS) {
			this.document.addEventListener(name, this.onEvent, true);
		}
	}

	deactivate() {
		if (!this.active) {
			return;
		}
		for (const name of BLOCKED_EVENTS) {
			this.document.removeEventListener(name, this.onEvent, true);
		}
		this.active = false;
	}

	handleEvent(event) {
		if (event.type === 'keydown') {
			this.handleKeyDown(event);
			return;
		}
		if (this.panel.contains(event.target)) {
			return;
		}
		if (event.type === 'focusin') {
			this.focusFirst();
		}
		blockEvent(event);
	}

	handleKeyDown(event) {
		if (event.key === 'Escape') {
			return;
		}
		if (this.panel.contains(event.target)) {
			if (event.key === 'Tab') {
				this.trapTab(event);
			}
			return;
		}
		blockEvent(event);
	}

	trapTab(event) {
		const focusable = [...this.panel.querySelectorAll(FOCUSABLE_SELECTOR)]
			.filter(node => !node.disabled && node.getAttribute('aria-hidden') !== 'true');
		if (!focusable.length) {
			blockEvent(event);
			return;
		}
		const current = focusable.indexOf(this.document.activeElement);
		const next = event.shiftKey
			? (current <= 0 ? focusable.length - 1 : current - 1)
			: (current >= focusable.length - 1 ? 0 : current + 1);
		event.preventDefault();
		focusable[next].focus();
	}

	focusFirst() {
		this.panel.querySelector('[data-close]')?.focus?.();
	}
}


__exports.InventoryModalInteractionGuard = InventoryModalInteractionGuard;
function blockEvent(event) {
	event.preventDefault?.();
	event.stopImmediatePropagation?.();
	event.stopPropagation?.();
}

const FOCUSABLE_SELECTOR = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalSnapshot.js */
__awtsmoosModule_75 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalSnapshot.js
 * @description Suspends every sibling branch outside the Bag and restores exact prior attributes.
 * The Awtsmoos recreates every state without losing what came before;
 * Awtsmoos.com keeps finite inertness reversible through every ancestor of the modal vessel.
 */

function captureModalEnvironment(documentValue, host) {
	const records = [];
	let branch = host;
	while (branch?.parentElement) {
		for (const sibling of branch.parentElement.children) {
			if (sibling !== branch) {
				recordNode(records, sibling);
			}
		}
		if (branch.parentElement === documentValue.body) {
			break;
		}
		branch = branch.parentElement;
	}
	return records;
}


__exports.captureModalEnvironment = captureModalEnvironment;
function restoreModalEnvironment(records) {
	for (const record of records) {
		record.node.inert = record.inert;
		if (record.hadAriaHidden) {
			record.node.setAttribute('aria-hidden', record.ariaHidden);
		} else {
			record.node.removeAttribute('aria-hidden');
		}
	}
}


__exports.restoreModalEnvironment = restoreModalEnvironment;
function recordNode(records, node) {
	if (records.some(record => record.node === node)) {
		return;
	}
	const record = {
		node,
		inert: Boolean(node.inert),
		hadAriaHidden: node.hasAttribute('aria-hidden'),
		ariaHidden: node.getAttribute('aria-hidden')
	};
	records.push(record);
	node.inert = true;
	node.setAttribute('aria-hidden', 'true');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalState.js */
__awtsmoosModule_76 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalState.js
 * @description Exposes the one document-level predicate used to suspend world and action input.
 * The Awtsmoos joins visible state and behavioral truth without contradiction;
 * Awtsmoos.com lets every input boundary ask one clear question while the Bag is open.
 */

const INVENTORY_MODAL_DATASET = 'inventoryModalOpen';
__exports.INVENTORY_MODAL_DATASET = INVENTORY_MODAL_DATASET;


function isInventoryModalOpen(documentValue = globalThis.document) {
	return documentValue?.documentElement?.dataset?.[INVENTORY_MODAL_DATASET] === 'true';
}

__exports.isInventoryModalOpen = isInventoryModalOpen;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalStyles.js */
__awtsmoosModule_77 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file InventoryModalStyles.js
 * @description Gives the Bag one fixed modal plane with reliable touch scrolling and tappable items.
 * The Awtsmoos opens a chamber within the world without confusing its boundaries; Awtsmoos.com
 * lets the list move beneath the hand while every item, action, close button, and context choice answers.
 */
const INVENTORY_MODAL_CSS = `
html[data-inventory-modal-open="true"],
body[data-inventory-modal-open="true"] {
	overflow: hidden !important;
	overscroll-behavior: none !important;
}
html[data-inventory-modal-open="true"] #joy,
html[data-inventory-modal-open="true"] #jump,
html[data-inventory-modal-open="true"] .Awtsmoos-action-host,
html[data-inventory-modal-open="true"] .Awtsmoos-combat-host-container,
html[data-inventory-modal-open="true"] .Mitzvah-combat-host,
html[data-inventory-modal-open="true"] .Awtsmoos-game-rail {
	visibility: hidden !important;
	pointer-events: none !important;
}
.Awtsmoos-inventory-shell {
	position: fixed !important;
	inset: 0 !important;
	z-index: 980 !important;
	width: 100vw !important;
	height: 100dvh !important;
	padding: 0 !important;
	pointer-events: none !important;
}
.Awtsmoos-inventory-shell[data-modal-active="true"] {
	pointer-events: auto !important;
}
.Awtsmoos-inventory-backdrop {
	position: absolute !important;
	inset: 0 !important;
	z-index: 0 !important;
	background: rgba(0, 4, 10, .82) !important;
	backdrop-filter: blur(6px);
	pointer-events: auto !important;
}
.Awtsmoos-inventory-backdrop[hidden] {
	display: none !important;
}
.Awtsmoos-inventory-panel[data-open="true"] {
	position: fixed !important;
	inset: max(8px, env(safe-area-inset-top, 0px)) max(8px, env(safe-area-inset-right, 0px)) max(8px, env(safe-area-inset-bottom, 0px)) max(8px, env(safe-area-inset-left, 0px)) !important;
	z-index: 1 !important;
	display: grid !important;
	grid-template-rows: auto minmax(0, 1fr) auto !important;
	width: auto !important;
	height: auto !important;
	max-width: none !important;
	max-height: calc(100dvh - 16px) !important;
	margin: 0 !important;
	padding: clamp(10px, 2.5vw, 18px) !important;
	overflow: hidden !important;
	transform: none !important;
	pointer-events: auto !important;
	touch-action: manipulation !important;
}
.Awtsmoos-inventory-panel .inv-header,
.Awtsmoos-inventory-panel .inv-context-menu,
.Awtsmoos-inventory-panel button,
.Awtsmoos-inventory-panel [data-item-id] {
	pointer-events: auto !important;
}
.Awtsmoos-inventory-panel .inv-body {
	min-width: 0 !important;
	min-height: 0 !important;
	overflow-x: hidden !important;
	overflow-y: auto !important;
	overscroll-behavior: contain !important;
	touch-action: pan-y !important;
	-webkit-overflow-scrolling: touch;
	scrollbar-gutter: stable;
}
.Awtsmoos-inventory-panel .item-card[hidden] {
	display: none !important;
}
.Awtsmoos-inventory-panel .inv-context-menu[data-open="true"] {
	position: sticky !important;
	inset: auto 0 0 0 !important;
	z-index: 4 !important;
	display: flex !important;
	gap: 8px !important;
	width: 100% !important;
	max-height: min(26vh, 190px) !important;
	padding: 10px !important;
	overflow-y: auto !important;
	background: rgba(4, 10, 18, .98) !important;
	overscroll-behavior: contain !important;
	touch-action: pan-x pan-y !important;
}
@media (max-width: 820px), (max-height: 520px) {
	.Awtsmoos-inventory-panel .inv-body {
		display: block !important;
		padding-bottom: 18px !important;
	}
	.Awtsmoos-inventory-panel .equip-grid,
	.Awtsmoos-inventory-panel .bag-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
	}
	.Awtsmoos-inventory-panel .item-card {
		min-height: 86px !important;
	}
}
`;
__exports.INVENTORY_MODAL_CSS = INVENTORY_MODAL_CSS;

function installInventoryModalStyles(documentValue) {
	const id = 'Awtsmoos-inventory-modal-styles';
	if (documentValue.getElementById(id)) return;
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = INVENTORY_MODAL_CSS;
	documentValue.head.append(style);
}

__exports.installInventoryModalStyles = installInventoryModalStyles;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalController.js */
__awtsmoosModule_73 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalController.js
 * @description Activates and restores the Bag modal boundary exactly once per state transition.
 * The Awtsmoos preserves every hidden potential while one vessel stands before the player;
 * Awtsmoos.com restores focus, accessibility, scroll, and interaction without duplicated release.
 */

var InventoryModalInteractionGuard = __awtsmoosModule_74.InventoryModalInteractionGuard;
var captureModalEnvironment = __awtsmoosModule_75.captureModalEnvironment;
var restoreModalEnvironment = __awtsmoosModule_75.restoreModalEnvironment;
var INVENTORY_MODAL_DATASET = __awtsmoosModule_76.INVENTORY_MODAL_DATASET;
var installInventoryModalStyles = __awtsmoosModule_77.installInventoryModalStyles;

class InventoryModalController {
	constructor(host, panel, documentValue) {
		this.host = host;
		this.panel = panel;
		this.document = documentValue;
		this.active = false;
		this.records = [];
		this.guard = new InventoryModalInteractionGuard(documentValue, panel);
		this.backdrop = documentValue.createElement('div');
		this.backdrop.className = 'Awtsmoos-inventory-backdrop';
		this.backdrop.hidden = true;
		host.insertBefore(this.backdrop, panel);
		installInventoryModalStyles(documentValue);
	}

	activate() {
		if (this.active) {
			return false;
		}
		this.active = true;
		this.snapshot = this.captureState();
		this.records = captureModalEnvironment(this.document, this.host);
		this.setModalDataset('true');
		this.document.body.style.overflow = 'hidden';
		this.host.dataset.modalActive = 'true';
		this.panel.setAttribute('role', 'dialog');
		this.panel.setAttribute('aria-modal', 'true');
		this.backdrop.hidden = false;
		this.guard.activate();
		return true;
	}

	deactivate() {
		if (!this.active) {
			return false;
		}
		this.guard.deactivate();
		restoreModalEnvironment(this.records);
		this.records = [];
		this.restoreState(this.snapshot);
		this.backdrop.hidden = true;
		delete this.host.dataset.modalActive;
		this.active = false;
		this.snapshot.focused?.focus?.();
		return true;
	}

	captureState() {
		return {
			focused: this.document.activeElement,
			overflow: this.document.body.style.overflow,
			htmlDataset: this.document.documentElement.dataset[INVENTORY_MODAL_DATASET],
			bodyDataset: this.document.body.dataset[INVENTORY_MODAL_DATASET],
			role: attributeState(this.panel, 'role'),
			ariaModal: attributeState(this.panel, 'aria-modal')
		};
	}

	restoreState(snapshot) {
		this.document.body.style.overflow = snapshot.overflow;
		restoreDataset(this.document.documentElement, snapshot.htmlDataset);
		restoreDataset(this.document.body, snapshot.bodyDataset);
		restoreAttribute(this.panel, 'role', snapshot.role);
		restoreAttribute(this.panel, 'aria-modal', snapshot.ariaModal);
	}

	setModalDataset(value) {
		this.document.documentElement.dataset[INVENTORY_MODAL_DATASET] = value;
		this.document.body.dataset[INVENTORY_MODAL_DATASET] = value;
	}

	destroy() {
		this.deactivate();
		this.backdrop.remove();
	}
}


__exports.InventoryModalController = InventoryModalController;
function attributeState(node, name) {
	return { present: node.hasAttribute(name), value: node.getAttribute(name) };
}

function restoreAttribute(node, name, state) {
	if (state.present) {
		node.setAttribute(name, state.value);
	} else {
		node.removeAttribute(name);
	}
}

function restoreDataset(node, value) {
	if (value === undefined) {
		delete node.dataset[INVENTORY_MODAL_DATASET];
	} else {
		node.dataset[INVENTORY_MODAL_DATASET] = value;
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelState.js */
__awtsmoosModule_79 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelState.js
 * @description Derives aggregate Bag cards and compact truthful status text from store snapshots.
 * The Awtsmoos remains one while physical stacks multiply; Awtsmoos.com gathers each item ID
 * into one readable visual quantity without altering the real stack limits beneath the panel.
 */

function aggregateInventoryStacks(state) {
	const aggregates = new Map();
	for (const stack of state.items || []) {
		const current = aggregates.get(stack.itemId);
		if (current) {
			current.quantity += stack.quantity;
			continue;
		}
		aggregates.set(stack.itemId, { ...stack });
	}
	return [...aggregates.values()];
}


__exports.aggregateInventoryStacks = aggregateInventoryStacks;
function combinedInventoryStack(state, itemId) {
	if (!itemId) return null;
	return aggregateInventoryStacks(state).find(stack => stack.itemId === itemId) || null;
}


__exports.combinedInventoryStack = combinedInventoryStack;
function inventorySummaryText(state) {
	const coins = combinedInventoryStack(state, 'perutas')?.quantity || 0;
	return [
		`🪙 ${coins}`,
		`⚔ ${state.stats.damage}`,
		`🛡 ${state.stats.defense}`,
		`✨ ${state.stats.focus}`
	].join(' · ');
}

__exports.inventorySummaryText = inventorySummaryText;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryEquipmentSlots.js */
__awtsmoosModule_82 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryEquipmentSlots.js
 * @description Defines every authoritative wearable, weapon, tool, and accessory Bag slot.
 * The Awtsmoos clothes the traveler through many finite places without hiding any one;
 * Awtsmoos.com gives each owned garment a stable label and visible order in the Bag.
 */

const INVENTORY_EQUIPMENT_SLOTS = Object.freeze([
	slot('hat', 'Hat'),
	slot('kippah', 'Kippah'),
	slot('tefillinHead', 'Tefillin Shel Rosh'),
	slot('eyes', 'Eyes'),
	slot('tefillinArm', 'Tefillin Shel Yad'),
	slot('coat', 'Coat'),
	slot('outerShirt', 'Outer Shirt'),
	slot('shirt', 'Inner Shirt'),
	slot('pants', 'Trousers'),
	slot('feet', 'Shoes'),
	slot('hand', 'Main Hand'),
	slot('offhand', 'Off Hand'),
	slot('tool', 'Tool'),
	slot('accessory', 'Accessory')
]);
__exports.INVENTORY_EQUIPMENT_SLOTS = INVENTORY_EQUIPMENT_SLOTS;


const INVENTORY_EQUIPMENT_SLOT_IDS = Object.freeze(
	INVENTORY_EQUIPMENT_SLOTS.map((record) => record.id)
);
__exports.INVENTORY_EQUIPMENT_SLOT_IDS = INVENTORY_EQUIPMENT_SLOT_IDS;


function inventoryEquipmentSlotLabel(slotId) {
	return INVENTORY_EQUIPMENT_SLOTS.find((record) => record.id === slotId)?.label
		|| String(slotId || 'Equipment');
}


__exports.inventoryEquipmentSlotLabel = inventoryEquipmentSlotLabel;
function slot(id, label) {
	return Object.freeze({ id, label });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelElements.js */
__awtsmoosModule_81 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelElements.js
 * @description Creates accessible buttons for every canonical equipment and backpack vessel.
 * The Awtsmoos shines through hat, tefillin, shirt, weapon, and empty place alike;
 * Awtsmoos.com keeps the Bag complete, quantity-aware, touch-sized, and truthfully labeled.
 */

var INVENTORY_EQUIPMENT_SLOTS = __awtsmoosModule_82.INVENTORY_EQUIPMENT_SLOTS;
var inventoryEquipmentSlotLabel = __awtsmoosModule_82.inventoryEquipmentSlotLabel;
var combinedInventoryStack = __awtsmoosModule_79.combinedInventoryStack;

const EQUIPMENT_SLOTS = Object.freeze(
	INVENTORY_EQUIPMENT_SLOTS.map((record) => record.id)
);
__exports.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;


function inventoryEquipmentButton(slot, state) {
	const itemId = state.equipment[slot];
	const item = combinedInventoryStack(state, itemId)?.definition;
	const documentValue = globalThis.document;
	const button = documentValue.createElement('button');
	const label = inventoryEquipmentSlotLabel(slot);
	button.className = `inv-slot equip${item ? '' : ' empty'}`;
	button.dataset.slot = slot;
	if (itemId) button.dataset.itemId = itemId;
	button.disabled = !item;
	button.setAttribute(
		'aria-label',
		item ? `${label}: ${item.name}` : `${label}: empty`
	);
	button.innerHTML = slotMarkup(item?.icon || '＋', item?.name || 'Empty', label);
	return button;
}


__exports.inventoryEquipmentButton = inventoryEquipmentButton;
function inventoryItemButton(stack) {
	const button = globalThis.document.createElement('button');
	button.className = 'inv-slot';
	button.dataset.itemId = stack.itemId;
	button.setAttribute(
		'aria-label',
		`${stack.definition.name}, quantity ${stack.quantity}`
	);
	const detail = stack.quantity > 1
		? `×${stack.quantity}`
		: stack.definition.category;
	button.innerHTML = slotMarkup(
		stack.definition.icon,
		stack.definition.name,
		detail
	);
	return button;
}


__exports.inventoryItemButton = inventoryItemButton;
function inventoryEmptyButton() {
	const button = globalThis.document.createElement('button');
	button.className = 'inv-slot empty';
	button.disabled = true;
	button.setAttribute('aria-label', 'Empty inventory slot');
	button.innerHTML = slotMarkup('＋', 'Empty', 'available');
	return button;
}


__exports.inventoryEmptyButton = inventoryEmptyButton;
function slotMarkup(icon, name, detail) {
	return `<span>${escapeHtml(icon)}</span><b>${escapeHtml(name)}</b><small>${escapeHtml(detail)}</small>`;
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, (character) => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelGuidance.js */
__awtsmoosModule_83 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelGuidance.js
 * @description Derives contextual Bag actions and human-readable behavior explanations.
 * The Awtsmoos gives every visible choice a truthful consequence; Awtsmoos.com explains
 * equip, use, remove, draw, sheath, open, pin, and drop before touch or keyboard invokes them.
 */

function inventoryActionsFor(item, state, equipmentState) {
	const equipped = item.slot && state.equipment[item.slot] === item.id;
	const actions = new Set(item.actions || []);
	if (equipped) {
		actions.delete('equip');
		actions.add('unequip');
	}
	if (equipped && item.slot === 'hand') {
		actions.add(equipmentState.drawn ? 'sheath' : 'draw');
	}
	return [...actions];
}


__exports.inventoryActionsFor = inventoryActionsFor;
function inventoryActionGuidance(item, state, equipmentState) {
	const equipped = item.slot && state?.equipment?.[item.slot] === item.id;
	const guidance = [];
	if (item.slot) {
		guidance.push(equipped
			? `Unequip removes it from ${item.slot}.`
			: `Equip places it in ${item.slot}.`);
	}
	if (item.actions?.includes('use')) {
		guidance.push('Use consumes one only when its game effect succeeds.');
	}
	if (item.actions?.includes('open')) guidance.push('Open reads the book or scroll.');
	if (item.actions?.includes('pin')) guidance.push('Pin keeps it in quick Torah access.');
	if (item.actions?.includes('drop')) guidance.push('Drop removes one real unit.');
	if (equipped && item.slot === 'hand') {
		guidance.push(equipmentState.drawn
			? 'Sheath moves it to the back.'
			: 'Draw moves it to the hand.');
	}
	return guidance.join(' ') || 'Inspect reveals this item without changing state.';
}


__exports.inventoryActionGuidance = inventoryActionGuidance;
function inventoryActionLabel(action) {
	return action.charAt(0).toUpperCase() + action.slice(1);
}

__exports.inventoryActionLabel = inventoryActionLabel;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelView.js */
__awtsmoosModule_80 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Renders real Bag stacks and reveals bounded details only after deliberate selection.
 * The Awtsmoos fills actual vessels without pretending empty space is treasure;
 * Awtsmoos.com keeps the mobile Bag compact, truthful, and free of an unused detail chamber.
 */

var EQUIPMENT_SLOTS = __awtsmoosModule_81.EQUIPMENT_SLOTS;
var inventoryEquipmentButton = __awtsmoosModule_81.inventoryEquipmentButton;
var inventoryItemButton = __awtsmoosModule_81.inventoryItemButton;
var inventoryActionGuidance = __awtsmoosModule_83.inventoryActionGuidance;
var inventoryActionLabel = __awtsmoosModule_83.inventoryActionLabel;
var inventoryActionsFor = __awtsmoosModule_83.inventoryActionsFor;
var aggregateInventoryStacks = __awtsmoosModule_79.aggregateInventoryStacks;
var combinedInventoryStack = __awtsmoosModule_79.combinedInventoryStack;
var inventorySummaryText = __awtsmoosModule_79.inventorySummaryText;

__exports.combinedInventoryStack = __awtsmoosModule_79.combinedInventoryStack;

function inventoryPanelHtml(state) {
	return `<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true" aria-label="Bag">
		<header>
			<b>🎒 B"H Bag</b><span>${inventorySummaryText(state)}</span>
			<button data-close aria-label="Close Bag" style="min-width:44px;min-height:44px">×</button>
		</header>
		<div class="inv-body">
			<aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
			<main>
				<h3>Backpack</h3><div class="bag-grid" data-items></div>
				<div class="item-card" data-item-card data-has-selection="false" role="status" hidden></div>
			</main>
		</div>
		<div class="inv-context-menu" data-open="false" data-menu role="menu"></div>
	</section>`;
}


__exports.inventoryPanelHtml = inventoryPanelHtml;
function renderInventoryItems(container, state) {
	const stacks = aggregateInventoryStacks(state);
	if (stacks.length) {
		container.replaceChildren(...stacks.map(inventoryItemButton));
		return;
	}
	const documentValue = container.ownerDocument || document;
	const empty = documentValue.createElement('p');
	empty.className = 'bag-empty';
	empty.textContent = 'Your Bag is empty. Looted items will appear here.';
	container.replaceChildren(empty);
}


__exports.renderInventoryItems = renderInventoryItems;
function renderEquipment(container, state) {
	const buttons = EQUIPMENT_SLOTS.map(slot => inventoryEquipmentButton(slot, state));
	container.replaceChildren(...buttons);
}


__exports.renderEquipment = renderEquipment;
function renderInventoryCard(container, stack, state, equipmentState = {}) {
	if (!stack?.definition) {
		container.hidden = true;
		container.dataset.hasSelection = 'false';
		container.replaceChildren();
		return;
	}
	const item = stack.definition;
	container.hidden = false;
	container.dataset.hasSelection = 'true';
	container.innerHTML = `<h4>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</h4>
		<p><b>${escapeHtml(item.category)}</b> · quantity ${stack.quantity}</p>
		<p>${escapeHtml(item.description)}</p>
		<p>Damage ${item.stats.damage} · Defense ${item.stats.defense} · Focus ${item.stats.focus}</p>
		<p>${escapeHtml(inventoryActionGuidance(item, state, equipmentState))}</p>`;
}


__exports.renderInventoryCard = renderInventoryCard;
function renderInventoryMenu(menu, stack, state, equipmentState = {}) {
	menu.replaceChildren();
	if (!stack?.definition) {
		menu.dataset.open = 'false';
		return;
	}
	const documentValue = menu.ownerDocument || document;
	const title = documentValue.createElement('h4');
	title.textContent = `${stack.definition.icon} ${stack.definition.name}`;
	const actions = documentValue.createElement('div');
	for (const action of inventoryActionsFor(stack.definition, state, equipmentState)) {
		const button = documentValue.createElement('button');
		button.dataset.action = action;
		button.setAttribute('role', 'menuitem');
		button.style.minWidth = '44px';
		button.style.minHeight = '44px';
		button.textContent = inventoryActionLabel(action);
		actions.appendChild(button);
	}
	menu.append(title, actions);
	menu.dataset.open = 'true';
}


__exports.renderInventoryMenu = renderInventoryMenu;
function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryModalPanelRuntime.js */
__awtsmoosModule_78 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalPanelRuntime.js
 * @description Owns Bag rendering, click routing, markup creation, and fallback host construction.
 * The Awtsmoos joins many visible details without burdening the modal coordinator;
 * Awtsmoos.com gives rendering its own vessel while openness remains an exact-once state transition.
 */

var inventorySummaryText = __awtsmoosModule_79.inventorySummaryText;
var combinedInventoryStack = __awtsmoosModule_80.combinedInventoryStack;
var inventoryPanelHtml = __awtsmoosModule_80.inventoryPanelHtml;
var renderEquipment = __awtsmoosModule_80.renderEquipment;
var renderInventoryCard = __awtsmoosModule_80.renderInventoryCard;
var renderInventoryItems = __awtsmoosModule_80.renderInventoryItems;
var renderInventoryMenu = __awtsmoosModule_80.renderInventoryMenu;

function inventoryModalMarkup(state) {
	return inventoryPanelHtml(state);
}


__exports.inventoryModalMarkup = inventoryModalMarkup;
function renderInventoryModalPanel(panel) {
	const state = panel.store.snapshot();
	renderInventoryItems(panel.panel.querySelector('[data-items]'), state);
	renderEquipment(panel.panel.querySelector('[data-equipment]'), state);
	const selected = combinedInventoryStack(state, panel.selectedItemId);
	renderInventoryCard(panel.card, selected, state, panel.equipmentState);
	panel.panel.querySelector('header span').textContent = inventorySummaryText(state);
	if (panel.menu.dataset.open === 'true') {
		renderInventoryMenu(panel.menu, selected, state, panel.equipmentState);
	}
}


__exports.renderInventoryModalPanel = renderInventoryModalPanel;
function routeInventoryModalClick(panel, event) {
	if (event.target.closest('[data-close]')) {
		return panel.setOpen(false);
	}
	const itemButton = event.target.closest('[data-item-id]');
	if (itemButton) {
		return panel.select(itemButton.dataset.itemId, itemButton);
	}
	const actionButton = event.target.closest('[data-action]');
	if (actionButton) {
		panel.runAction(actionButton.dataset.action);
	}
	return undefined;
}


__exports.routeInventoryModalClick = routeInventoryModalClick;
function createInventoryModalHost(documentValue = globalThis.document) {
	const host = documentValue.createElement('div');
	documentValue.body.appendChild(host);
	return host;
}

__exports.createInventoryModalHost = createInventoryModalHost;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelActionRunner.js */
__awtsmoosModule_84 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelActionRunner.js
 * @description Executes real Bag actions, async effects, contextual selection, and focus-safe openness.
 * The Awtsmoos joins intention to consequence without invisible blockers; Awtsmoos.com keeps
 * touch and keyboard actions connected to store truth, authority receipts, events, and restored focus.
 */

var combinedInventoryStack = __awtsmoosModule_79.combinedInventoryStack;
var renderInventoryCard = __awtsmoosModule_80.renderInventoryCard;
var renderInventoryMenu = __awtsmoosModule_80.renderInventoryMenu;

function selectInventoryPanelItem(panel, itemId, button) {
	panel.selectedItemId = itemId;
	const state = panel.store.snapshot();
	const stack = combinedInventoryStack(state, itemId);
	renderInventoryCard(panel.card, stack, state, panel.equipmentState);
	renderInventoryMenu(panel.menu, stack, state, panel.equipmentState);
	positionMenu(panel.menu, button.getBoundingClientRect());
}


__exports.selectInventoryPanelItem = selectInventoryPanelItem;
async function runInventoryPanelAction(panel, action) {
	const state = panel.store.snapshot();
	const item = combinedInventoryStack(state, panel.selectedItemId)?.definition;
	if (!item) return;
	if (action === 'equip') panel.store.equip(item.id);
	if (action === 'unequip') panel.store.unequip(item.slot);
	if (action === 'draw') panel.bus.emit('equipment:draw');
	if (action === 'sheath') panel.bus.emit('equipment:sheath');
	if (action === 'drop') panel.store.remove(item.id, 1);
	if (action === 'use') await requireUseHandler(panel)(item.id);
	if (action === 'open' && item.category === 'book') panel.bus.emit('torah:toggle');
	if (action === 'open' && item.id === 'quest-scroll') panel.bus.emit('questlog:toggle');
	if (action === 'pin' && item.category === 'book') panel.store.toggleBookPin(item.id);
	panel.bus.emit('inventory:action', { action, itemId: item.id });
	panel.menu.dataset.open = 'false';
	panel.render();
}


__exports.runInventoryPanelAction = runInventoryPanelAction;
function setInventoryPanelOpen(panel, open) {
	const nextOpen = Boolean(open);
	if (nextOpen && !panel.open) panel.lastFocusedElement = panel.document?.activeElement || null;
	panel.open = nextOpen;
	panel.panel.dataset.open = String(panel.open);
	panel.panel.setAttribute('aria-hidden', String(!panel.open));
	if (panel.open) panel.panel.querySelector('[data-close]')?.focus?.();
	if (!panel.open) {
		panel.menu.dataset.open = 'false';
		panel.lastFocusedElement?.focus?.();
	}
	panel.bus.emit('inventory:state', { open: panel.open });
}


__exports.setInventoryPanelOpen = setInventoryPanelOpen;
function requireUseHandler(panel) {
	if (typeof panel.onUse !== 'function') {
		throw new Error('This runtime cannot use consumable items.');
	}
	return panel.onUse;
}

function positionMenu(menu, rectangle) {
	const width = Number(globalThis.innerWidth) || 390;
	const height = Number(globalThis.innerHeight) || 844;
	menu.style.left = `${Math.max(8, Math.min(width - 230, rectangle.left))}px`;
	menu.style.top = `${Math.max(8, Math.min(height - 180, rectangle.bottom + 6))}px`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanel.js */
__awtsmoosModule_72 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanel.js
 * @description Coordinates Bag truth and asynchronous item effects inside one modal boundary.
 * The Awtsmoos renews touch, keyboard, focus, action, and receipt as one truthful path;
 * Awtsmoos.com lets the Bag await authority, silence the world, and restore prior HUD state once.
 */

var InventoryModalController = __awtsmoosModule_73.InventoryModalController;
var createInventoryModalHost = __awtsmoosModule_78.createInventoryModalHost;
var inventoryModalMarkup = __awtsmoosModule_78.inventoryModalMarkup;
var renderInventoryModalPanel = __awtsmoosModule_78.renderInventoryModalPanel;
var routeInventoryModalClick = __awtsmoosModule_78.routeInventoryModalClick;
var runInventoryPanelAction = __awtsmoosModule_84.runInventoryPanelAction;
var selectInventoryPanelItem = __awtsmoosModule_84.selectInventoryPanelItem;
var setInventoryPanelOpen = __awtsmoosModule_84.setInventoryPanelOpen;

class InventoryPanel {
	constructor(host, bus, options = {}) {
		this.host = host || createInventoryModalHost();
		this.bus = bus;
		this.store = options.store;
		this.onUse = options.onUse || null;
		if (!this.store) throw new Error('InventoryPanel requires an InventoryStore.');
		this.document = this.host.ownerDocument || globalThis.document;
		this.open = false;
		this.selectedItemId = null;
		this.lastFocusedElement = null;
		this.equipmentState = { drawn: false };
		this.unsubscribers = [];
		this.onPanelClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-inventory-shell');
		this.host.innerHTML = inventoryModalMarkup(this.store.snapshot());
		this.panel = this.host.querySelector('.Awtsmoos-inventory-panel');
		this.menu = this.host.querySelector('[data-menu]');
		this.card = this.host.querySelector('[data-item-card]');
		this.modal = new InventoryModalController(this.host, this.panel, this.document);
		this.panel.addEventListener('click', this.onPanelClick);
		this.document.addEventListener('keydown', this.onKeyDown);
		this.unsubscribers.push(this.bus.on('inventory:toggle', () => this.setOpen(!this.open)));
		this.unsubscribers.push(this.bus.on('inventory:open', () => this.setOpen(true)));
		this.unsubscribers.push(this.bus.on('equipment:state', state => this.updateEquipmentState(state)));
		this.unsubscribers.push(this.store.onChange(() => this.render()));
		this.render();
	}

	render() {
		renderInventoryModalPanel(this);
	}

	handleClick(event) {
		return routeInventoryModalClick(this, event);
	}

	handleKeyDown(event) {
		if (event.key !== 'Escape' || !this.open) return;
		event.preventDefault();
		this.setOpen(false);
	}

	updateEquipmentState(state) {
		this.equipmentState = { ...this.equipmentState, ...state };
		this.render();
	}

	select(itemId, button) {
		selectInventoryPanelItem(this, itemId, button);
	}

	async runAction(action) {
		try {
			await runInventoryPanelAction(this, action);
		} catch (error) {
			this.card.hidden = false;
			this.card.textContent = error.message;
		}
	}

	setOpen(open) {
		const nextOpen = Boolean(open);
		if (nextOpen === this.open) return false;
		if (nextOpen) this.modal.activate();
		setInventoryPanelOpen(this, nextOpen);
		if (!nextOpen) this.modal.deactivate();
		return true;
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.panel.removeEventListener('click', this.onPanelClick);
		this.document.removeEventListener('keydown', this.onKeyDown);
		this.modal.destroy();
	}
}

__exports.InventoryPanel = InventoryPanel;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/combat/CombatActionRecord.js */
__awtsmoosModule_88 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatActionRecord.js
 * @description Freezes one inspectable combat covenant shared by casting and melee.
 * The Awtsmoos renews intention and boundary in one light; Awtsmoos.com lets every
 * finite action reveal timing, geometry, authority, cost, feedback, and succession.
 */
function combatActionRecord(value) {
	return Object.freeze({
		activeEnd: finite(value.activeEnd, value.windup + 0.12),
		activeStart: finite(value.activeStart, value.windup),
		animation: value.animation || value.id,
		arcDegrees: finite(value.arcDegrees, 20),
		baseDamageMultiplier: finite(value.baseDamageMultiplier, 1),
		cameraFeedback: value.cameraFeedback || null,
		comboPredecessor: value.comboPredecessor || null,
		comboSuccessor: value.comboSuccessor || null,
		cooldown: finite(value.cooldown, 0.8),
		displayName: value.displayName || value.id,
		effectId: value.effectId || null,
		hitCount: Math.max(1, finite(value.hitCount, 1)),
		id: value.id,
		interruptible: value.interruptible !== false,
		knockback: finite(value.knockback, 0),
		movementAllowance: finite(value.movementAllowance, 0),
		range: finite(value.range, 3),
		recovery: finite(value.recovery, 0.25),
		requiredSlot: value.requiredSlot || null,
		requiredWeaponClass: value.requiredWeaponClass || null,
		rotationAllowance: finite(value.rotationAllowance, 0),
		serverIntent: value.serverIntent || 'combat-action',
		soundId: value.soundId || null,
		stagger: finite(value.stagger, 0),
		staminaCost: finite(value.staminaCost, 0),
		statusEffect: value.statusEffect || null,
		targetLimit: Math.max(1, finite(value.targetLimit, 1)),
		type: value.type || 'melee',
		verticalTolerance: finite(value.verticalTolerance, 2),
		windup: finite(value.windup, 0.2),
		...value
	});
}


__exports.combatActionRecord = combatActionRecord;
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCastActionCatalog.js */
__awtsmoosModule_87 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCastActionCatalog.js
 * @description Defines bounded offensive, deliberate, support, counter, and weapon-gated casts.
 * The Awtsmoos gives each spoken deed a stable identity before animation or authority;
 * Awtsmoos.com keeps timing, range, status, Kavanah, target, input, and presentation together.
 */

var action = __awtsmoosModule_88.combatActionRecord;

const MINIMAL_MEADOW_CAST_ACTIONS = Object.freeze({
	'hebrew-fire': cast({
		castTime: 1.15,
		cooldown: 2.5,
		damage: 28,
		displayName: 'Hebrew Fire',
		elementId: 'fire',
		icon: '🔥',
		id: 'hebrew-fire',
		keyCode: 'Digit1',
		keyLabel: '1',
		letters: 'אש',
		range: 34,
		speed: 8.5
	}),
	'letter-light': cast({
		castTime: 1.1,
		cooldown: 1.85,
		damage: 18,
		displayName: 'Letter Light',
		elementId: 'light',
		icon: '☀️',
		id: 'letter-light',
		kavanah: true,
		keyCode: 'Digit2',
		keyLabel: '2',
		letters: 'אור',
		range: 38,
		speed: 11.5,
		statusEffect: 'illuminated'
	}),
	'guarded-thought': cast({
		castTime: 0.82,
		cooldown: 4.2,
		damage: 8,
		displayName: 'Guarded Thought',
		elementId: 'air',
		icon: '🛡️',
		id: 'guarded-thought',
		interruptForce: 36,
		keyCode: 'Digit3',
		keyLabel: '3',
		letters: 'שמור',
		range: 30,
		speed: 14,
		statusEffect: 'disrupted'
	}),
	'waters-of-purification': cast({
		castTime: 0.9,
		cooldown: 6,
		damage: 0,
		displayName: 'Waters of Purification',
		elementId: 'water',
		icon: '💧',
		id: 'waters-of-purification',
		kavanah: true,
		keyCode: 'Digit4',
		keyLabel: '4',
		letters: 'מים',
		range: 0,
		speed: 0,
		supportKind: 'cleanse',
		targetKind: 'self'
	}),
	'staff-cast': cast({
		castTime: 0.62,
		cooldown: 1.2,
		damage: 12,
		displayName: 'Staff Casting',
		icon: '🪄',
		id: 'staff-cast',
		keyCode: 'Digit5',
		keyLabel: '5',
		letters: 'חי',
		range: 34,
		requiredWeaponClass: 'staff',
		speed: 16
	})
});
__exports.MINIMAL_MEADOW_CAST_ACTIONS = MINIMAL_MEADOW_CAST_ACTIONS;


function cast(values) {
	return action({
		activeEnd: values.castTime,
		activeStart: values.castTime,
		label: values.displayName,
		requiredSlot: values.requiredWeaponClass ? 'hand' : null,
		serverIntent: 'player-cast',
		type: 'cast',
		windup: values.castTime,
		...values
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/combat/StaffActionCatalog.js */
__awtsmoosModule_89 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/** @file StaffActionCatalog.js @description Visible staff strikes, guard, parry, and casting records. */
var action = __awtsmoosModule_88.combatActionRecord;

const shared = { icon: '🪄', letters: 'מטה', requiredSlot: 'hand', requiredWeaponClass: 'staff', serverIntent: 'player-melee' };

const STAFF_ACTIONS = Object.freeze(Object.fromEntries([
	staff('staff-light', 'Light Staff Strike', 'KeyF', 'F', 0.18, 0.31, 0.24, 3.8, 72, 0.85, 10, 'staff-follow'),
	staff('staff-follow', 'Follow-up Staff Strike', 'KeyG', 'G', 0.16, 0.3, 0.25, 4, 82, 0.95, 11, 'staff-heavy', 'staff-light'),
	staff('staff-heavy', 'Heavy Staff Sweep', 'KeyR', 'R', 0.42, 0.66, 0.48, 4.5, 145, 1.55, 24, null, 'staff-follow', { knockback: 2.6, stagger: 2 }),
	staff('staff-shove', 'Staff Guard Break', 'KeyV', 'V', 0.25, 0.39, 0.34, 3.2, 58, 0.55, 18, null, null, { knockback: 3.4, stagger: 3, statusEffect: 'guard-break' }),
	defense('staff-block', 'Staff Block', 'KeyC', 'C', 'block', 0.08, 9, 0.2, 0),
	defense('staff-parry', 'Perfect Staff Block', 'KeyX', 'X', 'parry', 0, 0.18, 0.38, 8)
]));
__exports.STAFF_ACTIONS = STAFF_ACTIONS;


function staff(id, displayName, keyCode, keyLabel, windup, activeEnd, recovery, range, arcDegrees, multiplier, staminaCost, comboSuccessor, comboPredecessor = null, extra = {}) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, arcDegrees, baseDamageMultiplier: multiplier, comboPredecessor, comboSuccessor, displayName, id, keyCode, keyLabel, label: displayName, range, recovery, staminaCost, verticalTolerance: 2.1, windup, ...extra })];
}
function defense(id, displayName, keyCode, keyLabel, type, windup, activeEnd, recovery, staminaCost) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, displayName, id, keyCode, keyLabel, label: displayName, recovery, staminaCost, type, windup })];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/combat/SwordActionCatalog.js */
__awtsmoosModule_90 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/** @file SwordActionCatalog.js @description Visible sword combo, heavy, guard, and parry records. */
var action = __awtsmoosModule_88.combatActionRecord;

const shared = { icon: '⚔️', letters: 'חרב', requiredSlot: 'hand', requiredWeaponClass: 'sword', serverIntent: 'player-melee' };

const SWORD_ACTIONS = Object.freeze(Object.fromEntries([
	slash('sword-light', 'Light Sword Slash', 'KeyF', 'F', 0.14, 0.27, 0.2, 3.6, 78, 1, 9, 'sword-follow'),
	slash('sword-follow', 'Follow-up Slash', 'KeyG', 'G', 0.13, 0.27, 0.22, 3.7, 88, 1.08, 10, 'sword-finish', 'sword-light'),
	slash('sword-finish', 'Finishing Slash', 'KeyR', 'R', 0.24, 0.41, 0.4, 4, 104, 1.45, 18, null, 'sword-follow', { knockback: 1.8, stagger: 2 }),
	slash('sword-heavy', 'Heavy Sword Attack', 'KeyV', 'V', 0.48, 0.69, 0.5, 4.2, 70, 1.8, 26, null, null, { knockback: 2.2, stagger: 3 }),
	defense('sword-block', 'Sword Block', 'KeyC', 'C', 'block', 0.06, 9, 0.18, 0),
	defense('sword-parry', 'Perfect Sword Block', 'KeyX', 'X', 'parry', 0, 0.16, 0.34, 7)
]));
__exports.SWORD_ACTIONS = SWORD_ACTIONS;


function slash(id, displayName, keyCode, keyLabel, windup, activeEnd, recovery, range, arcDegrees, multiplier, staminaCost, comboSuccessor, comboPredecessor = null, extra = {}) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, arcDegrees, baseDamageMultiplier: multiplier, comboPredecessor, comboSuccessor, displayName, id, keyCode, keyLabel, label: displayName, range, recovery, staminaCost, verticalTolerance: 1.8, windup, ...extra })];
}
function defense(id, displayName, keyCode, keyLabel, type, windup, activeEnd, recovery, staminaCost) {
	return [id, action({ ...shared, activeEnd, activeStart: windup, displayName, id, keyCode, keyLabel, label: displayName, recovery, staminaCost, type, windup })];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCombatActions.js */
__awtsmoosModule_86 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActions.js
 * @description Composes casting, support, counter, staff, and sword action definitions.
 * The Awtsmoos gives every deed a stable name while focused catalogs preserve detail;
 * Awtsmoos.com exposes one immutable action universe to UI, runtime, authority, and diagnostics.
 */

var MINIMAL_MEADOW_CAST_ACTIONS = __awtsmoosModule_87.MINIMAL_MEADOW_CAST_ACTIONS;
var STAFF_ACTIONS = __awtsmoosModule_89.STAFF_ACTIONS;
var SWORD_ACTIONS = __awtsmoosModule_90.SWORD_ACTIONS;

const MINIMAL_MEADOW_COMBAT_ACTIONS = Object.freeze({
	...MINIMAL_MEADOW_CAST_ACTIONS,
	...STAFF_ACTIONS,
	...SWORD_ACTIONS
});
__exports.MINIMAL_MEADOW_COMBAT_ACTIONS = MINIMAL_MEADOW_COMBAT_ACTIONS;


function minimalMeadowCombatActionList() {
	return Object.values(MINIMAL_MEADOW_COMBAT_ACTIONS);
}

__exports.minimalMeadowCombatActionList = minimalMeadowCombatActionList;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowCombatBarView.js */
__awtsmoosModule_92 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBarView.js
 * @description Builds pictographic action slots, cooldowns, target control, status, and cast meter.
 * The Awtsmoos gives symbol, letter, key, and timing their proper visible vessels;
 * Awtsmoos.com makes each deed instantly recognizable while Hebrew remains spoken and accessible.
 */

var minimalMeadowCombatActionList = __awtsmoosModule_86.minimalMeadowCombatActionList;

function createMinimalMeadowCombatBarView(host) {
	const documentValue = host.ownerDocument;
	const root = element(documentValue, 'section', 'Awtsmoos-combat-host');
	const meter = createCastMeter(documentValue);
	const bar = element(documentValue, 'div', 'Awtsmoos-combat-bar');
	const buttons = new Map();
	for (const action of minimalMeadowCombatActionList()) {
		const button = createActionButton(documentValue, action);
		buttons.set(action.id, button);
		bar.append(button);
	}
	const targetButton = element(documentValue, 'button');
	targetButton.type = 'button';
	targetButton.dataset.targetCycle = 'true';
	targetButton.setAttribute('aria-label', 'Cycle combat target');
	targetButton.innerHTML = '<b aria-hidden="true">🎯</b><small>Tab</small>';
	const collapseButton = element(documentValue, 'button');
	collapseButton.type = 'button';
	collapseButton.dataset.collapse = 'true';
	collapseButton.setAttribute('aria-label', 'Collapse combat actions');
	collapseButton.textContent = '−';
	const status = element(documentValue, 'output');
	status.textContent = 'Combat loading…';
	bar.append(targetButton, status, collapseButton);
	root.append(meter.root, bar);
	host.className = 'Awtsmoos-combat-host-container';
	host.replaceChildren(root);
	return { bar, buttons, collapseButton, meter, root, status, targetButton };
}


__exports.createMinimalMeadowCombatBarView = createMinimalMeadowCombatBarView;
function updateMinimalMeadowCastView(view, payload = null) {
	const visible = Boolean(payload);
	view.meter.root.dataset.visible = String(visible);
	if (!visible) {
		view.meter.fill.style.width = '0%';
		view.meter.time.textContent = '0.00s';
		return;
	}
	const progress = clampUnit(payload.progress);
	const remaining = finiteRemaining(payload, progress);
	view.meter.label.textContent = `${payload.label || 'Casting'} · ${payload.letters || ''}`;
	view.meter.fill.style.width = `${Math.round(progress * 100)}%`;
	view.meter.time.textContent = `${remaining.toFixed(2)}s`;
}


__exports.updateMinimalMeadowCastView = updateMinimalMeadowCastView;
function updateMinimalMeadowCooldownView(view, payload = {}) {
	for (const [actionId, button] of view.buttons) {
		const remaining = Math.max(0, Number(payload.actions?.[actionId]) || 0);
		button.disabled = remaining > 0.04;
		button.dataset.cooldown = String(remaining > 0.04);
		button.querySelector('[data-cooldown-value]').textContent = remaining > 0.04
			? remaining.toFixed(1)
			: '';
	}
}


__exports.updateMinimalMeadowCooldownView = updateMinimalMeadowCooldownView;
function createActionButton(documentValue, action) {
	const button = element(documentValue, 'button');
	button.type = 'button';
	button.dataset.actionId = action.id;
	button.title = `${action.label} · ${action.letters} · ${action.castTime}s cast · ${action.cooldown}s cooldown`;
	button.setAttribute(
		'aria-label',
		`${action.label}, ${action.letters}, key ${action.keyLabel}`
	);
	button.innerHTML = [
		`<b aria-hidden="true">${action.icon}</b>`,
		`<span class="Awtsmoos-action-letters">${action.letters}</span>`,
		`<small>${action.keyLabel}</small>`,
		'<em data-cooldown-value></em>'
	].join('');
	return button;
}

function createCastMeter(documentValue) {
	const root = element(documentValue, 'section', 'Awtsmoos-cast-meter');
	root.dataset.visible = 'false';
	const header = element(documentValue, 'header');
	const label = element(documentValue, 'strong');
	const time = element(documentValue, 'small');
	header.append(label, time);
	const track = element(documentValue, 'div');
	const fill = element(documentValue, 'i');
	track.append(fill);
	root.append(header, track);
	return { fill, label, root, time };
}

function finiteRemaining(payload, progress) {
	const supplied = Number(payload.remaining);
	if (Number.isFinite(supplied)) return Math.max(0, supplied);
	const duration = Math.max(0, Number(payload.duration) || 0);
	return Math.max(0, duration * (1 - progress));
}

function clampUnit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function element(documentValue, tagName, className = '') {
	const node = documentValue.createElement(tagName);
	if (className) node.className = className;
	return node;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerDefeatCombatBarState.js */
__awtsmoosModule_91 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatCombatBarState.js
 * @description Owns combat-bar messages, cooldown presentation, and finite defeat visibility.
 * The Awtsmoos joins visible consequence with bounded recovery; Awtsmoos.com keeps input
 * orchestration separate while this vessel makes every cast, rejection, fall, and return legible.
 */

var updateMinimalMeadowCastView = __awtsmoosModule_92.updateMinimalMeadowCastView;
var updateMinimalMeadowCooldownView = __awtsmoosModule_92.updateMinimalMeadowCooldownView;

const MINIMAL_MEADOW_REJECTION_LABELS = Object.freeze({
	ALREADY_CASTING: 'Already casting',
	CAST_INTERRUPTED_RANGE: 'Cast interrupted',
	COOLDOWN: 'Action cooling down',
	PLAYER_DEFEATED: 'Defeated · controls locked',
	TARGET_LOST: 'Target lost',
	TARGET_OUT_OF_RANGE: 'Move closer',
	TARGET_REQUIRED: 'Select a demon first',
	UNKNOWN_ACTION: 'Unknown action'
});
__exports.MINIMAL_MEADOW_REJECTION_LABELS = MINIMAL_MEADOW_REJECTION_LABELS;


class MinimalMeadowPlayerDefeatCombatBarState {
	constructor(bus, view) {
		this.bus = bus;
		this.view = view;
		this.casting = null;
		this.cooldowns = {};
		this.defeated = false;
		this.unsubscribers = this.bindEvents();
	}

	bindEvents() {
		return [
			this.bus.on('world:combat-ready', () => this.status('Combat ready · choose a demon')),
			this.bus.on('combat:cast-start', payload => this.showCast(payload)),
			this.bus.on('combat:cast-progress', payload => this.showCast(payload)),
			this.bus.on('combat:cast-launch', payload => this.showLaunch(payload)),
			this.bus.on('combat:cast-cancel', payload => this.showCancel(payload)),
			this.bus.on('combat:impact', payload => this.showImpact(payload)),
			this.bus.on('combat:rejected', payload => this.showRejection(payload)),
			this.bus.on('combat:cooldowns', payload => this.showCooldowns(payload)),
			this.bus.on('player:defeated', payload => this.showDefeat(payload)),
			this.bus.on('player:recovery', () => this.status('Returning to the checkpoint…')),
			this.bus.on('player:respawned', () => this.showRespawn())
		];
	}

	showCast(payload) {
		if (this.defeated) return;
		this.casting = payload;
		updateMinimalMeadowCastView(this.view, payload);
		this.status(`Casting ${payload.label || payload.letters || 'action'}…`);
	}

	showLaunch(payload) {
		this.clearCast();
		if (!this.defeated) this.status(`${payload.letters || 'Action'} launched`);
	}

	showCancel(payload) {
		this.clearCast();
		if (!this.defeated) this.status(labelFor(payload));
	}

	showImpact(payload) {
		if (this.defeated) return;
		const health = Number.isFinite(payload.health)
			? ` · ${Math.max(0, payload.health)} HP`
			: '';
		this.status(`${payload.letters || 'Impact'} struck${health}`);
	}

	showRejection(payload) {
		const remaining = payload.cooldownRemaining
			? ` · ${Number(payload.cooldownRemaining).toFixed(1)}s`
			: '';
		this.status(`${labelFor(payload)}${remaining}`);
	}

	showCooldowns(payload) {
		this.cooldowns = { ...(payload.actions || {}) };
		if (!this.defeated) updateMinimalMeadowCooldownView(this.view, payload);
	}

	showDefeat(payload = {}) {
		this.defeated = true;
		this.clearCast();
		this.setControlsDisabled(true);
		const delay = Number(payload.delaySeconds) || 0;
		this.status(`Defeated · return in ${delay.toFixed(1)}s · press Enter to return now`);
	}

	showRespawn() {
		this.defeated = false;
		this.setControlsDisabled(false);
		updateMinimalMeadowCooldownView(this.view, { actions: this.cooldowns });
		this.status('Recovered at checkpoint · combat ready');
	}

	clearCast() {
		this.casting = null;
		updateMinimalMeadowCastView(this.view, null);
	}

	setControlsDisabled(disabled) {
		for (const button of this.view.buttons.values()) button.disabled = disabled;
		this.view.targetButton.disabled = disabled;
		this.view.root.dataset.defeated = String(disabled);
	}

	status(message) {
		this.view.status.textContent = message;
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}


__exports.MinimalMeadowPlayerDefeatCombatBarState = MinimalMeadowPlayerDefeatCombatBarState;
function labelFor(payload = {}) {
	return MINIMAL_MEADOW_REJECTION_LABELS[payload.reason]
		|| payload.reason
		|| 'Cast cancelled';
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileHudCompositionCombatInput.js */
__awtsmoosModule_93 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionCombatInput.js
 * @description Distinguishes world combat keys from text entry and defeat restoration intent.
 * The Awtsmoos gives each key a season and every season a boundary;
 * Awtsmoos.com prevents typing from becoming battle while Enter still restores the defeated player.
 */

function isCombatTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}


__exports.isCombatTextEntry = isCombatTextEntry;
function handleDefeatedCombatKey(event, bus) {
	if (event.code !== 'Enter' && event.code !== 'NumpadEnter') {
		return false;
	}
	event.preventDefault();
	bus.emit('player:respawn-request', { reason: 'combat-bar-enter' });
	return true;
}

__exports.handleDefeatedCombatKey = handleDefeatedCombatKey;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowCombatBar.js */
__awtsmoosModule_85 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBar.js
 * @description Routes defeat-aware combat intent while the Bag modal suspends all activation.
 * The Awtsmoos joins hand and key without letting intention escape its proper season;
 * Awtsmoos.com preserves the inherited defeat boundary and closes combat during Bag contemplation.
 */

var minimalMeadowCombatActionList = __awtsmoosModule_86.minimalMeadowCombatActionList;
var MinimalMeadowPlayerDefeatCombatBarState = __awtsmoosModule_91.MinimalMeadowPlayerDefeatCombatBarState;
var handleDefeatedCombatKey = __awtsmoosModule_93.handleDefeatedCombatKey;
var isCombatTextEntry = __awtsmoosModule_93.isCombatTextEntry;
var isInventoryModalOpen = __awtsmoosModule_76.isInventoryModalOpen;
var createMinimalMeadowCombatBarView = __awtsmoosModule_92.createMinimalMeadowCombatBarView;

class MinimalMeadowCombatBar {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.actions = minimalMeadowCombatActionList();
		this.view = createMinimalMeadowCombatBarView(host);
		this.presentation = new MinimalMeadowPlayerDefeatCombatBarState(bus, this.view);
		this.onClick = event => this.handleClick(event);
		this.onKeyDown = event => this.handleKeyDown(event);
		this.view.root.addEventListener('click', this.onClick);
		environment.addEventListener?.('keydown', this.onKeyDown);
	}

	handleClick(event) {
		const button = event.target.closest('button');
		if (!button) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (this.modalOpen()) {
			return;
		}
		if (this.presentation.defeated) {
			this.presentation.status('Defeated · press Enter to return now');
			return;
		}
		if (button.disabled) {
			return;
		}
		if (button.dataset.actionId) {
			this.activate(button.dataset.actionId);
			return;
		}
		if (button.dataset.targetCycle) {
			this.bus.emit('target:cycle', {});
			return;
		}
		if (button.dataset.collapse) {
			this.toggleCollapsed(button);
		}
	}

	handleKeyDown(event) {
		if (event.repeat || isCombatTextEntry(event.target) || this.modalOpen()) {
			return;
		}
		if (this.presentation.defeated) {
			handleDefeatedCombatKey(event, this.bus);
			return;
		}
		const action = this.actions.find(candidate => candidate.keyCode === event.code);
		if (action) {
			event.preventDefault();
			this.activate(action.id);
			return;
		}
		if (event.code === 'Tab') {
			event.preventDefault();
			this.bus.emit('target:cycle', {});
		}
	}

	activate(actionId) {
		if (!this.modalOpen()) {
			this.bus.emit('combat:activate', { actionId, source: 'action-bar' });
		}
	}

	toggleCollapsed(button) {
		const collapsed = this.view.bar.dataset.collapsed !== 'true';
		this.view.bar.dataset.collapsed = String(collapsed);
		button.textContent = collapsed ? '+' : '−';
	}

	modalOpen() {
		return isInventoryModalOpen(this.host.ownerDocument);
	}

	diagnostics() {
		return {
			buttons: this.view.buttons.size,
			casting: this.presentation.casting?.actionId || null,
			cooldowns: { ...this.presentation.cooldowns },
			defeated: this.presentation.defeated,
			status: this.view.status.textContent
		};
	}

	destroy() {
		this.view.root.removeEventListener('click', this.onClick);
		this.environment.removeEventListener?.('keydown', this.onKeyDown);
		this.presentation.destroy();
		this.host.replaceChildren();
	}
}

__exports.MinimalMeadowCombatBar = MinimalMeadowCombatBar;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowCombatGlyphs.js */
__awtsmoosModule_94 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatGlyphs.js
 * @description Bursts red Hebrew letters for player charges, hostile casts, trails, and impacts.
 * The Awtsmoos gives letters no independent force; Awtsmoos.com makes every fictional attack
 * visibly Hebrew, directional, layered, and short-lived while world collision remains authoritative.
 */

class MinimalMeadowCombatGlyphs {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.environment = environment;
		this.sequence = 0;
		this.unsubscribers = installListeners(this, bus);
		this.host.hidden = false;
		this.host.className = 'Awtsmoos-combat-glyph-field';
	}

	burst(text, phase, hostile = false) {
		const count = phase === 'trail' ? 4 : phase === 'impact' ? 12 : 7;
		for (let index = 0; index < count; index += 1) {
			const glyph = this.environment.document.createElement('span');
			glyph.className = 'Awtsmoos-hebrew-particle';
			glyph.dataset.hostile = String(hostile);
			glyph.dataset.phase = phase;
			glyph.textContent = lettersAt(text, index);
			glyph.style.setProperty('--glyph-x', `${signedSpread(index, count, 34)}vw`);
			glyph.style.setProperty('--glyph-y', `${signedSpread(index * 3, count, 24)}vh`);
			glyph.style.setProperty('--glyph-delay', `${index * 34}ms`);
			glyph.style.setProperty('--glyph-turn', `${signedSpread(index * 5, count, 90)}deg`);
			this.host.append(glyph);
			this.environment.setTimeout(() => glyph.remove(), phase === 'impact' ? 1200 : 950);
		}
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.replaceChildren();
	}
}


__exports.MinimalMeadowCombatGlyphs = MinimalMeadowCombatGlyphs;
function installListeners(field, bus) {
	return [
		bus.on('combat:cast-start', event => field.burst(event.letters, 'charge')),
		bus.on('combat:projectile', event => field.burst(event.letters, 'trail')),
		bus.on('combat:impact', event => field.burst(event.letters, 'impact')),
		bus.on('enemy:cast', event => field.burst(event.letters, 'charge', true)),
		bus.on('enemy:projectile', event => field.burst(event.letters, 'trail', true)),
		bus.on('enemy:impact', event => field.burst(event.letters, 'impact', true)),
		bus.on('enemy:melee', event => field.burst(event.letters, 'impact', true))
	];
}

function lettersAt(text, index) {
	const letters = [...String(text || 'אש').replace(/\s+/g, '')];
	return letters[index % Math.max(1, letters.length)] || 'א';
}

function signedSpread(index, count, maximum) {
	const normalized = count <= 1 ? 0 : index / (count - 1) * 2 - 1;
	return Math.round(normalized * maximum);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGameplayCapabilities.js */
__awtsmoosModule_96 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayCapabilities.js
 * @description Reports the shared local gameplay core and optional multiplayer augmentations.
 * The Awtsmoos gives one meadow to the solitary and the gathered; Awtsmoos.com distinguishes
 * universal movement, combat, quests, inventory, and map from peers, authority, and shared chat.
 */

function minimalMeadowGameplayCapabilities(runtime, coordinatedDiagnostics = {}) {
	const multiplayer = runtime.state?.multiplayer;
	return Object.freeze({
		core: Object.freeze({
			combat: Boolean(runtime.combat && runtime.enemies),
			inventory: Boolean(runtime.inventory?.snapshot),
			minimap: coordinatedDiagnostics.minimap?.mounted === true,
			movement: Boolean(runtime.state && runtime.cameraRig),
			quests: Boolean(
				runtime.quest?.snapshot
				|| runtime.adventures?.snapshot
			)
		}),
		multiplayer: Object.freeze({
			connected: Boolean(multiplayer),
			peers: Math.max(0, (multiplayer?.players?.length || 0) - 1),
			worldEffects: Array.isArray(multiplayer?.worldEffects)
				? multiplayer.worldEffects.length
				: 0
		})
	});
}

__exports.minimalMeadowGameplayCapabilities = minimalMeadowGameplayCapabilities;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowRegionBannerStyles.js */
__awtsmoosModule_98 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionBannerStyles.js
 * @description Styles one compact safe-area-aware location and discovery banner.
 * The Awtsmoos names the chamber without covering the journey; Awtsmoos.com lets each region
 * arrive briefly as icon, title, atmosphere, and safety while every control remains untouched.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-region-banner-styles';

function installMinimalMeadowRegionBannerStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = REGION_BANNER_CSS;
	documentValue.head.append(style);
}


__exports.installMinimalMeadowRegionBannerStyles = installMinimalMeadowRegionBannerStyles;
const REGION_BANNER_CSS = `
.Awtsmoos-region-banner {
	position: fixed;
	top: max(10px, env(safe-area-inset-top));
	left: 50%;
	z-index: 842;
	display: grid;
	grid-template-columns: 38px minmax(0, 1fr);
	gap: 8px;
	align-items: center;
	width: min(340px, calc(100vw - 116px));
	padding: 8px 12px;
	border: 1px solid rgba(241, 211, 126, .62);
	border-radius: 15px;
	background: linear-gradient(145deg, rgba(15, 30, 31, .94), rgba(4, 10, 13, .9));
	box-shadow: 0 12px 34px rgba(0, 0, 0, .38);
	color: #fff4cf;
	font: 13px/1.2 system-ui;
	pointer-events: none;
	opacity: 0;
	transform: translate(-50%, -16px);
	transition: opacity .24s ease, transform .24s ease;
}
.Awtsmoos-region-banner[data-open="true"] {
	opacity: 1;
	transform: translate(-50%, 0);
}
.Awtsmoos-region-banner > span { font-size: 28px; text-align: center; }
.Awtsmoos-region-banner strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-region-banner small { display: block; color: #b9cdc6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-region-banner[data-safe="true"] { border-color: rgba(113, 237, 161, .78); }
@media (max-width: 520px) {
	.Awtsmoos-region-banner { top: auto; bottom: calc(env(safe-area-inset-bottom) + 292px); width: min(300px, calc(100vw - 112px)); }
}
`;
__exports.REGION_BANNER_CSS = REGION_BANNER_CSS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowRegionBanner.js */
__awtsmoosModule_97 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionBanner.js
 * @description Shows brief location, discovery, atmosphere, and safety testimony on region changes.
 * The Awtsmoos lets a place announce itself without becoming a wall; Awtsmoos.com keeps one
 * pointer-transparent banner, one bounded timer, and one truthful subscription to world movement.
 */

var installMinimalMeadowRegionBannerStyles = __awtsmoosModule_98.installMinimalMeadowRegionBannerStyles;

const DISPLAY_MILLISECONDS = 2800;

class MinimalMeadowRegionBanner {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.timer = null;
		this.shown = 0;
		installMinimalMeadowRegionBannerStyles(documentValue);
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-region-banner';
		this.root.setAttribute('aria-live', 'polite');
		documentValue.body.append(this.root);
		this.unsubscribe = runtime.bus.on('world:region-changed', event => this.show(event));
		this.show(runtime.regions?.snapshot?.() || {}, true);
	}

	show(receipt = {}, immediate = false) {
		this.clearTimer();
		this.root.dataset.open = 'true';
		this.root.dataset.safe = String(receipt.safe === true);
		this.root.replaceChildren(
			textNode(this.documentValue, 'span', receipt.icon || '🌿'),
			contentNode(this.documentValue, receipt)
		);
		this.shown += 1;
		this.timer = this.environment.setTimeout?.(() => {
			this.root.dataset.open = 'false';
		}, immediate ? 1800 : DISPLAY_MILLISECONDS);
		return receipt;
	}

	clearTimer() {
		if (this.timer != null) this.environment.clearTimeout?.(this.timer);
		this.timer = null;
	}

	diagnostics() {
		return {
			open: this.root.dataset.open === 'true',
			region: this.runtime.regions?.snapshot?.() || null,
			shown: this.shown
		};
	}

	destroy() {
		this.unsubscribe?.();
		this.clearTimer();
		this.root.remove();
	}
}


__exports.MinimalMeadowRegionBanner = MinimalMeadowRegionBanner;
function contentNode(documentValue, receipt) {
	const container = documentValue.createElement('div');
	container.append(
		textNode(documentValue, 'strong', receipt.name || 'Open Meadow'),
		textNode(
			documentValue,
			'small',
			receipt.safe ? `Safe haven · ${receipt.ambient || ''}` : receipt.ambient || ''
		)
	);
	return container;
}

function textNode(documentValue, tagName, value) {
	const node = documentValue.createElement(tagName);
	node.textContent = String(value ?? '');
	return node;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowRuntimeDiagnosticsStyles.js */
__awtsmoosModule_100 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeDiagnosticsStyles.js
 * @description Styles one hidden-by-default F3 runtime truth panel for developers and testers.
 * The Awtsmoos gathers finite evidence without burdening ordinary play; Awtsmoos.com reveals
 * quality, region, combat, quest, renderer, and water only when a deliberate diagnostic key opens it.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-runtime-diagnostics-styles';

function installMinimalMeadowRuntimeDiagnosticsStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = RUNTIME_DIAGNOSTICS_CSS;
	documentValue.head.append(style);
}


__exports.installMinimalMeadowRuntimeDiagnosticsStyles = installMinimalMeadowRuntimeDiagnosticsStyles;
const RUNTIME_DIAGNOSTICS_CSS = `
.Awtsmoos-runtime-diagnostics {
	position: fixed;
	top: max(10px, env(safe-area-inset-top));
	right: max(10px, env(safe-area-inset-right));
	z-index: 995;
	width: min(390px, calc(100vw - 20px));
	max-height: calc(100dvh - 20px);
	overflow: auto;
	border: 1px solid rgba(98, 219, 255, .72);
	border-radius: 13px;
	background: rgba(2, 10, 16, .94);
	box-shadow: 0 18px 60px rgba(0, 0, 0, .62);
	color: #d9f7ff;
	font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
	pointer-events: auto;
}
.Awtsmoos-runtime-diagnostics[hidden] { display: none; }
.Awtsmoos-runtime-diagnostics header {
	position: sticky;
	top: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 9px 11px;
	border-bottom: 1px solid rgba(98, 219, 255, .28);
	background: rgba(4, 18, 27, .98);
}
.Awtsmoos-runtime-diagnostics h2 { margin: 0; color: #8fe7ff; font-size: 13px; }
.Awtsmoos-runtime-diagnostics button { border: 1px solid #477786; border-radius: 8px; background: #102b34; color: #e2fbff; }
.Awtsmoos-runtime-diagnostics pre {
	margin: 0;
	padding: 11px;
	white-space: pre-wrap;
	word-break: break-word;
}
@media (max-width: 560px) {
	.Awtsmoos-runtime-diagnostics { top: auto; bottom: max(8px, env(safe-area-inset-bottom)); max-height: 58dvh; }
}
`;
__exports.RUNTIME_DIAGNOSTICS_CSS = RUNTIME_DIAGNOSTICS_CSS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowRuntimeDiagnosticsPanel.js */
__awtsmoosModule_99 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeDiagnosticsPanel.js
 * @description Provides an F3-toggleable panel backed only by existing runtime diagnostics.
 * The Awtsmoos gathers finite evidence without adding a second simulation; Awtsmoos.com formats
 * region, quality, actors, target, quest, renderer, water, and combat truth only while deliberately open.
 */

var installMinimalMeadowRuntimeDiagnosticsStyles = __awtsmoosModule_100.installMinimalMeadowRuntimeDiagnosticsStyles;

class MinimalMeadowRuntimeDiagnosticsPanel {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.open = false;
		this.refreshes = 0;
		installMinimalMeadowRuntimeDiagnosticsStyles(documentValue);
		this.root = createPanel(documentValue);
		this.output = this.root.querySelector('pre');
		documentValue.body.append(this.root);
		this.onKeyDown = event => {
			if (event.code === 'F3') {
				event.preventDefault();
				this.toggle();
			}
		};
		this.onClick = event => {
			if (event.target.closest('[data-diagnostics-close]')) this.toggle(false);
		};
		documentValue.addEventListener('keydown', this.onKeyDown);
		this.root.addEventListener('click', this.onClick);
		this.unsubscribe = runtime.bus.on('diagnostics:toggle', event => {
			this.toggle(event?.open);
		});
	}

	toggle(force) {
		this.open = typeof force === 'boolean' ? force : !this.open;
		this.root.hidden = !this.open;
		if (this.open) this.refresh();
		return this.open;
	}

	refresh() {
		if (!this.open) return false;
		const snapshot = minimalMeadowRuntimeDiagnosticSnapshot(this.runtime);
		this.output.textContent = diagnosticText(snapshot);
		this.refreshes += 1;
		return true;
	}

	diagnostics() {
		return { open: this.open, refreshes: this.refreshes };
	}

	destroy() {
		this.unsubscribe?.();
		this.documentValue.removeEventListener('keydown', this.onKeyDown);
		this.root.removeEventListener('click', this.onClick);
		this.root.remove();
	}
}


__exports.MinimalMeadowRuntimeDiagnosticsPanel = MinimalMeadowRuntimeDiagnosticsPanel;
function minimalMeadowRuntimeDiagnosticSnapshot(runtime) {
	const enemies = runtime.enemies?.actors || [];
	const selected = runtime.enemies?.selected;
	return Object.freeze({
		combat: runtime.combatBalance?.diagnostics?.() || null,
		enemies: {
			alive: enemies.filter(actor => actor.alive).length,
			engaged: enemies.filter(actor => actor.combat?.session?.active).length,
			selected: selected?.profile?.name || null,
			total: enemies.length
		},
		quality: runtime.adaptiveQuality?.snapshot?.() || null,
		quest: runtime.quest?.snapshot?.() || null,
		region: runtime.regions?.snapshot?.() || null,
		renderer: { backend: runtime.renderer?.backend, ...(runtime.renderer?.stats || {}) },
		water: runtime.water?.diagnostics?.() || null
	});
}


__exports.minimalMeadowRuntimeDiagnosticSnapshot = minimalMeadowRuntimeDiagnosticSnapshot;
function createPanel(documentValue) {
	const root = documentValue.createElement('aside');
	root.className = 'Awtsmoos-runtime-diagnostics';
	root.hidden = true;
	root.innerHTML = '<header><h2>B\"H Runtime Diagnostics · F3</h2><button type="button" data-diagnostics-close>Close</button></header><pre></pre>';
	return root;
}

function diagnosticText(snapshot) {
	const quality = snapshot.quality || {};
	const region = snapshot.region || {};
	const quest = snapshot.quest || {};
	const renderer = snapshot.renderer || {};
	const water = snapshot.water || {};
	const combat = snapshot.combat || {};
	return [
		`Region: ${region.icon || '🌿'} ${region.name || 'Unknown'} · safe=${Boolean(region.safe)}`,
		`Frame: ${quality.averageFps || 0} FPS · ${quality.averageMilliseconds || 0} ms · ${quality.level || 'unknown'}`,
		`Enemies: ${snapshot.enemies.alive}/${snapshot.enemies.total} alive · ${snapshot.enemies.engaged} engaged · target=${snapshot.enemies.selected || 'none'}`,
		`Quest: ${quest.status || 'none'} · ${quest.progress || 0}/${quest.definition?.objective?.count || 0}`,
		`Renderer: ${renderer.backend || 'unknown'} · draws=${renderer.draws || 0} · triangles=${renderer.triangles || 0}`,
		`Water: ${water.hydrationState || 'none'} · normals=${water.normalMode || 'none'} · color=${water.colorMode || 'none'}`,
		`Threat slots: melee=${combat.activeMelee || 0} · ranged=${combat.activeRanged || 0} · blocked=${combat.blockedHits || 0}`
	].join('\n');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowThreatIndicatorStyles.js */
__awtsmoosModule_102 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowThreatIndicatorStyles.js
 * @description Styles one brief pointer-transparent enemy telegraph above the action lane.
 * The Awtsmoos reveals danger before consequence; Awtsmoos.com lets alert, windup, projectile,
 * miss, and safety appear as distinct finite signals without covering movement or combat controls.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-threat-indicator-styles';

function installMinimalMeadowThreatIndicatorStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = THREAT_INDICATOR_CSS;
	documentValue.head.append(style);
}


__exports.installMinimalMeadowThreatIndicatorStyles = installMinimalMeadowThreatIndicatorStyles;
const THREAT_INDICATOR_CSS = `
.Awtsmoos-threat-indicator {
	position: fixed;
	left: 50%;
	bottom: calc(max(10px, env(safe-area-inset-bottom)) + 230px);
	z-index: 846;
	display: grid;
	grid-template-columns: 34px minmax(0, 1fr);
	gap: 8px;
	align-items: center;
	width: min(330px, calc(100vw - 112px));
	padding: 9px 13px;
	border: 1px solid rgba(255, 112, 72, .8);
	border-radius: 15px;
	background: linear-gradient(145deg, rgba(66, 10, 9, .94), rgba(15, 3, 6, .9));
	box-shadow: 0 0 26px rgba(255, 51, 28, .38);
	color: #fff1d1;
	font: 800 13px/1.2 system-ui;
	pointer-events: none;
	opacity: 0;
	transform: translate(-50%, 14px) scale(.96);
	transition: opacity .16s ease, transform .16s ease;
}
.Awtsmoos-threat-indicator[data-open="true"] {
	opacity: 1;
	transform: translate(-50%, 0) scale(1);
}
.Awtsmoos-threat-indicator > span { font-size: 25px; text-align: center; }
.Awtsmoos-threat-indicator strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.Awtsmoos-threat-indicator small { display: block; color: #ffc1a4; font-weight: 650; }
.Awtsmoos-threat-indicator[data-level="warning"] { border-color: #ffd36a; box-shadow: 0 0 28px rgba(255, 197, 59, .42); }
.Awtsmoos-threat-indicator[data-level="safe"] { border-color: #72e7a2; background: linear-gradient(145deg, rgba(8, 57, 34, .94), rgba(3, 18, 15, .9)); box-shadow: 0 0 24px rgba(61, 221, 126, .34); }
@media (max-width: 520px) {
	.Awtsmoos-threat-indicator { bottom: calc(max(10px, env(safe-area-inset-bottom)) + 224px); }
}
`;
__exports.THREAT_INDICATOR_CSS = THREAT_INDICATOR_CSS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowThreatIndicator.js */
__awtsmoosModule_101 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowThreatIndicator.js
 * @description Converts existing enemy combat events into one brief readable warning channel.
 * The Awtsmoos reveals intention before impact and release after danger; Awtsmoos.com keeps one
 * timer, one pointer-transparent node, and no duplicate combat authority behind visible threat text.
 */

var installMinimalMeadowThreatIndicatorStyles = __awtsmoosModule_102.installMinimalMeadowThreatIndicatorStyles;

const EVENTS = Object.freeze([
	'enemy:alert',
	'enemy:cast',
	'enemy:melee',
	'enemy:projectile',
	'enemy:miss',
	'enemy:return',
	'player:damage-blocked'
]);

class MinimalMeadowThreatIndicator {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.timer = null;
		this.shown = 0;
		installMinimalMeadowThreatIndicatorStyles(documentValue);
		this.root = documentValue.createElement('aside');
		this.root.className = 'Awtsmoos-threat-indicator';
		this.root.setAttribute('aria-live', 'assertive');
		documentValue.body.append(this.root);
		this.unsubscribers = EVENTS.map(name => runtime.bus.on(name, event => {
			this.show(threatReceipt(name, event));
		}));
	}

	show(receipt) {
		if (!receipt) return false;
		this.clearTimer();
		this.root.dataset.level = receipt.level;
		this.root.dataset.open = 'true';
		this.root.innerHTML = `<span>${receipt.icon}</span><div><strong>${escapeHtml(receipt.title)}</strong><small>${escapeHtml(receipt.detail)}</small></div>`;
		this.shown += 1;
		this.timer = this.environment.setTimeout?.(() => {
			this.root.dataset.open = 'false';
		}, receipt.duration);
		return true;
	}

	clearTimer() {
		if (this.timer != null) this.environment.clearTimeout?.(this.timer);
		this.timer = null;
	}

	diagnostics() {
		return {
			events: EVENTS.length,
			open: this.root.dataset.open === 'true',
			shown: this.shown
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.clearTimer();
		this.root.remove();
	}
}


__exports.MinimalMeadowThreatIndicator = MinimalMeadowThreatIndicator;
function threatReceipt(name, event = {}) {
	const enemy = event.enemy?.name || event.name || event.enemyId || 'A shadow';
	if (name === 'enemy:alert') return receipt('⚠️', `${enemy} noticed you`, 'Watch the windup before answering.', 'warning', 1800);
	if (name === 'enemy:cast') return receipt('✨', `${enemy} is casting ${event.letters || ''}`.trim(), 'Move aside before the letters release.', 'danger', Math.max(900, Number(event.duration) * 1000 || 1700));
	if (name === 'enemy:projectile') return receipt('☄️', 'A hostile letter is moving', 'Keep moving until it passes.', 'danger', 1500);
	if (name === 'enemy:melee') return receipt('💥', `Received ${Math.round(event.damage || 0)} damage`, 'Create distance during recovery.', 'danger', 1300);
	if (name === 'enemy:miss') return receipt('💨', 'Attack avoided', 'The opening is yours.', 'safe', 1000);
	if (name === 'player:damage-blocked') return receipt('🛡️', 'Damage blocked', 'Your protection held.', 'safe', 1000);
	if (name === 'enemy:return') return receipt('🌿', `${enemy} broke pursuit`, 'You are outside the encounter.', 'safe', 1200);
	return null;
}


__exports.threatReceipt = threatReceipt;
function receipt(icon, title, detail, level, duration) {
	return Object.freeze({ detail, duration, icon, level, title });
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapControls.js */
__awtsmoosModule_104 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapControls.js
 * @description Binds compact, expanded, full-screen, and escape map transitions.
 * The Awtsmoos gives one village three measured viewpoints; Awtsmoos.com keeps click,
 * keyboard, labels, pressed state, and cleanup inside one finite control garment.
 */

function bindWorldMinimapControls(owner, documentValue) {
	const click = event => {
		if (event.target.closest('[data-map-expand]')) {
			owner.setMode(owner.mode === 'compact' ? 'expanded' : 'compact');
		}
		if (event.target.closest('[data-map-fullscreen]')) {
			owner.setMode(owner.mode === 'fullscreen' ? 'expanded' : 'fullscreen');
		}
	};
	const keydown = event => {
		if (event.key === 'Escape' && owner.mode === 'fullscreen') {
			owner.setMode('expanded');
		}
	};
	owner.root.addEventListener('click', click);
	documentValue.addEventListener('keydown', keydown);
	return {
		destroy() {
			owner.root.removeEventListener('click', click);
			documentValue.removeEventListener('keydown', keydown);
		}
	};
}


__exports.bindWorldMinimapControls = bindWorldMinimapControls;
function updateWorldMinimapControls(root, mode) {
	const expanded = mode !== 'compact';
	const fullscreen = mode === 'fullscreen';
	const expandButton = root.querySelector('[data-map-expand]');
	const fullscreenButton = root.querySelector('[data-map-fullscreen]');
	expandButton.textContent = expanded ? 'Compact' : 'Expand';
	expandButton.setAttribute('aria-expanded', String(expanded));
	fullscreenButton.textContent = fullscreen ? 'Windowed' : 'Full map';
	fullscreenButton.setAttribute('aria-pressed', String(fullscreen));
}

__exports.updateWorldMinimapControls = updateWorldMinimapControls;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapProjection.js */
__awtsmoosModule_105 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapProjection.js
 * @description Projects historical local/quest markers and optional current multiplayer peers.
 * The Awtsmoos reveals position without replacing discovery; Awtsmoos.com clamps every vessel,
 * preserves solo truth, and excludes the authoritative local identity from remote-player markers.
 */

const WORLD_MINIMAP_RADIUS = 210;
__exports.WORLD_MINIMAP_RADIUS = WORLD_MINIMAP_RADIUS;


function projectWorldMinimap(runtime) {
	const questSnapshot = runtime.adventures?.snapshot?.() || {};
	return {
		givers: (questSnapshot.available || [])
			.filter(record => record.definition?.giver?.position)
			.slice(0, 12)
			.map(record => markerRecord(
				'giver',
				record.definition.giver.position,
				record.definition.name,
				'!'
			)),
		objectives: (questSnapshot.active || []).flatMap(record => {
			const objective = record.objectives?.[record.objectiveIndex];
			return objective?.marker
				? [markerRecord('objective', objective.marker, objective.description, '◆')]
				: [];
		}),
		peers: remotePeers(runtime).map(player => markerRecord(
			'peer',
			player.position,
			player.displayName || 'Shared traveler',
			'●'
		)),
		player: markerRecord(
			'player',
			{ x: runtime.state?.x, z: runtime.state?.z },
			'You',
			'▲'
		)
	};
}


__exports.projectWorldMinimap = projectWorldMinimap;
function worldMinimapPercentage(value) {
	const percentage = (Number(value || 0) + WORLD_MINIMAP_RADIUS)
		/ (WORLD_MINIMAP_RADIUS * 2)
		* 100;
	return Math.max(2, Math.min(98, percentage));
}


__exports.worldMinimapPercentage = worldMinimapPercentage;
function markerRecord(kind, position = {}, label, icon) {
	return {
		icon,
		kind,
		label,
		left: worldMinimapPercentage(position.x),
		top: 100 - worldMinimapPercentage(position.z)
	};
}

function remotePeers(runtime) {
	const localPlayerId = runtime.state?.multiplayerLocalPlayerId;
	return (runtime.state?.multiplayer?.players || []).filter(player => {
		return player?.id
			&& player.id !== localPlayerId
			&& player.position
			&& player.connected !== false;
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapRuntime.js */
__awtsmoosModule_106 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapRuntime.js
 * @description Derives player position, peer signature, and replaceable quest-store subscription.
 * The Awtsmoos renews map evidence only when a lawful source changes; Awtsmoos.com keeps
 * runtime probing, late quest installation, peer movement, and cleanup outside the view owner.
 */

function worldMinimapPlayerPosition(runtime) {
	return {
		x: Number(runtime.state?.x || 0),
		z: Number(runtime.state?.z || 0)
	};
}


__exports.worldMinimapPlayerPosition = worldMinimapPlayerPosition;
function worldMinimapPeerSignature(runtime) {
	return JSON.stringify({
		localPlayerId: runtime.state?.multiplayerLocalPlayerId || null,
		players: (runtime.state?.multiplayer?.players || []).map(player => [
			player.id,
			player.position?.x,
			player.position?.z,
			player.connected
		])
	});
}


__exports.worldMinimapPeerSignature = worldMinimapPeerSignature;
function ensureWorldMinimapQuestSubscription(owner) {
	const source = owner.runtime.questStore || owner.runtime.adventures || null;
	if (source === owner.questSource) return false;
	owner.unsubscribeQuest();
	owner.questSource = source;
	owner.unsubscribeQuest = source?.onChange?.(() => owner.render(true)) || (() => {});
	return true;
}

__exports.ensureWorldMinimapQuestSubscription = ensureWorldMinimapQuestSubscription;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapState.js */
__awtsmoosModule_107 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapState.js
 * @description Persists compact, expanded, or full-screen village-map preference safely.
 * The Awtsmoos remembers one finite viewpoint without depending on storage; Awtsmoos.com
 * preserves legacy expansion while denied, malformed, or absent persistence cannot block play.
 */

const MODE_KEY = 'Awtsmoos.mitzvahWorld.minimap.mode.v2';
const LEGACY_KEY = 'Awtsmoos.mitzvahWorld.minimap.expanded.v1';
const WORLD_MINIMAP_MODES = Object.freeze([
	'compact',
	'expanded',
	'fullscreen'
]);
__exports.WORLD_MINIMAP_MODES = WORLD_MINIMAP_MODES;


function readWorldMinimapMode(storage) {
	try {
		const mode = storage?.getItem(MODE_KEY);
		if (WORLD_MINIMAP_MODES.includes(mode)) return mode;
		return storage?.getItem(LEGACY_KEY) === 'true' ? 'expanded' : 'compact';
	} catch {
		return 'compact';
	}
}


__exports.readWorldMinimapMode = readWorldMinimapMode;
function writeWorldMinimapMode(storage, mode) {
	const value = WORLD_MINIMAP_MODES.includes(mode) ? mode : 'compact';
	try {
		storage?.setItem(MODE_KEY, value);
		storage?.setItem(LEGACY_KEY, String(value !== 'compact'));
	} catch {
		// The current map remains usable when persistence is denied.
	}
	return value;
}


__exports.writeWorldMinimapMode = writeWorldMinimapMode;
function readWorldMinimapExpanded(storage) {
	return readWorldMinimapMode(storage) !== 'compact';
}


__exports.readWorldMinimapExpanded = readWorldMinimapExpanded;
function writeWorldMinimapExpanded(storage, expanded) {
	return writeWorldMinimapMode(storage, expanded ? 'expanded' : 'compact');
}

__exports.writeWorldMinimapExpanded = writeWorldMinimapExpanded;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapStyle.js */
__awtsmoosModule_108 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapStyle.js
 * @description Presents compact, expanded, and full-screen village maps with peer markers.
 * The Awtsmoos gives direction without covering the road; Awtsmoos.com keeps every mode,
 * keyboard focus, mobile action, giver, objective, local, and remote-player garment bounded.
 */

const STYLE_ID = 'Awtsmoos-world-minimap-style';

function installWorldMinimapStyle(documentValue = document) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-minimap{position:fixed;right:14px;bottom:14px;z-index:710;width:220px;border:1px solid #997542;border-radius:14px;background:#07100ef2;color:#fff;overflow:hidden;box-shadow:0 18px 45px #0008;backdrop-filter:blur(10px)}
		.Awtsmoos-minimap[data-mode="expanded"]{width:min(720px,92vw);height:min(620px,82vh);right:4vw;bottom:8vh;z-index:900}.Awtsmoos-minimap[data-mode="fullscreen"]{inset:3vh 3vw;width:94vw;height:94vh;z-index:1200;border-radius:18px}
		.Awtsmoos-minimap header{display:flex;align-items:center;padding:7px 9px;gap:8px}.Awtsmoos-map-actions{display:flex;gap:6px;margin-left:auto}.Awtsmoos-minimap header button{border:1px solid #a78048;border-radius:8px;background:#2c2113;color:#ffe2a5;padding:5px 8px}.Awtsmoos-map-canvas{position:relative;aspect-ratio:1;background:radial-gradient(circle at 46% 43%,#46654a,#172d24 48%,#0a1612 72%);overflow:hidden}.Awtsmoos-minimap:not([data-mode="compact"]) .Awtsmoos-map-canvas{height:calc(100% - 42px);aspect-ratio:auto}
		.Awtsmoos-map-canvas::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 44%,#7db6ba88 45% 48%,transparent 49%),radial-gradient(ellipse at 40% 53%,#537fa477 0 12%,transparent 13%)}
		.Awtsmoos-map-marker{position:absolute;transform:translate(-50%,-50%);border:0;background:transparent;color:#ffe39a;font-size:18px;filter:drop-shadow(0 2px 2px #000)}.Awtsmoos-map-marker[data-kind="objective"]{color:#ffef63}.Awtsmoos-map-marker[data-kind="peer"]{color:#d9b7ff;font-size:14px}.Awtsmoos-map-player{position:absolute;transform:translate(-50%,-50%);color:#66e4ff;font-size:18px;filter:drop-shadow(0 0 7px #55dfff)}
		.Awtsmoos-minimap button:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}@media(max-width:650px){.Awtsmoos-minimap{right:8px;bottom:80px;width:154px;opacity:.9}.Awtsmoos-minimap header{align-items:flex-start;flex-direction:column;padding:5px 7px;font-size:11px}.Awtsmoos-map-actions{margin-left:0}.Awtsmoos-minimap header button{min-height:28px;padding:4px 7px}.Awtsmoos-minimap[data-mode="expanded"]{right:3vw;bottom:6vh;width:94vw;height:78vh;opacity:1}.Awtsmoos-minimap[data-mode="fullscreen"]{inset:1vh 1vw;width:98vw;height:98vh;opacity:1}}
	`;
	documentValue.head.appendChild(style);
}

__exports.installWorldMinimapStyle = installWorldMinimapStyle;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimapView.js */
__awtsmoosModule_109 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapView.js
 * @description Creates three-mode village-map markup and bounded marker elements.
 * The Awtsmoos gives each coordinate one visible sign; Awtsmoos.com keeps labels text-safe,
 * controls keyboard-accessible, and local, quest, and peer garments semantically distinct.
 */

function createWorldMinimapRoot(documentValue, mode = 'compact') {
	const root = documentValue.createElement('section');
	root.className = 'Awtsmoos-minimap Awtsmoos-gameplay';
	root.dataset.expanded = String(mode !== 'compact');
	root.dataset.mode = mode;
	root.innerHTML = `
		<header>
			<strong>🗺️ Village Map</strong>
			<span class="Awtsmoos-map-actions">
				<button type="button" data-map-expand>Expand</button>
				<button type="button" data-map-fullscreen aria-pressed="false">Full map</button>
			</span>
		</header>
		<div class="Awtsmoos-map-canvas" data-map aria-label="Village quest map"></div>
	`;
	return root;
}


__exports.createWorldMinimapRoot = createWorldMinimapRoot;
function renderWorldMinimapMarkers(documentValue, map, projection) {
	const records = [
		projection.player,
		...projection.givers,
		...projection.objectives,
		...projection.peers
	];
	map.replaceChildren(...records.map(record => markerElement(documentValue, record)));
}


__exports.renderWorldMinimapMarkers = renderWorldMinimapMarkers;
function markerElement(documentValue, record) {
	const element = documentValue.createElement(
		record.kind === 'player' ? 'span' : 'button'
	);
	element.className = record.kind === 'player'
		? 'Awtsmoos-map-player'
		: 'Awtsmoos-map-marker';
	element.dataset.kind = record.kind;
	if (element.tagName === 'BUTTON') element.type = 'button';
	element.textContent = record.icon;
	element.title = record.label;
	element.setAttribute('aria-label', record.label);
	element.style.left = `${record.left}%`;
	element.style.top = `${record.top}%`;
	return element;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimap.js */
__awtsmoosModule_103 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimap.js
 * @description Owns compact, expanded, and full-screen quest maps for solo and shared play.
 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws only after
 * movement, unified quest change, peer change, or an explicit remembered viewpoint transition.
 */

var bindWorldMinimapControls = __awtsmoosModule_104.bindWorldMinimapControls;
var updateWorldMinimapControls = __awtsmoosModule_104.updateWorldMinimapControls;
var projectWorldMinimap = __awtsmoosModule_105.projectWorldMinimap;
var ensureWorldMinimapQuestSubscription = __awtsmoosModule_106.ensureWorldMinimapQuestSubscription;
var worldMinimapPeerSignature = __awtsmoosModule_106.worldMinimapPeerSignature;
var worldMinimapPlayerPosition = __awtsmoosModule_106.worldMinimapPlayerPosition;
var readWorldMinimapMode = __awtsmoosModule_107.readWorldMinimapMode;
var writeWorldMinimapMode = __awtsmoosModule_107.writeWorldMinimapMode;
var installWorldMinimapStyle = __awtsmoosModule_108.installWorldMinimapStyle;
var createWorldMinimapRoot = __awtsmoosModule_109.createWorldMinimapRoot;
var renderWorldMinimapMarkers = __awtsmoosModule_109.renderWorldMinimapMarkers;

const MOVEMENT_THRESHOLD = 1.5;

class WorldMinimap {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.storage = environment.localStorage;
		this.position = worldMinimapPlayerPosition(runtime);
		this.peerSignature = '';
		this.projectionSignature = '';
		this.questSource = null;
		this.unsubscribeQuest = () => {};
		this.mode = readWorldMinimapMode(this.storage);
		installWorldMinimapStyle(documentValue);
		this.root = createWorldMinimapRoot(documentValue, this.mode);
		documentValue.body.appendChild(this.root);
		this.controls = bindWorldMinimapControls(this, documentValue);
		updateWorldMinimapControls(this.root, this.mode);
		ensureWorldMinimapQuestSubscription(this);
		this.render(true);
	}

	refresh() {
		ensureWorldMinimapQuestSubscription(this);
		const position = worldMinimapPlayerPosition(this.runtime);
		const moved = Math.hypot(
			position.x - this.position.x,
			position.z - this.position.z
		) >= MOVEMENT_THRESHOLD;
		const peers = worldMinimapPeerSignature(this.runtime);
		if (!moved && peers === this.peerSignature) return false;
		this.position = position;
		this.peerSignature = peers;
		this.render();
		return true;
	}

	render(force = false) {
		const projection = projectWorldMinimap(this.runtime);
		const signature = JSON.stringify(projection);
		if (!force && signature === this.projectionSignature) return;
		this.projectionSignature = signature;
		this.peerSignature = worldMinimapPeerSignature(this.runtime);
		renderWorldMinimapMarkers(
			this.documentValue,
			this.root.querySelector('[data-map]'),
			projection
		);
		this.lastProjection = projection;
	}

	setMode(mode) {
		this.mode = writeWorldMinimapMode(this.storage, mode);
		this.root.dataset.mode = this.mode;
		this.root.dataset.expanded = String(this.mode !== 'compact');
		updateWorldMinimapControls(this.root, this.mode);
	}

	setExpanded(expanded) {
		this.setMode(expanded ? 'expanded' : 'compact');
	}

	diagnostics() {
		return {
			expanded: this.mode !== 'compact',
			fullscreen: this.mode === 'fullscreen',
			givers: this.lastProjection?.givers?.length || 0,
			mode: this.mode,
			mounted: this.root.isConnected !== false,
			objectives: this.lastProjection?.objectives?.length || 0,
			peers: this.lastProjection?.peers?.length || 0,
			position: { ...this.position }
		};
	}

	destroy() {
		this.unsubscribeQuest();
		this.controls.destroy();
		this.root.remove();
	}
}

__exports.WorldMinimap = WorldMinimap;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowCoordinatedUi.js */
__awtsmoosModule_95 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoordinatedUi.js
 * @description Mounts map, location, threat, diagnostics, and shared gameplay capability truth.
 * The Awtsmoos joins finite witnesses without enlarging the primary UI owner; Awtsmoos.com
 * keeps parity, map cadence, subscriptions, diagnostics, and destruction separate from combat HUD.
 */

var minimalMeadowGameplayCapabilities = __awtsmoosModule_96.minimalMeadowGameplayCapabilities;
var MinimalMeadowRegionBanner = __awtsmoosModule_97.MinimalMeadowRegionBanner;
var MinimalMeadowRuntimeDiagnosticsPanel = __awtsmoosModule_99.MinimalMeadowRuntimeDiagnosticsPanel;
var MinimalMeadowThreatIndicator = __awtsmoosModule_101.MinimalMeadowThreatIndicator;
var WorldMinimap = __awtsmoosModule_103.WorldMinimap;

class MinimalMeadowCoordinatedUi {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.minimap = new WorldMinimap(runtime, documentValue, environment);
		this.regionBanner = new MinimalMeadowRegionBanner(
			runtime,
			documentValue,
			environment
		);
		this.threatIndicator = new MinimalMeadowThreatIndicator(
			runtime,
			documentValue,
			environment
		);
		this.diagnosticsPanel = new MinimalMeadowRuntimeDiagnosticsPanel(
			runtime,
			documentValue,
			environment
		);
	}

	refresh() {
		this.minimap.refresh();
		return this.diagnosticsPanel.refresh();
	}

	diagnostics() {
		const minimap = this.minimap.diagnostics();
		return {
			capabilities: minimalMeadowGameplayCapabilities(this.runtime, { minimap }),
			diagnosticsPanel: this.diagnosticsPanel.diagnostics(),
			minimap,
			regionBanner: this.regionBanner.diagnostics(),
			threatIndicator: this.threatIndicator.diagnostics()
		};
	}

	destroy() {
		this.minimap.destroy();
		this.regionBanner.destroy();
		this.threatIndicator.destroy();
		this.diagnosticsPanel.destroy();
	}
}

__exports.MinimalMeadowCoordinatedUi = MinimalMeadowCoordinatedUi;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowScreenProjection.js */
__awtsmoosModule_111 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowScreenProjection.js
 * @description Projects one world point into a clamped mobile viewport without renderer allocation.
 * The Awtsmoos joins distant consequence to a finite place upon the glass; Awtsmoos.com measures
 * camera basis, field of view, aspect, safe margins, and behind-camera fallback in one small covenant.
 */

function minimalMeadowWorldToScreen(camera, canvas, point, margin = 48) {
	const rectangle = canvas?.getBoundingClientRect?.() || viewportRectangle();
	const origin = vector(camera?.position);
	const target = vector(camera?.target);
	const forward = normalize(subtract(target, origin));
	const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
	const up = normalize(cross(right, forward));
	const relative = subtract(vector(point), origin);
	const depth = dot(relative, forward);
	if (!(depth > 0.05)) return fallback(rectangle, margin);
	const tangent = Math.tan((camera?.fov || 45) * Math.PI / 360);
	const aspect = camera?.aspect || rectangle.width / Math.max(1, rectangle.height);
	const normalizedX = dot(relative, right) / (depth * tangent * aspect);
	const normalizedY = dot(relative, up) / (depth * tangent);
	return {
		inside: Math.abs(normalizedX) <= 1 && Math.abs(normalizedY) <= 1,
		x: clamp(rectangle.left + (normalizedX + 1) * 0.5 * rectangle.width, margin, rectangle.right - margin),
		y: clamp(rectangle.top + (1 - normalizedY) * 0.5 * rectangle.height, margin, rectangle.bottom - margin)
	};
}


__exports.minimalMeadowWorldToScreen = minimalMeadowWorldToScreen;
function viewportRectangle() {
	const width = globalThis.innerWidth || 360;
	const height = globalThis.innerHeight || 640;
	return { bottom: height, height, left: 0, right: width, top: 0, width };
}

function fallback(rectangle, margin) {
	return {
		inside: false,
		x: clamp(rectangle.left + rectangle.width / 2, margin, rectangle.right - margin),
		y: clamp(rectangle.top + rectangle.height * 0.38, margin, rectangle.bottom - margin)
	};
}

function vector(value) {
	if (Array.isArray(value)) return { x: value[0] || 0, y: value[1] || 0, z: value[2] || 0 };
	return { x: value?.x || 0, y: value?.y || 0, z: value?.z || 0 };
}

function subtract(first, second) {
	return { x: first.x - second.x, y: first.y - second.y, z: first.z - second.z };
}

function cross(first, second) {
	return {
		x: first.y * second.z - first.z * second.y,
		y: first.z * second.x - first.x * second.z,
		z: first.x * second.y - first.y * second.x
	};
}

function dot(first, second) {
	return first.x * second.x + first.y * second.y + first.z * second.z;
}

function normalize(value) {
	const length = Math.hypot(value.x, value.y, value.z) || 1;
	return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowDamageFeedbackStyles.js */
__awtsmoosModule_112 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDamageFeedbackStyles.js
 * @description Styles bounded world-projected damage numbers and action-name impact seals.
 * The Awtsmoos makes consequence readable without hiding the world; Awtsmoos.com lets every strike
 * rise briefly as number, letters, and defeat light while all pointer control passes through untouched.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-damage-feedback-styles';

function installMinimalMeadowDamageFeedbackStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = DAMAGE_FEEDBACK_CSS;
	documentValue.head.append(style);
}


__exports.installMinimalMeadowDamageFeedbackStyles = installMinimalMeadowDamageFeedbackStyles;
const DAMAGE_FEEDBACK_CSS = `
.Awtsmoos-damage-feedback-layer {
	position: fixed;
	inset: 0;
	z-index: 850;
	overflow: hidden;
	pointer-events: none;
}
.Awtsmoos-damage-feedback {
	position: absolute;
	left: var(--damage-x);
	top: var(--damage-y);
	display: grid;
	gap: 1px;
	min-width: 70px;
	padding: 5px 10px 7px;
	border: 1px solid rgba(255, 228, 113, .78);
	border-radius: 14px;
	background: radial-gradient(circle, rgba(80, 8, 5, .9), rgba(18, 2, 4, .72));
	box-shadow: 0 0 22px rgba(255, 65, 24, .62), inset 0 0 14px rgba(255, 220, 82, .18);
	color: #fff4c3;
	font-family: Georgia, serif;
	font-weight: 900;
	text-align: center;
	text-shadow: 0 2px 3px #000, 0 0 8px #ff2a16;
	transform: translate(-50%, -50%) scale(.72);
	animation: Awtsmoos-damage-rise 950ms cubic-bezier(.2, .8, .2, 1) forwards;
}
.Awtsmoos-damage-feedback strong {
	font-size: clamp(24px, 7vw, 44px);
	line-height: .95;
}
.Awtsmoos-damage-feedback small {
	max-width: 150px;
	overflow: hidden;
	font-size: 12px;
	letter-spacing: .04em;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.Awtsmoos-damage-feedback[data-defeated="true"] {
	border-color: #fff8a4;
	background: radial-gradient(circle, rgba(255, 162, 20, .94), rgba(53, 5, 3, .78));
	box-shadow: 0 0 34px rgba(255, 236, 112, .88);
}
@keyframes Awtsmoos-damage-rise {
	0% { opacity: 0; transform: translate(-50%, -35%) scale(.62); }
	15% { opacity: 1; transform: translate(-50%, -55%) scale(1.08); }
	70% { opacity: 1; transform: translate(-50%, -105%) scale(1); }
	100% { opacity: 0; transform: translate(-50%, -155%) scale(.9); }
}
`;
__exports.DAMAGE_FEEDBACK_CSS = DAMAGE_FEEDBACK_CSS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowDamageFeedback.js */
__awtsmoosModule_110 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDamageFeedback.js
 * @description Renders one readable damage number and action seal for every successful player hit.
 * The Awtsmoos reveals measured consequence where the shadow was struck; Awtsmoos.com keeps each
 * numeral clamped, brief, pointer-transparent, action-aware, defeat-aware, and removed after testimony.
 */

var minimalMeadowWorldToScreen = __awtsmoosModule_111.minimalMeadowWorldToScreen;
var installMinimalMeadowDamageFeedbackStyles = __awtsmoosModule_112.installMinimalMeadowDamageFeedbackStyles;

class MinimalMeadowDamageFeedback {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		installMinimalMeadowDamageFeedbackStyles(documentValue);
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-damage-feedback-layer';
		this.root.setAttribute('aria-live', 'polite');
		documentValue.body.append(this.root);
		this.active = new Set();
		this.unsubscribe = runtime.bus.on('combat:impact', receipt => this.show(receipt));
	}

	show(receipt = {}) {
		const damage = Math.max(0, Math.round(Number(receipt.damage) || 0));
		if (!damage) return null;
		const canvas = this.runtime.renderer?.domElement
			|| this.runtime.canvas
			|| this.documentValue.querySelector('canvas');
		const screen = minimalMeadowWorldToScreen(
			this.runtime.camera,
			canvas,
			receipt.position || this.runtime.camera?.target
		);
		const output = this.documentValue.createElement('output');
		output.className = 'Awtsmoos-damage-feedback';
		output.dataset.defeated = String(Boolean(receipt.defeated));
		output.style.setProperty('--damage-x', `${screen.x}px`);
		output.style.setProperty('--damage-y', `${screen.y}px`);
		const number = this.documentValue.createElement('strong');
		number.textContent = `−${damage}`;
		const action = this.documentValue.createElement('small');
		action.textContent = feedbackLabel(receipt);
		output.append(number, action);
		this.root.append(output);
		this.active.add(output);
		this.environment.setTimeout?.(() => this.remove(output), 980);
		return output;
	}

	remove(output) {
		output?.remove?.();
		this.active.delete(output);
	}

	diagnostics() {
		return {
			active: this.active.size,
			clampedWorldProjection: true,
			event: 'combat:impact',
			visibleDamageNumbers: true
		};
	}

	destroy() {
		this.unsubscribe?.();
		for (const output of this.active) output.remove();
		this.active.clear();
		this.root.remove();
	}
}


__exports.MinimalMeadowDamageFeedback = MinimalMeadowDamageFeedback;
function feedbackLabel(receipt) {
	const letters = String(receipt.letters || '').trim();
	const action = String(receipt.label || receipt.actionId || 'Strike').trim();
	return letters ? `${letters} · ${action}` : action;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileInputBoundary.js */
__awtsmoosModule_114 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileInputBoundary.js
 * @description Keeps a rail press inside its visible button without executing the action twice.
 * The Awtsmoos renews pointer and boundary in one instant; Awtsmoos.com lets the finite button
 * receive the press while canvas, joystick, targeting, and camera never inherit that same event.
 */

const POINTER_EVENTS = Object.freeze([
	'pointerdown',
	'pointerup',
	'pointercancel'
]);

class MobileInputBoundary {
	constructor(root) {
		this.root = root;
		this.containedEvents = 0;
		this.handlers = new Map();
		this.bind();
	}

	bind() {
		for (const name of POINTER_EVENTS) {
			const handler = event => this.contain(event);
			this.handlers.set(name, handler);
			this.root.addEventListener(name, handler);
		}
	}

	contain(event) {
		if (!railButtonFromTarget(this.root, event.target)) return false;
		event.stopPropagation?.();
		this.containedEvents += 1;
		return true;
	}

	diagnostics() {
		return {
			containedEvents: this.containedEvents,
			listenerCount: this.handlers.size
		};
	}

	destroy() {
		for (const [name, handler] of this.handlers) {
			this.root.removeEventListener(name, handler);
		}
		this.handlers.clear();
	}
}


__exports.MobileInputBoundary = MobileInputBoundary;
function railButtonFromTarget(root, target) {
	const button = target?.closest?.('button');
	if (!button) return null;
	if (typeof root?.contains === 'function' && !root.contains(button)) return null;
	return button;
}

__exports.railButtonFromTarget = railButtonFromTarget;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileRegressionStyles.js */
__awtsmoosModule_115 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRegressionStyles.js
 * @description Installs final safe-area, rail-target, and Bag-interaction mobile ownership.
 * The Awtsmoos surrounds every visible action without surrounding empty air; Awtsmoos.com
 * keeps top, side, and bottom insets truthful while three thumb columns remain reachable.
 */
const STYLE_ID = 'Awtsmoos-mobile-regression-style';
function installMobileRegressionStyles(documentValue = globalThis.document) {
	if (!documentValue?.head || documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = mobileCss();
	documentValue.head.appendChild(style);
}

__exports.installMobileRegressionStyles = installMobileRegressionStyles;
function mobileCss() {
	return `
		@media (max-width: 820px), (pointer: coarse) {
			.Awtsmoos-game-rail-host {
				position: fixed !important;
				top: max(72px, calc(env(safe-area-inset-top) + 8px)) !important;
				right: max(8px, env(safe-area-inset-right)) !important;
				bottom: max(8px, env(safe-area-inset-bottom)) !important;
				left: auto !important;
				z-index: 890 !important;
				width: max-content !important;
				max-height: calc(100dvh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
				transform: none !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail {
				display: grid !important;
				grid-template-columns: repeat(3, 44px) !important;
				gap: 6px !important;
				width: max-content !important;
				padding: 6px !important;
				border-radius: 14px !important;
				background: rgba(4, 24, 20, .88) !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail button {
				display: grid !important;
				place-items: center !important;
				width: 44px !important;
				height: 44px !important;
				min-width: 44px !important;
				min-height: 44px !important;
				padding: 3px !important;
				pointer-events: auto !important;
				touch-action: manipulation !important;
				user-select: none !important;
			}
			.Awtsmoos-game-rail button > * { pointer-events: none !important; }
			.Awtsmoos-game-rail [data-rail-secondary] {
				grid-column: 1 / -1 !important;
				display: grid !important;
				grid-template-columns: repeat(3, 44px) !important;
				gap: 6px !important;
				pointer-events: none !important;
			}
			.Awtsmoos-game-rail[data-collapsed="true"] > [data-mode-toggle],
			.Awtsmoos-game-rail[data-collapsed="true"] > [data-rail-collapse] { display: grid !important; }
			.Awtsmoos-game-rail[data-collapsed="true"] [data-rail-secondary],
			.Awtsmoos-game-rail [data-rail-secondary][hidden] { display: none !important; }
			.Awtsmoos-inventory-shell { pointer-events: none !important; }
			.Awtsmoos-inventory-panel[data-open="false"] { display: none !important; pointer-events: none !important; }
			.Awtsmoos-inventory-panel[data-open="true"] { display: grid !important; pointer-events: auto !important; }
			.Awtsmoos-inventory-panel .inv-body {
				overflow-y: auto !important;
				overscroll-behavior: contain;
				touch-action: pan-y;
			}
		}
	`;
}

__exports.mobileCss = mobileCss;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowGameRailView.js */
__awtsmoosModule_116 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailView.js
 * @description Renders semantic movement, collapse, and secondary menu buttons.
 * The Awtsmoos reveals each action through a measured vessel; Awtsmoos.com gives every control
 * a stable label and geometry so its visible center is also its truthful interactive center.
 */

const SECONDARY_RAIL_ITEMS = Object.freeze([
	{ eventName: 'inventory:toggle', icon: '🎒', label: 'Bag' },
	{ eventName: 'profile:toggle', icon: '🌟', label: 'Chossid' },
	{ eventName: 'map:toggle', icon: '🗺️', label: 'Map' },
	{ eventName: 'questlog:toggle', icon: '📜', label: 'Shlichus' },
	{ eventName: 'torah:toggle', icon: '📚', label: 'Sefarim' },
	{ eventName: 'controls:toggle', icon: '🎮', label: 'Controls' },
	{ eventName: 'hud:toggle', icon: '👁️', label: 'HUD' },
	{ eventName: 'menu:toggle', icon: '☰', label: 'Menu' }
]);
__exports.SECONDARY_RAIL_ITEMS = SECONDARY_RAIL_ITEMS;


function railMarkup(collapsed) {
	return `<nav class="Awtsmoos-game-rail" data-collapsed="${collapsed}" aria-label="Game menus">
		<button type="button" data-mode-toggle data-rail-action="mode" data-active="false" aria-label="Movement mode: Walk" aria-pressed="false">
			<span data-mode-icon aria-hidden="true"></span><small data-mode-label></small>
		</button>
		<button type="button" data-rail-collapse data-rail-action="collapse" aria-expanded="${!collapsed}" aria-label="Toggle secondary actions">${collapsed ? '‹' : '›'}</button>
		<span data-rail-secondary ${collapsed ? 'hidden' : ''}>${SECONDARY_RAIL_ITEMS.map(itemMarkup).join('')}</span>
	</nav>`;
}


__exports.railMarkup = railMarkup;
function itemMarkup(item) {
	return `<button type="button" data-game-event="${item.eventName}" data-rail-action="event" aria-label="${item.label}" title="${item.label}">
		<span aria-hidden="true">${item.icon}</span><small>${item.label}</small>
	</button>`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowGameRail.js */
__awtsmoosModule_113 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRail.js
 * @description Coordinates a reliable click-only menu rail and real Walk/Run presentation.
 * The Awtsmoos recreates intention exactly once; Awtsmoos.com contains pointer phases inside
 * each visible button while one native click alone emits the established game event.
 */

var MobileInputBoundary = __awtsmoosModule_114.MobileInputBoundary;
var installMobileRegressionStyles = __awtsmoosModule_115.installMobileRegressionStyles;
var railMarkup = __awtsmoosModule_116.railMarkup;
var SECONDARY_RAIL_ITEMS = __awtsmoosModule_116.SECONDARY_RAIL_ITEMS;

class MinimalMeadowGameRail {
	constructor(host, bus, options = {}) {
		this.host = host;
		this.bus = bus;
		this.collapsed = false;
		this.runMode = Boolean(options.initialRunMode);
		this.onClick = event => this.handleClick(event);
		installMobileRegressionStyles(host.ownerDocument || globalThis.document);
		this.build();
		this.unsubscribeMode = bus.on(
			'mode:changed',
			detail => this.setRunMode(detail.runMode)
		);
		this.setRunMode(this.runMode);
	}

	build() {
		this.host.className = 'Awtsmoos-game-rail-host';
		this.host.hidden = false;
		this.host.innerHTML = railMarkup(false);
		this.rail = this.host.querySelector('.Awtsmoos-game-rail');
		this.modeButton = this.host.querySelector('[data-mode-toggle]');
		this.collapseButton = this.host.querySelector('[data-rail-collapse]');
		this.secondary = this.host.querySelector('[data-rail-secondary]');
		this.inputBoundary = new MobileInputBoundary(this.host);
		this.host.addEventListener('click', this.onClick);
	}

	handleClick(event) {
		const target = event.target;
		const modeButton = target?.closest?.('[data-mode-toggle]');
		const collapseButton = target?.closest?.('[data-rail-collapse]');
		const gameButton = target?.closest?.('[data-game-event]');
		if (!modeButton && !collapseButton && !gameButton) return;
		event.stopPropagation?.();
		if (modeButton) {
			this.bus.emit('mode:toggle', { source: 'right-rail' });
			return;
		}
		if (collapseButton) {
			this.toggle();
			return;
		}
		this.bus.emit(gameButton.dataset.gameEvent, { source: 'right-rail' });
	}

	setRunMode(runMode) {
		this.runMode = Boolean(runMode);
		const view = movementModePresentation(this.runMode);
		this.modeButton.dataset.active = String(this.runMode);
		this.modeButton.setAttribute('aria-label', view.title);
		this.modeButton.setAttribute('aria-pressed', String(this.runMode));
		this.modeButton.title = view.title;
		this.modeButton.querySelector('[data-mode-icon]').textContent = view.icon;
		this.modeButton.querySelector('[data-mode-label]').textContent = view.label;
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.rail.dataset.collapsed = String(this.collapsed);
		this.secondary.hidden = this.collapsed;
		this.collapseButton.setAttribute('aria-expanded', String(!this.collapsed));
		this.collapseButton.textContent = this.collapsed ? '‹' : '›';
	}

	diagnostics() {
		return {
			collapsed: this.collapsed,
			input: this.inputBoundary.diagnostics(),
			items: SECONDARY_RAIL_ITEMS.length + 2,
			mode: this.runMode ? 'run' : 'walk',
			visible: !this.host.hidden
		};
	}

	destroy() {
		this.unsubscribeMode?.();
		this.inputBoundary.destroy();
		this.host.removeEventListener('click', this.onClick);
	}
}


__exports.MinimalMeadowGameRail = MinimalMeadowGameRail;
function shouldCollapseRail(environment) {
	const width = Number(environment?.innerWidth);
	return Number.isFinite(width) && width > 0 && width <= 820;
}


__exports.shouldCollapseRail = shouldCollapseRail;
function movementModePresentation(runMode) {
	return runMode
		? { icon: '🏃', label: 'Run', title: 'Movement mode: Run. Activate to walk.' }
		: { icon: '🚶', label: 'Walk', title: 'Movement mode: Walk. Activate to run.' };
}

__exports.movementModePresentation = movementModePresentation;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowGameRailModeRuntime.js */
__awtsmoosModule_117 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailModeRuntime.js
 * @description Bridges the visible Walk/Run button to the existing authoritative runtime mode.
 * The Awtsmoos joins label, speed, and animation without duplicate authority; Awtsmoos.com keeps
 * one established event path so every activation changes the real movement state exactly once.
 */

function gameRailOptions(runtime) {
	return {
		initialRunMode: Boolean(runtime.runToggle)
	};
}


__exports.gameRailOptions = gameRailOptions;
function installGameRailModeRuntime(runtime, bus) {
	return bus.on('mode:toggle', () => {
		runtime.runToggle = !runtime.runToggle;
		bus.emit('mode:changed', {
			runMode: runtime.runToggle
		});
	});
}

__exports.installGameRailModeRuntime = installGameRailModeRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowHouseNotice.js */
__awtsmoosModule_118 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseNotice.js
 * @description Shows brief threshold, corpse-selection, and loot receipts without HUD crowding.
 * The Awtsmoos lets finite interaction speak and become quiet; Awtsmoos.com renders one small
 * medieval notice for doors, mezuzahs, lootable bodies, and canonical inventory rewards.
 */

class MinimalMeadowHouseNotice {
	constructor(bus, documentValue, environment = globalThis) {
		this.environment = environment;
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-house-notice';
		this.root.hidden = true;
		documentValue.body.append(this.root);
		this.unsubscribers = [
			bus.on('door:state', event => this.show(`${doorIcon(event.state)} ${event.state} · ${event.houseId}`)),
			bus.on('mezuzah:touched', event => this.show(`✡ Mezuzah · ${event.houseId}`)),
			bus.on('npc:target', event => this.showCorpse(event)),
			bus.on('enemy:looted', event => this.show(`🎒 Looted ${lootText(event.items)}`))
		];
	}

	showCorpse(event = {}) {
		if (event.lootable) this.show(`☠ ${event.name} · tap again to loot`);
	}

	show(message) {
		this.root.textContent = message;
		this.root.hidden = false;
		this.environment.clearTimeout?.(this.timer);
		this.timer = this.environment.setTimeout?.(() => {
			this.root.hidden = true;
		}, 2400);
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.environment.clearTimeout?.(this.timer);
		this.root.remove();
	}
}


__exports.MinimalMeadowHouseNotice = MinimalMeadowHouseNotice;
function doorIcon(state) {
	return state === 'open' || state === 'opening' ? '🚪' : '🔒';
}

function lootText(items = []) {
	return items.map(item => `${item.quantity}× ${item.itemId}`).join(' · ');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowQuestOptionalPresentation.js */
__awtsmoosModule_121 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestOptionalPresentation.js
 * @description Renders nonblocking Shlichus excellence and completed honors across parchment and menu.
 * The Awtsmoos lets optional beauty remain visible without becoming a gate; Awtsmoos.com gives
 * courage, teaching, recovery, bonuses, and honors one shared truthful language in every quest surface.
 */

function minimalMeadowOptionalObjectivesMarkup(
	objectives = [],
	context = 'dialog'
) {
	if (!objectives.length) return '';
	return `
		<section class="Awtsmoos-optional-objectives" data-context="${escapeHtml(context)}">
			<header><strong>Optional excellence</strong><small>These never block completion.</small></header>
			${objectives.map(objectiveMarkup).join('')}
		</section>`;
}


__exports.minimalMeadowOptionalObjectivesMarkup = minimalMeadowOptionalObjectivesMarkup;
function minimalMeadowCompletionHonorsMarkup(receipt = {}) {
	const honors = receipt.honors || [];
	const bonus = receipt.optionalReward || { perutas: 0, xp: 0 };
	if (!honors.length && !bonus.perutas && !bonus.xp) return '';
	return `
		<section class="Awtsmoos-quest-honors">
			<strong>Excellence remembered</strong>
			${honors.map(value => `<span>🏅 ${escapeHtml(value)}</span>`).join('')}
			${bonus.xp ? `<span>✨ +${bonus.xp} bonus XP</span>` : ''}
			${bonus.perutas ? `<span>🪙 +${bonus.perutas} bonus perutas</span>` : ''}
		</section>`;
}


__exports.minimalMeadowCompletionHonorsMarkup = minimalMeadowCompletionHonorsMarkup;
function objectiveMarkup(objective) {
	const bonus = bonusText(objective.bonus);
	const mark = objective.complete ? '✓' : `${objective.progress}/${objective.count}`;
	return `
		<article data-complete="${objective.complete}">
			<span>${objective.complete ? '✨' : '○'}</span>
			<div><b>${escapeHtml(objective.description)}</b>${bonus ? `<small>${escapeHtml(bonus)}</small>` : ''}</div>
			<strong>${escapeHtml(mark)}</strong>
		</article>`;
}

function bonusText(bonus = {}) {
	return [
		bonus.honor ? `Honor: ${bonus.honor}` : '',
		bonus.xp ? `+${bonus.xp} XP` : '',
		bonus.perutas ? `+${bonus.perutas} perutas` : ''
	].filter(Boolean).join(' · ');
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>'"]/g, character => ESCAPES[character]);
}

const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowMenuQuestRecord.js */
__awtsmoosModule_122 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuQuestRecord.js
 * @description Normalizes the dedicated meadow Shlichus for the shared mission book.
 * The Awtsmoos lets one present purpose shine through many surfaces; Awtsmoos.com keeps
 * defeat, recovery, return, and completion aligned without swelling the menu vessel.
 */

function minimalMeadowDedicatedQuestRecord(snapshot) {
	if (!snapshot?.definition) {
		return null;
	}
	const currentObjective = snapshot.currentObjective
		|| fallbackObjective(snapshot);
	return {
		completionReceipt: snapshot.completionReceipt,
		definition: snapshot.definition,
		objectiveIndex: 0,
		objectives: [currentObjective],
		optionalObjectives: snapshot.optionalObjectives || [],
		pinned: ['active', 'ready'].includes(snapshot.status),
		source: 'dedicated-meadow-quest',
		status: snapshot.status
	};
}


__exports.minimalMeadowDedicatedQuestRecord = minimalMeadowDedicatedQuestRecord;
function fallbackObjective(snapshot) {
	const objective = snapshot.definition.objective || {};
	return {
		count: objective.count || 1,
		description: objective.description || 'Continue the current objective.',
		progress: snapshot.progress || 0
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowMenuShlichus.js */
__awtsmoosModule_120 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuShlichus.js
 * @description Prioritizes the dedicated Shlichus and renders changing objectives and reward truth.
 * The Awtsmoos joins parchment and menu beneath one present mission; Awtsmoos.com keeps
 * defeat, recovery, return, optional beauty, and completed honor in one living book.
 */

var minimalMeadowCompletionHonorsMarkup = __awtsmoosModule_121.minimalMeadowCompletionHonorsMarkup;
var minimalMeadowOptionalObjectivesMarkup = __awtsmoosModule_121.minimalMeadowOptionalObjectivesMarkup;
var minimalMeadowDedicatedQuestRecord = __awtsmoosModule_122.minimalMeadowDedicatedQuestRecord;

function minimalMeadowShlichusMenuContent(runtime) {
	const dedicated = minimalMeadowDedicatedQuestRecord(runtime.quest?.snapshot?.());
	const adventure = chooseAdventure(runtime.adventures?.snapshot?.());
	const quest = chooseCurrentQuest(dedicated, adventure);
	if (!quest) return emptyContent(runtime.adventures?.snapshot?.());
	const objective = quest.objectives?.[quest.objectiveIndex || 0] || null;
	const progress = Number(objective?.progress || 0);
	const count = Math.max(1, Number(objective?.count || 1));
	const percent = Math.round(Math.min(1, progress / count) * 100);
	const definition = quest.definition || {};
	return {
		body: [
			`<article class="Awtsmoos-current-shlichus" data-quest-id="${escapeHtml(definition.id || '')}" data-status="${escapeHtml(quest.status)}">`,
			`<p class="Awtsmoos-shlichus-status"><strong>${escapeHtml(statusLabel(quest.status))}</strong>${quest.pinned ? ' · 📌 Pinned' : ''}</p>`,
			`<h3>📜 ${escapeHtml(definition.title || definition.name || 'Current Shlichus')}</h3>`,
			`<p>${escapeHtml(definition.description || 'Continue the current mission.')}</p>`,
			objective
				? objectiveMarkup(objective, progress, count, percent)
				: '<p>All objectives are complete.</p>',
			minimalMeadowOptionalObjectivesMarkup(quest.optionalObjectives, 'menu'),
			completionMarkup(quest),
			`<small>${sourceSummary(runtime, quest)}</small>`,
			'</article>'
		].join(''),
		title: 'Shlichus'
	};
}


__exports.minimalMeadowShlichusMenuContent = minimalMeadowShlichusMenuContent;
function subscribeMinimalMeadowShlichus(runtime, refresh) {
	const unsubscribers = [
		runtime.adventures?.onChange?.(() => refresh()),
		runtime.quest?.onChange?.(() => refresh())
	].filter(value => typeof value === 'function');
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}


__exports.subscribeMinimalMeadowShlichus = subscribeMinimalMeadowShlichus;
function chooseCurrentQuest(dedicated, adventure) {
	if (dedicated && ['active', 'ready'].includes(dedicated.status)) return dedicated;
	return adventure || dedicated;
}

function chooseAdventure(snapshot = {}) {
	return snapshot.pinned?.[0]
		|| snapshot.active?.[0]
		|| snapshot.offered?.[0]
		|| snapshot.available?.[0]
		|| snapshot.completed?.[0]
		|| null;
}

function objectiveMarkup(objective, progress, count, percent) {
	return `<section><strong>${escapeHtml(objective.description || 'Current objective')}</strong><p>${progress}/${count} · ${percent}%</p><progress max="${count}" value="${progress}"></progress></section>`;
}

function completionMarkup(quest) {
	const receipt = quest.completionReceipt;
	if (!receipt) return '';
	return [
		`<div class="Awtsmoos-shlichus-receipt"><strong>Reward received</strong><p>${receipt.xp} XP · ${receipt.perutas} perutas · Level ${receipt.level}</p></div>`,
		minimalMeadowCompletionHonorsMarkup(receipt)
	].join('');
}

function sourceSummary(runtime, quest) {
	if (quest.source === 'dedicated-meadow-quest') {
		if (quest.status === 'ready') return 'Return to Reb Mendel for the promised reward.';
		if (quest.status === 'completed') return 'Completed — preserved in the Shlichus book.';
		return 'The parchment and menu share this exact changing objective.';
	}
	const snapshot = runtime.adventures?.snapshot?.() || {};
	return `${snapshot.active?.length || 0} active · ${snapshot.available?.length || 0} available · ${snapshot.completed?.length || 0} completed`;
}

function emptyContent(snapshot = {}) {
	return {
		body: `<article class="Awtsmoos-current-shlichus"><h3>📜 No current Shlichus</h3><p>Speak with a mission giver to begin.</p><small>${snapshot.active?.length || 0} active · ${snapshot.completed?.length || 0} completed</small></article>`,
		title: 'Shlichus'
	};
}

function statusLabel(status) {
	return ({
		active: 'In progress',
		available: 'Available',
		completed: 'Complete',
		offered: 'Offered',
		ready: 'Ready to return'
	})[status] || 'Available';
}

function escapeHtml(value) {
	return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowUiRepairStyles.js */
__awtsmoosModule_123 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiRepairStyles.js
 * @description Installs the final safe-viewport authority without contradicting portrait owners.
 * The Awtsmoos gives every sheet and control a measured shore; Awtsmoos.com leaves portrait
 * placement to its dedicated modules while menus, Bag, and landscape remain bounded and touchable.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-ui-repair';

function installMinimalMeadowUiRepairStyles(documentValue = globalThis.document) {
	if (!documentValue?.head || documentValue.getElementById(STYLE_ID)) return false;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = UI_REPAIR_CSS;
	documentValue.head.appendChild(style);
	documentValue.documentElement.dataset.awtsmoosHudRepair = 'safe-viewport-v3';
	return true;
}


__exports.installMinimalMeadowUiRepairStyles = installMinimalMeadowUiRepairStyles;
const UI_REPAIR_CSS = `
:root {
	--Awtsmoos-safe-top: calc(env(safe-area-inset-top) + 8px);
	--Awtsmoos-safe-right: calc(env(safe-area-inset-right) + 8px);
	--Awtsmoos-safe-bottom: calc(env(safe-area-inset-bottom) + 8px);
	--Awtsmoos-safe-left: calc(env(safe-area-inset-left) + 8px);
}
.Awtsmoos-gameplay *,
.Awtsmoos-meadow-menu *,
.Awtsmoos-inventory-panel * {
	box-sizing: border-box;
}
.Awtsmoos-sheet,
.Awtsmoos-quest-log,
.Awtsmoos-torah-library {
	max-width: calc(100vw - var(--Awtsmoos-safe-left) - var(--Awtsmoos-safe-right)) !important;
	max-height: calc(100dvh - var(--Awtsmoos-safe-top) - var(--Awtsmoos-safe-bottom)) !important;
}
.Awtsmoos-meadow-menu {
	position: fixed;
	inset: 0;
	z-index: 930;
	pointer-events: none;
}
.Awtsmoos-meadow-menu[data-open="true"] {
	background: rgba(0, 0, 0, .58);
	pointer-events: auto;
}
.Awtsmoos-meadow-menu > section {
	position: absolute;
	top: 50%;
	left: 50%;
	width: min(680px, calc(100vw - 24px));
	max-height: min(82dvh, 760px);
	overflow: auto;
	transform: translate(-50%, -50%);
}
.Awtsmoos-inventory-panel[data-open="true"] {
	max-width: none !important;
	max-height: none !important;
}
@media (max-width: 820px), (pointer: coarse) {
	.Awtsmoos-meadow-menu > section {
		inset: auto var(--Awtsmoos-safe-right) var(--Awtsmoos-safe-bottom) var(--Awtsmoos-safe-left);
		width: auto;
		max-height: min(78dvh, 720px);
		border-radius: 18px;
		transform: none;
	}
	body .Awtsmoos-cast-meter,
	body .Mitzvah-castbar {
		box-sizing: border-box !important;
		max-width: calc(100vw - 104px) !important;
	}
}
@media (orientation: landscape) and (max-height: 520px) {
	body .Awtsmoos-status-dock {
		width: clamp(180px, 25vw, 260px) !important;
		max-height: 74px !important;
	}
	body .Awtsmoos-target-frame {
		inset: var(--Awtsmoos-safe-top) var(--Awtsmoos-safe-right) auto auto !important;
		width: clamp(180px, 27vw, 310px) !important;
		max-height: 76px !important;
	}
	body .Awtsmoos-quest-tracker {
		inset: calc(var(--Awtsmoos-safe-top) + 82px) auto auto var(--Awtsmoos-safe-left) !important;
		width: clamp(210px, 31vw, 340px) !important;
		max-height: 92px !important;
	}
}
`;
__exports.UI_REPAIR_CSS = UI_REPAIR_CSS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowMenu.js */
__awtsmoosModule_119 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Renders compact live panels only when their content actually changes.
 * The Awtsmoos holds many journeys inside one quiet chamber; Awtsmoos.com keeps current controls,
 * Shlichus, Torah, profile, and map readable without repeated innerHTML churn.
 */

var minimalMeadowShlichusMenuContent = __awtsmoosModule_120.minimalMeadowShlichusMenuContent;
var subscribeMinimalMeadowShlichus = __awtsmoosModule_120.subscribeMinimalMeadowShlichus;
var installMinimalMeadowUiRepairStyles = __awtsmoosModule_123.installMinimalMeadowUiRepairStyles;

const PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map', 'menu:toggle': 'menu', 'profile:toggle': 'profile',
	'questlog:toggle': 'quests', 'torah:toggle': 'torah'
});

class MinimalMeadowMenu {
	constructor(host, bus, runtime) {
		this.host = host;
		this.bus = bus;
		this.runtime = runtime;
		this.mode = null;
		this.lastTitle = '';
		this.lastBody = '';
		this.unsubscribers = [];
		this.onClick = event => this.handleClick(event);
		this.build();
	}

	build() {
		installMinimalMeadowUiRepairStyles(this.host.ownerDocument);
		this.host.classList.add('Awtsmoos-meadow-menu');
		this.host.dataset.open = 'false';
		this.host.innerHTML = '<section><header><b data-title></b><button type="button" data-close>×</button></header><div data-body></div></section>';
		this.host.addEventListener('click', this.onClick);
		for (const [eventName, mode] of Object.entries(PANEL_EVENTS)) {
			this.unsubscribers.push(this.bus.on(eventName, () => this.toggle(mode)));
		}
		this.unsubscribers.push(subscribeMinimalMeadowShlichus(this.runtime, () => this.refresh()));
	}

	toggle(mode) {
		if (this.mode === mode && this.host.dataset.open === 'true') return this.close();
		this.mode = mode;
		this.host.dataset.open = 'true';
		this.refresh(true);
	}

	refresh(force = false) {
		if (!this.mode || this.host.dataset.open !== 'true') return false;
		const content = panelContent(this.mode, this.runtime);
		if (force || content.title !== this.lastTitle) {
			this.host.querySelector('[data-title]').textContent = content.title;
			this.lastTitle = content.title;
		}
		if (force || content.body !== this.lastBody) {
			this.host.querySelector('[data-body]').innerHTML = content.body;
			this.lastBody = content.body;
		}
		return true;
	}

	handleClick(event) {
		if (event.target === this.host || event.target.closest('[data-close]')) this.close();
		if (event.target.closest('[data-open-bag]')) {
			this.close();
			this.bus.emit('inventory:open', { source: 'menu' });
		}
	}

	close() { this.host.dataset.open = 'false'; }
	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.removeEventListener('click', this.onClick);
	}
}


__exports.MinimalMeadowMenu = MinimalMeadowMenu;
function panelContent(mode, runtime) {
	if (mode === 'quests') return minimalMeadowShlichusMenuContent(runtime);
	const state = runtime.state;
	const profiles = {
		map: ['Rolling Meadow', `<p>Left-drag orbits camera · right-drag turns camera and player · hold both mouse buttons to move.</p><p>Position: ${state.x.toFixed(1)}, ${state.z.toFixed(1)} · ground ${state.groundY.toFixed(1)}</p>`],
		menu: ['Mitzvah World', '<p>W/S move · A/D or Q/E strafe · arrows turn · right mouse steers · both mouse buttons move · Shift runs · Space jumps.</p><button type="button" data-open-bag>Open bag</button>'],
		profile: ['Your Chossid', profileMarkup(runtime)],
		torah: ['Sefarim', '<h3>📖 Daily learning</h3><p>Modeh Ani · Shema · Tehillim · Tanya.</p>']
	};
	const [title, body] = profiles[mode] || profiles.menu;
	return { body, title };
}

function profileMarkup(runtime) {
	const profile = runtime.playerStats || {};
	return `<p><strong>${profile.face || '🎩'} ${profile.name || 'Chossid'}</strong></p><p>Level ${profile.level || 1} · EXP ${profile.xp || 0}/${profile.xpMax || 100}</p><p>${runtime.state.runMode ? 'Running' : runtime.state.moving ? 'Walking' : 'Standing'} · ${runtime.state.clip || 'ready'}</p>`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowRetractable.js */
__awtsmoosModule_124 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRetractable.js
 * @description Gives status and mobile-control shells explicit retract buttons.
 * The Awtsmoos reveals and conceals finite vessels without changing their truth;
 * Awtsmoos.com keeps every persistent HUD surface voluntary and recoverable.
 */

class MinimalMeadowRetractable {
	constructor(shell, options = {}) {
		this.shell = shell;
		this.collapsed = Boolean(options.collapsed);
		this.button = shell.querySelector('[data-retract-toggle]');
		this.onClick = () => this.toggle();
		this.button?.addEventListener('click', this.onClick);
		this.render();
	}

	toggle(force = null) {
		this.collapsed = force === null ? !this.collapsed : Boolean(force);
		this.render();
	}

	render() {
		this.shell.dataset.collapsed = String(this.collapsed);
		if (this.button) {
			this.button.textContent = this.collapsed ? '＋' : '−';
			this.button.setAttribute('aria-expanded', String(!this.collapsed));
		}
	}

	destroy() {
		this.button?.removeEventListener('click', this.onClick);
	}
}

__exports.MinimalMeadowRetractable = MinimalMeadowRetractable;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileHudCompositionRegistry.js */
__awtsmoosModule_126 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionRegistry.js
 * @description Names every mobile HUD zone and labels late-created surfaces without moving them.
 * The Awtsmoos is one while finite panels receive distinct shores;
 * Awtsmoos.com lets each selector enter a truthful zone without trespassing upon another.
 */

const COMPACT_HUD_MEDIA_QUERY = '(max-width: 820px), (max-height: 520px)';
__exports.COMPACT_HUD_MEDIA_QUERY = COMPACT_HUD_MEDIA_QUERY;


const ZONES = Object.freeze([
	zone('player', '.Awtsmoos-status-dock, .Awtsmoos-status-ribbon'),
	zone('quest', '.Awtsmoos-quest-tracker'),
	zone('target', '.Awtsmoos-target-frame'),
	zone('rail', '.Awtsmoos-game-rail'),
	zone('combat', '.Mitzvah-combat-host'),
	zone('action', '.Awtsmoos-action-host, .Awtsmoos-combat-host'),
	zone('cast', '.Awtsmoos-cast-meter, .Mitzvah-castbar'),
	zone('effects', '.Mitzvah-status-effects'),
	zone('transient', '.Awtsmoos-house-notice')
]);

function mobileHudCompositionRegistry() {
	return ZONES;
}


__exports.mobileHudCompositionRegistry = mobileHudCompositionRegistry;
function applyMobileHudZones(documentValue) {
	for (const definition of ZONES) {
		for (const root of documentValue.querySelectorAll(definition.selector)) {
			root.dataset.mobileHudZone = definition.id;
		}
	}
}


__exports.applyMobileHudZones = applyMobileHudZones;
function isCompactHudViewport(environment = globalThis) {
	const media = environment.matchMedia?.(COMPACT_HUD_MEDIA_QUERY);
	if (media) {
		return media.matches;
	}
	const width = Number(environment.innerWidth) || 1024;
	const height = Number(environment.innerHeight) || 768;
	return width <= 820 || height <= 520;
}


__exports.isCompactHudViewport = isCompactHudViewport;
function zone(id, selector) {
	return Object.freeze({ id, selector });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileHudCompositionTargetState.js */
__awtsmoosModule_127 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTargetState.js
 * @description Binds existing target events and formats compact target truth without gameplay changes.
 * The Awtsmoos remains present through life, impact, defeat, corpse, and loot;
 * Awtsmoos.com keeps each finite state named while the target vessel stays small and readable.
 */

function bindTargetFrameEvents(frame) {
	return [
		frame.bus.on('npc:target', target => frame.show(target)),
		frame.bus.on('npc:clear', () => frame.clear()),
		frame.bus.on('enemy:damaged', target => frame.show(target)),
		frame.bus.on('enemy:defeated', target => frame.show(target)),
		frame.bus.on('combat:cast-start', event => frame.cast(event)),
		frame.bus.on('combat:cast-progress', event => frame.cast(event)),
		frame.bus.on('combat:cast-launch', event => frame.launch(event)),
		frame.bus.on('combat:impact', event => frame.impact(event)),
		frame.bus.on('combat:cast-cancel', event => frame.reject(event)),
		frame.bus.on('combat:rejected', event => frame.reject(event))
	];
}


__exports.bindTargetFrameEvents = bindTargetFrameEvents;
function targetHealth(target) {
	const maximum = Math.max(1, Number(target?.maxHealth) || 1);
	const current = Math.max(0, Math.min(maximum, Number(target?.health) || 0));
	return {
		current,
		maximum,
		percent: Math.round((current / maximum) * 100)
	};
}


__exports.targetHealth = targetHealth;
function targetStatus(target) {
	if (target?.looted) {
		return 'Looted corpse';
	}
	if (target?.lootable || target?.corpse || target?.alive === false) {
		return target?.selected
			? 'Corpse selected · interact again to loot'
			: 'Corpse · select to inspect loot';
	}
	return target?.state || 'Target acquired';
}


__exports.targetStatus = targetStatus;
function formatTargetReason(reason) {
	return String(reason || 'Action unavailable').replaceAll('_', ' ');
}


__exports.formatTargetReason = formatTargetReason;
function finiteHudNumber(value) {
	return Math.max(0, Number(value) || 0);
}


__exports.finiteHudNumber = finiteHudNumber;
function escapeHudText(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ESCAPES[character]);
}


__exports.escapeHudText = escapeHudText;
const ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MobileHudCompositionTargetView.js */
__awtsmoosModule_128 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTargetView.js
 * @description Renders the compact target summary and its optional detail vessel.
 * The Awtsmoos reveals identity and vitality before secondary numbers;
 * Awtsmoos.com keeps the summary readable while armor and reward wait behind one deliberate fold.
 */

var escapeHudText = __awtsmoosModule_127.escapeHudText;
var finiteHudNumber = __awtsmoosModule_127.finiteHudNumber;
var targetHealth = __awtsmoosModule_127.targetHealth;

function renderMobileTargetFrame(host, state) {
	const target = state.target;
	const health = targetHealth(target);
	const action = state.collapsed ? 'Show' : 'Hide';
	host.className = 'Awtsmoos-target-frame';
	host.dataset.collapsed = String(state.collapsed);
	host.dataset.mobileHudZone = 'target';
	host.innerHTML = [
		`<button data-target-collapse aria-label="${action} target details" aria-expanded="${!state.collapsed}">`,
		state.collapsed ? '⌄' : '⌃',
		'</button><section>',
		`<header><span>${escapeHudText(target?.face || '◎')}</span>`,
		`<b>${escapeHudText(target?.name || 'No target')}</b>`,
		`<small>Lv ${finiteHudNumber(target?.level)}</small></header>`,
		`<div class="Awtsmoos-target-health"><i style="width:${health.percent}%"></i></div>`,
		`<p class="Awtsmoos-target-status">${escapeHudText(state.status)}</p>`,
		`<footer class="Awtsmoos-target-details">${health.current}/${health.maximum} HP`,
		` · Armor ${finiteHudNumber(target?.armor)} · ${finiteHudNumber(target?.xpReward)} XP</footer>`,
		'</section>'
	].join('');
}

__exports.renderMobileTargetFrame = renderMobileTargetFrame;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowTargetFrame.js */
__awtsmoosModule_125 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTargetFrame.js
 * @description Presents a compact mobile target summary with optional bounded details.
 * The Awtsmoos reveals life, defeat, selection, and release by measured truth;
 * Awtsmoos.com keeps enemy identity and health visible without covering quest or rail.
 */

var isCompactHudViewport = __awtsmoosModule_126.isCompactHudViewport;
var bindTargetFrameEvents = __awtsmoosModule_127.bindTargetFrameEvents;
var finiteHudNumber = __awtsmoosModule_127.finiteHudNumber;
var formatTargetReason = __awtsmoosModule_127.formatTargetReason;
var targetStatus = __awtsmoosModule_127.targetStatus;
var renderMobileTargetFrame = __awtsmoosModule_128.renderMobileTargetFrame;

class MinimalMeadowTargetFrame {
	constructor(host, bus, environment = host.ownerDocument?.defaultView || globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.target = null;
		this.status = 'Select a target';
		this.collapsed = isCompactHudViewport(environment);
		this.onClick = event => this.handleClick(event);
		this.host.addEventListener('click', this.onClick);
		this.unsubscribers = bindTargetFrameEvents(this);
		this.render();
	}

	handleClick(event) {
		if (event.target.closest('[data-target-collapse]')) {
			this.toggle();
		}
	}

	show(target) {
		const changed = target?.id && target.id !== this.target?.id;
		this.target = target;
		if (changed) {
			this.collapsed = isCompactHudViewport(this.environment);
		}
		this.host.dataset.visible = 'true';
		this.status = targetStatus(target);
		this.render();
	}

	clear() {
		this.target = null;
		this.status = 'Select a target';
		this.host.dataset.visible = 'false';
		this.render();
	}

	cast(event) {
		if (event.target) {
			this.target = event.target;
		}
		const percent = Math.round((Number(event.progress) || 0) * 100);
		this.message(`Charging ${event.letters || ''} · ${percent}%`);
		this.host.dataset.visible = 'true';
	}

	launch(event) {
		this.message(`${event.letters || 'Action'} launched`, event.target);
	}

	impact(event) {
		this.message(`${event.letters || 'Impact'} · ${finiteHudNumber(event.damage)} damage`, event.target);
	}

	reject(event) {
		this.message(formatTargetReason(event?.reason));
	}

	message(text, target = null) {
		if (target) {
			this.target = target;
		}
		this.status = text;
		this.render();
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.render();
	}

	render() {
		renderMobileTargetFrame(this.host, {
			collapsed: this.collapsed,
			status: this.status,
			target: this.target
		});
	}

	diagnostics() {
		return {
			collapsed: this.collapsed,
			status: this.status,
			targetId: this.target?.id || null
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.host.removeEventListener('click', this.onClick);
	}
}

__exports.MinimalMeadowTargetFrame = MinimalMeadowTargetFrame;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/NpcHudMarkup.js */
__awtsmoosModule_130 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHudMarkup.js
 * @description Renders escaped player, friendly, hostile, level, armor, health, and XP markup.
 * The Awtsmoos reveals inward state through finite letters; Awtsmoos.com keeps every value
 * readable without mixing presentation into combat, progression, or dialogue control flow.
 */

function npcDialogueMarkup(data, questId) {
	return `
		<section>
			<header><b>${escapeHtml(data.face || '🧔')} ${escapeHtml(data.name)}</b><button data-close>×</button></header>
			<p>B"H. Read the shlichus before deciding, train nearby, or continue exploring.</p>
			<button data-quest="${escapeHtml(questId)}">✨ View Golden Shlichus</button>
			<button data-level="lava">🔥 Training Course</button>
			<button data-level="stay">Continue Exploring</button>
		</section>`;
}


__exports.npcDialogueMarkup = npcDialogueMarkup;
function npcPlayerCard(player) {
	const maximumHealth = Math.max(1, Number(player.maxHealth) || 100);
	const health = Math.max(0, Math.min(maximumHealth, Number(player.health) || 0));
	const xpMaximum = Math.max(1, Number(player.xpMax) || 200);
	const xp = Math.max(0, Math.min(xpMaximum, Number(player.xp) || 0));
	return `
		<article class="status-card player-card">
			<div class="status-face">${escapeHtml(player.face)}</div>
			<div>
				<b>${escapeHtml(player.name)}</b>
				<small>Level ${player.level} · Health ${health}/${maximumHealth} · Armor ${player.armor || 0}</small>
				<meter min="0" max="${maximumHealth}" value="${health}"></meter>
				<label>⭐ XP ${xp}/${xpMaximum}</label><progress max="${xpMaximum}" value="${xp}"></progress>
			</div><strong>${player.level}</strong>
		</article>`;
}


__exports.npcPlayerCard = npcPlayerCard;
function npcTargetCard(target) {
	const maximum = Math.max(1, Number(target.maxHealth || 100));
	const value = Math.max(0, Number(target.health ?? maximum));
	const hostile = target.faction === 'hostile';
	const level = Math.max(1, Math.trunc(Number(target.combatLevel) || 1));
	const armor = Math.max(0, Math.round(Number(target.armor) || 0));
	const detail = hostile
		? `Level ${level} · Health ${value}/${maximum} · Armor ${armor}`
		: escapeHtml(target.role || target.level || 'Village resident');
	return `
		<article class="status-card target-card">
			<div class="status-face">${escapeHtml(target.face || '🧔')}</div>
			<div><b>${escapeHtml(target.name)}</b><small>${detail}</small><meter min="0" max="${maximum}" value="${value}"></meter></div>
			<strong>${hostile ? '⚔' : '!'}</strong>
		</article>`;
}


__exports.npcTargetCard = npcTargetCard;
function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}

__exports.escapeHtml = escapeHtml;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/NpcHud.js */
__awtsmoosModule_129 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcHud.js
 * @description Coordinates event-driven player progression, target vitality, and friendly dialogue.
 * The Awtsmoos renews meeting and challenge beneath one visible truth; Awtsmoos.com updates this
 * HUD only when profile, target, damage, respawn, or dialogue events make new truth visible.
 */

var npcDialogueMarkup = __awtsmoosModule_130.npcDialogueMarkup;
var npcPlayerCard = __awtsmoosModule_130.npcPlayerCard;
var npcTargetCard = __awtsmoosModule_130.npcTargetCard;

const DEFAULT_QUEST = 'sparks-at-east-gate';

class NpcHud {
	constructor(targetHost, dialogueHost, bus) {
		this.host = targetHost || makeHost('npcTarget');
		this.dialogueHost = dialogueHost || makeHost('npcDialogue');
		this.bus = bus;
		this.player = defaultPlayer();
		this.target = null;
		this.unsubscribers = [];
		this.build();
	}

	build() {
		this.host.classList.add('Awtsmoos-status-dock');
		this.dialogueHost.classList.add('Awtsmoos-npc-dialogue');
		this.dialogueHost.dataset.open = 'false';
		this.listen('npc:target', data => this.showTarget(data));
		this.listen('npc:dialogue', data => this.showDialogue(data));
		this.listen('npc:clear', () => this.clearTarget());
		this.listen('profile:state', data => this.updatePlayer(data));
		this.listen('enemy:damaged', data => this.refreshTarget(data));
		this.listen('enemy:respawn', data => this.refreshTarget(data));
		this.listen('enemy:attack', data => this.applyEnemyDamage(data));
		this.dialogueHost.addEventListener('click', event => this.click(event));
		this.render();
	}

	listen(type, listener) {
		this.unsubscribers.push(this.bus.on(type, listener));
	}

	updatePlayer(data = {}) {
		this.player = { ...this.player, ...data };
		this.render();
	}

	applyEnemyDamage(data = {}) {
		const amount = Math.max(0, Number(data.event?.amount) || 0);
		this.updatePlayer({ health: Math.max(0, this.player.health - amount) });
	}

	showTarget(data) {
		this.target = data;
		this.render();
	}

	refreshTarget(data) {
		if (!this.target || targetIdentity(this.target) !== targetIdentity(data)) return;
		this.showTarget(data);
	}

	clearTarget() {
		this.target = null;
		this.close();
		this.render();
	}

	showDialogue(data) {
		if (data.faction === 'hostile') return;
		this.showTarget(data);
		const questId = data.questId || DEFAULT_QUEST;
		this.dialogueHost.dataset.open = 'true';
		this.dialogueHost.innerHTML = npcDialogueMarkup(data, questId);
	}

	render() {
		this.host.innerHTML = `${npcPlayerCard(this.player)}${this.target ? npcTargetCard(this.target) : ''}`;
		this.host.dataset.hasTarget = String(Boolean(this.target));
	}

	click(event) {
		const close = event.target.closest('[data-close]');
		const quest = event.target.closest('[data-quest]');
		const level = event.target.closest('[data-level]');
		if (quest) {
			this.bus.emit('quest:offer', { questId: quest.dataset.quest });
			return this.close();
		}
		if (level?.dataset.level === 'lava') {
			this.bus.emit('level:lava', { from: this.target });
			return this.close();
		}
		if (close || level?.dataset.level === 'stay') this.close();
	}

	close() { this.dialogueHost.dataset.open = 'false'; }

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}


__exports.NpcHud = NpcHud;
function defaultPlayer() {
	return { armor: 3, face: '🎩', health: 100, level: 1, maxHealth: 100, name: 'Chossid', xp: 0, xpMax: 200 };
}

function targetIdentity(target) {
	return target?.targetId || target?.id || null;
}

function makeHost(id) {
	const element = document.createElement('div');
	element.id = id;
	document.body.appendChild(element);
	return element;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAccessibilityMedia.js */
__awtsmoosModule_133 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilityMedia.js
 * @description Creates media-query observers and applies their bounded document presentation state.
 * The Awtsmoos lets motion, contrast, forced colors, and text scale answer the traveler;
 * Awtsmoos.com keeps listener ownership, CSS variables, datasets, and teardown explicit.
 */

function createMinimalMeadowAccessibilityMedia(environment) {
	const match = query => environment.matchMedia?.(query) || null;
	return {
		forcedColors: match('(forced-colors: active)'),
		highContrast: match('(prefers-contrast: more)'),
		reducedMotion: match('(prefers-reduced-motion: reduce)')
	};
}


__exports.createMinimalMeadowAccessibilityMedia = createMinimalMeadowAccessibilityMedia;
function bindMinimalMeadowAccessibilityMedia(
	media,
	listener
) {
	const unsubscribers = [];
	for (const query of Object.values(media)) {
		if (!query?.addEventListener) continue;
		query.addEventListener('change', listener);
		unsubscribers.push(() => {
			query.removeEventListener('change', listener);
		});
	}
	return unsubscribers;
}


__exports.bindMinimalMeadowAccessibilityMedia = bindMinimalMeadowAccessibilityMedia;
function applyMinimalMeadowAccessibilityDocument(
	documentValue,
	snapshot
) {
	const root = documentValue.documentElement;
	root.style.setProperty(
		'--awtsmoos-text-scale',
		String(snapshot.textScale)
	);
	root.dataset.awtsmoosForcedColors = String(snapshot.forcedColors);
	root.dataset.awtsmoosHighContrast = String(snapshot.highContrast);
	root.dataset.awtsmoosReducedMotion = String(snapshot.reducedMotion);
}

__exports.applyMinimalMeadowAccessibilityDocument = applyMinimalMeadowAccessibilityDocument;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAccessibilitySettings.js */
__awtsmoosModule_134 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilitySettings.js
 * @description Restores, normalizes, and composes user timing mercy with equipped reward tradeoffs.
 * The Awtsmoos lets accessibility and earned equipment meet without erasing either voice;
 * Awtsmoos.com bounds text, flash, shake, timing, and movement while authority remains unchanged.
 */

function restoreMinimalMeadowAccessibilitySettings(storage, key) {
	try {
		return normalizeMinimalMeadowAccessibilitySettings(
			JSON.parse(storage?.getItem?.(key) || '{}')
		);
	} catch {
		return normalizeMinimalMeadowAccessibilitySettings({});
	}
}


__exports.restoreMinimalMeadowAccessibilitySettings = restoreMinimalMeadowAccessibilitySettings;
function normalizeMinimalMeadowAccessibilitySettings(value = {}) {
	return {
		cameraShakeMultiplier: bounded(
			value.cameraShakeMultiplier,
			0,
			1,
			1
		),
		flashMultiplier: bounded(value.flashMultiplier, 0, 1, 1),
		textScale: bounded(value.textScale, 1, 2, 1),
		timingWindowMultiplier: bounded(
			value.timingWindowMultiplier,
			1,
			1.75,
			1
		)
	};
}


__exports.normalizeMinimalMeadowAccessibilitySettings = normalizeMinimalMeadowAccessibilitySettings;
function effectiveMinimalMeadowTimingMultiplier(
	userMultiplier,
	rewardMultiplier
) {
	return bounded(
		Number(userMultiplier || 1) * Number(rewardMultiplier || 1),
		1,
		1.75,
		1
	);
}


__exports.effectiveMinimalMeadowTimingMultiplier = effectiveMinimalMeadowTimingMultiplier;
function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAccessibilityRuntime.js */
__awtsmoosModule_132 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAccessibilityRuntime.js
 * @description Owns persisted accessibility settings while focused media helpers observe presentation.
 * The Awtsmoos reveals gameplay through many channels so no single sense becomes a gate;
 * Awtsmoos.com composes motion, contrast, text, flash, shake, timing, persistence, and authority safely.
 */

var applyMinimalMeadowAccessibilityDocument = __awtsmoosModule_133.applyMinimalMeadowAccessibilityDocument;
var bindMinimalMeadowAccessibilityMedia = __awtsmoosModule_133.bindMinimalMeadowAccessibilityMedia;
var createMinimalMeadowAccessibilityMedia = __awtsmoosModule_133.createMinimalMeadowAccessibilityMedia;
var effectiveMinimalMeadowTimingMultiplier = __awtsmoosModule_134.effectiveMinimalMeadowTimingMultiplier;
var normalizeMinimalMeadowAccessibilitySettings = __awtsmoosModule_134.normalizeMinimalMeadowAccessibilitySettings;
var restoreMinimalMeadowAccessibilitySettings = __awtsmoosModule_134.restoreMinimalMeadowAccessibilitySettings;

const STORAGE_KEY = 'awtsmoos.mitzvah-world.accessibility.v1';

class MinimalMeadowAccessibilityRuntime {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.media = createMinimalMeadowAccessibilityMedia(environment);
		this.settings = restoreMinimalMeadowAccessibilitySettings(
			environment.localStorage,
			STORAGE_KEY
		);
		this.unsubscribers = [
			runtime.bus.on('accessibility:set', patch => this.set(patch))
		];
		this.mediaListeners = bindMinimalMeadowAccessibilityMedia(
			this.media,
			() => this.apply()
		);
		this.apply();
	}

	set(patch = {}) {
		this.settings = normalizeMinimalMeadowAccessibilitySettings({
			...this.settings,
			...patch
		});
		this.save();
		this.apply();
		return this.snapshot();
	}

	apply() {
		const snapshot = this.snapshot();
		this.runtime.accessibility = {
			...(this.runtime.accessibility || {}),
			...snapshot
		};
		applyMinimalMeadowAccessibilityDocument(
			this.documentValue,
			snapshot
		);
		this.runtime.bus.emit('accessibility:changed', snapshot);
	}

	snapshot() {
		const rewardMultiplier = Number(
			this.runtime.accessibility?.rewardTimingWindowMultiplier || 1
		);
		return Object.freeze({
			cameraShakeMultiplier: this.settings.cameraShakeMultiplier,
			flashMultiplier: this.settings.flashMultiplier,
			forcedColors: Boolean(this.media.forcedColors?.matches),
			highContrast: Boolean(this.media.highContrast?.matches),
			reducedMotion: Boolean(this.media.reducedMotion?.matches),
			rewardTimingWindowMultiplier: rewardMultiplier,
			textScale: this.settings.textScale,
			timingWindowMultiplier: effectiveMinimalMeadowTimingMultiplier(
				this.settings.timingWindowMultiplier,
				rewardMultiplier
			),
			userTimingWindowMultiplier: this.settings.timingWindowMultiplier
		});
	}

	save() {
		try {
			this.environment.localStorage?.setItem?.(
				STORAGE_KEY,
				JSON.stringify(this.settings)
			);
		} catch {}
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		for (const unsubscribe of this.mediaListeners) unsubscribe();
		this.unsubscribers = [];
		this.mediaListeners = [];
	}
}

__exports.MinimalMeadowAccessibilityRuntime = MinimalMeadowAccessibilityRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAudioCueCatalog.js */
__awtsmoosModule_136 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioCueCatalog.js
 * @description Defines bounded synthetic gameplay cues and textual alternatives without asset hydration.
 * The Awtsmoos lets force, resistance, healing, defeat, and return receive distinct measured tones;
 * Awtsmoos.com keeps audio optional while subtitles and visual channels preserve every needed truth.
 */

const CUES = Object.freeze({
	'boss:phase': cue(196, 0.16, 'Boss phase changed.'),
	'combat:cast-cancel': cue(155, 0.11, 'Cast cancelled.'),
	'combat:cast-complete': cue(523, 0.12, 'Cast completed.'),
	'combat:cleanse': cue(659, 0.13, 'Cleanse completed.'),
	'combat:impact': cue(220, 0.07, 'Hit landed.'),
	'combat:posture': cue(174, 0.1, 'Posture changed.'),
	'combat:reaction': cue(440, 0.11, 'Combat reaction formed.'),
	'enemy:cast-interrupted': cue(784, 0.09, 'Enemy cast interrupted.'),
	'player:defeated': cue(110, 0.22, 'Player defeated.'),
	'combat:recovery-complete': cue(392, 0.18, 'Recovery completed.'),
	'reward:granted': cue(698, 0.16, 'Reward granted once.'),
	'status:apply': cue(330, 0.08, 'Status applied.')
});

function minimalMeadowAudioCue(eventName) {
	return CUES[eventName] || null;
}


__exports.minimalMeadowAudioCue = minimalMeadowAudioCue;
function minimalMeadowAudioEvents() {
	return Object.keys(CUES);
}


__exports.minimalMeadowAudioEvents = minimalMeadowAudioEvents;
function cue(frequency, durationSeconds, subtitle) {
	return Object.freeze({
		durationSeconds,
		frequency,
		subtitle
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAudioPlayback.js */
__awtsmoosModule_137 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioPlayback.js
 * @description Creates, resumes, plays, reclaims, and closes bounded synthetic gameplay voices.
 * The Awtsmoos lets sound accompany truth without becoming an endless overlapping sea;
 * Awtsmoos.com keeps context, gain, oscillator, duration, voice ownership, and cleanup explicit.
 */

function ensureMinimalMeadowAudioContext(runtime) {
	if (runtime.context) {
		if (runtime.context.state === 'suspended') {
			runtime.context.resume?.().catch?.(() => {});
		}
		return runtime.context;
	}
	const Constructor = runtime.environment.AudioContext
		|| runtime.environment.webkitAudioContext;
	if (!Constructor) return null;
	runtime.context = new Constructor();
	runtime.context.resume?.().catch?.(() => {});
	return runtime.context;
}


__exports.ensureMinimalMeadowAudioContext = ensureMinimalMeadowAudioContext;
function playMinimalMeadowAudioTone(runtime, cue) {
	const context = ensureMinimalMeadowAudioContext(runtime);
	if (!context || context.state !== 'running') return false;
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const start = context.currentTime;
	const end = start + cue.durationSeconds;
	oscillator.frequency.setValueAtTime(cue.frequency, start);
	oscillator.type = 'sine';
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(0.08, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, end);
	oscillator.connect(gain);
	gain.connect(context.destination);
	runtime.active.add(oscillator);
	oscillator.addEventListener('ended', () => {
		runtime.active.delete(oscillator);
		oscillator.disconnect();
		gain.disconnect();
	}, { once: true });
	oscillator.start(start);
	oscillator.stop(end + 0.01);
	return true;
}


__exports.playMinimalMeadowAudioTone = playMinimalMeadowAudioTone;
function closeMinimalMeadowAudioPlayback(runtime) {
	for (const oscillator of runtime.active) {
		try {
			oscillator.stop();
		} catch {}
	}
	runtime.active.clear();
	runtime.context?.close?.().catch?.(() => {});
	runtime.context = null;
}

__exports.closeMinimalMeadowAudioPlayback = closeMinimalMeadowAudioPlayback;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAudioRuntime.js */
__awtsmoosModule_135 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioRuntime.js
 * @description Coordinates optional bounded combat tones and mandatory textual subtitle alternatives.
 * The Awtsmoos lets sound accompany truth without becoming the only doorway to it;
 * Awtsmoos.com unlocks on consent, caps overlap, honors mute, emits text, and delegates node cleanup.
 */

var minimalMeadowAudioCue = __awtsmoosModule_136.minimalMeadowAudioCue;
var minimalMeadowAudioEvents = __awtsmoosModule_136.minimalMeadowAudioEvents;
var closeMinimalMeadowAudioPlayback = __awtsmoosModule_137.closeMinimalMeadowAudioPlayback;
var ensureMinimalMeadowAudioContext = __awtsmoosModule_137.ensureMinimalMeadowAudioContext;
var playMinimalMeadowAudioTone = __awtsmoosModule_137.playMinimalMeadowAudioTone;

const ACTIVE_LIMIT = 5;

class MinimalMeadowAudioRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.context = null;
		this.active = new Set();
		this.muted = false;
		this.unsubscribers = minimalMeadowAudioEvents().map(eventName => {
			return runtime.bus.on(eventName, detail => {
				this.cue(eventName, detail);
			});
		});
		this.unsubscribers.push(
			runtime.bus.on('audio:mute', muted => {
				this.muted = Boolean(muted);
			})
		);
		this.unlock = () => ensureMinimalMeadowAudioContext(this);
		environment.addEventListener?.('pointerdown', this.unlock, {
			once: true,
			passive: true
		});
		environment.addEventListener?.('keydown', this.unlock, {
			once: true
		});
	}

	cue(eventName, detail = {}) {
		const cue = minimalMeadowAudioCue(eventName);
		if (!cue) return null;
		this.runtime.bus.emit('audio:subtitle', {
			eventName,
			subtitle: detail.subtitle || cue.subtitle
		});
		if (!this.muted && this.active.size < ACTIVE_LIMIT) {
			playMinimalMeadowAudioTone(this, cue);
		}
		return cue;
	}

	diagnostics() {
		return {
			activeVoices: this.active.size,
			contextState: this.context?.state || 'unavailable',
			muted: this.muted,
			voiceLimit: ACTIVE_LIMIT
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		closeMinimalMeadowAudioPlayback(this);
		this.environment.removeEventListener?.(
			'pointerdown',
			this.unlock
		);
		this.environment.removeEventListener?.('keydown', this.unlock);
	}
}

__exports.MinimalMeadowAudioRuntime = MinimalMeadowAudioRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHudState.js */
__awtsmoosModule_139 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudState.js
 * @description Owns accessible state for intention, posture, knowledge, boss, quest, subtitles, and feedback.
 * The Awtsmoos renews every combat sign while the HUD remembers only bounded public truth;
 * Awtsmoos.com keeps labels, meters, patterns, authority, reward, recovery, and audio alternatives concise.
 */

function createMinimalMeadowVerticalSliceHudState() {
	return {
		boss: null,
		daas: null,
		feedback: 'Observe shape, label, border, position, and timing.',
		feedbackState: 'ready',
		kavanah: null,
		posture: null,
		quest: null
	};
}


__exports.createMinimalMeadowVerticalSliceHudState = createMinimalMeadowVerticalSliceHudState;
function reduceMinimalMeadowVerticalSliceHud(
	state,
	eventName,
	detail = {}
) {
	if (eventName.startsWith('combat:kavanah')) {
		state.kavanah = normalizeKavanah(eventName, detail);
	}
	if (eventName === 'combat:posture') {
		state.posture = normalizePosture(detail);
	}
	if (eventName === 'daas:learned') state.daas = detail;
	if (eventName === 'boss:phase') state.boss = detail;
	if (eventName.startsWith('teaching-quest:')) state.quest = detail;
	const feedback = feedbackFor(eventName, detail);
	if (feedback) Object.assign(state, feedback);
	return state;
}


__exports.reduceMinimalMeadowVerticalSliceHud = reduceMinimalMeadowVerticalSliceHud;
function normalizeKavanah(eventName, detail) {
	const value = detail.kavanah || detail;
	if (eventName.includes('cancel')) return null;
	return {
		actionId: value.actionId || null,
		active: eventName.includes('start') || Boolean(value.active),
		aligned: Boolean(value.aligned || value.evaluation?.aligned),
		progress: kavanahProgress(value),
		stability: Number(value.stability ?? value.evaluation?.stability ?? 1),
		tier: value.tier || value.evaluation?.tier || 'preparing'
	};
}

function normalizePosture(detail) {
	const maximum = Math.max(1, Number(detail.maximum || 100));
	return {
		broken: Boolean(detail.broken || detail.reason === 'broken'),
		maximum,
		reason: detail.reason || 'stable',
		value: Math.max(
			0,
			Math.min(maximum, Number(detail.value ?? maximum))
		)
	};
}

function kavanahProgress(value) {
	const elapsed = Number(value.elapsedMilliseconds || 0);
	const duration = Number(value.durationMilliseconds || 1000);
	return Math.max(0, Math.min(1, elapsed / Math.max(1, duration)));
}

function feedbackFor(eventName, detail) {
	if (eventName === 'audio:subtitle') {
		return {
			feedback: detail.subtitle || 'Gameplay audio cue.',
			feedbackState: 'subtitle'
		};
	}
	const map = {
		'boss:defeated': ['Kedem Warden defeated. Reward claim checked exactly once.', 'success'],
		'combat:cleanse': ['Stabilizing cleanse removed one bounded harmful state.', 'success'],
		'combat:kavanah-authority-failed': [`Kavanah authority failed: ${detail.error || 'unknown error'}`, 'danger'],
		'combat:reaction': [detail.text || `Reaction: ${detail.id}`, 'success'],
		'combat:support-authority-failed': [`Support authority failed: ${detail.error || 'unknown error'}`, 'danger'],
		'enemy:cast-interrupted': ['Hostile cast interrupted.', 'success'],
		'reward:granted': ['Vessel of Measured Intent granted once.', 'success'],
		'teaching-quest:completed': ['Teaching quest complete.', 'success']
	};
	const found = map[eventName];
	return found
		? { feedback: found[0], feedbackState: found[1] }
		: null;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHudStyles.js */
__awtsmoosModule_140 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudStyles.js
 * @description Installs compact accessible styling for intention, posture, knowledge, boss, and feedback.
 * The Awtsmoos reveals one living grammar through word, pattern, meter, border, and position;
 * Awtsmoos.com keeps color optional, motion bounded, text scalable, and mobile controls unobscured.
 */

const STYLE_ID = 'Awtsmoos-vertical-slice-hud-style';

function installMinimalMeadowVerticalSliceHudStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = hudCss();
	documentValue.head.appendChild(style);
}


__exports.installMinimalMeadowVerticalSliceHudStyles = installMinimalMeadowVerticalSliceHudStyles;
function hudCss() {
	return `
		.Awtsmoos-vertical-slice-hud {
			position: fixed;
			left: 14px;
			top: 72px;
			z-index: 735;
			display: grid;
			gap: 7px;
			width: min(330px, calc(100vw - 28px));
			font-size: calc(12px * var(--awtsmoos-text-scale, 1));
			pointer-events: none;
		}
		.Awtsmoos-vertical-card {
			padding: 8px 10px;
			border: 2px solid rgba(245, 213, 139, .62);
			border-left-style: double;
			border-radius: 12px;
			background: rgba(5, 14, 12, .91);
			color: #fff8e7;
			box-shadow: 0 8px 26px rgba(0, 0, 0, .34);
		}
		.Awtsmoos-vertical-card[hidden] { display: none; }
		.Awtsmoos-vertical-card header {
			display: flex;
			justify-content: space-between;
			gap: 8px;
			font-weight: 900;
		}
		.Awtsmoos-vertical-card p {
			margin: 4px 0 0;
			line-height: 1.35;
		}
		.Awtsmoos-vertical-card progress {
			width: 100%;
			height: 9px;
			accent-color: #f2c66f;
		}
		.Awtsmoos-vertical-card[data-state="broken"],
		.Awtsmoos-vertical-card[data-state="danger"] {
			border-style: dashed;
		}
		.Awtsmoos-vertical-card[data-state="aligned"] {
			border-style: double;
		}
		.Awtsmoos-vertical-feedback {
			border-left-width: 6px;
		}
		@media (max-width: 720px) {
			.Awtsmoos-vertical-slice-hud {
				left: 8px;
				top: max(56px, env(safe-area-inset-top));
				width: min(285px, calc(100vw - 16px));
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-vertical-slice-hud * {
				animation: none !important;
				transition: none !important;
			}
		}
		@media (forced-colors: active) {
			.Awtsmoos-vertical-card {
				border-color: CanvasText;
				background: Canvas;
				color: CanvasText;
				forced-color-adjust: auto;
			}
			.Awtsmoos-vertical-card progress { accent-color: Highlight; }
		}
		@media (prefers-contrast: more) {
			.Awtsmoos-vertical-card {
				border-width: 3px;
				background: #000;
				color: #fff;
			}
		}
	`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHudCard.js */
__awtsmoosModule_142 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudCard.js
 * @description Creates one accessible HUD card with label, value, meter, text, and optional live speech.
 * The Awtsmoos gives every public combat sign a bounded visible vessel;
 * Awtsmoos.com keeps semantic structure, progress, narration, and ownership consistent.
 */

function createMinimalMeadowVerticalSliceHudCard(
	documentValue,
	label,
	live = false
) {
	const root = documentValue.createElement('article');
	root.className = 'Awtsmoos-vertical-card';
	if (live) root.setAttribute('aria-live', 'polite');
	const header = documentValue.createElement('header');
	const title = documentValue.createElement('span');
	const value = documentValue.createElement('span');
	const progress = documentValue.createElement('progress');
	const text = documentValue.createElement('p');
	title.textContent = label;
	progress.max = 1;
	progress.value = 0;
	header.append(title, value);
	root.append(header, progress, text);
	return {
		progress,
		root,
		text,
		value
	};
}

__exports.createMinimalMeadowVerticalSliceHudCard = createMinimalMeadowVerticalSliceHudCard;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHudRender.js */
__awtsmoosModule_143 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudRender.js
 * @description Renders intention, posture, Daas, boss, quest, and textual feedback into accessible cards.
 * The Awtsmoos gives public combat truth many channels without making color sovereign;
 * Awtsmoos.com keeps meter, text, label, pattern, state, and live speech aligned.
 */

function renderMinimalMeadowVerticalSliceHud(cards, state) {
	renderKavanah(cards.kavanah, state.kavanah);
	renderPosture(cards.posture, state.posture);
	renderDaas(cards.daas, state.daas);
	renderBoss(cards.boss, state.boss);
	renderQuest(cards.quest, state.quest);
	renderFeedback(cards.feedback, state);
}


__exports.renderMinimalMeadowVerticalSliceHud = renderMinimalMeadowVerticalSliceHud;
function renderKavanah(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.tier;
	card.progress.value = value.progress;
	card.root.dataset.state = value.aligned ? 'aligned' : 'preparing';
	card.text.textContent = `Stability ${percent(value.stability)}. Release by pressing the same action again.`;
}

function renderPosture(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.broken ? 'BROKEN' : value.reason;
	card.progress.value = value.value / value.maximum;
	card.root.dataset.state = value.broken ? 'broken' : 'stable';
	card.text.textContent = `${Math.round(value.value)} of ${Math.round(value.maximum)} composure.`;
}

function renderDaas(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.level || 'observed';
	card.progress.value = Math.min(1, Number(value.points || 0) / 6);
	card.text.textContent = value.counterGuidance
		|| `${value.actionId || 'Enemy action'} learned through ${value.lastReason || 'observation'}.`;
}

function renderBoss(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.label || `Phase ${value.phase || 1}`;
	card.progress.value = Number(value.healthRatio ?? 1);
	card.root.dataset.state = value.concealed ? 'danger' : 'active';
	card.text.textContent = value.text
		|| 'Read shape and timing; hidden truth remains earned.';
}

function renderQuest(card, value) {
	card.root.hidden = !value;
	if (!value) return;
	card.value.textContent = value.completed
		? 'Complete'
		: value.nextStep || 'In progress';
	card.progress.value = Number(value.progress || 0);
	card.text.textContent = value.completed
		? 'The road has taught its combat grammar.'
		: `Next lesson: ${String(value.nextStep || '').replaceAll('-', ' ')}.`;
}

function renderFeedback(card, state) {
	card.root.hidden = false;
	card.root.dataset.state = state.feedbackState;
	card.value.textContent = state.feedbackState;
	card.progress.hidden = true;
	card.text.textContent = state.feedback;
}

function percent(value) {
	return `${Math.round(
		Math.max(0, Math.min(1, Number(value || 0))) * 100
	)}%`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHudView.js */
__awtsmoosModule_141 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudView.js
 * @description Creates one accessible HUD shell while focused helpers own cards and rendering.
 * The Awtsmoos joins intention, posture, knowledge, boss, quest, and feedback visibly;
 * Awtsmoos.com keeps host ownership, semantic labels, updates, and teardown compact and clear.
 */

var createMinimalMeadowVerticalSliceHudCard = __awtsmoosModule_142.createMinimalMeadowVerticalSliceHudCard;
var renderMinimalMeadowVerticalSliceHud = __awtsmoosModule_143.renderMinimalMeadowVerticalSliceHud;

function createMinimalMeadowVerticalSliceHudView(
	host,
	documentValue
) {
	const root = documentValue.createElement('section');
	root.className = 'Awtsmoos-vertical-slice-hud';
	root.setAttribute(
		'aria-label',
		'Combat intention and encounter guidance'
	);
	const cards = {
		boss: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Boss phase'
		),
		daas: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Daas knowledge'
		),
		feedback: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Combat guidance',
			true
		),
		kavanah: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Kavanah'
		),
		posture: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Posture'
		),
		quest: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Teaching quest'
		)
	};
	for (const value of Object.values(cards)) {
		root.appendChild(value.root);
	}
	host.appendChild(root);
	return {
		cards,
		destroy() {
			root.remove();
		},
		root,
		update(state) {
			renderMinimalMeadowVerticalSliceHud(cards, state);
		}
	};
}

__exports.createMinimalMeadowVerticalSliceHudView = createMinimalMeadowVerticalSliceHudView;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowVerticalSliceHud.js */
__awtsmoosModule_138 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHud.js
 * @description Binds bounded gameplay and subtitle events into one accessible vertical-slice presentation.
 * The Awtsmoos renews hidden mechanics as public words, meters, and patterned borders;
 * Awtsmoos.com lets intention, posture, knowledge, boss, quest, sound alternatives, and feedback agree.
 */

var createMinimalMeadowVerticalSliceHudState = __awtsmoosModule_139.createMinimalMeadowVerticalSliceHudState;
var reduceMinimalMeadowVerticalSliceHud = __awtsmoosModule_139.reduceMinimalMeadowVerticalSliceHud;
var installMinimalMeadowVerticalSliceHudStyles = __awtsmoosModule_140.installMinimalMeadowVerticalSliceHudStyles;
var createMinimalMeadowVerticalSliceHudView = __awtsmoosModule_141.createMinimalMeadowVerticalSliceHudView;

const EVENTS = Object.freeze([
	'audio:subtitle',
	'boss:defeated',
	'boss:phase',
	'combat:cleanse',
	'combat:kavanah-authority-failed',
	'combat:kavanah-authority-release',
	'combat:kavanah-authority-start',
	'combat:kavanah-cancel',
	'combat:kavanah-release',
	'combat:kavanah-start',
	'combat:posture',
	'combat:reaction',
	'combat:support-authority-failed',
	'daas:learned',
	'enemy:cast-interrupted',
	'reward:granted',
	'teaching-quest:advanced',
	'teaching-quest:completed'
]);

class MinimalMeadowVerticalSliceHud {
	constructor(host, bus, documentValue) {
		installMinimalMeadowVerticalSliceHudStyles(documentValue);
		this.bus = bus;
		this.state = createMinimalMeadowVerticalSliceHudState();
		this.view = createMinimalMeadowVerticalSliceHudView(
			host,
			documentValue
		);
		this.unsubscribers = EVENTS.map(eventName => {
			return bus.on(eventName, detail => {
				this.receive(eventName, detail);
			});
		});
		this.view.update(this.state);
	}

	receive(eventName, detail) {
		reduceMinimalMeadowVerticalSliceHud(
			this.state,
			eventName,
			detail || {}
		);
		this.view.update(this.state);
	}

	diagnostics() {
		return {
			bossVisible: Boolean(this.state.boss),
			daasVisible: Boolean(this.state.daas),
			feedbackState: this.state.feedbackState,
			kavanahVisible: Boolean(this.state.kavanah),
			postureVisible: Boolean(this.state.posture),
			questVisible: Boolean(this.state.quest)
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.view.destroy();
	}
}

__exports.MinimalMeadowVerticalSliceHud = MinimalMeadowVerticalSliceHud;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowVerticalUiBundle.js */
__awtsmoosModule_131 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalUiBundle.js
 * @description Reuses first-ready accessibility while mounting bounded audio, subtitles, and vertical HUD.
 * The Awtsmoos joins presentation mercy with truthful combat guidance without duplicate listeners;
 * Awtsmoos.com keeps shared ownership, sound, live text, diagnostics, and teardown explicit.
 */

var MinimalMeadowAccessibilityRuntime = __awtsmoosModule_132.MinimalMeadowAccessibilityRuntime;
var MinimalMeadowAudioRuntime = __awtsmoosModule_135.MinimalMeadowAudioRuntime;
var MinimalMeadowVerticalSliceHud = __awtsmoosModule_138.MinimalMeadowVerticalSliceHud;

function installMinimalMeadowVerticalUi(
	runtime,
	documentValue,
	environment = globalThis
) {
	const existingAccessibility = runtime.accessibilityRuntime;
	const accessibility = existingAccessibility
		|| new MinimalMeadowAccessibilityRuntime(
			runtime,
			documentValue,
			environment
		);
	const ownsAccessibility = !existingAccessibility;
	if (ownsAccessibility) runtime.accessibilityRuntime = accessibility;
	const audio = new MinimalMeadowAudioRuntime(runtime, environment);
	const hud = new MinimalMeadowVerticalSliceHud(
		documentValue.body,
		runtime.bus,
		documentValue
	);
	return {
		accessibility,
		audio,
		destroy() {
			hud.destroy();
			audio.destroy();
			if (ownsAccessibility) {
				accessibility.destroy();
				delete runtime.accessibilityRuntime;
			}
		},
		diagnostics() {
			return {
				accessibility: accessibility.snapshot(),
				audio: audio.diagnostics(),
				hud: hud.diagnostics(),
				sharedAccessibility: !ownsAccessibility
			};
		},
		hud
	};
}

__exports.installMinimalMeadowVerticalUi = installMinimalMeadowVerticalUi;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowUiComponents.js */
__awtsmoosModule_69 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiComponents.js
 * @description Mounts focused inventory, combat, target, rail, feedback, menu, and vertical UI components.
 * The Awtsmoos joins many visible vessels without making one coordinator carry every detail;
 * Awtsmoos.com keeps host ownership, amulet authority, environment, bus, and destruction explicit.
 */

var healingAmuletCommerce = __awtsmoosModule_70.healingAmuletCommerce;
var InventoryPanel = __awtsmoosModule_72.InventoryPanel;
var MinimalMeadowCombatBar = __awtsmoosModule_85.MinimalMeadowCombatBar;
var MinimalMeadowCombatGlyphs = __awtsmoosModule_94.MinimalMeadowCombatGlyphs;
var MinimalMeadowCoordinatedUi = __awtsmoosModule_95.MinimalMeadowCoordinatedUi;
var MinimalMeadowDamageFeedback = __awtsmoosModule_110.MinimalMeadowDamageFeedback;
var MinimalMeadowGameRail = __awtsmoosModule_113.MinimalMeadowGameRail;
var gameRailOptions = __awtsmoosModule_117.gameRailOptions;
var MinimalMeadowHouseNotice = __awtsmoosModule_118.MinimalMeadowHouseNotice;
var MinimalMeadowMenu = __awtsmoosModule_119.MinimalMeadowMenu;
var MinimalMeadowRetractable = __awtsmoosModule_124.MinimalMeadowRetractable;
var MinimalMeadowTargetFrame = __awtsmoosModule_125.MinimalMeadowTargetFrame;
var NpcHud = __awtsmoosModule_129.NpcHud;
var installMinimalMeadowVerticalUi = __awtsmoosModule_131.installMinimalMeadowVerticalUi;

function createMinimalMeadowUiComponents(
	runtime,
	documentValue,
	environment
) {
	const { hosts, bus, inventory } = runtime;
	const amulets = healingAmuletCommerce(runtime);
	return {
		combatBar: new MinimalMeadowCombatBar(
			hosts.actionHost,
			bus,
			environment
		),
		coordinatedUi: new MinimalMeadowCoordinatedUi(
			runtime,
			documentValue,
			environment
		),
		damageFeedback: new MinimalMeadowDamageFeedback(
			runtime,
			documentValue,
			environment
		),
		gameRail: new MinimalMeadowGameRail(
			hosts.gameRailHost,
			bus,
			gameRailOptions(runtime)
		),
		glyphs: new MinimalMeadowCombatGlyphs(
			hosts.combatFxHost,
			bus,
			environment
		),
		inventoryPanel: new InventoryPanel(
			hosts.inventoryHost,
			bus,
			{
				onUse: itemId => amulets.use(itemId),
				store: inventory
			}
		),
		menu: new MinimalMeadowMenu(
			hosts.menuHost,
			bus,
			runtime
		),
		mobileRetract: new MinimalMeadowRetractable(
			hosts.mobileShell
		),
		notice: new MinimalMeadowHouseNotice(
			bus,
			documentValue,
			environment
		),
		npcHud: new NpcHud(
			hosts.npcHost,
			hosts.dialogueHost,
			bus
		),
		playerRetract: new MinimalMeadowRetractable(
			hosts.playerHudShell
		),
		targetFrame: new MinimalMeadowTargetFrame(
			hosts.targetHost,
			bus
		),
		verticalUi: installMinimalMeadowVerticalUi(
			runtime,
			documentValue,
			environment
		)
	};
}

__exports.createMinimalMeadowUiComponents = createMinimalMeadowUiComponents;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAttachmentRegistrySupport.js */
__awtsmoosModule_146 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAttachmentRegistrySupport.js
 * @description Supplies bounded ancestry and named-anchor evidence for attachment ownership.
 * The Awtsmoos reveals relation through finite traversal; Awtsmoos.com keeps the registry small
 * while model generation, descendant truth, and duplicate-anchor count remain directly provable.
 */

function minimalMeadowAttachmentIsDescendant(object, root) {
	for (let current = object; current; current = current.parent) {
		if (current === root) return true;
	}
	return false;
}


__exports.minimalMeadowAttachmentIsDescendant = minimalMeadowAttachmentIsDescendant;
function countMinimalMeadowNamedNodes(root, name) {
	let count = 0;
	root?.traverse?.(node => {
		if (node.name === name) count += 1;
	});
	return count;
}

__exports.countMinimalMeadowNamedNodes = countMinimalMeadowNamedNodes;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWeaponPose.js */
__awtsmoosModule_149 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponPose.js
 * @description Defines calibrated hand and fallback transforms for visible equipped weapons.
 * The Awtsmoos joins hand, grip, shaft, and blade through one measured pose; Awtsmoos.com keeps
 * bootstrap and hydrated models truthful while the root fallback remains explicit and secondary.
 */

const POSES = Object.freeze({
	hand: Object.freeze({
		anchorDrawn: pose([0, 0, 0], [1, 1, 1], 0.04),
		anchorSheathed: pose([0, 0, 0], [1, 1, 1], -0.42),
		staffDrawn: pose([0, -0.2, 0], [0.56, 0.56, 0.56], 0),
		staffSheathed: pose([0, -0.16, 0], [0.52, 0.52, 0.52], 0),
		swordDrawn: pose([0, -0.25, 0], [0.58, 0.58, 0.58], -0.08),
		swordSheathed: pose([0, -0.18, 0], [0.54, 0.54, 0.54], -0.58)
	}),
	root: Object.freeze({
		anchorDrawn: pose([0.52, 1.06, 0.18], [1, 1, 1], 0.06),
		anchorSheathed: pose([-0.32, 1.18, -0.2], [1, 1, 1], -0.72),
		staffDrawn: pose([0, -0.28, 0], [0.62, 0.62, 0.62], 0),
		staffSheathed: pose([0, -0.2, 0], [0.58, 0.58, 0.58], 0),
		swordDrawn: pose([0, -0.18, 0], [0.6, 0.6, 0.6], -0.18),
		swordSheathed: pose([0, -0.12, 0], [0.56, 0.56, 0.56], -0.72)
	})
});

function minimalMeadowAnchorPose(domain, drawn) {
	const family = POSES[domain] || POSES.root;
	return family[drawn ? 'anchorDrawn' : 'anchorSheathed'];
}


__exports.minimalMeadowAnchorPose = minimalMeadowAnchorPose;
function minimalMeadowWeaponPose(domain, kind, drawn) {
	const family = POSES[domain] || POSES.root;
	const weapon = kind === 'sword' ? 'sword' : 'staff';
	return family[`${weapon}${drawn ? 'Drawn' : 'Sheathed'}`];
}


__exports.minimalMeadowWeaponPose = minimalMeadowWeaponPose;
function applyMinimalMeadowPose(object, value) {
	object.position.set(...value.position);
	object.scale.set(...value.scale);
	object.quaternion.set(...value.quaternion);
	return object;
}


__exports.applyMinimalMeadowPose = applyMinimalMeadowPose;
function pose(position, scale, roll) {
	return Object.freeze({
		position: Object.freeze(position),
		quaternion: Object.freeze([
			0,
			0,
			Math.sin(roll / 2),
			Math.cos(roll / 2)
		]),
		scale: Object.freeze(scale)
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWeaponAnchor.js */
__awtsmoosModule_148 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAnchor.js
 * @description Creates one generation-owned right-hand anchor and removes every stale duplicate.
 * The Awtsmoos joins tool to hand rather than nearby space; Awtsmoos.com makes hydration replace
 * old anchors cleanly while the explicit model-root fallback remains visible in diagnostics.
 */

var Group = __awtsmoosModule_5.Group;
var applyMinimalMeadowPose = __awtsmoosModule_149.applyMinimalMeadowPose;
var minimalMeadowAnchorPose = __awtsmoosModule_149.minimalMeadowAnchorPose;

const ANCHOR_NAME = 'Awtsmoos_equipped_weapon_hand_anchor';

function resolveMinimalMeadowWeaponAnchor(
	nodes,
	drawn = true,
	generation = 0
) {
	const parent = nodes?.rightHand?.add ? nodes.rightHand : nodes?.modelRoot;
	if (!parent?.add) return null;
	const domain = parent === nodes.rightHand ? 'hand' : 'root';
	let anchor = parent.children?.find?.(child => child.name === ANCHOR_NAME);
	if (!anchor) {
		anchor = new Group();
		anchor.name = ANCHOR_NAME;
		parent.add(anchor);
	}
	removeDuplicateMinimalMeadowWeaponAnchors(nodes?.modelRoot, anchor);
	anchor.visible = true;
	anchor.userData.AwtsmoosWeaponAnchor = {
		attachmentDomain: domain,
		drawn: Boolean(drawn),
		fallback: domain === 'root',
		generation: Number(generation) || 0,
		parent: parent.name || domain
	};
	parent.visible = true;
	applyAnchorTransform(anchor, drawn);
	return anchor;
}


__exports.resolveMinimalMeadowWeaponAnchor = resolveMinimalMeadowWeaponAnchor;
function removeDuplicateMinimalMeadowWeaponAnchors(model, keep = null) {
	const anchors = [];
	model?.traverse?.(node => {
		if (node.name === ANCHOR_NAME) anchors.push(node);
	});
	let removed = 0;
	for (const anchor of anchors) {
		if (anchor === keep) continue;
		anchor.parent?.remove?.(anchor);
		anchor.visible = false;
		removed += 1;
	}
	return removed;
}


__exports.removeDuplicateMinimalMeadowWeaponAnchors = removeDuplicateMinimalMeadowWeaponAnchors;
function applyAnchorTransform(anchor, drawn) {
	const domain = anchor.userData?.AwtsmoosWeaponAnchor?.attachmentDomain || 'root';
	applyMinimalMeadowPose(anchor, minimalMeadowAnchorPose(domain, drawn));
	anchor.visible = true;
	anchor.userData.AwtsmoosWeaponAnchor.drawn = Boolean(drawn);
	return anchor;
}


__exports.applyAnchorTransform = applyAnchorTransform;
const MINIMAL_MEADOW_WEAPON_ANCHOR_NAME = ANCHOR_NAME;
__exports.MINIMAL_MEADOW_WEAPON_ANCHOR_NAME = MINIMAL_MEADOW_WEAPON_ANCHOR_NAME;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWeaponAttachment.js */
__awtsmoosModule_147 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAttachment.js
 * @description Keeps one generation-owned weapon in one hand slot with calibrated visible pose.
 * The Awtsmoos grants each tool one truthful bearer; Awtsmoos.com removes competing hand-slot
 * objects, preserves hydration generation, and keeps staff or sword visible without per-frame churn.
 */

var resolveMinimalMeadowWeaponAnchor = __awtsmoosModule_148.resolveMinimalMeadowWeaponAnchor;
var applyMinimalMeadowPose = __awtsmoosModule_149.applyMinimalMeadowPose;
var minimalMeadowWeaponPose = __awtsmoosModule_149.minimalMeadowWeaponPose;

const ACTIVE_WEAPON_BY_OWNER = new WeakMap();
const OWNER_BY_WEAPON = new WeakMap();
const HAND_SLOT = 'hand';

function attachMinimalWeapon(weapon, nodes, drawn, options = {}) {
	if (!weapon) return false;
	const owner = nodes?.modelRoot;
	const generation = Number(options.generation) || 0;
	const anchor = resolveMinimalMeadowWeaponAnchor(nodes, drawn, generation);
	if (!owner || !anchor) {
		detachMinimalWeapon(weapon);
		return false;
	}
	const previous = ACTIVE_WEAPON_BY_OWNER.get(owner);
	if (previous && previous !== weapon) detachMinimalWeapon(previous);
	removeCompetingHandObjects(anchor, weapon);
	const domain = anchor.userData.AwtsmoosWeaponAnchor.attachmentDomain;
	const kind = weapon.userData.weaponKind === 'sword' ? 'sword' : 'staff';
	if (weapon.parent !== anchor) anchor.add(weapon);
	applyMinimalMeadowPose(weapon, minimalMeadowWeaponPose(domain, kind, drawn));
	weapon.visible = true;
	weapon.traverse?.(node => {
		if (node.isMesh || node.isSkinnedMesh) {
			node.visible = true;
			node.frustumCulled = false;
		}
	});
	weapon.userData.AwtsmoosEquipmentSlot = HAND_SLOT;
	weapon.userData.attachment = `${domain}-${drawn ? 'drawn' : 'sheathed'}`;
	weapon.userData.attachmentGeneration = generation;
	weapon.userData.attachmentParent = anchor.name;
	weapon.userData.handBound = domain === 'hand';
	ACTIVE_WEAPON_BY_OWNER.set(owner, weapon);
	OWNER_BY_WEAPON.set(weapon, owner);
	return true;
}


__exports.attachMinimalWeapon = attachMinimalWeapon;
function detachMinimalWeapon(weapon) {
	if (!weapon) return;
	const owner = OWNER_BY_WEAPON.get(weapon);
	if (owner && ACTIVE_WEAPON_BY_OWNER.get(owner) === weapon) {
		ACTIVE_WEAPON_BY_OWNER.delete(owner);
	}
	OWNER_BY_WEAPON.delete(weapon);
	weapon.parent?.remove?.(weapon);
	weapon.visible = false;
	weapon.userData.attachment = 'detached';
	weapon.userData.attachmentGeneration = null;
	weapon.userData.attachmentParent = null;
	weapon.userData.handBound = false;
}


__exports.detachMinimalWeapon = detachMinimalWeapon;
function removeCompetingHandObjects(anchor, weapon) {
	for (const child of [...(anchor.children || [])]) {
		if (child === weapon || child.userData?.AwtsmoosEquipmentSlot !== HAND_SLOT) continue;
		anchor.remove?.(child);
		child.visible = false;
		child.userData.attachment = 'replaced';
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAttachmentRegistry.js */
__awtsmoosModule_145 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAttachmentRegistry.js
 * @description Owns one hand slot across model generations with cheap immediate repair.
 * The Awtsmoos renews wearer, bone, anchor, and tool in one relation; Awtsmoos.com repairs an
 * obvious detached staff instantly while deep ancestry and generation proof remain cadence-bound.
 */

var countMinimalMeadowNamedNodes = __awtsmoosModule_146.countMinimalMeadowNamedNodes;
var minimalMeadowAttachmentIsDescendant = __awtsmoosModule_146.minimalMeadowAttachmentIsDescendant;
var attachMinimalWeapon = __awtsmoosModule_147.attachMinimalWeapon;
var detachMinimalWeapon = __awtsmoosModule_147.detachMinimalWeapon;
var MINIMAL_MEADOW_WEAPON_ANCHOR_NAME = __awtsmoosModule_148.MINIMAL_MEADOW_WEAPON_ANCHOR_NAME;
var resolveMinimalMeadowWeaponAnchor = __awtsmoosModule_148.resolveMinimalMeadowWeaponAnchor;

const VALIDATION_INTERVAL = 15;

class MinimalMeadowAttachmentRegistry {
	constructor() {
		this.generation = 0;
		this.nodes = null;
		this.anchor = null;
		this.weapon = null;
		this.validationFrame = 0;
		this.repairs = 0;
	}

	bindModel(nodes, drawn) {
		if (this.weapon) detachMinimalWeapon(this.weapon);
		this.nodes = nodes;
		this.generation += 1;
		this.anchor = resolveMinimalMeadowWeaponAnchor(
			nodes,
			drawn,
			this.generation
		);
		this.validationFrame = 0;
		if (this.weapon) this.attach(drawn);
		return this.anchor;
	}

	setWeapon(weapon, drawn) {
		if (this.weapon && this.weapon !== weapon) detachMinimalWeapon(this.weapon);
		this.weapon = weapon || null;
		if (!this.weapon) return false;
		return this.quickValid() || this.attach(drawn);
	}

	attach(drawn) {
		if (!this.weapon || !this.nodes) return false;
		const attached = attachMinimalWeapon(this.weapon, this.nodes, drawn, {
			generation: this.generation
		});
		this.anchor = attached ? this.weapon.parent : null;
		if (attached) this.repairs += 1;
		return attached;
	}

	tick(model, drawn, force = false) {
		if (!this.weapon || !this.nodes) return false;
		if (!this.quickValid()) {
			this.validationFrame = 0;
			return this.attach(drawn);
		}
		this.validationFrame += 1;
		if (!force && this.validationFrame < VALIDATION_INTERVAL) return false;
		this.validationFrame = 0;
		return this.deepValid(model) ? false : this.attach(drawn);
	}

	quickValid() {
		return Boolean(
			this.weapon?.visible
			&& this.anchor
			&& this.weapon.parent === this.anchor
		);
	}

	deepValid(model) {
		return this.quickValid()
			&& this.anchor.userData?.AwtsmoosWeaponAnchor?.generation === this.generation
			&& minimalMeadowAttachmentIsDescendant(this.weapon, model);
	}

	detach() {
		detachMinimalWeapon(this.weapon);
		this.weapon = null;
	}

	diagnostics() {
		return {
			anchorCount: countMinimalMeadowNamedNodes(
				this.nodes?.modelRoot,
				MINIMAL_MEADOW_WEAPON_ANCHOR_NAME
			),
			anchorName: this.anchor?.name || null,
			generation: this.generation,
			repairs: this.repairs,
			valid: this.deepValid(this.nodes?.modelRoot),
			validationInterval: VALIDATION_INTERVAL
		};
	}

	destroy() {
		this.detach();
		this.nodes = null;
		this.anchor = null;
	}
}

__exports.MinimalMeadowAttachmentRegistry = MinimalMeadowAttachmentRegistry;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/EquipmentStatModifierKeys.js */
__awtsmoosModule_153 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentStatModifierKeys.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const EQUIPMENT_STAT_KEYS = Object.freeze([
	"baseDamage",
	"attackSpeed",
	"reach",
	"activeWindow",
	"stagger",
	"knockback",
	"staminaCost",
	"blockStrength",
	"guardStamina",
	"maxHealth",
	"maxStamina",
	"staminaRegeneration",
	"maxFocus",
	"focusRegeneration",
	"movementSpeed",
	"recoverySpeed",
	"staggerResistance",
	"physicalResistance",
	"spiritualResistance",
	"rangedResistance",
	"areaResistance",
	"castingStrength",
	"cooldownReduction",
	"perfectTiming",
	"masteryGain",
	"focusEfficiency",
	"environmentalResistance",
	"reputation",
	"criticalChance"
]);
__exports.EQUIPMENT_STAT_KEYS = EQUIPMENT_STAT_KEYS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/DerivedStatKeys.js */
__awtsmoosModule_152 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DerivedStatKeys.js
 * @description Re-exports the canonical generated stat key order for projection diagnostics.
 * The Awtsmoos renews every quality through one ordered vessel; Awtsmoos.com prevents
 * client and server from naming, omitting, or totaling the same stat in divergent ways.
 */

var EQUIPMENT_STAT_KEYS = __awtsmoosModule_153.EQUIPMENT_STAT_KEYS;

const DERIVED_STAT_KEYS = EQUIPMENT_STAT_KEYS;
__exports.DERIVED_STAT_KEYS = DERIVED_STAT_KEYS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/DerivedStatProjector.js */
__awtsmoosModule_151 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DerivedStatProjector.js
 * @description Totals unique stat sources, categories, actions, and duplicate diagnostics.
 * The Awtsmoos is one beyond addition; Awtsmoos.com nevertheless measures each finite
 * equipped, learned, passive, and temporary vessel exactly once for truthful inspection.
 */

var DERIVED_STAT_KEYS = __awtsmoosModule_152.DERIVED_STAT_KEYS;

function projectDerivedStats(sources = []) {
	const values = emptyTotals();
	const subtotals = {};
	const acceptedSources = [];
	const duplicateSourceIds = [];
	const unlockedActions = new Set();
	const seen = new Set();
	for (const source of sources) {
		const sourceKey = `${source.category}:${source.id}`;
		if (seen.has(sourceKey)) {
			duplicateSourceIds.push(sourceKey);
			continue;
		}
		seen.add(sourceKey);
		const contribution = projectSource(source, values, subtotals);
		for (const actionId of source.actions || []) unlockedActions.add(actionId);
		acceptedSources.push({ ...source, contribution });
	}
	return Object.freeze({
		duplicateSourceIds: Object.freeze(duplicateSourceIds),
		sources: Object.freeze(acceptedSources),
		subtotals: deepFreeze(subtotals),
		unlockedActions: Object.freeze([...unlockedActions].sort()),
		values: Object.freeze(values)
	});
}


__exports.projectDerivedStats = projectDerivedStats;
function projectSource(source, values, subtotals) {
	const category = source.category || 'unknown';
	const contribution = emptyTotals();
	subtotals[category] ||= emptyTotals();
	for (const statKey of DERIVED_STAT_KEYS) {
		const amount = finite(source.modifiers?.[statKey]);
		values[statKey] += amount;
		subtotals[category][statKey] += amount;
		contribution[statKey] = amount;
	}
	return Object.freeze(contribution);
}

function emptyTotals() {
	return Object.fromEntries(DERIVED_STAT_KEYS.map(statKey => [statKey, 0]));
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function deepFreeze(value) {
	Object.values(value).forEach(entry => Object.freeze(entry));
	return Object.freeze(value);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/EquipmentStatCombatRecords.js */
__awtsmoosModule_157 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file COMBAT_EQUIPMENT_STATS.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const COMBAT_EQUIPMENT_STATS = deepFreeze({
	"chalaf": {
		"actions": [
			"chalaf-harvest"
		],
		"modifiers": {
			"activeWindow": 0.01,
			"perfectTiming": 0.01
		}
	},
	"wooden-staff": {
		"actions": [
			"staff-light",
			"staff-follow",
			"staff-heavy",
			"staff-shove",
			"staff-block",
			"staff-parry",
			"staff-cast"
		],
		"modifiers": {
			"baseDamage": 18,
			"attackSpeed": 0.05,
			"reach": 0.35,
			"activeWindow": 0.02,
			"stagger": 4,
			"knockback": 0.2,
			"staminaCost": -1,
			"blockStrength": 0.08,
			"guardStamina": 10,
			"castingStrength": 4,
			"cooldownReduction": 0.03,
			"perfectTiming": 0.02,
			"masteryGain": 0.1,
			"focusEfficiency": 0.04
		}
	},
	"spark-blade": {
		"actions": [
			"sword-light",
			"sword-follow",
			"sword-finish",
			"sword-heavy",
			"sword-block",
			"sword-parry"
		],
		"modifiers": {
			"baseDamage": 26,
			"attackSpeed": 0.12,
			"reach": 0.15,
			"activeWindow": 0.01,
			"stagger": 6,
			"knockback": 0.3,
			"blockStrength": 0.05,
			"guardStamina": 6,
			"cooldownReduction": 0.05,
			"perfectTiming": 0.03,
			"masteryGain": 0.12,
			"criticalChance": 0.04
		}
	},
	"village-shield": {
		"actions": [
			"shield-block",
			"shield-parry"
		],
		"modifiers": {
			"blockStrength": 0.25,
			"guardStamina": 30,
			"movementSpeed": -0.03,
			"staggerResistance": 0.12,
			"rangedResistance": 0.12,
			"areaResistance": 0.08
		}
	}
});
__exports.COMBAT_EQUIPMENT_STATS = COMBAT_EQUIPMENT_STATS;


function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.values(value).forEach(deepFreeze);
	return Object.freeze(value);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/EquipmentStatGarmentRecords.js */
__awtsmoosModule_158 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GARMENT_EQUIPMENT_STATS.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

const GARMENT_EQUIPMENT_STATS = deepFreeze({
	"travel-pack": {
		"actions": [],
		"modifiers": {
			"maxStamina": 15,
			"staminaRegeneration": 0.5,
			"movementSpeed": -0.02,
			"environmentalResistance": 0.08
		}
	},
	"scholar-glasses": {
		"actions": [],
		"modifiers": {
			"maxFocus": 3,
			"focusRegeneration": 0.3,
			"spiritualResistance": 0.024,
			"perfectTiming": 0.01
		}
	},
	"shabbos-top-hat": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxFocus": 2,
			"spiritualResistance": 0.016,
			"reputation": 0.04
		}
	},
	"black-coat": {
		"actions": [],
		"modifiers": {
			"maxHealth": 12,
			"guardStamina": 6,
			"physicalResistance": 0.06,
			"staggerResistance": 0.09,
			"environmentalResistance": 0.06
		}
	},
	"white-outer-shirt": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxFocus": 3,
			"focusRegeneration": 0.25,
			"physicalResistance": 0.02,
			"spiritualResistance": 0.024,
			"reputation": 0.03
		}
	},
	"base-shirt": {
		"actions": [],
		"modifiers": {
			"maxHealth": 2,
			"maxFocus": 1,
			"physicalResistance": 0.01,
			"spiritualResistance": 0.008
		}
	},
	"black-trousers": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxStamina": 4,
			"physicalResistance": 0.02,
			"movementSpeed": 0.01
		}
	},
	"walking-boots": {
		"actions": [],
		"modifiers": {
			"maxHealth": 4,
			"maxStamina": 5,
			"movementSpeed": 0.05,
			"recoverySpeed": 0.04,
			"environmentalResistance": 0.03
		}
	}
});
__exports.GARMENT_EQUIPMENT_STATS = GARMENT_EQUIPMENT_STATS;


function deepFreeze(value) {
	if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
	Object.values(value).forEach(deepFreeze);
	return Object.freeze(value);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/EquipmentStatModifierCatalog.js */
__awtsmoosModule_156 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentStatModifierCatalog.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

var COMBAT_EQUIPMENT_STATS = __awtsmoosModule_157.COMBAT_EQUIPMENT_STATS;
var GARMENT_EQUIPMENT_STATS = __awtsmoosModule_158.GARMENT_EQUIPMENT_STATS;
__exports.EQUIPMENT_STAT_KEYS = __awtsmoosModule_153.EQUIPMENT_STAT_KEYS;

const EQUIPMENT_STAT_MODIFIERS = Object.freeze({
	...COMBAT_EQUIPMENT_STATS,
	...GARMENT_EQUIPMENT_STATS
});
__exports.EQUIPMENT_STAT_MODIFIERS = EQUIPMENT_STAT_MODIFIERS;


function equipmentStatRecord(itemId) {
	return EQUIPMENT_STAT_MODIFIERS[itemId] || null;
}

__exports.equipmentStatRecord = equipmentStatRecord;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/EquipmentDerivedStatSources.js */
__awtsmoosModule_155 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentDerivedStatSources.js
 * @description Converts only equipped slots into canonical generated modifier sources.
 * The Awtsmoos is one beyond counting; Awtsmoos.com counts each wielded or worn vessel
 * once, excludes merely owned inventory, and preserves the exact slot that grants its light.
 */

var equipmentStatRecord = __awtsmoosModule_156.equipmentStatRecord;

function equipmentDerivedStatSources(snapshot = {}) {
	return Object.entries(snapshot.equipment || {}).flatMap(([slot, itemId]) => {
		const record = equipmentStatRecord(itemId);
		if (!record) return [];
		return [{
			actions: record.actions,
			category: 'equipped',
			id: `${slot}:${itemId}`,
			itemId,
			modifiers: record.modifiers,
			slot
		}];
	});
}

__exports.equipmentDerivedStatSources = equipmentDerivedStatSources;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/RuntimeDerivedStatSources.js */
__awtsmoosModule_154 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeDerivedStatSources.js
 * @description Joins equipped, learned, passive, and temporary sources without category blur.
 * The Awtsmoos renews permanent and passing gifts in distinct garments; Awtsmoos.com
 * preserves their identities so diagnostics can reveal exactly why every total exists.
 */

var equipmentDerivedStatSources = __awtsmoosModule_155.equipmentDerivedStatSources;

function runtimeDerivedStatSources(runtime, inventorySnapshot) {
	return [
		...equipmentDerivedStatSources(inventorySnapshot),
		...normalized(runtime.learnedStatSources, 'learned'),
		...normalized(runtime.passiveStatSources, 'passive'),
		...normalized(runtime.temporaryStatSources, 'temporary')
	];
}


__exports.runtimeDerivedStatSources = runtimeDerivedStatSources;
function normalized(sources, category) {
	return (Array.isArray(sources) ? sources : []).map((source, index) => ({
		actions: source.actions || [],
		category,
		id: source.id || `${category}-${index}`,
		modifiers: source.modifiers || {}
	}));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowDerivedStatApplication.js */
__awtsmoosModule_159 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDerivedStatApplication.js
 * @description Applies projected totals while preserving current resources and progression.
 * The Awtsmoos renews measure without erasing history; Awtsmoos.com changes capacities,
 * resistances, movement, recovery, and actions while keeping current life bounded and true.
 */

function applyMinimalMeadowDerivedStats(runtime, projection) {
	const values = projection.values;
	const stats = runtime.playerStats;
	stats.maxHealth = Math.max(1, 100 + values.maxHealth);
	stats.maxStamina = Math.max(1, 100 + values.maxStamina);
	stats.maxFocus = Math.max(1, 20 + values.maxFocus);
	stats.health = Math.min(stats.maxHealth, Math.max(0, Number(stats.health) || 0));
	stats.stamina = Math.min(stats.maxStamina, Math.max(0, Number(stats.stamina) || 0));
	stats.focus = Math.min(stats.maxFocus, Math.max(0, Number(stats.focus) || stats.maxFocus));
	stats.guardStamina = Math.max(1, 100 + values.guardStamina);
	stats.blockStrength = clamp(0.45 + values.blockStrength, 0, 0.9);
	stats.physicalResistance = clamp(values.physicalResistance, 0, 0.85);
	stats.spiritualResistance = clamp(values.spiritualResistance, 0, 0.85);
	stats.rangedResistance = clamp(values.rangedResistance, 0, 0.85);
	stats.areaResistance = clamp(values.areaResistance, 0, 0.85);
	stats.staggerResistance = clamp(values.staggerResistance, 0, 0.85);
	stats.staminaRegeneration = Math.max(0, 14 + values.staminaRegeneration);
	stats.focusRegeneration = Math.max(0, 2 + values.focusRegeneration);
	stats.recoverySpeed = Math.max(0.2, 1 + values.recoverySpeed);
	runtime.state.movementSpeedMultiplier = Math.max(0.4, 1 + values.movementSpeed);
	runtime.state.environmentalResistance = clamp(values.environmentalResistance, 0, 0.9);
	runtime.unlockedCombatActions = new Set(projection.unlockedActions);
	Object.assign(runtime.playerDefense.stats, stats);
}


__exports.applyMinimalMeadowDerivedStats = applyMinimalMeadowDerivedStats;
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowDerivedStatsRuntime.js */
__awtsmoosModule_150 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDerivedStatsRuntime.js
 * @description Projects all allowed source classes and publishes inspectable runtime totals.
 * The Awtsmoos joins garment, learning, blessing, and passing aid without duplicate shadow;
 * Awtsmoos.com reveals accepted sources, subtotals, rejected duplicates, actions, and values.
 */

var projectDerivedStats = __awtsmoosModule_151.projectDerivedStats;
var runtimeDerivedStatSources = __awtsmoosModule_154.runtimeDerivedStatSources;
var applyMinimalMeadowDerivedStats = __awtsmoosModule_159.applyMinimalMeadowDerivedStats;

class MinimalMeadowDerivedStatsRuntime {
	constructor(runtime, inventory) {
		this.runtime = runtime;
		this.inventory = inventory;
		this.projection = projectDerivedStats([]);
		this.unsubscribe = inventory.onChange(snapshot => this.update(snapshot));
		this.update(inventory.snapshot());
	}

	update(snapshot) {
		const sources = runtimeDerivedStatSources(this.runtime, snapshot);
		this.projection = projectDerivedStats(sources);
		applyMinimalMeadowDerivedStats(this.runtime, this.projection);
		this.runtime.derivedStats = this;
		this.runtime.bus.emit('stats:derived', this.snapshot());
		return this.snapshot();
	}

	snapshot() {
		return this.projection;
	}

	destroy() {
		this.unsubscribe?.();
	}
}

__exports.MinimalMeadowDerivedStatsRuntime = MinimalMeadowDerivedStatsRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWeaponAim.js */
__awtsmoosModule_161 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponAim.js
 * @description Aims the hand-bound weapon toward the selected target during charged casting.
 * The Awtsmoos carries intention from hand toward its finite address; Awtsmoos.com resolves
 * both full scene nodes and lightweight groups without corrupting body-facing authority.
 */

var Vector3 = __awtsmoosModule_5.Vector3;
var applyAnchorTransform = __awtsmoosModule_148.applyAnchorTransform;

const HAND = new Vector3();
const TARGET = new Vector3();

function aimMinimalMeadowWeapon(owner, payload = null) {
	const anchor = owner.weapon?.parent;
	const target = owner.runtime?.enemies?.selected;
	if (!anchor || !target?.group) return false;
	worldPosition(anchor.parent || anchor, HAND);
	worldPosition(target.group, TARGET);
	const targetHeight = positive(target.profile?.height, 2.4);
	const dx = TARGET.x - HAND.x;
	const dy = TARGET.y + targetHeight * 0.58 - HAND.y;
	const dz = TARGET.z - HAND.z;
	const horizontal = Math.max(0.001, Math.hypot(dx, dz));
	const worldYaw = Math.atan2(dx, dz);
	const localYaw = normalizeAngle(
		worldYaw - Number(owner.runtime.state?.facing || 0)
	);
	const elevation = Math.atan2(dy, horizontal);
	const pitch = Math.PI / 2 - elevation;
	setYawPitch(anchor.quaternion, localYaw, pitch);
	anchor.userData.AwtsmoosWeaponAim = {
		actionId: payload?.actionId || null,
		elevation,
		localYaw,
		pitch,
		targetId: target.profile?.id || null
	};
	return true;
}


__exports.aimMinimalMeadowWeapon = aimMinimalMeadowWeapon;
function restoreMinimalMeadowWeaponAim(owner) {
	const anchor = owner.weapon?.parent;
	if (!anchor) return;
	applyAnchorTransform(anchor, owner.drawn);
	delete anchor.userData.AwtsmoosWeaponAim;
}


__exports.restoreMinimalMeadowWeaponAim = restoreMinimalMeadowWeaponAim;
function worldPosition(object, target) {
	if (typeof object?.getWorldPosition === 'function') {
		return object.getWorldPosition(target);
	}
	target.set(0, 0, 0);
	for (let current = object; current; current = current.parent) {
		target.x += Number(current.position?.x) || 0;
		target.y += Number(current.position?.y) || 0;
		target.z += Number(current.position?.z) || 0;
	}
	return target;
}

function setYawPitch(quaternion, yaw, pitch) {
	const halfYaw = yaw / 2;
	const halfPitch = pitch / 2;
	const sy = Math.sin(halfYaw);
	const cy = Math.cos(halfYaw);
	const sx = Math.sin(halfPitch);
	const cx = Math.cos(halfPitch);
	quaternion.set(cy * sx, sy * cx, -sy * sx, cy * cx);
}

function normalizeAngle(value) {
	return Math.atan2(Math.sin(value), Math.cos(value));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowEquipmentCasting.js */
__awtsmoosModule_160 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentCasting.js
 * @description Holds the real hand weapon on target through charge, release, and recovery.
 * The Awtsmoos carries intention from grip toward its address; Awtsmoos.com updates aim during
 * every charged frame and restores the exact neutral hand pose after launch or cancellation.
 */

var aimMinimalMeadowWeapon = __awtsmoosModule_161.aimMinimalMeadowWeapon;
var restoreMinimalMeadowWeaponAim = __awtsmoosModule_161.restoreMinimalMeadowWeaponAim;

class MinimalMeadowEquipmentCasting {
	constructor(owner, releaseHoldMilliseconds = 240) {
		this.owner = owner;
		this.releaseHoldMilliseconds = releaseHoldMilliseconds;
		this.active = false;
		this.drawnBeforeCast = true;
		this.timer = null;
		this.cancelScheduledRestore = null;
	}

	begin(payload = null) {
		this.clearTimer();
		if (!this.active) {
			this.drawnBeforeCast = this.owner.drawn;
			this.active = true;
		}
		if (this.owner.weaponItemId) {
			this.owner.setDrawn(true, true);
			aimMinimalMeadowWeapon(this.owner, payload);
			return;
		}
		this.owner.emitState();
	}

	progress(payload = null) {
		if (!this.active) return;
		aimMinimalMeadowWeapon(this.owner, payload);
	}

	launch(payload = null) {
		if (this.active) aimMinimalMeadowWeapon(this.owner, payload);
		this.finish(this.releaseHoldMilliseconds);
	}

	cancel() {
		this.finish(0);
	}

	finish(delayMilliseconds) {
		this.clearTimer();
		if (!this.active) return;
		if (delayMilliseconds > 0) {
			this.scheduleRestore(delayMilliseconds);
			return;
		}
		this.restore();
	}

	scheduleRestore(delayMilliseconds) {
		const schedule = this.owner.runtime?.schedule;
		if (typeof schedule === 'function') {
			this.cancelScheduledRestore = schedule(
				delayMilliseconds / 1000,
				() => this.restore()
			);
			return;
		}
		this.timer = setTimeout(() => this.restore(), delayMilliseconds);
	}

	restore() {
		this.timer = null;
		this.cancelScheduledRestore = null;
		this.active = false;
		this.owner.setDrawn(this.drawnBeforeCast, true);
		restoreMinimalMeadowWeaponAim(this.owner);
	}

	clearTimer() {
		clearTimeout(this.timer);
		this.timer = null;
		this.cancelScheduledRestore?.();
		this.cancelScheduledRestore = null;
	}

	destroy() {
		this.clearTimer();
		this.active = false;
		restoreMinimalMeadowWeaponAim(this.owner);
	}
}

__exports.MinimalMeadowEquipmentCasting = MinimalMeadowEquipmentCasting;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/GarmentAppearanceCatalog.js */
__awtsmoosModule_163 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentAppearanceCatalog.js
 * @description Defines controlled colors and reusable fabric appearances for GLB garments.
 * The Awtsmoos contains every hue without change; Awtsmoos.com gives clothing bounded
 * palettes and fabrics while sacred black leather remains intentionally constrained.
 */

const GARMENT_COLORS = Object.freeze({
	black: color('Black', [0.025, 0.028, 0.035, 1]),
	blue: color('Deep Blue', [0.045, 0.12, 0.32, 1]),
	brown: color('Warm Brown', [0.24, 0.105, 0.045, 1]),
	burgundy: color('Burgundy', [0.28, 0.035, 0.07, 1]),
	cream: color('Cream', [0.82, 0.77, 0.66, 1]),
	gold: color('Antique Gold', [0.62, 0.42, 0.08, 1]),
	gray: color('Charcoal Gray', [0.18, 0.2, 0.23, 1]),
	green: color('Forest Green', [0.055, 0.22, 0.12, 1]),
	white: color('White', [0.9, 0.9, 0.88, 1])
});
__exports.GARMENT_COLORS = GARMENT_COLORS;


const GARMENT_FABRICS = Object.freeze({
	linen: fabric('Linen', 0.88, 'crosshatch'),
	plain: fabric('Plain Cloth', 0.72, 'plain'),
	satin: fabric('Shabbos Satin', 0.32, 'diagonal'),
	velvet: fabric('Velvet', 0.58, 'soft-noise'),
	wool: fabric('Wool Weave', 0.94, 'basket-weave'),
	leather: fabric('Leather', 0.66, 'pebbled')
});
__exports.GARMENT_FABRICS = GARMENT_FABRICS;


function garmentColor(id) {
	return GARMENT_COLORS[id] || GARMENT_COLORS.black;
}


__exports.garmentColor = garmentColor;
function garmentFabric(id) {
	return GARMENT_FABRICS[id] || GARMENT_FABRICS.plain;
}


__exports.garmentFabric = garmentFabric;
function color(label, rgba) {
	return Object.freeze({ id: label.toLowerCase().replaceAll(' ', '-'), label, rgba: Object.freeze(rgba) });
}

function fabric(label, roughness, pattern) {
	return Object.freeze({ label, pattern, roughness });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGarmentFabricTexture.js */
__awtsmoosModule_164 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentFabricTexture.js
 * @description Generates one cached neutral weave image per controlled fabric preset.
 * The Awtsmoos contains every thread without repetition; Awtsmoos.com creates linen, wool,
 * velvet, satin, and leather once, then reuses them without any per-frame allocation.
 */

const CACHE = new Map();

function garmentFabricTexture(fabricId, documentValue = globalThis.document) {
	if (CACHE.has(fabricId)) return CACHE.get(fabricId);
	if (!documentValue?.createElement) return null;
	const canvas = documentValue.createElement('canvas');
	canvas.width = 96;
	canvas.height = 96;
	canvas.dataset.fabricId = fabricId;
	paint(canvas.getContext('2d'), fabricId, canvas.width);
	CACHE.set(fabricId, canvas);
	return canvas;
}


__exports.garmentFabricTexture = garmentFabricTexture;
function garmentFabricTextureDiagnostics() {
	return { cached: CACHE.size, ids: [...CACHE.keys()] };
}


__exports.garmentFabricTextureDiagnostics = garmentFabricTextureDiagnostics;
function paint(context, fabricId, size) {
	context.fillStyle = '#d8d8d4';
	context.fillRect(0, 0, size, size);
	const painter = PAINTERS[fabricId] || PAINTERS.plain;
	painter(context, size);
}

const PAINTERS = Object.freeze({
	leather(context, size) {
		context.fillStyle = '#b6b5b0';
		for (let y = 3; y < size; y += 8) for (let x = 3; x < size; x += 8) context.fillRect(x + (y % 16 ? 2 : 0), y, 2, 2);
	},
	linen(context, size) {
		lines(context, size, 5, 0.18);
	},
	plain() {},
	satin(context, size) {
		context.strokeStyle = 'rgba(255,255,255,.34)';
		for (let offset = -size; offset < size * 2; offset += 9) {
			context.beginPath(); context.moveTo(offset, 0); context.lineTo(offset + size, size); context.stroke();
		}
	},
	velvet(context, size) {
		context.fillStyle = 'rgba(45,45,45,.12)';
		for (let index = 0; index < 240; index += 1) context.fillRect((index * 37) % size, (index * 61) % size, 1, 1);
	},
	wool(context, size) {
		lines(context, size, 7, 0.24);
	}
});

function lines(context, size, step, alpha) {
	context.strokeStyle = `rgba(55,55,55,${alpha})`;
	for (let value = 0; value < size; value += step) {
		context.beginPath(); context.moveTo(value, 0); context.lineTo(value, size); context.stroke();
		context.beginPath(); context.moveTo(0, value); context.lineTo(size, value); context.stroke();
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGarmentAppearance.js */
__awtsmoosModule_162 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentAppearance.js
 * @description Applies equipped item color and fabric choices to isolated garment materials.
 * The Awtsmoos clothes every finite hue without touching the shared source asset;
 * Awtsmoos.com preserves lenses and sacred leather while both jacket forms share appearance.
 */

var garmentColor = __awtsmoosModule_163.garmentColor;
var garmentFabric = __awtsmoosModule_163.garmentFabric;
var inventoryAppearanceFor = __awtsmoosModule_50.inventoryAppearanceFor;
var inventoryDefinition = __awtsmoosModule_51.inventoryDefinition;
var garmentFabricTexture = __awtsmoosModule_164.garmentFabricTexture;

function applyMinimalGarmentAppearance(wardrobe, equipment, appearance) {
	const receipt = {};
	for (const itemId of Object.values(equipment || {})) {
		const definition = inventoryDefinition(itemId);
		const visualId = definition?.garment?.visualId;
		if (!visualId || !definition.appearance) continue;
		const selected = inventoryAppearanceFor(appearance, itemId);
		const records = appearanceRecords(wardrobe, visualId);
		let materialCount = 0;
		for (const record of records) {
			for (const material of record.materials) {
				applyMaterial(material, selected);
				materialCount += 1;
			}
		}
		receipt[visualId] = {
			itemId,
			...selected,
			materials: materialCount
		};
	}
	return receipt;
}


__exports.applyMinimalGarmentAppearance = applyMinimalGarmentAppearance;
function appearanceRecords(wardrobe, visualId) {
	const ids = visualId === 'jacket'
		? ['jacket', 'jacket-tefillin']
		: [visualId];
	return ids.map(id => wardrobe?.visuals?.get(id)).filter(Boolean);
}

function applyMaterial(material, selected) {
	if (!selected || material.name === 'glasses-glass') return;
	const color = garmentColor(selected.colorId);
	const fabric = garmentFabric(selected.fabricId);
	const image = garmentFabricTexture(selected.fabricId);
	material.color = [...color.rgba];
	material.baseColorFactor = [...color.rgba];
	material.roughnessFactor = fabric.roughness;
	material.mapImage = image || material.userData?.originalMapImage || null;
	material.textureUrl = null;
	material.userData ||= {};
	Object.assign(material.userData, {
		garmentColorId: selected.colorId,
		garmentFabricId: selected.fabricId
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGarmentMaterialIsolation.js */
__awtsmoosModule_167 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentMaterialIsolation.js
 * @description Clones actor garment materials once before color or fabric mutation.
 * The Awtsmoos is one without shared mutation; Awtsmoos.com lets player, quest Chossid,
 * and tailor wear different appearances without altering the canonical GLB source.
 */

var MeshStandardMaterial = __awtsmoosModule_5.MeshStandardMaterial;

function isolateMinimalGarmentMaterials(visuals) {
	const visited = new Set();
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.(object => isolateMesh(object, visited));
		}
		for (const mesh of record.meshes) isolateMesh(mesh, visited);
	}
}


__exports.isolateMinimalGarmentMaterials = isolateMinimalGarmentMaterials;
function collectMinimalGarmentMaterials(visuals) {
	for (const record of visuals.values()) {
		for (const root of record.roots) {
			root.traverse?.(object => {
				if (isMesh(object)) record.meshes.add(object);
			});
		}
		record.materials = [...new Set(
			[...record.meshes].flatMap(materialsFor)
		)];
	}
}


__exports.collectMinimalGarmentMaterials = collectMinimalGarmentMaterials;
function isolateMesh(object, visited) {
	if (!isMesh(object) || visited.has(object)) return;
	visited.add(object);
	object.material = Array.isArray(object.material)
		? object.material.map(cloneMaterial)
		: cloneMaterial(object.material);
}

function cloneMaterial(material) {
	if (!material) return material;
	const clone = Object.assign(new MeshStandardMaterial(material), material);
	clone.color = Array.isArray(material.color)
		? [...material.color]
		: material.color;
	clone.baseColorFactor = Array.isArray(material.baseColorFactor)
		? [...material.baseColorFactor]
		: material.baseColorFactor;
	clone.userData = {
		...(material.userData || {}),
		originalMapImage: material.mapImage || null
	};
	return clone;
}

function materialsFor(object) {
	return (Array.isArray(object.material)
		? object.material
		: [object.material]).filter(Boolean);
}

function isMesh(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowGarmentDiscovery.js */
__awtsmoosModule_166 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGarmentDiscovery.js
 * @description Discovers wardrobe roots from GLB extras, canonical aliases, and materials.
 * The Awtsmoos knew every exporter fragment before metadata survived; Awtsmoos.com prefers
 * explicit garment truth while Kapote, Bekeshe, robe, and jacket names share one lawful visual.
 */
var collectMinimalGarmentMaterials = __awtsmoosModule_167.collectMinimalGarmentMaterials;
var isolateMinimalGarmentMaterials = __awtsmoosModule_167.isolateMinimalGarmentMaterials;
const EXTRA_VISUAL = Object.freeze({
	glasses: 'glasses',
	'head-teffilin-straps': 'tefillin-head',
	jacket: 'jacket',
	'jacket-teffilin': 'jacket-tefillin',
	'outer-shirt': 'outer-shirt',
	'teffilin-arm-straps': 'tefillin-arm',
	'teffilin-head-box': 'tefillin-head',
	'teffiln-arm-box': 'tefillin-arm',
	'top-hat': 'top-hat',
	yarmulka: 'yarmulka'
});
const NAME_VISUAL = Object.freeze({
	bekeshe: 'jacket',
	bekesherobe: 'jacket',
	glasses: 'glasses',
	jacket: 'jacket',
	jassidglasses: 'glasses',
	kapote: 'jacket',
	kapoterobe: 'jacket',
	outershirt: 'outer-shirt',
	robe: 'jacket',
	tophat: 'top-hat',
	yarmalka: 'yarmulka',
	yarmulka: 'yarmulka'
});
const MATERIAL_VISUAL = Object.freeze({ pants: 'body-pants', shirt: 'body-shirt', shoes: 'body-shoes' });
function discoverMinimalMeadowGarments(model) {
	const visuals = new Map();
	model?.traverse?.(object => discoverObject(visuals, object));
	isolateMinimalGarmentMaterials(visuals);
	collectMinimalGarmentMaterials(visuals);
	return { diagnostics: () => diagnostics(visuals), visuals };
}

__exports.discoverMinimalMeadowGarments = discoverMinimalMeadowGarments;
function discoverObject(visuals, object) {
	const extras = object.userData?.gltfNode?.extras || {};
	const explicit = EXTRA_VISUAL[extras.garment || extras.garament];
	const fallback = NAME_VISUAL[normalize(object.name)];
	const visualId = explicit || fallback;
	if (visualId) recordFor(visuals, visualId).roots.add(object);
	if (!isMesh(object)) return;
	for (const material of materialsFor(object)) {
		const materialVisual = MATERIAL_VISUAL[normalize(material.name)];
		if (materialVisual) recordFor(visuals, materialVisual).meshes.add(object);
	}
}
function recordFor(visuals, id) {
	if (!visuals.has(id)) visuals.set(id, { id, materials: [], meshes: new Set(), roots: new Set() });
	return visuals.get(id);
}
function diagnostics(visuals) {
	return Object.fromEntries([...visuals].map(([id, record]) => [id, {
		materials: record.materials.map(value => value.name),
		meshes: record.meshes.size,
		roots: record.roots.size
	}]));
}
function materialsFor(object) { return (Array.isArray(object.material) ? object.material : [object.material]).filter(Boolean); }
function normalize(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function isMesh(object) { return Boolean(object?.isMesh || object?.isSkinnedMesh); }
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowEquipmentNodes.js */
__awtsmoosModule_165 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentNodes.js
 * @description Resolves hands and the complete model-derived Chossid wardrobe.
 * The Awtsmoos clothes body and soul through exporter names and preserved extras alike;
 * Awtsmoos.com keeps glasses, hat, yarmulke, tefillin, jacket, shirts, trousers, and shoes truthful.
 */

var discoverMinimalMeadowGarments = __awtsmoosModule_166.discoverMinimalMeadowGarments;

const BONE_ALIASES = Object.freeze({
	leftHand: ['mixamoriglefthand', 'lefthand', 'handl', 'wristl'],
	rightHand: ['mixamorigrighthand', 'righthand', 'handr', 'wristr'],
	spine: ['mixamorigspine2', 'mixamorigspine1', 'spine2', 'spine1', 'chest', 'upperback']
});

const REMOVABLE_VISUALS = Object.freeze([
	'glasses',
	'jacket',
	'outer-shirt',
	'teffilin-arm',
	'teffilin-head',
	'top-hat',
	'yarmulka'
]);

function resolveMinimalEquipmentNodes(model) {
	const index = nodeIndex(model);
	const wardrobe = discoverMinimalMeadowGarments(model);
	return {
		garments: wardrobe.visuals,
		leftHand: resolve(index, BONE_ALIASES.leftHand),
		modelRoot: model || null,
		rightHand: resolve(index, BONE_ALIASES.rightHand),
		spine: resolve(index, BONE_ALIASES.spine),
		wardrobe
	};
}


__exports.resolveMinimalEquipmentNodes = resolveMinimalEquipmentNodes;
function applyMinimalGarmentVisibility(nodes, equipment) {
	const active = new Set();
	for (const itemId of Object.values(equipment || {})) {
		const visualId = visualForItem(itemId);
		if (visualId) active.add(visualId);
	}
	for (const visualId of REMOVABLE_VISUALS) setVisual(nodes.wardrobe, visualId, active.has(visualId));
	const armTefillin = active.has('tefillin-arm');
	setVisual(nodes.wardrobe, 'jacket', active.has('jacket') && !armTefillin);
	setVisual(nodes.wardrobe, 'jacket-tefillin', active.has('jacket') && armTefillin);
	for (const visualId of ['body-shirt', 'body-pants', 'body-shoes']) setVisual(nodes.wardrobe, visualId, true);
	return {
		active: [...active],
		discovered: nodes.wardrobe.diagnostics(),
		tefillinJacket: active.has('jacket') && armTefillin
	};
}


__exports.applyMinimalGarmentVisibility = applyMinimalGarmentVisibility;
function visualForItem(itemId) {
	const map = {
		'base-shirt': 'body-shirt', 'black-coat': 'jacket', 'black-trousers': 'body-pants',
		'blue-scholar-glasses': 'glasses', 'brown-kapote': 'jacket', 'linen-outer-shirt': 'outer-shirt',
		'scholar-glasses': 'glasses', 'shabbos-top-hat': 'top-hat', 'tefillin-shel-rosh': 'tefillin-head',
		'tefillin-shel-yad': 'tefillin-arm', 'velvet-top-hat': 'top-hat', 'walking-boots': 'body-shoes',
		'white-outer-shirt': 'outer-shirt', 'wool-kippah': 'yarmulka'
	};
	return map[itemId] || null;
}

function setVisual(wardrobe, visualId, visible) {
	const record = wardrobe?.visuals?.get(visualId);
	for (const root of record?.roots || []) root.visible = visible;
	for (const mesh of record?.meshes || []) mesh.visible = visible;
}

function nodeIndex(model) {
	const values = [];
	model?.traverse?.(node => values.push({ key: normalize(node.name), node }));
	return values;
}

function resolve(index, aliases) {
	for (const alias of aliases) {
		const entry = index.find(value => value.key === alias || value.key.includes(alias));
		if (entry) return entry.node;
	}
	return null;
}

function normalize(value) {
	return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowEquipmentRuntimeState.js */
__awtsmoosModule_168 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntimeState.js
 * @description Owns equipment listeners and generation-aware attachment diagnostics.
 * The Awtsmoos joins inventory, hand, draw, cast, hydration, and repair into one receipt;
 * Awtsmoos.com exposes anchor count and model generation so duplicate ownership cannot hide.
 */

function installMinimalMeadowEquipmentListeners(owner) {
	return [
		owner.inventory.onChange(() => owner.synchronize()),
		owner.bus.on('equipment:draw', () => owner.setDrawn(true)),
		owner.bus.on('equipment:sheath', () => owner.setDrawn(false)),
		owner.bus.on('equipment:toggle-draw', () => owner.setDrawn(!owner.drawn)),
		owner.bus.on('combat:cast-start', event => owner.casting.begin(event)),
		owner.bus.on('combat:cast-progress', event => owner.casting.progress(event)),
		owner.bus.on('combat:cast-launch', event => owner.casting.launch(event)),
		owner.bus.on('combat:cast-cancel', () => owner.casting.cancel())
	];
}


__exports.installMinimalMeadowEquipmentListeners = installMinimalMeadowEquipmentListeners;
function minimalMeadowEquipmentDiagnostics(owner) {
	const anchor = owner.weapon?.parent;
	return {
		appearance: { ...owner.appearance },
		attachmentRegistry: owner.attachments?.diagnostics?.() || null,
		casting: owner.casting.active,
		drawn: owner.drawn,
		garments: structuredClone(owner.garments),
		handBone: owner.nodes?.rightHand?.name || owner.nodes?.leftHand?.name || null,
		handBound: Boolean(owner.weapon?.userData?.handBound),
		model: owner.model?.name || null,
		spineBone: owner.nodes?.spine?.name || null,
		weaponAim: anchor?.userData?.AwtsmoosWeaponAim || null,
		weaponAttachment: owner.weapon?.userData?.attachment || 'none',
		weaponGeneration: owner.weapon?.userData?.attachmentGeneration ?? null,
		weaponItemId: owner.weaponItemId,
		weaponVisible: Boolean(owner.weapon?.visible)
	};
}


__exports.minimalMeadowEquipmentDiagnostics = minimalMeadowEquipmentDiagnostics;
function minimalMeadowEquippedWeaponItemId(itemId) {
	return ['wooden-staff', 'spark-blade'].includes(itemId) ? itemId : null;
}

__exports.minimalMeadowEquippedWeaponItemId = minimalMeadowEquippedWeaponItemId;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js */
__awtsmoosModule_173 = (() => {
const __exports = {};
// B"H // Boruch Hashem // Blessed is He

/**
 * @file Vec3.js
 * @description Provides the mutable three-dimensional vector vessel.
 * The Awtsmoos draws every finite direction from indivisible oneness;
 * Awtsmoos.com lets motion appear through clear coordinates without concealment.
 */
class Vec3 {
	constructor(x = 0, y = 0, z = 0) {
		this.set(x, y, z);
	}

	/** Replaces every coordinate and returns this mutable vector. */
	set(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	/** Copies coordinates while preserving the original falsy-zero behavior. */
	copy(value = {}) {
		return this.set(value.x || 0, value.y || 0, value.z || 0);
	}

	/** Returns an independent vector with the same coordinates. */
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}

	/** Adds another vector in place. */
	add(value) {
		this.x += value.x;
		this.y += value.y;
		this.z += value.z;
		return this;
	}

	/** Subtracts another vector in place. */
	sub(value) {
		this.x -= value.x;
		this.y -= value.y;
		this.z -= value.z;
		return this;
	}

	/** Multiplies every coordinate by one scalar. */
	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	/** Returns the Euclidean vector length. */
	length() {
		return Math.hypot(this.x, this.y, this.z);
	}

	/** Normalizes in place while leaving a zero vector unchanged. */
	normalize() {
		const divisor = this.length() || 1;
		return this.scale(1 / divisor);
	}

	/** Returns plain serializable coordinates. */
	toJSON() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	}

	/** Creates a vector from a vector-like value. */
	static from(value = {}) {
		return new Vec3(value.x || 0, value.y || 0, value.z || 0);
	}
}

__exports.Vec3 = Vec3;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/math/Aabb.js */
__awtsmoosModule_172 = (() => {
const __exports = {};
// B"H // Boruch Hashem // Blessed is He

/**
 * @file Aabb.js
 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
 * The Awtsmoos surrounds every finite form without being bounded by it;
 * Awtsmoos.com reveals exact containment and contact through readable planes.
 */
var Vec3 = __awtsmoosModule_173.Vec3;

class Aabb {
	constructor(min = new Vec3(), max = new Vec3()) {
		this.min = Vec3.from(min);
		this.max = Vec3.from(max);
	}

	/** Creates a box from one center and complete size. */
	static centerSize(center, size) {
		const halfSize = Vec3.from(size).scale(0.5);
		return new Aabb(
			Vec3.from(center).sub(halfSize),
			Vec3.from(center).add(halfSize)
		);
	}

	/** Returns an independent box with cloned endpoints. */
	clone() {
		return new Aabb(this.min, this.max);
	}

	/** Returns a new box expanded equally along every axis. */
	expanded(amount) {
		return new Aabb(
			this.min.clone().sub(new Vec3(amount, amount, amount)),
			this.max.clone().add(new Vec3(amount, amount, amount))
		);
	}

	/** Returns whether two closed boxes touch or overlap. */
	intersects(other) {
		return !(
			this.max.x < other.min.x
			|| this.min.x > other.max.x
			|| this.max.y < other.min.y
			|| this.min.y > other.max.y
			|| this.max.z < other.min.z
			|| this.min.z > other.max.z
		);
	}

	/** Returns whether this closed box completely contains another. */
	containsAabb(other) {
		return (
			other.min.x >= this.min.x
			&& other.max.x <= this.max.x
			&& other.min.y >= this.min.y
			&& other.max.y <= this.max.y
			&& other.min.z >= this.min.z
			&& other.max.z <= this.max.z
		);
	}

	/** Returns the midpoint of the box. */
	center() {
		return this.min.clone().add(this.max).scale(0.5);
	}

	/** Returns a plain serializable bounds object. */
	toJSON() {
		return {
			min: this.min.toJSON(),
			max: this.max.toJSON()
		};
	}
}

__exports.Aabb = Aabb;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/math/Geometry3D.js */
__awtsmoosModule_174 = (() => {
const __exports = {};
// B"H
/** Geometry helpers: normals, barycentric tests, and raw capsule math vessels. */
function v(x = 0, y = 0, z = 0) { return { x, y, z }; }

__exports.v = v;
function add(a, b) { return v(a.x + b.x, a.y + b.y, a.z + b.z); }

__exports.add = add;
function sub(a, b) { return v(a.x - b.x, a.y - b.y, a.z - b.z); }

__exports.sub = sub;
function scale(a, s) { return v(a.x * s, a.y * s, a.z * s); }

__exports.scale = scale;
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

__exports.dot = dot;
function cross(a, b) { return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }

__exports.cross = cross;
function length(a) { return Math.hypot(a.x, a.y, a.z); }

__exports.length = length;
function normalize(a) { const n = length(a) || 1; return scale(a, 1 / n); }

__exports.normalize = normalize;
function negate(a) { return v(-a.x, -a.y, -a.z); }

__exports.negate = negate;
function clamp01(n) { return Math.max(0, Math.min(1, n)); }

__exports.clamp01 = clamp01;
function rotateY(p, yaw) { const c = Math.cos(yaw || 0), s = Math.sin(yaw || 0); return v(p.x * c - p.z * s, p.y, p.x * s + p.z * c); }

__exports.rotateY = rotateY;
function transformPoint(p, position, yaw = 0) { return add(rotateY(p, yaw), position); }

__exports.transformPoint = transformPoint;
function triangleNormal(a, b, c) { return normalize(cross(sub(b, a), sub(c, a))); }

__exports.triangleNormal = triangleNormal;
function planeDistance(point, tri) { return dot(sub(point, tri.a), tri.normal); }

__exports.planeDistance = planeDistance;
function projectToPlane(point, tri) { return sub(point, scale(tri.normal, planeDistance(point, tri))); }

__exports.projectToPlane = projectToPlane;
function triangleContainsPoint(p, tri) {
  const v0 = sub(tri.c, tri.a), v1 = sub(tri.b, tri.a), v2 = sub(p, tri.a);
  const d00 = dot(v0, v0), d01 = dot(v0, v1), d02 = dot(v0, v2), d11 = dot(v1, v1), d12 = dot(v1, v2);
  const inv = 1 / ((d00 * d11 - d01 * d01) || 1);
  const u = (d11 * d02 - d01 * d12) * inv, w = (d00 * d12 - d01 * d02) * inv;
  return u >= -0.0001 && w >= -0.0001 && u + w <= 1.0001;
}

__exports.triangleContainsPoint = triangleContainsPoint;
function closestPointOnSegment(p, a, b) { const ab = sub(b, a); return add(a, scale(ab, clamp01(dot(sub(p, a), ab) / (dot(ab, ab) || 1)))); }

__exports.closestPointOnSegment = closestPointOnSegment;function closestPointsSegmentSegment(a0, a1, b0, b1) {
  const d1 = sub(a1, a0), d2 = sub(b1, b0), r = sub(a0, b0);
  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
  let s = 0, t = 0;
  if (a <= 1e-8 && e <= 1e-8) return [a0, b0];
  if (a <= 1e-8) t = clamp01(f / e);
  else {
    const c = dot(d1, r);
    if (e <= 1e-8) s = clamp01(-c / a);
    else { const b = dot(d1, d2), denom = a * e - b * b; s = denom ? clamp01((b * f - c * e) / denom) : 0; t = (b * s + f) / e; if (t < 0) { t = 0; s = clamp01(-c / a); } else if (t > 1) { t = 1; s = clamp01((b - c) / a); } }
  }
  return [add(a0, scale(d1, s)), add(b0, scale(d2, t))];
}
function rayTriangle(origin, direction, tri, maxDistance = Infinity) {
  const edge1 = sub(tri.b, tri.a), edge2 = sub(tri.c, tri.a), h = cross(direction, edge2);
  const det = dot(edge1, h);
  if (Math.abs(det) < 0.000001) return null;
  const inv = 1 / det, s = sub(origin, tri.a), u = inv * dot(s, h);
  if (u < 0 || u > 1) return null;
  const q = cross(s, edge1), vv = inv * dot(direction, q);
  if (vv < 0 || u + vv > 1) return null;
  const t = inv * dot(edge2, q);
  if (t < 0.001 || t > maxDistance) return null;
  return { distance: t, point: add(origin, scale(direction, t)), normal: tri.normal, item: tri };
}
function minMax(points) {
  const min = v(Infinity, Infinity, Infinity), max = v(-Infinity, -Infinity, -Infinity);
  for (const p of points) { min.x = Math.min(min.x, p.x); min.y = Math.min(min.y, p.y); min.z = Math.min(min.z, p.z); max.x = Math.max(max.x, p.x); max.y = Math.max(max.y, p.y); max.z = Math.max(max.z, p.z); }
  return { min, max };
}

__exports.closestPointsSegmentSegment = closestPointsSegmentSegment;
__exports.rayTriangle = rayTriangle;
__exports.minMax = minMax;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/TriangleCollider.js */
__awtsmoosModule_171 = (() => {
const __exports = {};
// B"H // Boruch Hashem // Blessed is He

/**
 * @file TriangleCollider.js
 * @description Gives one rendered triangle an exact collision body and spatial box.
 * The Awtsmoos renews every face without division; Awtsmoos.com lets each finite
 * surface reveal its normal, solidity, floor meaning, and searchable boundary.
 */
var Aabb = __awtsmoosModule_172.Aabb;
var minMax = __awtsmoosModule_174.minMax;
var triangleNormal = __awtsmoosModule_174.triangleNormal;

class TriangleCollider {
	/**
	 * Creates one immutable-in-shape triangle collision record.
	 * @param {object} a First vertex.
	 * @param {object} b Second vertex.
	 * @param {object} c Third vertex.
	 * @param {object} [options] Collision semantics and optional normal.
	 */
	constructor(a, b, c, options = {}) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.normal = options.normal || triangleNormal(a, b, c);
		this.kind = options.kind || 'triangle';
		this.solid = options.solid !== false;
		this.floor = options.floor ?? (this.normal.y > 0.45);
		const bounds = minMax([a, b, c]);
		this.aabb = new Aabb(bounds.min, bounds.max).expanded(0.03);
	}
}


__exports.TriangleCollider = TriangleCollider;
/**
 * Converts indexed vertices into ordered triangle colliders.
 * @param {Array<object>} vertices Position vectors addressed by the index array.
 * @param {Array<number>} indices Triangle indices in groups of three.
 * @param {object} [options] Shared collision semantics.
 * @returns {Array<TriangleCollider>} Fresh colliders in source order.
 */
function trianglesFromIndexed(vertices, indices, options = {}) {
	const triangles = [];
	for (let index = 0; index < indices.length; index += 3) {
		triangles.push(new TriangleCollider(
			vertices[indices[index]],
			vertices[indices[index + 1]],
			vertices[indices[index + 2]],
			options
		));
	}
	return triangles;
}

__exports.trianglesFromIndexed = trianglesFromIndexed;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/math/rng.js */
__awtsmoosModule_179 = (() => {
const __exports = {};
/**
 * B"H
 * @chapter A tiny seed stood before the Awtsmoos and became a forest of numbers.
 * No framework enters here; only deterministic breath, renewed each instant.
 */
function hashSeed(value = 'awtsmoos') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}


__exports.hashSeed = hashSeed;
function createRng(seed = 'awtsmoos') {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4294967296);
  };
}


__exports.createRng = createRng;
function range(rng, min, max) {
  return min + (max - min) * rng();
}

__exports.range = range;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives/core.js */
__awtsmoosModule_181 = (() => {
const __exports = {};
// B"H
const WHITE = [1, 1, 1, 1];
__exports.WHITE = WHITE;


/**
 * B"H
 * The point enters the vessel only when it is finite; the Awtsmoos gives it room.
 */
function mesh(positions = [], indices = [], color = WHITE) {
  return {
    positions,
    indices,
    colors: Array.from({ length: positions.length / 3 }, () => color).flat()
  };
}


__exports.mesh = mesh;
function safeSegments(value, min) {
  return Math.max(min, Math.floor(value || min));
}


__exports.safeSegments = safeSegments;
function onPlane(x, z, plane) {
  if (plane === 'xy') return [x, z, 0];
  if (plane === 'yz') return [0, x, z];
  return [x, 0, z];
}

__exports.onPlane = onPlane;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives/box.js */
__awtsmoosModule_182 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_181.WHITE;
var mesh = __awtsmoosModule_181.mesh;

/**
 * B"H
 * Six faces stand like six directions, each one admitting it is only a vessel.
 */
function cubeMesh({ center = [0, 0, 0], size = [1, 1, 1], color = WHITE } = {}) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size.map(value => Math.max(0.001, Math.abs(value)) / 2);
  const p = [
    cx - sx, cy - sy, cz - sz, cx + sx, cy - sy, cz - sz,
    cx + sx, cy + sy, cz - sz, cx - sx, cy + sy, cz - sz,
    cx - sx, cy - sy, cz + sz, cx + sx, cy - sy, cz + sz,
    cx + sx, cy + sy, cz + sz, cx - sx, cy + sy, cz + sz
  ];
  const i = [
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7,
    1, 5, 6, 1, 6, 2, 0, 3, 7, 0, 7, 4
  ];
  return mesh(p, i, color);
}

__exports.cubeMesh = cubeMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives/flat.js */
__awtsmoosModule_183 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_181.WHITE;
var mesh = __awtsmoosModule_181.mesh;
var onPlane = __awtsmoosModule_181.onPlane;
var safeSegments = __awtsmoosModule_181.safeSegments;

/** B"H: Flat things are not dead; they are quiet stages for revelation. */
function planeMesh({ size = 2, y = 0, color = WHITE } = {}) {
  const s = Math.max(0.001, Math.abs(size)) / 2;
  return mesh([-s, y, -s, s, y, -s, s, y, s, -s, y, s], [0, 1, 2, 0, 2, 3], color);
}


__exports.planeMesh = planeMesh;
function discMesh({ radius = 1, segments = 48, y = 0, color = WHITE } = {}) {
  const p = [0, y, 0];
  const i = [];
  const n = safeSegments(segments, 8);
  for (let s = 0; s < n; s += 1) {
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
    i.push(0, s + 1, ((s + 1) % n) + 1);
  }
  return mesh(p, i, color);
}


__exports.discMesh = discMesh;
function ringMesh({ outer = 1, inner = 0.68, segments = 48, plane = 'xz', color = WHITE } = {}) {
  const p = [];
  const i = [];
  const n = safeSegments(segments, 8);
  const a = Math.max(0.001, Math.abs(outer));
  const b = Math.max(0.001, Math.min(a * 0.95, Math.abs(inner)));
  for (let s = 0; s < n; s += 1) {
    const t = s / n * Math.PI * 2;
    p.push(...onPlane(Math.cos(t) * a, Math.sin(t) * a, plane));
    p.push(...onPlane(Math.cos(t) * b, Math.sin(t) * b, plane));
  }
  for (let s = 0; s < n; s += 1) {
    const o = s * 2;
    const next = ((s + 1) % n) * 2;
    i.push(o, next, next + 1, o, next + 1, o + 1);
  }
  return mesh(p, i, color);
}

__exports.ringMesh = ringMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives/round.js */
__awtsmoosModule_184 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_181.WHITE;
var mesh = __awtsmoosModule_181.mesh;
var safeSegments = __awtsmoosModule_181.safeSegments;

/** B"H: Roundness remembers that the Infinite has no corner. */
function cylinderMesh({ radius = 1, height = 2, segments = 32, color = WHITE } = {}) {
  const p = [0, height / 2, 0, 0, -height / 2, 0];
  const i = [];
  const n = safeSegments(segments, 8);
  for (let s = 0; s < n; s += 1) {
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * radius, height / 2, Math.sin(a) * radius);
    p.push(Math.cos(a) * radius, -height / 2, Math.sin(a) * radius);
  }
  for (let s = 0; s < n; s += 1) {
    const top = 2 + s * 2;
    const bot = top + 1;
    const nt = 2 + ((s + 1) % n) * 2;
    const nb = nt + 1;
    i.push(0, top, nt, 1, nb, bot, top, bot, nb, top, nb, nt);
  }
  return mesh(p, i, color);
}


__exports.cylinderMesh = cylinderMesh;
function sphereMesh({ radius = 1, rings = 8, segments = 16, color = WHITE } = {}) {
  const p = [];
  const i = [];
  const rows = Math.max(3, rings | 0);
  const cols = safeSegments(segments, 8);
  for (let y = 0; y <= rows; y += 1) {
    const ph = y / rows * Math.PI;
    for (let x = 0; x < cols; x += 1) {
      const th = x / cols * Math.PI * 2;
      p.push(Math.sin(ph) * Math.cos(th) * radius, Math.cos(ph) * radius, Math.sin(ph) * Math.sin(th) * radius);
    }
  }
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) {
    const a = y * cols + x;
    const b = y * cols + ((x + 1) % cols);
    const c = (y + 1) * cols + ((x + 1) % cols);
    const d = (y + 1) * cols + x;
    i.push(a, c, d, a, b, c);
  }
  return mesh(p, i, color);
}

__exports.sphereMesh = sphereMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives/star.js */
__awtsmoosModule_185 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_181.WHITE;
var mesh = __awtsmoosModule_181.mesh;

/** B"H: A star is a small argument that darkness never owned the sky. */
function starMesh({ points = 5, outer = 1, inner = 0.45, height = 0.55, color = WHITE } = {}) {
  const p = [0, height, 0, 0, -height, 0];
  const i = [];
  const n = Math.max(3, points | 0) * 2;
  for (let s = 0; s < n; s += 1) {
    const r = s % 2 ? inner : outer;
    const a = s / n * Math.PI * 2;
    p.push(Math.cos(a) * r, 0, Math.sin(a) * r);
  }
  for (let s = 0; s < n; s += 1) {
    const a = 2 + s;
    const b = 2 + ((s + 1) % n);
    i.push(0, a, b, 1, b, a);
  }
  return mesh(p, i, color);
}

__exports.starMesh = starMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/primitives.js */
__awtsmoosModule_180 = (() => {
const __exports = {};
// B"H
__exports.WHITE = __awtsmoosModule_181.WHITE;
__exports.mesh = __awtsmoosModule_181.mesh;
__exports.onPlane = __awtsmoosModule_181.onPlane;
__exports.safeSegments = __awtsmoosModule_181.safeSegments;
__exports.cubeMesh = __awtsmoosModule_182.cubeMesh;
__exports.discMesh = __awtsmoosModule_183.discMesh;
__exports.planeMesh = __awtsmoosModule_183.planeMesh;
__exports.ringMesh = __awtsmoosModule_183.ringMesh;
__exports.cylinderMesh = __awtsmoosModule_184.cylinderMesh;
__exports.sphereMesh = __awtsmoosModule_184.sphereMesh;
__exports.starMesh = __awtsmoosModule_185.starMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/transform.js */
__awtsmoosModule_188 = (() => {
const __exports = {};
// B"H

/**
 * Chapter 2 — A finite vessel may turn through every axis while its source
 * remains untouched. Scale, rotation, and translation are applied in that order.
 */
function transformMesh(mesh, options = {}) {
	const scale = axis(options.scale, 1);
	const rotate = axis(options.rotate, 0);
	const translate = axis(options.translate, 0);
	const positions = [];
	for (let index = 0; index < (mesh.positions || []).length; index += 3) {
		const point = [
			mesh.positions[index] * scale[0],
			mesh.positions[index + 1] * scale[1],
			mesh.positions[index + 2] * scale[2]
		];
		const turned = rotatePoint(point, rotate);
		positions.push(turned[0] + translate[0], turned[1] + translate[1], turned[2] + translate[2]);
	}
	return copyMesh(mesh, positions);
}


__exports.transformMesh = transformMesh;
function recolorMesh(mesh, color = [1, 1, 1, 1]) {
	return {
		...mesh,
		positions: [...(mesh.positions || [])],
		indices: [...(mesh.indices || [])],
		colors: Array.from({ length: (mesh.positions || []).length / 3 }, () => color).flat()
	};
}


__exports.recolorMesh = recolorMesh;
function mergeMeshes(meshes = []) {
	const output = { positions: [], indices: [], colors: [] };
	for (const current of meshes.flat(Infinity).filter(Boolean)) mergeInto(output, current);
	return output;
}


__exports.mergeMeshes = mergeMeshes;
function cloneMesh(mesh) {
	return copyMesh(mesh, [...(mesh.positions || [])]);
}


__exports.cloneMesh = cloneMesh;
function rotatePoint([x, y, z], [rx, ry, rz]) {
	const cx = Math.cos(rx);
	const sx = Math.sin(rx);
	const cy = Math.cos(ry);
	const sy = Math.sin(ry);
	const cz = Math.cos(rz);
	const sz = Math.sin(rz);
	const xTurn = [x, y * cx - z * sx, y * sx + z * cx];
	const yTurn = [xTurn[0] * cy + xTurn[2] * sy, xTurn[1], -xTurn[0] * sy + xTurn[2] * cy];
	return [yTurn[0] * cz - yTurn[1] * sz, yTurn[0] * sz + yTurn[1] * cz, yTurn[2]];
}

function copyMesh(mesh, positions) {
	return {
		...mesh,
		positions,
		indices: [...(mesh.indices || [])],
		colors: normalizedColors(mesh)
	};
}

function normalizedColors(mesh) {
	const count = (mesh.positions || []).length / 3;
	if (mesh.colors?.length === count * 4) return [...mesh.colors];
	return Array.from({ length: count }, () => [1, 1, 1, 1]).flat();
}

function mergeInto(output, mesh) {
	const offset = output.positions.length / 3;
	output.positions.push(...(mesh.positions || []));
	output.indices.push(...(mesh.indices || []).map(index => index + offset));
	output.colors.push(...normalizedColors(mesh));
}

function axis(value, fallback) {
	if (Array.isArray(value)) return [0, 1, 2].map(index => finite(value[index], fallback));
	const scalar = finite(value, fallback);
	return [scalar, scalar, scalar];
}

function finite(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog/helpers.js */
__awtsmoosModule_190 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_180.cubeMesh;
var transformMesh = __awtsmoosModule_188.transformMesh;

/** B"H: A bar is a humble beam, waiting to become a gate or a letter. */
function bar(translate, scale, tilt = 0) {
  const current = transformMesh(cubeMesh(), { scale, translate });
  if (!tilt) return current;
  const positions = current.positions.map((value, i) => (i % 3 === 0 ? value + current.positions[i + 1] * tilt : value));
  return { ...current, positions };
}

__exports.bar = bar;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog/glyphs.js */
__awtsmoosModule_189 = (() => {
const __exports = {};
// B"H
var mergeMeshes = __awtsmoosModule_188.mergeMeshes;
var bar = __awtsmoosModule_190.bar;

/** B"H: The glyph leans forward like a spark trying to become speech. */
function letterMesh() {
  return mergeMeshes([
    bar([0, 0, 0], [0.22, 1.55, 0.18]),
    bar([-0.34, 0.34, 0], [0.72, 0.17, 0.18]),
    bar([0.3, -0.28, 0], [0.66, 0.17, 0.18]),
    bar([0, 0.02, 0], [0.15, 1.42, 0.15], -0.36)
  ]);
}

__exports.letterMesh = letterMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog/nature.js */
__awtsmoosModule_191 = (() => {
const __exports = {};
// B"H
var cylinderMesh = __awtsmoosModule_180.cylinderMesh;
var sphereMesh = __awtsmoosModule_180.sphereMesh;
var mergeMeshes = __awtsmoosModule_188.mergeMeshes;
var transformMesh = __awtsmoosModule_188.transformMesh;

/** B"H: The tree grows upward but remembers the traveler needs a horizon. */
function treeMesh() {
  return mergeMeshes([
    transformMesh(cylinderMesh({ radius: 0.14, height: 1.0, segments: 14 }), { translate: [0, -0.28, 0] }),
    transformMesh(sphereMesh({ radius: 0.48, rings: 6, segments: 12 }), { scale: [1, 0.72, 1], translate: [0, 0.45, 0] }),
    transformMesh(sphereMesh({ radius: 0.29, rings: 5, segments: 10 }), { translate: [0.25, 0.6, 0.03] })
  ]);
}


__exports.treeMesh = treeMesh;
/** B"H: The cloud is now a soft marker, not a wall across the sky. */
function cloudMesh() {
  return mergeMeshes([
    puff(-0.3, 0, 0, 0.34),
    puff(0.1, 0.05, 0, 0.44),
    puff(0.48, -0.02, 0.02, 0.3),
    puff(0.08, -0.12, 0.24, 0.28)
  ]);
}


__exports.cloudMesh = cloudMesh;
function puff(x, y, z, radius) {
  return transformMesh(sphereMesh({ radius, rings: 5, segments: 10 }), { translate: [x, y, z] });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog/structures.js */
__awtsmoosModule_192 = (() => {
const __exports = {};
// B"H
var ringMesh = __awtsmoosModule_180.ringMesh;
var mergeMeshes = __awtsmoosModule_188.mergeMeshes;
var transformMesh = __awtsmoosModule_188.transformMesh;
var bar = __awtsmoosModule_190.bar;

/** B"H: An arch must frame the road, not devour the camera. */
function archMesh() {
  return mergeMeshes([
    bar([-0.58, -0.28, 0], [0.2, 1.18, 0.24]),
    bar([0.58, -0.28, 0], [0.2, 1.18, 0.24]),
    transformMesh(ringMesh({ plane: 'xy', outer: 0.72, inner: 0.52, segments: 36 }), { translate: [0, 0.3, 0] }),
    bar([0, 0.28, 0], [1.08, 0.16, 0.22])
  ]);
}


__exports.archMesh = archMesh;
/** B"H: A gate hints at a higher world while keeping the path visible. */
function gateMesh() {
  return mergeMeshes([
    transformMesh(ringMesh({ plane: 'xy', outer: 0.76, inner: 0.61, segments: 42 }), { scale: [0.9, 1.05, 1], translate: [0, 0.05, 0] }),
    bar([-0.68, -0.22, 0], [0.14, 1.18, 0.2]),
    bar([0.68, -0.22, 0], [0.14, 1.18, 0.2]),
    bar([0, -0.82, 0], [1.42, 0.1, 0.22])
  ]);
}

__exports.gateMesh = gateMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog/registry.js */
__awtsmoosModule_187 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_180.cubeMesh;
var cylinderMesh = __awtsmoosModule_180.cylinderMesh;
var discMesh = __awtsmoosModule_180.discMesh;
var planeMesh = __awtsmoosModule_180.planeMesh;
var ringMesh = __awtsmoosModule_180.ringMesh;
var sphereMesh = __awtsmoosModule_180.sphereMesh;
var starMesh = __awtsmoosModule_180.starMesh;
var transformMesh = __awtsmoosModule_188.transformMesh;
var letterMesh = __awtsmoosModule_189.letterMesh;
var cloudMesh = __awtsmoosModule_191.cloudMesh;
var treeMesh = __awtsmoosModule_191.treeMesh;
var archMesh = __awtsmoosModule_192.archMesh;
var gateMesh = __awtsmoosModule_192.gateMesh;

/** B"H: The registry names each vessel, then gets out of the way. */
const BUILDERS = {
  cube: () => cubeMesh(),
  box: () => cubeMesh(),
  plane: () => planeMesh(),
  disc: () => discMesh({ segments: 40 }),
  sphere: () => sphereMesh({ rings: 8, segments: 14 }),
  cylinder: () => cylinderMesh({ segments: 24 }),
  ring: () => ringMesh({ plane: 'xz', segments: 42 }),
  star: () => starMesh({ points: 6 }),
  shard: () => transformMesh(starMesh({ points: 4, height: 0.9 }), { scale: [0.45, 1.05, 0.45] }),
  letter: letterMesh,
  arch: archMesh,
  gate: gateMesh,
  tree: treeMesh,
  cloud: cloudMesh
};

function catalogNames() {
  return Object.keys(BUILDERS);
}


__exports.catalogNames = catalogNames;
function catalogMesh(name = 'cube') {
  return (BUILDERS[name] || BUILDERS.cube)();
}

__exports.catalogMesh = catalogMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/catalog.js */
__awtsmoosModule_186 = (() => {
const __exports = {};
// B"H
__exports.catalogMesh = __awtsmoosModule_187.catalogMesh;
__exports.catalogNames = __awtsmoosModule_187.catalogNames;
__exports.letterMesh = __awtsmoosModule_189.letterMesh;
__exports.cloudMesh = __awtsmoosModule_191.cloudMesh;
__exports.treeMesh = __awtsmoosModule_191.treeMesh;
__exports.archMesh = __awtsmoosModule_192.archMesh;
__exports.gateMesh = __awtsmoosModule_192.gateMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/repair.js */
__awtsmoosModule_193 = (() => {
const __exports = {};
/**
 * B"H
 * @chapter Degenerate sparks fell away so the visible vessel could stand.
 */
function compactFiniteMesh(mesh) {
  const positions = mesh.positions || [];
  const indices = mesh.indices || [];
  const cleanPositions = [];
  const map = new Map();
  for (let i = 0; i < positions.length; i += 3) {
    const v = [positions[i], positions[i + 1], positions[i + 2]];
    if (!v.every(Number.isFinite)) continue;
    map.set(i / 3, cleanPositions.length / 3);
    cleanPositions.push(...v);
  }
  const cleanIndices = [];
  for (let i = 0; i < indices.length; i += 3) {
    const tri = [map.get(indices[i]), map.get(indices[i + 1]), map.get(indices[i + 2])];
    if (tri.some(v => v === undefined)) continue;
    if (tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2]) continue;
    cleanIndices.push(...tri);
  }
  return { ...mesh, positions: cleanPositions, indices: cleanIndices };
}

__exports.compactFiniteMesh = compactFiniteMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/math/vec3.js */
__awtsmoosModule_195 = (() => {
const __exports = {};
/**
 * B"H
 * @chapter Three coordinates sang, and the void admitted they were a point.
 */
const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
__exports.v3 = v3;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
__exports.sub = sub;

const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
__exports.cross = cross;

function length(a) {
  return Math.hypot(a[0], a[1], a[2]);
}

__exports.length = length;
function normalize(a) {
  const len = length(a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}

__exports.normalize = normalize;
function isFiniteVec3(a) {
  return Array.isArray(a) && a.length === 3 && a.every(Number.isFinite);
}

__exports.isFiniteVec3 = isFiniteVec3;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/triangles.js */
__awtsmoosModule_194 = (() => {
const __exports = {};
// B"H
var cross = __awtsmoosModule_195.cross;
var normalize = __awtsmoosModule_195.normalize;
var sub = __awtsmoosModule_195.sub;

const TRIANGLE_STRIDE = 10;
__exports.TRIANGLE_STRIDE = TRIANGLE_STRIDE;


/**
 * Chapter 3 — Indexed sparks become colored triangle breath for WebGL.
 * Each vertex is position, flat normal, and procedural RGBA material color.
 */
function meshToTriangles(mesh) {
	const output = [];
	const positions = mesh?.positions || [];
	const indices = mesh?.indices || [];
	const colors = mesh?.colors || [];
	for (let index = 0; index < indices.length; index += 3) {
		const vertexIndices = [indices[index], indices[index + 1], indices[index + 2]];
		const points = vertexIndices.map(vertex => readPoint(positions, vertex));
		if (points.some(point => !point)) continue;
		const normal = faceNormal(points[0], points[1], points[2]);
		for (let corner = 0; corner < 3; corner += 1) {
			pushVertex(output, points[corner], normal, readColor(colors, vertexIndices[corner]));
		}
	}
	return new Float32Array(output);
}


__exports.meshToTriangles = meshToTriangles;
function triangleStats(data) {
	return {
		floats: data.length,
		vertices: data.length / TRIANGLE_STRIDE,
		triangles: data.length / (TRIANGLE_STRIDE * 3),
		stride: TRIANGLE_STRIDE,
		finite: Array.from(data).every(Number.isFinite)
	};
}


__exports.triangleStats = triangleStats;
function readPoint(positions, vertex) {
	const index = vertex * 3;
	const point = [positions[index], positions[index + 1], positions[index + 2]];
	return point.every(Number.isFinite) ? point : null;
}

function readColor(colors, vertex) {
	const index = vertex * 4;
	const color = [colors[index], colors[index + 1], colors[index + 2], colors[index + 3]];
	return color.every(Number.isFinite) ? color : [1, 1, 1, 1];
}

function faceNormal(a, b, c) {
	const normal = normalize(cross(sub(b, a), sub(c, a)));
	return normal.every(Number.isFinite) && Math.hypot(...normal) > 0.0001 ? normal : [0, 1, 0];
}

function pushVertex(output, point, normal, color) {
	output.push(...point, ...normal, ...color);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/summary.js */
__awtsmoosModule_196 = (() => {
const __exports = {};
/**
 * B"H
 * @chapter The mesh confessed its borders before the King who makes borders.
 * Some colors arrive as RGB, some as RGBA; the summary judges them honestly.
 */
function summarizeMesh(mesh) {
  const positions = mesh?.positions || [];
  const indices = mesh?.indices || [];
  const vertexCount = positions.length / 3;
  const bounds = makeBounds();
  for (let i = 0; i < positions.length; i += 3) includePoint(bounds, positions, i);
  return {
    vertices: vertexCount,
    triangles: indices.length / 3,
    bounds: positions.length ? bounds : null,
    hasColors: hasVertexColors(mesh?.colors, vertexCount),
    hasNormals: Array.isArray(mesh?.normals) && mesh.normals.length === positions.length
  };
}


__exports.summarizeMesh = summarizeMesh;
function makeBounds() {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}

function includePoint(bounds, positions, offset) {
  for (let axis = 0; axis < 3; axis += 1) {
    const value = positions[offset + axis];
    bounds.min[axis] = Math.min(bounds.min[axis], value);
    bounds.max[axis] = Math.max(bounds.max[axis], value);
  }
}

function hasVertexColors(colors, vertexCount) {
  if (!Array.isArray(colors)) return false;
  return colors.length === vertexCount * 3 || colors.length === vertexCount * 4;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/validate.js */
__awtsmoosModule_197 = (() => {
const __exports = {};
/**
 * B"H
 * @chapter The broken triangles were counted, not shamed, then lifted.
 */
function validateMesh(mesh, options = {}) {
  const maxAbs = options.maxAbs ?? 100000;
  const issues = [];
  const positions = mesh?.positions;
  const indices = mesh?.indices;
  if (!Array.isArray(positions)) issues.push('positions must be an array');
  if (!Array.isArray(indices)) issues.push('indices must be an array');
  if (issues.length) return { ok: false, issues };
  if (positions.length % 3) issues.push('positions length must be divisible by 3');
  if (indices.length % 3) issues.push('indices length must be divisible by 3');
  positions.forEach((value, i) => {
    if (!Number.isFinite(value)) issues.push(`position ${i} is not finite`);
    if (Math.abs(value) > maxAbs) issues.push(`position ${i} exceeds maxAbs ${maxAbs}`);
  });
  const vertexCount = Math.floor(positions.length / 3);
  indices.forEach((index, i) => {
    if (!Number.isInteger(index)) issues.push(`index ${i} is not an integer`);
    if (index < 0 || index >= vertexCount) issues.push(`index ${i} is out of range`);
  });
  return { ok: issues.length === 0, issues };
}

__exports.validateMesh = validateMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/assembly.js */
__awtsmoosModule_200 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_180.cubeMesh;
var cylinderMesh = __awtsmoosModule_180.cylinderMesh;
var ringMesh = __awtsmoosModule_180.ringMesh;
var sphereMesh = __awtsmoosModule_180.sphereMesh;
var starMesh = __awtsmoosModule_180.starMesh;
var mergeMeshes = __awtsmoosModule_188.mergeMeshes;
var recolorMesh = __awtsmoosModule_188.recolorMesh;
var transformMesh = __awtsmoosModule_188.transformMesh;

/**
 * Chapter 4 — Primitive sparks become designed objects through explicit assembly.
 * Every helper returns raw indexed mesh geometry, never a scene-graph placeholder.
 */
function assemble(...parts) {
	return mergeMeshes(parts);
}


__exports.assemble = assemble;
function box(size, position, color, rotate = [0, 0, 0]) {
	return placed(cubeMesh(), { scale: size, translate: position, rotate, color });
}


__exports.box = box;
function cylinder(radius, height, position, color, rotate = [0, 0, 0], segments = 14) {
	return placed(cylinderMesh({ radius, height, segments }), { translate: position, rotate, color });
}


__exports.cylinder = cylinder;
function sphere(radius, position, color, scale = [1, 1, 1]) {
	return placed(sphereMesh({ radius, rings: 6, segments: 12 }), { scale, translate: position, color });
}


__exports.sphere = sphere;
function ring(outer, inner, position, color, rotate = [0, 0, 0]) {
	return placed(ringMesh({ outer, inner, segments: 20 }), { translate: position, rotate, color });
}


__exports.ring = ring;
function star(radius, depth, position, color, rotate = [0, 0, 0]) {
	return placed(starMesh({ outer: radius, inner: radius * 0.48, depth }), { translate: position, rotate, color });
}


__exports.star = star;
function wheel(radius, width, position, colors) {
	return assemble(
		cylinder(radius, width, position, colors.tire, [0, 0, Math.PI / 2], 16),
		cylinder(radius * 0.48, width * 1.04, position, colors.metal, [0, 0, Math.PI / 2], 12)
	);
}


__exports.wheel = wheel;
function column(radius, height, position, colors) {
	return assemble(
		cylinder(radius, height, position, colors.stone, [0, 0, 0], 14),
		cylinder(radius * 1.25, height * 0.08, [position[0], position[1] - height * 0.48, position[2]], colors.trim),
		cylinder(radius * 1.18, height * 0.08, [position[0], position[1] + height * 0.48, position[2]], colors.trim)
	);
}


__exports.column = column;
function placed(mesh, options = {}) {
	const transformed = transformMesh(mesh, options);
	return options.color ? recolorMesh(transformed, options.color) : transformed;
}


__exports.placed = placed;
function gridPositions(columns, rows, width, height, yStart = 0) {
	const positions = [];
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < columns; column += 1) {
			positions.push([
				(column + 1) / (columns + 1) * width - width / 2,
				yStart + (row + 1) / (rows + 1) * height,
				0
			]);
		}
	}
	return positions;
}

__exports.gridPositions = gridPositions;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/palettes.js */
__awtsmoosModule_201 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_179.createRng;

const BASES = [
	[[0.68, 0.26, 0.18, 1], [0.96, 0.72, 0.28, 1]],
	[[0.18, 0.42, 0.62, 1], [0.22, 0.78, 0.82, 1]],
	[[0.38, 0.22, 0.58, 1], [0.92, 0.42, 0.76, 1]],
	[[0.22, 0.54, 0.32, 1], [0.72, 0.88, 0.34, 1]],
	[[0.62, 0.54, 0.42, 1], [0.92, 0.84, 0.62, 1]]
];

/** Deterministic materials keep every model varied yet replayable. */
function modelPalette(seed = 'model') {
	const random = createRng(seed);
	const base = BASES[Math.floor(random() * BASES.length)];
	return {
		body: vary(base[0], random, 0.13),
		accent: vary(base[1], random, 0.1),
		trim: [0.92, 0.82, 0.62, 1],
		stone: [0.56, 0.54, 0.52, 1],
		glass: [0.12, 0.48, 0.68, 0.88],
		darkGlass: [0.045, 0.16, 0.24, 0.94],
		metal: [0.58, 0.64, 0.7, 1],
		dark: [0.045, 0.04, 0.055, 1],
		tire: [0.022, 0.024, 0.03, 1],
		light: [1, 0.9, 0.42, 1],
		red: [0.92, 0.08, 0.055, 1],
		green: [0.12, 0.48, 0.22, 1],
		wood: [0.42, 0.2, 0.08, 1],
		white: [0.94, 0.94, 0.9, 1]
	};
}


__exports.modelPalette = modelPalette;
function vary(color, random, amount) {
	const shift = (random() - 0.5) * amount * 2;
	return color.map((channel, index) => index === 3 ? channel : clamp(channel + shift));
}

function clamp(value) {
	return Math.max(0.02, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/architecture/helpers.js */
__awtsmoosModule_202 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var column = __awtsmoosModule_200.column;
var gridPositions = __awtsmoosModule_200.gridPositions;

/** Build actual façade depth: windows, lintels, mullions, doors, and roof trim. */
function facadeMesh(options) {
	const { width, height, depth, stories, columns, colors } = options;
	const front = depth / 2 + 0.035;
	const windows = gridPositions(columns, stories, width * 0.88, height * 0.78, height * 0.02);
	const parts = windows.flatMap(([x, y]) => windowParts(x, y, front, width / columns, height / stories, colors));
	parts.push(...doorParts(width, height, front, colors));
	parts.push(box([width * 1.04, height * 0.05, depth * 1.05], [0, height * 0.98, 0], colors.trim));
	return assemble(parts);
}


__exports.facadeMesh = facadeMesh;
function columnRow(count, width, height, depth, colors) {
	return Array.from({ length: count }, (_, index) => {
		const x = count === 1 ? 0 : -width / 2 + index / (count - 1) * width;
		return column(width / count * 0.14, height, [x, height / 2, depth], colors);
	});
}


__exports.columnRow = columnRow;
function steppedRoof(width, depth, y, colors, tiers = 3) {
	return Array.from({ length: tiers }, (_, index) => {
		const scale = 1 - index * 0.15;
		return box(
			[width * scale, 0.18, depth * scale],
			[0, y + index * 0.16, 0],
			index % 2 ? colors.accent : colors.trim
		);
	});
}


__exports.steppedRoof = steppedRoof;
function windowParts(x, y, front, cellWidth, cellHeight, colors) {
	const width = cellWidth * 0.44;
	const height = cellHeight * 0.42;
	return [
		box([width, height, 0.08], [x, y, front], colors.darkGlass),
		box([width * 1.16, 0.07, 0.11], [x, y + height * 0.57, front], colors.trim),
		box([0.055, height, 0.1], [x, y, front + 0.01], colors.metal)
	];
}

function doorParts(width, height, front, colors) {
	return [
		box([width * 0.18, height * 0.25, 0.11], [0, height * 0.13, front], colors.wood),
		box([width * 0.03, height * 0.25, 0.13], [0, height * 0.13, front + 0.01], colors.trim),
		box([width * 0.24, height * 0.025, 0.18], [0, height * 0.265, front], colors.stone)
	];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/architecture/civic.js */
__awtsmoosModule_199 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var column = __awtsmoosModule_200.column;
var cylinder = __awtsmoosModule_200.cylinder;
var placed = __awtsmoosModule_200.placed;
var sphere = __awtsmoosModule_200.sphere;
var star = __awtsmoosModule_200.star;
var modelPalette = __awtsmoosModule_201.modelPalette;
var facadeMesh = __awtsmoosModule_202.facadeMesh;
var steppedRoof = __awtsmoosModule_202.steppedRoof;

/** A tower is stacked massing, correctly elevated façades, crown, and beacon. */
function towerMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'tower');
	const parts = [];
	let y = 0;
	for (let tier = 0; tier < 5; tier += 1) {
		const width = 5.6 - tier * 0.62;
		const height = 2.4 + tier * 0.18;
		const depth = width * 0.86;
		parts.push(box([width, height, depth], [0, y + height / 2, 0], tier % 2 ? colors.body : colors.stone));
		parts.push(placed(facadeMesh({ width, height, depth, stories: 1, columns: 3, colors }), { translate: [0, y, 0] }));
		y += height;
	}
	parts.push(...steppedRoof(3.6, 3.1, y + 0.1, colors, 3));
	parts.push(star(0.72, 0.18, [0, y + 1.35, 0], colors.light, [Math.PI / 2, 0, 0]));
	return assemble(parts);
}


__exports.towerMesh = towerMesh;
/** A study hall gains a portico, steps, drum, dome, windows, and roof symbol. */
function studyHallMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'study-hall');
	const width = 9.6;
	const depth = 7.2;
	const height = 5.4;
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.stone),
		facadeMesh({ width, height, depth, stories: 2, columns: 4, colors }),
		portico(width, depth, colors),
		cylinder(2.2, 1.3, [0, height + 0.65, 0], colors.body),
		sphere(2.35, [0, height + 1.55, 0], colors.accent, [1, 0.58, 1]),
		star(0.8, 0.16, [0, height + 3.28, 0], colors.light, [Math.PI / 2, 0, 0])
	);
}


__exports.studyHallMesh = studyHallMesh;
/** A palace has a central hall, detailed wings, corner towers, and crown line. */
function palaceMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'palace');
	const wingFacade = facadeMesh({ width: 7.2, height: 4.1, depth: 5.3, stories: 2, columns: 3, colors });
	return assemble(
		studyHallMesh({ ...options, palette: colors }),
		box([7.2, 4.1, 5.3], [-7.4, 2.05, 0], colors.body),
		box([7.2, 4.1, 5.3], [7.4, 2.05, 0], colors.body),
		placed(wingFacade, { translate: [-7.4, 0, 0] }),
		placed(wingFacade, { translate: [7.4, 0, 0] }),
		cornerTower(-10.2, colors),
		cornerTower(10.2, colors),
		...[-7.2, -3.6, 0, 3.6, 7.2].map(x => column(0.24, 4.2, [x, 2.1, 3.7], colors)),
		...[-8, -4, 0, 4, 8].map(x => star(0.42, 0.12, [x, 6.4, 0], colors.light, [Math.PI / 2, 0, 0]))
	);
}


__exports.palaceMesh = palaceMesh;
function portico(width, depth, colors) {
	return assemble(
		box([width * 0.62, 0.22, 2.4], [0, 4.3, depth / 2 + 0.85], colors.trim),
		...[-2.2, -0.75, 0.75, 2.2].map(x => column(0.23, 4, [x, 2, depth / 2 + 1.25], colors)),
		...Array.from({ length: 4 }, (_, index) => box(
			[width * 0.72 - index * 0.4, 0.18, 0.8],
			[0, index * 0.16, depth / 2 + 1.9 + index * 0.28],
			colors.stone
		))
	);
}

function cornerTower(x, colors) {
	return assemble(
		cylinder(1.65, 6.2, [x, 3.1, 0], colors.stone, [0, 0, 0], 16),
		cylinder(1.95, 0.32, [x, 6.24, 0], colors.accent, [0, 0, 0], 16),
		sphere(1.2, [x, 7.05, 0], colors.body, [1, 0.68, 1])
	);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/signs.js */
__awtsmoosModule_204 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var modelPalette = __awtsmoosModule_201.modelPalette;

/**
 * Chapter 5 — A sign is modeled as frame, face, lamps, and generated glyph bars.
 * No image texture pretends to be geometry.
 */
function storefrontSignMesh(options = {}) {
	const seed = options.seed || 'sign';
	const colors = options.palette || modelPalette(seed);
	const width = options.width || 3.4;
	const height = options.height || 0.78;
	const depth = options.depth || 0.18;
	const random = createRng(seed);
	const parts = [
		box([width, height, depth], [0, 0, 0], colors.dark),
		box([width * 0.92, height * 0.78, depth * 1.08], [0, 0, depth * 0.08], colors.accent),
		...glyphRow(width * 0.76, height * 0.48, depth * 0.7, random, colors.light)
	];
	if (options.lamps !== false) parts.push(...signLamps(width, height, depth, colors));
	return assemble(parts);
}


__exports.storefrontSignMesh = storefrontSignMesh;
function streetSignMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'street-sign');
	return assemble(
		box([0.12, 2.4, 0.12], [0, 1.2, 0], colors.metal),
		storefrontSignMesh({ ...options, palette: colors, width: 2.2, height: 0.58, depth: 0.14, lamps: false }),
		box([0.86, 0.16, 0.14], [0, 0.78, 0], colors.accent)
	);
}


__exports.streetSignMesh = streetSignMesh;
function glyphRow(width, height, depth, random, color) {
	const count = 4;
	const cell = width / count;
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const x = -width / 2 + cell * (index + 0.5);
		parts.push(...glyph(x, cell * 0.55, height, depth, random, color));
	}
	return parts;
}

function glyph(x, width, height, depth, random, color) {
	const lean = (random() - 0.5) * 0.35;
	return [
		box([width * 0.18, height, depth], [x, 0, 0.13], color, [0, 0, lean]),
		box([width, height * 0.18, depth], [x, height * 0.34, 0.13], color),
		box([width * (0.55 + random() * 0.3), height * 0.16, depth], [x + width * 0.08, -height * 0.2, 0.13], color)
	];
}

function signLamps(width, height, depth, colors) {
	return [-1, 1].map(side => box(
		[0.18, 0.18, depth * 1.5],
		[side * width * 0.43, height * 0.57, depth * 0.2],
		colors.light
	));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/architecture/residential.js */
__awtsmoosModule_203 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var placed = __awtsmoosModule_200.placed;
var modelPalette = __awtsmoosModule_201.modelPalette;
var storefrontSignMesh = __awtsmoosModule_204.storefrontSignMesh;
var facadeMesh = __awtsmoosModule_202.facadeMesh;
var steppedRoof = __awtsmoosModule_202.steppedRoof;

/** A townhouse is walls, recessed windows, cornice, roof planes, and chimney. */
function townhouseMesh(options = {}) {
	const seed = options.seed || 'townhouse';
	const random = createRng(seed);
	const colors = options.palette || modelPalette(seed);
	const width = 4.4 + random() * 1.4;
	const depth = 3.8 + random() * 1.3;
	const stories = 2 + Math.floor(random() * 3);
	const height = stories * (1.45 + random() * 0.25);
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.body),
		facadeMesh({ width, height, depth, stories, columns: 3, colors }),
		gableRoof(width, depth, height, colors),
		box([0.45, 1.1, 0.5], [width * 0.27, height + 0.7, 0], colors.stone)
	);
}


__exports.townhouseMesh = townhouseMesh;
/** A shop has glass, structural frames, striped awning, roof trim, and wall sign. */
function shopMesh(options = {}) {
	const seed = options.seed || 'shop';
	const colors = options.palette || modelPalette(seed);
	const width = 6.2;
	const depth = 4.6;
	const height = 4.8;
	const front = depth / 2 + 0.04;
	const sign = storefrontSignMesh({ seed, palette: colors, width: width * 0.72, height: 0.72 });
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.body),
		box([width * 0.82, height * 0.48, 0.1], [0, height * 0.32, front], colors.darkGlass),
		shopFrames(width, height, front, colors),
		awning(width, height, front, colors),
		placed(sign, { translate: [0, height * 0.79, front + 0.15] }),
		steppedRoof(width, depth, height + 0.08, colors, 2)
	);
}


__exports.shopMesh = shopMesh;
function gableRoof(width, depth, height, colors) {
	return assemble(
		box([width * 0.62, 0.22, depth * 1.08], [-width * 0.22, height + width * 0.14, 0], colors.accent, [0, 0, -0.42]),
		box([width * 0.62, 0.22, depth * 1.08], [width * 0.22, height + width * 0.14, 0], colors.accent, [0, 0, 0.42])
	);
}

function shopFrames(width, height, front, colors) {
	return [-0.34, 0, 0.34].map(offset => box(
		[0.09, height * 0.5, 0.14],
		[width * offset, height * 0.32, front + 0.02],
		colors.metal
	));
}

function awning(width, height, front, colors) {
	return assemble(
		box([width * 0.95, 0.16, 1.1], [0, height * 0.61, front + 0.42], colors.accent, [0.16, 0, 0]),
		...[-0.38, -0.13, 0.13, 0.38].map(offset => box(
			[width * 0.04, 0.17, 1.12],
			[width * offset, height * 0.61, front + 0.43],
			colors.trim,
			[0.16, 0, 0]
		))
	);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/botany/components.js */
__awtsmoosModule_206 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var cylinder = __awtsmoosModule_200.cylinder;

/**
 * The Awtsmoos reveals leaves and petals through light faceted vessels. Thin boxes
 * preserve silhouette while avoiding hundreds of triangles per tiny botanical part.
 */
function stem(position, height, radius, color, lean = [0, 0, 0]) {
	return cylinder(radius, height, [position[0], position[1] + height * 0.5, position[2]], color, lean, 8);
}


__exports.stem = stem;
function blade(position, height, width, color, angle = 0, lean = 0) {
	return box(
		[width, height, width * 0.22],
		[position[0], position[1] + height * 0.5, position[2]],
		color,
		[lean, angle, 0]
	);
}


__exports.blade = blade;
function broadLeaf(position, length, width, color, angle, rise = 0.2) {
	const x = position[0] + Math.cos(angle) * length * 0.32;
	const z = position[2] + Math.sin(angle) * length * 0.32;
	return box(
		[length, width, 0.035],
		[x, position[1] + rise, z],
		color,
		[0.16, -angle, 0]
	);
}


__exports.broadLeaf = broadLeaf;
function petalRing(center, count, radius, petalLength, color, vertical = false) {
	const petals = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const x = center[0] + Math.cos(angle) * radius;
		const z = center[2] + Math.sin(angle) * radius;
		petals.push(box(
			vertical ? [0.08, petalLength, 0.18] : [petalLength, 0.06, 0.18],
			[x, center[1], z],
			color,
			vertical ? [0, -angle, 0.22] : [0, -angle, 0]
		));
	}
	return assemble(petals);
}


__exports.petalRing = petalRing;
function roundedCluster(center, count, radius, color, scale = [1, 1, 1]) {
	const flowers = [];
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2;
		const ring = index % 3 === 0 ? radius * 0.35 : radius * 0.72;
		flowers.push(box(
			[radius * scale[0], radius * scale[1], radius * scale[2]],
			[
				center[0] + Math.cos(angle) * ring,
				center[1] + ((index % 4) - 1.5) * radius * 0.18,
				center[2] + Math.sin(angle) * ring
			],
			color,
			[index * 0.13, angle, 0]
		));
	}
	return assemble(flowers);
}


__exports.roundedCluster = roundedCluster;
function branch(position, length, radius, color, angle, lift = 0.55) {
	const x = position[0] + Math.cos(angle) * length * 0.38;
	const z = position[2] + Math.sin(angle) * length * 0.38;
	return cylinder(
		radius,
		length,
		[x, position[1] + length * lift * 0.5, z],
		color,
		[Math.sin(angle) * (1.1 - lift), 0, -Math.cos(angle) * (1.1 - lift)],
		8
	);
}

__exports.branch = branch;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/botany/flowers.js */
__awtsmoosModule_205 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var sphere = __awtsmoosModule_200.sphere;
var modelPalette = __awtsmoosModule_201.modelPalette;
var blade = __awtsmoosModule_206.blade;
var broadLeaf = __awtsmoosModule_206.broadLeaf;
var petalRing = __awtsmoosModule_206.petalRing;
var roundedCluster = __awtsmoosModule_206.roundedCluster;
var stem = __awtsmoosModule_206.stem;

/** Composite flowers preserve a visible disk, ray petals, stems, and basal leaves. */
function compositeFlowerMesh(options = {}) {
	const seed = options.seed || 'composite-flower';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const parts = [];
	for (let index = 0; index < 5; index += 1) {
		const angle = index / 5 * Math.PI * 2;
		const height = 1.1 + random() * 0.45;
		const center = [Math.cos(angle) * 0.32, height, Math.sin(angle) * 0.32];
		parts.push(stem([center[0], 0, center[2]], height, 0.035, colors.green));
		parts.push(petalRing(center, 10, 0.22, 0.34, colors.white));
		parts.push(sphere(0.16, center, colors.light, [1, 0.4, 1]));
		parts.push(broadLeaf([center[0], 0.25, center[2]], 0.48, 0.22, colors.green, angle));
	}
	return assemble(parts);
}


__exports.compositeFlowerMesh = compositeFlowerMesh;
/** Iris geometry uses sword leaves plus three standards and three falling petals. */
function irisClumpMesh(options = {}) {
	const seed = options.seed || 'iris-clump';
	const colors = modelPalette(seed);
	const purple = [0.44, 0.22, 0.72, 1];
	const gold = [0.95, 0.66, 0.12, 1];
	const parts = [];
	for (let index = 0; index < 9; index += 1) {
		const angle = index / 9 * Math.PI * 2;
		parts.push(blade([Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18], 1.1 + index % 3 * 0.12, 0.11, colors.green, angle, Math.sin(angle) * 0.12));
	}
	parts.push(stem([0, 0, 0], 1.45, 0.045, colors.green));
	parts.push(petalRing([0, 1.48, 0], 3, 0.18, 0.5, purple, true));
	parts.push(petalRing([0, 1.38, 0], 3, 0.28, 0.42, purple));
	parts.push(sphere(0.11, [0, 1.43, 0], gold, [1, 0.6, 1]));
	return assemble(parts);
}


__exports.irisClumpMesh = irisClumpMesh;
/** Layered rose heads and serrated-looking leaf clusters separate roses from blobs. */
function roseBushMesh(options = {}) {
	const seed = options.seed || 'rose-bush';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const bloom = [0.8 + random() * 0.16, 0.08 + random() * 0.12, 0.18 + random() * 0.18, 1];
	const parts = [stem([0, 0, 0], 1.25, 0.08, colors.wood)];
	for (let index = 0; index < 5; index += 1) {
		const angle = index / 5 * Math.PI * 2;
		const radius = 0.34 + random() * 0.28;
		const height = 0.72 + random() * 0.62;
		const center = [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
		parts.push(stem([center[0], 0.35, center[2]], height - 0.35, 0.035, colors.wood));
		parts.push(petalRing(center, 8, 0.13, 0.24, bloom));
		parts.push(petalRing([center[0], center[1] + 0.03, center[2]], 5, 0.08, 0.17, bloom));
		parts.push(broadLeaf([center[0] * 0.55, height * 0.55, center[2] * 0.55], 0.34, 0.2, colors.green, angle));
	}
	return assemble(parts);
}


__exports.roseBushMesh = roseBushMesh;
/** Tall flower spikes repeat tubular blooms along a clearly readable vertical raceme. */
function flowerSpikeMesh(options = {}) {
	const seed = options.seed || 'flower-spike';
	const colors = modelPalette(seed);
	const bloom = [0.62, 0.28, 0.78, 1];
	const parts = [stem([0, 0, 0], 1.9, 0.045, colors.green)];
	for (let index = 0; index < 6; index += 1) {
		const angle = index * 2.35;
		parts.push(broadLeaf([0, 0.16 + index * 0.08, 0], 0.42, 0.22, colors.green, angle));
	}
	for (let row = 0; row < 7; row += 1) {
		for (let side = 0; side < 2; side += 1) {
			const angle = row * 1.72 + side * Math.PI;
			parts.push(sphere(0.15, [Math.cos(angle) * 0.16, 0.92 + row * 0.14, Math.sin(angle) * 0.16], bloom, [0.72, 1.15, 0.72]));
		}
	}
	parts.push(roundedCluster([0, 1.94, 0], 5, 0.14, colors.accent, [0.7, 1, 0.7]));
	return assemble(parts);
}

__exports.flowerSpikeMesh = flowerSpikeMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/botany/foliage.js */
__awtsmoosModule_207 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var sphere = __awtsmoosModule_200.sphere;
var modelPalette = __awtsmoosModule_201.modelPalette;
var blade = __awtsmoosModule_206.blade;
var broadLeaf = __awtsmoosModule_206.broadLeaf;
var branch = __awtsmoosModule_206.branch;
var roundedCluster = __awtsmoosModule_206.roundedCluster;
var stem = __awtsmoosModule_206.stem;

/** Rounded flowering shrubs carry woody volume, broad leaves, and visible panicles. */
function panicleShrubMesh(options = {}) {
	const seed = options.seed || 'panicle-shrub';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const bloom = [0.68 + random() * 0.2, 0.58 + random() * 0.22, 0.84, 1];
	const parts = [];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const length = 0.75 + random() * 0.5;
		const center = [Math.cos(angle) * length * 0.72, 0.72 + random() * 0.55, Math.sin(angle) * length * 0.72];
		parts.push(branch([0, 0.12, 0], length, 0.045, colors.wood, angle, 0.78));
		parts.push(broadLeaf([center[0] * 0.55, center[1] * 0.45, center[2] * 0.55], 0.42, 0.28, colors.green, angle));
		parts.push(roundedCluster(center, 7, 0.24, bloom, [1, 0.82, 1]));
	}
	return assemble(parts);
}


__exports.panicleShrubMesh = panicleShrubMesh;
/** Hosta leaves radiate as broad ribbed blades around a lifted flower raceme. */
function hostaClumpMesh(options = {}) {
	const seed = options.seed || 'hosta-clump';
	const colors = modelPalette(seed);
	const parts = [];
	for (let index = 0; index < 12; index += 1) {
		const angle = index / 12 * Math.PI * 2;
		const length = 0.72 + index % 3 * 0.1;
		parts.push(broadLeaf([0, 0.08, 0], length, 0.42, colors.green, angle, 0.18 + index % 2 * 0.08));
	}
	parts.push(stem([0, 0, 0], 1.35, 0.03, colors.green));
	for (let row = 0; row < 5; row += 1) {
		const angle = row * 2.4;
		parts.push(sphere(0.11, [Math.cos(angle) * 0.1, 0.86 + row * 0.12, Math.sin(angle) * 0.1], colors.white, [0.65, 1.1, 0.65]));
	}
	return assemble(parts);
}


__exports.hostaClumpMesh = hostaClumpMesh;
/** Fern fronds use a visible spine and repeated leaflets instead of a green cloud. */
function fernClumpMesh(options = {}) {
	const seed = options.seed || 'fern-clump';
	const colors = modelPalette(seed);
	const parts = [];
	for (let frond = 0; frond < 7; frond += 1) {
		const angle = frond / 7 * Math.PI * 2;
		const height = 0.82 + frond % 3 * 0.12;
		parts.push(blade([Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08], height, 0.035, colors.green, angle, 0.28));
		for (let row = 1; row < 7; row += 1) {
			const progress = row / 7;
			const center = [Math.cos(angle) * progress * 0.52, progress * height * 0.82, Math.sin(angle) * progress * 0.52];
			parts.push(broadLeaf(center, 0.25 * (1 - progress * 0.45), 0.1, colors.green, angle + Math.PI / 2, 0.03));
			parts.push(broadLeaf(center, 0.25 * (1 - progress * 0.45), 0.1, colors.green, angle - Math.PI / 2, 0.03));
		}
	}
	return assemble(parts);
}


__exports.fernClumpMesh = fernClumpMesh;
/** Grass clumps separate fine blades from elevated seed plumes for distance readability. */
function grassClumpMesh(options = {}) {
	const seed = options.seed || 'grass-clump';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const straw = [0.72, 0.58, 0.28, 1];
	const parts = [];
	for (let index = 0; index < 22; index += 1) {
		const angle = index / 22 * Math.PI * 2 + random() * 0.18;
		const radius = random() * 0.22;
		parts.push(blade([Math.cos(angle) * radius, 0, Math.sin(angle) * radius], 0.62 + random() * 0.62, 0.025, colors.green, angle, 0.2 + random() * 0.24));
	}
	for (let index = 0; index < 6; index += 1) {
		const angle = index / 6 * Math.PI * 2;
		parts.push(stem([Math.cos(angle) * 0.16, 0, Math.sin(angle) * 0.16], 1.18 + index % 2 * 0.16, 0.018, straw));
		parts.push(sphere(0.1, [Math.cos(angle) * 0.16, 1.2 + index % 2 * 0.16, Math.sin(angle) * 0.16], straw, [0.48, 2.4, 0.48]));
	}
	return assemble(parts);
}

__exports.grassClumpMesh = grassClumpMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/botany/trees.js */
__awtsmoosModule_208 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var cylinder = __awtsmoosModule_200.cylinder;
var modelPalette = __awtsmoosModule_201.modelPalette;
var branch = __awtsmoosModule_206.branch;
var roundedCluster = __awtsmoosModule_206.roundedCluster;

/** Cypress crowns rise as narrow stacked columns rather than generic green balls. */
function cypressTreeMesh(options = {}) {
	const seed = options.seed || 'cypress-tree';
	const colors = modelPalette(seed);
	const parts = [cylinder(0.26, 3.2, [0, 1.6, 0], colors.wood, [0, 0, 0], 10)];
	for (let level = 0; level < 6; level += 1) {
		const progress = level / 5;
		parts.push(box([0.78 - progress * 0.22, 1.35, 0.78 - progress * 0.22], [0, 1.1 + level * 0.62, 0], colors.green, [0, level * 0.28, 0]));
	}
	return assemble(parts);
}


__exports.cypressTreeMesh = cypressTreeMesh;
/** Broadleaf trees expose trunk, radial limbs, and separated crown pads. */
function broadleafTreeMesh(options = {}) {
	const seed = options.seed || 'broadleaf-tree';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const parts = [cylinder(0.38, 3.4, [0, 1.7, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		const length = 1.2 + random() * 0.9;
		parts.push(branch([0, 2.2, 0], length, 0.1, colors.wood, angle, 0.7));
		parts.push(box([1.8, 1.1, 1.5], [Math.cos(angle) * length * 0.8, 3 + random() * 1.1, Math.sin(angle) * length * 0.8], colors.green, [0.08, angle, 0.12]));
	}
	parts.push(box([2.1, 1.5, 1.9], [0, 4, 0], colors.green, [0.08, 0.34, 0]));
	return assemble(parts);
}


__exports.broadleafTreeMesh = broadleafTreeMesh;
/** Willow crowns hang in curtains around an open center and water-facing trunk. */
function willowTreeMesh(options = {}) {
	const seed = options.seed || 'willow-tree';
	const colors = modelPalette(seed);
	const willow = [0.48, 0.68, 0.24, 1];
	const parts = [cylinder(0.34, 3.8, [0, 1.9, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 9; index += 1) {
		const angle = index / 9 * Math.PI * 2;
		const radius = 1.3 + index % 3 * 0.28;
		parts.push(branch([0, 2.55, 0], radius, 0.07, colors.wood, angle, 0.62));
		for (let drop = 0; drop < 4; drop += 1) {
			const x = Math.cos(angle) * radius * (0.58 + drop * 0.08);
			const z = Math.sin(angle) * radius * (0.58 + drop * 0.08);
			parts.push(box([0.38, 1.05, 0.38], [x, 3.4 - drop * 0.55, z], willow, [0, angle, 0.08]));
		}
	}
	return assemble(parts);
}


__exports.willowTreeMesh = willowTreeMesh;
/** Pine trees use a trunk and distinct tiered conical branch masses. */
function pineTreeMesh(options = {}) {
	const seed = options.seed || 'pine-tree';
	const colors = modelPalette(seed);
	const pine = [0.12, 0.34, 0.18, 1];
	const parts = [cylinder(0.3, 4.7, [0, 2.35, 0], colors.wood, [0, 0, 0], 10)];
	for (let level = 0; level < 5; level += 1) {
		const radius = 1.7 - level * 0.26;
		for (let index = 0; index < 6; index += 1) {
			const angle = index / 6 * Math.PI * 2 + level * 0.34;
			parts.push(branch([0, 1.45 + level * 0.72, 0], radius, 0.06, colors.wood, angle, 0.48));
			parts.push(box([1.25, 0.42, 0.7], [Math.cos(angle) * radius * 0.72, 1.72 + level * 0.72, Math.sin(angle) * radius * 0.72], pine, [0, angle, 0.06]));
		}
	}
	return assemble(parts);
}


__exports.pineTreeMesh = pineTreeMesh;
/** Flowering trees preserve visible branch structure and blossom constellations. */
function floweringTreeMesh(options = {}) {
	const seed = options.seed || 'flowering-tree';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const blossom = [0.98, 0.58 + random() * 0.22, 0.72 + random() * 0.16, 1];
	const parts = [cylinder(0.3, 3, [0, 1.5, 0], colors.wood, [0, 0, 0], 11)];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const length = 1.1 + random() * 0.7;
		const center = [Math.cos(angle) * length * 0.82, 2.7 + random() * 1.2, Math.sin(angle) * length * 0.82];
		parts.push(branch([0, 1.9, 0], length, 0.08, colors.wood, angle, 0.72));
		parts.push(box([1.35, 0.85, 1.12], center, colors.green, [0.08, angle, 0.1]));
		parts.push(roundedCluster([center[0], center[1] + 0.18, center[2]], 5, 0.19, blossom, [1, 0.7, 1]));
	}
	return assemble(parts);
}


__exports.floweringTreeMesh = floweringTreeMesh;
/** Olive trees combine a gnarled multi-stem base with airy silver leaf pads. */
function oliveTreeMesh(options = {}) {
	const seed = options.seed || 'olive-tree';
	const colors = modelPalette(seed);
	const silver = [0.48, 0.58, 0.38, 1];
	const parts = [
		cylinder(0.28, 2.8, [-0.18, 1.35, 0], colors.wood, [0, 0, -0.12], 10),
		cylinder(0.22, 2.5, [0.2, 1.2, 0.08], colors.wood, [0, 0, 0.16], 9)
	];
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		parts.push(branch([0, 1.9, 0], 1.15, 0.065, colors.wood, angle, 0.66));
		parts.push(box([1.2, 0.5, 0.75], [Math.cos(angle) * 0.9, 2.6 + index % 3 * 0.28, Math.sin(angle) * 0.9], silver, [0.08, angle, 0.12]));
	}
	return assemble(parts);
}

__exports.oliveTreeMesh = oliveTreeMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/nature.js */
__awtsmoosModule_209 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_179.createRng;
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var cylinder = __awtsmoosModule_200.cylinder;
var sphere = __awtsmoosModule_200.sphere;
var star = __awtsmoosModule_200.star;
var modelPalette = __awtsmoosModule_201.modelPalette;

/** A tree grows as trunk, branch joints, layered crown, and fruit sparks. */
function treeModelMesh(options = {}) {
	const seed = options.seed || 'tree-model';
	const random = createRng(seed);
	const colors = options.palette || modelPalette(seed);
	const parts = [cylinder(0.42, 3.8, [0, 1.9, 0], colors.wood, [0, 0, 0], 12)];
	for (let index = 0; index < 7; index += 1) {
		const angle = index / 7 * Math.PI * 2;
		const radius = 0.9 + random() * 0.75;
		const height = 3.2 + random() * 1.35;
		parts.push(cylinder(0.12, radius * 1.3, [Math.cos(angle) * radius * 0.38, height - 0.55, Math.sin(angle) * radius * 0.38], colors.wood, [Math.sin(angle) * 0.9, 0, -Math.cos(angle) * 0.9], 9));
		parts.push(sphere(0.92 + random() * 0.34, [Math.cos(angle) * radius, height, Math.sin(angle) * radius], colors.green, [1, 0.82, 1]));
	}
	parts.push(sphere(1.15, [0, 4.45, 0], colors.green, [1, 0.9, 1]));
	return assemble(parts);
}


__exports.treeModelMesh = treeModelMesh;
function planterMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'planter');
	return assemble(
		box([2.4, 0.72, 1.5], [0, 0.36, 0], colors.stone),
		box([2.08, 0.48, 1.2], [0, 0.66, 0], colors.dark),
		...[-0.65, 0, 0.65].map(x => sphere(0.58, [x, 1.12, 0], colors.green, [1, 0.85, 1]))
	);
}


__exports.planterMesh = planterMesh;
function hedgeMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'hedge');
	return assemble(
		box([4.6, 0.38, 1.15], [0, 0.19, 0], colors.stone),
		...Array.from({ length: 6 }, (_, index) => sphere(0.72, [-1.9 + index * 0.76, 0.88, 0], colors.green, [1, 0.82, 0.88]))
	);
}


__exports.hedgeMesh = hedgeMesh;
function monumentMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'monument');
	return assemble(
		box([3.2, 0.5, 3.2], [0, 0.25, 0], colors.stone),
		box([2.3, 0.42, 2.3], [0, 0.7, 0], colors.trim),
		cylinder(0.58, 4.2, [0, 2.9, 0], colors.stone, [0, 0, 0], 12),
		star(1.28, 0.24, [0, 5.35, 0], colors.light, [Math.PI / 2, 0, 0])
	);
}

__exports.monumentMesh = monumentMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/street.js */
__awtsmoosModule_210 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var cylinder = __awtsmoosModule_200.cylinder;
var placed = __awtsmoosModule_200.placed;
var ring = __awtsmoosModule_200.ring;
var sphere = __awtsmoosModule_200.sphere;
var modelPalette = __awtsmoosModule_201.modelPalette;
var storefrontSignMesh = __awtsmoosModule_204.storefrontSignMesh;
var streetSignMesh = __awtsmoosModule_204.streetSignMesh;

function benchMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bench');
	return assemble(
		...[-0.45, 0, 0.45].map(z => box([3.2, 0.12, 0.28], [0, 0.9 + z * 0.6, z], colors.wood, [z > 0 ? -0.18 : 0, 0, 0])),
		...[-1, 1].flatMap(x => [0, 0.55].map(z => box([0.18, 1, 0.18], [x * 1.2, 0.5, z], colors.metal))),
		box([3.35, 0.14, 0.2], [0, 1.35, 0.48], colors.wood)
	);
}


__exports.benchMesh = benchMesh;
function streetLampMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'lamp');
	return assemble(
		cylinder(0.16, 5.2, [0, 2.6, 0], colors.metal, [0, 0, 0], 12),
		cylinder(0.48, 0.18, [0, 0.09, 0], colors.stone, [0, 0, 0], 12),
		box([1.1, 0.12, 0.12], [0.48, 5.05, 0], colors.metal, [0, 0, -0.18]),
		box([0.72, 0.18, 0.62], [0.93, 4.78, 0], colors.dark),
		sphere(0.31, [0.93, 4.72, 0], colors.light, [1, 0.76, 1])
	);
}


__exports.streetLampMesh = streetLampMesh;
function kioskMesh(options = {}) {
	const seed = options.seed || 'kiosk';
	const colors = options.palette || modelPalette(seed);
	const sign = storefrontSignMesh({ seed, palette: colors, width: 3.0, height: 0.62 });
	return assemble(
		box([3.8, 3.1, 3.2], [0, 1.55, 0], colors.body),
		box([2.8, 1.25, 0.12], [0, 1.75, 1.64], colors.darkGlass),
		box([4.4, 0.24, 3.8], [0, 3.22, 0], colors.accent),
		...[-1, 1].map(x => box([0.18, 3.0, 0.18], [x * 1.7, 1.5, 1.5], colors.trim)),
		placed(sign, { translate: [0, 2.75, 1.8] })
	);
}


__exports.kioskMesh = kioskMesh;
function fountainMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'fountain');
	return assemble(
		cylinder(2.8, 0.55, [0, 0.28, 0], colors.stone, [0, 0, 0], 24),
		ring(2.5, 1.85, [0, 0.58, 0], colors.glass),
		cylinder(0.42, 2.4, [0, 1.5, 0], colors.stone, [0, 0, 0], 16),
		cylinder(1.35, 0.3, [0, 2.42, 0], colors.stone, [0, 0, 0], 20),
		sphere(0.48, [0, 2.88, 0], colors.light),
		...Array.from({ length: 8 }, (_, index) => sphere(
			0.18,
			[Math.cos(index / 8 * Math.PI * 2) * 1.6, 1.1, Math.sin(index / 8 * Math.PI * 2) * 1.6],
			colors.glass,
			[0.72, 1.8, 0.72]
		))
	);
}


__exports.fountainMesh = fountainMesh;
function streetSignModel(options = {}) {
	return streetSignMesh(options);
}


__exports.streetSignModel = streetSignModel;
function bollardMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bollard');
	return assemble(
		cylinder(0.25, 1.25, [0, 0.63, 0], colors.metal, [0, 0, 0], 12),
		cylinder(0.34, 0.12, [0, 1.24, 0], colors.accent, [0, 0, 0], 12),
		cylinder(0.42, 0.12, [0, 0.06, 0], colors.stone, [0, 0, 0], 12)
	);
}

__exports.bollardMesh = bollardMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/vehicles/helpers.js */
__awtsmoosModule_212 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var wheel = __awtsmoosModule_200.wheel;

/** Assemble a complete road vehicle with body, cabin, glass, lights, and wheels. */
function vehicleBody(options) {
	const { width, length, height, colors, cabin = 0.52, hood = 0.28 } = options;
	const baseY = height * 0.27;
	return assemble(
		box([width, height * 0.46, length], [0, baseY, 0], colors.body),
		box([width * 0.84, height * 0.52, length * cabin], [0, height * 0.7, length * 0.04], colors.body),
		glassCabin(width, length, height, colors, cabin),
		box([width * 0.94, height * 0.12, length * hood], [0, height * 0.48, -length * 0.35], colors.accent),
		wheelSet(width, length, height, colors),
		lightSet(width, length, height, colors),
		box([width * 0.96, height * 0.08, 0.12], [0, height * 0.18, -length * 0.51], colors.metal),
		box([width * 0.96, height * 0.08, 0.12], [0, height * 0.18, length * 0.51], colors.metal)
	);
}


__exports.vehicleBody = vehicleBody;
function wheelSet(width, length, height, colors, pairs = 2) {
	const parts = [];
	for (let pair = 0; pair < pairs; pair += 1) {
		const z = pairs === 1 ? 0 : -length * 0.33 + pair / (pairs - 1) * length * 0.66;
		for (const side of [-1, 1]) parts.push(wheel(height * 0.24, width * 0.12, [side * width * 0.52, height * 0.22, z], colors));
	}
	return parts;
}


__exports.wheelSet = wheelSet;
function windowBand(width, height, length, y, colors, count = 5) {
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const z = -length * 0.36 + index / Math.max(1, count - 1) * length * 0.72;
		for (const side of [-1, 1]) parts.push(box([0.08, height, length / count * 0.62], [side * width * 0.505, y, z], colors.darkGlass));
	}
	return parts;
}


__exports.windowBand = windowBand;
function glassCabin(width, length, height, colors, cabin) {
	return [
		box([width * 0.68, height * 0.3, 0.07], [0, height * 0.78, -length * cabin * 0.27], colors.glass, [-0.18, 0, 0]),
		box([width * 0.68, height * 0.3, 0.07], [0, height * 0.78, length * cabin * 0.33], colors.darkGlass, [0.18, 0, 0]),
		box([0.07, height * 0.3, length * cabin * 0.56], [-width * 0.43, height * 0.78, length * 0.03], colors.glass),
		box([0.07, height * 0.3, length * cabin * 0.56], [width * 0.43, height * 0.78, length * 0.03], colors.glass)
	];
}

function lightSet(width, length, height, colors) {
	return [
		...[-1, 1].map(side => box([width * 0.18, height * 0.13, 0.08], [side * width * 0.31, height * 0.34, -length * 0.515], colors.light)),
		...[-1, 1].map(side => box([width * 0.16, height * 0.12, 0.08], [side * width * 0.32, height * 0.34, length * 0.515], colors.red))
	];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/vehicles/road.js */
__awtsmoosModule_211 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_200.assemble;
var box = __awtsmoosModule_200.box;
var placed = __awtsmoosModule_200.placed;
var modelPalette = __awtsmoosModule_201.modelPalette;
var storefrontSignMesh = __awtsmoosModule_204.storefrontSignMesh;
var vehicleBody = __awtsmoosModule_212.vehicleBody;
var wheelSet = __awtsmoosModule_212.wheelSet;
var windowBand = __awtsmoosModule_212.windowBand;

function carMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'car');
	return vehicleBody({ width: 2.1, length: 4.5, height: 1.5, colors });
}


__exports.carMesh = carMesh;
function taxiMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'taxi');
	colors.body = [0.94, 0.68, 0.08, 1];
	return assemble(
		vehicleBody({ width: 2.1, length: 4.6, height: 1.5, colors }),
		box([0.78, 0.24, 0.38], [0, 1.65, 0.08], colors.light)
	);
}


__exports.taxiMesh = taxiMesh;
function vanMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'van');
	return assemble(
		vehicleBody({ width: 2.35, length: 5.2, height: 2.2, colors, cabin: 0.7, hood: 0.18 }),
		...windowBand(2.35, 0.48, 5.2, 1.48, colors, 3)
	);
}


__exports.vanMesh = vanMesh;
function busMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bus');
	const width = 2.75;
	const length = 8.4;
	const height = 3.15;
	return assemble(
		box([width, height, length], [0, height / 2, 0], colors.body),
		...windowBand(width, 0.82, length, height * 0.7, colors, 7),
		...wheelSet(width, length, 1.6, colors, 3),
		box([width * 0.78, 0.72, 0.08], [0, height * 0.7, -length * 0.505], colors.glass),
		box([width * 0.44, height * 0.55, 0.08], [width * 0.18, height * 0.38, -length * 0.51], colors.darkGlass),
		box([width * 0.76, 0.2, 0.12], [0, 0.32, -length * 0.515], colors.metal)
	);
}


__exports.busMesh = busMesh;
function truckMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'truck');
	return assemble(
		vehicleBody({ width: 2.6, length: 3.6, height: 2.25, colors, cabin: 0.58, hood: 0.12 }),
		box([2.9, 2.9, 5.2], [0, 1.75, 3.25], colors.accent),
		box([2.56, 2.35, 0.1], [0, 1.72, 5.87], colors.metal),
		...wheelSet(2.8, 6.5, 1.8, colors, 3)
	);
}


__exports.truckMesh = truckMesh;
function marketCartMesh(options = {}) {
	const seed = options.seed || 'market-cart';
	const colors = options.palette || modelPalette(seed);
	const sign = storefrontSignMesh({ seed, palette: colors, width: 2.2, height: 0.54, lamps: false });
	return assemble(
		box([2.6, 1.15, 3.4], [0, 0.92, 0], colors.wood),
		...wheelSet(2.6, 3.4, 1.6, colors, 2),
		box([3.1, 0.18, 3.9], [0, 2.45, 0], colors.accent),
		...[-1, 1].flatMap(x => [-1, 1].map(z => box([0.1, 2.5, 0.1], [x * 1.2, 1.35, z * 1.45], colors.metal))),
		placed(sign, { translate: [0, 1.72, 1.86] })
	);
}

__exports.marketCartMesh = marketCartMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/models/catalog.js */
__awtsmoosModule_198 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var palaceMesh = __awtsmoosModule_199.palaceMesh;
var studyHallMesh = __awtsmoosModule_199.studyHallMesh;
var towerMesh = __awtsmoosModule_199.towerMesh;
var shopMesh = __awtsmoosModule_203.shopMesh;
var townhouseMesh = __awtsmoosModule_203.townhouseMesh;
var compositeFlowerMesh = __awtsmoosModule_205.compositeFlowerMesh;
var flowerSpikeMesh = __awtsmoosModule_205.flowerSpikeMesh;
var irisClumpMesh = __awtsmoosModule_205.irisClumpMesh;
var roseBushMesh = __awtsmoosModule_205.roseBushMesh;
var fernClumpMesh = __awtsmoosModule_207.fernClumpMesh;
var grassClumpMesh = __awtsmoosModule_207.grassClumpMesh;
var hostaClumpMesh = __awtsmoosModule_207.hostaClumpMesh;
var panicleShrubMesh = __awtsmoosModule_207.panicleShrubMesh;
var broadleafTreeMesh = __awtsmoosModule_208.broadleafTreeMesh;
var cypressTreeMesh = __awtsmoosModule_208.cypressTreeMesh;
var floweringTreeMesh = __awtsmoosModule_208.floweringTreeMesh;
var oliveTreeMesh = __awtsmoosModule_208.oliveTreeMesh;
var pineTreeMesh = __awtsmoosModule_208.pineTreeMesh;
var willowTreeMesh = __awtsmoosModule_208.willowTreeMesh;
var hedgeMesh = __awtsmoosModule_209.hedgeMesh;
var monumentMesh = __awtsmoosModule_209.monumentMesh;
var planterMesh = __awtsmoosModule_209.planterMesh;
var treeModelMesh = __awtsmoosModule_209.treeModelMesh;
var bollardMesh = __awtsmoosModule_210.bollardMesh;
var benchMesh = __awtsmoosModule_210.benchMesh;
var fountainMesh = __awtsmoosModule_210.fountainMesh;
var kioskMesh = __awtsmoosModule_210.kioskMesh;
var streetLampMesh = __awtsmoosModule_210.streetLampMesh;
var streetSignModel = __awtsmoosModule_210.streetSignModel;
var busMesh = __awtsmoosModule_211.busMesh;
var carMesh = __awtsmoosModule_211.carMesh;
var marketCartMesh = __awtsmoosModule_211.marketCartMesh;
var taxiMesh = __awtsmoosModule_211.taxiMesh;
var truckMesh = __awtsmoosModule_211.truckMesh;
var vanMesh = __awtsmoosModule_211.vanMesh;

const FACTORIES = Object.freeze({
	townhouse: townhouseMesh,
	shop: shopMesh,
	tower: towerMesh,
	studyHall: studyHallMesh,
	palace: palaceMesh,
	car: carMesh,
	taxi: taxiMesh,
	van: vanMesh,
	bus: busMesh,
	truck: truckMesh,
	marketCart: marketCartMesh,
	bench: benchMesh,
	streetLamp: streetLampMesh,
	kiosk: kioskMesh,
	fountain: fountainMesh,
	streetSign: streetSignModel,
	bollard: bollardMesh,
	treeModel: treeModelMesh,
	planter: planterMesh,
	hedge: hedgeMesh,
	monument: monumentMesh,
	compositeFlower: compositeFlowerMesh,
	irisClump: irisClumpMesh,
	roseBush: roseBushMesh,
	flowerSpike: flowerSpikeMesh,
	panicleShrub: panicleShrubMesh,
	hostaClump: hostaClumpMesh,
	fernClump: fernClumpMesh,
	grassClump: grassClumpMesh,
	cypressTree: cypressTreeMesh,
	broadleafTree: broadleafTreeMesh,
	willowTree: willowTreeMesh,
	pineTree: pineTreeMesh,
	floweringTree: floweringTreeMesh,
	oliveTree: oliveTreeMesh
});

/**
 * The Awtsmoos gathers reusable procedural forms behind one deterministic catalog.
 * Unknown names retain the historical townhouse fallback for save compatibility.
 */
function modelMesh(name, options = {}) {
	const factory = FACTORIES[name] || FACTORIES.townhouse;
	return factory({ ...options, seed: options.seed || `awtsmoos-${name}` });
}


__exports.modelMesh = modelMesh;
function modelNames() {
	return Object.keys(FACTORIES);
}


__exports.modelNames = modelNames;
function hasModel(name) {
	return Boolean(FACTORIES[name]);
}

__exports.hasModel = hasModel;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/world/building.js */
__awtsmoosModule_213 = (() => {
const __exports = {};
// B"H
var modelMesh = __awtsmoosModule_198.modelMesh;
var transformMesh = __awtsmoosModule_188.transformMesh;

/**
 * A building is now a generated architectural model, not one stretched cube.
 * Legacy callers retain one function while gaining real façades and rooflines.
 */
function buildingMesh(options = {}) {
	const width = clamp(options.width ?? 6, 1, 32);
	const depth = clamp(options.depth ?? 5, 1, 32);
	const height = clamp(options.height ?? 9, 2, options.maxHeight ?? 80);
	const style = options.style || styleFor(height);
	const source = modelMesh(style, { seed: options.seed || `${style}-${width}-${height}-${depth}` });
	return transformMesh(source, {
		scale: [width / 6, height / nominalHeight(style), depth / 5],
		translate: [options.x ?? 0, 0, options.z ?? 0]
	});
}


__exports.buildingMesh = buildingMesh;
function clamp(value, min, max) {
	if (!Number.isFinite(value)) return min;
	return Math.max(min, Math.min(max, value));
}


__exports.clamp = clamp;
function styleFor(height) {
	if (height > 28) return 'tower';
	if (height > 16) return 'studyHall';
	return height > 9 ? 'shop' : 'townhouse';
}

function nominalHeight(style) {
	return ({ townhouse: 7, shop: 5.5, studyHall: 9, tower: 14 })[style] || 7;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/world/chunk.js */
__awtsmoosModule_214 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_179.createRng;
var range = __awtsmoosModule_179.range;
var transformMesh = __awtsmoosModule_188.transformMesh;
var modelMesh = __awtsmoosModule_198.modelMesh;

const CITY_MODELS = ['townhouse', 'shop', 'studyHall', 'tower', 'kiosk', 'treeModel', 'streetLamp'];

/** Generate a reusable block from actual procedural model families. */
function cityChunkMeshes({ seed = 'chunk', count = 18, size = 96, maxHeight = 48 } = {}) {
	const random = createRng(seed);
	return Array.from({ length: count }, (_, index) => {
		const name = CITY_MODELS[Math.floor(random() * CITY_MODELS.length)];
		const mesh = modelMesh(name, { seed: `${seed}-${name}-${index}` });
		const scale = name === 'tower' ? range(random, 0.7, Math.max(0.8, maxHeight / 18)) : range(random, 0.7, 1.35);
		return transformMesh(mesh, {
			scale,
			rotate: [0, Math.floor(random() * 4) * Math.PI / 2, 0],
			translate: [range(random, -size / 2, size / 2), 0, range(random, -size / 2, size / 2)]
		});
	});
}

__exports.cityChunkMeshes = cityChunkMeshes;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/debug/probe.js */
__awtsmoosModule_215 = (() => {
const __exports = {};
var cubeMesh = __awtsmoosModule_180.cubeMesh;
var validateMesh = __awtsmoosModule_197.validateMesh;
var summarizeMesh = __awtsmoosModule_196.summarizeMesh;

/**
 * B"H
 * @chapter One golden cube is the witness: if it appears, the pipeline breathes.
 */
function makeGoldenProbe(size = 3) {
  return cubeMesh({ center: [0, size / 2, 0], size: [size, size, size], color: [1, 0.84, 0.2, 1] });
}


__exports.makeGoldenProbe = makeGoldenProbe;
function inspectMesh(mesh, options) {
  return { validation: validateMesh(mesh, options), summary: summarizeMesh(mesh) };
}

__exports.inspectMesh = inspectMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/index.js */
__awtsmoosModule_178 = (() => {
const __exports = {};
// B"H
__exports.createRng = __awtsmoosModule_179.createRng;
__exports.hashSeed = __awtsmoosModule_179.hashSeed;
__exports.range = __awtsmoosModule_179.range;
__exports.cubeMesh = __awtsmoosModule_180.cubeMesh;
__exports.cylinderMesh = __awtsmoosModule_180.cylinderMesh;
__exports.discMesh = __awtsmoosModule_180.discMesh;
__exports.mesh = __awtsmoosModule_180.mesh;
__exports.planeMesh = __awtsmoosModule_180.planeMesh;
__exports.ringMesh = __awtsmoosModule_180.ringMesh;
__exports.sphereMesh = __awtsmoosModule_180.sphereMesh;
__exports.starMesh = __awtsmoosModule_180.starMesh;
__exports.catalogMesh = __awtsmoosModule_186.catalogMesh;
__exports.catalogNames = __awtsmoosModule_186.catalogNames;
__exports.compactFiniteMesh = __awtsmoosModule_193.compactFiniteMesh;
__exports.cloneMesh = __awtsmoosModule_188.cloneMesh;
__exports.mergeMeshes = __awtsmoosModule_188.mergeMeshes;
__exports.recolorMesh = __awtsmoosModule_188.recolorMesh;
__exports.transformMesh = __awtsmoosModule_188.transformMesh;
__exports.meshToTriangles = __awtsmoosModule_194.meshToTriangles;
__exports.TRIANGLE_STRIDE = __awtsmoosModule_194.TRIANGLE_STRIDE;
__exports.triangleStats = __awtsmoosModule_194.triangleStats;
__exports.summarizeMesh = __awtsmoosModule_196.summarizeMesh;
__exports.validateMesh = __awtsmoosModule_197.validateMesh;
__exports.modelMesh = __awtsmoosModule_198.modelMesh;
__exports.modelNames = __awtsmoosModule_198.modelNames;
__exports.hasModel = __awtsmoosModule_198.hasModel;
__exports.modelPalette = __awtsmoosModule_201.modelPalette;
__exports.buildingMesh = __awtsmoosModule_213.buildingMesh;
__exports.clamp = __awtsmoosModule_213.clamp;
__exports.cityChunkMeshes = __awtsmoosModule_214.cityChunkMeshes;
__exports.makeGoldenProbe = __awtsmoosModule_215.makeGoldenProbe;
__exports.inspectMesh = __awtsmoosModule_215.inspectMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/bsp/node.js */
__awtsmoosModule_220 = (() => {
const __exports = {};
// B"H
/**
 * @file node.js
 * @brief A node in the spatial tree of existence.
 */
class Node {
    constructor(polygons) {
        this.plane = null;
        this.front = null;
        this.back = null;
        this.polygons = [];
        if (polygons) this.build(polygons);
    }

    clone() {
        const node = new Node();
        node.plane = this.plane && this.plane.clone();
        node.front = this.front && this.front.clone();
        node.back = this.back && this.back.clone();
        node.polygons = this.polygons.map(p => p.clone());
        return node;
    }

    build(polygons) {
        if (!polygons.length) return;

        if (!this.plane) this.plane = polygons[0].plane.clone();

        const front = [], back = [];

        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
        }

        if (front.length) {
            if (!this.front) this.front = new Node();
            this.front.build(front);
        }

        if (back.length) {
            if (!this.back) this.back = new Node();
            this.back.build(back);
        }
    }

    /**
     * Clips a single polygon against this node's tree.
     * @param {Polygon} polygon - The polygon to clip.
     * @param {boolean} keepInside - True to keep parts inside the volume (Back).
     * @param {Array} outList - Accumulator for resulting polygons.
     */
    clipTo(polygon, keepInside, outList) {
        const front = [], back = [];
        // Split: coplanarFront->front, coplanarBack->back, front->front, back->back
        this.plane.splitPolygon(polygon, front, back, front, back);

        if (this.front) {
            front.forEach(p => this.front.clipTo(p, keepInside, outList));
        } else {
            // Front Leaf: "Outside"
            if (!keepInside) outList.push(...front);
        }

        if (this.back) {
            back.forEach(p => this.back.clipTo(p, keepInside, outList));
        } else {
            // Back Leaf: "Inside"
            if (keepInside) outList.push(...back);
        }
    }
}

__exports.Node = Node;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/bsp/tree.js */
__awtsmoosModule_219 = (() => {
const __exports = {};
// B"H
/**
 * @file tree.js
 * @brief The root of spatial knowledge. A BSP Tree implementation.
 */
var Node = __awtsmoosModule_220.Node;

class Tree {
    constructor(polygons) {
        this.rootnode = new Node();
        if (polygons) this.build(polygons);
    }

    build(polygons) {
        this.rootnode.build(polygons);
    }

    /**
     * B"H - Clips a list of polygons against this tree.
     * Modifies the input array in-place.
     * @param {Array} polygons - The polygons to clip.
     * @param {boolean} keepInside - If true, keep parts inside the tree. If false, keep parts outside.
     */
    clipPolygons(polygons, keepInside) {
        const result = [];
        for (let i = 0; i < polygons.length; i++) {
            this.rootnode.clipTo(polygons[i], keepInside, result);
        }
        // Replace contents
        polygons.length = 0;
        polygons.push(...result);
    }
}

__exports.Tree = Tree;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/math/vector3.js */
__awtsmoosModule_222 = (() => {
const __exports = {};
// B"H
/**
 * @file vector3.js
 * @brief 3D Vector math for construction. Reflecting the three dimensions of divine manifestation.
 */

class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        if (Array.isArray(x)) {
            this.x = x[0]; this.y = x[1]; this.z = x[2] || 0;
        } else {
            this.x = x; this.y = y; this.z = z;
        }
    }

    clone() { return new Vector3D(this.x, this.y, this.z); }
    negated() { return new Vector3D(-this.x, -this.y, -this.z); }
    plus(a) { return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z); }
    minus(a) { return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z); }
    times(a) { return new Vector3D(this.x * a, this.y * a, this.z * a); }
    dividedBy(a) { return new Vector3D(this.x / a, this.y / a, this.z / a); }
    dot(a) { return this.x * a.x + this.y * a.y + this.z * a.z; }
    lerp(a, t) { return this.plus(a.minus(this).times(t)); }
    lengthSquared() { return this.dot(this); }
    length() { return Math.sqrt(this.lengthSquared()); }
    unit() { return this.dividedBy(this.length()); }
    cross(a) {
        return new Vector3D(
            this.y * a.z - this.z * a.y,
            this.z * a.x - this.x * a.z,
            this.x * a.y - this.y * a.x
        );
    }
    distanceTo(a) { return this.minus(a).length(); }
    equals(a) { return this.x === a.x && this.y === a.y && this.z === a.z; }
}

__exports.Vector3D = Vector3D;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/core/vertex.js */
__awtsmoosModule_223 = (() => {
const __exports = {};
// B"H
/**
 * @file vertex.js
 * @brief A singular point in space.
 */
var Vector3D = __awtsmoosModule_222.Vector3D;

class Vertex {
    constructor(pos, col) {
        this.pos = pos; // Vector3D
        this.col = col || [1, 1, 1, 1];
    }

    clone() {
        return new Vertex(this.pos.clone(), [...this.col]);
    }

    flip() {
        // Position stays same, normal (implied) flips.
        // If we stored explicit normals, negate them here.
    }

    interpolate(other, t) {
        const v = new Vertex(this.pos.lerp(other.pos, t));
        if (this.col && other.col) {
            v.col = [
                this.col[0] + (other.col[0] - this.col[0]) * t,
                this.col[1] + (other.col[1] - this.col[1]) * t,
                this.col[2] + (other.col[2] - this.col[2]) * t,
                this.col[3] + (other.col[3] - this.col[3]) * t
            ];
        }
        return v;
    }
}

__exports.Vertex = Vertex;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/core/plane.js */
__awtsmoosModule_225 = (() => {
const __exports = {};
// B"H
/**
 * @file plane.js
 * @brief A divine boundary.
 */
const EPSILON = 1e-5;

class Plane {
    constructor(normal, w) {
        this.normal = normal;
        this.w = w;
    }

    static fromVector3Ds(a, b, c) {
        const n = b.minus(a).cross(c.minus(a)).unit();
        return new Plane(n, n.dot(a));
    }

    clone() { return new Plane(this.normal.clone(), this.w); }

    flip() {
        this.normal = this.normal.negated();
        this.w = -this.w;
    }

    /**
     * Splits a polygon by this plane.
     * @param {Polygon} polygon
     * @param {Array} coplanarFront
     * @param {Array} coplanarBack
     * @param {Array} front
     * @param {Array} back
     */
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
        const COPLANAR = 0;
        const FRONT = 1;
        const BACK = 2;
        const SPANNING = 3;

        let polygonType = 0;
        const types = [];

        for (let i = 0; i < polygon.vertices.length; i++) {
            const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
            const type = (t < -EPSILON) ? BACK : (t > EPSILON) ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }

        switch (polygonType) {
            case COPLANAR:
                (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
                break;
            case FRONT:
                front.push(polygon);
                break;
            case BACK:
                back.push(polygon);
                break;
            case SPANNING:
                const f = [], b = [];
                for (let i = 0; i < polygon.vertices.length; i++) {
                    const j = (i + 1) % polygon.vertices.length;
                    const ti = types[i], tj = types[j];
                    const vi = polygon.vertices[i], vj = polygon.vertices[j];

                    if (ti !== BACK) f.push(vi);
                    if (ti !== FRONT) b.push(ti !== BACK ? vi.clone() : vi);

                    if ((ti | tj) === SPANNING) {
                        const t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
                        const v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v.clone());
                    }
                }
                if (f.length >= 3) front.push(new polygon.constructor(f, polygon.shared));
                if (b.length >= 3) back.push(new polygon.constructor(b, polygon.shared));
                break;
        }
    }
}

__exports.Plane = Plane;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/core/polygon.js */
__awtsmoosModule_224 = (() => {
const __exports = {};
// B"H
/**
 * @file polygon.js
 * @brief A convex boundary of creation.
 */
var Plane = __awtsmoosModule_225.Plane;

class Polygon {
    constructor(vertices, shared, plane) {
        this.vertices = vertices;
        this.shared = shared || null;
        this.plane = plane || Plane.fromVector3Ds(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }

    clone() {
        return new Polygon(
            this.vertices.map(v => v.clone()),
            this.shared ? [...this.shared] : null,
            this.plane.clone()
        );
    }

    flip() {
        this.vertices.reverse().map(v => v.flip());
        this.plane.flip();
    }
}

__exports.Polygon = Polygon;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/utils/meshUtils.js */
__awtsmoosModule_221 = (() => {
const __exports = {};
// B"H
/**
 * @file meshUtils.js
 * @brief Translates between CSG Polygons and Structured Mesh Faces.
 *        Infused with Aggressive Quantization and Forced Triangulation to heal the cracks of division.
 */
var Vector3D = __awtsmoosModule_222.Vector3D;
var Vertex = __awtsmoosModule_223.Vertex;
var Polygon = __awtsmoosModule_224.Polygon;

function meshToPolygons(mesh) {
    const polygons =[];

    if (mesh.faces) {
        mesh.faces.forEach(face => {
            const mkV = (v) => {
                const vert = new Vertex(new Vector3D(v.pos[0], v.pos[1], v.pos[2]));
                if (v.col) vert.col =[...v.col];
                return vert;
            };

            const v = face.vertices;

            if (v.length === 3) {
                const poly = new Polygon([mkV(v[0]), mkV(v[1]), mkV(v[2])]);
                if (face.tags) poly.shared = [...face.tags];
                polygons.push(poly);
            } else if (v.length === 4) {
                const poly1 = new Polygon([mkV(v[0]), mkV(v[1]), mkV(v[2])]);
                const poly2 = new Polygon([mkV(v[0]), mkV(v[2]), mkV(v[3])]);
                if (face.tags) {
                    poly1.shared = [...face.tags];
                    poly2.shared = [...face.tags];
                }
                polygons.push(poly1);
                polygons.push(poly2);
            } else if (v.length > 4) {
                for (let i = 2; i < v.length; i++) {
                    const poly = new Polygon([mkV(v[0]), mkV(v[i-1]), mkV(v[i])]);
                    if (face.tags) poly.shared = [...face.tags];
                    polygons.push(poly);
                }
            }
        });
        return polygons;
    }

    const p = mesh.positions;
    const idx = mesh.indices;
    const c = mesh.colors;
    if (!p || !idx) return[];

    for (let i = 0; i < idx.length; i += 3) {
        const verts =[];
        for (let j = 0; j < 3; j++) {
            const id = idx[i + j];
            const vert = new Vertex(new Vector3D(p[id * 3], p[id * 3 + 1], p[id * 3 + 2]));
            if (c && c.length >= id * 4 + 3) {
                vert.col = [c[id * 4], c[id * 4 + 1], c[id * 4 + 2], c[id * 4 + 3] || 1.0];
            }
            verts.push(vert);
        }
        polygons.push(new Polygon(verts));
    }
    return polygons;
}


__exports.meshToPolygons = meshToPolygons;
function polygonsToMesh(polygons) {
    const faces =[];

    // B"H - AGGRESSIVE QUANTIZATION (1mm precision)
    // This forcibly welds vertices that were split by a hair's breadth during CSG.
    const PRECISION = 1000;
    const quantize = (val) => Math.round(val * PRECISION) / PRECISION;

    polygons.forEach(poly => {
        if (!poly.vertices || poly.vertices.length < 3) return;

        const tags = poly.shared ||[];

        const faceVerts = poly.vertices.map(v => ({
            pos:[quantize(v.pos.x), quantize(v.pos.y), quantize(v.pos.z)],
            col: v.col ? [...v.col] :[1, 1, 1, 1],
            norm:[poly.plane.normal.x, poly.plane.normal.y, poly.plane.normal.z]
        }));

        // B"H - FORCED TRIANGULATION
        // Quads with T-Junctions will tear during skinning.
        // By forcing everything into triangles here, the topology remains rigid.
        for (let j = 2; j < faceVerts.length; j++) {
            faces.push({
                vertices: [faceVerts[0], faceVerts[j - 1], faceVerts[j]],
                tags: [...tags]
            });
        }
    });

    return { faces };
}

__exports.polygonsToMesh = polygonsToMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/csg.js */
__awtsmoosModule_218 = (() => {
const __exports = {};
// B"H
/**
 * @file csg.js
 * @chapter THE PERSISTENCE OF THE NAME
 *
 * THE HYMN OF THE TAGGED VOID:
 * When the Cutter enters the Stone, the Stone's internal walls are born
 * from the very skin of the Cutter itself!
 * We decree that these new walls shall not be anonymous ghosts,
 * but shall inherit the 'shared' tags (the Name) of the Cutter.
 * This allows the Golem to remember which part of the void
 * belongs to the Upper and which to the Lower realms!
 *
 * @module CSG
 */

var Tree = __awtsmoosModule_219.Tree;
var meshToPolygons = __awtsmoosModule_221.meshToPolygons;
var polygonsToMesh = __awtsmoosModule_221.polygonsToMesh;

class CSG {
    constructor() { this.polygons =[]; }

    static fromPolygons(polygons) {
        const csg = new CSG();
        csg.polygons = polygons;
        return csg;
    }

    static fromMesh(renderData) {
        if (!renderData) return new CSG();
        return CSG.fromPolygons(meshToPolygons(renderData));
    }

    toMesh() { return polygonsToMesh(this.polygons); }

    clone() {
        const csg = new CSG();
        csg.polygons = this.polygons.map(p => p.clone());
        return csg;
    }

    union(csg) {
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;
        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);
        treeB.clipPolygons(polygonsA, false);
        treeA.clipPolygons(polygonsB, false);
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }

    /**
     * B"H - THE REFINED SUBTRACTION (A - B)
     * Now preserves the internal tags of the cutter (B).
     */
    subtract(csg, insideTag = null) {
        console.log(`B"H - ✂️ [CSG::Subtract]: Performing binary division...`);
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;

        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);

        // 1. Clip A by B. Keep parts of A that are OUTSIDE B.
        treeB.clipPolygons(polygonsA, false);

        // 2. Clip B by A. Keep parts of B that are INSIDE A.
        treeA.clipPolygons(polygonsB, true);

        // 3. The cutter polygons (B) that are inside A become our new inner walls.
        polygonsB.forEach(p => {
            p.flip();
            // B"H - CRITICAL: We keep the existing tags (Upper/Lower)
            // and optionally append a global 'insideTag'.
            if (insideTag) {
                if (!p.shared) p.shared =[];
                if (!p.shared.includes(insideTag)) p.shared.push(insideTag);
            }
        });

        console.log(`      -> 🏁 Subtraction complete. Resulting in ${polygonsA.length + polygonsB.length} polygons.`);
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }

    intersect(csg) {
        let polygonsA = this.clone().polygons;
        let polygonsB = csg.clone().polygons;
        const treeA = new Tree(this.polygons);
        const treeB = new Tree(csg.polygons);
        treeB.clipPolygons(polygonsA, true);
        treeA.clipPolygons(polygonsB, true);
        return CSG.fromPolygons(polygonsA.concat(polygonsB));
    }
}

__exports.CSG = CSG;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/index.js */
__awtsmoosModule_217 = (() => {
const __exports = {};
// B"H
__exports.CSG = __awtsmoosModule_218.CSG;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayGeometryCache.js */
__awtsmoosModule_226 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayGeometryCache.js
 * @description Shares identical carved doorway geometry across translated village walls.
 * The Awtsmoos is not multiplied when many walls reveal the same opening: Awtsmoos.com
 * lets one exact local CSG result serve every rotated and translated instance without
 * repeating expensive boolean work during the player's first entrance into the village.
 */

const MAX_CACHE_ENTRIES = 64;
const geometryCache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Resolves immutable local doorway geometry for one dimensional signature.
 * World position and rotation are intentionally absent because they are applied later.
 *
 * @param {object} definition Doorway primitive definition.
 * @param {() => object} createGeometry Expensive CSG factory used on a cache miss.
 * @returns {object} Frozen indexed geometry shared by equivalent doorway instances.
 */
function resolveBooleanDoorwayGeometry(definition, createGeometry) {
	const cacheKey = createDoorwayCacheKey(definition);
	const cachedGeometry = geometryCache.get(cacheKey);
	if (cachedGeometry) {
		cacheHits += 1;
		return cachedGeometry;
	}
	cacheMisses += 1;
	const geometry = freezeGeometry(createGeometry());
	geometryCache.set(cacheKey, geometry);
	trimOldestEntries();
	return geometry;
}


__exports.resolveBooleanDoorwayGeometry = resolveBooleanDoorwayGeometry;
/**
 * Clears cached geometry and counters for deterministic diagnostics and tests.
 */
function clearBooleanDoorwayGeometryCache() {
	geometryCache.clear();
	cacheHits = 0;
	cacheMisses = 0;
}


__exports.clearBooleanDoorwayGeometryCache = clearBooleanDoorwayGeometryCache;
/**
 * Returns a read-only snapshot of cache effectiveness.
 *
 * @returns {{hits:number, misses:number, size:number, limit:number}}
 */
function booleanDoorwayGeometryCacheStats() {
	return Object.freeze({
		hits: cacheHits,
		limit: MAX_CACHE_ENTRIES,
		misses: cacheMisses,
		size: geometryCache.size
	});
}


__exports.booleanDoorwayGeometryCacheStats = booleanDoorwayGeometryCacheStats;
function createDoorwayCacheKey(definition) {
	const wall = definition.size || {};
	const door = definition.door || {};
	return [
		finiteNumber(wall.x, 7),
		finiteNumber(wall.y, 3),
		finiteNumber(wall.z, 0.7),
		finiteNumber(door.x, 2.2),
		finiteNumber(door.y, 2.15),
		positiveNumber(definition.texturePolicy?.tileWorld, 6)
	].join('|');
}

function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}

function freezeGeometry(geometry) {
	Object.freeze(geometry.positions);
	Object.freeze(geometry.indices);
	Object.freeze(geometry.uvs);
	return Object.freeze(geometry);
}

function trimOldestEntries() {
	while (geometryCache.size > MAX_CACHE_ENTRIES) {
		const oldestKey = geometryCache.keys().next().value;
		geometryCache.delete(oldestKey);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayUvProjection.js */
__awtsmoosModule_228 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayUvProjection.js
 * @description Projects carved doorway surfaces at one stable world-material density.
 * The Awtsmoos holds lintel, jamb, threshold, and wall in one measured truth;
 * Awtsmoos.com lets stone texture continue naturally across every revealed face.
 */

/**
 * Projects one CSG vertex onto its strongest axis at the requested world scale.
 *
 * @param {number[]} position Local vertex position.
 * @param {number[]} normal Local face normal.
 * @param {number} tileWorld World units represented by one UV tile.
 * @returns {number[]} Two projected UV coordinates.
 */
function projectBooleanDoorwayUv(
	position,
	normal = [0, 0, 1],
	tileWorld
) {
	const absoluteX = Math.abs(normal[0]);
	const absoluteY = Math.abs(normal[1]);
	const absoluteZ = Math.abs(normal[2]);
	if (absoluteY >= absoluteX && absoluteY >= absoluteZ) {
		return [
			position[0] / tileWorld,
			position[2] / tileWorld
		];
	}
	if (absoluteX >= absoluteZ) {
		return [
			position[2] / tileWorld,
			position[1] / tileWorld
		];
	}
	return [
		position[0] / tileWorld,
		position[1] / tileWorld
	];
}

__exports.projectBooleanDoorwayUv = projectBooleanDoorwayUv;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayMeshData.js */
__awtsmoosModule_227 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayMeshData.js
 * @description Creates and flattens the local mesh vessels consumed by doorway CSG.
 * The Awtsmoos gives every face its place and every reveal its measured inheritance;
 * Awtsmoos.com preserves one coherent wall from stone surface to carved threshold.
 */

var projectBooleanDoorwayUv = __awtsmoosModule_228.projectBooleanDoorwayUv;

/**
 * Creates a closed cuboid in the face-based mesh contract consumed by CSG.
 *
 * @param {{x:number, y:number, z:number, centerY?:number}} dimensions Cuboid dimensions.
 * @returns {{faces:object[]}} Closed face mesh.
 */
function createClosedCuboidMesh({
	x,
	y,
	z,
	centerY = 0
}) {
	const halfX = x / 2;
	const halfY = y / 2;
	const halfZ = z / 2;
	const points = {
		leftBackBottom: [-halfX, centerY - halfY, -halfZ],
		leftBackTop: [-halfX, centerY + halfY, -halfZ],
		leftFrontBottom: [-halfX, centerY - halfY, halfZ],
		leftFrontTop: [-halfX, centerY + halfY, halfZ],
		rightBackBottom: [halfX, centerY - halfY, -halfZ],
		rightBackTop: [halfX, centerY + halfY, -halfZ],
		rightFrontBottom: [halfX, centerY - halfY, halfZ],
		rightFrontTop: [halfX, centerY + halfY, halfZ]
	};
	return {
		faces: [
			face(points.leftFrontBottom, points.rightFrontBottom, points.rightFrontTop, points.leftFrontTop),
			face(points.rightBackBottom, points.leftBackBottom, points.leftBackTop, points.rightBackTop),
			face(points.leftBackBottom, points.leftFrontBottom, points.leftFrontTop, points.leftBackTop),
			face(points.rightFrontBottom, points.rightBackBottom, points.rightBackTop, points.rightFrontTop),
			face(points.leftFrontTop, points.rightFrontTop, points.rightBackTop, points.leftBackTop),
			face(points.leftBackBottom, points.rightBackBottom, points.rightFrontBottom, points.leftFrontBottom)
		]
	};
}


__exports.createClosedCuboidMesh = createClosedCuboidMesh;
/**
 * Flattens triangulated CSG faces and cube-projects each polygon at world scale.
 *
 * @param {{faces?:object[]}} mesh Result returned by the Awtsmoos CSG core.
 * @param {number} tileWorld World units represented by one UV tile.
 * @returns {{positions:number[], indices:number[], uvs:number[]}}
 */
function flattenBooleanMesh(mesh, tileWorld) {
	const positions = [];
	const indices = [];
	const uvs = [];
	for (const meshFace of mesh.faces || []) {
		const firstIndex = positions.length / 3;
		const vertices = meshFace.vertices || [];
		for (const vertex of vertices) {
			positions.push(
				vertex.pos[0],
				vertex.pos[1],
				vertex.pos[2]
			);
			uvs.push(
				...projectBooleanDoorwayUv(
					vertex.pos,
					vertex.norm,
					tileWorld
				)
			);
		}
		for (let index = 2; index < vertices.length; index += 1) {
			indices.push(
				firstIndex,
				firstIndex + index - 1,
				firstIndex + index
			);
		}
	}
	return {
		indices,
		positions,
		uvs
	};
}


__exports.flattenBooleanMesh = flattenBooleanMesh;
function face(...positions) {
	return {
		vertices: positions.map(position => ({
			col: [1, 1, 1, 1],
			pos: [...position]
		}))
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayGeometry.js */
__awtsmoosModule_216 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayGeometry.js
 * @description Carves one canonical local doorway and reuses it across equivalent walls.
 * The Awtsmoos reveals absence as carefully as stone: one opening is calculated once,
 * then Awtsmoos.com places that immutable revelation wherever a home requires entrance.
 */

var CSG = __awtsmoosModule_217.CSG;
var resolveBooleanDoorwayGeometry = __awtsmoosModule_226.resolveBooleanDoorwayGeometry;
var createClosedCuboidMesh = __awtsmoosModule_227.createClosedCuboidMesh;
var flattenBooleanMesh = __awtsmoosModule_227.flattenBooleanMesh;

/**
 * Carves one doorway from one continuous wall with the shared Awtsmoos CSG core.
 * Equivalent local dimensions reuse one immutable result; world transforms remain the
 * responsibility of the procedural bridge so visual and collision instances stay aligned.
 *
 * @param {object} definition Doorway primitive definition.
 * @returns {{positions:number[], indices:number[], uvs:number[]}}
 */
function createBooleanDoorwayMesh(definition = {}) {
	return resolveBooleanDoorwayGeometry(
		definition,
		() => carveBooleanDoorway(definition)
	);
}


__exports.createBooleanDoorwayMesh = createBooleanDoorwayMesh;
function carveBooleanDoorway(definition) {
	const wallSize = {
		x: finiteNumber(definition.size?.x, 7),
		y: finiteNumber(definition.size?.y, 3),
		z: finiteNumber(definition.size?.z, 0.7)
	};
	const opening = {
		x: finiteNumber(definition.door?.x, 2.2),
		y: finiteNumber(definition.door?.y, 2.15)
	};
	const wall = createClosedCuboidMesh(wallSize);
	const cutter = createClosedCuboidMesh({
		centerY: -wallSize.y / 2 + opening.y / 2,
		x: opening.x,
		y: opening.y + 0.04,
		z: wallSize.z + 0.2
	});
	const carved = CSG.fromMesh(wall)
		.subtract(CSG.fromMesh(cutter), 'door-reveal')
		.toMesh();
	return flattenBooleanMesh(
		carved,
		positiveNumber(definition.texturePolicy?.tileWorld, 6)
	);
}

function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/ProceduralPrimitiveMeshes.js */
__awtsmoosModule_177 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPrimitiveMeshes.js
 * @description Creates local-space primitive and authored manual meshes without renderer allocation.
 * The Awtsmoos gives point, face, UV, and color one measured source;
 * Awtsmoos.com preserves multicolor flowers and every bounded procedural course.
 */

var cubeMesh = __awtsmoosModule_178.cubeMesh;
var sphereMesh = __awtsmoosModule_178.sphereMesh;
var createBooleanDoorwayMesh = __awtsmoosModule_216.createBooleanDoorwayMesh;

function createPrimitiveMesh(definition) {
	if (definition.shape === 'manual') return manualMesh(definition);
	if (definition.shape === 'doorway') return createBooleanDoorwayMesh(definition);
	if (definition.shape === 'cylinder') return createCylinderMesh(definition);
	if (definition.shape === 'triPrism') return createTriPrismMesh(definition);
	if (definition.shape === 'sphere') {
		return sphereMesh({
			color: definition.rgba,
			radius: definition.radius || 1,
			rings: 10,
			segments: 20
		});
	}
	return cubeMesh({
		color: definition.rgba || [0.7, 0.7, 0.7, 1],
		size: [1, 1, 1]
	});
}


__exports.createPrimitiveMesh = createPrimitiveMesh;
function manualMesh({ vertices = [], faces = [], indices = [], uvs = [], colors = [] }) {
	return {
		colors: normalizeColors(colors, vertices.length),
		indices: indices.length ? [...indices] : faces.flatMap(triangulateFace),
		positions: vertices.flatMap(toPointArray),
		uvs: uvs.length === vertices.length * 2 ? [...uvs] : null
	};
}


__exports.manualMesh = manualMesh;
function createTriPrismMesh(definition) {
	const size = definition.size || { x: 2, y: 1, z: 0.4 };
	const halfX = size.x / 2;
	const halfY = size.y / 2;
	const halfZ = size.z / 2;
	return manualMesh({
		vertices: [
			[-halfX, -halfY, halfZ], [halfX, -halfY, halfZ], [0, halfY, halfZ],
			[-halfX, -halfY, -halfZ], [halfX, -halfY, -halfZ], [0, halfY, -halfZ]
		],
		faces: [[0, 1, 2], [4, 3, 5], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]]
	});
}

function createCylinderMesh(definition) {
	const radius = definition.radius || 1;
	const height = definition.height || 1;
	const segments = Math.max(12, definition.segments || 32);
	const mesh = { positions: [], indices: [] };
	const topCenter = addVertex(mesh, 0, height / 2, 0);
	const bottomCenter = addVertex(mesh, 0, -height / 2, 0);
	const top = [];
	const bottom = [];
	for (let segment = 0; segment < segments; segment += 1) {
		const angle = segment / segments * Math.PI * 2;
		top.push(addVertex(mesh, Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius));
		bottom.push(addVertex(mesh, Math.cos(angle) * radius, -height / 2, Math.sin(angle) * radius));
	}
	for (let segment = 0; segment < segments; segment += 1) {
		const next = (segment + 1) % segments;
		addTriangle(mesh, topCenter, top[next], top[segment]);
		addTriangle(mesh, bottomCenter, bottom[segment], bottom[next]);
		addTriangle(mesh, top[segment], bottom[next], bottom[segment]);
		addTriangle(mesh, top[segment], top[next], bottom[next]);
	}
	return mesh;
}

function normalizeColors(colors, vertexCount) {
	if (!Array.isArray(colors) || !colors.length) return [];
	const flat = colors.flatMap(value => Array.isArray(value) ? value : [value]);
	return flat.length === vertexCount * 4 ? flat : [];
}

function toPointArray(value) {
	return Array.isArray(value) ? [value[0], value[1], value[2]] : [value.x || 0, value.y || 0, value.z || 0];
}

function triangulateFace(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) triangles.push(face[0], face[index], face[index + 1]);
	return triangles;
}

function addVertex(mesh, x, y, z) {
	mesh.positions.push(x, y, z);
	return mesh.positions.length / 3 - 1;
}

function addTriangle(mesh, first, second, third) {
	mesh.indices.push(first, second, third);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/ProceduralTransformRules.js */
__awtsmoosModule_229 = (() => {
const __exports = {};
//B"H
//Boruch Hashem
//Blessed is He

/**
	* @file ProceduralTransformRules.js
	* @description Transforms local procedural positions into world coordinates.
	* The Awtsmoos renews each axis without confusing local form and world place;
	* Awtsmoos.com records the ordered rotation as a small deterministic vessel.
	*/

var v = __awtsmoosModule_174.v;

/**
	* Transforms a flat local-position array into world point objects.
	* @param {object} definition primitive transform definition.
	* @param {ArrayLike<number>} positions flat XYZ positions.
	* @returns {object[]} transformed point objects.
	*/
function transformProceduralPositions(definition, positions) {
	const vertices = [];
	for (let index = 0; index < positions.length; index += 3) {
		vertices.push(createWorldPoint(
			definition,
			positions[index],
			positions[index + 1],
			positions[index + 2]
		));
	}
	return vertices;
}


__exports.transformProceduralPositions = transformProceduralPositions;
function createWorldPoint(definition, x, y, z) {
	const rotation = definition.rotation || {
		x: definition.pitch || 0,
		y: definition.yaw || 0,
		z: definition.roll || 0
	};
	const rotated = rotatePoint(v(x, y, z), rotation);
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(rotated.x + center.x, rotated.y + center.y, rotated.z + center.z);
}

function rotatePoint(point, rotation) {
	let { x, y, z } = point;
	const cosineX = Math.cos(rotation.x || 0);
	const sineX = Math.sin(rotation.x || 0);
	const cosineY = Math.cos(rotation.y || 0);
	const sineY = Math.sin(rotation.y || 0);
	const cosineZ = Math.cos(rotation.z || 0);
	const sineZ = Math.sin(rotation.z || 0);
	[y, z] = [y * cosineX - z * sineX, y * sineX + z * cosineX];
	[x, z] = [x * cosineY - z * sineY, x * sineY + z * cosineY];
	[x, y] = [x * cosineZ - y * sineZ, x * sineZ + y * cosineZ];
	return v(x, y, z);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/ProceduralBridge.js */
__awtsmoosModule_176 = (() => {
const __exports = {};
//B"H
//Boruch Hashem
//Blessed is He

/**
	* @file ProceduralBridge.js
	* @description Joins world definitions to renderer-neutral procedural meshes.
	* The Awtsmoos renews authored shape and transformed world point together;
	* Awtsmoos.com keeps the public contract small while focused vessels serve it.
	*/

var createPrimitiveMesh = __awtsmoosModule_177.createPrimitiveMesh;
var manualMesh = __awtsmoosModule_177.manualMesh;
var transformProceduralPositions = __awtsmoosModule_229.transformProceduralPositions;

__exports.manualMesh = manualMesh;

const PROCEDURAL_SOURCE = 'Awtsmoos procedural primitives + true CSG doorway difference';
__exports.PROCEDURAL_SOURCE = PROCEDURAL_SOURCE;


/**
	* Converts a primitive definition into the indexed geometry contract.
	* @param {object} definition authored world primitive definition.
	* @returns {{vertices: object[], indices: number[], colors: number[], uvs: number[] | null}}
	*/
function proceduralData(definition) {
	const rawMesh = createPrimitiveMesh(definition);
	return {
		vertices: transformProceduralPositions(definition, rawMesh.positions),
		indices: rawMesh.indices || [],
		colors: rawMesh.colors || [],
		uvs: rawMesh.uvs || null
	};
}

__exports.proceduralData = proceduralData;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveTransform.js */
__awtsmoosModule_231 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveTransform.js
 * @description Moves local procedural points into their measured world positions.
 * The Awtsmoos renews place and direction together; Awtsmoos.com keeps geometry,
 * collision, and texture-density measurements inside the same revealed coordinates.
 */

var v = __awtsmoosModule_174.v;

function transformPrimitivePoint(point, definition) {
	const rotated = rotatePrimitivePoint(point, definitionRotation(definition));
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(
		rotated.x + center.x,
		rotated.y + center.y,
		rotated.z + center.z
	);
}


__exports.transformPrimitivePoint = transformPrimitivePoint;
function rotatePrimitivePoint(point, rotation) {
	let { x, y, z } = point;
	const cx = Math.cos(rotation.x || 0);
	const sx = Math.sin(rotation.x || 0);
	const cy = Math.cos(rotation.y || 0);
	const sy = Math.sin(rotation.y || 0);
	const cz = Math.cos(rotation.z || 0);
	const sz = Math.sin(rotation.z || 0);
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	[x, z] = [x * cy - z * sy, x * sy + z * cy];
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	return v(x, y, z);
}


__exports.rotatePrimitivePoint = rotatePrimitivePoint;
function definitionRotation(definition) {
	return definition.rotation || {
		x: definition.pitch || 0,
		y: definition.yaw || 0,
		z: definition.roll || 0
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveBoxGeometry.js */
__awtsmoosModule_230 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveBoxGeometry.js
 * @description Builds face-separated boxes whose UV spans preserve world distance.
 * The Awtsmoos reveals six boundaries around one finite vessel; Awtsmoos.com gives
 * each face its own normal and measured UV field so stone and timber never smear.
 */

var v = __awtsmoosModule_174.v;
var transformPrimitivePoint = __awtsmoosModule_231.transformPrimitivePoint;

function createPrimitiveBoxGeometry(definition) {
	const size = definition.size;
	const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
	const tile = positive(definition.texturePolicy?.tileWorld, 1);
	const mesh = { indices: [], uvs: [], vertices: [] };
	appendFace(mesh, definition, [
		[-half.x, -half.y, half.z], [half.x, -half.y, half.z],
		[half.x, half.y, half.z], [-half.x, half.y, half.z]
	], size.x / tile, size.y / tile);
	appendFace(mesh, definition, [
		[half.x, -half.y, -half.z], [-half.x, -half.y, -half.z],
		[-half.x, half.y, -half.z], [half.x, half.y, -half.z]
	], size.x / tile, size.y / tile);
	appendFace(mesh, definition, [
		[-half.x, -half.y, -half.z], [-half.x, -half.y, half.z],
		[-half.x, half.y, half.z], [-half.x, half.y, -half.z]
	], size.z / tile, size.y / tile);
	appendFace(mesh, definition, [
		[half.x, -half.y, half.z], [half.x, -half.y, -half.z],
		[half.x, half.y, -half.z], [half.x, half.y, half.z]
	], size.z / tile, size.y / tile);
	appendFace(mesh, definition, [
		[-half.x, half.y, half.z], [half.x, half.y, half.z],
		[half.x, half.y, -half.z], [-half.x, half.y, -half.z]
	], size.x / tile, size.z / tile);
	appendFace(mesh, definition, [
		[-half.x, -half.y, -half.z], [half.x, -half.y, -half.z],
		[half.x, -half.y, half.z], [-half.x, -half.y, half.z]
	], size.x / tile, size.z / tile);
	return mesh;
}


__exports.createPrimitiveBoxGeometry = createPrimitiveBoxGeometry;
function appendFace(mesh, definition, corners, uSpan, vSpan) {
	const first = mesh.vertices.length;
	const faceUvs = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
	for (let index = 0; index < corners.length; index += 1) {
		mesh.vertices.push(transformPrimitivePoint(v(...corners[index]), definition));
		mesh.uvs.push(...faceUvs[index]);
	}
	mesh.indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveDiamondGeometry.js */
__awtsmoosModule_232 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveDiamondGeometry.js
 * @description Builds the legacy six-point diamond while preserving world transforms.
 * The Awtsmoos encloses one center through opposing points; Awtsmoos.com keeps the
 * compatibility shape measurable while better village art replaces its old misuse.
 */

var v = __awtsmoosModule_174.v;
var transformPrimitivePoint = __awtsmoosModule_231.transformPrimitivePoint;

function createPrimitiveDiamondGeometry(definition) {
	const size = definition.size;
	const localVertices = [
		v(0, size.y / 2, 0),
		v(size.x / 2, 0, 0),
		v(0, 0, size.z / 2),
		v(-size.x / 2, 0, 0),
		v(0, 0, -size.z / 2),
		v(0, -size.y / 2, 0)
	];
	return {
		indices: [
			0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 1, 4,
			5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1
		],
		uvs: null,
		vertices: localVertices.map(point => transformPrimitivePoint(point, definition))
	};
}

__exports.createPrimitiveDiamondGeometry = createPrimitiveDiamondGeometry;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/DoorwayFrameGeometry.js */
__awtsmoosModule_233 = (() => {
const __exports = {};
//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorwayFrameGeometry.js
 * @description Builds an exact rectangular doorway from two piers and one lintel.
 * The Awtsmoos reveals an opening without tearing the whole wall apart; Awtsmoos.com
 * gives the finite renderer the same silhouette as box subtraction with no boolean cost.
 */

var v = __awtsmoosModule_174.v;
var createPrimitiveBoxGeometry = __awtsmoosModule_230.createPrimitiveBoxGeometry;
var transformPrimitivePoint = __awtsmoosModule_231.transformPrimitivePoint;

const MINIMUM_FRAME_WIDTH = 0.02;

/**
 * Creates a transformed doorway frame whose opening begins at the wall floor.
 *
 * @param {object} definition - Doorway primitive definition.
 * @returns {{vertices: Array<object>, indices: Array<number>, uvs: Array<number>}} Geometry buffers.
 */
function createDoorwayFrameGeometry(definition = {}) {
	const wall = normalizedSize(definition.size, { x: 10, y: 10, z: 1 });
	const requestedDoor = normalizedSize(definition.door, {
		x: 3,
		y: 4,
		z: wall.z + 2
	});
	const openingWidth = clamp(
		requestedDoor.x,
		MINIMUM_FRAME_WIDTH,
		wall.x - MINIMUM_FRAME_WIDTH * 2
	);
	const openingHeight = clamp(
		requestedDoor.y,
		MINIMUM_FRAME_WIDTH,
		wall.y - MINIMUM_FRAME_WIDTH
	);
	const pierWidth = (wall.x - openingWidth) / 2;
	const lintelHeight = wall.y - openingHeight;
	const parts = [
		boxPart(definition, {
			center: v(-(openingWidth + pierWidth) / 2, 0, 0),
			size: { x: pierWidth, y: wall.y, z: wall.z }
		}),
		boxPart(definition, {
			center: v((openingWidth + pierWidth) / 2, 0, 0),
			size: { x: pierWidth, y: wall.y, z: wall.z }
		}),
		boxPart(definition, {
			center: v(0, openingHeight / 2, 0),
			size: { x: openingWidth, y: lintelHeight, z: wall.z }
		})
	];
	return mergeGeometry(parts);
}


__exports.createDoorwayFrameGeometry = createDoorwayFrameGeometry;
function boxPart(definition, { center, size }) {
	return createPrimitiveBoxGeometry({
		...definition,
		door: undefined,
		position: transformPrimitivePoint(center, definition),
		shape: 'box',
		size
	});
}

function clamp(value, minimum, maximum) {
	return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function mergeGeometry(parts) {
	const merged = { vertices: [], indices: [], uvs: [] };
	for (const part of parts) {
		const vertexOffset = merged.vertices.length;
		merged.vertices.push(...part.vertices);
		merged.indices.push(...part.indices.map(index => index + vertexOffset));
		merged.uvs.push(...part.uvs);
	}
	return merged;
}

function normalizedSize(value, fallback) {
	return {
		x: positive(value?.x, fallback.x),
		y: positive(value?.y, fallback.y),
		z: positive(value?.z, fallback.z)
	};
}

function positive(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveGeometryFactory.js */
__awtsmoosModule_175 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryFactory.js
 * @description Resolves authored definitions into bounded geometry while preserving ecological masks.
 * The Awtsmoos reveals each form through its proper vessel; Awtsmoos.com sends exact masonry,
 * procedural silhouettes, and layered mountain meaning through one verified geometry contract.
 */

var proceduralData = __awtsmoosModule_176.proceduralData;
var createPrimitiveBoxGeometry = __awtsmoosModule_230.createPrimitiveBoxGeometry;
var createPrimitiveDiamondGeometry = __awtsmoosModule_232.createPrimitiveDiamondGeometry;
var createDoorwayFrameGeometry = __awtsmoosModule_233.createDoorwayFrameGeometry;

const PROCEDURAL_SHAPES = Object.freeze([
	'manual',
	'doorway',
	'cylinder',
	'sphere',
	'triPrism'
]);

function createPrimitiveGeometryData(definition) {
	if (definition.shape === 'doorway') {
		return createDoorwayFrameGeometry(definition);
	}
	if (isProceduralShape(definition.shape)) {
		const data = proceduralData({
			...definition,
			rgba: colorArray(definition.color)
		});
		return { ...data, zones: definition.zones || [] };
	}
	if (definition.shape === 'diamond') {
		return createPrimitiveDiamondGeometry(definition);
	}
	return createPrimitiveBoxGeometry(definition);
}


__exports.createPrimitiveGeometryData = createPrimitiveGeometryData;
function isProceduralShape(shape) {
	return PROCEDURAL_SHAPES.includes(shape);
}


__exports.isProceduralShape = isProceduralShape;
function colorArray(hex = '#777777') {
	const number = parseInt(String(hex).replace('#', ''), 16);
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		1
	];
}

__exports.colorArray = colorArray;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveGeometryBuffers.js */
__awtsmoosModule_234 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryBuffers.js
 * @description Converts world geometry, colors, indices, and smooth normals into exact renderer arrays.
 * The Awtsmoos gathers finite points and hues into one visible decree;
 * Awtsmoos.com keeps every typed array deterministic while botanical palettes remain free.
 */

var triangleNormal = __awtsmoosModule_174.triangleNormal;
var v = __awtsmoosModule_174.v;

function flattenPrimitiveVertices(vertices) {
	return vertices.flatMap(point => [point.x, point.y, point.z]);
}


__exports.flattenPrimitiveVertices = flattenPrimitiveVertices;
function primitiveColorArray(colors, vertexCount) {
	if (!Array.isArray(colors) || colors.length !== vertexCount * 4) return null;
	return new Float32Array(colors.map(value => Math.max(0, Math.min(1, Number(value) || 0))));
}


__exports.primitiveColorArray = primitiveColorArray;
function primitiveIndexArray(indices) {
	return Math.max(0, ...indices) > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}


__exports.primitiveIndexArray = primitiveIndexArray;
function createPrimitiveVertexNormals(data) {
	const normals = Array.from({ length: data.vertices.length }, () => v());
	for (let index = 0; index < data.indices.length; index += 3) {
		const face = [data.indices[index], data.indices[index + 1], data.indices[index + 2]];
		const normal = triangleNormal(
			data.vertices[face[0]],
			data.vertices[face[1]],
			data.vertices[face[2]]
		);
		for (const vertexIndex of face) addNormal(normals[vertexIndex], normal);
	}
	return normals.flatMap(normalized);
}


__exports.createPrimitiveVertexNormals = createPrimitiveVertexNormals;
function addNormal(target, source) {
	target.x += source.x;
	target.y += source.y;
	target.z += source.z;
}

function normalized(normal) {
	const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
	return [normal.x / length, normal.y / length, normal.z / length];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js */
__awtsmoosModule_240 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelRecords.js
 * @description Records byte counts and SHA-256 identities for every canonical Mitzvah World GLB.
 * The Awtsmoos gives each finite form one immutable name; Awtsmoos.com serves these exact
 * measured bytes through content-addressed Drive paths while Git preserves identity and truth.
 */

const REMOTE_MODEL_RECORDS = Object.freeze({
	'player/chossid.glb': record(2027368, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48'),
	'reference-world/Axe_Small.glb': record(48868, 'ea26a8cdf24937ba2cd24148b3c684c59abc5208bef6c96ddca8fb00ed30ddd6'),
	'reference-world/Book.glb': record(11684, '3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1'),
	'reference-world/Bush_Large_Flowers.glb': record(26788, 'cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6'),
	'reference-world/Chest_Closed.glb': record(85120, '2ac5715af9015d885338e8c6d4b7fbea47131a253c24944e11f331b907b4d160'),
	'reference-world/Cow.glb': record(370816, '1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f'),
	'reference-world/Flower_4_Clump.glb': record(4868, 'ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9'),
	'reference-world/NormalTree_5.glb': record(94036, '5391f680617b2f8f5c7d0d8dbae1c18e6cd2f0e3795a6e4e0902110e3f5c51d5'),
	'reference-world/PineTree_3.glb': record(56980, '2e2061c8d5ed2a9beff3fa4f2e95967c9dfc554407c464278b2a0af13b29c204'),
	'reference-world/Rat.glb': record(593268, '163afe5bfb722229a814af69dd61e8809e0679e5782c312ad840ac7a599a58a7'),
	'reference-world/Rock_2.glb': record(11144, '10783ce0a1956b1c2c6879f7dba303b39fbe8f92256fe910b270f2f3b5d4e3ac'),
	'reference-world/Scroll.glb': record(52704, '5e8581b1041eeae144e12b12b295eda498a8f9b52218065a7b76307cb1bd4ec9'),
	'reference-world/Sheep.glb': record(293680, '5da91ccae57ada6213ec6818760c37d47f2ce071fad6a5bb7426283439c71319'),
	'reference-world/Shield.glb': record(24056, '1f40b4233612d8a00f1ec4c49d45c3f339af1b000adc10eff5bf36fbd8563f67'),
	'reference-world/Snake.glb': record(240884, 'edb074cc77ddac859245231cf17d5d76d5ec82e888af76a44a4e1b36d713b927'),
	'reference-world/Snake_Angry.glb': record(249908, 'c8f3a3bf3f1510596fd41d2be61aec55b7bd95ec35c4988b6eaf546795aaa128'),
	'reference-world/Spider.glb': record(505420, '541bd562b079790137b23c47304aa6904dbe1969a293cc271e056b25d4eb404a'),
	'reference-world/Sword.glb': record(42640, '034c89782e21e22cfcb4de6e710026647df747e0e54c5a47c2c945f512eaecc2'),
	'reference-world/WoodenStaff.glb': record(12652, '3bfba08a3426be1c873f49a85aef21c3fc670514218b606941d232ab5f2aad16')
});
__exports.REMOTE_MODEL_RECORDS = REMOTE_MODEL_RECORDS;


function record(bytes, sha256) {
	return Object.freeze({ bytes, sha256 });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelCatalog.js */
__awtsmoosModule_239 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves only uploaded content-addressed GLB identities.
 * The Awtsmoos binds path, hash, and public URL into one measured vessel;
 * Awtsmoos.com rejects local, foreign, mutable, and unrecorded model paths.
 */

var REMOTE_MODEL_RECORDS = __awtsmoosModule_240.REMOTE_MODEL_RECORDS;

const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';
__exports.REMOTE_MODEL_ROOT = REMOTE_MODEL_ROOT;


/**
 * Resolves one semantic model identity into its immutable Drive record.
 *
 * @param {string} relativePath Model path beneath the semantic model root.
 * @returns {Readonly<object>} Frozen identity, integrity, and public URL evidence.
 */
function remoteModelRecord(relativePath) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) {
		throw new Error(`Unknown remote model identity: ${relativePath}`);
	}
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = `${folder}/${record.sha256}/${filename}`;
	return Object.freeze({
		...record,
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		path: modelPath,
		url: `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`
	});
}


__exports.remoteModelRecord = remoteModelRecord;
function remoteModelUrl(relativePath) {
	return remoteModelRecord(relativePath).url;
}


__exports.remoteModelUrl = remoteModelUrl;
function isTrustedRemoteModelUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.protocol !== 'https:' || !url.href.startsWith(REMOTE_MODEL_ROOT)) {
			return false;
		}
		return Object.keys(REMOTE_MODEL_RECORDS).some(modelPath => {
			return remoteModelUrl(modelPath) === url.href;
		});
	} catch {
		return false;
	}
}


__exports.isTrustedRemoteModelUrl = isTrustedRemoteModelUrl;
function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'content-addressed-public-drive-https-only',
		root: REMOTE_MODEL_ROOT
	});
}


__exports.remoteModelCatalogEvidence = remoteModelCatalogEvidence;
function normalizeModelPath(value) {
	const modelPath = String(value || '')
		.trim()
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	const invalid = modelPath.split('/').some(segment => {
		return !segment || segment === '.' || segment === '..';
	});
	if (!modelPath || !modelPath.endsWith('.glb') || invalid) {
		throw new Error(`Invalid model identity: ${value}`);
	}
	return modelPath;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureTransport.js */
__awtsmoosModule_242 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTransport.js
 * @description Owns the single HTTPS origin through which every texture travels.
 * The Awtsmoos sends each finite color from one documented spring;
 * Awtsmoos.com rejects inline shadows, model paths, traversal, and foreign hosts.
 */

const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
__exports.REMOTE_TEXTURE_ROOT = REMOTE_TEXTURE_ROOT;

const REMOTE_ROOT_URL = new URL(REMOTE_TEXTURE_ROOT);
const REMOTE_ROOT_PATH = REMOTE_ROOT_URL.pathname;
const FORBIDDEN_SCHEMES = /^(?:blob|data|file|javascript):/i;
const MODEL_PATH_PREFIX = 'assets/mitzvah-world/models/';
const MODEL_EXTENSION = /\.(?:glb|gltf)$/i;

/** Builds one encoded remote URL from a canonical migration path. */
function remoteTexturePathUrl(path) {
	const clean = cleanRemotePath(path);
	if (isModelPath(clean)) {
		throw new Error(`Texture transport rejects model paths: ${path}`);
	}
	return `${REMOTE_TEXTURE_ROOT}${encodePath(clean)}`;
}


__exports.remoteTexturePathUrl = remoteTexturePathUrl;
/** Builds a full-resolution texture URL. */
function fullResolutionTextureUrl(filename) {
	return remoteTexturePathUrl(`full-resolution/${cleanRemotePath(filename)}`);
}


__exports.fullResolutionTextureUrl = fullResolutionTextureUrl;
/** Builds a documented tree-texture URL. */
function treeTextureUrl(filename) {
	return remoteTexturePathUrl(`awtsmoos-nature/ilanos/trees/${cleanRemotePath(filename)}`);
}


__exports.treeTextureUrl = treeTextureUrl;
/** Reports whether a value is a safe non-model path beneath the migration root. */
function isRemoteTexturePath(path) {
	try {
		const clean = cleanRemotePath(path);
		return !isModelPath(clean);
	} catch {
		return false;
	}
}


__exports.isRemoteTexturePath = isRemoteTexturePath;
/** Accepts only HTTPS non-model URLs beneath the documented migration root. */
function isTrustedAwtsmoosMaterialUrl(value) {
	try {
		const parsed = new URL(String(value || ''));
		if (parsed.protocol !== 'https:' || parsed.origin !== REMOTE_ROOT_URL.origin) {
			return false;
		}
		if (!parsed.pathname.startsWith(REMOTE_ROOT_PATH)) return false;
		const relative = decodeURIComponent(parsed.pathname.slice(REMOTE_ROOT_PATH.length));
		return isRemoteTexturePath(relative);
	} catch {
		return false;
	}
}


__exports.isTrustedAwtsmoosMaterialUrl = isTrustedAwtsmoosMaterialUrl;
/** Returns auditable transport policy evidence. */
function remoteTextureTransportEvidence() {
	return Object.freeze({
		cacheLayers: Object.freeze(['cache-storage', 'in-memory-image']),
		origin: REMOTE_ROOT_URL.origin,
		originCount: 1,
		policy: 'remote-https-only-no-inline-local-or-model-textures',
		root: REMOTE_TEXTURE_ROOT
	});
}


__exports.remoteTextureTransportEvidence = remoteTextureTransportEvidence;
function cleanRemotePath(path) {
	const clean = String(path || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	if (!clean || FORBIDDEN_SCHEMES.test(clean) || clean.includes('?') || clean.includes('#')) {
		throw new Error(`Invalid remote texture path: ${path}`);
	}
	if (clean.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
		throw new Error(`Unsafe remote texture path: ${path}`);
	}
	return clean;
}

function isModelPath(path) {
	return path.startsWith(MODEL_PATH_PREFIX) || MODEL_EXTENSION.test(path);
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialOrigin.js */
__awtsmoosModule_241 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Resolves every material identity through one verified remote origin.
 * The Awtsmoos lets no copied pixel masquerade as source;
 * Awtsmoos.com keeps catalogs, textures, and aliases beneath one HTTPS root.
 */

var REMOTE_TEXTURE_ROOT = __awtsmoosModule_242.REMOTE_TEXTURE_ROOT;
var remoteTexturePathUrl = __awtsmoosModule_242.remoteTexturePathUrl;

const PUBLIC_MATERIAL_ORIGIN = REMOTE_TEXTURE_ROOT.replace(/\/$/, '');
__exports.PUBLIC_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;

const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
__exports.PLAYABLE_MATERIAL_ORIGIN = PLAYABLE_MATERIAL_ORIGIN;

const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
__exports.PUBLIC_MATERIAL_CATALOG_URL = PUBLIC_MATERIAL_CATALOG_URL;

const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
__exports.PUBLIC_ASSET_INVENTORY_URL = PUBLIC_ASSET_INVENTORY_URL;

const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
__exports.PUBLIC_ASSET_ALIASES_URL = PUBLIC_ASSET_ALIASES_URL;

const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');
__exports.PUBLIC_ASSET_SUMMARY_URL = PUBLIC_ASSET_SUMMARY_URL;


/** Resolves a canonical migration path without local or inline fallback. */
function publicMaterialUrl(relativePath) {
	return remoteTexturePathUrl(normalizeMaterialPath(relativePath));
}


__exports.publicMaterialUrl = publicMaterialUrl;
function normalizeMaterialPath(path) {
	return String(path || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialResolver.js */
__awtsmoosModule_238 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

var remoteModelUrl = __awtsmoosModule_239.remoteModelUrl;
var publicMaterialUrl = __awtsmoosModule_241.publicMaterialUrl;

const HALF_QUALITY = new Set(['low', 'medium', 'half']);
const FULL_SOURCE_ALIASES = Object.freeze({
	'grass 6': 'awtsmoos-nature/chai-forest/textures/ground/grass.jpg',
	'mud': 'awtsmoos-nature/chai-forest/textures/ground/dirt_color.jpg',
	'oak wood 2': 'full-resolution/oak wood 3.png',
	'stone floor': 'full-resolution/stone floor 2.png'
});

/**
 * @file PublicMaterialResolver.js
 * @description Resolves textures and the flower model through verified Drive origins.
 * The Awtsmoos preserves semantic aliases without local copied bytes;
 * Awtsmoos.com serves every visual vessel through immutable remote identities.
 */

function resolveMaterialRecord(record, quality = 'high') {
	if (!record?.path) throw new Error('A catalog material record is required.');
	const variants = record.variants || {};
	const preferHalf = HALF_QUALITY.has(String(quality).toLowerCase());
	const canonicalPath = variants.full || record.path;
	const resolvedPath = preferHalf
		? variants.half || variants.source || canonicalPath
		: variants.full || variants.source || variants.half || record.path;
	return {
		...record,
		canonicalPath,
		requestedQuality: quality,
		resolvedPath,
		resolvedUrl: publicMaterialUrl(canonicalPath),
		transportUrl: publicMaterialUrl(resolvedPath)
	};
}


__exports.resolveMaterialRecord = resolveMaterialRecord;
function fullMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(fullMaterialPath(name, extension));
}


__exports.fullMaterialUrl = fullMaterialUrl;
function halfMaterialUrl(name, extension = 'png') {
	return publicMaterialUrl(`half-resolution/${name}.${extension}`);
}


__exports.halfMaterialUrl = halfMaterialUrl;
function exactMaterialUrl(relativePath) {
	return publicMaterialUrl(relativePath);
}


__exports.exactMaterialUrl = exactMaterialUrl;
function flowerModelUrl() {
	return remoteModelUrl('reference-world/Flower_4_Clump.glb');
}


__exports.flowerModelUrl = flowerModelUrl;
function fullMaterialPath(name, extension = 'png') {
	return FULL_SOURCE_ALIASES[name] || `full-resolution/${name}.${extension}`;
}


__exports.fullMaterialPath = fullMaterialPath;
function publicMaterialAliases() {
	return { ...FULL_SOURCE_ALIASES };
}


__exports.publicMaterialAliases = publicMaterialAliases;
function surfaceFieldstoneUrl() {
	return fullMaterialUrl('weathered fieldstone Rock 1');
}


__exports.surfaceFieldstoneUrl = surfaceFieldstoneUrl;
function surfaceOakPlankUrl() {
	return fullMaterialUrl('wooden oak planks 1');
}

__exports.surfaceOakPlankUrl = surfaceOakPlankUrl;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/LocalMaterialPathRules.js */
__awtsmoosModule_244 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialPathRules.js
 * @description Preserves the legacy validator name while enforcing remote-only textures.
 * The Awtsmoos turns an old local gate toward one distant spring;
 * Awtsmoos.com admits only trusted HTTPS migration URLs and rejects every inline vessel.
 */

var isTrustedAwtsmoosMaterialUrl = __awtsmoosModule_242.isTrustedAwtsmoosMaterialUrl;

const FORBIDDEN_MATERIAL_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'staging'
]);
__exports.FORBIDDEN_MATERIAL_SEGMENTS = FORBIDDEN_MATERIAL_SEGMENTS;


/** Validates one production texture URL against the remote-only covenant. */
function assertLocalMaterialPath(url, role = 'runtime material') {
	const value = normalizeUrl(url, role);
	const parsed = parseUrl(value, role);
	assertNoForbiddenSegment(parsed, value, role);
	if (!isTrustedAwtsmoosMaterialUrl(value)) {
		throw new Error(`Production material ${role} requires the trusted remote HTTPS origin: ${value}`);
	}
	return value;
}


__exports.assertLocalMaterialPath = assertLocalMaterialPath;
/** Clear alias for new callers that no longer speak in local-path terms. */
const assertRemoteMaterialUrl = assertLocalMaterialPath;
__exports.assertRemoteMaterialUrl = assertRemoteMaterialUrl;


function normalizeUrl(url, role) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error(`Production material ${role} requires a non-empty URL.`);
	}
	return url.trim();
}

function parseUrl(url, role) {
	try {
		return new URL(url);
	} catch (error) {
		throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
	}
}

function assertNoForbiddenSegment(parsed, url, role) {
	const segments = decodeURIComponent(parsed.pathname).toLowerCase().split('/').filter(Boolean);
	const forbidden = FORBIDDEN_MATERIAL_SEGMENTS.find(segment => segments.includes(segment));
	if (forbidden) {
		throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/ProductionMaterialUrlPolicy.js */
__awtsmoosModule_243 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionMaterialUrlPolicy.js
 * @description Exposes the remote-only production texture validation contract.
 * The Awtsmoos gathers every visible garment beneath one trusted sky;
 * Awtsmoos.com rejects local routes, inline bytes, foreign origins, and previews.
 */

var assertRemoteMaterialUrl = __awtsmoosModule_244.assertRemoteMaterialUrl;
var FORBIDDEN_MATERIAL_SEGMENTS = __awtsmoosModule_244.FORBIDDEN_MATERIAL_SEGMENTS;

const PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = FORBIDDEN_MATERIAL_SEGMENTS;
__exports.PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS;


/** Validates one runtime texture URL without changing its canonical value. */
function assertProductionMaterialUrl(url, role = 'runtime material') {
	return assertRemoteMaterialUrl(url, role);
}


__exports.assertProductionMaterialUrl = assertProductionMaterialUrl;
/** Legacy name retained for callers; true now means trusted remote material. */
function isSameOriginMaterialUrl(url) {
	try {
		assertProductionMaterialUrl(url, 'runtime material');
		return true;
	} catch {
		return false;
	}
}


__exports.isSameOriginMaterialUrl = isSameOriginMaterialUrl;
/** Validates and freezes an ordered remote fallback list. */
function productionMaterialFallbacks(urls = [], role = 'runtime material') {
	return Object.freeze(urls.map((url, index) => {
		return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
	}));
}

__exports.productionMaterialFallbacks = productionMaterialFallbacks;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RuntimeMaterialManifest.js */
__awtsmoosModule_237 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeMaterialManifest.js
 * @description Declares canonical production textures and their bounded recovery chains.
 * RESPONSIBILITY: name semantic roles, truthful URLs, full-source fallbacks, repeat, and boot policy.
 * NON-RESPONSIBILITY: this manifest never fetches images, binds samplers, or rebuilds geometry.
 * The Awtsmoos renews every garment without descending into preview folders; Awtsmoos.com
 * preserves fast first motion through solid materials and hydrates only verified production sources.
 */

var exactMaterialUrl = __awtsmoosModule_238.exactMaterialUrl;
var fullMaterialUrl = __awtsmoosModule_238.fullMaterialUrl;
var assertProductionMaterialUrl = __awtsmoosModule_243.assertProductionMaterialUrl;
var productionMaterialFallbacks = __awtsmoosModule_243.productionMaterialFallbacks;

function materialRole(role, label, primaryUrl, options = {}) {
	return Object.freeze({
		critical: options.critical !== false,
		fallbackUrls: productionMaterialFallbacks(options.fallbackUrls, role),
		label,
		primaryUrl: assertProductionMaterialUrl(primaryUrl, role),
		repeat: Object.freeze(options.repeat || [1, 1]),
		role
	});
}

function fullRole(role, label, name, options = {}) {
	return materialRole(role, label, fullMaterialUrl(name), options);
}

function sourceRole(role, label, path, options = {}) {
	return materialRole(role, label, exactMaterialUrl(path), options);
}

const CHAI_FOREST = 'awtsmoos-nature/chai-forest';

const RUNTIME_MATERIALS = Object.freeze([
	sourceRole('terrain.grass', 'canonical Chai Forest grass', `${CHAI_FOREST}/textures/ground/grass.jpg`, {
		fallbackUrls: [fullMaterialUrl('grass 1')],
		repeat: [18, 18]
	}),
	sourceRole('terrain.dirtMix', 'canonical Chai Forest dirt', `${CHAI_FOREST}/textures/ground/dirt_color.jpg`, {
		fallbackUrls: [fullMaterialUrl('dirt grass 3')],
		repeat: [15, 15]
	}),
	fullRole('road.yellowBrick', 'full yellow brick road', 'yellow brick 1'),
	fullRole('creature.horseFur', 'full horse fur', 'horse fur 1', { repeat: [3, 2] }),
	fullRole('vegetation.wildGrass', 'wild grass', 'grass 7', { critical: false, repeat: [10, 10] }),
	fullRole('terrain.marshGrass', 'marsh grass', 'marsh grass', { critical: false, repeat: [12, 12] }),
	fullRole('terrain.mud', 'mud', 'mud', { critical: false, repeat: [12, 12] }),
	fullRole('terrain.sandShore', 'sand shore', 'sand 1', { critical: false, repeat: [14, 14] }),
	fullRole('water.lake', 'lake water color', 'seamless water brighter', { repeat: [8, 8] }),
	fullRole('water.stream', 'stream water color', 'shallow river water', { repeat: [12, 4] }),
	fullRole('water.still', 'still water color', 'seamless water', { critical: false, repeat: [8, 8] }),
	sourceRole('forest.bark', 'canonical Chai Forest bark', `${CHAI_FOREST}/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`, {
		fallbackUrls: [fullMaterialUrl('tree bark 1')],
		repeat: [3, 8]
	}),
	fullRole('village.woodPlanks', 'wood planks', 'wooden oak planks 1', { repeat: [4, 4] }),
	sourceRole('forest.chaiOak', 'canonical Chai oak leaf', `${CHAI_FOREST}/textures/leaves/oak.png`, { critical: false }),
	sourceRole('forest.chaiAsh', 'canonical Chai ash leaf', `${CHAI_FOREST}/textures/leaves/ash.png`, { critical: false }),
	sourceRole('forest.chaiAspen', 'canonical Chai aspen leaf', `${CHAI_FOREST}/textures/leaves/aspen.png`, { critical: false }),
	sourceRole('forest.chaiPine', 'canonical Chai pine leaf', `${CHAI_FOREST}/textures/leaves/pine.png`, { critical: false }),
	sourceRole('botany.petal', 'sakura petal atlas', 'awtsmoos-nature/ilanos/trees/sakura petal.png', { critical: false }),
	fullRole('stone.general', 'stone', 'stone 1', { critical: false, repeat: [5, 5] }),
	fullRole('stone.fieldstone', 'fieldstone', 'weathered fieldstone Rock 1', { repeat: [4, 4] }),
	fullRole('roof.tile', 'roof tile', 'tiled roof 2', { repeat: [5, 3] }),
	fullRole('metal.gold', 'gold', 'gold 2', { critical: false }),
	fullRole('metal.iron', 'iron', 'rusty iron', { critical: false }),
	fullRole('sign.parchment', 'parchment sign', 'parchment', { critical: false }),
	fullRole('mezuzah.case', 'mezuzah case', 'gold 2', { critical: false })
]);
__exports.RUNTIME_MATERIALS = RUNTIME_MATERIALS;


const CRITICAL_RUNTIME_MATERIALS = Object.freeze(
	RUNTIME_MATERIALS.filter((material) => {
		return material.critical;
	})
);
__exports.CRITICAL_RUNTIME_MATERIALS = CRITICAL_RUNTIME_MATERIALS;


function runtimeMaterialByRole(role) {
	return RUNTIME_MATERIALS.find((material) => {
		return material.role === role;
	}) || null;
}

__exports.runtimeMaterialByRole = runtimeMaterialByRole;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageBitmapDecode.js */
__awtsmoosModule_247 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageBitmapDecode.js
 * @description Decodes fetched image blobs without depending on HTMLImageElement events.
 * The Awtsmoos reveals fetched bytes through a second truthful eye; Awtsmoos.com keeps terrain
 * alive when browser image events stall while preserving dimensions and bounded failure evidence.
 */

async function decodePublicImageBitmap(
	blob,
	timeoutMs = 30000,
	dependencies = {}
) {
	const createBitmap = Object.hasOwn(
		dependencies,
		'createImageBitmapFunction'
	)
		? dependencies.createImageBitmapFunction
		: globalThis.createImageBitmap;
	if (typeof createBitmap !== 'function') {
		return failed('image-bitmap-unavailable');
	}
	let timer = null;
	try {
		const bitmap = await Promise.race([
			createBitmap(blob),
			new Promise((resolve, reject) => {
				timer = setTimeout(
					() => reject(new Error('image-bitmap-timeout')),
					timeoutMs
				);
			})
		]);
		const width = Number(bitmap?.width) || 0;
		const height = Number(bitmap?.height) || 0;
		if (!width || !height) {
			bitmap?.close?.();
			return failed('zero-dimension-image-bitmap');
		}
		return {
			error: null,
			height,
			image: bitmap,
			method: 'blob-image-bitmap',
			ok: true,
			stage: 'decoded',
			width
		};
	} catch (error) {
		return failed(error?.message || 'image-bitmap-decode-error');
	} finally {
		if (timer !== null) clearTimeout(timer);
	}
}


__exports.decodePublicImageBitmap = decodePublicImageBitmap;
function failed(error) {
	return {
		error,
		height: 0,
		image: null,
		method: 'blob-image-bitmap',
		ok: false,
		stage: 'decode',
		width: 0
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageDecode.js */
__awtsmoosModule_246 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageDecode.js
 * @description Decodes canonical URLs or fetched blobs into renderer-compatible image sources.
 * The Awtsmoos reveals unseen bytes as visible pixels; Awtsmoos.com tries bitmap truth before an
 * object-URL image fallback, then revokes every temporary doorway after finite sight arrives.
 */

var decodePublicImageBitmap = __awtsmoosModule_247.decodePublicImageBitmap;

async function decodePublicImageBlob(url, blob, timeoutMs = 30000, dependencies = {}) {
	const bitmap = await decodePublicImageBitmap(
		blob,
		timeoutMs,
		dependencies
	);
	if (bitmap.ok) return bitmap;
	const UrlApi = dependencies.UrlApi || globalThis.URL;
	if (!UrlApi?.createObjectURL || !UrlApi?.revokeObjectURL) {
		return failed('object-url-unavailable', 'blob-decode');
	}
	const objectUrl = UrlApi.createObjectURL(blob);
	return decodeImageSource(objectUrl, url, timeoutMs, {
		...dependencies,
		method: 'blob-object-url'
	}).finally(() => UrlApi.revokeObjectURL(objectUrl));
}


__exports.decodePublicImageBlob = decodePublicImageBlob;
function decodePublicImageUrl(url, timeoutMs = 30000, dependencies = {}) {
	return decodeImageSource(url, url, timeoutMs, {
		...dependencies,
		method: 'direct-image-url'
	});
}


__exports.decodePublicImageUrl = decodePublicImageUrl;
function decodeImageSource(sourceUrl, publicUrl, timeoutMs, dependencies) {
	const ImageClass = dependencies.ImageClass || globalThis.Image;
	if (typeof ImageClass !== 'function') {
		return Promise.resolve(failed('image-class-unavailable', 'decode'));
	}
	return new Promise(resolve => {
		const image = new ImageClass();
		let settled = false;
		const finish = record => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			image.onload = null;
			image.onerror = null;
			resolve(record);
		};
		const timer = setTimeout(() => {
			try {
				image.src = '';
			} catch {}
			finish(failed('timeout', 'decode', dependencies.method));
		}, timeoutMs);
		if (sourceUrl === publicUrl) image.crossOrigin = 'anonymous';
		image.decoding = 'async';
		image.onload = () => finishSuccessfulImage(
			image,
			publicUrl,
			sourceUrl,
			dependencies.method,
			finish
		);
		image.onerror = () => finish(failed(
			'image-decode-error',
			'decode',
			dependencies.method
		));
		image.src = sourceUrl;
	});
}

function finishSuccessfulImage(image, publicUrl, sourceUrl, method, finish) {
	const width = image.naturalWidth || image.width || 0;
	const height = image.naturalHeight || image.height || 0;
	if (!width || !height) {
		finish(failed('zero-dimension-image', 'decode', method));
		return;
	}
	if (image.dataset) {
		image.dataset.publicUrl = publicUrl;
		image.dataset.url = publicUrl;
		image.dataset.loadedFromPublicUrl = sourceUrl === publicUrl
			? 'true'
			: 'blob';
	}
	finish({
		error: null,
		height,
		image,
		method,
		ok: true,
		stage: 'decoded',
		width
	});
}

function failed(error, stage, method = 'none') {
	return {
		error,
		height: 0,
		image: null,
		method,
		ok: false,
		stage,
		width: 0
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageResponseCache.js */
__awtsmoosModule_249 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseCache.js
 * @description Persists verified remote image responses beneath decoded-image memory caches.
 * The Awtsmoos sends one distant garment and lets the browser remember its bytes;
 * Awtsmoos.com avoids copied repository pixels while repeated visits reuse cached light.
 */

const PUBLIC_IMAGE_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-images-v1';
__exports.PUBLIC_IMAGE_CACHE_NAME = PUBLIC_IMAGE_CACHE_NAME;


/**
 * Returns a cached response or fetches and stores one trusted remote image response.
 *
 * @param {string} url - Canonical remote texture URL.
 * @param {object} options - Fetch, Cache Storage, and abort dependencies.
 * @returns {Promise<{response: Response, source: string}>}
 */
async function cachedImageResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		throw new Error('Remote image fetch is unavailable.');
	}
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
	const cache = await openCache(cacheStorage, options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchFunction(url, {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal: options.signal
	});
	if (response?.ok && isImageResponse(response)) {
		await cache?.put?.(url, response.clone());
	}
	return { response, source: 'network' };
}


__exports.cachedImageResponse = cachedImageResponse;
function isImageResponse(response) {
	const contentType = response?.headers?.get?.('content-type') || '';
	return contentType.toLowerCase().startsWith('image/');
}


__exports.isImageResponse = isImageResponse;
async function openCache(cacheStorage, cacheName = PUBLIC_IMAGE_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageFetch.js */
__awtsmoosModule_248 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.js
 * @description Fetches one canonical remote image through durable browser caching.
 * The Awtsmoos gives every distant byte a truthful doorway;
 * Awtsmoos.com reuses cached light while naming HTTP, type, timeout, and network failure.
 */

var cachedImageResponse = __awtsmoosModule_249.cachedImageResponse;
var isImageResponse = __awtsmoosModule_249.isImageResponse;

async function fetchPublicImageBlob(url, timeoutMs = 30000, dependencies = {}) {
	const Controller = Object.hasOwn(dependencies, 'AbortControllerClass')
		? dependencies.AbortControllerClass
		: globalThis.AbortController;
	const controller = Controller ? new Controller() : null;
	const timer = setTimeout(() => controller?.abort(), timeoutMs);
	try {
		const result = await cachedImageResponse(url, {
			cacheName: dependencies.cacheName,
			cacheStorage: dependencies.cacheStorage,
			fetchFunction: dependencies.fetchFunction,
			signal: controller?.signal
		});
		const response = result.response;
		const contentType = response?.headers?.get?.('content-type') || '';
		if (!response?.ok) {
			return failed(`http-${response?.status || 0}`, 'http', {
				contentType,
				status: response?.status || 0
			});
		}
		if (!isImageResponse(response)) {
			return failed('non-image-content-type', 'content-type', {
				contentType,
				status: response.status
			});
		}
		const blob = await response.blob();
		if (!blob?.size) {
			return failed('empty-image-blob', 'blob', {
				contentType,
				status: response.status
			});
		}
		return {
			blob,
			contentType,
			error: null,
			method: result.source,
			ok: true,
			stage: 'fetched',
			status: response.status
		};
	} catch (error) {
		const aborted = error?.name === 'AbortError' || controller?.signal?.aborted;
		return failed(aborted ? 'timeout' : error?.message || 'network-error', 'fetch', {
			status: 0
		});
	} finally {
		clearTimeout(timer);
	}
}


__exports.fetchPublicImageBlob = fetchPublicImageBlob;
function failed(error, stage, evidence = {}) {
	return {
		blob: null,
		contentType: evidence.contentType || '',
		error,
		method: 'remote-cache-fetch',
		ok: false,
		stage,
		status: evidence.status || 0
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialImageLoader.js */
__awtsmoosModule_245 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Decodes canonical material URLs immediately, with fetched-blob fallback.
 * The Awtsmoos clothes the village through the shortest truthful doorway; Awtsmoos.com
 * avoids blocking visible cottages behind a network fetch while retaining typed fallback evidence.
 */

var decodePublicImageBlob = __awtsmoosModule_246.decodePublicImageBlob;
var decodePublicImageUrl = __awtsmoosModule_246.decodePublicImageUrl;
var fetchPublicImageBlob = __awtsmoosModule_248.fetchPublicImageBlob;

async function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = now(dependencies);
	const attempts = [];
	const direct = await decodePublicImageUrl(url, timeoutMs, dependencies);
	attempts.push(attemptEvidence(direct));
	if (direct.ok) {
		return successRecord(url, direct, null, attempts, startedAt, dependencies);
	}
	const fetched = await fetchPublicImageBlob(url, timeoutMs, dependencies);
	attempts.push(attemptEvidence(fetched));
	if (fetched.ok) {
		const decoded = await decodePublicImageBlob(
			url,
			fetched.blob,
			timeoutMs,
			dependencies
		);
		attempts.push(attemptEvidence(decoded));
		if (decoded.ok) {
			return successRecord(url, decoded, fetched, attempts, startedAt, dependencies);
		}
	}
	return failureRecord(url, direct, fetched, attempts, startedAt, dependencies);
}


__exports.loadPublicMaterialImage = loadPublicMaterialImage;
function serializableImageRecord(record) {
	return {
		attempts: (record.attempts || []).map(attempt => ({ ...attempt })),
		contentType: record.contentType || '',
		durationMs: record.durationMs,
		error: record.error || null,
		fromCache: Boolean(record.fromCache),
		height: record.height,
		method: record.method || null,
		ok: record.ok,
		stage: record.stage || null,
		status: record.status || 0,
		url: record.url,
		width: record.width
	};
}


__exports.serializableImageRecord = serializableImageRecord;
function successRecord(url, decoded, fetched, attempts, startedAt, dependencies) {
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: null,
		height: decoded.height,
		image: decoded.image,
		method: decoded.method,
		ok: true,
		stage: 'decoded',
		status: fetched?.status || 200,
		url,
		width: decoded.width
	};
}

function failureRecord(url, direct, fetched, attempts, startedAt, dependencies) {
	const final = attempts.at(-1) || {};
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: final.error || direct.error || fetched?.error || 'image-load-failed',
		height: 0,
		image: null,
		method: final.method || 'none',
		ok: false,
		stage: final.stage || 'unknown',
		status: fetched?.status || 0,
		url,
		width: 0
	};
}

function attemptEvidence(record = {}) {
	return {
		contentType: record.contentType || '',
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}

function now(dependencies) {
	return dependencies.now?.()
		?? globalThis.performance?.now?.()
		?? Date.now();
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialPriority.js */
__awtsmoosModule_250 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialPriority.js
 * @description Ranks shared visible material URLs by human-visible village value.
 * The Awtsmoos clothes homes before polishing distant detail; Awtsmoos.com preserves
 * canonical same-origin keys while bounding hydration to trusted material-pack paths.
 */

const LOCAL_MATERIAL_URL = /^(?:\.\/|\/)(?:assets\/materials\/(?:local|generated)\/|geelooy\/games\/mitzvahworld\/assets\/materials\/(?:local|generated)\/)/i;
const NETWORK_MATERIAL_URL = /^https?:\/\//i;

function rankedSceneUrls(root) {
	const records = new Map();
	root?.traverse?.(object => collectObject(records, object));
	return [...records.values()].sort((left, right) => (
		right.score - left.score || left.url.localeCompare(right.url)
	));
}


__exports.rankedSceneUrls = rankedSceneUrls;
/** Returns true for an existing network URL or a packaged same-origin material URL. */
function isSceneMaterialUrl(url) {
	const value = String(url || '').trim();
	return NETWORK_MATERIAL_URL.test(value) || LOCAL_MATERIAL_URL.test(value);
}


__exports.isSceneMaterialUrl = isSceneMaterialUrl;
function collectObject(records, object) {
	const materials = Array.isArray(object.material)
		? object.material
		: object.material ? [object.material] : [];
	for (const material of materials) collectMaterial(records, object, material);
}

function collectMaterial(records, object, material) {
	const role = `${object.name || ''} ${object.userData?.family || ''} ${material.name || ''}`.toLowerCase();
	const base = roleScore(role);
	add(records, material.textureUrl, role, base + 40);
	add(records, material.mixTextureUrl, role, base + 36);
	for (const [index, layer] of (material.textureLayers || []).entries()) {
		const layerRole = `${role} ${layer.role || ''}`;
		add(records, layer.url, layerRole, base + 20 - index * 6);
	}
}

function add(records, url, role, score) {
	if (!isSceneMaterialUrl(url)) return;
	const existing = records.get(url);
	if (existing) {
		existing.references += 1;
		existing.score = Math.max(existing.score, score) + 2;
		return;
	}
	records.set(url, { references: 1, role, score, url });
}

function roleScore(role) {
	if (/cottage|house|roof|wall|stone|timber|wood/.test(role)) return 120;
	if (/terrain|grass|ground/.test(role)) return 110;
	if (/road|cobble|path|bridge/.test(role)) return 105;
	if (/water|lake|stream|river/.test(role)) return 100;
	if (/forest|tree|bark|leaf/.test(role)) return 55;
	return 20;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialCache.js */
__awtsmoosModule_236 = (() => {
const __exports = {};
// B"H
var CRITICAL_RUNTIME_MATERIALS = __awtsmoosModule_237.CRITICAL_RUNTIME_MATERIALS;
var RUNTIME_MATERIALS = __awtsmoosModule_237.RUNTIME_MATERIALS;
var loadPublicMaterialImage = __awtsmoosModule_245.loadPublicMaterialImage;
var serializableImageRecord = __awtsmoosModule_245.serializableImageRecord;
var isSceneMaterialUrl = __awtsmoosModule_250.isSceneMaterialUrl;

const SCENE_MATERIAL_HYDRATION_URL_LIMIT = 2;
__exports.SCENE_MATERIAL_HYDRATION_URL_LIMIT = SCENE_MATERIAL_HYDRATION_URL_LIMIT;


const imageCache = new Map();
const urlRecords = new Map();
const loadingByUrl = new Map();
const roleRecords = new Map();

/** Returns a complete browser Image or null; aliases permit declared substitutions. */
function cachedTextureImage(url) {
	const image = imageCache.get(url);
	return usableImage(image) ? image : null;
}


__exports.cachedTextureImage = cachedTextureImage;
/** Preserves compatibility with primitive builders that attach cached images synchronously. */
function attachCachedTexture(material, url) {
	const image = cachedTextureImage(url);
	if (!image) return material;
	const shouldBind = !usableImage(material.mapImage) || replaceableMapImage(material, material.mapImage);
	if (!shouldBind) return { ...material, textureUrl: url };
	const prepared = prepareMapImage(material, image);
	if (!prepared) return material;
	return {
		...material,
		mapImage: prepared,
		mapImageFallback: false,
		textureUrl: url
	};
}


__exports.attachCachedTexture = attachCachedTexture;
/** Loads one URL exactly once at a time and records browser-verifiable dimensions and timing. */
async function loadPublicMaterialUrl(url, timeoutMs = 8000) {
	const cached = cachedTextureImage(url);
	if (cached) {
		return {
			...(urlRecords.get(url) || imageEvidence(url, cached)),
			ok: true,
			image: cached,
			fromCache: true
		};
	}
	if (loadingByUrl.has(url)) return loadingByUrl.get(url);
	const promise = loadPublicMaterialImage(url, timeoutMs)
		.then(record => {
			urlRecords.set(url, serializableImageRecord(record));
			if (record.ok) imageCache.set(url, record.image);
			return record;
		})
		.finally(() => loadingByUrl.delete(url));
	loadingByUrl.set(url, promise);
	return promise;
}


__exports.loadPublicMaterialUrl = loadPublicMaterialUrl;
/** Loads one semantic role, trying only declared and auditable fallbacks. */
async function loadRuntimeMaterial(material, options = {}) {
	const candidates = [material.primaryUrl, ...material.fallbackUrls];
	const attempts = [];
	for (const candidate of candidates) {
		const result = await loadPublicMaterialUrl(candidate, options.timeoutMs);
		attempts.push(serializableImageRecord(result));
		if (!result.ok) continue;
		for (const alias of candidates) imageCache.set(alias, result.image);
		const record = roleEvidence(material, result, candidate, attempts);
		roleRecords.set(material.role, record);
		return record;
	}
	const failed = roleEvidence(material, null, null, attempts);
	roleRecords.set(material.role, failed);
	return failed;
}


__exports.loadRuntimeMaterial = loadRuntimeMaterial;
/** Loads semantic roles with bounded concurrency and an optional settled callback. */
async function loadRuntimeMaterialRoles(materials = RUNTIME_MATERIALS, options = {}) {
	const records = new Array(materials.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < materials.length) {
			const index = cursor++;
			const record = await loadRuntimeMaterial(materials[index], options);
			records[index] = record;
			options.onSettled?.(record, index);
		}
	};
	const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, materials.length || 1));
	await Promise.all(Array.from({ length: concurrency }, worker));
	return summarize(records);
}


__exports.loadRuntimeMaterialRoles = loadRuntimeMaterialRoles;
/** Loads only first-frame roles; remaining images wait until their material exists in the scene. */
async function preloadPublicMaterialImages(options = {}) {
	const source = options.all ? RUNTIME_MATERIALS : CRITICAL_RUNTIME_MATERIALS;
	const materials = source.slice(0, options.limit ?? source.length);
	return loadRuntimeMaterialRoles(materials, options);
}


__exports.preloadPublicMaterialImages = preloadPublicMaterialImages;
/**
 * Keeps the historic async doorway while deferring optional work to scene cadence.
 * Passing a root performs one bounded cadence immediately; without one it records that
 * hydration is waiting for real scene references instead of preloading the catalog.
 */
async function progressivelyHydratePublicMaterials(options = {}) {
	const hydration = options.root
		? hydrateSceneMaterialImages(options.root, options)
		: emptySceneHydrationStats(options);
	return {
		requested: hydration.requested,
		loaded: hydration.readyUrls,
		failed: hydration.failedUrls,
		pending: hydration.pending,
		ok: hydration.failedUrls === 0,
		strategy: 'scene-referenced-max-two-new-urls-per-cadence',
		records: [],
		hydration
	};
}


__exports.progressivelyHydratePublicMaterials = progressivelyHydratePublicMaterials;
/**
 * Binds arrived images and starts at most two distinct, scene-referenced URLs.
 * Base, mix, and ordered terrain layers share the same request budget so one cadence
 * cannot fan out into the entire public catalog. Procedural leaf maps remain visible
 * while their public replacement is pending, then swap live without rebuilding geometry.
 */
function hydrateSceneMaterialImages(root, options = {}) {
	const stats = emptySceneHydrationStats(options);
	const referenced = new Set();
	const ready = new Set();
	const pending = new Set();
	root?.traverse?.(object => {
		const materials = Array.isArray(object.material)
			? object.material
			: object.material ? [object.material] : [];
		for (const material of materials) {
			stats.materials += 1;
			hydrateMaterialSlots(object, material, stats, referenced, ready, pending);
		}
	});
	stats.referencedUrls = referenced.size;
	stats.readyUrls = ready.size;
	for (const url of pending) {
		if (stats.requested >= stats.requestLimit) break;
		if (cachedTextureImage(url)) continue;
		if (loadingByUrl.has(url)) {
			stats.loadingUrls += 1;
			continue;
		}
		const previous = urlRecords.get(url);
		if (previous && !previous.ok && options.retryFailed !== true) {
			stats.failedUrls += 1;
			continue;
		}
		stats.requested += 1;
		stats.requestedUrls.push(url);
		loadPublicMaterialUrl(url, options.timeoutMs ?? 8000).catch(() => null);
	}
	return stats;
}


__exports.hydrateSceneMaterialImages = hydrateSceneMaterialImages;
function runtimeMaterialUrls() {
	return Object.freeze(RUNTIME_MATERIALS.map(material => material.primaryUrl));
}


__exports.runtimeMaterialUrls = runtimeMaterialUrls;
function publicMaterialCacheStats() {
	return {
		cachedAliases: imageCache.size,
		uniqueImages: new Set(imageCache.values()).size,
		loading: loadingByUrl.size,
		failedUrls: [...urlRecords.values()].filter(record => !record.ok),
		roles: [...roleRecords.values()],
		sceneHydrationUrlLimit: SCENE_MATERIAL_HYDRATION_URL_LIMIT
	};
}


__exports.publicMaterialCacheStats = publicMaterialCacheStats;
function hydrateMaterialSlots(object, material, stats, referenced, ready, pending) {
	hydrateSlot({
		boundField: 'mapImagesBound',
		holder: material,
		imageKey: 'mapImage',
		kind: 'map',
		material,
		object,
		url: material.textureUrl
	}, stats, referenced, ready, pending);
	hydrateSlot({
		boundField: 'mixImagesBound',
		holder: material,
		imageKey: 'mixImage',
		kind: 'mix',
		material,
		object,
		url: material.mixTextureUrl
	}, stats, referenced, ready, pending);
	for (const layer of material.textureLayers || []) {
		hydrateSlot({
			boundField: 'layerImagesBound',
			holder: layer,
			imageKey: 'image',
			kind: 'layer',
			material,
			object,
			url: layer?.url
		}, stats, referenced, ready, pending);
	}
}

function hydrateSlot(slot, stats, referenced, ready, pending) {
	if (!isSceneMaterialUrl(slot.url)) return;
	referenced.add(slot.url);
	let current = slot.holder?.[slot.imageKey];
	const replaceable = slot.kind === 'map' && replaceableMapImage(slot.material, current);
	const cached = cachedTextureImage(slot.url);
	if (cached && (!usableImage(current) || replaceable)) {
		const prepared = slot.kind === 'map' ? prepareMapImage(slot.material, cached) : cached;
		if (prepared) {
			slot.holder[slot.imageKey] = prepared;
			current = prepared;
			stats[slot.boundField] += 1;
			if (slot.kind === 'map') markRealMapImage(slot.object, slot.material);
		} else if (slot.kind === 'map') {
			stats.mapTransformsPending += 1;
		}
	}
	if (usableImage(current) && !replaceableMapImage(slot.material, current)) {
		ready.add(slot.url);
		if (slot.object.userData && slot.kind === 'map') {
			slot.object.userData.AwtsmoosMaterialEnforcement = 'real-mapImage-bound-live';
		}
		return;
	}
	stats.pending += 1;
	pending.add(slot.url);
}

function prepareMapImage(material, image) {
	const transform = material?.texturePolicy?.hydrateMapImage;
	if (typeof transform !== 'function') return image;
	try {
		const prepared = transform(image);
		return usableImage(prepared) ? prepared : null;
	} catch {
		return null;
	}
}

function replaceableMapImage(material, image) {
	return material?.mapImageFallback === true
		|| material?.texturePolicy?.proceduralFallbackActive === true
		|| image?.dataset?.replaceableByPublicTexture === 'true';
}

function markRealMapImage(object, material) {
	material.mapImageFallback = false;
	if (material.texturePolicy && !Object.isFrozen(material.texturePolicy)) {
		material.texturePolicy.realMapImage = true;
		material.texturePolicy.proceduralFallbackActive = false;
	}
	const materialEvidence = material.userData?.AwtsmoosForestMaterial;
	if (materialEvidence && !Object.isFrozen(materialEvidence)) {
		materialEvidence.realMapImage = true;
		materialEvidence.proceduralFallback = false;
	}
	const objectEvidence = object.userData?.AwtsmoosForestLayer;
	if (objectEvidence && !Object.isFrozen(objectEvidence)) {
		objectEvidence.realMapImage = true;
		objectEvidence.proceduralFallback = false;
	}
}

function emptySceneHydrationStats(options = {}) {
	const requestedLimit = Number(options.requestLimit);
	const requestLimit = Number.isFinite(requestedLimit)
		? Math.max(0, Math.min(SCENE_MATERIAL_HYDRATION_URL_LIMIT, Math.floor(requestedLimit)))
		: SCENE_MATERIAL_HYDRATION_URL_LIMIT;
	return {
		materials: 0,
		mapImagesBound: 0,
		mixImagesBound: 0,
		layerImagesBound: 0,
		mapTransformsPending: 0,
		pending: 0,
		requested: 0,
		requestedUrls: [],
		requestLimit,
		referencedUrls: 0,
		readyUrls: 0,
		loadingUrls: 0,
		failedUrls: 0
	};
}

function usableImage(image) {
	return !!(
		image
		&& (image.naturalWidth || image.videoWidth || image.width)
		&& (image.naturalHeight || image.videoHeight || image.height)
		&& image.complete !== false
	);
}

function roleEvidence(material, result, selectedUrl, attempts) {
	return {
		role: material.role,
		label: material.label,
		primaryUrl: material.primaryUrl,
		selectedUrl,
		usedFallback: !!selectedUrl && selectedUrl !== material.primaryUrl,
		loaded: !!result?.ok,
		cacheBound: !!selectedUrl && !!cachedTextureImage(selectedUrl),
		width: result?.width || 0,
		height: result?.height || 0,
		durationMs: attempts.reduce((total, attempt) => total + attempt.durationMs, 0),
		error: result?.ok ? null : attempts.at(-1)?.error || 'no-candidate-loaded',
		attempts
	};
}

function summarize(records) {
	const loaded = records.filter(record => record.loaded).length;
	return {
		requested: records.length,
		loaded,
		failed: records.length - loaded,
		pending: 0,
		ok: loaded === records.length,
		strategy: 'role-manifest-bounded-concurrency-shared-image-cache',
		records
	};
}

function imageEvidence(url, image) {
	return {
		url,
		width: image.naturalWidth || image.width,
		height: image.naturalHeight || image.height,
		durationMs: 0,
		error: null
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/DetailTextureFamilies.js */
__awtsmoosModule_253 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DetailTextureFamilies.js
 * @description Names only image-decodable detail textures. Models and future
 * unpublished derivatives stay outside this preload vessel before the Awtsmoos.
 */
var exactMaterialUrl = __awtsmoosModule_238.exactMaterialUrl;
var fullMaterialUrl = __awtsmoosModule_238.fullMaterialUrl;

const freeze = (value) => Object.freeze(value);
const transparentAspen = exactMaterialUrl(
	'awtsmoos-nature/chai-forest/textures/leaves/aspen.png'
);

const DETAIL_TEXTURE_FAMILIES = Object.freeze({
	leaves: freeze({
		leaf1: fullMaterialUrl('leaf 1'),
		oakSpring: fullMaterialUrl('oak leaf spring'),
		oakFall: fullMaterialUrl('oak leaf fall'),
		chaiOak: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/oak.png'),
		chaiAsh: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/ash.png'),
		chaiAspen: transparentAspen,
		chaiPine: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/pine.png')
	}),
	botany: freeze({
		petalAtlas: exactMaterialUrl('awtsmoos-nature/ilanos/trees/sakura petal.png')
	}),
	metals: freeze({
		gold2: fullMaterialUrl('gold 2'),
		silver1: fullMaterialUrl('silver 1'),
		copper1: fullMaterialUrl('copper 1'),
		rustyIron: fullMaterialUrl('rusty iron')
	}),
	fabric: freeze({
		parchment: fullMaterialUrl('parchment'),
		leather: fullMaterialUrl('leather'),
		tanCloth: fullMaterialUrl('tan cloth'),
		rope: fullMaterialUrl('raveled rope')
	}),
	fur: freeze({
		cow: fullMaterialUrl('cow fur 1'),
		deer: fullMaterialUrl('deer fur 1'),
		fox: fullMaterialUrl('fox fur 1'),
		horse: fullMaterialUrl('horse fur 1')
	})
});
__exports.DETAIL_TEXTURE_FAMILIES = DETAIL_TEXTURE_FAMILIES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/SurfaceTextureFamilies.js */
__awtsmoosModule_254 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceTextureFamilies.js
 * @description Names the large village surfaces that receive stone, earth,
 * timber, water, and roofs as finite garments for the renewing Awtsmoos.
 */
var fullMaterialUrl = __awtsmoosModule_238.fullMaterialUrl;

const freeze = (value) => Object.freeze(value);

const SURFACE_TEXTURE_FAMILIES = Object.freeze({
	bricks: freeze({
		white1: fullMaterialUrl('white brick 1'),
		red1: fullMaterialUrl('red brick 1'),
		red2: fullMaterialUrl('red brick 2'),
		red3: fullMaterialUrl('red brick 3'),
		yellow1: fullMaterialUrl('yellow brick 1'),
		weatheredRed: fullMaterialUrl('weathered Red bricks 1'),
		limestone1: fullMaterialUrl('limestone bricks 1'),
		fieldstone1: fullMaterialUrl('weathered fieldstone Rock 1')
	}),
	terrain: freeze({
		dirt1: fullMaterialUrl('dirt 1'),
		dirt2: fullMaterialUrl('dirt 2'),
		dirt5: fullMaterialUrl('dirt 5'),
		dirt6: fullMaterialUrl('dirt 6'),
		dirtGrass1: fullMaterialUrl('dirt grass 1'),
		dirtGrass2: fullMaterialUrl('dirt grass 2'),
		dirtGrass3: fullMaterialUrl('dirt grass 3'),
		darkForestFloor: fullMaterialUrl('dark forest floor nonlight'),
		forestLeaves: fullMaterialUrl('forest floor covered with leaves'),
		marshGrass: fullMaterialUrl('marsh grass'),
		mud: fullMaterialUrl('mud'),
		sand1: fullMaterialUrl('sand 1'),
		tilledSoil: fullMaterialUrl('tilled soil'),
		grass1: fullMaterialUrl('grass 1'),
		grass4: fullMaterialUrl('grass 4'),
		grass5: fullMaterialUrl('grass 5'),
		grass6: fullMaterialUrl('grass 6'),
		grass7: fullMaterialUrl('grass 7'),
		grass8: fullMaterialUrl('grass 8')
	}),
	wood: freeze({
		bark1: fullMaterialUrl('tree bark 1'),
		oak1: fullMaterialUrl('oak wood 1'),
		oak2: fullMaterialUrl('oak wood 2'),
		oak3: fullMaterialUrl('oak wood 3'),
		planks1: fullMaterialUrl('wooden oak planks 1'),
		plankedFloor: fullMaterialUrl('wooden planked floor')
	}),
	water: freeze({
		still: fullMaterialUrl('seamless water'),
		bright: fullMaterialUrl('seamless water brighter'),
		shallowRiver: fullMaterialUrl('shallow river water'),
		raw: fullMaterialUrl('water not seamless')
	}),
	stone: freeze({
		stone1: fullMaterialUrl('stone 1'),
		bluestone1: fullMaterialUrl('bluestone 1'),
		cobblestone: fullMaterialUrl('cobblestone'),
		floor1: fullMaterialUrl('stone floor'),
		floor2: fullMaterialUrl('stone floor 2'),
		granite1: fullMaterialUrl('polished granite Rock 1')
	}),
	roof: freeze({
		tile1: fullMaterialUrl('tiled roof 1'),
		tile2: fullMaterialUrl('tiled roof 2'),
		tile3: fullMaterialUrl('tiled roof 3 smaller tiles'),
		tile4: fullMaterialUrl('tiled roof 4')
	})
});
__exports.SURFACE_TEXTURE_FAMILIES = SURFACE_TEXTURE_FAMILIES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureFamilies.js */
__awtsmoosModule_252 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureFamilies.js
 * @description Joins broad surfaces and delicate details into one stable
 * compatibility map, many material vessels held within the unity of Awtsmoos.
 */
var DETAIL_TEXTURE_FAMILIES = __awtsmoosModule_253.DETAIL_TEXTURE_FAMILIES;
var SURFACE_TEXTURE_FAMILIES = __awtsmoosModule_254.SURFACE_TEXTURE_FAMILIES;

const TEXTURE_URLS = Object.freeze({
	...SURFACE_TEXTURE_FAMILIES,
	...DETAIL_TEXTURE_FAMILIES
});
__exports.TEXTURE_URLS = TEXTURE_URLS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureArchitectureNames.js */
__awtsmoosModule_257 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureArchitectureNames.js
 * @description Names brick, roof, granite, timber, and constructed floor images without URLs.
 * The Awtsmoos raises dwelling from dust while Awtsmoos.com keeps every finite wall named;
 * filenames remain the vessel, and one remote root alone carries each roof, plank, brick, and frame.
 */

const REMOTE_ARCHITECTURE_TEXTURE_FILENAMES = Object.freeze([
	'displacement map for tiled roof 4.png',
	'gray brick 1.png',
	'limestone bricks 1.png',
	'limestone bricks 2.png',
	'marble 1.png',
	'new bricks 1.png',
	'new red bricks 2.png',
	'oak wood 1.png',
	'oak wood 2.png',
	'oak wood 3.png',
	'oak wooden planks 2.png',
	'polished granite Rock 1.png',
	'polished granite Rock 2.png',
	'polished granite Rock 3.png',
	'polished granite Rock 4.png',
	'red brick 1.png',
	'red brick 2.png',
	'red brick 3.png',
	'tiled roof 1.png',
	'tiled roof 2.png',
	'tiled roof 3 smaller tiles.png',
	'tiled roof 4.png',
	'tree bark 1.png',
	'weathered Red bricks 1.png',
	'weathered Red bricks 3.png',
	'weathered Red bricks 5.png',
	'weathered Red bricks 6.png',
	'weathered Red bricks with slight yellow touch4.png',
	'weathered Red bricks2.png',
	'white brick 1.png',
	'wooden oak planks 1.png',
	'wooden planked floor.png',
	'yellow brick 1.png'
]);
__exports.REMOTE_ARCHITECTURE_TEXTURE_FILENAMES = REMOTE_ARCHITECTURE_TEXTURE_FILENAMES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureCraftNames.js */
__awtsmoosModule_258 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureCraftNames.js
 * @description Names metal, cloth, hide, glass, parchment, rope, leaf, and water images without URLs.
 * The Awtsmoos shines through copper and river, leather and light; Awtsmoos.com keeps filenames
 * free of transport so every crafted garment may travel from one root yet remain truthful and bright.
 */

const REMOTE_CRAFT_TEXTURE_FILENAMES = Object.freeze([
	'copper 1.png',
	'copper 2.png',
	'cow fur 1.png',
	'cracked glass.png',
	'deer fur 1.png',
	'fox fur 1.png',
	'gold 2.png',
	'horse fur 1.png',
	'leaf 1.png',
	'leather.png',
	'oak leaf fall.png',
	'oak leaf spring.png',
	'parchment.png',
	'raveled rope.png',
	'red ceramic.png',
	'rusty iron.png',
	'seamless water brighter.png',
	'seamless water.png',
	'shallow river water.png',
	'silver 1.png',
	'silver 2.png',
	'tan cloth.png',
	'unraveled rope.png',
	'water not seamless.png'
]);
__exports.REMOTE_CRAFT_TEXTURE_FILENAMES = REMOTE_CRAFT_TEXTURE_FILENAMES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureGroundNames.js */
__awtsmoosModule_259 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureGroundNames.js
 * @description Names full-resolution earth, meadow, snow, stone, and floor images without URLs.
 * The Awtsmoos clothes one ground in many textures that rhyme; Awtsmoos.com preserves each
 * filename alone, so transport may change while earth keeps identity through space and time.
 */

const REMOTE_GROUND_TEXTURE_FILENAMES = Object.freeze([
	'bluestone 1.png',
	'cave floor.png',
	'cobblestone.png',
	'dark forest floor nonlight.png',
	'dirt 1.png',
	'dirt 2.png',
	'dirt 5.png',
	'dirt 6.png',
	'dirt grass 1.png',
	'dirt grass 2.png',
	'dirt grass 3.png',
	'dirt grass 4.png',
	'dirt grass 6.png',
	'dirt ground 3.png',
	'forest floor covered with leaves.png',
	'grass 1.png',
	'grass 4.png',
	'grass 5.png',
	'grass 6.png',
	'grass 7.png',
	'grass 8.png',
	'grass1.png',
	'marsh grass.png',
	'mud.png',
	'sand 1.png',
	'sand 2.png',
	'scortced floor.png',
	'snow 1.png',
	'snow 2.png',
	'stone 1.png',
	'stone floor 2.png',
	'stone floor.png',
	'tilled soil.png',
	'weathered fieldstone Rock 1.png',
	'weathered fieldstone Rock 2.png'
]);
__exports.REMOTE_GROUND_TEXTURE_FILENAMES = REMOTE_GROUND_TEXTURE_FILENAMES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureTreeNames.js */
__awtsmoosModule_260 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTreeNames.js
 * @description Names every uploaded bark, leaf, needle, frond, spray, and petal without URLs.
 * The Awtsmoos grows many branches from one hidden root; Awtsmoos.com preserves each tree name
 * while transport remains elsewhere, so bark and leaf may change their road without changing truth.
 */

const REMOTE_TREE_TEXTURE_FILENAMES = Object.freeze([
	'acacia bark.png',
	'acacia compound leaf.png',
	'apple leaf.png',
	'apple tree bark.png',
	'ash bark.png',
	'ash leaf.png',
	'aspen bark.png',
	'aspen leaf.png',
	'baobab bark.png',
	'baobab leaf.png',
	'Birch bark.png',
	'birtch leaf.png',
	'cedar spray.png',
	'cypress bark.png',
	'cypress scale leaf.png',
	'mangrove leaf.png',
	'mangrove tree bark.png',
	'maple leaf 2.png',
	'maple leaf.png',
	'oak leaf.png',
	'olive leaf.png',
	'Olive tree bark.png',
	'palm bark 2.png',
	'palm bark.png',
	'palm frond.png',
	'pine needles.png',
	'poplar bark.png',
	'poplar leaf.png',
	'redwood bark.png',
	'redwood needles.png',
	'sakura petal.png',
	'willow bark.png',
	'willow leaf.png'
]);
__exports.REMOTE_TREE_TEXTURE_FILENAMES = REMOTE_TREE_TEXTURE_FILENAMES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js */
__awtsmoosModule_256 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureCatalog.js
 * @description Joins filename-only texture families and resolves them only through transport helpers.
 * The Awtsmoos unites earth, house, craft, and tree without confusing their names; Awtsmoos.com
 * keeps one catalog of garments while the remote road remains sealed in its appointed frame.
 */

var REMOTE_ARCHITECTURE_TEXTURE_FILENAMES = __awtsmoosModule_257.REMOTE_ARCHITECTURE_TEXTURE_FILENAMES;
var REMOTE_CRAFT_TEXTURE_FILENAMES = __awtsmoosModule_258.REMOTE_CRAFT_TEXTURE_FILENAMES;
var REMOTE_GROUND_TEXTURE_FILENAMES = __awtsmoosModule_259.REMOTE_GROUND_TEXTURE_FILENAMES;
var REMOTE_TREE_TEXTURE_FILENAMES = __awtsmoosModule_260.REMOTE_TREE_TEXTURE_FILENAMES;
var fullResolutionTextureUrl = __awtsmoosModule_242.fullResolutionTextureUrl;
var treeTextureUrl = __awtsmoosModule_242.treeTextureUrl;

const FULL_RESOLUTION_FILENAMES = Object.freeze([
	...REMOTE_GROUND_TEXTURE_FILENAMES,
	...REMOTE_ARCHITECTURE_TEXTURE_FILENAMES,
	...REMOTE_CRAFT_TEXTURE_FILENAMES
]);

const REMOTE_TEXTURE_FILENAMES = Object.freeze({
	architecture: REMOTE_ARCHITECTURE_TEXTURE_FILENAMES,
	craft: REMOTE_CRAFT_TEXTURE_FILENAMES,
	ground: REMOTE_GROUND_TEXTURE_FILENAMES,
	trees: REMOTE_TREE_TEXTURE_FILENAMES
});
__exports.REMOTE_TEXTURE_FILENAMES = REMOTE_TEXTURE_FILENAMES;


function remoteFullResolutionTextureUrl(filename) {
	assertFilename(filename, FULL_RESOLUTION_FILENAMES);
	return fullResolutionTextureUrl(filename);
}


__exports.remoteFullResolutionTextureUrl = remoteFullResolutionTextureUrl;
function remoteTreeTextureUrl(filename) {
	assertFilename(filename, REMOTE_TREE_TEXTURE_FILENAMES);
	return treeTextureUrl(filename);
}


__exports.remoteTreeTextureUrl = remoteTreeTextureUrl;
function remoteTextureCatalogEvidence() {
	return Object.freeze({
		architecture: REMOTE_ARCHITECTURE_TEXTURE_FILENAMES.length,
		craft: REMOTE_CRAFT_TEXTURE_FILENAMES.length,
		ground: REMOTE_GROUND_TEXTURE_FILENAMES.length,
		total: FULL_RESOLUTION_FILENAMES.length + REMOTE_TREE_TEXTURE_FILENAMES.length,
		trees: REMOTE_TREE_TEXTURE_FILENAMES.length
	});
}


__exports.remoteTextureCatalogEvidence = remoteTextureCatalogEvidence;
function assertFilename(filename, names) {
	if (!names.includes(filename)) {
		throw new Error(`Unknown remote texture filename: ${filename}`);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/WorldMaterialPresets.js */
__awtsmoosModule_255 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMaterialPresets.js
 * @description Composes boot-critical world purposes with the uploaded tree filename library.
 * The Awtsmoos clothes terrain, house, river, bark, and leaf through one measured catalog;
 * Awtsmoos.com keeps startup hydration on the new source instead of an obsolete external host.
 */

var remoteTreeTextureUrl = __awtsmoosModule_256.remoteTreeTextureUrl;
var TEXTURE_URLS = __awtsmoosModule_252.TEXTURE_URLS;

const freeze = value => Object.freeze(value);
const tree = remoteTreeTextureUrl;

const WORLD_MATERIAL_PRESETS = Object.freeze({
	terrainMix: freeze([
		TEXTURE_URLS.terrain.grass1,
		TEXTURE_URLS.terrain.grass6,
		TEXTURE_URLS.terrain.dirtGrass3,
		TEXTURE_URLS.terrain.darkForestFloor,
		TEXTURE_URLS.terrain.forestLeaves,
		TEXTURE_URLS.terrain.marshGrass,
		TEXTURE_URLS.terrain.mud
	]),
	forestLeaves: freeze([
		tree('oak leaf.png'),
		tree('ash leaf.png'),
		tree('aspen leaf.png'),
		tree('pine needles.png')
	]),
	forestBark: freeze([
		tree('redwood bark.png'),
		tree('Olive tree bark.png'),
		tree('cypress bark.png'),
		tree('apple tree bark.png')
	]),
	houseWalls: freeze([
		TEXTURE_URLS.bricks.white1,
		TEXTURE_URLS.bricks.weatheredRed,
		TEXTURE_URLS.bricks.limestone1,
		TEXTURE_URLS.bricks.fieldstone1
	]),
	villageProps: freeze([
		TEXTURE_URLS.wood.planks1,
		TEXTURE_URLS.metals.rustyIron,
		TEXTURE_URLS.fabric.parchment,
		TEXTURE_URLS.fabric.rope,
		TEXTURE_URLS.metals.gold2
	]),
	water: freeze([
		TEXTURE_URLS.water.shallowRiver,
		TEXTURE_URLS.water.bright,
		TEXTURE_URLS.water.still
	])
});
__exports.WORLD_MATERIAL_PRESETS = WORLD_MATERIAL_PRESETS;


const TEXTURE_PURPOSES = Object.freeze({
	houseWall: TEXTURE_URLS.bricks.white1,
	lavaPlatform: TEXTURE_URLS.bricks.red3,
	lavaPlatformAlt: TEXTURE_URLS.bricks.red2,
	road: TEXTURE_URLS.bricks.yellow1,
	coin: TEXTURE_URLS.metals.gold2,
	terrainMix: TEXTURE_URLS.terrain.dirtGrass3,
	terrainDirtSet: freeze([
		TEXTURE_URLS.terrain.dirt1,
		TEXTURE_URLS.terrain.dirt2,
		TEXTURE_URLS.terrain.dirtGrass1,
		TEXTURE_URLS.terrain.dirtGrass2,
		TEXTURE_URLS.terrain.dirtGrass3,
		TEXTURE_URLS.terrain.darkForestFloor,
		TEXTURE_URLS.terrain.marshGrass
	]),
	houseFloor: TEXTURE_URLS.stone.stone1,
	houseDoor: TEXTURE_URLS.wood.bark1,
	houseRoof: TEXTURE_URLS.roof.tile2,
	forestBark: tree('redwood bark.png'),
	forestLeaf: tree('oak leaf.png'),
	botanicalLeaf: tree('aspen leaf.png'),
	botanicalPetal: tree('sakura petal.png'),
	lake: TEXTURE_URLS.water.shallowRiver,
	mezuzaCase: TEXTURE_URLS.metals.gold2,
	mezuzaScroll: TEXTURE_URLS.fabric.parchment
});
__exports.TEXTURE_PURPOSES = TEXTURE_PURPOSES;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureCatalog.js */
__awtsmoosModule_251 = (() => {
const __exports = {};
//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureCatalog.js
 * @description Preserves the synchronous texture doorway for local world materials.
 * The Awtsmoos gathers stone, timber, bark, roof, and river into one truthful catalog;
 * Awtsmoos.com exposes the nearby origin without carrying obsolete host-era language.
 */

var PUBLIC_MATERIAL_ORIGIN = __awtsmoosModule_241.PUBLIC_MATERIAL_ORIGIN;
var fullMaterialUrl = __awtsmoosModule_238.fullMaterialUrl;
var halfMaterialUrl = __awtsmoosModule_238.halfMaterialUrl;
var TEXTURE_URLS = __awtsmoosModule_252.TEXTURE_URLS;
var TEXTURE_PURPOSES = __awtsmoosModule_255.TEXTURE_PURPOSES;
var WORLD_MATERIAL_PRESETS = __awtsmoosModule_255.WORLD_MATERIAL_PRESETS;

const TEXTURE_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
__exports.TEXTURE_ORIGIN = TEXTURE_ORIGIN;

const fullTextureUrl = fullMaterialUrl;
__exports.fullTextureUrl = fullTextureUrl;

const halfTextureUrl = halfMaterialUrl;
__exports.halfTextureUrl = halfTextureUrl;

__exports.TEXTURE_PURPOSES = TEXTURE_PURPOSES;
__exports.TEXTURE_URLS = TEXTURE_URLS;
__exports.WORLD_MATERIAL_PRESETS = WORLD_MATERIAL_PRESETS;

/**
 * Returns a detached snapshot for diagnostics and editor inspection.
 *
 * @returns {object} Serializable texture catalog state.
 */
function publicTextureUrls() {
	return JSON.parse(JSON.stringify({
		origin: TEXTURE_ORIGIN,
		presets: WORLD_MATERIAL_PRESETS,
		purposes: TEXTURE_PURPOSES,
		urls: TEXTURE_URLS
	}));
}

__exports.publicTextureUrls = publicTextureUrls;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureDensityMath.js */
__awtsmoosModule_264 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureDensityMath.js
 * @description Separates bounded GPU density planning from exact authored repeat coverage.
 * The Awtsmoos grants each pixel a measured span while the finite renderer receives a guarded load;
 * Awtsmoos.com keeps exact fractions and bounded integer plans distinct along one truthful road.
 */

/**
 * Builds one bounded integer density axis for runtime GPU planning.
 *
 * @param {number} worldValue World-space span.
 * @param {number} pixelsValue Effective source pixels.
 * @param {number} target Target pixels per world unit.
 * @param {number} maximum Maximum integer repeats.
 * @returns {object} Repeat, density, tile span, and source utilization.
 */
function boundedTextureAxisPlan(
	worldValue,
	pixelsValue,
	target,
	maximum
) {
	const world = positiveTextureNumber(Math.abs(Number(worldValue)), 1);
	const pixels = positiveTextureNumber(pixelsValue, target);
	const ideal = world * target / pixels;
	const largestAtEightyFivePercent = Math.floor(ideal / 0.85);
	const repeat = Math.max(
		1,
		Math.min(maximum, largestAtEightyFivePercent || Math.ceil(ideal))
	);
	const effectiveDensity = pixels * repeat / world;

	return {
		effectiveDensity,
		repeat,
		tileWorld: world / repeat,
		utilization: Math.min(1, target / effectiveDensity)
	};
}


__exports.boundedTextureAxisPlan = boundedTextureAxisPlan;
/**
 * Computes exact fractional source coverage without integer rounding.
 *
 * @param {number} width World width.
 * @param {number} depth World depth.
 * @param {number} sourceWidth Source pixel width.
 * @param {number} sourceHeight Source pixel height.
 * @param {number} texelsPerWorld Target texels per world unit.
 * @returns {number[]} Exact two-axis repeats.
 */
function exactPixelRepeat(
	width,
	depth,
	sourceWidth,
	sourceHeight,
	texelsPerWorld
) {
	return [
		Math.abs(Number(width)) * texelsPerWorld / sourceWidth,
		Math.abs(Number(depth)) * texelsPerWorld / sourceHeight
	];
}


__exports.exactPixelRepeat = exactPixelRepeat;
function positiveTextureNumber(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0 ? number : fallback;
}


__exports.positiveTextureNumber = positiveTextureNumber;
function textureQualityScale(quality, mobile) {
	if (quality === 'low') {
		return 0.72;
	}

	if (quality === 'medium' || mobile) {
		return 0.86;
	}

	return 1;
}

__exports.textureQualityScale = textureQualityScale;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureImageMetrics.js */
__awtsmoosModule_266 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureImageMetrics.js
 * @description Reads source dimensions and public provenance without choosing repeat policy.
 * The Awtsmoos reveals each finite image through measured width, height, and truthful address;
 * Awtsmoos.com keeps source evidence independent while density and material vessels assemble.
 */

function textureSize(image) {
	return Object.freeze({
		h: image?.naturalHeight || image?.videoHeight || image?.height || 0,
		w: image?.naturalWidth || image?.videoWidth || image?.width || 0
	});
}


__exports.textureSize = textureSize;
function publicUrl(image) {
	return image?.dataset?.url
		|| image?.dataset?.publicUrl
		|| image?.src
		|| null;
}

__exports.publicUrl = publicUrl;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureRepeatPolicy.js */
__awtsmoosModule_267 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureRepeatPolicy.js
 * @description Names shared repeat and texture ceilings without performing density arithmetic.
 * The Awtsmoos gives every finite renderer a measured vessel and every authored tile its span;
 * Awtsmoos.com keeps policy constants stable while exact and bounded planners follow their plan.
 */

const REPEAT_HOOKS = Object.freeze({
	mobileMaxRepeats: 48,
	mobileMaxTexture: 2048,
	roadTileWorld: 2,
	surfaceTexelsPerWorld: 96,
	terrainTexelsPerWorld: 56
});
__exports.REPEAT_HOOKS = REPEAT_HOOKS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureDensityPlan.js */
__awtsmoosModule_265 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureDensityPlan.js
 * @description Builds bounded integer repeat plans for runtime GPU density and anisotropy.
 * The Awtsmoos measures source and world while the renderer receives a guarded finite count;
 * Awtsmoos.com keeps this bounded policy apart from exact authored fractions and their amount.
 */

var boundedTextureAxisPlan = __awtsmoosModule_264.boundedTextureAxisPlan;
var positiveTextureNumber = __awtsmoosModule_264.positiveTextureNumber;
var textureQualityScale = __awtsmoosModule_264.textureQualityScale;
var textureSize = __awtsmoosModule_266.textureSize;
var REPEAT_HOOKS = __awtsmoosModule_267.REPEAT_HOOKS;

function textureDensityPlan(options = {}) {
	const source = textureSize(options.image);
	const mobile = Boolean(options.mobile);
	const maxTexture = positiveTextureNumber(
		options.maxTextureSize,
		mobile ? 2048 : 4096
	);
	const target = positiveTextureNumber(
		options.texelsPerWorld,
		REPEAT_HOOKS.surfaceTexelsPerWorld
	) * textureQualityScale(options.quality, mobile);
	const effective = {
		w: Math.min(source.w || maxTexture, maxTexture),
		h: Math.min(source.h || maxTexture, maxTexture)
	};
	const maximum = positiveTextureNumber(
		options.maximumRepeats,
		mobile ? REPEAT_HOOKS.mobileMaxRepeats : 128
	);
	const x = boundedTextureAxisPlan(
		options.worldWidth,
		effective.w,
		target,
		maximum
	);
	const z = boundedTextureAxisPlan(
		options.worldDepth,
		effective.h,
		target,
		maximum
	);

	return Object.freeze({
		anisotropy: Math.min(
			positiveTextureNumber(options.maximumAnisotropy, mobile ? 4 : 12),
			mobile ? 4 : 12
		),
		effectivePixelsPerWorld: Object.freeze([x.effectiveDensity, z.effectiveDensity]),
		effectiveSource: Object.freeze(effective),
		mobile,
		repeat: Object.freeze([x.repeat, z.repeat]),
		source,
		sourceUtilization: Object.freeze([x.utilization, z.utilization]),
		targetPixelsPerWorld: target,
		tileWorld: Object.freeze([x.tileWorld, z.tileWorld])
	});
}

__exports.textureDensityPlan = textureDensityPlan;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureExactRepeat.js */
__awtsmoosModule_263 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureExactRepeat.js
 * @description Preserves exact fractional source coverage and optional bounded compatibility.
 * The Awtsmoos does not round away a partial garment when world and source reveal their ratio;
 * Awtsmoos.com lets explicit bounded callers choose restraint while authored fractions continue to flow.
 */

var exactPixelRepeat = __awtsmoosModule_264.exactPixelRepeat;
var positiveTextureNumber = __awtsmoosModule_264.positiveTextureNumber;
var textureDensityPlan = __awtsmoosModule_265.textureDensityPlan;
var textureSize = __awtsmoosModule_266.textureSize;

function repeatFromPixels(
	width,
	depth,
	image,
	texelsPerWorld = 96,
	fallback = [1, 1],
	options = {}
) {
	const source = textureSize(image);

	if (!source.w || !source.h) {
		return [...fallback];
	}

	if (options.bounded === true) {
		return [...textureDensityPlan({
			...options,
			image,
			texelsPerWorld,
			worldDepth: depth,
			worldWidth: width
		}).repeat];
	}

	const target = positiveTextureNumber(texelsPerWorld, 96);
	return exactPixelRepeat(width, depth, source.w, source.h, target);
}


__exports.repeatFromPixels = repeatFromPixels;
function exactRepeat(width, depth, tileWorld) {
	const tile = positiveTextureNumber(tileWorld, 1);

	return [
		Math.abs(Number(width)) / tile,
		Math.abs(Number(depth)) / tile
	];
}

__exports.exactRepeat = exactRepeat;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureMaterialFields.js */
__awtsmoosModule_268 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureMaterialFields.js
 * @description Builds material texture fields and familiar repeat aliases from exact coverage helpers.
 * The Awtsmoos joins color, source, projection, and measured repetition in one readable garment;
 * Awtsmoos.com keeps material assembly apart from density mathematics so each vessel stays ardent.
 */

var repeatFromPixels = __awtsmoosModule_263.repeatFromPixels;
var publicUrl = __awtsmoosModule_266.publicUrl;
var textureSize = __awtsmoosModule_266.textureSize;

function materialTexture(
	color,
	image,
	repeat = [1, 1],
	options = {}
) {
	const plan = options.densityPlan || null;

	return {
		anisotropy: plan?.anisotropy ?? options.anisotropy ?? 2,
		color,
		doubleSided: Boolean(options.doubleSided),
		mapImage: image || null,
		mapRepeat: [...repeat],
		texturePolicy: {
			densityPlan: plan,
			fullResolution: true,
			nativeTexelDensity: true,
			originalPixels: textureSize(image),
			projection: options.projection || 'cube-world',
			repeat: [...repeat],
			shaderWrap: 'mirror-pingpong-repeat'
		},
		textureUrl: publicUrl(image)
	};
}


__exports.materialTexture = materialTexture;
function wallRepeat(width, height, image, options) {
	return repeatFromPixels(width, height, image, 96, [1, 1], options);
}


__exports.wallRepeat = wallRepeat;
const floorRepeat = wallRepeat;
__exports.floorRepeat = floorRepeat;

const roofRepeat = wallRepeat;
__exports.roofRepeat = roofRepeat;

const roadRepeat = wallRepeat;
__exports.roadRepeat = roadRepeat;


function terrainRepeat(size, image, options) {
	return repeatFromPixels(size, size, image, 56, [1, 1], options);
}


__exports.terrainRepeat = terrainRepeat;
const mixRepeat = terrainRepeat;
__exports.mixRepeat = mixRepeat;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureRepeat.js */
__awtsmoosModule_262 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureRepeat.js
 * @description Preserves the historic texture-repeat API through focused exact and bounded modules.
 * The Awtsmoos reveals one public doorway while many measured vessels labor behind the wall;
 * Awtsmoos.com keeps every old import stable as exact coverage and GPU planning answer their call.
 */

__exports.exactRepeat = __awtsmoosModule_263.exactRepeat;
__exports.repeatFromPixels = __awtsmoosModule_263.repeatFromPixels;
__exports.publicUrl = __awtsmoosModule_266.publicUrl;
__exports.textureSize = __awtsmoosModule_266.textureSize;
__exports.floorRepeat = __awtsmoosModule_268.floorRepeat;
__exports.materialTexture = __awtsmoosModule_268.materialTexture;
__exports.mixRepeat = __awtsmoosModule_268.mixRepeat;
__exports.roadRepeat = __awtsmoosModule_268.roadRepeat;
__exports.roofRepeat = __awtsmoosModule_268.roofRepeat;
__exports.terrainRepeat = __awtsmoosModule_268.terrainRepeat;
__exports.wallRepeat = __awtsmoosModule_268.wallRepeat;
__exports.textureDensityPlan = __awtsmoosModule_265.textureDensityPlan;
__exports.REPEAT_HOOKS = __awtsmoosModule_267.REPEAT_HOOKS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveTexturePolicy.js */
__awtsmoosModule_261 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveTexturePolicy.js
 * @description Distinguishes physically tiled materials from intentional whole-image cards.
 * The Awtsmoos grants stone and parchment different purposes; Awtsmoos.com repeats physical
 * surfaces at one world basis while leaving signs, atlases, leaves, and portraits whole.
 */

var REPEAT_HOOKS = __awtsmoosModule_262.REPEAT_HOOKS;

const WHOLE_IMAGE_PATTERN = /(?:sign|scroll|mezuza|label|decal|atlas|leaf|blossom|window-card|interior-card|portrait|icon|sky|cloud)/i;

function createPrimitiveTexturePolicy(definition, uvUnitsPerWorld) {
	const authored = definition.texturePolicy || {};
	return {
		fullResolution: true,
		nativeTexelDensity: primitiveUsesNativeDensity(definition),
		originalPixelsOnly: true,
		resampleSource: false,
		texelsPerWorld: authored.texelsPerWorld || REPEAT_HOOKS.surfaceTexelsPerWorld,
		uvUnitsPerWorld: authored.uvUnitsPerWorld || uvUnitsPerWorld || null,
		...authored
	};
}


__exports.createPrimitiveTexturePolicy = createPrimitiveTexturePolicy;
function primitiveUsesNativeDensity(definition) {
	const authored = definition.texturePolicy || {};
	if (authored.nativeTexelDensity === true) return true;
	if (authored.nativeTexelDensity === false) return false;
	return !primitiveUsesWholeImage(definition);
}


__exports.primitiveUsesNativeDensity = primitiveUsesNativeDensity;
function primitiveUsesWholeImage(definition) {
	const text = [
		definition.id,
		definition.texturePolicy?.role,
		definition.userData?.family,
		definition.userData?.part
	].filter(Boolean).join(' ');
	return WHOLE_IMAGE_PATTERN.test(text);
}

__exports.primitiveUsesWholeImage = primitiveUsesWholeImage;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveMaterialFactory.js */
__awtsmoosModule_235 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds measured local images and existing layered recipes to primitive geometry.
 * The Awtsmoos clothes each finite surface without changing the garment's pixels; Awtsmoos.com
 * preserves authored strata through hydration, lighting, batching, and final GPU submission.
 */

var MeshStandardMaterial = __awtsmoosModule_5.MeshStandardMaterial;
var cachedTextureImage = __awtsmoosModule_236.cachedTextureImage;
var isSameOriginMaterialUrl = __awtsmoosModule_243.isSameOriginMaterialUrl;
var TEXTURE_PURPOSES = __awtsmoosModule_251.TEXTURE_PURPOSES;
var TEXTURE_URLS = __awtsmoosModule_251.TEXTURE_URLS;
var colorArray = __awtsmoosModule_175.colorArray;
var createPrimitiveTexturePolicy = __awtsmoosModule_261.createPrimitiveTexturePolicy;

function createPrimitiveMaterial(definition, uvUnitsPerWorld) {
	const textureUrl = textureUrlFor(definition);
	const mapImage = definition.mapImage || cachedTextureImage(textureUrl) || null;
	const mixImage = definition.mixImage
		|| cachedTextureImage(definition.mixTextureUrl)
		|| null;
	const material = new MeshStandardMaterial({
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		color: colorArray(definition.color),
		doubleSided: Boolean(definition.doubleSided),
		name: definition.id,
		opacity: definition.opacity ?? 1,
		transparent: Boolean(definition.transparent)
	});
	Object.assign(material, {
		alphaCutoff: definition.alphaCutoff ?? 0.5,
		alphaMode: definition.alphaMode || (definition.transparent ? 'BLEND' : 'OPAQUE'),
		anisotropy: definition.anisotropy ?? 3,
		backfaceCull: definition.backfaceCull,
		emissiveStrength: definition.emissiveStrength ?? 1.8,
		mapImage,
		mapRepeat: definition.mapRepeat || [1, 1],
		mixImage,
		mixRepeat: definition.mixRepeat || definition.mapRepeat || [1, 1],
		mixStrength: definition.mixStrength ?? 0,
		mixTextureUrl: definition.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
		normalTextureUrl: definition.normalTextureUrl || null,
		opacity: definition.opacity ?? 1,
		texturePolicy: materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld),
		textureUrl,
		transparent: Boolean(definition.transparent)
	});
	Object.assign(material, layeredFields(definition));
	return material;
}


__exports.createPrimitiveMaterial = createPrimitiveMaterial;
function layeredFields(definition) {
	if (!Array.isArray(definition.textureLayers) || !definition.textureLayers.length) return {};
	return {
		materialStack: definition.materialStack || null,
		textureLayers: definition.textureLayers.map(layer => ({
			...layer,
			image: layer.image || cachedTextureImage(layer.url) || null
		}))
	};
}

function materialPolicy(definition, textureUrl, mapImage, uvUnitsPerWorld) {
	return {
		...createPrimitiveTexturePolicy(definition, uvUnitsPerWorld),
		...(definition.texturePolicy || {}),
		fallbackApplied: !definition.textureUrl && !definition.mapImage,
		publicFirebase: definition.texturePolicy?.publicFirebase ?? false,
		realMapImage: Boolean(mapImage),
		sameOrigin: isSameOriginMaterialUrl(textureUrl)
	};
}

function textureUrlFor(definition) {
	return definition.textureUrl
		|| definition.mapImage?.dataset?.publicUrl
		|| definition.mapImage?.dataset?.url
		|| definition.mapImage?.src
		|| fallbackTexture(definition);
}

function fallbackTexture(definition) {
	const id = String(definition.id || '').toLowerCase();
	if (/water|lake|stream/.test(id)) return TEXTURE_URLS.water.shallowRiver;
	if (/grass|bush|flower|reed/.test(id)) return TEXTURE_URLS.terrain.grass7;
	if (/stone|well|cobble/.test(id)) return TEXTURE_URLS.stone.cobblestone;
	if (id.includes('roof')) return TEXTURE_URLS.roof.tile2;
	if (/gold|coin|lamp/.test(id)) return TEXTURE_URLS.metals.gold2;
	if (/sign|scroll|mezuza/.test(id)) return TEXTURE_PURPOSES.mezuzaScroll;
	if (/dirt|soil|garden/.test(id)) return TEXTURE_URLS.terrain.tilledSoil;
	return TEXTURE_URLS.wood.planks1;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveZoneWeights.js */
__awtsmoosModule_269 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveZoneWeights.js
 * @description Normalizes authored ecological masks for layered primitive materials.
 * The Awtsmoos gives each surface its measured portion without burdening every unrelated form;
 * Awtsmoos.com emits four channels only where layered texture meaning truly requires them.
 */

const DEFAULT_LAYERED_ZONE = Object.freeze([1, 1, 1, 1]);

function primitiveZoneWeights(zones, vertexCount, layered = false) {
	if (!layered) return null;
	const authored = Array.isArray(zones) && zones.length === vertexCount;
	const output = [];
	for (let index = 0; index < vertexCount; index += 1) {
		const zone = authored ? zones[index] : DEFAULT_LAYERED_ZONE;
		output.push(...normalizedZone(zone));
	}
	return output;
}


__exports.primitiveZoneWeights = primitiveZoneWeights;
function normalizedZone(zone) {
	if (!Array.isArray(zone) || zone.length < 4) return [...DEFAULT_LAYERED_ZONE];
	return [0, 1, 2, 3].map(index => clampUnit(zone[index]));
}

function clampUnit(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveUvProjection.js */
__awtsmoosModule_270 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveUvProjection.js
 * @description Projects missing UVs, measures their world scale, and bakes one world-unit basis.
 * The Awtsmoos joins image coordinates to physical place without stretching either vessel;
 * Awtsmoos.com bakes geometric scale into UVs so identical materials can batch as one revelation.
 */

function projectPrimitiveUvs(vertices, normals, definition) {
	const tile = positive(definition.texturePolicy?.tileWorld, 4);
	return vertices.flatMap((point, index) => {
		const offset = index * 3;
		const ax = Math.abs(normals[offset]);
		const ay = Math.abs(normals[offset + 1]);
		const az = Math.abs(normals[offset + 2]);
		if (ay >= ax && ay >= az) return [point.x / tile, point.z / tile];
		if (ax >= az) return [point.z / tile, point.y / tile];
		return [point.x / tile, point.y / tile];
	});
}


__exports.projectPrimitiveUvs = projectPrimitiveUvs;
function normalizePrimitiveUvsToWorld(uvs, uvUnitsPerWorld) {
	if (!uvUnitsPerWorld) return [...uvs];
	const [uUnits, vUnits] = uvUnitsPerWorld;
	return uvs.map((value, index) => (
		index % 2 === 0 ? value / uUnits : value / vUnits
	));
}


__exports.normalizePrimitiveUvsToWorld = normalizePrimitiveUvsToWorld;
function measureUvUnitsPerWorld(data) {
	const uWorld = [];
	const vWorld = [];
	for (let offset = 0; offset < data.indices.length; offset += 3) {
		const sample = triangleUvWorldScale(data, offset);
		if (!sample) continue;
		uWorld.push(sample.uWorld);
		vWorld.push(sample.vWorld);
	}
	if (!uWorld.length || !vWorld.length) return null;
	return [1 / robustMedian(uWorld), 1 / robustMedian(vWorld)];
}


__exports.measureUvUnitsPerWorld = measureUvUnitsPerWorld;
function triangleUvWorldScale(data, offset) {
	const indices = data.indices.slice(offset, offset + 3);
	const [p0, p1, p2] = indices.map(index => data.vertices[index]);
	const [uv0, uv1, uv2] = indices.map(index => uvAt(data.uvs, index));
	const du1 = uv1[0] - uv0[0];
	const dv1 = uv1[1] - uv0[1];
	const du2 = uv2[0] - uv0[0];
	const dv2 = uv2[1] - uv0[1];
	const determinant = du1 * dv2 - du2 * dv1;
	if (Math.abs(determinant) < 1e-10) return null;
	const first = subtract(p1, p0);
	const second = subtract(p2, p0);
	const dPdu = combine(first, dv2, second, -dv1, determinant);
	const dPdv = combine(first, -du2, second, du1, determinant);
	const uWorld = length(dPdu);
	const vWorld = length(dPdv);
	return uWorld > 1e-8 && vWorld > 1e-8 ? { uWorld, vWorld } : null;
}

function robustMedian(values) {
	const logs = values
		.filter(value => Number.isFinite(value) && value > 1e-8)
		.map(Math.log)
		.sort((left, right) => left - right);
	if (!logs.length) return 1;
	const middle = Math.floor(logs.length / 2);
	const value = logs.length % 2
		? logs[middle]
		: (logs[middle - 1] + logs[middle]) / 2;
	return Math.exp(value);
}

function uvAt(uvs, index) {
	return [uvs[index * 2], uvs[index * 2 + 1]];
}

function subtract(left, right) {
	return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}

function combine(first, firstScale, second, secondScale, divisor) {
	return {
		x: (first.x * firstScale + second.x * secondScale) / divisor,
		y: (first.y * firstScale + second.y * secondScale) / divisor,
		z: (first.z * firstScale + second.z * secondScale) / divisor
	};
}

function length(vector) {
	return Math.hypot(vector.x, vector.y, vector.z);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/Box3D.js */
__awtsmoosModule_170 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Box3D.js
 * @description Orchestrates primitive geometry, vertex color, material, collision, UV, and ecology masks.
 * The Awtsmoos reveals one world through focused vessels; Awtsmoos.com keeps original pixels
 * and authored botanical hues while measured surfaces carry only the meaning they need.
 */

var BufferAttribute = __awtsmoosModule_5.BufferAttribute;
var BufferGeometry = __awtsmoosModule_5.BufferGeometry;
var Mesh = __awtsmoosModule_5.Mesh;
var trianglesFromIndexed = __awtsmoosModule_171.trianglesFromIndexed;
var createPrimitiveGeometryData = __awtsmoosModule_175.createPrimitiveGeometryData;
var isProceduralShape = __awtsmoosModule_175.isProceduralShape;
var createPrimitiveVertexNormals = __awtsmoosModule_234.createPrimitiveVertexNormals;
var flattenPrimitiveVertices = __awtsmoosModule_234.flattenPrimitiveVertices;
var primitiveColorArray = __awtsmoosModule_234.primitiveColorArray;
var primitiveIndexArray = __awtsmoosModule_234.primitiveIndexArray;
var createPrimitiveMaterial = __awtsmoosModule_235.createPrimitiveMaterial;
var primitiveUsesNativeDensity = __awtsmoosModule_261.primitiveUsesNativeDensity;
var primitiveZoneWeights = __awtsmoosModule_269.primitiveZoneWeights;
var measureUvUnitsPerWorld = __awtsmoosModule_270.measureUvUnitsPerWorld;
var normalizePrimitiveUvsToWorld = __awtsmoosModule_270.normalizePrimitiveUvsToWorld;
var projectPrimitiveUvs = __awtsmoosModule_270.projectPrimitiveUvs;

const WORLD_UV_BASIS = Object.freeze([1, 1]);

function createPrimitiveMesh(definition) {
	const sourceData = createPrimitiveGeometryData(definition);
	const normals = createPrimitiveVertexNormals(sourceData);
	const authoredUvs = sourceData.uvs || projectPrimitiveUvs(sourceData.vertices, normals, definition);
	const measuredData = { ...sourceData, uvs: authoredUvs };
	const measuredUnits = measureUvUnitsPerWorld(measuredData);
	const physical = Boolean(primitiveUsesNativeDensity(definition) && measuredUnits);
	const uvs = physical ? normalizePrimitiveUvsToWorld(authoredUvs, measuredUnits) : authoredUvs;
	const data = { ...sourceData, uvs };
	const textureBasis = physical ? WORLD_UV_BASIS : measuredUnits;
	const geometry = createBufferGeometry(data, normals, definition);
	const material = createPrimitiveMaterial(definition, textureBasis);
	const mesh = new Mesh(geometry, material);
	mesh.name = definition.id;
	mesh.visible = definition.visible !== false;
	mesh.userData = primitiveUserData(definition, material, measuredUnits, textureBasis, geometry);
	mesh.setBaseTransform();
	return mesh;
}


__exports.createPrimitiveMesh = createPrimitiveMesh;
function primitiveColliders(definition) {
	if (definition.solid === false) return [];
	const data = createPrimitiveGeometryData(definition);
	const floor = definition.walkable === true ? undefined : false;
	return trianglesFromIndexed(data.vertices, data.indices, { floor, kind: definition.id, solid: true });
}


__exports.primitiveColliders = primitiveColliders;
function primitiveUserData(definition, material, measuredUnits, textureBasis, geometry) {
	return {
		...(definition.userData || {}),
		AwtsmoosLayeredMaterial: {
			layerCount: material.textureLayers?.length || 0,
			shader: material.texturePolicy?.shader || 'standard',
			vertexColor: Boolean(geometry.attributes.color),
			zoneAttribute: Boolean(geometry.attributes.zone)
		},
		AwtsmoosMaterialEnforcement: material.mapImage ? 'real-mapImage-bound' : 'url-only-not-yet-loaded',
		AwtsmoosTextureDensity: {
			bakedWorldUv: material.texturePolicy.nativeTexelDensity,
			measuredUnits,
			native: material.texturePolicy.nativeTexelDensity,
			originalPixelsOnly: true,
			textureBasis
		},
		AwtsmoosTextureUrl: material.textureUrl,
		procedural: isProceduralShape(definition.shape)
	};
}

function createBufferGeometry(data, normals, definition) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(flattenPrimitiveVertices(data.vertices)), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	const colors = primitiveColorArray(data.colors, data.vertices.length);
	if (colors) geometry.setAttribute('color', new BufferAttribute(colors, 4));
	const zones = primitiveZoneWeights(data.zones, data.vertices.length, Boolean(definition.textureLayers?.length));
	if (zones) geometry.setAttribute('zone', new BufferAttribute(new Float32Array(zones), 4));
	geometry.setIndex(new BufferAttribute(primitiveIndexArray(data.indices), 1));
	return geometry;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWeaponFactory.js */
__awtsmoosModule_169 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponFactory.js
 * @description Builds staff and sword meshes visible in bootstrap and rich render paths.
 * The Awtsmoos lets the equipped deed inhabit the visible hand; Awtsmoos.com marks every
 * shaft, gem, blade, guard, grip, and pommel as a finite renderable vessel.
 */

var Group = __awtsmoosModule_5.Group;
var createPrimitiveMesh = __awtsmoosModule_170.createPrimitiveMesh;

function createMinimalMeadowWeapon(itemId) {
	return itemId === 'spark-blade'
		? createSparkBlade()
		: createWoodenStaff();
}


__exports.createMinimalMeadowWeapon = createMinimalMeadowWeapon;
function createWoodenStaff() {
	const group = weaponGroup('wooden-staff', 'staff');
	group.add(part('staff-shaft', '#8b5a2b', 0, -0.05, 0, 0.15, 2.15, 0.15));
	group.add(part('staff-crook', '#9a6330', 0.2, 1.02, 0, 0.54, 0.15, 0.15));
	group.add(part('staff-gem', '#ffe25a', 0.45, 1.02, 0, 0.22, 0.22, 0.22, 'diamond'));
	return group;
}

function createSparkBlade() {
	const group = weaponGroup('spark-blade', 'sword');
	group.add(part('sword-blade', '#dff7ff', 0, 0.62, 0, 0.16, 1.34, 0.08));
	group.add(part('sword-tip', '#ffffff', 0, 1.34, 0, 0.22, 0.28, 0.1, 'diamond'));
	group.add(part('sword-guard', '#ffd957', 0, -0.1, 0, 0.72, 0.13, 0.16));
	group.add(part('sword-grip', '#6b3220', 0, -0.43, 0, 0.18, 0.54, 0.18));
	group.add(part('sword-pommel', '#ffd957', 0, -0.74, 0, 0.24, 0.2, 0.24, 'diamond'));
	return group;
}

function weaponGroup(itemId, weaponKind) {
	const group = new Group();
	group.name = `Awtsmoos_procedural_${itemId}`;
	group.visible = true;
	Object.assign(group.userData, {
		itemId,
		proceduralWeapon: true,
		weaponKind
	});
	return group;
}

function part(id, color, x, y, z, width, height, depth, shape = 'box') {
	const mesh = createPrimitiveMesh({
		color,
		id,
		position: { x, y, z },
		shape,
		size: { x: width, y: height, z: depth },
		solid: false
	});
	mesh.frustumCulled = false;
	mesh.visible = true;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.weaponPart = id;
	return mesh;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowEquipmentRuntime.js */
__awtsmoosModule_144 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEquipmentRuntime.js
 * @description Synchronizes garments, weapons, and player-owned derived projections.
 * The Awtsmoos distinguishes a player vessel from an actor-only garment vessel;
 * Awtsmoos.com projects combat stats only where real player state already exists.
 */
var MinimalMeadowAttachmentRegistry = __awtsmoosModule_145.MinimalMeadowAttachmentRegistry;
var MinimalMeadowDerivedStatsRuntime = __awtsmoosModule_150.MinimalMeadowDerivedStatsRuntime;
var MinimalMeadowEquipmentCasting = __awtsmoosModule_160.MinimalMeadowEquipmentCasting;
var applyMinimalGarmentAppearance = __awtsmoosModule_162.applyMinimalGarmentAppearance;
var applyMinimalGarmentVisibility = __awtsmoosModule_165.applyMinimalGarmentVisibility;
var resolveMinimalEquipmentNodes = __awtsmoosModule_165.resolveMinimalEquipmentNodes;
var installMinimalMeadowEquipmentListeners = __awtsmoosModule_168.installMinimalMeadowEquipmentListeners;
var minimalMeadowEquipmentDiagnostics = __awtsmoosModule_168.minimalMeadowEquipmentDiagnostics;
var minimalMeadowEquippedWeaponItemId = __awtsmoosModule_168.minimalMeadowEquippedWeaponItemId;
var createMinimalMeadowWeapon = __awtsmoosModule_169.createMinimalMeadowWeapon;

class MinimalMeadowEquipmentRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.inventory = runtime.inventory;
		this.bus = runtime.bus;
		this.model = null;
		this.nodes = null;
		this.drawn = true;
		this.weapon = null;
		this.weaponItemId = null;
		this.garments = {};
		this.appearance = {};
		this.attachments = new MinimalMeadowAttachmentRegistry();
		this.casting = new MinimalMeadowEquipmentCasting(this);
		this.derivedStats = runtime.playerStats
			? new MinimalMeadowDerivedStatsRuntime(runtime, this.inventory)
			: null;
		this.unsubscribers = installMinimalMeadowEquipmentListeners(this);
	}

	bindModel(model) {
		if (!model) return false;
		this.model = model;
		this.nodes = resolveMinimalEquipmentNodes(model);
		this.attachments.bindModel(this.nodes, this.drawn);
		this.synchronize();
		return true;
	}

	update() {
		if (this.runtime.model && this.runtime.model !== this.model) {
			return this.bindModel(this.runtime.model);
		}
		return this.attachments.tick(this.model, this.drawn, this.casting.active);
	}

	setDrawn(drawn, force = false) {
		if (this.casting.active && !force) return this.diagnostics();
		this.drawn = Boolean(drawn);
		this.synchronize();
		return this.diagnostics();
	}

	synchronize() {
		const state = this.inventory.snapshot();
		const itemId = minimalMeadowEquippedWeaponItemId(state.equipment.hand);
		if (itemId !== this.weaponItemId) this.replaceWeapon(itemId);
		if (this.nodes) {
			this.garments = applyMinimalGarmentVisibility(this.nodes, state.equipment);
			this.appearance = applyMinimalGarmentAppearance(
				this.nodes.wardrobe,
				state.equipment,
				state.appearance
			);
			this.attachments.setWeapon(this.weapon, this.drawn);
		}
		this.derivedStats?.update(state);
		this.emitState();
	}

	replaceWeapon(itemId) {
		this.attachments.detach();
		this.weapon = itemId ? createMinimalMeadowWeapon(itemId) : null;
		this.weaponItemId = itemId;
		this.attachments.setWeapon(this.weapon, this.drawn);
	}

	equipped(slot) {
		return this.inventory.snapshot().equipment[slot] || null;
	}

	emitState() {
		this.bus.emit('equipment:state', this.diagnostics());
	}

	diagnostics() {
		return {
			...minimalMeadowEquipmentDiagnostics(this),
			derivedStats: this.derivedStats?.snapshot() || null
		};
	}

	destroy() {
		this.casting.destroy();
		this.derivedStats?.destroy();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.attachments.destroy();
	}
}

__exports.MinimalMeadowEquipmentRuntime = MinimalMeadowEquipmentRuntime;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/MinimalMeadowGameRailUiRuntime.js */
__awtsmoosModule_272 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailUiRuntime.js
 * @description Holds neighboring UI subscriptions and diagnostics outside the mounting vessel.
 * The Awtsmoos distinguishes every responsibility without severing their light; Awtsmoos.com
 * keeps the rail mode, retractors, refresh events, profile, and diagnostics explicit and small.
 */

var installGameRailModeRuntime = __awtsmoosModule_117.installGameRailModeRuntime;

function installGameRailUiEvents(runtime, bus, mobileRetract, playerRetract) {
	const refreshEvents = [
		'player:xp',
		'profile:state',
		'enemy:attack',
		'enemy:looted',
		'quest:completed',
		'combat:impact'
	];
	return [
		installGameRailModeRuntime(runtime, bus),
		bus.on('controls:toggle', () => mobileRetract.toggle()),
		bus.on('hud:toggle', () => playerRetract.toggle()),
		...refreshEvents.map(name => bus.on(name, () => runtime.ui?.refresh?.()))
	];
}


__exports.installGameRailUiEvents = installGameRailUiEvents;
function minimalMeadowPlayerProfile(runtime) {
	const source = runtime.playerStats;
	return {
		armor: source.armor,
		face: source.face,
		health: source.health,
		level: source.level,
		maxHealth: source.maxHealth,
		name: source.name,
		xp: source.xp,
		xpMax: source.xpMax
	};
}


__exports.minimalMeadowPlayerProfile = minimalMeadowPlayerProfile;
function minimalMeadowUiDiagnostics(context) {
	return {
		combatBar: context.combatBar.diagnostics(),
		equipment: context.runtime.equipment.diagnostics(),
		gameRail: context.gameRail.diagnostics(),
		inventoryItems: context.inventory.snapshot().items.length,
		playerHealth: context.npcHud.player.health,
		playerLevel: context.npcHud.player.level,
		playerXp: context.npcHud.player.xp,
		statusReady: true,
		targetFrame: context.targetFrame.diagnostics()
	};
}

__exports.minimalMeadowUiDiagnostics = minimalMeadowUiDiagnostics;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowUiLifecycle.js */
__awtsmoosModule_271 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUiLifecycle.js
 * @description Owns UI refresh, diagnostics, coordinated retract events, and complete teardown.
 * The Awtsmoos renews visible state without leaking listeners or duplicating presentation;
 * Awtsmoos.com keeps profile publication, menu refresh, diagnostics, and destruction measurable.
 */

var installGameRailUiEvents = __awtsmoosModule_272.installGameRailUiEvents;
var minimalMeadowPlayerProfile = __awtsmoosModule_272.minimalMeadowPlayerProfile;
var minimalMeadowUiDiagnostics = __awtsmoosModule_272.minimalMeadowUiDiagnostics;

function createMinimalMeadowUiLifecycle(
	runtime,
	components,
	equipment
) {
	const unsubscribers = installGameRailUiEvents(
		runtime,
		runtime.bus,
		components.mobileRetract,
		components.playerRetract
	);
	let previousProfile = '';
	const refresh = () => {
		const profile = minimalMeadowPlayerProfile(runtime);
		const signature = JSON.stringify(profile);
		if (signature !== previousProfile) {
			components.npcHud.updatePlayer(profile);
		}
		previousProfile = signature;
		components.menu.refresh();
		components.coordinatedUi.refresh();
	};
	return {
		diagnostics() {
			return {
				...minimalMeadowUiDiagnostics({
					combatBar: components.combatBar,
					damageFeedback: components.damageFeedback,
					gameRail: components.gameRail,
					inventory: runtime.inventory,
					npcHud: components.npcHud,
					runtime,
					targetFrame: components.targetFrame
				}),
				coordinated: components.coordinatedUi.diagnostics(),
				damageFeedback: components.damageFeedback.diagnostics(),
				verticalSlice: components.verticalUi.diagnostics()
			};
		},
		dispose() {
			for (const unsubscribe of unsubscribers) unsubscribe();
			for (const item of destroyables(components)) item.destroy();
			equipment.destroy();
			components.inventoryPanel.destroy();
			components.npcHud.destroy();
		},
		refresh
	};
}


__exports.createMinimalMeadowUiLifecycle = createMinimalMeadowUiLifecycle;
function destroyables(components) {
	return [
		components.combatBar,
		components.gameRail,
		components.targetFrame,
		components.glyphs,
		components.damageFeedback,
		components.coordinatedUi,
		components.verticalUi,
		components.notice,
		components.menu,
		components.playerRetract,
		components.mobileRetract
	];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowUi.js */
__awtsmoosModule_47 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowUi.js
 * @description Creates shared UI state, releases bootstrap map ownership, and mounts rich components.
 * The Awtsmoos joins visible controls to living runtime state without duplicate garments;
 * Awtsmoos.com hands one map from compact light to full interface before mounting the later owner.
 */

var InventoryStore = __awtsmoosModule_48.InventoryStore;
var AwtsmoosEventBus = __awtsmoosModule_68.AwtsmoosEventBus;
var createMinimalMeadowUiComponents = __awtsmoosModule_69.createMinimalMeadowUiComponents;
var MinimalMeadowEquipmentRuntime = __awtsmoosModule_144.MinimalMeadowEquipmentRuntime;
var createMinimalMeadowUiLifecycle = __awtsmoosModule_271.createMinimalMeadowUiLifecycle;

function installMinimalMeadowUi(
	runtime,
	documentValue,
	environment = globalThis
) {
	runtime.ui?.releaseMinimap?.();
	const bus = runtime.bus || new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	Object.assign(runtime, {
		bus,
		inventory,
		inventoryStore: inventory
	});
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	runtime.equipment = equipment;
	equipment.bindModel(runtime.model);
	const components = createMinimalMeadowUiComponents(
		runtime,
		documentValue,
		environment
	);
	runtime.ui = createMinimalMeadowUiLifecycle(
		runtime,
		components,
		equipment
	);
	documentValue.documentElement.dataset.awtsmoosUi = 'ready';
	runtime.ui.refresh();
	return runtime.ui;
}

__exports.installMinimalMeadowUi = installMinimalMeadowUi;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPresentationBundle.js */
__awtsmoosModule_0 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationBundle.js
 * @description Installs the complete rich UI and animation graph from one generated runtime chunk.
 * The Awtsmoos gathers every visible control and living pose into one swift garment;
 * Awtsmoos.com preserves all presentation systems while eliminating the native module waterfall.
 */

var installMinimalMeadowAnimation = __awtsmoosModule_1.installMinimalMeadowAnimation;
var installMinimalMeadowUi = __awtsmoosModule_47.installMinimalMeadowUi;

function installMinimalMeadowPresentationBundle(
	runtime,
	environment = globalThis
) {
	const ui = installMinimalMeadowUi(
		runtime,
		environment.document || globalThis.document,
		environment
	);
	const animation = installMinimalMeadowAnimation(runtime);
	return Object.freeze({
		animation: Boolean(animation),
		ready: Boolean(ui && animation),
		ui: Boolean(ui)
	});
}

__exports.installMinimalMeadowPresentationBundle = installMinimalMeadowPresentationBundle;
return Object.freeze(__exports);
})();
/* B\"H compact entry exports */
export const installMinimalMeadowPresentationBundle = __awtsmoosModule_0.installMinimalMeadowPresentationBundle;
