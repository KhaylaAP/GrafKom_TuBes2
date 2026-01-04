import * as THREE from "three";
import PBRLoader from "./pbr_loader";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { randInt } from "three/src/math/MathUtils.js";
import { call } from "three/tsl";

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

        // ## PLAYER HEALTH LOGIC ##
        // ## PROMPT 1: how to add health to both player and enemy ##
        // ## PROMPT 2: make it simpler, no need for display or anything, just show the health in console log and just make the logic of the health system ##

        // Create bounding boxes for collision detection
        const bulletBox = new THREE.Box3().setFromObject(pebbleData.mesh);
        const playerBox = new THREE.Box3().setFromObject(gura_model);
        
        // Check collision with player
        if (bulletBox.intersectsBox(playerBox)) {
            // Player takes damage
            playerHealth -= 10;
            console.log(`Player hit! Health: ${playerHealth}`);
            
            // Remove bullet
            scene.remove(pebbleData.mesh);
            pebbles.splice(i, 1);
            
            // Check if player is dead
            if (playerHealth <= 0) {
                playerHealth = 0;
                gameActive = false;
                console.log("GAME OVER - Player defeated!");
                gura_idle.stop();
                gura_walk.stop();
            }
            
            continue;
        }
    // ## END PROMPT ##

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

const playerBullet = [];

function SpawnPlayerBullet(player, direction){
    const pebbleB = pebble_model.clone();

    const Player = player.position.clone();
    Player.y += 2.5;

    pebbleB.position.set(Player.x, Player.y, Player.z);
    scene.add(pebbleB);

    playerBullet.push({
        mesh: pebbleB,
        velocity: direction.clone().normalize().multiplyScalar(0.4)
    });
}

// ## PLAYER BULLET UPDATE LOGIC ##
// ## PROMPT 1: code untuk player bisa menembak ke arah musuh ## 
// ## PROMPT 2: buat arah tembakan dari player ke musuh ##

const PLAYER_BULLET_BOUND = 60;

function updatePlayerBullets() {
    for (let i = playerBullet.length - 1; i >= 0; i--) {
        const b = playerBullet[i];
        b.mesh.position.add(b.velocity);

        const p = b.mesh.position;
        // Remove bullet if it goes out of bounds
        if (
            Math.abs(p.x) > PLAYER_BULLET_BOUND ||
            Math.abs(p.z) > PLAYER_BULLET_BOUND ||
            p.y < -2 || p.y > 20
        ) {
            scene.remove(b.mesh);
            playerBullet.splice(i, 1);
        }
    }
}

function getDirection(player,enemy){
    const gura = player.position.clone();
    gura.y += 2.5; // modifikasi supaya tembakan berasal dari badan player
    const calli = enemy.position.clone();
    calli.y += 2.5; // modifikasi supaya tembakan mengarah ke badan musuh
    return new THREE.Vector3()  
        .subVectors(calli, gura)
        .normalize();
}

function Shoot(player, enemy){
    const dir = getDirection(player, enemy);
    SpawnPlayerBullet(player, dir);
}

// ## END PROMPT ##

window.addEventListener('click', (e) => {
    Shoot(gura_model, calli_model);
});

// Health system variables
let playerHealth = 100;
let gameActive = true;

const clock = new THREE.Clock();
let frame = 0

function draw() {
    if (!gameActive) {
        renderer.render(scene, cam);
        return;
    }
    
    frame++;
    renderer.render(scene, cam);
    const delta = clock.getDelta();
    if(gura_mixer) gura_mixer.update(delta);
    if(calli_mixer) calli_mixer.update(delta);
    if(frame % 5 === 0){
        aimedShot({x: randInt(-10,10), y: randInt(10,15), z: randInt(-15,-25)}, gura_model.position);
    }
    updatePlayerBullets();
    updateBullets();
    movement();
    requestAnimationFrame(draw);
}
draw();