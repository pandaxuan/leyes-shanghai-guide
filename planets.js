import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, stars;
let mouse = new THREE.Vector2(0, 0);
let targetMouse = new THREE.Vector2(0, 0);
let isPinching = false;
let videoElement;

// --- 1. 初始化 3D 场景 ---
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建更粗、有质感的星河粒子
    const count = 12000;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalPos = new Float32Array(count * 3); // 记录原始位置用于胶质恢复
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 20;
        positions.set([x, y, z], i * 3);
        originalPos.set([x, y, z], i * 3);
        
        // 银白色到浅蓝色的微光
        const mixedColor = new THREE.Color().setHSL(0.6, 0.2, 0.8 + Math.random() * 0.2);
        colors.set([mixedColor.r, mixedColor.g, mixedColor.b], i * 3);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 使用纹理让粒子圆润且带有光晕
    const starMat = new THREE.PointsMaterial({
        size: 0.18, // 增加粗细
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        map: createCircleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    camera.position.z = 10;

    // 监听鼠标/触摸移动
    window.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
}

// 创建圆形发光粒子纹理
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(200,230,255,0.8)');
    grad.addColorStop(0.5, 'rgba(100,150,255,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

// --- 2. 核心：胶质感与动态星河 ---
function updateStarAnimation() {
    // 鼠标平滑过渡
    mouse.lerp(targetMouse, 0.05);

    const positions = stars.geometry.attributes.position.array;
    const count = positions.length / 3;
    const time = Date.now() * 0.0005;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // 基础漂浮动画
        positions[i3] += Math.sin(time + i) * 0.002;
        positions[i3+1] += Math.cos(time + i) * 0.002;

        // 胶质感计算
        // 将鼠标坐标转换到场景坐标的大致范围
        const mx = mouse.x * 15;
        const my = mouse.y * 10;
        
        const dx = positions[i3] - mx;
        const dy = positions[i3+1] - my;
        const distSq = dx*dx + dy*dy;

        if (distSq < 4) {
            const dist = Math.sqrt(distSq);
            const force = (2 - dist) / 2;
            // 粒子向鼠标方向产生微弱的粘滞拉伸效果
            positions[i3] += dx * force * 0.03; 
            positions[i3+1] += dy * force * 0.03;
        }
    }
    stars.geometry.attributes.position.needsUpdate = true;
    stars.rotation.y += 0.0005;
}

// --- 3. 银色熔岩与钻石微光背景 ---
// 当调用 askTheUniverse 时，触发这个背景美化
export function applyLavaEffect() {
    const modal = document.getElementById('fortune-modal');
    if (!modal) return;

    // 清除旧的熔岩效果
    const oldLava = modal.querySelector('.lava-container');
    if (oldLava) oldLava.remove();

    const container = document.createElement('div');
    container.className = 'lava-container';
    container.style.cssText = `
        position: absolute; inset: 0; z-index: -1; 
        background: #0a0a0a; overflow: hidden;
    `;

    // 生成“液态银”胶体块
    for (let i = 0; i < 6; i++) {
        const blob = document.createElement('div');
        blob.style.cssText = `
            position: absolute;
            width: ${Math.random() * 60 + 40}vw;
            height: ${Math.random() * 60 + 40}vw;
            background: radial-gradient(circle, rgba(192,192,192,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            filter: blur(80px);
            animation: lavaMove ${20 + i * 5}s infinite alternate ease-in-out;
        `;
        container.appendChild(blob);
    }

    // 生成钻石微光点
    for (let i = 0; i < 40; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 2px; height: 2px; background: white;
            left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
            box-shadow: 0 0 10px 1px white;
            opacity: ${Math.random()};
            animation: sparkle ${2 + Math.random() * 3}s infinite alternate;
        `;
        container.appendChild(sparkle);
    }

    modal.insertBefore(container, modal.firstChild);
}

// --- 4. 循环渲染 ---
function animate() {
    requestAnimationFrame(animate);
    updateStarAnimation();
    renderer.render(scene, camera);
}

// 启动执行
initThree();
animate();

// 自动适配窗口
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
