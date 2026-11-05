// B"H — Procedural hero character for the Reality Engine photorealism scene.
// Yaakov's avatar: black cowboy fedora (always), clear-framed glasses (always),
// full beard, loose untucked white button-down, black leather jacket,
// black pants, black dress shoes. All geometry smooth (lathe/capsule/sphere/torus);
// no cubes, no cones, no flat planes. Face stays consistent across variants.
import * as THREE from '../../../scripts/build/three.module.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const V2 = (x, y) => new THREE.Vector2(x, y);

function mat(color, roughness = 0.7, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.0, ...extra });
}

function lathe(profile, segs = 40, phiStart = 0, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(profile.map(p => V2(p[0], p[1])), segs, phiStart, phiLength);
}

/* ---------------- head ---------------- */
function buildHead(g, M, variant, rand) {
  const head = new THREE.Group();
  const older = variant === 'older';

  // skull: lathe from neck to crown
  const skullProfile = [
    [0.052, 1.440], [0.070, 1.462], [0.088, 1.500], [0.096, 1.540],
    [0.097, 1.575], [0.090, 1.610], [0.074, 1.645], [0.048, 1.672], [0.000, 1.685],
  ];
  const skull = new THREE.Mesh(lathe(skullProfile, 36), M.skin);
  skull.scale.set(1.0, 1.0, 0.94);
  head.add(skull);

  // nose: smooth squashed sphere
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0205, 20, 14), M.skin);
  nose.scale.set(0.82, 1.25, 0.95);
  nose.position.set(0, 1.566, 0.0895);
  head.add(nose);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), M.skin);
  noseTip.position.set(0, 1.556, 0.104);
  head.add(noseTip);

  // ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.027, 14, 10), M.skin);
    ear.scale.set(0.55, 1.0, 0.8);
    ear.position.set(s * 0.094, 1.572, 0.004);
    head.add(ear);
  }

  // eyes: white + iris
  for (const s of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.0185, 16, 12), mat(0xf5f2ec, 0.35));
    white.scale.set(1, 0.82, 0.62);
    white.position.set(s * 0.0375, 1.586, 0.0805);
    head.add(white);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.0088, 12, 10), mat(0x2e2018, 0.25));
    iris.position.set(s * 0.0375, 1.586, 0.0935);
    head.add(iris);
  }

  // mouth: neutral line / smile arc / neutral (older)
  const mouthMat = mat(0x6e3b30, 0.6);
  if (variant === 'smile') {
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.0058, 8, 24, Math.PI * 0.62), mouthMat);
    smile.position.set(0, 1.516, 0.0900);
    smile.rotation.set(0.15, 0, Math.PI + (Math.PI - Math.PI * 0.62) / 2);
    head.add(smile);
  } else {
    const line = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0042, 8, 24, Math.PI * 0.30), mouthMat);
    line.position.set(0, 1.5215, 0.0885);
    line.rotation.set(0.15, 0, Math.PI + (Math.PI - Math.PI * 0.30) / 2 + Math.PI * 0.0);
    // rotate so the shallow arc sits flat like a calm mouth
    line.rotation.z = Math.PI * 1.0 + (Math.PI - Math.PI * 0.30) / 2 - Math.PI * 0.5 + Math.PI * 0.5;
    head.add(line);
  }

  // full beard: lathe curtain around jaw/chin, slightly jittered for organic feel
  // NOTE: LatheGeometry points must ascend in Y or normals flip inward (invisible front)
  const beardProfile = [
    [0.000, 1.418], [0.038, 1.421], [0.070, 1.432], [0.092, 1.452],
    [0.102, 1.478], [0.103, 1.500], [0.096, 1.510], [0.080, 1.518],
  ];
  const beardGeo = lathe(beardProfile, 36, -1.72, 3.44);
  {
    const p = beardGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const j = (rand() - 0.5) * 0.006;
      p.setXYZ(i, p.getX(i) + j, p.getY(i) + (rand() - 0.5) * 0.004, p.getZ(i) + j);
    }
    beardGeo.computeVertexNormals();
  }
  const beard = new THREE.Mesh(beardGeo, M.beard);
  beard.scale.set(1.0, 1.0, 0.96);
  head.add(beard);

  // mustache: two angled capsules
  for (const s of [-1, 1]) {
    const mo = new THREE.Mesh(new THREE.CapsuleGeometry(0.0105, 0.042, 6, 12), M.beard);
    mo.position.set(s * 0.027, 1.5375, 0.0885);
    mo.rotation.set(0.35, 0, s * 1.15);
    head.add(mo);
  }
  g.add(head);
  return head;
}

/* ---------------- fedora (always worn) ---------------- */
function buildFedora(g, M, brimVariant) {
  const B = [0.168, 0.186, 0.205][brimVariant] ?? 0.186;
  const hat = new THREE.Group();
  const profile = [
    [B, 1.662], [B * 0.96, 1.668], [0.128, 1.680], [0.104, 1.688],
    [0.098, 1.700], [0.100, 1.735], [0.094, 1.768], [0.078, 1.794],
    [0.052, 1.810], [0.022, 1.818], [0.000, 1.820],
  ];
  const crown = new THREE.Mesh(lathe(profile, 44), M.fedora);
  hat.add(crown);
  // hat band
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.1005, 0.0095, 10, 40), mat(0x2c2c30, 0.55));
  band.rotation.x = Math.PI / 2;
  band.position.y = 1.700;
  hat.add(band);
  g.add(hat);
  return hat;
}

/* ---------------- glasses (clear frames, always worn) ---------------- */
function buildGlasses(g, M) {
  const gl = new THREE.Group();
  const frameMat = mat(0x1c1c1e, 0.35);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xdfe8ee, transparent: true, opacity: 0.10, roughness: 0.06, metalness: 0.0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  for (const s of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0245, 0.0026, 8, 28), frameMat);
    rim.position.set(s * 0.0375, 1.586, 0.0945);
    gl.add(rim);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.0235, 24), lensMat);
    lens.position.set(s * 0.0375, 1.586, 0.0945);
    gl.add(lens);
    const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.085, 8), frameMat);
    temple.rotation.x = Math.PI / 2;
    temple.position.set(s * 0.0625, 1.588, 0.055);
    gl.add(temple);
  }
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0024, 8, 16, Math.PI), frameMat);
  bridge.position.set(0, 1.590, 0.0945);
  bridge.rotation.z = 0; // arc opens downward over the nose
  gl.add(bridge);
  g.add(gl);
  return gl;
}

/* ---------------- torso + clothing ---------------- */
function buildTorso(g, M, outfit) {
  const torso = new THREE.Group();
  if (outfit === 'tshirt') {
    // plain dark tee: shorter tapered torso
    const tee = new THREE.Mesh(lathe([
      [0.150, 0.94], [0.156, 1.02], [0.148, 1.14], [0.132, 1.28], [0.118, 1.38], [0.058, 1.44],
    ], 32), M.tshirt);
    tee.scale.set(1.16, 1, 0.84);
    torso.add(tee);
  } else {
    // loose untucked white button-down
    const shirt = new THREE.Mesh(lathe([
      [0.150, 0.795], [0.158, 0.88], [0.154, 1.00], [0.142, 1.16],
      [0.128, 1.30], [0.112, 1.385], [0.058, 1.44],
    ], 36), M.shirt);
    shirt.scale.set(1.18, 1, 0.84);
    torso.add(shirt);
    // collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.014, 10, 24, Math.PI * 1.5), M.shirt);
    collar.position.y = 1.442;
    collar.rotation.set(Math.PI / 2, 0, Math.PI * 0.75);
    torso.add(collar);
    // button placket hint: thin strip
    const placket = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.42, 4, 10), mat(0xe4e0d4, 0.7));
    placket.position.set(0, 1.14, 0.128);
    torso.add(placket);
  }
  if (outfit === 'jacket' || outfit === 'openjacket') {
    // black leather jacket, slightly longer than the shirt
    const open = outfit === 'openjacket';
    const prof = [
      [0.178, 0.735], [0.184, 0.86], [0.178, 1.00], [0.166, 1.16],
      [0.152, 1.30], [0.136, 1.40], [0.108, 1.455],
    ];
    const jack = new THREE.Mesh(
      lathe(prof, 40, open ? 0.52 : 0, open ? Math.PI * 2 - 1.04 : Math.PI * 2), M.jacket);
    jack.scale.set(1.16, 1, 0.86);
    torso.add(jack);
    // lapels for the open jacket
    if (open) {
      for (const s of [-1, 1]) {
        const lapel = new THREE.Mesh(new THREE.CapsuleGeometry(0.020, 0.20, 4, 10), M.jacket);
        lapel.position.set(s * 0.085, 1.30, 0.128);
        lapel.rotation.set(0.12, 0, s * 0.28);
        torso.add(lapel);
      }
    }
    // jacket collar
    const jc = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 10, 28, Math.PI * 1.6), M.jacket);
    jc.position.y = 1.452;
    jc.rotation.set(Math.PI / 2, 0, Math.PI * 0.7);
    torso.add(jc);
  }
  g.add(torso);
  return torso;
}

/* ---------------- limbs ---------------- */
function capsule(r, len, material) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), material);
}

function buildArm(g, M, side, outfit) {
  const rolled = outfit === 'shirt';       // jacket off → rolled sleeves
  const tee = outfit === 'tshirt';
  const shoulder = new THREE.Group();
  shoulder.position.set(side * 0.192, 1.398, 0);
  const upperMat = tee ? M.tshirt : (rolled ? M.shirt : (outfit === 'jacket' || outfit === 'openjacket' ? M.jacket : M.shirt));
  const upper = capsule(0.050, 0.20, upperMat);
  upper.position.y = -0.15;
  shoulder.add(upper);
  const elbow = new THREE.Group();
  elbow.position.y = -0.30;
  const foreMat = (rolled || tee) ? M.skin : upperMat;
  const fore = capsule(0.043, 0.19, foreMat);
  fore.position.y = -0.14;
  elbow.add(fore);
  if (rolled) {
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.013, 8, 20), M.shirt);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.02;
    elbow.add(cuff);
  }
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.050, 16, 12), M.skin);
  hand.scale.set(0.85, 1.25, 0.95);
  hand.position.y = -0.30;
  elbow.add(hand);
  shoulder.add(elbow);
  g.add(shoulder);
  return { shoulder, elbow };
}

function buildLeg(g, M, side) {
  const hip = new THREE.Group();
  hip.position.set(side * 0.096, 0.925, 0);
  const thigh = capsule(0.076, 0.26, M.pants);
  thigh.position.y = -0.20;
  hip.add(thigh);
  const knee = new THREE.Group();
  knee.position.y = -0.42;
  const shin = capsule(0.060, 0.26, M.pants);
  shin.position.y = -0.19;
  knee.add(shin);
  // black dress shoe: rounded toe
  const shoe = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 14), M.shoe);
  body.scale.set(0.92, 0.68, 1.75);
  body.position.set(0, -0.40, 0.045);
  shoe.add(body);
  const toe = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), M.shoe);
  toe.scale.set(0.95, 0.62, 1.1);
  toe.position.set(0, -0.415, 0.155);
  shoe.add(toe);
  knee.add(shoe);
  hip.add(knee);
  g.add(hip);
  return { hip, knee };
}

/* ---------------- poses ---------------- */
function applyPose(C, pose) {
  const J = C.joints;
  // reset
  for (const j of Object.values(J)) { j.rotation.set(0, 0, 0); }
  C.root.rotation.set(0, 0, 0);
  if (pose === 'stand' || pose === 'portrait') {
    J.shoulderL.rotation.z = 0.09; J.shoulderR.rotation.z = -0.09;
    J.shoulderL.rotation.x = 0.05; J.shoulderR.rotation.x = 0.05;
    J.elbowL.rotation.x = 0.18; J.elbowR.rotation.x = 0.18;
  } else if (pose === 'walk') {
    J.hipL.rotation.x = -0.42; J.hipR.rotation.x = 0.34;   // legs swing (fwd = -x rot)
    J.kneeL.rotation.x = 0.55; J.kneeR.rotation.x = 0.18;
    J.shoulderL.rotation.x = 0.34; J.shoulderR.rotation.x = -0.36; // counter-swing
    J.elbowL.rotation.x = 0.45; J.elbowR.rotation.x = 0.45;
    C.root.rotation.x = -0.05;
  } else if (pose === 'sit') {
    J.hipL.rotation.x = -1.42; J.hipR.rotation.x = -1.42;  // thighs forward
    J.kneeL.rotation.x = 1.32; J.kneeR.rotation.x = 1.32;  // shins down
    J.shoulderL.rotation.x = -0.62; J.shoulderR.rotation.x = -0.62; // forearms toward knees
    J.elbowL.rotation.x = 0.40; J.elbowR.rotation.x = 0.40;
    J.shoulderL.rotation.z = 0.10; J.shoulderR.rotation.z = -0.10;
  }
}

/* ---------------- main builder ---------------- */
// opts: { head: 'neutral'|'smile'|'older', outfit: 'jacket'|'shirt'|'tshirt'|'openjacket',
//         brim: 0|1|2, pose: 'stand'|'walk'|'sit'|'portrait', seed }
export function buildCharacter(opts = {}) {
  const { head = 'neutral', outfit = 'jacket', brim = 1, pose = 'stand', seed = 777 } = opts;
  const rand = mulberry32(seed);
  const older = head === 'older';

  const M = {
    skin: mat(older ? 0xbd9278 : 0xc99f82, 0.55),
    beard: mat(older ? 0x9a948a : 0x241a12, 0.85),
    fedora: mat(0x131214, 0.62),
    shirt: mat(0xefece4, 0.75),
    jacket: mat(0x17161a, 0.42),
    tshirt: mat(0x2b2b30, 0.8),
    pants: mat(0x18181b, 0.8),
    shoe: mat(0x0e0e10, 0.32),
  };

  const root = new THREE.Group();
  const g = new THREE.Group();
  root.add(g);

  buildTorso(g, M, outfit);
  buildHead(g, M, head, rand);
  buildFedora(g, M, brim);
  buildGlasses(g, M);

  const joints = {
    ...{ shoulderL: null, elbowL: null, shoulderR: null, elbowR: null },
    ...{ hipL: null, kneeL: null, hipR: null, kneeR: null },
  };
  const aL = buildArm(g, M, -1, outfit); joints.shoulderL = aL.shoulder; joints.elbowL = aL.elbow;
  const aR = buildArm(g, M, 1, outfit); joints.shoulderR = aR.shoulder; joints.elbowR = aR.elbow;
  const lL = buildLeg(g, M, -1); joints.hipL = lL.hip; joints.kneeL = lL.knee;
  const lR = buildLeg(g, M, 1); joints.hipR = lR.hip; joints.kneeR = lR.knee;

  const C = { root, joints, opts: { head, outfit, brim, pose } };
  applyPose(C, pose);

  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return C;
}

export function setCharacterPose(C, pose) {
  C.opts.pose = pose;
  applyPose(C, pose);
}
