// const canvas = document.querySelector("canvas");

// const bufferSize = 200;
// const scaleFactor = bufferSize / 10; // depends on hoe big the model is, we can change the value to make it visible
// canvas.width = bufferSize;
// canvas.height = bufferSize;
// const ctx = canvas.getContext("2d");
// ctx.fillStyle = "red";
// ctx.fillRect(0, 0, 100, 100);

// // Parse the obj file
// const lines = obj.split("\n");
// const vs = [];
// const vns = [];
// const vts = [];
// const triangles = [];

// for (let i = 0; i < lines.length; i++) {
//   let split = lines[i].trim().split(" ");
//   if (split[0] == "v") {
//     // Handle vertex information
//     const x = +split[1];
//     const y = +split[2];
//     const z = +split[3];

//     // shift our model to the middle of the canvas
//     const v = new Vertex3(
//       x * scaleFactor + bufferSize / 2,
//       y * scaleFactor + bufferSize / 2,
//       z * scaleFactor
//     );
//     vs.push(v);
//   }
//   if (split[0] == "vn") {
//     // Handle normal information
//     const x = +split[1];
//     const y = +split[2];
//     const z = +split[3];

//     const vn = new Vertex(x, y, z);
//     vns.push(vn);
//   }
//   if (split[0] == "vt") {
//     //Handle uv coordinate information
//     const u = +split[1];
//     const v = +split[2];
//     const vt = new Vertex2(u, v);
//     vts.push(vt);
//   }
//   if (split[0] == "f") {
//     // Handle information about each triangle
//     const one = split[1];
//     const two = split[2];
//     const three = split[3];
//     const groups = [one, two, three];
//     const points = [];

//     for (let i = 0; i < 3; i++) {
//       const group = groups[i].split("/");
//       const vIndex = +group[0] - 1;
//       const vnIndex = +group[1] - 1;
//       const vtIndex = +group[2] - 1;

//       const v = vs[vIndex];
//       const vn = vns[vnIndex];
//       const vt = vts[vtIndex];

//       points.push(v);
//     }

//     const triangle = new Triangle(points[0], points[1], points[2]);
//     triangles.push(triangle);
//   }
//   // end parsing

//   const zBuffer = [];

//   const bufferWidth = bufferSize;
//   const bufferHeight = bufferSize;

//   function rotate(x, y, angle) {
//     const _x = x - bufferSize / 2;
//     const _y = y;
//     const _r = Math.sqrt(_x ** 2 + _y ** 2);

//     const _tan = Math.atan2(_y, _x);
//     const _angle = _tan + angle;
//     const _x2 = Math.cos(_angle) * _r;
//     const _y2 = Math.sin(_angle) * _r;
//     return { x: _x2 + bufferSize / 2, y: _y2 };
//   }

//   const useAnimation = true;

//   // Render the obj to the screen

//   function render() {
//     const usePerspective = true;
//     const useBackFaceCulling = true;
//     const useOneTriangle = false;

//     // first cleat the z buffer
//     zBuffer = [];
//     for (let x = 0; x < bufferWidth; x++) {
//       const col = [];
//       for (let y = 0; y < bufferHeight; y++) {
//         col.push(new Pixel(x, y, 156, 23, 51, 1000));
//       }
//       zBuffer.push(col);
//     }
//   }

//   // Loop over all the triangles and draw them to the screen
//   for (let index = 0; index < triangles.length; index++) {
//     // just show one triangle for debugging
//     if (useOneTriangle) if (index != 1) continue;

//     // get clones of the current triangle vertices so that we don't alter the original geometry
//     const one = triangles[index].vertexOne.getClone();
//     const two = triangles[index].vertexTwo.getClone();
//     const three = triangles[index].vertexThree.getClone();

//     // update rotation
//     if (useAnimation) {
//       const angle = tick / 10;

//       const out = rotate(one.x, one.z, angle);
//       one.x = out.x;
//       one.z = out.y;

//       out = rotate(two.x, two.z, angle);
//       two.x = out.x;
//       two.z = out.y;

//       out = rotate(three.x, three.z, angle);
//       three.x = out.x;
//       three.z = out.y;
//     }

//     // set up the camera function
//     const cameraFromZ = bufferSize / 2 + bufferSize / 8 + 5;
//     const cameraToZ = bufferSize / 8 + 5;
//     const cameraLengthZ = cameraFromZ - cameraToZ;

//     // track the points once we do perspective
//     const points = [one, two, three];

//     // loop over the points and apply perspective
//     if (usePerspective) {
//       for (const point of points) {
//         const distanceZ = cameraFromZ - point.z;
//         const offsetX = point.x - bufferSize / 2;
//         const ratioX = offsetX / distanceZ;
//         const newvalueX = ratioX * cameraLengthZ;
//         point.x = newvalueX + bufferSize / 2;

//         const offsetY = point.y - bufferSize / 2;
//         const ratioY = offsetY / distanceZ;
//         const newvalueY = ratioY * cameraLengthZ;
//         point.y = newvalueY + bufferSize / 2;
//       }
//     }

//     const twoOne = two.getSubtract(one);
//     const threeOne = three.getSubtract(one);
//     const cross = twoOne.getCross(threeOne).getNormalized();
//     const normal = cross.getNormalized;
//     if (useBackFaceCulling) {
//       if (normal.z < 0) continue;
//     }

//     // Draw the triangle onto the zBuffer
//     const a = new Vertex2(one.x, one.y);
//     const b = new Vertex2(two.x, two.y);
//     const c = new Vertex2(three.x, three.y);

//     const e1 = new Edge(a, b);
//     const e2 = new Edge(b, c);
//     const e3 = new Edge(c, a);

//     const pixels1 = e1.getPixels();
//     const pixels2 = e2.getPixels();
//     const pixels3 = e3.getPixels();

//     const allEdgePixels = [...pixels1, ...pixels2, ...pixels3];
//     const minY = Math.min(...allEdgePixels.map((p) => p.y));
//     const maxY = Math.max(...allEdgePixels.map((p) => p.y));

//     // fill in the triangles

//     for (let y = minY; y <= maxY; y++) {
//       const matching = allEdgePixels.filter((p) => p.y == y);
//       const minX = Math.min(...matching.map((p) => p.x));
//       const maxX = Math.max(...matching.map((p) => p.x));
//       for (let x = minX; x <= maxX; x++) {
//         // calculate the color
//         const toSun = new Vertex3(1, 0, 1).getNormalized();
//         const diffuse = normal.getDot(toSun);
//         diffuse = Math.max(0, diffuse);
//         let r = 72;
//         let g = 170;
//         let b = 73;

//         r *= diffuse;
//         g *= diffuse;
//         b *= diffuse;

//         const ambient = 50;
//         r += diffuse;
//         g += ambient;
//         b += ambient;

//         r = Math.max(0, Math.min(51, r));
//         g = Math.max(0, Math.min(62, g));
//         b = Math.max(0, Math.min(20, b));

//         zBuffer[x][y] = new Pixel(x, y, r, g, b);
//       }
//     }

//     for (let pixel of allEdgePixels) {
//       const x = Math.max(0, pixel.x);
//       const y = Math.max(0, pixel.y);
//       zBuffer[x][y] = pixel;
//     }
//   }

//   for (let x = 0; x < bufferWidth; x++) {
//     for (let y = 0; y < bufferHeight; y++) {
//       const pixel = zBuffer[x][y];
//       ctx.fillStyle = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
//       ctx.fillRect(pixel.x, pixel.y, 1, 1);
//     }
//   }

//   tick++;
// }

// if (useAnimation) {
//   setInterval(render, 100);
// } else {
//   render();
// }
//Get a reference to the canvas we will draw to
let canvas = document.querySelector("#canvas");

let bufferSize = 200;
let scaleFactor = bufferSize / 10;
canvas.width = bufferSize;
canvas.height = bufferSize;
let ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(0, 0, 100, 100);

//Start parsing the obj file
let lines = obj.split("\n");
let vs = [];
let vns = [];
let vts = [];
let triangles = [];

for (let i = 0; i < lines.length; i++) {
  let split = lines[i].trim().split(" ");
  if (split[0] == "v") {
    //Handle vertex information
    let x = +split[1];
    let y = +split[2];
    let z = +split[3];

    //We are scaling and shifting so our model is in the middle of the canvas
    // let v = new Vertex3(x , y , z)
    let v = new Vertex3(
      x * scaleFactor + bufferSize / 2,
      y * scaleFactor + bufferSize / 2,
      z * scaleFactor
    );
    vs.push(v);
  }
  if (split[0] == "vn") {
    //Handle normal information
    let x = +split[1];
    let y = +split[2];
    let z = +split[3];
    let vn = new Vertex3(x, y, z);
    vns.push(vn);
  }
  if (split[0] == "vt") {
    //Handle UV (texture) coordinate information
    let u = +split[1];
    let v = +split[2];
    let vt = new Vertex2(u, v);
    vts.push(vt);
  }
  if (split[0] == "f") {
    //Handle information about each triangle
    let one = split[1];
    let two = split[2];
    let three = split[3];
    let groups = [one, two, three];
    let points = [];
    for (let i = 0; i < 3; i++) {
      let group = groups[i].split("/");
      let vIndex = +group[0] - 1;
      let vnIndex = +group[1] - 1;
      let vtIndex = +group[2] - 1;

      let v = vs[vIndex];
      let vn = vns[vnIndex];
      let vt = vts[vtIndex];

      points.push(v);
    }

    let triangle = new Triangle(points[0], points[1], points[2]);
    triangles.push(triangle);
  }
}
//End obj parsing

let zBuffer = [];

let bufferWidth = bufferSize;
let bufferHeight = bufferSize;

function rotate(x, y, angle) {
  let _x = x - bufferSize / 2;
  let _y = y;
  let _r = Math.sqrt(_x ** 2 + _y ** 2);
  let _tan = Math.atan2(_y, _x);
  let _angle = _tan + angle;
  let _x2 = Math.cos(_angle) * _r;
  let _y2 = Math.sin(_angle) * _r;
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

  //First clear the zBuffer
  zBuffer = [];
  for (let x = 0; x < bufferWidth; x++) {
    let col = [];
    for (let y = 0; y < bufferHeight; y++) {
      col.push(new Pixel(x, y, 156, 23, 51, 1000));
    }
    zBuffer.push(col);
  }

  //Loop over all the triangles
  //And draw them to the screen
  for (let index = 0; index < triangles.length; index++) {
    //Just show one triangle for debugging
    if (useOneTriangle) if (index != 1) continue;

    //Get clones of the current triangle vertices
    //so that we don't alter the original geometry
    let one = triangles[index].vertexOne.getClone();
    let two = triangles[index].vertexTwo.getClone();
    let three = triangles[index].vertexThree.getClone();

    //Update the rotation if we are doing a simple animation
    if (useAnimation) {
      let angle = tick / 10;

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

    //Setup the camera information for perspective calculations
    let cameraFromZ = bufferSize / 2 + bufferSize / 8 + 5;
    let cameraToZ = bufferSize / 8 + 5;
    let cameraLengthZ = cameraFromZ - cameraToZ;

    //Track the points once we do perspective
    let points = [one, two, three];

    //Loop over the points and apply perspective
    if (usePerspective) {
      for (const point of points) {
        let distanceZ = cameraFromZ - point.z;
        let offsetX = point.x - bufferSize / 2;
        let ratioX = offsetX / distanceZ;
        let newValueX = ratioX * cameraLengthZ;
        point.x = newValueX + bufferSize / 2;

        let offsetY = point.y - bufferSize / 2;
        let ratioY = offsetY / distanceZ;
        let newValueY = ratioY * cameraLengthZ;
        point.y = newValueY + bufferSize / 2;
      }
    }

    let twoOne = two.getSubtract(one);
    let threeOne = three.getSubtract(one);
    let cross = twoOne.getCross(threeOne).getNormalized();
    let normal = cross.getNormalized();
    if (useBackFaceCulling) {
      if (normal.z < 0) continue;
    }

    //Draw the triangle onto the zBuffer
    let a = new Vertex2(one.x, one.y);
    let b = new Vertex2(two.x, two.y);
    let c = new Vertex2(three.x, three.y);

    let e1 = new Edge(a, b);
    let e2 = new Edge(b, c);
    let e3 = new Edge(c, a);

    let pixels1 = e1.getPixels();
    let pixels2 = e2.getPixels();
    let pixels3 = e3.getPixels();

    let allEdgePixels = [...pixels1, ...pixels2, ...pixels3];
    let minY = Math.min(...allEdgePixels.map((p) => p.y));
    let maxY = Math.max(...allEdgePixels.map((p) => p.y));

    //Uncomment these lines to fill in the triangles
    //It will not look right because we don't have z-buffering implemented
    //but it will be close.

    for (let y = minY; y <= maxY; y++) {
      let matching = allEdgePixels.filter((p) => p.y == y);
      let minX = Math.min(...matching.map((p) => p.x));
      let maxX = Math.max(...matching.map((p) => p.x));
      for (let x = minX; x <= maxX; x++) {
        //Now calculate the color
        let toSun = new Vertex3(1, 0, 1).getNormalized();
        let diffuse = normal.getDot(toSun);
        diffuse = Math.max(0, diffuse);
        let r = 72;
        let g = 170;
        let b = 73;

        r *= diffuse;
        g *= diffuse;
        b *= diffuse;

        let ambient = 50;
        r += ambient;
        g += ambient;
        b += ambient;

        r = Math.max(0, Math.min(51, r));
        g = Math.max(0, Math.min(62, g));
        b = Math.max(0, Math.min(20, b));

        zBuffer[x][y] = new Pixel(x, y, r, g, b);
      }
    }

    for (let pixel of allEdgePixels) {
      let x = Math.max(0, pixel.x);
      let y = Math.max(0, pixel.y);
      zBuffer[x][y] = pixel;
    }

    // for (let pixel of pixels1) {
    //   let x = Math.max(0, pixel.x);
    //   let y = Math.max(0, pixel.y);
    //   zBuffer[x][y] = pixel;
    // }
    // for (let pixel of pixels2) {
    //   let x = Math.max(0, pixel.x);
    //   let y = Math.max(0, pixel.y);
    //   zBuffer[x][y] = pixel;
    // }
    // for (let pixel of pixels3) {
    //   let x = Math.max(0, pixel.x);
    //   let y = Math.max(0, pixel.y);
    //   zBuffer[x][y] = pixel;
    // }
  }

  // Draw the buffer

  for (let x = 0; x < bufferWidth; x++) {
    for (let y = 0; y < bufferHeight; y++) {
      let pixel = zBuffer[x][y];
      ctx.fillStyle = `rgb(${pixel.r},${pixel.g},${pixel.b})`;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    }
  }

  //Increment the tick for animation purposes
  tick++;
}

//Keep track of how many frames we have seen so that we can
//do simple animation if we want.

let tick = 0;

if (useAnimation) {
  setInterval(render, 100);
} else {
  render();
}
