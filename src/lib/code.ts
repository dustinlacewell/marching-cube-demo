
let scene, camera, renderer, controls;
let points = [];
let meshes = [];
const gridSize = 6;
const spacing = 10;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(40, 40, 40);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  createGrid();
  addLights();

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('click', onDocumentClick, false);
  document.getElementById('resetButton').addEventListener('click', resetPoints);
}

function createGrid() {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const sphere = new THREE.Mesh(geometry, material.clone());
        sphere.position.set(
          x * spacing - (gridSize - 1) * spacing / 2,
          y * spacing - (gridSize - 1) * spacing / 2,
          z * spacing - (gridSize - 1) * spacing / 2
        );
        sphere.userData = { active: false };
        scene.add(sphere);
        points.push(sphere);
      }
    }
  }
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentClick(event) {
  event.preventDefault();

  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(points);

  if (intersects.length > 0) {
    const point = intersects[0].object;
    point.userData.active = !point.userData.active;
    point.material.color.setHex(point.userData.active ? 0xff0000 : 0x00ff00);
    updateMarchingCubes();
  }
}

function resetPoints() {
  points.forEach(point => {
    point.userData.active = false;
    point.material.color.setHex(0x00ff00);
  });
  updateMarchingCubes();
}

function updateMarchingCubes() {
  // Remove existing meshes
  meshes.forEach(mesh => scene.remove(mesh));
  meshes = [];

  // Simple implementation of Marching Cubes
  for (let x = 0; x < gridSize - 1; x++) {
    for (let y = 0; y < gridSize - 1; y++) {
      for (let z = 0; z < gridSize - 1; z++) {
        const cube = [
          getPoint(x, y, z),
          getPoint(x + 1, y, z),
          getPoint(x + 1, y, z + 1),
          getPoint(x, y, z + 1),
          getPoint(x, y + 1, z),
          getPoint(x + 1, y + 1, z),
          getPoint(x + 1, y + 1, z + 1),
          getPoint(x, y + 1, z + 1)
        ];

        const activePoints = cube.filter(p => p.userData.active);

        if (activePoints.length >= 4) {
          const geometry = new THREE.BoxGeometry(spacing, spacing, spacing);
          const material = new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            (x + 0.5) * spacing - (gridSize - 1) * spacing / 2,
            (y + 0.5) * spacing - (gridSize - 1) * spacing / 2,
            (z + 0.5) * spacing - (gridSize - 1) * spacing / 2
          );
          scene.add(mesh);
          meshes.push(mesh);
        }
      }
    }
  }
}

function getPoint(x, y, z) {
  return points[x + y * gridSize + z * gridSize * gridSize];
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
animate();