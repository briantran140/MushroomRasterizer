const canvas = document.querySelector("canvas");

const bufferSize = 200;
const scaleFactor = bufferSize / 10; // depends on hoe big the model is, we can change the value to make it visible
canvas.width = bufferSize;
canvas.height = bufferSize;
const ctx = canvas.getContext;
ctx.fillStyle = "red";
ctx.fillRect(0, 0, 100, 100);

// Parse the obj file
const lines = obj.split("\n");
const vs = [];
const vns = [];
const vts = [];
const triangles = [];

for (let i = 0; i < lines.length; i++) {
  let split = lines[i].trim().split(" ");
  if (split[0] == "v") {
    // Handle vertex information
    const x = +split[1];
    const y = +split[2];
    const z = +split[3];

    // shift our model to the middle of the canvas
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

    const vn = new Vertex(x, y, z);
    vns.push(vn);
  }
  if (split[0] == "vt") {
    //Handle uv coordinate information
    const u = +split[1];
    const v = +split[2];
    const vt = new Vertex2(u, v);
    vts.push(vt);
  }
  if (split[0] == "f") {
    // Handle information about each triangle
    const one = split[1];
    const two = split[2];
    const three = split[3];
    const groups = [one, two, three];
    const points = [];

    for (let i = 0; i < 3; i++) {
      const group = groups[i].split("/");
      const vIndex = +group[0] - 1;
      const vnIndex = +group[1] - 1;
      const vtIndex = +group[2] - 1;

      const v = vs[vIndex];
      const vn = vns[vnIndex];
      const vt = vts[vtIndex];

      points.push(v);
    }

    const triangle = new Triangle(points[0], points[1], points[2]);
    triangles.push(triangle);
  }
  // end parsing

  const zBuffer = [];

  const bufferWidth = bufferSize;
  const bufferHeight = bufferSize;

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

  const useAnimation = true;

  // Render the obj to the screen

  function render() {
    const usePerspective = true;
    const useBackFaceCulling = true;
    const useOneTriangle = false;

    // first cleat the z buffer
    zBuffer = [];
    for (let x = 0; x < bufferWidth; x++) {
      const col = [];
      for (let y = 0; y < bufferHeight; y++) {
        col.push(new Pixel(x, y, 156, 23, 51, 1000));
      }
      zBuffer.push(col);
    }
  }
}
