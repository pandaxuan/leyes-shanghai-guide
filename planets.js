// planets.js
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

let scene, camera, renderer, stars, card;
let handDetector;
let videoElement;
let isPinching = false;

// --- 1. 初始化 3D 场景 ---
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 创建粒子星河
    const starGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 10000; i++) {
        starCoords.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.05 });
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    camera.position.z = 5;
}

// --- 2. 手势检测核心 (MediaPipe) ---
async function setupHands() {
    videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);

    // 获取摄像头
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await videoElement.play();

    // 加载 MediaPipe (使用 CDN 加载模式)
    const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults(onResults);

    // 持续传帧给检测器
    const cameraHelper = new window.Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });
    cameraHelper.start();
}

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 关键点：4是拇指尖，8是食指尖
        const thumb = landmarks[4];
        const index = landmarks[8];

        // 计算两指距离 (欧几里得距离)
        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) + 
            Math.pow(thumb.y - index.y, 2)
        );

        // 🤏 如果距离小于 0.05，判定为“捏合”
        if (distance < 0.05 && !isPinching) {
            isPinching = true;
            triggerPinchEffect();
        } else if (distance > 0.1) {
            isPinching = false;
        }
    }
}

// --- 3. 捏合后的交互：抽卡并请求 AI ---
async function triggerPinchEffect() {
    console.log("抽卡成功！");
    // 显示 UI 加载动画
    const status = document.getElementById('pinch-status');
    status.innerText = "正在从星河中抽取您的美食灵感...";
    status.classList.add('animate-pulse');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: "请为我生成一个神秘的美食占卜签，关于上海的，字数在40字内", 
                language: 'zh' 
            }),
        });
        
        // 处理非流式返回（或者按你 index 的逻辑处理流）
        // 这里假设简单处理返回的 JSON
        const data = await response.json();
        showFortuneCard(data.text);
    } catch (err) {
        status.innerText = "星象不稳定，请再试一次";
    }
}

function showFortuneCard(text) {
    const cardModal = document.getElementById('fortune-card-modal');
    document.getElementById('fortune-text').innerText = text;
    cardModal.classList.remove('hidden');
}

// --- 循环渲染 ---
function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.001; // 星河旋转
    renderer.render(scene, camera);
}

// 启动
initThree();
setupHands().catch(console.error);
animate();
