import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";

function makeDotTexture() {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

function buildField(count, spread, palette, depth) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.35;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color[0];
    colors[i * 3 + 1] = color[1];
    colors[i * 3 + 2] = color[2];
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  return geometry;
}

export function initAmbient3D(canvas) {
  if (!canvas) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || window.innerWidth < 700) {
    canvas.classList.add("is-unavailable");
    return null;
  }

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
  } catch {
    canvas.classList.add("is-unavailable");
    return null;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const pointer = { value: new Vector2(0, 0) };
  const pointerTarget = new Vector2(0, 0);

  const texture = makeDotTexture();

  const gold = [197 / 255, 179 / 255, 150 / 255];
  const slate = [124 / 255, 130 / 255, 138 / 255];

  const group = new Group();
  scene.add(group);

  const dustGeometry = buildField(150, 10, [gold, gold, gold, slate], 6);
  const dust = new Points(
    dustGeometry,
    new PointsMaterial({
      size: 0.14,
      sizeAttenuation: true,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
  group.add(dust);

  const bokehGeometry = buildField(12, 12, [gold, slate], 6);
  const bokeh = new Points(
    bokehGeometry,
    new PointsMaterial({
      size: 2.2,
      sizeAttenuation: true,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  group.add(bokeh);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const onPointerMove = (event) => {
    pointerTarget.set(
      (event.clientX / window.innerWidth - 0.5) * 2,
      (event.clientY / window.innerHeight - 0.5) * 2,
    );
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const clock = { start: performance.now() };
  let frame = 0;

  const render = () => {
    if (document.hidden) {
      frame = requestAnimationFrame(render);
      return;
    }

    const t = (performance.now() - clock.start) / 1000;
    pointer.value.lerp(pointerTarget, 0.03);

    group.rotation.y = Math.sin(t * 0.05) * 0.12 + pointer.value.x * 0.12;
    group.rotation.x = Math.sin(t * 0.04) * 0.06 - pointer.value.y * 0.08;
    group.position.y = Math.sin(t * 0.12) * 0.5;
    bokeh.rotation.y = -t * 0.012;

    camera.position.x = pointer.value.x * 0.9;
    camera.position.y = -pointer.value.y * 0.7;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };

  render();

  window.addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dustGeometry.dispose();
      bokehGeometry.dispose();
      dust.material.dispose();
      bokeh.material.dispose();
      texture.dispose();
      renderer.dispose();
    },
    { once: true },
  );

  return { resize };
}
