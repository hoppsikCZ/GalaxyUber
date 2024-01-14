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
let uber;
let uberImage, uberLandingImage, uberFlameGif, uberBoomImage;
let platformUberDetector;
let platforms = [];
let crash = false;
let explosionTimer = 0;

let frames;
let scaleX;
let scaleY;

class Uber {
    constructor(posX, posY) {
        this.fuel = 100;
        this.w = 210;
        this.h = 110;
        this.facingRight = false;
        this.landingMode = true;
        this.movingUp = false;
        this.movingDown = false;
        this.movingForward = false;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, {
            inertia: Infinity,
            mass: 0.2,
            frictionAir: 0,
            label: "uber"
        });
        this.id = this.body.id;
        this.lastVelocity = Matter.Body.getVelocity(this.body);
    }

    input() {
        this.movingUp = false;
        this.movingDown = false;
        this.movingForward = false;
        
        if (this.fuel > 0) {
            if (keyIsDown(LEFT_ARROW) && !this.landingMode) {
                this.movingForward = true;
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x -0.15, Matter.Body.getVelocity(this.body).y));
                this.facingRight = false;
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(RIGHT_ARROW) && !this.landingMode) {
                this.movingForward = true;
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x + 0.15, Matter.Body.getVelocity(this.body).y));
                this.facingRight = true;
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(UP_ARROW)) {
                this.movingUp = true;
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y - 0.15));
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(DOWN_ARROW)) {
                this.movingDown = true;
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y + 0.15));
                this.fuel -= fuelConsuptionRate;
              }
        }

        this.lastVelocity = Matter.Body.getVelocity(this.body);
    }

    draw() {
        this.input();
        push();
        translate(this.body.position.x * scaleX, this.body.position.y * scaleY);
        imageMode(CENTER);
        if (this.facingRight) scale(-1, 1);
        image(this.landingMode ? uberLandingImage : uberImage, 0, 0, this.w * scaleX, this.h * scaleY);
        if (crash)
            image(uberBoomImage, 0, 0, 210 * scaleX, 110 * scaleY);
        if (this.movingUp) image(uberFlameGif, 0, ((this.h) / 2 - 10) * scaleY, 30 * scaleX, 40 * scaleY);
        if (this.movingDown) {
            scale(1, -1);
            image(uberFlameGif, 20 * scaleX, ((this.h) / 2 + 20) * scaleY, 30 * scaleX, 40 * scaleY);
            scale(1, -1);   
        }
        if (this.movingForward) {
            rotate(3 * PI / 2);
            image(uberFlameGif, 10 * scaleY, (this.w / 2 + 18) * scaleX, 30 * scaleX, 40 * scaleY);
        }

        pop();
    }
}

class Platform {
    constructor(posX, posY, number) {
        this.num = number;
        this.w = 400;
        this.h = 110;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, { 
            isStatic: true,
            collisionFilter: {
                group: -1
            } 
        });

        this.id = this.body.id;
    }

    draw() {
        rectMode(CENTER);
        if (this.num === 0) fill(color(0, 255, 255));
        else fill(color(255, 255, 255));
        rect(this.body.position.x * scaleX, this.body.position.y * scaleY, this.w * scaleX, this.h * scaleY);
        strokeWeight(0);
        textSize(15);
        textStyle(BOLD);
        fill(color(0));
        textAlign(CENTER, CENTER);
        if (this.num === 0) {   
            text('FUEL', (this.body.position.x - 0) * scaleX, (this.body.position.y + 0) * scaleY);
        } else {
            text(`${this.num}`, this.body.position.x * scaleX, this.body.position.y * scaleY);
        }
        //console.log(this.body);
    }

    land(landingUber) {
        if (!landingUber.landingMode ||
            landingUber.lastVelocity.y > 3 ||
            landingUber.body.position.x - landingUber.w / 2 < this.body.position.x - this.w / 2 ||
            landingUber.body.position.x + landingUber.w / 2 > this.body.position.x + this.w / 2 ||
            landingUber.body.position.y > this.body.position.y - this.h / 2 ||
            landingUber.body.position.y < this.body.position.y - this.h / 2 - landingUber.h
            ) {
            console.log("CRASH");
            crash = true;
            explosionTimer = 1;
        } else if (this.num === 0 && landingUber.body.speed < 0.1) {
            if (landingUber.fuel < 100) landingUber.fuel += 100 / 3 / gameFrameRate;
            if (landingUber.fuel > 100) landingUber.fuel = 100;
        }
    }
}

function preload() {
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
    engine.gravity.scale = 0.0001;

    fuelConsuptionRate = (100 / gameFrameRate) / fuelDuration;

    canvas = createCanvas(displayWidth, displayHeight);

    randomPlatforms(4, true);
    uber = spawnUber();

    Composite.add(engine.world, uber.body);

    platformUberDetector = new Matter.Detector.create();
    Matter.Detector.setBodies(platformUberDetector, Matter.Composite.allBodies(engine.world));
}
 
/* Funkce pro vykreslení plátna */
function draw() {
    if (!crash) {
        Engine.update(engine, 1000 / gameFrameRate);
        
        let collisions = Matter.Detector.collisions(platformUberDetector);

        collisions.forEach((collision, idx, arr) => {
            let colPlatformId = collision.bodyA === uber.body ? collision.bodyB.id : collision.bodyA.id;
            
            platforms.forEach((platform) => {
                //console.log(.id);

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
    
    platforms.forEach((item) => {
        item.draw();
    });
    uber.draw();

    statusBar();
    //console.log(uber.body.speed);
}

function keyPressed() {
    if (keyCode === 32)
        uber.landingMode = !uber.landingMode;
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
}

function restartLeverl() {
    Matter.Composite.remove(engine.world, uber.body);

    uber = spawnUber();

    Matter.Composite.add(engine.world, uber.body);
    Matter.Detector.setBodies(platformUberDetector, Matter.Composite.allBodies(engine.world));
}

function addPlatformsToEngine(arr) {
    arr.forEach((platform) => {
        Composite.add(engine.world, platform.body);
    })
}

function randomPlatforms(count, fuel = true) {
     for (let i = fuel ? 0 : 1; i < count + 1; i++) {
        let platform = new Platform(round(random(worldWidth - 400) + 200), round(random(worldHeight - 400) + 275), i)
        platforms.push(platform);
     }

     addPlatformsToEngine(platforms);
}

function spawnUber(platform = random(platforms)) {
    let spawnPlatform = platform;
    return new Uber(spawnPlatform.body.position.x, spawnPlatform.body.position.y - spawnPlatform.h / 2 - 55);
}

function windowResized() {
    scaleX = windowWidth / worldWidth;
    scaleY = windowHeight / worldHeight;
    resizeCanvas(windowWidth, windowHeight);
  }