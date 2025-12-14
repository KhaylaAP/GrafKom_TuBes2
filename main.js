import * as THREE from "three";
import PBRLoader from "./pbr_loader";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
    45, window.innerWidth/window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


document.body.appendChild(renderer.domElement);

window.addEventListener('resize',() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth/window.innerHeight;
    cam.updateProjectionMatrix();
})

// Ambient Light
const light = new THREE.AmbientLight(0x404040, 10);
scene.add(light);

const plight = new THREE.PointLight(0xffffff,500,0,2);
plight.castShadow = true;
plight.position.set(0,15,0);
scene.add(plight);

const helper1 = new THREE.PointLightHelper(plight,1,0xffff00);
scene.add(helper1);


// Player
let playerLoader = new PBRLoader("img/windswept-wasteland-ue/windswept-wasteland_", "png");
await playerLoader.loadTexture();
const geo_player = new THREE.DodecahedronGeometry(2,0);
const mat_player = new THREE.MeshStandardMaterial({
    map: playerLoader.albedo,
    normalMap: playerLoader.normal,
    roughnessMap: playerLoader.roughness
});
const mesh_dode = new THREE.Mesh(geo_player, mat_player);
scene.add(mesh_dode);
mesh_dode.position.set(0,1,15);
mesh_dode.castShadow = true;


// Enemy
const geo_enemy = new THREE.IcosahedronGeometry(2, 0);
const mat_enemy = new THREE.MeshStandardMaterial({
    color: 0xff4444,     // merah (enemy)
    metalness: 0.6,
    roughness: 0.3
});
const enemy = new THREE.Mesh(geo_enemy, mat_enemy);
enemy.position.set(0, 1, -15); // di depan player
enemy.castShadow = true;
scene.add(enemy);


// Floor
let floorloader = new PBRLoader("img/subtle-black-granite-ue/subtle-black-granite_", "png");
await floorloader.loadTexture();
const geo_floor = new THREE.PlaneGeometry(100,100,10,10);
const mat_floor = new THREE.MeshStandardMaterial({
    map: floorloader.albedo,
    normalMap: floorloader.normal,
});
const plane_mesh = new THREE.Mesh(geo_floor, mat_floor);
plane_mesh.rotation.x = -Math.PI/2;
plane_mesh.position.set(0,-1,0);
plane_mesh.receiveShadow = true;
scene.add(plane_mesh);


cam.position.set(0, 45, 15);
cam.lookAt(0, 0, 0);
// const controls = new OrbitControls(cam, renderer.domElement);
const key = {}
window.addEventListener('keydown', (event) => {
    key[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
    key[event.key.toLowerCase()] = false;
});

function movement(){
    if (key['w']){
        mesh_dode.position.z -= 0.3;
    }
    if (key['s']){
        mesh_dode.position.z += 0.3;
    }
    if (key['a']){
        mesh_dode.position.x -= 0.3;
    }
    if (key['d']){
        mesh_dode.position.x += 0.3;
    }
}

function draw() {
    renderer.render(scene, cam);
    movement();
    requestAnimationFrame(draw);
}
draw();