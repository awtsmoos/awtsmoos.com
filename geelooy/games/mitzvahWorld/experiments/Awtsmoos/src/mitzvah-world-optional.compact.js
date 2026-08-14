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
var __awtsmoosModule_10;
var __awtsmoosModule_11;
var __awtsmoosModule_12;
var __awtsmoosModule_13;
var __awtsmoosModule_9;
var __awtsmoosModule_14;
var __awtsmoosModule_15;
var __awtsmoosModule_8;
var __awtsmoosModule_16;
var __awtsmoosModule_17;
var __awtsmoosModule_18;
var __awtsmoosModule_7;
var __awtsmoosModule_6;
var __awtsmoosModule_5;
var __awtsmoosModule_20;
var __awtsmoosModule_22;
var __awtsmoosModule_21;
var __awtsmoosModule_19;
var __awtsmoosModule_4;
var __awtsmoosModule_24;
var __awtsmoosModule_25;
var __awtsmoosModule_26;
var __awtsmoosModule_28;
var __awtsmoosModule_27;
var __awtsmoosModule_23;
var __awtsmoosModule_3;
var __awtsmoosModule_31;
var __awtsmoosModule_30;
var __awtsmoosModule_34;
var __awtsmoosModule_33;
var __awtsmoosModule_35;
var __awtsmoosModule_32;
var __awtsmoosModule_29;
var __awtsmoosModule_2;
var __awtsmoosModule_36;
var __awtsmoosModule_39;
var __awtsmoosModule_38;
var __awtsmoosModule_37;
var __awtsmoosModule_44;
var __awtsmoosModule_43;
var __awtsmoosModule_46;
var __awtsmoosModule_45;
var __awtsmoosModule_42;
var __awtsmoosModule_47;
var __awtsmoosModule_41;
var __awtsmoosModule_48;
var __awtsmoosModule_54;
var __awtsmoosModule_53;
var __awtsmoosModule_56;
var __awtsmoosModule_59;
var __awtsmoosModule_60;
var __awtsmoosModule_61;
var __awtsmoosModule_58;
var __awtsmoosModule_57;
var __awtsmoosModule_62;
var __awtsmoosModule_65;
var __awtsmoosModule_69;
var __awtsmoosModule_68;
var __awtsmoosModule_67;
var __awtsmoosModule_70;
var __awtsmoosModule_66;
var __awtsmoosModule_73;
var __awtsmoosModule_72;
var __awtsmoosModule_71;
var __awtsmoosModule_81;
var __awtsmoosModule_80;
var __awtsmoosModule_79;
var __awtsmoosModule_78;
var __awtsmoosModule_77;
var __awtsmoosModule_83;
var __awtsmoosModule_82;
var __awtsmoosModule_76;
var __awtsmoosModule_84;
var __awtsmoosModule_86;
var __awtsmoosModule_85;
var __awtsmoosModule_75;
var __awtsmoosModule_74;
var __awtsmoosModule_87;
var __awtsmoosModule_92;
var __awtsmoosModule_93;
var __awtsmoosModule_95;
var __awtsmoosModule_96;
var __awtsmoosModule_103;
var __awtsmoosModule_102;
var __awtsmoosModule_101;
var __awtsmoosModule_100;
var __awtsmoosModule_106;
var __awtsmoosModule_105;
var __awtsmoosModule_107;
var __awtsmoosModule_104;
var __awtsmoosModule_99;
var __awtsmoosModule_98;
var __awtsmoosModule_97;
var __awtsmoosModule_108;
var __awtsmoosModule_94;
var __awtsmoosModule_91;
var __awtsmoosModule_90;
var __awtsmoosModule_109;
var __awtsmoosModule_110;
var __awtsmoosModule_111;
var __awtsmoosModule_89;
var __awtsmoosModule_88;
var __awtsmoosModule_64;
var __awtsmoosModule_112;
var __awtsmoosModule_113;
var __awtsmoosModule_63;
var __awtsmoosModule_114;
var __awtsmoosModule_55;
var __awtsmoosModule_52;
var __awtsmoosModule_115;
var __awtsmoosModule_51;
var __awtsmoosModule_50;
var __awtsmoosModule_49;
var __awtsmoosModule_40;
var __awtsmoosModule_116;
var __awtsmoosModule_1;
var __awtsmoosModule_118;
var __awtsmoosModule_117;
var __awtsmoosModule_128;
var __awtsmoosModule_129;
var __awtsmoosModule_127;
var __awtsmoosModule_126;
var __awtsmoosModule_130;
var __awtsmoosModule_131;
var __awtsmoosModule_132;
var __awtsmoosModule_133;
var __awtsmoosModule_134;
var __awtsmoosModule_125;
var __awtsmoosModule_124;
var __awtsmoosModule_135;
var __awtsmoosModule_136;
var __awtsmoosModule_123;
var __awtsmoosModule_139;
var __awtsmoosModule_138;
var __awtsmoosModule_140;
var __awtsmoosModule_137;
var __awtsmoosModule_141;
var __awtsmoosModule_122;
var __awtsmoosModule_146;
var __awtsmoosModule_145;
var __awtsmoosModule_144;
var __awtsmoosModule_147;
var __awtsmoosModule_148;
var __awtsmoosModule_143;
var __awtsmoosModule_151;
var __awtsmoosModule_150;
var __awtsmoosModule_152;
var __awtsmoosModule_149;
var __awtsmoosModule_153;
var __awtsmoosModule_156;
var __awtsmoosModule_155;
var __awtsmoosModule_159;
var __awtsmoosModule_158;
var __awtsmoosModule_157;
var __awtsmoosModule_154;
var __awtsmoosModule_161;
var __awtsmoosModule_162;
var __awtsmoosModule_160;
var __awtsmoosModule_142;
var __awtsmoosModule_163;
var __awtsmoosModule_164;
var __awtsmoosModule_167;
var __awtsmoosModule_170;
var __awtsmoosModule_169;
var __awtsmoosModule_168;
var __awtsmoosModule_166;
var __awtsmoosModule_174;
var __awtsmoosModule_173;
var __awtsmoosModule_172;
var __awtsmoosModule_178;
var __awtsmoosModule_179;
var __awtsmoosModule_177;
var __awtsmoosModule_176;
var __awtsmoosModule_175;
var __awtsmoosModule_180;
var __awtsmoosModule_171;
var __awtsmoosModule_182;
var __awtsmoosModule_181;
var __awtsmoosModule_184;
var __awtsmoosModule_185;
var __awtsmoosModule_183;
var __awtsmoosModule_188;
var __awtsmoosModule_187;
var __awtsmoosModule_186;
var __awtsmoosModule_189;
var __awtsmoosModule_196;
var __awtsmoosModule_198;
var __awtsmoosModule_199;
var __awtsmoosModule_200;
var __awtsmoosModule_201;
var __awtsmoosModule_202;
var __awtsmoosModule_197;
var __awtsmoosModule_205;
var __awtsmoosModule_207;
var __awtsmoosModule_206;
var __awtsmoosModule_208;
var __awtsmoosModule_209;
var __awtsmoosModule_204;
var __awtsmoosModule_203;
var __awtsmoosModule_210;
var __awtsmoosModule_212;
var __awtsmoosModule_211;
var __awtsmoosModule_213;
var __awtsmoosModule_214;
var __awtsmoosModule_217;
var __awtsmoosModule_218;
var __awtsmoosModule_219;
var __awtsmoosModule_216;
var __awtsmoosModule_221;
var __awtsmoosModule_220;
var __awtsmoosModule_223;
var __awtsmoosModule_222;
var __awtsmoosModule_224;
var __awtsmoosModule_225;
var __awtsmoosModule_226;
var __awtsmoosModule_227;
var __awtsmoosModule_229;
var __awtsmoosModule_228;
var __awtsmoosModule_215;
var __awtsmoosModule_230;
var __awtsmoosModule_231;
var __awtsmoosModule_232;
var __awtsmoosModule_195;
var __awtsmoosModule_237;
var __awtsmoosModule_236;
var __awtsmoosModule_239;
var __awtsmoosModule_240;
var __awtsmoosModule_242;
var __awtsmoosModule_241;
var __awtsmoosModule_238;
var __awtsmoosModule_235;
var __awtsmoosModule_234;
var __awtsmoosModule_243;
var __awtsmoosModule_245;
var __awtsmoosModule_244;
var __awtsmoosModule_233;
var __awtsmoosModule_194;
var __awtsmoosModule_246;
var __awtsmoosModule_193;
var __awtsmoosModule_248;
var __awtsmoosModule_247;
var __awtsmoosModule_249;
var __awtsmoosModule_250;
var __awtsmoosModule_192;
var __awtsmoosModule_251;
var __awtsmoosModule_257;
var __awtsmoosModule_256;
var __awtsmoosModule_255;
var __awtsmoosModule_259;
var __awtsmoosModule_258;
var __awtsmoosModule_254;
var __awtsmoosModule_262;
var __awtsmoosModule_261;
var __awtsmoosModule_265;
var __awtsmoosModule_267;
var __awtsmoosModule_268;
var __awtsmoosModule_266;
var __awtsmoosModule_264;
var __awtsmoosModule_269;
var __awtsmoosModule_263;
var __awtsmoosModule_270;
var __awtsmoosModule_271;
var __awtsmoosModule_260;
var __awtsmoosModule_272;
var __awtsmoosModule_253;
var __awtsmoosModule_275;
var __awtsmoosModule_276;
var __awtsmoosModule_274;
var __awtsmoosModule_279;
var __awtsmoosModule_280;
var __awtsmoosModule_281;
var __awtsmoosModule_282;
var __awtsmoosModule_278;
var __awtsmoosModule_277;
var __awtsmoosModule_273;
var __awtsmoosModule_286;
var __awtsmoosModule_288;
var __awtsmoosModule_289;
var __awtsmoosModule_287;
var __awtsmoosModule_285;
var __awtsmoosModule_290;
var __awtsmoosModule_284;
var __awtsmoosModule_283;
var __awtsmoosModule_252;
var __awtsmoosModule_291;
var __awtsmoosModule_292;
var __awtsmoosModule_191;
var __awtsmoosModule_190;
var __awtsmoosModule_165;
var __awtsmoosModule_121;
var __awtsmoosModule_120;
var __awtsmoosModule_119;
var __awtsmoosModule_294;
var __awtsmoosModule_293;
var __awtsmoosModule_0;
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js */
__awtsmoosModule_10 = (() => {
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
__awtsmoosModule_11 = (() => {
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

var identity = __awtsmoosModule_10.identity;

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
__awtsmoosModule_12 = (() => {
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

var identity = __awtsmoosModule_10.identity;

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
__awtsmoosModule_13 = (() => {
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

var quatNormalize = __awtsmoosModule_11.quatNormalize;

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
__awtsmoosModule_9 = (() => {
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

__exports.copyMat4 = __awtsmoosModule_10.copyMat4;
__exports.EPSILON = __awtsmoosModule_10.EPSILON;
__exports.identity = __awtsmoosModule_10.identity;
__exports.inverse = __awtsmoosModule_10.inverse;
__exports.mat4FromArray = __awtsmoosModule_10.mat4FromArray;
__exports.multiply = __awtsmoosModule_10.multiply;
__exports.scale = __awtsmoosModule_10.scale;
__exports.translate = __awtsmoosModule_10.translate;
__exports.composeTRS = __awtsmoosModule_11.composeTRS;
__exports.quatMatrix = __awtsmoosModule_11.quatMatrix;
__exports.quatNormalize = __awtsmoosModule_11.quatNormalize;
__exports.lookAt = __awtsmoosModule_12.lookAt;
__exports.perspective = __awtsmoosModule_12.perspective;
__exports.transformPoint = __awtsmoosModule_12.transformPoint;
__exports.lerpArray = __awtsmoosModule_13.lerpArray;
__exports.quatSlerp = __awtsmoosModule_13.quatSlerp;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js */
__awtsmoosModule_14 = (() => {
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

var identity = __awtsmoosModule_9.identity;

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
__awtsmoosModule_15 = (() => {
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
__awtsmoosModule_8 = (() => {
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

var copyMat4 = __awtsmoosModule_9.copyMat4;
var identity = __awtsmoosModule_9.identity;
var cachedLocalMatrix = __awtsmoosModule_14.cachedLocalMatrix;
var invalidateTransformCache = __awtsmoosModule_14.invalidateTransformCache;
var ROOT_WORLD_MATRIX = __awtsmoosModule_14.ROOT_WORLD_MATRIX;
var updateCachedWorldMatrix = __awtsmoosModule_14.updateCachedWorldMatrix;
var Quaternion = __awtsmoosModule_15.Quaternion;
var Vector3 = __awtsmoosModule_15.Vector3;

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
__awtsmoosModule_16 = (() => {
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

var Object3D = __awtsmoosModule_8.Object3D;

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
__awtsmoosModule_17 = (() => {
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
__awtsmoosModule_18 = (() => {
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

var Object3D = __awtsmoosModule_8.Object3D;

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
__awtsmoosModule_7 = (() => {
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

var Bone = __awtsmoosModule_8.Bone;
var Group = __awtsmoosModule_8.Group;
var Object3D = __awtsmoosModule_8.Object3D;
var Scene = __awtsmoosModule_8.Scene;
var Mesh = __awtsmoosModule_16.Mesh;
var BufferAttribute = __awtsmoosModule_17.BufferAttribute;
var BufferGeometry = __awtsmoosModule_17.BufferGeometry;
var MeshStandardMaterial = __awtsmoosModule_17.MeshStandardMaterial;
var PerspectiveCamera = __awtsmoosModule_18.PerspectiveCamera;
var Quaternion = __awtsmoosModule_15.Quaternion;
var Vector3 = __awtsmoosModule_15.Vector3;

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
const __awtsmoosDefault_1w2urep = {
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
__exports.default = __awtsmoosDefault_1w2urep;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js */
__awtsmoosModule_6 = (() => {
const __exports = {};
// B"H
var BufferAttribute = __awtsmoosModule_7.BufferAttribute;

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
__awtsmoosModule_5 = (() => {
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

var accessorFloatArray = __awtsmoosModule_6.accessorFloatArray;

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
__awtsmoosModule_20 = (() => {
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
__awtsmoosModule_22 = (() => {
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
__awtsmoosModule_21 = (() => {
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

var slerpQuaternionInto = __awtsmoosModule_22.slerpQuaternionInto;

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
__awtsmoosModule_19 = (() => {
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

var captureClipPose = __awtsmoosModule_20.captureClipPose;
var createAnimationBindings = __awtsmoosModule_20.createAnimationBindings;
var resetAnimationBindings = __awtsmoosModule_20.resetAnimationBindings;
var applyChannelSample = __awtsmoosModule_21.applyChannelSample;

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
__awtsmoosModule_4 = (() => {
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

__exports.parseTinyAnimations = __awtsmoosModule_5.parseTinyAnimations;
__exports.summarizeAnimations = __awtsmoosModule_5.summarizeAnimations;
__exports.TinyAnimationPlayer = __awtsmoosModule_19.TinyAnimationPlayer;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-cache.js */
__awtsmoosModule_24 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-cache.js
 * @description Guards a computed joint palette by renderer frame and exact mesh
 * transform. Reuse is permitted only when the vessel is truly unchanged before Awtsmoos.
 */
class SkinPaletteCache {
	constructor() {
		this.frameToken = null;
		this.meshWorld = new Float32Array(16);
		this.valid = false;
		this.revision = 0;
	}

	/** Returns true only when a fresh palette computation is required. */
	needsUpdate(frameToken, meshWorld) {
		if (!validFrameToken(frameToken) || !this.valid) {
			return true;
		}
		if (this.frameToken !== frameToken) {
			return true;
		}
		return !matrixEquals(this.meshWorld, meshWorld);
	}

	/** Records the exact transform and increments the palette revision. */
	markUpdated(frameToken, meshWorld) {
		this.frameToken = frameToken;
		copyMatrix(this.meshWorld, meshWorld);
		this.valid = validFrameToken(frameToken);
		this.revision += 1;
		return this.revision;
	}

	invalidate() {
		this.valid = false;
		this.frameToken = null;
	}
}


__exports.SkinPaletteCache = SkinPaletteCache;
function matrixEquals(left, right) {
	if (!left || !right || left.length !== 16 || right.length !== 16) {
		return false;
	}
	for (let index = 0; index < 16; index += 1) {
		if (left[index] !== right[index]) {
			return false;
		}
	}
	return true;
}


__exports.matrixEquals = matrixEquals;
function copyMatrix(target, source) {
	if (!source || source.length !== 16) {
		target.fill(Number.NaN);
		return;
	}
	for (let index = 0; index < 16; index += 1) {
		target[index] = source[index];
	}
}

function validFrameToken(frameToken) {
	return Number.isInteger(frameToken) && frameToken >= 0;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-lines.js */
__awtsmoosModule_25 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-lines.js
 * @description Extracts diagnostic bone segments without entering palette or
 * renderer ownership. Each line is a small revealed relationship before the
 * Awtsmoos, drawn by Awtsmoos.com only from current parent-child transforms.
 */

/** Returns parent-to-child line positions for all skeletons bound below a root. */
function skeletonLinePositions(root) {
	const positions = [];
	root.traverse((node) => {
		const skeletons = node.userData?.skeletons;
		if (!(skeletons instanceof Map)) {
			return;
		}
		for (const skeleton of skeletons.values()) {
			appendSkeletonLines(skeleton, positions);
		}
	});
	return new Float32Array(positions);
}


__exports.skeletonLinePositions = skeletonLinePositions;
function appendSkeletonLines(skeleton, positions) {
	const jointSet = new Set(skeleton.joints.filter(Boolean));
	for (const joint of jointSet) {
		const parent = joint.parent;
		if (!parent || !jointSet.has(parent)) {
			continue;
		}
		positions.push(
			parent.matrixWorld[12],
			parent.matrixWorld[13],
			parent.matrixWorld[14],
			joint.matrixWorld[12],
			joint.matrixWorld[13],
			joint.matrixWorld[14]
		);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-matrix.js */
__awtsmoosModule_26 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-matrix.js
 * @description Decodes inverse-bind matrices from imported accessors with explicit
 * identity fallback. The Awtsmoos renews every matrix entry, while Awtsmoos.com
 * keeps absence visible instead of disguising missing data as remembered geometry.
 */
var identity = __awtsmoosModule_9.identity;

/** Returns one 4x4 matrix from a BufferAttribute-like accessor. */
function readSkinMatrix(accessor, index) {
	const source = accessor?.array || accessor;
	if (!source) {
		return identity();
	}
	const matrix = new Float32Array(16);
	for (let component = 0; component < 16; component += 1) {
		matrix[component] = source[index * 16 + component] ?? (
			component % 5 === 0 ? 1 : 0
		);
	}
	return matrix;
}
__exports.readSkinMatrix = readSkinMatrix;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-binding.js */
__awtsmoosModule_28 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-binding.js
 * @description Connects imported skin definitions to their visible mesh vessels.
 * The Awtsmoos joins bone and garment in one living form; Awtsmoos.com records that
 * relationship once so animation may unfold without rediscovering its own structure.
 */

function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
	const nodeMap = root.userData?.nodeMap || new Map();
	const skeletons = new Map();
	let maxJoints = 0;
	let missingJoints = 0;
	for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
		const skinDefinition = doc.skins[skinIndex] || {};
		const inverseBindAccessor = skinDefinition.inverseBindMatrices === undefined
			? null
			: accessors[skinDefinition.inverseBindMatrices];
		const skeleton = createSkeleton({
			inverseBindAccessor,
			nodeMap,
			skinDef: skinDefinition,
			skinIndex
		});
		skeletons.set(skinIndex, skeleton);
		maxJoints = Math.max(maxJoints, skeleton.jointCount);
		missingJoints += skeleton.joints.filter(joint => !joint).length;
	}
	const meshStats = bindMeshes(root, skeletons);
	root.userData.skeletons = skeletons;
	return {
		maxJoints,
		missingJoints,
		skeletonCount: skeletons.size,
		...meshStats
	};
}


__exports.bindSceneSkeletons = bindSceneSkeletons;
function bindMeshes(root, skeletons) {
	let rigidMeshes = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isMesh) return;
		const hasSkinAttributes = Boolean(
			node.geometry?.attributes?.joints
			&& node.geometry?.attributes?.weights
		);
		node.skeleton = skeletons.get(node.skinIndex) || null;
		node.isSkinnedMesh = Boolean(node.skeleton && hasSkinAttributes);
		if (node.isSkinnedMesh) skinnedMeshes += 1;
		else rigidMeshes += 1;
	});
	return {
		rigidMeshes,
		skinnedMeshes
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-scene.js */
__awtsmoosModule_27 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-scene.js
 * @description Updates visible world matrices in a reusable frame-local node map.
 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com recomputes
 * only changed transforms and keeps the map and metric vessels stable across frames.
 */

var bindSceneSkeletons = __awtsmoosModule_28.bindSceneSkeletons;
var ROOT_WORLD_MATRIX = __awtsmoosModule_14.ROOT_WORLD_MATRIX;
var updateCachedWorldMatrix = __awtsmoosModule_14.updateCachedWorldMatrix;

__exports.bindSceneSkeletons = bindSceneSkeletons;

function collectWorldMatrices(root, reusableWorldByNode = null) {
	const worldByNode = reusableWorldByNode instanceof Map
		? reusableWorldByNode
		: new Map();
	worldByNode.clear();
	const stats = reusableStats(worldByNode.stats);
	updateVisibleBranch(
		root,
		ROOT_WORLD_MATRIX,
		0,
		worldByNode,
		stats,
		true
	);
	worldByNode.stats = stats;
	return worldByNode;
}


__exports.collectWorldMatrices = collectWorldMatrices;
function updateTinySkeletons(root) {
	root._tinySkeletonWorldByNode = collectWorldMatrices(
		root,
		root._tinySkeletonWorldByNode
	);
	const worldByNode = root._tinySkeletonWorldByNode;
	let jointsUploaded = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isSkinnedMesh || !node.skeleton || !worldByNode.has(node)) return;
		skinnedMeshes += 1;
		jointsUploaded += node.skeleton.update(node.matrixWorld || ROOT_WORLD_MATRIX);
	});
	return {
		jointsUploaded,
		skinnedMeshes
	};
}


__exports.updateTinySkeletons = updateTinySkeletons;
function setMeshKindVisibility(
	root,
	{ skinned = true, rigid = true } = {}
) {
	root.traverse(node => {
		if (!node.isMesh) return;
		node.visible = node.isSkinnedMesh ? skinned : rigid;
	});
}


__exports.setMeshKindVisibility = setMeshKindVisibility;
function updateVisibleBranch(
	node,
	parentWorld,
	parentRevision,
	worldByNode,
	stats,
	parentVisible
) {
	const visible = parentVisible && node.visible !== false;
	if (!visible) {
		stats.skippedSubtrees += 1;
		return;
	}
	const changed = updateCachedWorldMatrix(
		node,
		parentWorld,
		parentRevision
	);
	if (changed) stats.updatedNodes += 1;
	else stats.reusedNodes += 1;
	node.userData ||= {};
	node.userData.worldMatrix = node.matrixWorld;
	worldByNode.set(node, node.matrixWorld);
	for (const child of node.children || []) {
		updateVisibleBranch(
			child,
			node.matrixWorld,
			node._worldRevision || 0,
			worldByNode,
			stats,
			visible
		);
	}
}

function reusableStats(stats) {
	const result = stats || {
		reusedNodes: 0,
		skippedSubtrees: 0,
		updatedNodes: 0
	};
	result.reusedNodes = 0;
	result.skippedSubtrees = 0;
	result.updatedNodes = 0;
	return result;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-system.js */
__awtsmoosModule_23 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-system.js
 * @description Owns imported skin palettes and measured frame-local reuse. Every
 * matrix is a finite keli renewed by the Awtsmoos, and Awtsmoos.com reuses it only
 * when frame identity and mesh transform agree exactly.
 */
var identity = __awtsmoosModule_9.identity;
var inverse = __awtsmoosModule_9.inverse;
var multiply = __awtsmoosModule_9.multiply;
var SkinPaletteCache = __awtsmoosModule_24.SkinPaletteCache;
var skeletonLinePositions = __awtsmoosModule_25.skeletonLinePositions;
var readSkinMatrix = __awtsmoosModule_26.readSkinMatrix;
var bindSceneSkeletons = __awtsmoosModule_27.bindSceneSkeletons;
var collectWorldMatrices = __awtsmoosModule_27.collectWorldMatrices;
var setMeshKindVisibility = __awtsmoosModule_27.setMeshKindVisibility;
var updateTinySkeletons = __awtsmoosModule_27.updateTinySkeletons;

const MAX_TINY_JOINTS = 96;
__exports.MAX_TINY_JOINTS = MAX_TINY_JOINTS;


__exports.collectWorldMatrices = collectWorldMatrices;
__exports.setMeshKindVisibility = setMeshKindVisibility;
__exports.skeletonLinePositions = skeletonLinePositions;
__exports.updateTinySkeletons = updateTinySkeletons;

/** Stores one GLTF skin and computes its mesh-relative joint palette. */
class TinySkeleton {
	constructor({
		skinIndex = 0,
		skinDef = {},
		nodeMap = new Map(),
		inverseBindAccessor = null
	} = {}) {
		this.skinIndex = skinIndex;
		this.name = skinDef.name || `Skin_${skinIndex}`;
		this.joints = (skinDef.joints || []).map((index) => nodeMap.get(index));
		this.inverseBindMatrices = this.joints.map((_, index) => (
			readSkinMatrix(inverseBindAccessor, index)
		));
		this.jointCount = this.joints.length;
		this.jointMatrices = new Float32Array(Math.max(1, this.jointCount) * 16);
		this.paletteCache = new SkinPaletteCache();
		this.paletteRevision = 0;
		this.lastPaletteRecomputed = false;
		this.resetPalette();
	}

	resetPalette() {
		for (let index = 0; index < Math.max(1, this.jointCount); index += 1) {
			this.jointMatrices.set(identity(), index * 16);
		}
	}

	update(meshWorld = identity()) {
		this.computePalette(meshWorld);
		this.paletteRevision += 1;
		this.paletteCache.invalidate();
		this.lastPaletteRecomputed = true;
		return Math.min(this.jointCount, MAX_TINY_JOINTS);
	}

	updateCached(meshWorld = identity(), frameToken) {
		if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
			this.lastPaletteRecomputed = false;
			return Math.min(this.jointCount, MAX_TINY_JOINTS);
		}
		this.computePalette(meshWorld);
		this.paletteCache.markUpdated(frameToken, meshWorld);
		this.paletteRevision += 1;
		this.lastPaletteRecomputed = true;
		return Math.min(this.jointCount, MAX_TINY_JOINTS);
	}

	invalidatePaletteCache() {
		this.paletteCache.invalidate();
	}

	computePalette(meshWorld) {
		const inverseMesh = inverse(meshWorld);
		const count = Math.min(this.jointCount, MAX_TINY_JOINTS);
		for (let index = 0; index < count; index += 1) {
			const joint = this.joints[index];
			const jointWorld = joint?.userData?.worldMatrix
				|| joint?.matrixWorld
				|| identity();
			const skinMatrix = multiply(
				inverseMesh,
				multiply(jointWorld, this.inverseBindMatrices[index])
			);
			this.jointMatrices.set(skinMatrix, index * 16);
		}
	}
}


__exports.TinySkeleton = TinySkeleton;
/** Builds and binds every GLTF skin using the canonical TinySkeleton class. */
function bindTinySkeletons(root, doc, accessors) {
	return bindSceneSkeletons(
		root,
		doc,
		accessors,
		(configuration) => new TinySkeleton(configuration)
	);
}
__exports.bindTinySkeletons = bindTinySkeletons;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-instance.js */
__awtsmoosModule_3 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-instance.js
 * @description Clones transforms and skeletons while sharing immutable GLTF resources.
 * The Awtsmoos renews every actor as a distinct motion vessel; Awtsmoos.com shares
 * geometry, accessors, textures, and palette materials without sharing mutable bones.
 */

var parseTinyAnimations = __awtsmoosModule_4.parseTinyAnimations;
var copyMat4 = __awtsmoosModule_9.copyMat4;
var Bone = __awtsmoosModule_7.Bone;
var Group = __awtsmoosModule_7.Group;
var Mesh = __awtsmoosModule_7.Mesh;
var bindTinySkeletons = __awtsmoosModule_23.bindTinySkeletons;

function instantiateTinyGltf(template, options = {}) {
	if (!template?.scene) throw new Error('A parsed GLTF template is required.');
	const nodeMap = new Map();
	const resources = {
		geometries: new Set(),
		materials: new Set()
	};
	const scene = cloneNode(
		template.scene,
		nodeMap,
		resources,
		options.materialResolver
	);
	const sourceData = template.scene.userData || {};
	const document = template.json || sourceData.gltf || {};
	const accessors = sourceData.accessors || [];
	const sourceNodes = sourceData.allNodes || [];
	const allNodes = sourceNodes.map((_, index) => nodeMap.get(index) || null);
	Object.assign(scene.userData, {
		accessors,
		allNodes,
		gltf: document,
		instanceLabel: options.label || 'instance',
		materials: sourceData.materials || [],
		nodeMap,
		sharedSourceUrl: sourceData.sourceUrl || null,
		skins: document.skins || []
	});
	const skinStats = bindTinySkeletons(scene, document, accessors);
	const animations = parseTinyAnimations(document, accessors, nodeMap);
	scene.userData.animations = animations;
	scene.name = `${options.label || 'instance'}_shared_gltf_scene`;
	return {
		animations,
		experimental: true,
		json: document,
		scene,
		stats: {
			...(template.stats || {}),
			...skinStats,
			instanceLabel: options.label || 'instance',
			sharedGeometries: resources.geometries.size,
			sharedMaterials: resources.materials.size,
			sharedTemplate: true
		}
	};
}


__exports.instantiateTinyGltf = instantiateTinyGltf;
function cloneNode(source, nodeMap, resources, materialResolver) {
	const target = createNode(source, resources, materialResolver);
	copyNodeState(source, target);
	const nodeIndex = source.userData?.nodeIndex;
	if (Number.isInteger(nodeIndex)) nodeMap.set(nodeIndex, target);
	for (const child of source.children || []) {
		target.add(cloneNode(child, nodeMap, resources, materialResolver));
	}
	target.setBaseTransform();
	return target;
}

function createNode(source, resources, materialResolver) {
	if (source.isBone) return new Bone();
	if (!source.isMesh) return new Group();
	resources.geometries.add(source.geometry);
	collectMaterials(resources.materials, source.material);
	const material = resolveMaterial(
		source.material,
		source,
		materialResolver
	);
	const mesh = new Mesh(source.geometry, material);
	mesh.skinIndex = source.skinIndex;
	mesh.primitiveMode = source.primitiveMode;
	mesh.nodeIndex = source.nodeIndex;
	return mesh;
}

function copyNodeState(source, target) {
	target.name = source.name;
	target.visible = source.visible !== false;
	target.position.copy(source.position);
	target.quaternion.copy(source.quaternion);
	target.scale.copy(source.scale);
	target.matrix = source.matrix ? copyMat4(source.matrix) : null;
	target.userData = { ...(source.userData || {}) };
}

function resolveMaterial(material, node, resolver) {
	if (Array.isArray(material)) {
		return material.map(item => resolver?.(item, node) || item);
	}
	return resolver?.(material, node) || material;
}

function collectMaterials(target, material) {
	for (const item of Array.isArray(material) ? material : [material]) {
		if (item) target.add(item);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-materials.js */
__awtsmoosModule_31 = (() => {
const __exports = {};
// B"H
var MeshStandardMaterial = __awtsmoosModule_7.MeshStandardMaterial;

/** GLTF material vessels: no more brown default; linear colors receive display breath. */
const DEFAULT_COLOR = [1, 1, 1, 1];

async function createTinyMaterials(doc, buffers, baseUrl) {
  const images = await loadImages(doc, buffers, baseUrl);
  const materials = (doc.materials || []).map((def, index) => materialFromDef(doc, def, index, images));
  return { materials, images, diagnostics: materialDiagnostics(doc, materials, images) };
}


__exports.createTinyMaterials = createTinyMaterials;
function materialFromDef(doc, def = {}, index = 0, images = []) {
  const pbr = def.pbrMetallicRoughness || {}, factor = pbr.baseColorFactor || DEFAULT_COLOR;
  const tex = textureImage(doc, pbr.baseColorTexture, images);
  const color = tex ? factor : displayColor(factor);
  const mat = new MeshStandardMaterial({ name: def.name || `material_${index}`, color, opacity: factor[3] ?? 1, alphaMode: def.alphaMode || 'OPAQUE', alphaCutoff: def.alphaCutoff ?? 0.5, transparent: (def.alphaMode || 'OPAQUE') === 'BLEND' || (factor[3] ?? 1) < 1, doubleSided: def.doubleSided === true });
  Object.assign(mat, { metallicFactor: pbr.metallicFactor ?? 1, roughnessFactor: pbr.roughnessFactor ?? 1, baseColorFactor: factor, sourceColorSpace: tex ? 'texture+sRGB-factor' : 'gltf-factor-linear-to-display', mapImage: tex?.image || null, textureUrl: tex?.url || null, mapRepeat: tex?.repeat || [1, 1], anisotropy: true });
  return mat;
}

function defaultTinyMaterial() {
  const mat = new MeshStandardMaterial({ name: 'material_default', color: DEFAULT_COLOR, opacity: 1, alphaMode: 'OPAQUE' });
  Object.assign(mat, { sourceColorSpace: 'neutral-default', mapRepeat: [1, 1], anisotropy: true });
  return mat;
}


__exports.defaultTinyMaterial = defaultTinyMaterial;
function textureImage(doc, info, images) {
  if (!info) return null; const tex = doc.textures?.[info.index]; if (!tex) return null;
  const image = images[tex.source]; if (!image) return null; const sampler = doc.samplers?.[tex.sampler] || {};
  return { image, url: image.dataset?.url || image.src || `image_${tex.source}`, repeat: sampler.wrapS === 33071 || sampler.wrapT === 33071 ? [1, 1] : [1, 1] };
}

async function loadImages(doc, buffers, baseUrl) {
  return await Promise.all((doc.images || []).map((image, index) => loadOneImage(doc, buffers, baseUrl, image, index)));
}

async function loadOneImage(doc, buffers, baseUrl, image, index) {
  if (image.uri) return await loadUriImage(new URL(image.uri, baseUrl).href, index);
  if (image.bufferView !== undefined) {
    const bv = doc.bufferViews[image.bufferView], buffer = buffers[bv.buffer];
    const bytes = buffer.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const blob = new Blob([bytes], { type: image.mimeType || 'image/png' });
    const url = URL.createObjectURL(blob);
    try { return await loadUriImage(url, index, `glb-bufferView:${image.bufferView}`); }
    finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
  }
  return null;
}

function loadUriImage(src, index, label = src) {
  return new Promise(resolve => { const img = new Image(); let done = false; const finish = value => { if (!done) { done = true; resolve(value); } }; img.crossOrigin = src.startsWith('blob:') ? null : 'anonymous'; img.onload = () => { img.dataset.url = label; img.dataset.index = String(index); finish(img); }; img.onerror = () => finish(null); img.src = src; });
}

function displayColor(color) { return [toSrgb(color[0] ?? 1), toSrgb(color[1] ?? 1), toSrgb(color[2] ?? 1), color[3] ?? 1]; }
function toSrgb(v) { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }

function materialDiagnostics(doc, materials, images) {
  return { count: materials.length, images: images.filter(Boolean).length, textures: (doc.textures || []).length, defaultColor: DEFAULT_COLOR, colorsConverted: true, entries: materials.map((m, i) => ({ i, name: m.name, color: m.color, raw: m.baseColorFactor, hasMap: !!m.mapImage, textureSize: m.mapImage ? `${m.mapImage.naturalWidth}x${m.mapImage.naturalHeight}` : null, sourceColorSpace: m.sourceColorSpace })).slice(0, 64) };
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-loader.js */
__awtsmoosModule_30 = (() => {
const __exports = {};
// B"H
var Bone = __awtsmoosModule_7.Bone;
var BufferGeometry = __awtsmoosModule_7.BufferGeometry;
var Group = __awtsmoosModule_7.Group;
var Mesh = __awtsmoosModule_7.Mesh;
var mat4FromArray = __awtsmoosModule_9.mat4FromArray;
var accessorSummary = __awtsmoosModule_6.accessorSummary;
var normalizeWeightsAttribute = __awtsmoosModule_6.normalizeWeightsAttribute;
var readAccessor = __awtsmoosModule_6.readAccessor;
var parseTinyAnimations = __awtsmoosModule_4.parseTinyAnimations;
var summarizeAnimations = __awtsmoosModule_4.summarizeAnimations;
var bindTinySkeletons = __awtsmoosModule_23.bindTinySkeletons;
var createTinyMaterials = __awtsmoosModule_31.createTinyMaterials;
var defaultTinyMaterial = __awtsmoosModule_31.defaultTinyMaterial;

/** Loader: GLB geometry, skins, animations, and glTF material color breath. */
const GLB_MAGIC = 0x46546c67, JSON_CHUNK = 0x4e4f534a, BIN_CHUNK = 0x004e4942;
const ATTR = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', COLOR_0: 'color', JOINTS_0: 'joints', WEIGHTS_0: 'weights' };
async function fetchBuffer(url) { const r = await fetch(url, { mode: 'cors' }); if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`); return await r.arrayBuffer(); }
function dataUri(uri) { const raw = atob(uri.split(',')[1] || ''), out = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i); return out.buffer; }
async function loadBuffers(doc, baseUrl, bin) { return await Promise.all((doc.buffers || []).map(b => b.uri ? (b.uri.startsWith('data:') ? dataUri(b.uri) : fetchBuffer(new URL(b.uri, baseUrl).href)) : bin)); }
function parseGlb(buffer) { const view = new DataView(buffer); if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('Not a GLB container'); let json = null, bin = null, chunks = []; for (let off = 12; off + 8 <= buffer.byteLength;) { const len = view.getUint32(off, true), type = view.getUint32(off + 4, true), bytes = buffer.slice(off + 8, off + 8 + len); chunks.push({ type, byteOffset: off + 8, byteLength: len }); if (type === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(bytes)); if (type === BIN_CHUNK) bin = bytes; off += 8 + len; } if (!json) throw new Error('GLB missing JSON chunk'); return { json, bin, chunks }; }
function markBones(doc) { const bones = new Set(); for (const s of doc.skins || []) for (const j of s.joints || []) bones.add(j); return bones; }
function makeAccessorGetter(doc, buffers, cache) { return i => cache[i] || (cache[i] = readAccessor(doc, buffers, i)); }
function warmAnimationAccessors(doc, getAccessor) { for (const a of doc.animations || []) for (const s of a.samplers || []) { if (s.input !== undefined) getAccessor(s.input); if (s.output !== undefined) getAccessor(s.output); } }
function primitiveMesh(materials, getAccessor, primitive, meshDef, nodeDef, primitiveIndex) { const geometry = new BufferGeometry(); geometry.mode = primitive.mode ?? 4; geometry.userData = { primitive, primitiveIndex }; for (const [semantic, accessorIndex] of Object.entries(primitive.attributes || {})) { const key = ATTR[semantic]; if (!key) continue; let attribute = getAccessor(accessorIndex); if (key === 'weights') attribute = normalizeWeightsAttribute(attribute); geometry.setAttribute(key, attribute); } if (primitive.indices !== undefined) geometry.setIndex(getAccessor(primitive.indices)); const mesh = new Mesh(geometry, primitive.material !== undefined ? materials[primitive.material] : defaultTinyMaterial()); mesh.name = meshDef.name || nodeDef.name || `mesh_${nodeDef.mesh}_${primitiveIndex}`; mesh.skinIndex = nodeDef.skin ?? null; mesh.primitiveMode = geometry.mode; mesh.userData = { meshDef, primitive, primitiveIndex }; return mesh; }
function applyNodeTransform(obj, nodeDef, index) { obj.userData.nodeIndex = index; obj.userData.gltfNode = nodeDef; if (nodeDef.name) { obj.name = nodeDef.name; obj.userData.name = nodeDef.name; } if (nodeDef.matrix) obj.matrix = mat4FromArray(nodeDef.matrix); else { if (nodeDef.translation) obj.position.fromArray(nodeDef.translation); if (nodeDef.rotation) obj.quaternion.fromArray(nodeDef.rotation); if (nodeDef.scale) obj.scale.fromArray(nodeDef.scale); } obj.setBaseTransform(); }
function buildNodes(doc, materials, getAccessor, bones, stats) { const nodeMap = new Map(), nodes = []; for (let i = 0; i < (doc.nodes || []).length; i++) { const def = doc.nodes[i] || {}, node = bones.has(i) ? new Bone() : new Group(); applyNodeTransform(node, def, i); nodes[i] = node; nodeMap.set(i, node); stats.nodes++; if (def.skin !== undefined) stats.skinnedNodes++; } for (let i = 0; i < nodes.length; i++) { const def = doc.nodes[i] || {}, node = nodes[i], meshDef = doc.meshes?.[def.mesh]; if (!meshDef) continue; for (let p = 0; p < (meshDef.primitives || []).length; p++) { const mesh = primitiveMesh(materials, getAccessor, meshDef.primitives[p], meshDef, def, p); mesh.nodeIndex = i; mesh.setBaseTransform(); node.add(mesh); stats.meshes++; stats.primitives++; if (mesh.skinIndex !== null && mesh.geometry.attributes.joints && mesh.geometry.attributes.weights) stats.skinnedPrimitives++; } } for (let i = 0; i < nodes.length; i++) for (const childIndex of doc.nodes[i]?.children || []) nodes[i].add(nodes[childIndex]); return { nodes, nodeMap }; }
function skinDetails(doc) { return (doc.skins || []).map((s, index) => ({ index, name: s.name || null, joints: (s.joints || []).length, skeleton: s.skeleton ?? null, hasInverseBind: s.inverseBindMatrices !== undefined, inverseBindAccessor: s.inverseBindMatrices })); }
function accessorDetails(doc) { const out = []; for (const m of doc.meshes || []) for (const p of m.primitives || []) for (const [sem, i] of Object.entries(p.attributes || {})) if (sem === 'JOINTS_0' || sem === 'WEIGHTS_0') out.push(`${sem}: ${accessorSummary(doc, i)}`); return [...new Set(out)].slice(0, 24); }
async function loadTinyGltf(url) { const started = performance.now(), buffer = await fetchBuffer(url), glb = parseGlb(buffer), doc = glb.json, buffers = await loadBuffers(doc, url, glb.bin), accessors = [], getAccessor = makeAccessorGetter(doc, buffers, accessors), root = new Group(), bones = markBones(doc), materialPack = await createTinyMaterials(doc, buffers, url); root.name = 'AwtsmoosTinyGltfRoot'; const stats = { nodes: 0, meshes: 0, primitives: 0, materials: (doc.materials || []).length, images: (doc.images || []).length, textures: (doc.textures || []).length, animations: (doc.animations || []).length, skins: (doc.skins || []).length, skinnedNodes: 0, skinnedPrimitives: 0, bytes: buffer.byteLength, chunks: glb.chunks, skinDetails: skinDetails(doc), animationDetails: summarizeAnimations(doc), accessorDetails: accessorDetails(doc), materialDetails: materialPack.diagnostics };
  for (let i = 0; i < (doc.accessors || []).length; i++) if (doc.accessors[i].type === 'MAT4' || doc.accessors[i].type === 'SCALAR') getAccessor(i); warmAnimationAccessors(doc, getAccessor); const built = buildNodes(doc, materialPack.materials, getAccessor, bones, stats), scene = doc.scenes?.[doc.scene || 0] || doc.scenes?.[0] || { nodes: built.nodes.map((_, i) => i) }; for (const nodeIndex of scene.nodes || []) root.add(built.nodes[nodeIndex]); Object.assign(root.userData, { gltf: doc, nodeMap: built.nodeMap, allNodes: built.nodes, skins: doc.skins || [], accessors, sourceUrl: url, materials: materialPack.materials, materialDetails: materialPack.diagnostics }); const clips = parseTinyAnimations(doc, accessors, built.nodeMap); Object.assign(stats, bindTinySkeletons(root, doc, accessors)); stats.joints = (doc.skins || []).reduce((n, s) => n + (s.joints?.length || 0), 0); stats.skeletonName = doc.skins?.[0]?.name || null; stats.hasInverseBind = !!doc.skins?.[0]?.inverseBindMatrices; stats.clips = clips.map(c => ({ index: c.index, name: c.name, duration: c.duration, channels: c.channels.length })); stats.ms = Math.round(performance.now() - started); root.userData.animations = clips; return { scene: root, json: doc, stats, animations: clips, experimental: true }; }

__exports.loadTinyGltf = loadTinyGltf;
const loadTinyGlb = loadTinyGltf;
__exports.loadTinyGlb = loadTinyGlb;

const __awtsmoosDefault_1ep8c8g = { loadTinyGltf, loadTinyGlb };
__exports.default = __awtsmoosDefault_1ep8c8g;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelRecords.js */
__awtsmoosModule_34 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelRecords.js
 * @description Records byte counts and SHA-256 identities for every active canonical Mitzvah World GLB.
 * The Awtsmoos gives each finite imported form one immutable name; Awtsmoos.com keeps structural trees
 * outside this table because every live tree now grows exclusively through the deeper procedural core in `geelooy/libs`.
 */

const REMOTE_MODEL_RECORDS = Object.freeze({
	'player/chossid.glb': record(2027368, 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48'),
	'reference-world/Axe_Small.glb': record(48868, 'ea26a8cdf24937ba2cd24148b3c684c59abc5208bef6c96ddca8fb00ed30ddd6'),
	'reference-world/Book.glb': record(11684, '3f6d8148030077aa95b035ca4d7f5ad589483806416fbd9b75546f49b5cce4c1'),
	'reference-world/Bush_Large_Flowers.glb': record(26788, 'cdb6c9e558a3c9b3a42eafbc2f3580767cea8b79be625bfdd41369080b468bf6'),
	'reference-world/Chest_Closed.glb': record(85120, '2ac5715af9015d885338e8c6d4b7fbea47131a253c24944e11f331b907b4d160'),
	'reference-world/Cow.glb': record(370816, '1d513ef5e3cba976405b68621905aa1954b7c7b673f0566bb3ac0135c330af6f'),
	'reference-world/Flower_4_Clump.glb': record(4868, 'ec4c5186b8b33b8095b5e8a4f733cfed1b21e876cf40f0ea9ea14537066592b9'),
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
__awtsmoosModule_33 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCatalog.js
 * @description Resolves immutable GLBs from the local vessel on localhost and the published mirror on remote hosts.
 * The Awtsmoos creates local truth and public revelation without mixing their addresses;
 * Awtsmoos.com keeps every content hash identical while each runtime drinks from the source appointed to its host.
 */

var REMOTE_MODEL_RECORDS = __awtsmoosModule_34.REMOTE_MODEL_RECORDS;

const LOCAL_MODEL_ROOT = '/games/mitzvahWorld/assets/models/';
__exports.LOCAL_MODEL_ROOT = LOCAL_MODEL_ROOT;

const REMOTE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';
__exports.REMOTE_MODEL_ROOT = REMOTE_MODEL_ROOT;


function remoteModelRecord(relativePath, locationLike = globalThis.location) {
	const modelPath = normalizeModelPath(relativePath);
	const record = REMOTE_MODEL_RECORDS[modelPath];
	if (!record) throw new Error(`Unknown model identity: ${relativePath}`);
	const segments = modelPath.split('/');
	const filename = segments.at(-1);
	const folder = segments.slice(0, -1).join('/');
	const hashedPath = `${folder}/${record.sha256}/${filename}`;
	const localUrl = `${LOCAL_MODEL_ROOT}${encodePath(hashedPath)}`;
	const remoteUrl = `${REMOTE_MODEL_ROOT}${encodePath(hashedPath)}`;
	const source = modelSourceMode(locationLike);
	const candidates = source === 'remote' ? [remoteUrl] : [localUrl, remoteUrl];
	return Object.freeze({
		...record,
		candidates: Object.freeze(candidates),
		drivePath: `assets/mitzvah-world/models/${hashedPath}`,
		filename,
		localUrl,
		path: modelPath,
		remoteUrl,
		source,
		url: source === 'remote' ? remoteUrl : localUrl
	});
}


__exports.remoteModelRecord = remoteModelRecord;
function remoteModelUrl(relativePath, locationLike = globalThis.location) {
	return remoteModelRecord(relativePath, locationLike).url;
}


__exports.remoteModelUrl = remoteModelUrl;
function modelUrlCandidates(value, locationLike = globalThis.location) {
	const candidate = String(value || '');
	const identity = Object.keys(REMOTE_MODEL_RECORDS).find(path => {
		const record = remoteModelRecord(path, null);
		return record.localUrl === candidate || record.remoteUrl === candidate;
	});
	return identity ? remoteModelRecord(identity, locationLike).candidates.slice() : [];
}


__exports.modelUrlCandidates = modelUrlCandidates;
function modelSourceMode(locationLike = globalThis.location) {
	const hostname = String(locationLike?.hostname || '').toLowerCase();
	if (!hostname) return 'local';
	return isLocalHostname(hostname) ? 'local' : 'remote';
}


__exports.modelSourceMode = modelSourceMode;
function isTrustedModelUrl(value) {
	const candidate = String(value || '').trim();
	if (!candidate || candidate.includes('?') || candidate.includes('#')) return false;
	return catalogRecords().some(record =>
		record.localUrl === candidate || record.remoteUrl === candidate
	);
}


__exports.isTrustedModelUrl = isTrustedModelUrl;
const isTrustedRemoteModelUrl = isTrustedModelUrl;
__exports.isTrustedRemoteModelUrl = isTrustedRemoteModelUrl;


function remoteModelCatalogEvidence() {
	const records = Object.values(REMOTE_MODEL_RECORDS);
	return Object.freeze({
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		models: records.length,
		policy: 'host-aware-local-authoritative-remote-published',
		remoteRoot: REMOTE_MODEL_ROOT,
		root: LOCAL_MODEL_ROOT
	});
}


__exports.remoteModelCatalogEvidence = remoteModelCatalogEvidence;
function catalogRecords() {
	return Object.keys(REMOTE_MODEL_RECORDS).map(path => remoteModelRecord(path, null));
}

function isLocalHostname(hostname) {
	return hostname === 'localhost'
		|| hostname === '127.0.0.1'
		|| hostname === '0.0.0.0'
		|| hostname === '[::1]'
		|| hostname.endsWith('.localhost');
}

function normalizeModelPath(value) {
	const modelPath = String(value || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	const invalid = modelPath.split('/').some(segment => !segment || segment === '.' || segment === '..');
	if (!modelPath || !modelPath.endsWith('.glb') || invalid) throw new Error(`Invalid model identity: ${value}`);
	return modelPath;
}

function encodePath(value) {
	return value.split('/').map(encodeURIComponent).join('/');
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelResponseCache.js */
__awtsmoosModule_35 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';
__exports.REMOTE_MODEL_CACHE_NAME = REMOTE_MODEL_CACHE_NAME;


/**
 * @file RemoteModelResponseCache.js
 * @description Persists verified GLBs and retries bounded transient storage throttling.
 * The Awtsmoos sends one measured form and lets the browser remember its vessel;
 * Awtsmoos.com honors Retry-After without multiplying requests or disguising permanent failure.
 */

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

async function cachedModelResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') throw new Error('Remote model fetch is unavailable.');
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
	const cache = await openCache(cacheStorage, options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchWithRetry(url, fetchFunction, options);
	if (response?.ok && isGlbResponse(response)) await cache?.put?.(url, response.clone());
	return { response, source: 'network' };
}


__exports.cachedModelResponse = cachedModelResponse;
function isGlbResponse(response) {
	const type = response?.headers?.get?.('content-type')?.toLowerCase() || '';
	return type === 'model/gltf-binary' || type === 'application/octet-stream';
}


__exports.isGlbResponse = isGlbResponse;
async function fetchWithRetry(url, fetchFunction, options) {
	const retries = nonnegative(options.transientRetries, 2);
	for (let attempt = 0; attempt <= retries; attempt += 1) {
		assertNotAborted(options.signal);
		const response = await fetchFunction(url, fetchOptions(options.signal));
		if (!RETRYABLE_STATUS.has(response?.status) || attempt === retries) return response;
		const delayMs = retryDelay(response, options, attempt);
		options.onRetry?.({ attempt: attempt + 1, delayMs, status: response.status, url });
		await waitForRetry(delayMs, options);
	}
	throw new Error('Remote model retry loop ended unexpectedly.');
}

function fetchOptions(signal) {
	return {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal
	};
}

function retryDelay(response, options, attempt) {
	const retryAfter = String(response?.headers?.get?.('retry-after') || '').trim();
	const seconds = Number(retryAfter);
	const requested = Number.isFinite(seconds) && seconds >= 0
		? seconds * 1000
		: Math.min(30000, 1000 * (2 ** attempt));
	const maximum = positive(options.maximumRetryAfterMs, 65000);
	return Math.min(maximum, Math.max(0, Math.round(requested)));
}

function waitForRetry(milliseconds, options) {
	const waitFunction = options.waitFunction || defaultWait;
	return waitFunction(milliseconds, options.signal);
}

function defaultWait(milliseconds, signal) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, milliseconds);
		signal?.addEventListener?.('abort', () => {
			clearTimeout(timer);
			reject(signal.reason || new DOMException('Aborted', 'AbortError'));
		}, { once: true });
	});
}

function assertNotAborted(signal) {
	if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError');
}

async function openCache(cacheStorage, cacheName = REMOTE_MODEL_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/ProgressiveAssetFetch.js */
__awtsmoosModule_32 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveAssetFetch.js
 * @description Streams verified local GLBs first and falls back to their immutable remote mirror.
 * The Awtsmoos draws every measured byte through the nearest honest gate;
 * Awtsmoos.com remembers each vessel and reveals the mirror only when local service must wait.
 */

var isTrustedModelUrl = __awtsmoosModule_33.isTrustedModelUrl;
var modelUrlCandidates = __awtsmoosModule_33.modelUrlCandidates;
var cachedModelResponse = __awtsmoosModule_35.cachedModelResponse;

const GLB_MAGIC = 0x46546c67;
const GLB_HEADER_BYTES = 12;

async function fetchAssetBuffer(url, onProgress = () => {}, dependencies = {}) {
	if (!isTrustedModelUrl(url)) throw new Error(`Untrusted model URL: ${url}`);
	const candidates = modelUrlCandidates(url);
	const failures = [];
	for (const candidate of candidates) {
		try {
			return await fetchCandidate(candidate, onProgress, dependencies);
		} catch (error) {
			failures.push(`${candidate}: ${error.message}`);
		}
	}
	throw new Error(`Every verified model source failed. ${failures.join(' | ')}`);
}


__exports.fetchAssetBuffer = fetchAssetBuffer;
async function fetchCandidate(url, onProgress, dependencies) {
	const cached = await cachedModelResponse(url, dependencies);
	const response = cached.response;
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	let total = Number(response.headers.get('content-length')) || 0;
	const reader = response.body?.getReader?.();
	if (!reader) {
		const buffer = await response.arrayBuffer();
		total = total || glbLength(new Uint8Array(buffer)) || buffer.byteLength;
		report(onProgress, buffer.byteLength, total, cached.source, url);
		return receipt(response, buffer, cached.source, url);
	}
	const chunks = [];
	let loaded = 0;
	report(onProgress, loaded, total, cached.source, url);
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		loaded += value.byteLength;
		if (!total && loaded >= GLB_HEADER_BYTES) total = glbLength(firstBytes(chunks, GLB_HEADER_BYTES));
		report(onProgress, loaded, total, cached.source, url);
	}
	const bytes = mergeChunks(chunks, loaded);
	total ||= bytes.byteLength;
	report(onProgress, loaded, total, cached.source, url);
	return receipt(response, bytes.buffer, cached.source, url);
}

function glbLength(bytes) {
	if (bytes.byteLength < GLB_HEADER_BYTES) return 0;
	const view = new DataView(bytes.buffer, bytes.byteOffset, GLB_HEADER_BYTES);
	return view.getUint32(0, true) === GLB_MAGIC ? view.getUint32(8, true) : 0;
}

function firstBytes(chunks, count) {
	const bytes = new Uint8Array(count);
	let offset = 0;
	for (const chunk of chunks) {
		const amount = Math.min(chunk.byteLength, count - offset);
		bytes.set(chunk.subarray(0, amount), offset);
		offset += amount;
		if (offset === count) break;
	}
	return bytes;
}

function mergeChunks(chunks, loaded) {
	const bytes = new Uint8Array(loaded);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}

function receipt(response, buffer, cacheSource, resolvedUrl) {
	return {
		buffer,
		cacheSource,
		contentType: response.headers.get('content-type') || 'model/gltf-binary',
		resolvedUrl
	};
}

function report(onProgress, loaded, total, cacheSource, resolvedUrl) {
	onProgress({ cacheSource, lengthComputable: total > 0, loaded, phase: 'download', progress: total > 0 ? loaded / total : null, resolvedUrl, total });
}

__exports.default = fetchAssetBuffer;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetTemplateCache.js */
__awtsmoosModule_29 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetTemplateCache.js
 * @description Owns trusted GLB template promises, parsing, eviction, and source receipts.
 * The Awtsmoos gives one measured garment to many independent forms;
 * Awtsmoos.com revokes temporary doors and evicts every promise that storms.
 */

var loadTinyGltf = __awtsmoosModule_30.loadTinyGltf;
var fetchAssetBuffer = __awtsmoosModule_32.fetchAssetBuffer;
var isTrustedModelUrl = __awtsmoosModule_33.isTrustedModelUrl;

const templatePromises = new Map();
let templateLoads = 0;

async function loadCachedModelTemplate(url, options = {}) {
	const resourceUrl = trustedModelUrl(url);
	const wasCached = templatePromises.has(resourceUrl);
	if (!wasCached) {
		templateLoads += 1;
		const promise = createTemplate(resourceUrl, options).catch(error => {
			templatePromises.delete(resourceUrl);
			throw modelLoadError(resourceUrl, error);
		});
		templatePromises.set(resourceUrl, promise);
	}
	const template = await templatePromises.get(resourceUrl);
	if (wasCached) options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
	return { resourceUrl, template };
}


__exports.loadCachedModelTemplate = loadCachedModelTemplate;
function modelTemplateCacheStats() {
	return {
		templateLoads,
		templatesCached: templatePromises.size
	};
}


__exports.modelTemplateCacheStats = modelTemplateCacheStats;
function clearModelTemplateCache() {
	templatePromises.clear();
	templateLoads = 0;
}


__exports.clearModelTemplateCache = clearModelTemplateCache;
function trustedModelResourceUrl(url) {
	return trustedModelUrl(url);
}


__exports.trustedModelResourceUrl = trustedModelResourceUrl;
async function createTemplate(resourceUrl, options) {
	const asset = await fetchAssetBuffer(resourceUrl, options.onProgress, options);
	options.onProgress?.({
		cacheSource: asset.cacheSource,
		loaded: asset.buffer.byteLength,
		phase: 'parsing',
		progress: 1,
		resolvedUrl: asset.resolvedUrl,
		total: asset.buffer.byteLength
	});
	const objectUrl = URL.createObjectURL(new Blob([asset.buffer], { type: asset.contentType }));
	try {
		const template = await loadTinyGltf(objectUrl);
		template.scene.userData.originalSourceUrl = resourceUrl;
		template.scene.userData.resolvedSourceUrl = asset.resolvedUrl;
		template.scene.userData.remoteModelCacheSource = asset.cacheSource;
		options.onProgress?.({
			cacheSource: asset.cacheSource,
			phase: 'ready',
			progress: 1,
			resolvedUrl: asset.resolvedUrl
		});
		return template;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function modelLoadError(resourceUrl, error) {
	const wrapped = new Error(`Unable to load trusted model ${resourceUrl}: ${error.message}`);
	wrapped.cause = error;
	return wrapped;
}

function trustedModelUrl(url) {
	const value = String(url || '').trim();
	if (!isTrustedModelUrl(value)) {
		throw new Error(`Model loading requires a verified content-addressed URL: ${value}`);
	}
	return value;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetLoader.js */
__awtsmoosModule_2 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Instantiates isolated models and reveals an explicit graceful fallback path.
 * The Awtsmoos clothes each actor while one shared template remains true;
 * Awtsmoos.com records success or failure without poisoning the next view.
 */

var instantiateTinyGltf = __awtsmoosModule_3.instantiateTinyGltf;
var clearModelTemplateCache = __awtsmoosModule_29.clearModelTemplateCache;
var loadCachedModelTemplate = __awtsmoosModule_29.loadCachedModelTemplate;
var modelTemplateCacheStats = __awtsmoosModule_29.modelTemplateCacheStats;
var trustedModelResourceUrl = __awtsmoosModule_29.trustedModelResourceUrl;

let instancesCreated = 0;
let fallbacksCreated = 0;

async function loadSharedGltfTemplate(url, options = {}) {
	const { template } = await loadCachedModelTemplate(url, options);
	return template;
}


__exports.loadSharedGltfTemplate = loadSharedGltfTemplate;
async function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = trustedModelResourceUrl(url);
	try {
		const { template } = await loadCachedModelTemplate(resourceUrl, options);
		const gltf = instantiateTinyGltf(template, {
			label,
			materialResolver: options.materialResolver
		});
		instancesCreated += 1;
		gltf.scene.userData.isolatedModelLoad = modelReceipt(
			label,
			resourceUrl,
			template.scene.userData.resolvedSourceUrl
		);
		return gltf;
	} catch (error) {
		reportFailure(options, resourceUrl, error);
		if (typeof options.fallbackFactory !== 'function') throw error;
		const fallback = await options.fallbackFactory({ error, label, url: resourceUrl });
		fallbacksCreated += 1;
		fallback.scene.userData.modelAssetFallback = {
			error: error.message,
			label,
			originalUrl: resourceUrl
		};
		return fallback;
	}
}


__exports.loadIsolatedGltf = loadIsolatedGltf;
function sharedGltfAssetStats() {
	return {
		fallbacksCreated,
		instancesCreated,
		...modelTemplateCacheStats()
	};
}


__exports.sharedGltfAssetStats = sharedGltfAssetStats;
function clearSharedGltfAssetCache() {
	clearModelTemplateCache();
	instancesCreated = 0;
	fallbacksCreated = 0;
}


__exports.clearSharedGltfAssetCache = clearSharedGltfAssetCache;
function modelReceipt(label, originalUrl, resolvedUrl) {
	return {
		instanceLabel: label,
		originalUrl,
		resolvedUrl,
		sharedNetworkResource: originalUrl,
		sharedTemplate: true
	};
}

function reportFailure(options, resourceUrl, error) {
	options.onProgress?.({
		error: error.message,
		phase: 'failed',
		progress: 1,
		resolvedUrl: resourceUrl
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js */
__awtsmoosModule_36 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzConstants.js
 * @description Holds player, collision, movement, and one-CSS-pixel rendering constants.
 * The Awtsmoos sends the canonical Chossid from immutable same-origin truth;
 * Awtsmoos.com preserves sharp CSS-pixel clarity without surplus Retina work in youth.
 */

var remoteModelUrl = __awtsmoosModule_33.remoteModelUrl;

const PLAYER_MODEL_URL = remoteModelUrl('player/chossid.glb');
__exports.PLAYER_MODEL_URL = PLAYER_MODEL_URL;

const SIDE_SIGN = -1;
__exports.SIDE_SIGN = SIDE_SIGN;

const FACE_HEIGHT = 1.78;
__exports.FACE_HEIGHT = FACE_HEIGHT;

const MAX_STEP = 0.96;
__exports.MAX_STEP = MAX_STEP;

const STEP_DOWN = 0.72;
__exports.STEP_DOWN = STEP_DOWN;

const MAX_SLOPE_NORMAL = 0.72;
__exports.MAX_SLOPE_NORMAL = MAX_SLOPE_NORMAL;

const WALK_SPEED = 3.7;
__exports.WALK_SPEED = WALK_SPEED;

const RUN_SPEED = 8.85;
__exports.RUN_SPEED = RUN_SPEED;

const MAX_RENDER_DPR = 1;
__exports.MAX_RENDER_DPR = MAX_RENDER_DPR;

const PLAYER_RADIUS = 0.38;
__exports.PLAYER_RADIUS = PLAYER_RADIUS;

const PLAYER_HEIGHT = 1.72;
__exports.PLAYER_HEIGHT = PLAYER_HEIGHT;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js */
__awtsmoosModule_39 = (() => {
const __exports = {};
// B"H
/** GroundRay: one beginning ray, so the soles kiss Eretz and do not float. */
function alignModelFeetToGround(model, groundY = 0) {
  model.updateWorldMatrix?.();
  const minY = findMinWorldY(model);
  if (!Number.isFinite(minY)) return { minY: null, offset: 0 };
  const offset = groundY - minY;
  model.position.y += offset;
  model.setBaseTransform?.();
  return { minY, offset };
}


__exports.alignModelFeetToGround = alignModelFeetToGround;
function findMinWorldY(root) {
  let minY = Infinity;
  root.traverse((object) => {
    const position = object.geometry?.attributes?.position;
    const matrix = object.matrixWorld;
    if (!position || !matrix) return;
    const array = position.array;
    for (let i = 0; i < array.length; i += 3) {
      const y = matrix[1] * array[i] + matrix[5] * array[i + 1] + matrix[9] * array[i + 2] + matrix[13];
      if (y < minY) minY = y;
    }
  });
  return minY;
}

__exports.findMinWorldY = findMinWorldY;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerModel.js */
__awtsmoosModule_38 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerModel.js
 * @description Mounts immediate or canonical Chossid forms behind one replaceable contract.
 * The Awtsmoos reveals living presence before optional animation; Awtsmoos.com keeps the
 * same runtime doorway for a local silhouette and a later canonical animated garment.
 */

var TinyAnimationPlayer = __awtsmoosModule_4.TinyAnimationPlayer;
var alignModelFeetToGround = __awtsmoosModule_39.alignModelFeetToGround;

function createPlayerModel(playerGltf, scene) {
	const model = playerGltf.scene;
	model.name = 'Awtsmoos_visible_player_isolated_chossid';
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(0, 0, 4);
	model.setBaseTransform();
	scene.add(model);
	const feet = alignModelFeetToGround(model, 0);
	const footOffset = model.position.y;
	const player = new TinyAnimationPlayer(model, playerGltf.animations || []);
	const clips = createClipMap(playerGltf.animations || []);
	const defaultClip = clips.stand || player.names[0] || '';
	if (defaultClip) player.play(defaultClip);
	model.userData.AwtsmoosCanonicalPlayer = playerEvidence(playerGltf, player, defaultClip);
	return { clips, defaultClip, feet, footOffset, model, player };
}



__exports.createPlayerModel = createPlayerModel;
function createEquipment(model) {
	const materials = new Set();
	const meshes = [];
	const visible = {};
	model.traverse(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		const material = object.material?.name || 'material';
		materials.add(material);
		visible[material] = object.visible !== false;
		meshes.push({ name: object.name, material, object });
	});
	return { materials: [...materials], meshes, visible };
}


__exports.createEquipment = createEquipment;
function toggleEquipmentMaterial(model, name, enabled) {
	model.traverse(object => {
		if ((object.isMesh || object.isSkinnedMesh) && object.material?.name === name) {
			object.visible = Boolean(enabled);
		}
	});
}


__exports.toggleEquipmentMaterial = toggleEquipmentMaterial;
function placePlayerModel(model, state) {
	model.position.set(state.x, state.renderY, state.z);
	model.quaternion.set(0, Math.sin(state.facing / 2), 0, Math.cos(state.facing / 2));
}


__exports.placePlayerModel = placePlayerModel;
function faceTarget(state) {
	return { x: state.x, y: state.renderY + state.faceHeight, z: state.z };
}


__exports.faceTarget = faceTarget;
function createClipMap(animations) {
	const clips = animations.map(clip => ({ duration: Number(clip.duration || 0), name: clip.name || '' }));
	const names = clips.map(clip => clip.name);
	const animated = expression => clips.find(clip => expression.test(clip.name) && clip.duration > 0)?.name;
	const named = expression => names.find(name => expression.test(name));
	const stand = animated(/^stand_Armature$/i)
		|| animated(/^stand 2_Armature$/i)
		|| animated(/stand|idle/i)
		|| named(/neutral/i)
		|| names[0]
		|| '';
	const walk = animated(/walk|step|stroll/i) || stand;
	const run = animated(/run|jog/i) || walk;
	const jump = animated(/jump|leap/i) || stand;
	return { fall: animated(/fall|air|drop/i) || jump, jump, run, stand, walk };
}


__exports.createClipMap = createClipMap;
function playerEvidence(gltf, player, defaultClip) {
	const fallback = gltf.scene?.userData?.isolatedModelLoad?.fallback === true;
	return {
		animationCount: player.names.length,
		defaultClip,
		modelSource: fallback ? 'local-procedural-chossid-silhouette' : 'chossid.glb',
		measuredAnimatedIdle: defaultClip === 'stand_Armature',
		optionalAnimationsDeferred: fallback
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowCanonicalAnimation.js */
__awtsmoosModule_37 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalAnimation.js
 * @description Binds every imported Chossid clip to the hydrated skeleton and preserves the authoritative controller explicitly.
 * The Awtsmoos gives motion and stillness one living vessel; Awtsmoos.com keeps that exact controller reachable across bootstrap,
 * gameplay composition, Movie Studio, diagnostics, and reproduction so a later compatibility player cannot erase fourteen authored clips.
 */

var TinyAnimationPlayer = __awtsmoosModule_4.TinyAnimationPlayer;
var createClipMap = __awtsmoosModule_38.createClipMap;

function installCanonicalChossidAnimation(runtime, gltf, visiblePlayer) {
	const animations = gltf.animations || [];
	const player = new TinyAnimationPlayer(visiblePlayer, animations);
	const clips = createClipMap(animations);
	const catalog = createCanonicalChossidAnimationCatalog(animations);
	const defaultClip = clips.stand || player.names[0] || '';
	if (defaultClip) player.play(defaultClip);
	player.update(0);
	runtime.canonicalAnimationPlayer = player;
	runtime.player = player;
	runtime.clips = clips;
	runtime.animationCatalog = catalog;
	runtime.state.clip = defaultClip;
	return { catalog, clips, defaultClip, player };
}


__exports.installCanonicalChossidAnimation = installCanonicalChossidAnimation;
/**
 * Returns immutable evidence for every animation exported by canonical `chossid.glb`.
 *
 * @param {Array<object>} animations Parsed GLB clips.
 * @returns {ReadonlyArray<object>} Exact-name animation catalog.
 */
function createCanonicalChossidAnimationCatalog(animations = []) {
	return Object.freeze(animations.map((clip, index) => Object.freeze({
		channels: Array.isArray(clip?.channels) ? clip.channels.length : 0,
		duration: Number(clip?.duration || 0),
		index,
		name: String(clip?.name || `animation-${index}`),
		pose: Number(clip?.duration || 0) <= 0.0005
	})));
}

__exports.createCanonicalChossidAnimationCatalog = createCanonicalChossidAnimationCatalog;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js */
__awtsmoosModule_44 = (() => {
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
__awtsmoosModule_43 = (() => {
const __exports = {};
// B"H // Boruch Hashem // Blessed is He

/**
 * @file Aabb.js
 * @description Holds one axis-aligned spatial vessel with inclusive boundaries.
 * The Awtsmoos surrounds every finite form without being bounded by it;
 * Awtsmoos.com reveals exact containment and contact through readable planes.
 */
var Vec3 = __awtsmoosModule_44.Vec3;

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
__awtsmoosModule_46 = (() => {
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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleTriangle.js */
__awtsmoosModule_45 = (() => {
const __exports = {};
// B"H
var add = __awtsmoosModule_46.add;
var closestPointsSegmentSegment = __awtsmoosModule_46.closestPointsSegmentSegment;
var dot = __awtsmoosModule_46.dot;
var length = __awtsmoosModule_46.length;
var negate = __awtsmoosModule_46.negate;
var normalize = __awtsmoosModule_46.normalize;
var planeDistance = __awtsmoosModule_46.planeDistance;
var projectToPlane = __awtsmoosModule_46.projectToPlane;
var scale = __awtsmoosModule_46.scale;
var sub = __awtsmoosModule_46.sub;
var triangleContainsPoint = __awtsmoosModule_46.triangleContainsPoint;

/** Capsule-triangle contact: copied as an idea from Octree.js, reborn raw. */
function capsuleTriangleContact(capsule, tri) {
  const center = scale(add(capsule.start, capsule.end), 0.5);
  const facingNormal = dot(sub(center, tri.a), tri.normal) < 0 ? negate(tri.normal) : tri.normal;
  const planeHit = planeContact(capsule, tri, facingNormal);
  let best = planeHit;
  for (const [a, b] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]]) best = deeper(best, edgeContact(capsule, tri, a, b, facingNormal));
  return best;
}


__exports.capsuleTriangleContact = capsuleTriangleContact;
function planeContact(capsule, tri, normal) {
  const d1 = dot(sub(capsule.start, tri.a), normal);
  const d2 = dot(sub(capsule.end, tri.a), normal);
  const nearest = Math.abs(d1) < Math.abs(d2) ? capsule.start : capsule.end;
  const dist = Math.abs(Math.abs(d1) < Math.abs(d2) ? d1 : d2);
  if (dist >= capsule.radius) return null;
  const projected = projectToPlane(nearest, { ...tri, normal });
  if (!triangleContainsPoint(projected, tri)) return null;
  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: projected };
}

function edgeContact(capsule, tri, a, b, fallbackNormal) {
  const [p1, p2] = closestPointsSegmentSegment(capsule.start, capsule.end, a, b);
  const delta = sub(p1, p2), dist = length(delta);
  if (dist >= capsule.radius) return null;
  const normal = dist > 0.00001 ? normalize(delta) : fallbackNormal;
  return { normal, depth: capsule.radius - dist + 0.002, kind: tri.kind, point: p2 };
}

function deeper(a, b) { if (!b) return a; if (!a || b.depth > a.depth) return b; return a; }
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleCollisionQuery.js */
__awtsmoosModule_42 = (() => {
const __exports = {};
// B"H
var Aabb = __awtsmoosModule_43.Aabb;
var capsuleTriangleContact = __awtsmoosModule_45.capsuleTriangleContact;

function capsuleFor(position, radius, height, footOffset) {
	const base = position.y - footOffset;
	return {
		radius,
		start: { x: position.x, y: base + 0.25, z: position.z },
		end: { x: position.x, y: base + height, z: position.z }
	};
}


__exports.capsuleFor = capsuleFor;
function deepestContact({ octree, capsule, radius, options, accept }) {
	let best = null;
	for (const triangle of candidates(octree, capsule, radius, options)) {
		const hit = capsuleTriangleContact(capsule, triangle);
		if (!hit || !accept(triangle, hit)) continue;
		if (!best || hit.depth > best.depth) best = hit;
	}
	return best;
}


__exports.deepestContact = deepestContact;
function candidates(octree, capsule, radius, options) {
	const bounds = capsuleBounds(capsule, radius);
	const dynamic = (options.dynamicColliders || []).filter((triangle) => (
		triangle.aabb?.intersects?.(bounds)
	));
	return [...octree.query(bounds), ...dynamic];
}

function capsuleBounds(capsule, radius) {
	const margin = radius + 0.04;
	return new Aabb(
		{
			x: capsule.start.x - margin,
			y: Math.min(capsule.start.y, capsule.end.y) - margin,
			z: capsule.start.z - margin
		},
		{
			x: capsule.start.x + margin,
			y: Math.max(capsule.start.y, capsule.end.y) + margin,
			z: capsule.start.z + margin
		}
	);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/CollisionMovePlan.js */
__awtsmoosModule_47 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CollisionMovePlan.js
 * @description Converts uncertain input into bounded horizontal substeps and measured receipts.
 * The Awtsmoos gives motion its possibility while Awtsmoos.com gives each finite stride a limit;
 * invalid numbers become stillness instead of tearing the Chossid beyond the created world.
 */

const DEFAULT_MAXIMUM_STEP = 0.055;

/** Returns a finite horizontal movement plan suitable for repeated capsule resolution. */
function createCollisionMovePlan(delta = {}, maximumStep = DEFAULT_MAXIMUM_STEP) {
	const rawX = Number(delta.x);
	const rawZ = Number(delta.z);
	const requested = {
		x: Number.isFinite(rawX) ? rawX : 0,
		z: Number.isFinite(rawZ) ? rawZ : 0
	};
	const stepLimit = finitePositive(maximumStep, DEFAULT_MAXIMUM_STEP);
	const distance = Math.hypot(requested.x, requested.z);
	const substeps = Math.max(1, Math.ceil(distance / stepLimit));
	return {
		distance,
		invalidInput: !Number.isFinite(rawX) || !Number.isFinite(rawZ),
		requested,
		step: { x: requested.x / substeps, z: requested.z / substeps },
		substeps
	};
}


__exports.createCollisionMovePlan = createCollisionMovePlan;
/** Returns immutable evidence of requested and actually applied horizontal motion. */
function collisionMoveReceipt(plan, start, position) {
	return Object.freeze({
		applied: Object.freeze({
			x: position.x - start.x,
			z: position.z - start.z
		}),
		invalidInput: plan.invalidInput,
		requested: Object.freeze({ ...plan.requested }),
		substeps: plan.substeps
	});
}


__exports.collisionMoveReceipt = collisionMoveReceipt;
function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/AwtsmoosCollisionMover.js */
__awtsmoosModule_41 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCollisionMover.js
 * @description Resolves a player capsule against real octree triangles with bounded finite steps.
 * The Awtsmoos renews traveler and wall without confusion; Awtsmoos.com measures each stride,
 * rejects impossible numbers, honors visible risers, and records the contact truth that remains.
 */

var capsuleFor = __awtsmoosModule_42.capsuleFor;
var deepestContact = __awtsmoosModule_42.deepestContact;
var collisionMoveReceipt = __awtsmoosModule_47.collisionMoveReceipt;
var createCollisionMovePlan = __awtsmoosModule_47.createCollisionMovePlan;

class AwtsmoosCollisionMover {
	constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
		Object.assign(this, { octree, radius, height, footOffset });
		this.lastCeiling = null;
		this.lastMove = null;
		this.resetContacts();
	}
	move(position, delta, options = {}) {
		const plan = createCollisionMovePlan(delta, options.maximumSubstep);
		const start = { x: position.x, z: position.z };
		this.resetContacts();
		for (let index = 0; index < plan.substeps; index += 1) {
			position.x += plan.step.x;
			position.z += plan.step.z;
			this.solve(position, options);
		}
		this.lastMove = collisionMoveReceipt(plan, start, position);
		return {
			contacts: this.lastContacts.length,
			movement: this.lastMove,
			normals: this.lastNormals,
			steppedFaces: this.lastStepFaces
		};
	}
	solve(position, options) {
		for (let pass = 0; pass < 7; pass += 1) {
			const hit = this.deepestWall(this.capsule(position), options);
			if (!hit) return;
			position.x += hit.normal.x * hit.depth;
			position.z += hit.normal.z * hit.depth;
			this.remember(hit);
		}
	}
	resolveCeiling(position, options = {}) {
		let pushed = 0;
		this.lastCeiling = null;
		for (let pass = 0; pass < 4; pass += 1) {
			const hit = this.deepestCeiling(this.capsule(position), options);
			if (!hit) break;
			position.y += Math.min(-0.002, hit.normal.y * hit.depth);
			pushed += hit.depth;
			this.lastCeiling = hit;
		}
		return { depth: pushed, hit: !!this.lastCeiling, kind: this.lastCeiling?.kind || null };
	}
	ceilingHit(position, options = {}) {
		return this.deepestCeiling(this.capsule(position), options);
	}
	deepestWall(capsule, options) {
		return deepestContact({
			accept: (triangle, hit) => this.isBlockingWall(triangle, hit, capsule, options),
			capsule,
			octree: this.octree,
			options,
			radius: this.radius
		});
	}
	deepestCeiling(capsule, options) {
		return deepestContact({
			accept: (triangle, hit) => this.isBlockingCeiling(triangle, hit, capsule),
			capsule,
			octree: this.octree,
			options,
			radius: this.radius
		});
	}
	isBlockingCeiling(triangle, hit, capsule) {
		if (!triangle.solid || triangle.floor || triangle.normal.y > -0.18) return false;
		if (triangle.aabb.max.y < capsule.end.y - 0.46) return false;
		hit.normal = triangle.normal;
		return true;
	}
	isBlockingWall(triangle, hit, capsule, options) {
		const maxSlope = options.maxSlopeNormal ?? 0.72;
		if (!triangle.solid) return false;
		if (triangle.floor && triangle.normal.y >= maxSlope) return false;
		if (triangle.floor && options.blockSteepFloors === false) return false;
		if (Math.abs(hit.normal.y) > 0.76) return false;
		const floorY = options.floorY ?? capsule.start.y - 0.25;
		const stepTop = floorY + (options.maxStepHeight ?? 0);
		if (!triangle.floor && options.grounded && triangle.aabb.max.y <= stepTop + 0.045) {
			this.lastStepFaces.push(triangle.kind);
			return false;
		}
		return true;
	}
	resetContacts() {
		this.lastContacts = [];
		this.lastNormals = [];
		this.lastStepFaces = [];
	}
	remember(hit) {
		this.lastContacts.push(hit.kind);
		this.lastNormals.push({ ...hit.normal, depth: hit.depth });
	}
	capsule(position) {
		return capsuleFor(position, this.radius, this.height, this.footOffset);
	}
}

__exports.AwtsmoosCollisionMover = AwtsmoosCollisionMover;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/motion/JumpPhysics.js */
__awtsmoosModule_48 = (() => {
const __exports = {};
// B"H
/** Jump physics samples only floors reachable from the current feet height. */
class JumpPhysics{
  constructor({ground,footOffset,impulse=7.35,gravity=13.25,maxSlopeNormal=.72}){Object.assign(this,{ground,footOffset,impulse,gravity,maxSlopeNormal});}
  update(state,dt,jumpQueued){
    const feetY=state.y-this.footOffset;
    const sample=this.ground.sample(state.x,state.z,{maxY:feetY+.12});
    const floorY=sample.height+this.footOffset;
    state.groundKind=sample.kind;state.groundNormal=sample.normal;
    state.grounded=state.y<=floorY+.06&&state.velY<=.03;
    if(state.grounded){state.y=floorY;state.velY=0;state.airPhase='ground';}
    if(jumpQueued&&state.grounded){state.velY=this.impulse;state.grounded=false;state.airPhase='jump';state.jumpClock=0;state.slopeState='jump';}
    if(!state.grounded)return this.air(state,dt);
    return this.slide(state,sample,dt);
  }
  air(state,dt){
    state.jumpClock+=dt;state.velY-=this.gravity*dt;state.y+=state.velY*dt;
    const feetY=state.y-this.footOffset;
    const floorY=this.ground.heightAt(state.x,state.z,{maxY:feetY+.18})+this.footOffset;
    state.airPhase=state.velY>=-.25&&state.jumpClock<.46?'jump':'fall';
    if(state.velY<=0&&state.y<=floorY){state.y=floorY;state.velY=0;state.grounded=true;state.airPhase='ground';}
    return{slide:null};
  }
  slide(state,sample,dt){
    const n=sample.normal||{x:0,y:1,z:0},steep=n.y<this.maxSlopeNormal&&n.y>.18,mag=Math.hypot(n.x,n.z);
    state.slopeState=steep?'slide':'walk';
    if(!steep||mag<.001)return{slide:null};
    const speed=(this.maxSlopeNormal-n.y)*10+1.1;
    return{slide:{x:n.x/mag*speed*dt,z:n.z/mag*speed*dt}};
  }
}

__exports.JumpPhysics = JumpPhysics;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/LiveTerrainSampler.js */
__awtsmoosModule_54 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveTerrainSampler.js
 * @description Adapts the rendered meadow's numeric terrain height into a slope-aware nature sample.
 * The Awtsmoos measures four neighboring breaths before root and stone receive their place;
 * Awtsmoos.com turns a bare height into grounded normal truth without guessing the valley's face.
 */

const SAMPLE_SPAN = 0.75;

/** Creates the object sampler consumed by deterministic real-nature placement. */
function createLiveTerrainSampler(terrain) {
	if (typeof terrain?.heightAt !== 'function') {
		throw new TypeError('Live terrain must expose heightAt(x, z).');
	}
	return Object.freeze({
		heightAt(x, z) {
			const y = finiteHeight(terrain.heightAt(x, z));
			const left = finiteHeight(terrain.heightAt(x - SAMPLE_SPAN, z));
			const right = finiteHeight(terrain.heightAt(x + SAMPLE_SPAN, z));
			const back = finiteHeight(terrain.heightAt(x, z - SAMPLE_SPAN));
			const front = finiteHeight(terrain.heightAt(x, z + SAMPLE_SPAN));
			return Object.freeze({
				normal: slopeNormal(left, right, back, front),
				y
			});
		}
	});
}


__exports.createLiveTerrainSampler = createLiveTerrainSampler;
function slopeNormal(left, right, back, front) {
	const x = left - right;
	const y = SAMPLE_SPAN * 2;
	const z = back - front;
	const length = Math.hypot(x, y, z) || 1;
	return Object.freeze({ x: x / length, y: y / length, z: z / length });
}

function finiteHeight(value) {
	const height = Number(value);
	return Number.isFinite(height) ? height : 0;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/LiveRealNatureRuntime.js */
__awtsmoosModule_53 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureRuntime.js
 * @description Adapts the final diagnostics runtime into a mobile-safe real-nature context.
 * The Awtsmoos leaves the broad world rich while five real vessels crown its living frame;
 * Awtsmoos.com keeps pine, tree, flower, bush, and rock without letting clone cost consume the game.
 */

var Group = __awtsmoosModule_7.Group;
var createLiveTerrainSampler = __awtsmoosModule_54.createLiveTerrainSampler;

function currentLiveRuntime(environment = globalThis) {
	return environment?.AwtsmoosDiagnostics?.runtime
		|| environment?.AwtsmoosMitzvahWorld?.runtime
		|| null;
}


__exports.currentLiveRuntime = currentLiveRuntime;
/** Requires the fields directly observed on the final running meadow runtime. */
function liveRuntimeReady(runtime) {
	return Boolean(
		runtime?.scene?.add
		&& runtime?.scene?.traverse
		&& runtime?.terrain?.heightAt
		&& runtime?.renderer
		&& runtime?.state
		&& runtime?.frameScheduler
	);
}


__exports.liveRuntimeReady = liveRuntimeReady;
function createLiveNatureContext(runtime) {
	const group = new Group();
	group.name = 'AwtsmoosRealNatureLiveBridge';
	runtime.scene.add(group);
	return Object.freeze({
		groundSampler: createLiveTerrainSampler(runtime.terrain),
		group,
		quality: 'low',
		sourceQuality: runtime.qualityProfile?.quality || 'medium',
		visibilityOrigin: () => liveVisibilityOrigin(runtime)
	});
}


__exports.createLiveNatureContext = createLiveNatureContext;
function attachLiveNatureRuntime(runtime, controller) {
	runtime.realNature = controller;
	if (!runtime.nature) runtime.nature = controller;
}


__exports.attachLiveNatureRuntime = attachLiveNatureRuntime;
function detachLiveNatureRuntime(runtime, controller, group) {
	if (runtime?.realNature === controller) delete runtime.realNature;
	if (runtime?.nature === controller) delete runtime.nature;
	group?.parent?.remove?.(group);
}


__exports.detachLiveNatureRuntime = detachLiveNatureRuntime;
function liveVisibilityOrigin(runtime) {
	if (finitePoint(runtime?.state)) return runtime.state;
	if (finitePoint(runtime?.camera?.position)) return runtime.camera.position;
	if (finitePoint(runtime?.model?.position)) return runtime.model.position;
	return Object.freeze({ x: 0, y: 0, z: 0 });
}

function finitePoint(value) {
	return Number.isFinite(Number(value?.x))
		&& Number.isFinite(Number(value?.z));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NatureAnimationLoop.js */
__awtsmoosModule_56 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureAnimationLoop.js
 * @description Gives shared wind and visibility one cancellable quality-bounded frame vessel.
 * The Awtsmoos renews motion and sight together yet leaves no orphan after the garden is gone;
 * Awtsmoos.com advances only on measured steps, preserving mobile breath from dusk through dawn.
 */

/** Starts one cancellable loop and reports whether live frames are available. */
function startNatureAnimation(wind, instances, options = {}) {
	const request = options.requestFrame || globalThis.requestAnimationFrame?.bind(globalThis);
	const cancel = options.cancelFrame || globalThis.cancelAnimationFrame?.bind(globalThis);
	let handle = null;
	let running = typeof request === 'function';

	function frame(milliseconds) {
		if (!running) return;
		const seconds = milliseconds / 1000;
		if (wind.update(seconds, instances)) {
			options.onStep?.(seconds);
		}
		handle = request(frame);
	}

	if (running) {
		handle = request(frame);
	}
	return Object.freeze({
		destroy() {
			running = false;
			if (handle !== null && typeof cancel === 'function') {
				cancel(handle);
			}
			handle = null;
		},
		running: () => running
	});
}

__exports.startNatureAnimation = startNatureAnimation;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/environment/EnvironmentalWindField.js */
__awtsmoosModule_59 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnvironmentalWindField.js
 * @description Samples one allocation-free advected weather field for every rooted vegetation consumer.
 * The Awtsmoos is one wind appearing through many finite leaves; Awtsmoos.com lets grass, crown, bush, and flower
 * share direction, front propagation, crosswind, flutter, and traveler wake without sharing ownership or frame loops.
 */

const BASE_DIRECTION = 0.82;
const DEFAULT_ADVECTION_SPEED = 7.2;

/** Writes deterministic spatial weather into a caller-owned target and returns that same target. */
function sampleEnvironmentalWind(target, input = {}) {
	const x = finite(input.x, 0);
	const z = finite(input.z, 0);
	const time = finite(input.time, 0);
	const advectionSpeed = Math.max(0.1, finite(input.advectionSpeed, DEFAULT_ADVECTION_SPEED));
	const baseStrength = Math.max(0, finite(input.baseStrength, 0.04));
	const broadPhase = x * 0.012 + z * 0.009;
	const directionAngle = BASE_DIRECTION
		+ Math.sin(time * 0.11 + broadPhase * 0.42) * 0.19
		+ Math.sin(z * 0.006 - x * 0.004) * 0.07;
	const baseX = Math.cos(directionAngle);
	const baseZ = Math.sin(directionAngle);
	const along = x * baseX + z * baseZ;
	const across = -x * baseZ + z * baseX;
	const front = along * 0.032 - time * advectionSpeed * 0.032;
	const crossPhase = across * 0.046 + time * 0.21;
	const macro = 0.56
		+ Math.sin(front) * 0.27
		+ Math.sin(front * 0.47 + crossPhase * 0.31) * 0.12
		+ Math.sin(time * 0.17 + broadPhase) * 0.05;
	const gust = clamp01(macro);
	const crosswind = Math.sin(crossPhase) * 0.72 + Math.sin(front * 1.7) * 0.28;
	const flutter = Math.sin(time * 2.9 + x * 0.19 + z * 0.17);
	writeTravelerWake(target, input, x, z);
	let directionX = baseX - baseZ * crosswind * 0.12 + target.wakeX * target.wake * 0.52;
	let directionZ = baseZ + baseX * crosswind * 0.12 + target.wakeZ * target.wake * 0.52;
	const length = Math.hypot(directionX, directionZ) || 1;
	directionX /= length;
	directionZ /= length;
	target.advectionSpeed = advectionSpeed;
	target.crosswind = crosswind;
	target.directionX = directionX;
	target.directionZ = directionZ;
	target.flutter = flutter;
	target.front = front;
	target.gust = gust;
	target.strength = baseStrength * (0.58 + gust * 0.88)
		+ target.wake * baseStrength * 1.28;
	return target;
}


__exports.sampleEnvironmentalWind = sampleEnvironmentalWind;
function writeTravelerWake(target, input, x, z) {
	const playerX = Number(input.playerX);
	const playerZ = Number(input.playerZ);
	if (!Number.isFinite(playerX) || !Number.isFinite(playerZ)) return clearWake(target);
	const dx = x - playerX;
	const dz = z - playerZ;
	const distance = Math.hypot(dx, dz);
	const radius = Math.max(0.1, finite(input.interactionRadius, 10));
	if (distance >= radius) return clearWake(target);
	const requestedX = finite(input.wakeX, 0);
	const requestedZ = finite(input.wakeZ, 0);
	const requestedLength = Math.hypot(requestedX, requestedZ);
	const fallbackLength = distance || 1;
	target.wake = clamp01(1 - distance / radius)
		* clamp01(0.42 + requestedLength * 0.18);
	target.wakeX = requestedLength > 0.001 ? requestedX / requestedLength : dx / fallbackLength;
	target.wakeZ = requestedLength > 0.001 ? requestedZ / requestedLength : dz / fallbackLength;
	return target;
}

function clearWake(target) {
	target.wake = 0;
	target.wakeX = 0;
	target.wakeZ = 0;
	return target;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NatureQualityBudget.js */
__awtsmoosModule_60 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureQualityBudget.js
 * @description Bounds non-tree hero accents while deep-core forest trees own every structural canopy at every quality tier.
 * The Awtsmoos gives blossom, bush, and stone finite emphasis beside the one true procedural forest;
 * Awtsmoos.com prevents duplicate GLB trees from consuming memory, draw calls, collision, and visual authority evermore.
 */

const BUDGETS = Object.freeze({
	low: budget([1, 1, 1], 420, 12, 22, 82),
	medium: budget([2, 1, 1], 760, 18, 30, 110),
	high: budget([3, 2, 2], 1200, 24, 42, 145),
	cinematic: budget([5, 4, 4], 1800, 30, 58, 180)
});

function natureQualityBudget(quality = 'low') {
	return BUDGETS[quality] || BUDGETS.low;
}


__exports.natureQualityBudget = natureQualityBudget;
function natureQualityBudgets() {
	return BUDGETS;
}


__exports.natureQualityBudgets = natureQualityBudgets;
function budget(counts, grassBlades, windFps, shadowDistance, cullDistance) {
	const [flower, bush, rock] = counts;
	return Object.freeze({
		counts: Object.freeze({ bush, flower, rock }),
		cullDistance,
		fadeStart: Math.round(cullDistance * 0.72),
		grassBlades,
		shadowDistance,
		windFps
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/SharedWindQuaternion.js */
__awtsmoosModule_61 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindQuaternion.js
 * @description Converts one finite rooted vegetation bend into the tiny runtime quaternion contract.
 * The Awtsmoos remains simple while three visible axes receive their finite garment;
 * Awtsmoos.com keeps quaternion arithmetic outside the weather field so motion law and rotation law stay readable.
 */

/** Writes normalized XYZ Euler rotation into a tiny-runtime quaternion. */
function setEulerQuaternion(quaternion, x, y, z) {
	const halfX = x / 2;
	const halfY = y / 2;
	const halfZ = z / 2;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	return quaternion.set(
		sinX * cosY * cosZ + cosX * sinY * sinZ,
		cosX * sinY * cosZ - sinX * cosY * sinZ,
		cosX * cosY * sinZ + sinX * sinY * cosZ,
		cosX * cosY * cosZ - sinX * sinY * sinZ
	);
}

__exports.setEulerQuaternion = setEulerQuaternion;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/SharedWindField.js */
__awtsmoosModule_58 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedWindField.js
 * @description Moves real nature through the same advected weather law used by meadow grass and trees.
 * The Awtsmoos sends one traveling breath through every finite place; Awtsmoos.com lets flowers and bushes
 * inherit coherent fronts, crosswind, flutter, and traveler wake while their own cadence and authored yaw remain intact.
 */

var sampleEnvironmentalWind = __awtsmoosModule_59.sampleEnvironmentalWind;
var natureQualityBudget = __awtsmoosModule_60.natureQualityBudget;
var setEulerQuaternion = __awtsmoosModule_61.setEulerQuaternion;

__exports.setEulerQuaternion = __awtsmoosModule_61.setEulerQuaternion;

const SHARED_STRENGTH = 1;

class SharedWindField {
	constructor(options = {}) {
		this.framesPerSecond = Math.max(1, options.framesPerSecond || 12);
		this.lastStep = -Infinity;
		this.lastOriginTime = null;
		this.lastOriginX = null;
		this.lastOriginZ = null;
		this.strength = options.strength ?? SHARED_STRENGTH;
		this.visibilityOrigin = options.visibilityOrigin || null;
		this.sample = {};
		this.context = {};
		this.updates = 0;
	}

	/** Advances all wind-responsive instances at a quality-bounded cadence. */
	update(seconds, instances = []) {
		if (seconds - this.lastStep < 1 / this.framesPerSecond) return false;
		this.writeOriginContext(seconds);
		this.lastStep = seconds;
		for (const instance of instances) this.move(instance, seconds);
		this.writeEvidenceSample(seconds);
		this.updates += 1;
		return true;
	}

	move(instance, seconds) {
		const placement = instance.placement;
		const amplitude = Number(placement.asset.windAmplitude || 0) * this.strength;
		if (!amplitude) return;
		this.context.baseStrength = 1;
		this.context.time = seconds;
		this.context.x = placement.x;
		this.context.z = placement.z;
		const weather = sampleEnvironmentalWind(this.sample, this.context);
		const bend = amplitude * weather.strength * (0.54 + weather.gust * 0.38);
		const flutter = weather.flutter * amplitude * 0.08;
		setEulerQuaternion(
			instance.scene.quaternion,
			weather.directionZ * bend + flutter,
			placement.yaw,
			-weather.directionX * bend + weather.crosswind * amplitude * 0.07
		);
	}

	snapshot() {
		return Object.freeze({
			advectionSpeed: finite(this.sample.advectionSpeed, 0),
			directionX: finite(this.sample.directionX, 0),
			directionZ: finite(this.sample.directionZ, 0),
			flutter: finite(this.sample.flutter, 0),
			framesPerSecond: this.framesPerSecond,
			gust: finite(this.sample.gust, 0),
			mode: 'advected-real-model-quaternion-sway',
			strength: finite(this.sample.strength, 0),
			updates: this.updates,
			wake: finite(this.sample.wake, 0)
		});
	}

	writeOriginContext(seconds) {
		const origin = this.visibilityOrigin?.();
		const x = finite(origin?.x, NaN);
		const z = finite(origin?.z, NaN);
		const delta = this.lastOriginTime === null
			? 0
			: Math.max(0.001, seconds - this.lastOriginTime);
		this.context.playerX = x;
		this.context.playerZ = z;
		this.context.wakeX = Number.isFinite(x) && this.lastOriginX !== null
			? (x - this.lastOriginX) / delta
			: 0;
		this.context.wakeZ = Number.isFinite(z) && this.lastOriginZ !== null
			? (z - this.lastOriginZ) / delta
			: 0;
		if (Number.isFinite(x)) this.lastOriginX = x;
		if (Number.isFinite(z)) this.lastOriginZ = z;
		this.lastOriginTime = seconds;
	}

	writeEvidenceSample(seconds) {
		this.context.baseStrength = 1;
		this.context.time = seconds;
		this.context.x = finite(this.context.playerX, 0);
		this.context.z = finite(this.context.playerZ, 0);
		sampleEnvironmentalWind(this.sample, this.context);
	}
}


__exports.SharedWindField = SharedWindField;
/** Returns shared wind evidence used when no live model field exists. */
function sharedWindEvidence(quality, mode = 'static-batched-renderer-limit') {
	return Object.freeze({
		framesPerSecond: natureQualityBudget(quality).windFps,
		mode,
		strength: SHARED_STRENGTH
	});
}


__exports.sharedWindEvidence = sharedWindEvidence;
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NatureInstanceDecoration.js */
__awtsmoosModule_57 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceDecoration.js
 * @description Applies tiny-runtime transforms and truthful rendering evidence to real nature.
 * The Awtsmoos sets every root in place while shadow, distance, and collision remain named;
 * Awtsmoos.com refuses false powers, so unsupported light is intent and solid fallback is framed.
 */

var setEulerQuaternion = __awtsmoosModule_58.setEulerQuaternion;

/** Decorates one isolated GLB scene with placement and quality evidence. */
function decorateNatureInstance(scene, placement, budget) {
	scene.name = `AwtsmoosRealNature-${placement.asset.id}-${placement.index}`;
	scene.position.set(placement.x, placement.y, placement.z);
	scene.scale.set(placement.scale, placement.scale, placement.scale);
	setEulerQuaternion(scene.quaternion, 0, placement.yaw, 0);
	scene.traverse(node => decorateNode(node, placement, budget));
	return Object.freeze({ placement, scene });
}


__exports.decorateNatureInstance = decorateNatureInstance;
function decorateNode(node, placement, budget) {
	node.userData = {
		...node.userData,
		AwtsmoosCollision: collisionEvidence(placement.asset),
		AwtsmoosLod: {
			className: 'vegetation',
			cullDistance: budget.cullDistance,
			fadeStart: budget.fadeStart
		},
		AwtsmoosNature: {
			assetId: placement.asset.id,
			family: placement.asset.family,
			modelPath: placement.asset.modelPath,
			visualOnly: true
		},
		AwtsmoosShadow: {
			distance: budget.shadowDistance,
			intent: placement.asset.shadowIntent,
			supportedByRenderer: false
		}
	};
}

function collisionEvidence(asset) {
	return {
		modelVisualOnly: true,
		provider: asset.solid ? 'procedural-forest-ledger' : 'none',
		solidIntent: asset.solid
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NatureInstanceLoader.js */
__awtsmoosModule_62 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceLoader.js
 * @description Instantiates cached real-nature templates in bounded, yielding sequence.
 * The Awtsmoos reveals each tree and flower without crushing the frame beneath their birth;
 * Awtsmoos.com shares one vessel per asset, then gives the browser breath between forms of earth.
 */

/** Loads placements one at a time while preserving partial failure evidence. */
async function loadNatureInstances(placements, options = {}) {
	const results = [];
	const loadModel = options.loadModel;
	const decorate = options.decorate;
	const yieldControl = options.yieldControl || defaultYieldControl;
	for (let index = 0; index < placements.length; index += 1) {
		const placement = placements[index];
		results.push(await loadPlacement(placement, options.budget, loadModel, decorate));
		if (index + 1 < placements.length) {
			await yieldControl();
		}
	}
	return Object.freeze({
		failures: results.filter(result => result.error).map(result => result.error),
		instances: results.filter(result => result.instance).map(result => result.instance),
		strategy: 'shared-template-sequential-yielding'
	});
}


__exports.loadNatureInstances = loadNatureInstances;
async function loadPlacement(placement, budget, loadModel, decorate) {
	try {
		const label = `real-nature-${placement.asset.id}-${placement.index}`;
		const gltf = await loadModel(placement.asset.url, label);
		return { instance: decorate(gltf.scene, placement, budget) };
	} catch (error) {
		return {
			error: Object.freeze({
				assetId: placement.asset.id,
				message: error?.message || String(error)
			})
		};
	}
}

function defaultYieldControl() {
	return new Promise(resolve => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => resolve());
			return;
		}
		setTimeout(resolve, 0);
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageBiomes.js */
__awtsmoosModule_65 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageBiomes.js
 * @description Declares ecological regions shaped by elevation, moisture, slope, and settlement.
 * The Awtsmoos renews root, water, meadow, cliff, and garden in relation; Awtsmoos.com prevents
 * decorative scatter from replacing the living transitions drawn in the canonical ecology atlas.
 */

const CANONICAL_VILLAGE_BIOMES = Object.freeze([
	biome('dense-north-forest', 'dense-forest', 2, -105, 122, 72, 0.72),
	biome('west-old-growth', 'dense-forest', -135, -22, 68, 120, 0.82),
	biome('east-rock-forest', 'rocky-woodland', 135, -20, 72, 122, 0.58),
	biome('arrival-meadow', 'flower-meadow', 0, 82, 36, 30, 0.28),
	biome('market-clearing', 'village-ground', -26, 12, 31, 23, 0.18),
	biome('shul-garden', 'terrace-garden', -34, -24, 27, 21, 0.42),
	biome('river-corridor', 'wet-riverbank', 17, 35, 24, 105, 0.95),
	biome('waterfall-cliffs', 'wet-rock', 51, -44, 31, 28, 1),
	biome('farm-terraces', 'cultivated', 43, 42, 34, 28, 0.34),
	biome('south-bank-clearings', 'open-woodland', 70, 78, 70, 62, 0.38)
]);
__exports.CANONICAL_VILLAGE_BIOMES = CANONICAL_VILLAGE_BIOMES;


function canonicalBiomeAt(x, z) {
	let strongest = null;
	let strongestWeight = 0;
	for (const definition of CANONICAL_VILLAGE_BIOMES) {
		const dx = (x - definition.x) / definition.radiusX;
		const dz = (z - definition.z) / definition.radiusZ;
		const weight = Math.max(0, 1 - Math.hypot(dx, dz)) * definition.moisture;
		if (weight <= strongestWeight) continue;
		strongest = definition;
		strongestWeight = weight;
	}
	return Object.freeze({
		id: strongest?.id || 'alpine-background',
		moisture: strongestWeight,
		type: strongest?.type || 'alpine-rock-and-forest'
	});
}


__exports.canonicalBiomeAt = canonicalBiomeAt;
function biome(id, type, x, z, radiusX, radiusZ, moisture) {
	return Object.freeze({ id, moisture, radiusX, radiusZ, type, x, z });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalHouseArchetypes.js */
__awtsmoosModule_69 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHouseArchetypes.js
 * @description Defines varied, slope-aware architectural families for H10-H27.
 */

const FORMER_BASE_VOLUME = 7.6 * 5.9 * 5.5;
const PLAYER_REFERENCE_VOLUME = 0.61;

const ARCHETYPES = Object.freeze({
	'family-house': preset(14.6, 11.4, 2, 3.25, 4.2, ['entry', 'kitchen-dining', 'living-room', 'bedroom', 'study']),
	'guest-house': preset(17.2, 12.8, 2, 3.35, 4.8, ['entry', 'communal-room', 'kitchen-dining', 'guest-bedroom', 'guest-bedroom', 'Torah-library']),
	'hillside-split-level': preset(12.8, 10.2, 2, 3.15, 3.8, ['entry', 'living-room', 'kitchen-dining', 'bedroom', 'storage-room']),
	'merchant-shop': preset(13.8, 10.8, 2, 3.3, 4.1, ['shop', 'storage-room', 'kitchen-dining', 'living-room', 'bedroom']),
	'small-stone-cottage': preset(11.4, 9.2, 1, 3.45, 3.3, ['entry', 'living-room', 'kitchen-dining', 'bedroom']),
	'workshop-barn': preset(15.6, 12.2, 1, 3.9, 3.7, ['workshop', 'storage-room', 'kitchen-dining', 'study'])
});

function canonicalHouseArchitecture(archetype, variant = 0) {
	const source = ARCHETYPES[archetype];
	if (!source) throw new Error(`Unknown canonical house archetype: ${archetype}`);
	const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
	const width = source.width + safeVariant % 3 * 0.55;
	const depth = source.depth + safeVariant % 2 * 0.45;
	const storyHeight = source.storyHeight + safeVariant % 2 * 0.08;
	const wallHeight = source.stories * storyHeight;
	const volume = width * depth * wallHeight;
	return Object.freeze({
		archetype,
		balcony: source.stories > 1 && safeVariant % 3 !== 1,
		chimney: archetype !== 'workshop-barn' || safeVariant % 2 === 0,
		depth,
		expansionRatio: volume / FORMER_BASE_VOLUME,
		foundationStyle: safeVariant % 2 ? 'stepped-stone' : 'retaining-plinth',
		gardenType: ['herbs', 'flowers', 'orchard-edge'][safeVariant % 3],
		minimumExpansion: 1,
		porch: archetype !== 'hillside-split-level' || safeVariant % 2 === 0,
		roofMaterial: safeVariant % 3 === 2 ? 'clay-tile' : 'slate',
		roofRise: source.roofRise + safeVariant % 3 * 0.22,
		roomTypes: Object.freeze([...source.roomTypes]),
		stories: source.stories,
		storyHeight,
		volume,
		volumeRatio: volume / PLAYER_REFERENCE_VOLUME,
		wallHeight,
		width,
		windowPattern: ['paired', 'irregular', 'deep-set'][safeVariant % 3]
	});
}


__exports.canonicalHouseArchitecture = canonicalHouseArchitecture;
function canonicalHouseArchetypes() {
	return Object.keys(ARCHETYPES);
}


__exports.canonicalHouseArchetypes = canonicalHouseArchetypes;
function preset(width, depth, stories, storyHeight, roofRise, roomTypes) {
	return Object.freeze({ depth, roofRise, roomTypes: Object.freeze(roomTypes), stories, storyHeight, width });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageHouses.js */
__awtsmoosModule_68 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHouses.js
 * @description Gives H10-H27 stable sites and distinct inhabitable architectural programs.
 */

var canonicalHouseArchitecture = __awtsmoosModule_69.canonicalHouseArchitecture;

const CANONICAL_VILLAGE_HOUSES = Object.freeze([
	house('H10', 'arrival-meadow', 'small-stone-cottage', -50, 116, 1.3, 0),
	house('H11', 'arrival-meadow', 'family-house', 54, 106, -1.24, 1),
	house('H12', 'beis-chabad-terrace', 'guest-house', -102, 78, 0.62, 2),
	house('H13', 'beis-chabad-terrace', 'hillside-split-level', -64, 80, -0.48, 3),
	house('H14', 'market-quarter', 'merchant-shop', -88, 34, 0.82, 4),
	house('H15', 'market-quarter', 'merchant-shop', -48, 48, -0.72, 5),
	house('H16', 'market-quarter', 'workshop-barn', -43, 8, 2.46, 6),
	house('H17', 'shul-terrace', 'family-house', -105, -38, 0.68, 7),
	house('H18', 'shul-terrace', 'small-stone-cottage', -62, -62, -0.64, 8),
	house('H19', 'upper-residential', 'hillside-split-level', -40, -103, 0.54, 9),
	house('H20', 'upper-residential', 'family-house', 3, -70, -0.46, 10),
	house('H21', 'north-slope-residential', 'hillside-split-level', 23, -118, 0.38, 11),
	house('H22', 'north-slope-residential', 'family-house', 68, -94, -0.52, 12),
	house('H23', 'east-bank-homes', 'small-stone-cottage', 81, -14, 2.72, 13),
	house('H24', 'east-bank-homes', 'family-house', 106, 28, -2.56, 14),
	house('H25', 'waterfall-portal', 'hillside-split-level', 114, -72, 2.92, 15),
	house('H26', 'farm-terraces', 'workshop-barn', 112, 76, -2.44, 16),
	house('H27', 'riverfront-gardens', 'guest-house', -16, 76, 1.18, 17)
]);
__exports.CANONICAL_VILLAGE_HOUSES = CANONICAL_VILLAGE_HOUSES;


const CANONICAL_HOUSES_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_HOUSES.map(definition => [definition.id, definition])
));
__exports.CANONICAL_HOUSES_BY_ID = CANONICAL_HOUSES_BY_ID;


function minimumCanonicalHouseDistance() {
	let minimum = Infinity;
	for (let first = 0; first < CANONICAL_VILLAGE_HOUSES.length; first += 1) {
		for (let second = first + 1; second < CANONICAL_VILLAGE_HOUSES.length; second += 1) {
			const a = CANONICAL_VILLAGE_HOUSES[first];
			const b = CANONICAL_VILLAGE_HOUSES[second];
			minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.z - b.z));
		}
	}
	return minimum;
}


__exports.minimumCanonicalHouseDistance = minimumCanonicalHouseDistance;
function house(id, districtId, archetype, x, z, yaw, variant) {
	return Object.freeze({
		...canonicalHouseArchitecture(archetype, variant),
		districtId,
		id,
		number: id,
		variant,
		x,
		yaw,
		z
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageFootprints.js */
__awtsmoosModule_67 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageFootprints.js
 * @description Gives every canonical structure a measured slope-aware construction envelope.
 * The Awtsmoos places form within boundary without imprisonment; Awtsmoos.com lets terrain,
 * roads, foundations, interiors, vegetation, and cameras agree about the same occupied ground.
 */

var CANONICAL_VILLAGE_HOUSES = __awtsmoosModule_68.CANONICAL_VILLAGE_HOUSES;

const LANDMARK_FOOTPRINTS = Object.freeze([
	footprint('SHUL01', 'shul', -34, -24, 9, 7, 0.08, 8.8),
	footprint('BEIS01', 'beis-chabad', -35, 45, 10, 7.5, -0.08, 4.4),
	footprint('MARKET01', 'market-hall', -26, 12, 11, 7.5, 0.03, 5.5),
	footprint('BRIDGE01', 'stone-bridge', 18, 7, 15.2, 5.2, 0, 6.3),
	footprint('PORTAL01', 'waterfall-portal', 56, -49, 7.5, 3, -0.3, 12.4),
	footprint('ENTR01', 'arrival-threshold', 0, 101, 8, 12, 0, 2.2),
	footprint('F01', 'farm-terrace', 36, 34, 13, 11, -0.08, 5.2),
	footprint('F02', 'farm-terrace', 51, 39, 13, 11, 0.08, 5.4),
	footprint('F03', 'orchard', 35, 49, 11, 9, -0.04, 5.7),
	footprint('F04', 'orchard', 50, 53, 11, 9, 0.04, 5.9)
]);

const HOUSE_ARCHETYPES = Object.freeze([
	'small-cottage',
	'family-house',
	'hillside-house',
	'inn-house',
	'workshop-house'
]);

const CANONICAL_VILLAGE_FOOTPRINTS = Object.freeze([
	...LANDMARK_FOOTPRINTS,
	...CANONICAL_VILLAGE_HOUSES.map((house, index) => {
		const wide = index % 4 === 1;
		return footprint(
			house.id,
			HOUSE_ARCHETYPES[index % HOUSE_ARCHETYPES.length],
			house.x,
			house.z,
			wide ? 8.5 : 7.2,
			wide ? 6.5 : 5.8,
			house.yaw,
			house.baseElevation || null
		);
	})
]);
__exports.CANONICAL_VILLAGE_FOOTPRINTS = CANONICAL_VILLAGE_FOOTPRINTS;


const CANONICAL_FOOTPRINTS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_FOOTPRINTS.map((definition) => [definition.id, definition])
));
__exports.CANONICAL_FOOTPRINTS_BY_ID = CANONICAL_FOOTPRINTS_BY_ID;


function footprint(id, archetype, x, z, width, depth, yaw, baseElevation) {
	return Object.freeze({
		archetype,
		baseElevation,
		depth,
		id,
		width,
		x,
		yaw,
		z
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldSpatialMath.js */
__awtsmoosModule_70 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSpatialMath.js
 * @description Provides pure allocation-light XZ geometry evidence for every shared spatial contract.
 * The Awtsmoos is beyond segment, circle, rectangle, and distance, yet creates every measured relation at once;
 * Awtsmoos.com keeps the hot finite measurements lean so richer road, river, ecology, staging, and cinema do not tax world entry.
 */

function nearestPointOnSegmentXZ(point, start, end) {
	const evidence = segmentEvidence(point, start, end);
	return Object.freeze({
		distance: evidence.distance,
		point: freezePoint(evidence.point),
		t: evidence.t
	});
}


__exports.nearestPointOnSegmentXZ = nearestPointOnSegmentXZ;
function nearestPointOnPolylineXZ(point, points = []) {
	if (!Array.isArray(points) || points.length === 0) return null;
	if (points.length === 1) {
		return Object.freeze({
			distance: Math.hypot(point.x - points[0].x, point.z - points[0].z),
			point: freezePoint(points[0]),
			segmentIndex: 0,
			segmentT: 0
		});
	}
	let bestDistance = Number.POSITIVE_INFINITY;
	let bestIndex = 0;
	let bestPoint = points[0];
	let bestT = 0;
	for (let index = 0; index < points.length - 1; index += 1) {
		const evidence = segmentEvidence(point, points[index], points[index + 1]);
		if (evidence.distance >= bestDistance) continue;
		bestDistance = evidence.distance;
		bestIndex = index;
		bestPoint = evidence.point;
		bestT = evidence.t;
	}
	return Object.freeze({
		distance: bestDistance,
		point: freezePoint(bestPoint),
		segmentIndex: bestIndex,
		segmentT: bestT
	});
}


__exports.nearestPointOnPolylineXZ = nearestPointOnPolylineXZ;
function signedCircleClearanceXZ(point, center, radius) {
	return Math.hypot(point.x - center.x, point.z - center.z) - Math.max(0, Number(radius) || 0);
}


__exports.signedCircleClearanceXZ = signedCircleClearanceXZ;
function signedRectangleClearanceXZ(point, rectangle) {
	return rectangleClearance(
		point.x - rectangle.x,
		point.z - rectangle.z,
		Math.max(0, Number(rectangle.width) || 0) / 2,
		Math.max(0, Number(rectangle.depth) || 0) / 2
	);
}


__exports.signedRectangleClearanceXZ = signedRectangleClearanceXZ;
function signedOrientedRectangleClearanceXZ(point, rectangle) {
	const angle = -(Number(rectangle.yaw) || 0);
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	const dx = point.x - rectangle.x;
	const dz = point.z - rectangle.z;
	return rectangleClearance(
		dx * cosine + dz * sine,
		-dx * sine + dz * cosine,
		Math.max(0, Number(rectangle.width) || 0) / 2,
		Math.max(0, Number(rectangle.depth) || 0) / 2
	);
}


__exports.signedOrientedRectangleClearanceXZ = signedOrientedRectangleClearanceXZ;
function freezePoint(point) {
	return Object.freeze({ x: Number(point.x), z: Number(point.z) });
}


__exports.freezePoint = freezePoint;
function segmentEvidence(point, start, end) {
	const dx = end.x - start.x;
	const dz = end.z - start.z;
	const denominator = dx * dx + dz * dz;
	const rawT = denominator > 0
		? ((point.x - start.x) * dx + (point.z - start.z) * dz) / denominator
		: 0;
	const t = Math.max(0, Math.min(1, rawT));
	const nearest = { x: start.x + dx * t, z: start.z + dz * t };
	return {
		distance: Math.hypot(point.x - nearest.x, point.z - nearest.z),
		point: nearest,
		t
	};
}

function rectangleClearance(x, z, halfWidth, halfDepth) {
	const dx = Math.abs(x) - halfWidth;
	const dz = Math.abs(z) - halfDepth;
	return Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldArchitectureApproach.js */
__awtsmoosModule_66 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldArchitectureApproach.js
 * @description Reserves real doorway and stair approaches in front of every canonical house footprint.
 * The Awtsmoos creates house and path as distinct vessels that still meet at one threshold; Awtsmoos.com
 * projects the facade axis into world space so no tree, bush, flower, or rock may colonize the walk home.
 */

var CANONICAL_VILLAGE_FOOTPRINTS = __awtsmoosModule_67.CANONICAL_VILLAGE_FOOTPRINTS;
var signedOrientedRectangleClearanceXZ = __awtsmoosModule_70.signedOrientedRectangleClearanceXZ;

const HOUSE_PATTERN = /cottage|house|workshop|inn/i;
const APPROACH_DEPTH = 8.6;
const APPROACH_WIDTH = 3.8;

const CANONICAL_ARCHITECTURE_APPROACHES = Object.freeze(
	CANONICAL_VILLAGE_FOOTPRINTS
		.filter(footprint => HOUSE_PATTERN.test(footprint.archetype))
		.map(createApproach)
);
__exports.CANONICAL_ARCHITECTURE_APPROACHES = CANONICAL_ARCHITECTURE_APPROACHES;


/** Returns nearest signed doorway-approach clearance at one point. */
function architectureApproachEvidenceAt(point, options = {}) {
	const approaches = options.approaches || CANONICAL_ARCHITECTURE_APPROACHES;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const approach of approaches) {
		const edgeClearance = signedOrientedRectangleClearanceXZ(point, approach);
		const clearance = edgeClearance - margin;
		if (best && clearance >= best.clearance) continue;
		best = Object.freeze({
			clearance,
			edgeClearance,
			inside: edgeClearance <= 0,
			sourceId: approach.sourceId,
			withinMargin: clearance <= 0
		});
	}
	return best;
}


__exports.architectureApproachEvidenceAt = architectureApproachEvidenceAt;
function canonicalArchitectureApproaches() {
	return CANONICAL_ARCHITECTURE_APPROACHES;
}


__exports.canonicalArchitectureApproaches = canonicalArchitectureApproaches;
function createApproach(footprint) {
	const yaw = Number(footprint.yaw) || 0;
	const depth = Math.max(APPROACH_DEPTH, footprint.depth * 0.92);
	const width = Math.max(APPROACH_WIDTH, Math.min(5, footprint.width * 0.48));
	const localZ = footprint.depth / 2 + depth / 2 - 0.25;
	return Object.freeze({
		depth,
		sourceId: footprint.id,
		width,
		x: footprint.x + Math.sin(yaw) * localZ,
		yaw,
		z: footprint.z + Math.cos(yaw) * localZ
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalSpatialContract.js */
__awtsmoosModule_73 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalSpatialContract.js
 * @description Holds pure arrival geometry and framing data without scheduling runtime nature or touching the DOM.
 * The Awtsmoos creates entrance, player, camera, sign, and clearing before any runtime awakens;
 * Awtsmoos.com keeps this vessel side-effect free so spatial truth can load instantly in game, diagnostics, tests, and Studio.
 */

const VILLAGE_ARRIVAL_PLAYER = Object.freeze({
	facing: Math.PI,
	x: 0,
	z: 104
});
__exports.VILLAGE_ARRIVAL_PLAYER = VILLAGE_ARRIVAL_PLAYER;


const VILLAGE_ARRIVAL_CAMERA = Object.freeze({
	clearingRadius: 20,
	clearingX: 0,
	clearingZ: 122,
	distance: 18,
	fov: 62,
	maxDistance: 52,
	minDistance: 2.2,
	pitch: 0.24,
	yaw: 2.86
});
__exports.VILLAGE_ARRIVAL_CAMERA = VILLAGE_ARRIVAL_CAMERA;


const VILLAGE_ARRIVAL_SIGN = Object.freeze({
	x: -7,
	yaw: 0.12,
	z: 96
});
__exports.VILLAGE_ARRIVAL_SIGN = VILLAGE_ARRIVAL_SIGN;


const VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
	x: 0,
	z: 101
});
__exports.VILLAGE_ARRIVAL_ENTRANCE = VILLAGE_ARRIVAL_ENTRANCE;


const VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
	Object.freeze({ id: 'arrival-spawn', radius: 16, x: 0, z: 104 }),
	Object.freeze({
		id: 'arrival-camera',
		radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
		x: VILLAGE_ARRIVAL_CAMERA.clearingX,
		z: VILLAGE_ARRIVAL_CAMERA.clearingZ
	})
]);
__exports.VILLAGE_ARRIVAL_CLEARINGS = VILLAGE_ARRIVAL_CLEARINGS;


function arrivalPlayerScreenFraction(playerHeight = 1.72) {
	const angularHeight = 2 * Math.atan(
		playerHeight / (2 * VILLAGE_ARRIVAL_CAMERA.distance)
	);
	return angularHeight / radians(VILLAGE_ARRIVAL_CAMERA.fov);
}


__exports.arrivalPlayerScreenFraction = arrivalPlayerScreenFraction;
function radians(degrees) {
	return degrees * Math.PI / 180;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageClearings.js */
__awtsmoosModule_72 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageClearings.js
 * @description Publishes pure canonical clearing data without importing runtime schedulers or Movie systems.
 * The Awtsmoos creates open courtyard, entrance, crossing, and river path before any runtime awakens;
 * Awtsmoos.com keeps this finite catalog side-effect free so spatial queries remain cheap, deterministic, and shared everywhere.
 */

var VILLAGE_ARRIVAL_CLEARINGS = __awtsmoosModule_73.VILLAGE_ARRIVAL_CLEARINGS;

const CANONICAL_VILLAGE_CLEARINGS = Object.freeze([
	...VILLAGE_ARRIVAL_CLEARINGS,
	clearing('beis-chabad-courtyard', -35, 45, 9),
	clearing('market-square', -26, 12, 12),
	clearing('shul-courtyard', -34, -24, 10),
	clearing('bridge-approach', 10, 10, 9),
	clearing('portal-terrace', 56, -49, 8),
	clearing('farm-crossing', 43, 39, 8),
	clearing('riverfront-path', -5, 36, 8)
]);
__exports.CANONICAL_VILLAGE_CLEARINGS = CANONICAL_VILLAGE_CLEARINGS;


function clearing(id, x, z, radius) {
	return Object.freeze({ id, radius, x, z });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldPhysicalExclusions.js */
__awtsmoosModule_71 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPhysicalExclusions.js
 * @description Publishes allocation-light occupied-area evidence while refusing coarse road-proxy circles as spatial truth.
 * The Awtsmoos creates house, courtyard, path, and open bank without confusing their vessels; Awtsmoos.com scans many finite shapes
 * but allocates only the nearest evidence, keeping rich ecology and Studio diagnostics truthful without burdening world entry.
 */

var CANONICAL_VILLAGE_CLEARINGS = __awtsmoosModule_72.CANONICAL_VILLAGE_CLEARINGS;
var CANONICAL_VILLAGE_FOOTPRINTS = __awtsmoosModule_67.CANONICAL_VILLAGE_FOOTPRINTS;
var signedCircleClearanceXZ = __awtsmoosModule_70.signedCircleClearanceXZ;
var signedOrientedRectangleClearanceXZ = __awtsmoosModule_70.signedOrientedRectangleClearanceXZ;

const ROAD_PROXY_CLEARING_IDS = new Set(['bridge-approach', 'farm-crossing', 'riverfront-path']);
const TRUE_AREA_CLEARINGS = Object.freeze(
	CANONICAL_VILLAGE_CLEARINGS.filter(clearing => !ROAD_PROXY_CLEARING_IDS.has(clearing.id))
);

function physicalExclusionEvidenceAt(point, options = {}) {
	return nearestEvidence([
		footprintExclusionEvidenceAt(point, options),
		clearingExclusionEvidenceAt(point, options),
		stagingExclusionEvidenceAt(point, options)
	]);
}


__exports.physicalExclusionEvidenceAt = physicalExclusionEvidenceAt;
function footprintExclusionEvidenceAt(point, options = {}) {
	const footprints = options.footprints || CANONICAL_VILLAGE_FOOTPRINTS;
	return nearestShapeEvidence(
		footprints,
		'footprint',
		item => item.id,
		item => signedOrientedRectangleClearanceXZ(point, item),
		normalizedMargin(options.margin)
	);
}


__exports.footprintExclusionEvidenceAt = footprintExclusionEvidenceAt;
function clearingExclusionEvidenceAt(point, options = {}) {
	const clearings = options.clearings || TRUE_AREA_CLEARINGS;
	return nearestShapeEvidence(
		clearings,
		'clearing',
		item => item.id,
		item => signedCircleClearanceXZ(point, item, item.radius),
		normalizedMargin(options.margin)
	);
}


__exports.clearingExclusionEvidenceAt = clearingExclusionEvidenceAt;
function stagingExclusionEvidenceAt(point, options = {}) {
	return nearestShapeEvidence(
		options.staging || [],
		'staging',
		item => item.id || item.role || 'staging-pad',
		item => signedCircleClearanceXZ(point, item.position || item, item.radius || 0),
		normalizedMargin(options.margin)
	);
}


__exports.stagingExclusionEvidenceAt = stagingExclusionEvidenceAt;
function trueAreaClearings() {
	return TRUE_AREA_CLEARINGS;
}


__exports.trueAreaClearings = trueAreaClearings;
function isRoadProxyClearing(id) {
	return ROAD_PROXY_CLEARING_IDS.has(String(id || ''));
}


__exports.isRoadProxyClearing = isRoadProxyClearing;
function nearestShapeEvidence(items, kind, idOf, clearanceOf, margin) {
	let sourceId = null;
	let edgeClearance = Number.POSITIVE_INFINITY;
	for (const item of items) {
		const next = clearanceOf(item);
		if (next >= edgeClearance) continue;
		edgeClearance = next;
		sourceId = idOf(item);
	}
	return sourceId === null ? null : evidence(kind, sourceId, edgeClearance, margin);
}

function nearestEvidence(values) {
	let best = null;
	for (const value of values) {
		if (!value || (best && value.clearance >= best.clearance)) continue;
		best = value;
	}
	return best;
}

function evidence(kind, sourceId, edgeClearance, margin) {
	const clearance = edgeClearance - margin;
	return Object.freeze({
		clearance,
		edgeClearance,
		inside: edgeClearance <= 0,
		kind,
		sourceId,
		withinMargin: clearance <= 0
	});
}

function normalizedMargin(value) {
	return Math.max(0, Number(value) || 0);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageHydrology.js */
__awtsmoosModule_81 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHydrology.js
 * @description Defines the single source-to-outlet water spine from the canonical atlas.
 * The Awtsmoos carries one current through cascade, bridge, lake, and outlet; Awtsmoos.com
 * keeps every visible water system bound to this immutable geographic covenant.
 */

const CANONICAL_RIVER_CONTROL_POINTS = Object.freeze([
	point(52, -56),
	point(49, -44),
	point(43, -34),
	point(36, -24),
	point(29, -14),
	point(23, -4),
	point(18, 7),
	point(15, 22),
	point(14, 42),
	point(15, 62),
	point(18, 82),
	point(22, 108)
]);
__exports.CANONICAL_RIVER_CONTROL_POINTS = CANONICAL_RIVER_CONTROL_POINTS;


const CANONICAL_RIVER_LAKE_INDEX = 8;
__exports.CANONICAL_RIVER_LAKE_INDEX = CANONICAL_RIVER_LAKE_INDEX;


const CANONICAL_RIVER_CASCADES = Object.freeze([
	Object.freeze({ drop: 1.7, t: 0.09 }),
	Object.freeze({ drop: 1.35, t: 0.19 }),
	Object.freeze({ drop: 0.9, t: 0.3 })
]);
__exports.CANONICAL_RIVER_CASCADES = CANONICAL_RIVER_CASCADES;


function point(x, z) {
	return Object.freeze([x, z]);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverPath.js */
__awtsmoosModule_80 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverPath.js
 * @description Samples the canonical waterfall-to-outlet watercourse.
 * The Awtsmoos gathers every visible drop into one descending path; Awtsmoos.com
 * gives bridge, banks, lake, reeds, foam, and mist the same immutable centerline.
 */

var CANONICAL_RIVER_CONTROL_POINTS = __awtsmoosModule_81.CANONICAL_RIVER_CONTROL_POINTS;
var CANONICAL_RIVER_LAKE_INDEX = __awtsmoosModule_81.CANONICAL_RIVER_LAKE_INDEX;

const RIVER_LAKE_T = CANONICAL_RIVER_LAKE_INDEX / (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
__exports.RIVER_LAKE_T = RIVER_LAKE_T;


function riverCenterAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const scaled = clamped * (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
	const index = Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 2, Math.floor(scaled));
	const amount = scaled - index;
	const p0 = CANONICAL_RIVER_CONTROL_POINTS[Math.max(0, index - 1)];
	const p1 = CANONICAL_RIVER_CONTROL_POINTS[index];
	const p2 = CANONICAL_RIVER_CONTROL_POINTS[index + 1];
	const p3 = CANONICAL_RIVER_CONTROL_POINTS[Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 1, index + 2)];
	return {
		x: catmullRom(p0[0], p1[0], p2[0], p3[0], amount),
		z: catmullRom(p0[1], p1[1], p2[1], p3[1], amount)
	};
}


__exports.riverCenterAt = riverCenterAt;
function riverWidthAt(t) {
	const clamped = Math.max(0, Math.min(1, Number(t) || 0));
	const lowerLake = Math.exp(-Math.pow((clamped - RIVER_LAKE_T) / 0.15, 2)) * 8.4;
	const plungePool = Math.exp(-Math.pow((clamped - 0.16) / 0.08, 2)) * 2.8;
	return 3.1 + lowerLake + plungePool + Math.sin(clamped * Math.PI * 3) * 0.28;
}


__exports.riverWidthAt = riverWidthAt;
function sampleRiverPath(samples = 64) {
	const count = Math.max(8, Math.floor(samples));
	return Array.from({ length: count + 1 }, (_, index) => {
		const t = index / count;
		return { ...riverCenterAt(t), t, width: riverWidthAt(t) };
	});
}


__exports.sampleRiverPath = sampleRiverPath;
function catmullRom(a, b, c, d, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainHydrology.js */
__awtsmoosModule_79 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHydrology.js
 * @description Answers fast river-distance questions from the canonical monotonic water spine.
 * The Awtsmoos carries one current through every bank; Awtsmoos.com avoids repeated searches
 * so collision, terrain, vegetation, and camera sampling remain faithful and inexpensive.
 */

var riverCenterAt = __awtsmoosModule_80.riverCenterAt;
var riverWidthAt = __awtsmoosModule_80.riverWidthAt;

const SOURCE_Z = -56;
const OUTLET_Z = 108;
const RIVER_LENGTH_Z = OUTLET_Z - SOURCE_Z;

function canonicalRiverTerrainSample(x, z) {
	const t = clamp((z - SOURCE_Z) / RIVER_LENGTH_Z);
	const center = riverCenterAt(t);
	const width = riverWidthAt(t);
	return Object.freeze({
		center,
		distance: Math.abs(x - center.x),
		t,
		width
	});
}


__exports.canonicalRiverTerrainSample = canonicalRiverTerrainSample;
function canonicalRiverElevation(t) {
	const clamped = clamp(t);
	const upper = 12.2 - clamped * 5.4;
	const lower = 6.8 - (clamped - 0.42) * 8.5;
	return clamped < 0.42 ? upper : lower;
}


__exports.canonicalRiverElevation = canonicalRiverElevation;
function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalHydrologyBankField.js */
__awtsmoosModule_78 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyBankField.js
 * @description Raises containment banks against every segment of the canonical river covenant.
 * The Awtsmoos carries upper and lower bends in one current; Awtsmoos.com reads the immutable
 * village hydrology source directly so terrain boot, banks, water, and bridge never drift apart.
 */

var canonicalRiverElevation = __awtsmoosModule_79.canonicalRiverElevation;
var canonicalRiverTerrainSample = __awtsmoosModule_79.canonicalRiverTerrainSample;
var CANONICAL_RIVER_CONTROL_POINTS = __awtsmoosModule_81.CANONICAL_RIVER_CONTROL_POINTS;

const BANK_CLEARANCE = 0.65;
const BANK_FULL_MARGIN = 2;
const BANK_SOFT_MARGIN = 6;

function canonicalHydrologyBankHeightAt(x, z, terrainHeight) {
	let bankedHeight = terrainHeight;
	for (let index = 1; index < CANONICAL_RIVER_CONTROL_POINTS.length; index += 1) {
		const sample = segmentBankSample(
			CANONICAL_RIVER_CONTROL_POINTS[index - 1],
			CANONICAL_RIVER_CONTROL_POINTS[index],
			x,
			z
		);
		if (sample.influence <= 0) continue;
		bankedHeight = Math.max(
			bankedHeight,
			raiseToAtLeast(terrainHeight, sample.targetHeight, sample.influence)
		);
	}
	return bankedHeight;
}


__exports.canonicalHydrologyBankHeightAt = canonicalHydrologyBankHeightAt;
function canonicalMinimumBankClearance() {
	return BANK_CLEARANCE;
}


__exports.canonicalMinimumBankClearance = canonicalMinimumBankClearance;
function segmentBankSample(first, second, x, z) {
	const projection = segmentProjection(first, second, x, z);
	const center = canonicalRiverTerrainSample(projection.x, projection.z);
	return {
		influence: bankRingInfluence(projection.distance, center.width),
		targetHeight: canonicalRiverElevation(center.t) + BANK_CLEARANCE
	};
}

function segmentProjection(first, second, x, z) {
	const firstX = first[0];
	const firstZ = first[1];
	const dx = second[0] - firstX;
	const dz = second[1] - firstZ;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = clamp(((x - firstX) * dx + (z - firstZ) * dz) / lengthSquared);
	const projectedX = firstX + dx * amount;
	const projectedZ = firstZ + dz * amount;
	return {
		distance: Math.hypot(x - projectedX, z - projectedZ),
		x: projectedX,
		z: projectedZ
	};
}

function bankRingInfluence(distance, width) {
	const outsideBed = smooth(width * 0.62, width * 0.96, distance);
	const outsideBank = 1 - smooth(
		width + BANK_FULL_MARGIN,
		width + BANK_SOFT_MARGIN,
		distance
	);
	return outsideBed * outsideBank;
}

function raiseToAtLeast(current, target, influence) {
	return current >= target ? current : mix(current, target, influence);
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalHydrologyTerrain.js */
__awtsmoosModule_77 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalHydrologyTerrain.js
 * @description Cuts the nearest river bed after raising every nearby containment bank.
 * The Awtsmoos lets water descend without vanishing beneath earth; Awtsmoos.com honors the
 * higher neighboring reach at tight bends while preserving one finite bed for the nearest flow.
 */

var canonicalHydrologyBankHeightAt = __awtsmoosModule_78.canonicalHydrologyBankHeightAt;
var canonicalMinimumBankClearance = __awtsmoosModule_78.canonicalMinimumBankClearance;
var canonicalRiverElevation = __awtsmoosModule_79.canonicalRiverElevation;
var canonicalRiverTerrainSample = __awtsmoosModule_79.canonicalRiverTerrainSample;

const BED_DEPTH = 1.35;

/**
 * Applies canonical bank and bed constraints to an existing terrain height.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} terrainHeight Incoming terrain height.
 * @returns {number} Hydrology-constrained terrain height.
 */
function canonicalHydrologyTerrainHeightAt(x, z, terrainHeight) {
	const bankedHeight = canonicalHydrologyBankHeightAt(
		x,
		z,
		terrainHeight
	);
	const river = canonicalRiverTerrainSample(x, z);
	const waterHeight = canonicalRiverElevation(river.t);
	const bedTarget = waterHeight - BED_DEPTH;
	const bedInfluence = 1 - smooth(
		river.width * 0.44,
		river.width * 0.88,
		river.distance
	);
	return mix(bankedHeight, bedTarget, bedInfluence);
}


__exports.canonicalHydrologyTerrainHeightAt = canonicalHydrologyTerrainHeightAt;
__exports.canonicalMinimumBankClearance = canonicalMinimumBankClearance;

/**
 * Returns the intended bed depth below canonical water.
 *
 * @returns {number} Bed depth in world units.
 */
function canonicalRiverBedDepth() {
	return BED_DEPTH;
}


__exports.canonicalRiverBedDepth = canonicalRiverBedDepth;
function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainTerraces.js */
__awtsmoosModule_83 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainTerraces.js
 * @description Defines softened construction terraces for every canonical village district.
 * The Awtsmoos places each dwelling upon its measured vessel; Awtsmoos.com blends foundations
 * into slope instead of floating boxes above a single flat and disconnected procedural plane.
 */

const TERRACES = Object.freeze([
	terrace('ENTR01', 0, 82, 22, 17, 2.2),
	terrace('BEIS01', -35, 45, 21, 16, 4.4),
	terrace('MARKET01', -26, 12, 25, 19, 5.5),
	terrace('SHUL01', -34, -24, 23, 18, 8.8),
	terrace('upper-residential', -8, -36, 27, 19, 10.4),
	terrace('north-slope', 18, -48, 27, 18, 12.7),
	terrace('east-bank', 38, 4, 22, 18, 7.1),
	terrace('PORTAL01', 52, -42, 18, 15, 12.4),
	terrace('F01-F04', 43, 39, 26, 21, 5.2),
	terrace('riverfront', -5, 36, 22, 18, 4.1)
]);

function canonicalTerraceSample(x, z) {
	let strongest = Object.freeze({ id: null, influence: 0, targetHeight: 0 });
	for (const terraceDefinition of TERRACES) {
		const dx = (x - terraceDefinition.x) / terraceDefinition.radiusX;
		const dz = (z - terraceDefinition.z) / terraceDefinition.radiusZ;
		const distance = Math.hypot(dx, dz);
		const influence = 1 - smooth(0.42, 1, distance);
		if (influence <= strongest.influence) continue;
		strongest = Object.freeze({
			id: terraceDefinition.id,
			influence,
			targetHeight: terraceDefinition.height
		});
	}
	return strongest;
}


__exports.canonicalTerraceSample = canonicalTerraceSample;
function canonicalTerraceDefinitions() {
	return TERRACES;
}


__exports.canonicalTerraceDefinitions = canonicalTerraceDefinitions;
function terrace(id, x, z, radiusX, radiusZ, height) {
	return Object.freeze({ height, id, radiusX, radiusZ, x, z });
}

function smooth(edge0, edge1, value) {
	const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
	return amount * amount * (3 - 2 * amount);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainBase.js */
__awtsmoosModule_82 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainBase.js
 * @description Shapes the ungraded alpine valley from terraces, ridges, noise, and hydrology.
 * The Awtsmoos raises mountain and lowers river within one speech; Awtsmoos.com keeps the
 * natural field isolated so roads may refine it without weakening source, channel, or banks.
 */

var canonicalHydrologyTerrainHeightAt = __awtsmoosModule_77.canonicalHydrologyTerrainHeightAt;
var canonicalRiverTerrainSample = __awtsmoosModule_79.canonicalRiverTerrainSample;
var canonicalTerraceSample = __awtsmoosModule_83.canonicalTerraceSample;

/**
 * Returns canonical terrain before road-corridor grading.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @returns {number} Natural, terraced, and hydrology-constrained elevation.
 */
function canonicalTerrainBaseHeightAt(x, z) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const natural = naturalValleyHeight(x, z, river.center.x);
	const terraced = mix(
		natural,
		terrace.targetHeight,
		terrace.influence * 0.82
	);
	return canonicalHydrologyTerrainHeightAt(x, z, terraced);
}


__exports.canonicalTerrainBaseHeightAt = canonicalTerrainBaseHeightAt;
function naturalValleyHeight(x, z, riverX) {
	const northRise = smooth(18, -92, z) * 9.5;
	const sideDistance = Math.max(0, Math.abs(x - riverX) - 28);
	const sideRise = Math.pow(sideDistance / 72, 1.55) * 12.5;
	return 1.55
		+ northRise
		+ sideRise
		+ gaussian(x, z, -112, -35, 94, 13.5)
		+ gaussian(x, z, 124, -42, 100, 15.5)
		+ gaussian(x, z, 4, -148, 132, 18)
		+ detailNoise(x, z);
}

function detailNoise(x, z) {
	return Math.sin(x * 0.047) * 0.22
		+ Math.cos(z * 0.041) * 0.19
		+ Math.sin((x + z) * 0.021) * 0.16;
}

function gaussian(x, z, centerX, centerZ, radius, height) {
	const normalized = Math.hypot(x - centerX, z - centerZ) / radius;
	return Math.exp(-normalized * normalized) * height;
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceSampling.js */
__awtsmoosModule_76 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceSampling.js
 * @description Densifies road corridors and measures hydrology-aware constrained support heights.
 * The Awtsmoos reveals every hidden meter between named junctions; Awtsmoos.com gives each
 * cobble sample one shared key while honoring authored walkable surfaces such as BRIDGE01.
 */

var canonicalHydrologyTerrainHeightAt = __awtsmoosModule_77.canonicalHydrologyTerrainHeightAt;
var canonicalTerrainBaseHeightAt = __awtsmoosModule_82.canonicalTerrainBaseHeightAt;

const ROAD_SURFACE_CLEARANCE = 0.18;
__exports.ROAD_SURFACE_CLEARANCE = ROAD_SURFACE_CLEARANCE;

const ROAD_SURFACE_SAMPLE_SPACING = 1;
__exports.ROAD_SURFACE_SAMPLE_SPACING = ROAD_SURFACE_SAMPLE_SPACING;


/**
 * Densifies a route without losing elevation constraints on authored terminals.
 *
 * @param {object[]} points Sparse authored route points.
 * @returns {object[]} Dense route points.
 */
function denseRoadPoints(points) {
	const output = points.length ? [{ ...points[0] }] : [];
	for (let index = 1; index < points.length; index += 1) {
		appendDenseSegment(output, points[index - 1], points[index]);
	}
	return output;
}


__exports.denseRoadPoints = denseRoadPoints;
/**
 * Registers one shared road node and merges any authored minimum elevation.
 *
 * @param {object} point Dense route point.
 * @param {Map<string, object>} nodes Shared road node map.
 * @returns {string} Stable coordinate key.
 */
function registerRoadSurfaceNode(point, nodes) {
	const key = `${point.x.toFixed(5)}:${point.z.toFixed(5)}`;
	const minimumHeight = finiteMinimum(point.minimumHeight);
	if (!nodes.has(key)) {
		const terrainHeight = roadSupportHeight(point.x, point.z);
		nodes.set(key, {
			minimumHeight,
			targetHeight: Math.max(
				terrainHeight + ROAD_SURFACE_CLEARANCE,
				minimumHeight ?? -Infinity
			),
			terrainHeight,
			x: point.x,
			z: point.z
		});
	} else if (minimumHeight !== null) {
		mergeMinimumHeight(nodes.get(key), minimumHeight);
	}
	return key;
}


__exports.registerRoadSurfaceNode = registerRoadSurfaceNode;
function appendDenseSegment(output, first, second) {
	const distance = Math.hypot(second.x - first.x, second.z - first.z);
	const steps = Math.max(1, Math.ceil(distance / ROAD_SURFACE_SAMPLE_SPACING));
	for (let step = 1; step <= steps; step += 1) {
		const amount = step / steps;
		const point = {
			x: first.x + (second.x - first.x) * amount,
			z: first.z + (second.z - first.z) * amount
		};
		if (step === steps && Number.isFinite(second.minimumHeight)) {
			point.minimumHeight = second.minimumHeight;
		}
		output.push(point);
	}
}

function mergeMinimumHeight(node, minimumHeight) {
	node.minimumHeight = Math.max(node.minimumHeight ?? -Infinity, minimumHeight);
	node.targetHeight = Math.max(node.targetHeight, node.minimumHeight);
}

function finiteMinimum(value) {
	return Number.isFinite(value) ? value : null;
}

function roadSupportHeight(x, z) {
	const base = canonicalTerrainBaseHeightAt(x, z);
	return canonicalHydrologyTerrainHeightAt(x, z, base);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceSolver.js */
__awtsmoosModule_84 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceSolver.js
 * @description Raises low shared road samples until every connected edge obeys safe grade.
 * The Awtsmoos joins many routes through one elevation truth; Awtsmoos.com never cuts the river
 * to fake safety, but lifts cobble vessels above cliffs until every traveler receives a gentle path.
 */

const ROAD_SURFACE_MAXIMUM_GRADE = 0.16;
__exports.ROAD_SURFACE_MAXIMUM_GRADE = ROAD_SURFACE_MAXIMUM_GRADE;


const RELAXATION_PASSES = 4096;

function createRoadSurfaceEdges(routeKeys, nodes) {
	const edges = [];
	for (const keys of routeKeys) {
		for (let index = 1; index < keys.length; index += 1) {
			const first = nodes.get(keys[index - 1]);
			const second = nodes.get(keys[index]);
			edges.push(createEdge(first, second));
		}
	}
	return edges;
}


__exports.createRoadSurfaceEdges = createRoadSurfaceEdges;
function solveRoadSurfaceElevations(edges) {
	for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
		let changed = false;
		for (const edge of edges) {
			changed = raiseLowerNode(edge) || changed;
		}
		if (!changed) return pass + 1;
	}
	throw new Error('Canonical road surface grade relaxation did not converge.');
}


__exports.solveRoadSurfaceElevations = solveRoadSurfaceElevations;
function createEdge(first, second) {
	return {
		first,
		maximumDelta: Math.hypot(
			second.x - first.x,
			second.z - first.z
		) * ROAD_SURFACE_MAXIMUM_GRADE,
		second
	};
}

function raiseLowerNode(edge) {
	const delta = edge.second.targetHeight - edge.first.targetHeight;
	if (Math.abs(delta) <= edge.maximumDelta + 0.000001) return false;
	if (delta > 0) {
		edge.first.targetHeight = edge.second.targetHeight - edge.maximumDelta;
	} else {
		edge.second.targetHeight = edge.first.targetHeight - edge.maximumDelta;
	}
	return true;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStoneBridgeContract.js */
__awtsmoosModule_86 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeContract.js
 * @description Shares BRIDGE01 dimensions and its canonical walkable elevation.
 * The Awtsmoos joins bridge and road through one measured surface; Awtsmoos.com
 * prevents a visible stone crossing from becoming a collision-separated island.
 */

var canonicalHydrologyTerrainHeightAt = __awtsmoosModule_77.canonicalHydrologyTerrainHeightAt;
var canonicalTerrainBaseHeightAt = __awtsmoosModule_82.canonicalTerrainBaseHeightAt;

const STONE_BRIDGE_DIMENSIONS = Object.freeze({
	deckRise: 3.25,
	deckThickness: 0.65,
	halfSpan: 7.6,
	width: 5.2
});
__exports.STONE_BRIDGE_DIMENSIONS = STONE_BRIDGE_DIMENSIONS;


/**
 * Resolves the deck mesh center from the terrain beneath the bridge center.
 *
 * @param {number} groundY Terrain height beneath the bridge center.
 * @returns {number} Deck center elevation.
 */
function stoneBridgeDeckCenterY(groundY) {
	return groundY + STONE_BRIDGE_DIMENSIONS.deckRise;
}


__exports.stoneBridgeDeckCenterY = stoneBridgeDeckCenterY;
/**
 * Resolves the top collision plane of the solid bridge deck.
 *
 * @param {number} groundY Terrain height beneath the bridge center.
 * @returns {number} Walkable deck elevation.
 */
function stoneBridgeDeckTopY(groundY) {
	return stoneBridgeDeckCenterY(groundY)
		+ STONE_BRIDGE_DIMENSIONS.deckThickness / 2;
}


__exports.stoneBridgeDeckTopY = stoneBridgeDeckTopY;
/**
 * Resolves BRIDGE01's walkable elevation without entering the road-height cycle.
 *
 * @param {{x: number, z: number}} center Canonical bridge center.
 * @returns {number} Canonical walkable deck elevation.
 */
function canonicalStoneBridgeDeckTopY(center) {
	const baseY = canonicalTerrainBaseHeightAt(center.x, center.z);
	const groundY = canonicalHydrologyTerrainHeightAt(center.x, center.z, baseY);
	return stoneBridgeDeckTopY(groundY);
}

__exports.canonicalStoneBridgeDeckTopY = canonicalStoneBridgeDeckTopY;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageRoads.js */
__awtsmoosModule_85 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageRoads.js
 * @description Defines the authored road spine with physical widths and bridge elevation anchors.
 * The Awtsmoos carries each traveler through one continuous intention; Awtsmoos.com gives
 * every cobbled lane its true width and joins both banks to BRIDGE01's walkable deck.
 */

var canonicalStoneBridgeDeckTopY = __awtsmoosModule_86.canonicalStoneBridgeDeckTopY;

const BRIDGE_CENTER = Object.freeze({ x: 18, z: 7 });
const BRIDGE_WALKABLE_Y = canonicalStoneBridgeDeckTopY(BRIDGE_CENTER);
const westBridgeApproach = bridgeApproach(10.4);
const eastBridgeApproach = bridgeApproach(25.6);

const ROUTE_POINTS = Object.freeze({
	arrivalMain: [[0, 101], [-2, 88], [-5, 72], [-8, 55], [-11, 39], [-15, 27], [-20, 17], [-12, 13], [2, 10], westBridgeApproach],
	arrivalWestHomes: [[-5, 72], [-14, 64], [-24, 57]],
	arrivalEastHomes: [[-5, 72], [7, 64], [18, 58], [25, 55]],
	beisTerrace: [[-8, 55], [-19, 50], [-35, 45], [-44, 49]],
	riverfront: [[-8, 55], [-9, 45], [-9, 38], [-5, 36]],
	marketLoop: [[-20, 17], [-29, 18], [-38, 18], [-35, 10], [-26, 12], [-18, 5]],
	shulRise: [[-20, 17], [-25, 5], [-29, -9], [-34, -24], [-47, -17]],
	upperHomes: [[-34, -24], [-18, -43], [-8, -36], [1, -31], [10, -52], [26, -44]],
	eastBank: [eastBridgeApproach, [34, -4], [42, 12], [43, 25]],
	farmTerraces: [[43, 25], [43, 39], [36, 34], [51, 39], [50, 53]],
	waterfallPortal: [eastBridgeApproach, [29, -8], [36, -24], [47, -35], [52, -42], [56, -49]]
});

const CANONICAL_ROAD_WIDTHS = Object.freeze({
	main: 5.8,
	residential: 3.6,
	service: 2.4
});
__exports.CANONICAL_ROAD_WIDTHS = CANONICAL_ROAD_WIDTHS;


const ROUTE_WIDTH_CLASSES = Object.freeze({
	arrivalMain: 'main',
	arrivalWestHomes: 'residential',
	arrivalEastHomes: 'residential',
	beisTerrace: 'residential',
	riverfront: 'residential',
	marketLoop: 'main',
	shulRise: 'residential',
	upperHomes: 'residential',
	eastBank: 'residential',
	farmTerraces: 'service',
	waterfallPortal: 'service'
});

/** Returns immutable authored road routes with explicit physical widths. */
function canonicalVillageRoadRoutes() {
	return Object.entries(ROUTE_POINTS).map(([id, coordinates]) => {
		const points = coordinates.map(coordinatePoint);
		const widthClass = ROUTE_WIDTH_CLASSES[id];
		return Object.freeze({
			foldedSegments: Object.freeze([]),
			id: `canonical-${id}`,
			pathfinding: Object.freeze({
				failed: false,
				maximumSampleGap: maximumGap(points),
				method: 'authored-canonical-corridor'
			}),
			points: Object.freeze(points),
			terminalDistances: Object.freeze({ from: 0, to: 0 }),
			width: CANONICAL_ROAD_WIDTHS[widthClass],
			widthClass
		});
	});
}


__exports.canonicalVillageRoadRoutes = canonicalVillageRoadRoutes;
/** Returns stable diagnostics for the connected village road graph. */
function canonicalRoadNetworkEvidence() {
	const routes = canonicalVillageRoadRoutes();
	return Object.freeze({
		bridgeApproaches: Object.freeze([[10.4, 7], [25.6, 7]]),
		bridgeWalkableY: BRIDGE_WALKABLE_Y,
		connected: true,
		method: 'canonical-master-plan-authored-corridors',
		routeCount: routes.length,
		routeIds: Object.freeze(routes.map((route) => route.id))
	});
}


__exports.canonicalRoadNetworkEvidence = canonicalRoadNetworkEvidence;
function bridgeApproach(x) {
	return Object.freeze([x, BRIDGE_CENTER.z, BRIDGE_WALKABLE_Y]);
}

function coordinatePoint([x, z, minimumHeight]) {
	return Object.freeze(Number.isFinite(minimumHeight)
		? { minimumHeight, x, z }
		: { x, z });
}

function maximumGap(points) {
	let maximum = 0;
	for (let index = 1; index < points.length; index += 1) {
		maximum = Math.max(maximum, Math.hypot(
			points[index].x - points[index - 1].x,
			points[index].z - points[index - 1].z
		));
	}
	return maximum;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceNetwork.js */
__awtsmoosModule_75 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadSurfaceNetwork.js
 * @description Coordinates dense support sampling and one shared safe-grade road elevation graph.
 * The Awtsmoos joins authored destinations, living hydrology, and walkable cobble without conflict;
 * Awtsmoos.com raises only the road vessel while cliffs, banks, riverbeds, and terraces remain real.
 */

var denseRoadPoints = __awtsmoosModule_76.denseRoadPoints;
var registerRoadSurfaceNode = __awtsmoosModule_76.registerRoadSurfaceNode;
var ROAD_SURFACE_CLEARANCE = __awtsmoosModule_76.ROAD_SURFACE_CLEARANCE;
var ROAD_SURFACE_SAMPLE_SPACING = __awtsmoosModule_76.ROAD_SURFACE_SAMPLE_SPACING;
var createRoadSurfaceEdges = __awtsmoosModule_84.createRoadSurfaceEdges;
var ROAD_SURFACE_MAXIMUM_GRADE = __awtsmoosModule_84.ROAD_SURFACE_MAXIMUM_GRADE;
var solveRoadSurfaceElevations = __awtsmoosModule_84.solveRoadSurfaceElevations;
var canonicalVillageRoadRoutes = __awtsmoosModule_85.canonicalVillageRoadRoutes;

let cachedNetwork = null;

function canonicalRoadSurfaceRoutes() {
	return roadSurfaceNetwork().routes;
}


__exports.canonicalRoadSurfaceRoutes = canonicalRoadSurfaceRoutes;
function canonicalRoadSurfaceEvidence() {
	return roadSurfaceNetwork().evidence;
}


__exports.canonicalRoadSurfaceEvidence = canonicalRoadSurfaceEvidence;
function roadSurfaceNetwork() {
	if (!cachedNetwork) cachedNetwork = buildNetwork();
	return cachedNetwork;
}

function buildNetwork() {
	const sourceRoutes = canonicalVillageRoadRoutes();
	const nodes = new Map();
	const routeKeys = sourceRoutes.map(route => {
		return denseRoadPoints(route.points).map(point => {
			return registerRoadSurfaceNode(point, nodes);
		});
	});
	const edges = createRoadSurfaceEdges(routeKeys, nodes);
	const relaxationPasses = solveRoadSurfaceElevations(edges);
	const routes = sourceRoutes.map((route, index) => {
		return solvedRoute(route, routeKeys[index], nodes);
	});
	return Object.freeze({
		evidence: Object.freeze({
			clearance: ROAD_SURFACE_CLEARANCE,
			maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
			nodeCount: nodes.size,
			relaxationPasses,
			routeCount: routes.length,
			sampleSpacing: ROAD_SURFACE_SAMPLE_SPACING
		}),
		routes: Object.freeze(routes)
	});
}

function solvedRoute(route, keys, nodes) {
	return Object.freeze({
		...route,
		pathfinding: Object.freeze({
			...route.pathfinding,
			gradeAuthority: 'dense-shared-raised-road-surface',
			maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
			maximumSampleGap: ROAD_SURFACE_SAMPLE_SPACING
		}),
		points: Object.freeze(keys.map(key => {
			return Object.freeze({ ...nodes.get(key) });
		}))
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldRoadCorridor.js */
__awtsmoosModule_74 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoadCorridor.js
 * @description Makes authored road width and signed road-edge clearance one cached shared world contract.
 * The Awtsmoos creates highway and footpath without confusing their measures; Awtsmoos.com lets every finite route keep its own breadth,
 * while canonical route solving happens once per deferred world load instead of once for every reed, stone, camera, or staging query.
 */

var canonicalRoadSurfaceRoutes = __awtsmoosModule_75.canonicalRoadSurfaceRoutes;
var freezePoint = __awtsmoosModule_70.freezePoint;
var nearestPointOnPolylineXZ = __awtsmoosModule_70.nearestPointOnPolylineXZ;

const DEFAULT_ROAD_WIDTH = 5.8;
__exports.DEFAULT_ROAD_WIDTH = DEFAULT_ROAD_WIDTH;


const CANONICAL_ROAD_ROUTES = Object.freeze(canonicalRoadSurfaceRoutes());

function resolveRoadRouteWidth(route, fallbackWidth = DEFAULT_ROAD_WIDTH) {
	const authored = Number(route?.width);
	if (Number.isFinite(authored) && authored > 0) return authored;
	const fallback = Number(fallbackWidth);
	if (Number.isFinite(fallback) && fallback > 0) return fallback;
	throw new Error('Road corridor requires a positive authored or fallback width.');
}


__exports.resolveRoadRouteWidth = resolveRoadRouteWidth;
function roadCorridorEvidenceAt(point, options = {}) {
	const routes = options.routes || CANONICAL_ROAD_ROUTES;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const route of routes) {
		const nearest = nearestPointOnPolylineXZ(point, route.points);
		if (!nearest) continue;
		const width = resolveRoadRouteWidth(route, options.fallbackWidth);
		const evidence = corridorEvidence(route, nearest, width, margin);
		if (!best || evidence.clearance < best.clearance) best = evidence;
	}
	return best;
}


__exports.roadCorridorEvidenceAt = roadCorridorEvidenceAt;
function roadTerminalJunctions(
	routes = CANONICAL_ROAD_ROUTES,
	fallbackWidth = DEFAULT_ROAD_WIDTH
) {
	const terminals = new Map();
	for (const route of routes) {
		const width = resolveRoadRouteWidth(route, fallbackWidth);
		for (const point of [route.points?.[0], route.points?.at?.(-1)]) {
			if (!point) continue;
			const key = `${point.x.toFixed(3)},${point.z.toFixed(3)}`;
			const current = terminals.get(key) || {
				point: freezePoint(point),
				routeIds: new Set(),
				width: 0
			};
			current.routeIds.add(route.id);
			current.width = Math.max(current.width, width);
			terminals.set(key, current);
		}
	}
	return Object.freeze([...terminals.values()].map(value => Object.freeze({
		point: value.point,
		routeIds: Object.freeze([...value.routeIds].sort()),
		width: value.width
	})));
}


__exports.roadTerminalJunctions = roadTerminalJunctions;
function canonicalRoadCorridorRoutes() {
	return CANONICAL_ROAD_ROUTES;
}


__exports.canonicalRoadCorridorRoutes = canonicalRoadCorridorRoutes;
function corridorEvidence(route, nearest, width, margin) {
	const edgeClearance = nearest.distance - width / 2;
	const clearance = edgeClearance - margin;
	return Object.freeze({
		clearance,
		distanceToCenterline: nearest.distance,
		edgeClearance,
		halfWidth: width / 2,
		inside: edgeClearance <= 0,
		nearestPoint: nearest.point,
		routeId: route.id,
		segmentIndex: nearest.segmentIndex,
		segmentT: nearest.segmentT,
		sourceId: route.id,
		surfaceTag: route.surfaceTag || route.role || null,
		width,
		widthClass: route.widthClass || null,
		withinMargin: clearance <= 0
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldTriangleExclusion.js */
__awtsmoosModule_87 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTriangleExclusion.js
 * @description Measures exact XZ clearance from dynamic collider triangles without turning them into giant proxy boxes.
 * The Awtsmoos creates every triangle and the open earth beside it; Awtsmoos.com keeps deferred text, props,
 * and other manifested collision visible to ecology without confusing an entire collider kind for one occupied rectangle.
 */

var nearestPointOnSegmentXZ = __awtsmoosModule_70.nearestPointOnSegmentXZ;

function triangleExclusionEvidenceAt(point, triangles = [], options = {}) {
	if (!triangles.length) return null;
	const margin = Math.max(0, Number(options.margin) || 0);
	let best = null;
	for (const triangle of triangles) {
		const edgeDistance = triangleEdgeDistance(point, triangle);
		const inside = triangleContainsXZ(point, triangle);
		const edgeClearance = inside ? -edgeDistance : edgeDistance;
		const clearance = edgeClearance - margin;
		if (best && clearance >= best.clearance) continue;
		best = Object.freeze({
			clearance,
			edgeClearance,
			inside,
			sourceId: triangle.kind || triangle.id || 'dynamic-collider',
			withinMargin: clearance <= 0
		});
	}
	return best;
}


__exports.triangleExclusionEvidenceAt = triangleExclusionEvidenceAt;
function triangleEdgeDistance(point, triangle) {
	return Math.min(
		nearestPointOnSegmentXZ(point, triangle.a, triangle.b).distance,
		nearestPointOnSegmentXZ(point, triangle.b, triangle.c).distance,
		nearestPointOnSegmentXZ(point, triangle.c, triangle.a).distance
	);
}

function triangleContainsXZ(point, triangle) {
	const first = sign(point, triangle.a, triangle.b);
	const second = sign(point, triangle.b, triangle.c);
	const third = sign(point, triangle.c, triangle.a);
	const negative = first < 0 || second < 0 || third < 0;
	const positive = first > 0 || second > 0 || third > 0;
	return !(negative && positive);
}

function sign(point, first, second) {
	return (point.x - second.x) * (first.z - second.z)
		- (first.x - second.x) * (point.z - second.z);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageCameras.js */
__awtsmoosModule_92 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageCameras.js
 * @description Fixes representative views so visual progress can be compared instead of asserted.
 * The Awtsmoos beholds every direction without division; Awtsmoos.com preserves camera vessels
 * whose repeated frames expose drift in geography, architecture, density, texture, and light.
 */

const CANONICAL_VILLAGE_CAMERAS = Object.freeze([
	camera('arrival-hero', [-5, 5.2, 121], [9, 7, 27], 62),
	camera('master-top-down', [4, 245, 24], [4, 0, 24], 48),
	camera('north', [4, 118, -205], [4, 8, 20], 48),
	camera('northeast', [165, 118, -160], [4, 8, 20], 48),
	camera('east', [215, 108, 18], [4, 8, 20], 48),
	camera('southeast', [165, 108, 185], [4, 8, 20], 48),
	camera('south', [4, 112, 225], [4, 8, 20], 48),
	camera('southwest', [-175, 108, 180], [4, 8, 20], 48),
	camera('west', [-220, 108, 18], [4, 8, 20], 48),
	camera('northwest', [-175, 118, -165], [4, 8, 20], 48),
	camera('market-eye', [-43, 10, 28], [-24, 7, 11], 58),
	camera('shul-terrace', [-51, 14, -2], [-34, 10, -24], 55),
	camera('bridge-riverbank', [-8, 8, 22], [18, 7, 7], 56),
	camera('waterfall-portal', [25, 15, -18], [51, 13, -45], 52),
	camera('cottage-exterior', [-33, 8, 65], [-24, 6, 57], 52),
	camera('cottage-interior', [-23, 4.5, 57], [-20, 4, 52], 62)
]);
__exports.CANONICAL_VILLAGE_CAMERAS = CANONICAL_VILLAGE_CAMERAS;


const CANONICAL_CAMERAS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_CAMERAS.map((definition) => [definition.id, definition])
));
__exports.CANONICAL_CAMERAS_BY_ID = CANONICAL_CAMERAS_BY_ID;


function camera(id, position, target, fov) {
	return Object.freeze({
		fov,
		id,
		position: vector(position),
		target: vector(target)
	});
}

function vector([x, y, z]) {
	return Object.freeze({ x, y, z });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageIdentifiers.js */
__awtsmoosModule_93 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageIdentifiers.js
 * @description Names every landmark that must remain stable across generation, saves, and cameras.
 * The Awtsmoos is one before every name; Awtsmoos.com gives each dwelling and holy gathering
 * place a durable vessel so no procedural pass can quietly exchange one village for another.
 */

const CANONICAL_BUILDING_IDS = Object.freeze([
	'SHUL01',
	'BEIS01',
	'MARKET01',
	...Array.from({ length: 18 }, (_, index) => `H${index + 10}`)
]);
__exports.CANONICAL_BUILDING_IDS = CANONICAL_BUILDING_IDS;


const CANONICAL_INFRASTRUCTURE_IDS = Object.freeze([
	'BRIDGE01',
	'PORTAL01',
	'ENTR01'
]);
__exports.CANONICAL_INFRASTRUCTURE_IDS = CANONICAL_INFRASTRUCTURE_IDS;


const CANONICAL_FARM_IDS = Object.freeze([
	'F01',
	'F02',
	'F03',
	'F04'
]);
__exports.CANONICAL_FARM_IDS = CANONICAL_FARM_IDS;


const CANONICAL_VILLAGE_IDS = Object.freeze([
	...CANONICAL_BUILDING_IDS,
	...CANONICAL_INFRASTRUCTURE_IDS,
	...CANONICAL_FARM_IDS
]);
__exports.CANONICAL_VILLAGE_IDS = CANONICAL_VILLAGE_IDS;


function isCanonicalVillageId(value) {
	return CANONICAL_VILLAGE_IDS.includes(String(value));
}

__exports.isCanonicalVillageId = isCanonicalVillageId;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageLocationAliases.js */
__awtsmoosModule_95 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationAliases.js
 * @description Preserves historical Short vocabulary without allowing poetic motifs to become new physical places.
 * The Awtsmoos is one before every name and frame; Awtsmoos.com lets old words still arrive,
 * while the village beneath them stays measured, geographic, and the same.
 */

const CANONICAL_VILLAGE_LOCATION_ALIASES = Object.freeze({
	'empty-vessel': 'village-well',
	'infinite-light': 'arrival-horizon',
	'manna-desert': 'waterfall-portal',
	'shabbos-village': 'shul-terrace',
	'world-renewed': 'market-square'
});
__exports.CANONICAL_VILLAGE_LOCATION_ALIASES = CANONICAL_VILLAGE_LOCATION_ALIASES;


/**
 * Resolves a requested location token into one stable geographic identifier.
 *
 * @param {unknown} value Candidate canonical id or historical alias.
 * @returns {string} Geographic identifier, or an empty string for no value.
 */
function resolveCanonicalVillageLocationId(value) {
	const requestedId = String(value || '');
	return CANONICAL_VILLAGE_LOCATION_ALIASES[requestedId] || requestedId;
}


__exports.resolveCanonicalVillageLocationId = resolveCanonicalVillageLocationId;
/**
 * Reports the geographic destination of one legacy name without mutating the caller.
 *
 * @param {unknown} value Candidate alias.
 * @returns {string|null} Canonical geographic id when the value is a legacy alias.
 */
function canonicalVillageLocationAliasTarget(value) {
	return CANONICAL_VILLAGE_LOCATION_ALIASES[String(value || '')] || null;
}

__exports.canonicalVillageLocationAliasTarget = canonicalVillageLocationAliasTarget;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageLocationFacets.js */
__awtsmoosModule_96 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationFacets.js
 * @description Connects each physical location to real roads, water, ecology, occluders, layouts, and camera clearances.
 * The Awtsmoos is not divided by road, river, tree, mountain, or lens; Awtsmoos.com records their relationships in small vessels,
 * so gameplay and generated film share one geography while no cinematic camera may be declared safe merely because X/Z looked clean.
 */

const FACETS_BY_LOCATION = Object.freeze({
	'arrival-horizon': facet(
		['ENTR01'], ['canonical-arrivalMain', 'canonical-arrivalWestHomes', 'canonical-arrivalEastHomes'],
		['arrival-meadow'], [], ['landscape', 'world-first'], ['ENTR01'], 5
	),
	'market-square': facet(
		['MARKET01', 'PLAZA01'], ['canonical-marketLoop', 'canonical-riverfront', 'canonical-shulRise'],
		['market-quarter'], [], ['character-first', 'speaker-forward'], ['MARKET01'], 5
	),
	'river-garden': facet(
		[], ['canonical-riverfront', 'canonical-eastBank'],
		['riverfront-gardens'], ['lower-river', 'lower-lake'], ['water-feature', 'world-first'],
		['BRIDGE01', 'WELL01', 'MARKET01'], 3, 7, 2
	),
	'shul-terrace': facet(
		['SHUL01'], ['canonical-shulRise', 'canonical-upperHomes'],
		['shul-terrace'], [], ['character-first', 'world-first'], ['SHUL01'], 5
	),
	'village-well': facet(
		['WELL01'], ['canonical-riverfront', 'canonical-marketLoop'],
		['riverfront-gardens', 'market-quarter'], [], ['character-first', 'world-first'], ['WELL01'], 5
	),
	'waterfall-portal': facet(
		['WATERFALL01', 'PORTAL01'], ['canonical-waterfallPortal', 'canonical-upperHomes'],
		['waterfall-portal'], ['mountain-headwater', 'upper-cascades'], ['water-feature', 'landscape'], ['PORTAL01'], 4
	)
});

function canonicalVillageLocationFacets(locationId) {
	return FACETS_BY_LOCATION[String(locationId || '')] || EMPTY_FACET;
}


__exports.canonicalVillageLocationFacets = canonicalVillageLocationFacets;
const EMPTY_FACET = facet([], [], [], [], ['world-first'], [], 5);

function facet(
	landmarks,
	paths,
	vegetationRegions,
	waterFeatures,
	preferredLayouts,
	forbiddenOccluders,
	riverClearance,
	cameraTerrain = 5,
	cameraTargetTerrain = 1.8
) {
	return Object.freeze({
		forbiddenOccluders: Object.freeze(forbiddenOccluders),
		landmarks: Object.freeze(landmarks),
		minimumClearances: Object.freeze({
			cameraTargetTerrain,
			cameraTerrain,
			river: riverClearance
		}),
		paths: Object.freeze(paths),
		preferredLayouts: Object.freeze(preferredLayouts),
		vegetationRegions: Object.freeze(vegetationRegions),
		waterFeatures: Object.freeze(waterFeatures)
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadGraph.js */
__awtsmoosModule_103 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadGraph.js
 * @description Solves one shared grade-constrained elevation graph for every canonical road.
 * The Awtsmoos gives many routes one ground truth; Awtsmoos.com lets shared junctions own one
 * elevation while neighboring control points relax until no authored segment exceeds safe grade.
 */

var canonicalVillageRoadRoutes = __awtsmoosModule_85.canonicalVillageRoadRoutes;

const MAXIMUM_GRAPH_GRADE = 0.16;
const RELAXATION_PASSES = 512;
let cachedGraph = null;

/**
 * Returns a shared immutable road graph measured from unmodified canonical terrain.
 *
 * @param {Function} baseHeightAt Unmodified terrain height callback.
 * @returns {Readonly<{nodes: Map<string, object>, routes: object[]}>} Solved graph.
 */
function canonicalRoadGraph(baseHeightAt) {
	if (!cachedGraph) {
		cachedGraph = buildRoadGraph(baseHeightAt);
	}
	return cachedGraph;
}


__exports.canonicalRoadGraph = canonicalRoadGraph;
function buildRoadGraph(baseHeightAt) {
	const sourceRoutes = canonicalVillageRoadRoutes();
	const nodes = createNodes(sourceRoutes, baseHeightAt);
	const edges = createEdges(sourceRoutes, nodes);
	relaxElevations(edges);
	const routes = sourceRoutes.map((route) => {
		return Object.freeze({
			...route,
			points: Object.freeze(route.points.map((point) => {
				return Object.freeze(nodes.get(pointKey(point)));
			}))
		});
	});
	return Object.freeze({
		nodes,
		routes: Object.freeze(routes)
	});
}

function createNodes(routes, baseHeightAt) {
	const nodes = new Map();
	for (const route of routes) {
		for (const point of route.points) {
			const key = pointKey(point);
			if (!nodes.has(key)) {
				nodes.set(key, {
				targetHeight: baseHeightAt(point.x, point.z),
				x: point.x,
				z: point.z
				});
			}
		}
	}
	return nodes;
}

function createEdges(routes, nodes) {
	const edges = [];
	for (const route of routes) {
		for (let index = 1; index < route.points.length; index += 1) {
			const first = nodes.get(pointKey(route.points[index - 1]));
			const second = nodes.get(pointKey(route.points[index]));
			edges.push({
				first,
				maximumDelta: Math.hypot(
					second.x - first.x,
					second.z - first.z
				) * MAXIMUM_GRAPH_GRADE,
				second
			});
		}
	}
	return edges;
}

function relaxElevations(edges) {
	for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
		let changed = false;
		for (const edge of edges) {
			changed = relaxEdge(edge) || changed;
		}
		if (!changed) {
			return;
		}
	}
}

function relaxEdge(edge) {
	const delta = edge.second.targetHeight - edge.first.targetHeight;
	const excess = Math.abs(delta) - edge.maximumDelta;
	if (excess <= 0.000001) {
		return false;
	}
	const direction = Math.sign(delta);
	edge.first.targetHeight += direction * excess / 2;
	edge.second.targetHeight -= direction * excess / 2;
	return true;
}

function pointKey(point) {
	return `${point.x}:${point.z}`;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadProfiles.js */
__awtsmoosModule_102 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadProfiles.js
 * @description Converts the shared road graph into renderer-ready corridor profiles.
 * The Awtsmoos orders every ascent through common junctions; Awtsmoos.com gives each route
 * measured radii and graph-solved target heights without allowing adjacent profiles to disagree.
 */

var canonicalRoadGraph = __awtsmoosModule_103.canonicalRoadGraph;

let cachedProfiles = null;

/**
 * Returns immutable graph-consistent road profiles.
 *
 * @param {Function} baseHeightAt Unmodified terrain height callback.
 * @returns {object[]} Canonical road profiles.
 */
function canonicalRoadProfiles(baseHeightAt) {
	if (!cachedProfiles) {
		cachedProfiles = canonicalRoadGraph(baseHeightAt).routes.map((route) => {
			return Object.freeze({
				fullRadius: route.width / 2 + 0.45,
				id: route.id,
				points: route.points,
				softRadius: route.width / 2 + 3.25,
				width: route.width
			});
		});
	}
	return cachedProfiles;
}

__exports.canonicalRoadProfiles = canonicalRoadProfiles;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadCorridor.js */
__awtsmoosModule_101 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRoadCorridor.js
 * @description Measures and blends the nearest graph-consistent canonical road segment.
 * The Awtsmoos carries one height through each shared junction; Awtsmoos.com exposes both
 * elevation and influence so traversable road centers remain authoritative near foundations.
 */

var canonicalRoadProfiles = __awtsmoosModule_102.canonicalRoadProfiles;

/**
 * Returns the complete road-corridor sample at one world coordinate.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} baseHeight Unmodified terrain height.
 * @param {Function} baseHeightAt Unmodified terrain callback.
 * @returns {Readonly<{height: number, influence: number}>} Corridor sample.
 */
function canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt) {
	const nearest = nearestRoadSample(
		canonicalRoadProfiles(baseHeightAt),
		x,
		z
	);
	if (!nearest) {
		return Object.freeze({
			height: baseHeight,
			influence: 0
		});
	}
	const influence = 1 - smooth(
		nearest.profile.fullRadius,
		nearest.profile.softRadius,
		nearest.distance
	);
	return Object.freeze({
		height: mix(baseHeight, nearest.targetHeight, influence),
		influence
	});
}


__exports.canonicalRoadCorridorSampleAt = canonicalRoadCorridorSampleAt;
/**
 * Returns only the adjusted corridor elevation for legacy callers.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number} baseHeight Unmodified terrain height.
 * @param {Function} baseHeightAt Unmodified terrain callback.
 * @returns {number} Road-corridor elevation.
 */
function canonicalRoadCorridorHeightAt(x, z, baseHeight, baseHeightAt) {
	return canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		baseHeightAt
	).height;
}


__exports.canonicalRoadCorridorHeightAt = canonicalRoadCorridorHeightAt;
function nearestRoadSample(profiles, x, z) {
	let nearest = null;
	for (const profile of profiles) {
		for (let index = 1; index < profile.points.length; index += 1) {
			const sample = segmentSample(
				profile.points[index - 1],
				profile.points[index],
				x,
				z
			);
			if (!nearest || sample.distance < nearest.distance) {
				nearest = {
					...sample,
					profile
				};
			}
		}
	}
	return nearest;
}

function segmentSample(first, second, x, z) {
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = clamp(
		((x - first.x) * dx + (z - first.z) * dz) / lengthSquared
	);
	const projectedX = first.x + dx * amount;
	const projectedZ = first.z + dz * amount;
	return {
		distance: Math.hypot(x - projectedX, z - projectedZ),
		targetHeight: mix(
			first.targetHeight,
			second.targetHeight,
			amount
		)
	};
}

function smooth(edge0, edge1, value) {
	const amount = clamp((value - edge0) / (edge1 - edge0 || 1));
	return amount * amount * (3 - 2 * amount);
}

function mix(first, second, amount) {
	return first + (second - first) * clamp(amount);
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainHeight.js */
__awtsmoosModule_100 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHeight.js
 * @description Orchestrates hydrology-safe terrain and graph-constrained road corridors.
 * The Awtsmoos joins valley, passage, and water in one elevation authority; Awtsmoos.com
 * reuses an already measured elevation when classifying the same terrain vertex.
 */

var canonicalHydrologyTerrainHeightAt = __awtsmoosModule_77.canonicalHydrologyTerrainHeightAt;
var canonicalRoadCorridorSampleAt = __awtsmoosModule_101.canonicalRoadCorridorSampleAt;
var canonicalTerrainBaseHeightAt = __awtsmoosModule_82.canonicalTerrainBaseHeightAt;
var canonicalRiverTerrainSample = __awtsmoosModule_79.canonicalRiverTerrainSample;
var canonicalTerraceSample = __awtsmoosModule_83.canonicalTerraceSample;

/** Returns the complete canonical terrain height. */
function canonicalTerrainHeightAt(x, z) {
	const baseHeight = canonicalTerrainBaseHeightAt(x, z);
	const roadHeight = canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		canonicalTerrainBaseHeightAt
	).height;
	return canonicalHydrologyTerrainHeightAt(x, z, roadHeight);
}


__exports.canonicalTerrainHeightAt = canonicalTerrainHeightAt;
/**
 * Classifies the final canonical surface without repeating a supplied height sample.
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @param {number|null} measuredElevation Existing elevation for this exact coordinate.
 * @returns {string} Semantic terrain zone.
 */
function canonicalTerrainZoneAt(x, z, measuredElevation = null) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const elevation = Number.isFinite(measuredElevation)
		? measuredElevation
		: canonicalTerrainHeightAt(x, z);
	if (river.distance < river.width * 0.78) {
		return 'stream-channel';
	}
	if (river.distance < river.width + 5.5) {
		return 'river-bank';
	}
	if (terrace.influence > 0.34) {
		return 'village-terrace';
	}
	if (elevation > 12 || Math.abs(x - river.center.x) > 100) {
		return 'alpine-rock';
	}
	return 'grass-valley';
}

__exports.canonicalTerrainZoneAt = canonicalTerrainZoneAt;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/collision/TriangleCollider.js */
__awtsmoosModule_106 = (() => {
const __exports = {};
// B"H // Boruch Hashem // Blessed is He

/**
 * @file TriangleCollider.js
 * @description Gives one rendered triangle an exact collision body and spatial box.
 * The Awtsmoos renews every face without division; Awtsmoos.com lets each finite
 * surface reveal its normal, solidity, floor meaning, and searchable boundary.
 */
var Aabb = __awtsmoosModule_43.Aabb;
var minMax = __awtsmoosModule_46.minMax;
var triangleNormal = __awtsmoosModule_46.triangleNormal;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryIndices.js */
__awtsmoosModule_105 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryIndices.js
 * @description Builds terrain topology and collision in responsive batches.
 * The Awtsmoos renews every triangle; Awtsmoos.com yields between bounded vessels so the
 * canonical valley never silences the world-entry interface while collision is prepared.
 */

var TriangleCollider = __awtsmoosModule_106.TriangleCollider;

function buildTerrainIndices(steps) {
	const indices = [];
	for (let row = 0; row < steps; row += 1) appendRow(indices, steps, row);
	return indices;
}


__exports.buildTerrainIndices = buildTerrainIndices;
async function buildTerrainIndicesAsync(steps, yieldWork) {
	const indices = [];
	for (let row = 0; row < steps; row += 1) {
		appendRow(indices, steps, row);
		if ((row + 1) % 8 === 0) await yieldWork();
	}
	return indices;
}


__exports.buildTerrainIndicesAsync = buildTerrainIndicesAsync;
function buildTerrainColliders(vertices, indices) {
	const colliders = [];
	for (let offset = 0; offset < indices.length; offset += 3) {
		colliders.push(createCollider(vertices, indices, offset));
	}
	return colliders;
}


__exports.buildTerrainColliders = buildTerrainColliders;
async function buildTerrainCollidersAsync(vertices, indices, yieldWork) {
	const colliders = [];
	for (let offset = 0; offset < indices.length; offset += 3) {
		colliders.push(createCollider(vertices, indices, offset));
		if ((offset / 3 + 1) % 384 === 0) await yieldWork();
	}
	return colliders;
}


__exports.buildTerrainCollidersAsync = buildTerrainCollidersAsync;
function appendRow(indices, steps, row) {
	for (let column = 0; column < steps; column += 1) {
		const first = row * (steps + 1) + column;
		const second = first + 1;
		const third = first + steps + 1;
		const fourth = third + 1;
		indices.push(first, third, second, second, third, fourth);
	}
}

function createCollider(vertices, indices, offset) {
	return new TriangleCollider(
		vertices[indices[offset]],
		vertices[indices[offset + 1]],
		vertices[indices[offset + 2]],
		{ floor: true, kind: 'terrain', solid: true }
	);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryNormals.js */
__awtsmoosModule_107 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryNormals.js
 * @description Accumulates and normalizes terrain light vectors in responsive batches.
 * The Awtsmoos gives every face its light; Awtsmoos.com yields between bounded calculations
 * so visual fidelity remains exact without imprisoning the browser's main thread.
 */

var triangleNormal = __awtsmoosModule_46.triangleNormal;
var v = __awtsmoosModule_46.v;

function buildTerrainNormals(vertices, indices) {
	const normals = emptyNormals(vertices.length);
	for (let offset = 0; offset < indices.length; offset += 3) {
		addFaceNormal(normals, vertices, indices, offset);
	}
	return normals.flatMap(normalized);
}


__exports.buildTerrainNormals = buildTerrainNormals;
async function buildTerrainNormalsAsync(vertices, indices, yieldWork) {
	const normals = emptyNormals(vertices.length);
	for (let offset = 0; offset < indices.length; offset += 3) {
		addFaceNormal(normals, vertices, indices, offset);
		if ((offset / 3 + 1) % 384 === 0) await yieldWork();
	}
	const flattened = [];
	for (let index = 0; index < normals.length; index += 1) {
		flattened.push(...normalized(normals[index]));
		if ((index + 1) % 512 === 0) await yieldWork();
	}
	return flattened;
}


__exports.buildTerrainNormalsAsync = buildTerrainNormalsAsync;
function emptyNormals(length) {
	return Array.from({ length }, () => v());
}

function addFaceNormal(normals, vertices, indices, offset) {
	const face = [indices[offset], indices[offset + 1], indices[offset + 2]];
	const normal = triangleNormal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
	for (const vertexIndex of face) {
		normals[vertexIndex].x += normal.x;
		normals[vertexIndex].y += normal.y;
		normals[vertexIndex].z += normal.z;
	}
}

function normalized(normal) {
	const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
	return [normal.x / length, normal.y / length, normal.z / length];
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryFinalization.js */
__awtsmoosModule_104 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryFinalization.js
 * @description Finalizes sampled terrain through synchronous or cooperative paths.
 * The Awtsmoos preserves one geometric truth in both paths; Awtsmoos.com chooses the
 * responsive path for gameplay and the immediate path for deterministic tooling.
 */

var canonicalTerraceDefinitions = __awtsmoosModule_83.canonicalTerraceDefinitions;
var buildTerrainColliders = __awtsmoosModule_105.buildTerrainColliders;
var buildTerrainCollidersAsync = __awtsmoosModule_105.buildTerrainCollidersAsync;
var buildTerrainIndices = __awtsmoosModule_105.buildTerrainIndices;
var buildTerrainIndicesAsync = __awtsmoosModule_105.buildTerrainIndicesAsync;
var buildTerrainNormals = __awtsmoosModule_107.buildTerrainNormals;
var buildTerrainNormalsAsync = __awtsmoosModule_107.buildTerrainNormalsAsync;

function finishTerrainGeometry(state, preparation, coordinateAt) {
	const indices = buildTerrainIndices(state.steps);
	return terrainResult(
		state,
		indices,
		buildTerrainColliders(state.vertices, indices),
		buildTerrainNormals(state.vertices, indices),
		preparation,
		coordinateAt
	);
}


__exports.finishTerrainGeometry = finishTerrainGeometry;
async function finishTerrainGeometryAsync(state, preparation, coordinateAt, options = {}) {
	const yieldWork = options.yieldWork || browserYield;
	options.onPhase?.('Indexing the terrain surface…', 0.72);
	const indices = await buildTerrainIndicesAsync(state.steps, yieldWork);
	options.onPhase?.('Preparing responsive terrain collision…', 0.78);
	const colliders = await buildTerrainCollidersAsync(state.vertices, indices, yieldWork);
	options.onPhase?.('Lighting the terrain surface…', 0.84);
	const normals = await buildTerrainNormalsAsync(state.vertices, indices, yieldWork);
	preparation.milliseconds = now() - preparation.startedAt;
	return terrainResult(state, indices, colliders, normals, preparation, coordinateAt);
}


__exports.finishTerrainGeometryAsync = finishTerrainGeometryAsync;
function terrainResult(state, indices, colliders, normals, preparation, coordinateAt) {
	return {
		AwtsmoosTerrainValley: terrainEvidence(state, indices, preparation, coordinateAt),
		colliders,
		indices,
		normals,
		preparation: publicPreparation(preparation),
		size: state.size,
		steps: state.steps,
		uvs: state.uvs,
		vertices: state.vertices,
		zones: state.zones
	};
}

function terrainEvidence(state, indices, preparation, coordinateAt) {
	const center = state.steps / 2;
	const spacing = Math.abs(
		coordinateAt(center + 1, state.steps, state.half)
		- coordinateAt(center, state.steps, state.half)
	);
	return Object.freeze({
		centerSpacing: Number(spacing.toFixed(3)),
		colliderTriangles: indices.length / 3,
		grid: `${state.steps}x${state.steps}`,
		hydrology: 'canonical-waterfall-bridge-lake-outlet',
		performancePolicy: 'center-dense-cooperative-heightfield',
		preparation: Object.freeze(publicPreparation(preparation)),
		sampling: 'nonlinear-center-dense',
		terraces: canonicalTerraceDefinitions().map(terrace => terrace.id)
	});
}

function publicPreparation(preparation) {
	const { startedAt, ...publicValue } = preparation;
	return publicValue;
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometry.js */
__awtsmoosModule_99 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometry.js
 * @description Samples canonical earth and cooperatively finalizes expensive mesh vessels.
 * The Awtsmoos renews cliff, terrace, riverbank, and foundation in bounded moments;
 * Awtsmoos.com preserves exact terrain APIs and counts every browser-yield receipt truthfully.
 */

var v = __awtsmoosModule_46.v;
var canonicalTerrainHeightAt = __awtsmoosModule_100.canonicalTerrainHeightAt;
var canonicalTerrainZoneAt = __awtsmoosModule_100.canonicalTerrainZoneAt;
var finishTerrainGeometry = __awtsmoosModule_104.finishTerrainGeometry;
var finishTerrainGeometryAsync = __awtsmoosModule_104.finishTerrainGeometryAsync;

const DEFAULT_TERRAIN_SIZE = 540;
__exports.DEFAULT_TERRAIN_SIZE = DEFAULT_TERRAIN_SIZE;

const DEFAULT_TERRAIN_STEPS = 128;
__exports.DEFAULT_TERRAIN_STEPS = DEFAULT_TERRAIN_STEPS;

const terrainHeightAt = canonicalTerrainHeightAt;
__exports.terrainHeightAt = terrainHeightAt;

const terrainZoneAt = canonicalTerrainZoneAt;
__exports.terrainZoneAt = terrainZoneAt;


function createTerrainGeometry(size = DEFAULT_TERRAIN_SIZE, steps = DEFAULT_TERRAIN_STEPS) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	for (let index = 0; index < state.total; index += 1) sampleVertex(state, index);
	return finishTerrainGeometry(state, {
		milliseconds: now() - startedAt,
		mode: 'synchronous',
		yields: 0
	}, terrainCoordinateAt);
}


__exports.createTerrainGeometry = createTerrainGeometry;
async function createTerrainGeometryAsync(
	size = DEFAULT_TERRAIN_SIZE,
	steps = DEFAULT_TERRAIN_STEPS,
	options = {}
) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	const yieldEvery = boundedInteger(options.yieldEvery, 64, 16, 512);
	const baseYield = options.yieldWork || yieldToBrowser;
	const preparation = {
		milliseconds: 0,
		mode: 'cooperative',
		startedAt,
		yieldEvery,
		yields: 0
	};
	const countedYield = async () => {
		preparation.yields += 1;
		await baseYield();
	};
	for (let index = 0; index < state.total; index += 1) {
		sampleVertex(state, index);
		if ((index + 1) % yieldEvery !== 0 || index + 1 === state.total) continue;
		if ((preparation.yields + 1) % 6 === 0) {
			options.onProgress?.(index + 1, state.total);
		}
		await countedYield();
	}
	options.onProgress?.(state.total, state.total);
	await countedYield();
	return finishTerrainGeometryAsync(state, preparation, terrainCoordinateAt, {
		onPhase: options.onPhase,
		yieldWork: countedYield
	});
}


__exports.createTerrainGeometryAsync = createTerrainGeometryAsync;
function terrainCoordinateAt(index, steps, half) {
	const normalized = index / steps * 2 - 1;
	const absolute = Math.abs(normalized);
	const centerDense = absolute * 0.32 + Math.pow(absolute, 1.72) * 0.68;
	return Math.sign(normalized) * centerDense * half;
}


__exports.terrainCoordinateAt = terrainCoordinateAt;
function createSamplingState(size, steps) {
	return {
		half: size / 2,
		size,
		steps,
		total: (steps + 1) * (steps + 1),
		uvs: [],
		vertices: [],
		zones: []
	};
}

function sampleVertex(state, index) {
	const rowSize = state.steps + 1;
	const xIndex = index % rowSize;
	const zIndex = Math.floor(index / rowSize);
	const x = terrainCoordinateAt(xIndex, state.steps, state.half);
	const z = terrainCoordinateAt(zIndex, state.steps, state.half);
	const height = terrainHeightAt(x, z);
	state.vertices.push(v(x, height, z));
	state.uvs.push(xIndex / state.steps, zIndex / state.steps);
	state.zones.push(terrainZoneAt(x, z, height));
}

function boundedInteger(value, fallback, minimum, maximum) {
	const resolved = Number.isFinite(Number(value)) ? Number(value) : fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(resolved)));
}

function yieldToBrowser() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCameraGrounding.js */
__awtsmoosModule_98 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCameraGrounding.js
 * @description Resolves cinematic lens and target heights from canonical terrain instead of fragile absolute Y guesses.
 * The Awtsmoos creates mountain and eye together; Awtsmoos.com records finite clearance above that mountain,
 * so generated films cannot aim the lens into earth merely because the valley elevation changes beneath an otherwise valid X/Z lane.
 */

var terrainHeightAt = __awtsmoosModule_99.terrainHeightAt;

function terrainRelativeCameraPoint(x, z, clearance) {
	return Object.freeze({
		x: Number(x),
		y: terrainHeightAt(Number(x), Number(z)) + positive(clearance, 7),
		z: Number(z)
	});
}


__exports.terrainRelativeCameraPoint = terrainRelativeCameraPoint;
function terrainRelativeCameraTarget(x, z, height = 2.6) {
	return Object.freeze({
		x: Number(x),
		y: terrainHeightAt(Number(x), Number(z)) + positive(height, 2.6),
		z: Number(z)
	});
}


__exports.terrainRelativeCameraTarget = terrainRelativeCameraTarget;
function cameraTerrainClearance(point) {
	return Number(point?.y) - terrainHeightAt(Number(point?.x), Number(point?.z));
}


__exports.cameraTerrainClearance = cameraTerrainClearance;
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageLocationShots.js */
__awtsmoosModule_97 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationShots.js
 * @description Authors lower-river cinematic lanes from terrain-relative eye clearances and above-ground look-at targets.
 * The Awtsmoos renews river, bank, witness, mountain, and sky before the lens can flatten them;
 * Awtsmoos.com therefore stores X/Z choreography plus explicit clearance, never brittle absolute Y values that can bury a camera in earth.
 */

var terrainRelativeCameraPoint = __awtsmoosModule_98.terrainRelativeCameraPoint;
var terrainRelativeCameraTarget = __awtsmoosModule_98.terrainRelativeCameraTarget;

const LOWER_RIVER_TARGET = terrainRelativeCameraTarget(7.5, 42.3, 2.6);
const FINAL_RIVER_TARGET = terrainRelativeCameraTarget(10, 44, 2.6);

const SHOTS_BY_LOCATION = Object.freeze({
	'river-garden': Object.freeze({
		aerialPullback: shot([-22, 54, 12], [-13, 58, 15], FINAL_RIVER_TARGET, 56),
		craneReveal: shot([-20, 50, 9], [-14, 46, 11], LOWER_RIVER_TARGET, 50),
		dollyIn: shot([-23, 45, 9], [-15, 43, 9], LOWER_RIVER_TARGET, 46),
		orbitLeft: shot([-18, 54, 8.5], [-11, 49, 8.5], LOWER_RIVER_TARGET, 50),
		sideTrack: shot([-20, 38, 8], [-13, 47, 8], LOWER_RIVER_TARGET, 48)
	})
});

function canonicalVillageLocationShots(locationId) {
	return SHOTS_BY_LOCATION[String(locationId || '')] || Object.freeze({});
}


__exports.canonicalVillageLocationShots = canonicalVillageLocationShots;
function shot(from, to, target, fieldOfView) {
	return Object.freeze({
		fieldOfView,
		from: cameraPoint(from),
		target,
		to: cameraPoint(to)
	});
}

function cameraPoint([x, z, clearance]) {
	return terrainRelativeCameraPoint(x, z, clearance);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageLocationStaging.js */
__awtsmoosModule_108 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationStaging.js
 * @description Publishes measured gameplay and cinematic stages with separate composition and physical occupancy envelopes.
 * The Awtsmoos creates the human body and the open stage around it without confusing their measures;
 * Awtsmoos.com keeps a generous protected radius for scenery while a realistic occupancy radius governs feet, roads, houses, and water.
 */

const STAGING_BY_LOCATION = Object.freeze({
	'arrival-horizon': pads(
		pad('arrival-gameplay', 0, 72, 6, 'gameplay-spawn', 'dry'),
		pad('arrival-cinematic', -7, 67, 4, 'cinematic-actor', 'dry')
	),
	'market-square': pads(
		pad('market-gameplay', -26, 12, 7, 'gameplay-spawn', 'dry'),
		pad('market-cinematic', -18, 16, 4, 'cinematic-actor', 'dry')
	),
	'river-garden': pads(
		pad('bridge-gameplay', 6, 10, 4, 'gameplay-spawn', 'bridge-approach'),
		pad('lower-river-cinematic', -1, 42, 4, 'cinematic-actor', 'garden-bank')
	),
	'shul-terrace': pads(
		pad('shul-gameplay', -34, -24, 6, 'gameplay-spawn', 'dry'),
		pad('shul-cinematic', -27, -18, 4, 'cinematic-actor', 'dry')
	),
	'village-well': pads(
		pad('well-gameplay', -8, 20, 4, 'gameplay-spawn', 'dry'),
		pad('well-cinematic', -13, 25, 3, 'cinematic-actor', 'dry')
	),
	'waterfall-portal': pads(
		pad('portal-gameplay', 58, -58, 4, 'gameplay-spawn', 'rock-terrace'),
		pad('portal-cinematic', 40, -50, 4, 'cinematic-actor', 'rock-terrace')
	)
});

function canonicalVillageLocationStaging(locationId) {
	return STAGING_BY_LOCATION[String(locationId || '')] || Object.freeze([]);
}


__exports.canonicalVillageLocationStaging = canonicalVillageLocationStaging;
function pads(...values) {
	return Object.freeze(values);
}

function pad(id, x, z, radius, role, ground, occupancyRadius = defaultOccupancyRadius(role)) {
	return Object.freeze({
		ground,
		id,
		occupancyRadius,
		position: Object.freeze({ x, z }),
		radius,
		role
	});
}

function defaultOccupancyRadius(role) {
	return role === 'cinematic-actor' ? 0.75 : 0.65;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageLocations.js */
__awtsmoosModule_94 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocations.js
 * @description Composes one geographic identity from shared staging, cameras, facets, and cinematic lanes.
 * The Awtsmoos is beyond every border yet renews each measured place; Awtsmoos.com lets gameplay keep its bridge crossing
 * while cinema stands downstream where broad living water, garden bank, and Chossid can share one honest frame.
 */

var CANONICAL_CAMERAS_BY_ID = __awtsmoosModule_92.CANONICAL_CAMERAS_BY_ID;
var resolveCanonicalVillageLocationId = __awtsmoosModule_95.resolveCanonicalVillageLocationId;
var canonicalVillageLocationFacets = __awtsmoosModule_96.canonicalVillageLocationFacets;
var canonicalVillageLocationShots = __awtsmoosModule_97.canonicalVillageLocationShots;
var canonicalVillageLocationStaging = __awtsmoosModule_108.canonicalVillageLocationStaging;

const RIVER_SAFE_BOUNDS = bounds(-24, 4, 34, -7, 24, 60);

const CANONICAL_VILLAGE_LOCATIONS = Object.freeze([
	location('river-garden', 'Lower River Garden', point(14, 3.8, 42),
		'broad lower river, reflective lake edge, reeds, wet stones and open garden bank', null, RIVER_SAFE_BOUNDS,
		['water', 'vegetation', 'landscape'], camera([-20, 8, 48], [7.5, 4.1, 42.3], 50)),
	location('village-well', 'Village Well', point(-8, 6, 20),
		'open fieldstone village well courtyard and timber homes', null, null, ['architecture', 'community'],
		camera([-28, 9, 32], [-8, 6, 20], 54)),
	location('arrival-horizon', 'Arrival Horizon', point(9, 7, 27),
		'golden alpine horizon, meadow road, trees and village', 'arrival-hero', null,
		['landscape', 'road', 'vegetation']),
	location('waterfall-portal', 'Waterfall Portal', point(51, 13, -45),
		'rock portal, waterfall, mountain path and open sky', 'waterfall-portal', null,
		['water', 'rock', 'landscape']),
	location('shul-terrace', 'Shul Terrace', point(-34, 10, -24),
		'shul terrace, cottages, lamps, trees and stone paths', 'shul-terrace', null,
		['architecture', 'community', 'vegetation']),
	location('market-square', 'Market Square', point(-24, 7, 11),
		'market plaza, authored homes, road, props and living valley', 'market-eye', null,
		['architecture', 'community', 'road'])
]);
__exports.CANONICAL_VILLAGE_LOCATIONS = CANONICAL_VILLAGE_LOCATIONS;


const CANONICAL_VILLAGE_LOCATIONS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_LOCATIONS.map(profile => [profile.id, profile])
));
__exports.CANONICAL_VILLAGE_LOCATIONS_BY_ID = CANONICAL_VILLAGE_LOCATIONS_BY_ID;


function canonicalVillageLocation(id) {
	return CANONICAL_VILLAGE_LOCATIONS_BY_ID[resolveCanonicalVillageLocationId(id)] || null;
}


__exports.canonicalVillageLocation = canonicalVillageLocation;
function canonicalVillageLocationShot(profileOrId, rig) {
	const profile = typeof profileOrId === 'string' ? canonicalVillageLocation(profileOrId) : profileOrId;
	return profile?.shots?.[String(rig || '')] || null;
}


__exports.canonicalVillageLocationShot = canonicalVillageLocationShot;
function listCanonicalVillageLocations() {
	return [...CANONICAL_VILLAGE_LOCATIONS];
}


__exports.listCanonicalVillageLocations = listCanonicalVillageLocations;
function location(id, label, focus, prompt, cameraId, cameraSafeBounds, heroRoles, cameraValue = null) {
	const staging = canonicalVillageLocationStaging(id);
	return Object.freeze({
		actor: actorFrom(staging, id),
		camera: cameraValue || cameraFrom(cameraId),
		cameraSafeBounds,
		facets: canonicalVillageLocationFacets(id),
		focus: Object.freeze(focus),
		heroRoles: Object.freeze(heroRoles),
		id,
		label,
		prompt,
		schemaVersion: '2026.08-geographic-v4',
		shots: canonicalVillageLocationShots(id),
		staging
	});
}

function actorFrom(staging, id) {
	const pad = staging.find(value => value.role === 'cinematic-actor');
	if (!pad) throw new Error(`Missing cinematic actor staging for ${id}.`);
	return Object.freeze({ ...pad.position });
}

function cameraFrom(id) {
	if (!id) return null;
	const source = CANONICAL_CAMERAS_BY_ID[id];
	if (!source) throw new Error(`Missing canonical village camera ${id}.`);
	return camera([source.position.x, source.position.y, source.position.z],
		[source.target.x, source.target.y, source.target.z], source.fov);
}

function camera(position, target, fieldOfView) {
	return Object.freeze({ fieldOfView, position: Object.freeze(point(...position)), target: Object.freeze(point(...target)) });
}

function bounds(minX, minY, minZ, maxX, maxY, maxZ) {
	return Object.freeze({ max: Object.freeze(point(maxX, maxY, maxZ)), min: Object.freeze(point(minX, minY, minZ)) });
}

function point(x, y, z) {
	return { x, y, z };
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillagePlan.js */
__awtsmoosModule_91 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillagePlan.js
 * @description Publishes the single measured contract consumed by village systems without awakening arrival runtime side effects.
 * The Awtsmoos unites gathering, commerce, homes, water, earth, roads, cameras, and story place;
 * Awtsmoos.com keeps the canonical plan spatially pure so gameplay, cutscenes, cinema, and diagnostics share one valley cheaply.
 */

var CANONICAL_VILLAGE_BIOMES = __awtsmoosModule_65.CANONICAL_VILLAGE_BIOMES;
var CANONICAL_VILLAGE_CAMERAS = __awtsmoosModule_92.CANONICAL_VILLAGE_CAMERAS;
var CANONICAL_VILLAGE_CLEARINGS = __awtsmoosModule_72.CANONICAL_VILLAGE_CLEARINGS;
var CANONICAL_VILLAGE_FOOTPRINTS = __awtsmoosModule_67.CANONICAL_VILLAGE_FOOTPRINTS;
var CANONICAL_VILLAGE_HOUSES = __awtsmoosModule_68.CANONICAL_VILLAGE_HOUSES;
var CANONICAL_VILLAGE_IDS = __awtsmoosModule_93.CANONICAL_VILLAGE_IDS;
var CANONICAL_VILLAGE_LOCATIONS = __awtsmoosModule_94.CANONICAL_VILLAGE_LOCATIONS;
var CANONICAL_RIVER_CASCADES = __awtsmoosModule_81.CANONICAL_RIVER_CASCADES;
var CANONICAL_RIVER_CONTROL_POINTS = __awtsmoosModule_81.CANONICAL_RIVER_CONTROL_POINTS;
var CANONICAL_RIVER_LAKE_INDEX = __awtsmoosModule_81.CANONICAL_RIVER_LAKE_INDEX;
var canonicalRoadNetworkEvidence = __awtsmoosModule_85.canonicalRoadNetworkEvidence;
var canonicalVillageRoadRoutes = __awtsmoosModule_85.canonicalVillageRoadRoutes;
var VILLAGE_ARRIVAL_ENTRANCE = __awtsmoosModule_73.VILLAGE_ARRIVAL_ENTRANCE;

__exports.CANONICAL_VILLAGE_CLEARINGS = __awtsmoosModule_72.CANONICAL_VILLAGE_CLEARINGS;

const CANONICAL_VILLAGE_LANDMARKS = Object.freeze({
	beisChabad: marker(-35, 45, 'BEIS01'),
	bridge: marker(18, 7, 'BRIDGE01'),
	entrance: marker(VILLAGE_ARRIVAL_ENTRANCE.x, VILLAGE_ARRIVAL_ENTRANCE.z, 'ENTR01'),
	forestSign: marker(-8, 52, 'FOREST_SIGN'),
	lake: Object.freeze({ id: 'LAKE01', radiusX: 12.5, radiusZ: 25, x: 15, z: 62 }),
	learningSign: marker(-7, 48, 'LEARNING_SIGN'),
	market: marker(-26, 12, 'MARKET01'),
	plaza: Object.freeze({ id: 'PLAZA01', radius: 10, x: -12, z: 14 }),
	portal: marker(56, -49, 'PORTAL01'),
	shul: marker(-34, -24, 'SHUL01'),
	waterfall: marker(49, -42, 'WATERFALL01'),
	well: marker(-8, 20, 'WELL01')
});
__exports.CANONICAL_VILLAGE_LANDMARKS = CANONICAL_VILLAGE_LANDMARKS;


const CANONICAL_VILLAGE_DISTRICTS = Object.freeze([
	district('arrival-meadow', 'meadow', [0, 72], [24, 20], 'near', 0.2, ['H10', 'H11']),
	district('beis-chabad-terrace', 'herb', [-35, 45], [18, 14], 'near', 0.72, ['H12', 'H13'], 'BEIS01'),
	district('market-quarter', 'formal', [-26, 12], [22, 16], 'near', 1.22, ['H14', 'H15', 'H16'], 'MARKET01'),
	district('shul-terrace', 'cottage', [-34, -24], [20, 15], 'near', 1.74, ['H17', 'H18'], 'SHUL01'),
	district('upper-residential', 'cottage', [-8, -36], [22, 16], 'medium', 2.18, ['H19', 'H20']),
	district('north-slope-residential', 'woodland', [18, -48], [22, 15], 'far', 2.62, ['H21', 'H22']),
	district('east-bank-homes', 'cottage', [38, 4], [18, 16], 'medium', 3.08, ['H23', 'H24']),
	district('waterfall-portal', 'rock-garden', [52, -42], [15, 13], 'far', 3.46, ['H25'], 'PORTAL01'),
	district('farm-terraces', 'meadow', [43, 39], [21, 17], 'far', 3.88, ['H26']),
	district('riverfront-gardens', 'water-edge', [-5, 36], [18, 15], 'medium', 4.28, ['H27'])
]);
__exports.CANONICAL_VILLAGE_DISTRICTS = CANONICAL_VILLAGE_DISTRICTS;


const CANONICAL_VILLAGE_PLAN = Object.freeze({
	biomes: CANONICAL_VILLAGE_BIOMES,
	cameras: CANONICAL_VILLAGE_CAMERAS,
	clearings: CANONICAL_VILLAGE_CLEARINGS,
	districts: CANONICAL_VILLAGE_DISTRICTS,
	footprints: CANONICAL_VILLAGE_FOOTPRINTS,
	houses: CANONICAL_VILLAGE_HOUSES,
	identifiers: CANONICAL_VILLAGE_IDS,
	landmarks: CANONICAL_VILLAGE_LANDMARKS,
	locations: CANONICAL_VILLAGE_LOCATIONS,
	river: Object.freeze({
		cascades: CANONICAL_RIVER_CASCADES,
		controlPoints: CANONICAL_RIVER_CONTROL_POINTS,
		lakeIndex: CANONICAL_RIVER_LAKE_INDEX
	}),
	roads: Object.freeze({
		evidence: canonicalRoadNetworkEvidence(),
		routes: Object.freeze(canonicalVillageRoadRoutes())
	}),
	version: '2026.08-canonical-alpine-village-locations'
});
__exports.CANONICAL_VILLAGE_PLAN = CANONICAL_VILLAGE_PLAN;


function district(id, habitat, center, radius, detail, phase, houseIds, landmarkId = null) {
	return Object.freeze({
		center: Object.freeze(center),
		detail,
		habitat,
		houseIds: Object.freeze(houseIds),
		id,
		landmarkId,
		phase,
		radius: Object.freeze(radius)
	});
}

function marker(x, z, id) {
	return Object.freeze({ id, x, z });
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCurves.js */
__awtsmoosModule_90 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCurves.js
 * @description Preserves curve callers while exposing canonical landmarks and water.
 * The Awtsmoos is one source revealed through many names; Awtsmoos.com keeps old APIs
 * stable as every sign, bridge, lake, plaza, and path agrees with the master plan.
 */

var CANONICAL_VILLAGE_LANDMARKS = __awtsmoosModule_91.CANONICAL_VILLAGE_LANDMARKS;
var riverCenterAt = __awtsmoosModule_80.riverCenterAt;
var riverWidthAt = __awtsmoosModule_80.riverWidthAt;
var sampleRiverPath = __awtsmoosModule_80.sampleRiverPath;

function streamCenterAt(t) {
	return riverCenterAt(t);
}


__exports.streamCenterAt = streamCenterAt;
function streamWidthAt(t) {
	return riverWidthAt(t);
}


__exports.streamWidthAt = streamWidthAt;
function normalBetween(a, b) {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}


__exports.normalBetween = normalBetween;
function sampleStream(samples = 64) {
	return sampleRiverPath(samples);
}


__exports.sampleStream = sampleStream;
function villageLandmarks() {
	return CANONICAL_VILLAGE_LANDMARKS;
}

__exports.villageLandmarks = villageLandmarks;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverChannelProfile.js */
__awtsmoosModule_109 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverChannelProfile.js
 * @description Defines the river's static depth, bank moisture, speed, and flow regimes.
 * The Awtsmoos gives one current many truthful conditions without dividing its essence;
 * Awtsmoos.com lets source, plunge pool, narrows, village reach, lake, and outlet breathe.
 */

var RIVER_LAKE_T = __awtsmoosModule_80.RIVER_LAKE_T;

const MINIMUM_DEPTH = 0.48;
const MAXIMUM_DEPTH = 2.35;

/**
 * Resolves one immutable channel description for a sampled river point.
 *
 * @param {number} t - Normalized source-to-outlet position.
 * @param {number} width - Current half-width of the visible river surface.
 * @returns {{bankWetness: number, depth: number, flowRegime: string, flowSpeed: number}}
 */
function riverChannelProfileAt(t, width) {
	const position = clamp(Number(t) || 0, 0, 1);
	const channelWidth = Math.max(1, Number(width) || 1);
	const plungeInfluence = gaussian(position, 0.16, 0.075);
	const narrowInfluence = gaussian(position, 0.42, 0.1);
	const lowerPoolInfluence = gaussian(position, RIVER_LAKE_T, 0.14);
	const depth = clamp(
		0.58
		+ plungeInfluence * 1.42
		+ narrowInfluence * 0.2
		+ lowerPoolInfluence * 0.72
		+ Math.max(0, channelWidth - 3.1) * 0.035,
		MINIMUM_DEPTH,
		MAXIMUM_DEPTH
	);
	const bankWetness = clamp(
		0.4
		+ plungeInfluence * 0.34
		+ narrowInfluence * 0.16
		+ lowerPoolInfluence * 0.2,
		0.35,
		0.96
	);
	const flowRegime = flowRegimeAt(position);
	const flowSpeed = flowSpeedFor(flowRegime, channelWidth);

	return {
		bankWetness,
		depth,
		flowRegime,
		flowSpeed
	};
}


__exports.riverChannelProfileAt = riverChannelProfileAt;
function flowRegimeAt(position) {
	if (position < 0.09) return 'mountain-source';
	if (position < 0.25) return 'plunge-pool';
	if (position < 0.5) return 'fast-narrows';
	if (position < RIVER_LAKE_T - 0.06) return 'village-current';
	if (position < RIVER_LAKE_T + 0.14) return 'calm-lower-pool';
	return 'outlet-run';
}

function flowSpeedFor(regime, width) {
	const regimeSpeed = {
		'calm-lower-pool': 0.34,
		'fast-narrows': 1.18,
		'mountain-source': 0.82,
		'outlet-run': 0.62,
		'plunge-pool': 0.76,
		'village-current': 0.88
	}[regime];
	return clamp(regimeSpeed * (4.2 / Math.max(3.1, width)), 0.18, 1.35);
}

function gaussian(value, center, radius) {
	const normalized = (value - center) / radius;
	return Math.exp(-(normalized * normalized));
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverHydrologySampling.js */
__awtsmoosModule_110 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrologySampling.js
 * @description Interpolates full river channel evidence without burdening the hydrology builder.
 * The Awtsmoos remains one between authored samples; Awtsmoos.com carries depth, flow, moisture,
 * frame, width, and position continuously so every downstream system receives the same river between measured stones.
 */

function sampleHydrologyPoint(points, t) {
	const scaled = clamp(t, 0, 1) * (points.length - 1);
	const firstIndex = Math.min(points.length - 2, Math.floor(scaled));
	const amount = scaled - firstIndex;
	return interpolatePoint(points[firstIndex], points[firstIndex + 1], amount);
}


__exports.sampleHydrologyPoint = sampleHydrologyPoint;
function interpolatePoint(first, second, amount) {
	return {
		bankWetness: interpolate(first.bankWetness, second.bankWetness, amount),
		depth: interpolate(first.depth, second.depth, amount),
		flowRegime: amount < 0.5 ? first.flowRegime : second.flowRegime,
		flowSpeed: interpolate(first.flowSpeed, second.flowSpeed, amount),
		normal: {
			x: interpolate(first.normal.x, second.normal.x, amount),
			z: interpolate(first.normal.z, second.normal.z, amount)
		},
		t: interpolate(first.t, second.t, amount),
		width: interpolate(first.width, second.width, amount),
		x: interpolate(first.x, second.x, amount),
		y: interpolate(first.y, second.y, amount),
		z: interpolate(first.z, second.z, amount)
	};
}

function interpolate(first, second, amount) {
	return first + (second - first) * amount;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageGroundSampling.js */
__awtsmoosModule_111 = (() => {
const __exports = {};
// B"H

/**
 * Reads the village ground contract used by production and isolated geometry tests.
 * Production samplers return structured evidence; a plain function remains valid for test fixtures.
 */
function villageGroundHeight(groundSampler, x, z) {
	if (typeof groundSampler === 'function') return groundSampler(x, z);
	if (typeof groundSampler?.heightAt === 'function') {
		const sample = groundSampler.heightAt(x, z);
		if (Number.isFinite(sample?.y)) return sample.y;
	}
	throw new TypeError('Village ground sampler must be a function or expose heightAt(x, z).');
}

__exports.villageGroundHeight = villageGroundHeight;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverHydrology.js */
__awtsmoosModule_89 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.js
 * @description Builds one descending river with authored depth, moisture, flow regimes, and stable channel frames.
 * The Awtsmoos lowers every drop toward its appointed basin; Awtsmoos.com joins source, plunge pool,
 * narrows, bridge reach, lower pool, and outlet while interpolation lives in its own focused river vessel.
 */

var CANONICAL_RIVER_CASCADES = __awtsmoosModule_81.CANONICAL_RIVER_CASCADES;
var normalBetween = __awtsmoosModule_90.normalBetween;
var villageLandmarks = __awtsmoosModule_90.villageLandmarks;
var riverChannelProfileAt = __awtsmoosModule_109.riverChannelProfileAt;
var sampleHydrologyPoint = __awtsmoosModule_110.sampleHydrologyPoint;
var RIVER_LAKE_T = __awtsmoosModule_80.RIVER_LAKE_T;
var sampleRiverPath = __awtsmoosModule_80.sampleRiverPath;
var villageGroundHeight = __awtsmoosModule_111.villageGroundHeight;

const RIVER_CASCADES = CANONICAL_RIVER_CASCADES;
__exports.RIVER_CASCADES = RIVER_CASCADES;


function createRiverHydrology(groundSampler, samples = 64) {
	const points = sampleRiverPath(samples).map(point => ({ ...point }));
	const lake = villageLandmarks().lake;
	const lakeLevel = villageGroundHeight(groundSampler, lake.x, lake.z) + 0.18;
	const lakeIndex = Math.round(RIVER_LAKE_T * (points.length - 1));
	points[lakeIndex].y = lakeLevel;
	resolveUpstreamHeights(points, lakeIndex, groundSampler);
	resolveDownstreamHeights(points, lakeIndex, groundSampler);
	appendChannelProfiles(points);
	appendFrames(points);
	const depths = points.map(point => point.depth);
	return {
		lakeIndex,
		lakeLevel,
		points,
		stats: {
			cascades: RIVER_CASCADES.length,
			flowRegimes: [...new Set(points.map(point => point.flowRegime))],
			lakeT: RIVER_LAKE_T,
			maximumDepth: Math.max(...depths),
			minimumDepth: Math.min(...depths),
			outletY: points.at(-1).y,
			sourceY: points[0].y,
			totalDrop: points[0].y - points.at(-1).y
		}
	};
}


__exports.createRiverHydrology = createRiverHydrology;
function sampleHydrologyAt(profile, t) {
	return sampleHydrologyPoint(profile.points, t);
}


__exports.sampleHydrologyAt = sampleHydrologyAt;
function resolveUpstreamHeights(points, lakeIndex, groundSampler) {
	for (let index = lakeIndex - 1; index >= 0; index -= 1) {
		const point = points[index];
		const next = points[index + 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.16;
		const cascade = cascadeDrop(point.t, next.t);
		const preferred = Math.max(ground, next.y + 0.04 + cascade);
		point.y = Math.min(preferred, next.y + 0.18 + cascade);
	}
}

function resolveDownstreamHeights(points, lakeIndex, groundSampler) {
	for (let index = lakeIndex + 1; index < points.length; index += 1) {
		const point = points[index];
		const previous = points[index - 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.14;
		const preferred = Math.min(ground, previous.y - 0.04);
		point.y = Math.max(preferred, previous.y - 0.18);
	}
}

function appendChannelProfiles(points) {
	for (const point of points) Object.assign(point, riverChannelProfileAt(point.t, point.width));
}

function appendFrames(points) {
	for (let index = 0; index < points.length; index += 1) {
		points[index].normal = normalBetween(
			points[Math.max(0, index - 1)],
			points[Math.min(points.length - 1, index + 1)]
		);
	}
}

function cascadeDrop(start, end) {
	return RIVER_CASCADES.reduce((sum, cascade) => {
		return sum + (cascade.t > start && cascade.t <= end ? cascade.drop : 0);
	}, 0);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldWaterCorridor.js */
__awtsmoosModule_88 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldWaterCorridor.js
 * @description Makes the canonical river edge and optional hydrology one shared spatial evidence contract.
 * The Awtsmoos creates current, depth, bank, and channel as one truth; Awtsmoos.com gives every finite caller the same river t,
 * width, waterline, and signed edge clearance so ecology, staging, gameplay, and cinema cannot invent different water boundaries.
 */

var sampleHydrologyAt = __awtsmoosModule_89.sampleHydrologyAt;
var sampleRiverPath = __awtsmoosModule_80.sampleRiverPath;
var freezePoint = __awtsmoosModule_70.freezePoint;
var nearestPointOnPolylineXZ = __awtsmoosModule_70.nearestPointOnPolylineXZ;

const WATER_SAMPLES = Object.freeze(
	sampleRiverPath(220).map(sample => Object.freeze({ ...sample }))
);

function waterCorridorEvidenceAt(point, options = {}) {
	const samples = options.samples || WATER_SAMPLES;
	const nearest = nearestPointOnPolylineXZ(point, samples);
	if (!nearest) return null;
	const profile = interpolateChannelSample(samples, nearest.segmentIndex, nearest.segmentT);
	const halfWidth = Math.max(0, Number(profile.width) || 0);
	const edgeClearance = nearest.distance - halfWidth;
	const margin = Math.max(0, Number(options.margin) || 0);
	const hydrology = options.hydrology
		? sampleHydrologyAt(options.hydrology, profile.t)
		: null;
	return Object.freeze({
		bankWetness: hydrology?.bankWetness ?? null,
		channelWidth: halfWidth * 2,
		clearance: edgeClearance - margin,
		depth: hydrology?.depth ?? null,
		distanceToCenterline: nearest.distance,
		edgeClearance,
		flowRegime: hydrology?.flowRegime ?? null,
		flowSpeed: hydrology?.flowSpeed ?? null,
		halfWidth,
		inside: edgeClearance <= 0,
		nearestPoint: nearest.point,
		normal: hydrology?.normal ? freezePoint(hydrology.normal) : null,
		segmentIndex: nearest.segmentIndex,
		segmentT: nearest.segmentT,
		sourceId: 'canonical-village-river',
		t: profile.t,
		waterY: hydrology?.y ?? null,
		withinMargin: edgeClearance - margin <= 0
	});
}


__exports.waterCorridorEvidenceAt = waterCorridorEvidenceAt;
function waterCorridorSamples() {
	return WATER_SAMPLES;
}


__exports.waterCorridorSamples = waterCorridorSamples;
function interpolateChannelSample(samples, segmentIndex, amount) {
	const first = samples[Math.max(0, Math.min(samples.length - 1, segmentIndex))];
	const second = samples[Math.max(0, Math.min(samples.length - 1, segmentIndex + 1))];
	return {
		t: interpolate(first.t, second.t, amount),
		width: interpolate(first.width, second.width, amount)
	};
}

function interpolate(first, second, amount) {
	const a = Number(first) || 0;
	const b = Number(second) || a;
	return a + (b - a) * amount;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldEcologyClearance.js */
__awtsmoosModule_64 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologyClearance.js
 * @description Unifies structure, doorway, road, water, dynamic-collider, slope, and biome evidence for living placement.
 * The Awtsmoos creates forest, garden, road, river, and dwelling without collision of purpose; Awtsmoos.com gives
 * every tree and botanical caller the same signed boundaries so richer ecology cannot overwrite the village beneath it.
 */

var canonicalBiomeAt = __awtsmoosModule_65.canonicalBiomeAt;
var architectureApproachEvidenceAt = __awtsmoosModule_66.architectureApproachEvidenceAt;
var clearingExclusionEvidenceAt = __awtsmoosModule_71.clearingExclusionEvidenceAt;
var footprintExclusionEvidenceAt = __awtsmoosModule_71.footprintExclusionEvidenceAt;
var roadCorridorEvidenceAt = __awtsmoosModule_74.roadCorridorEvidenceAt;
var triangleExclusionEvidenceAt = __awtsmoosModule_87.triangleExclusionEvidenceAt;
var waterCorridorEvidenceAt = __awtsmoosModule_88.waterCorridorEvidenceAt;

function ecologySiteEvidenceAt(point, options = {}) {
	const radius = Math.max(0.1, Number(options.siteRadius) || 0.4);
	const sample = options.groundSampler?.heightAt?.(point.x, point.z) || null;
	const evidence = {
		approach: clearance(architectureApproachEvidenceAt(point, {
			margin: radius + number(options.approachMargin, 0.8)
		})),
		biome: canonicalBiomeAt(point.x, point.z),
		clearing: clearance(clearingExclusionEvidenceAt(point, {
			margin: radius + number(options.clearingMargin, 0.4)
		})),
		footprint: clearance(footprintExclusionEvidenceAt(point, {
			margin: radius + number(options.footprintMargin, 0.6)
		})),
		obstacle: clearance(triangleExclusionEvidenceAt(
			point,
			options.obstacleTriangles || [],
			{ margin: radius + number(options.obstacleMargin, 0.4) }
		)),
		river: clearance(waterCorridorEvidenceAt(point, {
			hydrology: options.hydrology,
			margin: radius + number(options.waterMargin, 0.7)
		})),
		road: clearance(roadCorridorEvidenceAt(point, {
			margin: radius + number(options.roadMargin, 0.8)
		})),
		sample,
		slope: (sample?.normal?.y ?? 1) - number(options.minimumNormalY, 0.78)
	};
	const keys = ['approach', 'clearing', 'footprint', 'obstacle', 'river', 'road', 'slope'];
	return Object.freeze({
		...evidence,
		radius,
		valid: Boolean(sample && Number.isFinite(sample.y)) && keys.every(key => evidence[key] >= 0)
	});
}


__exports.ecologySiteEvidenceAt = ecologySiteEvidenceAt;
function ecologyRejectionReason(evidence) {
	if (!evidence?.sample || !Number.isFinite(evidence.sample.y)) return 'ground';
	for (const key of ['approach', 'clearing', 'footprint', 'obstacle', 'river', 'road', 'slope']) {
		if (evidence[key] < 0) return key;
	}
	return null;
}


__exports.ecologyRejectionReason = ecologyRejectionReason;
function clearance(evidence) {
	return evidence?.clearance ?? Number.POSITIVE_INFINITY;
}

function number(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/spatial/WorldEcologySpacing.js */
__awtsmoosModule_112 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologySpacing.js
 * @description Gives every ecological placement one crown-aware signed spacing measure.
 * The Awtsmoos creates grove and clearing together; Awtsmoos.com lets large crowns breathe farther apart
 * while flowers and low stones may gather closely, using one reusable distance covenant instead of local guesses.
 */

function ecologySpacingClearance(point, radius, placements = [], radiusOf = defaultRadius) {
	if (!placements.length) return Number.POSITIVE_INFINITY;
	const current = Math.max(0, Number(radius) || 0);
	let clearance = Number.POSITIVE_INFINITY;
	for (const placement of placements) {
		const previous = Math.max(0, Number(radiusOf(placement)) || 0);
		clearance = Math.min(
			clearance,
			Math.hypot(point.x - placement.x, point.z - placement.z) - current - previous
		);
	}
	return clearance;
}


__exports.ecologySpacingClearance = ecologySpacingClearance;
function defaultRadius(placement) {
	return placement.siteRadius || placement.clusterRadius || placement.radius || 0.4;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/RealNatureAssetCatalog.js */
__awtsmoosModule_113 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureAssetCatalog.js
 * @description Keeps inspected non-tree GLB accents while all structural trees belong exclusively to the deep core library.
 * The Awtsmoos clothes one valley in blossom, bush, and stone without creating a second tree authority;
 * Awtsmoos.com leaves pine and broadleaf growth to `geelooy/libs/awtsmoos-procedural-core`, one botanical root alone.
 */

var remoteModelUrl = __awtsmoosModule_33.remoteModelUrl;

const RECORDS = Object.freeze([
	asset('flower', 'flower', 'reference-world/Flower_4_Clump.glb', 0.85, false, 0.052),
	asset('bush', 'bush', 'reference-world/Bush_Large_Flowers.glb', 1.05, false, 0.038),
	asset('rock', 'rock', 'reference-world/Rock_2.glb', 1.1, true, 0)
]);

function realNatureAssetCatalog() {
	return RECORDS;
}


__exports.realNatureAssetCatalog = realNatureAssetCatalog;
function realNatureAsset(assetId) {
	return RECORDS.find(record => record.id === assetId) || null;
}


__exports.realNatureAsset = realNatureAsset;
function asset(id, family, modelPath, scale, solid, windAmplitude) {
	return Object.freeze({
		family,
		id,
		modelPath,
		scale,
		shadowIntent: family !== 'flower',
		solid,
		url: remoteModelUrl(modelPath),
		windAmplitude
	});
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NaturePlacementField.js */
__awtsmoosModule_63 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NaturePlacementField.js
 * @description Places non-tree hero accents through the same house, stair, road, river, slope, and spacing truth as the forest.
 * The Awtsmoos lets blossom, bush, and stone gather in living irregularity without blocking a threshold or current;
 * Awtsmoos.com keeps all trees in the deep core while these finite accents search bounded sites around canonical terrain.
 */

var ecologySiteEvidenceAt = __awtsmoosModule_64.ecologySiteEvidenceAt;
var ecologySpacingClearance = __awtsmoosModule_112.ecologySpacingClearance;
var realNatureAssetCatalog = __awtsmoosModule_113.realNatureAssetCatalog;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RADII = Object.freeze({
	bush: Object.freeze([22, 52]),
	flower: Object.freeze([16, 42]),
	rock: Object.freeze([34, 92])
});

function createNaturePlacements(groundSampler, budget) {
	const placements = [];
	for (const asset of realNatureAssetCatalog()) {
		const count = budget.counts[asset.id] || 0;
		for (let index = 0; index < count; index += 1) {
			const placement = findPlacement(asset, index, count, groundSampler, placements);
			if (placement) placements.push(placement);
		}
	}
	return Object.freeze(placements);
}


__exports.createNaturePlacements = createNaturePlacements;
function findPlacement(asset, index, count, groundSampler, occupied) {
	const radius = siteRadius(asset.family);
	for (let attempt = 0; attempt < 36; attempt += 1) {
		const point = candidate(asset, index, count, attempt);
		const ecology = ecologySiteEvidenceAt(point, {
			approachMargin: 0.5,
			clearingMargin: 0.15,
			groundSampler,
			minimumNormalY: minimumNormalY(asset.family),
			roadMargin: 0.35,
			siteRadius: radius,
			waterMargin: waterMargin(asset.family)
		});
		if (!ecology.valid) continue;
		const spacing = ecologySpacingClearance(point, radius, occupied);
		if (spacing < 0) continue;
		return Object.freeze({
			asset,
			ecology,
			index,
			scale: asset.scale * (0.88 + ((index * 37 + attempt * 11) % 25) / 100),
			siteRadius: radius,
			x: point.x,
			y: ecology.sample.y,
			yaw: point.angle + Math.PI,
			z: point.z
		});
	}
	return null;
}

function candidate(asset, index, count, attempt) {
	const [inner, outer] = RADII[asset.id];
	const fraction = (index + 0.54 + attempt * 0.173) / Math.max(1, count + attempt * 0.31);
	const radius = inner + (outer - inner) * (fraction % 1);
	const angle = (index + attempt * 0.47) * GOLDEN_ANGLE + familyPhase(asset.id);
	return { angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function familyPhase(assetId) {
	return ({ bush: 0.7, flower: 0.2, rock: 1.9 })[assetId];
}

function minimumNormalY(family) {
	return family === 'rock' ? 0.7 : 0.82;
}

function siteRadius(family) {
	return ({ bush: 0.95, flower: 0.42, rock: 1.15 })[family] || 0.5;
}

function waterMargin(family) {
	return family === 'rock' ? 0.1 : family === 'flower' ? 0.45 : 0.8;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/NatureVisibilityField.js */
__awtsmoosModule_114 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureVisibilityField.js
 * @description Applies real distance culling to every isolated tree, flower, bush, and rock scene.
 * The Awtsmoos reveals what belongs near the traveler and folds distant vessels from the eye;
 * Awtsmoos.com counts each visible form, so mobile budgets become behavior rather than a lie.
 */

class NatureVisibilityField {
	constructor(instances, budget, originProvider) {
		this.instances = instances;
		this.cullDistanceSquared = budget.cullDistance ** 2;
		this.originProvider = originProvider || (() => ({ x: 0, y: 0, z: 0 }));
		this.visible = instances.length;
	}

	/** Updates scene visibility from the live traveler or camera position. */
	update() {
		const origin = this.originProvider() || {};
		const x = finite(origin.x);
		const z = finite(origin.z);
		let visible = 0;
		for (const instance of this.instances) {
			const placement = instance.placement;
			const dx = placement.x - x;
			const dz = placement.z - z;
			const withinRange = dx * dx + dz * dz <= this.cullDistanceSquared;
			instance.scene.visible = withinRange;
			if (withinRange) visible += 1;
		}
		this.visible = visible;
		return visible;
	}

	snapshot() {
		return Object.freeze({
			culled: this.instances.length - this.visible,
			total: this.instances.length,
			visible: this.visible
		});
	}
}


__exports.NatureVisibilityField = NatureVisibilityField;
function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/RealNatureSystem.js */
__awtsmoosModule_55 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureSystem.js
 * @description Loads bounded non-tree GLB accents with shared advected wind, culling, and truthful evidence.
 * The Awtsmoos lets blossom, bush, and stone accompany the procedural forest without founding another tree world;
 * Awtsmoos.com sends the same traveling weather through meadow and model while structural trees and collision remain core-owned.
 */

var loadIsolatedGltf = __awtsmoosModule_2.loadIsolatedGltf;
var startNatureAnimation = __awtsmoosModule_56.startNatureAnimation;
var decorateNatureInstance = __awtsmoosModule_57.decorateNatureInstance;
var loadNatureInstances = __awtsmoosModule_62.loadNatureInstances;
var createNaturePlacements = __awtsmoosModule_63.createNaturePlacements;
var natureQualityBudget = __awtsmoosModule_60.natureQualityBudget;
var NatureVisibilityField = __awtsmoosModule_114.NatureVisibilityField;
var SharedWindField = __awtsmoosModule_58.SharedWindField;

async function createRealNatureSystem(options = {}) {
	const budget = natureQualityBudget(options.quality);
	const placements = createNaturePlacements(options.groundSampler, budget);
	const loaded = await loadNatureInstances(placements, {
		budget,
		decorate: decorateNatureInstance,
		loadModel: options.loadModel || loadIsolatedGltf,
		yieldControl: options.yieldControl
	});
	for (const instance of loaded.instances) options.group?.add?.(instance.scene);
	const wind = new SharedWindField({
		framesPerSecond: budget.windFps,
		visibilityOrigin: options.visibilityOrigin
	});
	const visibility = new NatureVisibilityField(
		loaded.instances,
		budget,
		options.visibilityOrigin
	);
	visibility.update();
	const animation = startNatureAnimation(wind, loaded.instances, {
		...options,
		onStep: () => visibility.update()
	});
	return createPackage({
		animation,
		budget,
		failures: loaded.failures,
		group: options.group,
		instances: loaded.instances,
		placements,
		strategy: loaded.strategy,
		visibility,
		wind
	});
}


__exports.createRealNatureSystem = createRealNatureSystem;
function createPackage(values) {
	let destroyed = false;
	const snapshot = () => Object.freeze({
		animationRunning: values.animation.running(),
		assets: [...new Set(values.instances.map(instance => instance.placement.asset.id))],
		batching: values.strategy,
		budget: values.budget,
		collisionAuthority: 'none-supplemental-nature',
		destroyed,
		failures: [...values.failures],
		families: countFamilies(values.instances),
		installed: values.instances.length,
		requested: values.placements.length,
		shadowMaps: false,
		structuralTreeAuthority: 'awtsmoos-procedural-core',
		structuralTrees: 0,
		visibility: values.visibility.snapshot(),
		wind: values.wind.snapshot()
	});
	return Object.freeze({
		destroy() {
			if (destroyed) return;
			destroyed = true;
			values.animation.destroy();
			for (const instance of values.instances) values.group?.remove?.(instance.scene);
		},
		instances: values.instances,
		snapshot
	});
}

function countFamilies(instances) {
	const counts = {};
	for (const instance of instances) {
		const family = instance.placement.asset.family;
		counts[family] = (counts[family] || 0) + 1;
	}
	return Object.freeze(counts);
}

__exports.default = createRealNatureSystem;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/LiveRealNatureBridge.js */
__awtsmoosModule_52 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureBridge.js
 * @description Waits for the final meadow runtime, then mounts real nature.
 * The Awtsmoos ignores each passing bootstrap shadow and roots in the finished frame;
 * Awtsmoos.com preserves honest failure and cleanup while every living form keeps its name.
 */

var attachLiveNatureRuntime = __awtsmoosModule_53.attachLiveNatureRuntime;
var createLiveNatureContext = __awtsmoosModule_53.createLiveNatureContext;
var currentLiveRuntime = __awtsmoosModule_53.currentLiveRuntime;
var detachLiveNatureRuntime = __awtsmoosModule_53.detachLiveNatureRuntime;
var liveRuntimeReady = __awtsmoosModule_53.liveRuntimeReady;

function createLiveRealNatureBridge(options = {}) {
	const environment = options.environment || globalThis;
	const loadModule = options.loadModule || (() => Promise.resolve(__awtsmoosModule_55));
	const schedule = options.schedule || ((callback, delay) => environment.setTimeout(callback, delay));
	const cancel = options.cancel || (handle => environment.clearTimeout(handle));
	let attempts = 0;
	let error = null;
	let group = null;
	let promise = null;
	let runtime = options.runtime || null;
	let state = 'cold';
	let system = null;
	let timer = null;

	const controller = Object.freeze({
		awtsmoosRealNatureBridge: true,
		destroy,
		snapshot,
		start
	});

	function start() {
		if (promise) return promise;
		state = 'waiting-for-final-runtime';
		promise = new Promise(resolve => probe(resolve));
		return promise;
	}

	function probe(resolve) {
		runtime = options.runtime || currentLiveRuntime(environment);
		attempts += 1;
		if (liveRuntimeReady(runtime)) {
			mount(resolve);
			return;
		}
		if (attempts >= (options.maximumAttempts || 240)) {
			state = 'failed';
			error = 'Final meadow runtime did not expose scene, terrain, renderer, state, and frame scheduler.';
			resolve(snapshot());
			return;
		}
		timer = schedule(() => probe(resolve), options.retryDelay || 50);
	}

	async function mount(resolve) {
		state = 'loading-real-models';
		const context = createLiveNatureContext(runtime);
		group = context.group;
		attachLiveNatureRuntime(runtime, controller);
		try {
			const module = await loadModule();
			system = await module.createRealNatureSystem(context);
			state = system.snapshot().failures.length ? 'ready-with-failures' : 'ready';
			environment.addEventListener?.('pagehide', destroy, { once: true });
		} catch (caught) {
			error = caught?.message || String(caught);
			state = 'failed';
			detachLiveNatureRuntime(runtime, controller, group);
		}
		resolve(snapshot());
	}

	function destroy() {
		if (state === 'destroyed') return;
		if (timer !== null) cancel(timer);
		timer = null;
		system?.destroy();
		detachLiveNatureRuntime(runtime, controller, group);
		state = 'destroyed';
	}

	function snapshot() {
		return Object.freeze({
			attempts,
			error,
			state,
			system: system?.snapshot() || null
		});
	}

	return controller;
}

__exports.createLiveRealNatureBridge = createLiveRealNatureBridge;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/LiveRealNatureReceipt.js */
__awtsmoosModule_115 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureReceipt.js
 * @description Publishes one durable bridge receipt beyond replaceable runtime objects.
 * The Awtsmoos keeps the garden's testimony when bootstrap vessels pass away;
 * Awtsmoos.com lets browser proof read success or failure from one enduring display.
 */

function exposeLiveNatureReceipt(environment, controller) {
	if (environment && typeof environment === 'object') {
		environment.AwtsmoosRealNatureBridge = controller;
	}
}


__exports.exposeLiveNatureReceipt = exposeLiveNatureReceipt;
function clearLiveNatureReceipt(environment, controller) {
	if (environment?.AwtsmoosRealNatureBridge === controller) {
		delete environment.AwtsmoosRealNatureBridge;
	}
}

__exports.clearLiveNatureReceipt = clearLiveNatureReceipt;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/nature/LiveRealNatureScheduler.js */
__awtsmoosModule_51 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureScheduler.js
 * @description Owns one reusable bridge and its durable browser-visible receipt.
 * The Awtsmoos calls one garden through many terrain and leaf awakenings;
 * Awtsmoos.com preserves one testimony, avoiding duplicate roots and repeated makings.
 */

var createLiveRealNatureBridge = __awtsmoosModule_52.createLiveRealNatureBridge;
var exposeLiveNatureReceipt = __awtsmoosModule_115.exposeLiveNatureReceipt;
var currentLiveRuntime = __awtsmoosModule_53.currentLiveRuntime;

let singleton = null;

function scheduleLiveRealNatureBridge(environment = globalThis) {
	const runtime = currentLiveRuntime(environment);
	if (runtime?.realNature?.awtsmoosRealNatureBridge) {
		exposeLiveNatureReceipt(environment, runtime.realNature);
		return runtime.realNature;
	}
	if (singleton && singleton.snapshot().state !== 'destroyed') {
		exposeLiveNatureReceipt(environment, singleton);
		return singleton;
	}
	singleton = createLiveRealNatureBridge({ environment });
	exposeLiveNatureReceipt(environment, singleton);
	singleton.start();
	return singleton;
}

__exports.scheduleLiveRealNatureBridge = scheduleLiveRealNatureBridge;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalContract.js */
__awtsmoosModule_50 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalContract.js
 * @description Activates the live arrival nature bridge while re-exporting pure arrival geometry for legacy callers.
 * The Awtsmoos creates still spatial truth and living runtime awakening without confusion;
 * Awtsmoos.com keeps the scheduling side effect here alone, so ordinary spatial imports remain fast and deterministic.
 */

var scheduleLiveRealNatureBridge = __awtsmoosModule_51.scheduleLiveRealNatureBridge;

__exports.arrivalPlayerScreenFraction = __awtsmoosModule_73.arrivalPlayerScreenFraction;
__exports.VILLAGE_ARRIVAL_CAMERA = __awtsmoosModule_73.VILLAGE_ARRIVAL_CAMERA;
__exports.VILLAGE_ARRIVAL_CLEARINGS = __awtsmoosModule_73.VILLAGE_ARRIVAL_CLEARINGS;
__exports.VILLAGE_ARRIVAL_ENTRANCE = __awtsmoosModule_73.VILLAGE_ARRIVAL_ENTRANCE;
__exports.VILLAGE_ARRIVAL_PLAYER = __awtsmoosModule_73.VILLAGE_ARRIVAL_PLAYER;
__exports.VILLAGE_ARRIVAL_SIGN = __awtsmoosModule_73.VILLAGE_ARRIVAL_SIGN;

scheduleArrivalNatureBridge();

function scheduleArrivalNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerStateFactory.js */
__awtsmoosModule_49 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerStateFactory.js
 * @description Creates bootstrap and canonical gameplay identity from one measured covenant.
 * The Awtsmoos renews body, place, and purpose together in every frame of the road;
 * Awtsmoos.com gives both first light and fuller valley a truthful state to hold.
 */

var VILLAGE_ARRIVAL_PLAYER = __awtsmoosModule_50.VILLAGE_ARRIVAL_PLAYER;
var FACE_HEIGHT = __awtsmoosModule_36.FACE_HEIGHT;

const PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;
__exports.PLAYER_SPAWN = PLAYER_SPAWN;


function createBootstrapPlayerStats() {
	return {
		armor: 3,
		face: '🎩',
		health: 100,
		level: 1,
		maxHealth: 100,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}


__exports.createBootstrapPlayerStats = createBootstrapPlayerStats;
function createBootstrapPlayerState() {
	return {
		action: 'idle',
		airPhase: 'ground',
		clip: '',
		collisionEnabled: true,
		contacts: [],
		defeated: false,
		facing: 0,
		grounded: true,
		inputLocked: false,
		jumpsUsed: 0,
		level: 'meadow',
		lifecycle: 'active',
		moving: false,
		multiplayer: null,
		renderY: 0,
		runMode: false,
		targetingEnabled: true,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}


__exports.createBootstrapPlayerState = createBootstrapPlayerState;
function createEretzPlayerStats() {
	return {
		face: '🎩',
		health: 100,
		level: 1,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}


__exports.createEretzPlayerStats = createEretzPlayerStats;
function createEretzPlayerState(initialY, feet, player, spawn = PLAYER_SPAWN) {
	return {
		airPhase: 'ground',
		ceilingHit: null,
		clip: '',
		contacts: [],
		faceHeight: FACE_HEIGHT,
		facing: spawn.facing,
		feet,
		grounded: true,
		jumpClock: 0,
		level: 'eretz',
		moving: false,
		normals: [],
		player,
		renderY: initialY,
		runMode: false,
		slopeState: 'walk',
		stepState: 'flat',
		velY: 0,
		x: spawn.x,
		y: initialY,
		z: spawn.z
	};
}

__exports.createEretzPlayerState = createEretzPlayerState;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerRuntimeFactories.js */
__awtsmoosModule_40 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerRuntimeFactories.js
 * @description Creates grounded player roots and movement vessels that honor their soles.
 * The Awtsmoos joins measured form to lawful earth while every instant becomes new;
 * Awtsmoos.com keeps pivot, shadow, collision, and ascent within one truthful view.
 */

var Group = __awtsmoosModule_7.Group;
var AwtsmoosCollisionMover = __awtsmoosModule_41.AwtsmoosCollisionMover;
var JumpPhysics = __awtsmoosModule_48.JumpPhysics;
var findMinWorldY = __awtsmoosModule_39.findMinWorldY;
var MAX_SLOPE_NORMAL = __awtsmoosModule_36.MAX_SLOPE_NORMAL;
var PLAYER_HEIGHT = __awtsmoosModule_36.PLAYER_HEIGHT;
var PLAYER_RADIUS = __awtsmoosModule_36.PLAYER_RADIUS;
var createEretzPlayerState = __awtsmoosModule_49.createEretzPlayerState;
var createEretzPlayerStats = __awtsmoosModule_49.createEretzPlayerStats;

__exports.createEretzPlayerState = createEretzPlayerState;
__exports.createEretzPlayerStats = createEretzPlayerStats;

const CANONICAL_PLAYER_SCALE = 1.52;
__exports.CANONICAL_PLAYER_SCALE = CANONICAL_PLAYER_SCALE;


function createGroundedCanonicalPlayer(scene, state) {
	scene.name = 'Awtsmoos_canonical_chossid_glb_scene';
	scene.visible = true;
	scene.position.set(0, 0, 0);
	scene.scale.set(
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE
	);
	scene.updateWorldMatrix?.();
	const measuredMinY = findMinWorldY(scene);
	const feetOffset = Number.isFinite(measuredMinY) ? -measuredMinY : 0;
	scene.position.y = feetOffset;
	scene.setBaseTransform?.();
	const model = new Group();
	model.name = 'Awtsmoos_grounded_canonical_chossid';
	model.userData = { canonicalPlayerRoot: true, feetOffset };
	model.position.set(
		state.x || 0,
		state.renderY ?? state.y ?? 0,
		state.z || 0
	);
	model.quaternion.set(
		0,
		Math.sin((state.facing || 0) / 2),
		0,
		Math.cos((state.facing || 0) / 2)
	);
	model.add(scene);
	model.setBaseTransform?.();
	return {
		feet: { measuredMinY, offset: feetOffset },
		model,
		visiblePlayer: scene
	};
}


__exports.createGroundedCanonicalPlayer = createGroundedCanonicalPlayer;
function prepareCanonicalPlayerMeshes(model) {
	let count = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.castShadow = true;
		object.receiveShadow = true;
		object.visible = true;
		object.userData ||= {};
		object.userData.realChossid = true;
		count += 1;
	});
	return count;
}


__exports.prepareCanonicalPlayerMeshes = prepareCanonicalPlayerMeshes;
function createBootstrapPlayerVessels(foundation) {
	const playerModel = { footOffset: 0 };
	const collisionMover = foundation.collisionQuery
		? createEretzMover(foundation, playerModel)
		: null;
	const jumpPhysics = foundation.ground
		? createEretzJumpPhysics(foundation, playerModel)
		: null;
	return {
		collisionMover,
		jumpPhysics,
		mover: collisionMover
	};
}


__exports.createBootstrapPlayerVessels = createBootstrapPlayerVessels;
function createEretzMover(foundation, playerModel) {
	return new AwtsmoosCollisionMover({
		footOffset: playerModel.footOffset,
		height: PLAYER_HEIGHT,
		octree: foundation.collisionQuery,
		radius: PLAYER_RADIUS
	});
}


__exports.createEretzMover = createEretzMover;
function createEretzJumpPhysics(foundation, playerModel) {
	return new JumpPhysics({
		footOffset: playerModel.footOffset,
		ground: foundation.ground,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
}

__exports.createEretzJumpPhysics = createEretzJumpPhysics;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerMaterialHydrator.js */
__awtsmoosModule_116 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/** Preserves the canonical Chossid's exported shirt, skin, coat, and equipment colors exactly. */
function hydrateReadablePlayerMaterials(model) {
	const receipt = { assetNativeColors: 0, invalidColors: 0, materialsVisited: 0, textureBound: 0 };
	const visited = new Set();
	model?.traverse?.(node => {
		if (!node.isMesh && !node.isSkinnedMesh) return;
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		for (const material of materials.filter(Boolean)) {
			if (visited.has(material)) continue;
			visited.add(material);
			receipt.materialsVisited += 1;
			const color = material.baseColorFactor || material.color;
			if (!validColor(color)) {
				receipt.invalidColors += 1;
				continue;
			}
			material.userData ||= {};
			material.userData.AwtsmoosChossidMaterial = Object.freeze({
				assetNative: true,
				material: material.name || null,
				source: 'chossid.glb'
			});
			material.needsUpdate = true;
			receipt.assetNativeColors += 1;
		}
	});
	if (receipt.invalidColors) {
		throw new Error(`Canonical Chossid contains ${receipt.invalidColors} invalid material colors.`);
	}
	return Object.freeze(receipt);
}


__exports.hydrateReadablePlayerMaterials = hydrateReadablePlayerMaterials;
function validColor(value) {
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		return value.length >= 3 && Array.from(value).slice(0, 4).every(Number.isFinite);
	}
	return Number.isFinite(value?.r) && Number.isFinite(value?.g) && Number.isFinite(value?.b);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowPlayerHydration.js */
__awtsmoosModule_1 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Atomically replaces fallback humanity with the asset-native animated canonical Chossid.
 * The Awtsmoos joins measured feet, authored colors, bones, and imported motion in one living vessel;
 * Awtsmoos.com never lets a procedural silhouette or a names-only animation stub survive production hydration.
 */

var loadIsolatedGltf = __awtsmoosModule_2.loadIsolatedGltf;
var PLAYER_MODEL_URL = __awtsmoosModule_36.PLAYER_MODEL_URL;
var installCanonicalChossidAnimation = __awtsmoosModule_37.installCanonicalChossidAnimation;
var CANONICAL_PLAYER_SCALE = __awtsmoosModule_40.CANONICAL_PLAYER_SCALE;
var createGroundedCanonicalPlayer = __awtsmoosModule_40.createGroundedCanonicalPlayer;
var prepareCanonicalPlayerMeshes = __awtsmoosModule_40.prepareCanonicalPlayerMeshes;
var hydrateReadablePlayerMaterials = __awtsmoosModule_116.hydrateReadablePlayerMaterials;

function hydrateMinimalMeadowPlayer(runtime, environment = globalThis, dependencies = {}) {
	if (runtime.canonicalPlayer?.status === 'ready') return Promise.resolve(runtime.canonicalPlayer);
	if (runtime.canonicalPlayerPromise) return runtime.canonicalPlayerPromise;
	runtime.canonicalPlayerPromise = loadCanonicalPlayer(runtime, environment, dependencies);
	return runtime.canonicalPlayerPromise;
}


__exports.hydrateMinimalMeadowPlayer = hydrateMinimalMeadowPlayer;
async function loadCanonicalPlayer(runtime, environment, dependencies) {
	announce(environment, { phase: 'starting', progress: 0 });
	const fallbackModel = runtime.model;
	try {
		const loadGltf = dependencies.loadGltf || loadIsolatedGltf;
		const gltf = await loadGltf(PLAYER_MODEL_URL, 'minimal-meadow-player-canonical', {
			onProgress: detail => announce(environment, detail)
		});
		if (runtime.destroyed) return null;
		const prepared = createGroundedCanonicalPlayer(gltf.scene, runtime.state);
		const materials = hydrateReadablePlayerMaterials(prepared.visiblePlayer);
		const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		if (meshCount < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		const animation = installCanonicalPlayer(runtime, fallbackModel, gltf, prepared);
		const evidence = canonicalEvidence(animation, gltf);
		markCanonical(prepared.model, evidence);
		markCanonical(prepared.visiblePlayer, evidence);
		runtime.canonicalPlayer = Object.freeze({
			animations: gltf.animations?.length || 0,
			defaultClip: animation.defaultClip,
			feet: prepared.feet,
			materials,
			meshes: meshCount,
			scale: CANONICAL_PLAYER_SCALE,
			source: PLAYER_MODEL_URL,
			status: 'ready'
		});
		announce(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		fallbackModel.visible = true;
		runtime.model = fallbackModel;
		runtime.canonicalPlayer = fallbackReceipt(error);
		announce(environment, { error: runtime.canonicalPlayer.error, phase: 'fallback', progress: 1 });
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid hydration failed.', error);
		return null;
	}
}

function installCanonicalPlayer(runtime, fallbackModel, gltf, prepared) {
	runtime.scene.add(prepared.model);
	runtime.model = prepared.model;
	runtime.visiblePlayer = prepared.visiblePlayer;
	runtime.canonicalPlayerScene = prepared.visiblePlayer;
	runtime.playerGltf = { ...gltf, scene: prepared.visiblePlayer };
	runtime.feet = prepared.feet;
	runtime.footOffset = 0;
	runtime.state.feet = prepared.feet;
	for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
		if (vessel) vessel.footOffset = 0;
	}
	const animation = installCanonicalChossidAnimation(runtime, gltf, prepared.visiblePlayer);
	runtime.equipment?.bindModel?.(prepared.model);
	fallbackModel.traverse?.(object => { object.visible = false; });
	fallbackModel.parent?.remove?.(fallbackModel);
	return animation;
}

function canonicalEvidence(animation, gltf) {
	return Object.freeze({
		animationCount: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		modelSource: 'chossid.glb',
		measuredAnimatedIdle: Boolean(animation.defaultClip)
	});
}

function markCanonical(model, evidence) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = evidence;
}

function fallbackReceipt(error) {
	return Object.freeze({ error: error?.message || String(error), source: PLAYER_MODEL_URL, status: 'fallback-visible' });
}

function announce(environment, detail) {
	if (!environment.CustomEvent || !environment.dispatchEvent) return;
	environment.dispatchEvent(new environment.CustomEvent('awtsmoos:model-progress', { detail }));
}

__exports.default = hydrateMinimalMeadowPlayer;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/GameplayQuietWindow.js */
__awtsmoosModule_118 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayQuietWindow.js
 * @description Protects early play with an abortable, idle-aware delay that never traps Node tests.
 * The Awtsmoos appoints a calm interval and also its lawful ending; Awtsmoos.com lets enrichment
 * awaken after responsive play while stopped worlds release timer, idle callback, and promise at once.
 */

const DEFAULT_DELAY_MS = 60000;
const IDLE_TIMEOUT_MS = 3000;

function afterGameplayQuietWindow(
	environment = globalThis,
	delayMilliseconds = DEFAULT_DELAY_MS,
	signal = null
) {
	return new Promise(resolve => {
		if (signal?.aborted) {
			resolve(false);
			return;
		}
		const lifecycle = quietWindowLifecycle(environment, resolve, signal);
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout;
		const handle = schedule(
			() => waitForIdle(environment, lifecycle),
			delayMilliseconds
		);
		lifecycle.delayHandle = handle;
		handle?.unref?.();
		if (lifecycle.settled) clearDelayHandle(environment, lifecycle);
	});
}


__exports.afterGameplayQuietWindow = afterGameplayQuietWindow;
function quietWindowLifecycle(environment, resolve, signal) {
	const lifecycle = {
		delayHandle: null,
		idleHandle: null,
		idleKind: null,
		settled: false
	};
	lifecycle.finish = ready => {
		if (lifecycle.settled) return;
		lifecycle.settled = true;
		clearQuietWindow(environment, lifecycle);
		signal?.removeEventListener?.('abort', lifecycle.abort);
		resolve(ready);
	};
	lifecycle.abort = () => lifecycle.finish(false);
	signal?.addEventListener?.('abort', lifecycle.abort, { once: true });
	return lifecycle;
}

function waitForIdle(environment, lifecycle) {
	if (lifecycle.settled) return;
	if (typeof environment.requestIdleCallback === 'function') {
		lifecycle.idleKind = 'idle';
		lifecycle.idleHandle = environment.requestIdleCallback(
			() => lifecycle.finish(true),
			{ timeout: IDLE_TIMEOUT_MS }
		);
		return;
	}
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout;
	lifecycle.idleKind = 'timeout';
	lifecycle.idleHandle = schedule(() => lifecycle.finish(true), 250);
	lifecycle.idleHandle?.unref?.();
}

function clearQuietWindow(environment, lifecycle) {
	clearDelayHandle(environment, lifecycle);
	if (lifecycle.idleHandle == null) return;
	if (lifecycle.idleKind === 'idle') {
		environment.cancelIdleCallback?.(lifecycle.idleHandle);
	} else {
		clearTimer(environment, lifecycle.idleHandle);
	}
	lifecycle.idleHandle = null;
	lifecycle.idleKind = null;
}

function clearDelayHandle(environment, lifecycle) {
	if (lifecycle.delayHandle == null) return;
	clearTimer(environment, lifecycle.delayHandle);
	lifecycle.delayHandle = null;
}

function clearTimer(environment, handle) {
	const clear = environment.clearTimeout?.bind(environment)
		|| globalThis.clearTimeout;
	clear?.(handle);
}

function gameplayQuietWindowPolicy() {
	return Object.freeze({
		delayMilliseconds: DEFAULT_DELAY_MS,
		idleTimeoutMilliseconds: IDLE_TIMEOUT_MS
	});
}

__exports.gameplayQuietWindowPolicy = gameplayQuietWindowPolicy;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowRendererEnhancement.js */
__awtsmoosModule_117 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRendererEnhancement.js
 * @description Enhances the bootstrap renderer after the protected gameplay quiet window.
 * The Awtsmoos lets first control remain light before full renderer quality settles;
 * Awtsmoos.com preserves one promise, one idle gate, normalized readiness, and exact failure evidence.
 */

var afterGameplayQuietWindow = __awtsmoosModule_118.afterGameplayQuietWindow;

const OPTIONAL_RENDERER_DELAY_MS = 60000;

async function enhanceMinimalMeadowRenderer(
	runtime,
	environment = globalThis
) {
	if (runtime.rendererEnhancementPromise) {
		return runtime.rendererEnhancementPromise;
	}
	runtime.rendererEnhancementPromise = enhance(runtime, environment);
	return runtime.rendererEnhancementPromise;
}


__exports.enhanceMinimalMeadowRenderer = enhanceMinimalMeadowRenderer;
async function enhance(runtime, environment) {
	const ready = await afterGameplayQuietWindow(
		environment,
		OPTIONAL_RENDERER_DELAY_MS
	);
	if (!ready || runtime.destroyed) {
		return Object.freeze({ ready: false, reason: 'RUNTIME_DESTROYED' });
	}
	const renderer = runtime.renderer;
	if (typeof renderer?.hydrate !== 'function') {
		renderer.hydrationState = 'ready';
		return Object.freeze({
			alreadyReady: true,
			ready: true,
			state: renderer.hydrationState
		});
	}
	try {
		const receipt = await renderer.hydrate();
		renderer.hydrationState = 'ready';
		runtime.rendererHydrationReceipt = receipt;
		return Object.freeze({
			ready: true,
			receipt,
			state: renderer.hydrationState
		});
	} catch (error) {
		renderer.hydrationState = 'failed';
		runtime.rendererHydrationError = Object.freeze({
			message: error?.message || String(error),
			name: error?.name || 'Error'
		});
		throw error;
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryRarity.js */
__awtsmoosModule_128 = (() => {
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
__awtsmoosModule_129 = (() => {
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
__awtsmoosModule_127 = (() => {
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

var inventoryRarity = __awtsmoosModule_128.inventoryRarity;
var spiritualStats = __awtsmoosModule_129.spiritualStats;

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
__awtsmoosModule_126 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_130 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_131 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_132 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_133 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_134 = (() => {
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

var inventoryItem = __awtsmoosModule_127.inventoryItem;

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
__awtsmoosModule_125 = (() => {
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

var GARMENT_CATALOG = __awtsmoosModule_126.GARMENT_CATALOG;
var GARMENT_ITEM_IDS = __awtsmoosModule_126.GARMENT_ITEM_IDS;
var HEALING_AMULET_CATALOG = __awtsmoosModule_130.HEALING_AMULET_CATALOG;
var INVENTORY_CONSUMABLE_CATALOG = __awtsmoosModule_131.INVENTORY_CONSUMABLE_CATALOG;
var STARTER_CONSUMABLES = __awtsmoosModule_131.STARTER_CONSUMABLES;
var INVENTORY_CORE_CATALOG = __awtsmoosModule_132.INVENTORY_CORE_CATALOG;
var INVENTORY_MATERIAL_CATALOG = __awtsmoosModule_133.INVENTORY_MATERIAL_CATALOG;
var INVENTORY_REWARD_CATALOG = __awtsmoosModule_134.INVENTORY_REWARD_CATALOG;

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
__awtsmoosModule_124 = (() => {
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

var inventoryDefinition = __awtsmoosModule_125.inventoryDefinition;

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
__awtsmoosModule_135 = (() => {
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

var INVENTORY_CATALOG = __awtsmoosModule_125.INVENTORY_CATALOG;
var inventoryAppearanceFor = __awtsmoosModule_124.inventoryAppearanceFor;
var addSpiritualStats = __awtsmoosModule_129.addSpiritualStats;
var emptySpiritualStats = __awtsmoosModule_129.emptySpiritualStats;

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
__awtsmoosModule_136 = (() => {
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

var REQUIRED_GARMENT_EQUIPMENT = __awtsmoosModule_126.REQUIRED_GARMENT_EQUIPMENT;
var STARTER_INVENTORY = __awtsmoosModule_125.STARTER_INVENTORY;
var inventoryDefinition = __awtsmoosModule_125.inventoryDefinition;
var addInventoryItem = __awtsmoosModule_135.addInventoryItem;
var inventoryItemQuantity = __awtsmoosModule_135.inventoryItemQuantity;
var normalizeInventoryQuantity = __awtsmoosModule_135.normalizeInventoryQuantity;
var removeInventoryItem = __awtsmoosModule_135.removeInventoryItem;

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
__awtsmoosModule_123 = (() => {
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

var cycleInventoryAppearance = __awtsmoosModule_124.cycleInventoryAppearance;
var setInventoryAppearance = __awtsmoosModule_124.setInventoryAppearance;
var removeInventoryItem = __awtsmoosModule_135.removeInventoryItem;
var inventoryAdditionDraft = __awtsmoosModule_136.inventoryAdditionDraft;
var inventoryPurchaseDraft = __awtsmoosModule_136.inventoryPurchaseDraft;
var reconciledInventoryEquipment = __awtsmoosModule_136.reconciledInventoryEquipment;
var requireInventoryItem = __awtsmoosModule_136.requireInventoryItem;

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
__awtsmoosModule_139 = (() => {
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
__awtsmoosModule_138 = (() => {
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

var torahPassage = __awtsmoosModule_139.torahPassage;
var togglePinnedValue = __awtsmoosModule_135.togglePinnedValue;

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
__awtsmoosModule_140 = (() => {
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

var restoreInventoryAppearance = __awtsmoosModule_124.restoreInventoryAppearance;
var inventoryDefinition = __awtsmoosModule_125.inventoryDefinition;
var addInventoryItem = __awtsmoosModule_135.addInventoryItem;
var reconciledInventoryEquipment = __awtsmoosModule_136.reconciledInventoryEquipment;
var torahBook = __awtsmoosModule_139.torahBook;
var torahPassage = __awtsmoosModule_139.torahPassage;

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
__awtsmoosModule_137 = (() => {
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

var learnInventoryPassage = __awtsmoosModule_138.learnInventoryPassage;
var markInventoryPassageUsed = __awtsmoosModule_138.markInventoryPassageUsed;
var toggleInventoryBook = __awtsmoosModule_138.toggleInventoryBook;
var toggleInventoryPassage = __awtsmoosModule_138.toggleInventoryPassage;
var restoreInventoryState = __awtsmoosModule_140.restoreInventoryState;
var serializableInventoryState = __awtsmoosModule_140.serializableInventoryState;
var inventoryItemQuantity = __awtsmoosModule_135.inventoryItemQuantity;
var inventorySnapshot = __awtsmoosModule_135.inventorySnapshot;
var reconciledInventoryEquipment = __awtsmoosModule_136.reconciledInventoryEquipment;

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
__awtsmoosModule_141 = (() => {
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

var inventorySnapshot = __awtsmoosModule_135.inventorySnapshot;

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
__awtsmoosModule_122 = (() => {
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

var addInventoryEntries = __awtsmoosModule_123.addInventoryEntries;
var buyInventoryEntry = __awtsmoosModule_123.buyInventoryEntry;
var cycleInventoryItemAppearance = __awtsmoosModule_123.cycleInventoryItemAppearance;
var equipInventoryItem = __awtsmoosModule_123.equipInventoryItem;
var removeInventoryEntry = __awtsmoosModule_123.removeInventoryEntry;
var setInventoryItemAppearance = __awtsmoosModule_123.setInventoryItemAppearance;
var unequipInventorySlot = __awtsmoosModule_123.unequipInventorySlot;
var inventoryStoreOwns = __awtsmoosModule_137.inventoryStoreOwns;
var inventoryStoreQuantity = __awtsmoosModule_137.inventoryStoreQuantity;
var learnInventory = __awtsmoosModule_137.learnInventory;
var markInventoryPassage = __awtsmoosModule_137.markInventoryPassage;
var reconcileInventoryStoreEquipment = __awtsmoosModule_137.reconcileInventoryStoreEquipment;
var restoreInventoryStore = __awtsmoosModule_137.restoreInventoryStore;
var serializableInventoryStore = __awtsmoosModule_137.serializableInventoryStore;
var snapshotInventoryStore = __awtsmoosModule_137.snapshotInventoryStore;
var toggleInventoryBookPin = __awtsmoosModule_137.toggleInventoryBookPin;
var toggleInventoryPassagePin = __awtsmoosModule_137.toggleInventoryPassagePin;
var publishInventoryStore = __awtsmoosModule_141.publishInventoryStore;
var subscribeInventoryStore = __awtsmoosModule_141.subscribeInventoryStore;
var initialInventoryState = __awtsmoosModule_136.initialInventoryState;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionConstants.js */
__awtsmoosModule_146 = (() => {
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
__awtsmoosModule_145 = (() => {
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

var PLAYER_ACTION_BONE_ROLES = __awtsmoosModule_146.PLAYER_ACTION_BONE_ROLES;
var PLAYER_ACTION_LAYERS = __awtsmoosModule_146.PLAYER_ACTION_LAYERS;

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
__awtsmoosModule_144 = (() => {
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

var validatePlayerActionDefinition = __awtsmoosModule_145.validatePlayerActionDefinition;

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
__awtsmoosModule_147 = (() => {
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

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_146.PLAYER_ACTION_MESSAGES;

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
__awtsmoosModule_148 = (() => {
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

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_146.PLAYER_ACTION_MESSAGES;

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
__awtsmoosModule_143 = (() => {
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

var PlayerActionRegistry = __awtsmoosModule_144.PlayerActionRegistry;
var STAFF_CAST_ACTION = __awtsmoosModule_147.STAFF_CAST_ACTION;
var SWORD_CAST_ACTION = __awtsmoosModule_148.SWORD_CAST_ACTION;

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
__awtsmoosModule_151 = (() => {
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
__awtsmoosModule_150 = (() => {
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

var ROLES = __awtsmoosModule_151.MINIMAL_MEADOW_BONE_ROLES;

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
__awtsmoosModule_152 = (() => {
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
__awtsmoosModule_149 = (() => {
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

var applyMinimalMeadowEuler = __awtsmoosModule_150.applyMinimalMeadowEuler;
var resolvePlayerActionBones = __awtsmoosModule_152.resolvePlayerActionBones;

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
__awtsmoosModule_153 = (() => {
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

var PLAYER_ACTION_MESSAGES = __awtsmoosModule_146.PLAYER_ACTION_MESSAGES;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionRuntimeState.js */
__awtsmoosModule_156 = (() => {
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
__awtsmoosModule_155 = (() => {
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

var playerActionStateSnapshot = __awtsmoosModule_156.playerActionStateSnapshot;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionBodyMaskMath.js */
__awtsmoosModule_159 = (() => {
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
__awtsmoosModule_158 = (() => {
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

var constrainedPlayerActionEuler = __awtsmoosModule_159.constrainedPlayerActionEuler;
var playerActionQuaternionDistanceSquared = __awtsmoosModule_159.playerActionQuaternionDistanceSquared;
var setPlayerActionQuaternionFromEuler = __awtsmoosModule_159.setPlayerActionQuaternionFromEuler;

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
__awtsmoosModule_157 = (() => {
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

var applyPlayerActionBodyMask = __awtsmoosModule_158.applyPlayerActionBodyMask;
var capturePlayerActionBasePose = __awtsmoosModule_158.capturePlayerActionBasePose;
var playerActionPoseMatches = __awtsmoosModule_158.playerActionPoseMatches;
var recordPlayerActionPose = __awtsmoosModule_158.recordPlayerActionPose;
var restorePlayerActionBasePose = __awtsmoosModule_158.restorePlayerActionBasePose;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionModelBinding.js */
__awtsmoosModule_154 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionModelBinding.js
 * @description Rebinds action authority when fallback or remote Chossid models are replaced.
 * The Awtsmoos creates each actor beyond one temporary garment; Awtsmoos.com restores old bones,
 * releases interrupted gestures, and lets the hydrated model receive a fresh upper-body vessel.
 */

var playerActionResultRecord = __awtsmoosModule_155.playerActionResultRecord;
var PlayerActionBodyMaskRuntime = __awtsmoosModule_157.PlayerActionBodyMaskRuntime;

/** Replaces the actor model without carrying old bone references or overlay state forward. */
function bindPlayerActionModel(runtime, model) {
	const interruptedActionId = runtime.active?.definition?.id || null;
	runtime.composition.restore();
	runtime.active = null;
	const diagnostics = runtime.actor.bindModel(model);
	runtime.composition = new PlayerActionBodyMaskRuntime(runtime.actor);
	if (interruptedActionId) {
		runtime.lastResult = playerActionResultRecord(
			interruptedActionId,
			'cancelled',
			'model-rebound'
		);
	}
	runtime.publish();
	return {
		...diagnostics,
		interruptedActionId,
		rebound: true
	};
}

__exports.bindPlayerActionModel = bindPlayerActionModel;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/playerActions/PlayerActionPoseSampler.js */
__awtsmoosModule_161 = (() => {
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
__awtsmoosModule_162 = (() => {
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

var PLAYER_ACTION_PHASES = __awtsmoosModule_146.PLAYER_ACTION_PHASES;
var boundedPlayerActionProgress = __awtsmoosModule_156.boundedPlayerActionProgress;
var createPlayerActionState = __awtsmoosModule_156.createPlayerActionState;

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
__awtsmoosModule_160 = (() => {
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

var PlayerActionBodyMaskRuntime = __awtsmoosModule_157.PlayerActionBodyMaskRuntime;
var emitPlayerActionRelease = __awtsmoosModule_155.emitPlayerActionRelease;
var playerActionResultRecord = __awtsmoosModule_155.playerActionResultRecord;
var playerActionRuntimeSnapshot = __awtsmoosModule_155.playerActionRuntimeSnapshot;
var PlayerActionPoseSampler = __awtsmoosModule_161.PlayerActionPoseSampler;
var dispatchPlayerAction = __awtsmoosModule_162.dispatchPlayerAction;
var advancePlayerActionState = __awtsmoosModule_156.advancePlayerActionState;
var beginPlayerActionRecovery = __awtsmoosModule_156.beginPlayerActionRecovery;

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
__awtsmoosModule_142 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionSystem.js
 * @description Installs an actor-neutral registry, runtime, model binding, and message bridge.
 * The Awtsmoos joins model and deed without replacing either; Awtsmoos.com exposes narrow
 * APIs for the player, fallback hydration, remote Chossids, and future independent actions.
 */

var createBuiltInPlayerActionRegistry = __awtsmoosModule_143.createBuiltInPlayerActionRegistry;
var PlayerActionActor = __awtsmoosModule_149.PlayerActionActor;
var PlayerActionMessageBridge = __awtsmoosModule_153.PlayerActionMessageBridge;
var bindPlayerActionModel = __awtsmoosModule_154.bindPlayerActionModel;
var PlayerActionRuntime = __awtsmoosModule_160.PlayerActionRuntime;

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
		bindModel: model => bindPlayerActionModel(runtime, model),
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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/ui/AwtsmoosEventBus.js */
__awtsmoosModule_163 = (() => {
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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAnimationClipPolicy.js */
__awtsmoosModule_164 = (() => {
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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowAttachmentRegistrySupport.js */
__awtsmoosModule_167 = (() => {
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
__awtsmoosModule_170 = (() => {
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
__awtsmoosModule_169 = (() => {
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

var Group = __awtsmoosModule_7.Group;
var applyMinimalMeadowPose = __awtsmoosModule_170.applyMinimalMeadowPose;
var minimalMeadowAnchorPose = __awtsmoosModule_170.minimalMeadowAnchorPose;

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
__awtsmoosModule_168 = (() => {
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

var resolveMinimalMeadowWeaponAnchor = __awtsmoosModule_169.resolveMinimalMeadowWeaponAnchor;
var applyMinimalMeadowPose = __awtsmoosModule_170.applyMinimalMeadowPose;
var minimalMeadowWeaponPose = __awtsmoosModule_170.minimalMeadowWeaponPose;

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
__awtsmoosModule_166 = (() => {
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

var countMinimalMeadowNamedNodes = __awtsmoosModule_167.countMinimalMeadowNamedNodes;
var minimalMeadowAttachmentIsDescendant = __awtsmoosModule_167.minimalMeadowAttachmentIsDescendant;
var attachMinimalWeapon = __awtsmoosModule_168.attachMinimalWeapon;
var detachMinimalWeapon = __awtsmoosModule_168.detachMinimalWeapon;
var MINIMAL_MEADOW_WEAPON_ANCHOR_NAME = __awtsmoosModule_169.MINIMAL_MEADOW_WEAPON_ANCHOR_NAME;
var resolveMinimalMeadowWeaponAnchor = __awtsmoosModule_169.resolveMinimalMeadowWeaponAnchor;

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
__awtsmoosModule_174 = (() => {
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
__awtsmoosModule_173 = (() => {
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

var EQUIPMENT_STAT_KEYS = __awtsmoosModule_174.EQUIPMENT_STAT_KEYS;

const DERIVED_STAT_KEYS = EQUIPMENT_STAT_KEYS;
__exports.DERIVED_STAT_KEYS = DERIVED_STAT_KEYS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/stats/DerivedStatProjector.js */
__awtsmoosModule_172 = (() => {
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

var DERIVED_STAT_KEYS = __awtsmoosModule_173.DERIVED_STAT_KEYS;

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
__awtsmoosModule_178 = (() => {
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
__awtsmoosModule_179 = (() => {
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
__awtsmoosModule_177 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentStatModifierCatalog.js
 * @description Generated readable equipment truth. Source SHA-256: e2138cbd55e34f510ac5a39c2f7707d5cbb618e45224249731155c925cb910df.
 * The Awtsmoos renews one source through client and server; Awtsmoos.com keeps parity whole.
 */

var COMBAT_EQUIPMENT_STATS = __awtsmoosModule_178.COMBAT_EQUIPMENT_STATS;
var GARMENT_EQUIPMENT_STATS = __awtsmoosModule_179.GARMENT_EQUIPMENT_STATS;
__exports.EQUIPMENT_STAT_KEYS = __awtsmoosModule_174.EQUIPMENT_STAT_KEYS;

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
__awtsmoosModule_176 = (() => {
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

var equipmentStatRecord = __awtsmoosModule_177.equipmentStatRecord;

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
__awtsmoosModule_175 = (() => {
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

var equipmentDerivedStatSources = __awtsmoosModule_176.equipmentDerivedStatSources;

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
__awtsmoosModule_180 = (() => {
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
__awtsmoosModule_171 = (() => {
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

var projectDerivedStats = __awtsmoosModule_172.projectDerivedStats;
var runtimeDerivedStatSources = __awtsmoosModule_175.runtimeDerivedStatSources;
var applyMinimalMeadowDerivedStats = __awtsmoosModule_180.applyMinimalMeadowDerivedStats;

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
__awtsmoosModule_182 = (() => {
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

var Vector3 = __awtsmoosModule_7.Vector3;
var applyAnchorTransform = __awtsmoosModule_169.applyAnchorTransform;

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
__awtsmoosModule_181 = (() => {
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

var aimMinimalMeadowWeapon = __awtsmoosModule_182.aimMinimalMeadowWeapon;
var restoreMinimalMeadowWeaponAim = __awtsmoosModule_182.restoreMinimalMeadowWeaponAim;

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
__awtsmoosModule_184 = (() => {
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
__awtsmoosModule_185 = (() => {
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
__awtsmoosModule_183 = (() => {
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

var garmentColor = __awtsmoosModule_184.garmentColor;
var garmentFabric = __awtsmoosModule_184.garmentFabric;
var inventoryAppearanceFor = __awtsmoosModule_124.inventoryAppearanceFor;
var inventoryDefinition = __awtsmoosModule_125.inventoryDefinition;
var garmentFabricTexture = __awtsmoosModule_185.garmentFabricTexture;

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
__awtsmoosModule_188 = (() => {
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

var MeshStandardMaterial = __awtsmoosModule_7.MeshStandardMaterial;

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
__awtsmoosModule_187 = (() => {
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
var collectMinimalGarmentMaterials = __awtsmoosModule_188.collectMinimalGarmentMaterials;
var isolateMinimalGarmentMaterials = __awtsmoosModule_188.isolateMinimalGarmentMaterials;
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
__awtsmoosModule_186 = (() => {
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

var discoverMinimalMeadowGarments = __awtsmoosModule_187.discoverMinimalMeadowGarments;

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
__awtsmoosModule_189 = (() => {
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
/* B\"H compact source: libs/awtsmoos-procedural/src/math/rng.js */
__awtsmoosModule_196 = (() => {
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
__awtsmoosModule_198 = (() => {
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
__awtsmoosModule_199 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_198.WHITE;
var mesh = __awtsmoosModule_198.mesh;

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
__awtsmoosModule_200 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_198.WHITE;
var mesh = __awtsmoosModule_198.mesh;
var onPlane = __awtsmoosModule_198.onPlane;
var safeSegments = __awtsmoosModule_198.safeSegments;

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
__awtsmoosModule_201 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_198.WHITE;
var mesh = __awtsmoosModule_198.mesh;
var safeSegments = __awtsmoosModule_198.safeSegments;

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
__awtsmoosModule_202 = (() => {
const __exports = {};
// B"H
var WHITE = __awtsmoosModule_198.WHITE;
var mesh = __awtsmoosModule_198.mesh;

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
__awtsmoosModule_197 = (() => {
const __exports = {};
// B"H
__exports.WHITE = __awtsmoosModule_198.WHITE;
__exports.mesh = __awtsmoosModule_198.mesh;
__exports.onPlane = __awtsmoosModule_198.onPlane;
__exports.safeSegments = __awtsmoosModule_198.safeSegments;
__exports.cubeMesh = __awtsmoosModule_199.cubeMesh;
__exports.discMesh = __awtsmoosModule_200.discMesh;
__exports.planeMesh = __awtsmoosModule_200.planeMesh;
__exports.ringMesh = __awtsmoosModule_200.ringMesh;
__exports.cylinderMesh = __awtsmoosModule_201.cylinderMesh;
__exports.sphereMesh = __awtsmoosModule_201.sphereMesh;
__exports.starMesh = __awtsmoosModule_202.starMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/transform.js */
__awtsmoosModule_205 = (() => {
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
__awtsmoosModule_207 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_197.cubeMesh;
var transformMesh = __awtsmoosModule_205.transformMesh;

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
__awtsmoosModule_206 = (() => {
const __exports = {};
// B"H
var mergeMeshes = __awtsmoosModule_205.mergeMeshes;
var bar = __awtsmoosModule_207.bar;

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
__awtsmoosModule_208 = (() => {
const __exports = {};
// B"H
var cylinderMesh = __awtsmoosModule_197.cylinderMesh;
var sphereMesh = __awtsmoosModule_197.sphereMesh;
var mergeMeshes = __awtsmoosModule_205.mergeMeshes;
var transformMesh = __awtsmoosModule_205.transformMesh;

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
__awtsmoosModule_209 = (() => {
const __exports = {};
// B"H
var ringMesh = __awtsmoosModule_197.ringMesh;
var mergeMeshes = __awtsmoosModule_205.mergeMeshes;
var transformMesh = __awtsmoosModule_205.transformMesh;
var bar = __awtsmoosModule_207.bar;

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
__awtsmoosModule_204 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_197.cubeMesh;
var cylinderMesh = __awtsmoosModule_197.cylinderMesh;
var discMesh = __awtsmoosModule_197.discMesh;
var planeMesh = __awtsmoosModule_197.planeMesh;
var ringMesh = __awtsmoosModule_197.ringMesh;
var sphereMesh = __awtsmoosModule_197.sphereMesh;
var starMesh = __awtsmoosModule_197.starMesh;
var transformMesh = __awtsmoosModule_205.transformMesh;
var letterMesh = __awtsmoosModule_206.letterMesh;
var cloudMesh = __awtsmoosModule_208.cloudMesh;
var treeMesh = __awtsmoosModule_208.treeMesh;
var archMesh = __awtsmoosModule_209.archMesh;
var gateMesh = __awtsmoosModule_209.gateMesh;

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
__awtsmoosModule_203 = (() => {
const __exports = {};
// B"H
__exports.catalogMesh = __awtsmoosModule_204.catalogMesh;
__exports.catalogNames = __awtsmoosModule_204.catalogNames;
__exports.letterMesh = __awtsmoosModule_206.letterMesh;
__exports.cloudMesh = __awtsmoosModule_208.cloudMesh;
__exports.treeMesh = __awtsmoosModule_208.treeMesh;
__exports.archMesh = __awtsmoosModule_209.archMesh;
__exports.gateMesh = __awtsmoosModule_209.gateMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural/src/mesh/repair.js */
__awtsmoosModule_210 = (() => {
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
__awtsmoosModule_212 = (() => {
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
__awtsmoosModule_211 = (() => {
const __exports = {};
// B"H
var cross = __awtsmoosModule_212.cross;
var normalize = __awtsmoosModule_212.normalize;
var sub = __awtsmoosModule_212.sub;

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
__awtsmoosModule_213 = (() => {
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
__awtsmoosModule_214 = (() => {
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
__awtsmoosModule_217 = (() => {
const __exports = {};
// B"H
var cubeMesh = __awtsmoosModule_197.cubeMesh;
var cylinderMesh = __awtsmoosModule_197.cylinderMesh;
var ringMesh = __awtsmoosModule_197.ringMesh;
var sphereMesh = __awtsmoosModule_197.sphereMesh;
var starMesh = __awtsmoosModule_197.starMesh;
var mergeMeshes = __awtsmoosModule_205.mergeMeshes;
var recolorMesh = __awtsmoosModule_205.recolorMesh;
var transformMesh = __awtsmoosModule_205.transformMesh;

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
__awtsmoosModule_218 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_196.createRng;

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
__awtsmoosModule_219 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var column = __awtsmoosModule_217.column;
var gridPositions = __awtsmoosModule_217.gridPositions;

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
__awtsmoosModule_216 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var column = __awtsmoosModule_217.column;
var cylinder = __awtsmoosModule_217.cylinder;
var placed = __awtsmoosModule_217.placed;
var sphere = __awtsmoosModule_217.sphere;
var star = __awtsmoosModule_217.star;
var modelPalette = __awtsmoosModule_218.modelPalette;
var facadeMesh = __awtsmoosModule_219.facadeMesh;
var steppedRoof = __awtsmoosModule_219.steppedRoof;

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
__awtsmoosModule_221 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var modelPalette = __awtsmoosModule_218.modelPalette;

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
__awtsmoosModule_220 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var placed = __awtsmoosModule_217.placed;
var modelPalette = __awtsmoosModule_218.modelPalette;
var storefrontSignMesh = __awtsmoosModule_221.storefrontSignMesh;
var facadeMesh = __awtsmoosModule_219.facadeMesh;
var steppedRoof = __awtsmoosModule_219.steppedRoof;

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
__awtsmoosModule_223 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var cylinder = __awtsmoosModule_217.cylinder;

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
__awtsmoosModule_222 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var sphere = __awtsmoosModule_217.sphere;
var modelPalette = __awtsmoosModule_218.modelPalette;
var blade = __awtsmoosModule_223.blade;
var broadLeaf = __awtsmoosModule_223.broadLeaf;
var petalRing = __awtsmoosModule_223.petalRing;
var roundedCluster = __awtsmoosModule_223.roundedCluster;
var stem = __awtsmoosModule_223.stem;

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
__awtsmoosModule_224 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var sphere = __awtsmoosModule_217.sphere;
var modelPalette = __awtsmoosModule_218.modelPalette;
var blade = __awtsmoosModule_223.blade;
var broadLeaf = __awtsmoosModule_223.broadLeaf;
var branch = __awtsmoosModule_223.branch;
var roundedCluster = __awtsmoosModule_223.roundedCluster;
var stem = __awtsmoosModule_223.stem;

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
__awtsmoosModule_225 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var cylinder = __awtsmoosModule_217.cylinder;
var modelPalette = __awtsmoosModule_218.modelPalette;
var branch = __awtsmoosModule_223.branch;
var roundedCluster = __awtsmoosModule_223.roundedCluster;

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
__awtsmoosModule_226 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_196.createRng;
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var cylinder = __awtsmoosModule_217.cylinder;
var sphere = __awtsmoosModule_217.sphere;
var star = __awtsmoosModule_217.star;
var modelPalette = __awtsmoosModule_218.modelPalette;

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
__awtsmoosModule_227 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var cylinder = __awtsmoosModule_217.cylinder;
var placed = __awtsmoosModule_217.placed;
var ring = __awtsmoosModule_217.ring;
var sphere = __awtsmoosModule_217.sphere;
var modelPalette = __awtsmoosModule_218.modelPalette;
var storefrontSignMesh = __awtsmoosModule_221.storefrontSignMesh;
var streetSignMesh = __awtsmoosModule_221.streetSignMesh;

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
__awtsmoosModule_229 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var wheel = __awtsmoosModule_217.wheel;

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
__awtsmoosModule_228 = (() => {
const __exports = {};
// B"H
var assemble = __awtsmoosModule_217.assemble;
var box = __awtsmoosModule_217.box;
var placed = __awtsmoosModule_217.placed;
var modelPalette = __awtsmoosModule_218.modelPalette;
var storefrontSignMesh = __awtsmoosModule_221.storefrontSignMesh;
var vehicleBody = __awtsmoosModule_229.vehicleBody;
var wheelSet = __awtsmoosModule_229.wheelSet;
var windowBand = __awtsmoosModule_229.windowBand;

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
__awtsmoosModule_215 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He
var palaceMesh = __awtsmoosModule_216.palaceMesh;
var studyHallMesh = __awtsmoosModule_216.studyHallMesh;
var towerMesh = __awtsmoosModule_216.towerMesh;
var shopMesh = __awtsmoosModule_220.shopMesh;
var townhouseMesh = __awtsmoosModule_220.townhouseMesh;
var compositeFlowerMesh = __awtsmoosModule_222.compositeFlowerMesh;
var flowerSpikeMesh = __awtsmoosModule_222.flowerSpikeMesh;
var irisClumpMesh = __awtsmoosModule_222.irisClumpMesh;
var roseBushMesh = __awtsmoosModule_222.roseBushMesh;
var fernClumpMesh = __awtsmoosModule_224.fernClumpMesh;
var grassClumpMesh = __awtsmoosModule_224.grassClumpMesh;
var hostaClumpMesh = __awtsmoosModule_224.hostaClumpMesh;
var panicleShrubMesh = __awtsmoosModule_224.panicleShrubMesh;
var broadleafTreeMesh = __awtsmoosModule_225.broadleafTreeMesh;
var cypressTreeMesh = __awtsmoosModule_225.cypressTreeMesh;
var floweringTreeMesh = __awtsmoosModule_225.floweringTreeMesh;
var oliveTreeMesh = __awtsmoosModule_225.oliveTreeMesh;
var pineTreeMesh = __awtsmoosModule_225.pineTreeMesh;
var willowTreeMesh = __awtsmoosModule_225.willowTreeMesh;
var hedgeMesh = __awtsmoosModule_226.hedgeMesh;
var monumentMesh = __awtsmoosModule_226.monumentMesh;
var planterMesh = __awtsmoosModule_226.planterMesh;
var treeModelMesh = __awtsmoosModule_226.treeModelMesh;
var bollardMesh = __awtsmoosModule_227.bollardMesh;
var benchMesh = __awtsmoosModule_227.benchMesh;
var fountainMesh = __awtsmoosModule_227.fountainMesh;
var kioskMesh = __awtsmoosModule_227.kioskMesh;
var streetLampMesh = __awtsmoosModule_227.streetLampMesh;
var streetSignModel = __awtsmoosModule_227.streetSignModel;
var busMesh = __awtsmoosModule_228.busMesh;
var carMesh = __awtsmoosModule_228.carMesh;
var marketCartMesh = __awtsmoosModule_228.marketCartMesh;
var taxiMesh = __awtsmoosModule_228.taxiMesh;
var truckMesh = __awtsmoosModule_228.truckMesh;
var vanMesh = __awtsmoosModule_228.vanMesh;

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
__awtsmoosModule_230 = (() => {
const __exports = {};
// B"H
var modelMesh = __awtsmoosModule_215.modelMesh;
var transformMesh = __awtsmoosModule_205.transformMesh;

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
__awtsmoosModule_231 = (() => {
const __exports = {};
// B"H
var createRng = __awtsmoosModule_196.createRng;
var range = __awtsmoosModule_196.range;
var transformMesh = __awtsmoosModule_205.transformMesh;
var modelMesh = __awtsmoosModule_215.modelMesh;

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
__awtsmoosModule_232 = (() => {
const __exports = {};
var cubeMesh = __awtsmoosModule_197.cubeMesh;
var validateMesh = __awtsmoosModule_214.validateMesh;
var summarizeMesh = __awtsmoosModule_213.summarizeMesh;

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
__awtsmoosModule_195 = (() => {
const __exports = {};
// B"H
__exports.createRng = __awtsmoosModule_196.createRng;
__exports.hashSeed = __awtsmoosModule_196.hashSeed;
__exports.range = __awtsmoosModule_196.range;
__exports.cubeMesh = __awtsmoosModule_197.cubeMesh;
__exports.cylinderMesh = __awtsmoosModule_197.cylinderMesh;
__exports.discMesh = __awtsmoosModule_197.discMesh;
__exports.mesh = __awtsmoosModule_197.mesh;
__exports.planeMesh = __awtsmoosModule_197.planeMesh;
__exports.ringMesh = __awtsmoosModule_197.ringMesh;
__exports.sphereMesh = __awtsmoosModule_197.sphereMesh;
__exports.starMesh = __awtsmoosModule_197.starMesh;
__exports.catalogMesh = __awtsmoosModule_203.catalogMesh;
__exports.catalogNames = __awtsmoosModule_203.catalogNames;
__exports.compactFiniteMesh = __awtsmoosModule_210.compactFiniteMesh;
__exports.cloneMesh = __awtsmoosModule_205.cloneMesh;
__exports.mergeMeshes = __awtsmoosModule_205.mergeMeshes;
__exports.recolorMesh = __awtsmoosModule_205.recolorMesh;
__exports.transformMesh = __awtsmoosModule_205.transformMesh;
__exports.meshToTriangles = __awtsmoosModule_211.meshToTriangles;
__exports.TRIANGLE_STRIDE = __awtsmoosModule_211.TRIANGLE_STRIDE;
__exports.triangleStats = __awtsmoosModule_211.triangleStats;
__exports.summarizeMesh = __awtsmoosModule_213.summarizeMesh;
__exports.validateMesh = __awtsmoosModule_214.validateMesh;
__exports.modelMesh = __awtsmoosModule_215.modelMesh;
__exports.modelNames = __awtsmoosModule_215.modelNames;
__exports.hasModel = __awtsmoosModule_215.hasModel;
__exports.modelPalette = __awtsmoosModule_218.modelPalette;
__exports.buildingMesh = __awtsmoosModule_230.buildingMesh;
__exports.clamp = __awtsmoosModule_230.clamp;
__exports.cityChunkMeshes = __awtsmoosModule_231.cityChunkMeshes;
__exports.makeGoldenProbe = __awtsmoosModule_232.makeGoldenProbe;
__exports.inspectMesh = __awtsmoosModule_232.inspectMesh;
return Object.freeze(__exports);
})();
/* B\"H compact source: libs/awtsmoos-procedural-core/src/core/geometry/csg/bsp/node.js */
__awtsmoosModule_237 = (() => {
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
__awtsmoosModule_236 = (() => {
const __exports = {};
// B"H
/**
 * @file tree.js
 * @brief The root of spatial knowledge. A BSP Tree implementation.
 */
var Node = __awtsmoosModule_237.Node;

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
__awtsmoosModule_239 = (() => {
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
__awtsmoosModule_240 = (() => {
const __exports = {};
// B"H
/**
 * @file vertex.js
 * @brief A singular point in space.
 */
var Vector3D = __awtsmoosModule_239.Vector3D;

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
__awtsmoosModule_242 = (() => {
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
__awtsmoosModule_241 = (() => {
const __exports = {};
// B"H
/**
 * @file polygon.js
 * @brief A convex boundary of creation.
 */
var Plane = __awtsmoosModule_242.Plane;

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
__awtsmoosModule_238 = (() => {
const __exports = {};
// B"H
/**
 * @file meshUtils.js
 * @brief Translates between CSG Polygons and Structured Mesh Faces.
 *        Infused with Aggressive Quantization and Forced Triangulation to heal the cracks of division.
 */
var Vector3D = __awtsmoosModule_239.Vector3D;
var Vertex = __awtsmoosModule_240.Vertex;
var Polygon = __awtsmoosModule_241.Polygon;

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
__awtsmoosModule_235 = (() => {
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

var Tree = __awtsmoosModule_236.Tree;
var meshToPolygons = __awtsmoosModule_238.meshToPolygons;
var polygonsToMesh = __awtsmoosModule_238.polygonsToMesh;

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
__awtsmoosModule_234 = (() => {
const __exports = {};
// B"H
__exports.CSG = __awtsmoosModule_235.CSG;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayGeometryCache.js */
__awtsmoosModule_243 = (() => {
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
__awtsmoosModule_245 = (() => {
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
__awtsmoosModule_244 = (() => {
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

var projectBooleanDoorwayUv = __awtsmoosModule_245.projectBooleanDoorwayUv;

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
__awtsmoosModule_233 = (() => {
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

var CSG = __awtsmoosModule_234.CSG;
var resolveBooleanDoorwayGeometry = __awtsmoosModule_243.resolveBooleanDoorwayGeometry;
var createClosedCuboidMesh = __awtsmoosModule_244.createClosedCuboidMesh;
var flattenBooleanMesh = __awtsmoosModule_244.flattenBooleanMesh;

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
__awtsmoosModule_194 = (() => {
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

var cubeMesh = __awtsmoosModule_195.cubeMesh;
var sphereMesh = __awtsmoosModule_195.sphereMesh;
var createBooleanDoorwayMesh = __awtsmoosModule_233.createBooleanDoorwayMesh;

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
__awtsmoosModule_246 = (() => {
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

var v = __awtsmoosModule_46.v;

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
__awtsmoosModule_193 = (() => {
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

var createPrimitiveMesh = __awtsmoosModule_194.createPrimitiveMesh;
var manualMesh = __awtsmoosModule_194.manualMesh;
var transformProceduralPositions = __awtsmoosModule_246.transformProceduralPositions;

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
__awtsmoosModule_248 = (() => {
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

var v = __awtsmoosModule_46.v;

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
__awtsmoosModule_247 = (() => {
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

var v = __awtsmoosModule_46.v;
var transformPrimitivePoint = __awtsmoosModule_248.transformPrimitivePoint;

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
__awtsmoosModule_249 = (() => {
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

var v = __awtsmoosModule_46.v;
var transformPrimitivePoint = __awtsmoosModule_248.transformPrimitivePoint;

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
__awtsmoosModule_250 = (() => {
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

var v = __awtsmoosModule_46.v;
var createPrimitiveBoxGeometry = __awtsmoosModule_247.createPrimitiveBoxGeometry;
var transformPrimitivePoint = __awtsmoosModule_248.transformPrimitivePoint;

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
__awtsmoosModule_192 = (() => {
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

var proceduralData = __awtsmoosModule_193.proceduralData;
var createPrimitiveBoxGeometry = __awtsmoosModule_247.createPrimitiveBoxGeometry;
var createPrimitiveDiamondGeometry = __awtsmoosModule_249.createPrimitiveDiamondGeometry;
var createDoorwayFrameGeometry = __awtsmoosModule_250.createDoorwayFrameGeometry;

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
__awtsmoosModule_251 = (() => {
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

var triangleNormal = __awtsmoosModule_46.triangleNormal;
var v = __awtsmoosModule_46.v;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureTransport.js */
__awtsmoosModule_257 = (() => {
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
__awtsmoosModule_256 = (() => {
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

var REMOTE_TEXTURE_ROOT = __awtsmoosModule_257.REMOTE_TEXTURE_ROOT;
var remoteTexturePathUrl = __awtsmoosModule_257.remoteTexturePathUrl;

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
__awtsmoosModule_255 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

var remoteModelUrl = __awtsmoosModule_33.remoteModelUrl;
var publicMaterialUrl = __awtsmoosModule_256.publicMaterialUrl;

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
__awtsmoosModule_259 = (() => {
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

var isTrustedAwtsmoosMaterialUrl = __awtsmoosModule_257.isTrustedAwtsmoosMaterialUrl;

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
__awtsmoosModule_258 = (() => {
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

var assertRemoteMaterialUrl = __awtsmoosModule_259.assertRemoteMaterialUrl;
var FORBIDDEN_MATERIAL_SEGMENTS = __awtsmoosModule_259.FORBIDDEN_MATERIAL_SEGMENTS;

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
__awtsmoosModule_254 = (() => {
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

var exactMaterialUrl = __awtsmoosModule_255.exactMaterialUrl;
var fullMaterialUrl = __awtsmoosModule_255.fullMaterialUrl;
var assertProductionMaterialUrl = __awtsmoosModule_258.assertProductionMaterialUrl;
var productionMaterialFallbacks = __awtsmoosModule_258.productionMaterialFallbacks;

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
__awtsmoosModule_262 = (() => {
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
__awtsmoosModule_261 = (() => {
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

var decodePublicImageBitmap = __awtsmoosModule_262.decodePublicImageBitmap;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageFetchDependencies.js */
__awtsmoosModule_265 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetchDependencies.js
 * @description Normalizes abort, cache, fetch, and clock dependencies for image transport.
 * The Awtsmoos gives every outer vessel one explicit measured shape;
 * Awtsmoos.com keeps browser globals replaceable so tests and recovery can escape.
 */

function createPublicImageAbortController(dependencies = {}) {
	const Controller = Object.hasOwn(dependencies, 'AbortControllerClass')
		? dependencies.AbortControllerClass
		: globalThis.AbortController;
	return Controller ? new Controller() : null;
}


__exports.createPublicImageAbortController = createPublicImageAbortController;
function publicImageCacheOptions(controller, attempt, dependencies = {}) {
	return {
		bypassCircuit: attempt > 0,
		cacheName: dependencies.cacheName,
		cacheStorage: dependencies.cacheStorage,
		circuitCooldownMs: dependencies.circuitCooldownMs,
		fetchFunction: dependencies.fetchFunction,
		now: dependencies.now,
		signal: controller?.signal
	};
}


__exports.publicImageCacheOptions = publicImageCacheOptions;
function publicImageNetworkRequestOptions(options = {}) {
	return {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal: options.signal
	};
}


__exports.publicImageNetworkRequestOptions = publicImageNetworkRequestOptions;
function publicImageCacheStorage(options = {}) {
	return Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
}

__exports.publicImageCacheStorage = publicImageCacheStorage;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageResponseClone.js */
__awtsmoosModule_267 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseClone.js
 * @description Clones browser Responses while accepting immutable Response-like adapters.
 * The Awtsmoos gives each consumer its own stream where streams can divide;
 * Awtsmoos.com also welcomes simple test vessels whose bodies already safely abide.
 */

function clonePublicImageResponse(response) {
	if (typeof response?.clone === 'function') return response.clone();
	return response;
}

__exports.clonePublicImageResponse = clonePublicImageResponse;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageRetryPolicy.js */
__awtsmoosModule_268 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageRetryPolicy.js
 * @description Bounds remote-image retries while honoring server rate-limit guidance.
 * The Awtsmoos renews each distant color without a frantic repeated plea;
 * Awtsmoos.com hears Retry-After, pauses with measure, and keeps the visible world free.
 */

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 1500;
const DEFAULT_CIRCUIT_MS = 5000;
const MAX_CIRCUIT_MS = 30000;

function isRetryableImageStatus(status) {
	return RETRYABLE_STATUSES.has(Number(status));
}


__exports.isRetryableImageStatus = isRetryableImageStatus;
function imageRetryDelayMs(response, attempt = 0, options = {}) {
	const headerDelay = retryAfterHeaderMs(response, options);
	const baseDelay = finiteNumber(options.baseDelayMs, DEFAULT_BASE_DELAY_MS);
	const maximum = finiteNumber(options.maxDelayMs, DEFAULT_MAX_DELAY_MS);
	const exponential = baseDelay * (2 ** Math.max(0, Number(attempt) || 0));
	return Math.max(0, Math.min(maximum, headerDelay ?? exponential));
}


__exports.imageRetryDelayMs = imageRetryDelayMs;
function imageCircuitCooldownMs(response, options = {}) {
	const headerDelay = retryAfterHeaderMs(response, options);
	const fallback = finiteNumber(options.circuitCooldownMs, DEFAULT_CIRCUIT_MS);
	return Math.max(0, Math.min(MAX_CIRCUIT_MS, headerDelay ?? fallback));
}


__exports.imageCircuitCooldownMs = imageCircuitCooldownMs;
async function waitForImageRetry(delayMs, options = {}) {
	if (delayMs <= 0) return;
	if (typeof options.sleep === 'function') {
		await options.sleep(delayMs);
		return;
	}
	await new Promise(resolve => setTimeout(resolve, delayMs));
}


__exports.waitForImageRetry = waitForImageRetry;
function retryAfterHeaderMs(response, options = {}) {
	const value = response?.headers?.get?.('retry-after');
	if (!value) return null;
	const seconds = Number(value);
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
	const now = typeof options.now === 'function' ? options.now() : Date.now();
	const date = Date.parse(value);
	return Number.isFinite(date) ? Math.max(0, date - now) : null;
}


__exports.retryAfterHeaderMs = retryAfterHeaderMs;
function publicImageRetryPolicyEvidence() {
	return Object.freeze({
		baseDelayMs: DEFAULT_BASE_DELAY_MS,
		circuitCooldownMs: DEFAULT_CIRCUIT_MS,
		maxCircuitMs: MAX_CIRCUIT_MS,
		maxDelayMs: DEFAULT_MAX_DELAY_MS,
		retryableStatuses: Object.freeze([...RETRYABLE_STATUSES])
	});
}


__exports.publicImageRetryPolicyEvidence = publicImageRetryPolicyEvidence;
function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageRateLimitCircuit.js */
__awtsmoosModule_266 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageRateLimitCircuit.js
 * @description Remembers retryable image responses for a bounded, inspectable cooldown.
 * The Awtsmoos keeps the guarded gate known while procedural color remains bright;
 * Awtsmoos.com avoids repeated knocks until the server reopens the light.
 */

var clonePublicImageResponse = __awtsmoosModule_267.clonePublicImageResponse;
var imageCircuitCooldownMs = __awtsmoosModule_268.imageCircuitCooldownMs;

const circuitByUrl = new Map();

function activePublicImageCircuit(url, options = {}) {
	const entry = circuitByUrl.get(url);
	if (!entry) return null;
	if (entry.until > currentTime(options)) {
		return {
			response: clonePublicImageResponse(entry.response),
			retryAfterMs: entry.until - currentTime(options)
		};
	}
	circuitByUrl.delete(url);
	return null;
}


__exports.activePublicImageCircuit = activePublicImageCircuit;
function publicImageCircuitIsOpen(url, options = {}) {
	return Boolean(activePublicImageCircuit(url, options));
}


__exports.publicImageCircuitIsOpen = publicImageCircuitIsOpen;
function rememberPublicImageCircuit(url, response, options = {}) {
	circuitByUrl.set(url, {
		response: clonePublicImageResponse(response),
		until: currentTime(options) + imageCircuitCooldownMs(response, options)
	});
}


__exports.rememberPublicImageCircuit = rememberPublicImageCircuit;
function clearPublicImageCircuit(url) {
	if (url) {
		circuitByUrl.delete(url);
		return;
	}
	circuitByUrl.clear();
}


__exports.clearPublicImageCircuit = clearPublicImageCircuit;
function publicImageCircuitStats(options = {}) {
	const timestamp = currentTime(options);
	return {
		open: [...circuitByUrl.values()].filter(entry => entry.until > timestamp).length
	};
}


__exports.publicImageCircuitStats = publicImageCircuitStats;
function currentTime(options) {
	return typeof options.now === 'function' ? options.now() : Date.now();
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageResponseCache.js */
__awtsmoosModule_264 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseCache.js
 * @description Deduplicates verified image fetches while Cache Storage preserves good bytes.
 * The Awtsmoos lets one distant response become enough for every waiting eye;
 * Awtsmoos.com shares one request and gives each consumer an untouched reply.
 */

var publicImageCacheStorage = __awtsmoosModule_265.publicImageCacheStorage;
var publicImageNetworkRequestOptions = __awtsmoosModule_265.publicImageNetworkRequestOptions;
var activePublicImageCircuit = __awtsmoosModule_266.activePublicImageCircuit;
var clearPublicImageCircuit = __awtsmoosModule_266.clearPublicImageCircuit;
var publicImageCircuitStats = __awtsmoosModule_266.publicImageCircuitStats;
var rememberPublicImageCircuit = __awtsmoosModule_266.rememberPublicImageCircuit;
var clonePublicImageResponse = __awtsmoosModule_267.clonePublicImageResponse;
var isRetryableImageStatus = __awtsmoosModule_268.isRetryableImageStatus;
var retryAfterHeaderMs = __awtsmoosModule_268.retryAfterHeaderMs;

const PUBLIC_IMAGE_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-images-v1';
__exports.PUBLIC_IMAGE_CACHE_NAME = PUBLIC_IMAGE_CACHE_NAME;

const pendingByUrl = new Map();

async function cachedImageResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		throw new Error('Remote image fetch is unavailable.');
	}
	const cache = await openCache(publicImageCacheStorage(options), options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return responseRecord(cached, 'cache-storage');
	const circuit = activePublicImageCircuit(url, options);
	if (circuit && options.bypassCircuit !== true) {
		return responseRecord(circuit.response, 'rate-limit-circuit', {
			circuitOpen: true,
			retryAfterMs: circuit.retryAfterMs
		});
	}
	const pending = pendingByUrl.get(url);
	if (pending) return cloneRecord(await pending, 'network-shared');
	const request = fetchAndRemember(url, fetchFunction, cache, options);
	pendingByUrl.set(url, request);
	try {
		return cloneRecord(await request);
	} finally {
		if (pendingByUrl.get(url) === request) pendingByUrl.delete(url);
	}
}


__exports.cachedImageResponse = cachedImageResponse;
function isImageResponse(response) {
	const contentType = response?.headers?.get?.('content-type') || '';
	return contentType.toLowerCase().startsWith('image/');
}


__exports.isImageResponse = isImageResponse;
function clearPublicImageResponseState() {
	pendingByUrl.clear();
	clearPublicImageCircuit();
}


__exports.clearPublicImageResponseState = clearPublicImageResponseState;
function publicImageResponseStats(options = {}) {
	return {
		circuits: publicImageCircuitStats(options).open,
		pending: pendingByUrl.size
	};
}


__exports.publicImageResponseStats = publicImageResponseStats;
async function fetchAndRemember(url, fetchFunction, cache, options) {
	const response = await fetchFunction(url, publicImageNetworkRequestOptions(options));
	if (response?.ok && isImageResponse(response)) {
		clearPublicImageCircuit(url);
		await cache?.put?.(url, clonePublicImageResponse(response));
	} else if (isRetryableImageStatus(response?.status)) {
		rememberPublicImageCircuit(url, response, options);
	}
	return responseRecord(response, 'network', {
		retryAfterMs: retryAfterHeaderMs(response, options) || 0
	});
}

function responseRecord(response, source, evidence = {}) {
	return {
		circuitOpen: Boolean(evidence.circuitOpen),
		response,
		retryAfterMs: Math.max(0, evidence.retryAfterMs || 0),
		source
	};
}

function cloneRecord(record, source = record.source) {
	return {
		...record,
		response: clonePublicImageResponse(record.response),
		source
	};
}

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageFetchRecords.js */
__awtsmoosModule_269 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetchRecords.js
 * @description Builds serializable success, failure, and per-attempt image evidence.
 * The Awtsmoos lets every distant success and fracture speak without disguise;
 * Awtsmoos.com records retry, rate limit, method, stage, and status before our eyes.
 */

function publicImageFetchSuccess(record, attempts) {
	return {
		...record,
		attempts,
		rateLimited: wasRateLimited(attempts),
		retries: retryCount(attempts)
	};
}


__exports.publicImageFetchSuccess = publicImageFetchSuccess;
function publicImageFetchFailure(record, attempts) {
	return {
		blob: null,
		contentType: record.contentType || '',
		error: record.error || 'network-error',
		method: record.method || 'remote-cache-fetch',
		ok: false,
		attempts,
		rateLimited: wasRateLimited(attempts),
		retries: retryCount(attempts),
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'fetch',
		status: record.status || 0
	};
}


__exports.publicImageFetchFailure = publicImageFetchFailure;
function publicImageAttemptEvidence(record = {}) {
	return {
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}


__exports.publicImageAttemptEvidence = publicImageAttemptEvidence;
function publicImageNetworkFailure(error, controller) {
	const aborted = error?.name === 'AbortError' || controller?.signal?.aborted;
	return {
		error: aborted ? 'timeout' : error?.message || 'network-error',
		method: 'network',
		ok: false,
		retryAfterMs: 0,
		retryable: !aborted,
		stage: 'fetch',
		status: 0
	};
}


__exports.publicImageNetworkFailure = publicImageNetworkFailure;
function publicImageTypedFailure(error, contentType, response, method) {
	return {
		contentType,
		error,
		method,
		ok: false,
		response,
		retryAfterMs: 0,
		retryable: false,
		stage: error === 'empty-image-blob' ? 'blob' : 'content-type',
		status: response.status
	};
}


__exports.publicImageTypedFailure = publicImageTypedFailure;
function retryCount(attempts) {
	return Math.max(0, attempts.length - 1);
}

function wasRateLimited(attempts) {
	return attempts.some(attempt => attempt.status === 429);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicImageFetch.js */
__awtsmoosModule_263 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.js
 * @description Fetches one canonical image with cache reuse and one bounded retry doorway.
 * The Awtsmoos gives every distant byte a truthful and patient way;
 * Awtsmoos.com retries with measure while cached or procedural light may stay.
 */

var cachedImageResponse = __awtsmoosModule_264.cachedImageResponse;
var isImageResponse = __awtsmoosModule_264.isImageResponse;
var createPublicImageAbortController = __awtsmoosModule_265.createPublicImageAbortController;
var publicImageCacheOptions = __awtsmoosModule_265.publicImageCacheOptions;
var publicImageAttemptEvidence = __awtsmoosModule_269.publicImageAttemptEvidence;
var publicImageFetchFailure = __awtsmoosModule_269.publicImageFetchFailure;
var publicImageFetchSuccess = __awtsmoosModule_269.publicImageFetchSuccess;
var publicImageNetworkFailure = __awtsmoosModule_269.publicImageNetworkFailure;
var publicImageTypedFailure = __awtsmoosModule_269.publicImageTypedFailure;
var imageRetryDelayMs = __awtsmoosModule_268.imageRetryDelayMs;
var isRetryableImageStatus = __awtsmoosModule_268.isRetryableImageStatus;
var waitForImageRetry = __awtsmoosModule_268.waitForImageRetry;

async function fetchPublicImageBlob(url, timeoutMs = 30000, dependencies = {}) {
	const controller = createPublicImageAbortController(dependencies);
	const timer = setTimeout(() => controller?.abort(), timeoutMs);
	const attempts = [];
	const maximumRetries = Math.max(0, Number(dependencies.maxRetries ?? 1) || 0);
	try {
		for (let attempt = 0; attempt <= maximumRetries; attempt += 1) {
			const record = await requestAttempt(url, controller, attempt, dependencies)
				.catch(error => publicImageNetworkFailure(error, controller));
			attempts.push(publicImageAttemptEvidence(record));
			if (record.ok) return publicImageFetchSuccess(record, attempts);
			if (!record.retryable || attempt >= maximumRetries) {
				return publicImageFetchFailure(record, attempts);
			}
			const delayMs = imageRetryDelayMs(record.response, attempt, dependencies);
			await waitForImageRetry(delayMs, dependencies);
		}
		return publicImageFetchFailure({ error: 'retry-budget-exhausted' }, attempts);
	} finally {
		clearTimeout(timer);
	}
}


__exports.fetchPublicImageBlob = fetchPublicImageBlob;
async function requestAttempt(url, controller, attempt, dependencies) {
	const result = await cachedImageResponse(
		url,
		publicImageCacheOptions(controller, attempt, dependencies)
	);
	const response = result.response;
	const contentType = response?.headers?.get?.('content-type') || '';
	if (!response?.ok) return httpFailure(response, contentType, result);
	if (!isImageResponse(response)) {
		return publicImageTypedFailure(
			'non-image-content-type',
			contentType,
			response,
			result.source
		);
	}
	const blob = await response.blob();
	if (!blob?.size) {
		return publicImageTypedFailure(
			'empty-image-blob',
			contentType,
			response,
			result.source
		);
	}
	return successAttempt(blob, contentType, response, result.source);
}

function httpFailure(response, contentType, result) {
	return {
		contentType,
		error: `http-${response?.status || 0}`,
		method: result.source,
		ok: false,
		response,
		retryAfterMs: result.retryAfterMs,
		retryable: !result.circuitOpen && isRetryableImageStatus(response?.status),
		stage: 'http',
		status: response?.status || 0
	};
}

function successAttempt(blob, contentType, response, method) {
	return {
		blob,
		contentType,
		error: null,
		method,
		ok: true,
		response,
		retryAfterMs: 0,
		retryable: false,
		stage: 'fetched',
		status: response.status
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialLoadBudget.js */
__awtsmoosModule_270 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialLoadBudget.js
 * @description Keeps one absolute material deadline while reserving measured time for transport and recovery phases.
 * The Awtsmoos is beyond before and after; Awtsmoos.com counts finite milliseconds only so no single doorway
 * consumes the whole appointed interval while another truthful decoder waits unseen behind it.
 */

const MINIMUM_PHASE_MS = 1;

function publicMaterialNow(dependencies = {}) {
	return dependencies.now?.() ?? globalThis.performance?.now?.() ?? Date.now();
}


__exports.publicMaterialNow = publicMaterialNow;
function publicMaterialPhaseBudget(timeoutMs, startedAt, dependencies, share) {
	return Math.max(
		MINIMUM_PHASE_MS,
		Math.min(
			publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies),
			Math.floor(timeoutMs * share)
		)
	);
}


__exports.publicMaterialPhaseBudget = publicMaterialPhaseBudget;
function publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies = {}) {
	return Math.max(
		MINIMUM_PHASE_MS,
		Math.floor(timeoutMs - (publicMaterialNow(dependencies) - startedAt))
	);
}


__exports.publicMaterialRemainingBudget = publicMaterialRemainingBudget;
function racePublicMaterialDeadline(operation, timeoutMs, dependencies, onDeadline) {
	const setTimer = dependencies.setTimeoutFunction || globalThis.setTimeout;
	const clearTimer = dependencies.clearTimeoutFunction || globalThis.clearTimeout;
	if (!setTimer || timeoutMs <= 0) return operation;
	let timer = null;
	const deadline = new Promise(resolve => {
		timer = setTimer(() => resolve(onDeadline()), timeoutMs);
	});
	return Promise.race([operation, deadline]).finally(() => clearTimer?.(timer));
}

__exports.racePublicMaterialDeadline = racePublicMaterialDeadline;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialImageRecords.js */
__awtsmoosModule_271 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageRecords.js
 * @description Builds durable image-decoding receipts with retry and rate-limit provenance.
 * The Awtsmoos lets every texture doorway confess what it tried and knew;
 * Awtsmoos.com preserves cache, retry, timing, dimensions, and failure in view.
 */

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
		rateLimited: Boolean(record.rateLimited),
		retries: record.retries || 0,
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || null,
		status: record.status || 0,
		url: record.url,
		width: record.width
	};
}


__exports.serializableImageRecord = serializableImageRecord;
function materialImageSuccess(values) {
	const { attempts, decoded, fetched, startedAt, url } = values;
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(values.now() - startedAt),
		error: null,
		fromCache: fetched?.method === 'cache-storage',
		height: decoded.height,
		image: decoded.image,
		method: decoded.method,
		ok: true,
		rateLimited: Boolean(fetched?.rateLimited),
		retries: fetched?.retries || 0,
		retryAfterMs: fetched?.retryAfterMs || 0,
		stage: 'decoded',
		status: fetched?.status || 200,
		url,
		width: decoded.width
	};
}


__exports.materialImageSuccess = materialImageSuccess;
function materialImageFailure(values) {
	const { attempts, direct, fetched, startedAt, url } = values;
	const final = attempts.at(-1) || {};
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(values.now() - startedAt),
		error: final.error || direct.error || fetched?.error || 'image-load-failed',
		fromCache: false,
		height: 0,
		image: null,
		method: final.method || 'none',
		ok: false,
		rateLimited: Boolean(fetched?.rateLimited),
		retries: fetched?.retries || 0,
		retryAfterMs: fetched?.retryAfterMs || 0,
		stage: final.stage || 'unknown',
		status: fetched?.status || 0,
		url,
		width: 0
	};
}


__exports.materialImageFailure = materialImageFailure;
function materialImageAttempt(record = {}) {
	return {
		contentType: record.contentType || '',
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		rateLimited: Boolean(record.rateLimited),
		retries: record.retries || 0,
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}

__exports.materialImageAttempt = materialImageAttempt;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialImageLoader.js */
__awtsmoosModule_260 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Loads production images fetch/blob-first with one absolute deadline and a bounded direct fallback.
 * The Awtsmoos reveals distant pixels through many finite doors without becoming any door;
 * Awtsmoos.com gives verified bytes first measure, then reserves a smaller direct-image recovery path before time is done.
 */

var decodePublicImageBlob = __awtsmoosModule_261.decodePublicImageBlob;
var decodePublicImageUrl = __awtsmoosModule_261.decodePublicImageUrl;
var fetchPublicImageBlob = __awtsmoosModule_263.fetchPublicImageBlob;
var publicImageCircuitIsOpen = __awtsmoosModule_266.publicImageCircuitIsOpen;
var publicMaterialNow = __awtsmoosModule_270.publicMaterialNow;
var publicMaterialPhaseBudget = __awtsmoosModule_270.publicMaterialPhaseBudget;
var publicMaterialRemainingBudget = __awtsmoosModule_270.publicMaterialRemainingBudget;
var racePublicMaterialDeadline = __awtsmoosModule_270.racePublicMaterialDeadline;
var materialImageAttempt = __awtsmoosModule_271.materialImageAttempt;
var materialImageFailure = __awtsmoosModule_271.materialImageFailure;
var materialImageSuccess = __awtsmoosModule_271.materialImageSuccess;
__exports.serializableImageRecord = __awtsmoosModule_271.serializableImageRecord;

const FETCH_BUDGET_SHARE = 0.68;

function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = publicMaterialNow(dependencies);
	const operation = loadWithinDeadline(url, timeoutMs, dependencies, startedAt);
	return racePublicMaterialDeadline(
		operation,
		timeoutMs,
		dependencies,
		() => deadlineFailure(url, startedAt, dependencies)
	);
}


__exports.loadPublicMaterialImage = loadPublicMaterialImage;
async function loadWithinDeadline(url, timeoutMs, dependencies, startedAt) {
	if (publicImageCircuitIsOpen(url, dependencies)) {
		return loadCircuitFailure(url, timeoutMs, dependencies, startedAt);
	}
	const attempts = [];
	const fetched = await fetchPublicImageBlob(url, fetchBudget(timeoutMs, startedAt, dependencies), dependencies);
	attempts.push(materialImageAttempt(fetched));
	if (fetched.ok) {
		const decoded = await decodePublicImageBlob(
			url,
			fetched.blob,
			remaining(timeoutMs, startedAt, dependencies),
			dependencies
		);
		attempts.push(materialImageAttempt(decoded));
		if (decoded.ok) return success(url, decoded, fetched, attempts, startedAt, dependencies);
	}
	let direct = skippedDirectRecord('fetch-response-definitive');
	if (directFallbackAllowed(fetched)) {
		direct = await decodePublicImageUrl(url, remaining(timeoutMs, startedAt, dependencies), dependencies);
		attempts.push(materialImageAttempt(direct));
		if (direct.ok) return success(url, direct, fetched, attempts, startedAt, dependencies);
	}
	return failure(url, direct, fetched, attempts, startedAt, dependencies);
}

async function loadCircuitFailure(url, timeoutMs, dependencies, startedAt) {
	const direct = skippedDirectRecord('rate-limit-circuit-open');
	const attempts = [materialImageAttempt(direct)];
	const fetched = await fetchPublicImageBlob(url, fetchBudget(timeoutMs, startedAt, dependencies), dependencies);
	attempts.push(materialImageAttempt(fetched));
	return failure(url, direct, fetched, attempts, startedAt, dependencies);
}

function directFallbackAllowed(fetched) {
	return !fetched?.ok && (!fetched?.status || fetched.status >= 500);
}

function deadlineFailure(url, startedAt, dependencies) {
	const attempt = materialImageAttempt({ error: 'material-deadline-exceeded', method: 'material-deadline', stage: 'deadline' });
	return failure(url, attempt, null, [attempt], startedAt, dependencies);
}

function success(url, decoded, fetched, attempts, startedAt, dependencies) {
	return materialImageSuccess({ attempts, decoded, fetched, now: () => publicMaterialNow(dependencies), startedAt, url });
}

function failure(url, direct, fetched, attempts, startedAt, dependencies) {
	return materialImageFailure({ attempts, direct, fetched, now: () => publicMaterialNow(dependencies), startedAt, url });
}

function fetchBudget(timeoutMs, startedAt, dependencies) {
	return publicMaterialPhaseBudget(timeoutMs, startedAt, dependencies, FETCH_BUDGET_SHARE);
}

function remaining(timeoutMs, startedAt, dependencies) {
	return publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies);
}

function skippedDirectRecord(error) {
	return { error, method: 'direct-image-url-skipped', ok: false, rateLimited: error === 'rate-limit-circuit-open', stage: 'policy', status: 0 };
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialPriority.js */
__awtsmoosModule_272 = (() => {
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
__awtsmoosModule_253 = (() => {
const __exports = {};
// B"H
var CRITICAL_RUNTIME_MATERIALS = __awtsmoosModule_254.CRITICAL_RUNTIME_MATERIALS;
var RUNTIME_MATERIALS = __awtsmoosModule_254.RUNTIME_MATERIALS;
var loadPublicMaterialImage = __awtsmoosModule_260.loadPublicMaterialImage;
var serializableImageRecord = __awtsmoosModule_260.serializableImageRecord;
var isSceneMaterialUrl = __awtsmoosModule_272.isSceneMaterialUrl;

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
__awtsmoosModule_275 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DetailTextureFamilies.js
 * @description Names only image-decodable detail textures. Models and future
 * unpublished derivatives stay outside this preload vessel before the Awtsmoos.
 */
var exactMaterialUrl = __awtsmoosModule_255.exactMaterialUrl;
var fullMaterialUrl = __awtsmoosModule_255.fullMaterialUrl;

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
__awtsmoosModule_276 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceTextureFamilies.js
 * @description Names the large village surfaces that receive stone, earth,
 * timber, water, and roofs as finite garments for the renewing Awtsmoos.
 */
var fullMaterialUrl = __awtsmoosModule_255.fullMaterialUrl;

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
__awtsmoosModule_274 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureFamilies.js
 * @description Joins broad surfaces and delicate details into one stable
 * compatibility map, many material vessels held within the unity of Awtsmoos.
 */
var DETAIL_TEXTURE_FAMILIES = __awtsmoosModule_275.DETAIL_TEXTURE_FAMILIES;
var SURFACE_TEXTURE_FAMILIES = __awtsmoosModule_276.SURFACE_TEXTURE_FAMILIES;

const TEXTURE_URLS = Object.freeze({
	...SURFACE_TEXTURE_FAMILIES,
	...DETAIL_TEXTURE_FAMILIES
});
__exports.TEXTURE_URLS = TEXTURE_URLS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureArchitectureNames.js */
__awtsmoosModule_279 = (() => {
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
__awtsmoosModule_280 = (() => {
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
__awtsmoosModule_281 = (() => {
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
__awtsmoosModule_282 = (() => {
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
__awtsmoosModule_278 = (() => {
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

var REMOTE_ARCHITECTURE_TEXTURE_FILENAMES = __awtsmoosModule_279.REMOTE_ARCHITECTURE_TEXTURE_FILENAMES;
var REMOTE_CRAFT_TEXTURE_FILENAMES = __awtsmoosModule_280.REMOTE_CRAFT_TEXTURE_FILENAMES;
var REMOTE_GROUND_TEXTURE_FILENAMES = __awtsmoosModule_281.REMOTE_GROUND_TEXTURE_FILENAMES;
var REMOTE_TREE_TEXTURE_FILENAMES = __awtsmoosModule_282.REMOTE_TREE_TEXTURE_FILENAMES;
var fullResolutionTextureUrl = __awtsmoosModule_257.fullResolutionTextureUrl;
var treeTextureUrl = __awtsmoosModule_257.treeTextureUrl;

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
__awtsmoosModule_277 = (() => {
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

var remoteTreeTextureUrl = __awtsmoosModule_278.remoteTreeTextureUrl;
var TEXTURE_URLS = __awtsmoosModule_274.TEXTURE_URLS;

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
__awtsmoosModule_273 = (() => {
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

var PUBLIC_MATERIAL_ORIGIN = __awtsmoosModule_256.PUBLIC_MATERIAL_ORIGIN;
var fullMaterialUrl = __awtsmoosModule_255.fullMaterialUrl;
var halfMaterialUrl = __awtsmoosModule_255.halfMaterialUrl;
var TEXTURE_URLS = __awtsmoosModule_274.TEXTURE_URLS;
var TEXTURE_PURPOSES = __awtsmoosModule_277.TEXTURE_PURPOSES;
var WORLD_MATERIAL_PRESETS = __awtsmoosModule_277.WORLD_MATERIAL_PRESETS;

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
__awtsmoosModule_286 = (() => {
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
__awtsmoosModule_288 = (() => {
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
__awtsmoosModule_289 = (() => {
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
__awtsmoosModule_287 = (() => {
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

var boundedTextureAxisPlan = __awtsmoosModule_286.boundedTextureAxisPlan;
var positiveTextureNumber = __awtsmoosModule_286.positiveTextureNumber;
var textureQualityScale = __awtsmoosModule_286.textureQualityScale;
var textureSize = __awtsmoosModule_288.textureSize;
var REPEAT_HOOKS = __awtsmoosModule_289.REPEAT_HOOKS;

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
__awtsmoosModule_285 = (() => {
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

var exactPixelRepeat = __awtsmoosModule_286.exactPixelRepeat;
var positiveTextureNumber = __awtsmoosModule_286.positiveTextureNumber;
var textureDensityPlan = __awtsmoosModule_287.textureDensityPlan;
var textureSize = __awtsmoosModule_288.textureSize;

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
__awtsmoosModule_290 = (() => {
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

var repeatFromPixels = __awtsmoosModule_285.repeatFromPixels;
var publicUrl = __awtsmoosModule_288.publicUrl;
var textureSize = __awtsmoosModule_288.textureSize;

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
__awtsmoosModule_284 = (() => {
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

__exports.exactRepeat = __awtsmoosModule_285.exactRepeat;
__exports.repeatFromPixels = __awtsmoosModule_285.repeatFromPixels;
__exports.publicUrl = __awtsmoosModule_288.publicUrl;
__exports.textureSize = __awtsmoosModule_288.textureSize;
__exports.floorRepeat = __awtsmoosModule_290.floorRepeat;
__exports.materialTexture = __awtsmoosModule_290.materialTexture;
__exports.mixRepeat = __awtsmoosModule_290.mixRepeat;
__exports.roadRepeat = __awtsmoosModule_290.roadRepeat;
__exports.roofRepeat = __awtsmoosModule_290.roofRepeat;
__exports.terrainRepeat = __awtsmoosModule_290.terrainRepeat;
__exports.wallRepeat = __awtsmoosModule_290.wallRepeat;
__exports.textureDensityPlan = __awtsmoosModule_287.textureDensityPlan;
__exports.REPEAT_HOOKS = __awtsmoosModule_289.REPEAT_HOOKS;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveTexturePolicy.js */
__awtsmoosModule_283 = (() => {
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

var REPEAT_HOOKS = __awtsmoosModule_284.REPEAT_HOOKS;

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
__awtsmoosModule_252 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveMaterialFactory.js
 * @description Binds local images to primitives and opens one imported live-nature scheduler.
 * The Awtsmoos clothes each finite surface while one module awakening calls root and bloom;
 * Awtsmoos.com preserves authored strata, batching, and final GPU truth in the rendered room.
 */

var MeshStandardMaterial = __awtsmoosModule_7.MeshStandardMaterial;
var cachedTextureImage = __awtsmoosModule_253.cachedTextureImage;
var isSameOriginMaterialUrl = __awtsmoosModule_258.isSameOriginMaterialUrl;
var TEXTURE_PURPOSES = __awtsmoosModule_273.TEXTURE_PURPOSES;
var TEXTURE_URLS = __awtsmoosModule_273.TEXTURE_URLS;
var scheduleLiveRealNatureBridge = __awtsmoosModule_51.scheduleLiveRealNatureBridge;
var colorArray = __awtsmoosModule_192.colorArray;
var createPrimitiveTexturePolicy = __awtsmoosModule_283.createPrimitiveTexturePolicy;

scheduleImportedNatureBridge();

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

function scheduleImportedNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveZoneWeights.js */
__awtsmoosModule_291 = (() => {
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
__awtsmoosModule_292 = (() => {
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
__awtsmoosModule_191 = (() => {
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

var BufferAttribute = __awtsmoosModule_7.BufferAttribute;
var BufferGeometry = __awtsmoosModule_7.BufferGeometry;
var Mesh = __awtsmoosModule_7.Mesh;
var trianglesFromIndexed = __awtsmoosModule_106.trianglesFromIndexed;
var createPrimitiveGeometryData = __awtsmoosModule_192.createPrimitiveGeometryData;
var isProceduralShape = __awtsmoosModule_192.isProceduralShape;
var createPrimitiveVertexNormals = __awtsmoosModule_251.createPrimitiveVertexNormals;
var flattenPrimitiveVertices = __awtsmoosModule_251.flattenPrimitiveVertices;
var primitiveColorArray = __awtsmoosModule_251.primitiveColorArray;
var primitiveIndexArray = __awtsmoosModule_251.primitiveIndexArray;
var createPrimitiveMaterial = __awtsmoosModule_252.createPrimitiveMaterial;
var primitiveUsesNativeDensity = __awtsmoosModule_283.primitiveUsesNativeDensity;
var primitiveZoneWeights = __awtsmoosModule_291.primitiveZoneWeights;
var measureUvUnitsPerWorld = __awtsmoosModule_292.measureUvUnitsPerWorld;
var normalizePrimitiveUvsToWorld = __awtsmoosModule_292.normalizePrimitiveUvsToWorld;
var projectPrimitiveUvs = __awtsmoosModule_292.projectPrimitiveUvs;

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
__awtsmoosModule_190 = (() => {
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

var Group = __awtsmoosModule_7.Group;
var createPrimitiveMesh = __awtsmoosModule_191.createPrimitiveMesh;

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
__awtsmoosModule_165 = (() => {
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
var MinimalMeadowAttachmentRegistry = __awtsmoosModule_166.MinimalMeadowAttachmentRegistry;
var MinimalMeadowDerivedStatsRuntime = __awtsmoosModule_171.MinimalMeadowDerivedStatsRuntime;
var MinimalMeadowEquipmentCasting = __awtsmoosModule_181.MinimalMeadowEquipmentCasting;
var applyMinimalGarmentAppearance = __awtsmoosModule_183.applyMinimalGarmentAppearance;
var applyMinimalGarmentVisibility = __awtsmoosModule_186.applyMinimalGarmentVisibility;
var resolveMinimalEquipmentNodes = __awtsmoosModule_186.resolveMinimalEquipmentNodes;
var installMinimalMeadowEquipmentListeners = __awtsmoosModule_189.installMinimalMeadowEquipmentListeners;
var minimalMeadowEquipmentDiagnostics = __awtsmoosModule_189.minimalMeadowEquipmentDiagnostics;
var minimalMeadowEquippedWeaponItemId = __awtsmoosModule_189.minimalMeadowEquippedWeaponItemId;
var createMinimalMeadowWeapon = __awtsmoosModule_190.createMinimalMeadowWeapon;

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
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFriendlyChossidActor.js */
__awtsmoosModule_121 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

var TinyAnimationPlayer = __awtsmoosModule_4.TinyAnimationPlayer;
var loadIsolatedGltf = __awtsmoosModule_2.loadIsolatedGltf;
var InventoryStore = __awtsmoosModule_122.InventoryStore;
var createPlayerActionSystem = __awtsmoosModule_142.createPlayerActionSystem;
var AwtsmoosEventBus = __awtsmoosModule_163.AwtsmoosEventBus;
var PLAYER_MODEL_URL = __awtsmoosModule_36.PLAYER_MODEL_URL;
var minimalMeadowClipForState = __awtsmoosModule_164.minimalMeadowClipForState;
var MinimalMeadowEquipmentRuntime = __awtsmoosModule_165.MinimalMeadowEquipmentRuntime;
var hydrateReadablePlayerMaterials = __awtsmoosModule_116.hydrateReadablePlayerMaterials;

const FRIENDLY_CHOSSID_MODEL_URL = PLAYER_MODEL_URL;
__exports.FRIENDLY_CHOSSID_MODEL_URL = FRIENDLY_CHOSSID_MODEL_URL;


/** Creates a friendly NPC only from the canonical GLB and preserves its exported colors. */
async function createFriendlyChossidActor(worldRuntime, definition) {
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore({
		equipment: {
			coat: 'black-coat',
			hand: definition.weaponItemId || 'wooden-staff',
			tool: 'chalaf'
		}
	});
	const equipment = new MinimalMeadowEquipmentRuntime({ bus, inventory });
	const gltf = await loadIsolatedGltf(
		FRIENDLY_CHOSSID_MODEL_URL,
		`minimal-meadow-friendly-${definition.id}`
	);
	const model = prepareFriendlyModel(worldRuntime, gltf.scene, definition);
	hydrateReadablePlayerMaterials(model);
	equipment.bindModel(model);
	const player = new TinyAnimationPlayer(model, gltf.animations || []);
	const standing = minimalMeadowClipForState(player.names, 'standing');
	if (standing) player.play(standing);
	player.update(0);
	const actions = createPlayerActionSystem({
		actorId: definition.id,
		bridge: false,
		bus,
		equipment,
		model
	});
	return actorRecord(worldRuntime, definition, gltf, {
		actions, bus, equipment, inventory, model, player
	});
}


__exports.createFriendlyChossidActor = createFriendlyChossidActor;
function prepareFriendlyModel(runtime, model, definition) {
	const ground = runtime.terrain?.heightAt?.(
		definition.position.x,
		definition.position.z
	) || 0;
	model.name = `Awtsmoos_friendly_chossid_${definition.id}`;
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(definition.position.x, ground, definition.position.z);
	model.setBaseTransform?.();
	runtime.scene.add(model);
	return model;
}

function actorRecord(worldRuntime, definition, gltf, parts) {
	return {
		...parts,
		id: definition.id,
		source: FRIENDLY_CHOSSID_MODEL_URL,
		destroy() {
			parts.actions.destroy();
			parts.equipment.destroy();
			parts.model.parent?.remove?.(parts.model);
		},
		diagnostics() {
			return {
				actions: parts.actions.snapshot(),
				animations: gltf.animations?.map(clip => clip.name || '') || [],
				equipment: parts.equipment.diagnostics(),
				id: definition.id,
				model: parts.model.name,
				source: FRIENDLY_CHOSSID_MODEL_URL
			};
		},
		dispatch(message) { return parts.actions.dispatch(message); },
		update(deltaSeconds) {
			parts.player.update(deltaSeconds);
			parts.actions.update(deltaSeconds);
			parts.model.updateWorldMatrix?.();
		},
		worldRuntime
	};
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFriendlyChossidSystem.js */
__awtsmoosModule_120 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyChossidSystem.js
 * @description Owns friendly Chossids that share the canonical GLB source, never mutable bones.
 * The Awtsmoos creates fellowship without identity collapse; Awtsmoos.com lets each NPC receive
 * separate messages and action state while one asset path remains the visible family likeness.
 */

var createFriendlyChossidActor = __awtsmoosModule_121.createFriendlyChossidActor;

const FRIENDLY_DEFINITIONS = Object.freeze([
	Object.freeze({
		id: 'friendly-mendel',
		position: Object.freeze({ x: -6.5, z: 4 }),
		weaponItemId: 'wooden-staff'
	}),
	Object.freeze({
		id: 'friendly-levi',
		position: Object.freeze({ x: 7.5, z: -3.5 }),
		weaponItemId: 'spark-blade'
	})
]);

async function installMinimalMeadowFriendlyChossids(runtime) {
	runtime.friendlyNpcs?.destroy?.();
	const actors = await Promise.all(
		FRIENDLY_DEFINITIONS.map(definition =>
			createFriendlyChossidActor(runtime, definition)
		)
	);
	const system = new MinimalMeadowFriendlyChossidSystem(runtime, actors);
	runtime.friendlyNpcs = system;
	system.attach();
	runtime.bus.emit('friendly-npcs:ready', system.diagnostics());
	return system.diagnostics();
}


__exports.installMinimalMeadowFriendlyChossids = installMinimalMeadowFriendlyChossids;
class MinimalMeadowFriendlyChossidSystem {
	constructor(runtime, actors) {
		this.runtime = runtime;
		this.actors = actors;
		this.previousUpdate = null;
		this.updateWrapper = null;
	}

	attach() {
		this.previousUpdate = this.runtime.updateWorldSystems;
		this.updateWrapper = deltaSeconds => {
			this.previousUpdate?.(deltaSeconds);
			this.update(deltaSeconds);
		};
		this.runtime.updateWorldSystems = this.updateWrapper;
	}

	update(deltaSeconds) {
		for (const actor of this.actors) {
			actor.update(deltaSeconds);
		}
	}

	dispatch(actorId, message) {
		const actor = this.actors.find(candidate => candidate.id === actorId);
		if (!actor) {
			return { accepted: false, reason: 'FRIENDLY_ACTOR_NOT_FOUND' };
		}
		return actor.dispatch(message);
	}

	register(definition) {
		return this.actors.map(actor => actor.actions.register(definition));
	}

	diagnostics() {
		return {
			actors: this.actors.map(actor => actor.diagnostics()),
			count: this.actors.length,
			sharedGlbSource: this.actors[0]?.source || null
		};
	}

	destroy() {
		for (const actor of this.actors) {
			actor.destroy();
		}
		if (this.runtime.updateWorldSystems === this.updateWrapper) {
			this.runtime.updateWorldSystems = this.previousUpdate;
		}
		this.actors = [];
	}
}

__exports.MinimalMeadowFriendlyChossidSystem = MinimalMeadowFriendlyChossidSystem;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFriendlyNpcs.js */
__awtsmoosModule_119 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyNpcs.js
 * @description Awaits the canonical quest Chossid before considering any optional friendly fallback.
 * The Awtsmoos lets one complete messenger arrive without duplicate bodies;
 * Awtsmoos.com preserves full model quality, optional readiness, hydration failure recovery, and ownership.
 */

var installMinimalMeadowFriendlyChossids = __awtsmoosModule_120.installMinimalMeadowFriendlyChossids;

async function installMinimalMeadowFriendlyNpcs(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	await runtime.questHydrationPromise?.catch(() => null);
	if (runtime.friendlyNpcs) {
		return runtime.friendlyNpcs.diagnostics?.() || { ready: true };
	}
	const install = dependencies.installMinimalMeadowFriendlyChossids
		|| installMinimalMeadowFriendlyChossids;
	return install(runtime, environment);
}


__exports.installMinimalMeadowFriendlyNpcs = installMinimalMeadowFriendlyNpcs;
__exports.default = installMinimalMeadowFriendlyNpcs;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowVisualStability.js */
__awtsmoosModule_294 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVisualStability.js
 * @description Enforces finite visibility invariants after rich-world and model hydration.
 * The Awtsmoos creates wall, road, demon, garment, and weapon continuously; Awtsmoos.com
 * prevents culling, stale attachments, or dark bootstrap multiplication from hiding them.
 */

function installMinimalMeadowVisualStability(runtime) {
	const houses = stabilizeHouses(runtime.houses);
	const terrain = stabilizeTerrain(runtime.terrain);
	const demons = stabilizeDemons(runtime.enemies);
	const equipment = stabilizeEquipment(runtime);
	const receipt = {
		demons,
		equipment,
		houses,
		ready: Boolean(terrain.roadVisible && equipment.synchronized),
		terrain
	};
	runtime.visualStability = receipt;
	runtime.bus.emit('world:visual-stability', receipt);
	return receipt;
}


__exports.installMinimalMeadowVisualStability = installMinimalMeadowVisualStability;
function stabilizeHouses(system) {
	let materials = 0;
	let meshes = 0;
	system?.group?.traverse?.(object => {
		if (!isMesh(object)) return;
		object.visible = true;
		object.frustumCulled = false;
		for (const surface of materialsFor(object)) {
			surface.doubleSided = true;
			surface.backfaceCull = false;
			materials += 1;
		}
		meshes += 1;
	});
	return { materials, meshes, stable: meshes > 0 };
}

function stabilizeTerrain(terrain) {
	for (const mesh of [terrain?.mesh, terrain?.road]) {
		if (!mesh) continue;
		mesh.visible = true;
		mesh.frustumCulled = false;
	}
	return {
		roadSources: terrain?.road?.userData?.AwtsmoosRoad?.sourceCount || 0,
		roadVisible: terrain?.road?.visible === true,
		terrainVisible: terrain?.mesh?.visible === true,
		uvProjection: terrain?.stats?.worldUv || null
	};
}

function stabilizeDemons(system) {
	let mapped = 0;
	let meshes = 0;
	system?.group?.traverse?.(object => {
		if (!isMesh(object)) return;
		object.visible = true;
		object.frustumCulled = false;
		object.userData ||= {};
		object.userData.bootstrapVisual = true;
		for (const material of materialsFor(object)) {
			material.vertexColors = false;
			mapped += Number(Boolean(material.mapImage || material.baseColorTexture));
		}
		meshes += 1;
	});
	return { mappedMaterials: mapped, meshes, readable: mapped > 0 };
}

function stabilizeEquipment(runtime) {
	runtime.equipment?.synchronize?.();
	let weaponParts = 0;
	for (const root of [
		runtime.equipment?.weapon,
		runtime.equipment?.weaponObject,
		runtime.model
	]) {
		root?.traverse?.(object => {
			if (!object.userData?.weaponPart) return;
			object.visible = true;
			object.frustumCulled = false;
			object.userData.bootstrapVisual = true;
			weaponParts += 1;
		});
	}
	return {
		drawn: runtime.equipment?.drawn === true,
		synchronized: Boolean(runtime.equipment),
		weaponItemId: runtime.equipment?.weaponItemId || null,
		weaponParts
	};
}

function materialsFor(object) {
	return (Array.isArray(object.material) ? object.material : [object.material])
		.filter(Boolean);
}

function isMesh(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh);
}
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowVisualReadiness.js */
__awtsmoosModule_293 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/** Waits for bounded optional world work, then enforces visible-runtime invariants once. */
var installMinimalMeadowVisualStability = __awtsmoosModule_294.installMinimalMeadowVisualStability;

async function awaitMinimalMeadowVisualStability(runtime) {
	await Promise.allSettled([
		Promise.resolve(runtime?.richWorldPromise),
		Promise.resolve(runtime?.terrainTexturePromise)
	]);
	return installMinimalMeadowVisualStability(runtime);
}


__exports.awaitMinimalMeadowVisualStability = awaitMinimalMeadowVisualStability;
__exports.default = awaitMinimalMeadowVisualStability;
return Object.freeze(__exports);
})();
/* B\"H compact source: games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowOptionalBundle.js */
__awtsmoosModule_0 = (() => {
const __exports = {};
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalBundle.js
 * @description Exposes every full-quality optional installer from one generated runtime chunk.
 * The Awtsmoos gathers canonical player, renderer, friendly Chossid, and visual proof into one vessel;
 * Awtsmoos.com preserves complete optional quality while eliminating the native module waterfall.
 */

__exports.hydrateMinimalMeadowPlayer = __awtsmoosModule_1.hydrateMinimalMeadowPlayer;
__exports.enhanceMinimalMeadowRenderer = __awtsmoosModule_117.enhanceMinimalMeadowRenderer;
__exports.installMinimalMeadowFriendlyNpcs = __awtsmoosModule_119.installMinimalMeadowFriendlyNpcs;
__exports.awaitMinimalMeadowVisualStability = __awtsmoosModule_293.awaitMinimalMeadowVisualStability;
return Object.freeze(__exports);
})();
/* B\"H compact entry exports */
export const hydrateMinimalMeadowPlayer = __awtsmoosModule_0.hydrateMinimalMeadowPlayer;
export const enhanceMinimalMeadowRenderer = __awtsmoosModule_0.enhanceMinimalMeadowRenderer;
export const installMinimalMeadowFriendlyNpcs = __awtsmoosModule_0.installMinimalMeadowFriendlyNpcs;
export const awaitMinimalMeadowVisualStability = __awtsmoosModule_0.awaitMinimalMeadowVisualStability;
