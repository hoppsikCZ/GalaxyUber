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
let backgroundBorder;
let uber;
let uberImage, uberLandingImage, uberFlameGif, uberBoomImage, passengerImage;
let platformUberDetector;
let platforms = [];
let crash = false;
let loadingPassenger = false;
let explosionTimer = 0;
let destination = -1;
let passengers = 0;
let score = 0;

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

    //backgroundBorder = randomBorder(5);
    //addObjectsBodyToEngine(backgroundBorder);

    platformUberDetector = new Matter.Detector.create();
    Matter.Detector.setBodies(platformUberDetector, Matter.Composite.allBodies(engine.world)/*.filter((body) =>  body.id !== backgroundBorder.body.id)*/);

    newPassenger(2);
}

/* Funkce pro vykreslení plátna */
function draw() {
    frames++;

    if (!crash) {
        Engine.update(engine, 1000 / gameFrameRate);

        if (passengers < 2 && frames % (gameFrameRate * 10) === 0) {
            newPassenger(1);
        }

        let collisions = Matter.Detector.collisions(platformUberDetector);

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
    
    background(0);
    
    //backgroundBorder.draw();

    platforms.forEach((item) => {
        item.draw();
    });

    uber.draw();

    statusBar();
}

function keyPressed() {
    if (keyCode === 32)
        uber.switchMode();
}

function statusBar() {
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

    if (destination !== -1) {
        text(`Next: platform ${destination}`, 450, height - 15);
    } else {
        text(`Next: pickup passenger`, 450, height - 15);
    }

    text(`Score: ${score}`, 50, height - 15);
}

function restartLeverl() {
    score -= 30;
    passengers = 0;
    Matter.Composite.remove(engine.world, uber.body);

    uber = randomSpawnUber();

    platforms.forEach((platform) => {
        platform.passengerReady = false;
        platform.explosionTimer = -1;
    });

    newPassenger(2);
    addObjectsBodyToEngine(uber);
    Matter.Detector.setBodies(platformUberDetector, Matter.Composite.allBodies(engine.world));
}

function addObjectsBodyToEngine(newObject) {
    if (Array.isArray(newObject)) {
        newObject.forEach((platform) => {
            Composite.add(engine.world, platform.body);
        })
    } else {
        Composite.add(engine.world, newObject.body);
    }
}

function randomPlatforms(count, fuel = true) {
    for (let i = fuel ? 0 : 1; i < count + 1; i++) {
    let platform = new Platform(round(random(worldWidth - 400) + 200), round(random(worldHeight - 400) + 275), i);
    platforms.push(platform);
    }
}

function randomBorder(verticesCount) {
    let vertices = [];
    let resultBorder = new BacgroundBorder(Matter.Bodies.rectangle(worldWidth / 2, worldHeight / 2, 500, 500, {isStatic: true}));
    for (let i = 0; i < verticesCount; i++) {
        vertices.push(Matter.Vector.create(round(random(worldWidth)), round(random(worldHeight))));
    }

    Matter.Body.setVertices(resultBorder.body, Matter.Vertices.clockwiseSort(Matter.Vertices.create(vertices, resultBorder.body)));
    return resultBorder;
}

function randomSpawnUber() {
    let platformsCopy = platforms.filter((platform) => platform.num !== 0);
    let platform = random(platformsCopy);

    return spawnUber(platform);
}

function spawnUber(platform) {
    return new Uber(platform.body.position.x, platform.body.position.y - platform.h / 2 - 55);
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