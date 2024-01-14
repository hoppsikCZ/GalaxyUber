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
let uberImage, uberLandingImage;
let platforms = [];
let ground;

let scaleX;
let scaleY;

class Uber {
    constructor(posX, posY) {
        this.fuel = 100;
        this.w = 210;
        this.h = 110;
        this.facingRight = false;
        this.landingMode = true;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, {
            inertia: Infinity,
            mass: 0.2,
            frictionAir: 0
        });
        this.body.set
    }

    input() {
        if (this.fuel > 0) {
            if (keyIsDown(LEFT_ARROW) && !this.landingMode) {
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x -0.15, Matter.Body.getVelocity(this.body).y));
                this.facingRight = false;
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(RIGHT_ARROW) && !this.landingMode) {
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x + 0.15, Matter.Body.getVelocity(this.body).y));
                this.facingRight = true;
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(UP_ARROW)) {
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y - 0.15));
                this.fuel -= fuelConsuptionRate;
              }
              if (keyIsDown(DOWN_ARROW)) {
                Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y + 0.15));
                this.fuel -= fuelConsuptionRate;
              }
        }
    }

    draw() {
        this.input();
        push();
        imageMode(CENTER);
        translate(this.body.position.x * scaleX, this.body.position.y * scaleY);
        if (this.facingRight) scale(-1, 1);
        image(this.landingMode ? uberLandingImage : uberImage, 0, 0, this.w * scaleX, this.h * scaleY);
        pop();
    }
}

class Platform {
    constructor(posX, posY, number) {
        this.num = number;
        this.w = 400;
        this.h = 110;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, { isStatic: true });
    }

    draw() {
        rectMode(CENTER);
        fill(color(255, 255, 255))
        rect(this.body.position.x * scaleX, this.body.position.y * scaleY, this.w * scaleX, this.h * scaleY);
    }
}

function preload() {
    uberImage = loadImage("img/uber.png");
    uberLandingImage = loadImage("img/uberLanding.png");
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
}
 
/* Funkce pro vykreslení plátna */
function draw() {
    Engine.update(engine, 1000 / gameFrameRate);
    background(0);
    
    platforms.forEach((item) => {
        item.draw();
    })
    uber.draw();

    statusBar();
    //console.log(uber.body);
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

function randomPlatforms(count, fuel = true) {
     for(let i = fuel ? 0 : 1; i < count + 1; i++) {
        let platform = new Platform(round(random(worldWidth - 400) + 200), round(random(worldHeight - 400) + 345), i)
        platforms.push(platform);
        Composite.add(engine.world, platform.body);
     }
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