// module aliases
let Engine = Matter.Engine,
    //Render = Matter.Render,
    //Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

    
let engine;
let renderer;
let gameFrameRate;
let uber;
let uberImage;
let ground;
let worldHeight;
let worldWidth;
let scaleX;
let scaleY;

class Uber {
    constructor(posX, posY) {
        this.w = 210;
        this.h = 110;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, {
            inertia: Infinity,
            mass: 0.2,
            frictionAir: 0
        });
    }

    input() {
        if (keyIsDown(LEFT_ARROW)) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x -0.15, Matter.Body.getVelocity(this.body).y));
          }
          if (keyIsDown(RIGHT_ARROW)) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x + 0.15, Matter.Body.getVelocity(this.body).y));
          }
          if (keyIsDown(UP_ARROW)) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y - 0.15));
          }
          if (keyIsDown(DOWN_ARROW)) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(Matter.Body.getVelocity(this.body).x, Matter.Body.getVelocity(this.body).y + 0.15));
          }
    }

    draw() {
        this.input();
        image(uberImage, this.body.position.x * scaleX, this.body.position.y * scaleY, this.w * scaleX, this.h * scaleY);
    }
}

function preload() {
    uberImage = loadImage("img/uber.png");
}

function setup() {
    worldWidth = 8000;
    worldHeight = 4500;
    scaleX = windowWidth / worldWidth;
    scaleY = windowHeight /worldHeight;
    gameFrameRate = 60;
    frameRate(gameFrameRate);
    
    engine = Engine.create();
    engine.gravity.scale = 0.0001;

    imageMode(CENTER);
    rectMode(CENTER);
    canvas = createCanvas(displayWidth, displayHeight);

    uber = new Uber(300, 100);
    ground = Bodies.rectangle(2000, 4000, 4000, 300, { isStatic: true });
    Composite.add(engine.world, [uber.body, ground]);
}
 
/* Funkce pro vykreslení plátna */
function draw() {
    Engine.update(engine, 1000 / gameFrameRate);
    background(0);
    
    rect(2000 * scaleX, 4000 * scaleY, 4000 * scaleX, 300 * scaleY);
    uber.draw();
    console.log(uber.body);
}

function windowResized() {
    scaleX = windowWidth / worldWidth;
    scaleY = windowHeight /worldHeight;
    resizeCanvas(windowWidth, windowHeight);
  }