<template>
    <transition name="toast">
      <div v-if="isVisible" class="toast" :class="type">
        {{ message }}
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
    }
  });
  
  const isVisible = ref(false);
  let timer = null;
  
  const show = () => {
    isVisible.value = true;
    timer = setTimeout(() => {
      isVisible.value = false;
    }, props.duration);
  };
  
  onMounted(() => {
    show();
  });
  
  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });
  </script>
  
  <style scoped>
  .toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .info {
    background-color: #2196F3;
  }
  
  .success {
    background-color: #4CAF50;
  }
  
  .warning {
    background-color: #FFC107;
  }
  
  .error {
    background-color: #F44336;
  }
  
  .toast-enter-active, .toast-leave-active {
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .toast-enter-from, .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  </style>