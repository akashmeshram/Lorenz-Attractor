// function setup() {
//   createCanvas(400,400);
//   pixelDensity(1);
// }

// function draw() {
//   var yoff = 0;
//   background(255);
//   loadPixels();
//   for(var y = 0 ; y < height ; y++){
//     var xoff = 0 ;
//     for(var x = 0 ; x < width ; x++){
//       var r = noise(xoff,yoff)*255 ;   //noise(random(255));
//       var pix = (x + y*width)*4;
//       pixels[pix+0] = r ;
//       pixels[pix+1] = r ;
//       pixels[pix+2] = r ;
//       pixels[pix+3] = 255 ;
//       xoff+=0.01;
//     }
//     yoff += 0.01 ;
//   }
//   updatePixels();
// }


let x = 0.1, y = 0, z = 0 ;
let a = 10;
let b = 28;
let c = 8.0/3.0;
let points = []; 

function setup() {
  createCanvas(windowWidth / 2, windowHeight / 1.5);
  colorMode(HSB);
  smooth();
  strokeWeight(1);
}

function draw() {
  background(11);

  let dt = 0.01 ;

  let dx = (a*(y-x))*dt ;
  let dy = (x*(b-z)-y)*dt ;
  let dz = (x*y - c*z) *dt;

  x = x + dx;
  y = y + dy;
  z = z + dz;

  points.push([x, y, z]);

  translate(width / 2, height / 4);
  //stroke(255);
  noFill();
  scale(7);
  let hu = 0;
  beginShape();
  for (dra of points) {
    let hus = hu%255;
    stroke(hus, 255, 255);
    curveVertex(dra[1], dra[2], dra[0]);
    hu+=1;
  }
  endShape();
}
