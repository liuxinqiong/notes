<template>
    <fixed-view>
        <div class="exam">
            <div class="scroll">
                <div class="img-wrapper">
                    <img src="https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg" alt="">
                    <p class="time">2018.9.16 13:25</p>
                </div>
                <div class="buttons">
                    <button class="scrawl"></button>
                    <button class="eraser"></button>
                    <button class="clear"></button>
                    <button class="save"></button>
                </div>
            </div>
            <div class="bottom">
                <button class="mode0 prev" v-if="mode === 0"></button>
                <button class="mode1 error" v-else></button>
                <p class="info">已完成8题目</p>
                <button class="mode0 next" v-if="mode === 0"></button>
                <button class="mode1 right" v-else></button>
            </div>
        </div>
    </fixed-view>
</template>
<script>
    import fixedView from '@/components/fixed-view'
    const MODE = {
        STUDY: 0,
        EXAM: 1
    }
    export default {
        data() {
            return {
                mode: MODE.EXAM
            }
        },

        components: {
            fixedView
        }
    }

</script>
<style lang="scss" scoped>
    .exam {
        height: 100%;
        position: relative;
        .scroll {
            overflow: auto;
            position: absolute;
            top: 52rpx;
            bottom: 200rpx;
            left: 18rpx;
            right: 18rpx;
        }
        .img-wrapper {
            img {
                width: 100%;
                height: 1000rpx;
            }
            .time {
                color: #FFF;
                font-size: 20rpx;
            }
        }

        .buttons {
            margin-top: 88rpx;
            display: flex;
            .scrawl {
                width: 91rpx;
                height: 125rpx;
                background: url('./img/scrawl.png') no-repeat;
                background-size: cover;
            }
            .eraser {
                width: 97rpx;
                height: 129rpx;
                background: url('./img/eraser.png') no-repeat;
                background-size: cover;
            }
            .clear {
                width: 97rpx;
                height: 129rpx;
                background: url('./img/clear.png') no-repeat;
                background-size: cover;
            }
            .save {
                width: 87rpx;
                height: 129rpx;
                background: url('./img/save.png') no-repeat;
                background-size: cover;
            }
        }

        .bottom {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 36rpx;
            display: flex;
            align-items: flex-end;
            .info {
                color: #FEF5E2;
                font-size: 30rpx;
            }
            .mode0 {
                width: 115rpx;
                height: 125rpx;
                &.prev {
                    background: url('./img/prev.png') no-repeat;
                    background-size: cover;
                }
                &.next {
                    background: url('./img/next.png') no-repeat;
                    background-size: cover;
                }
            }
            .mode1 {
                width: 97rpx;
                height: 131rpx;
                &.error {
                    background: url('./img/error.png') no-repeat;
                    background-size: cover;
                }
                &.right {
                    background: url('./img/right.png') no-repeat;
                    background-size: cover;
                }
            }
        }
    }
</style>
