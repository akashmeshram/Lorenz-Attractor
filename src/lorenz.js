import * as THREE from "three";

export default class Lorenz {
  constructor() {
    this.x = 0.1;
    this.y = 0;
    this.z = 0;
    this.dt = 0.01;
    this.a = 10;
    this.b = 28;
    this.c = 8.0 / 3.0;
    this.points = [];
  }

  get nextVertex() {
    const vertex = new THREE.Vector3(this.x, this.y, this.z);
    this.points.push(vertex);

    this.x += this.a * (this.y - this.x) * this.dt;
    this.y += (this.x * (this.b - this.z) - this.y) * this.dt;
    this.z += (this.x * this.y - this.c * this.z) * this.dt;
    return vertex;
  }

  get allPoints() {
    return this.points;
  }
}
