import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";
import { GPUStatsPanel } from "three/examples/jsm/utils/GPUStatsPanel.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

let line, renderer, scene, camera, camera2, controls;
let matLine, matLineDashed;
let stats, gpuPanel;
let gui;

// viewport
let insetWidth;
let insetHeight;

let x = 0.1,
  y = 0,
  z = 0;
let dt = 0.01;
let a = 10;
let b = 28;
let c = 8.0 / 3.0;

const points = [];
let positions = [];
let colors = [];

let geometry;

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-40, 0, 60);

  camera2 = new THREE.PerspectiveCamera(40, 1, 1, 1000);
  camera2.position.copy(camera.position);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  controls.maxDistance = 500;

  [...new Array(100)].map(() => createPoints());

  geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);

  matLine = new LineMaterial({
    color: 0xffffff,
    linewidth: 5, // in world units with size attenuation, pixels otherwise
    vertexColors: true,

    //resolution:  // to be set by renderer, eventually
    dashed: false,
    alphaToCoverage: true,
  });

  line = new Line2(geometry, matLine);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  scene.add(line);

  // matLineBasic = new THREE.LineBasicMaterial({ vertexColors: true });
  matLineDashed = new THREE.LineDashedMaterial({
    vertexColors: true,
    scale: 2,
    dashSize: 1,
    gapSize: 1,
  });

  window.addEventListener("resize", onWindowResize);
  onWindowResize();

  stats = new Stats();
  document.body.appendChild(stats.dom);

  gpuPanel = new GPUStatsPanel(renderer.getContext());
  stats.addPanel(gpuPanel);
  stats.showPanel(0);

  initGui();
}

function createPoints() {
  const vertex = new THREE.Vector3(x, y, z);
  points.push(vertex);

  if (points.length > 3) {
    updateVertex();
  }
  // Lorenz Curve Algorithm
  x = x + a * (y - x) * dt;
  y = y + (x * (b - z) - y) * dt;
  z = z + (x * y - c * z) * dt;
}

function updateVertex() {
  const spline = new THREE.CatmullRomCurve3(points);
  const divisions = Math.round(12 * points.length);
  const point = new THREE.Vector3();
  const color = new THREE.Color();

  positions.length = 0;
  colors.length = 0;
  for (let i = 0, l = divisions; i < l; i++) {
    const t = i / l;

    spline.getPoint(t, point);
    positions.push(point.x, point.y, point.z);

    color.setHSL(t, 1.0, 0.5);
    colors.push(color.r, color.g, color.b);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  insetWidth = window.innerHeight / 4; // square
  insetHeight = window.innerHeight / 4;

  camera2.aspect = insetWidth / insetHeight;
  camera2.updateProjectionMatrix();
}

function updateLorenzCurve() {
  [...new Array(100)].map(() => createPoints());
  scene.children.slice().forEach((obj) => scene.remove(obj));
  geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);
  line = new Line2(geometry, matLine);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  scene.add(line);
}

function animate() {
  requestAnimationFrame(animate);

  stats.update();

  // main scene

  renderer.setClearColor(0x000000, 0);

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  // renderer will set this eventually
  matLine.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport

  gpuPanel.startQuery();
  renderer.render(scene, camera);
  gpuPanel.endQuery();

  // inset scene

  renderer.setClearColor(0x222222, 1);

  renderer.clearDepth(); // important!

  renderer.setScissorTest(true);

  renderer.setScissor(20, 20, insetWidth, insetHeight);

  renderer.setViewport(20, 20, insetWidth, insetHeight);

  camera2.position.copy(camera.position);
  camera2.quaternion.copy(camera.quaternion);

  // renderer will set this eventually
  matLine.resolution.set(insetWidth, insetHeight); // resolution of the inset viewport

  renderer.render(scene, camera2);

  renderer.setScissorTest(false);
}

function initGui() {
  gui = new GUI();

  const param = {
    "world units": false,
    width: 5,
    alphaToCoverage: true,
    dashed: false,
    "dash scale": 1,
    "dash / gap": 1,
    iterate: function () {
      updateLorenzCurve();
    },
  };

  gui.add(param, "iterate");

  gui.add(param, "world units").onChange(function (val) {
    matLine.worldUnits = val;
    matLine.needsUpdate = true;
  });

  gui.add(param, "width", 1, 10).onChange(function (val) {
    matLine.linewidth = val;
  });

  gui.add(param, "alphaToCoverage").onChange(function (val) {
    matLine.alphaToCoverage = val;
  });

  gui.add(param, "dashed").onChange(function (val) {
    matLine.dashed = val;
  });

  gui.add(param, "dash scale", 0.5, 2, 0.1).onChange(function (val) {
    matLine.dashScale = val;
    matLineDashed.scale = val;
  });

  gui
    .add(param, "dash / gap", { "2 : 1": 0, "1 : 1": 1, "1 : 2": 2 })
    .onChange(function (val) {
      switch (val) {
        case 0:
          matLine.dashSize = 2;
          matLine.gapSize = 1;

          matLineDashed.dashSize = 2;
          matLineDashed.gapSize = 1;

          break;

        case 1:
          matLine.dashSize = 1;
          matLine.gapSize = 1;

          matLineDashed.dashSize = 1;
          matLineDashed.gapSize = 1;

          break;

        case 2:
          matLine.dashSize = 1;
          matLine.gapSize = 2;

          matLineDashed.dashSize = 1;
          matLineDashed.gapSize = 2;

          break;
      }
    });
}

init();
animate();
