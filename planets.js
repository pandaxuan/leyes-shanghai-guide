// --- 背景渲染逻辑 (Three.js) ---
let scene, camera, renderer, particles, mouse = new THREE.Vector2(), targetMouse = new THREE.Vector2();
const PARTICLE_COUNT = window.innerWidth < 640 ? 5000 : 12000;

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(200, 230, 255, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i*3] = (Math.random() - 0.5) * 30;
        pos[i*3+1] = (Math.random() - 0.5) * 20;
        pos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.12, map: createGlowTexture(), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);

    const handleMove = (x, y) => { targetMouse.x = (x / window.innerWidth) * 2 - 1; targetMouse.y = -(y / window.innerHeight) * 2 + 1; };
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
}

function animate() {
    requestAnimationFrame(animate);
    mouse.lerp(targetMouse, 0.05);
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = positions[i3] - (mouse.x * 12);
        const dy = positions[i3+1] - (mouse.y * 8);
        const distSq = dx*dx + dy*dy;
        if (distSq < 4) {
            const dist = Math.sqrt(distSq);
            const force = (2 - dist) / 2;
            positions[i3] += dx * force * 0.02;
            positions[i3+1] += dy * force * 0.02;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.0003;
    renderer.render(scene, camera);
}

// 暴露银色熔岩背景函数
window.applyLavaEffect = function() {
    const modal = document.getElementById('fortune-modal');
    if (!modal) return;
    let container = document.createElement('div');
    container.style.cssText = "position:absolute;inset:0;z-index:-1;background:radial-gradient(circle,rgba(200,200,200,0.1) 0%,transparent 70%);";
    modal.appendChild(container);
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

initThree();
animate();
