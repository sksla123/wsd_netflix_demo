<template>
    <div class="loading-bar" :style="{ width: progress + '%' }"></div>
</template>

<script>
export default {
    data() {
        return {
            progress: 0
        }
    },
    methods: {
        start() {
            this.progress = 0
            this.timer = setInterval(() => {
                this.progress += 10
                if (this.progress >= 90) {
                    clearInterval(this.timer)
                }
            }, 100)
        },
        finish() {
            clearInterval(this.timer)
            this.progress = 100
            setTimeout(() => {
                this.progress = 0
            }, 300)
        }
    }
}
</script>

<style scoped>
.loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background-color: #e50914;
    transition: width 0.3s ease;
}
</style>