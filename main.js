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

// ## DISPLAY GAME OVER & VICTORY##
// ## AI MODEL: CHATGPT
// ## PROMPT :bagaimana cara membuat display victory ketika player menang dan gameover ketika player kalah ##
const endScreen = document.getElementById("end-screen");
const endText = document.getElementById("end-text");

function showEndScreen(type) {
    endScreen.classList.add("show");

    if (type === "victory") {
        endText.innerText = "VICTORY";
        endText.style.color = "#00ff88";
    } else if (type === "defeat") {
        endText.innerText = "GAME OVER";
        endText.style.color = "#ff3333";
    }
}

// ## END PROMPT ##

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
// console.log(gura_animation);

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
// console.log(calli_animation);

let calli_idle = calli_mixer.clipAction(calli_animation[0]);
calli_idle.play();

// Bullet (Enemy) Pebble
// Model Loading
let pebbleLoader = new GLTFLoader();
let pebblescene = await pebbleLoader.loadAsync("./model/pebble.glb");

let pebble_model = pebblescene.scene;
pebble_model.traverse((obj) =>  {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})

// Bullet (Player) Jailbird
// Model Loading
let jailbirdLoader = new GLTFLoader();
let jailbirdscene = await jailbirdLoader.loadAsync("./model/jailbird.glb");

let jailbird_model = jailbirdscene.scene;
jailbird_model.rotation.set(0,Math.PI,0);
jailbird_model.traverse((obj) =>  {
    if (obj.isMesh){
        obj.castShadow = true;
    }
})

// Floor
let floorloader = new PBRLoader("img/stringy-marble-ue/stringy_marble_", "png");
await floorloader.loadTexture();
const geo_floor = new THREE.PlaneGeometry(150,150,10,10);
const mat_floor = new THREE.MeshStandardMaterial({
    map: floorloader.albedo,
    normalMap: floorloader.normal,
    aoMap: floorloader.ao,
    roughnessMap: floorloader.roughness,
    metalnessMap: floorloader.metallic
});
const plane_mesh = new THREE.Mesh(geo_floor, mat_floor);
plane_mesh.rotation.x = -Math.PI/2;
plane_mesh.position.set(0,-1,0);
plane_mesh.receiveShadow = true;
scene.add(plane_mesh);


cam.position.set(0, 25, 35);
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

window.addEventListener("keydown", (e) => {
    if (!gameActive && e.key.toLowerCase() === "r") {
        location.reload();
    }
});


// ## invisible wall##
// ## AI MODEL: CHATGPT
// ## PROMPT :Bagaimana cara agar player tidak terlalu dekat dengan enemy atau seperti bikin hidden wall ##
// wall tengah
const wallGeo = new THREE.BoxGeometry(100, 5, 1);
const wallMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0   
});
const hiddenWall = new THREE.Mesh(wallGeo, wallMat);
// tengah
hiddenWall.position.set(0, 1, 0);
scene.add(hiddenWall);
// ## END PROMPT ##


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
// ## END PROMPT ##



// ## BULLET SPAWN AND MOVEMENT LOGIC AI GENERATED##
// ## AI MODEL: CHATGPT
// ## PROMPT :cara memunculkan banyak bullet di bullets hell game di js, menggunakan three dengan model dari glb ##
let pebbles = [];
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
let angle = 0;
function spiralShot(origin) {
    const count = 16;

    for (let i = 0; i < count; i++) {
        const a = angle + (i / count) * Math.PI * 2;

        bulletSpawns(
            origin,
            new THREE.Vector3(Math.cos(a), 0, Math.sin(a)),
            0.5
        );
    }

    angle += 0.08;
}


function updateBullets(){
    for (let i = pebbles.length - 1; i >= 0; i--){
        const pebbleData = pebbles[i];
        pebbleData.mesh.position.add(pebbleData.velocity);

        // ## PLAYER HEALTH LOGIC ##
        // ## AI MODEL: DEEPSEEK
        // ## PROMPT 1: how to add health to both player and enemy ##
        // ## PROMPT 2: make it simpler, no need for display or anything, just show the health in console log and just make the logic of the health system ##

        // Create bounding boxes for collision detection
        const bulletBox = new THREE.Box3().setFromObject(pebbleData.mesh);
        const playerBox = new THREE.Box3().setFromObject(gura_model);
        
        // Check collision with player
        if (bulletBox.intersectsBox(playerBox)) {
            // Player takes damage
            playerHealth -= 10;
            playerHealth = Math.max(playerHealth, 0);
            updateHealthUI();
            console.log(`Player hit! Health: ${playerHealth}`);

            applyHitEffectToPlayer();

            // ## PARTICLE EFFECTS ##
            // ## AI MODEL: DEEPSEEK
            // ## PROMPT : how to add particles for when the bullets hit both the player and the enemy ##
            // Create hit particles (blue particles for player)
            const hitPos = pebbleData.mesh.position.clone();
            const particles = createHitParticles(hitPos, 0x0088ff, 12, 0.6, 25);
            hitParticles.push(...particles);
            // ## END PROMPT ##
            
            // Remove bullet
            scene.remove(pebbleData.mesh);
            pebbles.splice(i, 1);
            
            // Check if player is dead
            if (playerHealth <= 0) {
                playerHealth = 0;
                gameActive = false;
                gameOverType = "defeat"; // Player lost
                showEndScreen("defeat");
                console.log("GAME OVER - Player defeated!");
                gura_idle.stop();
                gura_walk.stop();
            }
            // ## END PROMPT ##
            
            continue;
        }

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



const playerGun = {
    ammo: 5,
    maxAmmo: 5,
    reloadTime: 70, // frames
    reloading: false,
    reloadCounter: 0
}
const playerBullet = [];

// ## PLAYER GUN RELOAD LOGIC ##
// ## AI MODEL: CHATGPT
// ## PROMPT : how to make an ammunition for player ##
// ## PROMPT 2: how to make an ui for reload timer ##
function reloadGun(){
    if (playerGun.reloading) {
        return;
    }
    if (playerGun.ammo === playerGun.maxAmmo) {
        return;
    }
    playerGun.reloading = true;
    playerGun.reloadCounter = playerGun.reloadTime;
    console.log("Reloading started...");
    document.getElementById('reload-container').style.display = 'block';
    document.getElementById('reload-bar').style.width = '0%';
}

function updateReloadUI() {
    if (!playerGun.reloading) return;

    playerGun.reloadCounter--;

    const progress =
        1 - (playerGun.reloadCounter / playerGun.reloadTime);
    console.log("progress... " + progress);

    document.getElementById('reload-bar').style.width =
        `${progress * 100}%`;

    if (playerGun.reloadCounter <= 0) {
        playerGun.reloading = false;
        playerGun.ammo = playerGun.maxAmmo;

        document.getElementById('reload-container').style.display = 'none';
    }
}


function reloadingGun(){
    if (playerGun.reloading) {
        playerGun.reloadCounter--;
        if (playerGun.reloadCounter <= 0) {
            playerGun.ammo = playerGun.maxAmmo;
            playerGun.reloading = false;
        }
        console.log("Reloading..." + playerGun.reloadCounter);
        document.getElementById('reload-text').innerText =`Reloading ${Math.floor(playerGun.reloadCounter / playerGun.reloadTime * 100)}%`;

    }
}
// ## END PROMPT ##

function SpawnPlayerBullet(player, direction){
    if (playerGun.reloading) {
        console.log("Reloading...");
        return;
    }
    if (playerGun.ammo <= 0) {
        console.log("Out of ammo! Press 'R' to reload.");
        return;
    }

    const jailbird =  jailbird_model.clone();

    const Player = player.position.clone();
    Player.y += 2.5;

    jailbird.position.set(Player.x, Player.y, Player.z);
    scene.add(jailbird);

    playerBullet.push({
        mesh: jailbird,
        velocity: direction.clone().normalize().multiplyScalar(0.4)
    });
    playerGun.ammo--;
}

// ## PLAYER BULLET UPDATE LOGIC ##
// ## AI MODEL: CHATGPT
// ## PROMPT 1: code untuk player bisa menembak ke arah musuh ## 
// ## PROMPT 2: buat arah tembakan dari player ke musuh ##

const PLAYER_BULLET_BOUND = 60;

function updatePlayerBullets() {
    for (let i = playerBullet.length - 1; i >= 0; i--) {
        const b = playerBullet[i];
        b.mesh.position.add(b.velocity);

        // ## ENEMY HEALTH LOGIC ##
        // ## AI MODEL: DEEPSEEK
        // ## PROMPT : make it so that when the player's bullets hit the enemy its health goes down by 10 ## 

        const bulletBox = new THREE.Box3().setFromObject(b.mesh);
        const enemyBox = new THREE.Box3().setFromObject(calli_model);
        
        if (bulletBox.intersectsBox(enemyBox)) {
            // Enemy takes damage
            enemyHealth -= 10;
            enemyHealth = Math.max(enemyHealth, 0);
            updateHealthUI();
            console.log(`Enemy hit! Enemy health: ${enemyHealth}`);


            applyHitEffectToEnemy();

            // ## PARTICLE EFFECTS ##
            // ## AI MODEL: DEEPSEEK
            // ## PROMPT : how to add particles for when the bullets hit both the player and the enemy ##
            const hitPos = b.mesh.position.clone();
            const particles = createHitParticles(hitPos, 0xff2200, 15, 0.7, 30);
            hitParticles.push(...particles);
            // ## END PROMPT ##
            
            // Remove bullet
            scene.remove(b.mesh);
            playerBullet.splice(i, 1);
            
            // Check if enemy is dead
            if (enemyHealth <= 0) {
                enemyHealth = 0;
                gameActive = false;
                gameOverType = "victory"; // Player won
                showEndScreen("victory");
                console.log("VICTORY - Enemy defeated!");
                calli_idle.stop();
            }

            continue;
        }
        // ## END PROMPT ##

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
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        Shoot(gura_model, calli_model);
    }
    if (e.key.toLowerCase() === 'e') {
        reloadGun();
    }
});

// Health system variables
let playerHealth = 100;
let enemyHealth = 200;
let gameActive = true;

// ## HEALTH DISPLAY ##
// ## AI MODEL: CHATGPT
// ## PROMPT : bagaimana cara menambahkan tampilan nyawa dari player dan enemynya ##
const MAX_PLAYER_HEALTH = 100;
const MAX_ENEMY_HEALTH = 200;

const playerHPBar = document.getElementById("player-hp");
const enemyHPBar = document.getElementById("enemy-hp");

function updateHealthUI() {
    playerHPBar.style.width =
        (playerHealth / MAX_PLAYER_HEALTH) * 100 + "%";

    enemyHPBar.style.width =
        (enemyHealth / MAX_ENEMY_HEALTH) * 100 + "%";
}

// init
updateHealthUI();

// ## PROMPT END ##


// Camera variables for game over
let gameOverCameraAngle = 0;
let victoryCameraAngle = 0;
let gameOverType = ""; // "defeat" or "victory"

// ## MODEL OVERLAY ##
// ## AI MODEL: DEEPSEEK
// ## PROMPT : add overlay on the enemy and player so that if they get hit they turn red and slightly jump up ##
// Hit effect variables
let playerHitTimer = 0;
let enemyHitTimer = 0;
const MAX_HIT_TIME = 15; // frames for hit effect
let originalPlayerColor = null;
let originalEnemyColor = null;
let playerOriginalY = -1;
let enemyOriginalY = -1;
let isPlayerJumping = false;
let isEnemyJumping = false;

// ## PLAYER HIT EFFECTS ##
function applyHitEffectToPlayer() {
    playerHitTimer = MAX_HIT_TIME;
    
    // Store original color if not already stored
    if (!originalPlayerColor) {
        gura_model.traverse((obj) => {
            if (obj.isMesh && obj.material) {
                originalPlayerColor = obj.material.color.clone();
            }
        });
    }
    
    // Apply red tint to all meshes
    gura_model.traverse((obj) => {
        if (obj.isMesh && obj.material) {
            obj.material.color.setHex(0xff0000);
            
            // Also make material emissive for extra effect
            if (obj.material.emissive) {
                obj.material.emissive.setHex(0x550000);
            }
        }
    });
    
    // Jump effect
    if (!isPlayerJumping) {
        isPlayerJumping = true;
        playerOriginalY = gura_model.position.y;
    }
}
// ## ENEMY HIT EFFECTS ##

function applyHitEffectToEnemy() {
    enemyHitTimer = MAX_HIT_TIME;
    // Store original color if not already stored
    if (!originalEnemyColor) {
        calli_model.traverse((obj) => {
            if (obj.isMesh && obj.material) {
                originalEnemyColor = obj.material.color.clone();
            }
        });
    }
    
    // Apply red tint to all meshes
    calli_model.traverse((obj) => {
        if (obj.isMesh && obj.material) {
            obj.material.color.setHex(0xff0000);
            
            // Also make material emissive for extra effect
            if (obj.material.emissive) {
                obj.material.emissive.setHex(0x550000);
            }
        }
    });
    
    // Jump effect
    if (!isEnemyJumping) {
        isEnemyJumping = true;
        enemyOriginalY = calli_model.position.y;
    }
}
// ## HIT EFFECTS LOGIC ##

function updateHitEffects() {
    // Update player hit effect
    if (playerHitTimer > 0) {
        playerHitTimer--;
        // Jump animation
        if (isPlayerJumping) {
            const jumpHeight = 1;
            const jumpProgress = 1 - (playerHitTimer / MAX_HIT_TIME);
            
            if (jumpProgress < 0.5) {
                // Going up
                gura_model.position.y = playerOriginalY + (jumpProgress * 2 * jumpHeight);
            } else {
                // Coming down
                gura_model.position.y = playerOriginalY + ((1 - jumpProgress) * 2 * jumpHeight);
            }
            
            if (playerHitTimer === 0) {
                // Reset position at end
                gura_model.position.y = playerOriginalY;
                isPlayerJumping = false;
            }
        }
        // Fade out red tint
        if (playerHitTimer === 0 && originalPlayerColor) {
            gura_model.traverse((obj) => {
                if (obj.isMesh && obj.material) {
                    obj.material.color.copy(originalPlayerColor);
                    
                    // Reset emissive
                    if (obj.material.emissive) {
                        obj.material.emissive.setHex(0x000000);
                    }
                }
            });
        }
    }
    // Update enemy hit effect
    if (enemyHitTimer > 0) {
        enemyHitTimer--;
        // Jump animation
        if (isEnemyJumping) {
            const jumpHeight = 1;
            const jumpProgress = 1 - (enemyHitTimer / MAX_HIT_TIME);
            if (jumpProgress < 0.5) {
                // Going up
                calli_model.position.y = enemyOriginalY + (jumpProgress * 2 * jumpHeight);
            } else {
                // Coming down
                calli_model.position.y = enemyOriginalY + ((1 - jumpProgress) * 2 * jumpHeight);
            }
            if (enemyHitTimer === 0) {
                // Reset position at end
                calli_model.position.y = enemyOriginalY;
                isEnemyJumping = false;
            }
        }
        // Fade out red tint
        if (enemyHitTimer === 0 && originalEnemyColor) {
            calli_model.traverse((obj) => {
                if (obj.isMesh && obj.material) {
                    obj.material.color.copy(originalEnemyColor);
                    
                    // Reset emissive
                    if (obj.material.emissive) {
                        obj.material.emissive.setHex(0x000000);
                    }
                }
            });
        }
    }
}
// ## PROMPT END ##


// ## PARTICLE EFFECTS ##
// ## AI MODEL: DEEPSEEK
// ## PROMPT : how to add particles for when the bullets hit both the player and the enemy ##

// Particle system 
const particleMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(generateParticleTexture()),
    blending: THREE.AdditiveBlending,
    transparent: true
});

function generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    // Create a simple circular gradient for particle
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    
    return canvas;
}

function createHitParticles(position, color = 0xff5500, count = 8, size = 0.5, duration = 30) {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
        const particle = new THREE.Sprite(particleMaterial.clone());
        particle.material.color.setHex(color);
        particle.position.copy(position);
        particle.scale.set(size, size, size);
        
        // Random direction
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        scene.add(particle);
        
        particles.push({
            mesh: particle,
            velocity: velocity,
            life: duration,
            maxLife: duration
        });
    }
    
    return particles;
}

// Particle systems
let hitParticles = [];

function updateParticles() {
    for (let i = hitParticles.length - 1; i >= 0; i--) {
        const particle = hitParticles[i];
        
        // Update position
        particle.mesh.position.add(particle.velocity);
        
        // Slow down velocity
        particle.velocity.multiplyScalar(0.95);
        
        // Fade out
        particle.life--;
        const alpha = particle.life / particle.maxLife;
        particle.mesh.material.opacity = alpha * 0.5;
        particle.mesh.scale.multiplyScalar(0.97);
        
        // Remove dead particles
        if (particle.life <= 0) {
            scene.remove(particle.mesh);
            hitParticles.splice(i, 1);
        }
    }
}
// ## END PROMPT ##



const clock = new THREE.Clock();
let frame = 0

function draw() {
    if (!gameActive) {
        // ## VICTORY / DEFEAT CAMERA ##
        // ## AI MODEL: DEEPSEEK
        // ## PROMPT 1: how to make it so that when its game over, the camera spins around the area focusing on the center of the area ##
        // ## PROMPT 2: should the camera be different when the player wins or should it just stay fixed ##
        if (gameOverType === "defeat") {
            // Defeat camera
            gameOverCameraAngle += 0.005; // Slower rotation
            
            // Higher vantage point looking down
            const cameraX = Math.sin(gameOverCameraAngle) * 50;
            const cameraZ = Math.cos(gameOverCameraAngle) * 50;
            const cameraY = 30 + Math.sin(gameOverCameraAngle * 0.5) * 5;
            
            cam.position.set(cameraX, cameraY, cameraZ);
            cam.lookAt(gura_model.position.x, gura_model.position.y + 2, gura_model.position.z); // Focus on player
            
        } else if (gameOverType === "victory") {
            // Victory camera
            victoryCameraAngle += 0.01; // Faster rotation
            
            // Lower, closer orbit around the defeated enemy
            const cameraX = Math.sin(victoryCameraAngle) * 20;
            const cameraZ = Math.cos(victoryCameraAngle) * 20;
            const cameraY = 10 + Math.sin(victoryCameraAngle * 2) * 3; // Bouncy movement
            
            cam.position.set(
                calli_model.position.x + cameraX,
                calli_model.position.y + cameraY,
                calli_model.position.z + cameraZ
            );
            cam.lookAt(calli_model.position); // Focus on enemy
        }
        // ## END PROMPT ##
        
        updateParticles();
        updateHitEffects();
        renderer.render(scene, cam);
        requestAnimationFrame(draw);
        return;
    }
    
    frame++;
    renderer.render(scene, cam);
    const delta = clock.getDelta();
    if(gura_mixer) gura_mixer.update(delta);
    if(calli_mixer) calli_mixer.update(delta);
    if (enemyHealth <= 50) {
        if(frame % 5 === 0){
            aimedShot({x: randInt(-10,10), y: randInt(10,15), z: randInt(-15,-25)}, gura_model.position);
        }
        if (frame % 10 === 0) {
            spiralShot({x : calli_model.position.x, y : calli_model.position.y + 2.5, z : calli_model.position.z});
        }
    } else if (enemyHealth <= 100) {
        if (frame % 10 === 0) {
            spiralShot({x : calli_model.position.x, y : calli_model.position.y + 2.5, z : calli_model.position.z});
        }
    }else {
        if(frame % 5 === 0){
            aimedShot({x: randInt(-10,10), y: randInt(10,15), z: randInt(-15,-25)}, gura_model.position);
        }
    }
    updateReloadUI();
    reloadingGun();
    updatePlayerBullets();
    updateBullets();
    updateParticles();
    updateHitEffects();
    movement();
    requestAnimationFrame(draw);
}
draw();