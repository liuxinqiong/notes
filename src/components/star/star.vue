<template>
    <div class="star" :class="className">
        <img :src="imageSrc.FULL" alt="" v-for="i in count" :key="i">
        <img :src="imageSrc.EMPTY" alt="" v-for="i in left" :key="i">
    </div>
</template>
<script>
    const MODE = {
        one: {
            FULL: require('./img/full1.png'),
            EMPTY: require('./img/empty1.png')
        },
        two: {
            FULL: require('./img/full2.png'),
            EMPTY: require('./img/empty2.png')
        }
    }
    export default {
        props: {
            count: {
                type: Number,
                default: 0
            },
            mode: {
                type: String,
                default: 'one'
            }
        },
        computed: {
            className() {
                return `star-${this.mode}`
            },
            imageSrc() {
                return MODE[this.mode] || MODE.one
            },
            left() {
                return 3 - this.count
            }
        },
        methods: {

        }
    }

</script>
<style lang="scss" scoped>
    .star {
        display: flex;
        width: 100%;
        justify-content: center;

        &.star-one {
            img {
                width: 137rpx;
                height: 133rpx;

                &:nth-child(2) {
                    width: 112rpx;
                    height: 108rpx;
                    position: relative;
                    top: -40rpx;
                }
            }

            img+img {
                margin-left: 24rpx;
            }
        }

        &.star-two {
            img {
                width: 113rpx;
                height: 108rpx;

                &:nth-child(2) {
                    width: 132rpx;
                    height: 127rpx;
                    position: relative;
                    top: -46rpx;
                }
            }

            img+img {
                margin-left: 16rpx;
            }
        }
    }

</style>
