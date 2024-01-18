class Platform {
    constructor(posX, posY, number) {
        this.num = number;
        this.w = 400;
        this.h = 110;
        this.landingFrame = -1;
        this.passengerReady = false;
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

        if (this.passengerReady) {
            imageMode(CENTER);
            image(passengerImage, (this.body.position.x - 80) * scaleX, (this.body.position.y - this.h / 2 - 70) * scaleY, 70 * scaleX, 140 * scaleY);
        }
    }

    land(landingUber) {
        if (!landingUber.landingMode ||
            landingUber.lastVelocity.y > 4 ||
            landingUber.body.position.x - landingUber.w / 2 < this.body.position.x - this.w / 2 ||
            landingUber.body.position.x + landingUber.w / 2 > this.body.position.x + this.w / 2 ||
            landingUber.body.position.y > this.body.position.y - this.h / 2 ||
            landingUber.body.position.y < this.body.position.y - this.h / 2 - landingUber.h
            ) {
            crash = true;
            explosionTimer = 1;
        } else if (this.num === 0 && landingUber.body.speed < 0.1) {
            if (landingUber.fuel < 100) landingUber.fuel += 100 / 3 / gameFrameRate;
            if (landingUber.fuel > 100) landingUber.fuel = 100;
        } else if (this.passengerReady && destination === -1) {
            if (this.landingFrame === -1) {
                this.landingFrame = frames;
                landingUber.loadingPassenger = true;
            } else if (frames - this.landingFrame >= gameFrameRate * 2) {
                this.passengerReady = false;
                passengers--;
                let platformsCopy = platforms.filter((platform) => platform.num !== 0 && platform !== this);

                destination = random(platformsCopy).num;
                
                landingUber.loadingPassenger = false;

                this.landingFrame = -1;
            }
        } else if (destination === this.num) {
            destination = -1;
            score += 10;
            
            if (passengers < 1) newPassenger();
        }
    }
}