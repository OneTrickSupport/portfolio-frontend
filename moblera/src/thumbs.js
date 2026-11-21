// Små 3D-bilder av möblerna till katalogen. Ritas en gång per möbel och sparas i minnet.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CATALOG, newItem } from './catalog.js';
import { buildModel } from './models.js';

const SIZE = 144;
const cache = new Map();
let R = null, scene, cam, failed = false;

function setup() {
  if (R || failed) return;
  try {
    R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    R.setPixelRatio(1);
    R.setSize(SIZE, SIZE, false);
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 0.86;
    scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b2a6, 0.7));
    const sun = new THREE.DirectionalLight(0xfff4e2, 2.2);
    sun.position.set(-3, 6, 4);
    scene.add(sun);
    cam = new THREE.PerspectiveCamera(26, 1, 0.05, 100);
  } catch {
    failed = true;
    R = null;
  }
}

/** Bild (data-URL) av katalogmöbeln, eller null om 3D inte går att använda här. */
export function thumb(type) {
  if (cache.has(type)) return cache.get(type);
  setup();
  const d = CATALOG[type];
  if (failed || !d) return null;
  let url = null;
  try {
    const g = buildModel({ ...newItem(type, 7, 0, 0), elev: 0 });
    scene.add(g);
    const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    const rad = Math.max(0.06, s.length() / 2);
    const flat = s.y < 0.06, thin = d.wall && s.z < 0.2;
    const dir = (flat ? new THREE.Vector3(0.35, 1.25, 0.8) : thin ? new THREE.Vector3(0.55, 0.3, 1.2) : new THREE.Vector3(0.85, 0.62, 1.2)).normalize();
    cam.position.copy(c).addScaledVector(dir, (rad / Math.sin((cam.fov * Math.PI) / 360)) * 1.02);
    cam.near = rad * 0.05;
    cam.far = rad * 20;
    cam.lookAt(c);
    cam.updateProjectionMatrix();
    R.render(scene, cam);
    url = R.domElement.toDataURL('image/webp', 0.86);
    scene.remove(g);
    g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  } catch (err) {
    console.warn('Ingen katalogbild för', type, err);
  }
  cache.set(type, url);
  return url;
}
