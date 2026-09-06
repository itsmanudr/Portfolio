import * as T from './vendor/three.module.js';
// Original procedural airframe. Longitudinal X, vertical Y, span Z.
export function createAircraft(){
 const root=new T.Group(),hull=new T.Group(),left=new T.Group(),right=new T.Group(),internals=new T.Group();root.add(hull,left,right,internals);
 const shell=new T.MeshPhysicalMaterial({color:0xf1f4f7,metalness:.22,roughness:.23,clearcoat:1,clearcoatRoughness:.16});
 const blue=new T.MeshStandardMaterial({color:0x183adc,metalness:.52,roughness:.3,side:T.DoubleSide});
 const lime=new T.MeshStandardMaterial({color:0xe2ff54,emissive:0x8cae14,emissiveIntensity:.22,metalness:.2,roughness:.32,side:T.DoubleSide});
 const metal=new T.MeshStandardMaterial({color:0x738496,metalness:.85,roughness:.3,side:T.DoubleSide});
 const black=new T.MeshStandardMaterial({color:0x07131e,metalness:.5,roughness:.25});
 const glow=new T.MeshBasicMaterial({color:0xe2ff54});
 const profile=[[-4.8,0],[-4.5,.10],[-4,.24],[-3.4,.37],[-2.7,.43],[2.8,.43],[3.4,.36],[3.95,.25],[4.35,.13],[4.5,0]];
 const curve=new T.SplineCurve(profile.map(([x,r])=>new T.Vector2(r,x)));
 const fuselageGeometry=new T.LatheGeometry(curve.getPoints(160),80);fuselageGeometry.rotateZ(-Math.PI/2);
 const body=new T.Mesh(fuselageGeometry,shell);hull.add(body);
 const wireMaterial=new T.MeshBasicMaterial({color:0x95d9ff,wireframe:true,transparent:true,opacity:0,depthWrite:false});
 const wire=new T.Mesh(fuselageGeometry,wireMaterial);wire.scale.setScalar(1.002);hull.add(wire);
 function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 function foil(points,parent,mat,y=0,thickness=.07){
  // Mirroring a wing reverses polygon winding. Normalize it BEFORE building faces.
  const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
  if(area<0)points=[...points].reverse();
  const n=points.length,verts=[],ids=[];
  for(const height of [y+thickness,y-thickness])for(const [x,z]of points)verts.push(x,height,z);
  for(let i=1;i<n-1;i++)ids.push(0,i+1,i,n,n+i,n+i+1);
  for(let i=0;i<n;i++){let j=(i+1)%n;ids.push(i,j,n+j,i,n+j,n+i);}
  const indexed=new T.BufferGeometry();indexed.setAttribute('position',new T.Float32BufferAttribute(verts,3));indexed.setIndex(ids);
  // Keep upper/lower airfoil surfaces independent from the thin edge normals.
  const g=indexed.toNonIndexed();indexed.dispose();g.computeVertexNormals();return mesh(g,mat,parent);
 }
 const fans=[],gears=[],lights=[];
 for(const side of [-1,1]){
  const wing=side<0?left:right;
  foil([[1,.32*side],[.15,2.3*side],[-1.55,4.6*side],[-2.02,4.6*side],[-1.35,1.35*side],[-1.1,.32*side]],wing,shell,-.13,.055);
  foil([[.85,.42*side],[.06,2.25*side],[-1.64,4.51*side],[-1.85,4.51*side],[-.28,2.16*side],[.52,.42*side]],wing,metal,-.066,.008);
  const winglet=foil([[-1.56,4.55*side],[-2.04,4.55*side],[-2.17,4.94*side],[-1.94,4.94*side]],wing,lime,-.06,.022);winglet.geometry.translate(0,0,-4.55*side);winglet.geometry.rotateX(-side*.9);winglet.geometry.translate(0,0,4.55*side);
  foil([[-3.02,.15*side],[-3.73,1.85*side],[-4.31,1.85*side],[-4.02,.18*side]],hull,blue,.13,.04);
  const engine=new T.Group();engine.position.set(.13,-.62,1.62*side);wing.add(engine);
  // Open nacelle with a recessed fan, rim, core and rear nozzle.
  const nacelleProfile=[new T.Vector2(.30,.72),new T.Vector2(.35,.63),new T.Vector2(.38,.40),new T.Vector2(.35,-.33),new T.Vector2(.23,-.73),new T.Vector2(.17,-.76),new T.Vector2(.18,-.65),new T.Vector2(.26,.37),new T.Vector2(.27,.65),new T.Vector2(.30,.72)];
  const ng=new T.LatheGeometry(nacelleProfile,72);ng.rotateZ(-Math.PI/2);mesh(ng,shell,engine);
  const rim=mesh(new T.TorusGeometry(.301,.035,16,72),metal,engine,.69);rim.rotation.y=Math.PI/2;
  const dark=mesh(new T.CircleGeometry(.273,32),black,engine,.44);dark.rotation.y=Math.PI/2;
  const fan=new T.Group();fan.position.x=.49;engine.add(fan);fans.push(fan);
  const core=mesh(new T.ConeGeometry(.085,.19,16),metal,fan,.05);core.rotation.z=-Math.PI/2;
  for(let k=0;k<24;k++){const b=mesh(new T.BoxGeometry(.025,.17,.027),metal,fan,0,Math.cos(k*Math.PI/12)*.17,Math.sin(k*Math.PI/12)*.17);b.rotation.x=k*Math.PI/12;b.rotation.y=.35;}
  mesh(new T.BoxGeometry(.55,.32,.13),metal,wing,-.05,-.32,1.62*side);
  for(let i=0;i<28;i++){const win=mesh(new T.SphereGeometry(1,16,12),black,hull,-2.72+i*.20,.17,.408*side);win.scale.set(.052,.066,.013);}
  for(const x of [-2.8,2.6]){const door=mesh(new T.BoxGeometry(.17,.36,.014),metal,hull,x,-.03,.428*side);const inset=mesh(new T.BoxGeometry(.14,.32,.016),shell,hull,x,-.03,.439*side);}
  const nav=mesh(new T.SphereGeometry(.043,10,8),new T.MeshBasicMaterial({color:side<0?0xff534c:0x7eff95}),wing,-1.89,.18,4.60*side);lights.push(nav);
 }
 const finShape=new T.Shape();finShape.moveTo(-4.4,.1);finShape.lineTo(-4.2,1.9);finShape.lineTo(-3.66,1.9);finShape.lineTo(-2.68,.15);finShape.closePath();
 const finGeo=new T.ExtrudeGeometry(finShape,{depth:.075,bevelEnabled:true,bevelThickness:.015,bevelSize:.03,bevelSegments:2,steps:1});finGeo.translate(0,0,-.0375);mesh(finGeo,blue,hull);
 const cockpit=mesh(new T.SphereGeometry(1,24,12),black,hull,3.55,.265,0);cockpit.scale.set(.40,.085,.255);cockpit.rotation.z=-.18;
 const stripeGeo=new T.CylinderGeometry(.435,.435,5.1,48,1,true,0,.09);stripeGeo.rotateZ(-Math.PI/2);const stripe=mesh(stripeGeo,lime,hull);stripe.rotation.x=.65;
 for(const [x,z] of [[2.55,0],[-.65,-.40],[-.65,.40]]){const gear=new T.Group();gear.position.set(x,-.27,z);hull.add(gear);gears.push(gear);mesh(new T.CylinderGeometry(.027,.035,.45,8),metal,gear,0,-.22);for(const side of [-1,1]){const tire=mesh(new T.TorusGeometry(.11,.047,8,16),black,gear,0,-.48,.07*side);}}
 const stations=[];
 for(let i=0;i<7;i++){const n=mesh(new T.IcosahedronGeometry(.1,1),glow,internals,-2.5+i*.8,0,0);stations.push(n);const ring=mesh(new T.TorusGeometry(.23,.008,6,30),glow,internals,n.position.x);ring.rotation.y=Math.PI/2;}
 const lineGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(-2.5,0,0),new T.Vector3(2.3,0,0)]);internals.add(new T.Line(lineGeo,new T.LineBasicMaterial({color:0xe2ff54})));internals.visible=false;
 root.userData={shell,wireMaterial,left,right,fans,gears,internals,stations,lights};
 return root;
}
