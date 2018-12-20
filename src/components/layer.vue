<template>
    <div class="layer" v-if="isShow" @click="isShow = false">
        <div class="content" @click.stop>
            <slot></slot>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                isShow: false
            }
        },
        methods: {
            show(e) {
                this.isShow = true
            },
            hide() {
                this.isShow = false
            }
        }
    }

</script>
<style lang="scss" scoped>
    .layer {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, .7);

        .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate3d(-50%, -50%, 0);
        }
    }

</style>
