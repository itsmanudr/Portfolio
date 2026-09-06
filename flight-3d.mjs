import * as T from './vendor/three.module.js';
import {createAircraft} from './aircraft-model.mjs';
import {RoomEnvironment} from './vendor/RoomEnvironment.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function landingViewport(rect,width,height){const left=Math.max(0,rect.left),right=Math.min(width,rect.left+rect.width),top=Math.max(0,rect.top),bottom=Math.min(height,rect.top+rect.height);return {x:left,y:height-bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};}
export function choreography(p){
 const frames=[[0,.40,.48,0],[.10,.40,.48,0],[.24,-1.35,.26,-.18],[.39,-2.65,.75,.25],[.48,-3.45,.55,.12],[.62,-5.75,.68,-.1],[.75,-5.90,.55,0],[1,-5.88,.48,0]];
 p=clamp(p);let i=frames.findIndex(v=>v[0]>=p);i=Math.max(1,i);const a=frames[i-1],b=frames[i],t=smooth((p-a[0])/(b[0]-a[0]));
 return {yaw:mix(a[1],b[1],t),pitch:mix(a[2],b[2],t),bank:mix(a[3],b[3],t),explode:smooth((p-.44)/.09)*(1-smooth((p-.67)/.09)),gear:1-smooth((p-.12)/.09)};
}
if(typeof document!=='undefined'){
 let renderer;
 try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch(error){console.info('3D unavailable; retaining the image flight.');}
 if(renderer){
  const canvas=renderer.domElement;canvas.className='webgl-flight';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);camera.position.z=15;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
  const studio=pmrem.fromScene(room,.035);scene.environment=studio.texture;scene.environmentIntensity=1.15;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xf2f6ff,0xb2bdd2,1.2));
  const key=new T.DirectionalLight(0xffffff,2.4);key.position.set(2,6,8);scene.add(key);
  const rim=new T.DirectionalLight(0xd3dcff,1.4);rim.position.set(-5,2,-4);scene.add(rim);
  const warm=new T.DirectionalLight(0xf6ffd8,.55);warm.position.set(4,-3,2);scene.add(warm);
  const aircraft=createAircraft();scene.add(aircraft);const parts=aircraft.userData;
  parts.shell.side=T.DoubleSide;
  const network=new T.Group();scene.add(network);
  const pathways=[];
  for(const side of [-1,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(18),3));const l=new T.Line(g,new T.LineBasicMaterial({color:0xe2ff54,transparent:true,opacity:0}));aircraft.add(l);pathways.push(l);}
  const journey=document.getElementById('flightJourney');let last={p:0,pose:{x:innerWidth<=650?.53:.76,y:innerWidth<=650?.51:.46,s:innerWidth<=650?.75:.95,r:24,b:0},mobile:innerWidth<=650,active:false};
  let targetP=0,displayP=0,displayPose={...last.pose},raf=0,paused=document.documentElement.classList.contains('motion-paused'),pointer={x:0,y:0},visible=!document.hidden;
  const root=document.documentElement,caption=document.querySelector('.flight-caption b');
  function resize(){const budget=Math.sqrt(12000000/(innerWidth*innerHeight));renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio||1,innerWidth<=650?1.5:2),2.5,budget));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();wake();}
  function wake(){if(!raf&&!paused&&visible)raf=requestAnimationFrame(frame);}
  function frame(){raf=0;if(paused||!visible)return;const p=displayP=mix(displayP,targetP,.16);let error=Math.abs(p-targetP);for(const k of ['x','y','s','r','b']){displayPose[k]=mix(displayPose[k],last.pose[k],.18);error+=Math.abs(displayPose[k]-last.pose[k]);}
   const pose=displayPose,ch=choreography(p),viewH=2*Math.tan(T.MathUtils.degToRad(camera.fov*.5))*camera.position.z,viewW=viewH*camera.aspect;
   const y=scrollY,bay=document.querySelector('.aircraft-bay'),mark=bay.getBoundingClientRect();const landing=smooth((innerHeight*.95-mark.top)/(innerHeight*.5));
   const docked=!last.active&&last.p>=.999;
   // Clear the whole canvas before any scissored landing render.
   renderer.setScissorTest(false);renderer.clear();
   if(docked&&(mark.bottom<=0||mark.top>=innerHeight)){root.classList.add('webgl-ready');if(error>.001)wake();return;}
   const depth=last.active?3.2*smooth((p-.14)/.09)*(1-smooth((p-.25)/.10)):0;
   const perspective=(camera.position.z-depth)/camera.position.z;
   aircraft.position.set((pose.x-.5)*viewW*perspective,(.5-pose.y)*viewH*perspective,depth);
   const scale=viewW*(last.mobile?.93:.58)/9.5*pose.s;aircraft.scale.setScalar(scale);
   const yaw=last.active?ch.yaw:mix(.4,-5.88,smooth(p));
   aircraft.rotation.set(ch.pitch+pointer.y*.025,yaw+pointer.x*.035,ch.bank+(24-pose.r)*.014,'YXZ');
   parts.left.position.z=-ch.explode*1.15;parts.right.position.z=ch.explode*1.15;parts.left.position.y=parts.right.position.y=ch.explode*.22;
   parts.shell.transparent=ch.explode>.001;parts.shell.opacity=1-ch.explode*.82;parts.shell.depthWrite=ch.explode<.1;
   parts.wireMaterial.opacity=ch.explode*.19;parts.internals.visible=ch.explode>.02;
   parts.fans.forEach((f,i)=>f.rotation.x=p*220+i*.5);
   const gear=Math.max(ch.gear,landing);parts.gears.forEach(g=>{g.scale.y=.02+gear*.98;g.visible=gear>.02;});
   parts.stations.forEach((n,i)=>n.scale.setScalar(1+Math.sin(p*85-i)*.25));
   pathways.forEach((line,i)=>{const s=i===0?-1:1;const a=line.geometry.attributes.position;const pts=[[0,0,0],[0,.3,s*.7],[0,.3,s*(1.62+ch.explode*1.15)],[.5,.4,s*(2.6+ch.explode*1.15)],[-1.6,.2,s*(4.4+ch.explode*1.15)],[-1.9,.2,s*(4.6+ch.explode*1.15)]];pts.forEach((pt,j)=>a.setXYZ(j,...pt));a.needsUpdate=true;line.material.opacity=ch.explode*.8;});
   key.position.x=2+Math.sin(p*Math.PI*2)*4;rim.intensity=1.4+ch.explode*.6;
   if(docked){
    // Fit the actual rotated model into a reserved, text-free bay at ANY viewport ratio.
    aircraft.rotation.set(.48,.4,.08,'YXZ');aircraft.scale.setScalar(1);aircraft.position.set(0,0,0);aircraft.updateMatrixWorld(true);
    const size=new T.Box3().setFromObject(aircraft).getSize(new T.Vector3());
    const fit=Math.min(mark.width/innerWidth*viewW/size.x,mark.height/innerHeight*viewH/size.y)*.72;
    aircraft.scale.setScalar(fit);aircraft.position.set(((mark.left+mark.width/2)/innerWidth-.5)*viewW,(.5-(mark.top+mark.height/2)/innerHeight)*viewH,0);
    const clip=landingViewport(mark,innerWidth,innerHeight);renderer.setScissor(clip.x,clip.y,clip.width,clip.height);renderer.setScissorTest(true);
   }
   if(caption&&last.active&&ch.explode>.15)caption.textContent=ch.explode>.85?'INSIDE THE SYSTEM':'REVEALING THE CONNECTIONS';
   renderer.render(scene,camera);root.classList.add('webgl-ready');
   if(error>.001)wake();
  }
  document.addEventListener('flightframe',e=>{last=e.detail;targetP=last.p;wake();});
  document.addEventListener('motionchange',e=>{paused=e.detail.paused;if(paused){cancelAnimationFrame(raf);raf=0;renderer.clear();}else{displayP=targetP;displayPose={...last.pose};wake();}});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(!visible){cancelAnimationFrame(raf);raf=0;}else wake();});
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;wake();}},{passive:true});addEventListener('resize',resize);document.addEventListener('fullscreenchange',resize);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.classList.remove('webgl-ready');cancelAnimationFrame(raf);raf=0;});canvas.addEventListener('webglcontextrestored',wake);
  resize();
  // Catch the current route even when loaded halfway down the document.
  dispatchEvent(new Event('resize'));
 }
}
