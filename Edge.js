class Edge {
  constructor(vertexOne, vertexTwo) {
    this.vertexOne = vertexOne;
    this.vertexTwo = vertexTwo;
  }

  getTangent() {
    return this.vertexTwo.getSubtract(this.vertexOne);
  }

  getNormalizedTangent() {
    return this.getTangent().getNormalized();
  }

  getPerpendicular() {
    return this.getNormalizedTangent().getPerpendicular();
  }

  getABC() {
    const AB = this.getPerpendicular();
    const dot = AB.getDot(this.vertexOne);
    const C = -dot;
    return { A: AB.x, B: AB.y, C };
  }

  getPixels() {
    const startX = this.vertexOne.x;
    const startY = this.vertexOne.y;

    const toReturn = [];

    const tangent = this.getNormalizedTangent();
    const absX = Math.abs(tangent.x);
    const absY = Math.abs(tangent.y);
    const m = Math.max(absX, absY);
    const inverse = 1 / m;
    const offTangent = new Vertex2(tangent.x * inverse, tangent.y * inverse);
    const steps = this.getTangent().getLength() / offTangent.getLength();

    let x = startX;
    let y = startY;

    let count = 0;
    while (count < steps) {
      count++;
      toReturn.push(new Pixel(Math.round(x), Math.round(y), 27, 122, 159));
      x += offTangent.x;
      y += offTangent.y;
    }

    return toReturn;
  }
}
