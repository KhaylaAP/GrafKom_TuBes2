import * as THREE from "three";
import PBRLoader from "./pbr_loader";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

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
// scene.add(helper1);

// Player Gura
// Model Loading
let guraLoader = new GLTFLoader();
let gurascene = await guraLoader.loadAsync("./model/gura.glb");


let gura_model = gurascene.scene;
gura_model.traverse((obj) => {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})

gura_model.position.set(0,-1,15);
gura_model.scale.set(2,2,2);
gura_model.rotation.set(0,Math.PI,0);

let gura_animation = gurascene.animations;
let gura_mixer = new THREE.AnimationMixer(gura_model);
scene.add(gura_model);
console.log(gura_animation);

let gura_idle = gura_mixer.clipAction(gura_animation[2]);
gura_idle.play();
let gura_walk = gura_mixer.clipAction(gura_animation[1]);

// Enemy Calli
// Model Loading
let calliLoader = new GLTFLoader();
let calliscene = await calliLoader.loadAsync("./model/calli.glb");


let calli_model = calliscene.scene;
calli_model.traverse((obj) => {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})

calli_model.position.set(0, -1, -15);
calli_model.scale.set(2,2,2);

let calli_animation = calliscene.animations;
let calli_mixer = new THREE.AnimationMixer(calli_model);
scene.add(calli_model);
console.log(calli_animation);

let calli_idle = calli_mixer.clipAction(calli_animation[0]);
calli_idle.play();

// Bullet Pebble
// Model Loading
let pebbleLoader = new GLTFLoader();
let pebblescene = await pebbleLoader.loadAsync("./model/pebble.glb");


let pebble_model = pebblescene.scene;
pebble_model.traverse((obj) => {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})

pebble_model.position.set(0, 0, 0);
pebble_model.scale.set(2,2,2);
scene.add(pebble_model);


// // Player Old
// let playerLoader = new PBRLoader("img/windswept-wasteland-ue/windswept-wasteland_", "png");
// await playerLoader.loadTexture();
// const geo_player = new THREE.DodecahedronGeometry(2,0);
// const mat_player = new THREE.MeshStandardMaterial({
//     map: playerLoader.albedo,
//     normalMap: playerLoader.normal,
//     roughnessMap: playerLoader.roughness
// });
// const mesh_dode = new THREE.Mesh(geo_player, mat_player);
// scene.add(mesh_dode);
// mesh_dode.position.set(0,1,15);
// mesh_dode.castShadow = true;


// // Enemy Old
// const geo_enemy = new THREE.IcosahedronGeometry(2, 0);
// const mat_enemy = new THREE.MeshStandardMaterial({
//     color: 0xff4444,     // merah (enemy)
//     metalness: 0.6,
//     roughness: 0.3
// });
// const enemy = new THREE.Mesh(geo_enemy, mat_enemy);
// enemy.position.set(0, 1, -15); // di depan player
// enemy.castShadow = true;
// scene.add(enemy);


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
const controls = new OrbitControls(cam, renderer.domElement);

const key = {}
let isWalking = false;

window.addEventListener('keydown', (event) => {
    key[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
    key[event.key.toLowerCase()] = false;
});

function movement(){
    let moving = false;

    if (key['w']){
        gura_model.position.z -= 0.3;
        moving = true;
    }
    if (key['s']){
        gura_model.position.z += 0.3;
        moving = true;
    }
    if (key['a']){
        gura_model.position.x -= 0.3;
        moving = true;
    }
    if (key['d']){
        gura_model.position.x += 0.3;
        moving = true;
    }

    // Walking animation
    if(moving == true && isWalking == false){
        gura_idle.stop();
        gura_walk.play();
        isWalking = true;
    // Idle animation
    } else if (moving == false && isWalking == true){
        gura_walk.stop();
        gura_idle.play();
        isWalking = false;
    }
}

const clock = new THREE.Clock();

function draw() {
    renderer.render(scene, cam);
    const delta = clock.getDelta();
    if(gura_mixer) gura_mixer.update(delta);
    if(calli_mixer) calli_mixer.update(delta);
    movement();
    requestAnimationFrame(draw);
}
draw();