<template>
    <div class="range-slider-container">
        <div class="range-slider">
            <div class="range-slider-track"></div>
            <div class="range-slider-fill"
                :style="{ left: `${modelValue[0] * 10}%`, width: `${(modelValue[1] - modelValue[0]) * 10}%` }"></div>
            <div class="range-slider-thumb start" :style="{ left: `${modelValue[0] * 10}%` }"
                @mousedown="startDrag('start')" @touchstart="startDrag('start')"></div>
            <div class="range-slider-thumb end" :style="{ left: `${modelValue[1] * 10}%` }"
                @mousedown="startDrag('end')" @touchstart="startDrag('end')"></div>
        </div>
        <div class="range-marks">
            <span v-for="i in 11" :key="i" class="range-mark">{{ i - 1 }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

let isDragging = ref(false);
let currentThumb = ref(null);

const startDrag = (thumb) => {
    isDragging.value = true;
    currentThumb.value = thumb;
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
};

const drag = (e) => {
    if (!isDragging.value) return;

    const rangeSlider = e.target.closest('.range-slider');
    const rect = rangeSlider.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    let percentage = Math.min(Math.max(x / rect.width, 0), 1);

    const newValue = [...props.modelValue];
    if (currentThumb.value === 'start') {
        newValue[0] = Math.min(Math.round(percentage * 10), newValue[1]);
    } else {
        newValue[1] = Math.max(Math.round(percentage * 10), newValue[0]);
    }

    emit('update:modelValue', newValue);
};

const stopDrag = () => {
    isDragging.value = false;
    currentThumb.value = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
};
</script>

<style scoped>
.range-slider-container {
    width: 60%;
    min-width: 200px;
    max-width: 100%;
    margin: 10px auto;
    text-align: left;
}

.range-slider {
    position: relative;
    width: 100%;
    height: 20px;
    padding: 5px 0;
}

.range-slider-track {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    width: 100%;
    background: #ddd;
}

.range-slider-fill {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    background: #ff0000;
}

.range-slider-thumb {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background: #ff0000;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 2;
}

.range-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
}

.range-mark {
    color: #888;
    font-size: 10px;
}
</style>