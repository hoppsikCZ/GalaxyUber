class Uber {
    constructor(posX, posY) {
        this.fuel = 100;
        this.w = 210;
        this.h = 110;
        this.facingRight = false;
        this.loadingPassenger = false;
        this.landingMode = true;
        this.movingUp = false;
        this.movingDown = false;
        this.movingForward = false;
        this.body = Bodies.rectangle(posX, posY, this.w, this.h, {
            inertia: Infinity,
            frictionAir: 0,
            frictionStatic: Infinity,
            restitution: 0.5,
            label: "uber"
        });
        this.id = this.body.id;
        this.lastVelocity = Matter.Body.getVelocity(this.body);
    }

    switchMode() {
        if (!this.loadingPassenger) {
            this.landingMode = !this.landingMode;
            let velocity = this.body.velocity;
            if (this.landingMode) {
                Matter.Body.scale(this.body, 1, 110 / 80, Matter.Vector.add(this.body.position, Matter.Vector.create(0, -this.h / 2)));
                this.h = 110;
            } else {
                Matter.Body.scale(this.body, 1, 80 / 110, Matter.Vector.add(this.body.position, Matter.Vector.create(0, -this.h / 2)));
                this.h = 80;
            }

            Matter.Body.setVelocity(this.body, velocity);
            Matter.Body.setInertia(this.body, Infinity);
        }
    }

    input() {
        this.movingUp = false;
        this.movingDown = false;
        this.movingForward = false;
        
        if (this.fuel > 0 && !this.loadingPassenger) {
            if (keyIsDown(LEFT_ARROW) && !this.landingMode) {
                this.movingForward = true;
                Matter.Body.setVelocity(this.body, Matter.Vector.add(this.body.velocity, Matter.Vector.create(-0.15, 0)));
                this.facingRight = false;
                this.fuel -= fuelConsuptionRate;
            }
            if (keyIsDown(RIGHT_ARROW) && !this.landingMode) {
            this.movingForward = true;
            Matter.Body.setVelocity(this.body, Matter.Vector.add(this.body.velocity, Matter.Vector.create(0.15, 0)));
            this.facingRight = true;
            this.fuel -= fuelConsuptionRate;
            }
            if (keyIsDown(UP_ARROW)) {
            this.movingUp = true;
            Matter.Body.setVelocity(this.body, Matter.Vector.add(this.body.velocity, Matter.Vector.create(0, -0.2)));
            this.fuel -= fuelConsuptionRate;
            }
            if (keyIsDown(DOWN_ARROW)) {
            this.movingDown = true;
            Matter.Body.setVelocity(this.body, Matter.Vector.add(this.body.velocity, Matter.Vector.create(0, 0.15)));
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
        if (this.movingUp) image(uberFlameGif, 0, ((this.h) / 2 + (this.landingMode ? -10 : 20)) * scaleY, 30 * scaleX, 40 * scaleY);
        if (this.movingDown) {
            scale(1, -1);
            image(uberFlameGif, 20 * scaleX, ((this.h) / 2 + 20) * scaleY, 30 * scaleX, 40 * scaleY);
            scale(1, -1);   
        }
        if (this.movingForward) {
            rotate(3 * PI / 2);
            image(uberFlameGif, (this.landingMode ? 15 : 0) * scaleY, (this.w / 2 + 18) * scaleX, 30 * scaleX, 40 * scaleY);
        }

        pop();
    }
}