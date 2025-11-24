//B"H

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputFormat = exports.Output = exports.OggOutputFormat = exports.OggInputFormat = exports.OGG = exports.NON_PCM_AUDIO_CODECS = exports.Mp4OutputFormat = exports.Mp4InputFormat = exports.Mp3OutputFormat = exports.Mp3InputFormat = exports.MovOutputFormat = exports.MkvOutputFormat = exports.MediaStreamVideoTrackSource = exports.MediaStreamAudioTrackSource = exports.MediaSource = exports.MatroskaInputFormat = exports.MP4 = exports.MP3 = exports.MATROSKA = exports.IsobmffOutputFormat = exports.IsobmffInputFormat = exports.InputVideoTrack = exports.InputTrack = exports.InputFormat = exports.InputAudioTrack = exports.Input = exports.EncodedVideoPacketSource = exports.EncodedPacketSink = exports.EncodedPacket = exports.EncodedAudioPacketSource = exports.CustomVideoEncoder = exports.CustomVideoDecoder = exports.CustomAudioEncoder = exports.CustomAudioDecoder = exports.Conversion = exports.CanvasSource = exports.CanvasSink = exports.BufferTarget = exports.BufferSource = exports.BlobSource = exports.BaseMediaSampleSink = exports.AudioSource = exports.AudioSampleSource = exports.AudioSampleSink = exports.AudioSample = exports.AudioBufferSource = exports.AudioBufferSink = exports.AUDIO_CODECS = exports.ALL_TRACK_TYPES = exports.ALL_FORMATS = void 0;
exports.registerEncoder = exports.registerDecoder = exports.getFirstEncodableVideoCodec = exports.getFirstEncodableSubtitleCodec = exports.getFirstEncodableAudioCodec = exports.getEncodableVideoCodecs = exports.getEncodableSubtitleCodecs = exports.getEncodableCodecs = exports.getEncodableAudioCodecs = exports.canEncodeVideo = exports.canEncodeSubtitles = exports.canEncodeAudio = exports.canEncode = exports.WebMOutputFormat = exports.WebMInputFormat = exports.WaveInputFormat = exports.WavOutputFormat = exports.WEBM = exports.WAVE = exports.VideoSource = exports.VideoSampleSource = exports.VideoSampleSink = exports.VideoSample = exports.VIDEO_CODECS = exports.UrlSource = exports.TextSubtitleSource = exports.Target = exports.SubtitleSource = exports.StreamTarget = exports.StreamSource = exports.Source = exports.SUBTITLE_CODECS = exports.QuickTimeInputFormat = exports.Quality = exports.QUALITY_VERY_LOW = exports.QUALITY_VERY_HIGH = exports.QUALITY_MEDIUM = exports.QUALITY_LOW = exports.QUALITY_HIGH = exports.QTFF = exports.PCM_AUDIO_CODECS = void 0;
function m(r) { if (!r)
    throw new Error("Assertion failed."); }
var Fe = function (r) { var e = (r % 360 + 360) % 360; if (e === 0 || e === 90 || e === 180 || e === 270)
    return e; throw new Error("Invalid rotation ".concat(r, ".")); }, U = function (r) { return r && r[r.length - 1]; }, Ue = function (r) { return r >= 0 && r < Math.pow(2, 32); }, se = /** @class */ (function () {
    function r(e) {
        this.bytes = e, this.pos = 0;
    }
    r.prototype.seekToByte = function (e) { this.pos = 8 * e; };
    r.prototype.readBit = function () { var _b; var e = Math.floor(this.pos / 8), t = (_b = this.bytes[e]) !== null && _b !== void 0 ? _b : 0, s = 7 - (this.pos & 7), i = (t & 1 << s) >> s; return this.pos++, i; };
    r.prototype.readBits = function (e) { var t = 0; for (var s = 0; s < e; s++)
        t <<= 1, t |= this.readBit(); return t; };
    r.prototype.readAlignedByte = function () { var _b; if (this.pos % 8 !== 0)
        throw new Error("Bitstream is not byte-aligned."); var e = this.pos / 8, t = (_b = this.bytes[e]) !== null && _b !== void 0 ? _b : 0; return this.pos += 8, t; };
    r.prototype.skipBits = function (e) { this.pos += e; };
    r.prototype.getBitsLeft = function () { return this.bytes.length * 8 - this.pos; };
    r.prototype.clone = function () { var e = new r(this.bytes); return e.pos = this.pos, e; };
    return r;
}()), P = function (r) { var e = 0; for (; r.readBit() === 0 && e < 32;)
    e++; if (e >= 32)
    throw new Error("Invalid exponential-Golomb code."); return (1 << e) - 1 + r.readBits(e); }, Ke = function (r) { var e = P(r); return e & 1 ? e + 1 >> 1 : -(e >> 1); }, fi = function (r, e, t, s) { for (var i = e; i < t; i++) {
    var n = Math.floor(i / 8), a = r[n], o = 7 - (i & 7);
    a &= ~(1 << o), a |= (s & 1 << t - i - 1) >> t - i - 1 << o, r[n] = a;
} }, K = function (r) { return r instanceof Uint8Array ? r : r instanceof ArrayBuffer ? new Uint8Array(r) : new Uint8Array(r.buffer, r.byteOffset, r.byteLength); }, Z = function (r) { return r instanceof DataView ? r : r instanceof ArrayBuffer ? new DataView(r) : new DataView(r.buffer, r.byteOffset, r.byteLength); }, me = new TextEncoder, ds = function (r) { return Object.fromEntries(Object.entries(r).map(function (_b) {
    var e = _b[0], t = _b[1];
    return [t, e];
})); }, Se = { bt709: 1, bt470bg: 5, smpte170m: 6, bt2020: 9, smpte432: 12 }, Kt = ds(Se), xe = { bt709: 1, smpte170m: 6, linear: 8, "iec61966-2-1": 13, pg: 16, hlg: 18 }, Gt = ds(xe), ye = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6, "bt2020-ncl": 9 }, Xt = ds(ye), Yt = function (r) { return !!r && !!r.primaries && !!r.transfer && !!r.matrix && r.fullRange !== void 0; }, Ge = function (r) { return r instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer || ArrayBuffer.isView(r); }, ae = /** @class */ (function () {
    function class_1() {
        this.currentPromise = Promise.resolve();
    }
    class_1.prototype.acquire = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, s; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    t = new Promise(function (i) { e = i; }), s = this.currentPromise;
                    this.currentPromise = t;
                    return [4 /*yield*/, s];
                case 1: return [2 /*return*/, (_b.sent(), e)];
            }
        }); });
    };
    return class_1;
}()), ls = function (r) { return __spreadArray([], r, true).map(function (e) { return e.toString(16).padStart(2, "0"); }).join(""); }, us = function (r) { return (r = r >> 1 & 1431655765 | (r & 1431655765) << 1, r = r >> 2 & 858993459 | (r & 858993459) << 2, r = r >> 4 & 252645135 | (r & 252645135) << 4, r = r >> 8 & 16711935 | (r & 16711935) << 8, r = r >> 16 & 65535 | (r & 65535) << 16, r >>> 0); }, L = function (r, e, t) { var s = 0, i = r.length - 1, n = -1; for (; s <= i;) {
    var a = s + i >> 1, o = t(r[a]);
    o === e ? (n = a, i = a - 1) : o < e ? s = a + 1 : i = a - 1;
} return n; }, O = function (r, e, t) { var s = 0, i = r.length - 1, n = -1; for (; s <= i;) {
    var a = s + (i - s + 1) / 2 | 0;
    t(r[a]) <= e ? (n = a, s = a + 1) : i = a - 1;
} return n; }, N = function () { var r, e; return { promise: new Promise(function (s, i) { r = s, e = i; }), resolve: r, reject: e }; }, pi = function (r, e) { var t = r.indexOf(e); t !== -1 && r.splice(t, 1); }, ms = function (r, e) { for (var t = r.length - 1; t >= 0; t--)
    if (e(r[t]))
        return r[t]; }, Zt = function (r, e) { for (var t = r.length - 1; t >= 0; t--)
    if (e(r[t]))
        return t; return -1; }, gi = function (r) { return __asyncGenerator(this, arguments, function () { var _b; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            if (!(Symbol.iterator in r)) return [3 /*break*/, 3];
            return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(r[Symbol.iterator]())))];
        case 1: return [4 /*yield*/, __await.apply(void 0, [_c.sent()])];
        case 2:
            _b = _c.sent();
            return [3 /*break*/, 6];
        case 3: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(r[Symbol.asyncIterator]())))];
        case 4: return [4 /*yield*/, __await.apply(void 0, [_c.sent()])];
        case 5:
            _b = _c.sent();
            _c.label = 6;
        case 6:
            _b;
            return [2 /*return*/];
    }
}); }); }, wi = function (r) { if (!(Symbol.iterator in r) && !(Symbol.asyncIterator in r))
    throw new TypeError("Argument must be an iterable or async iterable."); }, bt = function (r) { throw new Error("Unexpected value: ".concat(r)); }, hs = function (r, e, t) { var s = r.getUint8(e), i = r.getUint8(e + 1), n = r.getUint8(e + 2); return t ? s | i << 8 | n << 16 : s << 16 | i << 8 | n; }, ki = function (r, e, t) { return hs(r, e, t) << 8 >> 8; }, fs = function (r, e, t, s) { t = t >>> 0, t = t & 16777215, s ? (r.setUint8(e, t & 255), r.setUint8(e + 1, t >>> 8 & 255), r.setUint8(e + 2, t >>> 16 & 255)) : (r.setUint8(e, t >>> 16 & 255), r.setUint8(e + 1, t >>> 8 & 255), r.setUint8(e + 2, t & 255)); }, Ti = function (r, e, t, s) { t = q(t, -8388608, 8388607), t < 0 && (t = t + 16777216 & 16777215), fs(r, e, t, s); }, bi = function (r, e, t, s) { s ? (r.setUint32(e + 0, t, !0), r.setInt32(e + 4, Math.floor(t / Math.pow(2, 32)), !0)) : (r.setInt32(e + 0, Math.floor(t / Math.pow(2, 32)), !0), r.setUint32(e + 4, t, !0)); }, St = function (r, e) {
    var _b;
    return (_b = { next: function () {
                return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, r.next()];
                        case 1:
                            t = _b.sent();
                            return [2 /*return*/, t.done ? { value: void 0, done: !0 } : { value: e(t.value), done: !1 }];
                    }
                }); });
            }, return: function () { return r.return(); }, throw: function (t) { return r.throw(t); } }, _b[Symbol.asyncIterator] = function () { return this; }, _b);
}, q = function (r, e, t) { return Math.max(e, Math.min(t, r)); }, J = "und", Xe = function (r, e) { var t = Math.pow(10, e); return Math.round(r * t) / t; }, xt = function (r, e) { return Math.round(r / e) * e; }, Si = function (r) { var e = 0; for (; r;)
    e++, r >>= 1; return e; }, In = /^[a-z]{3}$/, Ye = function (r) { return In.test(r); }, fe = 1e6 * (1 + Number.EPSILON), Jt = function (r, e) { var t = __assign({}, r); for (var s in e)
    typeof r[s] == "object" && r[s] !== null && typeof e[s] == "object" && e[s] !== null ? t[s] = Jt(r[s], e[s]) : t[s] = e[s]; return t; }, ps = function (r, e, t) { return __awaiter(void 0, void 0, void 0, function () { var s, _loop_1, state_1; return __generator(this, function (_b) {
    switch (_b.label) {
        case 0:
            s = 0;
            _loop_1 = function () {
                var _c, i_1, n_1, _d;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 5]);
                            _c = {};
                            return [4 /*yield*/, fetch(r, e)];
                        case 1: return [2 /*return*/, (_c.value = _f.sent(), _c)];
                        case 2:
                            i_1 = _f.sent();
                            console.error("Retrying failed fetch. Error:", i_1), s++;
                            n_1 = t(s);
                            if (n_1 === null)
                                throw i_1;
                            if (!Number.isFinite(n_1) || n_1 < 0)
                                throw new TypeError("Retry delay must be a non-negative finite number.");
                            _d = n_1 > 0;
                            if (!_d) return [3 /*break*/, 4];
                            return [4 /*yield*/, new Promise(function (a) { return setTimeout(a, 1e3 * n_1); })];
                        case 3:
                            _d = (_f.sent());
                            _f.label = 4;
                        case 4:
                            _d;
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            };
            _b.label = 1;
        case 1: return [5 /*yield**/, _loop_1()];
        case 2:
            state_1 = _b.sent();
            if (typeof state_1 === "object")
                return [2 /*return*/, state_1.value];
            _b.label = 3;
        case 3: return [3 /*break*/, 1];
        case 4: return [2 /*return*/];
    }
}); }); }, xi = function (r, e) { var t = r < 0 ? -1 : 1; r = Math.abs(r); var s = 0, i = 1, n = 1, a = 0, o = r; for (;;) {
    var c = Math.floor(o), l = c * n + s, d = c * a + i;
    if (d > e)
        return { numerator: t * n, denominator: a };
    if (s = n, i = a, n = l, a = d, o = 1 / (o - c), !isFinite(o))
        break;
} return { numerator: t * n, denominator: a }; }, Ae = /** @class */ (function () {
    function Ae() {
        this.currentPromise = Promise.resolve();
    }
    Ae.prototype.call = function (e) { return this.currentPromise = this.currentPromise.then(e); };
    return Ae;
}());
var er = /** @class */ (function () {
    function er() {
    }
    er.supports = function (e, t) { return !1; };
    return er;
}()), tr = /** @class */ (function () {
    function tr() {
    }
    tr.supports = function (e, t) { return !1; };
    return tr;
}()), rr = /** @class */ (function () {
    function rr() {
    }
    rr.supports = function (e, t) { return !1; };
    return rr;
}()), sr = /** @class */ (function () {
    function sr() {
    }
    sr.supports = function (e, t) { return !1; };
    return sr;
}()), yt = [], Ct = [], Ze = [], Je = [], vn = function (r) { if (r.prototype instanceof er)
    yt.push(r);
else if (r.prototype instanceof tr)
    Ct.push(r);
else
    throw new TypeError("Decoder must be a CustomVideoDecoder or CustomAudioDecoder."); }, Rn = function (r) { if (r.prototype instanceof rr)
    Ze.push(r);
else if (r.prototype instanceof sr)
    Je.push(r);
else
    throw new TypeError("Encoder must be a CustomVideoEncoder or CustomAudioEncoder."); };
exports.CustomVideoDecoder = er;
exports.CustomAudioDecoder = tr;
exports.CustomVideoEncoder = rr;
exports.CustomAudioEncoder = sr;
exports.registerDecoder = vn;
exports.registerEncoder = Rn;
var j = ["avc", "hevc", "vp9", "av1", "vp8"], V = ["pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be", "pcm-u8", "pcm-s8", "ulaw", "alaw"], _e = ["aac", "opus", "mp3", "vorbis", "flac"], G = __spreadArray(__spreadArray([], _e, true), V, true), oe = ["webvtt"], yi = [{ maxMacroblocks: 99, maxBitrate: 64e3, level: 10 }, { maxMacroblocks: 396, maxBitrate: 192e3, level: 11 }, { maxMacroblocks: 396, maxBitrate: 384e3, level: 12 }, { maxMacroblocks: 396, maxBitrate: 768e3, level: 13 }, { maxMacroblocks: 396, maxBitrate: 2e6, level: 20 }, { maxMacroblocks: 792, maxBitrate: 4e6, level: 21 }, { maxMacroblocks: 1620, maxBitrate: 4e6, level: 22 }, { maxMacroblocks: 1620, maxBitrate: 1e7, level: 30 }, { maxMacroblocks: 3600, maxBitrate: 14e6, level: 31 }, { maxMacroblocks: 5120, maxBitrate: 2e7, level: 32 }, { maxMacroblocks: 8192, maxBitrate: 2e7, level: 40 }, { maxMacroblocks: 8192, maxBitrate: 5e7, level: 41 }, { maxMacroblocks: 8704, maxBitrate: 5e7, level: 42 }, { maxMacroblocks: 22080, maxBitrate: 135e6, level: 50 }, { maxMacroblocks: 36864, maxBitrate: 24e7, level: 51 }, { maxMacroblocks: 36864, maxBitrate: 24e7, level: 52 }, { maxMacroblocks: 139264, maxBitrate: 24e7, level: 60 }, { maxMacroblocks: 139264, maxBitrate: 48e7, level: 61 }, { maxMacroblocks: 139264, maxBitrate: 8e8, level: 62 }], Ci = [{ maxPictureSize: 36864, maxBitrate: 128e3, tier: "L", level: 30 }, { maxPictureSize: 122880, maxBitrate: 15e5, tier: "L", level: 60 }, { maxPictureSize: 245760, maxBitrate: 3e6, tier: "L", level: 63 }, { maxPictureSize: 552960, maxBitrate: 6e6, tier: "L", level: 90 }, { maxPictureSize: 983040, maxBitrate: 1e7, tier: "L", level: 93 }, { maxPictureSize: 2228224, maxBitrate: 12e6, tier: "L", level: 120 }, { maxPictureSize: 2228224, maxBitrate: 3e7, tier: "H", level: 120 }, { maxPictureSize: 2228224, maxBitrate: 2e7, tier: "L", level: 123 }, { maxPictureSize: 2228224, maxBitrate: 5e7, tier: "H", level: 123 }, { maxPictureSize: 8912896, maxBitrate: 25e6, tier: "L", level: 150 }, { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 150 }, { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "L", level: 153 }, { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 153 }, { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "L", level: 156 }, { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 156 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "L", level: 180 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 180 }, { maxPictureSize: 35651584, maxBitrate: 12e7, tier: "L", level: 183 }, { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 183 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "L", level: 186 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 186 }], Ce = [{ maxPictureSize: 36864, maxBitrate: 2e5, level: 10 }, { maxPictureSize: 73728, maxBitrate: 8e5, level: 11 }, { maxPictureSize: 122880, maxBitrate: 18e5, level: 20 }, { maxPictureSize: 245760, maxBitrate: 36e5, level: 21 }, { maxPictureSize: 552960, maxBitrate: 72e5, level: 30 }, { maxPictureSize: 983040, maxBitrate: 12e6, level: 31 }, { maxPictureSize: 2228224, maxBitrate: 18e6, level: 40 }, { maxPictureSize: 2228224, maxBitrate: 3e7, level: 41 }, { maxPictureSize: 8912896, maxBitrate: 6e7, level: 50 }, { maxPictureSize: 8912896, maxBitrate: 12e7, level: 51 }, { maxPictureSize: 8912896, maxBitrate: 18e7, level: 52 }, { maxPictureSize: 35651584, maxBitrate: 18e7, level: 60 }, { maxPictureSize: 35651584, maxBitrate: 24e7, level: 61 }, { maxPictureSize: 35651584, maxBitrate: 48e7, level: 62 }], _i = [{ maxPictureSize: 147456, maxBitrate: 15e5, tier: "M", level: 0 }, { maxPictureSize: 278784, maxBitrate: 3e6, tier: "M", level: 1 }, { maxPictureSize: 665856, maxBitrate: 6e6, tier: "M", level: 4 }, { maxPictureSize: 1065024, maxBitrate: 1e7, tier: "M", level: 5 }, { maxPictureSize: 2359296, maxBitrate: 12e6, tier: "M", level: 8 }, { maxPictureSize: 2359296, maxBitrate: 3e7, tier: "H", level: 8 }, { maxPictureSize: 2359296, maxBitrate: 2e7, tier: "M", level: 9 }, { maxPictureSize: 2359296, maxBitrate: 5e7, tier: "H", level: 9 }, { maxPictureSize: 8912896, maxBitrate: 3e7, tier: "M", level: 12 }, { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 12 }, { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "M", level: 13 }, { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 13 }, { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "M", level: 14 }, { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 14 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 15 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 15 }, { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 16 }, { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 16 }, { maxPictureSize: 35651584, maxBitrate: 1e8, tier: "M", level: 17 }, { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 17 }, { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 18 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 18 }, { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 19 }, { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 19 }], Ei = ".01.01.01.01.00", Pi = ".0.110.01.01.01.0", ir = function (r, e, t, s) { var _b, _c, _d, _f; if (r === "avc") {
    var n_2 = Math.ceil(e / 16) * Math.ceil(t / 16), a = (_b = yi.find(function (u) { return n_2 <= u.maxMacroblocks && s <= u.maxBitrate; })) !== null && _b !== void 0 ? _b : U(yi), o = a ? a.level : 0, c = "64".padStart(2, "0"), l = "00", d = o.toString(16).padStart(2, "0");
    return "avc1.".concat(c).concat(l).concat(d);
}
else if (r === "hevc") {
    var i = "", a = "6", o_1 = e * t, c = (_c = Ci.find(function (d) { return o_1 <= d.maxPictureSize && s <= d.maxBitrate; })) !== null && _c !== void 0 ? _c : U(Ci);
    return "hev1.".concat(i, "1.").concat(a, ".").concat(c.tier).concat(c.level, ".B0");
}
else {
    if (r === "vp8")
        return "vp8";
    if (r === "vp9") {
        var i = "00", n_3 = e * t, a = (_d = Ce.find(function (c) { return n_3 <= c.maxPictureSize && s <= c.maxBitrate; })) !== null && _d !== void 0 ? _d : U(Ce);
        return "vp09.".concat(i, ".").concat(a.level.toString().padStart(2, "0"), ".08");
    }
    else if (r === "av1") {
        var n_4 = e * t, a = (_f = _i.find(function (l) { return n_4 <= l.maxPictureSize && s <= l.maxBitrate; })) !== null && _f !== void 0 ? _f : U(_i);
        return "av01.0.".concat(a.level.toString().padStart(2, "0")).concat(a.tier, ".08");
    }
} throw new TypeError("Unhandled codec '".concat(r, "'.")); }, Ii = function (r) { var e = r.split("."), t = Number(e[1]), s = Number(e[2]), i = Number(e[3]), n = e[4] ? Number(e[4]) : 1; return [1, 1, t, 2, 1, s, 3, 1, i, 4, 1, n]; }, cr = function (r) { var e = r.split("."), i = (1 << 7) + 1, n = Number(e[1]), a = e[2], o = Number(a.slice(0, -1)), c = (n << 5) + o, l = a.slice(-1) === "H" ? 1 : 0, u = Number(e[3]) === 8 ? 0 : 1, f = 0, h = e[4] ? Number(e[4]) : 0, p = e[5] ? Number(e[5][0]) : 1, w = e[5] ? Number(e[5][1]) : 1, g = e[5] ? Number(e[5][2]) : 0, T = (l << 7) + (u << 6) + (f << 5) + (h << 4) + (p << 3) + (w << 2) + g; return [i, c, T, 0]; }, dr = function (r) { var e = r.codec, t = r.codecDescription, s = r.colorSpace, i = r.avcCodecInfo, n = r.hevcCodecInfo, a = r.vp9CodecInfo, o = r.av1CodecInfo; if (e === "avc") {
    if (i) {
        var c = new Uint8Array([i.avcProfileIndication, i.profileCompatibility, i.avcLevelIndication]);
        return "avc1.".concat(ls(c));
    }
    if (!t || t.byteLength < 4)
        throw new TypeError("AVC decoder description is not provided or is not at least 4 bytes long.");
    return "avc1.".concat(ls(t.subarray(1, 4)));
}
else if (e === "hevc") {
    var c = void 0, l = void 0, d = void 0, u = void 0, f = void 0, h = void 0;
    if (n)
        c = n.generalProfileSpace, l = n.generalProfileIdc, d = us(n.generalProfileCompatibilityFlags), u = n.generalTierFlag, f = n.generalLevelIdc, h = __spreadArray([], n.generalConstraintIndicatorFlags, true);
    else {
        if (!t || t.byteLength < 23)
            throw new TypeError("HEVC decoder description is not provided or is not at least 23 bytes long.");
        var w = Z(t), g = w.getUint8(1);
        c = g >> 6 & 3, l = g & 31, d = us(w.getUint32(2)), u = g >> 5 & 1, f = w.getUint8(12), h = [];
        for (var T = 0; T < 6; T++)
            h.push(w.getUint8(6 + T));
    }
    var p = "hev1.";
    for (p += ["", "A", "B", "C"][c] + l, p += ".", p += d.toString(16).toUpperCase(), p += ".", p += u === 0 ? "L" : "H", p += f; h.length > 0 && h[h.length - 1] === 0;)
        h.pop();
    return h.length > 0 && (p += ".", p += h.map(function (w) { return w.toString(16).toUpperCase(); }).join(".")), p;
}
else {
    if (e === "vp8")
        return "vp8";
    if (e === "vp9") {
        if (!a) {
            var T = r.width * r.height, S = U(Ce).level;
            for (var _b = 0, Ce_1 = Ce; _b < Ce_1.length; _b++) {
                var E = Ce_1[_b];
                if (T <= E.maxPictureSize) {
                    S = E.level;
                    break;
                }
            }
            return "vp09.00.".concat(S.toString().padStart(2, "0"), ".08");
        }
        var c = a.profile.toString().padStart(2, "0"), l = a.level.toString().padStart(2, "0"), d = a.bitDepth.toString().padStart(2, "0"), u = a.chromaSubsampling.toString().padStart(2, "0"), f = a.colourPrimaries.toString().padStart(2, "0"), h = a.transferCharacteristics.toString().padStart(2, "0"), p = a.matrixCoefficients.toString().padStart(2, "0"), w = a.videoFullRangeFlag.toString().padStart(2, "0"), g = "vp09.".concat(c, ".").concat(l, ".").concat(d, ".").concat(u);
        return g += ".".concat(f, ".").concat(h, ".").concat(p, ".").concat(w), g.endsWith(Ei) && (g = g.slice(0, -Ei.length)), g;
    }
    else if (e === "av1") {
        if (!o) {
            var E = r.width * r.height, y = U(Ce).level;
            for (var _c = 0, Ce_2 = Ce; _c < Ce_2.length; _c++) {
                var b = Ce_2[_c];
                if (E <= b.maxPictureSize) {
                    y = b.level;
                    break;
                }
            }
            return "av01.0.".concat(y.toString().padStart(2, "0"), "M.08");
        }
        var c = o.profile, l = o.level.toString().padStart(2, "0"), d = o.tier ? "H" : "M", u = o.bitDepth.toString().padStart(2, "0"), f = o.monochrome ? "1" : "0", h = 100 * o.chromaSubsamplingX + 10 * o.chromaSubsamplingY + 1 * (o.chromaSubsamplingX && o.chromaSubsamplingY ? o.chromaSamplePosition : 0), p = (s === null || s === void 0 ? void 0 : s.primaries) ? Se[s.primaries] : 1, w = (s === null || s === void 0 ? void 0 : s.transfer) ? xe[s.transfer] : 1, g = (s === null || s === void 0 ? void 0 : s.matrix) ? ye[s.matrix] : 1, T = (s === null || s === void 0 ? void 0 : s.fullRange) ? 1 : 0, S = "av01.".concat(c, ".").concat(l).concat(d, ".").concat(u);
        return S += ".".concat(f, ".").concat(h.toString().padStart(3, "0")), S += ".".concat(p.toString().padStart(2, "0")), S += ".".concat(w.toString().padStart(2, "0")), S += ".".concat(g.toString().padStart(2, "0")), S += ".".concat(T), S.endsWith(Pi) && (S = S.slice(0, -Pi.length)), S;
    }
} throw new TypeError("Unhandled codec '".concat(e, "'.")); }, nr = function (r, e, t) { if (r === "aac")
    return e >= 2 && t <= 24e3 ? "mp4a.40.29" : t <= 24e3 ? "mp4a.40.5" : "mp4a.40.2"; if (r === "mp3")
    return "mp3"; if (r === "opus")
    return "opus"; if (r === "vorbis")
    return "vorbis"; if (r === "flac")
    return "flac"; if (V.includes(r))
    return r; throw new TypeError("Unhandled codec '".concat(r, "'.")); }, lr = function (r) { var e = r.codec, t = r.codecDescription, s = r.aacCodecInfo; if (e === "aac") {
    if (!s)
        throw new TypeError("AAC codec info must be provided.");
    return s.isMpeg2 ? "mp4a.67" : "mp4a.40.".concat(gs(t).objectType);
}
else {
    if (e === "mp3")
        return "mp3";
    if (e === "opus")
        return "opus";
    if (e === "vorbis")
        return "vorbis";
    if (e === "flac")
        return "flac";
    if (e && V.includes(e))
        return e;
} throw new TypeError("Unhandled codec '".concat(e, "'.")); }, gs = function (r) { if (!r || r.byteLength < 2)
    throw new TypeError("AAC description must be at least 2 bytes long."); var e = new se(r), t = e.readBits(5); t === 31 && (t = 32 + e.readBits(6)); var s = e.readBits(4), i = null; if (s === 15)
    i = e.readBits(24);
else {
    var o = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
    s < o.length && (i = o[s]);
} var n = e.readBits(4), a = null; return n >= 1 && n <= 7 && (a = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 8 }[n]), { objectType: t, frequencyIndex: s, sampleRate: i, channelConfiguration: n, numberOfChannels: a }; }, et = 48e3, vi = /^pcm-([usf])(\d+)+(be)?$/, X = function (r) { if (m(V.includes(r)), r === "ulaw")
    return { dataType: "ulaw", sampleSize: 1, littleEndian: !0, silentValue: 255 }; if (r === "alaw")
    return { dataType: "alaw", sampleSize: 1, littleEndian: !0, silentValue: 213 }; var e = vi.exec(r); m(e); var t; e[1] === "u" ? t = "unsigned" : e[1] === "s" ? t = "signed" : t = "float"; var s = Number(e[2]) / 8, i = e[3] !== "be", n = r === "pcm-u8" ? Math.pow(2, 7) : 0; return { dataType: t, sampleSize: s, littleEndian: i, silentValue: n }; }, ws = function (r) { return r.startsWith("avc1") || r.startsWith("avc3") ? "avc" : r.startsWith("hev1") || r.startsWith("hvc1") ? "hevc" : r === "vp8" ? "vp8" : r.startsWith("vp09") ? "vp9" : r.startsWith("av01") ? "av1" : r.startsWith("mp4a.40") || r === "mp4a.67" ? "aac" : r === "mp3" || r === "mp4a.69" || r === "mp4a.6B" || r === "mp4a.6b" ? "mp3" : r === "opus" ? "opus" : r === "vorbis" ? "vorbis" : r === "flac" ? "flac" : r === "ulaw" ? "ulaw" : r === "alaw" ? "alaw" : vi.test(r) ? r : r === "webvtt" ? "webvtt" : null; }, ar = function (r) { return r === "avc" ? { avc: { format: "avc" } } : r === "hevc" ? { hevc: { format: "hevc" } } : {}; }, or = function (r) { return r === "aac" ? { aac: { format: "aac" } } : r === "opus" ? { opus: { format: "opus" } } : {}; }, H = /** @class */ (function () {
    function H(e) {
        this._factor = e;
    }
    H.prototype._toVideoBitrate = function (e, t, s) { var i = t * s, n = { avc: 1, hevc: .6, vp9: .6, av1: .4, vp8: 1.2 }, a = 1920 * 1080, o = 3e6, c = Math.pow(i / a, .95), u = o * c * n[e] * this._factor; return Math.ceil(u / 1e3) * 1e3; };
    H.prototype._toAudioBitrate = function (e) { if (V.includes(e) || e === "flac")
        return; var s = { aac: 128e3, opus: 64e3, mp3: 16e4, vorbis: 64e3 }[e]; if (!s)
        throw new Error("Unhandled codec: ".concat(e)); var i = s * this._factor; return e === "aac" ? i = [96e3, 128e3, 16e4, 192e3].reduce(function (a, o) { return Math.abs(o - i) < Math.abs(a - i) ? o : a; }) : e === "opus" || e === "vorbis" ? i = Math.max(6e3, i) : e === "mp3" && (i = [8e3, 16e3, 24e3, 32e3, 4e4, 48e3, 64e3, 8e4, 96e3, 112e3, 128e3, 16e4, 192e3, 224e3, 256e3, 32e4].reduce(function (a, o) { return Math.abs(o - i) < Math.abs(a - i) ? o : a; })), Math.round(i / 1e3) * 1e3; };
    return H;
}()), An = new H(.3), Fn = new H(.6), On = new H(1), ur = new H(2), Bn = new H(4), Mn = ["avc1", "avc3", "hev1", "hvc1", "vp8", "vp09", "av01"], zn = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/, Un = /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/, Dn = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/, Vn = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/, mr = function (r) { if (!r)
    throw new TypeError("Video chunk metadata must be provided."); if (typeof r != "object")
    throw new TypeError("Video chunk metadata must be an object."); if (!r.decoderConfig)
    throw new TypeError("Video chunk metadata must include a decoder configuration."); if (typeof r.decoderConfig != "object")
    throw new TypeError("Video chunk metadata decoder configuration must be an object."); if (typeof r.decoderConfig.codec != "string")
    throw new TypeError("Video chunk metadata decoder configuration must specify a codec string."); if (!Mn.some(function (e) { return r.decoderConfig.codec.startsWith(e); }))
    throw new TypeError("Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in the WebCodecs Codec Registry."); if (!Number.isInteger(r.decoderConfig.codedWidth) || r.decoderConfig.codedWidth <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer)."); if (!Number.isInteger(r.decoderConfig.codedHeight) || r.decoderConfig.codedHeight <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer)."); if (r.decoderConfig.description !== void 0 && !Ge(r.decoderConfig.description))
    throw new TypeError("Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view."); if (r.decoderConfig.colorSpace !== void 0) {
    var e = r.decoderConfig.colorSpace;
    if (typeof e != "object")
        throw new TypeError("Video chunk metadata decoder configuration colorSpace, when provided, must be an object.");
    var t = Object.keys(Se);
    if (e.primaries != null && !t.includes(e.primaries))
        throw new TypeError("Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of ".concat(t.join(", "), "."));
    var s = Object.keys(xe);
    if (e.transfer != null && !s.includes(e.transfer))
        throw new TypeError("Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of ".concat(s.join(", "), "."));
    var i = Object.keys(ye);
    if (e.matrix != null && !i.includes(e.matrix))
        throw new TypeError("Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of ".concat(i.join(", "), "."));
    if (e.fullRange != null && typeof e.fullRange != "boolean")
        throw new TypeError("Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.");
} if (r.decoderConfig.codec.startsWith("avc1") || r.decoderConfig.codec.startsWith("avc3")) {
    if (!zn.test(r.decoderConfig.codec))
        throw new TypeError("Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as specified in Section 3.4 of RFC 6381.");
}
else if (r.decoderConfig.codec.startsWith("hev1") || r.decoderConfig.codec.startsWith("hvc1")) {
    if (!Un.test(r.decoderConfig.codec))
        throw new TypeError("Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as specified in Section E.3 of ISO 14496-15.");
}
else if (r.decoderConfig.codec.startsWith("vp8")) {
    if (r.decoderConfig.codec !== "vp8")
        throw new TypeError('Video chunk metadata decoder configuration codec string for VP8 must be "vp8".');
}
else if (r.decoderConfig.codec.startsWith("vp09")) {
    if (!Dn.test(r.decoderConfig.codec))
        throw new TypeError('Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.');
}
else if (r.decoderConfig.codec.startsWith("av01") && !Vn.test(r.decoderConfig.codec))
    throw new TypeError('Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.'); }, Nn = ["mp4a", "mp3", "opus", "vorbis", "flac", "ulaw", "alaw", "pcm"], Oe = function (r) { if (!r)
    throw new TypeError("Audio chunk metadata must be provided."); if (typeof r != "object")
    throw new TypeError("Audio chunk metadata must be an object."); if (!r.decoderConfig)
    throw new TypeError("Audio chunk metadata must include a decoder configuration."); if (typeof r.decoderConfig != "object")
    throw new TypeError("Audio chunk metadata decoder configuration must be an object."); if (typeof r.decoderConfig.codec != "string")
    throw new TypeError("Audio chunk metadata decoder configuration must specify a codec string."); if (!Nn.some(function (e) { return r.decoderConfig.codec.startsWith(e); }))
    throw new TypeError("Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the WebCodecs Codec Registry."); if (!Number.isInteger(r.decoderConfig.sampleRate) || r.decoderConfig.sampleRate <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer)."); if (!Number.isInteger(r.decoderConfig.numberOfChannels) || r.decoderConfig.numberOfChannels <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer)."); if (r.decoderConfig.description !== void 0 && !Ge(r.decoderConfig.description))
    throw new TypeError("Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view."); if (r.decoderConfig.codec.startsWith("mp4a") && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b") {
    if (!["mp4a.40.2", "mp4a.40.02", "mp4a.40.5", "mp4a.40.05", "mp4a.40.29", "mp4a.67"].includes(r.decoderConfig.codec))
        throw new TypeError("Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.");
    if (!r.decoderConfig.description)
        throw new TypeError("Audio chunk metadata decoder configuration for AAC must include a description, which is expected to be an AudioSpecificConfig as specified in ISO 14496-3.");
}
else if (r.decoderConfig.codec.startsWith("mp3") || r.decoderConfig.codec.startsWith("mp4a")) {
    if (r.decoderConfig.codec !== "mp3" && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b")
        throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".');
}
else if (r.decoderConfig.codec.startsWith("opus")) {
    if (r.decoderConfig.codec !== "opus")
        throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
    if (r.decoderConfig.description && r.decoderConfig.description.byteLength < 18)
        throw new TypeError("Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.");
}
else if (r.decoderConfig.codec.startsWith("vorbis")) {
    if (r.decoderConfig.codec !== "vorbis")
        throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
    if (!r.decoderConfig.description)
        throw new TypeError("Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.");
}
else if (r.decoderConfig.codec.startsWith("flac")) {
    if (r.decoderConfig.codec !== "flac")
        throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
    if (!r.decoderConfig.description || r.decoderConfig.description.byteLength < 42)
        throw new TypeError("Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.");
}
else if ((r.decoderConfig.codec.startsWith("pcm") || r.decoderConfig.codec.startsWith("ulaw") || r.decoderConfig.codec.startsWith("alaw")) && !V.includes(r.decoderConfig.codec))
    throw new TypeError("Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (".concat(V.join(", "), ").")); }, hr = function (r) { if (!r)
    throw new TypeError("Subtitle metadata must be provided."); if (typeof r != "object")
    throw new TypeError("Subtitle metadata must be an object."); if (!r.config)
    throw new TypeError("Subtitle metadata must include a config object."); if (typeof r.config != "object")
    throw new TypeError("Subtitle metadata config must be an object."); if (typeof r.config.description != "string")
    throw new TypeError("Subtitle metadata config description must be a string."); }, Wn = function (r) { if (j.includes(r))
    return fr(r); if (G.includes(r))
    return pr(r); if (oe.includes(r))
    return gr(r); throw new TypeError("Unknown codec '".concat(r, "'.")); }, fr = function (r, _b) {
    var _c = _b === void 0 ? {} : _b, _d = _c.width, e = _d === void 0 ? 1280 : _d, _f = _c.height, t = _f === void 0 ? 720 : _f, _g = _c.bitrate, s = _g === void 0 ? 1e6 : _g;
    return __awaiter(void 0, void 0, void 0, function () { var i, a_1, _h; return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (!j.includes(r))
                    return [2 /*return*/, !1];
                if (!Number.isInteger(e) || e <= 0)
                    throw new TypeError("width must be a positive integer.");
                if (!Number.isInteger(t) || t <= 0)
                    throw new TypeError("height must be a positive integer.");
                if (!(s instanceof H) && (!Number.isInteger(s) || s <= 0))
                    throw new TypeError("bitrate must be a positive integer or a quality.");
                i = s instanceof H ? s._toVideoBitrate(r, e, t) : s;
                if (Ze.length > 0) {
                    a_1 = __assign({ codec: ir(r, e, t, i), width: e, height: t, bitrate: i }, ar(r));
                    if (Ze.some(function (o) { return o.supports(r, a_1); }))
                        return [2 /*return*/, !0];
                }
                if (!(typeof VideoEncoder > "u")) return [3 /*break*/, 1];
                _h = !1;
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, VideoEncoder.isConfigSupported(__assign({ codec: ir(r, e, t, i), width: e, height: t, bitrate: i }, ar(r)))];
            case 2:
                _h = (_j.sent()).supported === !0;
                _j.label = 3;
            case 3: return [2 /*return*/, _h];
        }
    }); });
}, pr = function (r, _b) {
    var _c = _b === void 0 ? {} : _b, _d = _c.numberOfChannels, e = _d === void 0 ? 2 : _d, _f = _c.sampleRate, t = _f === void 0 ? 48e3 : _f, _g = _c.bitrate, s = _g === void 0 ? 128e3 : _g;
    return __awaiter(void 0, void 0, void 0, function () { var i, a_2, _h, _j; return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                if (!G.includes(r))
                    return [2 /*return*/, !1];
                if (!Number.isInteger(e) || e <= 0)
                    throw new TypeError("numberOfChannels must be a positive integer.");
                if (!Number.isInteger(t) || t <= 0)
                    throw new TypeError("sampleRate must be a positive integer.");
                if (!(s instanceof H) && (!Number.isInteger(s) || s <= 0))
                    throw new TypeError("bitrate must be a positive integer.");
                i = s instanceof H ? s._toAudioBitrate(r) : s;
                if (Je.length > 0) {
                    a_2 = __assign({ codec: nr(r, e, t), numberOfChannels: e, sampleRate: t, bitrate: i }, or(r));
                    if (Je.some(function (o) { return o.supports(r, a_2); }))
                        return [2 /*return*/, !0];
                }
                if (!V.includes(r)) return [3 /*break*/, 1];
                _h = !0;
                return [3 /*break*/, 5];
            case 1:
                if (!(typeof AudioEncoder > "u")) return [3 /*break*/, 2];
                _j = !1;
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, AudioEncoder.isConfigSupported(__assign({ codec: nr(r, e, t), numberOfChannels: e, sampleRate: t, bitrate: i }, or(r)))];
            case 3:
                _j = (_k.sent()).supported === !0;
                _k.label = 4;
            case 4:
                _h = _j;
                _k.label = 5;
            case 5: return [2 /*return*/, _h];
        }
    }); });
}, gr = function (r) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_b) {
    return [2 /*return*/, !!oe.includes(r)];
}); }); }, Ln = function () { return __awaiter(void 0, void 0, void 0, function () { var _b, r, e, t; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0: return [4 /*yield*/, Promise.all([Ri(), _t(), Ai()])];
        case 1:
            _b = _c.sent(), r = _b[0], e = _b[1], t = _b[2];
            return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray([], r, true), e, true), t, true)];
    }
}); }); }, Ri = function (r, e) {
    if (r === void 0) { r = j; }
    return __awaiter(void 0, void 0, void 0, function () { var t; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all(r.map(function (s) { return fr(s, e); }))];
            case 1:
                t = _b.sent();
                return [2 /*return*/, r.filter(function (s, i) { return t[i]; })];
        }
    }); });
}, _t = function (r, e) {
    if (r === void 0) { r = G; }
    return __awaiter(void 0, void 0, void 0, function () { var t; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all(r.map(function (s) { return pr(s, e); }))];
            case 1:
                t = _b.sent();
                return [2 /*return*/, r.filter(function (s, i) { return t[i]; })];
        }
    }); });
}, Ai = function (r) {
    if (r === void 0) { r = oe; }
    return __awaiter(void 0, void 0, void 0, function () { var e; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all(r.map(gr))];
            case 1:
                e = _b.sent();
                return [2 /*return*/, r.filter(function (t, s) { return e[s]; })];
        }
    }); });
}, ks = function (r, e) { return __awaiter(void 0, void 0, void 0, function () { var _b, r_1, t; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = 0, r_1 = r;
            _c.label = 1;
        case 1:
            if (!(_b < r_1.length)) return [3 /*break*/, 4];
            t = r_1[_b];
            return [4 /*yield*/, fr(t, e)];
        case 2:
            if (_c.sent())
                return [2 /*return*/, t];
            _c.label = 3;
        case 3:
            _b++;
            return [3 /*break*/, 1];
        case 4: return [2 /*return*/, null];
    }
}); }); }, Hn = function (r, e) { return __awaiter(void 0, void 0, void 0, function () { var _b, r_2, t; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = 0, r_2 = r;
            _c.label = 1;
        case 1:
            if (!(_b < r_2.length)) return [3 /*break*/, 4];
            t = r_2[_b];
            return [4 /*yield*/, pr(t, e)];
        case 2:
            if (_c.sent())
                return [2 /*return*/, t];
            _c.label = 3;
        case 3:
            _b++;
            return [3 /*break*/, 1];
        case 4: return [2 /*return*/, null];
    }
}); }); }, $n = function (r) { return __awaiter(void 0, void 0, void 0, function () { var _b, r_3, e; return __generator(this, function (_c) {
    switch (_c.label) {
        case 0:
            _b = 0, r_3 = r;
            _c.label = 1;
        case 1:
            if (!(_b < r_3.length)) return [3 /*break*/, 4];
            e = r_3[_b];
            return [4 /*yield*/, gr(e)];
        case 2:
            if (_c.sent())
                return [2 /*return*/, e];
            _c.label = 3;
        case 3:
            _b++;
            return [3 /*break*/, 1];
        case 4: return [2 /*return*/, null];
    }
}); }); };
exports.VIDEO_CODECS = j;
exports.PCM_AUDIO_CODECS = V;
exports.NON_PCM_AUDIO_CODECS = _e;
exports.AUDIO_CODECS = G;
exports.SUBTITLE_CODECS = oe;
exports.Quality = H;
exports.QUALITY_VERY_LOW = An;
exports.QUALITY_LOW = Fn;
exports.QUALITY_MEDIUM = On;
exports.QUALITY_HIGH = ur;
exports.QUALITY_VERY_HIGH = Bn;
exports.canEncode = Wn;
exports.canEncodeVideo = fr;
exports.canEncodeAudio = pr;
exports.canEncodeSubtitles = gr;
exports.getEncodableCodecs = Ln;
exports.getEncodableVideoCodecs = Ri;
exports.getEncodableAudioCodecs = _t;
exports.getEncodableSubtitleCodecs = Ai;
exports.getFirstEncodableVideoCodec = ks;
exports.getFirstEncodableAudioCodec = Hn;
exports.getFirstEncodableSubtitleCodec = $n;
var Et = /(?:(.+?)\n)?((?:\d{2}:)?\d{2}:\d{2}.\d{3})\s+-->\s+((?:\d{2}:)?\d{2}:\d{2}.\d{3})/g, Qn = /^WEBVTT(.|\n)*?\n{2}/, tt = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g, wr = /** @class */ (function () {
    function class_2(e) {
        this.preambleText = null, this.preambleEmitted = !1, this.options = e;
    }
    class_2.prototype.parse = function (e) {
        var _b;
        e = e.replaceAll("\r\n", "\n").replaceAll("\r", "\n"), Et.lastIndex = 0;
        var t;
        if (!this.preambleText) {
            if (!Qn.test(e))
                throw new Error("WebVTT preamble incorrect.");
            t = Et.exec(e);
            var s = e.slice(0, (_b = t === null || t === void 0 ? void 0 : t.index) !== null && _b !== void 0 ? _b : e.length).trimEnd();
            if (!s)
                throw new Error("No WebVTT preamble provided.");
            this.preambleText = s, t && (e = e.slice(t.index), Et.lastIndex = 0);
        }
        for (; t = Et.exec(e);) {
            var s = e.slice(0, t.index), i = t[1], n = t.index + t[0].length, a = e.indexOf("\n", n) + 1, o = e.slice(n, a).trim(), c = e.indexOf("\n\n", n);
            c === -1 && (c = e.length);
            var l = kr(t[2]), u = kr(t[3]) - l, f = e.slice(a, c).trim();
            e = e.slice(c).trimStart(), Et.lastIndex = 0;
            var h = { timestamp: l / 1e3, duration: u / 1e3, text: f, identifier: i, settings: o, notes: s }, p = {};
            this.preambleEmitted || (p.config = { description: this.preambleText }, this.preambleEmitted = !0), this.options.output(h, p);
        }
    };
    return class_2;
}()), qn = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/, kr = function (r) { var e = qn.exec(r); if (!e)
    throw new Error("Expected match."); return 60 * 60 * 1e3 * Number(e[1] || "0") + 60 * 1e3 * Number(e[2]) + 1e3 * Number(e[3]) + Number(e[4]); }, Tr = function (r) { var e = Math.floor(r / 36e5), t = Math.floor(r % (60 * 60 * 1e3) / (60 * 1e3)), s = Math.floor(r % (60 * 1e3) / 1e3), i = r % 1e3; return e.toString().padStart(2, "0") + ":" + t.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0") + "." + i.toString().padStart(3, "0"); };
var Ss = function (r) { var e = [], t = 0; for (; t < r.length;) {
    var s = -1, i = 0;
    for (var n = t; n < r.length - 3; n++) {
        if (r[n] === 0 && r[n + 1] === 0 && r[n + 2] === 1) {
            s = n, i = 3;
            break;
        }
        if (n < r.length - 4 && r[n] === 0 && r[n + 1] === 0 && r[n + 2] === 0 && r[n + 3] === 1) {
            s = n, i = 4;
            break;
        }
    }
    if (s === -1)
        break;
    if (t > 0 && s > t) {
        var n = r.subarray(t, s);
        n.length > 0 && e.push(n);
    }
    t = s + i;
} if (t < r.length) {
    var s = r.subarray(t);
    s.length > 0 && e.push(s);
} return e; }, bs = function (r) { var e = [], t = r.length; for (var s = 0; s < t; s++)
    s + 2 < t && r[s] === 0 && r[s + 1] === 0 && r[s + 2] === 3 ? (e.push(0, 0), s += 2) : e.push(r[s]); return new Uint8Array(e); }, zi = function (r) { var t = Ss(r); if (t.length === 0)
    return null; var s = 0; for (var _b = 0, t_1 = t; _b < t_1.length; _b++) {
    var o = t_1[_b];
    s += 4 + o.byteLength;
} var i = new Uint8Array(s), n = new DataView(i.buffer), a = 0; for (var _c = 0, t_2 = t; _c < t_2.length; _c++) {
    var o = t_2[_c];
    var c = o.byteLength;
    n.setUint32(a, c, !1), a += 4, i.set(o, a), a += o.byteLength;
} return i; }, Ts = function (r) { return r[0] & 31; }, br = function (r) { try {
    var e = Ss(r), t = e.filter(function (f) { return Ts(f) === 7; }), s = e.filter(function (f) { return Ts(f) === 8; }), i = e.filter(function (f) { return Ts(f) === 13; });
    if (t.length === 0 || s.length === 0)
        return null;
    var n = t[0], a = new se(bs(n));
    if (a.skipBits(1), a.skipBits(2), a.readBits(5) !== 7)
        return console.error("Invalid SPS NAL unit type"), null;
    var c = a.readAlignedByte(), l = a.readAlignedByte(), d = a.readAlignedByte(), u = { configurationVersion: 1, avcProfileIndication: c, profileCompatibility: l, avcLevelIndication: d, lengthSizeMinusOne: 3, sequenceParameterSets: t, pictureParameterSets: s, chromaFormat: null, bitDepthLumaMinus8: null, bitDepthChromaMinus8: null, sequenceParameterSetExt: null };
    if (c === 100 || c === 110 || c === 122 || c === 144) {
        P(a);
        var f = P(a);
        f === 3 && a.skipBits(1);
        var h = P(a), p = P(a);
        u.chromaFormat = f, u.bitDepthLumaMinus8 = h, u.bitDepthChromaMinus8 = p, u.sequenceParameterSetExt = i;
    }
    return u;
}
catch (e) {
    return console.error("Error building AVC Decoder Configuration Record:", e), null;
} }, Ui = function (r) { var e = []; e.push(r.configurationVersion), e.push(r.avcProfileIndication), e.push(r.profileCompatibility), e.push(r.avcLevelIndication), e.push(252 | r.lengthSizeMinusOne & 3), e.push(224 | r.sequenceParameterSets.length & 31); for (var _b = 0, _c = r.sequenceParameterSets; _b < _c.length; _b++) {
    var t = _c[_b];
    var s = t.byteLength;
    e.push(s >> 8), e.push(s & 255);
    for (var i = 0; i < s; i++)
        e.push(t[i]);
} e.push(r.pictureParameterSets.length); for (var _d = 0, _f = r.pictureParameterSets; _d < _f.length; _d++) {
    var t = _f[_d];
    var s = t.byteLength;
    e.push(s >> 8), e.push(s & 255);
    for (var i = 0; i < s; i++)
        e.push(t[i]);
} if (r.avcProfileIndication === 100 || r.avcProfileIndication === 110 || r.avcProfileIndication === 122 || r.avcProfileIndication === 144) {
    m(r.chromaFormat !== null), m(r.bitDepthLumaMinus8 !== null), m(r.bitDepthChromaMinus8 !== null), m(r.sequenceParameterSetExt !== null), e.push(252 | r.chromaFormat & 3), e.push(248 | r.bitDepthLumaMinus8 & 7), e.push(248 | r.bitDepthChromaMinus8 & 7), e.push(r.sequenceParameterSetExt.length);
    for (var _g = 0, _h = r.sequenceParameterSetExt; _g < _h.length; _g++) {
        var t = _h[_g];
        var s = t.byteLength;
        e.push(s >> 8), e.push(s & 255);
        for (var i = 0; i < s; i++)
            e.push(t[i]);
    }
} return new Uint8Array(e); }, Fi = 32, Oi = 33, Bi = 34, jn = 39, Kn = 40, rt = function (r) { return r[0] >> 1 & 63; }, Sr = function (r) { try {
    var e = Ss(r), t = e.filter(function (R) { return rt(R) === Fi; }), s = e.filter(function (R) { return rt(R) === Oi; }), i = e.filter(function (R) { return rt(R) === Bi; }), n = e.filter(function (R) { return rt(R) === jn || rt(R) === Kn; });
    if (s.length === 0 || i.length === 0)
        return null;
    var a = s[0], o = new se(bs(a));
    o.skipBits(16), o.readBits(4);
    var c = o.readBits(3), l = o.readBits(1), _b = Gn(o, c), d = _b.general_profile_space, u = _b.general_tier_flag, f = _b.general_profile_idc, h = _b.general_profile_compatibility_flags, p = _b.general_constraint_indicator_flags, w = _b.general_level_idc;
    P(o);
    var g = P(o);
    g === 3 && o.skipBits(1), P(o), P(o), o.readBits(1) && (P(o), P(o), P(o), P(o));
    var T = P(o), S = P(o);
    P(o);
    var y = o.readBits(1) ? 0 : c;
    for (var R = y; R <= c; R++)
        P(o), P(o), P(o);
    P(o), P(o), P(o), P(o), P(o), P(o), o.readBits(1) && o.readBits(1) && Xn(o), o.skipBits(1), o.skipBits(1), o.readBits(1) && (o.skipBits(4), o.skipBits(4), P(o), P(o), o.skipBits(1));
    var b = P(o);
    if (Yn(o, b), o.readBits(1)) {
        var R = P(o);
        for (var v = 0; v < R; v++)
            P(o), o.skipBits(1);
    }
    o.skipBits(1), o.skipBits(1);
    var x = 0;
    o.readBits(1) && (x = Jn(o, c));
    var C = 0;
    if (i.length > 0) {
        var R = i[0], v = new se(bs(R));
        v.skipBits(16), P(v), P(v), v.skipBits(1), v.skipBits(1), v.skipBits(3), v.skipBits(1), v.skipBits(1), P(v), P(v), Ke(v), v.skipBits(1), v.skipBits(1), v.readBits(1) && P(v), Ke(v), Ke(v), v.skipBits(1), v.skipBits(1), v.skipBits(1), v.skipBits(1);
        var $ = v.readBits(1), be = v.readBits(1);
        !$ && !be ? C = 0 : $ && !be ? C = 2 : !$ && be ? C = 3 : C = 0;
    }
    var A = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], t.length ? [{ arrayCompleteness: 1, nalUnitType: Fi, nalUnits: t }] : [], true), s.length ? [{ arrayCompleteness: 1, nalUnitType: Oi, nalUnits: s }] : [], true), i.length ? [{ arrayCompleteness: 1, nalUnitType: Bi, nalUnits: i }] : [], true), n.length ? [{ arrayCompleteness: 1, nalUnitType: rt(n[0]), nalUnits: n }] : [], true);
    return { configurationVersion: 1, generalProfileSpace: d, generalTierFlag: u, generalProfileIdc: f, generalProfileCompatibilityFlags: h, generalConstraintIndicatorFlags: p, generalLevelIdc: w, minSpatialSegmentationIdc: x, parallelismType: C, chromaFormatIdc: g, bitDepthLumaMinus8: T, bitDepthChromaMinus8: S, avgFrameRate: 0, constantFrameRate: 0, numTemporalLayers: c + 1, temporalIdNested: l, lengthSizeMinusOne: 3, arrays: A };
}
catch (e) {
    return console.error("Error building HEVC Decoder Configuration Record:", e), null;
} }, Gn = function (r, e) { var t = r.readBits(2), s = r.readBits(1), i = r.readBits(5), n = 0; for (var d = 0; d < 32; d++)
    n = n << 1 | r.readBits(1); var a = new Uint8Array(6); for (var d = 0; d < 6; d++)
    a[d] = r.readBits(8); var o = r.readBits(8), c = [], l = []; for (var d = 0; d < e; d++)
    c.push(r.readBits(1)), l.push(r.readBits(1)); if (e > 0)
    for (var d = e; d < 8; d++)
        r.skipBits(2); for (var d = 0; d < e; d++)
    c[d] && r.skipBits(88), l[d] && r.skipBits(8); return { general_profile_space: t, general_tier_flag: s, general_profile_idc: i, general_profile_compatibility_flags: n, general_constraint_indicator_flags: a, general_level_idc: o }; }, Xn = function (r) { for (var e = 0; e < 4; e++)
    for (var t = 0; t < (e === 3 ? 2 : 6); t++)
        if (!r.readBits(1))
            P(r);
        else {
            var i = Math.min(64, 1 << 4 + (e << 1));
            e > 1 && Ke(r);
            for (var n = 0; n < i; n++)
                Ke(r);
        } }, Yn = function (r, e) { var t = []; for (var s = 0; s < e; s++)
    t[s] = Zn(r, s, e, t); }, Zn = function (r, e, t, s) { var _b; var i = 0, n = 0, a = 0; if (e !== 0 && (n = r.readBits(1)), n) {
    if (e === t) {
        var c = P(r);
        a = e - (c + 1);
    }
    else
        a = e - 1;
    r.readBits(1), P(r);
    var o = (_b = s[a]) !== null && _b !== void 0 ? _b : 0;
    for (var c = 0; c <= o; c++)
        r.readBits(1) || r.readBits(1);
    i = s[a];
}
else {
    var o = P(r), c = P(r);
    for (var l = 0; l < o; l++)
        P(r), r.readBits(1);
    for (var l = 0; l < c; l++)
        P(r), r.readBits(1);
    i = o + c;
} return i; }, Jn = function (r, e) { if (r.readBits(1) && r.readBits(8) === 255 && (r.readBits(16), r.readBits(16)), r.readBits(1) && r.readBits(1), r.readBits(1) && (r.readBits(3), r.readBits(1), r.readBits(1) && (r.readBits(8), r.readBits(8), r.readBits(8))), r.readBits(1) && (P(r), P(r)), r.readBits(1), r.readBits(1), r.readBits(1), r.readBits(1) && (P(r), P(r), P(r), P(r)), r.readBits(1) && (r.readBits(32), r.readBits(32), r.readBits(1) && P(r), r.readBits(1) && ea(r, !0, e)), r.readBits(1)) {
    r.readBits(1), r.readBits(1), r.readBits(1);
    var t = P(r);
    return P(r), P(r), P(r), P(r), t;
} return 0; }, ea = function (r, e, t) { var s = !1, i = !1, n = !1; e && (s = r.readBits(1) === 1, i = r.readBits(1) === 1, (s || i) && (n = r.readBits(1) === 1, n && (r.readBits(8), r.readBits(5), r.readBits(1), r.readBits(5)), r.readBits(4), r.readBits(4), n && r.readBits(4), r.readBits(5), r.readBits(5), r.readBits(5))); for (var a = 0; a <= t; a++) {
    var o = r.readBits(1) === 1, c = !0;
    o || (c = r.readBits(1) === 1);
    var l = !1;
    c ? P(r) : l = r.readBits(1) === 1;
    var d = 1;
    l || (d = P(r) + 1), s && Mi(r, d, n), i && Mi(r, d, n);
} }, Mi = function (r, e, t) { for (var s = 0; s < e; s++)
    P(r), P(r), t && (P(r), P(r)), r.readBits(1); }, Di = function (r) { var e = []; e.push(r.configurationVersion), e.push((r.generalProfileSpace & 3) << 6 | (r.generalTierFlag & 1) << 5 | r.generalProfileIdc & 31), e.push(r.generalProfileCompatibilityFlags >>> 24 & 255), e.push(r.generalProfileCompatibilityFlags >>> 16 & 255), e.push(r.generalProfileCompatibilityFlags >>> 8 & 255), e.push(r.generalProfileCompatibilityFlags & 255), e.push.apply(e, r.generalConstraintIndicatorFlags), e.push(r.generalLevelIdc & 255), e.push(240 | r.minSpatialSegmentationIdc >> 8 & 15), e.push(r.minSpatialSegmentationIdc & 255), e.push(252 | r.parallelismType & 3), e.push(252 | r.chromaFormatIdc & 3), e.push(248 | r.bitDepthLumaMinus8 & 7), e.push(248 | r.bitDepthChromaMinus8 & 7), e.push(r.avgFrameRate >> 8 & 255), e.push(r.avgFrameRate & 255), e.push((r.constantFrameRate & 3) << 6 | (r.numTemporalLayers & 7) << 3 | (r.temporalIdNested & 1) << 2 | r.lengthSizeMinusOne & 3), e.push(r.arrays.length & 255); for (var _b = 0, _c = r.arrays; _b < _c.length; _b++) {
    var t = _c[_b];
    e.push((t.arrayCompleteness & 1) << 7 | 0 | t.nalUnitType & 63), e.push(t.nalUnits.length >> 8 & 255), e.push(t.nalUnits.length & 255);
    for (var _d = 0, _f = t.nalUnits; _d < _f.length; _d++) {
        var s = _f[_d];
        e.push(s.length >> 8 & 255), e.push(s.length & 255);
        for (var i = 0; i < s.length; i++)
            e.push(s[i]);
    }
} return new Uint8Array(e); }, xr = function (r) { var e = r[r.length - 1]; if (e && (e & 224) === 192) {
    var C = ((e & 24) >> 3) + 1, I = 2 + ((e & 7) + 1) * C;
    if (r[r.length - I] !== e)
        return null;
    var R = 0, v = r.length - I + 1;
    for (var $ = 0; $ < C; $++) {
        if (!r[v + $])
            return null;
        R |= r[v + $] << 8 * $;
    }
    r = r.subarray(0, R);
} var t = new se(r); if (t.readBits(2) !== 2)
    return null; var i = t.readBits(1), a = (t.readBits(1) << 1) + i; if (a === 3 && t.skipBits(1), t.readBits(1) === 1 || t.readBits(1) !== 0 || (t.skipBits(2), t.readBits(24) !== 4817730))
    return null; var d = 8; a >= 2 && (d = t.readBits(1) ? 12 : 10); var u = t.readBits(3), f = 0, h = 0; if (u !== 7)
    if (h = t.readBits(1), a === 1 || a === 3) {
        var A = t.readBits(1), I = t.readBits(1);
        f = !A && !I ? 3 : A && !I ? 2 : 1, t.skipBits(1);
    }
    else
        f = 1;
else
    f = 3, h = 1; var p = t.readBits(16), w = t.readBits(16), g = p + 1, T = w + 1, S = g * T, E = U(Ce).level; for (var _b = 0, Ce_3 = Ce; _b < Ce_3.length; _b++) {
    var C = Ce_3[_b];
    if (S <= C.maxPictureSize) {
        E = C.level;
        break;
    }
} return { profile: a, level: E, bitDepth: d, chromaSubsampling: f, videoFullRangeFlag: h, colourPrimaries: u === 2 ? 1 : u === 1 ? 6 : 2, transferCharacteristics: u === 2 ? 1 : u === 1 ? 6 : 2, matrixCoefficients: u === 7 ? 0 : u === 2 ? 1 : u === 1 ? 6 : 2 }; }, yr = function (r) { var e = new se(r), t = function () { var s = 0; for (var i = 0; i < 8; i++) {
    var n = e.readAlignedByte();
    if (n === void 0)
        return 0;
    if (s |= (n & 127) << i * 7, !(n & 128))
        break;
    if (i === 7 && n & 128)
        return null;
} return s >= Math.pow(2, 32) - 1 ? null : s; }; for (; e.getBitsLeft() >= 8;) {
    var s = e.readBits(8), i = s >> 3 & 15, n = s >> 2 & 1, a = s >> 1 & 1;
    n && e.skipBits(8);
    var o = void 0;
    if (a) {
        var c = t();
        if (c === null)
            return null;
        o = c;
    }
    else
        o = Math.floor(e.getBitsLeft() / 8);
    if (i === 1) {
        var c = e.readBits(3), l = e.readBits(1), d = e.readBits(1), u = 0, f = 0, h = 0;
        if (d)
            u = e.readBits(5);
        else {
            if (e.readBits(1) && (e.skipBits(32), e.skipBits(32), e.readBits(1)))
                return null;
            var b = e.readBits(1);
            b && (h = e.readBits(5), e.skipBits(32), e.skipBits(5), e.skipBits(5));
            var x = e.readBits(5);
            for (var C = 0; C <= x; C++) {
                e.skipBits(12);
                var A = e.readBits(5);
                if (C === 0 && (u = A), A > 7) {
                    var R = e.readBits(1);
                    C === 0 && (f = R);
                }
                if (b && e.readBits(1)) {
                    var v = h + 1;
                    e.skipBits(v), e.skipBits(v), e.skipBits(1);
                }
                e.readBits(1) && e.skipBits(4);
            }
        }
        var p = e.readBits(1), w = 8;
        c === 2 && p ? w = e.readBits(1) ? 12 : 10 : c <= 2 && (w = p ? 10 : 8);
        var g = 0;
        c !== 1 && (g = e.readBits(1));
        var T = 1, S = 1, E = 0;
        return g || (c === 0 ? (T = 1, S = 1) : c === 1 ? (T = 0, S = 0) : w === 12 && (T = e.readBits(1), T && (S = e.readBits(1))), T && S && (E = e.readBits(2))), { profile: c, level: u, tier: f, bitDepth: w, monochrome: g, chromaSubsamplingX: T, chromaSubsamplingY: S, chromaSamplePosition: E };
    }
    e.skipBits(o * 8);
} return null; }, Be = function (r) { var e = Z(r), t = e.getUint8(9), s = e.getUint16(10, !0), i = e.getUint32(12, !0), n = e.getInt16(16, !0), a = e.getUint8(18), o = null; return a && (o = r.subarray(19, 21 + t)), { outputChannelCount: t, preSkip: s, inputSampleRate: i, outputGain: n, channelMappingFamily: a, channelMappingTable: o }; }, ta = [480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960, 1920, 2880, 480, 960, 480, 960, 120, 240, 480, 960, 120, 240, 480, 960, 120, 240, 480, 960, 120, 240, 480, 960], Vi = function (r) { var e = r[0] >> 3; return { durationInSamples: ta[e] }; }, Cr = function (r) { if (r.length < 7)
    throw new Error("Setup header is too short."); if (r[0] !== 5)
    throw new Error("Wrong packet type in Setup header."); if (String.fromCharCode.apply(String, r.slice(1, 7)) !== "vorbis")
    throw new Error("Invalid packet signature in Setup header."); var t = r.length, s = new Uint8Array(t); for (var u = 0; u < t; u++)
    s[u] = r[t - 1 - u]; var i = new se(s), n = 0; for (; i.getBitsLeft() > 97;)
    if (i.readBits(1) === 1) {
        n = i.pos;
        break;
    } if (n === 0)
    throw new Error("Invalid Setup header: framing bit not found."); var a = 0, o = !1, c = 0; for (; i.getBitsLeft() >= 97;) {
    var u = i.pos, f = i.readBits(8), h = i.readBits(16), p = i.readBits(16);
    if (f > 63 || h !== 0 || p !== 0) {
        i.pos = u;
        break;
    }
    if (i.skipBits(1), a++, a > 64)
        break;
    i.clone().readBits(6) + 1 === a && (o = !0, c = a);
} if (!o)
    throw new Error("Invalid Setup header: mode header not found."); if (c > 63)
    throw new Error("Unsupported mode count: ".concat(c, ".")); var l = c; i.pos = 0, i.skipBits(n); var d = Array(l).fill(0); for (var u = l - 1; u >= 0; u--)
    i.skipBits(40), d[u] = i.readBits(1); return { modeBlockflags: d }; };
var Pt = /** @class */ (function () {
    function class_3(e) {
        this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = new WeakMap;
    }
    class_3.prototype.writeU32 = function (e) { this.helperView.setUint32(0, e, !1), this.writer.write(this.helper.subarray(0, 4)); };
    class_3.prototype.writeU64 = function (e) { this.helperView.setUint32(0, Math.floor(e / Math.pow(2, 32)), !1), this.helperView.setUint32(4, e, !1), this.writer.write(this.helper.subarray(0, 8)); };
    class_3.prototype.writeAscii = function (e) { for (var t = 0; t < e.length; t++)
        this.helperView.setUint8(t % 8, e.charCodeAt(t)), t % 8 === 7 && this.writer.write(this.helper); e.length % 8 !== 0 && this.writer.write(this.helper.subarray(0, e.length % 8)); };
    class_3.prototype.writeBox = function (e) { var _b, _c; if (this.offsets.set(e, this.writer.getPos()), e.contents && !e.children)
        this.writeBoxHeader(e, (_b = e.size) !== null && _b !== void 0 ? _b : e.contents.byteLength + 8), this.writer.write(e.contents);
    else {
        var t = this.writer.getPos();
        if (this.writeBoxHeader(e, 0), e.contents && this.writer.write(e.contents), e.children)
            for (var _d = 0, _f = e.children; _d < _f.length; _d++) {
                var n = _f[_d];
                n && this.writeBox(n);
            }
        var s = this.writer.getPos(), i = (_c = e.size) !== null && _c !== void 0 ? _c : s - t;
        this.writer.seek(t), this.writeBoxHeader(e, i), this.writer.seek(s);
    } };
    class_3.prototype.writeBoxHeader = function (e, t) { this.writeU32(e.largeSize ? 1 : t), this.writeAscii(e.type), e.largeSize && this.writeU64(t); };
    class_3.prototype.measureBoxHeader = function (e) { return 8 + (e.largeSize ? 8 : 0); };
    class_3.prototype.patchBox = function (e) { var t = this.offsets.get(e); m(t !== void 0); var s = this.writer.getPos(); this.writer.seek(t), this.writeBox(e), this.writer.seek(s); };
    class_3.prototype.measureBox = function (e) { if (e.contents && !e.children)
        return this.measureBoxHeader(e) + e.contents.byteLength; {
        var t = this.measureBoxHeader(e);
        if (e.contents && (t += e.contents.byteLength), e.children)
            for (var _b = 0, _c = e.children; _b < _c.length; _b++) {
                var s = _c[_b];
                s && (t += this.measureBox(s));
            }
        return t;
    } };
    return class_3;
}()), M = new Uint8Array(8), ge = new DataView(M.buffer), W = function (r) { return [(r % 256 + 256) % 256]; }, F = function (r) { return (ge.setUint16(0, r, !1), [M[0], M[1]]); }, Wi = function (r) { return (ge.setInt16(0, r, !1), [M[0], M[1]]); }, Li = function (r) { return (ge.setUint32(0, r, !1), [M[1], M[2], M[3]]); }, _ = function (r) { return (ge.setUint32(0, r, !1), [M[0], M[1], M[2], M[3]]); }, ze = function (r) { return (ge.setInt32(0, r, !1), [M[0], M[1], M[2], M[3]]); }, De = function (r) { return (ge.setUint32(0, Math.floor(r / Math.pow(2, 32)), !1), ge.setUint32(4, r, !1), [M[0], M[1], M[2], M[3], M[4], M[5], M[6], M[7]]); }, Hi = function (r) { return (ge.setInt16(0, Math.pow(2, 8) * r, !1), [M[0], M[1]]); }, Ee = function (r) { return (ge.setInt32(0, Math.pow(2, 16) * r, !1), [M[0], M[1], M[2], M[3]]); }, xs = function (r) { return (ge.setInt32(0, Math.pow(2, 30) * r, !1), [M[0], M[1], M[2], M[3]]); }, ys = function (r, e) { var t = [], s = r; do {
    var i = s & 127;
    s >>= 7, t.length > 0 && (i |= 128), t.push(i), e !== void 0 && e--;
} while (s > 0 || e); return t.reverse(); }, ee = function (r, e) {
    if (e === void 0) { e = !1; }
    var t = Array(r.length).fill(null).map(function (s, i) { return r.charCodeAt(i); });
    return e && t.push(0), t;
}, _s = function (r) { var e = null; for (var _b = 0, r_4 = r; _b < r_4.length; _b++) {
    var t = r_4[_b];
    (!e || t.timestamp > e.timestamp) && (e = t);
} return e; }, $i = function (r) { var e = r * (Math.PI / 180), t = Math.round(Math.cos(e)), s = Math.round(Math.sin(e)); return [t, s, 0, -s, t, 0, 0, 0, 1]; }, Qi = $i(0), qi = function (r) { return [Ee(r[0]), Ee(r[1]), xs(r[2]), Ee(r[3]), Ee(r[4]), xs(r[5]), Ee(r[6]), Ee(r[7]), xs(r[8])]; }, B = function (r, e, t) { return ({ type: r, contents: e && new Uint8Array(e.flat(10)), children: t }); }, z = function (r, e, t, s, i) { return B(r, [W(e), Li(t), s !== null && s !== void 0 ? s : []], i); }, ji = function (r) { return r.isQuickTime ? B("ftyp", [ee("qt  "), _(512), ee("qt  ")]) : r.fragmented ? B("ftyp", [ee("iso5"), _(512), ee("iso5"), ee("iso6"), ee("mp41")]) : B("ftyp", [ee("isom"), _(512), ee("isom"), r.holdsAvc ? ee("avc1") : [], ee("mp41")]); }, Er = function (r) { return ({ type: "mdat", largeSize: r }); }, It = function (r, e, t) {
    if (t === void 0) { t = !1; }
    return B("moov", void 0, __spreadArray(__spreadArray([ra(e, r)], r.map(function (s) { return sa(s, e); }), true), [t ? Va(r) : null], false));
}, ra = function (r, e) { var t = Q(Math.max.apply(Math, __spreadArray([0], e.filter(function (a) { return a.samples.length > 0; }).map(function (a) { var o = _s(a.samples); return o.timestamp + o.duration; }), false)), _r), s = Math.max.apply(Math, __spreadArray([0], e.map(function (a) { return a.track.id; }), false)) + 1, i = !Ue(r) || !Ue(t), n = i ? De : _; return z("mvhd", +i, 0, [n(r), n(r), _(_r), n(t), Ee(1), Hi(1), Array(10).fill(0), qi(Qi), Array(24).fill(0), _(s)]); }, sa = function (r, e) { return B("trak", void 0, [ia(r, e), na(r, e)]); }, ia = function (r, e) { var t = _s(r.samples), s = Q(t ? t.timestamp + t.duration : 0, _r), i = !Ue(e) || !Ue(s), n = i ? De : _, a; if (r.type === "video") {
    var o = r.track.metadata.rotation;
    a = $i(o !== null && o !== void 0 ? o : 0);
}
else
    a = Qi; return z("tkhd", +i, 3, [n(e), n(e), _(r.track.id), _(0), n(s), Array(8).fill(0), F(0), F(r.track.id), Hi(r.type === "audio" ? 1 : 0), F(0), qi(a), Ee(r.type === "video" ? r.info.width : 0), Ee(r.type === "video" ? r.info.height : 0)]); }, na = function (r, e) { return B("mdia", void 0, [aa(r, e), da(r), la(r)]); }, aa = function (r, e) { var _b; var t = _s(r.samples), s = Q(t ? t.timestamp + t.duration : 0, r.timescale), i = !Ue(e) || !Ue(s), n = i ? De : _, a = 0; for (var _c = 0, _d = (_b = r.track.metadata.languageCode) !== null && _b !== void 0 ? _b : J; _c < _d.length; _c++) {
    var o = _d[_c];
    a <<= 5, a += o.charCodeAt(0) - 96;
} return z("mdhd", +i, 0, [n(e), n(e), _(r.timescale), n(s), F(a), F(0)]); }, oa = { video: "vide", audio: "soun", subtitle: "text" }, ca = { video: "MediabunnyVideoHandler", audio: "MediabunnySoundHandler", subtitle: "MediabunnyTextHandler" }, da = function (r) { return z("hdlr", 0, 0, [ee("mhlr"), ee(oa[r.type]), _(0), _(0), _(0), ee(ca[r.type], !0)]); }, la = function (r) { return B("minf", void 0, [fa[r.type](), pa(), ka(r)]); }, ua = function () { return z("vmhd", 0, 1, [F(0), F(0), F(0), F(0)]); }, ma = function () { return z("smhd", 0, 0, [F(0), F(0)]); }, ha = function () { return z("nmhd", 0, 0); }, fa = { video: ua, audio: ma, subtitle: ha }, pa = function () { return B("dinf", void 0, [ga()]); }, ga = function () { return z("dref", 0, 0, [_(1)], [wa()]); }, wa = function () { return z("url ", 0, 1); }, ka = function (r) { var e = r.compositionTimeOffsetTable.length > 1 || r.compositionTimeOffsetTable.some(function (t) { return t.sampleCompositionTimeOffset !== 0; }); return B("stbl", void 0, [Ta(r), Fa(r), e ? Ua(r) : null, e ? Da(r) : null, Ba(r), Ma(r), za(r), Oa(r)]); }, Ta = function (r) { var e; if (r.type === "video")
    e = ba(Ka[r.track.source._codec], r);
else if (r.type === "audio") {
    var t = Ji(r.track.source._codec, r.muxer.isQuickTime);
    m(t), e = _a(t, r);
}
else
    r.type === "subtitle" && (e = Ra(Ya[r.track.source._codec], r)); return m(e), z("stsd", 0, 0, [_(1)], [e]); }, ba = function (r, e) { return B(r, [Array(6).fill(0), F(1), F(0), F(0), Array(12).fill(0), F(e.info.width), F(e.info.height), _(4718592), _(4718592), _(0), F(1), Array(32).fill(0), F(24), Wi(65535)], [Ga[e.track.source._codec](e), Yt(e.info.decoderConfig.colorSpace) ? Sa(e) : null]); }, Sa = function (r) { return B("colr", [ee("nclx"), F(Se[r.info.decoderConfig.colorSpace.primaries]), F(xe[r.info.decoderConfig.colorSpace.transfer]), F(ye[r.info.decoderConfig.colorSpace.matrix]), W((r.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7)]); }, xa = function (r) { return r.info.decoderConfig && B("avcC", __spreadArray([], K(r.info.decoderConfig.description), true)); }, ya = function (r) { return r.info.decoderConfig && B("hvcC", __spreadArray([], K(r.info.decoderConfig.description), true)); }, Ni = function (r) { var _b, _c, _d, _f, _g; if (!r.info.decoderConfig)
    return null; var e = r.info.decoderConfig, t = e.codec.split("."), s = Number(t[1]), i = Number(t[2]), n = Number(t[3]), a = t[4] ? Number(t[4]) : 1, o = t[8] ? Number(t[8]) : Number((_c = (_b = e.colorSpace) === null || _b === void 0 ? void 0 : _b.fullRange) !== null && _c !== void 0 ? _c : 0), c = (n << 4) + (a << 1) + o, l = t[5] ? Number(t[5]) : ((_d = e.colorSpace) === null || _d === void 0 ? void 0 : _d.primaries) ? Se[e.colorSpace.primaries] : 2, d = t[6] ? Number(t[6]) : ((_f = e.colorSpace) === null || _f === void 0 ? void 0 : _f.transfer) ? xe[e.colorSpace.transfer] : 2, u = t[7] ? Number(t[7]) : ((_g = e.colorSpace) === null || _g === void 0 ? void 0 : _g.matrix) ? ye[e.colorSpace.matrix] : 2; return z("vpcC", 1, 0, [W(s), W(i), W(c), W(l), W(d), W(u), F(0)]); }, Ca = function (r) { return B("av1C", cr(r.info.decoderConfig.codec)); }, _a = function (r, e) { var _b, _c; var t = 0, s, i = 16; if (V.includes(e.track.source._codec)) {
    var n = e.track.source._codec, a = X(n).sampleSize;
    i = 8 * a, i > 16 && (t = 1);
} return t === 0 ? s = [Array(6).fill(0), F(1), F(t), F(0), _(0), F(e.info.numberOfChannels), F(i), F(0), F(0), F(e.info.sampleRate < Math.pow(2, 16) ? e.info.sampleRate : 0), F(0)] : s = [Array(6).fill(0), F(1), F(t), F(0), _(0), F(e.info.numberOfChannels), F(Math.min(i, 16)), F(0), F(0), F(e.info.sampleRate < Math.pow(2, 16) ? e.info.sampleRate : 0), F(0), _(1), _(i / 8), _(e.info.numberOfChannels * i / 8), _(2)], B(r, s, [(_c = (_b = Xa(e.track.source._codec, e.muxer.isQuickTime)) === null || _b === void 0 ? void 0 : _b(e)) !== null && _c !== void 0 ? _c : null]); }, Cs = function (r) { var e; switch (r.track.source._codec) {
    case "aac":
        e = 64;
        break;
    case "mp3":
        e = 107;
        break;
    case "vorbis":
        e = 221;
        break;
    default: throw new Error("Unhandled audio codec: ".concat(r.track.source._codec));
} var t = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], W(e), true), W(21), true), Li(0), true), _(0), true), _(0), true); if (r.info.decoderConfig.description) {
    var s = K(r.info.decoderConfig.description);
    t = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], t, true), W(5), true), ys(s.byteLength), true), s, true);
} return t = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], F(1), true), W(0), true), W(4), true), ys(t.length), true), t, true), W(6), true), W(1), true), W(2), true), t = __spreadArray(__spreadArray(__spreadArray([], W(3), true), ys(t.length), true), t, true), z("esds", 0, 0, t); }, Me = function (r) { return B("wave", void 0, [Ea(r), Pa(r), B("\0\0\0\0")]); }, Ea = function (r) { return B("frma", [ee(Ji(r.track.source._codec, r.muxer.isQuickTime))]); }, Pa = function (r) { var e = X(r.track.source._codec).littleEndian; return B("enda", [F(+e)]); }, Ia = function (r) { var _b; var e = r.info.numberOfChannels, t = 3840, s = r.info.sampleRate, i = 0, n = 0, a = new Uint8Array(0), o = (_b = r.info.decoderConfig) === null || _b === void 0 ? void 0 : _b.description; if (o) {
    m(o.byteLength >= 18);
    var c = K(o), l = Be(c);
    e = l.outputChannelCount, t = l.preSkip, s = l.inputSampleRate, i = l.outputGain, n = l.channelMappingFamily, l.channelMappingTable && (a = l.channelMappingTable);
} return B("dOps", __spreadArray([W(0), W(e), F(t), _(s), Wi(i), W(n)], a, true)); }, va = function (r) { var _b; var e = (_b = r.info.decoderConfig) === null || _b === void 0 ? void 0 : _b.description; m(e); var t = K(e); return z("dfLa", 0, 0, __spreadArray([], t.subarray(4), true)); }, pe = function (r) { var _b = X(r.track.source._codec), e = _b.littleEndian, t = _b.sampleSize, s = +e; return z("pcmC", 0, 0, [W(s), W(8 * t)]); }, Ra = function (r, e) { return B(r, [Array(6).fill(0), F(1)], [Za[e.track.source._codec](e)]); }, Aa = function (r) { return B("vttC", __spreadArray([], me.encode(r.info.config.description), true)); };
var Fa = function (r) { return z("stts", 0, 0, [_(r.timeToSampleTable.length), r.timeToSampleTable.map(function (e) { return [_(e.sampleCount), _(e.sampleDelta)]; })]); }, Oa = function (r) { if (r.samples.every(function (t) { return t.type === "key"; }))
    return null; var e = __spreadArray([], r.samples.entries(), true).filter(function (_b) {
    var t = _b[1];
    return t.type === "key";
}); return z("stss", 0, 0, [_(e.length), e.map(function (_b) {
        var t = _b[0];
        return _(t + 1);
    })]); }, Ba = function (r) { return z("stsc", 0, 0, [_(r.compactlyCodedChunkTable.length), r.compactlyCodedChunkTable.map(function (e) { return [_(e.firstChunk), _(e.samplesPerChunk), _(1)]; })]); }, Ma = function (r) { if (r.type === "audio" && r.info.requiresPcmTransformation) {
    var e = X(r.track.source._codec).sampleSize;
    return z("stsz", 0, 0, [_(e * r.info.numberOfChannels), _(r.samples.reduce(function (t, s) { return t + Q(s.duration, r.timescale); }, 0))]);
} return z("stsz", 0, 0, [_(0), _(r.samples.length), r.samples.map(function (e) { return _(e.size); })]); }, za = function (r) { return r.finalizedChunks.length > 0 && U(r.finalizedChunks).offset >= Math.pow(2, 32) ? z("co64", 0, 0, [_(r.finalizedChunks.length), r.finalizedChunks.map(function (e) { return De(e.offset); })]) : z("stco", 0, 0, [_(r.finalizedChunks.length), r.finalizedChunks.map(function (e) { return _(e.offset); })]); }, Ua = function (r) { return z("ctts", 1, 0, [_(r.compositionTimeOffsetTable.length), r.compositionTimeOffsetTable.map(function (e) { return [_(e.sampleCount), ze(e.sampleCompositionTimeOffset)]; })]); }, Da = function (r) { var e = 1 / 0, t = -1 / 0, s = 1 / 0, i = -1 / 0; m(r.compositionTimeOffsetTable.length > 0), m(r.samples.length > 0); for (var a = 0; a < r.compositionTimeOffsetTable.length; a++) {
    var o = r.compositionTimeOffsetTable[a];
    e = Math.min(e, o.sampleCompositionTimeOffset), t = Math.max(t, o.sampleCompositionTimeOffset);
} for (var a = 0; a < r.samples.length; a++) {
    var o = r.samples[a];
    s = Math.min(s, Q(o.timestamp, r.timescale)), i = Math.max(i, Q(o.timestamp + o.duration, r.timescale));
} var n = Math.max(-e, 0); return i >= Math.pow(2, 31) ? null : z("cslg", 0, 0, [ze(n), ze(e), ze(t), ze(s), ze(i)]); }, Va = function (r) { return B("mvex", void 0, r.map(Na)); }, Na = function (r) { return z("trex", 0, 0, [_(r.track.id), _(1), _(0), _(0), _(0)]); }, Es = function (r, e) { return B("moof", void 0, __spreadArray([Wa(r)], e.map(La), true)); }, Wa = function (r) { return z("mfhd", 0, 0, [_(r)]); }, Ki = function (r) { var e = 0, t = 0, s = 0, i = 0, n = r.type === "delta"; return t |= +n, n ? e |= 1 : e |= 2, e << 24 | t << 16 | s << 8 | i; }, La = function (r) { return B("traf", void 0, [Ha(r), $a(r), Qa(r)]); }, Ha = function (r) { var _b; m(r.currentChunk); var e = 0; e |= 8, e |= 16, e |= 32, e |= 131072; var t = (_b = r.currentChunk.samples[1]) !== null && _b !== void 0 ? _b : r.currentChunk.samples[0], s = { duration: t.timescaleUnitsToNextSample, size: t.size, flags: Ki(t) }; return z("tfhd", 0, e, [_(r.track.id), _(s.duration), _(s.size), _(s.flags)]); }, $a = function (r) { return (m(r.currentChunk), z("tfdt", 1, 0, [De(Q(r.currentChunk.startTimestamp, r.timescale))])); }, Qa = function (r) { m(r.currentChunk); var e = r.currentChunk.samples.map(function (w) { return w.timescaleUnitsToNextSample; }), t = r.currentChunk.samples.map(function (w) { return w.size; }), s = r.currentChunk.samples.map(Ki), i = r.currentChunk.samples.map(function (w) { return Q(w.timestamp - w.decodeTimestamp, r.timescale); }), n = new Set(e), a = new Set(t), o = new Set(s), c = new Set(i), l = o.size === 2 && s[0] !== s[1], d = n.size > 1, u = a.size > 1, f = !l && o.size > 1, h = c.size > 1 || __spreadArray([], c, true).some(function (w) { return w !== 0; }), p = 0; return p |= 1, p |= 4 * +l, p |= 256 * +d, p |= 512 * +u, p |= 1024 * +f, p |= 2048 * +h, z("trun", 1, p, [_(r.currentChunk.samples.length), _(r.currentChunk.offset - r.currentChunk.moofOffset || 0), l ? _(s[0]) : [], r.currentChunk.samples.map(function (w, g) { return [d ? _(e[g]) : [], u ? _(t[g]) : [], f ? _(s[g]) : [], h ? ze(i[g]) : []]; })]); }, Gi = function (r) { return B("mfra", void 0, __spreadArray(__spreadArray([], r.map(qa), true), [ja()], false)); }, qa = function (r, e) { return z("tfra", 1, 0, [_(r.track.id), _(63), _(r.finalizedChunks.length), r.finalizedChunks.map(function (s) { return [De(Q(s.samples[0].timestamp, r.timescale)), De(s.moofOffset), _(e + 1), _(1), _(1)]; })]); }, ja = function () { return z("mfro", 0, 0, [_(0)]); }, Xi = function () { return B("vtte"); }, Yi = function (r, e, t, s, i) { return B("vttc", void 0, [i !== null ? B("vsid", [ze(i)]) : null, t !== null ? B("iden", __spreadArray([], me.encode(t), true)) : null, e !== null ? B("ctim", __spreadArray([], me.encode(Tr(e)), true)) : null, s !== null ? B("sttg", __spreadArray([], me.encode(s), true)) : null, B("payl", __spreadArray([], me.encode(r), true))]); }, Zi = function (r) { return B("vtta", __spreadArray([], me.encode(r), true)); }, Ka = { avc: "avc1", hevc: "hvc1", vp8: "vp08", vp9: "vp09", av1: "av01" }, Ga = { avc: xa, hevc: ya, vp8: Ni, vp9: Ni, av1: Ca }, Ji = function (r, e) { switch (r) {
    case "aac": return "mp4a";
    case "mp3": return "mp4a";
    case "opus": return "Opus";
    case "vorbis": return "mp4a";
    case "flac": return "fLaC";
    case "ulaw": return "ulaw";
    case "alaw": return "alaw";
    case "pcm-u8": return "raw ";
    case "pcm-s8": return "sowt";
} if (e)
    switch (r) {
        case "pcm-s16": return "sowt";
        case "pcm-s16be": return "twos";
        case "pcm-s24": return "in24";
        case "pcm-s24be": return "in24";
        case "pcm-s32": return "in32";
        case "pcm-s32be": return "in32";
        case "pcm-f32": return "fl32";
        case "pcm-f32be": return "fl32";
        case "pcm-f64": return "fl64";
        case "pcm-f64be": return "fl64";
    }
else
    switch (r) {
        case "pcm-s16": return "ipcm";
        case "pcm-s16be": return "ipcm";
        case "pcm-s24": return "ipcm";
        case "pcm-s24be": return "ipcm";
        case "pcm-s32": return "ipcm";
        case "pcm-s32be": return "ipcm";
        case "pcm-f32": return "fpcm";
        case "pcm-f32be": return "fpcm";
        case "pcm-f64": return "fpcm";
        case "pcm-f64be": return "fpcm";
    } }, Xa = function (r, e) { switch (r) {
    case "aac": return Cs;
    case "mp3": return Cs;
    case "opus": return Ia;
    case "vorbis": return Cs;
    case "flac": return va;
} if (e)
    switch (r) {
        case "pcm-s24": return Me;
        case "pcm-s24be": return Me;
        case "pcm-s32": return Me;
        case "pcm-s32be": return Me;
        case "pcm-f32": return Me;
        case "pcm-f32be": return Me;
        case "pcm-f64": return Me;
        case "pcm-f64be": return Me;
    }
else
    switch (r) {
        case "pcm-s16": return pe;
        case "pcm-s16be": return pe;
        case "pcm-s24": return pe;
        case "pcm-s24be": return pe;
        case "pcm-s32": return pe;
        case "pcm-s32be": return pe;
        case "pcm-f32": return pe;
        case "pcm-f32be": return pe;
        case "pcm-f64": return pe;
        case "pcm-f64be": return pe;
    } return null; }, Ya = { webvtt: "wvtt" }, Za = { webvtt: Aa };
var ce = /** @class */ (function () {
    function ce(e) {
        this.mutex = new ae, this.firstMediaStreamTimestamp = null, this.trackTimestampInfo = new WeakMap, this.output = e;
    }
    ce.prototype.onTrackClose = function (e) { };
    ce.prototype.validateAndNormalizeTimestamp = function (e, t, s) { t += e.source._timestampOffset; var i = this.trackTimestampInfo.get(e); if (!i) {
        if (!s)
            throw new Error("First frame must be a key frame.");
        i = { maxTimestamp: t, maxTimestampBeforeLastKeyFrame: t }, this.trackTimestampInfo.set(e, i);
    } if (t < 0)
        throw new Error("Timestamps must be non-negative (got ".concat(t, "s).")); if (s && (i.maxTimestampBeforeLastKeyFrame = i.maxTimestamp), t < i.maxTimestampBeforeLastKeyFrame)
        throw new Error("Timestamps cannot be smaller than the highest timestamp of the previous run (a run begins with a key frame and ends right before the next key frame). Got ".concat(t, "s, but highest timestamp is ").concat(i.maxTimestampBeforeLastKeyFrame, "s.")); return i.maxTimestamp = Math.max(i.maxTimestamp, t), t; };
    return ce;
}());
var Pr = /** @class */ (function () {
    function class_4() {
        this.ensureMonotonicity = !1, this.trackedWrites = null, this.trackedStart = -1, this.trackedEnd = -1;
    }
    class_4.prototype.start = function () { };
    class_4.prototype.maybeTrackWrites = function (e) { if (!this.trackedWrites)
        return; var t = this.getPos(); if (t < this.trackedStart) {
        if (t + e.byteLength <= this.trackedStart)
            return;
        e = e.subarray(this.trackedStart - t), t = 0;
    } var s = t + e.byteLength - this.trackedStart, i = this.trackedWrites.byteLength; for (; i < s;)
        i *= 2; if (i !== this.trackedWrites.byteLength) {
        var n = new Uint8Array(i);
        n.set(this.trackedWrites, 0), this.trackedWrites = n;
    } this.trackedWrites.set(e, t - this.trackedStart), this.trackedEnd = Math.max(this.trackedEnd, t + e.byteLength); };
    class_4.prototype.startTrackingWrites = function () { this.trackedWrites = new Uint8Array(Math.pow(2, 10)), this.trackedStart = this.getPos(), this.trackedEnd = this.trackedStart; };
    class_4.prototype.stopTrackingWrites = function () { if (!this.trackedWrites)
        throw new Error("Internal error: Can't get tracked writes since nothing was tracked."); var t = { data: this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart), start: this.trackedStart, end: this.trackedEnd }; return this.trackedWrites = null, t; };
    return class_4;
}()), Ps = Math.pow(2, 16), Is = Math.pow(2, 32), st = /** @class */ (function (_super) {
    __extends(class_5, _super);
    function class_5(e) {
        var _this = this;
        if (_this = _super.call(this) || this, _this.pos = 0, _this.maxPos = 0, _this.target = e, _this.supportsResize = "resize" in new ArrayBuffer(0), _this.supportsResize)
            try {
                _this.buffer = new ArrayBuffer(Ps, { maxByteLength: Is });
            }
            catch (_b) {
                _this.buffer = new ArrayBuffer(Ps), _this.supportsResize = !1;
            }
        else
            _this.buffer = new ArrayBuffer(Ps);
        _this.bytes = new Uint8Array(_this.buffer);
        return _this;
    }
    class_5.prototype.ensureSize = function (e) { var t = this.buffer.byteLength; for (; t < e;)
        t *= 2; if (t !== this.buffer.byteLength) {
        if (t > Is)
            throw new Error("ArrayBuffer exceeded maximum size of ".concat(Is, " bytes. Please consider using another target."));
        if (this.supportsResize)
            this.buffer.resize(t);
        else {
            var s = new ArrayBuffer(t), i = new Uint8Array(s);
            i.set(this.bytes, 0), this.buffer = s, this.bytes = i;
        }
    } };
    class_5.prototype.write = function (e) { this.maybeTrackWrites(e), this.ensureSize(this.pos + e.byteLength), this.bytes.set(e, this.pos), this.pos += e.byteLength, this.maxPos = Math.max(this.maxPos, this.pos); };
    class_5.prototype.seek = function (e) { this.pos = e; };
    class_5.prototype.getPos = function () { return this.pos; };
    class_5.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_5.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            this.ensureSize(this.pos), this.target.buffer = this.buffer.slice(0, Math.max(this.maxPos, this.pos));
            return [2 /*return*/];
        }); });
    };
    class_5.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_5.prototype.getSlice = function (e, t) { return this.bytes.slice(e, t); };
    return class_5;
}(Pr)), Ja = Math.pow(2, 24), eo = 2, Ir = /** @class */ (function (_super) {
    __extends(class_6, _super);
    function class_6(e) {
        var _b, _c;
        var _this = this;
        _this = _super.call(this) || this, _this.pos = 0, _this.sections = [], _this.lastWriteEnd = 0, _this.lastFlushEnd = 0, _this.writer = null, _this.chunks = [], _this.target = e, _this.chunked = (_b = e._options.chunked) !== null && _b !== void 0 ? _b : !1, _this.chunkSize = (_c = e._options.chunkSize) !== null && _c !== void 0 ? _c : Ja;
        return _this;
    }
    class_6.prototype.start = function () { this.writer = this.target._writable.getWriter(); };
    class_6.prototype.write = function (e) { if (this.pos > this.lastWriteEnd) {
        var t = this.pos - this.lastWriteEnd;
        this.pos = this.lastWriteEnd, this.write(new Uint8Array(t));
    } this.maybeTrackWrites(e), this.sections.push({ data: e.slice(), start: this.pos }), this.pos += e.byteLength, this.lastWriteEnd = Math.max(this.lastWriteEnd, this.pos); };
    class_6.prototype.seek = function (e) { this.pos = e; };
    class_6.prototype.getPos = function () { return this.pos; };
    class_6.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () { var s, e, t, s, i, n, _b, e_1, s, _c, _d, i, _f; return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (this.pos > this.lastWriteEnd) {
                        s = this.pos - this.lastWriteEnd;
                        this.pos = this.lastWriteEnd, this.write(new Uint8Array(s));
                    }
                    if (m(this.writer), this.sections.length === 0)
                        return [2 /*return*/];
                    e = [], t = __spreadArray([], this.sections, true).sort(function (s, i) { return s.start - i.start; });
                    e.push({ start: t[0].start, size: t[0].data.byteLength });
                    for (s = 1; s < t.length; s++) {
                        i = e[e.length - 1], n = t[s];
                        n.start <= i.start + i.size ? i.size = Math.max(i.size, n.start + n.data.byteLength - i.start) : e.push({ start: n.start, size: n.data.byteLength });
                    }
                    _b = 0, e_1 = e;
                    _g.label = 1;
                case 1:
                    if (!(_b < e_1.length)) return [3 /*break*/, 5];
                    s = e_1[_b];
                    s.data = new Uint8Array(s.size);
                    for (_c = 0, _d = this.sections; _c < _d.length; _c++) {
                        i = _d[_c];
                        s.start <= i.start && i.start < s.start + s.size && s.data.set(i.data, i.start - s.start);
                    }
                    _f = this.writer.desiredSize !== null && this.writer.desiredSize <= 0;
                    if (!_f) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.writer.ready];
                case 2:
                    _f = (_g.sent());
                    _g.label = 3;
                case 3:
                    if (_f, this.chunked)
                        this.writeDataIntoChunks(s.data, s.start), this.tryToFlushChunks();
                    else {
                        if (this.ensureMonotonicity && s.start !== this.lastFlushEnd)
                            throw new Error("Internal error: Monotonicity violation.");
                        this.writer.write({ type: "write", data: s.data, position: s.start }), this.lastFlushEnd = s.start + s.data.byteLength;
                    }
                    _g.label = 4;
                case 4:
                    _b++;
                    return [3 /*break*/, 1];
                case 5:
                    this.sections.length = 0;
                    return [2 /*return*/];
            }
        }); });
    };
    class_6.prototype.writeDataIntoChunks = function (e, t) {
        var _this = this;
        var s = this.chunks.findIndex(function (c) { return c.start <= t && t < c.start + _this.chunkSize; });
        s === -1 && (s = this.createChunk(t));
        var i = this.chunks[s], n = t - i.start, a = e.subarray(0, Math.min(this.chunkSize - n, e.byteLength));
        i.data.set(a, n);
        var o = { start: n, end: n + a.byteLength };
        if (this.insertSectionIntoChunk(i, o), i.written[0].start === 0 && i.written[0].end === this.chunkSize && (i.shouldFlush = !0), this.chunks.length > eo) {
            for (var c = 0; c < this.chunks.length - 1; c++)
                this.chunks[c].shouldFlush = !0;
            this.tryToFlushChunks();
        }
        a.byteLength < e.byteLength && this.writeDataIntoChunks(e.subarray(a.byteLength), t + a.byteLength);
    };
    class_6.prototype.insertSectionIntoChunk = function (e, t) { var s = 0, i = e.written.length - 1, n = -1; for (; s <= i;) {
        var a = Math.floor(s + (i - s + 1) / 2);
        e.written[a].start <= t.start ? (s = a + 1, n = a) : i = a - 1;
    } for (e.written.splice(n + 1, 0, t), (n === -1 || e.written[n].end < t.start) && n++; n < e.written.length - 1 && e.written[n].end >= e.written[n + 1].start;)
        e.written[n].end = Math.max(e.written[n].end, e.written[n + 1].end), e.written.splice(n + 1, 1); };
    class_6.prototype.createChunk = function (e) { var s = { start: Math.floor(e / this.chunkSize) * this.chunkSize, data: new Uint8Array(this.chunkSize), written: [], shouldFlush: !1 }; return this.chunks.push(s), this.chunks.sort(function (i, n) { return i.start - n.start; }), this.chunks.indexOf(s); };
    class_6.prototype.tryToFlushChunks = function (e) {
        if (e === void 0) { e = !1; }
        m(this.writer);
        for (var t = 0; t < this.chunks.length; t++) {
            var s = this.chunks[t];
            if (!(!s.shouldFlush && !e)) {
                for (var _b = 0, _c = s.written; _b < _c.length; _b++) {
                    var i = _c[_b];
                    var n = s.start + i.start;
                    if (this.ensureMonotonicity && n !== this.lastFlushEnd)
                        throw new Error("Internal error: Monotonicity violation.");
                    this.writer.write({ type: "write", data: s.data.subarray(i.start, i.end), position: n }), this.lastFlushEnd = s.start + i.end;
                }
                this.chunks.splice(t--, 1);
            }
        }
    };
    class_6.prototype.finalize = function () { return this.chunked && this.tryToFlushChunks(!0), m(this.writer), this.writer.close(); };
    class_6.prototype.close = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_c) {
            return [2 /*return*/, (_b = this.writer) === null || _b === void 0 ? void 0 : _b.close()];
        }); });
    };
    return class_6;
}(Pr));
var Ve = /** @class */ (function () {
    function Ve() {
        this._output = null;
    }
    return Ve;
}()), vt = /** @class */ (function (_super) {
    __extends(vt, _super);
    function vt() {
        var _this = this;
        _this = _super.apply(this, arguments) || this, _this.buffer = null;
        return _this;
    }
    vt.prototype._createWriter = function () { return new st(this); };
    return vt;
}(Ve)), vs = /** @class */ (function (_super) {
    __extends(vs, _super);
    function vs(e, t) {
        if (t === void 0) { t = {}; }
        var _this = this;
        if (_this = _super.call(this) || this, !(e instanceof WritableStream))
            throw new TypeError("StreamTarget requires a WritableStream instance.");
        if (t != null && typeof t != "object")
            throw new TypeError("StreamTarget options, when provided, must be an object.");
        if (t.chunked !== void 0 && typeof t.chunked != "boolean")
            throw new TypeError("options.chunked, when provided, must be a boolean.");
        if (t.chunkSize !== void 0 && (!Number.isInteger(t.chunkSize) || t.chunkSize < 1024))
            throw new TypeError("options.chunkSize, when provided, must be an integer and not smaller than 1024.");
        _this._writable = e, _this._options = t;
        return _this;
    }
    vs.prototype._createWriter = function () { return new Ir(this); };
    return vs;
}(Ve));
exports.Target = Ve;
exports.BufferTarget = vt;
exports.StreamTarget = vs;
var vr = function (r) { var t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isQuickTime ? "quicktime" : "mp4"); if (r.codecStrings.length > 0) {
    var s = __spreadArray([], new Set(r.codecStrings), true);
    t += "; codecs=\"".concat(s.join(", "), "\"");
} return t; };
var _r = 1e3, to = 2082844800, Q = function (r, e, t) {
    if (t === void 0) { t = !0; }
    var s = r * e;
    return t ? Math.round(s) : s;
}, Rr = /** @class */ (function (_super) {
    __extends(class_7, _super);
    function class_7(e, t) {
        var _b, _c;
        var _this = this;
        _this = _super.call(this, e) || this, _this.auxTarget = new vt, _this.auxWriter = _this.auxTarget._createWriter(), _this.auxBoxWriter = new Pt(_this.auxWriter), _this.mdat = null, _this.trackDatas = [], _this.allTracksKnown = N(), _this.creationTime = Math.floor(Date.now() / 1e3) + to, _this.finalizedChunks = [], _this.nextFragmentNumber = 1, _this.maxWrittenTimestamp = -1 / 0, _this.format = t, _this.writer = e._writer, _this.boxWriter = new Pt(_this.writer), _this.isQuickTime = t instanceof it;
        var s = _this.writer instanceof st ? "in-memory" : !1;
        _this.fastStart = (_b = t._options.fastStart) !== null && _b !== void 0 ? _b : s, _this.isFragmented = _this.fastStart === "fragmented", (_this.fastStart === "in-memory" || _this.isFragmented) && (_this.writer.ensureMonotonicity = !0), _this.minimumFragmentDuration = (_c = t._options.minimumFragmentDuration) !== null && _c !== void 0 ? _c : 1;
        return _this;
    }
    class_7.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, _b, s, i; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _c.sent(), t = this.output._tracks.some(function (s) { return s.type === "video" && s.source._codec === "avc"; });
                    if (this.format._options.onFtyp && this.writer.startTrackingWrites(), this.boxWriter.writeBox(ji({ isQuickTime: this.isQuickTime, holdsAvc: t, fragmented: this.isFragmented })), this.format._options.onFtyp) {
                        _b = this.writer.stopTrackingWrites(), s = _b.data, i = _b.start;
                        this.format._options.onFtyp(s, i);
                    }
                    this.fastStart === "in-memory" ? this.mdat = Er(!1) : this.isFragmented || (this.format._options.onMdat && this.writer.startTrackingWrites(), this.mdat = Er(!0), this.boxWriter.writeBox(this.mdat));
                    return [4 /*yield*/, this.writer.flush()];
                case 2:
                    _c.sent(), e();
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.allTracksAreKnown = function () { var _loop_2 = function (e) {
        if (!e.source._closed && !this_1.trackDatas.some(function (t) { return t.track === e; }))
            return { value: !1 };
    }; var this_1 = this; for (var _b = 0, _c = this.output._tracks; _b < _c.length; _b++) {
        var e = _c[_b];
        var state_2 = _loop_2(e);
        if (typeof state_2 === "object")
            return state_2.value;
    } return !0; };
    class_7.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.allTracksKnown.promise];
                case 1:
                    _b.sent();
                    e = this.trackDatas.map(function (t) { return t.type === "video" || t.type === "audio" ? t.info.decoderConfig.codec : { webvtt: "wvtt" }[t.track.source._codec]; });
                    return [2 /*return*/, vr({ isQuickTime: this.isQuickTime, hasVideo: this.trackDatas.some(function (t) { return t.type === "video"; }), hasAudio: this.trackDatas.some(function (t) { return t.type === "audio"; }), codecStrings: e })];
            }
        }); });
    };
    class_7.prototype.getVideoTrackData = function (e, t, s) { var _b; var i = this.trackDatas.find(function (l) { return l.track === e; }); if (i)
        return i; mr(s), m(s), m(s.decoderConfig); var n = __assign({}, s.decoderConfig); m(n.codedWidth !== void 0), m(n.codedHeight !== void 0); var a = !1; if (e.source._codec === "avc" && !n.description) {
        var l = br(t.data);
        if (!l)
            throw new Error("Couldn't extract an AVCDecoderConfigurationRecord from the AVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.264) when not providing a description, or provide a description (must be an AVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in AVCC format.");
        n.description = Ui(l), a = !0;
    }
    else if (e.source._codec === "hevc" && !n.description) {
        var l = Sr(t.data);
        if (!l)
            throw new Error("Couldn't extract an HEVCDecoderConfigurationRecord from the HEVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.265) when not providing a description, or provide a description (must be an HEVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in HEVC format.");
        n.description = Di(l), a = !0;
    } var o = xi(1 / ((_b = e.metadata.frameRate) !== null && _b !== void 0 ? _b : 57600), 1e6).denominator, c = { muxer: this, track: e, type: "video", info: { width: n.codedWidth, height: n.codedHeight, decoderConfig: n, requiresAnnexBTransformation: a }, timescale: o, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [] }; return this.trackDatas.push(c), this.trackDatas.sort(function (l, d) { return l.track.id - d.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), c; };
    class_7.prototype.getAudioTrackData = function (e, t) { var s = this.trackDatas.find(function (n) { return n.track === e; }); if (s)
        return s; Oe(t), m(t), m(t.decoderConfig); var i = { muxer: this, track: e, type: "audio", info: { numberOfChannels: t.decoderConfig.numberOfChannels, sampleRate: t.decoderConfig.sampleRate, decoderConfig: t.decoderConfig, requiresPcmTransformation: !this.isFragmented && V.includes(e.source._codec) }, timescale: t.decoderConfig.sampleRate, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [] }; return this.trackDatas.push(i), this.trackDatas.sort(function (n, a) { return n.track.id - a.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), i; };
    class_7.prototype.getSubtitleTrackData = function (e, t) { var s = this.trackDatas.find(function (n) { return n.track === e; }); if (s)
        return s; hr(t), m(t), m(t.config); var i = { muxer: this, track: e, type: "subtitle", info: { config: t.config }, timescale: 1e3, samples: [], sampleQueue: [], timestampProcessingQueue: [], timeToSampleTable: [], compositionTimeOffsetTable: [], lastTimescaleUnits: null, lastSample: null, finalizedChunks: [], currentChunk: null, compactlyCodedChunkTable: [], lastCueEndTimestamp: 0, cueQueue: [], nextSourceId: 0, cueToSourceId: new WeakMap }; return this.trackDatas.push(i), this.trackDatas.sort(function (n, a) { return n.track.id - a.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), i; };
    class_7.prototype.addEncodedVideoPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, a, l, o, c; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    n = this.getVideoTrackData(e, t, s), a = t.data;
                    if (n.info.requiresAnnexBTransformation) {
                        l = zi(a);
                        if (!l)
                            throw new Error("Failed to transform packet data. Make sure all packets are provided in Annex B format, as specified in ITU-T-REC-H.264 and ITU-T-REC-H.265.");
                        a = l;
                    }
                    o = this.validateAndNormalizeTimestamp(n.track, t.timestamp, t.type === "key"), c = this.createSampleForTrack(n, a, o, t.duration, t.type);
                    return [4 /*yield*/, this.registerSample(n, c)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    i();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.addEncodedAudioPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, a, o, _b; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 6, 7]);
                    n = this.getAudioTrackData(e, s), a = this.validateAndNormalizeTimestamp(n.track, t.timestamp, t.type === "key"), o = this.createSampleForTrack(n, t.data, a, t.duration, t.type);
                    _b = n.info.requiresPcmTransformation;
                    if (!_b) return [3 /*break*/, 4];
                    return [4 /*yield*/, this.maybePadWithSilence(n, a)];
                case 3:
                    _b = (_c.sent());
                    _c.label = 4;
                case 4:
                    _b;
                    return [4 /*yield*/, this.registerSample(n, o)];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    i();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.maybePadWithSilence = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a, _b, o, c, l, d, u; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    s = U(e.samples), i = s ? s.timestamp + s.duration : 0, n = t - i, a = Q(n, e.timescale);
                    if (!(a > 0)) return [3 /*break*/, 2];
                    _b = X(e.info.decoderConfig.codec), o = _b.sampleSize, c = _b.silentValue, l = a * e.info.numberOfChannels, d = new Uint8Array(o * l).fill(c), u = this.createSampleForTrack(e, new Uint8Array(d.buffer), i, n, "key");
                    return [4 /*yield*/, this.registerSample(e, u)];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.addSubtitleCue = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, _b; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 5, 6]);
                    n = this.getSubtitleTrackData(e, s);
                    this.validateAndNormalizeTimestamp(n.track, t.timestamp, !0);
                    _b = e.source._codec === "webvtt";
                    if (!_b) return [3 /*break*/, 4];
                    n.cueQueue.push(t);
                    return [4 /*yield*/, this.processWebVTTCues(n, t.timestamp)];
                case 3:
                    _b = (_c.sent());
                    _c.label = 4;
                case 4:
                    _b;
                    return [3 /*break*/, 6];
                case 5:
                    i();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.processWebVTTCues = function (e, t) {
        var _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () { var s, _f, _g, l, i, n, a, l, d, u, l, d, u, f, h, w, p, o, c; return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!(e.cueQueue.length > 0)) return [3 /*break*/, 5];
                    s = new Set([]);
                    for (_f = 0, _g = e.cueQueue; _f < _g.length; _f++) {
                        l = _g[_f];
                        m(l.timestamp <= t), m(e.lastCueEndTimestamp <= l.timestamp + l.duration), s.add(Math.max(l.timestamp, e.lastCueEndTimestamp)), s.add(l.timestamp + l.duration);
                    }
                    i = __spreadArray([], s, true).sort(function (l, d) { return l - d; }), n = i[0], a = (_b = i[1]) !== null && _b !== void 0 ? _b : n;
                    if (t < a)
                        return [3 /*break*/, 5];
                    if (!(e.lastCueEndTimestamp < n)) return [3 /*break*/, 2];
                    this.auxWriter.seek(0);
                    l = Xi();
                    this.auxBoxWriter.writeBox(l);
                    d = this.auxWriter.getSlice(0, this.auxWriter.getPos()), u = this.createSampleForTrack(e, d, e.lastCueEndTimestamp, n - e.lastCueEndTimestamp, "key");
                    return [4 /*yield*/, this.registerSample(e, u)];
                case 1:
                    _h.sent(), e.lastCueEndTimestamp = n;
                    _h.label = 2;
                case 2:
                    this.auxWriter.seek(0);
                    for (l = 0; l < e.cueQueue.length; l++) {
                        d = e.cueQueue[l];
                        if (d.timestamp >= a)
                            break;
                        tt.lastIndex = 0;
                        u = tt.test(d.text), f = d.timestamp + d.duration, h = e.cueToSourceId.get(d);
                        if (h === void 0 && a < f && (h = e.nextSourceId++, e.cueToSourceId.set(d, h)), d.notes) {
                            w = Zi(d.notes);
                            this.auxBoxWriter.writeBox(w);
                        }
                        p = Yi(d.text, u ? n : null, (_c = d.identifier) !== null && _c !== void 0 ? _c : null, (_d = d.settings) !== null && _d !== void 0 ? _d : null, h !== null && h !== void 0 ? h : null);
                        this.auxBoxWriter.writeBox(p), f === a && e.cueQueue.splice(l--, 1);
                    }
                    o = this.auxWriter.getSlice(0, this.auxWriter.getPos()), c = this.createSampleForTrack(e, o, n, a - n, "key");
                    return [4 /*yield*/, this.registerSample(e, c)];
                case 3:
                    _h.sent(), e.lastCueEndTimestamp = a;
                    _h.label = 4;
                case 4: return [3 /*break*/, 0];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.createSampleForTrack = function (e, t, s, i, n) { return { timestamp: s, decodeTimestamp: s, duration: i, data: t, size: t.byteLength, type: n, timescaleUnitsToNextSample: Q(i, e.timescale) }; };
    class_7.prototype.processTimestamps = function (e, t) { if (e.timestampProcessingQueue.length === 0)
        return; if (e.type === "audio" && e.info.requiresPcmTransformation) {
        var i = 0;
        for (var n = 0; n < e.timestampProcessingQueue.length; n++) {
            var a = e.timestampProcessingQueue[n], o = Q(a.duration, e.timescale);
            i += o;
        }
        if (e.timeToSampleTable.length === 0)
            e.timeToSampleTable.push({ sampleCount: i, sampleDelta: 1 });
        else {
            var n = U(e.timeToSampleTable);
            n.sampleCount += i;
        }
        e.timestampProcessingQueue.length = 0;
        return;
    } var s = e.timestampProcessingQueue.map(function (i) { return i.timestamp; }).sort(function (i, n) { return i - n; }); for (var i = 0; i < e.timestampProcessingQueue.length; i++) {
        var n = e.timestampProcessingQueue[i];
        n.decodeTimestamp = s[i], !this.isFragmented && e.lastTimescaleUnits === null && (n.decodeTimestamp = 0);
        var a = Q(n.timestamp - n.decodeTimestamp, e.timescale), o = Q(n.duration, e.timescale);
        if (e.lastTimescaleUnits !== null) {
            m(e.lastSample);
            var c = Q(n.decodeTimestamp, e.timescale, !1), l = Math.round(c - e.lastTimescaleUnits);
            if (m(l >= 0), e.lastTimescaleUnits += l, e.lastSample.timescaleUnitsToNextSample = l, !this.isFragmented) {
                var d = U(e.timeToSampleTable);
                if (m(d), d.sampleCount === 1) {
                    d.sampleDelta = l;
                    var f = e.timeToSampleTable[e.timeToSampleTable.length - 2];
                    f && f.sampleDelta === l && (f.sampleCount++, e.timeToSampleTable.pop(), d = f);
                }
                else
                    d.sampleDelta !== l && (d.sampleCount--, e.timeToSampleTable.push(d = { sampleCount: 1, sampleDelta: l }));
                d.sampleDelta === o ? d.sampleCount++ : e.timeToSampleTable.push({ sampleCount: 1, sampleDelta: o });
                var u = U(e.compositionTimeOffsetTable);
                m(u), u.sampleCompositionTimeOffset === a ? u.sampleCount++ : e.compositionTimeOffsetTable.push({ sampleCount: 1, sampleCompositionTimeOffset: a });
            }
        }
        else
            e.lastTimescaleUnits = Q(n.decodeTimestamp, e.timescale, !1), this.isFragmented || (e.timeToSampleTable.push({ sampleCount: 1, sampleDelta: o }), e.compositionTimeOffsetTable.push({ sampleCount: 1, sampleCompositionTimeOffset: a }));
        e.lastSample = n;
    } if (e.timestampProcessingQueue.length = 0, m(e.lastSample), m(e.lastTimescaleUnits !== null), t !== void 0 && e.lastSample.timescaleUnitsToNextSample === 0) {
        m(t.type === "key");
        var i = Q(t.timestamp, e.timescale, !1), n = Math.round(i - e.lastTimescaleUnits);
        e.lastSample.timescaleUnitsToNextSample = n;
    } };
    class_7.prototype.registerSample = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var _b; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    t.type === "key" && this.processTimestamps(e, t), e.timestampProcessingQueue.push(t);
                    if (!this.isFragmented) return [3 /*break*/, 2];
                    e.sampleQueue.push(t);
                    return [4 /*yield*/, this.interleaveSamples()];
                case 1:
                    _b = (_c.sent());
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, this.addSampleToTrack(e, t)];
                case 3:
                    _b = _c.sent();
                    _c.label = 4;
                case 4:
                    _b;
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.addSampleToTrack = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, _b, _c, _d; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    this.isFragmented || e.samples.push(t);
                    s = !1;
                    if (!!e.currentChunk) return [3 /*break*/, 1];
                    s = !0;
                    return [3 /*break*/, 5];
                case 1:
                    e.currentChunk.startTimestamp = Math.min(e.currentChunk.startTimestamp, t.timestamp);
                    i = t.timestamp - e.currentChunk.startTimestamp;
                    if (!this.isFragmented) return [3 /*break*/, 4];
                    n = this.trackDatas.every(function (a) { if (e === a)
                        return t.type === "key"; var o = a.sampleQueue[0]; return o ? o.type === "key" : a.track.source._closed; });
                    _b = i >= this.minimumFragmentDuration && n && t.timestamp > this.maxWrittenTimestamp;
                    if (!_b) return [3 /*break*/, 3];
                    s = !0;
                    return [4 /*yield*/, this.finalizeFragment()];
                case 2:
                    _b = (_f.sent());
                    _f.label = 3;
                case 3:
                    _b;
                    return [3 /*break*/, 5];
                case 4:
                    s = i >= .5;
                    _f.label = 5;
                case 5:
                    _c = s;
                    if (!_c) return [3 /*break*/, 8];
                    _d = e.currentChunk;
                    if (!_d) return [3 /*break*/, 7];
                    return [4 /*yield*/, this.finalizeCurrentChunk(e)];
                case 6:
                    _d = (_f.sent());
                    _f.label = 7;
                case 7:
                    _c = (_d, e.currentChunk = { startTimestamp: t.timestamp, samples: [], offset: null, moofOffset: null });
                    _f.label = 8;
                case 8:
                    _c, m(e.currentChunk), e.currentChunk.samples.push(t), this.isFragmented && (this.maxWrittenTimestamp = Math.max(this.maxWrittenTimestamp, t.timestamp));
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.finalizeCurrentChunk = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t, _b, _c, s; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (m(!this.isFragmented), !e.currentChunk)
                        return [2 /*return*/];
                    e.finalizedChunks.push(e.currentChunk), this.finalizedChunks.push(e.currentChunk);
                    t = e.currentChunk.samples.length;
                    if (e.type === "audio" && e.info.requiresPcmTransformation && (t = e.currentChunk.samples.reduce(function (s, i) { return s + Q(i.duration, e.timescale); }, 0)), (e.compactlyCodedChunkTable.length === 0 || U(e.compactlyCodedChunkTable).samplesPerChunk !== t) && e.compactlyCodedChunkTable.push({ firstChunk: e.finalizedChunks.length, samplesPerChunk: t }), this.fastStart === "in-memory") {
                        e.currentChunk.offset = 0;
                        return [2 /*return*/];
                    }
                    e.currentChunk.offset = this.writer.getPos();
                    for (_b = 0, _c = e.currentChunk.samples; _b < _c.length; _b++) {
                        s = _c[_b];
                        m(s.data), this.writer.write(s.data), s.data = null;
                    }
                    return [4 /*yield*/, this.writer.flush()];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.interleaveSamples = function (e) {
        if (e === void 0) { e = !1; }
        return __awaiter(this, void 0, void 0, function () { var t, s, _b, _c, n, i; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(m(this.isFragmented), !(!e && !this.allTracksAreKnown()))) return [3 /*break*/, 4];
                    _d.label = 1;
                case 1:
                    t = null, s = 1 / 0;
                    for (_b = 0, _c = this.trackDatas; _b < _c.length; _b++) {
                        n = _c[_b];
                        if (!e && n.sampleQueue.length === 0 && !n.track.source._closed)
                            return [3 /*break*/, 4];
                        n.sampleQueue.length > 0 && n.sampleQueue[0].timestamp < s && (t = n, s = n.sampleQueue[0].timestamp);
                    }
                    if (!t)
                        return [3 /*break*/, 4];
                    i = t.sampleQueue.shift();
                    return [4 /*yield*/, this.addSampleToTrack(t, i)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.finalizeFragment = function (e) {
        if (e === void 0) { e = !0; }
        return __awaiter(this, void 0, void 0, function () { var t, h, _b, p, w, s, i, n, a, o, c, l, _c, s_1, h, _d, _f, p, d, u, _g, h, p, f, _h, s_2, h, _j, _k, p, _l, h, p, _m, s_3, h, _o; return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    m(this.isFragmented);
                    t = this.nextFragmentNumber++;
                    if (t === 1) {
                        this.format._options.onMoov && this.writer.startTrackingWrites();
                        h = It(this.trackDatas, this.creationTime, !0);
                        if (this.boxWriter.writeBox(h), this.format._options.onMoov) {
                            _b = this.writer.stopTrackingWrites(), p = _b.data, w = _b.start;
                            this.format._options.onMoov(p, w);
                        }
                    }
                    s = this.trackDatas.filter(function (h) { return h.currentChunk; }), i = Es(t, s), n = this.writer.getPos(), a = n + this.boxWriter.measureBox(i), o = 16, c = a + o, l = 1 / 0;
                    for (_c = 0, s_1 = s; _c < s_1.length; _c++) {
                        h = s_1[_c];
                        h.currentChunk.offset = c, h.currentChunk.moofOffset = n;
                        for (_d = 0, _f = h.currentChunk.samples; _d < _f.length; _d++) {
                            p = _f[_d];
                            c += p.size;
                        }
                        l = Math.min(l, h.currentChunk.startTimestamp);
                    }
                    d = c - a;
                    this.format._options.onMoof && this.writer.startTrackingWrites();
                    u = Es(t, s);
                    if (this.boxWriter.writeBox(u), this.format._options.onMoof) {
                        _g = this.writer.stopTrackingWrites(), h = _g.data, p = _g.start;
                        this.format._options.onMoof(h, p, l);
                    }
                    m(this.writer.getPos() === a), this.format._options.onMdat && this.writer.startTrackingWrites();
                    f = Er(d >= Math.pow(2, 32));
                    f.size = d, this.boxWriter.writeBox(f), this.writer.seek(a + o);
                    for (_h = 0, s_2 = s; _h < s_2.length; _h++) {
                        h = s_2[_h];
                        for (_j = 0, _k = h.currentChunk.samples; _j < _k.length; _j++) {
                            p = _k[_j];
                            this.writer.write(p.data), p.data = null;
                        }
                    }
                    if (this.format._options.onMdat) {
                        _l = this.writer.stopTrackingWrites(), h = _l.data, p = _l.start;
                        this.format._options.onMdat(h, p);
                    }
                    for (_m = 0, s_3 = s; _m < s_3.length; _m++) {
                        h = s_3[_m];
                        h.finalizedChunks.push(h.currentChunk), this.finalizedChunks.push(h.currentChunk), h.currentChunk = null;
                    }
                    _o = e;
                    if (!_o) return [3 /*break*/, 2];
                    return [4 /*yield*/, this.writer.flush()];
                case 1:
                    _o = (_p.sent());
                    _p.label = 2;
                case 2:
                    _o;
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.onTrackClose = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t, s, _b, _c; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    t = _d.sent();
                    if (!(e.type === "subtitle" && e.source._codec === "webvtt")) return [3 /*break*/, 4];
                    s = this.trackDatas.find(function (i) { return i.track === e; });
                    _b = s;
                    if (!_b) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.processWebVTTCues(s, 1 / 0)];
                case 2:
                    _b = (_d.sent());
                    _d.label = 3;
                case 3:
                    _b;
                    _d.label = 4;
                case 4:
                    this.allTracksAreKnown() && this.allTracksKnown.resolve();
                    _c = this.isFragmented;
                    if (!_c) return [3 /*break*/, 6];
                    return [4 /*yield*/, this.interleaveSamples()];
                case 5:
                    _c = (_d.sent());
                    _d.label = 6;
                case 6:
                    _c, t();
                    return [2 /*return*/];
            }
        }); });
    };
    class_7.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { var e, _b, _c, t, _d, _f, _g, t, _h, _j, t, t, i, n, a, o, _k, _l, c, _m, _o, l, s, _p, i, n, _q, _u, i, _v, _w, n, _x, i, n, t, s, i, t, s, _y, n, a, i, _z, n, a; return __generator(this, function (_0) {
            switch (_0.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _0.sent();
                    this.allTracksKnown.resolve();
                    _b = 0, _c = this.trackDatas;
                    _0.label = 2;
                case 2:
                    if (!(_b < _c.length)) return [3 /*break*/, 6];
                    t = _c[_b];
                    _d = t.type === "subtitle" && t.track.source._codec === "webvtt";
                    if (!_d) return [3 /*break*/, 4];
                    return [4 /*yield*/, this.processWebVTTCues(t, 1 / 0)];
                case 3:
                    _d = (_0.sent());
                    _0.label = 4;
                case 4:
                    _d;
                    _0.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 2];
                case 6:
                    if (!this.isFragmented) return [3 /*break*/, 9];
                    return [4 /*yield*/, this.interleaveSamples(!0)];
                case 7:
                    _0.sent();
                    for (_f = 0, _g = this.trackDatas; _f < _g.length; _f++) {
                        t = _g[_f];
                        this.processTimestamps(t);
                    }
                    return [4 /*yield*/, this.finalizeFragment(!1)];
                case 8:
                    _0.sent();
                    return [3 /*break*/, 13];
                case 9:
                    _h = 0, _j = this.trackDatas;
                    _0.label = 10;
                case 10:
                    if (!(_h < _j.length)) return [3 /*break*/, 13];
                    t = _j[_h];
                    this.processTimestamps(t);
                    return [4 /*yield*/, this.finalizeCurrentChunk(t)];
                case 11:
                    _0.sent();
                    _0.label = 12;
                case 12:
                    _h++;
                    return [3 /*break*/, 10];
                case 13:
                    if (this.fastStart === "in-memory") {
                        m(this.mdat);
                        t = void 0;
                        for (i = 0; i < 2; i++) {
                            n = It(this.trackDatas, this.creationTime), a = this.boxWriter.measureBox(n);
                            t = this.boxWriter.measureBox(this.mdat);
                            o = this.writer.getPos() + a + t;
                            for (_k = 0, _l = this.finalizedChunks; _k < _l.length; _k++) {
                                c = _l[_k];
                                c.offset = o;
                                for (_m = 0, _o = c.samples; _m < _o.length; _m++) {
                                    l = _o[_m].data;
                                    m(l), o += l.byteLength, t += l.byteLength;
                                }
                            }
                            if (o < Math.pow(2, 32))
                                break;
                            t >= Math.pow(2, 32) && (this.mdat.largeSize = !0);
                        }
                        this.format._options.onMoov && this.writer.startTrackingWrites();
                        s = It(this.trackDatas, this.creationTime);
                        if (this.boxWriter.writeBox(s), this.format._options.onMoov) {
                            _p = this.writer.stopTrackingWrites(), i = _p.data, n = _p.start;
                            this.format._options.onMoov(i, n);
                        }
                        this.format._options.onMdat && this.writer.startTrackingWrites(), this.mdat.size = t, this.boxWriter.writeBox(this.mdat);
                        for (_q = 0, _u = this.finalizedChunks; _q < _u.length; _q++) {
                            i = _u[_q];
                            for (_v = 0, _w = i.samples; _v < _w.length; _v++) {
                                n = _w[_v];
                                m(n.data), this.writer.write(n.data), n.data = null;
                            }
                        }
                        if (this.format._options.onMdat) {
                            _x = this.writer.stopTrackingWrites(), i = _x.data, n = _x.start;
                            this.format._options.onMdat(i, n);
                        }
                    }
                    else if (this.isFragmented) {
                        t = this.writer.getPos(), s = Gi(this.trackDatas);
                        this.boxWriter.writeBox(s);
                        i = this.writer.getPos() - t;
                        this.writer.seek(this.writer.getPos() - 4), this.boxWriter.writeU32(i);
                    }
                    else {
                        m(this.mdat);
                        t = this.boxWriter.offsets.get(this.mdat);
                        m(t !== void 0);
                        s = this.writer.getPos() - t;
                        if (this.mdat.size = s, this.mdat.largeSize = s >= Math.pow(2, 32), this.boxWriter.patchBox(this.mdat), this.format._options.onMdat) {
                            _y = this.writer.stopTrackingWrites(), n = _y.data, a = _y.start;
                            this.format._options.onMdat(n, a);
                        }
                        this.format._options.onMoov && this.writer.startTrackingWrites();
                        i = It(this.trackDatas, this.creationTime);
                        if (this.boxWriter.writeBox(i), this.format._options.onMoov) {
                            _z = this.writer.stopTrackingWrites(), n = _z.data, a = _z.start;
                            this.format._options.onMoov(n, a);
                        }
                    }
                    e();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_7;
}(ce));
var nt = /** @class */ (function () {
    function nt(e) {
        this.value = e;
    }
    return nt;
}()), at = /** @class */ (function () {
    function at(e) {
        this.value = e;
    }
    return at;
}()), Rt = /** @class */ (function () {
    function Rt(e) {
        this.value = e;
    }
    return Rt;
}()), k;
(function (r) { r[r.EBML = 440786851] = "EBML", r[r.EBMLVersion = 17030] = "EBMLVersion", r[r.EBMLReadVersion = 17143] = "EBMLReadVersion", r[r.EBMLMaxIDLength = 17138] = "EBMLMaxIDLength", r[r.EBMLMaxSizeLength = 17139] = "EBMLMaxSizeLength", r[r.DocType = 17026] = "DocType", r[r.DocTypeVersion = 17031] = "DocTypeVersion", r[r.DocTypeReadVersion = 17029] = "DocTypeReadVersion", r[r.SeekHead = 290298740] = "SeekHead", r[r.Seek = 19899] = "Seek", r[r.SeekID = 21419] = "SeekID", r[r.SeekPosition = 21420] = "SeekPosition", r[r.Duration = 17545] = "Duration", r[r.Info = 357149030] = "Info", r[r.TimestampScale = 2807729] = "TimestampScale", r[r.MuxingApp = 19840] = "MuxingApp", r[r.WritingApp = 22337] = "WritingApp", r[r.Tracks = 374648427] = "Tracks", r[r.TrackEntry = 174] = "TrackEntry", r[r.TrackNumber = 215] = "TrackNumber", r[r.TrackUID = 29637] = "TrackUID", r[r.TrackType = 131] = "TrackType", r[r.FlagEnabled = 185] = "FlagEnabled", r[r.FlagDefault = 136] = "FlagDefault", r[r.FlagForced = 21930] = "FlagForced", r[r.FlagLacing = 156] = "FlagLacing", r[r.Language = 2274716] = "Language", r[r.CodecID = 134] = "CodecID", r[r.CodecPrivate = 25506] = "CodecPrivate", r[r.CodecDelay = 22186] = "CodecDelay", r[r.SeekPreRoll = 22203] = "SeekPreRoll", r[r.DefaultDuration = 2352003] = "DefaultDuration", r[r.Video = 224] = "Video", r[r.PixelWidth = 176] = "PixelWidth", r[r.PixelHeight = 186] = "PixelHeight", r[r.Audio = 225] = "Audio", r[r.SamplingFrequency = 181] = "SamplingFrequency", r[r.Channels = 159] = "Channels", r[r.BitDepth = 25188] = "BitDepth", r[r.Segment = 408125543] = "Segment", r[r.SimpleBlock = 163] = "SimpleBlock", r[r.BlockGroup = 160] = "BlockGroup", r[r.Block = 161] = "Block", r[r.BlockAdditions = 30113] = "BlockAdditions", r[r.BlockMore = 166] = "BlockMore", r[r.BlockAdditional = 165] = "BlockAdditional", r[r.BlockAddID = 238] = "BlockAddID", r[r.BlockDuration = 155] = "BlockDuration", r[r.ReferenceBlock = 251] = "ReferenceBlock", r[r.Cluster = 524531317] = "Cluster", r[r.Timestamp = 231] = "Timestamp", r[r.Cues = 475249515] = "Cues", r[r.CuePoint = 187] = "CuePoint", r[r.CueTime = 179] = "CueTime", r[r.CueTrackPositions = 183] = "CueTrackPositions", r[r.CueTrack = 247] = "CueTrack", r[r.CueClusterPosition = 241] = "CueClusterPosition", r[r.Colour = 21936] = "Colour", r[r.MatrixCoefficients = 21937] = "MatrixCoefficients", r[r.TransferCharacteristics = 21946] = "TransferCharacteristics", r[r.Primaries = 21947] = "Primaries", r[r.Range = 21945] = "Range", r[r.Projection = 30320] = "Projection", r[r.ProjectionType = 30321] = "ProjectionType", r[r.ProjectionPoseRoll = 30325] = "ProjectionPoseRoll", r[r.Attachments = 423732329] = "Attachments", r[r.Chapters = 272869232] = "Chapters", r[r.Tags = 307544935] = "Tags"; })(k || (k = {}));
var ro = [k.EBML, k.Segment], so = [k.EBMLMaxIDLength, k.EBMLMaxSizeLength, k.SeekHead, k.Info, k.Cluster, k.Tracks, k.Cues, k.Attachments, k.Chapters, k.Tags], Rs = __spreadArray(__spreadArray([], ro, true), so, true), en = function (r) { return r < 256 ? 1 : r < 65536 ? 2 : r < 1 << 24 ? 3 : r < Math.pow(2, 32) ? 4 : r < Math.pow(2, 40) ? 5 : 6; }, tn = function (r) { return r >= -64 && r < 64 ? 1 : r >= -8192 && r < 8192 ? 2 : r >= -(1 << 20) && r < 1 << 20 ? 3 : r >= -(1 << 27) && r < 1 << 27 ? 4 : r >= -(Math.pow(2, 34)) && r < Math.pow(2, 34) ? 5 : 6; }, io = function (r) { if (r < 127)
    return 1; if (r < 16383)
    return 2; if (r < (1 << 21) - 1)
    return 3; if (r < (1 << 28) - 1)
    return 4; if (r < Math.pow(2, 35) - 1)
    return 5; if (r < Math.pow(2, 42) - 1)
    return 6; throw new Error("EBML varint size not supported " + r); }, Ar = /** @class */ (function () {
    function class_8(e) {
        this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = new WeakMap, this.dataOffsets = new WeakMap;
    }
    class_8.prototype.writeByte = function (e) { this.helperView.setUint8(0, e), this.writer.write(this.helper.subarray(0, 1)); };
    class_8.prototype.writeFloat32 = function (e) { this.helperView.setFloat32(0, e, !1), this.writer.write(this.helper.subarray(0, 4)); };
    class_8.prototype.writeFloat64 = function (e) { this.helperView.setFloat64(0, e, !1), this.writer.write(this.helper); };
    class_8.prototype.writeUnsignedInt = function (e, t) {
        if (t === void 0) { t = en(e); }
        var s = 0;
        switch (t) {
            case 6: this.helperView.setUint8(s++, e / Math.pow(2, 40) | 0);
            case 5: this.helperView.setUint8(s++, e / Math.pow(2, 32) | 0);
            case 4: this.helperView.setUint8(s++, e >> 24);
            case 3: this.helperView.setUint8(s++, e >> 16);
            case 2: this.helperView.setUint8(s++, e >> 8);
            case 1:
                this.helperView.setUint8(s++, e);
                break;
            default: throw new Error("Bad unsigned int size " + t);
        }
        this.writer.write(this.helper.subarray(0, s));
    };
    class_8.prototype.writeSignedInt = function (e, t) {
        if (t === void 0) { t = tn(e); }
        e < 0 && (e += Math.pow(2, (t * 8))), this.writeUnsignedInt(e, t);
    };
    class_8.prototype.writeVarInt = function (e, t) {
        if (t === void 0) { t = io(e); }
        var s = 0;
        switch (t) {
            case 1:
                this.helperView.setUint8(s++, 128 | e);
                break;
            case 2:
                this.helperView.setUint8(s++, 64 | e >> 8), this.helperView.setUint8(s++, e);
                break;
            case 3:
                this.helperView.setUint8(s++, 32 | e >> 16), this.helperView.setUint8(s++, e >> 8), this.helperView.setUint8(s++, e);
                break;
            case 4:
                this.helperView.setUint8(s++, 16 | e >> 24), this.helperView.setUint8(s++, e >> 16), this.helperView.setUint8(s++, e >> 8), this.helperView.setUint8(s++, e);
                break;
            case 5:
                this.helperView.setUint8(s++, 8 | e / Math.pow(2, 32) & 7), this.helperView.setUint8(s++, e >> 24), this.helperView.setUint8(s++, e >> 16), this.helperView.setUint8(s++, e >> 8), this.helperView.setUint8(s++, e);
                break;
            case 6:
                this.helperView.setUint8(s++, 4 | e / Math.pow(2, 40) & 3), this.helperView.setUint8(s++, e / Math.pow(2, 32) | 0), this.helperView.setUint8(s++, e >> 24), this.helperView.setUint8(s++, e >> 16), this.helperView.setUint8(s++, e >> 8), this.helperView.setUint8(s++, e);
                break;
            default: throw new Error("Bad EBML varint size " + t);
        }
        this.writer.write(this.helper.subarray(0, s));
    };
    class_8.prototype.writeString = function (e) { this.writer.write(new Uint8Array(e.split("").map(function (t) { return t.charCodeAt(0); }))); };
    class_8.prototype.writeEBML = function (e) { var _b, _c, _d; if (e !== null) {
        if (e instanceof Uint8Array)
            this.writer.write(e);
        else if (Array.isArray(e))
            for (var _f = 0, e_2 = e; _f < e_2.length; _f++) {
                var t = e_2[_f];
                this.writeEBML(t);
            }
        else if (this.offsets.set(e, this.writer.getPos()), this.writeUnsignedInt(e.id), Array.isArray(e.data)) {
            var t = this.writer.getPos(), s = e.size === -1 ? 1 : (_b = e.size) !== null && _b !== void 0 ? _b : 4;
            e.size === -1 ? this.writeByte(255) : this.writer.seek(this.writer.getPos() + s);
            var i = this.writer.getPos();
            if (this.dataOffsets.set(e, i), this.writeEBML(e.data), e.size !== -1) {
                var n = this.writer.getPos() - i, a = this.writer.getPos();
                this.writer.seek(t), this.writeVarInt(n, s), this.writer.seek(a);
            }
        }
        else if (typeof e.data == "number") {
            var t = (_c = e.size) !== null && _c !== void 0 ? _c : en(e.data);
            this.writeVarInt(t), this.writeUnsignedInt(e.data, t);
        }
        else if (typeof e.data == "string")
            this.writeVarInt(e.data.length), this.writeString(e.data);
        else if (e.data instanceof Uint8Array)
            this.writeVarInt(e.data.byteLength, e.size), this.writer.write(e.data);
        else if (e.data instanceof nt)
            this.writeVarInt(4), this.writeFloat32(e.data.value);
        else if (e.data instanceof at)
            this.writeVarInt(8), this.writeFloat64(e.data.value);
        else if (e.data instanceof Rt) {
            var t = (_d = e.size) !== null && _d !== void 0 ? _d : tn(e.data.value);
            this.writeVarInt(t), this.writeSignedInt(e.data.value, t);
        }
    } };
    return class_8;
}()), rn = 8, As = 2, Ne = 4 + rn, We = /** @class */ (function () {
    function class_9(e) {
        this.reader = e, this.pos = 0;
    }
    class_9.prototype.readBytes = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, new Uint8Array(t.buffer, s, e); };
    class_9.prototype.readU8 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 1), e = _b.view, t = _b.offset; return this.pos++, e.getUint8(t); };
    class_9.prototype.readS16 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 2), e = _b.view, t = _b.offset; return this.pos += 2, e.getInt16(t, !1); };
    class_9.prototype.readVarIntSize = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 1), e = _b.view, t = _b.offset, s = e.getUint8(t), i = 1, n = 128; for (; !(s & n) && i < 8;)
        i++, n >>= 1; return i; };
    class_9.prototype.readVarInt = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 1), e = _b.view, t = _b.offset, s = e.getUint8(t), i = 1, n = 128; for (; !(s & n) && i < rn;)
        i++, n >>= 1; var _c = this.reader.getViewAndOffset(this.pos, this.pos + i), a = _c.view, o = _c.offset, c = s & n - 1; for (var l = 1; l < i; l++)
        c *= 256, c += a.getUint8(o + l); return this.pos += i, c; };
    class_9.prototype.readUnsignedInt = function (e) { if (e < 1 || e > 8)
        throw new Error("Bad unsigned int size " + e); var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset, i = 0; for (var n = 0; n < e; n++)
        i *= 256, i += t.getUint8(s + n); return this.pos += e, i; };
    class_9.prototype.readSignedInt = function (e) { var t = this.readUnsignedInt(e); return t & 1 << e * 8 - 1 && (t -= Math.pow(2, (e * 8))), t; };
    class_9.prototype.readFloat = function (e) { if (e === 0)
        return 0; if (e !== 4 && e !== 8)
        throw new Error("Bad float size " + e); var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset, i = e === 4 ? t.getFloat32(s, !1) : t.getFloat64(s, !1); return this.pos += e, i; };
    class_9.prototype.readString = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, String.fromCharCode.apply(String, new Uint8Array(t.buffer, s, e)); };
    class_9.prototype.readElementId = function () { var e = this.readVarIntSize(); return this.readUnsignedInt(e); };
    class_9.prototype.readElementSize = function () { var e = this.readU8(); return e === 255 ? e = null : (this.pos--, e = this.readVarInt(), e === 72057594037927940 && (e = null)), e; };
    class_9.prototype.readElementHeader = function () { var e = this.readElementId(), t = this.readElementSize(); return { id: e, size: t }; };
    class_9.prototype.searchForNextElementId = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var i, _b, n, a; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    i = new Set(e);
                    _c.label = 1;
                case 1:
                    if (!(this.pos < t - Ne)) return [3 /*break*/, 5];
                    _b = this.reader.rangeIsLoaded(this.pos, this.pos + Ne);
                    if (_b) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.reader.loadRange(this.pos, Math.min(this.pos + 1048576, t))];
                case 2:
                    _b = (_c.sent());
                    _c.label = 3;
                case 3:
                    _b;
                    n = this.pos, a = this.readElementHeader();
                    if (i.has(a.id))
                        return [2 /*return*/, n];
                    Le(a.size), this.pos += a.size;
                    _c.label = 4;
                case 4: return [3 /*break*/, 1];
                case 5: return [2 /*return*/, null];
            }
        }); });
    };
    return class_9;
}()), ie = { avc: "V_MPEG4/ISO/AVC", hevc: "V_MPEGH/ISO/HEVC", vp8: "V_VP8", vp9: "V_VP9", av1: "V_AV1", aac: "A_AAC", mp3: "A_MPEG/L3", opus: "A_OPUS", vorbis: "A_VORBIS", flac: "A_FLAC", "pcm-u8": "A_PCM/INT/LIT", "pcm-s16": "A_PCM/INT/LIT", "pcm-s16be": "A_PCM/INT/BIG", "pcm-s24": "A_PCM/INT/LIT", "pcm-s24be": "A_PCM/INT/BIG", "pcm-s32": "A_PCM/INT/LIT", "pcm-s32be": "A_PCM/INT/BIG", "pcm-f32": "A_PCM/FLOAT/IEEE", "pcm-f64": "A_PCM/FLOAT/IEEE", webvtt: "S_TEXT/WEBVTT" };
function Le(r) { if (r === null)
    throw new Error("Undefined element size is used in a place where it is not supported."); }
var Fr = function (r) { var t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isWebM ? "webm" : "x-matroska"); if (r.codecStrings.length > 0) {
    var s = __spreadArray([], new Set(r.codecStrings.filter(Boolean)), true);
    t += "; codecs=\"".concat(s.join(", "), "\"");
} return t; };
var no = -(Math.pow(2, 15)), ao = Math.pow(2, 15) - 1, sn = "https://github.com/Vanilagy/mediabunny", nn = 6, an = 5, oo = { video: 1, audio: 2, subtitle: 17 }, Or = /** @class */ (function (_super) {
    __extends(class_10, _super);
    function class_10(e, t) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.trackDatas = [], _this.allTracksKnown = N(), _this.segment = null, _this.segmentInfo = null, _this.seekHead = null, _this.tracksElement = null, _this.segmentDuration = null, _this.cues = null, _this.currentCluster = null, _this.currentClusterStartMsTimestamp = null, _this.currentClusterMaxMsTimestamp = null, _this.trackDatasInCurrentCluster = new Map, _this.duration = 0, _this.writer = e._writer, _this.format = t, _this.ebmlWriter = new Ar(_this.writer), _this.format._options.appendOnly && (_this.writer.ensureMonotonicity = !0);
        return _this;
    }
    class_10.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _b.sent();
                    this.writeEBMLHeader(), this.format._options.appendOnly || this.createSeekHead(), this.createSegmentInfo(), this.createCues();
                    return [4 /*yield*/, this.writer.flush()];
                case 2:
                    _b.sent(), e();
                    return [2 /*return*/];
            }
        }); });
    };
    class_10.prototype.writeEBMLHeader = function () { this.format._options.onEbmlHeader && this.writer.startTrackingWrites(); var e = { id: k.EBML, data: [{ id: k.EBMLVersion, data: 1 }, { id: k.EBMLReadVersion, data: 1 }, { id: k.EBMLMaxIDLength, data: 4 }, { id: k.EBMLMaxSizeLength, data: 8 }, { id: k.DocType, data: this.format instanceof ot ? "webm" : "matroska" }, { id: k.DocTypeVersion, data: 2 }, { id: k.DocTypeReadVersion, data: 2 }] }; if (this.ebmlWriter.writeEBML(e), this.format._options.onEbmlHeader) {
        var _b = this.writer.stopTrackingWrites(), t = _b.data, s = _b.start;
        this.format._options.onEbmlHeader(t, s);
    } };
    class_10.prototype.createSeekHead = function () { var e = new Uint8Array([28, 83, 187, 107]), t = new Uint8Array([21, 73, 169, 102]), s = new Uint8Array([22, 84, 174, 107]), i = { id: k.SeekHead, data: [{ id: k.Seek, data: [{ id: k.SeekID, data: e }, { id: k.SeekPosition, size: 5, data: 0 }] }, { id: k.Seek, data: [{ id: k.SeekID, data: t }, { id: k.SeekPosition, size: 5, data: 0 }] }, { id: k.Seek, data: [{ id: k.SeekID, data: s }, { id: k.SeekPosition, size: 5, data: 0 }] }] }; this.seekHead = i; };
    class_10.prototype.createSegmentInfo = function () { var e = { id: k.Duration, data: new at(0) }; this.segmentDuration = e; var t = { id: k.Info, data: [{ id: k.TimestampScale, data: 1e6 }, { id: k.MuxingApp, data: sn }, { id: k.WritingApp, data: sn }, this.format._options.appendOnly ? null : e] }; this.segmentInfo = t; };
    class_10.prototype.createTracks = function () { var _b; var e = { id: k.Tracks, data: [] }; this.tracksElement = e; for (var _c = 0, _d = this.trackDatas; _c < _d.length; _c++) {
        var t = _d[_c];
        var s = ie[t.track.source._codec];
        m(s);
        var i = 0;
        if (t.type === "audio" && t.track.source._codec === "opus") {
            i = 1e6 * 80;
            var n = t.info.decoderConfig.description;
            if (n) {
                var a = K(n), o = Be(a);
                i = Math.round(1e9 * (o.preSkip / et));
            }
        }
        e.data.push({ id: k.TrackEntry, data: [{ id: k.TrackNumber, data: t.track.id }, { id: k.TrackUID, data: t.track.id }, { id: k.TrackType, data: oo[t.type] }, { id: k.FlagLacing, data: 0 }, { id: k.Language, data: (_b = t.track.metadata.languageCode) !== null && _b !== void 0 ? _b : J }, { id: k.CodecID, data: s }, { id: k.CodecDelay, data: 0 }, { id: k.SeekPreRoll, data: i }, t.type === "video" ? this.videoSpecificTrackInfo(t) : null, t.type === "audio" ? this.audioSpecificTrackInfo(t) : null, t.type === "subtitle" ? this.subtitleSpecificTrackInfo(t) : null] });
    } };
    class_10.prototype.videoSpecificTrackInfo = function (e) { var _b = e.track.metadata, t = _b.frameRate, s = _b.rotation, i = [e.info.decoderConfig.description ? { id: k.CodecPrivate, data: K(e.info.decoderConfig.description) } : null, t ? { id: k.DefaultDuration, data: 1e9 / t } : null], n = s ? Fe(-s) : 0, a = e.info.decoderConfig.colorSpace, o = { id: k.Video, data: [{ id: k.PixelWidth, data: e.info.width }, { id: k.PixelHeight, data: e.info.height }, Yt(a) ? { id: k.Colour, data: [{ id: k.MatrixCoefficients, data: ye[a.matrix] }, { id: k.TransferCharacteristics, data: xe[a.transfer] }, { id: k.Primaries, data: Se[a.primaries] }, { id: k.Range, data: a.fullRange ? 2 : 1 }] } : null, n ? { id: k.Projection, data: [{ id: k.ProjectionType, data: 0 }, { id: k.ProjectionPoseRoll, data: new nt((n + 180) % 360 - 180) }] } : null] }; return i.push(o), i; };
    class_10.prototype.audioSpecificTrackInfo = function (e) { var t = V.includes(e.track.source._codec) ? X(e.track.source._codec) : null; return [e.info.decoderConfig.description ? { id: k.CodecPrivate, data: K(e.info.decoderConfig.description) } : null, { id: k.Audio, data: [{ id: k.SamplingFrequency, data: new nt(e.info.sampleRate) }, { id: k.Channels, data: e.info.numberOfChannels }, t ? { id: k.BitDepth, data: 8 * t.sampleSize } : null] }]; };
    class_10.prototype.subtitleSpecificTrackInfo = function (e) { return [{ id: k.CodecPrivate, data: me.encode(e.info.config.description) }]; };
    class_10.prototype.createSegment = function () { var e = { id: k.Segment, size: this.format._options.appendOnly ? -1 : nn, data: [this.format._options.appendOnly ? null : this.seekHead, this.segmentInfo, this.tracksElement] }; if (this.segment = e, this.format._options.onSegmentHeader && this.writer.startTrackingWrites(), this.ebmlWriter.writeEBML(e), this.format._options.onSegmentHeader) {
        var _b = this.writer.stopTrackingWrites(), t = _b.data, s = _b.start;
        this.format._options.onSegmentHeader(t, s);
    } };
    class_10.prototype.createCues = function () { this.cues = { id: k.Cues, data: [] }; };
    Object.defineProperty(class_10.prototype, "segmentDataOffset", {
        get: function () { return m(this.segment), this.ebmlWriter.dataOffsets.get(this.segment); },
        enumerable: false,
        configurable: true
    });
    class_10.prototype.allTracksAreKnown = function () { var _loop_3 = function (e) {
        if (!e.source._closed && !this_2.trackDatas.some(function (t) { return t.track === e; }))
            return { value: !1 };
    }; var this_2 = this; for (var _b = 0, _c = this.output._tracks; _b < _c.length; _b++) {
        var e = _c[_b];
        var state_3 = _loop_3(e);
        if (typeof state_3 === "object")
            return state_3.value;
    } return !0; };
    class_10.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.allTracksKnown.promise];
                case 1:
                    _b.sent();
                    e = this.trackDatas.map(function (t) { return t.type === "video" || t.type === "audio" ? t.info.decoderConfig.codec : { webvtt: "wvtt" }[t.track.source._codec]; });
                    return [2 /*return*/, Fr({ isWebM: this.format instanceof ot, hasVideo: this.trackDatas.some(function (t) { return t.type === "video"; }), hasAudio: this.trackDatas.some(function (t) { return t.type === "audio"; }), codecStrings: e })];
            }
        }); });
    };
    class_10.prototype.getVideoTrackData = function (e, t) { var s = this.trackDatas.find(function (n) { return n.track === e; }); if (s)
        return s; mr(t), m(t), m(t.decoderConfig), m(t.decoderConfig.codedWidth !== void 0), m(t.decoderConfig.codedHeight !== void 0); var i = { track: e, type: "video", info: { width: t.decoderConfig.codedWidth, height: t.decoderConfig.codedHeight, decoderConfig: t.decoderConfig }, chunkQueue: [], lastWrittenMsTimestamp: null }; return e.source._codec === "vp9" ? i.info.decoderConfig = __assign(__assign({}, i.info.decoderConfig), { description: new Uint8Array(Ii(i.info.decoderConfig.codec)) }) : e.source._codec === "av1" && (i.info.decoderConfig = __assign(__assign({}, i.info.decoderConfig), { description: new Uint8Array(cr(i.info.decoderConfig.codec)) })), this.trackDatas.push(i), this.trackDatas.sort(function (n, a) { return n.track.id - a.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), i; };
    class_10.prototype.getAudioTrackData = function (e, t) { var s = this.trackDatas.find(function (n) { return n.track === e; }); if (s)
        return s; Oe(t), m(t), m(t.decoderConfig); var i = { track: e, type: "audio", info: { numberOfChannels: t.decoderConfig.numberOfChannels, sampleRate: t.decoderConfig.sampleRate, decoderConfig: t.decoderConfig }, chunkQueue: [], lastWrittenMsTimestamp: null }; return this.trackDatas.push(i), this.trackDatas.sort(function (n, a) { return n.track.id - a.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), i; };
    class_10.prototype.getSubtitleTrackData = function (e, t) { var s = this.trackDatas.find(function (n) { return n.track === e; }); if (s)
        return s; hr(t), m(t), m(t.config); var i = { track: e, type: "subtitle", info: { config: t.config }, chunkQueue: [], lastWrittenMsTimestamp: null }; return this.trackDatas.push(i), this.trackDatas.sort(function (n, a) { return n.track.id - a.track.id; }), this.allTracksAreKnown() && this.allTracksKnown.resolve(), i; };
    class_10.prototype.addEncodedVideoPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, a, o, c, l; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    n = this.getVideoTrackData(e, s), a = t.type === "key", o = this.validateAndNormalizeTimestamp(n.track, t.timestamp, a), c = t.duration;
                    e.metadata.frameRate !== void 0 && (o = xt(o, 1 / e.metadata.frameRate), c = xt(c, 1 / e.metadata.frameRate));
                    l = this.createInternalChunk(t.data, o, c, t.type);
                    e.source._codec === "vp9" && this.fixVP9ColorSpace(n, l), n.chunkQueue.push(l);
                    return [4 /*yield*/, this.interleaveChunks()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    i();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_10.prototype.addEncodedAudioPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, a, o, c; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    n = this.getAudioTrackData(e, s), a = t.type === "key", o = this.validateAndNormalizeTimestamp(n.track, t.timestamp, a), c = this.createInternalChunk(t.data, o, t.duration, t.type);
                    n.chunkQueue.push(c);
                    return [4 /*yield*/, this.interleaveChunks()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    i();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_10.prototype.addSubtitleCue = function (e, t, s) {
        var _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var i, n, a, o, c_1, l, d, u;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.mutex.acquire()];
                    case 1:
                        i = _f.sent();
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, , 4, 5]);
                        n = this.getSubtitleTrackData(e, s), a = this.validateAndNormalizeTimestamp(n.track, t.timestamp, !0), o = t.text, c_1 = Math.round(a * 1e3);
                        tt.lastIndex = 0, o = o.replace(tt, function (f) { var p = kr(f.slice(1, -1)) - c_1; return "<".concat(Tr(p), ">"); });
                        l = me.encode(o), d = "".concat((_b = t.settings) !== null && _b !== void 0 ? _b : "", "\n").concat((_c = t.identifier) !== null && _c !== void 0 ? _c : "", "\n").concat((_d = t.notes) !== null && _d !== void 0 ? _d : ""), u = this.createInternalChunk(l, a, t.duration, "key", d.trim() ? me.encode(d) : null);
                        n.chunkQueue.push(u);
                        return [4 /*yield*/, this.interleaveChunks()];
                    case 3:
                        _f.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        i();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    class_10.prototype.interleaveChunks = function (e) {
        if (e === void 0) { e = !1; }
        return __awaiter(this, void 0, void 0, function () { var t, s, _b, _c, n, i, _d; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!!(!e && !this.allTracksAreKnown())) return [3 /*break*/, 3];
                    e: for (;;) {
                        t = null, s = 1 / 0;
                        for (_b = 0, _c = this.trackDatas; _b < _c.length; _b++) {
                            n = _c[_b];
                            if (!e && n.chunkQueue.length === 0 && !n.track.source._closed)
                                break e;
                            n.chunkQueue.length > 0 && n.chunkQueue[0].timestamp < s && (t = n, s = n.chunkQueue[0].timestamp);
                        }
                        if (!t)
                            break;
                        i = t.chunkQueue.shift();
                        this.writeBlock(t, i);
                    }
                    _d = e;
                    if (_d) return [3 /*break*/, 2];
                    return [4 /*yield*/, this.writer.flush()];
                case 1:
                    _d = (_f.sent());
                    _f.label = 2;
                case 2:
                    _d;
                    _f.label = 3;
                case 3: return [2 /*return*/];
            }
        }); });
    };
    class_10.prototype.fixVP9ColorSpace = function (e, t) { if (t.type !== "key" || !e.info.decoderConfig.colorSpace || !e.info.decoderConfig.colorSpace.matrix)
        return; var s = new se(t.data); if (s.readBits(2) !== 2)
        return; var i = s.readBits(1), a = (s.readBits(1) << 1) + i; if (a === 3 && s.skipBits(1), s.readBits(1) || s.readBits(1) !== 0 || (s.skipBits(2), s.readBits(24) !== 4817730))
        return; a >= 2 && s.skipBits(1); var d = { rgb: 7, bt709: 2, bt470bg: 1, smpte170m: 3 }[e.info.decoderConfig.colorSpace.matrix]; fi(t.data, s.pos, s.pos + 3, d); };
    class_10.prototype.createInternalChunk = function (e, t, s, i, n) {
        if (n === void 0) { n = null; }
        return { data: e, type: i, timestamp: t, duration: s, additions: n };
    };
    class_10.prototype.writeBlock = function (e, t) { var _b; this.segment || (this.createTracks(), this.createSegment()); var s = Math.round(1e3 * t.timestamp), i = this.trackDatas.every(function (d) { if (e === d)
        return t.type === "key"; var u = d.chunkQueue[0]; return u ? u.type === "key" : d.track.source._closed; }), n = !1; if (!this.currentCluster)
        n = !0;
    else {
        m(this.currentClusterStartMsTimestamp !== null), m(this.currentClusterMaxMsTimestamp !== null);
        var d = s - this.currentClusterStartMsTimestamp;
        n = i && s > this.currentClusterMaxMsTimestamp && d >= 1e3 * ((_b = this.format._options.minimumClusterDuration) !== null && _b !== void 0 ? _b : 1) || d > ao;
    } n && this.createNewCluster(s); var a = s - this.currentClusterStartMsTimestamp; if (a < no)
        return; var o = new Uint8Array(4), c = new DataView(o.buffer); c.setUint8(0, 128 | e.track.id), c.setInt16(1, a, !1); var l = Math.round(1e3 * t.duration); if (l === 0 && !t.additions) {
        c.setUint8(3, +(t.type === "key") << 7);
        var d = { id: k.SimpleBlock, data: [o, t.data] };
        this.ebmlWriter.writeEBML(d);
    }
    else {
        var d = { id: k.BlockGroup, data: [{ id: k.Block, data: [o, t.data] }, t.type === "delta" ? { id: k.ReferenceBlock, data: new Rt(e.lastWrittenMsTimestamp - s) } : null, t.additions ? { id: k.BlockAdditions, data: [{ id: k.BlockMore, data: [{ id: k.BlockAdditional, data: t.additions }, { id: k.BlockAddID, data: 1 }] }] } : null, l > 0 ? { id: k.BlockDuration, data: l } : null] };
        this.ebmlWriter.writeEBML(d);
    } this.duration = Math.max(this.duration, s + l), e.lastWrittenMsTimestamp = s, this.trackDatasInCurrentCluster.has(e) || this.trackDatasInCurrentCluster.set(e, { firstMsTimestamp: s }), this.currentClusterMaxMsTimestamp = Math.max(this.currentClusterMaxMsTimestamp, s); };
    class_10.prototype.createNewCluster = function (e) { this.currentCluster && this.finalizeCurrentCluster(), this.format._options.onCluster && this.writer.startTrackingWrites(), this.currentCluster = { id: k.Cluster, size: this.format._options.appendOnly ? -1 : an, data: [{ id: k.Timestamp, data: e }] }, this.ebmlWriter.writeEBML(this.currentCluster), this.currentClusterStartMsTimestamp = e, this.currentClusterMaxMsTimestamp = e, this.trackDatasInCurrentCluster.clear(); };
    class_10.prototype.finalizeCurrentCluster = function () { if (m(this.currentCluster), !this.format._options.appendOnly) {
        var i = this.writer.getPos() - this.ebmlWriter.dataOffsets.get(this.currentCluster), n = this.writer.getPos();
        this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4), this.ebmlWriter.writeVarInt(i, an), this.writer.seek(n);
    } if (this.format._options.onCluster) {
        m(this.currentClusterStartMsTimestamp !== null);
        var _b = this.writer.stopTrackingWrites(), i = _b.data, n = _b.start;
        this.format._options.onCluster(i, n, this.currentClusterStartMsTimestamp / 1e3);
    } var e = this.ebmlWriter.offsets.get(this.currentCluster) - this.segmentDataOffset, t = new Map; for (var _c = 0, _d = this.trackDatasInCurrentCluster; _c < _d.length; _c++) {
        var _f = _d[_c], i = _f[0], n = _f[1].firstMsTimestamp;
        t.has(n) || t.set(n, []), t.get(n).push(i);
    } var s = __spreadArray([], t.entries(), true).sort(function (i, n) { return i[0] - n[0]; }); for (var _g = 0, s_4 = s; _g < s_4.length; _g++) {
        var _h = s_4[_g], i = _h[0], n = _h[1];
        m(this.cues), this.cues.data.push({ id: k.CuePoint, data: __spreadArray([{ id: k.CueTime, data: i }], n.map(function (a) { return ({ id: k.CueTrackPositions, data: [{ id: k.CueTrack, data: a.track.id }, { id: k.CueClusterPosition, data: e }] }); }), true) });
    } };
    class_10.prototype.onTrackClose = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _b.sent();
                    this.allTracksAreKnown() && this.allTracksKnown.resolve();
                    return [4 /*yield*/, this.interleaveChunks()];
                case 2:
                    _b.sent(), e();
                    return [2 /*return*/];
            }
        }); });
    };
    class_10.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, s; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _b.sent();
                    this.allTracksKnown.resolve(), this.segment || (this.createTracks(), this.createSegment());
                    return [4 /*yield*/, this.interleaveChunks(!0)];
                case 2:
                    if (_b.sent(), this.currentCluster && this.finalizeCurrentCluster(), m(this.cues), this.ebmlWriter.writeEBML(this.cues), !this.format._options.appendOnly) {
                        t = this.writer.getPos(), s = this.writer.getPos() - this.segmentDataOffset;
                        this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4), this.ebmlWriter.writeVarInt(s, nn), this.segmentDuration.data = new at(this.duration), this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration)), this.ebmlWriter.writeEBML(this.segmentDuration), this.seekHead.data[0].data[1].data = this.ebmlWriter.offsets.get(this.cues) - this.segmentDataOffset, this.seekHead.data[1].data[1].data = this.ebmlWriter.offsets.get(this.segmentInfo) - this.segmentDataOffset, this.seekHead.data[2].data[1].data = this.ebmlWriter.offsets.get(this.tracksElement) - this.segmentDataOffset, this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead)), this.ebmlWriter.writeEBML(this.seekHead), this.writer.seek(t);
                    }
                    e();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_10;
}(ce));
var Fs = { 1: [-1, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1], 2: [-1, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, -1], 3: [-1, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, -1] }, Os = { 1: [-1, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, -1], 2: [-1, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1], 3: [-1, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1] }, Bs = { 0: [11025, 12e3, 8e3, -1], 2: [22050, 24e3, 16e3, -1], 3: [44100, 48e3, 32e3, -1] }, ct = 1483304551, Br = 1231971951, Mr = function (r, e, t, s) { return Math.floor(r === 3 ? (12 * e / t + s) * 4 : 144 * e / t + s); }, dt = function (r, e) { return r === 3 ? e === 3 ? 21 : 36 : e === 3 ? 13 : 21; }, zr = function (r, e) { var _b, _c, _d; var t = e.pos, s = r >>> 24, i = r >>> 16 & 255, n = r >>> 8 & 255, a = r & 255; if (s !== 255 && i !== 255 && n !== 255 && a !== 255)
    return e.pos += 4, null; if (e.pos += 1, (i & 224) !== 224)
    return null; var o = i >> 3 & 3, c = i >> 1 & 3, l = n >> 4 & 15, d = n >> 2 & 3, u = n >> 1 & 1, f = a >> 6 & 3, h = a >> 4 & 3, p = a >> 3 & 1, w = a >> 2 & 1, g = a & 3, T = o === 3 ? (_b = Fs[c]) === null || _b === void 0 ? void 0 : _b[l] : (_c = Os[c]) === null || _c === void 0 ? void 0 : _c[l]; if (!T || T === -1)
    return null; var S = T * 1e3, E = (_d = Bs[o]) === null || _d === void 0 ? void 0 : _d[d]; if (!E || E === -1)
    return null; var y = Mr(c, S, E, u); if (e.fileSize !== null && e.fileSize - t < y)
    return null; var b; return o === 3 ? b = c === 3 ? 384 : 1152 : c === 3 ? b = 384 : c === 2 ? b = 1152 : b = 576, { startPos: t, totalSize: y, mpegVersionId: o, layer: c, bitrate: S, frequencyIndex: d, sampleRate: E, channel: f, modeExtension: h, copyright: p, original: w, emphasis: g, audioSamplesInFrame: b }; };
var Ur = /** @class */ (function () {
    function class_11(e) {
        this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer);
    }
    class_11.prototype.writeU32 = function (e) { this.helperView.setUint32(0, e, !1), this.writer.write(this.helper.subarray(0, 4)); };
    class_11.prototype.writeXingFrame = function (e) { var _b, _c, _d, _f, _g; var t = this.writer.getPos(), s = 255, i = 224 | e.mpegVersionId << 3 | e.layer << 1, a = (_b = (e.mpegVersionId === 3 ? Fs : Os)) === null || _b === void 0 ? void 0 : _b[e.layer]; if (!a)
        throw new Error("Invalid MPEG version and layer combination."); var o = (_c = Bs[e.mpegVersionId]) === null || _c === void 0 ? void 0 : _c[e.frequencyIndex]; if (!o || o === -1)
        throw new Error("Invalid MPEG version and frequency index combination."); var c = 0, l = 155, d = a.findIndex(function (g) { return Mr(e.layer, 1e3 * g, o, c) >= l; }); if (d === -1)
        throw new Error("No suitable bitrate found."); var u = d << 4 | e.frequencyIndex << 2 | c << 1, f = e.channel << 6 | e.modeExtension << 4 | e.copyright << 3 | e.original << 2 | e.emphasis; this.helper[0] = s, this.helper[1] = i, this.helper[2] = u, this.helper[3] = f, this.writer.write(this.helper.subarray(0, 4)); var h = dt(e.mpegVersionId, e.channel); this.writer.seek(t + h), this.writeU32(ct); var p = 0; e.frameCount !== null && (p |= 1), e.fileSize !== null && (p |= 2), e.toc !== null && (p |= 4), this.writeU32(p), this.writeU32((_d = e.frameCount) !== null && _d !== void 0 ? _d : 0), this.writeU32((_f = e.fileSize) !== null && _f !== void 0 ? _f : 0), this.writer.write((_g = e.toc) !== null && _g !== void 0 ? _g : new Uint8Array(100)); var w = Mr(e.layer, 1e3 * a[d], o, c); this.writer.seek(t + w); };
    return class_11;
}());
var Dr = /** @class */ (function (_super) {
    __extends(class_12, _super);
    function class_12(e, t) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.xingFrameData = null, _this.frameCount = 0, _this.framePositions = [], _this.format = t, _this.writer = e._writer, _this.mp3Writer = new Ur(e._writer);
        return _this;
    }
    class_12.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_12.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, "audio/mpeg"];
        }); });
    };
    class_12.prototype.addEncodedVideoPacket = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            throw new Error("MP3 does not support video.");
        }); });
    };
    class_12.prototype.addEncodedAudioPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a, o, c; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    s = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    if (!this.xingFrameData) {
                        i = Z(t.data);
                        if (i.byteLength < 4)
                            throw new Error("Invalid MP3 header in sample.");
                        n = i.getUint32(0, !1), a = zr(n, { pos: 0, fileSize: null });
                        if (!a)
                            throw new Error("Invalid MP3 header in sample.");
                        o = dt(a.mpegVersionId, a.channel);
                        if (i.byteLength >= o + 4) {
                            c = i.getUint32(o, !1);
                            if (c === ct || c === Br)
                                return [2 /*return*/];
                        }
                        this.xingFrameData = { mpegVersionId: a.mpegVersionId, layer: a.layer, frequencyIndex: a.frequencyIndex, channel: a.channel, modeExtension: a.modeExtension, copyright: a.copyright, original: a.original, emphasis: a.emphasis, frameCount: null, fileSize: null, toc: null }, this.mp3Writer.writeXingFrame(this.xingFrameData), this.frameCount++;
                    }
                    this.validateAndNormalizeTimestamp(e, t.timestamp, t.type === "key"), this.framePositions.push(this.writer.getPos()), this.writer.write(t.data), this.frameCount++;
                    return [4 /*yield*/, this.writer.flush()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    s();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_12.prototype.addSubtitleCue = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            throw new Error("MP3 does not support subtitles.");
        }); });
    };
    class_12.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, s, i, n, a, _b, i, n; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!this.xingFrameData)
                        return [2 /*return*/];
                    return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _c.sent(), t = this.writer.getPos();
                    this.writer.seek(0);
                    s = new Uint8Array(100);
                    for (i = 0; i < 100; i++) {
                        n = Math.floor(this.framePositions.length * (i / 100));
                        m(n !== -1 && n < this.framePositions.length);
                        a = this.framePositions[n];
                        s[i] = 256 * (a / t);
                    }
                    if (this.xingFrameData.frameCount = this.frameCount, this.xingFrameData.fileSize = t, this.xingFrameData.toc = s, this.format._options.onXingFrame && this.writer.startTrackingWrites(), this.mp3Writer.writeXingFrame(this.xingFrameData), this.format._options.onXingFrame) {
                        _b = this.writer.stopTrackingWrites(), i = _b.data, n = _b.start;
                        this.format._options.onXingFrame(i, n);
                    }
                    this.writer.seek(t), e();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_12;
}(ce));
var At = 1399285583, co = 79764919, on = new Uint32Array(256);
for (var r = 0; r < 256; r++) {
    var e = r << 24;
    for (var t = 0; t < 8; t++)
        e = e & 2147483648 ? e << 1 ^ co : e << 1;
    on[r] = e >>> 0 & 4294967295;
}
var Vr = function (r) { var e = Z(r), t = e.getUint32(22, !0); e.setUint32(22, 0, !0); var s = 0; for (var i = 0; i < r.length; i++) {
    var n = r[i];
    s = (s << 8 ^ on[s >>> 24 ^ n]) >>> 0;
} return e.setUint32(22, t, !0), s; }, Nr = function (r, e, t) { var s = 0, i = null; if (r.length > 0)
    if (e.codec === "vorbis") {
        m(e.vorbisInfo);
        var n = e.vorbisInfo.modeBlockflags.length, o = (1 << Si(n - 1)) - 1 << 1, c = (r[0] & o) >> 1;
        if (c >= e.vorbisInfo.modeBlockflags.length)
            throw new Error("Invalid mode number.");
        var l = t, d = e.vorbisInfo.modeBlockflags[c];
        if (i = e.vorbisInfo.blocksizes[d], d === 1) {
            var u = (o | 1) + 1, f = r[0] & u ? 1 : 0;
            l = e.vorbisInfo.blocksizes[f];
        }
        s = l !== null ? l + i >> 2 : 0;
    }
    else
        e.codec === "opus" && (s = Vi(r).durationInSamples); return { durationInSamples: s, vorbisBlockSize: i }; }, Wr = function (r) { var e = "audio/ogg"; if (r.codecStrings) {
    var t = __spreadArray([], new Set(r.codecStrings), true);
    e += "; codecs=\"".concat(t.join(", "), "\"");
} return e; };
var ut = 27, He = 282, Lr = He + 255 * 255, lt = /** @class */ (function () {
    function lt(e) {
        this.reader = e, this.pos = 0;
    }
    lt.prototype.readBytes = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, new Uint8Array(t.buffer, s, e); };
    lt.prototype.readU8 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 1), e = _b.view, t = _b.offset; return this.pos += 1, e.getUint8(t); };
    lt.prototype.readU32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getUint32(t, !0); };
    lt.prototype.readI32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getInt32(t, !0); };
    lt.prototype.readI64 = function () { var e = this.readU32(); return this.readI32() * 4294967296 + e; };
    lt.prototype.readAscii = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; this.pos += e; var i = ""; for (var n = 0; n < e; n++)
        i += String.fromCharCode(t.getUint8(s + n)); return i; };
    lt.prototype.readPageHeader = function () { var e = this.pos; if (this.readU32() !== At)
        return null; this.pos += 1; var s = this.readU8(), i = this.readI64(), n = this.readU32(), a = this.readU32(), o = this.readU32(), c = this.readU8(), l = new Uint8Array(c); for (var h = 0; h < c; h++)
        l[h] = this.readU8(); var d = 27 + c, u = l.reduce(function (h, p) { return h + p; }, 0), f = d + u; return { headerStartPos: e, totalSize: f, dataStartPos: e + d, dataSize: u, headerType: s, granulePosition: i, serialNumber: n, sequenceNumber: a, checksum: o, lacingValues: l }; };
    lt.prototype.findNextPageHeader = function (e) { for (; this.pos < e - 3;) {
        var t = this.readU32(), s = t & 255, i = t >>> 8 & 255, n = t >>> 16 & 255, a = t >>> 24 & 255, o = 79;
        if (!(s !== o && i !== o && n !== o && a !== o)) {
            if (this.pos -= 4, t === At)
                return !0;
            this.pos += 1;
        }
    } return !1; };
    return lt;
}());
var lo = 8192, Hr = /** @class */ (function (_super) {
    __extends(class_13, _super);
    function class_13(e, t) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.trackDatas = [], _this.bosPagesWritten = !1, _this.allTracksKnown = N(), _this.pageBytes = new Uint8Array(Lr), _this.pageView = new DataView(_this.pageBytes.buffer), _this.format = t, _this.writer = e._writer, _this.writer.ensureMonotonicity = !0;
        return _this;
    }
    class_13.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_13.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.allTracksKnown.promise];
                case 1: return [2 /*return*/, (_b.sent(), Wr({ codecStrings: this.trackDatas.map(function (e) { return e.codecInfo.codec; }) }))];
            }
        }); });
    };
    class_13.prototype.addEncodedVideoPacket = function () { throw new Error("Video tracks are not supported."); };
    class_13.prototype.getTrackData = function (e, t) { var s = this.trackDatas.find(function (a) { return a.track === e; }); if (s)
        return s; var i; do
        i = Math.floor(Math.pow(2, 32) * Math.random());
    while (this.trackDatas.some(function (a) { return a.serialNumber === i; })); m(e.source._codec === "vorbis" || e.source._codec === "opus"), Oe(t), m(t), m(t.decoderConfig); var n = { track: e, serialNumber: i, internalSampleRate: e.source._codec === "opus" ? et : t.decoderConfig.sampleRate, codecInfo: { codec: e.source._codec, vorbisInfo: null, opusInfo: null }, vorbisLastBlocksize: null, packetQueue: [], currentTimestampInSamples: 0, pagesWritten: 0, currentGranulePosition: 0, currentLacingValues: [], currentPageData: [], currentPageSize: 27, currentPageStartsWithFreshPacket: !0 }; return this.queueHeaderPackets(n, t), this.trackDatas.push(n), this.allTracksAreKnown() && this.allTracksKnown.resolve(), n; };
    class_13.prototype.queueHeaderPackets = function (e, t) { if (m(t.decoderConfig), e.track.source._codec === "vorbis") {
        m(t.decoderConfig.description);
        var s_5 = K(t.decoderConfig.description);
        if (s_5[0] !== 2)
            throw new TypeError("First byte of Vorbis decoder description must be 2.");
        var i_2 = 1, n = function () { var p = 0; for (;;) {
            var w = s_5[i_2++];
            if (w === void 0)
                throw new TypeError("Vorbis decoder description is too short.");
            if (p += w, w < 255)
                return p;
        } }, a = n(), o = n();
        if (s_5.length - i_2 <= 0)
            throw new TypeError("Vorbis decoder description is too short.");
        var l = s_5.subarray(i_2, i_2 += a), d = s_5.subarray(i_2, i_2 += o), u = s_5.subarray(i_2);
        e.packetQueue.push({ data: l, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 }, { data: d, endGranulePosition: 0, timestamp: 0, forcePageFlush: !1 }, { data: u, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 });
        var h = Z(l).getUint8(28);
        e.codecInfo.vorbisInfo = { blocksizes: [1 << (h & 15), 1 << (h >> 4)], modeBlockflags: Cr(u).modeBlockflags };
    }
    else if (e.track.source._codec === "opus") {
        if (!t.decoderConfig.description)
            throw new TypeError("For Ogg, Opus decoder description is required.");
        var s = K(t.decoderConfig.description), i = new Uint8Array(16), n = new DataView(i.buffer);
        n.setUint32(0, 1332770163, !1), n.setUint32(4, 1415669619, !1), n.setUint32(8, 0, !0), n.setUint32(12, 0, !0), e.packetQueue.push({ data: s, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 }, { data: i, endGranulePosition: 0, timestamp: 0, forcePageFlush: !0 }), e.codecInfo.opusInfo = { preSkip: Be(s).preSkip };
    } };
    class_13.prototype.addEncodedAudioPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, n, a, _b, o, c; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 4, 5]);
                    n = this.getTrackData(e, s);
                    this.validateAndNormalizeTimestamp(n.track, t.timestamp, t.type === "key");
                    a = n.currentTimestampInSamples, _b = Nr(t.data, n.codecInfo, n.vorbisLastBlocksize), o = _b.durationInSamples, c = _b.vorbisBlockSize;
                    n.currentTimestampInSamples += o, n.vorbisLastBlocksize = c, n.packetQueue.push({ data: t.data, endGranulePosition: n.currentTimestampInSamples, timestamp: a / n.internalSampleRate, forcePageFlush: !1 });
                    return [4 /*yield*/, this.interleavePages()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    i();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_13.prototype.addSubtitleCue = function () { throw new Error("Subtitle tracks are not supported."); };
    class_13.prototype.allTracksAreKnown = function () { var _loop_4 = function (e) {
        if (!e.source._closed && !this_3.trackDatas.some(function (t) { return t.track === e; }))
            return { value: !1 };
    }; var this_3 = this; for (var _b = 0, _c = this.output._tracks; _b < _c.length; _b++) {
        var e = _c[_b];
        var state_4 = _loop_4(e);
        if (typeof state_4 === "object")
            return state_4.value;
    } return !0; };
    class_13.prototype.interleavePages = function (e) {
        if (e === void 0) { e = !1; }
        return __awaiter(this, void 0, void 0, function () { var _b, _c, t, s, t, s, _d, _f, a, i, n, _g; return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!this.bosPagesWritten) {
                        if (!this.allTracksAreKnown())
                            return [2 /*return*/];
                        for (_b = 0, _c = this.trackDatas; _b < _c.length; _b++) {
                            t = _c[_b];
                            for (; t.packetQueue.length > 0;) {
                                s = t.packetQueue.shift();
                                if (this.writePacket(t, s, !1), s.forcePageFlush)
                                    break;
                            }
                        }
                        this.bosPagesWritten = !0;
                    }
                    e: for (;;) {
                        t = null, s = 1 / 0;
                        for (_d = 0, _f = this.trackDatas; _d < _f.length; _d++) {
                            a = _f[_d];
                            if (!e && a.packetQueue.length <= 1 && !a.track.source._closed)
                                break e;
                            a.packetQueue.length > 0 && a.packetQueue[0].timestamp < s && (t = a, s = a.packetQueue[0].timestamp);
                        }
                        if (!t)
                            break;
                        i = t.packetQueue.shift(), n = t.packetQueue.length === 0;
                        this.writePacket(t, i, n);
                    }
                    _g = e;
                    if (_g) return [3 /*break*/, 2];
                    return [4 /*yield*/, this.writer.flush()];
                case 1:
                    _g = (_h.sent());
                    _h.label = 2;
                case 2:
                    _g;
                    return [2 /*return*/];
            }
        }); });
    };
    class_13.prototype.writePacket = function (e, t, s) { var i = t.data.length, n = 0, a = 0; for (;;) {
        e.currentLacingValues.length === 0 && n > 0 && (e.currentPageStartsWithFreshPacket = !1);
        var c = Math.min(255, i);
        e.currentLacingValues.push(c), e.currentPageSize++, a += c;
        var l = i < 255;
        if (e.currentLacingValues.length === 255) {
            var d = t.data.subarray(n, a);
            if (n = a, e.currentPageData.push(d), e.currentPageSize += d.length, this.writePage(e, s && l), l)
                return;
        }
        if (l)
            break;
        i -= 255;
    } var o = t.data.subarray(n); e.currentPageData.push(o), e.currentPageSize += o.length, e.currentGranulePosition = t.endGranulePosition, (e.currentPageSize >= lo || t.forcePageFlush) && this.writePage(e, s); };
    class_13.prototype.writePage = function (e, t) { this.pageView.setUint32(0, At, !0), this.pageView.setUint8(4, 0); var s = 0; e.currentPageStartsWithFreshPacket || (s |= 1), e.pagesWritten === 0 && (s |= 2), t && (s |= 4), this.pageView.setUint8(5, s); var i = e.currentLacingValues.every(function (c) { return c === 255; }) ? -1 : e.currentGranulePosition; bi(this.pageView, 6, i, !0), this.pageView.setUint32(14, e.serialNumber, !0), this.pageView.setUint32(18, e.pagesWritten, !0), this.pageView.setUint32(22, 0, !0), this.pageView.setUint8(26, e.currentLacingValues.length), this.pageBytes.set(e.currentLacingValues, 27); var n = 27 + e.currentLacingValues.length; for (var _b = 0, _c = e.currentPageData; _b < _c.length; _b++) {
        var c = _c[_b];
        this.pageBytes.set(c, n), n += c.length;
    } var a = this.pageBytes.subarray(0, n), o = Vr(a); if (this.pageView.setUint32(22, o, !0), e.pagesWritten++, e.currentLacingValues.length = 0, e.currentPageData.length = 0, e.currentPageSize = 27, e.currentPageStartsWithFreshPacket = !0, this.format._options.onPage && this.writer.startTrackingWrites(), this.writer.write(a), this.format._options.onPage) {
        var _d = this.writer.stopTrackingWrites(), c = _d.data, l = _d.start;
        this.format._options.onPage(c, l, e.track.source);
    } };
    class_13.prototype.onTrackClose = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _b.sent();
                    this.allTracksAreKnown() && this.allTracksKnown.resolve();
                    return [4 /*yield*/, this.interleavePages()];
                case 2:
                    _b.sent(), e();
                    return [2 /*return*/];
            }
        }); });
    };
    class_13.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { var e, _b, _c, t; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _d.sent();
                    this.allTracksKnown.resolve();
                    return [4 /*yield*/, this.interleavePages(!0)];
                case 2:
                    _d.sent();
                    for (_b = 0, _c = this.trackDatas; _b < _c.length; _b++) {
                        t = _c[_b];
                        t.currentLacingValues.length > 0 && this.writePage(t, !0);
                    }
                    e();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_13;
}(ce));
var de = /** @class */ (function () {
    function de(e) {
        this.input = e;
    }
    return de;
}());
var te = new Uint8Array(0), D = /** @class */ (function () {
    function r(e, t, s, i, n, a) {
        if (n === void 0) { n = -1; }
        if (this.data = e, this.type = t, this.timestamp = s, this.duration = i, this.sequenceNumber = n, e === te && a === void 0)
            throw new Error("Internal error: byteLength must be explicitly provided when constructing metadata-only packets.");
        if (a === void 0 && (a = e.byteLength), !(e instanceof Uint8Array))
            throw new TypeError("data must be a Uint8Array.");
        if (t !== "key" && t !== "delta")
            throw new TypeError('type must be either "key" or "delta".');
        if (!Number.isFinite(s))
            throw new TypeError("timestamp must be a number.");
        if (!Number.isFinite(i) || i < 0)
            throw new TypeError("duration must be a non-negative number.");
        if (!Number.isFinite(n))
            throw new TypeError("sequenceNumber must be a number.");
        if (!Number.isInteger(a) || a < 0)
            throw new TypeError("byteLength must be a non-negative integer.");
        this.byteLength = a;
    }
    Object.defineProperty(r.prototype, "isMetadataOnly", {
        get: function () { return this.data === te; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "microsecondTimestamp", {
        get: function () { return Math.trunc(fe * this.timestamp); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "microsecondDuration", {
        get: function () { return Math.trunc(fe * this.duration); },
        enumerable: false,
        configurable: true
    });
    r.prototype.toEncodedVideoChunk = function () { if (this.isMetadataOnly)
        throw new TypeError("Metadata-only packets cannot be converted to a video chunk."); if (typeof EncodedVideoChunk > "u")
        throw new Error("Your browser does not support EncodedVideoChunk."); return new EncodedVideoChunk({ data: this.data, type: this.type, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration }); };
    r.prototype.toEncodedAudioChunk = function () { if (this.isMetadataOnly)
        throw new TypeError("Metadata-only packets cannot be converted to an audio chunk."); if (typeof EncodedAudioChunk > "u")
        throw new Error("Your browser does not support EncodedAudioChunk."); return new EncodedAudioChunk({ data: this.data, type: this.type, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration }); };
    r.fromEncodedChunk = function (e) { var _b; if (!(e instanceof EncodedVideoChunk || e instanceof EncodedAudioChunk))
        throw new TypeError("chunk must be an EncodedVideoChunk or EncodedAudioChunk."); var t = new Uint8Array(e.byteLength); return e.copyTo(t), new r(t, e.type, e.timestamp / 1e6, ((_b = e.duration) !== null && _b !== void 0 ? _b : 0) / 1e6); };
    r.prototype.clone = function (e) { var _b, _c; if (e !== void 0 && (typeof e != "object" || e === null))
        throw new TypeError("options, when provided, must be an object."); if ((e === null || e === void 0 ? void 0 : e.timestamp) !== void 0 && !Number.isFinite(e.timestamp))
        throw new TypeError("options.timestamp, when provided, must be a number."); if ((e === null || e === void 0 ? void 0 : e.duration) !== void 0 && !Number.isFinite(e.duration))
        throw new TypeError("options.duration, when provided, must be a number."); return new r(this.data, this.type, (_b = e === null || e === void 0 ? void 0 : e.timestamp) !== null && _b !== void 0 ? _b : this.timestamp, (_c = e === null || e === void 0 ? void 0 : e.duration) !== null && _c !== void 0 ? _c : this.duration, this.sequenceNumber, this.byteLength); };
    return r;
}());
exports.EncodedPacket = D;
var cn = function (r) { var s = r, i = 4096, n = 0, a = 12, o = 0; for (s < 0 && (s = -s, n = 128), s += 33, s > 8191 && (s = 8191); (s & i) !== i && a >= 5;)
    i >>= 1, a--; return o = s >> a - 4 & 15, ~(n | a - 5 << 4 | o) & 255; }, dn = function (r) { var t = 0, s = 0, i = ~r; i & 128 && (i &= -129, t = -1), s = ((i & 240) >> 4) + 5; var n = (1 << s | (i & 15) << s - 4 | 1 << s - 5) - 33; return t === 0 ? n : -n; }, ln = function (r) { var t = 2048, s = 0, i = 11, n = 0, a = r; for (a < 0 && (a = -a, s = 128), a > 4095 && (a = 4095); (a & t) !== t && i >= 5;)
    t >>= 1, i--; return n = a >> (i === 4 ? 1 : i - 4) & 15, (s | i - 4 << 4 | n) ^ 85; }, un = function (r) { var e = 0, t = 0, s = r ^ 85; s & 128 && (s &= -129, e = -1), t = ((s & 240) >> 4) + 4; var i = 0; return t !== 4 ? i = 1 << t | (s & 15) << t - 4 | 1 << t - 5 : i = s << 1 | 1, e === 0 ? i : -i; };
var le = /** @class */ (function () {
    function r(e, t) {
        var _b, _c, _d, _f, _g, _h, _j, _k, _l;
        if (this._closed = !1, e instanceof ArrayBuffer || ArrayBuffer.isView(e)) {
            if (!t || typeof t != "object")
                throw new TypeError("init must be an object.");
            if (!("format" in t) || typeof t.format != "string")
                throw new TypeError("init.format must be a string.");
            if (!Number.isInteger(t.codedWidth) || t.codedWidth <= 0)
                throw new TypeError("init.codedWidth must be a positive integer.");
            if (!Number.isInteger(t.codedHeight) || t.codedHeight <= 0)
                throw new TypeError("init.codedHeight must be a positive integer.");
            if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
                throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
            if (!Number.isFinite(t.timestamp))
                throw new TypeError("init.timestamp must be a number.");
            if (t.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
                throw new TypeError("init.duration, when provided, must be a non-negative number.");
            this._data = K(e).slice(), this.format = t.format, this.codedWidth = t.codedWidth, this.codedHeight = t.codedHeight, this.rotation = (_b = t.rotation) !== null && _b !== void 0 ? _b : 0, this.timestamp = t.timestamp, this.duration = (_c = t.duration) !== null && _c !== void 0 ? _c : 0, this.colorSpace = new VideoColorSpace(t.colorSpace);
        }
        else if (typeof VideoFrame < "u" && e instanceof VideoFrame) {
            if ((t === null || t === void 0 ? void 0 : t.rotation) !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
                throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
            if ((t === null || t === void 0 ? void 0 : t.timestamp) !== void 0 && !Number.isFinite(t === null || t === void 0 ? void 0 : t.timestamp))
                throw new TypeError("init.timestamp, when provided, must be a number.");
            if ((t === null || t === void 0 ? void 0 : t.duration) !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
                throw new TypeError("init.duration, when provided, must be a non-negative number.");
            this._data = e, this.format = e.format, this.codedWidth = e.codedWidth, this.codedHeight = e.codedHeight, this.rotation = (_d = t === null || t === void 0 ? void 0 : t.rotation) !== null && _d !== void 0 ? _d : 0, this.timestamp = (_f = t === null || t === void 0 ? void 0 : t.timestamp) !== null && _f !== void 0 ? _f : e.timestamp / 1e6, this.duration = (_g = t === null || t === void 0 ? void 0 : t.duration) !== null && _g !== void 0 ? _g : ((_h = e.duration) !== null && _h !== void 0 ? _h : 0) / 1e6, this.colorSpace = e.colorSpace;
        }
        else if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof SVGImageElement < "u" && e instanceof SVGImageElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas) {
            if (!t || typeof t != "object")
                throw new TypeError("init must be an object.");
            if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
                throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
            if (!Number.isFinite(t.timestamp))
                throw new TypeError("init.timestamp must be a number.");
            if (t.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
                throw new TypeError("init.duration, when provided, must be a non-negative number.");
            if (typeof VideoFrame < "u")
                return new r(new VideoFrame(e, { timestamp: Math.trunc(t.timestamp * fe), duration: Math.trunc(((_j = t.duration) !== null && _j !== void 0 ? _j : 0) * fe) }), t);
            var s = 0, i = 0;
            if ("naturalWidth" in e ? (s = e.naturalWidth, i = e.naturalHeight) : "videoWidth" in e ? (s = e.videoWidth, i = e.videoHeight) : "width" in e && (s = Number(e.width), i = Number(e.height)), !s || !i)
                throw new TypeError("Could not determine dimensions.");
            var n = new OffscreenCanvas(s, i), a = n.getContext("2d", { alpha: !1, willReadFrequently: !0 });
            m(a), a.drawImage(e, 0, 0), this._data = n, this.format = "RGBX", this.codedWidth = s, this.codedHeight = i, this.rotation = (_k = t.rotation) !== null && _k !== void 0 ? _k : 0, this.timestamp = t.timestamp, this.duration = (_l = t.duration) !== null && _l !== void 0 ? _l : 0, this.colorSpace = new VideoColorSpace({ matrix: "rgb", primaries: "bt709", transfer: "iec61966-2-1", fullRange: !0 });
        }
        else
            throw new TypeError("Invalid data type: Must be a BufferSource or CanvasImageSource.");
    }
    Object.defineProperty(r.prototype, "displayWidth", {
        get: function () { return this.rotation % 180 === 0 ? this.codedWidth : this.codedHeight; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "displayHeight", {
        get: function () { return this.rotation % 180 === 0 ? this.codedHeight : this.codedWidth; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "microsecondTimestamp", {
        get: function () { return Math.trunc(fe * this.timestamp); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "microsecondDuration", {
        get: function () { return Math.trunc(fe * this.duration); },
        enumerable: false,
        configurable: true
    });
    r.prototype.clone = function () { if (this._closed)
        throw new Error("VideoSample is closed."); return m(this._data !== null), Ft(this._data) ? new r(this._data.clone(), { timestamp: this.timestamp, duration: this.duration }) : this._data instanceof Uint8Array ? new r(this._data.slice(), { format: this.format, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.timestamp, duration: this.duration, colorSpace: this.colorSpace }) : new r(this._data, { format: this.format, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.timestamp, duration: this.duration, colorSpace: this.colorSpace }); };
    r.prototype.close = function () { this._closed || (Ft(this._data) ? this._data.close() : this._data = null, this._closed = !0); };
    r.prototype.allocationSize = function () { if (this._closed)
        throw new Error("VideoSample is closed."); return m(this._data !== null), Ft(this._data) ? this._data.allocationSize() : this._data instanceof Uint8Array ? this._data.byteLength : this.codedWidth * this.codedHeight * 4; };
    r.prototype.copyTo = function (e) {
        return __awaiter(this, void 0, void 0, function () { var s, i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!Ge(e))
                        throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
                    if (this._closed)
                        throw new Error("VideoSample is closed.");
                    if (!(m(this._data !== null), Ft(this._data))) return [3 /*break*/, 2];
                    return [4 /*yield*/, this._data.copyTo(e)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    if (this._data instanceof Uint8Array)
                        K(e).set(this._data);
                    else {
                        s = this._data.getContext("2d", { alpha: !1 });
                        m(s);
                        i = s.getImageData(0, 0, this.codedWidth, this.codedHeight);
                        K(e).set(i.data);
                    }
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        }); });
    };
    r.prototype.toVideoFrame = function () { if (this._closed)
        throw new Error("VideoSample is closed."); return m(this._data !== null), Ft(this._data) ? new VideoFrame(this._data, { timestamp: this.microsecondTimestamp, duration: this.microsecondDuration || void 0 }) : this._data instanceof Uint8Array ? new VideoFrame(this._data, { format: this.format, codedWidth: this.codedWidth, codedHeight: this.codedHeight, timestamp: this.microsecondTimestamp, duration: this.microsecondDuration, colorSpace: this.colorSpace }) : new VideoFrame(this._data, { timestamp: this.microsecondTimestamp, duration: this.microsecondDuration }); };
    r.prototype.draw = function (e, t, s, i, n) {
        if (i === void 0) { i = this.displayWidth; }
        if (n === void 0) { n = this.displayHeight; }
        if (!(typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && e instanceof OffscreenCanvasRenderingContext2D))
            throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
        if (!Number.isFinite(t))
            throw new TypeError("dx must be a number.");
        if (!Number.isFinite(s))
            throw new TypeError("dy must be a number.");
        if (!Number.isFinite(i) || i < 0)
            throw new TypeError("dWidth must be a non-negative number.");
        if (!Number.isFinite(n) || n < 0)
            throw new TypeError("dHeight must be a non-negative number.");
        if (this._closed)
            throw new Error("VideoSample is closed.");
        var a = this.toCanvasImageSource();
        e.save();
        var o = t + i / 2, c = s + n / 2;
        e.translate(o, c), e.rotate(this.rotation * Math.PI / 180);
        var l = this.rotation % 180 === 0 ? 1 : i / n;
        e.scale(1 / l, l), e.drawImage(a, -i / 2, -n / 2, i, n), e.restore();
    };
    r.prototype.toCanvasImageSource = function () { if (this._closed)
        throw new Error("VideoSample is closed."); if (m(this._data !== null), this._data instanceof Uint8Array) {
        var e_3 = this.toVideoFrame();
        return queueMicrotask(function () { return e_3.close(); }), e_3;
    }
    else
        return this._data; };
    r.prototype.setRotation = function (e) { if (![0, 90, 180, 270].includes(e))
        throw new TypeError("newRotation must be 0, 90, 180, or 270."); this.rotation = e; };
    r.prototype.setTimestamp = function (e) { if (!Number.isFinite(e))
        throw new TypeError("newTimestamp must be a number."); this.timestamp = e; };
    r.prototype.setDuration = function (e) { if (!Number.isFinite(e) || e < 0)
        throw new TypeError("newDuration must be a non-negative number."); this.duration = e; };
    return r;
}()), Ft = function (r) { return typeof VideoFrame < "u" && r instanceof VideoFrame; }, Ms = new Set(["f32", "f32-planar", "s16", "s16-planar", "s32", "s32-planar", "u8", "u8-planar"]), ne = /** @class */ (function () {
    function r(e) {
        if (this._closed = !1, Bt(e)) {
            if (e.format === null)
                throw new TypeError("AudioData with null format is not supported.");
            this._data = e, this.format = e.format, this.sampleRate = e.sampleRate, this.numberOfFrames = e.numberOfFrames, this.numberOfChannels = e.numberOfChannels, this.timestamp = e.timestamp / 1e6, this.duration = e.numberOfFrames / e.sampleRate;
        }
        else {
            if (!e || typeof e != "object")
                throw new TypeError("Invalid AudioDataInit: must be an object.");
            if (!Ms.has(e.format))
                throw new TypeError("Invalid AudioDataInit: invalid format.");
            if (!Number.isFinite(e.sampleRate) || e.sampleRate <= 0)
                throw new TypeError("Invalid AudioDataInit: sampleRate must be > 0.");
            if (!Number.isInteger(e.numberOfChannels) || e.numberOfChannels === 0)
                throw new TypeError("Invalid AudioDataInit: numberOfChannels must be an integer > 0.");
            if (!Number.isFinite(e === null || e === void 0 ? void 0 : e.timestamp))
                throw new TypeError("init.timestamp must be a number.");
            var t = e.data.byteLength / (Ot(e.format) * e.numberOfChannels);
            if (!Number.isInteger(t))
                throw new TypeError("Invalid AudioDataInit: data size is not a multiple of frame size.");
            this.format = e.format, this.sampleRate = e.sampleRate, this.numberOfFrames = t, this.numberOfChannels = e.numberOfChannels, this.timestamp = e.timestamp, this.duration = t / e.sampleRate;
            var s = void 0;
            if (e.data instanceof ArrayBuffer)
                s = new Uint8Array(e.data);
            else if (ArrayBuffer.isView(e.data))
                s = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
            else
                throw new TypeError("Invalid AudioDataInit: data is not a BufferSource.");
            var i = this.numberOfFrames * this.numberOfChannels * Ot(this.format);
            if (s.byteLength < i)
                throw new TypeError("Invalid AudioDataInit: insufficient data size.");
            this._data = s;
        }
    }
    Object.defineProperty(r.prototype, "microsecondTimestamp", {
        get: function () { return Math.trunc(fe * this.timestamp); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(r.prototype, "microsecondDuration", {
        get: function () { return Math.trunc(fe * this.duration); },
        enumerable: false,
        configurable: true
    });
    r.prototype.allocationSize = function (e) { var _b, _c; if (!e || typeof e != "object")
        throw new TypeError("options must be an object."); if (!Number.isInteger(e.planeIndex) || e.planeIndex < 0)
        throw new TypeError("planeIndex must be a non-negative integer."); if (e.format !== void 0 && !Ms.has(e.format))
        throw new TypeError("Invalid format."); if (e.frameOffset !== void 0 && (!Number.isInteger(e.frameOffset) || e.frameOffset < 0))
        throw new TypeError("frameOffset must be a non-negative integer."); if (e.frameCount !== void 0 && (!Number.isInteger(e.frameCount) || e.frameCount < 0))
        throw new TypeError("frameCount must be a non-negative integer."); if (this._closed)
        throw new Error("AudioSample is closed."); var t = (_b = e.format) !== null && _b !== void 0 ? _b : this.format, s = (_c = e.frameOffset) !== null && _c !== void 0 ? _c : 0; if (s >= this.numberOfFrames)
        throw new RangeError("frameOffset out of range"); var i = e.frameCount !== void 0 ? e.frameCount : this.numberOfFrames - s; if (i > this.numberOfFrames - s)
        throw new RangeError("frameCount out of range"); var n = Ot(t), a = $r(t); if (a && e.planeIndex >= this.numberOfChannels)
        throw new RangeError("planeIndex out of range"); if (!a && e.planeIndex !== 0)
        throw new RangeError("planeIndex out of range"); return (a ? i : i * this.numberOfChannels) * n; };
    r.prototype.copyTo = function (e, t) { if (!Ge(e))
        throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view."); if (!t || typeof t != "object")
        throw new TypeError("options must be an object."); if (!Number.isInteger(t.planeIndex) || t.planeIndex < 0)
        throw new TypeError("planeIndex must be a non-negative integer."); if (t.format !== void 0 && !Ms.has(t.format))
        throw new TypeError("Invalid format."); if (t.frameOffset !== void 0 && (!Number.isInteger(t.frameOffset) || t.frameOffset < 0))
        throw new TypeError("frameOffset must be a non-negative integer."); if (t.frameCount !== void 0 && (!Number.isInteger(t.frameCount) || t.frameCount < 0))
        throw new TypeError("frameCount must be a non-negative integer."); if (this._closed)
        throw new Error("AudioSample is closed."); var s = t.planeIndex, i = t.format, n = t.frameCount, a = t.frameOffset, o = i !== null && i !== void 0 ? i : this.format; if (!o)
        throw new Error("Destination format not determined"); var c = this.numberOfFrames, l = this.numberOfChannels, d = a !== null && a !== void 0 ? a : 0; if (d >= c)
        throw new RangeError("frameOffset out of range"); var u = n !== void 0 ? n : c - d; if (u > c - d)
        throw new RangeError("frameCount out of range"); var f = Ot(o), h = $r(o); if (h && s >= l)
        throw new RangeError("planeIndex out of range"); if (!h && s !== 0)
        throw new RangeError("planeIndex out of range"); var w = (h ? u : u * l) * f; if (e.byteLength < w)
        throw new RangeError("Destination buffer is too small"); var g = Z(e), T = mo(o); if (Bt(this._data))
        if (h)
            if (o === "f32-planar")
                this._data.copyTo(e, { planeIndex: s, frameOffset: d, frameCount: u, format: "f32-planar" });
            else {
                var S = new ArrayBuffer(u * 4), E = new Float32Array(S);
                this._data.copyTo(E, { planeIndex: s, frameOffset: d, frameCount: u, format: "f32-planar" });
                var y = new DataView(S);
                for (var b = 0; b < u; b++) {
                    var x = b * f, C = y.getFloat32(b * 4, !0);
                    T(g, x, C);
                }
            }
        else {
            var S = l, E = new Float32Array(u);
            for (var y = 0; y < S; y++) {
                this._data.copyTo(E, { planeIndex: y, frameOffset: d, frameCount: u, format: "f32-planar" });
                for (var b = 0; b < u; b++) {
                    var C = (b * S + y) * f;
                    T(g, C, E[b]);
                }
            }
        }
    else {
        var S = this._data, E = new DataView(S.buffer, S.byteOffset, S.byteLength), y = this.format, b = uo(y), x = Ot(y), C = $r(y);
        for (var A = 0; A < u; A++)
            if (h) {
                var I = A * f, R = void 0;
                C ? R = (s * c + (A + d)) * x : R = ((A + d) * l + s) * x;
                var v = b(E, R);
                T(g, I, v);
            }
            else
                for (var I = 0; I < l; I++) {
                    var v = (A * l + I) * f, $ = void 0;
                    C ? $ = (I * c + (A + d)) * x : $ = ((A + d) * l + I) * x;
                    var be = b(E, $);
                    T(g, v, be);
                }
    } };
    r.prototype.clone = function () { if (this._closed)
        throw new Error("AudioSample is closed."); if (Bt(this._data)) {
        var e = new r(this._data.clone());
        return e.setTimestamp(this.timestamp), e;
    }
    else
        return new r({ format: this.format, sampleRate: this.sampleRate, numberOfFrames: this.numberOfFrames, numberOfChannels: this.numberOfChannels, timestamp: this.timestamp, data: this._data }); };
    r.prototype.close = function () { this._closed || (Bt(this._data) ? this._data.close() : this._data = new Uint8Array(0), this._closed = !0); };
    r.prototype.toAudioData = function () { if (this._closed)
        throw new Error("AudioSample is closed."); if (Bt(this._data)) {
        if (this._data.timestamp === this.microsecondTimestamp)
            return this._data.clone();
        if ($r(this.format)) {
            var e = this.allocationSize({ planeIndex: 0, format: this.format }), t = new ArrayBuffer(e * this.numberOfChannels);
            for (var s = 0; s < this.numberOfChannels; s++)
                this.copyTo(new Uint8Array(t, s * e, e), { planeIndex: s, format: this.format });
            return new AudioData({ format: this.format, sampleRate: this.sampleRate, numberOfFrames: this.numberOfFrames, numberOfChannels: this.numberOfChannels, timestamp: this.microsecondTimestamp, data: t });
        }
        else {
            var e = new ArrayBuffer(this.allocationSize({ planeIndex: 0, format: this.format }));
            return this.copyTo(e, { planeIndex: 0, format: this.format }), new AudioData({ format: this.format, sampleRate: this.sampleRate, numberOfFrames: this.numberOfFrames, numberOfChannels: this.numberOfChannels, timestamp: this.microsecondTimestamp, data: e });
        }
    }
    else
        return new AudioData({ format: this.format, sampleRate: this.sampleRate, numberOfFrames: this.numberOfFrames, numberOfChannels: this.numberOfChannels, timestamp: this.microsecondTimestamp, data: this._data }); };
    r.prototype.toAudioBuffer = function () { if (this._closed)
        throw new Error("AudioSample is closed."); var e = new AudioBuffer({ numberOfChannels: this.numberOfChannels, length: this.numberOfFrames, sampleRate: this.sampleRate }), t = new Float32Array(this.allocationSize({ planeIndex: 0, format: "f32-planar" }) / 4); for (var s = 0; s < this.numberOfChannels; s++)
        this.copyTo(t, { planeIndex: s, format: "f32-planar" }), e.copyToChannel(t, s); return e; };
    r.prototype.setTimestamp = function (e) { if (!Number.isFinite(e))
        throw new TypeError("newTimestamp must be a number."); this.timestamp = e; };
    return r;
}()), Ot = function (r) { switch (r) {
    case "u8":
    case "u8-planar": return 1;
    case "s16":
    case "s16-planar": return 2;
    case "s32":
    case "s32-planar": return 4;
    case "f32":
    case "f32-planar": return 4;
    default: throw new Error("Unknown AudioSampleFormat");
} }, $r = function (r) { switch (r) {
    case "u8-planar":
    case "s16-planar":
    case "s32-planar":
    case "f32-planar": return !0;
    default: return !1;
} }, uo = function (r) { switch (r) {
    case "u8":
    case "u8-planar": return function (e, t) { return (e.getUint8(t) - 128) / 128; };
    case "s16":
    case "s16-planar": return function (e, t) { return e.getInt16(t, !0) / 32768; };
    case "s32":
    case "s32-planar": return function (e, t) { return e.getInt32(t, !0) / 2147483648; };
    case "f32":
    case "f32-planar": return function (e, t) { return e.getFloat32(t, !0); };
} }, mo = function (r) { switch (r) {
    case "u8":
    case "u8-planar": return function (e, t, s) { return e.setUint8(t, q((s + 1) * 127.5, 0, 255)); };
    case "s16":
    case "s16-planar": return function (e, t, s) { return e.setInt16(t, q(Math.round(s * 32767), -32768, 32767), !0); };
    case "s32":
    case "s32-planar": return function (e, t, s) { return e.setInt32(t, q(Math.round(s * 2147483647), -2147483648, 2147483647), !0); };
    case "f32":
    case "f32-planar": return function (e, t, s) { return e.setFloat32(t, s, !0); };
} }, Bt = function (r) { return typeof AudioData < "u" && r instanceof AudioData; };
exports.VideoSample = le;
exports.AudioSample = ne;
var mt = function (r) { if (!r || typeof r != "object")
    throw new TypeError("options must be an object."); if (r.metadataOnly !== void 0 && typeof r.metadataOnly != "boolean")
    throw new TypeError("options.metadataOnly, when defined, must be a boolean."); }, Pe = function (r) { if (typeof r != "number" || Number.isNaN(r))
    throw new TypeError("timestamp must be a number."); }, we = /** @class */ (function () {
    function class_14(e) {
        if (!(e instanceof Qe))
            throw new TypeError("track must be an InputTrack.");
        this._track = e;
    }
    class_14.prototype.getFirstPacket = function (e) {
        if (e === void 0) { e = {}; }
        return mt(e), this._track._backing.getFirstPacket(e);
    };
    class_14.prototype.getPacket = function (e, t) {
        if (t === void 0) { t = {}; }
        return Pe(e), mt(t), this._track._backing.getPacket(e, t);
    };
    class_14.prototype.getNextPacket = function (e, t) {
        if (t === void 0) { t = {}; }
        if (!(e instanceof D))
            throw new TypeError("packet must be an EncodedPacket.");
        return mt(t), this._track._backing.getNextPacket(e, t);
    };
    class_14.prototype.getKeyPacket = function (e, t) {
        if (t === void 0) { t = {}; }
        return Pe(e), mt(t), this._track._backing.getKeyPacket(e, t);
    };
    class_14.prototype.getNextKeyPacket = function (e, t) {
        if (t === void 0) { t = {}; }
        if (!(e instanceof D))
            throw new TypeError("packet must be an EncodedPacket.");
        return mt(t), this._track._backing.getNextKeyPacket(e, t);
    };
    class_14.prototype.packets = function (e, t, s) {
        var _b;
        var _this = this;
        if (s === void 0) { s = {}; }
        if (e !== void 0 && !(e instanceof D))
            throw new TypeError("startPacket must be an EncodedPacket.");
        if (e !== void 0 && e.isMetadataOnly && !(s === null || s === void 0 ? void 0 : s.metadataOnly))
            throw new TypeError("startPacket can only be metadata-only if options.metadataOnly is enabled.");
        if (t !== void 0 && !(t instanceof D))
            throw new TypeError("endPacket must be an EncodedPacket.");
        mt(s);
        var i = [], _c = N(), n = _c.promise, a = _c.resolve, _d = N(), o = _d.promise, c = _d.resolve, l = !1, d = !1, u = null, f = [], h = function () { return Math.max(2, f.length); };
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var p, _b;
            var _c, _d;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!(e !== null && e !== void 0)) return [3 /*break*/, 1];
                        _b = e;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getFirstPacket(s)];
                    case 2:
                        _b = _f.sent();
                        _f.label = 3;
                    case 3:
                        p = _b;
                        _f.label = 4;
                    case 4:
                        if (!(p && !d && !(t && p.sequenceNumber >= (t === null || t === void 0 ? void 0 : t.sequenceNumber)))) return [3 /*break*/, 9];
                        if (!(i.length > h())) return [3 /*break*/, 6];
                        (_c = N(), o = _c.promise, c = _c.resolve);
                        return [4 /*yield*/, o];
                    case 5:
                        _f.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        i.push(p), a(), (_d = N(), n = _d.promise, a = _d.resolve);
                        return [4 /*yield*/, this.getNextPacket(p, s)];
                    case 7:
                        p = _f.sent();
                        _f.label = 8;
                    case 8: return [3 /*break*/, 4];
                    case 9:
                        l = !0, a();
                        return [2 /*return*/];
                }
            });
        }); })().catch(function (p) { u || (u = p, a()); }), (_b = { next: function () {
                    return __awaiter(this, void 0, void 0, function () { var p, w; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (d)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                if (u)
                                    throw u;
                                if (!(i.length > 0)) return [3 /*break*/, 1];
                                p = i.shift(), w = performance.now();
                                for (f.push(w); f.length > 0 && w - f[0] >= 1e3;)
                                    f.shift();
                                return [2 /*return*/, (c(), { value: p, done: !1 })];
                            case 1:
                                if (l)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                return [4 /*yield*/, n];
                            case 2:
                                _b.sent();
                                _b.label = 3;
                            case 3: return [3 /*break*/, 0];
                            case 4: return [2 /*return*/];
                        }
                    }); });
                }, return: function () {
                    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
                        return [2 /*return*/, (d = !0, c(), a(), { value: void 0, done: !0 })];
                    }); });
                }, throw: function (p) {
                    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
                        throw p;
                    }); });
                } }, _b[Symbol.asyncIterator] = function () { return this; }, _b);
    };
    return class_14;
}()), Mt = /** @class */ (function () {
    function Mt(e, t) {
        this.onSample = e, this.onError = t;
    }
    return Mt;
}()), zt = /** @class */ (function () {
    function class_15() {
    }
    class_15.prototype.mediaSamplesInRange = function (e, t) {
        var _b;
        var _this = this;
        if (e === void 0) { e = 0; }
        if (t === void 0) { t = 1 / 0; }
        Pe(e), Pe(t);
        var s = [], i = !1, n = null, _c = N(), a = _c.promise, o = _c.resolve, _d = N(), c = _d.promise, l = _d.resolve, d = !1, u = !1, f = !1, h = null;
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var p, w, g, T, _b, S, E, b, x, _c, _d, y, b, x, _f;
            var _g;
            var _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        p = new Error;
                        return [4 /*yield*/, this._createDecoder(function (b) {
                                var _b;
                                if (l(), b.timestamp >= t && (u = !0), u) {
                                    b.close();
                                    return;
                                }
                                n && (b.timestamp > e ? (s.push(n), i = !0) : n.close()), b.timestamp >= e && (s.push(b), i = !0), n = i ? null : b, s.length > 0 && (o(), (_b = N(), a = _b.promise, o = _b.resolve, _b));
                            }, function (b) { h || (b.stack = p.stack, h = b, o()); })];
                    case 1:
                        w = _j.sent(), g = this._createPacketSink();
                        return [4 /*yield*/, g.getKeyPacket(e)];
                    case 2:
                        if (!((_h = _j.sent()) !== null && _h !== void 0)) return [3 /*break*/, 3];
                        _b = _h;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, g.getFirstPacket()];
                    case 4:
                        _b = _j.sent();
                        _j.label = 5;
                    case 5:
                        T = _b;
                        if (!T)
                            return [2 /*return*/];
                        S = T;
                        if (!(t < 1 / 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, g.getPacket(t)];
                    case 6:
                        b = _j.sent();
                        if (!b) return [3 /*break*/, 10];
                        if (!(b.type === "key" && b.timestamp === t)) return [3 /*break*/, 7];
                        _d = b;
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, g.getNextKeyPacket(b)];
                    case 8:
                        _d = _j.sent();
                        _j.label = 9;
                    case 9:
                        _c = _d;
                        return [3 /*break*/, 11];
                    case 10:
                        _c = null;
                        _j.label = 11;
                    case 11:
                        x = _c;
                        x && (E = x);
                        _j.label = 12;
                    case 12:
                        y = g.packets(T, E);
                        return [4 /*yield*/, y.next()];
                    case 13:
                        _j.sent();
                        _j.label = 14;
                    case 14:
                        if (!(S && !u)) return [3 /*break*/, 19];
                        b = mn(s.length);
                        if (!(s.length + w.getDecodeQueueSize() > b)) return [3 /*break*/, 16];
                        (_g = N(), c = _g.promise, l = _g.resolve);
                        return [4 /*yield*/, c];
                    case 15:
                        _j.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        w.decode(S);
                        return [4 /*yield*/, y.next()];
                    case 17:
                        x = _j.sent();
                        if (x.done)
                            return [3 /*break*/, 19];
                        S = x.value;
                        _j.label = 18;
                    case 18: return [3 /*break*/, 14];
                    case 19: return [4 /*yield*/, y.return()];
                    case 20:
                        _j.sent();
                        _f = f;
                        if (_f) return [3 /*break*/, 22];
                        return [4 /*yield*/, w.flush()];
                    case 21:
                        _f = (_j.sent());
                        _j.label = 22;
                    case 22:
                        _f, w.close(), !i && n && s.push(n), d = !0, o();
                        return [2 /*return*/];
                }
            });
        }); })().catch(function (p) { h || (h = p, o()); }), (_b = { next: function () {
                    return __awaiter(this, void 0, void 0, function () { var p; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (f)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                if (h)
                                    throw h;
                                if (!(s.length > 0)) return [3 /*break*/, 1];
                                p = s.shift();
                                return [2 /*return*/, (l(), { value: p, done: !1 })];
                            case 1:
                                if (!!d) return [3 /*break*/, 3];
                                return [4 /*yield*/, a];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3: return [2 /*return*/, { value: void 0, done: !0 }];
                            case 4: return [3 /*break*/, 0];
                            case 5: return [2 /*return*/];
                        }
                    }); });
                }, return: function () {
                    return __awaiter(this, void 0, void 0, function () { var _b, s_6, p; return __generator(this, function (_c) {
                        f = !0, u = !0, l(), o(), n === null || n === void 0 ? void 0 : n.close();
                        for (_b = 0, s_6 = s; _b < s_6.length; _b++) {
                            p = s_6[_b];
                            p.close();
                        }
                        return [2 /*return*/, { value: void 0, done: !0 }];
                    }); });
                }, throw: function (p) {
                    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
                        throw p;
                    }); });
                } }, _b[Symbol.asyncIterator] = function () { return this; }, _b);
    };
    class_15.prototype.mediaSamplesAtTimestamps = function (e) {
        var _b;
        var _this = this;
        wi(e);
        var t = gi(e), s = [], i = [], _c = N(), n = _c.promise, a = _c.resolve, _d = N(), o = _d.promise, c = _d.resolve, l = !1, d = !1, u = null, f = function (h) {
            var _b;
            i.push(h), a(), (_b = N(), n = _b.promise, a = _b.resolve);
        };
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var h, p, w, g, T, S, E, y, t_3, t_3_1, b, x, C, _b, _c, _d, e_4_1, _f, _g;
            var _this = this;
            var e_4, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        h = new Error;
                        return [4 /*yield*/, this._createDecoder(function (b) { if (c(), d) {
                                b.close();
                                return;
                            } var x = 0; for (; s.length > 0 && b.timestamp - s[0] > -1e-10;)
                                x++, s.shift(); if (x > 0)
                                for (var C = 0; C < x; C++)
                                    f(C < x - 1 ? b.clone() : b);
                            else
                                b.close(); }, function (b) { u || (b.stack = h.stack, u = b, a()); })];
                    case 1:
                        p = _j.sent(), w = this._createPacketSink(), g = null, T = null, S = -1, E = function () { return __awaiter(_this, void 0, void 0, function () {
                            var b, x, C;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        m(T);
                                        b = T;
                                        p.decode(b);
                                        _c.label = 1;
                                    case 1:
                                        if (!(b.sequenceNumber < S)) return [3 /*break*/, 8];
                                        x = mn(i.length);
                                        _c.label = 2;
                                    case 2:
                                        if (!(i.length + p.getDecodeQueueSize() > x && !d)) return [3 /*break*/, 5];
                                        (_b = N(), o = _b.promise, c = _b.resolve);
                                        return [4 /*yield*/, o];
                                    case 3:
                                        _c.sent();
                                        _c.label = 4;
                                    case 4: return [3 /*break*/, 2];
                                    case 5:
                                        if (d)
                                            return [3 /*break*/, 8];
                                        return [4 /*yield*/, w.getNextPacket(b)];
                                    case 6:
                                        C = _c.sent();
                                        m(C), b = C, p.decode(C);
                                        _c.label = 7;
                                    case 7: return [3 /*break*/, 1];
                                    case 8:
                                        S = -1;
                                        return [2 /*return*/];
                                }
                            });
                        }); }, y = function () { return __awaiter(_this, void 0, void 0, function () { var b; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, p.flush()];
                                case 1:
                                    _b.sent();
                                    for (b = 0; b < s.length; b++)
                                        f(null);
                                    s.length = 0;
                                    return [2 /*return*/];
                            }
                        }); }); };
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 17, 18, 23]);
                        t_3 = __asyncValues(t);
                        _j.label = 3;
                    case 3: return [4 /*yield*/, t_3.next()];
                    case 4:
                        if (!(t_3_1 = _j.sent(), !t_3_1.done)) return [3 /*break*/, 16];
                        b = t_3_1.value;
                        if (Pe(b), d)
                            return [3 /*break*/, 16];
                        return [4 /*yield*/, w.getPacket(b)];
                    case 5:
                        x = _j.sent();
                        _b = x;
                        if (!_b) return [3 /*break*/, 7];
                        return [4 /*yield*/, w.getKeyPacket(b)];
                    case 6:
                        _b = (_j.sent());
                        _j.label = 7;
                    case 7:
                        C = _b;
                        if (!!C) return [3 /*break*/, 11];
                        _c = S !== -1;
                        if (!_c) return [3 /*break*/, 10];
                        return [4 /*yield*/, E()];
                    case 8:
                        _j.sent();
                        return [4 /*yield*/, y()];
                    case 9:
                        _c = (_j.sent());
                        _j.label = 10;
                    case 10:
                        _c, f(null), g = null;
                        return [3 /*break*/, 15];
                    case 11:
                        _d = g && (C.sequenceNumber !== T.sequenceNumber || x.timestamp < g.timestamp);
                        if (!_d) return [3 /*break*/, 14];
                        return [4 /*yield*/, E()];
                    case 12:
                        _j.sent();
                        return [4 /*yield*/, y()];
                    case 13:
                        _d = (_j.sent());
                        _j.label = 14;
                    case 14:
                        _d, s.push(x.timestamp), S = Math.max(x.sequenceNumber, S), g = x, T = C;
                        _j.label = 15;
                    case 15: return [3 /*break*/, 3];
                    case 16: return [3 /*break*/, 23];
                    case 17:
                        e_4_1 = _j.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 23];
                    case 18:
                        _j.trys.push([18, , 21, 22]);
                        if (!(t_3_1 && !t_3_1.done && (_h = t_3.return))) return [3 /*break*/, 20];
                        return [4 /*yield*/, _h.call(t_3)];
                    case 19:
                        _j.sent();
                        _j.label = 20;
                    case 20: return [3 /*break*/, 22];
                    case 21:
                        if (e_4) throw e_4.error;
                        return [7 /*endfinally*/];
                    case 22: return [7 /*endfinally*/];
                    case 23:
                        _f = d;
                        if (_f) return [3 /*break*/, 27];
                        _g = S !== -1;
                        if (!_g) return [3 /*break*/, 25];
                        return [4 /*yield*/, E()];
                    case 24:
                        _g = (_j.sent());
                        _j.label = 25;
                    case 25:
                        _g;
                        return [4 /*yield*/, y()];
                    case 26:
                        _f = (_j.sent());
                        _j.label = 27;
                    case 27:
                        _f, p.close(), l = !0, a();
                        return [2 /*return*/];
                }
            });
        }); })().catch(function (h) { u || (u = h, a()); }), (_b = { next: function () {
                    return __awaiter(this, void 0, void 0, function () { var h; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (d)
                                    return [2 /*return*/, { value: void 0, done: !0 }];
                                if (u)
                                    throw u;
                                if (!(i.length > 0)) return [3 /*break*/, 1];
                                h = i.shift();
                                return [2 /*return*/, (m(h !== void 0), c(), { value: h, done: !1 })];
                            case 1:
                                if (!!l) return [3 /*break*/, 3];
                                return [4 /*yield*/, n];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3: return [2 /*return*/, { value: void 0, done: !0 }];
                            case 4: return [3 /*break*/, 0];
                            case 5: return [2 /*return*/];
                        }
                    }); });
                }, return: function () {
                    return __awaiter(this, void 0, void 0, function () { var _b, i_3, h; return __generator(this, function (_c) {
                        d = !0, c(), a();
                        for (_b = 0, i_3 = i; _b < i_3.length; _b++) {
                            h = i_3[_b];
                            h === null || h === void 0 ? void 0 : h.close();
                        }
                        return [2 /*return*/, { value: void 0, done: !0 }];
                    }); });
                }, throw: function (h) {
                    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
                        throw h;
                    }); });
                } }, _b[Symbol.asyncIterator] = function () { return this; }, _b);
    };
    return class_15;
}()), mn = function (r) { return r === 0 ? 40 : 8; }, zs = /** @class */ (function (_super) {
    __extends(class_16, _super);
    function class_16(e, t, s, i, n, a) {
        var _this = this;
        _this = _super.call(this, e, t) || this, _this.rotation = n, _this.timeResolution = a, _this.decoder = null, _this.customDecoder = null, _this.customDecoderCallSerializer = new Ae, _this.customDecoderQueueSize = 0, _this.sampleQueue = [];
        var o = function (l) { if (_this.sampleQueue.length > 0 && l.timestamp >= U(_this.sampleQueue).timestamp) {
            for (var _b = 0, _c = _this.sampleQueue; _b < _c.length; _b++) {
                var u = _c[_b];
                _this.finalizeAndEmitSample(u);
            }
            _this.sampleQueue.length = 0;
        } var d = O(_this.sampleQueue, l.timestamp, function (u) { return u.timestamp; }); _this.sampleQueue.splice(d + 1, 0, l); }, c = yt.find(function (l) { return l.supports(s, i); });
        c ? (_this.customDecoder = new c, _this.customDecoder.codec = s, _this.customDecoder.config = i, _this.customDecoder.onSample = function (l) { if (!(l instanceof le))
            throw new TypeError("The argument passed to onSample must be a VideoSample."); o(l); }, _this.customDecoderCallSerializer.call(function () { return _this.customDecoder.init(); })) : (_this.decoder = new VideoDecoder({ output: function (l) { return o(new le(l)); }, error: t }), _this.decoder.configure(i));
        return _this;
    }
    class_16.prototype.finalizeAndEmitSample = function (e) { e.setTimestamp(Math.round(e.timestamp * this.timeResolution) / this.timeResolution), e.setDuration(Math.round(e.duration * this.timeResolution) / this.timeResolution), this.onSample(e); };
    class_16.prototype.getDecodeQueueSize = function () { return this.customDecoder ? this.customDecoderQueueSize : (m(this.decoder), this.decoder.decodeQueueSize); };
    class_16.prototype.decode = function (e) {
        var _this = this;
        this.customDecoder ? (this.customDecoderQueueSize++, this.customDecoderCallSerializer.call(function () { return _this.customDecoder.decode(e); }).then(function () { return _this.customDecoderQueueSize--; })) : (m(this.decoder), this.decoder.decode(e.toEncodedVideoChunk()));
    };
    class_16.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, _d, e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!this.customDecoder) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.customDecoderCallSerializer.call(function () { return _this.customDecoder.flush(); })];
                    case 1:
                        _b = _f.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        m(this.decoder);
                        return [4 /*yield*/, this.decoder.flush()];
                    case 3:
                        _b = (_f.sent());
                        _f.label = 4;
                    case 4:
                        _b;
                        for (_c = 0, _d = this.sampleQueue; _c < _d.length; _c++) {
                            e = _d[_c];
                            this.finalizeAndEmitSample(e);
                        }
                        this.sampleQueue.length = 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    class_16.prototype.close = function () {
        var _this = this;
        this.customDecoder ? this.customDecoderCallSerializer.call(function () { return _this.customDecoder.close(); }) : (m(this.decoder), this.decoder.close());
        for (var _b = 0, _c = this.sampleQueue; _b < _c.length; _b++) {
            var e = _c[_b];
            e.close();
        }
        this.sampleQueue.length = 0;
    };
    return class_16;
}(Mt)), ht = /** @class */ (function (_super) {
    __extends(class_17, _super);
    function class_17(e) {
        var _this = this;
        if (!(e instanceof he))
            throw new TypeError("videoTrack must be an InputVideoTrack.");
        _this = _super.call(this) || this, _this._videoTrack = e;
        return _this;
    }
    class_17.prototype._createDecoder = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._videoTrack.canDecode()];
                case 1:
                    if (!(_b.sent()))
                        throw new Error("This video track cannot be decoded by this browser. Make sure to check decodability before using a track.");
                    s = this._videoTrack.codec, i = this._videoTrack.rotation;
                    return [4 /*yield*/, this._videoTrack.getDecoderConfig()];
                case 2:
                    n = _b.sent(), a = this._videoTrack.timeResolution;
                    return [2 /*return*/, (m(s && n), new zs(e, t, s, n, i, a))];
            }
        }); });
    };
    class_17.prototype._createPacketSink = function () { return new we(this._videoTrack); };
    class_17.prototype.getSample = function (e) {
        var e_5, _b;
        return __awaiter(this, void 0, void 0, function () { var _c, _d, t, e_5_1; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    Pe(e);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 12]);
                    _c = __asyncValues(this.mediaSamplesAtTimestamps([e]));
                    _f.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _f.sent(), !_d.done)) return [3 /*break*/, 5];
                    t = _d.value;
                    return [2 /*return*/, t];
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_5_1 = _f.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _f.trys.push([7, , 10, 11]);
                    if (!(_d && !_d.done && (_b = _c.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _b.call(_c)];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_5) throw e_5.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: throw new Error("Internal error: Iterator returned nothing.");
            }
        }); });
    };
    class_17.prototype.samples = function (e, t) {
        if (e === void 0) { e = 0; }
        if (t === void 0) { t = 1 / 0; }
        return this.mediaSamplesInRange(e, t);
    };
    class_17.prototype.samplesAtTimestamps = function (e) { return this.mediaSamplesAtTimestamps(e); };
    return class_17;
}(zt)), Ut = /** @class */ (function () {
    function class_18(e, t) {
        if (t === void 0) { t = {}; }
        var _b, _c, _d;
        if (this._nextCanvasIndex = 0, !(e instanceof he))
            throw new TypeError("videoTrack must be an InputVideoTrack.");
        if (t && typeof t != "object")
            throw new TypeError("options must be an object.");
        if (t.width !== void 0 && (!Number.isInteger(t.width) || t.width <= 0))
            throw new TypeError("options.width, when defined, must be a positive integer.");
        if (t.height !== void 0 && (!Number.isInteger(t.height) || t.height <= 0))
            throw new TypeError("options.height, when defined, must be a positive integer.");
        if (t.fit !== void 0 && !["fill", "contain", "cover"].includes(t.fit))
            throw new TypeError('options.fit, when provided, must be one of "fill", "contain", or "cover".');
        if (t.width !== void 0 && t.height !== void 0 && t.fit === void 0)
            throw new TypeError("When both options.width and options.height are provided, options.fit must also be provided.");
        if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
            throw new TypeError("options.rotation, when provided, must be 0, 90, 180 or 270.");
        if (t.poolSize !== void 0 && (typeof t.poolSize != "number" || !Number.isInteger(t.poolSize) || t.poolSize < 0))
            throw new TypeError("poolSize must be a non-negative integer.");
        var s = (_b = t.rotation) !== null && _b !== void 0 ? _b : e.rotation, _f = s % 180 === 0 ? [e.codedWidth, e.codedHeight] : [e.codedHeight, e.codedWidth], i = _f[0], n = _f[1], a = i / n;
        t.width !== void 0 && t.height === void 0 ? (i = t.width, n = Math.round(i / a)) : t.width === void 0 && t.height !== void 0 ? (n = t.height, i = Math.round(n * a)) : t.width !== void 0 && t.height !== void 0 && (i = t.width, n = t.height), this._videoTrack = e, this._width = i, this._height = n, this._rotation = s, this._fit = (_c = t.fit) !== null && _c !== void 0 ? _c : "fill", this._videoSampleSink = new ht(e), this._canvasPool = Array.from({ length: (_d = t.poolSize) !== null && _d !== void 0 ? _d : 0 }, function () { return null; });
    }
    class_18.prototype._videoSampleToWrappedCanvas = function (e) { var t = this._canvasPool[this._nextCanvasIndex]; t || (typeof document < "u" ? (t = document.createElement("canvas"), t.width = this._width, t.height = this._height) : t = new OffscreenCanvas(this._width, this._height), this._canvasPool.length > 0 && (this._canvasPool[this._nextCanvasIndex] = t)), this._canvasPool.length > 0 && (this._nextCanvasIndex = (this._nextCanvasIndex + 1) % this._canvasPool.length); var s = t.getContext("2d", { alpha: !1 }); m(s), s.resetTransform(); var i, n, a, o; if (this._fit === "fill")
        i = 0, n = 0, a = this._width, o = this._height;
    else {
        var _b = this._rotation % 180 === 0 ? [e.codedWidth, e.codedHeight] : [e.codedHeight, e.codedWidth], d = _b[0], u = _b[1], f = this._fit === "contain" ? Math.min(this._width / d, this._height / u) : Math.max(this._width / d, this._height / u);
        a = d * f, o = u * f, i = (this._width - a) / 2, n = (this._height - o) / 2;
    } var c = this._rotation % 180 === 0 ? 1 : a / o; s.translate(this._width / 2, this._height / 2), s.rotate(this._rotation * Math.PI / 180), s.scale(1 / c, c), s.translate(-this._width / 2, -this._height / 2), s.drawImage(e.toCanvasImageSource(), i, n, a, o); var l = { canvas: t, timestamp: e.timestamp, duration: e.duration }; return e.close(), l; };
    class_18.prototype.getCanvas = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    Pe(e);
                    return [4 /*yield*/, this._videoSampleSink.getSample(e)];
                case 1:
                    t = _b.sent();
                    return [2 /*return*/, t && this._videoSampleToWrappedCanvas(t)];
            }
        }); });
    };
    class_18.prototype.canvases = function (e, t) {
        var _this = this;
        if (e === void 0) { e = 0; }
        if (t === void 0) { t = 1 / 0; }
        return St(this._videoSampleSink.samples(e, t), function (s) { return _this._videoSampleToWrappedCanvas(s); });
    };
    class_18.prototype.canvasesAtTimestamps = function (e) {
        var _this = this;
        return St(this._videoSampleSink.samplesAtTimestamps(e), function (t) { return t && _this._videoSampleToWrappedCanvas(t); });
    };
    return class_18;
}()), Us = /** @class */ (function (_super) {
    __extends(Us, _super);
    function Us(e, t, s, i) {
        var _this = this;
        _this = _super.call(this, e, t) || this, _this.decoder = null, _this.customDecoder = null, _this.customDecoderCallSerializer = new Ae, _this.customDecoderQueueSize = 0;
        var n = function (o) { var c = i.sampleRate; o.setTimestamp(Math.round(o.timestamp * c) / c), e(o); }, a = Ct.find(function (o) { return o.supports(s, i); });
        a ? (_this.customDecoder = new a, _this.customDecoder.codec = s, _this.customDecoder.config = i, _this.customDecoder.onSample = function (o) { if (!(o instanceof ne))
            throw new TypeError("The argument passed to onSample must be an AudioSample."); n(o); }, _this.customDecoderCallSerializer.call(function () { return _this.customDecoder.init(); })) : (_this.decoder = new AudioDecoder({ output: function (o) { return n(new ne(o)); }, error: t }), _this.decoder.configure(i));
        return _this;
    }
    Us.prototype.getDecodeQueueSize = function () { return this.customDecoder ? this.customDecoderQueueSize : (m(this.decoder), this.decoder.decodeQueueSize); };
    Us.prototype.decode = function (e) {
        var _this = this;
        this.customDecoder ? (this.customDecoderQueueSize++, this.customDecoderCallSerializer.call(function () { return _this.customDecoder.decode(e); }).then(function () { return _this.customDecoderQueueSize--; })) : (m(this.decoder), this.decoder.decode(e.toEncodedAudioChunk()));
    };
    Us.prototype.flush = function () {
        var _this = this;
        return this.customDecoder ? this.customDecoderCallSerializer.call(function () { return _this.customDecoder.flush(); }) : (m(this.decoder), this.decoder.flush());
    };
    Us.prototype.close = function () {
        var _this = this;
        this.customDecoder ? this.customDecoderCallSerializer.call(function () { return _this.customDecoder.close(); }) : (m(this.decoder), this.decoder.close());
    };
    return Us;
}(Mt)), Ds = /** @class */ (function (_super) {
    __extends(class_19, _super);
    function class_19(e, t, s) {
        var _this = this;
        _this = _super.call(this, e, t) || this, _this.decoderConfig = s, _this.currentTimestamp = null, m(V.includes(s.codec)), _this.codec = s.codec;
        var _b = X(_this.codec), i = _b.dataType, n = _b.sampleSize, a = _b.littleEndian;
        switch ((_this.inputSampleSize = n, n)) {
            case 1:
                i === "unsigned" ? _this.readInputValue = function (o, c) { return o.getUint8(c) - Math.pow(2, 7); } : i === "signed" ? _this.readInputValue = function (o, c) { return o.getInt8(c); } : i === "ulaw" ? _this.readInputValue = function (o, c) { return dn(o.getUint8(c)); } : i === "alaw" ? _this.readInputValue = function (o, c) { return un(o.getUint8(c)); } : m(!1);
                break;
            case 2:
                i === "unsigned" ? _this.readInputValue = function (o, c) { return o.getUint16(c, a) - Math.pow(2, 15); } : i === "signed" ? _this.readInputValue = function (o, c) { return o.getInt16(c, a); } : m(!1);
                break;
            case 3:
                i === "unsigned" ? _this.readInputValue = function (o, c) { return hs(o, c, a) - Math.pow(2, 23); } : i === "signed" ? _this.readInputValue = function (o, c) { return ki(o, c, a); } : m(!1);
                break;
            case 4:
                i === "unsigned" ? _this.readInputValue = function (o, c) { return o.getUint32(c, a) - Math.pow(2, 31); } : i === "signed" ? _this.readInputValue = function (o, c) { return o.getInt32(c, a); } : i === "float" ? _this.readInputValue = function (o, c) { return o.getFloat32(c, a); } : m(!1);
                break;
            case 8:
                i === "float" ? _this.readInputValue = function (o, c) { return o.getFloat64(c, a); } : m(!1);
                break;
            default: bt(n), m(!1);
        }
        switch (n) {
            case 1:
                i === "ulaw" || i === "alaw" ? (_this.outputSampleSize = 2, _this.outputFormat = "s16", _this.writeOutputValue = function (o, c, l) { return o.setInt16(c, l, !0); }) : (_this.outputSampleSize = 1, _this.outputFormat = "u8", _this.writeOutputValue = function (o, c, l) { return o.setUint8(c, l + Math.pow(2, 7)); });
                break;
            case 2:
                _this.outputSampleSize = 2, _this.outputFormat = "s16", _this.writeOutputValue = function (o, c, l) { return o.setInt16(c, l, !0); };
                break;
            case 3:
                _this.outputSampleSize = 4, _this.outputFormat = "s32", _this.writeOutputValue = function (o, c, l) { return o.setInt32(c, l << 8, !0); };
                break;
            case 4:
                _this.outputSampleSize = 4, i === "float" ? (_this.outputFormat = "f32", _this.writeOutputValue = function (o, c, l) { return o.setFloat32(c, l, !0); }) : (_this.outputFormat = "s32", _this.writeOutputValue = function (o, c, l) { return o.setInt32(c, l, !0); });
                break;
            case 8:
                _this.outputSampleSize = 4, _this.outputFormat = "f32", _this.writeOutputValue = function (o, c, l) { return o.setFloat32(c, l, !0); };
                break;
            default: bt(n), m(!1);
        }
        return _this;
    }
    class_19.prototype.getDecodeQueueSize = function () { return 0; };
    class_19.prototype.decode = function (e) { var t = Z(e.data), s = e.byteLength / this.decoderConfig.numberOfChannels / this.inputSampleSize, i = s * this.decoderConfig.numberOfChannels * this.outputSampleSize, n = new ArrayBuffer(i), a = new DataView(n); for (var d = 0; d < s * this.decoderConfig.numberOfChannels; d++) {
        var u = d * this.inputSampleSize, f = d * this.outputSampleSize, h = this.readInputValue(t, u);
        this.writeOutputValue(a, f, h);
    } var o = s / this.decoderConfig.sampleRate; (this.currentTimestamp === null || Math.abs(e.timestamp - this.currentTimestamp) >= o) && (this.currentTimestamp = e.timestamp); var c = this.currentTimestamp; this.currentTimestamp += o; var l = new ne({ format: this.outputFormat, data: n, numberOfChannels: this.decoderConfig.numberOfChannels, sampleRate: this.decoderConfig.sampleRate, numberOfFrames: s, timestamp: c }); this.onSample(l); };
    class_19.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_19.prototype.close = function () { };
    return class_19;
}(Mt)), $e = /** @class */ (function (_super) {
    __extends(class_20, _super);
    function class_20(e) {
        var _this = this;
        if (!(e instanceof Y))
            throw new TypeError("audioTrack must be an InputAudioTrack.");
        _this = _super.call(this) || this, _this._audioTrack = e;
        return _this;
    }
    class_20.prototype._createDecoder = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._audioTrack.canDecode()];
                case 1:
                    if (!(_b.sent()))
                        throw new Error("This audio track cannot be decoded by this browser. Make sure to check decodability before using a track.");
                    s = this._audioTrack.codec;
                    return [4 /*yield*/, this._audioTrack.getDecoderConfig()];
                case 2:
                    i = _b.sent();
                    return [2 /*return*/, (m(s && i), V.includes(i.codec) ? new Ds(e, t, i) : new Us(e, t, s, i))];
            }
        }); });
    };
    class_20.prototype._createPacketSink = function () { return new we(this._audioTrack); };
    class_20.prototype.getSample = function (e) {
        var e_6, _b;
        return __awaiter(this, void 0, void 0, function () { var _c, _d, t, e_6_1; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    Pe(e);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 12]);
                    _c = __asyncValues(this.mediaSamplesAtTimestamps([e]));
                    _f.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _f.sent(), !_d.done)) return [3 /*break*/, 5];
                    t = _d.value;
                    return [2 /*return*/, t];
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_6_1 = _f.sent();
                    e_6 = { error: e_6_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _f.trys.push([7, , 10, 11]);
                    if (!(_d && !_d.done && (_b = _c.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _b.call(_c)];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_6) throw e_6.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: throw new Error("Internal error: Iterator returned nothing.");
            }
        }); });
    };
    class_20.prototype.samples = function (e, t) {
        if (e === void 0) { e = 0; }
        if (t === void 0) { t = 1 / 0; }
        return this.mediaSamplesInRange(e, t);
    };
    class_20.prototype.samplesAtTimestamps = function (e) { return this.mediaSamplesAtTimestamps(e); };
    return class_20;
}(zt)), Vs = /** @class */ (function () {
    function class_21(e) {
        if (!(e instanceof Y))
            throw new TypeError("audioTrack must be an InputAudioTrack.");
        this._audioSampleSink = new $e(e);
    }
    class_21.prototype._audioSampleToWrappedArrayBuffer = function (e) { return { buffer: e.toAudioBuffer(), timestamp: e.timestamp, duration: e.duration }; };
    class_21.prototype.getBuffer = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    Pe(e);
                    return [4 /*yield*/, this._audioSampleSink.getSample(e)];
                case 1:
                    t = _b.sent();
                    return [2 /*return*/, t && this._audioSampleToWrappedArrayBuffer(t)];
            }
        }); });
    };
    class_21.prototype.buffers = function (e, t) {
        var _this = this;
        if (e === void 0) { e = 0; }
        if (t === void 0) { t = 1 / 0; }
        return St(this._audioSampleSink.samples(e, t), function (s) { return _this._audioSampleToWrappedArrayBuffer(s); });
    };
    class_21.prototype.buffersAtTimestamps = function (e) {
        var _this = this;
        return St(this._audioSampleSink.samplesAtTimestamps(e), function (t) { return t && _this._audioSampleToWrappedArrayBuffer(t); });
    };
    return class_21;
}());
exports.EncodedPacketSink = we;
exports.BaseMediaSampleSink = zt;
exports.VideoSampleSink = ht;
exports.CanvasSink = Ut;
exports.AudioSampleSink = $e;
exports.AudioBufferSink = Vs;
var Qe = /** @class */ (function () {
    function class_22(e) {
        this._backing = e;
    }
    class_22.prototype.isVideoTrack = function () { return this instanceof he; };
    class_22.prototype.isAudioTrack = function () { return this instanceof Y; };
    Object.defineProperty(class_22.prototype, "id", {
        get: function () { return this._backing.getId(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_22.prototype, "languageCode", {
        get: function () { return this._backing.getLanguageCode(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_22.prototype, "timeResolution", {
        get: function () { return this._backing.getTimeResolution(); },
        enumerable: false,
        configurable: true
    });
    class_22.prototype.getFirstTimestamp = function () { return this._backing.getFirstTimestamp(); };
    class_22.prototype.computeDuration = function () { return this._backing.computeDuration(); };
    class_22.prototype.computePacketStats = function (e) {
        var e_7, _b;
        if (e === void 0) { e = 1 / 0; }
        return __awaiter(this, void 0, void 0, function () { var t, s, i, n, a, _c, _d, o, e_7_1; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    t = new we(this), s = 1 / 0, i = -1 / 0, n = 0, a = 0;
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 12]);
                    _c = __asyncValues(t.packets(void 0, void 0, { metadataOnly: !0 }));
                    _f.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _f.sent(), !_d.done)) return [3 /*break*/, 5];
                    o = _d.value;
                    if (n >= e && o.timestamp >= i)
                        return [3 /*break*/, 5];
                    s = Math.min(s, o.timestamp), i = Math.max(i, o.timestamp + o.duration), n++, a += o.byteLength;
                    _f.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_7_1 = _f.sent();
                    e_7 = { error: e_7_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _f.trys.push([7, , 10, 11]);
                    if (!(_d && !_d.done && (_b = _c.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _b.call(_c)];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_7) throw e_7.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, { packetCount: n, averagePacketRate: n ? Number((n / (i - s)).toPrecision(16)) : 0, averageBitrate: n ? Number((8 * a / (i - s)).toPrecision(16)) : 0 }];
            }
        }); });
    };
    return class_22;
}()), he = /** @class */ (function (_super) {
    __extends(class_23, _super);
    function class_23(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this._backing = e;
        return _this;
    }
    Object.defineProperty(class_23.prototype, "type", {
        get: function () { return "video"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "codec", {
        get: function () { return this._backing.getCodec(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "codedWidth", {
        get: function () { return this._backing.getCodedWidth(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "codedHeight", {
        get: function () { return this._backing.getCodedHeight(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "rotation", {
        get: function () { return this._backing.getRotation(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "displayWidth", {
        get: function () { return this._backing.getRotation() % 180 === 0 ? this._backing.getCodedWidth() : this._backing.getCodedHeight(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_23.prototype, "displayHeight", {
        get: function () { return this._backing.getRotation() % 180 === 0 ? this._backing.getCodedHeight() : this._backing.getCodedWidth(); },
        enumerable: false,
        configurable: true
    });
    class_23.prototype.getColorSpace = function () { return this._backing.getColorSpace(); };
    class_23.prototype.hasHighDynamicRange = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._backing.getColorSpace()];
                case 1:
                    e = _b.sent();
                    return [2 /*return*/, e.primaries === "bt2020" || e.primaries === "smpte432" || e.transfer === "pg" || e.transfer === "hlg" || e.matrix === "bt2020-ncl"];
            }
        }); });
    };
    class_23.prototype.getDecoderConfig = function () { return this._backing.getDecoderConfig(); };
    class_23.prototype.getCodecParameterString = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this._backing.getDecoderConfig()];
                case 1: return [2 /*return*/, (_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.codec) !== null && _c !== void 0 ? _c : null];
            }
        }); });
    };
    class_23.prototype.canDecode = function () {
        return __awaiter(this, void 0, void 0, function () { var e_9, t_4, _b, _c, e_8; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, this._backing.getDecoderConfig()];
                case 1:
                    e_9 = _d.sent();
                    if (!e_9)
                        return [2 /*return*/, !1];
                    t_4 = this._backing.getCodec();
                    m(t_4 !== null);
                    if (!yt.some(function (i) { return i.supports(t_4, e_9); })) return [3 /*break*/, 2];
                    _b = !0;
                    return [3 /*break*/, 6];
                case 2:
                    if (!(typeof VideoDecoder > "u")) return [3 /*break*/, 3];
                    _c = !1;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, VideoDecoder.isConfigSupported(e_9)];
                case 4:
                    _c = (_d.sent()).supported === !0;
                    _d.label = 5;
                case 5:
                    _b = _c;
                    _d.label = 6;
                case 6: return [2 /*return*/, _b];
                case 7:
                    e_8 = _d.sent();
                    return [2 /*return*/, (console.error("Error during decodability check:", e_8), !1)];
                case 8: return [2 /*return*/];
            }
        }); });
    };
    return class_23;
}(Qe)), Y = /** @class */ (function (_super) {
    __extends(class_24, _super);
    function class_24(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this._backing = e;
        return _this;
    }
    Object.defineProperty(class_24.prototype, "type", {
        get: function () { return "audio"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_24.prototype, "codec", {
        get: function () { return this._backing.getCodec(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_24.prototype, "numberOfChannels", {
        get: function () { return this._backing.getNumberOfChannels(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_24.prototype, "sampleRate", {
        get: function () { return this._backing.getSampleRate(); },
        enumerable: false,
        configurable: true
    });
    class_24.prototype.getDecoderConfig = function () { return this._backing.getDecoderConfig(); };
    class_24.prototype.getCodecParameterString = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this._backing.getDecoderConfig()];
                case 1: return [2 /*return*/, (_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.codec) !== null && _c !== void 0 ? _c : null];
            }
        }); });
    };
    class_24.prototype.canDecode = function () {
        return __awaiter(this, void 0, void 0, function () { var e_11, t_5, _b, _c, e_10; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, this._backing.getDecoderConfig()];
                case 1:
                    e_11 = _d.sent();
                    if (!e_11)
                        return [2 /*return*/, !1];
                    t_5 = this._backing.getCodec();
                    m(t_5 !== null);
                    if (!(Ct.some(function (s) { return s.supports(t_5, e_11); }) || e_11.codec.startsWith("pcm-"))) return [3 /*break*/, 2];
                    _b = !0;
                    return [3 /*break*/, 6];
                case 2:
                    if (!(typeof AudioDecoder > "u")) return [3 /*break*/, 3];
                    _c = !1;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, AudioDecoder.isConfigSupported(e_11)];
                case 4:
                    _c = (_d.sent()).supported === !0;
                    _d.label = 5;
                case 5:
                    _b = _c;
                    _d.label = 6;
                case 6: return [2 /*return*/, _b];
                case 7:
                    e_10 = _d.sent();
                    return [2 /*return*/, (console.error("Error during decodability check:", e_10), !1)];
                case 8: return [2 /*return*/];
            }
        }); });
    };
    return class_24;
}(Qe));
exports.InputTrack = Qe;
exports.InputVideoTrack = he;
exports.InputAudioTrack = Y;
var ue = /** @class */ (function () {
    function class_25(e, t) {
        if (t === void 0) { t = 1 / 0; }
        this.source = e, this.maxStorableBytes = t, this.loadedSegments = [], this.loadingSegments = [], this.sourceSizePromise = null, this.nextAge = 0, this.totalStoredBytes = 0;
    }
    class_25.prototype.loadRange = function (e, t) {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var _d, _f, _g, s, i, c, l, n, a, o; return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _f = (_d = Math).min;
                    _g = [t];
                    return [4 /*yield*/, this.source.getSize()];
                case 1:
                    if (t = _f.apply(_d, _g.concat([_h.sent()])), e >= t)
                        return [2 /*return*/];
                    s = this.loadingSegments.find(function (c) { return c.start <= e && c.end >= t; });
                    if (!s) return [3 /*break*/, 3];
                    return [4 /*yield*/, s.promise];
                case 2:
                    _h.sent();
                    return [2 /*return*/];
                case 3:
                    i = O(this.loadedSegments, e, function (c) { return c.start; });
                    if (i !== -1)
                        for (c = i; c < this.loadedSegments.length; c++) {
                            l = this.loadedSegments[c];
                            if (l.start > e)
                                break;
                            if (l.end >= t)
                                return [2 /*return*/];
                        }
                    (_c = (_b = this.source).onread) === null || _c === void 0 ? void 0 : _c.call(_b, e, t);
                    n = this.source._read(e, t), a = { start: e, end: t, promise: n };
                    this.loadingSegments.push(a);
                    return [4 /*yield*/, n];
                case 4:
                    o = _h.sent();
                    pi(this.loadingSegments, a), this.insertIntoLoadedSegments(e, o);
                    return [2 /*return*/];
            }
        }); });
    };
    class_25.prototype.rangeIsLoaded = function (e, t) { if (t <= e)
        return !0; var s = O(this.loadedSegments, e, function (i) { return i.start; }); if (s === -1)
        return !1; for (var i = s; i < this.loadedSegments.length; i++) {
        var n = this.loadedSegments[i];
        if (n.start > e)
            break;
        if (n.end >= t)
            return !0;
    } return !1; };
    class_25.prototype.insertIntoLoadedSegments = function (e, t) { var s = { start: e, end: e + t.byteLength, bytes: t, view: new DataView(t.buffer), age: this.nextAge++ }, i = O(this.loadedSegments, e, function (n) { return n.start; }); (i === -1 || this.loadedSegments[i].start < s.start) && i++, this.loadedSegments.splice(i, 0, s), this.totalStoredBytes += t.byteLength; for (var n = i + 1; n < this.loadedSegments.length; n++) {
        var a = this.loadedSegments[n];
        if (a.start >= s.end)
            break;
        s.start <= a.start && a.end <= s.end && (this.loadedSegments.splice(n, 1), n--);
    } for (; this.totalStoredBytes > this.maxStorableBytes && this.loadedSegments.length > 1;) {
        var n = null, a = -1;
        for (var o = 0; o < this.loadedSegments.length; o++) {
            var c = this.loadedSegments[o];
            (!n || c.age < n.age) && (n = c, a = o);
        }
        m(n), this.totalStoredBytes -= n.bytes.byteLength, this.loadedSegments.splice(a, 1);
    } };
    class_25.prototype.getViewAndOffset = function (e, t) { var s = O(this.loadedSegments, e, function (n) { return n.start; }), i = null; if (s !== -1)
        for (var n = s; n < this.loadedSegments.length; n++) {
            var a = this.loadedSegments[n];
            if (a.start > e)
                break;
            if (t <= a.end) {
                i = a;
                break;
            }
        } if (!i)
        throw new Error("No segment loaded for range [".concat(e, ", ").concat(t, ").")); return i.age = this.nextAge++, { view: i.view, offset: i.bytes.byteOffset + e - i.start }; };
    class_25.prototype.forgetRange = function (e, t) { if (t <= e)
        return; var s = O(this.loadedSegments, e, function (n) { return n.start; }); if (s === -1)
        return; var i = this.loadedSegments[s]; i.start !== e || i.end !== t || (this.loadedSegments.splice(s, 1), this.totalStoredBytes -= i.bytes.byteLength); };
    return class_25;
}());
var qe = /** @class */ (function () {
    function qe(e) {
        this.reader = e, this.pos = 0, this.littleEndian = !0;
    }
    qe.prototype.readBytes = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, new Uint8Array(t.buffer, s, e); };
    qe.prototype.readU16 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 2), e = _b.view, t = _b.offset; return this.pos += 2, e.getUint16(t, this.littleEndian); };
    qe.prototype.readU32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getUint32(t, this.littleEndian); };
    qe.prototype.readAscii = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; this.pos += e; var i = ""; for (var n = 0; n < e; n++)
        i += String.fromCharCode(t.getUint8(s + n)); return i; };
    return qe;
}());
var re;
(function (r) { r[r.PCM = 1] = "PCM", r[r.IEEE_FLOAT = 3] = "IEEE_FLOAT", r[r.ALAW = 6] = "ALAW", r[r.MULAW = 7] = "MULAW", r[r.EXTENSIBLE = 65534] = "EXTENSIBLE"; })(re || (re = {}));
var Qr = /** @class */ (function (_super) {
    __extends(class_26, _super);
    function class_26(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.metadataPromise = null, _this.dataStart = -1, _this.dataSize = -1, _this.audioInfo = null, _this.tracks = [], _this.metadataReader = new qe(e._mainReader), _this.chunkReader = new qe(new ue(e.source, 64 * Math.pow(2, 20)));
        return _this;
    }
    class_26.prototype.readMetadata = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, (_b = this.metadataPromise) !== null && _b !== void 0 ? _b : (this.metadataPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, t, s, a, o, c, _b, n; return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, this.metadataReader.reader.source.getSize()];
                            case 1:
                                e = _c.sent(), t = this.metadataReader.readAscii(4);
                                this.metadataReader.littleEndian = t === "RIFF";
                                s = Math.min(this.metadataReader.readU32() + 8, e);
                                if (this.metadataReader.readAscii(4) !== "WAVE")
                                    throw new Error("Invalid WAVE file - wrong format");
                                this.metadataReader.pos = 12;
                                _c.label = 2;
                            case 2:
                                if (!(this.metadataReader.pos < s)) return [3 /*break*/, 8];
                                return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + 8)];
                            case 3:
                                _c.sent();
                                a = this.metadataReader.readAscii(4), o = this.metadataReader.readU32(), c = this.metadataReader.pos;
                                if (!(a === "fmt ")) return [3 /*break*/, 5];
                                return [4 /*yield*/, this.parseFmtChunk(o)];
                            case 4:
                                _b = _c.sent();
                                return [3 /*break*/, 6];
                            case 5:
                                _b = a === "data" && (this.dataStart = this.metadataReader.pos, this.dataSize = Math.min(o, s - this.dataStart));
                                _c.label = 6;
                            case 6:
                                _b, this.metadataReader.pos = c + o + (o & 1);
                                _c.label = 7;
                            case 7: return [3 /*break*/, 2];
                            case 8:
                                if (!this.audioInfo)
                                    throw new Error('Invalid WAVE file - missing "fmt " chunk');
                                if (this.dataStart === -1)
                                    throw new Error('Invalid WAVE file - missing "data" chunk');
                                n = this.audioInfo.blockSizeInBytes;
                                this.dataSize = Math.floor(this.dataSize / n) * n, this.tracks.push(new Y(new Ns(this)));
                                return [2 /*return*/];
                        }
                    }); }); })())];
            });
        });
    };
    class_26.prototype.parseFmtChunk = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t, s, i, n, a, o, c, d; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + e)];
                case 1:
                    _b.sent();
                    t = this.metadataReader.readU16(), s = this.metadataReader.readU16(), i = this.metadataReader.readU32();
                    this.metadataReader.pos += 4;
                    n = this.metadataReader.readU16();
                    if (e === 14 ? a = 8 : a = this.metadataReader.readU16(), e >= 18 && t !== 357) {
                        o = this.metadataReader.readU16(), c = e - 18;
                        if (Math.min(c, o) >= 22 && t === re.EXTENSIBLE) {
                            this.metadataReader.pos += 6;
                            d = this.metadataReader.readBytes(16);
                            t = d[0] | d[1] << 8;
                        }
                    }
                    (t === re.MULAW || t === re.ALAW) && (a = 8), this.audioInfo = { format: t, numberOfChannels: s, sampleRate: i, sampleSizeInBytes: Math.ceil(a / 8), blockSizeInBytes: n };
                    return [2 /*return*/];
            }
        }); });
    };
    class_26.prototype.getCodec = function () { if (m(this.audioInfo), this.audioInfo.format === re.MULAW)
        return "ulaw"; if (this.audioInfo.format === re.ALAW)
        return "alaw"; if (this.audioInfo.format === re.PCM) {
        if (this.audioInfo.sampleSizeInBytes === 1)
            return "pcm-u8";
        if (this.audioInfo.sampleSizeInBytes === 2)
            return "pcm-s16";
        if (this.audioInfo.sampleSizeInBytes === 3)
            return "pcm-s24";
        if (this.audioInfo.sampleSizeInBytes === 4)
            return "pcm-s32";
    } return this.audioInfo.format === re.IEEE_FLOAT && this.audioInfo.sampleSizeInBytes === 4 ? "pcm-f32" : null; };
    class_26.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, "audio/wav"];
        }); });
    };
    class_26.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), m(this.audioInfo), this.dataSize / this.audioInfo.blockSizeInBytes / this.audioInfo.sampleRate)];
            }
        }); });
    };
    class_26.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), this.tracks)];
            }
        }); });
    };
    return class_26;
}(de)), ft = 2048, Ns = /** @class */ (function () {
    function class_27(e) {
        this.demuxer = e;
    }
    class_27.prototype.getId = function () { return 1; };
    class_27.prototype.getCodec = function () { return this.demuxer.getCodec(); };
    class_27.prototype.getDecoderConfig = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            e = this.demuxer.getCodec();
            return [2 /*return*/, e ? (m(this.demuxer.audioInfo), { codec: e, numberOfChannels: this.demuxer.audioInfo.numberOfChannels, sampleRate: this.demuxer.audioInfo.sampleRate }) : null];
        }); });
    };
    class_27.prototype.computeDuration = function () { return this.demuxer.computeDuration(); };
    class_27.prototype.getNumberOfChannels = function () { return m(this.demuxer.audioInfo), this.demuxer.audioInfo.numberOfChannels; };
    class_27.prototype.getSampleRate = function () { return m(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate; };
    class_27.prototype.getTimeResolution = function () { return m(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate; };
    class_27.prototype.getLanguageCode = function () { return J; };
    class_27.prototype.getFirstTimestamp = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, 0];
        }); });
    };
    class_27.prototype.getPacketAtIndex = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, c, l, d, u, a, o; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    m(this.demuxer.audioInfo);
                    s = e * ft * this.demuxer.audioInfo.blockSizeInBytes;
                    if (s >= this.demuxer.dataSize)
                        return [2 /*return*/, null];
                    i = Math.min(ft * this.demuxer.audioInfo.blockSizeInBytes, this.demuxer.dataSize - s);
                    if (!t.metadataOnly) return [3 /*break*/, 1];
                    n = te;
                    return [3 /*break*/, 3];
                case 1:
                    c = ft * this.demuxer.audioInfo.blockSizeInBytes, l = Math.ceil(Math.pow(2, 19) / c) * c, d = Math.floor(s / l) * l, u = d + l;
                    return [4 /*yield*/, this.demuxer.chunkReader.reader.loadRange(this.demuxer.dataStart + d, this.demuxer.dataStart + u)];
                case 2:
                    _b.sent(), this.demuxer.chunkReader.pos = this.demuxer.dataStart + s, n = this.demuxer.chunkReader.readBytes(i);
                    _b.label = 3;
                case 3:
                    a = e * ft / this.demuxer.audioInfo.sampleRate, o = i / this.demuxer.audioInfo.blockSizeInBytes / this.demuxer.audioInfo.sampleRate;
                    return [2 /*return*/, new D(n, "key", a, o, e, i)];
            }
        }); });
    };
    class_27.prototype.getFirstPacket = function (e) { return this.getPacketAtIndex(0, e); };
    class_27.prototype.getPacket = function (e, t) { m(this.demuxer.audioInfo); var s = Math.floor(e * this.demuxer.audioInfo.sampleRate / ft); return this.getPacketAtIndex(s, t); };
    class_27.prototype.getNextPacket = function (e, t) { m(this.demuxer.audioInfo); var s = Math.round(e.timestamp * this.demuxer.audioInfo.sampleRate / ft); return this.getPacketAtIndex(s + 1, t); };
    class_27.prototype.getKeyPacket = function (e, t) { return this.getPacket(e, t); };
    class_27.prototype.getNextKeyPacket = function (e, t) { return this.getNextPacket(e, t); };
    return class_27;
}());
var qr = /** @class */ (function () {
    function qr(e) {
        this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer);
    }
    qr.prototype.writeU32 = function (e) { this.helperView.setUint32(0, e, !0), this.writer.write(this.helper.subarray(0, 4)); };
    qr.prototype.writeU16 = function (e) { this.helperView.setUint16(0, e, !0), this.writer.write(this.helper.subarray(0, 2)); };
    qr.prototype.writeAscii = function (e) { this.writer.write(new TextEncoder().encode(e)); };
    return qr;
}());
var jr = /** @class */ (function (_super) {
    __extends(class_28, _super);
    function class_28(e, t) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.headerWritten = !1, _this.dataSize = 0, _this.format = t, _this.writer = e._writer, _this.riffWriter = new qr(e._writer);
        return _this;
    }
    class_28.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_28.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, "audio/wav"];
        }); });
    };
    class_28.prototype.addEncodedVideoPacket = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            throw new Error("WAVE does not support video.");
        }); });
    };
    class_28.prototype.addEncodedAudioPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    i = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    this.headerWritten || (Oe(s), m(s), m(s.decoderConfig), this.writeHeader(e, s.decoderConfig), this.headerWritten = !0), this.validateAndNormalizeTimestamp(e, t.timestamp, t.type === "key"), this.writer.write(t.data), this.dataSize += t.data.byteLength;
                    return [4 /*yield*/, this.writer.flush()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    i();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        }); });
    };
    class_28.prototype.addSubtitleCue = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            throw new Error("WAVE does not support subtitles.");
        }); });
    };
    class_28.prototype.writeHeader = function (e, t) { this.format._options.onHeader && this.writer.startTrackingWrites(); var s, i = e.source._codec, n = X(i); n.dataType === "ulaw" ? s = re.MULAW : n.dataType === "alaw" ? s = re.ALAW : n.dataType === "float" ? s = re.IEEE_FLOAT : s = re.PCM; var a = t.numberOfChannels, o = t.sampleRate, c = n.sampleSize * a; if (this.riffWriter.writeAscii("RIFF"), this.riffWriter.writeU32(0), this.riffWriter.writeAscii("WAVE"), this.riffWriter.writeAscii("fmt "), this.riffWriter.writeU32(16), this.riffWriter.writeU16(s), this.riffWriter.writeU16(a), this.riffWriter.writeU32(o), this.riffWriter.writeU32(o * c), this.riffWriter.writeU16(c), this.riffWriter.writeU16(8 * n.sampleSize), this.riffWriter.writeAscii("data"), this.riffWriter.writeU32(0), this.format._options.onHeader) {
        var _b = this.writer.stopTrackingWrites(), l = _b.data, d = _b.start;
        this.format._options.onHeader(l, d);
    } };
    class_28.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.mutex.acquire()];
                case 1:
                    e = _b.sent(), t = this.writer.getPos();
                    this.writer.seek(4), this.riffWriter.writeU32(this.dataSize + 36), this.writer.seek(40), this.riffWriter.writeU32(this.dataSize), this.writer.seek(t), e();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_28;
}(ce));
var ke = /** @class */ (function () {
    function ke() {
    }
    ke.prototype.getSupportedVideoCodecs = function () { return this.getSupportedCodecs().filter(function (e) { return j.includes(e); }); };
    ke.prototype.getSupportedAudioCodecs = function () { return this.getSupportedCodecs().filter(function (e) { return G.includes(e); }); };
    ke.prototype.getSupportedSubtitleCodecs = function () { return this.getSupportedCodecs().filter(function (e) { return oe.includes(e); }); };
    ke.prototype._codecUnsupportedHint = function (e) { return ""; };
    return ke;
}()), Dt = /** @class */ (function (_super) {
    __extends(class_29, _super);
    function class_29(e) {
        if (e === void 0) { e = {}; }
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (e.fastStart !== void 0 && ![!1, "in-memory", "fragmented"].includes(e.fastStart))
            throw new TypeError('options.fastStart, when provided, must be false, "in-memory", or "fragmented".');
        if (e.minimumFragmentDuration !== void 0 && (!Number.isFinite(e.minimumFragmentDuration) || e.minimumFragmentDuration < 0))
            throw new TypeError("options.minimumFragmentDuration, when provided, must be a non-negative number.");
        if (e.onFtyp !== void 0 && typeof e.onFtyp != "function")
            throw new TypeError("options.onFtyp, when provided, must be a function.");
        if (e.onMoov !== void 0 && typeof e.onMoov != "function")
            throw new TypeError("options.onMoov, when provided, must be a function.");
        if (e.onMdat !== void 0 && typeof e.onMdat != "function")
            throw new TypeError("options.onMdat, when provided, must be a function.");
        if (e.onMoof !== void 0 && typeof e.onMoof != "function")
            throw new TypeError("options.onMoof, when provided, must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    class_29.prototype.getSupportedTrackCounts = function () { return { video: { min: 0, max: 1 / 0 }, audio: { min: 0, max: 1 / 0 }, subtitle: { min: 0, max: 1 / 0 }, total: { min: 1, max: Math.pow(2, 32) - 1 } }; };
    Object.defineProperty(class_29.prototype, "supportsVideoRotationMetadata", {
        get: function () { return !0; },
        enumerable: false,
        configurable: true
    });
    class_29.prototype._createMuxer = function (e) { return new Rr(e, this); };
    return class_29;
}(ke)), Kr = /** @class */ (function (_super) {
    __extends(Kr, _super);
    function Kr() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Kr.prototype, "_name", {
        get: function () { return "MP4"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kr.prototype, "fileExtension", {
        get: function () { return ".mp4"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Kr.prototype, "mimeType", {
        get: function () { return "video/mp4"; },
        enumerable: false,
        configurable: true
    });
    Kr.prototype.getSupportedCodecs = function () { return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], j, true), _e, true), ["pcm-s16", "pcm-s16be", "pcm-s24", "pcm-s24be", "pcm-s32", "pcm-s32be", "pcm-f32", "pcm-f32be", "pcm-f64", "pcm-f64be"], false), oe, true); };
    Kr.prototype._codecUnsupportedHint = function (e) { return new it().getSupportedCodecs().includes(e) ? " Switching to MOV will grant support for this codec." : ""; };
    return Kr;
}(Dt)), it = /** @class */ (function (_super) {
    __extends(it, _super);
    function it() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(it.prototype, "_name", {
        get: function () { return "MOV"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(it.prototype, "fileExtension", {
        get: function () { return ".mov"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(it.prototype, "mimeType", {
        get: function () { return "video/quicktime"; },
        enumerable: false,
        configurable: true
    });
    it.prototype.getSupportedCodecs = function () { return __spreadArray(__spreadArray([], j, true), G, true); };
    it.prototype._codecUnsupportedHint = function (e) { return new Kr().getSupportedCodecs().includes(e) ? " Switching to MP4 will grant support for this codec." : ""; };
    return it;
}(Dt)), Vt = /** @class */ (function (_super) {
    __extends(Vt, _super);
    function Vt(e) {
        if (e === void 0) { e = {}; }
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (e.appendOnly !== void 0 && typeof e.appendOnly != "boolean")
            throw new TypeError("options.appendOnly, when provided, must be a boolean.");
        if (e.minimumClusterDuration !== void 0 && (!Number.isFinite(e.minimumClusterDuration) || e.minimumClusterDuration < 0))
            throw new TypeError("options.minimumClusterDuration, when provided, must be a non-negative number.");
        if (e.onEbmlHeader !== void 0 && typeof e.onEbmlHeader != "function")
            throw new TypeError("options.onEbmlHeader, when provided, must be a function.");
        if (e.onSegmentHeader !== void 0 && typeof e.onSegmentHeader != "function")
            throw new TypeError("options.onHeader, when provided, must be a function.");
        if (e.onCluster !== void 0 && typeof e.onCluster != "function")
            throw new TypeError("options.onCluster, when provided, must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    Vt.prototype._createMuxer = function (e) { return new Or(e, this); };
    Object.defineProperty(Vt.prototype, "_name", {
        get: function () { return "Matroska"; },
        enumerable: false,
        configurable: true
    });
    Vt.prototype.getSupportedTrackCounts = function () { return { video: { min: 0, max: 1 / 0 }, audio: { min: 0, max: 1 / 0 }, subtitle: { min: 0, max: 1 / 0 }, total: { min: 1, max: 127 } }; };
    Object.defineProperty(Vt.prototype, "fileExtension", {
        get: function () { return ".mkv"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Vt.prototype, "mimeType", {
        get: function () { return "video/x-matroska"; },
        enumerable: false,
        configurable: true
    });
    Vt.prototype.getSupportedCodecs = function () { return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], j, true), _e, true), V.filter(function (e) { return !["pcm-s8", "pcm-f32be", "pcm-f64be", "ulaw", "alaw"].includes(e); }), true), oe, true); };
    Object.defineProperty(Vt.prototype, "supportsVideoRotationMetadata", {
        get: function () { return !1; },
        enumerable: false,
        configurable: true
    });
    return Vt;
}(ke)), ot = /** @class */ (function (_super) {
    __extends(ot, _super);
    function ot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ot.prototype.getSupportedCodecs = function () { return __spreadArray(__spreadArray(__spreadArray([], j.filter(function (e) { return ["vp8", "vp9", "av1"].includes(e); }), true), G.filter(function (e) { return ["opus", "vorbis"].includes(e); }), true), oe, true); };
    Object.defineProperty(ot.prototype, "_name", {
        get: function () { return "WebM"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ot.prototype, "fileExtension", {
        get: function () { return ".webm"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ot.prototype, "mimeType", {
        get: function () { return "video/webm"; },
        enumerable: false,
        configurable: true
    });
    ot.prototype._codecUnsupportedHint = function (e) { return new Vt().getSupportedCodecs().includes(e) ? " Switching to MKV will grant support for this codec." : ""; };
    return ot;
}(Vt)), Ws = /** @class */ (function (_super) {
    __extends(Ws, _super);
    function Ws(e) {
        if (e === void 0) { e = {}; }
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (e.onXingFrame !== void 0 && typeof e.onXingFrame != "function")
            throw new TypeError("options.onXingFrame, when provided, must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    Ws.prototype._createMuxer = function (e) { return new Dr(e, this); };
    Object.defineProperty(Ws.prototype, "_name", {
        get: function () { return "MP3"; },
        enumerable: false,
        configurable: true
    });
    Ws.prototype.getSupportedTrackCounts = function () { return { video: { min: 0, max: 0 }, audio: { min: 1, max: 1 }, subtitle: { min: 0, max: 0 }, total: { min: 1, max: 1 } }; };
    Object.defineProperty(Ws.prototype, "fileExtension", {
        get: function () { return ".mp3"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ws.prototype, "mimeType", {
        get: function () { return "audio/mpeg"; },
        enumerable: false,
        configurable: true
    });
    Ws.prototype.getSupportedCodecs = function () { return ["mp3"]; };
    Object.defineProperty(Ws.prototype, "supportsVideoRotationMetadata", {
        get: function () { return !1; },
        enumerable: false,
        configurable: true
    });
    return Ws;
}(ke)), Ls = /** @class */ (function (_super) {
    __extends(Ls, _super);
    function Ls(e) {
        if (e === void 0) { e = {}; }
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (e.onHeader !== void 0 && typeof e.onHeader != "function")
            throw new TypeError("options.onHeader, when provided, must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    Ls.prototype._createMuxer = function (e) { return new jr(e, this); };
    Object.defineProperty(Ls.prototype, "_name", {
        get: function () { return "WAVE"; },
        enumerable: false,
        configurable: true
    });
    Ls.prototype.getSupportedTrackCounts = function () { return { video: { min: 0, max: 0 }, audio: { min: 1, max: 1 }, subtitle: { min: 0, max: 0 }, total: { min: 1, max: 1 } }; };
    Object.defineProperty(Ls.prototype, "fileExtension", {
        get: function () { return ".wav"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ls.prototype, "mimeType", {
        get: function () { return "audio/wav"; },
        enumerable: false,
        configurable: true
    });
    Ls.prototype.getSupportedCodecs = function () { return __spreadArray([], V.filter(function (e) { return ["pcm-s16", "pcm-s24", "pcm-s32", "pcm-f32", "pcm-u8", "ulaw", "alaw"].includes(e); }), true); };
    Object.defineProperty(Ls.prototype, "supportsVideoRotationMetadata", {
        get: function () { return !1; },
        enumerable: false,
        configurable: true
    });
    return Ls;
}(ke)), Hs = /** @class */ (function (_super) {
    __extends(class_30, _super);
    function class_30(e) {
        if (e === void 0) { e = {}; }
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (e.onPage !== void 0 && typeof e.onPage != "function")
            throw new TypeError("options.onPage, when provided, must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    class_30.prototype._createMuxer = function (e) { return new Hr(e, this); };
    Object.defineProperty(class_30.prototype, "_name", {
        get: function () { return "Ogg"; },
        enumerable: false,
        configurable: true
    });
    class_30.prototype.getSupportedTrackCounts = function () { return { video: { min: 0, max: 0 }, audio: { min: 0, max: 1 / 0 }, subtitle: { min: 0, max: 0 }, total: { min: 1, max: Math.pow(2, 32) } }; };
    Object.defineProperty(class_30.prototype, "fileExtension", {
        get: function () { return ".ogg"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_30.prototype, "mimeType", {
        get: function () { return "application/ogg"; },
        enumerable: false,
        configurable: true
    });
    class_30.prototype.getSupportedCodecs = function () { return __spreadArray([], G.filter(function (e) { return ["vorbis", "opus"].includes(e); }), true); };
    Object.defineProperty(class_30.prototype, "supportsVideoRotationMetadata", {
        get: function () { return !1; },
        enumerable: false,
        configurable: true
    });
    return class_30;
}(ke));
exports.OutputFormat = ke;
exports.IsobmffOutputFormat = Dt;
exports.Mp4OutputFormat = Kr;
exports.MovOutputFormat = it;
exports.MkvOutputFormat = Vt;
exports.WebMOutputFormat = ot;
exports.Mp3OutputFormat = Ws;
exports.WavOutputFormat = Ls;
exports.OggOutputFormat = Hs;
var pt = /** @class */ (function () {
    function class_31() {
        this._connectedTrack = null, this._closingPromise = null, this._closed = !1, this._timestampOffset = 0;
    }
    class_31.prototype._ensureValidAdd = function () { if (!this._connectedTrack)
        throw new Error("Source is not connected to an output track."); if (this._connectedTrack.output.state === "canceled")
        throw new Error("Output has been canceled."); if (this._connectedTrack.output.state === "finalizing" || this._connectedTrack.output.state === "finalized")
        throw new Error("Output has been finalized."); if (this._connectedTrack.output.state === "pending")
        throw new Error("Output has not started."); if (this._closed)
        throw new Error("Source is closed."); };
    class_31.prototype._start = function () { };
    class_31.prototype._flushAndClose = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    class_31.prototype.close = function () {
        var _this = this;
        if (this._closingPromise)
            return;
        var e = this._connectedTrack;
        if (!e)
            throw new Error("Cannot call close without connecting the source to an output track.");
        if (e.output.state === "pending")
            throw new Error("Cannot call close before output has been started.");
        this._closingPromise = (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._flushAndClose()];
                case 1:
                    _b.sent(), this._closed = !0, !(e.output.state === "finalizing" || e.output.state === "finalized") && e.output._muxer.onTrackClose(e);
                    return [2 /*return*/];
            }
        }); }); })();
    };
    class_31.prototype._flushOrWaitForClose = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._closingPromise ? this._closingPromise : this._flushAndClose()];
        }); });
    };
    return class_31;
}()), Ie = /** @class */ (function (_super) {
    __extends(Ie, _super);
    function Ie(e) {
        var _this = this;
        if (_this = _super.call(this) || this, _this._connectedTrack = null, !j.includes(e))
            throw new TypeError("Invalid video codec '".concat(e, "'. Must be one of: ").concat(j.join(", "), "."));
        _this._codec = e;
        return _this;
    }
    return Ie;
}(pt)), Nt = /** @class */ (function (_super) {
    __extends(Nt, _super);
    function Nt(e) {
        return _super.call(this, e) || this;
    }
    Nt.prototype.add = function (e, t) { if (!(e instanceof D))
        throw new TypeError("packet must be an EncodedPacket."); if (e.isMetadataOnly)
        throw new TypeError("Metadata-only packets cannot be added."); if (t !== void 0 && (!t || typeof t != "object"))
        throw new TypeError("meta, when provided, must be an object."); return this._ensureValidAdd(), this._connectedTrack.output._muxer.addEncodedVideoPacket(this._connectedTrack, e, t); };
    return Nt;
}(Ie)), Gs = function (r) { if (!r || typeof r != "object")
    throw new TypeError("Encoding config must be an object."); if (!j.includes(r.codec))
    throw new TypeError("Invalid video codec '".concat(r.codec, "'. Must be one of: ").concat(j.join(", "), ".")); if (!(r.bitrate instanceof H) && (!Number.isInteger(r.bitrate) || r.bitrate <= 0))
    throw new TypeError("config.bitrate must be a positive integer or a quality."); if (r.latencyMode !== void 0 && !["quality", "realtime"].includes(r.latencyMode))
    throw new TypeError("config.latencyMode, when provided, must be 'quality' or 'realtime'."); if (r.keyFrameInterval !== void 0 && (!Number.isFinite(r.keyFrameInterval) || r.keyFrameInterval < 0))
    throw new TypeError("config.keyFrameInterval, when provided, must be a non-negative number."); if (r.fullCodecString !== void 0 && typeof r.fullCodecString != "string")
    throw new TypeError("config.fullCodecString, when provided, must be a string."); if (r.fullCodecString !== void 0 && ws(r.fullCodecString) !== r.codec)
    throw new TypeError("config.fullCodecString, when provided, must be a string that matches the specified codec (".concat(r.codec, ").")); if (r.onEncodedPacket !== void 0 && typeof r.onEncodedPacket != "function")
    throw new TypeError("config.onEncodedChunk, when provided, must be a function."); if (r.onEncoderConfig !== void 0 && typeof r.onEncoderConfig != "function")
    throw new TypeError("config.onEncoderConfig, when provided, must be a function."); }, Wt = /** @class */ (function () {
    function class_32(e, t) {
        this.source = e, this.encodingConfig = t, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastMultipleOfKeyFrameInterval = -1, this.lastWidth = null, this.lastHeight = null, this.customEncoder = null, this.customEncoderCallSerializer = new Ae, this.customEncoderQueueSize = 0, this.encoderError = null;
    }
    class_32.prototype.add = function (e, t, s) {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, _d, i, n, a, o, _f, o, _g;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (this.checkForEncoderError(), this.source._ensureValidAdd(), this.lastWidth !== null && this.lastHeight !== null) {
                            if (e.codedWidth !== this.lastWidth || e.codedHeight !== this.lastHeight)
                                throw new Error("Video sample size must remain constant. Expected ".concat(this.lastWidth, "x").concat(this.lastHeight, ", got ").concat(e.codedWidth, "x").concat(e.codedHeight, "."));
                        }
                        else
                            this.lastWidth = e.codedWidth, this.lastHeight = e.codedHeight;
                        _c = this.encoderInitialized;
                        if (_c) return [3 /*break*/, 3];
                        this.ensureEncoderPromise || this.ensureEncoder(e);
                        _d = this.encoderInitialized;
                        if (_d) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ensureEncoderPromise];
                    case 1:
                        _d = (_h.sent());
                        _h.label = 2;
                    case 2:
                        _c = (_d);
                        _h.label = 3;
                    case 3:
                        _c, m(this.encoderInitialized);
                        i = (_b = this.encodingConfig.keyFrameInterval) !== null && _b !== void 0 ? _b : 5, n = Math.floor(e.timestamp / i), a = __assign(__assign({}, s), { keyFrame: (s === null || s === void 0 ? void 0 : s.keyFrame) || i === 0 || n !== this.lastMultipleOfKeyFrameInterval });
                        if (!(this.lastMultipleOfKeyFrameInterval = n, this.customEncoder)) return [3 /*break*/, 6];
                        this.customEncoderQueueSize++;
                        o = this.customEncoderCallSerializer.call(function () { return _this.customEncoder.encode(e, a); }).then(function () { _this.customEncoderQueueSize--, t && e.close(); }).catch(function (c) { var _b; (_b = _this.encoderError) !== null && _b !== void 0 ? _b : (_this.encoderError = c); });
                        _f = this.customEncoderQueueSize >= 4;
                        if (!_f) return [3 /*break*/, 5];
                        return [4 /*yield*/, o];
                    case 4:
                        _f = (_h.sent());
                        _h.label = 5;
                    case 5:
                        _f;
                        return [3 /*break*/, 9];
                    case 6:
                        m(this.encoder);
                        o = e.toVideoFrame();
                        this.encoder.encode(o, a), o.close(), t && e.close();
                        _g = this.encoder.encodeQueueSize >= 4;
                        if (!_g) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (c) { return _this.encoder.addEventListener("dequeue", c, { once: !0 }); })];
                    case 7:
                        _g = (_h.sent());
                        _h.label = 8;
                    case 8:
                        _g;
                        _h.label = 9;
                    case 9: return [4 /*yield*/, this.muxer.mutex.currentPromise];
                    case 10:
                        _h.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_32.prototype.ensureEncoder = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                if (!this.encoder)
                    return [2 /*return*/, this.ensureEncoderPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var t, s, i, n, a;
                            var _this = this;
                            var _b, _c, _d, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        t = e.codedWidth, s = e.codedHeight, i = this.encodingConfig.bitrate instanceof H ? this.encodingConfig.bitrate._toVideoBitrate(this.encodingConfig.codec, t, s) : this.encodingConfig.bitrate, n = __assign({ codec: (_b = this.encodingConfig.fullCodecString) !== null && _b !== void 0 ? _b : ir(this.encodingConfig.codec, t, s, i), width: t, height: s, bitrate: i, framerate: (_c = this.source._connectedTrack) === null || _c === void 0 ? void 0 : _c.metadata.frameRate, latencyMode: this.encodingConfig.latencyMode }, ar(this.encodingConfig.codec));
                                        (_f = (_d = this.encodingConfig).onEncoderConfig) === null || _f === void 0 ? void 0 : _f.call(_d, n);
                                        a = Ze.find(function (o) { return o.supports(_this.encodingConfig.codec, n); });
                                        if (!a) return [3 /*break*/, 2];
                                        this.customEncoder = new a, this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = n, this.customEncoder.onPacket = function (o, c) { var _b, _c; if (!(o instanceof D))
                                            throw new TypeError("The first argument passed to onPacket must be an EncodedPacket."); if (c !== void 0 && (!c || typeof c != "object"))
                                            throw new TypeError("The second argument passed to onPacket must be an object or undefined."); (_c = (_b = _this.encodingConfig).onEncodedPacket) === null || _c === void 0 ? void 0 : _c.call(_b, o, c), _this.muxer.addEncodedVideoPacket(_this.source._connectedTrack, o, c); };
                                        return [4 /*yield*/, this.customEncoder.init()];
                                    case 1:
                                        _g.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        if (typeof VideoEncoder > "u")
                                            throw new Error("VideoEncoder is not supported by this browser.");
                                        return [4 /*yield*/, VideoEncoder.isConfigSupported(n)];
                                    case 3:
                                        if (!(_g.sent()).supported)
                                            throw new Error("This specific encoder configuration (".concat(n.codec, ", ").concat(n.bitrate, " bps, ").concat(n.width, "x").concat(n.height, ") is not supported by this browser. Consider using another codec or changing your video parameters."));
                                        this.encoder = new VideoEncoder({ output: function (c, l) { var _b, _c; var d = D.fromEncodedChunk(c); (_c = (_b = _this.encodingConfig).onEncodedPacket) === null || _c === void 0 ? void 0 : _c.call(_b, d, l), _this.muxer.addEncodedVideoPacket(_this.source._connectedTrack, d, l); }, error: function (c) { var _b; (_b = _this.encoderError) !== null && _b !== void 0 ? _b : (_this.encoderError = c); } }), this.encoder.configure(n);
                                        _g.label = 4;
                                    case 4:
                                        m(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
                                        return [2 /*return*/];
                                }
                            });
                        }); })()];
                return [2 /*return*/];
            });
        });
    };
    class_32.prototype.flushAndClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.checkForEncoderError();
                        if (!this.customEncoder) return [3 /*break*/, 2];
                        this.customEncoderCallSerializer.call(function () { return _this.customEncoder.flush(); });
                        return [4 /*yield*/, this.customEncoderCallSerializer.call(function () { return _this.customEncoder.close(); })];
                    case 1:
                        _b = (_d.sent());
                        return [3 /*break*/, 5];
                    case 2:
                        _c = this.encoder;
                        if (!_c) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.encoder.flush()];
                    case 3:
                        _c = (_d.sent(), this.encoder.close());
                        _d.label = 4;
                    case 4:
                        _b = _c;
                        _d.label = 5;
                    case 5:
                        _b, this.checkForEncoderError();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_32.prototype.getQueueSize = function () { var _b, _c; return this.customEncoder ? this.customEncoderQueueSize : (_c = (_b = this.encoder) === null || _b === void 0 ? void 0 : _b.encodeQueueSize) !== null && _c !== void 0 ? _c : 0; };
    class_32.prototype.checkForEncoderError = function () { if (this.encoderError)
        throw this.encoderError.stack = new Error().stack, this.encoderError; };
    return class_32;
}()), gt = /** @class */ (function (_super) {
    __extends(gt, _super);
    function gt(e) {
        var _this = this;
        Gs(e), _this = _super.call(this, e.codec) || this, _this._encoder = new Wt(_this, e);
        return _this;
    }
    gt.prototype.add = function (e, t) { if (!(e instanceof le))
        throw new TypeError("videoSample must be a VideoSample."); return this._encoder.add(e, !1, t); };
    gt.prototype._flushAndClose = function () { return this._encoder.flushAndClose(); };
    return gt;
}(Ie)), $s = /** @class */ (function (_super) {
    __extends($s, _super);
    function $s(e, t) {
        var _this = this;
        if (!(typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement) && !(typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas))
            throw new TypeError("canvas must be an HTMLCanvasElement or OffscreenCanvas.");
        Gs(t), _this = _super.call(this, t.codec) || this, _this._encoder = new Wt(_this, t), _this._canvas = e;
        return _this;
    }
    $s.prototype.add = function (e, t, s) {
        if (t === void 0) { t = 0; }
        if (!Number.isFinite(e) || e < 0)
            throw new TypeError("timestamp must be a non-negative number.");
        if (!Number.isFinite(t) || t < 0)
            throw new TypeError("duration must be a non-negative number.");
        var i = new le(this._canvas, { timestamp: e, duration: t });
        return this._encoder.add(i, !0, s);
    };
    $s.prototype._flushAndClose = function () { return this._encoder.flushAndClose(); };
    return $s;
}(Ie)), Qs = /** @class */ (function (_super) {
    __extends(class_33, _super);
    function class_33(e, t) {
        var _this = this;
        if (!(e instanceof MediaStreamTrack) || e.kind !== "video")
            throw new TypeError("track must be a video MediaStreamTrack.");
        Gs(t), t = __assign(__assign({}, t), { latencyMode: "realtime" }), _this = _super.call(this, t.codec) || this, _this._abortController = null, _this._encoder = new Wt(_this, t), _this._track = e;
        return _this;
    }
    class_33.prototype._start = function () {
        var _this = this;
        this._abortController = new AbortController;
        var e = !1, t = new MediaStreamTrackProcessor({ track: this._track }), s = new WritableStream({ write: function (i) { if (e || (hn(_this, i), e = !0), _this._encoder.getQueueSize() >= 4) {
                i.close();
                return;
            } _this._encoder.add(new le(i), !0).catch(function (n) { var _b; throw (_b = _this._abortController) === null || _b === void 0 ? void 0 : _b.abort(), n; }); } });
        t.readable.pipeTo(s, { signal: this._abortController.signal }).catch(function (i) { i instanceof DOMException && i.name === "AbortError" || console.error("Pipe error:", i); });
    };
    class_33.prototype._flushAndClose = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    this._abortController && (this._abortController.abort(), this._abortController = null);
                    return [4 /*yield*/, this._encoder.flushAndClose()];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_33;
}(Ie)), ve = /** @class */ (function (_super) {
    __extends(ve, _super);
    function ve(e) {
        var _this = this;
        if (_this = _super.call(this) || this, _this._connectedTrack = null, !G.includes(e))
            throw new TypeError("Invalid audio codec '".concat(e, "'. Must be one of: ").concat(G.join(", "), "."));
        _this._codec = e;
        return _this;
    }
    return ve;
}(pt)), Lt = /** @class */ (function (_super) {
    __extends(Lt, _super);
    function Lt(e) {
        return _super.call(this, e) || this;
    }
    Lt.prototype.add = function (e, t) { if (!(e instanceof D))
        throw new TypeError("packet must be an EncodedPacket."); if (e.isMetadataOnly)
        throw new TypeError("Metadata-only packets cannot be added."); if (t !== void 0 && (!t || typeof t != "object"))
        throw new TypeError("meta, when provided, must be an object."); return this._ensureValidAdd(), this._connectedTrack.output._muxer.addEncodedAudioPacket(this._connectedTrack, e, t); };
    return Lt;
}(ve)), Xs = function (r) { if (!r || typeof r != "object")
    throw new TypeError("Encoding config must be an object."); if (!G.includes(r.codec))
    throw new TypeError("Invalid audio codec '".concat(r.codec, "'. Must be one of: ").concat(G.join(", "), ".")); if (r.bitrate === void 0 && (!V.includes(r.codec) || r.codec === "flac"))
    throw new TypeError("config.bitrate must be provided for compressed audio codecs."); if (r.bitrate !== void 0 && !(r.bitrate instanceof H) && (!Number.isInteger(r.bitrate) || r.bitrate <= 0))
    throw new TypeError("config.bitrate, when provided, must be a positive integer or a quality."); if (r.fullCodecString !== void 0 && typeof r.fullCodecString != "string")
    throw new TypeError("config.fullCodecString, when provided, must be a string."); if (r.fullCodecString !== void 0 && ws(r.fullCodecString) !== r.codec)
    throw new TypeError("config.fullCodecString, when provided, must be a string that matches the specified codec (".concat(r.codec, ").")); if (r.onEncodedPacket !== void 0 && typeof r.onEncodedPacket != "function")
    throw new TypeError("config.onEncodedChunk, when provided, must be a function."); if (r.onEncoderConfig !== void 0 && typeof r.onEncoderConfig != "function")
    throw new TypeError("config.onEncoderConfig, when provided, must be a function."); }, Ht = /** @class */ (function () {
    function class_34(e, t) {
        this.source = e, this.encodingConfig = t, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastNumberOfChannels = null, this.lastSampleRate = null, this.isPcmEncoder = !1, this.outputSampleSize = null, this.writeOutputValue = null, this.customEncoder = null, this.customEncoderCallSerializer = new Ae, this.customEncoderQueueSize = 0, this.encoderError = null;
    }
    class_34.prototype.add = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, s, _d, s, _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (this.checkForEncoderError(), this.source._ensureValidAdd(), this.lastNumberOfChannels !== null && this.lastSampleRate !== null) {
                            if (e.numberOfChannels !== this.lastNumberOfChannels || e.sampleRate !== this.lastSampleRate)
                                throw new Error("Audio parameters must remain constant. Expected ".concat(this.lastNumberOfChannels, " channels at ").concat(this.lastSampleRate, " Hz, got ").concat(e.numberOfChannels, " channels at ").concat(e.sampleRate, " Hz."));
                        }
                        else
                            this.lastNumberOfChannels = e.numberOfChannels, this.lastSampleRate = e.sampleRate;
                        _b = this.encoderInitialized;
                        if (_b) return [3 /*break*/, 3];
                        this.ensureEncoderPromise || this.ensureEncoder(e);
                        _c = this.encoderInitialized;
                        if (_c) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ensureEncoderPromise];
                    case 1:
                        _c = (_g.sent());
                        _g.label = 2;
                    case 2:
                        _b = (_c);
                        _g.label = 3;
                    case 3:
                        if (!(_b, m(this.encoderInitialized), this.customEncoder)) return [3 /*break*/, 7];
                        this.customEncoderQueueSize++;
                        s = this.customEncoderCallSerializer.call(function () { return _this.customEncoder.encode(e); }).then(function () { _this.customEncoderQueueSize--, t && e.close(); }).catch(function (i) { var _b; (_b = _this.encoderError) !== null && _b !== void 0 ? _b : (_this.encoderError = i); });
                        _d = this.customEncoderQueueSize >= 4;
                        if (!_d) return [3 /*break*/, 5];
                        return [4 /*yield*/, s];
                    case 4:
                        _d = (_g.sent());
                        _g.label = 5;
                    case 5:
                        _d;
                        return [4 /*yield*/, this.muxer.mutex.currentPromise];
                    case 6:
                        _g.sent();
                        return [3 /*break*/, 13];
                    case 7:
                        if (!this.isPcmEncoder) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.doPcmEncoding(e, t)];
                    case 8:
                        _g.sent();
                        return [3 /*break*/, 13];
                    case 9:
                        m(this.encoder);
                        s = e.toAudioData();
                        this.encoder.encode(s), s.close(), t && e.close();
                        _f = this.encoder.encodeQueueSize >= 4;
                        if (!_f) return [3 /*break*/, 11];
                        return [4 /*yield*/, new Promise(function (i) { return _this.encoder.addEventListener("dequeue", i, { once: !0 }); })];
                    case 10:
                        _f = (_g.sent());
                        _g.label = 11;
                    case 11:
                        _f;
                        return [4 /*yield*/, this.muxer.mutex.currentPromise];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    class_34.prototype.doPcmEncoding = function (e, t) {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a, o, c, f, h, p, w, g, l, d, f, h, _d, p, w, g, u, f, _f, h, p, w, g, T; return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    m(this.outputSampleSize), m(this.writeOutputValue);
                    s = e.numberOfChannels, i = e.numberOfFrames, n = e.sampleRate, a = e.timestamp, o = 2048, c = [];
                    for (f = 0; f < i; f += o) {
                        h = Math.min(o, e.numberOfFrames - f), p = h * s * this.outputSampleSize, w = new ArrayBuffer(p), g = new DataView(w);
                        c.push({ frameCount: h, view: g });
                    }
                    l = e.allocationSize({ planeIndex: 0, format: "f32-planar" }), d = new Float32Array(l / Float32Array.BYTES_PER_ELEMENT);
                    for (f = 0; f < s; f++) {
                        e.copyTo(d, { planeIndex: f, format: "f32-planar" });
                        for (h = 0; h < c.length; h++) {
                            _d = c[h], p = _d.frameCount, w = _d.view;
                            for (g = 0; g < p; g++)
                                this.writeOutputValue(w, (g * s + f) * this.outputSampleSize, d[h * o + g]);
                        }
                    }
                    t && e.close();
                    u = { decoderConfig: { codec: this.encodingConfig.codec, numberOfChannels: s, sampleRate: n } };
                    f = 0;
                    _g.label = 1;
                case 1:
                    if (!(f < c.length)) return [3 /*break*/, 4];
                    _f = c[f], h = _f.frameCount, p = _f.view, w = p.buffer, g = f * o, T = new D(new Uint8Array(w), "key", a + g / n, h / n);
                    (_c = (_b = this.encodingConfig).onEncodedPacket) === null || _c === void 0 ? void 0 : _c.call(_b, T, u);
                    return [4 /*yield*/, this.muxer.addEncodedAudioPacket(this.source._connectedTrack, T, u)];
                case 2:
                    _g.sent();
                    _g.label = 3;
                case 3:
                    f++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        }); });
    };
    class_34.prototype.ensureEncoder = function (e) {
        var _this = this;
        if (!this.encoderInitialized)
            return this.ensureEncoderPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                var t, s, i, n, a;
                var _this = this;
                var _b, _c, _d;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            t = e.numberOfChannels, s = e.sampleRate, i = this.encodingConfig.bitrate instanceof H ? this.encodingConfig.bitrate._toAudioBitrate(this.encodingConfig.codec) : this.encodingConfig.bitrate, n = __assign({ codec: (_b = this.encodingConfig.fullCodecString) !== null && _b !== void 0 ? _b : nr(this.encodingConfig.codec, t, s), numberOfChannels: t, sampleRate: s, bitrate: i }, or(this.encodingConfig.codec));
                            (_d = (_c = this.encodingConfig).onEncoderConfig) === null || _d === void 0 ? void 0 : _d.call(_c, n);
                            a = Je.find(function (o) { return o.supports(_this.encodingConfig.codec, n); });
                            if (!a) return [3 /*break*/, 2];
                            this.customEncoder = new a, this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = n, this.customEncoder.onPacket = function (o, c) { var _b, _c; if (!(o instanceof D))
                                throw new TypeError("The first argument passed to onPacket must be an EncodedPacket."); if (c !== void 0 && (!c || typeof c != "object"))
                                throw new TypeError("The second argument passed to onPacket must be an object or undefined."); (_c = (_b = _this.encodingConfig).onEncodedPacket) === null || _c === void 0 ? void 0 : _c.call(_b, o, c), _this.muxer.addEncodedAudioPacket(_this.source._connectedTrack, o, c); };
                            return [4 /*yield*/, this.customEncoder.init()];
                        case 1:
                            _f.sent();
                            return [3 /*break*/, 5];
                        case 2:
                            if (!V.includes(this.encodingConfig.codec)) return [3 /*break*/, 3];
                            this.initPcmEncoder();
                            return [3 /*break*/, 5];
                        case 3:
                            if (typeof AudioEncoder > "u")
                                throw new Error("AudioEncoder is not supported by this browser.");
                            return [4 /*yield*/, AudioEncoder.isConfigSupported(n)];
                        case 4:
                            if (!(_f.sent()).supported)
                                throw new Error("This specific encoder configuration (".concat(n.codec, ", ").concat(n.bitrate, " bps, ").concat(n.numberOfChannels, " channels, ").concat(n.sampleRate, " Hz) is not supported by this browser. Consider using another codec or changing your audio parameters."));
                            this.encoder = new AudioEncoder({ output: function (c, l) { var _b, _c; var d = D.fromEncodedChunk(c); (_c = (_b = _this.encodingConfig).onEncodedPacket) === null || _c === void 0 ? void 0 : _c.call(_b, d, l), _this.muxer.addEncodedAudioPacket(_this.source._connectedTrack, d, l); }, error: function (c) { var _b; (_b = _this.encoderError) !== null && _b !== void 0 ? _b : (_this.encoderError = c); } }), this.encoder.configure(n);
                            _f.label = 5;
                        case 5:
                            m(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
                            return [2 /*return*/];
                    }
                });
            }); })();
    };
    class_34.prototype.initPcmEncoder = function () { this.isPcmEncoder = !0; var e = this.encodingConfig.codec, _b = X(e), t = _b.dataType, s = _b.sampleSize, i = _b.littleEndian; switch ((this.outputSampleSize = s, s)) {
        case 1:
            t === "unsigned" ? this.writeOutputValue = function (n, a, o) { return n.setUint8(a, q((o + 1) * 127.5, 0, 255)); } : t === "signed" ? this.writeOutputValue = function (n, a, o) { n.setInt8(a, q(Math.round(o * 128), -128, 127)); } : t === "ulaw" ? this.writeOutputValue = function (n, a, o) { var c = q(Math.floor(o * 32767), -32768, 32767); n.setUint8(a, cn(c)); } : t === "alaw" ? this.writeOutputValue = function (n, a, o) { var c = q(Math.floor(o * 32767), -32768, 32767); n.setUint8(a, ln(c)); } : m(!1);
            break;
        case 2:
            t === "unsigned" ? this.writeOutputValue = function (n, a, o) { return n.setUint16(a, q((o + 1) * 32767.5, 0, 65535), i); } : t === "signed" ? this.writeOutputValue = function (n, a, o) { return n.setInt16(a, q(Math.round(o * 32767), -32768, 32767), i); } : m(!1);
            break;
        case 3:
            t === "unsigned" ? this.writeOutputValue = function (n, a, o) { return fs(n, a, q((o + 1) * 83886075e-1, 0, 16777215), i); } : t === "signed" ? this.writeOutputValue = function (n, a, o) { return Ti(n, a, q(Math.round(o * 8388607), -8388608, 8388607), i); } : m(!1);
            break;
        case 4:
            t === "unsigned" ? this.writeOutputValue = function (n, a, o) { return n.setUint32(a, q((o + 1) * 21474836475e-1, 0, 4294967295), i); } : t === "signed" ? this.writeOutputValue = function (n, a, o) { return n.setInt32(a, q(Math.round(o * 2147483647), -2147483648, 2147483647), i); } : t === "float" ? this.writeOutputValue = function (n, a, o) { return n.setFloat32(a, o, i); } : m(!1);
            break;
        case 8:
            t === "float" ? this.writeOutputValue = function (n, a, o) { return n.setFloat64(a, o, i); } : m(!1);
            break;
        default: bt(s), m(!1);
    } };
    class_34.prototype.flushAndClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.checkForEncoderError();
                        if (!this.customEncoder) return [3 /*break*/, 2];
                        this.customEncoderCallSerializer.call(function () { return _this.customEncoder.flush(); });
                        return [4 /*yield*/, this.customEncoderCallSerializer.call(function () { return _this.customEncoder.close(); })];
                    case 1:
                        _b = (_d.sent());
                        return [3 /*break*/, 5];
                    case 2:
                        _c = this.encoder;
                        if (!_c) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.encoder.flush()];
                    case 3:
                        _c = (_d.sent(), this.encoder.close());
                        _d.label = 4;
                    case 4:
                        _b = _c;
                        _d.label = 5;
                    case 5:
                        _b, this.checkForEncoderError();
                        return [2 /*return*/];
                }
            });
        });
    };
    class_34.prototype.getQueueSize = function () { var _b, _c; return this.customEncoder ? this.customEncoderQueueSize : this.isPcmEncoder ? 0 : (_c = (_b = this.encoder) === null || _b === void 0 ? void 0 : _b.encodeQueueSize) !== null && _c !== void 0 ? _c : 0; };
    class_34.prototype.checkForEncoderError = function () { if (this.encoderError)
        throw this.encoderError.stack = new Error().stack, this.encoderError; };
    return class_34;
}()), wt = /** @class */ (function (_super) {
    __extends(wt, _super);
    function wt(e) {
        var _this = this;
        Xs(e), _this = _super.call(this, e.codec) || this, _this._encoder = new Ht(_this, e);
        return _this;
    }
    wt.prototype.add = function (e) { if (!(e instanceof ne))
        throw new TypeError("audioSample must be an AudioSample."); return this._encoder.add(e, !1); };
    wt.prototype._flushAndClose = function () { return this._encoder.flushAndClose(); };
    return wt;
}(ve)), qs = /** @class */ (function (_super) {
    __extends(qs, _super);
    function qs(e) {
        var _this = this;
        Xs(e), _this = _super.call(this, e.codec) || this, _this._accumulatedFrameCount = 0, _this._encoder = new Ht(_this, e);
        return _this;
    }
    qs.prototype.add = function (e) { if (!(e instanceof AudioBuffer))
        throw new TypeError("audioBuffer must be an AudioBuffer."); var t = 64 * 1024 * 1024, s = e.numberOfChannels, i = e.sampleRate, n = e.length, a = Math.floor(t / s), o = 0, c = n, l = []; for (; c > 0;) {
        var d = Math.min(a, c), u = new Float32Array(s * d);
        for (var h = 0; h < s; h++)
            e.copyFromChannel(u.subarray(h * d, h * d + d), h, o);
        var f = new ne({ format: "f32-planar", sampleRate: i, numberOfFrames: d, numberOfChannels: s, timestamp: (this._accumulatedFrameCount + o) / i, data: u });
        l.push(this._encoder.add(f, !0)), o += d, c -= d;
    } return this._accumulatedFrameCount += n, Promise.all(l); };
    qs.prototype._flushAndClose = function () { return this._encoder.flushAndClose(); };
    return qs;
}(ve)), js = /** @class */ (function (_super) {
    __extends(class_35, _super);
    function class_35(e, t) {
        var _this = this;
        if (!(e instanceof MediaStreamTrack) || e.kind !== "audio")
            throw new TypeError("track must be an audio MediaStreamTrack.");
        Xs(t), _this = _super.call(this, t.codec) || this, _this._abortController = null, _this._encoder = new Ht(_this, t), _this._track = e;
        return _this;
    }
    class_35.prototype._start = function () {
        var _this = this;
        this._abortController = new AbortController;
        var e = !1, t = new MediaStreamTrackProcessor({ track: this._track }), s = new WritableStream({ write: function (i) { if (e || (hn(_this, i), e = !0), _this._encoder.getQueueSize() >= 4) {
                i.close();
                return;
            } _this._encoder.add(new ne(i), !0).catch(function (n) { var _b; throw (_b = _this._abortController) === null || _b === void 0 ? void 0 : _b.abort(), n; }); } });
        t.readable.pipeTo(s, { signal: this._abortController.signal }).catch(function (i) { i instanceof DOMException && i.name === "AbortError" || console.error("Pipe error:", i); });
    };
    class_35.prototype._flushAndClose = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    this._abortController && (this._abortController.abort(), this._abortController = null);
                    return [4 /*yield*/, this._encoder.flushAndClose()];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        }); });
    };
    return class_35;
}(ve)), hn = function (r, e) { var t = e.timestamp / 1e6; m(r._connectedTrack); var s = r._connectedTrack.output._muxer; s.firstMediaStreamTimestamp === null && (s.firstMediaStreamTimestamp = t), r._timestampOffset = -Math.min(s.firstMediaStreamTimestamp, t); }, kt = /** @class */ (function (_super) {
    __extends(kt, _super);
    function kt(e) {
        var _this = this;
        if (_this = _super.call(this) || this, _this._connectedTrack = null, !oe.includes(e))
            throw new TypeError("Invalid subtitle codec '".concat(e, "'. Must be one of: ").concat(oe.join(", "), "."));
        _this._codec = e;
        return _this;
    }
    return kt;
}(pt)), Ks = /** @class */ (function (_super) {
    __extends(class_36, _super);
    function class_36(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this._parser = new wr({ codec: e, output: function (t, s) { var _b; return (_b = _this._connectedTrack) === null || _b === void 0 ? void 0 : _b.output._muxer.addSubtitleCue(_this._connectedTrack, t, s); } });
        return _this;
    }
    class_36.prototype.add = function (e) { if (typeof e != "string")
        throw new TypeError("text must be a string."); return this._ensureValidAdd(), this._parser.parse(e), this._connectedTrack.output._muxer.mutex.currentPromise; };
    return class_36;
}(kt));
exports.MediaSource = pt;
exports.VideoSource = Ie;
exports.EncodedVideoPacketSource = Nt;
exports.VideoSampleSource = gt;
exports.CanvasSource = $s;
exports.MediaStreamVideoTrackSource = Qs;
exports.AudioSource = ve;
exports.EncodedAudioPacketSource = Lt;
exports.AudioSampleSource = wt;
exports.AudioBufferSource = qs;
exports.MediaStreamAudioTrackSource = js;
exports.SubtitleSource = kt;
exports.TextSubtitleSource = Ks;
var fn = ["video", "audio", "subtitle"], Ys = function (r) { if (!r || typeof r != "object")
    throw new TypeError("metadata must be an object."); if (r.languageCode !== void 0 && !Ye(r.languageCode))
    throw new TypeError("metadata.languageCode must be a three-letter, ISO 639-2/T language code."); }, $t = /** @class */ (function () {
    function class_37(e) {
        if (this.state = "pending", this._tracks = [], this._startPromise = null, this._cancelPromise = null, this._finalizePromise = null, this._mutex = new ae, !e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (!(e.format instanceof ke))
            throw new TypeError("options.format must be an OutputFormat.");
        if (!(e.target instanceof Ve))
            throw new TypeError("options.target must be a Target.");
        if (e.target._output)
            throw new Error("Target is already used for another output.");
        e.target._output = this, this.format = e.format, this.target = e.target, this._writer = e.target._createWriter(), this._muxer = e.format._createMuxer(this);
    }
    class_37.prototype.addVideoTrack = function (e, t) {
        if (t === void 0) { t = {}; }
        if (!(e instanceof Ie))
            throw new TypeError("source must be a VideoSource.");
        if (Ys(t), t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
            throw new TypeError("Invalid video rotation: ".concat(t.rotation, ". Has to be 0, 90, 180 or 270."));
        if (!this.format.supportsVideoRotationMetadata && t.rotation)
            throw new Error("".concat(this.format._name, " does not support video rotation metadata."));
        if (t.frameRate !== void 0 && (!Number.isFinite(t.frameRate) || t.frameRate <= 0))
            throw new TypeError("Invalid video frame rate: ".concat(t.frameRate, ". Must be a positive number."));
        this._addTrack("video", e, t);
    };
    class_37.prototype.addAudioTrack = function (e, t) {
        if (t === void 0) { t = {}; }
        if (!(e instanceof ve))
            throw new TypeError("source must be an AudioSource.");
        Ys(t), this._addTrack("audio", e, t);
    };
    class_37.prototype.addSubtitleTrack = function (e, t) {
        if (t === void 0) { t = {}; }
        if (!(e instanceof kt))
            throw new TypeError("source must be a SubtitleSource.");
        Ys(t), this._addTrack("subtitle", e, t);
    };
    class_37.prototype._addTrack = function (e, t, s) { if (this.state !== "pending")
        throw new Error("Cannot add track after output has been started or canceled."); if (t._connectedTrack)
        throw new Error("Source is already used for a track."); var i = this.format.getSupportedTrackCounts(), n = this._tracks.reduce(function (l, d) { return l + (d.type === e ? 1 : 0); }, 0), a = i[e].max; if (n === a)
        throw new Error(a === 0 ? "".concat(this.format._name, " does not support ").concat(e, " tracks.") : "".concat(this.format._name, " does not support more than ").concat(a, " ").concat(e, " track").concat(a === 1 ? "" : "s", ".")); var o = i.total.max; if (this._tracks.length === o)
        throw new Error("".concat(this.format._name, " does not support more than ").concat(o, " tracks").concat(o === 1 ? "" : "s", " in total.")); var c = { id: this._tracks.length + 1, output: this, type: e, source: t, metadata: s }; if (c.type === "video") {
        var l = this.format.getSupportedVideoCodecs();
        if (l.length === 0)
            throw new Error("".concat(this.format._name, " does not support video tracks.") + this.format._codecUnsupportedHint(c.source._codec));
        if (!l.includes(c.source._codec))
            throw new Error("Codec '".concat(c.source._codec, "' cannot be contained within ").concat(this.format._name, ". Supported video codecs are: ").concat(l.map(function (d) { return "'".concat(d, "'"); }).join(", "), ".") + this.format._codecUnsupportedHint(c.source._codec));
    }
    else if (c.type === "audio") {
        var l = this.format.getSupportedAudioCodecs();
        if (l.length === 0)
            throw new Error("".concat(this.format._name, " does not support audio tracks.") + this.format._codecUnsupportedHint(c.source._codec));
        if (!l.includes(c.source._codec))
            throw new Error("Codec '".concat(c.source._codec, "' cannot be contained within ").concat(this.format._name, ". Supported audio codecs are: ").concat(l.map(function (d) { return "'".concat(d, "'"); }).join(", "), ".") + this.format._codecUnsupportedHint(c.source._codec));
    }
    else if (c.type === "subtitle") {
        var l = this.format.getSupportedSubtitleCodecs();
        if (l.length === 0)
            throw new Error("".concat(this.format._name, " does not support subtitle tracks.") + this.format._codecUnsupportedHint(c.source._codec));
        if (!l.includes(c.source._codec))
            throw new Error("Codec '".concat(c.source._codec, "' cannot be contained within ").concat(this.format._name, ". Supported subtitle codecs are: ").concat(l.map(function (d) { return "'".concat(d, "'"); }).join(", "), ".") + this.format._codecUnsupportedHint(c.source._codec));
    } this._tracks.push(c), t._connectedTrack = c; };
    class_37.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e, _loop_5, this_4, _b, fn_1, s, t;
            var _this = this;
            return __generator(this, function (_c) {
                e = this.format.getSupportedTrackCounts();
                _loop_5 = function (s) {
                    var i = this_4._tracks.reduce(function (a, o) { return a + (o.type === s ? 1 : 0); }, 0), n = e[s].min;
                    if (i < n)
                        throw new Error(n === e[s].max ? "".concat(this_4.format._name, " requires exactly ").concat(n, " ").concat(s, " track").concat(n === 1 ? "" : "s", ".") : "".concat(this_4.format._name, " requires at least ").concat(n, " ").concat(s, " track").concat(n === 1 ? "" : "s", "."));
                };
                this_4 = this;
                for (_b = 0, fn_1 = fn; _b < fn_1.length; _b++) {
                    s = fn_1[_b];
                    _loop_5(s);
                }
                t = e.total.min;
                if (this._tracks.length < t)
                    throw new Error(t === e.total.max ? "".concat(this.format._name, " requires exactly ").concat(t, " track").concat(t === 1 ? "" : "s", ".") : "".concat(this.format._name, " requires at least ").concat(t, " track").concat(t === 1 ? "" : "s", "."));
                if (this.state === "canceled")
                    throw new Error("Output has been canceled.");
                return [2 /*return*/, this._startPromise ? (console.warn("Output has already been started."), this._startPromise) : this._startPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var s, _b, _c, i; return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                this.state = "started", this._writer.start();
                                return [4 /*yield*/, this._mutex.acquire()];
                            case 1:
                                s = _d.sent();
                                return [4 /*yield*/, this._muxer.start()];
                            case 2:
                                _d.sent();
                                for (_b = 0, _c = this._tracks; _b < _c.length; _b++) {
                                    i = _c[_b];
                                    i.source._start();
                                }
                                s();
                                return [2 /*return*/];
                        }
                    }); }); })()];
            });
        });
    };
    class_37.prototype.getMimeType = function () { return this._muxer.getMimeType(); };
    class_37.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                if (this._cancelPromise)
                    return [2 /*return*/, (console.warn("Output has already been canceled."), this._cancelPromise)];
                if (this.state === "finalizing" || this.state === "finalized") {
                    console.warn("Output has already been finalized.");
                    return [2 /*return*/];
                }
                return [2 /*return*/, this._cancelPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                this.state = "canceled";
                                return [4 /*yield*/, this._mutex.acquire()];
                            case 1:
                                e = _b.sent(), t = this._tracks.map(function (s) { return s.source._flushOrWaitForClose(); });
                                return [4 /*yield*/, Promise.all(t)];
                            case 2:
                                _b.sent();
                                return [4 /*yield*/, this._writer.close()];
                            case 3:
                                _b.sent(), e();
                                return [2 /*return*/];
                        }
                    }); }); })()];
            });
        });
    };
    class_37.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                if (this.state === "pending")
                    throw new Error("Cannot finalize before starting.");
                if (this.state === "canceled")
                    throw new Error("Cannot finalize after canceling.");
                return [2 /*return*/, this._finalizePromise ? (console.warn("Output has already been finalized."), this._finalizePromise) : this._finalizePromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                this.state = "finalizing";
                                return [4 /*yield*/, this._mutex.acquire()];
                            case 1:
                                e = _b.sent(), t = this._tracks.map(function (s) { return s.source._flushOrWaitForClose(); });
                                return [4 /*yield*/, Promise.all(t)];
                            case 2:
                                _b.sent();
                                return [4 /*yield*/, this._muxer.finalize()];
                            case 3:
                                _b.sent();
                                return [4 /*yield*/, this._writer.flush()];
                            case 4:
                                _b.sent();
                                return [4 /*yield*/, this._writer.finalize()];
                            case 5:
                                _b.sent(), this.state = "finalized", e();
                                return [2 /*return*/];
                        }
                    }); }); })()];
            });
        });
    };
    return class_37;
}());
exports.ALL_TRACK_TYPES = fn;
exports.Output = $t;
var Re = /** @class */ (function () {
    function class_38() {
        this._sizePromise = null, this.onread = null;
    }
    class_38.prototype.getSize = function () { var _b; return (_b = this._sizePromise) !== null && _b !== void 0 ? _b : (this._sizePromise = this._retrieveSize()); };
    return class_38;
}()), Zs = /** @class */ (function (_super) {
    __extends(class_39, _super);
    function class_39(e) {
        var _this = this;
        if (!(e instanceof ArrayBuffer) && !(e instanceof Uint8Array))
            throw new TypeError("buffer must be an ArrayBuffer or Uint8Array.");
        _this = _super.call(this) || this, _this._bytes = e instanceof Uint8Array ? e : new Uint8Array(e);
        return _this;
    }
    class_39.prototype._read = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._bytes.subarray(e, t)];
        }); });
    };
    class_39.prototype._retrieveSize = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._bytes.byteLength];
        }); });
    };
    return class_39;
}(Re)), Js = /** @class */ (function (_super) {
    __extends(class_40, _super);
    function class_40(e) {
        var _this = this;
        if (!e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (typeof e.read != "function")
            throw new TypeError("options.read must be a function.");
        if (typeof e.getSize != "function")
            throw new TypeError("options.getSize must be a function.");
        _this = _super.call(this) || this, _this._options = e;
        return _this;
    }
    class_40.prototype._read = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._options.read(e, t)];
        }); });
    };
    class_40.prototype._retrieveSize = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._options.getSize()];
        }); });
    };
    return class_40;
}(Re)), ei = /** @class */ (function (_super) {
    __extends(class_41, _super);
    function class_41(e) {
        var _this = this;
        if (!(e instanceof Blob))
            throw new TypeError("blob must be a Blob.");
        _this = _super.call(this) || this, _this._blob = e;
        return _this;
    }
    class_41.prototype._read = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._blob.slice(e, t).arrayBuffer()];
                case 1:
                    i = _b.sent();
                    return [2 /*return*/, new Uint8Array(i)];
            }
        }); });
    };
    class_41.prototype._retrieveSize = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this._blob.size];
        }); });
    };
    return class_41;
}(Re)), ti = /** @class */ (function (_super) {
    __extends(class_42, _super);
    function class_42(e, t) {
        if (t === void 0) { t = {}; }
        var _this = this;
        if (typeof e != "string" && !(e instanceof URL))
            throw new TypeError("url must be a string or URL.");
        if (!t || typeof t != "object")
            throw new TypeError("options must be an object.");
        if (t.requestInit !== void 0 && (!t.requestInit || typeof t.requestInit != "object"))
            throw new TypeError("options.requestInit, when provided, must be an object.");
        if (t.getRetryDelay !== void 0 && typeof t.getRetryDelay != "function")
            throw new TypeError("options.getRetryDelay, when provided, must be a function.");
        _this = _super.call(this) || this, _this._fullData = null, _this._url = e, _this._options = t;
        return _this;
    }
    class_42.prototype._makeRequest = function (e) {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var t, s, i; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    t = {};
                    e && (t.Range = "bytes=".concat(e.start, "-").concat(e.end - 1));
                    return [4 /*yield*/, ps(this._url, Jt((_b = this._options.requestInit) !== null && _b !== void 0 ? _b : {}, { method: "GET", headers: t }), (_c = this._options.getRetryDelay) !== null && _c !== void 0 ? _c : (function () { return null; }))];
                case 1:
                    s = _d.sent();
                    if (!s.ok)
                        throw new Error("Error fetching ".concat(this._url, ": ").concat(s.status, " ").concat(s.statusText));
                    return [4 /*yield*/, s.arrayBuffer()];
                case 2:
                    i = _d.sent();
                    return [2 /*return*/, (e || (this._fullData = i), { response: i, statusCode: s.status })];
            }
        }); });
    };
    class_42.prototype._read = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var _b, s, i; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (this._fullData)
                        return [2 /*return*/, new Uint8Array(this._fullData, e, t - e)];
                    return [4 /*yield*/, this._makeRequest({ start: e, end: t })];
                case 1:
                    _b = _c.sent(), s = _b.response, i = _b.statusCode;
                    return [2 /*return*/, i === 200 ? new Uint8Array(s).subarray(e, t) : new Uint8Array(s)];
            }
        }); });
    };
    class_42.prototype._retrieveSize = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var e, s, i, t; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (this._fullData)
                        return [2 /*return*/, this._fullData.byteLength];
                    return [4 /*yield*/, ps(this._url, Jt((_b = this._options.requestInit) !== null && _b !== void 0 ? _b : {}, { method: "GET", headers: { Range: "bytes=0-0" } }), (_c = this._options.getRetryDelay) !== null && _c !== void 0 ? _c : (function () { return null; }))];
                case 1:
                    e = _d.sent();
                    if (e.status === 206) {
                        s = e.headers.get("Content-Range");
                        if (s) {
                            i = s.match(/bytes \d+-\d+\/(\d+)/);
                            if (i && i[1])
                                return [2 /*return*/, parseInt(i[1], 10)];
                        }
                    }
                    return [4 /*yield*/, this._makeRequest()];
                case 2:
                    t = (_d.sent()).response;
                    return [2 /*return*/, t.byteLength];
            }
        }); });
    };
    return class_42;
}(Re));
exports.Source = Re;
exports.BufferSource = Zs;
exports.StreamSource = Js;
exports.BlobSource = ei;
exports.UrlSource = ti;
var je = /** @class */ (function () {
    function je(e) {
        this.reader = e, this.pos = 0;
    }
    je.prototype.readBytes = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, new Uint8Array(t.buffer, s, e); };
    je.prototype.readU8 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 1), e = _b.view, t = _b.offset; return this.pos++, e.getUint8(t); };
    je.prototype.readU16 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 2), e = _b.view, t = _b.offset; return this.pos += 2, e.getUint16(t, !1); };
    je.prototype.readI16 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 2), e = _b.view, t = _b.offset; return this.pos += 2, e.getInt16(t, !1); };
    je.prototype.readU24 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 3), e = _b.view, t = _b.offset; this.pos += 3; var s = e.getUint16(t, !1), i = e.getUint8(t + 2); return s * 256 + i; };
    je.prototype.readU32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getUint32(t, !1); };
    je.prototype.readI32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getInt32(t, !1); };
    je.prototype.readU64 = function () { var e = this.readU32(), t = this.readU32(); return e * 4294967296 + t; };
    je.prototype.readI64 = function () { var e = this.readI32(), t = this.readU32(); return e * 4294967296 + t; };
    je.prototype.readF64 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 8), e = _b.view, t = _b.offset; return this.pos += 8, e.getFloat64(t, !1); };
    je.prototype.readFixed_16_16 = function () { return this.readI32() / 65536; };
    je.prototype.readFixed_2_30 = function () { return this.readI32() / 1073741824; };
    je.prototype.readAscii = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; this.pos += e; var i = ""; for (var n = 0; n < e; n++)
        i += String.fromCharCode(t.getUint8(s + n)); return i; };
    je.prototype.readIsomVariableInteger = function () { var e = 0; for (var t = 0; t < 4; t++) {
        e <<= 7;
        var s = this.readU8();
        if (e |= s & 127, !(s & 128))
            break;
    } return e; };
    je.prototype.readBoxHeader = function () { var e = this.readU32(), t = this.readAscii(4), s = 8; return e === 1 && (e = this.readU64(), s = 16), { name: t, totalSize: e, headerSize: s, contentSize: e - s }; };
    return je;
}());
var Xr = /** @class */ (function (_super) {
    __extends(class_43, _super);
    function class_43(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.currentTrack = null, _this.tracks = [], _this.metadataPromise = null, _this.movieTimescale = -1, _this.movieDurationInTimescale = -1, _this.isQuickTime = !1, _this.isFragmented = !1, _this.fragmentTrackDefaults = [], _this.fragments = [], _this.currentFragment = null, _this.fragmentLookupMutex = new ae, _this.metadataReader = new je(e._mainReader), _this.chunkReader = new je(new ue(e.source, 64 * Math.pow(2, 20)));
        return _this;
    }
    class_43.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1:
                    e = _b.sent();
                    return [4 /*yield*/, Promise.all(e.map(function (s) { return s.computeDuration(); }))];
                case 2:
                    t = _b.sent();
                    return [2 /*return*/, Math.max.apply(Math, __spreadArray([0], t, false))];
            }
        }); });
    };
    class_43.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), this.tracks.map(function (e) { return e.inputTrack; }))];
            }
        }); });
    };
    class_43.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, Promise.all(this.tracks.map(function (t) { return t.inputTrack.getCodecParameterString(); }))];
                case 2:
                    e = _b.sent();
                    return [2 /*return*/, vr({ isQuickTime: this.isQuickTime, hasVideo: this.tracks.some(function (t) { var _b; return ((_b = t.info) === null || _b === void 0 ? void 0 : _b.type) === "video"; }), hasAudio: this.tracks.some(function (t) { var _b; return ((_b = t.info) === null || _b === void 0 ? void 0 : _b.type) === "audio"; }), codecStrings: e.filter(Boolean) })];
            }
        }); });
    };
    class_43.prototype.readMetadata = function () {
        var _this = this;
        var _b;
        return (_b = this.metadataPromise) !== null && _b !== void 0 ? _b : (this.metadataPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, t, s, i, _b, _c, i, n, t, s, i; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.metadataReader.reader.source.getSize()];
                case 1:
                    e = _d.sent();
                    _d.label = 2;
                case 2:
                    if (!(this.metadataReader.pos < e)) return [3 /*break*/, 8];
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + 16)];
                case 3:
                    _d.sent();
                    t = this.metadataReader.pos, s = this.metadataReader.readBoxHeader();
                    if (!(s.name === "ftyp")) return [3 /*break*/, 4];
                    i = this.metadataReader.readAscii(4);
                    this.isQuickTime = i === "qt  ";
                    return [3 /*break*/, 6];
                case 4:
                    if (!(s.name === "moov")) return [3 /*break*/, 6];
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + s.contentSize)];
                case 5:
                    _d.sent(), this.readContiguousBoxes(s.contentSize);
                    for (_b = 0, _c = this.tracks; _b < _c.length; _b++) {
                        i = _c[_b];
                        n = i.editListPreviousSegmentDurations / this.movieTimescale;
                        i.editListOffset -= Math.round(n * i.timescale);
                    }
                    return [3 /*break*/, 8];
                case 6:
                    this.metadataReader.pos = t + s.totalSize;
                    _d.label = 7;
                case 7: return [3 /*break*/, 2];
                case 8:
                    if (!this.isFragmented) return [3 /*break*/, 11];
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(e - 4, e)];
                case 9:
                    _d.sent(), this.metadataReader.pos = e - 4;
                    t = this.metadataReader.readU32(), s = e - t;
                    if (!(s >= 0 && s < e)) return [3 /*break*/, 11];
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(s, e)];
                case 10:
                    _d.sent(), this.metadataReader.pos = s;
                    i = this.metadataReader.readBoxHeader();
                    i.name === "mfra" && this.readContiguousBoxes(i.contentSize);
                    _d.label = 11;
                case 11: return [2 /*return*/];
            }
        }); }); })());
    };
    class_43.prototype.getSampleTableForTrack = function (e) { var _b, _c; if (e.sampleTable)
        return e.sampleTable; var t = { sampleTimingEntries: [], sampleCompositionTimeOffsets: [], sampleSizes: [], keySampleIndices: null, chunkOffsets: [], sampleToChunk: [], presentationTimestamps: null, presentationTimestampIndexMap: null }; if (e.sampleTable = t, this.metadataReader.pos = e.sampleTableByteOffset, this.currentTrack = e, this.traverseBox(), this.currentTrack = null, ((_b = e.info) === null || _b === void 0 ? void 0 : _b.type) === "audio" && e.info.codec && V.includes(e.info.codec) && t.sampleCompositionTimeOffsets.length === 0) {
        m(((_c = e.info) === null || _c === void 0 ? void 0 : _c.type) === "audio");
        var i = X(e.info.codec), n = [], a = [];
        for (var o = 0; o < t.sampleToChunk.length; o++) {
            var c = t.sampleToChunk[o], l = t.sampleToChunk[o + 1], d = (l ? l.startChunkIndex : t.chunkOffsets.length) - c.startChunkIndex;
            for (var u = 0; u < d; u++) {
                var f = c.startSampleIndex + u * c.samplesPerChunk, h = f + c.samplesPerChunk, p = O(t.sampleTimingEntries, f, function (C) { return C.startIndex; }), w = t.sampleTimingEntries[p], g = O(t.sampleTimingEntries, h, function (C) { return C.startIndex; }), T = t.sampleTimingEntries[g], S = w.startDecodeTimestamp + (f - w.startIndex) * w.delta, y = T.startDecodeTimestamp + (h - T.startIndex) * T.delta - S, b = U(n);
                b && b.delta === y ? b.count++ : n.push({ startIndex: c.startChunkIndex + u, startDecodeTimestamp: S, count: 1, delta: y });
                var x = c.samplesPerChunk * i.sampleSize * e.info.numberOfChannels;
                a.push(x);
            }
            c.startSampleIndex = c.startChunkIndex, c.samplesPerChunk = 1;
        }
        t.sampleTimingEntries = n, t.sampleSizes = a;
    } if (t.sampleCompositionTimeOffsets.length > 0) {
        t.presentationTimestamps = [];
        for (var _d = 0, _f = t.sampleTimingEntries; _d < _f.length; _d++) {
            var i = _f[_d];
            for (var n = 0; n < i.count; n++)
                t.presentationTimestamps.push({ presentationTimestamp: i.startDecodeTimestamp + n * i.delta, sampleIndex: i.startIndex + n });
        }
        for (var _g = 0, _h = t.sampleCompositionTimeOffsets; _g < _h.length; _g++) {
            var i = _h[_g];
            for (var n = 0; n < i.count; n++) {
                var a = i.startIndex + n, o = t.presentationTimestamps[a];
                o && (o.presentationTimestamp += i.offset);
            }
        }
        t.presentationTimestamps.sort(function (i, n) { return i.presentationTimestamp - n.presentationTimestamp; }), t.presentationTimestampIndexMap = Array(t.presentationTimestamps.length).fill(-1);
        for (var i = 0; i < t.presentationTimestamps.length; i++)
            t.presentationTimestampIndexMap[t.presentationTimestamps[i].sampleIndex] = i;
    } return t; };
    class_43.prototype.readFragment = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, s, i, n, _loop_6, this_5, _b, _c, _d, a, o; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    e = this.metadataReader.pos;
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + 16)];
                case 1:
                    _f.sent();
                    t = this.metadataReader.readBoxHeader();
                    m(t.name === "moof");
                    s = this.metadataReader.pos;
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(s, s + t.contentSize)];
                case 2:
                    _f.sent(), this.metadataReader.pos = e, this.traverseBox();
                    i = L(this.fragments, e, function (a) { return a.moofOffset; });
                    m(i !== -1);
                    n = this.fragments[i];
                    m(n.moofOffset === e), this.metadataReader.reader.forgetRange(s, s + t.contentSize);
                    _loop_6 = function (a, o) {
                        var c, l, d, u, f, h, p, w, g, _g, h;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    if (o.startTimestampIsFinal)
                                        return [2 /*return*/, "continue"];
                                    c = this_5.tracks.find(function (h) { return h.id === a; });
                                    this_5.metadataReader.pos = 0;
                                    l = null, d = null, u = O(c.fragments, e - 1, function (h) { return h.moofOffset; });
                                    u !== -1 && (l = c.fragments[u], d = l, this_5.metadataReader.pos = l.moofOffset + l.moofSize);
                                    f = this_5.metadataReader.pos === 0;
                                    _h.label = 1;
                                case 1:
                                    if (!(this_5.metadataReader.pos < e)) return [3 /*break*/, 10];
                                    if (!(l === null || l === void 0 ? void 0 : l.nextFragment)) return [3 /*break*/, 2];
                                    l = l.nextFragment, this_5.metadataReader.pos = l.moofOffset + l.moofSize;
                                    return [3 /*break*/, 8];
                                case 2: return [4 /*yield*/, this_5.metadataReader.reader.loadRange(this_5.metadataReader.pos, this_5.metadataReader.pos + 16)];
                                case 3:
                                    _h.sent();
                                    h = this_5.metadataReader.pos, p = this_5.metadataReader.readBoxHeader();
                                    if (!(p.name === "moof")) return [3 /*break*/, 7];
                                    w = L(this_5.fragments, h, function (T) { return T.moofOffset; }), g = void 0;
                                    if (!(w === -1)) return [3 /*break*/, 5];
                                    this_5.metadataReader.pos = h;
                                    return [4 /*yield*/, this_5.readFragment()];
                                case 4:
                                    _g = (g = _h.sent());
                                    return [3 /*break*/, 6];
                                case 5:
                                    _g = g = this_5.fragments[w];
                                    _h.label = 6;
                                case 6:
                                    _g, l && (l.nextFragment = g), l = g, f && (g.isKnownToBeFirstFragment = !0, f = !1);
                                    _h.label = 7;
                                case 7:
                                    this_5.metadataReader.pos = h + p.totalSize;
                                    _h.label = 8;
                                case 8:
                                    l && l.trackData.has(a) && (d = l);
                                    _h.label = 9;
                                case 9: return [3 /*break*/, 1];
                                case 10:
                                    if (d) {
                                        h = d.trackData.get(a);
                                        m(h.startTimestampIsFinal), gn(o, h.endTimestamp);
                                    }
                                    o.startTimestampIsFinal = !0;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    this_5 = this;
                    _b = 0, _c = n.trackData;
                    _f.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 6];
                    _d = _c[_b], a = _d[0], o = _d[1];
                    return [5 /*yield**/, _loop_6(a, o)];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, n];
            }
        }); });
    };
    class_43.prototype.readContiguousBoxes = function (e) { var t = this.metadataReader.pos; for (; this.metadataReader.pos - t <= e - 8;)
        this.traverseBox(); };
    class_43.prototype.traverseBox = function () { var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p; var e = this.metadataReader.pos, t = this.metadataReader.readBoxHeader(), s = e + t.totalSize; switch (t.name) {
        case "mdia":
        case "minf":
        case "dinf":
        case "mfra":
        case "edts":
            this.readContiguousBoxes(t.contentSize);
            break;
        case "mvhd":
            {
                var i = this.metadataReader.readU8();
                this.metadataReader.pos += 3, i === 1 ? (this.metadataReader.pos += 16, this.movieTimescale = this.metadataReader.readU32(), this.movieDurationInTimescale = this.metadataReader.readU64()) : (this.metadataReader.pos += 8, this.movieTimescale = this.metadataReader.readU32(), this.movieDurationInTimescale = this.metadataReader.readU32());
            }
            break;
        case "trak":
            {
                var i = { id: -1, demuxer: this, inputTrack: null, info: null, timescale: -1, durationInMovieTimescale: -1, durationInMediaTimescale: -1, rotation: 0, languageCode: J, sampleTableByteOffset: -1, sampleTable: null, fragmentLookupTable: null, currentFragmentState: null, fragments: [], editListPreviousSegmentDurations: 0, editListOffset: 0 };
                if (this.currentTrack = i, this.readContiguousBoxes(t.contentSize), i.id !== -1 && i.timescale !== -1 && i.info !== null) {
                    if (i.info.type === "video" && i.info.width !== -1) {
                        var n = i;
                        i.inputTrack = new he(new ri(n)), this.tracks.push(i);
                    }
                    else if (i.info.type === "audio" && i.info.numberOfChannels !== -1) {
                        var n = i;
                        i.inputTrack = new Y(new si(n)), this.tracks.push(i);
                    }
                }
                this.currentTrack = null;
            }
            break;
        case "tkhd":
            {
                var i = this.currentTrack;
                m(i);
                var n = this.metadataReader.readU8();
                if (!((this.metadataReader.readU24() & 1) !== 0))
                    break;
                if (n === 0)
                    this.metadataReader.pos += 8, i.id = this.metadataReader.readU32(), this.metadataReader.pos += 4, i.durationInMovieTimescale = this.metadataReader.readU32();
                else if (n === 1)
                    this.metadataReader.pos += 16, i.id = this.metadataReader.readU32(), this.metadataReader.pos += 4, i.durationInMovieTimescale = this.metadataReader.readU64();
                else
                    throw new Error("Incorrect track header version ".concat(n, "."));
                this.metadataReader.pos += 2 * 4 + 2 + 2 + 2 + 2;
                var c = [this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_2_30(), this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_2_30(), this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_16_16(), this.metadataReader.readFixed_2_30()], l = Fe(xt(wo(c), 90));
                m(l === 0 || l === 90 || l === 180 || l === 270), i.rotation = l;
            }
            break;
        case "elst":
            {
                var i = this.currentTrack;
                m(i);
                var n = this.metadataReader.readU8();
                this.metadataReader.pos += 3;
                var a = !1, o = 0, c = this.metadataReader.readU32();
                for (var l = 0; l < c; l++) {
                    var d = n === 1 ? this.metadataReader.readU64() : this.metadataReader.readU32(), u = n === 1 ? this.metadataReader.readI64() : this.metadataReader.readI32(), f = this.metadataReader.readFixed_16_16();
                    if (d !== 0) {
                        if (a)
                            throw new Error("Unsupported edit list: multiple edits are not supported.");
                        if (u === -1) {
                            o += d;
                            continue;
                        }
                        if (f !== 1)
                            throw new Error("Unsupported edit list: media rate must be 1.");
                        i.editListPreviousSegmentDurations = o, i.editListOffset = u, a = !0;
                    }
                }
            }
            break;
        case "mdhd":
            {
                var i = this.currentTrack;
                m(i);
                var n = this.metadataReader.readU8();
                this.metadataReader.pos += 3, n === 0 ? (this.metadataReader.pos += 8, i.timescale = this.metadataReader.readU32(), i.durationInMediaTimescale = this.metadataReader.readU32()) : n === 1 && (this.metadataReader.pos += 16, i.timescale = this.metadataReader.readU32(), i.durationInMediaTimescale = this.metadataReader.readU64());
                var a = this.metadataReader.readU16();
                if (a > 0) {
                    i.languageCode = "";
                    for (var o = 0; o < 3; o++)
                        i.languageCode = String.fromCharCode(96 + (a & 31)) + i.languageCode, a >>= 5;
                    Ye(i.languageCode) || (i.languageCode = J);
                }
            }
            break;
        case "hdlr":
            {
                var i = this.currentTrack;
                m(i), this.metadataReader.pos += 8;
                var n = this.metadataReader.readAscii(4);
                n === "vide" ? i.info = { type: "video", width: -1, height: -1, codec: null, codecDescription: null, colorSpace: null, avcCodecInfo: null, hevcCodecInfo: null, vp9CodecInfo: null, av1CodecInfo: null } : n === "soun" && (i.info = { type: "audio", numberOfChannels: -1, sampleRate: -1, codec: null, codecDescription: null, aacCodecInfo: null });
            }
            break;
        case "stbl":
            {
                var i = this.currentTrack;
                m(i), i.sampleTableByteOffset = e, this.readContiguousBoxes(t.contentSize);
            }
            break;
        case "stsd":
            {
                var i = this.currentTrack;
                if (m(i), i.info === null || i.sampleTable)
                    break;
                var n = this.metadataReader.readU8();
                this.metadataReader.pos += 3;
                var a = this.metadataReader.readU32();
                for (var o = 0; o < a; o++) {
                    var c = this.metadataReader.pos, l = this.metadataReader.readBoxHeader(), d = l.name.toLowerCase();
                    if (i.info.type === "video")
                        d === "avc1" ? i.info.codec = "avc" : d === "hvc1" || d === "hev1" ? i.info.codec = "hevc" : d === "vp08" ? i.info.codec = "vp8" : d === "vp09" ? i.info.codec = "vp9" : d === "av01" ? i.info.codec = "av1" : console.warn("Unsupported video codec (sample entry type '".concat(l.name, "').")), this.metadataReader.pos += 6 * 1 + 2 + 2 + 2 + 3 * 4, i.info.width = this.metadataReader.readU16(), i.info.height = this.metadataReader.readU16(), this.metadataReader.pos += 50, this.readContiguousBoxes(c + l.totalSize - this.metadataReader.pos);
                    else {
                        d === "mp4a" || (d === "opus" ? i.info.codec = "opus" : d === "flac" ? i.info.codec = "flac" : d === "twos" || d === "sowt" || d === "raw " || d === "in24" || d === "in32" || d === "fl32" || d === "fl64" || d === "lpcm" || d === "ipcm" || d === "fpcm" || (d === "ulaw" ? i.info.codec = "ulaw" : d === "alaw" ? i.info.codec = "alaw" : console.warn("Unsupported audio codec (sample entry type '".concat(l.name, "').")))), this.metadataReader.pos += 6 * 1 + 2;
                        var u = this.metadataReader.readU16();
                        this.metadataReader.pos += 3 * 2;
                        var f = this.metadataReader.readU16(), h = this.metadataReader.readU16();
                        this.metadataReader.pos += 2 * 2;
                        var p = this.metadataReader.readU32() / 65536;
                        if (n === 0 && u > 0) {
                            if (u === 1)
                                this.metadataReader.pos += 4, h = 8 * this.metadataReader.readU32(), this.metadataReader.pos += 2 * 4;
                            else if (u === 2) {
                                this.metadataReader.pos += 4, p = this.metadataReader.readF64(), f = this.metadataReader.readU32(), this.metadataReader.pos += 4, h = this.metadataReader.readU32();
                                var w = this.metadataReader.readU32();
                                if (this.metadataReader.pos += 2 * 4, d === "lpcm") {
                                    var g = h + 7 >> 3, T = !!(w & 1), S = !!(w & 2), E = w & 4 ? -1 : 0;
                                    h > 0 && h <= 64 && (T ? h === 32 && (i.info.codec = S ? "pcm-f32be" : "pcm-f32") : E & 1 << g - 1 ? g === 1 ? i.info.codec = "pcm-s8" : g === 2 ? i.info.codec = S ? "pcm-s16be" : "pcm-s16" : g === 3 ? i.info.codec = S ? "pcm-s24be" : "pcm-s24" : g === 4 && (i.info.codec = S ? "pcm-s32be" : "pcm-s32") : g === 1 && (i.info.codec = "pcm-u8")), i.info.codec === null && console.warn("Unsupported PCM format.");
                                }
                            }
                        }
                        if (i.info.numberOfChannels = f, i.info.sampleRate = p, d === "twos")
                            if (h === 8)
                                i.info.codec = "pcm-s8";
                            else if (h === 16)
                                i.info.codec = "pcm-s16be";
                            else
                                throw new Error("Unsupported sample size ".concat(h, " for codec 'twos'."));
                        else if (d === "sowt")
                            if (h === 8)
                                i.info.codec = "pcm-s8";
                            else if (h === 16)
                                i.info.codec = "pcm-s16";
                            else
                                throw new Error("Unsupported sample size ".concat(h, " for codec 'sowt'."));
                        else
                            d === "raw " ? i.info.codec = "pcm-u8" : d === "in24" ? i.info.codec = "pcm-s24be" : d === "in32" ? i.info.codec = "pcm-s32be" : d === "fl32" ? i.info.codec = "pcm-f32be" : d === "fl64" ? i.info.codec = "pcm-f64be" : d === "ipcm" ? i.info.codec = "pcm-s16be" : d === "fpcm" && (i.info.codec = "pcm-f32be");
                        this.readContiguousBoxes(c + l.totalSize - this.metadataReader.pos);
                    }
                }
            }
            break;
        case "avcC":
            {
                var i = this.currentTrack;
                m(i && i.info), i.info.codecDescription = this.metadataReader.readBytes(t.contentSize);
            }
            break;
        case "hvcC":
            {
                var i = this.currentTrack;
                m(i && i.info), i.info.codecDescription = this.metadataReader.readBytes(t.contentSize);
            }
            break;
        case "vpcC":
            {
                var i = this.currentTrack;
                m(i && ((_b = i.info) === null || _b === void 0 ? void 0 : _b.type) === "video"), this.metadataReader.pos += 4;
                var n = this.metadataReader.readU8(), a = this.metadataReader.readU8(), o = this.metadataReader.readU8(), c = o >> 4, l = o >> 1 & 7, d = o & 1, u = this.metadataReader.readU8(), f = this.metadataReader.readU8(), h = this.metadataReader.readU8();
                i.info.vp9CodecInfo = { profile: n, level: a, bitDepth: c, chromaSubsampling: l, videoFullRangeFlag: d, colourPrimaries: u, transferCharacteristics: f, matrixCoefficients: h };
            }
            break;
        case "av1C":
            {
                var i = this.currentTrack;
                m(i && ((_c = i.info) === null || _c === void 0 ? void 0 : _c.type) === "video"), this.metadataReader.pos += 1;
                var n = this.metadataReader.readU8(), a = n >> 5, o = n & 31, c = this.metadataReader.readU8(), l = c >> 7, d = c >> 6 & 1, u = c >> 5 & 1, f = c >> 4 & 1, h = c >> 3 & 1, p = c >> 2 & 1, w = c & 3, g = a == 2 && d ? u ? 12 : 10 : d ? 10 : 8;
                i.info.av1CodecInfo = { profile: a, level: o, tier: l, bitDepth: g, monochrome: f, chromaSubsamplingX: h, chromaSubsamplingY: p, chromaSamplePosition: w };
            }
            break;
        case "colr":
            {
                var i = this.currentTrack;
                if (m(i && ((_d = i.info) === null || _d === void 0 ? void 0 : _d.type) === "video"), this.metadataReader.readAscii(4) !== "nclx")
                    break;
                var a = this.metadataReader.readU16(), o = this.metadataReader.readU16(), c = this.metadataReader.readU16(), l = !!(this.metadataReader.readU8() & 128);
                i.info.colorSpace = { primaries: Kt[a], transfer: Gt[o], matrix: Xt[c], fullRange: l };
            }
            break;
        case "wave":
            this.readContiguousBoxes(t.contentSize);
            break;
        case "esds":
            {
                var i = this.currentTrack;
                m(i && ((_f = i.info) === null || _f === void 0 ? void 0 : _f.type) === "audio"), this.metadataReader.pos += 4;
                var n = this.metadataReader.readU8();
                m(n === 3), this.metadataReader.readIsomVariableInteger(), this.metadataReader.pos += 2;
                var a = this.metadataReader.readU8(), o = (a & 128) !== 0, c = (a & 64) !== 0, l = (a & 32) !== 0;
                if (o && (this.metadataReader.pos += 2), c) {
                    var p = this.metadataReader.readU8();
                    this.metadataReader.pos += p;
                }
                l && (this.metadataReader.pos += 2);
                var d = this.metadataReader.readU8();
                m(d === 4);
                var u = this.metadataReader.readIsomVariableInteger(), f = this.metadataReader.pos, h = this.metadataReader.readU8();
                if (h === 64 || h === 103 ? (i.info.codec = "aac", i.info.aacCodecInfo = { isMpeg2: h === 103 }) : h === 105 || h === 107 ? i.info.codec = "mp3" : h === 221 ? i.info.codec = "vorbis" : console.warn("Unsupported audio codec (objectTypeIndication ".concat(h, ") - discarding track.")), this.metadataReader.pos += 12, u > this.metadataReader.pos - f) {
                    var p = this.metadataReader.readU8();
                    m(p === 5);
                    var w = this.metadataReader.readIsomVariableInteger();
                    if (i.info.codecDescription = this.metadataReader.readBytes(w), i.info.codec === "aac") {
                        var g = gs(i.info.codecDescription);
                        g.numberOfChannels !== null && (i.info.numberOfChannels = g.numberOfChannels), g.sampleRate !== null && (i.info.sampleRate = g.sampleRate);
                    }
                }
            }
            break;
        case "enda":
            {
                var i = this.currentTrack;
                m(i && ((_g = i.info) === null || _g === void 0 ? void 0 : _g.type) === "audio"), this.metadataReader.readU16() & 255 && (i.info.codec === "pcm-s16be" ? i.info.codec = "pcm-s16" : i.info.codec === "pcm-s24be" ? i.info.codec = "pcm-s24" : i.info.codec === "pcm-s32be" ? i.info.codec = "pcm-s32" : i.info.codec === "pcm-f32be" ? i.info.codec = "pcm-f32" : i.info.codec === "pcm-f64be" && (i.info.codec = "pcm-f64"));
            }
            break;
        case "pcmC": {
            var i = this.currentTrack;
            m(i && ((_h = i.info) === null || _h === void 0 ? void 0 : _h.type) === "audio"), this.metadataReader.pos += 4;
            var a = !!(this.metadataReader.readU8() & 1), o = this.metadataReader.readU8();
            if (i.info.codec === "pcm-s16be")
                if (a)
                    if (o === 16)
                        i.info.codec = "pcm-s16";
                    else if (o === 24)
                        i.info.codec = "pcm-s24";
                    else if (o === 32)
                        i.info.codec = "pcm-s32";
                    else
                        throw new Error("Invalid ipcm sample size ".concat(o, "."));
                else if (o === 16)
                    i.info.codec = "pcm-s16be";
                else if (o === 24)
                    i.info.codec = "pcm-s24be";
                else if (o === 32)
                    i.info.codec = "pcm-s32be";
                else
                    throw new Error("Invalid ipcm sample size ".concat(o, "."));
            else if (i.info.codec === "pcm-f32be")
                if (a)
                    if (o === 32)
                        i.info.codec = "pcm-f32";
                    else if (o === 64)
                        i.info.codec = "pcm-f64";
                    else
                        throw new Error("Invalid fpcm sample size ".concat(o, "."));
                else if (o === 32)
                    i.info.codec = "pcm-f32be";
                else if (o === 64)
                    i.info.codec = "pcm-f64be";
                else
                    throw new Error("Invalid fpcm sample size ".concat(o, "."));
            break;
        }
        case "dOps":
            {
                var i = this.currentTrack;
                m(i && ((_j = i.info) === null || _j === void 0 ? void 0 : _j.type) === "audio"), this.metadataReader.pos += 1;
                var n = this.metadataReader.readU8(), a = this.metadataReader.readU16(), o = this.metadataReader.readU32(), c = this.metadataReader.readI16(), l = this.metadataReader.readU8(), d = void 0;
                l !== 0 ? d = this.metadataReader.readBytes(2 + n) : d = new Uint8Array(0);
                var u = new Uint8Array(19 + d.byteLength), f = new DataView(u.buffer);
                f.setUint32(0, 1332770163, !1), f.setUint32(4, 1214603620, !1), f.setUint8(8, 1), f.setUint8(9, n), f.setUint16(10, a, !0), f.setUint32(12, o, !0), f.setInt16(16, c, !0), f.setUint8(18, l), u.set(d, 19), i.info.codecDescription = u, i.info.numberOfChannels = n, i.info.sampleRate = o;
            }
            break;
        case "dfLa":
            {
                var i = this.currentTrack;
                m(i && ((_k = i.info) === null || _k === void 0 ? void 0 : _k.type) === "audio"), this.metadataReader.pos += 4;
                var n = 127, a = 128, o = this.metadataReader.pos;
                for (; this.metadataReader.pos < s;) {
                    var f = this.metadataReader.readU8(), h = this.metadataReader.readU24();
                    if ((f & n) === 0) {
                        this.metadataReader.pos += 10;
                        var w = this.metadataReader.readU32(), g = w >>> 12, T = (w >> 9 & 7) + 1;
                        i.info.sampleRate = g, i.info.numberOfChannels = T, this.metadataReader.pos += 20;
                    }
                    else
                        this.metadataReader.pos += h;
                    if (f & a)
                        break;
                }
                var c = this.metadataReader.pos;
                this.metadataReader.pos = o;
                var l = this.metadataReader.readBytes(c - o), d = new Uint8Array(4 + l.byteLength);
                new DataView(d.buffer).setUint32(0, 1716281667, !1), d.set(l, 4), i.info.codecDescription = d;
            }
            break;
        case "stts":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32(), a = 0, o = 0;
                for (var c = 0; c < n; c++) {
                    var l = this.metadataReader.readU32(), d = this.metadataReader.readU32();
                    i.sampleTable.sampleTimingEntries.push({ startIndex: a, startDecodeTimestamp: o, count: l, delta: d }), a += l, o += l * d;
                }
            }
            break;
        case "ctts":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32(), a = 0;
                for (var o = 0; o < n; o++) {
                    var c = this.metadataReader.readU32(), l = this.metadataReader.readI32();
                    i.sampleTable.sampleCompositionTimeOffsets.push({ startIndex: a, count: c, offset: l }), a += c;
                }
            }
            break;
        case "stsz":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32(), a = this.metadataReader.readU32();
                if (n === 0)
                    for (var o = 0; o < a; o++) {
                        var c = this.metadataReader.readU32();
                        i.sampleTable.sampleSizes.push(c);
                    }
                else
                    i.sampleTable.sampleSizes.push(n);
            }
            break;
        case "stz2": throw new Error("Unsupported.");
        case "stss":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4, i.sampleTable.keySampleIndices = [];
                var n = this.metadataReader.readU32();
                for (var a = 0; a < n; a++) {
                    var o = this.metadataReader.readU32() - 1;
                    i.sampleTable.keySampleIndices.push(o);
                }
            }
            break;
        case "stsc":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32();
                for (var o = 0; o < n; o++) {
                    var c = this.metadataReader.readU32() - 1, l = this.metadataReader.readU32(), d = this.metadataReader.readU32();
                    i.sampleTable.sampleToChunk.push({ startSampleIndex: -1, startChunkIndex: c, samplesPerChunk: l, sampleDescriptionIndex: d });
                }
                var a = 0;
                for (var o = 0; o < i.sampleTable.sampleToChunk.length; o++)
                    if (i.sampleTable.sampleToChunk[o].startSampleIndex = a, o < i.sampleTable.sampleToChunk.length - 1) {
                        var l = i.sampleTable.sampleToChunk[o + 1].startChunkIndex - i.sampleTable.sampleToChunk[o].startChunkIndex;
                        a += l * i.sampleTable.sampleToChunk[o].samplesPerChunk;
                    }
            }
            break;
        case "stco":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32();
                for (var a = 0; a < n; a++) {
                    var o = this.metadataReader.readU32();
                    i.sampleTable.chunkOffsets.push(o);
                }
            }
            break;
        case "co64":
            {
                var i = this.currentTrack;
                if (m(i), !i.sampleTable)
                    break;
                this.metadataReader.pos += 4;
                var n = this.metadataReader.readU32();
                for (var a = 0; a < n; a++) {
                    var o = this.metadataReader.readU64();
                    i.sampleTable.chunkOffsets.push(o);
                }
            }
            break;
        case "mvex":
            this.isFragmented = !0, this.readContiguousBoxes(t.contentSize);
            break;
        case "mehd":
            {
                var i = this.metadataReader.readU8();
                this.metadataReader.pos += 3;
                var n = i === 1 ? this.metadataReader.readU64() : this.metadataReader.readU32();
                this.movieDurationInTimescale = n;
            }
            break;
        case "trex":
            {
                this.metadataReader.pos += 4;
                var i = this.metadataReader.readU32(), n = this.metadataReader.readU32(), a = this.metadataReader.readU32(), o = this.metadataReader.readU32(), c = this.metadataReader.readU32();
                this.fragmentTrackDefaults.push({ trackId: i, defaultSampleDescriptionIndex: n, defaultSampleDuration: a, defaultSampleSize: o, defaultSampleFlags: c });
            }
            break;
        case "tfra":
            {
                var i = this.metadataReader.readU8();
                this.metadataReader.pos += 3;
                var n_5 = this.metadataReader.readU32(), a = this.tracks.find(function (T) { return T.id === n_5; });
                if (!a)
                    break;
                a.fragmentLookupTable = [];
                var o = this.metadataReader.readU32(), c = (o & 48) >> 4, l = (o & 12) >> 2, d = o & 3, u = this.metadataReader, f = [u.readU8.bind(u), u.readU16.bind(u), u.readU24.bind(u), u.readU32.bind(u)], h = f[c], p = f[l], w = f[d], g = this.metadataReader.readU32();
                for (var T = 0; T < g; T++) {
                    var S = i === 1 ? this.metadataReader.readU64() : this.metadataReader.readU32(), E = i === 1 ? this.metadataReader.readU64() : this.metadataReader.readU32(), y = h(), b = p(), x = w();
                    a.fragmentLookupTable.push({ timestamp: S, moofOffset: E });
                }
            }
            break;
        case "moof":
            {
                this.currentFragment = { moofOffset: e, moofSize: t.totalSize, implicitBaseDataOffset: e, trackData: new Map, dataStart: 1 / 0, dataEnd: 0, nextFragment: null, isKnownToBeFirstFragment: !1 }, this.readContiguousBoxes(t.contentSize);
                var i = O(this.fragments, this.currentFragment.moofOffset, function (n) { return n.moofOffset; });
                this.fragments.splice(i + 1, 0, this.currentFragment);
                for (var _q = 0, _u = this.currentFragment.trackData; _q < _u.length; _q++) {
                    var _v = _u[_q], n = _v[1];
                    var a = n.samples[0], o = U(n.samples);
                    this.currentFragment.dataStart = Math.min(this.currentFragment.dataStart, a.byteOffset), this.currentFragment.dataEnd = Math.max(this.currentFragment.dataEnd, o.byteOffset + o.byteSize);
                }
                this.currentFragment = null;
            }
            break;
        case "traf":
            if (m(this.currentFragment), this.readContiguousBoxes(t.contentSize), this.currentTrack) {
                var i = this.currentFragment.trackData.get(this.currentTrack.id);
                if (i) {
                    var n = O(this.currentTrack.fragments, this.currentFragment.moofOffset, function (o) { return o.moofOffset; });
                    this.currentTrack.fragments.splice(n + 1, 0, this.currentFragment);
                    var a = this.currentTrack.currentFragmentState;
                    m(a), a.startTimestamp !== null && (gn(i, a.startTimestamp), i.startTimestampIsFinal = !0);
                }
                this.currentTrack.currentFragmentState = null, this.currentTrack = null;
            }
            break;
        case "tfhd":
            {
                m(this.currentFragment), this.metadataReader.pos += 1;
                var i = this.metadataReader.readU24(), n = !!(i & 1), a = !!(i & 2), o = !!(i & 8), c = !!(i & 16), l = !!(i & 32), d = !!(i & 65536), u = !!(i & 131072), f_1 = this.metadataReader.readU32(), h = this.tracks.find(function (w) { return w.id === f_1; });
                if (!h)
                    break;
                var p = this.fragmentTrackDefaults.find(function (w) { return w.trackId === f_1; });
                this.currentTrack = h, h.currentFragmentState = { baseDataOffset: this.currentFragment.implicitBaseDataOffset, sampleDescriptionIndex: (_l = p === null || p === void 0 ? void 0 : p.defaultSampleDescriptionIndex) !== null && _l !== void 0 ? _l : null, defaultSampleDuration: (_m = p === null || p === void 0 ? void 0 : p.defaultSampleDuration) !== null && _m !== void 0 ? _m : null, defaultSampleSize: (_o = p === null || p === void 0 ? void 0 : p.defaultSampleSize) !== null && _o !== void 0 ? _o : null, defaultSampleFlags: (_p = p === null || p === void 0 ? void 0 : p.defaultSampleFlags) !== null && _p !== void 0 ? _p : null, startTimestamp: null }, n ? h.currentFragmentState.baseDataOffset = this.metadataReader.readU64() : u && (h.currentFragmentState.baseDataOffset = this.currentFragment.moofOffset), a && (h.currentFragmentState.sampleDescriptionIndex = this.metadataReader.readU32()), o && (h.currentFragmentState.defaultSampleDuration = this.metadataReader.readU32()), c && (h.currentFragmentState.defaultSampleSize = this.metadataReader.readU32()), l && (h.currentFragmentState.defaultSampleFlags = this.metadataReader.readU32()), d && (h.currentFragmentState.defaultSampleDuration = 0);
            }
            break;
        case "tfdt":
            {
                var i = this.currentTrack;
                if (!i)
                    break;
                m(i.currentFragmentState);
                var n = this.metadataReader.readU8();
                this.metadataReader.pos += 3;
                var a = n === 0 ? this.metadataReader.readU32() : this.metadataReader.readU64();
                i.currentFragmentState.startTimestamp = a;
            }
            break;
        case "trun":
            {
                var i = this.currentTrack;
                if (!i)
                    break;
                if (m(this.currentFragment), m(i.currentFragmentState), this.currentFragment.trackData.has(i.id))
                    throw new Error("Can't have two trun boxes for the same track in one fragment.");
                var n = this.metadataReader.readU8(), a = this.metadataReader.readU24(), o = !!(a & 1), c = !!(a & 4), l = !!(a & 256), d = !!(a & 512), u = !!(a & 1024), f = !!(a & 2048), h = this.metadataReader.readU32(), p = i.currentFragmentState.baseDataOffset;
                o && (p += this.metadataReader.readI32());
                var w = null;
                c && (w = this.metadataReader.readU32());
                var g = p;
                if (h === 0) {
                    this.currentFragment.implicitBaseDataOffset = g;
                    break;
                }
                var T = 0, S = { startTimestamp: 0, endTimestamp: 0, samples: [], presentationTimestamps: [], startTimestampIsFinal: !1 };
                this.currentFragment.trackData.set(i.id, S);
                for (var b = 0; b < h; b++) {
                    var x = void 0;
                    l ? x = this.metadataReader.readU32() : (m(i.currentFragmentState.defaultSampleDuration !== null), x = i.currentFragmentState.defaultSampleDuration);
                    var C = void 0;
                    d ? C = this.metadataReader.readU32() : (m(i.currentFragmentState.defaultSampleSize !== null), C = i.currentFragmentState.defaultSampleSize);
                    var A = void 0;
                    u ? A = this.metadataReader.readU32() : (m(i.currentFragmentState.defaultSampleFlags !== null), A = i.currentFragmentState.defaultSampleFlags), b === 0 && w !== null && (A = w);
                    var I = 0;
                    f && (n === 0 ? I = this.metadataReader.readU32() : I = this.metadataReader.readI32());
                    var R = !(A & 65536);
                    S.samples.push({ presentationTimestamp: T + I, duration: x, byteOffset: g, byteSize: C, isKeyFrame: R }), g += C, T += x;
                }
                S.presentationTimestamps = S.samples.map(function (b, x) { return ({ presentationTimestamp: b.presentationTimestamp, sampleIndex: x }); }).sort(function (b, x) { return b.presentationTimestamp - x.presentationTimestamp; });
                for (var b = 0; b < S.presentationTimestamps.length - 1; b++) {
                    var x = S.presentationTimestamps[b], A = S.presentationTimestamps[b + 1].presentationTimestamp - x.presentationTimestamp;
                    S.samples[x.sampleIndex].duration = A;
                }
                var E = S.samples[S.presentationTimestamps[0].sampleIndex], y = S.samples[U(S.presentationTimestamps).sampleIndex];
                S.startTimestamp = E.presentationTimestamp, S.endTimestamp = y.presentationTimestamp + y.duration, this.currentFragment.implicitBaseDataOffset = g;
            }
            break;
    } this.metadataReader.pos = s; };
    return class_43;
}(de)), Yr = /** @class */ (function () {
    function class_44(e) {
        this.internalTrack = e, this.packetToSampleIndex = new WeakMap, this.packetToFragmentLocation = new WeakMap;
    }
    class_44.prototype.getId = function () { return this.internalTrack.id; };
    class_44.prototype.getCodec = function () { throw new Error("Not implemented on base class."); };
    class_44.prototype.getLanguageCode = function () { return this.internalTrack.languageCode; };
    class_44.prototype.getTimeResolution = function () { return this.internalTrack.timescale; };
    class_44.prototype.computeDuration = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.getPacket(1 / 0, { metadataOnly: !0 })];
                case 1:
                    e = _d.sent();
                    return [2 /*return*/, ((_b = e === null || e === void 0 ? void 0 : e.timestamp) !== null && _b !== void 0 ? _b : 0) + ((_c = e === null || e === void 0 ? void 0 : e.duration) !== null && _c !== void 0 ? _c : 0)];
            }
        }); });
    };
    class_44.prototype.getFirstTimestamp = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.getFirstPacket({ metadataOnly: !0 })];
                case 1: return [2 /*return*/, (_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.timestamp) !== null && _c !== void 0 ? _c : 0];
            }
        }); });
    };
    class_44.prototype.getFirstPacket = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, this.internalTrack.demuxer.isFragmented ? this.performFragmentedLookup(function () { var _b; var t = (_b = _this.internalTrack.demuxer.fragments[0]) !== null && _b !== void 0 ? _b : null; if (t === null || t === void 0 ? void 0 : t.isKnownToBeFirstFragment) {
                        var s = t;
                        for (; s;) {
                            if (s.trackData.get(_this.internalTrack.id))
                                return { fragmentIndex: L(_this.internalTrack.fragments, s.moofOffset, function (n) { return n.moofOffset; }), sampleIndex: 0, correctSampleFound: !0 };
                            s = s.nextFragment;
                        }
                    } return { fragmentIndex: -1, sampleIndex: -1, correctSampleFound: !1 }; }, -1 / 0, 1 / 0, e) : this.fetchPacketForSampleIndex(0, e)];
            });
        });
    };
    class_44.prototype.mapTimestampIntoTimescale = function (e) { return Xe(e * this.internalTrack.timescale, 14) + this.internalTrack.editListOffset; };
    class_44.prototype.getPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, n;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.mapTimestampIntoTimescale(e);
                if (this.internalTrack.demuxer.isFragmented)
                    return [2 /*return*/, this.performFragmentedLookup(function () { return _this.findSampleInFragmentsForTimestamp(s); }, s, s, t)];
                {
                    i = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), n = pn(i, s);
                    return [2 /*return*/, this.fetchPacketForSampleIndex(n, t)];
                }
                return [2 /*return*/];
            });
        });
    };
    class_44.prototype.getNextPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var i_4, n_6, a, o_2, s;
            var _this = this;
            return __generator(this, function (_b) {
                if (this.internalTrack.demuxer.isFragmented) {
                    i_4 = this.packetToFragmentLocation.get(e);
                    if (i_4 === void 0)
                        throw new Error("Packet was not created from this track.");
                    n_6 = i_4.fragment.trackData.get(this.internalTrack.id), a = n_6.samples[i_4.sampleIndex], o_2 = L(this.internalTrack.fragments, i_4.fragment.moofOffset, function (c) { return c.moofOffset; });
                    return [2 /*return*/, (m(o_2 !== -1), this.performFragmentedLookup(function () { if (i_4.sampleIndex + 1 < n_6.samples.length)
                            return { fragmentIndex: o_2, sampleIndex: i_4.sampleIndex + 1, correctSampleFound: !0 }; {
                            var c = i_4.fragment;
                            for (; c.nextFragment;)
                                if (c = c.nextFragment, c.trackData.get(_this.internalTrack.id)) {
                                    var d = L(_this.internalTrack.fragments, c.moofOffset, function (u) { return u.moofOffset; });
                                    return m(d !== -1), { fragmentIndex: d, sampleIndex: 0, correctSampleFound: !0 };
                                }
                            return { fragmentIndex: o_2, sampleIndex: -1, correctSampleFound: !1 };
                        } }, a.presentationTimestamp, 1 / 0, t))];
                }
                s = this.packetToSampleIndex.get(e);
                if (s === void 0)
                    throw new Error("Packet was not created from this track.");
                return [2 /*return*/, this.fetchPacketForSampleIndex(s + 1, t)];
            });
        });
    };
    class_44.prototype.getKeyPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, n, a;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.mapTimestampIntoTimescale(e);
                if (this.internalTrack.demuxer.isFragmented)
                    return [2 /*return*/, this.performFragmentedLookup(function () { return _this.findKeySampleInFragmentsForTimestamp(s); }, s, s, t)];
                i = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), n = pn(i, s), a = n === -1 ? -1 : po(i, n);
                return [2 /*return*/, this.fetchPacketForSampleIndex(a, t)];
            });
        });
    };
    class_44.prototype.getNextKeyPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var a_3, o_3, c, l_1, s, i, n;
            var _this = this;
            return __generator(this, function (_b) {
                if (this.internalTrack.demuxer.isFragmented) {
                    a_3 = this.packetToFragmentLocation.get(e);
                    if (a_3 === void 0)
                        throw new Error("Packet was not created from this track.");
                    o_3 = a_3.fragment.trackData.get(this.internalTrack.id), c = o_3.samples[a_3.sampleIndex], l_1 = L(this.internalTrack.fragments, a_3.fragment.moofOffset, function (d) { return d.moofOffset; });
                    return [2 /*return*/, (m(l_1 !== -1), this.performFragmentedLookup(function () { var d = o_3.samples.findIndex(function (u, f) { return u.isKeyFrame && f > a_3.sampleIndex; }); if (d !== -1)
                            return { fragmentIndex: l_1, sampleIndex: d, correctSampleFound: !0 }; {
                            var u = a_3.fragment;
                            for (; u.nextFragment;) {
                                u = u.nextFragment;
                                var f = u.trackData.get(_this.internalTrack.id);
                                if (f) {
                                    var h = L(_this.internalTrack.fragments, u.moofOffset, function (w) { return w.moofOffset; });
                                    m(h !== -1);
                                    var p = f.samples.findIndex(function (w) { return w.isKeyFrame; });
                                    if (p === -1)
                                        throw new Error("Not supported: Fragment does not contain key sample.");
                                    return { fragmentIndex: h, sampleIndex: p, correctSampleFound: !0 };
                                }
                            }
                            return { fragmentIndex: l_1, sampleIndex: -1, correctSampleFound: !1 };
                        } }, c.presentationTimestamp, 1 / 0, t))];
                }
                s = this.packetToSampleIndex.get(e);
                if (s === void 0)
                    throw new Error("Packet was not created from this track.");
                i = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), n = go(i, s);
                return [2 /*return*/, this.fetchPacketForSampleIndex(n, t)];
            });
        });
    };
    class_44.prototype.fetchPacketForSampleIndex = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, _b, a, o, c; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (e === -1)
                        return [2 /*return*/, null];
                    s = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), i = fo(s, e);
                    if (!i)
                        return [2 /*return*/, null];
                    if (!t.metadataOnly) return [3 /*break*/, 1];
                    _b = n = te;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, this.internalTrack.demuxer.chunkReader.reader.loadRange(i.chunkOffset, i.chunkOffset + i.chunkSize)];
                case 2:
                    _b = (_c.sent(), this.internalTrack.demuxer.chunkReader.pos = i.sampleOffset, n = this.internalTrack.demuxer.chunkReader.readBytes(i.sampleSize));
                    _c.label = 3;
                case 3:
                    _b;
                    a = (i.presentationTimestamp - this.internalTrack.editListOffset) / this.internalTrack.timescale, o = i.duration / this.internalTrack.timescale, c = new D(n, i.isKeyFrame ? "key" : "delta", a, o, e, i.sampleSize);
                    return [2 /*return*/, (this.packetToSampleIndex.set(c, e), c)];
            }
        }); });
    };
    class_44.prototype.fetchPacketInFragment = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var n, a, _b, o, c, l; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (t === -1)
                        return [2 /*return*/, null];
                    n = e.trackData.get(this.internalTrack.id).samples[t];
                    m(n);
                    if (!s.metadataOnly) return [3 /*break*/, 1];
                    _b = a = te;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, this.internalTrack.demuxer.chunkReader.reader.loadRange(e.dataStart, e.dataEnd)];
                case 2:
                    _b = (_c.sent(), this.internalTrack.demuxer.chunkReader.pos = n.byteOffset, a = this.internalTrack.demuxer.chunkReader.readBytes(n.byteSize));
                    _c.label = 3;
                case 3:
                    _b;
                    o = (n.presentationTimestamp - this.internalTrack.editListOffset) / this.internalTrack.timescale, c = n.duration / this.internalTrack.timescale, l = new D(a, n.isKeyFrame ? "key" : "delta", o, c, e.moofOffset + t, n.byteSize);
                    return [2 /*return*/, (this.packetToFragmentLocation.set(l, { fragment: e, sampleIndex: t }), l)];
            }
        }); });
    };
    class_44.prototype.findSampleInFragmentsForTimestamp = function (e) {
        var _this = this;
        var t = O(this.internalTrack.fragments, e, function (n) { return n.trackData.get(_this.internalTrack.id).startTimestamp; }), s = -1, i = !1;
        if (t !== -1) {
            var a = this.internalTrack.fragments[t].trackData.get(this.internalTrack.id), o = O(a.presentationTimestamps, e, function (c) { return c.presentationTimestamp; });
            m(o !== -1), s = a.presentationTimestamps[o].sampleIndex, i = e < a.endTimestamp;
        }
        return { fragmentIndex: t, sampleIndex: s, correctSampleFound: i };
    };
    class_44.prototype.findKeySampleInFragmentsForTimestamp = function (e) {
        var _this = this;
        var t = O(this.internalTrack.fragments, e, function (n) { return n.trackData.get(_this.internalTrack.id).startTimestamp; }), s = -1, i = !1;
        if (t !== -1) {
            var a_4 = this.internalTrack.fragments[t].trackData.get(this.internalTrack.id), o = Zt(a_4.presentationTimestamps, function (l) { return a_4.samples[l.sampleIndex].isKeyFrame && l.presentationTimestamp <= e; });
            if (o === -1)
                throw new Error("Not supported: Fragment does not begin with a key sample.");
            s = a_4.presentationTimestamps[o].sampleIndex, i = e < a_4.endTimestamp;
        }
        return { fragmentIndex: t, sampleIndex: s, correctSampleFound: i };
    };
    class_44.prototype.performFragmentedLookup = function (e, t, s, i) {
        var _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () { var n, a, _f, o, c, l, y, d, u, f, h, p, w, g, T, y, x, y, b, x, C, _g, _h, A, I, R, v, S, E, _j, b; return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    n = this.internalTrack.demuxer;
                    return [4 /*yield*/, n.fragmentLookupMutex.acquire()];
                case 1:
                    a = _k.sent();
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, , 14, 15]);
                    _f = e(), o = _f.fragmentIndex, c = _f.sampleIndex, l = _f.correctSampleFound;
                    if (l) {
                        y = this.internalTrack.fragments[o];
                        return [2 /*return*/, this.fetchPacketInFragment(y, c, i)];
                    }
                    d = n.metadataReader;
                    return [4 /*yield*/, d.reader.source.getSize()];
                case 3:
                    u = _k.sent(), f = null, h = o, p = c, w = this.internalTrack.fragmentLookupTable ? O(this.internalTrack.fragmentLookupTable, t, function (y) { return y.timestamp; }) : -1, g = w !== -1 ? this.internalTrack.fragmentLookupTable[w] : null, T = !1;
                    if (o === -1)
                        d.pos = (_b = g === null || g === void 0 ? void 0 : g.moofOffset) !== null && _b !== void 0 ? _b : 0, T = d.pos === 0;
                    else {
                        y = this.internalTrack.fragments[o];
                        !g || y.moofOffset >= g.moofOffset ? (d.pos = y.moofOffset + y.moofSize, f = y) : d.pos = g.moofOffset;
                    }
                    _k.label = 4;
                case 4:
                    if (!(d.pos < u)) return [3 /*break*/, 11];
                    if (f) {
                        x = f.trackData.get(this.internalTrack.id);
                        if (x && x.startTimestamp > s)
                            return [3 /*break*/, 11];
                        if (f.nextFragment) {
                            d.pos = f.nextFragment.moofOffset + f.nextFragment.moofSize, f = f.nextFragment;
                            return [3 /*break*/, 10];
                        }
                    }
                    return [4 /*yield*/, d.reader.loadRange(d.pos, d.pos + 16)];
                case 5:
                    _k.sent();
                    y = d.pos, b = d.readBoxHeader();
                    if (!(b.name === "moof")) return [3 /*break*/, 9];
                    x = L(n.fragments, y, function (v) { return v.moofOffset; }), C = void 0;
                    if (!(x === -1)) return [3 /*break*/, 7];
                    d.pos = y;
                    return [4 /*yield*/, n.readFragment()];
                case 6:
                    _g = (C = _k.sent());
                    return [3 /*break*/, 8];
                case 7:
                    _g = C = n.fragments[x];
                    _k.label = 8;
                case 8:
                    _g, f && (f.nextFragment = C), f = C, T && (C.isKnownToBeFirstFragment = !0, T = !1);
                    _h = e(), A = _h.fragmentIndex, I = _h.sampleIndex, R = _h.correctSampleFound;
                    if (R) {
                        v = this.internalTrack.fragments[A];
                        return [2 /*return*/, this.fetchPacketInFragment(v, I, i)];
                    }
                    A !== -1 && (h = A, p = I);
                    _k.label = 9;
                case 9:
                    d.pos = y + b.totalSize;
                    _k.label = 10;
                case 10: return [3 /*break*/, 4];
                case 11:
                    S = null, E = h !== -1 ? this.internalTrack.fragments[h] : null;
                    _j = E;
                    if (!_j) return [3 /*break*/, 13];
                    return [4 /*yield*/, this.fetchPacketInFragment(E, p, i)];
                case 12:
                    _j = (S = _k.sent());
                    _k.label = 13;
                case 13:
                    if (_j, !S && g && (!E || E.moofOffset < g.moofOffset)) {
                        b = (_d = (_c = this.internalTrack.fragmentLookupTable[w - 1]) === null || _c === void 0 ? void 0 : _c.timestamp) !== null && _d !== void 0 ? _d : -1 / 0;
                        return [2 /*return*/, this.performFragmentedLookup(e, b, s, i)];
                    }
                    return [2 /*return*/, S];
                case 14:
                    a();
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        }); });
    };
    return class_44;
}()), ri = /** @class */ (function (_super) {
    __extends(class_45, _super);
    function class_45(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.decoderConfigPromise = null, _this.internalTrack = e;
        return _this;
    }
    class_45.prototype.getCodec = function () { return this.internalTrack.info.codec; };
    class_45.prototype.getCodedWidth = function () { return this.internalTrack.info.width; };
    class_45.prototype.getCodedHeight = function () { return this.internalTrack.info.height; };
    class_45.prototype.getRotation = function () { return this.internalTrack.rotation; };
    class_45.prototype.getColorSpace = function () {
        var _b, _c, _d, _f;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_g) {
            return [2 /*return*/, { primaries: (_b = this.internalTrack.info.colorSpace) === null || _b === void 0 ? void 0 : _b.primaries, transfer: (_c = this.internalTrack.info.colorSpace) === null || _c === void 0 ? void 0 : _c.transfer, matrix: (_d = this.internalTrack.info.colorSpace) === null || _d === void 0 ? void 0 : _d.matrix, fullRange: (_f = this.internalTrack.info.colorSpace) === null || _f === void 0 ? void 0 : _f.fullRange }];
        }); });
    };
    class_45.prototype.getDecoderConfig = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, this.internalTrack.info.codec ? (_b = this.decoderConfigPromise) !== null && _b !== void 0 ? _b : (this.decoderConfigPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, e; var _b, _c; return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (!(this.internalTrack.info.codec === "vp9" && !this.internalTrack.info.vp9CodecInfo)) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.getFirstPacket({})];
                            case 1:
                                e = _d.sent();
                                this.internalTrack.info.vp9CodecInfo = e && xr(e.data);
                                return [3 /*break*/, 4];
                            case 2:
                                if (!(this.internalTrack.info.codec === "av1" && !this.internalTrack.info.av1CodecInfo)) return [3 /*break*/, 4];
                                return [4 /*yield*/, this.getFirstPacket({})];
                            case 3:
                                e = _d.sent();
                                this.internalTrack.info.av1CodecInfo = e && yr(e.data);
                                _d.label = 4;
                            case 4: return [2 /*return*/, { codec: dr(this.internalTrack.info), codedWidth: this.internalTrack.info.width, codedHeight: this.internalTrack.info.height, description: (_b = this.internalTrack.info.codecDescription) !== null && _b !== void 0 ? _b : void 0, colorSpace: (_c = this.internalTrack.info.colorSpace) !== null && _c !== void 0 ? _c : void 0 }];
                        }
                    }); }); })()) : null];
            });
        });
    };
    return class_45;
}(Yr)), si = /** @class */ (function (_super) {
    __extends(class_46, _super);
    function class_46(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.decoderConfig = null, _this.internalTrack = e;
        return _this;
    }
    class_46.prototype.getCodec = function () { return this.internalTrack.info.codec; };
    class_46.prototype.getNumberOfChannels = function () { return this.internalTrack.info.numberOfChannels; };
    class_46.prototype.getSampleRate = function () { return this.internalTrack.info.sampleRate; };
    class_46.prototype.getDecoderConfig = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            return [2 /*return*/, this.internalTrack.info.codec ? (_b = this.decoderConfig) !== null && _b !== void 0 ? _b : (this.decoderConfig = { codec: lr(this.internalTrack.info), numberOfChannels: this.internalTrack.info.numberOfChannels, sampleRate: this.internalTrack.info.sampleRate, description: (_c = this.internalTrack.info.codecDescription) !== null && _c !== void 0 ? _c : void 0 }) : null];
        }); });
    };
    return class_46;
}(Yr)), pn = function (r, e) { if (r.presentationTimestamps) {
    var t = O(r.presentationTimestamps, e, function (s) { return s.presentationTimestamp; });
    return t === -1 ? -1 : r.presentationTimestamps[t].sampleIndex;
}
else {
    var t = O(r.sampleTimingEntries, e, function (i) { return i.startDecodeTimestamp; });
    if (t === -1)
        return -1;
    var s = r.sampleTimingEntries[t];
    return s.startIndex + Math.min(Math.floor((e - s.startDecodeTimestamp) / s.delta), s.count - 1);
} }, fo = function (r, e) { var t = O(r.sampleTimingEntries, e, function (T) { return T.startIndex; }), s = r.sampleTimingEntries[t]; if (!s || s.startIndex + s.count <= e)
    return null; var n = s.startDecodeTimestamp + (e - s.startIndex) * s.delta, a = O(r.sampleCompositionTimeOffsets, e, function (T) { return T.startIndex; }), o = r.sampleCompositionTimeOffsets[a]; o && e - o.startIndex < o.count && (n += o.offset); var c = r.sampleSizes[Math.min(e, r.sampleSizes.length - 1)], l = O(r.sampleToChunk, e, function (T) { return T.startSampleIndex; }), d = r.sampleToChunk[l]; m(d); var u = d.startChunkIndex + Math.floor((e - d.startSampleIndex) / d.samplesPerChunk), f = r.chunkOffsets[u], h = d.startSampleIndex + (u - d.startChunkIndex) * d.samplesPerChunk, p = 0, w = f; if (r.sampleSizes.length === 1)
    w += c * (e - h), p += c * d.samplesPerChunk;
else
    for (var T = h; T < h + d.samplesPerChunk; T++) {
        var S = r.sampleSizes[T];
        T < e && (w += S), p += S;
    } var g = s.delta; if (r.presentationTimestamps) {
    var T = r.presentationTimestampIndexMap[e];
    m(T !== void 0), T < r.presentationTimestamps.length - 1 && (g = r.presentationTimestamps[T + 1].presentationTimestamp - n);
} return { presentationTimestamp: n, duration: g, sampleOffset: w, sampleSize: c, chunkOffset: f, chunkSize: p, isKeyFrame: r.keySampleIndices ? L(r.keySampleIndices, e, function (T) { return T; }) !== -1 : !0 }; }, po = function (r, e) { var _b; if (!r.keySampleIndices)
    return e; var t = O(r.keySampleIndices, e, function (s) { return s; }); return (_b = r.keySampleIndices[t]) !== null && _b !== void 0 ? _b : -1; }, go = function (r, e) { var _b; if (!r.keySampleIndices)
    return e + 1; var t = O(r.keySampleIndices, e, function (s) { return s; }); return (_b = r.keySampleIndices[t + 1]) !== null && _b !== void 0 ? _b : -1; }, gn = function (r, e) { r.startTimestamp += e, r.endTimestamp += e; for (var _b = 0, _c = r.samples; _b < _c.length; _b++) {
    var t = _c[_b];
    t.presentationTimestamp += e;
} for (var _d = 0, _f = r.presentationTimestamps; _d < _f.length; _d++) {
    var t = _f[_d];
    t.presentationTimestamp += e;
} }, wo = function (r) { var e = r[0], t = r[3], s = Math.hypot(e, t), i = e / s, n = t / s; return -Math.atan2(n, i) * (180 / Math.PI); };
var ii = [{ id: k.SeekHead, flag: "seekHeadSeen" }, { id: k.Info, flag: "infoSeen" }, { id: k.Tracks, flag: "tracksSeen" }, { id: k.Cues, flag: "cuesSeen" }], Zr = /** @class */ (function (_super) {
    __extends(class_47, _super);
    function class_47(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.readMetadataPromise = null, _this.segments = [], _this.currentSegment = null, _this.currentTrack = null, _this.currentCluster = null, _this.currentBlock = null, _this.currentCueTime = null, _this.isWebM = !1, _this.metadataReader = new We(e._mainReader), _this.clusterReader = new We(new ue(e.source, 64 * Math.pow(2, 20)));
        return _this;
    }
    class_47.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1:
                    e = _b.sent();
                    return [4 /*yield*/, Promise.all(e.map(function (s) { return s.computeDuration(); }))];
                case 2:
                    t = _b.sent();
                    return [2 /*return*/, Math.max.apply(Math, __spreadArray([0], t, false))];
            }
        }); });
    };
    class_47.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), this.segments.flatMap(function (e) { return e.tracks.map(function (t) { return t.inputTrack; }); }))];
            }
        }); });
    };
    class_47.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, this.getTracks()];
                case 2:
                    e = _b.sent();
                    return [4 /*yield*/, Promise.all(e.map(function (s) { return s.getCodecParameterString(); }))];
                case 3:
                    t = _b.sent();
                    return [2 /*return*/, Fr({ isWebM: this.isWebM, hasVideo: this.segments.some(function (s) { return s.tracks.some(function (i) { var _b; return ((_b = i.info) === null || _b === void 0 ? void 0 : _b.type) === "video"; }); }), hasAudio: this.segments.some(function (s) { return s.tracks.some(function (i) { var _b; return ((_b = i.info) === null || _b === void 0 ? void 0 : _b.type) === "audio"; }); }), codecStrings: t.filter(Boolean) })];
            }
        }); });
    };
    class_47.prototype.readMetadata = function () {
        var _this = this;
        var _b;
        return (_b = this.readMetadataPromise) !== null && _b !== void 0 ? _b : (this.readMetadataPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, _b, t, s, i, _c; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    this.metadataReader.pos = 0;
                    return [4 /*yield*/, this.input.source.getSize()];
                case 1:
                    e = _d.sent();
                    _d.label = 2;
                case 2:
                    if (!(this.metadataReader.pos < e - As)) return [3 /*break*/, 10];
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + Ne)];
                case 3:
                    _d.sent();
                    _b = this.metadataReader.readElementHeader(), t = _b.id, s = _b.size, i = this.metadataReader.pos;
                    if (!(t === k.EBML)) return [3 /*break*/, 5];
                    Le(s);
                    return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + s)];
                case 4:
                    _d.sent(), this.readContiguousElements(this.metadataReader, s);
                    return [3 /*break*/, 8];
                case 5:
                    _c = t === k.Segment;
                    if (!_c) return [3 /*break*/, 7];
                    return [4 /*yield*/, this.readSegment(s)];
                case 6:
                    _c = (_d.sent(), s === null);
                    _d.label = 7;
                case 7:
                    if (_c)
                        return [3 /*break*/, 10];
                    _d.label = 8;
                case 8:
                    Le(s), this.metadataReader.pos = i + s;
                    _d.label = 9;
                case 9: return [3 /*break*/, 2];
                case 10: return [2 /*return*/];
            }
        }); }); })());
    };
    class_47.prototype.readSegment = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var t, _b, _c, s, _loop_7, this_6, state_5, _loop_8, this_7, _d, ii_1, c, i, n, a, o, _loop_9, this_8, _f, _g, c, _loop_10, this_9, _h, n_7, c, _j, _k, c;
            var _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        t = this.metadataReader.pos;
                        _b = this;
                        _l = { seekHeadSeen: !1, infoSeen: !1, tracksSeen: !1, cuesSeen: !1, timestampScale: -1, timestampFactor: -1, duration: -1, seekEntries: [], tracks: [], cuePoints: [], dataStartPos: t };
                        if (!(e === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.input.source.getSize()];
                    case 1:
                        _c = _m.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _c = t + e;
                        _m.label = 3;
                    case 3:
                        _b.currentSegment = (_l.elementEndPos = _c, _l.clusterSeekStartPos = t, _l.clusters = [], _l.clusterLookupMutex = new ae, _l), this.segments.push(this.currentSegment);
                        return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + Math.pow(2, 14))];
                    case 4:
                        _m.sent();
                        s = !1;
                        _loop_7 = function () {
                            var c, _o, l, d, u, f, h, h, p, w, _p, _q, g;
                            return __generator(this, function (_u) {
                                switch (_u.label) {
                                    case 0: return [4 /*yield*/, this_6.metadataReader.reader.loadRange(this_6.metadataReader.pos, this_6.metadataReader.pos + Ne)];
                                    case 1:
                                        _u.sent();
                                        c = this_6.metadataReader.pos, _o = this_6.metadataReader.readElementHeader(), l = _o.id, d = _o.size, u = this_6.metadataReader.pos, f = ii.findIndex(function (h) { return h.id === l; });
                                        if (!(f !== -1)) return [3 /*break*/, 3];
                                        h = ii[f].flag;
                                        this_6.currentSegment[h] = !0, Le(d);
                                        return [4 /*yield*/, this_6.metadataReader.reader.loadRange(this_6.metadataReader.pos, this_6.metadataReader.pos + d)];
                                    case 2:
                                        _u.sent(), this_6.readContiguousElements(this_6.metadataReader, d);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        l === k.Cluster && (s || (s = !0, this_6.currentSegment.clusterSeekStartPos = c));
                                        _u.label = 4;
                                    case 4:
                                        if (this_6.currentSegment.infoSeen && this_6.currentSegment.tracksSeen && this_6.currentSegment.cuesSeen)
                                            return [2 /*return*/, "break"];
                                        if (this_6.currentSegment.seekHeadSeen) {
                                            h = this_6.currentSegment.infoSeen, p = this_6.currentSegment.tracksSeen, w = this_6.currentSegment.cuesSeen;
                                            for (_p = 0, _q = this_6.currentSegment.seekEntries; _p < _q.length; _p++) {
                                                g = _q[_p];
                                                g.id === k.Info ? h = !0 : g.id === k.Tracks ? p = !0 : g.id === k.Cues && (w = !0);
                                            }
                                            if (h && p && w)
                                                return [2 /*return*/, "break"];
                                        }
                                        if (d === null)
                                            return [2 /*return*/, "break"];
                                        this_6.metadataReader.pos = u + d, s || (this_6.currentSegment.clusterSeekStartPos = this_6.metadataReader.pos);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_6 = this;
                        _m.label = 5;
                    case 5:
                        if (!(this.metadataReader.pos < this.currentSegment.elementEndPos)) return [3 /*break*/, 8];
                        return [5 /*yield**/, _loop_7()];
                    case 6:
                        state_5 = _m.sent();
                        if (state_5 === "break")
                            return [3 /*break*/, 8];
                        _m.label = 7;
                    case 7: return [3 /*break*/, 5];
                    case 8:
                        _loop_8 = function (c) {
                            var l, _v, d, u, _w;
                            return __generator(this, function (_x) {
                                switch (_x.label) {
                                    case 0:
                                        if (this_7.currentSegment[c.flag])
                                            return [2 /*return*/, "continue"];
                                        l = this_7.currentSegment.seekEntries.find(function (f) { return f.id === c.id; });
                                        if (!l)
                                            return [2 /*return*/, "continue"];
                                        this_7.metadataReader.pos = t + l.segmentPosition;
                                        return [4 /*yield*/, this_7.metadataReader.reader.loadRange(this_7.metadataReader.pos, this_7.metadataReader.pos + Math.pow(2, 12))];
                                    case 1:
                                        _x.sent();
                                        _v = this_7.metadataReader.readElementHeader(), d = _v.id, u = _v.size;
                                        _w = d === c.id;
                                        if (!_w) return [3 /*break*/, 3];
                                        Le(u), this_7.currentSegment[c.flag] = !0;
                                        return [4 /*yield*/, this_7.metadataReader.reader.loadRange(this_7.metadataReader.pos, this_7.metadataReader.pos + u)];
                                    case 2:
                                        _w = (_x.sent(), this_7.readContiguousElements(this_7.metadataReader, u));
                                        _x.label = 3;
                                    case 3:
                                        _w;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_7 = this;
                        _d = 0, ii_1 = ii;
                        _m.label = 9;
                    case 9:
                        if (!(_d < ii_1.length)) return [3 /*break*/, 12];
                        c = ii_1[_d];
                        return [5 /*yield**/, _loop_8(c)];
                    case 10:
                        _m.sent();
                        _m.label = 11;
                    case 11:
                        _d++;
                        return [3 /*break*/, 9];
                    case 12:
                        this.currentSegment.tracks.sort(function (c, l) { return Number(l.isDefault) - Number(c.isDefault); }), this.currentSegment.cuePoints.sort(function (c, l) { return c.clusterPosition - l.clusterPosition; });
                        i = this.currentSegment.tracks.map(function (c) { return c.id; }), n = new Set, a = null, o = null;
                        _loop_9 = function (c) {
                            if (c.clusterPosition !== a) {
                                var _loop_11 = function (d) {
                                    m(o), this_8.currentSegment.tracks.find(function (f) { return f.id === d; }).cuePoints.push(o);
                                };
                                for (var _y = 0, n_8 = n; _y < n_8.length; _y++) {
                                    var d = n_8[_y];
                                    _loop_11(d);
                                }
                                for (var _z = 0, i_5 = i; _z < i_5.length; _z++) {
                                    var d = i_5[_z];
                                    n.add(d);
                                }
                            }
                            if (o = c, !n.has(c.trackId))
                                return "continue";
                            this_8.currentSegment.tracks.find(function (d) { return d.id === c.trackId; }).cuePoints.push(c), n.delete(c.trackId), a = c.clusterPosition;
                        };
                        this_8 = this;
                        for (_f = 0, _g = this.currentSegment.cuePoints; _f < _g.length; _f++) {
                            c = _g[_f];
                            _loop_9(c);
                        }
                        _loop_10 = function (c) {
                            m(o), this_9.currentSegment.tracks.find(function (d) { return d.id === c; }).cuePoints.push(o);
                        };
                        this_9 = this;
                        for (_h = 0, n_7 = n; _h < n_7.length; _h++) {
                            c = n_7[_h];
                            _loop_10(c);
                        }
                        for (_j = 0, _k = this.currentSegment.tracks; _j < _k.length; _j++) {
                            c = _k[_j];
                            c.cuePoints.sort(function (l, d) { return l.time - d.time; });
                        }
                        this.currentSegment = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    class_47.prototype.readCluster = function (e) {
        var _b;
        return __awaiter(this, void 0, void 0, function () { var t, s, i, n, a, _c, o, _loop_12, _d, _f, _g, l, d, c; return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, this.metadataReader.reader.loadRange(this.metadataReader.pos, this.metadataReader.pos + Ne)];
                case 1:
                    _h.sent();
                    t = this.metadataReader.pos, s = this.metadataReader.readElementHeader(), i = s.id, n = s.size, a = this.metadataReader.pos;
                    _c = n === null;
                    if (!_c) return [3 /*break*/, 3];
                    this.clusterReader.pos = a;
                    return [4 /*yield*/, this.clusterReader.searchForNextElementId(Rs, e.elementEndPos)];
                case 2:
                    _c = (n = ((_b = _h.sent()) !== null && _b !== void 0 ? _b : e.elementEndPos) - a);
                    _h.label = 3;
                case 3:
                    _c, m(i === k.Cluster), this.clusterReader.pos = a;
                    return [4 /*yield*/, this.clusterReader.reader.loadRange(this.clusterReader.pos, this.clusterReader.pos + n)];
                case 4:
                    _h.sent();
                    o = { elementStartPos: t, elementEndPos: a + n, dataStartPos: a, timestamp: -1, trackData: new Map, nextCluster: null, isKnownToBeFirstCluster: !1 };
                    this.currentCluster = o, this.readContiguousElements(this.clusterReader, n);
                    _loop_12 = function (l, d) {
                        var u = !1;
                        m(d.blocks.length > 0);
                        for (var g = 0; g < d.blocks.length; g++) {
                            var T = d.blocks[g];
                            T.timestamp += o.timestamp, u || (u = T.referencedTimestamps.length > 0);
                        }
                        u && (d.blocks = ko(d.blocks)), d.presentationTimestamps = d.blocks.map(function (g, T) { return ({ timestamp: g.timestamp, blockIndex: T }); }).sort(function (g, T) { return g.timestamp - T.timestamp; });
                        var f = !1;
                        for (var g = 0; g < d.presentationTimestamps.length; g++) {
                            var T = d.presentationTimestamps[g], S = d.blocks[T.blockIndex];
                            if (S.isKeyFrame && (f = !0, d.firstKeyFrameTimestamp === null && S.isKeyFrame && (d.firstKeyFrameTimestamp = S.timestamp)), g < d.presentationTimestamps.length - 1) {
                                var E = d.presentationTimestamps[g + 1], y = d.blocks[E.blockIndex];
                                S.duration = y.timestamp - S.timestamp;
                            }
                        }
                        var h = d.blocks[d.presentationTimestamps[0].blockIndex], p = d.blocks[U(d.presentationTimestamps).blockIndex];
                        d.startTimestamp = h.timestamp, d.endTimestamp = p.timestamp + p.duration;
                        var w = e.tracks.find(function (g) { return g.id === l; });
                        if (w) {
                            var g = O(w.clusters, o.elementStartPos, function (T) { return T.elementStartPos; });
                            if (w.clusters.splice(g + 1, 0, o), f) {
                                var T = O(w.clustersWithKeyFrame, o.elementStartPos, function (S) { return S.elementStartPos; });
                                w.clustersWithKeyFrame.splice(T + 1, 0, o);
                            }
                        }
                    };
                    for (_d = 0, _f = o.trackData; _d < _f.length; _d++) {
                        _g = _f[_d], l = _g[0], d = _g[1];
                        _loop_12(l, d);
                    }
                    c = O(e.clusters, t, function (l) { return l.elementStartPos; });
                    return [2 /*return*/, (e.clusters.splice(c + 1, 0, o), this.currentCluster = null, o)];
            }
        }); });
    };
    class_47.prototype.getTrackDataInCluster = function (e, t) { var s = e.trackData.get(t); return s || (s = { startTimestamp: 0, endTimestamp: 0, firstKeyFrameTimestamp: null, blocks: [], presentationTimestamps: [] }, e.trackData.set(t, s)), s; };
    class_47.prototype.readContiguousElements = function (e, t) { var s = e.pos; for (; e.pos - s < t;)
        this.traverseElement(e); };
    class_47.prototype.traverseElement = function (e) { var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15; var _16 = e.readElementHeader(), t = _16.id, s = _16.size, i = e.pos; switch ((Le(s), t)) {
        case k.DocType:
            this.isWebM = e.readString(s) === "webm";
            break;
        case k.Seek:
            {
                if (!this.currentSegment)
                    break;
                var n = { id: -1, segmentPosition: -1 };
                this.currentSegment.seekEntries.push(n), this.readContiguousElements(e, s), (n.id === -1 || n.segmentPosition === -1) && this.currentSegment.seekEntries.pop();
            }
            break;
        case k.SeekID:
            {
                var n = (_b = this.currentSegment) === null || _b === void 0 ? void 0 : _b.seekEntries[this.currentSegment.seekEntries.length - 1];
                if (!n)
                    break;
                n.id = e.readUnsignedInt(s);
            }
            break;
        case k.SeekPosition:
            {
                var n = (_c = this.currentSegment) === null || _c === void 0 ? void 0 : _c.seekEntries[this.currentSegment.seekEntries.length - 1];
                if (!n)
                    break;
                n.segmentPosition = e.readUnsignedInt(s);
            }
            break;
        case k.TimestampScale:
            {
                if (!this.currentSegment)
                    break;
                this.currentSegment.timestampScale = e.readUnsignedInt(s), this.currentSegment.timestampFactor = 1e9 / this.currentSegment.timestampScale;
            }
            break;
        case k.Duration:
            {
                if (!this.currentSegment)
                    break;
                this.currentSegment.duration = e.readFloat(s);
            }
            break;
        case k.TrackEntry:
            {
                if (!this.currentSegment)
                    break;
                if (this.currentTrack = { id: -1, segment: this.currentSegment, demuxer: this, clusters: [], clustersWithKeyFrame: [], cuePoints: [], isDefault: !1, inputTrack: null, codecId: null, codecPrivate: null, languageCode: J, info: null }, this.readContiguousElements(e, s), this.currentTrack && this.currentTrack.id !== -1 && this.currentTrack.codecId && this.currentTrack.info) {
                    var n = this.currentTrack.codecId.indexOf("/"), a = n === -1 ? this.currentTrack.codecId : this.currentTrack.codecId.slice(0, n);
                    if (this.currentTrack.info.type === "video" && this.currentTrack.info.width !== -1 && this.currentTrack.info.height !== -1) {
                        this.currentTrack.codecId === ie.avc ? (this.currentTrack.info.codec = "avc", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : this.currentTrack.codecId === ie.hevc ? (this.currentTrack.info.codec = "hevc", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : a === ie.vp8 ? this.currentTrack.info.codec = "vp8" : a === ie.vp9 ? this.currentTrack.info.codec = "vp9" : a === ie.av1 && (this.currentTrack.info.codec = "av1");
                        var o = this.currentTrack, c = new he(new ni(o));
                        this.currentTrack.inputTrack = c, this.currentSegment.tracks.push(this.currentTrack);
                    }
                    else if (this.currentTrack.info.type === "audio" && this.currentTrack.info.numberOfChannels !== -1 && this.currentTrack.info.sampleRate !== -1) {
                        a === ie.aac ? (this.currentTrack.info.codec = "aac", this.currentTrack.info.aacCodecInfo = { isMpeg2: this.currentTrack.codecId.includes("MPEG2") }, this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : this.currentTrack.codecId === ie.mp3 ? this.currentTrack.info.codec = "mp3" : a === ie.opus ? (this.currentTrack.info.codec = "opus", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : a === ie.vorbis ? (this.currentTrack.info.codec = "vorbis", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : a === ie.flac ? (this.currentTrack.info.codec = "flac", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : this.currentTrack.codecId === "A_PCM/INT/LIT" ? this.currentTrack.info.bitDepth === 8 ? this.currentTrack.info.codec = "pcm-u8" : this.currentTrack.info.bitDepth === 16 ? this.currentTrack.info.codec = "pcm-s16" : this.currentTrack.info.bitDepth === 24 ? this.currentTrack.info.codec = "pcm-s24" : this.currentTrack.info.bitDepth === 32 && (this.currentTrack.info.codec = "pcm-s32") : this.currentTrack.codecId === "A_PCM/INT/BIG" ? this.currentTrack.info.bitDepth === 8 ? this.currentTrack.info.codec = "pcm-u8" : this.currentTrack.info.bitDepth === 16 ? this.currentTrack.info.codec = "pcm-s16be" : this.currentTrack.info.bitDepth === 24 ? this.currentTrack.info.codec = "pcm-s24be" : this.currentTrack.info.bitDepth === 32 && (this.currentTrack.info.codec = "pcm-s32be") : this.currentTrack.codecId === "A_PCM/FLOAT/IEEE" && (this.currentTrack.info.bitDepth === 32 ? this.currentTrack.info.codec = "pcm-f32" : this.currentTrack.info.bitDepth === 64 && (this.currentTrack.info.codec = "pcm-f64"));
                        var o = this.currentTrack, c = new Y(new ai(o));
                        this.currentTrack.inputTrack = c, this.currentSegment.tracks.push(this.currentTrack);
                    }
                }
                this.currentTrack = null;
            }
            break;
        case k.TrackNumber:
            {
                if (!this.currentTrack)
                    break;
                this.currentTrack.id = e.readUnsignedInt(s);
            }
            break;
        case k.TrackType:
            {
                if (!this.currentTrack)
                    break;
                var n = e.readUnsignedInt(s);
                n === 1 ? this.currentTrack.info = { type: "video", width: -1, height: -1, rotation: 0, codec: null, codecDescription: null, colorSpace: null } : n === 2 && (this.currentTrack.info = { type: "audio", numberOfChannels: -1, sampleRate: -1, bitDepth: -1, codec: null, codecDescription: null, aacCodecInfo: null });
            }
            break;
        case k.FlagEnabled:
            {
                if (!this.currentTrack)
                    break;
                e.readUnsignedInt(s) || (this.currentSegment.tracks.pop(), this.currentTrack = null);
            }
            break;
        case k.FlagDefault:
            {
                if (!this.currentTrack)
                    break;
                this.currentTrack.isDefault = !!e.readUnsignedInt(s);
            }
            break;
        case k.CodecID:
            {
                if (!this.currentTrack)
                    break;
                this.currentTrack.codecId = e.readString(s);
            }
            break;
        case k.CodecPrivate:
            {
                if (!this.currentTrack)
                    break;
                this.currentTrack.codecPrivate = e.readBytes(s);
            }
            break;
        case k.Language:
            {
                if (!this.currentTrack)
                    break;
                this.currentTrack.languageCode = e.readString(s), Ye(this.currentTrack.languageCode) || (this.currentTrack.languageCode = J);
            }
            break;
        case k.Video:
            {
                if (((_f = (_d = this.currentTrack) === null || _d === void 0 ? void 0 : _d.info) === null || _f === void 0 ? void 0 : _f.type) !== "video")
                    break;
                this.readContiguousElements(e, s);
            }
            break;
        case k.PixelWidth:
            {
                if (((_h = (_g = this.currentTrack) === null || _g === void 0 ? void 0 : _g.info) === null || _h === void 0 ? void 0 : _h.type) !== "video")
                    break;
                this.currentTrack.info.width = e.readUnsignedInt(s);
            }
            break;
        case k.PixelHeight:
            {
                if (((_k = (_j = this.currentTrack) === null || _j === void 0 ? void 0 : _j.info) === null || _k === void 0 ? void 0 : _k.type) !== "video")
                    break;
                this.currentTrack.info.height = e.readUnsignedInt(s);
            }
            break;
        case k.Colour:
            {
                if (((_m = (_l = this.currentTrack) === null || _l === void 0 ? void 0 : _l.info) === null || _m === void 0 ? void 0 : _m.type) !== "video")
                    break;
                this.currentTrack.info.colorSpace = {}, this.readContiguousElements(e, s);
            }
            break;
        case k.MatrixCoefficients:
            {
                if (((_p = (_o = this.currentTrack) === null || _o === void 0 ? void 0 : _o.info) === null || _p === void 0 ? void 0 : _p.type) !== "video" || !this.currentTrack.info.colorSpace)
                    break;
                var n = e.readUnsignedInt(s), a = (_q = Xt[n]) !== null && _q !== void 0 ? _q : null;
                this.currentTrack.info.colorSpace.matrix = a;
            }
            break;
        case k.Range:
            {
                if (((_v = (_u = this.currentTrack) === null || _u === void 0 ? void 0 : _u.info) === null || _v === void 0 ? void 0 : _v.type) !== "video" || !this.currentTrack.info.colorSpace)
                    break;
                this.currentTrack.info.colorSpace.fullRange = e.readUnsignedInt(s) === 2;
            }
            break;
        case k.TransferCharacteristics:
            {
                if (((_x = (_w = this.currentTrack) === null || _w === void 0 ? void 0 : _w.info) === null || _x === void 0 ? void 0 : _x.type) !== "video" || !this.currentTrack.info.colorSpace)
                    break;
                var n = e.readUnsignedInt(s), a = (_y = Gt[n]) !== null && _y !== void 0 ? _y : null;
                this.currentTrack.info.colorSpace.transfer = a;
            }
            break;
        case k.Primaries:
            {
                if (((_0 = (_z = this.currentTrack) === null || _z === void 0 ? void 0 : _z.info) === null || _0 === void 0 ? void 0 : _0.type) !== "video" || !this.currentTrack.info.colorSpace)
                    break;
                var n = e.readUnsignedInt(s), a = (_1 = Kt[n]) !== null && _1 !== void 0 ? _1 : null;
                this.currentTrack.info.colorSpace.primaries = a;
            }
            break;
        case k.Projection:
            {
                if (((_3 = (_2 = this.currentTrack) === null || _2 === void 0 ? void 0 : _2.info) === null || _3 === void 0 ? void 0 : _3.type) !== "video")
                    break;
                this.readContiguousElements(e, s);
            }
            break;
        case k.ProjectionPoseRoll:
            {
                if (((_5 = (_4 = this.currentTrack) === null || _4 === void 0 ? void 0 : _4.info) === null || _5 === void 0 ? void 0 : _5.type) !== "video")
                    break;
                var a = -e.readFloat(s);
                try {
                    this.currentTrack.info.rotation = Fe(a);
                }
                catch (_17) { }
            }
            break;
        case k.Audio:
            {
                if (((_7 = (_6 = this.currentTrack) === null || _6 === void 0 ? void 0 : _6.info) === null || _7 === void 0 ? void 0 : _7.type) !== "audio")
                    break;
                this.readContiguousElements(e, s);
            }
            break;
        case k.SamplingFrequency:
            {
                if (((_9 = (_8 = this.currentTrack) === null || _8 === void 0 ? void 0 : _8.info) === null || _9 === void 0 ? void 0 : _9.type) !== "audio")
                    break;
                this.currentTrack.info.sampleRate = e.readFloat(s);
            }
            break;
        case k.Channels:
            {
                if (((_11 = (_10 = this.currentTrack) === null || _10 === void 0 ? void 0 : _10.info) === null || _11 === void 0 ? void 0 : _11.type) !== "audio")
                    break;
                this.currentTrack.info.numberOfChannels = e.readUnsignedInt(s);
            }
            break;
        case k.BitDepth:
            {
                if (((_13 = (_12 = this.currentTrack) === null || _12 === void 0 ? void 0 : _12.info) === null || _13 === void 0 ? void 0 : _13.type) !== "audio")
                    break;
                this.currentTrack.info.bitDepth = e.readUnsignedInt(s);
            }
            break;
        case k.CuePoint:
            {
                if (!this.currentSegment)
                    break;
                this.readContiguousElements(e, s), this.currentCueTime = null;
            }
            break;
        case k.CueTime:
            this.currentCueTime = e.readUnsignedInt(s);
            break;
        case k.CueTrackPositions:
            {
                if (this.currentCueTime === null)
                    break;
                m(this.currentSegment);
                var n = { time: this.currentCueTime, trackId: -1, clusterPosition: -1 };
                this.currentSegment.cuePoints.push(n), this.readContiguousElements(e, s), (n.trackId === -1 || n.clusterPosition === -1) && this.currentSegment.cuePoints.pop();
            }
            break;
        case k.CueTrack:
            {
                var n = (_14 = this.currentSegment) === null || _14 === void 0 ? void 0 : _14.cuePoints[this.currentSegment.cuePoints.length - 1];
                if (!n)
                    break;
                n.trackId = e.readUnsignedInt(s);
            }
            break;
        case k.CueClusterPosition:
            {
                var n = (_15 = this.currentSegment) === null || _15 === void 0 ? void 0 : _15.cuePoints[this.currentSegment.cuePoints.length - 1];
                if (!n)
                    break;
                m(this.currentSegment), n.clusterPosition = this.currentSegment.dataStartPos + e.readUnsignedInt(s);
            }
            break;
        case k.Timestamp:
            {
                if (!this.currentCluster)
                    break;
                this.currentCluster.timestamp = e.readUnsignedInt(s);
            }
            break;
        case k.SimpleBlock:
            {
                if (!this.currentCluster)
                    break;
                var n = e.readVarInt(), a = e.readS16(), c = !!(e.readU8() & 128);
                this.getTrackDataInCluster(this.currentCluster, n).blocks.push({ timestamp: a, duration: 0, isKeyFrame: c, referencedTimestamps: [], data: e.readBytes(s - (e.pos - i)) });
            }
            break;
        case k.BlockGroup:
            {
                if (!this.currentCluster)
                    break;
                if (this.readContiguousElements(e, s), this.currentBlock) {
                    for (var n = 0; n < this.currentBlock.referencedTimestamps.length; n++)
                        this.currentBlock.referencedTimestamps[n] += this.currentBlock.timestamp;
                    this.currentBlock = null;
                }
            }
            break;
        case k.Block:
            {
                if (!this.currentCluster)
                    break;
                var n = e.readVarInt(), a = e.readS16(), o = e.readU8(), c = this.getTrackDataInCluster(this.currentCluster, n);
                this.currentBlock = { timestamp: a, duration: 0, isKeyFrame: !0, referencedTimestamps: [], data: e.readBytes(s - (e.pos - i)) }, c.blocks.push(this.currentBlock);
            }
            break;
        case k.BlockDuration:
            {
                if (!this.currentBlock)
                    break;
                this.currentBlock.duration = e.readUnsignedInt(s);
            }
            break;
        case k.ReferenceBlock:
            {
                if (!this.currentBlock)
                    break;
                this.currentBlock.isKeyFrame = !1;
                var n = e.readSignedInt(s);
                this.currentBlock.referencedTimestamps.push(n);
            }
            break;
    } e.pos = i + s; };
    return class_47;
}(de)), Jr = /** @class */ (function () {
    function class_48(e) {
        this.internalTrack = e, this.packetToClusterLocation = new WeakMap;
    }
    class_48.prototype.getId = function () { return this.internalTrack.id; };
    class_48.prototype.getCodec = function () { throw new Error("Not implemented on base class."); };
    class_48.prototype.computeDuration = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.getPacket(1 / 0, { metadataOnly: !0 })];
                case 1:
                    e = _d.sent();
                    return [2 /*return*/, ((_b = e === null || e === void 0 ? void 0 : e.timestamp) !== null && _b !== void 0 ? _b : 0) + ((_c = e === null || e === void 0 ? void 0 : e.duration) !== null && _c !== void 0 ? _c : 0)];
            }
        }); });
    };
    class_48.prototype.getLanguageCode = function () { return this.internalTrack.languageCode; };
    class_48.prototype.getFirstTimestamp = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.getFirstPacket({ metadataOnly: !0 })];
                case 1: return [2 /*return*/, (_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.timestamp) !== null && _c !== void 0 ? _c : 0];
            }
        }); });
    };
    class_48.prototype.getTimeResolution = function () { return this.internalTrack.segment.timestampFactor; };
    class_48.prototype.getFirstPacket = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, this.performClusterLookup(function () { var _b; var t = (_b = _this.internalTrack.segment.clusters[0]) !== null && _b !== void 0 ? _b : null; if (t === null || t === void 0 ? void 0 : t.isKnownToBeFirstCluster) {
                        var s = t;
                        for (; s;) {
                            if (s.trackData.get(_this.internalTrack.id))
                                return { clusterIndex: L(_this.internalTrack.clusters, s.elementStartPos, function (n) { return n.elementStartPos; }), blockIndex: 0, correctBlockFound: !0 };
                            s = s.nextCluster;
                        }
                    } return { clusterIndex: -1, blockIndex: -1, correctBlockFound: !1 }; }, -1 / 0, 1 / 0, e)];
            });
        });
    };
    class_48.prototype.intoTimescale = function (e) { return Xe(e * this.internalTrack.segment.timestampFactor, 14); };
    class_48.prototype.getPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.intoTimescale(e);
                return [2 /*return*/, this.performClusterLookup(function () { return _this.findBlockInClustersForTimestamp(s); }, s, s, t)];
            });
        });
    };
    class_48.prototype.getNextPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, n, a;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.packetToClusterLocation.get(e);
                if (s === void 0)
                    throw new Error("Packet was not created from this track.");
                i = s.cluster.trackData.get(this.internalTrack.id), n = i.blocks[s.blockIndex], a = L(this.internalTrack.clusters, s.cluster.elementStartPos, function (o) { return o.elementStartPos; });
                return [2 /*return*/, (m(a !== -1), this.performClusterLookup(function () { if (s.blockIndex + 1 < i.blocks.length)
                        return { clusterIndex: a, blockIndex: s.blockIndex + 1, correctBlockFound: !0 }; {
                        var o = s.cluster;
                        for (; o.nextCluster;)
                            if (o = o.nextCluster, o.trackData.get(_this.internalTrack.id)) {
                                var l = L(_this.internalTrack.clusters, o.elementStartPos, function (d) { return d.elementStartPos; });
                                return m(l !== -1), { clusterIndex: l, blockIndex: 0, correctBlockFound: !0 };
                            }
                        return { clusterIndex: a, blockIndex: -1, correctBlockFound: !1 };
                    } }, n.timestamp, 1 / 0, t))];
            });
        });
    };
    class_48.prototype.getKeyPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.intoTimescale(e);
                return [2 /*return*/, this.performClusterLookup(function () { return _this.findKeyBlockInClustersForTimestamp(s); }, s, s, t)];
            });
        });
    };
    class_48.prototype.getNextKeyPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () {
            var s, i, n, a;
            var _this = this;
            return __generator(this, function (_b) {
                s = this.packetToClusterLocation.get(e);
                if (s === void 0)
                    throw new Error("Packet was not created from this track.");
                i = s.cluster.trackData.get(this.internalTrack.id), n = i.blocks[s.blockIndex], a = L(this.internalTrack.clusters, s.cluster.elementStartPos, function (o) { return o.elementStartPos; });
                return [2 /*return*/, (m(a !== -1), this.performClusterLookup(function () { var o = i.blocks.findIndex(function (c, l) { return c.isKeyFrame && l > s.blockIndex; }); if (o !== -1)
                        return { clusterIndex: a, blockIndex: o, correctBlockFound: !0 }; {
                        var c = s.cluster;
                        for (; c.nextCluster;) {
                            c = c.nextCluster;
                            var l = c.trackData.get(_this.internalTrack.id);
                            if (l && l.firstKeyFrameTimestamp !== null) {
                                var d = L(_this.internalTrack.clusters, c.elementStartPos, function (f) { return f.elementStartPos; });
                                m(d !== -1);
                                var u = l.blocks.findIndex(function (f) { return f.isKeyFrame; });
                                return m(u !== -1), { clusterIndex: d, blockIndex: u, correctBlockFound: !0 };
                            }
                        }
                        return { clusterIndex: a, blockIndex: -1, correctBlockFound: !1 };
                    } }, n.timestamp, 1 / 0, t))];
            });
        });
    };
    class_48.prototype.fetchPacketInCluster = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var n, a, o, c, l; return __generator(this, function (_b) {
            if (t === -1)
                return [2 /*return*/, null];
            n = e.trackData.get(this.internalTrack.id).blocks[t];
            m(n);
            a = s.metadataOnly ? te : n.data, o = n.timestamp / this.internalTrack.segment.timestampFactor, c = n.duration / this.internalTrack.segment.timestampFactor, l = new D(a, n.isKeyFrame ? "key" : "delta", o, c, e.dataStartPos + t, n.data.byteLength);
            return [2 /*return*/, (this.packetToClusterLocation.set(l, { cluster: e, blockIndex: t }), l)];
        }); });
    };
    class_48.prototype.findBlockInClustersForTimestamp = function (e) {
        var _this = this;
        var t = O(this.internalTrack.clusters, e, function (n) { return n.trackData.get(_this.internalTrack.id).startTimestamp; }), s = -1, i = !1;
        if (t !== -1) {
            var a = this.internalTrack.clusters[t].trackData.get(this.internalTrack.id), o = O(a.presentationTimestamps, e, function (c) { return c.timestamp; });
            m(o !== -1), s = a.presentationTimestamps[o].blockIndex, i = e < a.endTimestamp;
        }
        return { clusterIndex: t, blockIndex: s, correctBlockFound: i };
    };
    class_48.prototype.findKeyBlockInClustersForTimestamp = function (e) {
        var _this = this;
        var t = O(this.internalTrack.clustersWithKeyFrame, e, function (a) { return a.trackData.get(_this.internalTrack.id).firstKeyFrameTimestamp; }), s = -1, i = -1, n = !1;
        if (t !== -1) {
            var a = this.internalTrack.clustersWithKeyFrame[t];
            s = L(this.internalTrack.clusters, a.elementStartPos, function (d) { return d.elementStartPos; }), m(s !== -1);
            var o_4 = a.trackData.get(this.internalTrack.id), c = Zt(o_4.presentationTimestamps, function (d) { return o_4.blocks[d.blockIndex].isKeyFrame && d.timestamp <= e; });
            m(c !== -1), i = o_4.presentationTimestamps[c].blockIndex, n = e < o_4.endTimestamp;
        }
        return { clusterIndex: s, blockIndex: i, correctBlockFound: n };
    };
    class_48.prototype.performClusterLookup = function (e, t, s, i) {
        var _b, _c, _d, _f;
        return __awaiter(this, void 0, void 0, function () { var _g, n, a, o, _h, c, l, d, b, u, f, h, p, w, g, T, S, b, R, b, x, C, A, I, R, v, _j, _k, $, be, Pn, cs, _l, R, E, y, _m, x; return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _g = this.internalTrack, n = _g.demuxer, a = _g.segment;
                    return [4 /*yield*/, a.clusterLookupMutex.acquire()];
                case 1:
                    o = _o.sent();
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, , 17, 18]);
                    _h = e(), c = _h.clusterIndex, l = _h.blockIndex, d = _h.correctBlockFound;
                    if (d) {
                        b = this.internalTrack.clusters[c];
                        return [2 /*return*/, this.fetchPacketInCluster(b, l, i)];
                    }
                    u = n.metadataReader, f = n.clusterReader, h = null, p = c, w = l, g = O(this.internalTrack.cuePoints, t, function (b) { return b.time; }), T = g !== -1 ? this.internalTrack.cuePoints[g] : null, S = !1;
                    if (c === -1)
                        u.pos = (_b = T === null || T === void 0 ? void 0 : T.clusterPosition) !== null && _b !== void 0 ? _b : a.clusterSeekStartPos, S = u.pos === a.clusterSeekStartPos;
                    else {
                        b = this.internalTrack.clusters[c];
                        !T || b.elementStartPos >= T.clusterPosition ? (u.pos = b.elementEndPos, h = b) : u.pos = T.clusterPosition;
                    }
                    _o.label = 3;
                case 3:
                    if (!(u.pos < a.elementEndPos)) return [3 /*break*/, 14];
                    if (h) {
                        R = h.trackData.get(this.internalTrack.id);
                        if (R && R.startTimestamp > s)
                            return [3 /*break*/, 14];
                        if (h.nextCluster) {
                            u.pos = h.nextCluster.elementEndPos, h = h.nextCluster;
                            return [3 /*break*/, 13];
                        }
                    }
                    return [4 /*yield*/, u.reader.loadRange(u.pos, u.pos + Ne)];
                case 4:
                    _o.sent();
                    b = u.pos, x = u.readElementHeader(), C = x.id, A = x.size, I = u.pos;
                    if (!(C === k.Cluster)) return [3 /*break*/, 8];
                    R = L(a.clusters, b, function (cs) { return cs.elementStartPos; }), v = void 0;
                    if (!(R === -1)) return [3 /*break*/, 6];
                    u.pos = b;
                    return [4 /*yield*/, n.readCluster(a)];
                case 5:
                    _j = (v = _o.sent());
                    return [3 /*break*/, 7];
                case 6:
                    _j = v = a.clusters[R];
                    _o.label = 7;
                case 7:
                    _j, h && (h.nextCluster = v), h = v, S && (v.isKnownToBeFirstCluster = !0, S = !1);
                    _k = e(), $ = _k.clusterIndex, be = _k.blockIndex, Pn = _k.correctBlockFound;
                    if (Pn) {
                        cs = this.internalTrack.clusters[$];
                        return [2 /*return*/, this.fetchPacketInCluster(cs, be, i)];
                    }
                    $ !== -1 && (p = $, w = be);
                    _o.label = 8;
                case 8:
                    if (!(A === null)) return [3 /*break*/, 12];
                    if (!(C === k.Cluster)) return [3 /*break*/, 9];
                    _l = (m(h), A = h.elementEndPos - I);
                    return [3 /*break*/, 11];
                case 9:
                    f.pos = I;
                    return [4 /*yield*/, f.searchForNextElementId(Rs, a.elementEndPos)];
                case 10:
                    _l = (A = ((_c = _o.sent()) !== null && _c !== void 0 ? _c : a.elementEndPos) - I);
                    _o.label = 11;
                case 11:
                    _l;
                    R = I + A;
                    if (R >= a.elementEndPos - As)
                        return [3 /*break*/, 14];
                    if (f.pos = R, f.readElementId() === k.Segment) {
                        a.elementEndPos = R;
                        return [3 /*break*/, 14];
                    }
                    _o.label = 12;
                case 12:
                    u.pos = I + A;
                    _o.label = 13;
                case 13: return [3 /*break*/, 3];
                case 14:
                    E = null, y = p !== -1 ? this.internalTrack.clusters[p] : null;
                    _m = y;
                    if (!_m) return [3 /*break*/, 16];
                    return [4 /*yield*/, this.fetchPacketInCluster(y, w, i)];
                case 15:
                    _m = (E = _o.sent());
                    _o.label = 16;
                case 16:
                    if (_m, !E && T && (!y || y.elementStartPos < T.clusterPosition)) {
                        x = (_f = (_d = this.internalTrack.cuePoints[g - 1]) === null || _d === void 0 ? void 0 : _d.time) !== null && _f !== void 0 ? _f : -1 / 0;
                        return [2 /*return*/, this.performClusterLookup(e, x, s, i)];
                    }
                    return [2 /*return*/, E];
                case 17:
                    o();
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        }); });
    };
    return class_48;
}()), ni = /** @class */ (function (_super) {
    __extends(class_49, _super);
    function class_49(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.decoderConfigPromise = null, _this.internalTrack = e;
        return _this;
    }
    class_49.prototype.getCodec = function () { return this.internalTrack.info.codec; };
    class_49.prototype.getCodedWidth = function () { return this.internalTrack.info.width; };
    class_49.prototype.getCodedHeight = function () { return this.internalTrack.info.height; };
    class_49.prototype.getRotation = function () { return this.internalTrack.info.rotation; };
    class_49.prototype.getColorSpace = function () {
        var _b, _c, _d, _f;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_g) {
            return [2 /*return*/, { primaries: (_b = this.internalTrack.info.colorSpace) === null || _b === void 0 ? void 0 : _b.primaries, transfer: (_c = this.internalTrack.info.colorSpace) === null || _c === void 0 ? void 0 : _c.transfer, matrix: (_d = this.internalTrack.info.colorSpace) === null || _d === void 0 ? void 0 : _d.matrix, fullRange: (_f = this.internalTrack.info.colorSpace) === null || _f === void 0 ? void 0 : _f.fullRange }];
        }); });
    };
    class_49.prototype.getDecoderConfig = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, this.internalTrack.info.codec ? (_b = this.decoderConfigPromise) !== null && _b !== void 0 ? _b : (this.decoderConfigPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, _b; var _c, _d; return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                e = null;
                                _b = (this.internalTrack.info.codec === "vp9" || this.internalTrack.info.codec === "av1" || this.internalTrack.info.codec === "avc" && !this.internalTrack.info.codecDescription || this.internalTrack.info.codec === "hevc" && !this.internalTrack.info.codecDescription);
                                if (!_b) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.getFirstPacket({})];
                            case 1:
                                _b = (e = _f.sent());
                                _f.label = 2;
                            case 2: return [2 /*return*/, (_b, { codec: dr({ width: this.internalTrack.info.width, height: this.internalTrack.info.height, codec: this.internalTrack.info.codec, codecDescription: this.internalTrack.info.codecDescription, colorSpace: this.internalTrack.info.colorSpace, avcCodecInfo: this.internalTrack.info.codec === "avc" && e ? br(e.data) : null, hevcCodecInfo: this.internalTrack.info.codec === "hevc" && e ? Sr(e.data) : null, vp9CodecInfo: this.internalTrack.info.codec === "vp9" && e ? xr(e.data) : null, av1CodecInfo: this.internalTrack.info.codec === "av1" && e ? yr(e.data) : null }), codedWidth: this.internalTrack.info.width, codedHeight: this.internalTrack.info.height, description: (_c = this.internalTrack.info.codecDescription) !== null && _c !== void 0 ? _c : void 0, colorSpace: (_d = this.internalTrack.info.colorSpace) !== null && _d !== void 0 ? _d : void 0 })];
                        }
                    }); }); })()) : null];
            });
        });
    };
    return class_49;
}(Jr)), ai = /** @class */ (function (_super) {
    __extends(class_50, _super);
    function class_50(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.decoderConfig = null, _this.internalTrack = e;
        return _this;
    }
    class_50.prototype.getCodec = function () { return this.internalTrack.info.codec; };
    class_50.prototype.getNumberOfChannels = function () { return this.internalTrack.info.numberOfChannels; };
    class_50.prototype.getSampleRate = function () { return this.internalTrack.info.sampleRate; };
    class_50.prototype.getDecoderConfig = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_d) {
            return [2 /*return*/, this.internalTrack.info.codec ? (_b = this.decoderConfig) !== null && _b !== void 0 ? _b : (this.decoderConfig = { codec: lr({ codec: this.internalTrack.info.codec, codecDescription: this.internalTrack.info.codecDescription, aacCodecInfo: this.internalTrack.info.aacCodecInfo }), numberOfChannels: this.internalTrack.info.numberOfChannels, sampleRate: this.internalTrack.info.sampleRate, description: (_c = this.internalTrack.info.codecDescription) !== null && _c !== void 0 ? _c : void 0 }) : null];
        }); });
    };
    return class_50;
}(Jr)), ko = function (r) { var e = new Map; for (var n = 0; n < r.length; n++) {
    var a = r[n];
    e.set(a.timestamp, a);
} var t = new Set, s = [], i = function (n) { if (!t.has(n)) {
    t.add(n);
    for (var a = 0; a < n.referencedTimestamps.length; a++) {
        var o = n.referencedTimestamps[a], c = e.get(o);
        c && i(c);
    }
    s.push(n);
} }; for (var n = 0; n < r.length; n++)
    i(r[n]); return s; };
var Tt = /** @class */ (function () {
    function class_51(e) {
        this.reader = e, this.pos = 0, this.fileSize = null;
    }
    class_51.prototype.readBytes = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; return this.pos += e, new Uint8Array(t.buffer, s, e); };
    class_51.prototype.readU16 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 2), e = _b.view, t = _b.offset; return this.pos += 2, e.getUint16(t, !1); };
    class_51.prototype.readU32 = function () { var _b = this.reader.getViewAndOffset(this.pos, this.pos + 4), e = _b.view, t = _b.offset; return this.pos += 4, e.getUint32(t, !1); };
    class_51.prototype.readAscii = function (e) { var _b = this.reader.getViewAndOffset(this.pos, this.pos + e), t = _b.view, s = _b.offset; this.pos += e; var i = ""; for (var n = 0; n < e; n++)
        i += String.fromCharCode(t.getUint8(s + n)); return i; };
    class_51.prototype.readId3 = function () { return this.readAscii(3) !== "ID3" ? (this.pos -= 3, null) : (this.pos += 3, { size: bo(this.readU32()) }); };
    class_51.prototype.readNextFrameHeader = function (e) { for (m(this.fileSize), e !== null && e !== void 0 ? e : (e = this.fileSize); this.pos < e - 4;) {
        var t = this.readU32();
        this.pos -= 4;
        var s = zr(t, this);
        if (s)
            return s;
    } return null; };
    return class_51;
}()), bo = function (r) { var e = 2130706432, t = 0; for (; e !== 0;)
    t >>= 1, t |= r & e, e >>= 8; return t; };
var es = /** @class */ (function (_super) {
    __extends(class_52, _super);
    function class_52(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.metadataPromise = null, _this.firstFrameHeader = null, _this.allSamples = [], _this.tracks = [], _this.reader = new Tt(e._mainReader);
        return _this;
    }
    class_52.prototype.readMetadata = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, (_b = this.metadataPromise) !== null && _b !== void 0 ? _b : (this.metadataPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var e, t, s, i, n, a, o, c, l; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, this.input.source.getSize()];
                            case 1:
                                e = _b.sent();
                                this.reader.fileSize = e;
                                return [4 /*yield*/, this.reader.reader.loadRange(0, e)];
                            case 2:
                                _b.sent();
                                t = this.reader.readId3();
                                t && (this.reader.pos += t.size);
                                s = 0;
                                for (;;) {
                                    i = this.reader.readNextFrameHeader();
                                    if (!i)
                                        break;
                                    n = dt(i.mpegVersionId, i.channel);
                                    this.reader.pos = i.startPos + n;
                                    a = this.reader.readU32(), o = a === ct || a === Br;
                                    if (this.reader.pos = i.startPos + i.totalSize - 1, o)
                                        continue;
                                    this.firstFrameHeader || (this.firstFrameHeader = i);
                                    c = i.audioSamplesInFrame / i.sampleRate, l = { timestamp: s / i.sampleRate, duration: c, dataStart: i.startPos, dataSize: i.totalSize };
                                    this.allSamples.push(l), s += i.audioSamplesInFrame;
                                }
                                if (!this.firstFrameHeader)
                                    throw new Error("No MP3 frames found.");
                                this.tracks = [new Y(new oi(this))];
                                return [2 /*return*/];
                        }
                    }); }); })())];
            });
        });
    };
    class_52.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, "audio/mpeg"];
        }); });
    };
    class_52.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), this.tracks)];
            }
        }); });
    };
    class_52.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1:
                    _b.sent();
                    e = U(this.allSamples);
                    return [2 /*return*/, (m(e), e.timestamp + e.duration)];
            }
        }); });
    };
    return class_52;
}(de)), oi = /** @class */ (function () {
    function class_53(e) {
        this.demuxer = e;
    }
    class_53.prototype.getId = function () { return 1; };
    class_53.prototype.getFirstTimestamp = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, 0];
        }); });
    };
    class_53.prototype.getTimeResolution = function () { return m(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.sampleRate / this.demuxer.firstFrameHeader.audioSamplesInFrame; };
    class_53.prototype.computeDuration = function () { return this.demuxer.computeDuration(); };
    class_53.prototype.getLanguageCode = function () { return J; };
    class_53.prototype.getCodec = function () { return "mp3"; };
    class_53.prototype.getNumberOfChannels = function () { return m(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.channel === 3 ? 1 : 2; };
    class_53.prototype.getSampleRate = function () { return m(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.sampleRate; };
    class_53.prototype.getDecoderConfig = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, (m(this.demuxer.firstFrameHeader), { codec: "mp3", numberOfChannels: this.demuxer.firstFrameHeader.channel === 3 ? 1 : 2, sampleRate: this.demuxer.firstFrameHeader.sampleRate })];
        }); });
    };
    class_53.prototype.getPacketAtIndex = function (e, t) { if (e === -1)
        return null; var s = this.demuxer.allSamples[e]; if (!s)
        return null; var i; return t.metadataOnly ? i = te : (this.demuxer.reader.pos = s.dataStart, i = this.demuxer.reader.readBytes(s.dataSize)), new D(i, "key", s.timestamp, s.duration, e, s.dataSize); };
    class_53.prototype.getFirstPacket = function (e) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, this.getPacketAtIndex(0, e)];
        }); });
    };
    class_53.prototype.getNextPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s; return __generator(this, function (_b) {
            s = L(this.demuxer.allSamples, e.timestamp, function (i) { return i.timestamp; });
            if (s === -1)
                throw new Error("Packet was not created from this track.");
            return [2 /*return*/, this.getPacketAtIndex(s + 1, t)];
        }); });
    };
    class_53.prototype.getPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s; return __generator(this, function (_b) {
            s = O(this.demuxer.allSamples, e, function (i) { return i.timestamp; });
            return [2 /*return*/, this.getPacketAtIndex(s, t)];
        }); });
    };
    class_53.prototype.getKeyPacket = function (e, t) { return this.getPacket(e, t); };
    class_53.prototype.getNextKeyPacket = function (e, t) { return this.getNextPacket(e, t); };
    return class_53;
}());
var ts = /** @class */ (function (_super) {
    __extends(class_54, _super);
    function class_54(e) {
        var _this = this;
        _this = _super.call(this, e) || this, _this.readingMutex = new ae, _this.metadataPromise = null, _this.fileSize = null, _this.bitstreams = [], _this.tracks = [], _this.reader = new lt(new ue(e.source, 64 * Math.pow(2, 20)));
        return _this;
    }
    class_54.prototype.readMetadata = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_c) {
                return [2 /*return*/, (_b = this.metadataPromise) !== null && _b !== void 0 ? _b : (this.metadataPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var _b, e, _c, _d, e, t, _f, _g, _h; return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _b = this;
                                return [4 /*yield*/, this.input.source.getSize()];
                            case 1:
                                _b.fileSize = _j.sent();
                                _j.label = 2;
                            case 2:
                                if (!(this.reader.pos < this.fileSize - ut)) return [3 /*break*/, 5];
                                return [4 /*yield*/, this.reader.reader.loadRange(this.reader.pos, this.reader.pos + He)];
                            case 3:
                                _j.sent();
                                e = this.reader.readPageHeader();
                                if (!e || !!!(e.headerType & 2))
                                    return [3 /*break*/, 5];
                                this.bitstreams.push({ serialNumber: e.serialNumber, bosPage: e, description: null, numberOfChannels: -1, sampleRate: -1, codecInfo: { codec: null, vorbisInfo: null, opusInfo: null }, lastMetadataPacket: null }), this.reader.pos = e.headerStartPos + e.totalSize;
                                _j.label = 4;
                            case 4: return [3 /*break*/, 2];
                            case 5:
                                _c = 0, _d = this.bitstreams;
                                _j.label = 6;
                            case 6:
                                if (!(_c < _d.length)) return [3 /*break*/, 15];
                                e = _d[_c];
                                return [4 /*yield*/, this.readPacket(this.reader, e.bosPage, 0)];
                            case 7:
                                t = _j.sent();
                                _f = t;
                                if (!_f) return [3 /*break*/, 13];
                                if (!(t.data.byteLength >= 7 && t.data[0] === 1 && t.data[1] === 118 && t.data[2] === 111 && t.data[3] === 114 && t.data[4] === 98 && t.data[5] === 105 && t.data[6] === 115)) return [3 /*break*/, 9];
                                return [4 /*yield*/, this.readVorbisMetadata(t, e)];
                            case 8:
                                _g = _j.sent();
                                return [3 /*break*/, 12];
                            case 9:
                                _h = t.data.byteLength >= 8 && t.data[0] === 79 && t.data[1] === 112 && t.data[2] === 117 && t.data[3] === 115 && t.data[4] === 72 && t.data[5] === 101 && t.data[6] === 97 && t.data[7] === 100;
                                if (!_h) return [3 /*break*/, 11];
                                return [4 /*yield*/, this.readOpusMetadata(t, e)];
                            case 10:
                                _h = (_j.sent());
                                _j.label = 11;
                            case 11:
                                _g = _h;
                                _j.label = 12;
                            case 12:
                                _f = (_g, e.codecInfo.codec !== null && this.tracks.push(new Y(new ci(e, this))));
                                _j.label = 13;
                            case 13:
                                _f;
                                _j.label = 14;
                            case 14:
                                _c++;
                                return [3 /*break*/, 6];
                            case 15: return [2 /*return*/];
                        }
                    }); }); })())];
            });
        });
    };
    class_54.prototype.readVorbisMetadata = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, _b, n, a, o, c, l, d; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.findNextPacketStart(this.reader, e)];
                case 1:
                    s = _c.sent();
                    if (!s)
                        return [2 /*return*/];
                    return [4 /*yield*/, this.readPacket(this.reader, s.startPage, s.startSegmentIndex)];
                case 2:
                    i = _c.sent();
                    _b = !i;
                    if (_b) return [3 /*break*/, 4];
                    return [4 /*yield*/, this.findNextPacketStart(this.reader, i)];
                case 3:
                    _b = (s = _c.sent(), !s);
                    _c.label = 4;
                case 4:
                    if (_b)
                        return [2 /*return*/];
                    return [4 /*yield*/, this.readPacket(this.reader, s.startPage, s.startSegmentIndex)];
                case 5:
                    n = _c.sent();
                    if (!n || i.data[0] !== 3 || n.data[0] !== 5)
                        return [2 /*return*/];
                    a = [], o = function (u) { for (; a.push(Math.min(255, u)), !(u < 255);)
                        u -= 255; };
                    o(e.data.length), o(i.data.length);
                    c = new Uint8Array(1 + a.length + e.data.length + i.data.length + n.data.length);
                    c[0] = a.length, c.set(a, 1), c.set(e.data, 1 + a.length), c.set(i.data, 1 + a.length + e.data.length), c.set(n.data, 1 + a.length + e.data.length + i.data.length), t.codecInfo.codec = "vorbis", t.description = c, t.lastMetadataPacket = n;
                    l = Z(e.data);
                    t.numberOfChannels = l.getUint8(11), t.sampleRate = l.getUint32(12, !0);
                    d = l.getUint8(28);
                    t.codecInfo.vorbisInfo = { blocksizes: [1 << (d & 15), 1 << (d >> 4)], modeBlockflags: Cr(n.data).modeBlockflags };
                    return [2 /*return*/];
            }
        }); });
    };
    class_54.prototype.readOpusMetadata = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.findNextPacketStart(this.reader, e)];
                case 1:
                    s = _b.sent();
                    if (!s)
                        return [2 /*return*/];
                    return [4 /*yield*/, this.readPacket(this.reader, s.startPage, s.startSegmentIndex)];
                case 2:
                    i = _b.sent();
                    if (!i)
                        return [2 /*return*/];
                    t.codecInfo.codec = "opus", t.description = e.data, t.lastMetadataPacket = i;
                    n = Be(e.data);
                    t.numberOfChannels = n.outputChannelCount, t.sampleRate = n.inputSampleRate, t.codecInfo.opusInfo = { preSkip: n.preSkip };
                    return [2 /*return*/];
            }
        }); });
    };
    class_54.prototype.readPacket = function (e, t, s) {
        return __awaiter(this, void 0, void 0, function () { var i, f, n, a, o, c, f, h, h, l, d, u, f, h; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    m(s < t.lacingValues.length), m(this.fileSize);
                    i = 0;
                    for (f = 0; f < s; f++)
                        i += t.lacingValues[f];
                    n = t, a = i, o = s, c = [];
                    _b.label = 1;
                case 1: return [4 /*yield*/, e.reader.loadRange(n.dataStartPos, n.dataStartPos + n.dataSize)];
                case 2:
                    _b.sent(), e.pos = n.dataStartPos;
                    f = e.readBytes(n.dataSize);
                    for (;;) {
                        if (o === n.lacingValues.length) {
                            c.push(f.subarray(i, a));
                            break;
                        }
                        h = n.lacingValues[o];
                        if (a += h, h < 255) {
                            c.push(f.subarray(i, a));
                            return [3 /*break*/, 8];
                        }
                        o++;
                    }
                    _b.label = 3;
                case 3:
                    if (e.pos = n.headerStartPos + n.totalSize, e.pos >= this.fileSize - ut)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, e.reader.loadRange(e.pos, e.pos + He)];
                case 4:
                    _b.sent();
                    h = e.readPageHeader();
                    if (!h)
                        return [2 /*return*/, null];
                    if (n = h, n.serialNumber === t.serialNumber)
                        return [3 /*break*/, 6];
                    _b.label = 5;
                case 5: return [3 /*break*/, 3];
                case 6:
                    i = 0, a = 0, o = 0;
                    _b.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8:
                    l = c.reduce(function (f, h) { return f + h.length; }, 0), d = new Uint8Array(l), u = 0;
                    for (f = 0; f < c.length; f++) {
                        h = c[f];
                        d.set(h, u), u += h.length;
                    }
                    return [2 /*return*/, { data: d, endPage: n, endSegmentIndex: o }];
            }
        }); });
    };
    class_54.prototype.findNextPacketStart = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (m(this.fileSize !== null), t.endSegmentIndex < t.endPage.lacingValues.length - 1)
                        return [2 /*return*/, { startPage: t.endPage, startSegmentIndex: t.endSegmentIndex + 1 }];
                    if (!!(t.endPage.headerType & 4))
                        return [2 /*return*/, null];
                    e.pos = t.endPage.headerStartPos + t.endPage.totalSize;
                    _b.label = 1;
                case 1:
                    if (e.pos >= this.fileSize - ut)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, e.reader.loadRange(e.pos, e.pos + He)];
                case 2:
                    _b.sent();
                    i = e.readPageHeader();
                    if (!i)
                        return [2 /*return*/, null];
                    if (i.serialNumber === t.endPage.serialNumber)
                        return [2 /*return*/, { startPage: i, startSegmentIndex: 0 }];
                    e.pos = i.headerStartPos + i.totalSize;
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        }); });
    };
    class_54.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, Promise.all(this.tracks.map(function (t) { return t.getCodecParameterString(); }))];
                case 2:
                    e = _b.sent();
                    return [2 /*return*/, Wr({ codecStrings: e.filter(Boolean) })];
            }
        }); });
    };
    class_54.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.readMetadata()];
                case 1: return [2 /*return*/, (_b.sent(), this.tracks)];
            }
        }); });
    };
    class_54.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1:
                    e = _b.sent();
                    return [4 /*yield*/, Promise.all(e.map(function (s) { return s.computeDuration(); }))];
                case 2:
                    t = _b.sent();
                    return [2 /*return*/, Math.max.apply(Math, __spreadArray([0], t, false))];
            }
        }); });
    };
    return class_54;
}(de)), ci = /** @class */ (function () {
    function class_55(e, t) {
        this.bitstream = e, this.demuxer = t, this.encodedPacketToMetadata = new WeakMap, this.internalSampleRate = e.codecInfo.codec === "opus" ? et : e.sampleRate;
    }
    class_55.prototype.getId = function () { return this.bitstream.serialNumber; };
    class_55.prototype.getNumberOfChannels = function () { return this.bitstream.numberOfChannels; };
    class_55.prototype.getSampleRate = function () { return this.bitstream.sampleRate; };
    class_55.prototype.getTimeResolution = function () { return this.bitstream.sampleRate; };
    class_55.prototype.getCodec = function () { return this.bitstream.codecInfo.codec; };
    class_55.prototype.getDecoderConfig = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_c) {
            return [2 /*return*/, (m(this.bitstream.codecInfo.codec), { codec: this.bitstream.codecInfo.codec, numberOfChannels: this.bitstream.numberOfChannels, sampleRate: this.bitstream.sampleRate, description: (_b = this.bitstream.description) !== null && _b !== void 0 ? _b : void 0 })];
        }); });
    };
    class_55.prototype.getLanguageCode = function () { return J; };
    class_55.prototype.getFirstTimestamp = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/, 0];
        }); });
    };
    class_55.prototype.computeDuration = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var e; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this.getPacket(1 / 0, { metadataOnly: !0 })];
                case 1:
                    e = _d.sent();
                    return [2 /*return*/, ((_b = e === null || e === void 0 ? void 0 : e.timestamp) !== null && _b !== void 0 ? _b : 0) + ((_c = e === null || e === void 0 ? void 0 : e.duration) !== null && _c !== void 0 ? _c : 0)];
            }
        }); });
    };
    class_55.prototype.granulePositionToTimestampInSamples = function (e) { return this.bitstream.codecInfo.codec === "opus" ? (m(this.bitstream.codecInfo.opusInfo), e - this.bitstream.codecInfo.opusInfo.preSkip) : e; };
    class_55.prototype.createEncodedPacketFromOggPacket = function (e, t, s) { if (!e)
        return null; var _b = Nr(e.data, this.bitstream.codecInfo, t.vorbisLastBlocksize), i = _b.durationInSamples, n = _b.vorbisBlockSize, a = new D(s.metadataOnly ? te : e.data, "key", Math.max(0, t.timestampInSamples) / this.internalSampleRate, i / this.internalSampleRate, e.endPage.headerStartPos + e.endSegmentIndex, e.data.byteLength); return this.encodedPacketToMetadata.set(a, { packet: e, timestampInSamples: t.timestampInSamples, durationInSamples: i, vorbisBlockSize: n }), a; };
    class_55.prototype.getFirstPacket = function (e, t) {
        if (t === void 0) { t = !0; }
        return __awaiter(this, void 0, void 0, function () { var s, _b, i, n, a; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!t) return [3 /*break*/, 2];
                    return [4 /*yield*/, this.demuxer.readingMutex.acquire()];
                case 1:
                    _b = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _b = null;
                    _c.label = 3;
                case 3:
                    s = _b;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, , 7, 8]);
                    m(this.bitstream.lastMetadataPacket);
                    return [4 /*yield*/, this.demuxer.findNextPacketStart(this.demuxer.reader, this.bitstream.lastMetadataPacket)];
                case 5:
                    i = _c.sent();
                    if (!i)
                        return [2 /*return*/, null];
                    n = 0;
                    this.bitstream.codecInfo.codec === "opus" && (m(this.bitstream.codecInfo.opusInfo), n -= this.bitstream.codecInfo.opusInfo.preSkip);
                    return [4 /*yield*/, this.demuxer.readPacket(this.demuxer.reader, i.startPage, i.startSegmentIndex)];
                case 6:
                    a = _c.sent();
                    return [2 /*return*/, this.createEncodedPacketFromOggPacket(a, { timestampInSamples: n, vorbisLastBlocksize: null }, e)];
                case 7:
                    s === null || s === void 0 ? void 0 : s();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        }); });
    };
    class_55.prototype.getNextPacket = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a, o; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.demuxer.readingMutex.acquire()];
                case 1:
                    s = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 5, 6]);
                    i = this.encodedPacketToMetadata.get(e);
                    if (!i)
                        throw new Error("Packet was not created from this track.");
                    return [4 /*yield*/, this.demuxer.findNextPacketStart(this.demuxer.reader, i.packet)];
                case 3:
                    n = _b.sent();
                    if (!n)
                        return [2 /*return*/, null];
                    a = i.timestampInSamples + i.durationInSamples;
                    return [4 /*yield*/, this.demuxer.readPacket(this.demuxer.reader, n.startPage, n.startSegmentIndex)];
                case 4:
                    o = _b.sent();
                    return [2 /*return*/, this.createEncodedPacketFromOggPacket(o, { timestampInSamples: a, vorbisLastBlocksize: i.vorbisBlockSize }, t)];
                case 5:
                    s();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        }); });
    };
    class_55.prototype.getPacket = function (e, t) {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var s, i, n, a, o, c, l, y, b, x, C, I, R, $, d, _d, l_2, y, u, f, y, h, p, w, g, T, x, y, x, C, x, C, S, E, y, C, A, x; return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, this.demuxer.readingMutex.acquire()];
                case 1:
                    s = _f.sent();
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, , 26, 27]);
                    m(this.demuxer.fileSize !== null);
                    i = Xe(e * this.internalSampleRate, 14);
                    if (i === 0)
                        return [2 /*return*/, this.getFirstPacket(t, !1)];
                    if (i < 0)
                        return [2 /*return*/, null];
                    n = this.demuxer.reader;
                    m(this.bitstream.lastMetadataPacket);
                    return [4 /*yield*/, this.demuxer.findNextPacketStart(n, this.bitstream.lastMetadataPacket)];
                case 3:
                    a = _f.sent();
                    if (!a)
                        return [2 /*return*/, null];
                    o = a.startPage, c = this.demuxer.fileSize, l = [o];
                    _f.label = 4;
                case 4:
                    if (!(o.headerStartPos + o.totalSize < c)) return [3 /*break*/, 13];
                    y = o.headerStartPos, b = Math.floor((y + c) / 2), x = b;
                    _f.label = 5;
                case 5:
                    C = Math.min(x + Lr, c - ut);
                    return [4 /*yield*/, n.reader.loadRange(x, C)];
                case 6:
                    if (_f.sent(), n.pos = x, !n.findNextPageHeader(C)) {
                        c = b + ut;
                        return [3 /*break*/, 12];
                    }
                    return [4 /*yield*/, n.reader.loadRange(n.pos, n.pos + He)];
                case 7:
                    _f.sent();
                    I = n.readPageHeader();
                    m(I);
                    R = !1;
                    if (!(I.serialNumber === this.bitstream.serialNumber)) return [3 /*break*/, 8];
                    R = !0;
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, n.reader.loadRange(I.headerStartPos, I.headerStartPos + I.totalSize)];
                case 9:
                    _f.sent(), n.pos = I.headerStartPos;
                    $ = n.readBytes(I.totalSize);
                    R = Vr($) === I.checksum;
                    _f.label = 10;
                case 10:
                    if (!R) {
                        x = I.headerStartPos + 4;
                        return [3 /*break*/, 11];
                    }
                    if (R && I.serialNumber !== this.bitstream.serialNumber) {
                        x = I.headerStartPos + I.totalSize;
                        return [3 /*break*/, 11];
                    }
                    if (I.granulePosition === -1) {
                        x = I.headerStartPos + I.totalSize;
                        return [3 /*break*/, 11];
                    }
                    this.granulePositionToTimestampInSamples(I.granulePosition) > i ? c = I.headerStartPos : (o = I, l.push(I));
                    return [3 /*break*/, 12];
                case 11: return [3 /*break*/, 5];
                case 12: return [3 /*break*/, 4];
                case 13:
                    d = a.startPage;
                    for (_d = 0, l_2 = l; _d < l_2.length; _d++) {
                        y = l_2[_d];
                        if (y.granulePosition === o.granulePosition)
                            break;
                        (!d || y.headerStartPos > d.headerStartPos) && (d = y);
                    }
                    u = d, f = [u];
                    _f.label = 14;
                case 14:
                    if (!!(u.serialNumber === this.bitstream.serialNumber && u.granulePosition === o.granulePosition)) return [3 /*break*/, 17];
                    n.pos = u.headerStartPos + u.totalSize;
                    return [4 /*yield*/, n.reader.loadRange(n.pos, n.pos + He)];
                case 15:
                    _f.sent();
                    y = n.readPageHeader();
                    m(y), u = y, u.serialNumber === this.bitstream.serialNumber && f.push(u);
                    _f.label = 16;
                case 16: return [3 /*break*/, 14];
                case 17:
                    m(u.granulePosition !== -1);
                    h = null, p = void 0, w = void 0, g = u, T = 0;
                    if (!(u.headerStartPos === a.startPage.headerStartPos)) return [3 /*break*/, 18];
                    p = this.granulePositionToTimestampInSamples(0), w = !0, h = 0;
                    return [3 /*break*/, 20];
                case 18:
                    p = 0, w = !1;
                    for (x = u.lacingValues.length - 1; x >= 0; x--)
                        if (u.lacingValues[x] < 255) {
                            h = x + 1;
                            break;
                        }
                    if (h === null)
                        throw new Error("Invalid page with granule position: no packets end on this page.");
                    T = h - 1;
                    y = { data: te, endPage: g, endSegmentIndex: T };
                    return [4 /*yield*/, this.demuxer.findNextPacketStart(n, y)];
                case 19:
                    if (_f.sent()) {
                        x = kn(f, u, h);
                        m(x);
                        C = wn(f, x.page, x.segmentIndex);
                        C && (u = C.page, h = C.segmentIndex);
                    }
                    else
                        for (;;) {
                            x = kn(f, u, h);
                            if (!x)
                                break;
                            C = wn(f, x.page, x.segmentIndex);
                            if (!C)
                                break;
                            if (u = C.page, h = C.segmentIndex, x.page.headerStartPos !== g.headerStartPos) {
                                g = x.page, T = x.segmentIndex;
                                break;
                            }
                        }
                    _f.label = 20;
                case 20:
                    S = null, E = null;
                    _f.label = 21;
                case 21:
                    if (!(u !== null)) return [3 /*break*/, 25];
                    m(h !== null);
                    return [4 /*yield*/, this.demuxer.readPacket(n, u, h)];
                case 22:
                    y = _f.sent();
                    if (!y)
                        return [3 /*break*/, 25];
                    if (!(u.headerStartPos === a.startPage.headerStartPos && h < a.startSegmentIndex)) {
                        C = this.createEncodedPacketFromOggPacket(y, { timestampInSamples: p, vorbisLastBlocksize: (_b = E === null || E === void 0 ? void 0 : E.vorbisBlockSize) !== null && _b !== void 0 ? _b : null }, t);
                        m(C);
                        A = this.encodedPacketToMetadata.get(C);
                        if (m(A), !w && y.endPage.headerStartPos === g.headerStartPos && y.endSegmentIndex === T ? (p = this.granulePositionToTimestampInSamples(u.granulePosition), w = !0, C = this.createEncodedPacketFromOggPacket(y, { timestampInSamples: p - A.durationInSamples, vorbisLastBlocksize: (_c = E === null || E === void 0 ? void 0 : E.vorbisBlockSize) !== null && _c !== void 0 ? _c : null }, t), m(C), A = this.encodedPacketToMetadata.get(C), m(A)) : p += A.durationInSamples, S = C, E = A, w && (Math.max(p, 0) > i || Math.max(A.timestampInSamples, 0) === i))
                            return [3 /*break*/, 25];
                    }
                    return [4 /*yield*/, this.demuxer.findNextPacketStart(n, y)];
                case 23:
                    x = _f.sent();
                    if (!x)
                        return [3 /*break*/, 25];
                    u = x.startPage, h = x.startSegmentIndex;
                    _f.label = 24;
                case 24: return [3 /*break*/, 21];
                case 25: return [2 /*return*/, S];
                case 26:
                    s();
                    return [7 /*endfinally*/];
                case 27: return [2 /*return*/];
            }
        }); });
    };
    class_55.prototype.getKeyPacket = function (e, t) { return this.getPacket(e, t); };
    class_55.prototype.getNextKeyPacket = function (e, t) { return this.getNextPacket(e, t); };
    return class_55;
}()), wn = function (r, e, t) { var s = e, i = t; e: for (;;) {
    for (i--, i; i >= 0; i--)
        if (s.lacingValues[i] < 255) {
            i++;
            break e;
        }
    if (m(i === -1), !(s.headerType & 1)) {
        i = 0;
        break;
    }
    var a = ms(r, function (o) { return o.headerStartPos < s.headerStartPos; });
    if (!a)
        return null;
    s = a, i = s.lacingValues.length;
} if (m(i !== -1), i === s.lacingValues.length) {
    var n = r[r.indexOf(s) + 1];
    m(n), s = n, i = 0;
} return { page: s, segmentIndex: i }; }, kn = function (r, e, t) { if (t > 0)
    return { page: e, segmentIndex: t - 1 }; var s = ms(r, function (i) { return i.headerStartPos < e.headerStartPos; }); return s ? { page: s, segmentIndex: s.lacingValues.length - 1 } : null; };
var Te = /** @class */ (function () {
    function Te() {
    }
    return Te;
}()), Qt = /** @class */ (function (_super) {
    __extends(class_56, _super);
    function class_56() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_56.prototype._getMajorBrand = function (e) {
        return __awaiter(this, void 0, void 0, function () { var s; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, e._mainReader.source.getSize()];
                case 1:
                    if ((_b.sent()) < 12)
                        return [2 /*return*/, null];
                    s = new je(e._mainReader);
                    return [2 /*return*/, (s.pos = 4, s.readAscii(4) !== "ftyp" ? null : s.readAscii(4))];
            }
        }); });
    };
    class_56.prototype._createDemuxer = function (e) { return new Xr(e); };
    return class_56;
}(Te)), rs = /** @class */ (function (_super) {
    __extends(class_57, _super);
    function class_57() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_57.prototype._canReadInput = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getMajorBrand(e)];
                case 1:
                    t = _b.sent();
                    return [2 /*return*/, !!t && t !== "qt  "];
            }
        }); });
    };
    Object.defineProperty(class_57.prototype, "name", {
        get: function () { return "MP4"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_57.prototype, "mimeType", {
        get: function () { return "video/mp4"; },
        enumerable: false,
        configurable: true
    });
    return class_57;
}(Qt)), ss = /** @class */ (function (_super) {
    __extends(class_58, _super);
    function class_58() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_58.prototype._canReadInput = function (e) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getMajorBrand(e)];
                case 1: return [2 /*return*/, (_b.sent()) === "qt  "];
            }
        }); });
    };
    Object.defineProperty(class_58.prototype, "name", {
        get: function () { return "QuickTime File Format"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_58.prototype, "mimeType", {
        get: function () { return "video/quicktime"; },
        enumerable: false,
        configurable: true
    });
    return class_58;
}(Qt)), qt = /** @class */ (function (_super) {
    __extends(class_59, _super);
    function class_59() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_59.prototype.isSupportedEBMLOfDocType = function (e, t) {
        return __awaiter(this, void 0, void 0, function () { var i, n, o, c, _b, l, d, u; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, e._mainReader.source.getSize()];
                case 1:
                    if ((_c.sent()) < 8)
                        return [2 /*return*/, !1];
                    i = new We(e._mainReader), n = i.readVarIntSize();
                    if (n < 1 || n > 8 || i.readUnsignedInt(n) !== k.EBML)
                        return [2 /*return*/, !1];
                    o = i.readElementSize();
                    if (o === null)
                        return [2 /*return*/, !1];
                    c = i.pos;
                    for (; i.pos < c + o;) {
                        _b = i.readElementHeader(), l = _b.id, d = _b.size, u = i.pos;
                        if (d === null)
                            return [2 /*return*/, !1];
                        switch (l) {
                            case k.EBMLVersion:
                                if (i.readUnsignedInt(d) !== 1)
                                    return [2 /*return*/, !1];
                                break;
                            case k.EBMLReadVersion:
                                if (i.readUnsignedInt(d) !== 1)
                                    return [2 /*return*/, !1];
                                break;
                            case k.DocType:
                                if (i.readString(d) !== t)
                                    return [2 /*return*/, !1];
                                break;
                            case k.DocTypeVersion:
                                if (i.readUnsignedInt(d) > 4)
                                    return [2 /*return*/, !1];
                                break;
                        }
                        i.pos = u + d;
                    }
                    return [2 /*return*/, !0];
            }
        }); });
    };
    class_59.prototype._canReadInput = function (e) { return this.isSupportedEBMLOfDocType(e, "matroska"); };
    class_59.prototype._createDemuxer = function (e) { return new Zr(e); };
    Object.defineProperty(class_59.prototype, "name", {
        get: function () { return "Matroska"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_59.prototype, "mimeType", {
        get: function () { return "video/x-matroska"; },
        enumerable: false,
        configurable: true
    });
    return class_59;
}(Te)), is = /** @class */ (function (_super) {
    __extends(is, _super);
    function is() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    is.prototype._canReadInput = function (e) { return this.isSupportedEBMLOfDocType(e, "webm"); };
    Object.defineProperty(is.prototype, "name", {
        get: function () { return "WebM"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(is.prototype, "mimeType", {
        get: function () { return "video/webm"; },
        enumerable: false,
        configurable: true
    });
    return is;
}(qt)), ns = /** @class */ (function (_super) {
    __extends(class_60, _super);
    function class_60() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_60.prototype._canReadInput = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t, s, i, n, a, o; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, e._mainReader.source.getSize()];
                case 1:
                    t = _b.sent();
                    if (t < 4)
                        return [2 /*return*/, !1];
                    s = new Tt(e._mainReader);
                    s.fileSize = t;
                    i = s.readId3();
                    i && (s.pos += i.size);
                    n = s.pos;
                    return [4 /*yield*/, s.reader.loadRange(s.pos, s.pos + 4096)];
                case 2:
                    _b.sent();
                    a = s.readNextFrameHeader(Math.min(n + 4096, t));
                    if (!a)
                        return [2 /*return*/, !1];
                    if (i)
                        return [2 /*return*/, !0];
                    s.pos = a.startPos + a.totalSize;
                    o = s.readNextFrameHeader(Math.min(n + 4096, t));
                    return [2 /*return*/, !(!o || a.channel !== o.channel || a.sampleRate !== o.sampleRate)];
            }
        }); });
    };
    class_60.prototype._createDemuxer = function (e) { return new es(e); };
    Object.defineProperty(class_60.prototype, "name", {
        get: function () { return "MP3"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_60.prototype, "mimeType", {
        get: function () { return "audio/mpeg"; },
        enumerable: false,
        configurable: true
    });
    return class_60;
}(Te)), as = /** @class */ (function (_super) {
    __extends(class_61, _super);
    function class_61() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_61.prototype._canReadInput = function (e) {
        return __awaiter(this, void 0, void 0, function () { var s, i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, e._mainReader.source.getSize()];
                case 1:
                    if ((_b.sent()) < 12)
                        return [2 /*return*/, !1];
                    s = new qe(e._mainReader), i = s.readAscii(4);
                    return [2 /*return*/, i !== "RIFF" && i !== "RIFX" ? !1 : (s.pos = 8, s.readAscii(4) === "WAVE")];
            }
        }); });
    };
    class_61.prototype._createDemuxer = function (e) { return new Qr(e); };
    Object.defineProperty(class_61.prototype, "name", {
        get: function () { return "WAVE"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_61.prototype, "mimeType", {
        get: function () { return "audio/wav"; },
        enumerable: false,
        configurable: true
    });
    return class_61;
}(Te)), os = /** @class */ (function (_super) {
    __extends(class_62, _super);
    function class_62() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    class_62.prototype._canReadInput = function (e) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, e._mainReader.source.getSize()];
                case 1: return [2 /*return*/, (_b.sent()) < 4 ? !1 : new lt(e._mainReader).readAscii(4) === "OggS"];
            }
        }); });
    };
    class_62.prototype._createDemuxer = function (e) { return new ts(e); };
    Object.defineProperty(class_62.prototype, "name", {
        get: function () { return "Ogg"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(class_62.prototype, "mimeType", {
        get: function () { return "application/ogg"; },
        enumerable: false,
        configurable: true
    });
    return class_62;
}(Te)), Tn = new rs, bn = new ss, Sn = new qt, xn = new is, yn = new ns, Cn = new as, _n = new os, So = [Tn, bn, Sn, xn, Cn, _n, yn];
exports.InputFormat = Te;
exports.IsobmffInputFormat = Qt;
exports.Mp4InputFormat = rs;
exports.QuickTimeInputFormat = ss;
exports.MatroskaInputFormat = qt;
exports.WebMInputFormat = is;
exports.Mp3InputFormat = ns;
exports.WaveInputFormat = as;
exports.OggInputFormat = os;
exports.MP4 = Tn;
exports.QTFF = bn;
exports.MATROSKA = Sn;
exports.WEBM = xn;
exports.MP3 = yn;
exports.WAVE = Cn;
exports.OGG = _n;
exports.ALL_FORMATS = So;
var jt = /** @class */ (function () {
    function class_63(e) {
        if (this._demuxerPromise = null, this._format = null, !e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (!Array.isArray(e.formats) || e.formats.some(function (t) { return !(t instanceof Te); }))
            throw new TypeError("options.formats must be an array of InputFormat.");
        if (!(e.source instanceof Re))
            throw new TypeError("options.source must be a Source.");
        this._formats = e.formats, this._source = e.source, this._mainReader = new ue(e.source);
    }
    class_63.prototype._getDemuxer = function () {
        var _this = this;
        var _b;
        return (_b = this._demuxerPromise) !== null && _b !== void 0 ? _b : (this._demuxerPromise = (function () { return __awaiter(_this, void 0, void 0, function () { var _b, _c, e; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this._mainReader.loadRange(0, 4096)];
                case 1:
                    _d.sent();
                    _b = 0, _c = this._formats;
                    _d.label = 2;
                case 2:
                    if (!(_b < _c.length)) return [3 /*break*/, 5];
                    e = _c[_b];
                    return [4 /*yield*/, e._canReadInput(this)];
                case 3:
                    if (_d.sent())
                        return [2 /*return*/, (this._format = e, e._createDemuxer(this))];
                    _d.label = 4;
                case 4:
                    _b++;
                    return [3 /*break*/, 2];
                case 5: throw new Error("Input has an unsupported or unrecognizable format.");
            }
        }); }); })());
    };
    Object.defineProperty(class_63.prototype, "source", {
        get: function () { return this._source; },
        enumerable: false,
        configurable: true
    });
    class_63.prototype.getFormat = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getDemuxer()];
                case 1: return [2 /*return*/, (_b.sent(), m(this._format), this._format)];
            }
        }); });
    };
    class_63.prototype.computeDuration = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getDemuxer()];
                case 1: return [2 /*return*/, (_b.sent()).computeDuration()];
            }
        }); });
    };
    class_63.prototype.getTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getDemuxer()];
                case 1: return [2 /*return*/, (_b.sent()).getTracks()];
            }
        }); });
    };
    class_63.prototype.getVideoTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1: return [2 /*return*/, (_b.sent()).filter(function (t) { return t.isVideoTrack(); })];
            }
        }); });
    };
    class_63.prototype.getPrimaryVideoTrack = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1: return [2 /*return*/, (_b = (_c.sent()).find(function (t) { return t.isVideoTrack(); })) !== null && _b !== void 0 ? _b : null];
            }
        }); });
    };
    class_63.prototype.getAudioTracks = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1: return [2 /*return*/, (_b.sent()).filter(function (t) { return t.isAudioTrack(); })];
            }
        }); });
    };
    class_63.prototype.getPrimaryAudioTrack = function () {
        var _b;
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, this.getTracks()];
                case 1: return [2 /*return*/, (_b = (_c.sent()).find(function (t) { return t.isAudioTrack(); })) !== null && _b !== void 0 ? _b : null];
            }
        }); });
    };
    class_63.prototype.getMimeType = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this._getDemuxer()];
                case 1: return [2 /*return*/, (_b.sent()).getMimeType()];
            }
        }); });
    };
    return class_63;
}());
exports.Input = jt;
var di = 2, li = 48e3, ui = /** @class */ (function () {
    function r(e) {
        var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        if (this._addedCounts = { video: 0, audio: 0, subtitle: 0 }, this._totalTrackCount = 0, this._trackPromises = [], this._executed = !1, this._synchronizer = new mi, this._totalDuration = null, this._maxTimestamps = new Map, this._canceled = !1, this.onProgress = void 0, this._computeProgress = !1, this._lastProgress = 0, this.utilizedTracks = [], this.discardedTracks = [], !e || typeof e != "object")
            throw new TypeError("options must be an object.");
        if (!(e.input instanceof jt))
            throw new TypeError("options.input must be an Input.");
        if (!(e.output instanceof $t))
            throw new TypeError("options.output must be an Output.");
        if (e.output._tracks.length > 0 || e.output.state !== "pending")
            throw new TypeError("options.output must be fresh: no tracks added and not started.");
        if (e.video !== void 0 && (!e.video || typeof e.video != "object"))
            throw new TypeError("options.video, when provided, must be an object.");
        if (((_b = e.video) === null || _b === void 0 ? void 0 : _b.discard) !== void 0 && typeof e.video.discard != "boolean")
            throw new TypeError("options.video.discard, when provided, must be a boolean.");
        if (((_c = e.video) === null || _c === void 0 ? void 0 : _c.forceTranscode) !== void 0 && typeof e.video.forceTranscode != "boolean")
            throw new TypeError("options.video.forceTranscode, when provided, must be a boolean.");
        if (((_d = e.video) === null || _d === void 0 ? void 0 : _d.codec) !== void 0 && !j.includes(e.video.codec))
            throw new TypeError("options.video.codec, when provided, must be one of: ".concat(j.join(", "), "."));
        if (((_f = e.video) === null || _f === void 0 ? void 0 : _f.bitrate) !== void 0 && !(e.video.bitrate instanceof H) && (!Number.isInteger(e.video.bitrate) || e.video.bitrate <= 0))
            throw new TypeError("options.video.bitrate, when provided, must be a positive integer or a quality.");
        if (((_g = e.video) === null || _g === void 0 ? void 0 : _g.width) !== void 0 && (!Number.isInteger(e.video.width) || e.video.width <= 0))
            throw new TypeError("options.video.width, when provided, must be a positive integer.");
        if (((_h = e.video) === null || _h === void 0 ? void 0 : _h.height) !== void 0 && (!Number.isInteger(e.video.height) || e.video.height <= 0))
            throw new TypeError("options.video.height, when provided, must be a positive integer.");
        if (((_j = e.video) === null || _j === void 0 ? void 0 : _j.fit) !== void 0 && !["fill", "contain", "cover"].includes(e.video.fit))
            throw new TypeError('options.video.fit, when provided, must be one of "fill", "contain", or "cover".');
        if (((_k = e.video) === null || _k === void 0 ? void 0 : _k.width) !== void 0 && e.video.height !== void 0 && e.video.fit === void 0)
            throw new TypeError("When both options.video.width and options.video.height are provided, options.video.fit must also be provided.");
        if (((_l = e.video) === null || _l === void 0 ? void 0 : _l.rotate) !== void 0 && ![0, 90, 180, 270].includes(e.video.rotate))
            throw new TypeError("options.video.rotate, when provided, must be 0, 90, 180 or 270.");
        if (e.audio !== void 0 && (!e.audio || typeof e.audio != "object"))
            throw new TypeError("options.video, when provided, must be an object.");
        if (((_m = e.audio) === null || _m === void 0 ? void 0 : _m.discard) !== void 0 && typeof e.audio.discard != "boolean")
            throw new TypeError("options.audio.discard, when provided, must be a boolean.");
        if (((_o = e.audio) === null || _o === void 0 ? void 0 : _o.forceTranscode) !== void 0 && typeof e.audio.forceTranscode != "boolean")
            throw new TypeError("options.audio.forceTranscode, when provided, must be a boolean.");
        if (((_p = e.audio) === null || _p === void 0 ? void 0 : _p.codec) !== void 0 && !G.includes(e.audio.codec))
            throw new TypeError("options.audio.codec, when provided, must be one of: ".concat(G.join(", "), "."));
        if (((_q = e.audio) === null || _q === void 0 ? void 0 : _q.bitrate) !== void 0 && !(e.audio.bitrate instanceof H) && (!Number.isInteger(e.audio.bitrate) || e.audio.bitrate <= 0))
            throw new TypeError("options.audio.bitrate, when provided, must be a positive integer or a quality.");
        if (((_u = e.audio) === null || _u === void 0 ? void 0 : _u.numberOfChannels) !== void 0 && (!Number.isInteger(e.audio.numberOfChannels) || e.audio.numberOfChannels <= 0))
            throw new TypeError("options.audio.numberOfChannels, when provided, must be a positive integer.");
        if (((_v = e.audio) === null || _v === void 0 ? void 0 : _v.sampleRate) !== void 0 && (!Number.isInteger(e.audio.sampleRate) || e.audio.sampleRate <= 0))
            throw new TypeError("options.audio.sampleRate, when provided, must be a positive integer.");
        if (e.trim !== void 0 && (!e.trim || typeof e.trim != "object"))
            throw new TypeError("options.trim, when provided, must be an object.");
        if (((_w = e.trim) === null || _w === void 0 ? void 0 : _w.start) !== void 0 && (!Number.isFinite(e.trim.start) || e.trim.start < 0))
            throw new TypeError("options.trim.start, when provided, must be a non-negative number.");
        if (((_x = e.trim) === null || _x === void 0 ? void 0 : _x.end) !== void 0 && (!Number.isFinite(e.trim.end) || e.trim.end < 0))
            throw new TypeError("options.trim.end, when provided, must be a non-negative number.");
        if (((_y = e.trim) === null || _y === void 0 ? void 0 : _y.start) !== void 0 && e.trim.end !== void 0 && e.trim.start >= e.trim.end)
            throw new TypeError("options.trim.start must be less than options.trim.end.");
        this._options = e, this.input = e.input, this.output = e.output, this._startTimestamp = (_0 = (_z = e.trim) === null || _z === void 0 ? void 0 : _z.start) !== null && _0 !== void 0 ? _0 : 0, this._endTimestamp = (_2 = (_1 = e.trim) === null || _1 === void 0 ? void 0 : _1.end) !== null && _2 !== void 0 ? _2 : 1 / 0;
        var _3 = N(), t = _3.promise, s = _3.resolve;
        this._started = t, this._start = s;
    }
    r.init = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    t = new r(e);
                    return [4 /*yield*/, t._init()];
                case 1: return [2 /*return*/, (_b.sent(), t)];
            }
        }); });
    };
    r.prototype._init = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var e, t, _d, e_12, i, _f, _g, s; return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, this.input.getTracks()];
                case 1:
                    e = _h.sent(), t = this.output.format.getSupportedTrackCounts();
                    _d = 0, e_12 = e;
                    _h.label = 2;
                case 2:
                    if (!(_d < e_12.length)) return [3 /*break*/, 9];
                    i = e_12[_d];
                    if (i.isVideoTrack() && ((_b = this._options.video) === null || _b === void 0 ? void 0 : _b.discard)) {
                        this.discardedTracks.push({ track: i, reason: "discarded_by_user" });
                        return [3 /*break*/, 8];
                    }
                    if (i.isAudioTrack() && ((_c = this._options.audio) === null || _c === void 0 ? void 0 : _c.discard)) {
                        this.discardedTracks.push({ track: i, reason: "discarded_by_user" });
                        return [3 /*break*/, 8];
                    }
                    if (this._totalTrackCount === t.total.max) {
                        this.discardedTracks.push({ track: i, reason: "max_track_count_reached" });
                        return [3 /*break*/, 8];
                    }
                    if (this._addedCounts[i.type] === t[i.type].max) {
                        this.discardedTracks.push({ track: i, reason: "max_track_count_of_type_reached" });
                        return [3 /*break*/, 8];
                    }
                    if (!i.isVideoTrack()) return [3 /*break*/, 4];
                    return [4 /*yield*/, this._processVideoTrack(i)];
                case 3:
                    _f = _h.sent();
                    return [3 /*break*/, 7];
                case 4:
                    _g = i.isAudioTrack();
                    if (!_g) return [3 /*break*/, 6];
                    return [4 /*yield*/, this._processAudioTrack(i)];
                case 5:
                    _g = (_h.sent());
                    _h.label = 6;
                case 6:
                    _f = _g;
                    _h.label = 7;
                case 7:
                    _f;
                    _h.label = 8;
                case 8:
                    _d++;
                    return [3 /*break*/, 2];
                case 9:
                    s = this.discardedTracks.filter(function (i) { return i.reason !== "discarded_by_user"; });
                    s.length > 0 && console.warn("Some tracks had to be discarded from the conversion:", s);
                    return [2 /*return*/];
            }
        }); });
    };
    r.prototype.execute = function () {
        var _b, _c;
        return __awaiter(this, void 0, void 0, function () { var _d, _f, _g, _h, e_13, _j, _k; return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    if (this._executed)
                        throw new Error("Conversion cannot be executed twice.");
                    this._executed = !0;
                    _d = this.onProgress;
                    if (!_d) return [3 /*break*/, 2];
                    this._computeProgress = !0;
                    _f = this;
                    _h = (_g = Math).min;
                    return [4 /*yield*/, this.input.computeDuration()];
                case 1:
                    _d = (_f._totalDuration = _h.apply(_g, [(_l.sent()) - this._startTimestamp, this._endTimestamp - this._startTimestamp]), (_b = this.onProgress) === null || _b === void 0 ? void 0 : _b.call(this, 0));
                    _l.label = 2;
                case 2:
                    _d;
                    return [4 /*yield*/, this.output.start()];
                case 3:
                    _l.sent(), this._start();
                    _l.label = 4;
                case 4:
                    _l.trys.push([4, 6, , 9]);
                    return [4 /*yield*/, Promise.all(this._trackPromises)];
                case 5:
                    _l.sent();
                    return [3 /*break*/, 9];
                case 6:
                    e_13 = _l.sent();
                    _j = this._canceled;
                    if (_j) return [3 /*break*/, 8];
                    return [4 /*yield*/, this.cancel()];
                case 7:
                    _j = (_l.sent());
                    _l.label = 8;
                case 8: throw _j, e_13;
                case 9:
                    _k = this._canceled;
                    if (!_k) return [3 /*break*/, 11];
                    return [4 /*yield*/, new Promise(function () { })];
                case 10:
                    _k = (_l.sent());
                    _l.label = 11;
                case 11:
                    _k;
                    return [4 /*yield*/, this.output.finalize()];
                case 12:
                    _l.sent(), this._computeProgress && ((_c = this.onProgress) === null || _c === void 0 ? void 0 : _c.call(this, 1));
                    return [2 /*return*/];
            }
        }); });
    };
    r.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!(this.output.state === "finalizing" || this.output.state === "finalized")) return [3 /*break*/, 2];
                    if (this._canceled) {
                        console.warn("Conversion already canceled.");
                        return [2 /*return*/];
                    }
                    this._canceled = !0;
                    return [4 /*yield*/, this.output.cancel()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        }); });
    };
    r.prototype._processVideoTrack = function (e) {
        var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return __awaiter(this, void 0, void 0, function () {
            var t, s, i, n, _u, a, o, c, l, d, u, f, h, p, w, g_1, T, S, E, y_1, y_2;
            var _this = this;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        t = e.codec;
                        if (!t) {
                            this.discardedTracks.push({ track: e, reason: "unknown_source_codec" });
                            return [2 /*return*/];
                        }
                        i = Fe(e.rotation + ((_c = (_b = this._options.video) === null || _b === void 0 ? void 0 : _b.rotate) !== null && _c !== void 0 ? _c : 0)), n = this.output.format.supportsVideoRotationMetadata, _u = i % 180 === 0 ? [e.codedWidth, e.codedHeight] : [e.codedHeight, e.codedWidth], a = _u[0], o = _u[1], c = a, l = o, d = c / l, u = function (g) { return Math.ceil(g / 2) * 2; };
                        ((_d = this._options.video) === null || _d === void 0 ? void 0 : _d.width) !== void 0 && this._options.video.height === void 0 ? (c = u(this._options.video.width), l = u(Math.round(c / d))) : ((_f = this._options.video) === null || _f === void 0 ? void 0 : _f.width) === void 0 && ((_g = this._options.video) === null || _g === void 0 ? void 0 : _g.height) !== void 0 ? (l = u(this._options.video.height), c = u(Math.round(l * d))) : ((_h = this._options.video) === null || _h === void 0 ? void 0 : _h.width) !== void 0 && this._options.video.height !== void 0 && (c = u(this._options.video.width), l = u(this._options.video.height));
                        return [4 /*yield*/, e.getFirstTimestamp()];
                    case 1:
                        f = _v.sent(), h = !!((_j = this._options.video) === null || _j === void 0 ? void 0 : _j.forceTranscode) || this._startTimestamp > 0 || f < 0, p = c !== a || l !== o || i !== 0 && !n, w = this.output.format.getSupportedVideoCodecs();
                        if (!(!h && !((_k = this._options.video) === null || _k === void 0 ? void 0 : _k.bitrate) && !p && w.includes(t) && (!((_l = this._options.video) === null || _l === void 0 ? void 0 : _l.codec) || ((_m = this._options.video) === null || _m === void 0 ? void 0 : _m.codec) === t))) return [3 /*break*/, 2];
                        g_1 = new Nt(t);
                        s = g_1, this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () {
                            var T, E, y, _b, _c, _d, b, _f, e_14_1;
                            var _g;
                            var e_14, _h;
                            var _j, _k;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0: return [4 /*yield*/, this._started];
                                    case 1:
                                        _l.sent();
                                        T = new we(e);
                                        _g = {};
                                        return [4 /*yield*/, e.getDecoderConfig()];
                                    case 2:
                                        E = (_g.decoderConfig = (_j = _l.sent()) !== null && _j !== void 0 ? _j : void 0, _g);
                                        if (!Number.isFinite(this._endTimestamp)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, T.getPacket(this._endTimestamp, { metadataOnly: !0 })];
                                    case 3:
                                        _b = (_k = _l.sent()) !== null && _k !== void 0 ? _k : void 0;
                                        return [3 /*break*/, 5];
                                    case 4:
                                        _b = void 0;
                                        _l.label = 5;
                                    case 5:
                                        y = _b;
                                        _l.label = 6;
                                    case 6:
                                        _l.trys.push([6, 14, 15, 20]);
                                        _c = __asyncValues(T.packets(void 0, y));
                                        _l.label = 7;
                                    case 7: return [4 /*yield*/, _c.next()];
                                    case 8:
                                        if (!(_d = _l.sent(), !_d.done)) return [3 /*break*/, 13];
                                        b = _d.value;
                                        _f = this._synchronizer.shouldWait(e.id, b.timestamp);
                                        if (!_f) return [3 /*break*/, 10];
                                        return [4 /*yield*/, this._synchronizer.wait(b.timestamp)];
                                    case 9:
                                        _f = (_l.sent());
                                        _l.label = 10;
                                    case 10:
                                        if (_f, this._canceled)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, g_1.add(b, E)];
                                    case 11:
                                        _l.sent(), this._reportProgress(e.id, b.timestamp + b.duration);
                                        _l.label = 12;
                                    case 12: return [3 /*break*/, 7];
                                    case 13: return [3 /*break*/, 20];
                                    case 14:
                                        e_14_1 = _l.sent();
                                        e_14 = { error: e_14_1 };
                                        return [3 /*break*/, 20];
                                    case 15:
                                        _l.trys.push([15, , 18, 19]);
                                        if (!(_d && !_d.done && (_h = _c.return))) return [3 /*break*/, 17];
                                        return [4 /*yield*/, _h.call(_c)];
                                    case 16:
                                        _l.sent();
                                        _l.label = 17;
                                    case 17: return [3 /*break*/, 19];
                                    case 18:
                                        if (e_14) throw e_14.error;
                                        return [7 /*endfinally*/];
                                    case 19: return [7 /*endfinally*/];
                                    case 20:
                                        g_1.close(), this._synchronizer.closeTrack(e.id);
                                        return [2 /*return*/];
                                }
                            });
                        }); })());
                        return [3 /*break*/, 5];
                    case 2: return [4 /*yield*/, e.canDecode()];
                    case 3:
                        if (!(_v.sent())) {
                            this.discardedTracks.push({ track: e, reason: "undecodable_source_codec" });
                            return [2 /*return*/];
                        }
                        ((_o = this._options.video) === null || _o === void 0 ? void 0 : _o.codec) && (w = w.filter(function (y) { var _b; return y === ((_b = _this._options.video) === null || _b === void 0 ? void 0 : _b.codec); }));
                        T = (_q = (_p = this._options.video) === null || _p === void 0 ? void 0 : _p.bitrate) !== null && _q !== void 0 ? _q : ur;
                        return [4 /*yield*/, ks(w, { width: c, height: l, bitrate: T })];
                    case 4:
                        S = _v.sent();
                        if (!S) {
                            this.discardedTracks.push({ track: e, reason: "no_encodable_target_codec" });
                            return [2 /*return*/];
                        }
                        E = { codec: S, bitrate: T, onEncodedPacket: function (y) { return _this._reportProgress(e.id, y.timestamp + y.duration); } };
                        if (p) {
                            y_1 = new gt(E);
                            s = y_1, this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () { var x, x_1, x_1_1, _b, C, A, I, _c, R, e_15_1; var e_15, _d; var _f, _g; return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0: return [4 /*yield*/, this._started];
                                    case 1:
                                        _h.sent();
                                        x = new Ut(e, { width: c, height: l, fit: (_g = (_f = this._options.video) === null || _f === void 0 ? void 0 : _f.fit) !== null && _g !== void 0 ? _g : "fill", rotation: i, poolSize: 1 }).canvases(this._startTimestamp, this._endTimestamp);
                                        _h.label = 2;
                                    case 2:
                                        _h.trys.push([2, 10, 11, 16]);
                                        x_1 = __asyncValues(x);
                                        _h.label = 3;
                                    case 3: return [4 /*yield*/, x_1.next()];
                                    case 4:
                                        if (!(x_1_1 = _h.sent(), !x_1_1.done)) return [3 /*break*/, 9];
                                        _b = x_1_1.value, C = _b.canvas, A = _b.timestamp, I = _b.duration;
                                        _c = this._synchronizer.shouldWait(e.id, A);
                                        if (!_c) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this._synchronizer.wait(A)];
                                    case 5:
                                        _c = (_h.sent());
                                        _h.label = 6;
                                    case 6:
                                        if (_c, this._canceled)
                                            return [2 /*return*/];
                                        R = new le(C, { timestamp: Math.max(A - this._startTimestamp, 0), duration: I });
                                        return [4 /*yield*/, y_1.add(R)];
                                    case 7:
                                        _h.sent(), R.close();
                                        _h.label = 8;
                                    case 8: return [3 /*break*/, 3];
                                    case 9: return [3 /*break*/, 16];
                                    case 10:
                                        e_15_1 = _h.sent();
                                        e_15 = { error: e_15_1 };
                                        return [3 /*break*/, 16];
                                    case 11:
                                        _h.trys.push([11, , 14, 15]);
                                        if (!(x_1_1 && !x_1_1.done && (_d = x_1.return))) return [3 /*break*/, 13];
                                        return [4 /*yield*/, _d.call(x_1)];
                                    case 12:
                                        _h.sent();
                                        _h.label = 13;
                                    case 13: return [3 /*break*/, 15];
                                    case 14:
                                        if (e_15) throw e_15.error;
                                        return [7 /*endfinally*/];
                                    case 15: return [7 /*endfinally*/];
                                    case 16: return [2 /*return*/];
                                }
                            }); }); })());
                        }
                        else {
                            y_2 = new gt(E);
                            s = y_2, this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () { var b, _b, _c, x, _d, e_16_1; var e_16, _f; return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0: return [4 /*yield*/, this._started];
                                    case 1:
                                        _g.sent();
                                        b = new ht(e);
                                        _g.label = 2;
                                    case 2:
                                        _g.trys.push([2, 10, 11, 16]);
                                        _b = __asyncValues(b.samples(this._startTimestamp, this._endTimestamp));
                                        _g.label = 3;
                                    case 3: return [4 /*yield*/, _b.next()];
                                    case 4:
                                        if (!(_c = _g.sent(), !_c.done)) return [3 /*break*/, 9];
                                        x = _c.value;
                                        _d = this._synchronizer.shouldWait(e.id, x.timestamp);
                                        if (!_d) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this._synchronizer.wait(x.timestamp)];
                                    case 5:
                                        _d = (_g.sent());
                                        _g.label = 6;
                                    case 6:
                                        if (_d, x.setTimestamp(Math.max(x.timestamp - this._startTimestamp, 0)), this._canceled)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, y_2.add(x)];
                                    case 7:
                                        _g.sent(), x.close();
                                        _g.label = 8;
                                    case 8: return [3 /*break*/, 3];
                                    case 9: return [3 /*break*/, 16];
                                    case 10:
                                        e_16_1 = _g.sent();
                                        e_16 = { error: e_16_1 };
                                        return [3 /*break*/, 16];
                                    case 11:
                                        _g.trys.push([11, , 14, 15]);
                                        if (!(_c && !_c.done && (_f = _b.return))) return [3 /*break*/, 13];
                                        return [4 /*yield*/, _f.call(_b)];
                                    case 12:
                                        _g.sent();
                                        _g.label = 13;
                                    case 13: return [3 /*break*/, 15];
                                    case 14:
                                        if (e_16) throw e_16.error;
                                        return [7 /*endfinally*/];
                                    case 15: return [7 /*endfinally*/];
                                    case 16:
                                        y_2.close(), this._synchronizer.closeTrack(e.id);
                                        return [2 /*return*/];
                                }
                            }); }); })());
                        }
                        _v.label = 5;
                    case 5:
                        this.output.addVideoTrack(s, { languageCode: e.languageCode, rotation: p ? 0 : i }), this._addedCounts.video++, this._totalTrackCount++, this.utilizedTracks.push(e);
                        return [2 /*return*/];
                }
            });
        });
    };
    r.prototype._processAudioTrack = function (e) {
        var _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o;
        return __awaiter(this, void 0, void 0, function () {
            var t, s, i, n, a, o, c, l, d, u_1, f, h, p, g, w_1;
            var _this = this;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        t = e.codec;
                        if (!t) {
                            this.discardedTracks.push({ track: e, reason: "unknown_source_codec" });
                            return [2 /*return*/];
                        }
                        i = e.numberOfChannels, n = e.sampleRate;
                        return [4 /*yield*/, e.getFirstTimestamp()];
                    case 1:
                        a = _p.sent(), o = (_c = (_b = this._options.audio) === null || _b === void 0 ? void 0 : _b.numberOfChannels) !== null && _c !== void 0 ? _c : i, c = (_f = (_d = this._options.audio) === null || _d === void 0 ? void 0 : _d.sampleRate) !== null && _f !== void 0 ? _f : n, l = o !== i || c !== n || this._startTimestamp > 0 || a < 0, d = this.output.format.getSupportedAudioCodecs();
                        if (!(!((_g = this._options.audio) === null || _g === void 0 ? void 0 : _g.forceTranscode) && !((_h = this._options.audio) === null || _h === void 0 ? void 0 : _h.bitrate) && !l && d.includes(t) && (!((_j = this._options.audio) === null || _j === void 0 ? void 0 : _j.codec) || this._options.audio.codec === t))) return [3 /*break*/, 2];
                        u_1 = new Lt(t);
                        s = u_1, this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () {
                            var f, p, w, _b, _c, _d, g, _f, e_17_1;
                            var _g;
                            var e_17, _h;
                            var _j, _k;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0: return [4 /*yield*/, this._started];
                                    case 1:
                                        _l.sent();
                                        f = new we(e);
                                        _g = {};
                                        return [4 /*yield*/, e.getDecoderConfig()];
                                    case 2:
                                        p = (_g.decoderConfig = (_j = _l.sent()) !== null && _j !== void 0 ? _j : void 0, _g);
                                        if (!Number.isFinite(this._endTimestamp)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, f.getPacket(this._endTimestamp, { metadataOnly: !0 })];
                                    case 3:
                                        _b = (_k = _l.sent()) !== null && _k !== void 0 ? _k : void 0;
                                        return [3 /*break*/, 5];
                                    case 4:
                                        _b = void 0;
                                        _l.label = 5;
                                    case 5:
                                        w = _b;
                                        _l.label = 6;
                                    case 6:
                                        _l.trys.push([6, 14, 15, 20]);
                                        _c = __asyncValues(f.packets(void 0, w));
                                        _l.label = 7;
                                    case 7: return [4 /*yield*/, _c.next()];
                                    case 8:
                                        if (!(_d = _l.sent(), !_d.done)) return [3 /*break*/, 13];
                                        g = _d.value;
                                        _f = this._synchronizer.shouldWait(e.id, g.timestamp);
                                        if (!_f) return [3 /*break*/, 10];
                                        return [4 /*yield*/, this._synchronizer.wait(g.timestamp)];
                                    case 9:
                                        _f = (_l.sent());
                                        _l.label = 10;
                                    case 10:
                                        if (_f, this._canceled)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, u_1.add(g, p)];
                                    case 11:
                                        _l.sent(), this._reportProgress(e.id, g.timestamp + g.duration);
                                        _l.label = 12;
                                    case 12: return [3 /*break*/, 7];
                                    case 13: return [3 /*break*/, 20];
                                    case 14:
                                        e_17_1 = _l.sent();
                                        e_17 = { error: e_17_1 };
                                        return [3 /*break*/, 20];
                                    case 15:
                                        _l.trys.push([15, , 18, 19]);
                                        if (!(_d && !_d.done && (_h = _c.return))) return [3 /*break*/, 17];
                                        return [4 /*yield*/, _h.call(_c)];
                                    case 16:
                                        _l.sent();
                                        _l.label = 17;
                                    case 17: return [3 /*break*/, 19];
                                    case 18:
                                        if (e_17) throw e_17.error;
                                        return [7 /*endfinally*/];
                                    case 19: return [7 /*endfinally*/];
                                    case 20:
                                        u_1.close(), this._synchronizer.closeTrack(e.id);
                                        return [2 /*return*/];
                                }
                            });
                        }); })());
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, e.canDecode()];
                    case 3:
                        if (!(_p.sent())) {
                            this.discardedTracks.push({ track: e, reason: "undecodable_source_codec" });
                            return [2 /*return*/];
                        }
                        f = null;
                        ((_k = this._options.audio) === null || _k === void 0 ? void 0 : _k.codec) && (d = d.filter(function (w) { return w === _this._options.audio.codec; }));
                        h = (_m = (_l = this._options.audio) === null || _l === void 0 ? void 0 : _l.bitrate) !== null && _m !== void 0 ? _m : ur;
                        return [4 /*yield*/, _t(d, { numberOfChannels: o, sampleRate: c, bitrate: h })];
                    case 4:
                        p = _p.sent();
                        if (!(!p.some(function (w) { return _e.includes(w); }) && d.some(function (w) { return _e.includes(w); }) && (o !== di || c !== li))) return [3 /*break*/, 6];
                        return [4 /*yield*/, _t(d, { numberOfChannels: di, sampleRate: li, bitrate: h })];
                    case 5:
                        g = (_p.sent()).find(function (T) { return _e.includes(T); });
                        g && (l = !0, f = g, o = di, c = li);
                        return [3 /*break*/, 7];
                    case 6:
                        f = (_o = p[0]) !== null && _o !== void 0 ? _o : null;
                        _p.label = 7;
                    case 7:
                        if (f === null) {
                            this.discardedTracks.push({ track: e, reason: "no_encodable_target_codec" });
                            return [2 /*return*/];
                        }
                        if (l)
                            s = this._resampleAudio(e, f, o, c, h);
                        else {
                            w_1 = new wt({ codec: f, bitrate: h, onEncodedPacket: function (g) { return _this._reportProgress(e.id, g.timestamp + g.duration); } });
                            s = w_1, this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () { var g, _b, _c, T, _d, e_18_1; var e_18, _f; return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0: return [4 /*yield*/, this._started];
                                    case 1:
                                        _g.sent();
                                        g = new $e(e);
                                        _g.label = 2;
                                    case 2:
                                        _g.trys.push([2, 10, 11, 16]);
                                        _b = __asyncValues(g.samples(void 0, this._endTimestamp));
                                        _g.label = 3;
                                    case 3: return [4 /*yield*/, _b.next()];
                                    case 4:
                                        if (!(_c = _g.sent(), !_c.done)) return [3 /*break*/, 9];
                                        T = _c.value;
                                        _d = this._synchronizer.shouldWait(e.id, T.timestamp);
                                        if (!_d) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this._synchronizer.wait(T.timestamp)];
                                    case 5:
                                        _d = (_g.sent());
                                        _g.label = 6;
                                    case 6:
                                        if (_d, this._canceled)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, w_1.add(T)];
                                    case 7:
                                        _g.sent(), T.close();
                                        _g.label = 8;
                                    case 8: return [3 /*break*/, 3];
                                    case 9: return [3 /*break*/, 16];
                                    case 10:
                                        e_18_1 = _g.sent();
                                        e_18 = { error: e_18_1 };
                                        return [3 /*break*/, 16];
                                    case 11:
                                        _g.trys.push([11, , 14, 15]);
                                        if (!(_c && !_c.done && (_f = _b.return))) return [3 /*break*/, 13];
                                        return [4 /*yield*/, _f.call(_b)];
                                    case 12:
                                        _g.sent();
                                        _g.label = 13;
                                    case 13: return [3 /*break*/, 15];
                                    case 14:
                                        if (e_18) throw e_18.error;
                                        return [7 /*endfinally*/];
                                    case 15: return [7 /*endfinally*/];
                                    case 16:
                                        w_1.close(), this._synchronizer.closeTrack(e.id);
                                        return [2 /*return*/];
                                }
                            }); }); })());
                        }
                        _p.label = 8;
                    case 8:
                        this.output.addAudioTrack(s, { languageCode: e.languageCode }), this._addedCounts.audio++, this._totalTrackCount++, this.utilizedTracks.push(e);
                        return [2 /*return*/];
                }
            });
        });
    };
    r.prototype._resampleAudio = function (e, t, s, i, n) {
        var _this = this;
        var a = new wt({ codec: t, bitrate: n, onEncodedPacket: function (o) { return _this._reportProgress(e.id, o.timestamp + o.duration); } });
        return this._trackPromises.push((function () { return __awaiter(_this, void 0, void 0, function () { var o, l, l_3, l_3_1, d, _b, e_19_1; var e_19, _c; return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, this._started];
                case 1:
                    _d.sent();
                    o = new hi({ sourceNumberOfChannels: e.numberOfChannels, sourceSampleRate: e.sampleRate, targetNumberOfChannels: s, targetSampleRate: i, startTime: this._startTimestamp, endTime: this._endTimestamp, onSample: function (d) { return a.add(d); } }), l = new $e(e).samples(this._startTimestamp, this._endTimestamp);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 10, 11, 16]);
                    l_3 = __asyncValues(l);
                    _d.label = 3;
                case 3: return [4 /*yield*/, l_3.next()];
                case 4:
                    if (!(l_3_1 = _d.sent(), !l_3_1.done)) return [3 /*break*/, 9];
                    d = l_3_1.value;
                    _b = this._synchronizer.shouldWait(e.id, d.timestamp);
                    if (!_b) return [3 /*break*/, 6];
                    return [4 /*yield*/, this._synchronizer.wait(d.timestamp)];
                case 5:
                    _b = (_d.sent());
                    _d.label = 6;
                case 6:
                    if (_b, this._canceled)
                        return [2 /*return*/];
                    return [4 /*yield*/, o.add(d)];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8: return [3 /*break*/, 3];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_19_1 = _d.sent();
                    e_19 = { error: e_19_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _d.trys.push([11, , 14, 15]);
                    if (!(l_3_1 && !l_3_1.done && (_c = l_3.return))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _c.call(l_3)];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_19) throw e_19.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16: return [4 /*yield*/, o.finalize()];
                case 17:
                    _d.sent(), a.close(), this._synchronizer.closeTrack(e.id);
                    return [2 /*return*/];
            }
        }); }); })()), a;
    };
    r.prototype._reportProgress = function (e, t) { var _b, _c; if (!this._computeProgress)
        return; m(this._totalDuration !== null), this._maxTimestamps.set(e, Math.max(t, (_b = this._maxTimestamps.get(e)) !== null && _b !== void 0 ? _b : -1 / 0)); var s = 0; for (var _d = 0, _f = this._maxTimestamps; _d < _f.length; _d++) {
        var _g = _f[_d], a = _g[1];
        s += a;
    } var i = s / this._totalTrackCount, n = q(i / this._totalDuration, 0, 1); n !== this._lastProgress && (this._lastProgress = n, (_c = this.onProgress) === null || _c === void 0 ? void 0 : _c.call(this, n)); };
    return r;
}()), En = 5, mi = /** @class */ (function () {
    function class_64() {
        this.maxTimestamps = new Map, this.resolvers = [];
    }
    class_64.prototype.computeMinAndMaybeResolve = function () { var e = 1 / 0; for (var _b = 0, _c = this.maxTimestamps; _b < _c.length; _b++) {
        var _d = _c[_b], t = _d[1];
        e = Math.min(e, t);
    } for (var t = 0; t < this.resolvers.length; t++) {
        var s = this.resolvers[t];
        s.timestamp - e < En && (s.resolve(), this.resolvers.splice(t, 1), t--);
    } return e; };
    class_64.prototype.shouldWait = function (e, t) { var _b; this.maxTimestamps.set(e, Math.max(t, (_b = this.maxTimestamps.get(e)) !== null && _b !== void 0 ? _b : -1 / 0)); var s = this.computeMinAndMaybeResolve(); return t - s >= En; };
    class_64.prototype.wait = function (e) { var _b = N(), t = _b.promise, s = _b.resolve; return this.resolvers.push({ timestamp: e, resolve: s }), t; };
    class_64.prototype.closeTrack = function (e) { this.maxTimestamps.delete(e), this.computeMinAndMaybeResolve(); };
    return class_64;
}()), hi = /** @class */ (function () {
    function class_65(e) {
        this.sourceSampleRate = e.sourceSampleRate, this.targetSampleRate = e.targetSampleRate, this.sourceNumberOfChannels = e.sourceNumberOfChannels, this.targetNumberOfChannels = e.targetNumberOfChannels, this.startTime = e.startTime, this.endTime = e.endTime, this.onSample = e.onSample, this.bufferSizeInFrames = Math.floor(this.targetSampleRate * 5), this.bufferSizeInSamples = this.bufferSizeInFrames * this.targetNumberOfChannels, this.outputBuffer = new Float32Array(this.bufferSizeInSamples), this.bufferStartFrame = 0, this.maxWrittenFrame = -1, this.setupChannelMixer(), this.tempSourceBuffer = new Float32Array(this.sourceSampleRate * this.sourceNumberOfChannels);
    }
    class_65.prototype.setupChannelMixer = function () { var e = this.sourceNumberOfChannels, t = this.targetNumberOfChannels; e === 1 && t === 2 ? this.channelMixer = function (s, i) { return s[i * e]; } : e === 1 && t === 4 ? this.channelMixer = function (s, i, n) { return s[i * e] * +(n < 2); } : e === 1 && t === 6 ? this.channelMixer = function (s, i, n) { return s[i * e] * +(n === 2); } : e === 2 && t === 1 ? this.channelMixer = function (s, i) { var n = i * e; return .5 * (s[n] + s[n + 1]); } : e === 2 && t === 4 ? this.channelMixer = function (s, i, n) { return s[i * e + n] * +(n < 2); } : e === 2 && t === 6 ? this.channelMixer = function (s, i, n) { return s[i * e + n] * +(n < 2); } : e === 4 && t === 1 ? this.channelMixer = function (s, i) { var n = i * e; return .25 * (s[n] + s[n + 1] + s[n + 2] + s[n + 3]); } : e === 4 && t === 2 ? this.channelMixer = function (s, i, n) { var a = i * e; return .5 * (s[a + n] + s[a + n + 2]); } : e === 4 && t === 6 ? this.channelMixer = function (s, i, n) { var a = i * e; return n < 2 ? s[a + n] : n === 2 || n === 3 ? 0 : s[a + n - 2]; } : e === 6 && t === 1 ? this.channelMixer = function (s, i) { var n = i * e; return Math.SQRT1_2 * (s[n] + s[n + 1]) + s[n + 2] + .5 * (s[n + 4] + s[n + 5]); } : e === 6 && t === 2 ? this.channelMixer = function (s, i, n) { var a = i * e; return s[a + n] + Math.SQRT1_2 * (s[a + 2] + s[a + n + 4]); } : e === 6 && t === 4 ? this.channelMixer = function (s, i, n) { var a = i * e; return n < 2 ? s[a + n] + Math.SQRT1_2 * s[a + 2] : s[a + n + 2]; } : this.channelMixer = function (s, i, n) { return n < e ? s[i * e + n] : 0; }; };
    class_65.prototype.ensureTempBufferSize = function (e) { var t = this.tempSourceBuffer.length; for (; t < e;)
        t *= 2; if (t !== this.tempSourceBuffer.length) {
        var s = new Float32Array(t);
        s.set(this.tempSourceBuffer), this.tempSourceBuffer = s;
    } };
    class_65.prototype.add = function (e) {
        return __awaiter(this, void 0, void 0, function () { var t, s, i, n, a, o, c, l, d, u, p, w, g, T, S, E, y, b, x; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!e || e._closed)
                        return [2 /*return*/];
                    t = e.numberOfFrames * e.numberOfChannels;
                    this.ensureTempBufferSize(t);
                    s = e.allocationSize({ planeIndex: 0, format: "f32" }), i = new Float32Array(this.tempSourceBuffer.buffer, 0, s / 4);
                    e.copyTo(i, { planeIndex: 0, format: "f32" });
                    n = e.timestamp - this.startTime, a = e.numberOfFrames / this.sourceSampleRate, o = Math.min(n + a, this.endTime - this.startTime), c = Math.floor(n * this.targetSampleRate), l = Math.ceil(o * this.targetSampleRate);
                    d = c;
                    _b.label = 1;
                case 1:
                    if (!(d < l)) return [3 /*break*/, 7];
                    if (d < this.bufferStartFrame)
                        return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    if (!(d >= this.bufferStartFrame + this.bufferSizeInFrames)) return [3 /*break*/, 5];
                    return [4 /*yield*/, this.finalizeCurrentBuffer()];
                case 3:
                    _b.sent(), this.bufferStartFrame += this.bufferSizeInFrames;
                    _b.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5:
                    u = d - this.bufferStartFrame;
                    m(u < this.bufferSizeInFrames);
                    p = (d / this.targetSampleRate - n) * this.sourceSampleRate, w = Math.floor(p), g = Math.ceil(p), T = p - w;
                    for (S = 0; S < this.targetNumberOfChannels; S++) {
                        E = 0, y = 0;
                        w >= 0 && w < e.numberOfFrames && (E = this.channelMixer(i, w, S)), g >= 0 && g < e.numberOfFrames && (y = this.channelMixer(i, g, S));
                        b = E + T * (y - E), x = u * this.targetNumberOfChannels + S;
                        this.outputBuffer[x] += b;
                    }
                    this.maxWrittenFrame = Math.max(this.maxWrittenFrame, u);
                    _b.label = 6;
                case 6:
                    d++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        }); });
    };
    class_65.prototype.finalizeCurrentBuffer = function () {
        return __awaiter(this, void 0, void 0, function () { var e, t, s, i; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (this.maxWrittenFrame < 0)
                        return [2 /*return*/];
                    e = (this.maxWrittenFrame + 1) * this.targetNumberOfChannels, t = new Float32Array(e);
                    t.set(this.outputBuffer.subarray(0, e));
                    s = this.bufferStartFrame / this.targetSampleRate, i = new ne({ format: "f32", sampleRate: this.targetSampleRate, numberOfChannels: this.targetNumberOfChannels, timestamp: s, data: t });
                    return [4 /*yield*/, this.onSample(i)];
                case 1:
                    _b.sent(), this.outputBuffer.fill(0), this.maxWrittenFrame = -1;
                    return [2 /*return*/];
            }
        }); });
    };
    class_65.prototype.finalize = function () { return this.finalizeCurrentBuffer(); };
    return class_65;
}());
exports.Conversion = ui;
/*!
 * Copyright (c) 2025-present, Vanilagy and contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
