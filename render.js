// Get a reference to the canvas we will draw to
const canvas = document.querySelector("#canvas");

const bufferSize = 800;
const scaleFactor = bufferSize / 12;
canvas.width = bufferSize;
canvas.height = bufferSize;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(0, 0, 100, 100);

//Start parsing the obj file
const lines = obj.split("\n");
const vs = [];
const vns = [];
const vts = [];
const triangles = [];

lines.map((line) => {
  const split = line.trim().split(" ");
  if (split[0] == "v") {
    // Handle vertex information
    const x = +split[1];
    const y = +split[2];
    const z = +split[3];

    // We are scaling and shifting so our model is in the middle of the canvas
    const v = new Vertex3(
      x * scaleFactor + bufferSize / 2,
      y * scaleFactor + bufferSize / 2,
      z * scaleFactor
    );
    vs.push(v);
  }
  if (split[0] == "vn") {
    // Handle normal information
    const x = +split[1];
    const y = +split[2];
    const z = +split[3];
    const vn = new Vertex3(x, y, z);
    vns.push(vn);
  }
  if (split[0] == "vt") {
    // Handle UV (texture) coordinate information
    const u = +split[1];
    const v = +split[2];
    const vt = new Vertex2(u, v);
    vts.push(vt);
  }
  if (split[0] == "f") {
    // Handle information about each triangle
    let one = split[1];
    const two = split[2];
    const three = split[3];
    const groups = [one, two, three];
    const points = [];

    groups.map((groupItem) => {
      const group = groupItem.split("/");
      const vIndex = +group[0] - 1;

      const v = vs[vIndex];

      points.push(v);
    });

    const triangle = new Triangle(points[0], points[1], points[2]);
    triangles.push(triangle);
  }
});

// End obj parsing

let zBuffer = [];

let bufferWidth = bufferSize;
let bufferHeight = bufferSize;

function rotate(x, y, angle) {
  const _x = x - bufferSize / 2;
  const _y = y;
  const _r = Math.sqrt(_x ** 2 + _y ** 2);
  const _tan = Math.atan2(_y, _x);
  const _angle = _tan + angle;
  const _x2 = Math.cos(_angle) * _r;
  const _y2 = Math.sin(_angle) * _r;
  return { x: _x2 + bufferSize / 2, y: _y2 };
}

let useAnimation = true;

/**
 * Render the obj to the screen
 */
function render() {
  let usePerspective = true;
  let useBackFaceCulling = true;
  let useOneTriangle = false;

  // First clear the zBuffer
  zBuffer = [];
  for (let x = 0; x < bufferWidth; x++) {
    const col = [];
    for (let y = 0; y < bufferHeight; y++) {
      col.push(new Pixel(x, y, 135, 206, 235, 1000));
    }
    zBuffer.push(col);
  }

  // Loop over all the triangles and draw them to the screen

  for (let index = 0; index < triangles.length; index++) {
    // Just show one triangle for debugging
    if (useOneTriangle) if (index != 1) continue;

    // Get clones of the current triangle vertices so that we don't alter the original geometry
    const one = triangles[index].vertexOne.getClone();
    const two = triangles[index].vertexTwo.getClone();
    const three = triangles[index].vertexThree.getClone();

    //Update the rotation if we are doing a simple animation
    if (useAnimation) {
      let angle = tick / 2;

      let out = rotate(one.x, one.z, angle);
      one.x = out.x;
      one.z = out.y;

      out = rotate(two.x, two.z, angle);
      two.x = out.x;
      two.z = out.y;

      out = rotate(three.x, three.z, angle);
      three.x = out.x;
      three.z = out.y;
    }

    // Setup the camera information for perspective calculations
    const cameraFromZ = bufferSize / 2 + bufferSize / 8 + 5;
    const cameraToZ = bufferSize / 8 + 5;
    const cameraLengthZ = cameraFromZ - cameraToZ;

    // Track the points once we do perspective
    const points = [one, two, three];

    // Loop over the points and apply perspective
    if (usePerspective) {
      points.map((point) => {
        const distanceZ = cameraFromZ - point.z;
        const offsetX = point.x - bufferSize / 2;
        const ratioX = offsetX / distanceZ;
        const newValueX = ratioX * cameraLengthZ;
        point.x = newValueX + bufferSize / 2;

        const offsetY = point.y - bufferSize / 2;
        const ratioY = offsetY / distanceZ;
        const newValueY = ratioY * cameraLengthZ;
        point.y = newValueY + bufferSize / 2;
      });
    }

    const twoOne = two.getSubtract(one);
    const threeOne = three.getSubtract(one);
    const cross = twoOne.getCross(threeOne).getNormalized();
    const normal = cross.getNormalized();
    if (useBackFaceCulling) {
      if (normal.z < 0) continue;
    }

    // Draw the triangle onto the zBuffer
    const a = new Vertex2(one.x, one.y);
    const b = new Vertex2(two.x, two.y);
    const c = new Vertex2(three.x, three.y);

    const e1 = new Edge(a, b);
    const e2 = new Edge(b, c);
    const e3 = new Edge(c, a);

    const pixels1 = e1.getPixels();
    const pixels2 = e2.getPixels();
    const pixels3 = e3.getPixels();

    const allEdgePixels = [...pixels1, ...pixels2, ...pixels3];
    const minY = Math.min(...allEdgePixels.map((p) => p.y));
    const maxY = Math.max(...allEdgePixels.map((p) => p.y));

    // fill in the triangles

    for (let y = minY; y <= maxY; y++) {
      const matching = allEdgePixels.filter((p) => p.y == y);
      const minX = Math.min(...matching.map((p) => p.x));
      const maxX = Math.max(...matching.map((p) => p.x));
      for (let x = minX; x <= maxX; x++) {
        // Calculate the color
        const toSun = new Vertex3(1, 0, 1).getNormalized();
        let diffuse = normal.getDot(toSun);
        diffuse = Math.max(0, diffuse);
        let r = 26;
        let g = 53;
        let b = 62;

        r *= diffuse;
        g *= diffuse;
        b *= diffuse;

        const ambient = 50;
        r += ambient;
        g += ambient;
        b += ambient;

        r = Math.max(0, Math.min(26, r));
        g = Math.max(0, Math.min(53, g));
        b = Math.max(0, Math.min(62, b));

        zBuffer[x][y] = new Pixel(x, y, r, g, b);
      }
    }
    allEdgePixels.map((pixel) => {
      const x = Math.max(0, pixel.x);
      const y = Math.max(0, pixel.y);
      zBuffer[x][y] = pixel;
    });
  }

  // Draw the buffer

  for (let x = 0; x < bufferWidth; x++) {
    for (let y = 0; y < bufferHeight; y++) {
      let pixel = zBuffer[x][y];
      ctx.fillStyle = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    }
  }

  // Increment the tick for animation purposes
  tick++;
}

// Keep track of how many frames we have seen so that we can do simple animation
let tick = 0;

if (useAnimation) {
  setInterval(render, 10);
} else {
  render();
}
