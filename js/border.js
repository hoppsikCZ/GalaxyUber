class BacgroundBorder {
    constructor(body) {
        this.body = body;
    }

    draw() {
        fill(color(100, 100, 100));
        beginShape();
        this.body.vertices.forEach(element => {
            vertex(element.x * scaleX, element.y * scaleY);
        });
        endShape();
    }
}