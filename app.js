import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const sceneHost = document.querySelector("#scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaf6fa);
scene.fog = new THREE.Fog(0xeaf6fa, 18, 38);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(10, 8, 12);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneHost.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.0, 0);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 6;
controls.maxDistance = 25;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8299a1, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-5, 12, 8); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); scene.add(sun);

const materials = {
  wall: new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: .9 }),
  roof: new THREE.MeshStandardMaterial({ color: 0xa9573d, roughness: .8 }),
  gutter: new THREE.MeshStandardMaterial({ color: 0xe3a72f, metalness: .35, roughness: .4 }),
  pipe: new THREE.MeshStandardMaterial({ color: 0x287fa5, metalness: .25, roughness: .45 }),
  tank: new THREE.MeshStandardMaterial({ color: 0x9fcbd8, transparent: true, opacity: .55, roughness: .25 }),
  water: new THREE.MeshStandardMaterial({ color: 0x16a5dc, transparent: true, opacity: .78 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x526875 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x8ec6d6, roughness: .2, metalness: .1 })
};
const parts = [];
const labels = [];
const rainDrops = [];
const flowDrops = [];
const group = new THREE.Group(); scene.add(group);

function addMesh(geo, mat, pos, name, description, parent=group) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh);
  if (name) { mesh.userData = { name, description }; parts.push(mesh); }
  return mesh;
}
function addLabel(text, position) {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(20,48,65,.88)"; ctx.roundRect(4, 8, 504, 80, 18); ctx.fill();
  ctx.font = "bold 34px Arial"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.fillText(text, 256, 61);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sprite.position.set(...position); sprite.scale.set(2.3, .44, 1); group.add(sprite); labels.push(sprite);
}
// Ground and house
addMesh(new THREE.BoxGeometry(18,.18,14), new THREE.MeshStandardMaterial({color:0x9bb99e}), [0,-.15,0]);
addMesh(new THREE.BoxGeometry(7,3.2,5), materials.wall, [0,1.55,0], "Vivienda", "Volumen residencial de un nivel. La cubierta inclinada dirige el agua hacia los canales.");
// Roof: two sloping planes
const roof1 = addMesh(new THREE.BoxGeometry(7.7,.18,3.0), materials.roof, [0,3.35,-1.15], "Cubierta inclinada", "Superficie de captación. El área y la pendiente de la cubierta influyen en la recolección.");
roof1.rotation.x = -0.34;
const roof2 = addMesh(new THREE.BoxGeometry(7.7,.18,3.0), materials.roof, [0,3.35,1.15], "Cubierta inclinada", "Segunda vertiente de la cubierta. El agua escurre hacia los aleros laterales.");
roof2.rotation.x = 0.34;
// Ridge cap
addMesh(new THREE.BoxGeometry(7.85,.16,.18), materials.dark, [0,3.86,0], "Cumbrera", "Unión superior de las dos vertientes de la cubierta.");
// Facade openings
for (const x of [-2.0, 2.0]) {
  addMesh(new THREE.BoxGeometry(1.15,1.25,.08), materials.glass, [x,1.65,2.54], "Ventana", "Abertura de fachada representada con vidrio azul.");
}
addMesh(new THREE.BoxGeometry(1.0,2.2,.1), new THREE.MeshStandardMaterial({color:0x805b43}), [0,1.05,2.57], "Puerta", "Acceso principal de la vivienda.");

// Gutters along two long eaves. Open channel represented by U-like trough.
function makeGutter(z) {
  const y = 2.77;
  addMesh(new THREE.BoxGeometry(7.9,.12,.28), materials.gutter, [0,y,z], "Canal recolector", "Canal horizontal colocado en el borde del techo. Recibe el agua que baja por la cubierta.");
  addMesh(new THREE.BoxGeometry(7.9,.08,.045), materials.dark, [0,y+.08,z-.12], null, null);
  addMesh(new THREE.BoxGeometry(7.9,.08,.045), materials.dark, [0,y+.08,z+.12], null, null);
}
makeGutter(-2.72); makeGutter(2.72);

// Downpipes on the right side, then connect toward filter and tank
for (const z of [-2.72,2.72]) {
  const pipe = addMesh(new THREE.CylinderGeometry(.09,.09,2.55,16), materials.pipe, [3.82,1.47,z], "Bajante pluvial", "Tubería vertical que conduce el agua desde el canal hasta el sistema de filtrado.");
  pipe.rotation.z = 0;
  addMesh(new THREE.TorusGeometry(.12,.07,8,18,Math.PI), materials.pipe, [3.82,2.75,z], null, null).rotation.z = Math.PI;
}
addMesh(new THREE.BoxGeometry(.25,.18,5.6), materials.pipe, [3.82,.16,0], "Colector inferior", "Tramo horizontal que reúne el agua de las bajantes y la conduce al filtro.");
// Filter box and tank
addMesh(new THREE.BoxGeometry(.65,.8,.75), materials.dark, [4.45,.35,0], "Filtro de hojas", "Caja de inspección con rejilla. Retiene hojas y residuos antes de almacenar el agua.");
addMesh(new THREE.BoxGeometry(.55,.08,.65), materials.gutter, [4.45,.78,0], null, null);
const tank = addMesh(new THREE.CylinderGeometry(.85,.85,2.25,40,1,true), materials.tank, [6.3,1.13,0], "Tanque de almacenamiento", "Depósito cerrado para almacenar el agua lluvia recolectada. Debe contar con tapa, rebose y acceso de limpieza.");
addMesh(new THREE.CylinderGeometry(.87,.87,.12,40), materials.pipe, [6.3,0,0], null, null);
addMesh(new THREE.CylinderGeometry(.88,.88,.1,40), materials.pipe, [6.3,2.27,0], null, null);
const waterMesh = addMesh(new THREE.CylinderGeometry(.78,.78,1,32), materials.water, [6.3,.55,0], null, null);
waterMesh.scale.y = .02;
addMesh(new THREE.CylinderGeometry(.08,.08,.55,16), materials.pipe, [5.35,.55,0], "Entrada al tanque", "Conexión de entrada desde el filtro hacia el tanque de almacenamiento.");
// Tank overflow
addMesh(new THREE.CylinderGeometry(.06,.06,1.05,12), materials.pipe, [7.18,2.05,0], "Tubería de rebose", "Salida de seguridad para evacuar el exceso de agua cuando el tanque alcanza su capacidad.");
// labels
addLabel("CUBIERTA", [0,4.5,0]);
addLabel("CANALES", [0,3.05,3.15]);
addLabel("BAJANTES", [4.15,2.3,3.1]);
addLabel("FILTRO", [4.55,1.1,1.0]);
addLabel("TANQUE", [6.5,3.0,1.0]);

// Rain particle field
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(600*3);
for (let i=0;i<600;i++) {
  rainPositions[i*3] = (Math.random()-.5)*11;
  rainPositions[i*3+1] = Math.random()*8+2;
  rainPositions[i*3+2] = (Math.random()-.5)*9;
}
rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions,3));
const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({color:0x4aaed1,size:.055,transparent:true,opacity:.75}));
scene.add(rain); rain.visible = false;

// Small animated blue particles representing flow through the system
for (let i=0;i<28;i++) {
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.055,8,8), new THREE.MeshBasicMaterial({color:0x16a5dc}));
  drop.visible=false; scene.add(drop); flowDrops.push({mesh:drop, offset:i/28});
}

addLabel("RECOLECCIÓN DE AGUA LLUVIA", [0,5.25,-.2]);

// Ground path and simple landscape
for (let i=0;i<5;i++) {
  const bush = addMesh(new THREE.IcosahedronGeometry(.35,1), new THREE.MeshStandardMaterial({color:0x648d68}), [-5+i*1.1,.25,-4.7], null, null);
  bush.scale.y=.65;
}
const grid = new THREE.GridHelper(18,18,0x9bb0b8,0xcbd8dc); grid.position.y=-.045; scene.add(grid);

let running = false, elapsed = 0, collectedLitres = 0, labelsVisible = true;
const rainInput = document.querySelector("#rain");
const areaInput = document.querySelector("#roofArea");
const tankInput = document.querySelector("#tankSize");
const $ = id => document.getElementById(id);
const fmt = (n,d=1) => n.toLocaleString("es-CO",{minimumFractionDigits:d,maximumFractionDigits:d});
const runoff = .85;
function values() {
  const intensity = Number(rainInput.value);
  const area = Number(areaInput.value);
  const capacity = Number(tankInput.value);
  const flow = runoff * intensity * area / 60;
  return {intensity,area,capacity,flow};
}
function updateReadouts() {
  const v=values(), percent=Math.min(100,collectedLitres/v.capacity*100);
  $("rainValue").textContent=`${v.intensity} mm/h`;
  $("areaValue").textContent=`${v.area} m²`;
  $("tankValue").textContent=`${v.capacity.toLocaleString("es-CO")} L`;
  $("flow").textContent=`${fmt(running?v.flow:0,2)} L/min`;
  $("volume").textContent=`${fmt(collectedLitres,0)} L`;
  $("fillPercent").textContent=`${fmt(percent,0)} %`;
  $("tankProgress").style.width=`${percent}%`;
  const mins = v.flow>0 ? Math.max(0,(v.capacity-collectedLitres)/v.flow) : 0;
  $("fillTime").textContent=percent>=100?"Lleno":(running?`${fmt(mins,0)} min`:"—");
  $("tankNote").textContent=percent>=100?"Tanque lleno: el excedente debe salir por el rebose.":`Capacidad disponible: ${fmt(v.capacity-collectedLitres,0)} L.`;
  const h=Math.max(.02,Math.min(2.05,percent/100*2.05));
  waterMesh.scale.y=h;
  waterMesh.position.y=.08+h/2;
}
function setRunning(value) {
  running=value; rain.visible=value;
  $("status").textContent=value?"Lluvia en simulación":"Simulación detenida";
  updateReadouts();
}
rainInput.addEventListener("input",updateReadouts);
areaInput.addEventListener("input",updateReadouts);
tankInput.addEventListener("input",updateReadouts);
$("startBtn").addEventListener("click",()=>setRunning(true));
$("pauseBtn").addEventListener("click",()=>setRunning(false));
$("resetBtn").addEventListener("click",()=>{collectedLitres=0;elapsed=0;setRunning(false);updateReadouts();});
$("homeView").addEventListener("click",()=>{camera.position.set(10,8,12);controls.target.set(0,2,0);controls.update();});
$("labelsToggle").addEventListener("click",()=>{
  labelsVisible=!labelsVisible; labels.forEach(x=>x.visible=labelsVisible);
  $("labelsToggle").textContent=labelsVisible?"Ocultar etiquetas":"Mostrar etiquetas";
});

// Select parts by clicking the 3D model
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown",event=>{
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(parts,false)[0];
  if(hit && hit.object.userData.name) {
    $("partName").textContent=hit.object.userData.name;
    $("partDescription").textContent=hit.object.userData.description;
  }
});

function resize() {
  const w=sceneHost.clientWidth, h=sceneHost.clientHeight;
  camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
}
window.addEventListener("resize",resize); resize();
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  controls.update();
  if(running) {
    const v=values();
    elapsed+=dt;
    // Accelerated classroom demonstration: one real second represents one simulated minute.
    collectedLitres=Math.min(v.capacity,collectedLitres+v.flow*dt);
    const p=rainGeometry.attributes.position.array;
    for(let i=0;i<600;i++) {
      p[i*3+1]-=dt*(3+v.intensity/45);
      if(p[i*3+1]<2.7) p[i*3+1]=Math.random()*5+5;
    }
    rainGeometry.attributes.position.needsUpdate=true;
    flowDrops.forEach((d)=>{
      const t=(elapsed*.24+d.offset)%1;
      let x,z,y;
      if(t<.35){x=-3.5+t/.35*7;z=-2.72;y=2.8;}
      else if(t<.55){x=3.5;z=-2.72+(t-.35)/.2*5.44;y=2.8;}
      else if(t<.78){x=3.82;z=2.72;y=2.75-(t-.55)/.23*2.45;}
      else {x=4.45+(t-.78)/.22*1.0;z=0;y=.5;}
      d.mesh.position.set(x,y,z); d.mesh.visible=collectedLitres<v.capacity;
    });
    if(collectedLitres>=v.capacity) { rain.visible=false; }
    updateReadouts();
  } else {
    flowDrops.forEach(d=>d.mesh.visible=false);
  }
  renderer.render(scene,camera);
}
animate();
updateReadouts();
