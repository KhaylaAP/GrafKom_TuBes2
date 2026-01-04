import * as THREE from "three";
import PBRLoader from "./pbr_loader";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { randInt } from "three/src/math/MathUtils.js";

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
pebble_model.traverse((obj) =>  {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})



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

// wall tengah
const wallGeo = new THREE.BoxGeometry(100, 5, 1);

const wallMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0   
});

const hiddenWall = new THREE.Mesh(wallGeo, wallMat);

hiddenWall.position.set(0, 1, 0);

scene.add(hiddenWall);

// wall kanan
const rightWallGeo = new THREE.BoxGeometry(1, 5, 100);

const rightWallMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0
});


const rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);

// geser ke kanan
rightWall.position.set(25, 1, 0);

scene.add(rightWall);

// wall kiri
const leftWallGeo = new THREE.BoxGeometry(1, 5, 100);

const leftWallMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0
});

const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);

// geser ke kiri
leftWall.position.set(-25, 1, 0);

scene.add(leftWall);

// wall belakang
const backWallGeo = new THREE.BoxGeometry(100, 5, 1);

const backWallMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0
});

const backWall = new THREE.Mesh(backWallGeo, backWallMat);

// geser ke belakang
backWall.position.set(0, 1, 25);

scene.add(backWall);

const playerBox = new THREE.Box3();
const wallBox = new THREE.Box3();
const rightWallBox = new THREE.Box3();
const leftWallBox = new THREE.Box3();
const backWallBox = new THREE.Box3();

function movement() {
    const prevPos = gura_model.position.clone();

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

    playerBox.setFromObject(gura_model);
    wallBox.setFromObject(hiddenWall);
    rightWallBox.setFromObject(rightWall);
    leftWallBox.setFromObject(leftWall);
    backWallBox.setFromObject(backWall);

    if (playerBox.intersectsBox(wallBox)||
    playerBox.intersectsBox(rightWallBox)||
    playerBox.intersectsBox(leftWallBox)||
    playerBox.intersectsBox(backWallBox)) {
        gura_model.position.copy(prevPos); // rollback posisi
    }  
}

// ## BULLET SPAWN AND MOVEMENT LOGIC AI GENERATED##
// ## PROMPT :cara memunculkan banyak bullet di bullets hell game di js, menggunakan three dengan model dari glb ##
let pebbles = [];
let angle = 0;
function bulletSpawns(position,dir,speed){
    // Pebble bullet spawn logic
    const pebble = pebble_model.clone()
    pebble.position.set(position.x, position.y, position.z);
    scene.add(pebble);

    pebbles.push({
        mesh: pebble,
        velocity : dir.clone().normalize().multiplyScalar(speed)
    });
    
}

function updateBullets(){
    for (let i = pebbles.length - 1; i >= 0; i--){
        const pebbleData = pebbles[i];
        pebbleData.mesh.position.add(pebbleData.velocity);

        if (pebbleData.mesh.position.y < -1|| pebbleData.mesh.position.z > gura_model.position.z + 10){ // modifukasi supaya buller menghilang selalu 10 posisi di belakang player
            scene.remove(pebbleData.mesh);
            pebbles.splice(i,1);
        }
    }
}
function aimedShot(origin, playerPos) {
    const target = playerPos.clone() // modifikasi untuk mengarahkan ke badan player
    target.y +=2.5 // modifikasi untuk mengarahkan ke badan player
    const dir = new THREE.Vector3()
        .subVectors(target, origin)
        .normalize();

    bulletSpawns(origin, dir, 0.5); //modifikasi speed bullet
}
// ## END PROMPT ##

const clock = new THREE.Clock();
let frame = 0

function draw() {
    frame++;
    renderer.render(scene, cam);
    const delta = clock.getDelta();
    if(gura_mixer) gura_mixer.update(delta);
    if(calli_mixer) calli_mixer.update(delta);
    if(frame % 5 === 0){
        aimedShot({x: randInt(-10,10), y: randInt(10,15), z: randInt(-15,-25)}, gura_model.position);
    }
    updateBullets();
    movement();
    requestAnimationFrame(draw);
}
draw();