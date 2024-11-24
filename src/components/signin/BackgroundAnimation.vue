<template>
    <div class="background-animation">
        <div v-for="line in visibleLines" :key="line.id" :style="lineStyle(line)"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 애니메이션 파라미터 정의
const StartRange = [30, 48];
const WidthRange = [0.2, 1.2];
const MovingVelocityRange = [0.15, 0.3]; // 속도 감소
const LivingTimeRange = [1000, 3000];
const Probability = 0.5; // 생성 확률 감소
const MaxGrowthThickness = 2.5;
const MaxLines = 50; // 최대 선 개수 제한

const colors = [
    "#FF4500", "#FF6347", "#FF0000", "#FFFF00", "#0A0AFF", "#FF3300", "#FF8000", "#FF1A1A"
];

const lines = ref([]);
let lineId = 0;

const randomInRange = (min, max) => Math.random() * (max - min) + min;

const createLine = () => {
    const isLeft = Math.random() < 0.5;
    const start = isLeft ? randomInRange(...StartRange) / 100 : 1 - randomInRange(...StartRange) / 100;
    return {
        id: lineId++,
        isLeft,
        start,
        initialThickness: randomInRange(...WidthRange),
        velocity: randomInRange(...MovingVelocityRange) * (isLeft ? -1 : 1), // 방향에 따라 속도 부호 변경
        livingTime: randomInRange(...LivingTimeRange),
        color: colors[Math.floor(Math.random() * colors.length)],
        createdAt: performance.now(),
    };
};

const lineStyle = (line) => {
    const elapsedTime = performance.now() - line.createdAt;
    const progress = (line.velocity * elapsedTime) / window.innerWidth;
    const position = line.start + progress;
    const thickness = Math.min(
        line.initialThickness + (MaxGrowthThickness - line.initialThickness) * (elapsedTime / line.livingTime),
        MaxGrowthThickness
    );

    // 선이 화면 밖으로 나가는지 확인
    if (position < 0 || position > 1) {
        return null; // 화면 밖으로 나간 경우 null 반환
    }

    return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: line.isLeft ? `${position * 100}%` : 'auto',
        right: !line.isLeft ? `${(1 - position) * 100}%` : 'auto',
        width: `${thickness}%`,
        backgroundColor: line.color,
    };
};

const visibleLines = computed(() => {
    const now = performance.now();
    return lines.value.filter(line => {
        const elapsedTime = now - line.createdAt;
        const progress = (line.velocity * elapsedTime) / window.innerWidth;
        const position = line.start + progress;
        return elapsedTime < line.livingTime && position >= 0 && position <= 1;
    });
});

const generateLine = () => {
    if (Math.random() < Probability && lines.value.length < MaxLines) {
        lines.value.push(createLine());
    }
};

let animationFrame;

const animate = () => {
    generateLine();
    lines.value = visibleLines.value;
    animationFrame = requestAnimationFrame(animate);
};

onMounted(() => {
    document.body.style.backgroundColor = 'black';
    animationFrame = requestAnimationFrame(animate);
});

onUnmounted(() => {
    document.body.style.backgroundColor = '';
    cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.background-animation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
}
</style>