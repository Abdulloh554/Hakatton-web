import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Location } from '@hakaton/shared';

export type GlobeMode = 'earth' | 'mars' | 'moon';

export interface GlobeScene {
  update: (locations: Location[], selectedId: string | undefined, mode: GlobeMode) => void;
  rotate: (enabled: boolean) => void;
  zoom: (direction: 'in' | 'out') => void;
  reset: () => void;
  dispose: () => void;
}

export function locationPosition(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const latitude = THREE.MathUtils.degToRad(lat);
  const longitude = THREE.MathUtils.degToRad(lng);
  // Align longitude with the equirectangular map used by SphereGeometry.
  return new THREE.Vector3(
    radius * Math.cos(latitude) * Math.cos(longitude),
    radius * Math.sin(latitude),
    -radius * Math.cos(latitude) * Math.sin(longitude),
  );
}

function releaseObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

/** Owns all GPU resources, event listeners, and animation frames for one mounted globe. */
export function createGlobeScene(
  host: HTMLElement,
  callbacks: {
    onSelect: (id: string) => void;
    onInteraction: () => void;
    onHover: (name: string | null) => void;
    onUnavailable: () => void;
    onTextureError: () => void;
  },
): GlobeScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 40);
  const home = locationPosition(23, 30, 3.8);
  camera.position.copy(home);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x071c29, 0);
  renderer.domElement.setAttribute('aria-label', 'Interaktiv Yer globusi. Aylantirish uchun yo‘nalish tugmalaridan, yaqinlashtirish uchun + va - tugmalaridan foydalaning.');
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.tabIndex = 0;
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.enableZoom = true;
  controls.minDistance = 2.45;
  controls.maxDistance = 5.2;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;
  controls.autoRotateSpeed = 0.38;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.65;
  controls.saveState();

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = media.matches;
  let rotating = !reducedMotion;
  let disposed = false;
  let visible = true;
  let frameId = 0;
  let lastTime = 0;
  let focusDirection: THREE.Vector3 | null = null;
  let focusDistance = 0;
  let selected: string | undefined;
  let pickMeshes: THREE.Mesh[] = [];
  let pinGroups: THREE.Group[] = [];
  let hoveredId: string | undefined;
  let signature = '';

  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0xd8e7e9,
    specular: 0x405663,
    shininess: 12,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), earthMaterial);
  scene.add(earth);
  const ambient = new THREE.AmbientLight(0xd1efff, 1.8);
  const sunlight = new THREE.DirectionalLight(0xffedcf, 2.4);
  sunlight.position.set(-3, 4, 5);
  const fill = new THREE.DirectionalLight(0x63a5bd, 1.1);
  fill.position.set(4, 0, -3);
  scene.add(ambient, sunlight, fill);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.055, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x57afce) } },
      vertexShader: `varying vec3 vNormal; varying vec3 vView;
        void main() {
          vec4 positionView = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-positionView.xyz);
          gl_Position = projectionMatrix * positionView;
        }`,
      fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vView;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
          gl_FragColor = vec4(glowColor, rim * 0.48);
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(atmosphere);

  const markers = new THREE.Group();
  scene.add(markers);
  const texture = new THREE.TextureLoader().load('/textures/earth.jpg', (loaded) => {
    if (disposed) {
      loaded.dispose();
      return;
    }
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    earthMaterial.map = loaded;
    earthMaterial.needsUpdate = true;
    requestDraw();
  }, undefined, () => {
    if (!disposed) callbacks.onTextureError();
  });

  function active(): boolean {
    return !disposed && visible && !document.hidden;
  }

  function render(): void {
    if (disposed) return;
    // A far-side pin must never show through the globe or be selected by raycasting.
    for (const pin of pinGroups) {
      pin.visible = pin.position.dot(camera.position.clone().sub(pin.position)) > 0;
    }
    renderer.render(scene, camera);
  }

  function animate(time: number): void {
    frameId = 0;
    if (!active()) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    if (focusDirection) {
      // Orbit along the sphere: lerping positions directly would sink the camera
      // through the globe when the selected pin is on the opposite side.
      const alpha = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
      const direction = camera.position.clone().normalize();
      const rotation = new THREE.Quaternion().setFromUnitVectors(direction, focusDirection);
      direction.applyQuaternion(new THREE.Quaternion().slerp(rotation, alpha));
      camera.position.copy(direction).multiplyScalar(focusDistance);
      if (camera.position.angleTo(focusDirection) < 0.008) {
        camera.position.copy(focusDirection).multiplyScalar(focusDistance);
        focusDirection = null;
      }
    }
    controls.autoRotate = rotating && !reducedMotion && !focusDirection;
    controls.update(delta);
    render();
    // controls.update() may already have queued one frame through its change event.
    if ((controls.autoRotate || focusDirection) && !frameId) frameId = requestAnimationFrame(animate);
  }

  function requestDraw(): void {
    if (active() && !frameId) frameId = requestAnimationFrame(animate);
  }

  function visibilityChanged(): void {
    if (!active()) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastTime = 0;
    } else requestDraw();
  }

  function motionChanged(): void {
    reducedMotion = media.matches;
    if (reducedMotion) {
      rotating = false;
      callbacks.onInteraction();
    }
    requestDraw();
  }

  function resize(): void {
    if (disposed) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    requestDraw();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false;
    visibilityChanged();
  }, { rootMargin: '80px' });
  intersectionObserver.observe(host);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart: { x: number; y: number; id: number } | null = null;
  let dragged = false;

  function pick(event: PointerEvent): THREE.Mesh | undefined {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(pickMeshes, false)
      .map((intersection) => intersection.object as THREE.Mesh)
      .find((mesh) => mesh.parent?.visible);
  }

  function pointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !event.isPrimary) {
      pointerStart = null;
      return;
    }
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    dragged = false;
  }

  function pointerMove(event: PointerEvent): void {
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 7) dragged = true;
    if (pointerStart || event.pointerType === 'touch') return;
    const marker = pick(event);
    const id = marker?.userData.id as string | undefined;
    if (id !== hoveredId) {
      hoveredId = id;
      callbacks.onHover(marker ? String(marker.userData.name) : null);
      renderer.domElement.style.cursor = marker ? 'pointer' : 'grab';
    }
  }

  function pointerUp(event: PointerEvent): void {
    const wasClick = pointerStart?.id === event.pointerId && !dragged;
    pointerStart = null;
    if (!wasClick) return;
    const marker = pick(event);
    if (marker) callbacks.onSelect(String(marker.userData.id));
  }

  function clearPointer(): void {
    pointerStart = null;
    hoveredId = undefined;
    callbacks.onHover(null);
  }

  function interaction(): void {
    focusDirection = null;
    rotating = false;
    controls.autoRotate = false;
    callbacks.onInteraction();
    requestDraw();
  }

  function zoom(direction: 'in' | 'out'): void {
    interaction();
    const distance = THREE.MathUtils.clamp(camera.position.length() * (direction === 'in' ? 0.84 : 1.19), controls.minDistance, controls.maxDistance);
    camera.position.setLength(distance);
    controls.update();
    requestDraw();
  }

  function keyDown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === '+' || event.key === '=') return zoom('in');
    if (event.key === '-') return zoom('out');
    interaction();
    if (event.key === 'Home') controls.reset();
    else {
      const spherical = new THREE.Spherical().setFromVector3(camera.position);
      if (event.key === 'ArrowLeft') spherical.theta -= 0.15;
      if (event.key === 'ArrowRight') spherical.theta += 0.15;
      if (event.key === 'ArrowUp') spherical.phi -= 0.12;
      if (event.key === 'ArrowDown') spherical.phi += 0.12;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.setFromSpherical(spherical);
    }
    controls.update();
    requestDraw();
  }

  function contextLost(event: Event): void {
    event.preventDefault();
    callbacks.onUnavailable();
  }

  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', clearPointer);
  renderer.domElement.addEventListener('pointerleave', clearPointer);
  renderer.domElement.addEventListener('keydown', keyDown);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  controls.addEventListener('change', requestDraw);
  controls.addEventListener('start', interaction);
  media.addEventListener('change', motionChanged);
  document.addEventListener('visibilitychange', visibilityChanged);
  resize();

  return {
    update(locations, selectedId, mode) {
      const next = JSON.stringify([mode, selectedId, locations.map(({ id, name, lat, lng, target }) => [id, name, lat, lng, target])]);
      if (next === signature) return;
      signature = next;
      releaseObject(markers);
      markers.clear();
      pickMeshes = [];
      pinGroups = [];
      const filtered = locations.filter((location) => mode === 'earth' || location.target === 'Ikkalasi' || location.target === (mode === 'mars' ? 'Mars' : 'Oy'));
      for (const location of filtered) {
        if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) continue;
        const pin = new THREE.Group();
        const color = location.target === 'Oy' ? 0xc3e4f2 : location.target === 'Ikkalasi' ? 0x79d6ba : 0xf5ac81;
        const chosen = location.id === selectedId;
        pin.position.copy(locationPosition(location.lat, location.lng, 1.016));
        pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pin.position.clone().normalize());
        const head = new THREE.Mesh(new THREE.SphereGeometry(chosen ? 0.024 : 0.015, 12, 8), new THREE.MeshBasicMaterial({ color }));
        head.position.z = 0.02;
        head.userData = { id: location.id, name: location.name };
        pin.add(head);
        const ring = new THREE.Mesh(new THREE.RingGeometry(chosen ? 0.037 : 0.025, chosen ? 0.043 : 0.028, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: chosen ? 0.95 : 0.6, side: THREE.DoubleSide }));
        ring.position.z = 0.006;
        pin.add(ring);
        // Invisible but raycastable: a 15 mm sphere is far too small to hit reliably.
        const target = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
        target.position.z = 0.015;
        target.userData = { id: location.id, name: location.name };
        pin.add(target);
        pickMeshes.push(target);
        markers.add(pin);
        pinGroups.push(pin);
      }
      const selectedLocation = filtered.find((location) => location.id === selectedId);
      if (selectedId && selectedId !== selected && selectedLocation) {
        rotating = false;
        controls.autoRotate = false;
        callbacks.onInteraction();
        focusDistance = THREE.MathUtils.clamp(camera.position.length(), controls.minDistance, controls.maxDistance);
        focusDirection = locationPosition(selectedLocation.lat, selectedLocation.lng, 1).normalize();
      }
      selected = selectedId;
      scene.updateMatrixWorld(true);
      requestDraw();
    },
    rotate(enabled) {
      rotating = enabled;
      if (enabled) focusDirection = null;
      requestDraw();
    },
    zoom,
    reset() {
      interaction();
      controls.reset();
      requestDraw();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
      media.removeEventListener('change', motionChanged);
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', clearPointer);
      renderer.domElement.removeEventListener('pointerleave', clearPointer);
      renderer.domElement.removeEventListener('keydown', keyDown);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      controls.removeEventListener('change', requestDraw);
      controls.removeEventListener('start', interaction);
      controls.dispose();
      texture.dispose();
      releaseObject(scene);
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
