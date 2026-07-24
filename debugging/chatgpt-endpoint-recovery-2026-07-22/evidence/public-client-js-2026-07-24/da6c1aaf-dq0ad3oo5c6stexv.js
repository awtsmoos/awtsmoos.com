import{n as e,s as t}from"./f025431a-ehagpvg3m4e1cduv.js";import{BKt as n,C8 as r,Cft as i,Ct as a,Dft as o,Dx as s,Ft as c,Gn as l,HGt as u,Hn as d,Ht as f,Ift as p,Iwt as m,J$ as h,Jt as g,Jxt as _,Kn as v,Lft as y,Nt as b,Oft as x,Oi as S,Ox as C,Pt as w,Qqt as T,Rwt as E,S$ as D,S8 as ee,St as te,Un as ne,Ut as re,Wn as ie,X5 as ae,Xt as oe,Y$ as se,Yt as ce,Zt as le,_8 as ue,_Lt as de,bLt as fe,bQ as pe,bbt as me,bft as he,c5 as ge,cft as _e,d5 as ve,e7 as ye,fn as be,gLt as xe,gn as O,hn as Se,jft as Ce,ki as we,l5 as Te,lKt as Ee,mJt as k,n5 as De,pJt as A,qn as Oe,qxt as j,r5 as ke,v8 as M,wft as Ae,x$ as je,x8 as Me,yQ as Ne,ybt as Pe,yft as Fe}from"./4813494d-btp8cmrhquskot7i.js";import{$t as Ie,Lt as N,_n as P,an as F,dn as I,fn as Le,in as L,mn as Re,nn as ze,on as R,pn as z,rn as Be,vn as Ve}from"./2340486e-gh6s19h8ofjisiyk.js";import{am as He,im as Ue}from"./conversation-small-ko3jpga154949ful.js";import{Ct as We,St as Ge,n as Ke,t as qe}from"./30901919-dzcifvhacckjprwe.js";var B,V,H,U,W,G,K,Je,Ye,Xe=e((()=>{Ve(),Le(),Re(),B=new WeakMap,V=new WeakMap,H=new WeakMap,U=new WeakMap,W=new WeakMap,G=new WeakMap,K=new WeakMap,Je=class{constructor(e,t){P(this,B,void 0),P(this,V,void 0),P(this,H,void 0),P(this,U,[]),P(this,W,{}),P(this,G,void 0),P(this,K,void 0),I(H,this,e);let n=e.getUniformBlockIndex(t,Ye._),r=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_DATA_SIZE);I(G,this,e.createBuffer()),e.bindBuffer(e.UNIFORM_BUFFER,z(G,this)),e.bufferData(e.UNIFORM_BUFFER,r,e.DYNAMIC_DRAW),e.bindBufferBase(e.UNIFORM_BUFFER,0,z(G,this)),e.uniformBlockBinding(t,n,0);let i=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);I(U,this,[]),I(W,this,{});for(let n=0;n<i.length;n++){let r=i[n];if(r==null)continue;let a=e.getActiveUniform(t,r);if(!a)throw Error(`No uniformInfo for index `+r);let o=a.name;o=o.replace(/\[0\]$/,``);let s=e.getActiveUniforms(t,[r],e.UNIFORM_OFFSET),c=Array.isArray(s)&&s.length>0?s[0]:0;z(U,this).push(o),z(W,this)[o]=c}I(K,this,new ArrayBuffer(r)),I(B,this,new Float32Array(z(K,this))),I(V,this,new Int32Array(z(K,this)))}setVariablesAndRender(e){for(let t of z(U,this)){let[,n]=t.split(`.`),r=z(W,this)[t]/4,i=e[n];typeof i==`number`?z(B,this)[r]=i:typeof i==`boolean`?z(V,this)[r]=+!!i:Array.isArray(i)&&z(B,this).set(i,r)}z(H,this).bindBuffer(z(H,this).UNIFORM_BUFFER,z(G,this)),z(H,this).bufferSubData(z(H,this).UNIFORM_BUFFER,0,z(K,this)),z(H,this).drawArrays(z(H,this).TRIANGLE_STRIP,0,6)}},Ye={_:`BlorbUniformsObject`}})),Ze,Qe=e((()=>{Ze=`#version 300 es
#define E (2.71828182846)
#define pi (3.14159265358979323844)

precision highp float;

struct ColoredSDF {
  float distance;
  vec4 color;
};

struct SDFArgs {
  vec2 st;
  float amount;
  float duration;
  float time;
  float mainRadius;
};

/* ----------------------- Utilities actually used ----------------------- */

float scaled(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), float(0), float(1));
}

float spring(float t, float d) {
  return 1.0 - exp(-E * 2.0 * t) * cos((1.0 - d) * 115.0 * t);
}

float bounce(float t, float d) {
  return -sin(pi * (1.0 - d) * t) * (1.0 - t) * exp(-E * 2.0 * t) * t * 10.0;
}

float opSmoothUnion(float d1, float d2, float k) {
  if (k <= 0.0) k = 0.000001;
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
  r.xy = p.x > 0.0 ? r.xy : r.zw;
  r.x = p.y > 0.0 ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

/* --------------------------- Active states ----------------------------- */

ColoredSDF applyIdleState(
  ColoredSDF sdf,
  SDFArgs args,
  bool isWhiteForeground
) {
  float midRadius = 0.12;
  float maxRadius = 0.3;
  float t1 = 1.0;
  float gamma = 3.0;
  float omega = pi / 2.0;

  float k = exp(-gamma) * omega;

  float radius;
  if (args.time <= t1) {
    float t_prime = args.time / t1;
    float springValue = 1.0 - exp(-gamma * t_prime) * cos(omega * t_prime);
    radius = midRadius * springValue;
  } else {
    float adjustedTime = args.time - t1;
    radius =
      midRadius + (maxRadius - midRadius) * (1.0 - exp(-k * adjustedTime));
  }

  float distance = length(args.st) - radius;
  sdf.distance = mix(sdf.distance, distance, args.amount);

  
  float alpha = sin(pi / 0.7 * args.time) * 0.3 + 0.7;
  vec4 color = vec4(isWhiteForeground ? vec3(1.0) : vec3(0.0), alpha);
  sdf.color = mix(sdf.color, color, args.amount);

  return sdf;
}

ColoredSDF applySpeakState(
  ColoredSDF sdf,
  SDFArgs args,
  vec4 avgMag,
  float silenceAmount,
  float silenceDuration
) {
  float d = 1000.0;
  const int barCount = 4;

  float totalSpan = args.mainRadius * 1.9;
  float slotWidth = totalSpan / float(barCount);
  float gapRatio = clamp(0.35, 0.0, 0.9);
  float baseBarHalfWidth = slotWidth * (1.0 - gapRatio) * 0.5;

  for (int i = 0; i < barCount; i++) {
    float f = (float(i) + 0.5) / float(barCount);

    float w = baseBarHalfWidth;
    float h = w;

    float wave = sin(f * pi * 0.8 + args.time) * 0.5 + 0.5;
    float entryAnimation = spring(
      scaled(0.1 + wave * 0.4, 1.0 + wave * 0.4, args.duration),
      0.98
    );

    vec2 pos = vec2(f - 0.5, 0.0) * totalSpan;
    pos.y = 0.25 * (1.0 - entryAnimation);

    
    if (silenceAmount > 0.0) {
      float bounceStagger = f / 5.0;
      float bounceDelay = 0.6;
      float bounceTimer = scaled(
        bounceDelay,
        bounceDelay + 1.0,
        fract((silenceDuration + bounceStagger) / 2.0) * 2.0
      );
      pos.y +=
        bounce(bounceTimer, 6.0) *
        w *
        0.25 *
        silenceAmount *
        pow(entryAnimation, 4.0) *
        pow(args.amount, 4.0);
    }

    
    h += avgMag[i] * (0.1 + (1.0 - abs(f - 0.5) * 2.0) * 0.1);

    float dd = sdRoundedBox(args.st - pos, vec2(w, h), vec4(w));
    d = opSmoothUnion(d, dd, 0.2 * (1.0 - args.amount));
  }

  sdf.distance = mix(sdf.distance, d, args.amount);
  sdf.color.a = 1.0;
  return sdf;
}

/* ------------------------------ I/O & UBO ------------------------------ */

in vec2 out_uv;
out vec4 fragColor;

layout(std140) uniform BlorbUniformsObject {
  float time;
  float speakTimestamp;
  vec4 avgMag;
  vec2 viewport;
  float screenScaleFactor;
  float silenceAmount;
  float silenceTimestamp;
  bool isWhiteForeground;
} ubo; 

/* -------------------------------- main --------------------------------- */

void main() {
  vec2 st = out_uv - 0.5;
  float viewRatio = ubo.viewport.y / ubo.viewport.x;
  st.y *= viewRatio;

  ColoredSDF sdf;
  sdf.distance = 1000.0;
  sdf.color = vec4(1.0);

  SDFArgs args;
  args.st = st;
  args.time = ubo.time;
  args.mainRadius = 0.49;
  args.amount = 1.0;
  args.duration = ubo.time - ubo.speakTimestamp;

  
  SDFArgs idleArgs = args;
  idleArgs.amount = 1.0;
  sdf = applyIdleState(sdf, idleArgs, ubo.isWhiteForeground);

  float silenceDuration = ubo.time - ubo.silenceTimestamp;
  sdf = applySpeakState(
    sdf,
    args,
    ubo.avgMag,
    ubo.silenceAmount,
    silenceDuration
  );

  float clampingTolerance = 0.0075 / max(ubo.screenScaleFactor, 0.0001);
  float clampedShape = smoothstep(clampingTolerance, 0.0, sdf.distance);
  float alpha = sdf.color.a * clampedShape;
  fragColor = vec4(sdf.color.rgb * alpha, alpha);
}`})),$e,et=e((()=>{$e=`#version 300 es

out vec4 out_position;
out vec2 out_uv;

const vec4 blitFullscreenTrianglePositions[6] = vec4[](
  vec4(-1.0, -1.0, 0.0, 1.0),
  vec4(3.0, -1.0, 0.0, 1.0),
  vec4(-1.0, 3.0, 0.0, 1.0),
  vec4(-1.0, -1.0, 0.0, 1.0),
  vec4(3.0, -1.0, 0.0, 1.0),
  vec4(-1.0, 3.0, 0.0, 1.0)
);

void main() {
  out_position = blitFullscreenTrianglePositions[gl_VertexID];
  out_uv = out_position.xy * 0.5 + 0.5;
  out_uv.y = 1.0 - out_uv.y;
  gl_Position = out_position;
}`}));function tt({className:e,staticConfig:t,onDynamicConfigSetterReady:n,onRenderComplete:r}){"use no forget";let i=(0,q.useRef)(performance.now()/1e3),a=(0,q.useRef)({viewport:rt,time:i.current}).current,o=(0,q.useRef)(void 0),s=(0,q.useRef)({...a,...t,speakTimestamp:0,avgMag:[0,0,0,0],silenceAmount:0,silenceTimestamp:0}),c=(0,q.useCallback)(e=>{s.current={...a,...t,...e},o.current=e},[a,t]);return(0,q.useEffect)(()=>{o.current&&(s.current={...a,...t,...o.current})},[t,a]),(0,q.useEffect)(()=>{n(c)},[n,c]),(0,q.useEffect)(()=>{let e=setInterval(()=>{a.time=performance.now()/1e3},g);return()=>clearInterval(e)},[a]),(0,nt.jsx)(f,{className:A(`flex items-center justify-center`,e),variablesRef:s,onViewportUpdate:e=>{a.viewport=[e.width,e.height]},onGlAvailable:void 0,onCanvasSizeUpdate:void 0,onRenderComplete:r,scale:1,GLUniformsSetter:Je,vert:$e,frag:Ze})}var q,nt,rt,it=e((()=>{re(),ce(),k(),q=t(R()),Xe(),Qe(),et(),nt=F(),rt=[300,300]}));function at(e){return e.origin===`local`}function ot(e){return e*dt}function st(){w()||c()}var ct,lt,ut,dt,ft,pt,mt=e((()=>{ct=N(),oe(),se(),b(),je(),lt=t(R()),it(),ut=F(),dt=1.4,ft={bands:4,loPass:0,hiPass:400},pt=e=>{"use forget";let t=(0,ct.c)(12),{className:n}=e,[r,i]=(0,lt.useState)(void 0),{getTracks:a}=D(),o;t[0]===a?o=t[1]:(o=a([h.Microphone]).find(at),t[0]=a,t[1]=o);let s=le(o?.track,ft),c;t[2]===s?c=t[3]:(c=s.map(ot),t[2]=s,t[3]=c);let l=c,u=st,d,f;t[4]!==l||t[5]!==r?(d=()=>{r&&r({speakTimestamp:0,avgMag:l,silenceAmount:0,silenceTimestamp:0})},f=[l,r],t[4]=l,t[5]=r,t[6]=d,t[7]=f):(d=t[6],f=t[7]),(0,lt.useEffect)(d,f);let p;t[8]===Symbol.for(`react.memo_cache_sentinel`)?(p={screenScaleFactor:window.devicePixelRatio,isWhiteForeground:!0},t[8]=p):p=t[8];let m=p,g;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(g=e=>{i(()=>e)},t[9]=g):g=t[9];let _=g,v;return t[10]===n?v=t[11]:(v=(0,ut.jsx)(tt,{className:n,staticConfig:m,onDynamicConfigSetterReady:_,onRenderComplete:u}),t[10]=n,t[11]=v),v}})),ht,gt,_t=e((()=>{ht={ON:{colorClass:`!bg-black/5 !hover:bg-black/10 !active:bg-black/20 !dark:bg-[rgba(255,255,255,0.04)] !dark:hover:bg-white/5 !dark:active:bg-white/10`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:void 0},OFF:{colorClass:`bg-red-500! hover:bg-red-400! active:bg-red-600! dark:bg-red-500! dark:hover:bg-red-400! dark:active:bg-red-600!`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`text-white`}},gt={ON:{colorClass:`bg-gray-900 hover:bg-gray-800 active:bg-gray-700`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`text-token-main-surface-primary hover:text-token-text-inverted`},OFF:{colorClass:`bg-black/5 hover:bg-black/10 active:bg-black/20 dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-white/5 dark:active:bg-white/10`,sizeClass:`!h-9 !w-9 !min-h-9 touch:!min-h-9`,iconColorClass:`hover:text-token-text-inverted`}}}));function vt(e){return e.server.connectionState===Ce.Connected}function yt(e){return e.server.remoteState===p.Listening||e.server.remoteState===p.Speaking}function bt(){return ge()}var J,xt,Y,X,St,Ct,wt,Tt,Et,Dt,Z,Ot=e((()=>{J=N(),me(),qe(),mt(),xe(),a(),n(),_(),O(),y(),M(),k(),xt=t(R()),Be(),Te(),_e(),_t(),i(),Y=F(),X={buttonLayout:`rounded-full overflow-hidden h-9 px-3`,buttonContents:`flex flex-row items-center justify-center gap-2`,buttonColors:`hover:opacity-80 font-semibold transition-colors transition-width duration-500 ease-in-out`,loadingColor:`bg-token-icon-primary text-token-text-inverted px-0`,loadedColor:`bg-token-bg-accent-static text-token-text-inverted-static`},St=`relative overflow-visible before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:content-[''] before:shadow-[0_0_18px_6px_rgba(250,226,113,0.6)] before:opacity-90 before:animate-[pulse_2.4s_ease-in-out_infinite]`,Ct=`bg-[#fae271] text-[#a96e25] hover:bg-[#f6dc63] active:bg-[#f0d35a]`,wt=e=>{"use forget";let t=(0,J.c)(7),{className:n,Icon:r}=e,i;t[0]===n?i=t[1]:(i=A(n,`relative`),t[0]=n,t[1]=i);let a;t[2]===r?a=t[3]:(a=(0,Y.jsx)(r,{className:`absolute start-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2`}),t[2]=r,t[3]=a);let o;return t[4]!==i||t[5]!==a?(o=(0,Y.jsx)(`div`,{className:i,children:a}),t[4]=i,t[5]=a,t[6]=o):o=t[6],o},Tt=()=>{"use forget";let e=(0,J.c)(5),[t,n]=(0,xt.useState)(!0),i=r(vt),a=r(yt),o,s;return e[0]!==i||e[1]!==a||e[2]!==t?(o=()=>{i&&a&&t?n(!1):i||n(!0)},s=[i,a,t],e[0]=i,e[1]=a,e[2]=t,e[3]=o,e[4]=s):(o=e[3],s=e[4]),(0,xt.useEffect)(o,s),t},Et=e=>{"use forget";let t=(0,J.c)(15),{onClick:n,hasExceededRateLimit:r,isEndingVoiceSession:i,isLoading:a}=e,o=L(),s,c;i?(s=Z.endingVoiceSessionLabel,c=j):a&&!r?(s=Z.cancelLoadingAriaLabel,c=Pe):(s=Z.endVoiceAriaLabel,c=Pe);let l;t[0]!==s||t[1]!==o?(l=o.formatMessage(s),t[0]=s,t[1]=o,t[2]=l):l=t[2];let u=c,d=i&&`pointer-events-none`,f;t[3]===d?f=t[4]:(f=A(`keyboard-focused:focus-ring`,d),t[3]=d,t[4]=f);let p;t[5]!==s||t[6]!==o?(p=o.formatMessage(s),t[5]=s,t[6]=o,t[7]=p):p=t[7];let m;return t[8]!==c||t[9]!==i||t[10]!==n||t[11]!==l||t[12]!==f||t[13]!==p?(m=(0,Y.jsx)(be,{"aria-label":l,onClick:n,icon:u,iconSize:`icon-md`,buttonSize:ht.ON.sizeClass,className:f,disabled:i,iconColor:`text-token-text-inverted`,tooltipPrimaryLabel:p}),t[8]=c,t[9]=i,t[10]=n,t[11]=l,t[12]=f,t[13]=p,t[14]=m):m=t[14],m},Dt=e=>{"use forget";let t=(0,J.c)(27),{onClick:n}=e,r=Tt(),i=L(),a=Fe(),o=T(bt)?.id!=null,[s,c]=(0,xt.useState)(!1),l=Ae();if(de()){let e;return t[0]!==o||t[1]!==a||t[2]!==r||t[3]!==n?(e=(0,Y.jsx)(Et,{onClick:n,hasExceededRateLimit:o,isEndingVoiceSession:a,isLoading:r}),t[0]=o,t[1]=a,t[2]=r,t[3]=n,t[4]=e):e=t[4],e}let u,d,f;a?(u=j,d=Z.endingVoiceSessionLabel,f=Z.endingVoiceSessionLabel):r&&!o?(u=s?Ke:j,d=Z.cancelLoadingAriaLabel,f=Z.cancelLoadingButtonLabel):(u=l&&fe()?te:pt,d=Z.endVoiceAriaLabel,f=Z.endVoiceButtonLabel);let p=r||a,m,h,g,_;t[5]===Symbol.for(`react.memo_cache_sentinel`)?(m=()=>c(!0),h=()=>c(!1),g=()=>c(!0),_=()=>c(!1),t[5]=m,t[6]=h,t[7]=g,t[8]=_):(m=t[5],h=t[6],g=t[7],_=t[8]);let v;t[9]!==d||t[10]!==i?(v=i.formatMessage(d),t[9]=d,t[10]=i,t[11]=v):v=t[11];let y=p&&X.loadingColor,b=!p&&(l?Ct:X.loadedColor),x=!p&&l&&St,S;t[12]!==y||t[13]!==b||t[14]!==x?(S=A(X.buttonLayout,X.buttonContents,X.buttonColors,y,b,x),t[12]=y,t[13]=b,t[14]=x,t[15]=S):S=t[15];let C;t[16]===u?C=t[17]:(C=(0,Y.jsx)(wt,{Icon:u,className:`h-3 w-3`}),t[16]=u,t[17]=C);let w;t[18]===f?w=t[19]:(w=(0,Y.jsx)(Ie,{...f}),t[18]=f,t[19]=w);let E;return t[20]!==a||t[21]!==n||t[22]!==C||t[23]!==w||t[24]!==v||t[25]!==S?(E=(0,Y.jsxs)(`button`,{onMouseOver:m,onMouseOut:h,onFocus:g,onBlur:_,"aria-label":v,type:`button`,className:S,onClick:n,disabled:a,children:[C,w]}),t[20]=a,t[21]=n,t[22]=C,t[23]=w,t[24]=v,t[25]=S,t[26]=E):E=t[26],E},Z=ze({endVoiceButtonLabel:{id:`integratedux.endVoiceMode`,defaultMessage:`End`},cancelLoadingButtonLabel:{id:`integratedux.cancelLoading`,defaultMessage:`Cancel`},endVoiceAriaLabel:{id:`integratedux.endVoiceAriaLabel`,defaultMessage:`End Voice`},cancelLoadingAriaLabel:{id:`integratedux.cancelLoadingAria`,defaultMessage:`Cancel loading`},endingVoiceSessionLabel:{id:`integratedux.endingVoiceSession`,defaultMessage:`Ending…`}})})),kt,At,jt,Mt,Nt,Pt,Ft=e((()=>{kt=N(),v(),ie(),O(),k(),At=t(R()),Be(),_t(),jt=F(),Mt=1e3,Nt=e=>{"use forget";let t=(0,kt.c)(20),{disabled:n,onClick:r,microphoneLabel:i,microphoneActive:a,microphoneForceMuted:o}=e,[s,c]=(0,At.useState)(!1),u,d;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(u=()=>{let e=window.setTimeout(()=>c(!0),Mt);return()=>{window.clearTimeout(e)}},d=[],t[0]=u,t[1]=d):(u=t[0],d=t[1]),(0,At.useEffect)(u,d);let f=L(),p=a||!s,m=p?Oe:l,{colorClass:h,sizeClass:g,iconColorClass:_}=ht[p?`ON`:`OFF`],v;t[2]!==f||t[3]!==a||t[4]!==o?(v=o?f.formatMessage(Pt.microphoneMuted):a?f.formatMessage(Pt.microphoneOff):f.formatMessage(Pt.microphoneOn),t[2]=f,t[3]=a,t[4]=o,t[5]=v):v=t[5];let y=v,b=!a,x;t[6]===b?x=t[7]:(x={isOnAfterRelease:b},t[6]=b,t[7]=x);let S=n&&s,C;t[8]!==h||t[9]!==g?(C=A(h,g),t[8]=h,t[9]=g,t[10]=C):C=t[10];let w;return t[11]!==m||t[12]!==_||t[13]!==i||t[14]!==r||t[15]!==y||t[16]!==x||t[17]!==S||t[18]!==C?(w=(0,jt.jsx)(be,{"aria-label":y,buttonSound:x,onClick:r,icon:m,iconSize:`icon-md`,disabled:S,className:C,iconColor:_,tooltipPrimaryLabel:y,tooltipSecondaryLabel:i}),t[11]=m,t[12]=_,t[13]=i,t[14]=r,t[15]=y,t[16]=x,t[17]=S,t[18]=C,t[19]=w):w=t[19],w},Pt=ze({microphoneMuted:{id:`integrated-ux.mute-button.microphone-muted`,defaultMessage:`Microphone muted in system settings / hardware switch`},microphoneOff:{id:`integrated-ux.mute-button.microphone-off`,defaultMessage:`Turn off microphone`},microphoneOn:{id:`integrated-ux.mute-button.microphone-on`,defaultMessage:`Turn on microphone`}})})),It,Lt,Rt,zt=e((()=>{It=N(),Ne(),M(),_e(),Ft(),Lt=F(),Rt=()=>{"use forget";let e=(0,It.c)(6),{isMuting:t,toggleMute:n}=ee(),{disconnectPending:r}=pe(),{forceMuted:i,active:a,label:o,granted:s}=he(),c=t||r||i||!s,l=s&&a,u;return e[0]!==i||e[1]!==o||e[2]!==c||e[3]!==l||e[4]!==n?(u=(0,Lt.jsx)(Nt,{disabled:c,onClick:n,microphoneActive:l,microphoneForceMuted:i,microphoneLabel:o}),e[0]=i,e[1]=o,e[2]=c,e[3]=l,e[4]=n,e[5]=u):u=e[5],u}})),Bt,Vt,Ht,Q,Ut=e((()=>{Bt=N(),_(),d(),Ge(),O(),k(),Be(),_t(),Vt=F(),Ht=e=>{"use forget";let t=(0,Bt.c)(14),{waiting:n,started:r,onClick:i}=e,a=L(),o;t[0]!==a||t[1]!==r||t[2]!==n?(o=n?a.formatMessage(Q.screensharePending):r?a.formatMessage(Q.screenshareOn):a.formatMessage(Q.screenshareOff),t[0]=a,t[1]=r,t[2]=n,t[3]=o):o=t[3];let s=o,{colorClass:c,sizeClass:l,iconColorClass:u}=gt[r?`ON`:`OFF`],d=n?j:r?ne:We,f;t[4]!==c||t[5]!==l?(f=A(c,l),t[4]=c,t[5]=l,t[6]=f):f=t[6];let p;return t[7]!==d||t[8]!==u||t[9]!==i||t[10]!==s||t[11]!==f||t[12]!==n?(p=(0,Vt.jsx)(be,{"aria-label":s,onClick:i,disabled:n,icon:d,iconSize:`icon-md`,className:f,iconColor:u}),t[7]=d,t[8]=u,t[9]=i,t[10]=s,t[11]=f,t[12]=n,t[13]=p):p=t[13],p},Q=ze({screenshareOff:{id:`integrated-ux.screenshare-button.screenshare-off`,defaultMessage:`Activate screenshare`},screenshareOn:{id:`integrated-ux.screenshare-button.screenshare-on`,defaultMessage:`Turn off screenshare`},screensharePending:{id:`integrated-ux.screenshare-button.pending`,defaultMessage:`Pending screenshare activation`}})})),Wt,Gt,Kt,qt=e((()=>{Wt=N(),M(),R(),Ut(),Gt=F(),Kt=()=>{"use forget";let e=(0,Wt.c)(7),{screenshareTrackState:t,toggleScreenShare:n}=Me(),r;e[0]===Symbol.for(`react.memo_cache_sentinel`)?(r=[ue.Starting,ue.Stopping],e[0]=r):r=e[0];let i=r.includes(t),a=t===ue.Started,o;e[1]===n?o=e[2]:(o=()=>n(`ControlButton`),e[1]=n,e[2]=o);let s;return e[3]!==a||e[4]!==o||e[5]!==i?(s=(0,Gt.jsx)(Ht,{waiting:i,started:a,onClick:o}),e[3]=a,e[4]=o,e[5]=i,e[6]=s):s=e[6],s}}));function Jt(e){return e.server.connectionState}var Yt,$,Xt,Zt=e((()=>{Yt=N(),Ee(),s(),E(),S(),He(),ae(),n(),O(),M(),Te(),x(),ke(),Ot(),zt(),qt(),$=F(),Xt=e=>{"use forget";let t=(0,Yt.c)(22),{isComposerSubmitDisabled:n,isComposerSubmitPending:i,onComposerSubmit:a}=e,s=ve(),c=C(),l;t[0]===c.conversation?l=t[1]:(l=c.conversation??m(u),t[0]=c.conversation,t[1]=l);let d=l,f=we(),p;t[2]===c?p=t[3]:(p=()=>ye(c),t[2]=c,t[3]=p);let h=!T(p),g=T(f.hasUploadInProgress$),_;t[4]===f?_=t[5]:(_=()=>f.files$().length>0,t[4]=f,t[5]=_);let v=T(_),y=h||g||v,b=r(Jt),x;t[6]!==b||t[7]!==s?(x=async()=>{De({type:`STOP`,reason:await o({connectionState:b,isLimitExceeded:s})})},t[6]=b,t[7]=s,t[8]=x):x=t[8];let S=x,w;t[9]===y?w=t[10]:(w=!y&&(0,$.jsxs)($.Fragment,{children:[(0,$.jsx)(Se,{capability:`screenshare`,children:(0,$.jsx)(Kt,{})}),(0,$.jsx)(Rt,{})]}),t[9]=y,t[10]=w);let E;t[11]!==c||t[12]!==y||t[13]!==d||t[14]!==S||t[15]!==n||t[16]!==i||t[17]!==a?(E=y?(0,$.jsx)(Ue,{onSubmit:a,composerController:c,conversation:d,isStreaming:!1,isDisabled:n,showSpinner:i}):(0,$.jsx)(Dt,{onClick:S}),t[11]=c,t[12]=y,t[13]=d,t[14]=S,t[15]=n,t[16]=i,t[17]=a,t[18]=E):E=t[18];let D;return t[19]!==w||t[20]!==E?(D=(0,$.jsxs)(`div`,{className:`flex flex-row gap-2`,children:[w,E]}),t[19]=w,t[20]=E,t[21]=D):D=t[21],D}}));function Qt(e){return e.isVoiceModeActive}var $t,en,tn;e((()=>{$t=N(),Zt(),M(),en=F(),tn=e=>{"use forget";let t=(0,$t.c)(5),{isFocused:n,isComposerSubmitDisabled:i,isComposerSubmitPending:a,onComposerSubmit:o}=e;if(!r(Qt))return null;let s;return t[0]!==i||t[1]!==a||t[2]!==n||t[3]!==o?(s=(0,en.jsx)(Xt,{composerIsFocused:n,isComposerSubmitDisabled:i,isComposerSubmitPending:a,onComposerSubmit:o}),t[0]=i,t[1]=a,t[2]=n,t[3]=o,t[4]=s):s=t[4],s}}))();export{tn as WrapperSpeechActiveContainer};
//# sourceMappingURL=da6c1aaf-dq0ad3oo5c6stexv.js.map