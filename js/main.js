// module aliases
let Engine = Matter.Engine,
    //Render = Matter.Render,
    //Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

const worldHeight = 4500;
const worldWidth = 8000;
const fuelDuration = 120;
const gameFrameRate = 60;

let engine;
let fuelConsuptionRate;
let worldBounds;
let uber;
let uberImage, uberLandingImage, uberFlameGif, uberBoomImage, passengerImage;
let platforms = [];
let crash = false;
let loadingPassenger = false;
let explosionTimer = 0;
let destination = -1;
let passengers = 0;
let lives = 3;
let score = 0;
let startingScore = 0;
let nextLevelReady = false;
let gameEnd = false;

let frames = 0;
let scaleX;
let scaleY;

function preload() {
    passengerImage = loadImage("img/passenger.gif");
    uberBoomImage = loadImage("img/uberBoom.gif");
    uberImage = loadImage("img/uber.png");
    uberLandingImage = loadImage("img/uberLanding.png");
    uberFlameGif = loadImage("img/flame.gif");
}

function setup() {
    scaleX = windowWidth / worldWidth;
    scaleY = windowHeight /worldHeight;
    frameRate(gameFrameRate);
    
    engine = Engine.create();
    engine.gravity.scale = 0.0002;

    fuelConsuptionRate = (100 / gameFrameRate) / fuelDuration;

    canvas = createCanvas(displayWidth, displayHeight);

    randomPlatforms(5, true);
    addObjectsBodyToEngine(platforms);
    uber = randomSpawnUber();

    addObjectsBodyToEngine(uber);

    
    worldBounds = Matter.Bodies.rectangle(worldWidth / 2, worldHeight / 2, 7600, 4200, { 
        isStatic: true,
        collisionFilter: {
            group: 0,
            mask: 0
        }
    })

    newPassenger(2);
}

/* Funkce pro vykreslení plátna */
function draw() {
    frames++;
    if (gameEnd) {
        textSize(100);
        textStyle(BOLD);
        fill(color(255, 0, 0));
        text("Game Over", width / 2 - 300, height / 2 + 50, )
        return;
    } else if (!crash) {
        Engine.update(engine, 1000 / gameFrameRate);

        if (passengers < 2 && frames % (gameFrameRate * 10) === 0) {
            newPassenger(1);
        }

        if(!Matter.Bounds.contains(worldBounds.bounds, uber.body.vertices[0]) ||
        !Matter.Bounds.contains(worldBounds.bounds, uber.body.vertices[1]) ||
        !Matter.Bounds.contains(worldBounds.bounds, uber.body.vertices[2]) ||
        !Matter.Bounds.contains(worldBounds.bounds, uber.body.vertices[3])) {
            if (nextLevelReady) {
                nextLevel();
                return;
            } else {
                crash = true; 
                explosionTimer = 1;
                return;
            }
        }

        let collisions = Matter.Query.collides(uber.body, platforms.map((platform) => platform.body));

        collisions.forEach((collision, idx, arr) => {
            let colPlatformId = collision.bodyA === uber.body ? collision.bodyB.id : collision.bodyA.id;
            
            platforms.forEach((platform) => {

                if (platform.id !== colPlatformId) return;
                
                platform.land(uber);
            })
        });
    } else {
        explosionTimer -= (1 / gameFrameRate);

        if (explosionTimer <= 0) {
            restartLeverl();
            crash = false;
        }
    }

    if (!nextLevelReady && score - startingScore >= 30) nextLevelReady = true;
    
    background(0);

    drawBounds();

    uber.draw();

    platforms.forEach((item) => {
        item.draw();
    });

    statusBar();
}

function keyPressed() {
    if (keyCode === 32)
        uber.switchMode();
}

function statusBar() {
    rectMode(CORNER);
    /* Nastaví se poloprůhledná černá výplň */
    fill(color(0, 0, 0, 127));
    /* Vykreslí se obdélník o výšce 40 pixelů nad spodním okrajem obrazovky */
    rect(0, height - 40, width, 40);
    /* Tloušťka obrysu */
    strokeWeight(0);
    
    textAlign(LEFT, BOTTOM);
    /* Výška písma */
    textSize(20);
    /* Řez písma - tučné */ 
    textStyle(BOLD);
    /* Barva výplně - světle šedá */
    fill(color(200));
    /* Výpis úrovně paliva uberu */
    text(`Fuel: ${ceil(uber.fuel)}`, 250, height - 15);
    /* Čas hry v sekundách a setinách sekundy */
    text(`Time: ${round(millis()/1000)}.${round(millis() % 100)}`, 850, height - 15);
    text(`Lives: ${lives}`, 1050, height - 15);

    if (destination !== -1) {
        text(`Next: platform ${destination}`, 450, height - 15);
    } else {
        text(`Next: pickup passenger`, 450, height - 15);
    }

    text(`Score: ${score}`, 50, height - 15);
}

function drawBounds() {
    if (!nextLevelReady) stroke(color(255, 0, 0));
    else stroke(color(0, 255, 0));
    strokeWeight(5);
    noFill();
    rectMode(CENTER);
    rect(width / 2, height / 2, 7600 * scaleX, 4200 * scaleY, 10, 10, 10, 10);
}

function nextLevel() {
    passengers = 0;
    nextLevelReady = false;
    if (!uber.landingMode) uber.switchMode();
    destination = -1;
    startingScore = score;
    uber.lastVelocity = Matter.Vector.create(0, 0);
    Matter.Engine.clear(engine);
    Matter.Composite.clear(engine.world, true);
    engine = Engine.create();
    engine.gravity.scale = 0.0002;
    platforms = [];
    randomPlatforms(5);
    spawnUber(random(platforms.filter((element) => element.num !== 0)), false);
    newPassenger(2);
    addObjectsBodyToEngine(uber);
    addObjectsBodyToEngine(platforms);
}

function restartLeverl() {
    lives--;
    if (lives <= 0) gameEnd = true;
    passengers = 0;
    destination = -1;
    Matter.Composite.remove(engine.world, uber.body);

    uber = randomSpawnUber();

    platforms.forEach((platform) => {
        platform.passengerReady = false;
        platform.landingFrame = -1;
    });

    newPassenger(2);
    addObjectsBodyToEngine(uber);
}

function addObjectsBodyToEngine(newObject) {
    if (Array.isArray(newObject)) {
        Composite.add(engine.world, newObject.map((element) => element.body));
    } else {
        Composite.add(engine.world, newObject.body);
    }
}

function randomPlatforms(count, fuel = true) {
    for (let i = fuel ? 0 : 1; i < count + 1; i++) {
        let platform = new Platform(round(random(worldWidth - 800) + 400), round(random(worldHeight - 800) + 400), i);
        platforms.push(platform);
    }
}

function randomSpawnUber() {
    let platformsCopy = platforms.filter((platform) => platform.num !== 0);
    let platform = random(platformsCopy);

    return spawnUber(platform);
}

function spawnUber(platform, newOne = true) {
    if (newOne) return new Uber(platform.body.position.x, platform.body.position.y - platform.h / 2 - 55);
    
    Matter.Body.setVelocity(uber.body, Matter.Vector.create(0, 0));
    Matter.Body.setPosition(uber.body, Matter.Vector.add(platform.body.position, Matter.Vector.create(0, -platform.h / 2 - 55)));
    return 1;
}

function newPassenger(count) {
    let platformsCopy = platforms.filter((platform) => platform.num != 0);
    for (let i = 0; i < count; i++) {
        let chosenPlatform = random(platformsCopy);
        platformsCopy.splice(platformsCopy.indexOf(chosenPlatform), 1);
        chosenPlatform.passengerReady = true;
        passengers++;   
    }
}

function windowResized() {
    scaleX = windowWidth / worldWidth;
    scaleY = windowHeight / worldHeight;
    resizeCanvas(windowWidth, windowHeight);
}