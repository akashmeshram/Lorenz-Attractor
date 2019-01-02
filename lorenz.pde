import peasy.*;
import peasy.org.apache.commons.math.*;
import peasy.org.apache.commons.math.geometry.*;

//Coding challenge completed by AKASH MESHRAM (IIT Kharagpur)
// # Lorentz Attracter #

PeasyCam cam;
float x = 0.1, y = 0, z = 0 ;
float a = 10;
float b = 28;
float c = 8.0/3.0;
ArrayList<PVector> points = new ArrayList<PVector>(); 

void setup() {
  size(800, 600, P3D);
  colorMode(HSB);
  smooth();
  strokeWeight(1);
  cam = new PeasyCam(this, 500);
}

void draw() {
  background(51);

  float dt = 0.01 ;

  float dx = (a*(y-x))*dt ;
  float dy = (x*(b-z)-y)*dt ;
  float dz = (x*y - c*z) *dt;

  x = x + dx;
  y = y + dy;
  z = z + dz;

  points.add(new PVector(x, y, z));

  translate(0 , -100, 0);
  //stroke(255);
  noFill();
  scale(5);
  float hu = 0;
  beginShape();
  for (PVector dra : points) {
    float hus = hu%255;
    stroke(hus, 255, 255);
    curveVertex(dra.y, dra.z, dra.x);
    hu+=1;
  }
  endShape();
}
