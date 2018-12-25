<template>
    <div class="fixed-view">
        <img class="bg" src="../../assets/img/background.png" alt="">
        <div class="top">
            <button class="back" @click="backHome"></button>
        </div>
        <div class="container">
            <slot></slot>
        </div>
    </div>
</template>
<script>
    export default {
        methods: {
            backHome(e) {
                wx.navigateBack({
                    delta: 1
                })
            }
        }
    }

</script>
<style lang="scss" scoped>
    .fixed-view {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        button {
            display: inline-block;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .top {
            padding: 42rpx 53rpx 36rpx;

            .back {
                width: 72rpx;
                height: 72rpx;
                background: url('../../assets/img/back.png') no-repeat;
                background-size: cover;
            }
        }

        .container {
            position: absolute;
            left: 0;
            right: 0;
            margin: auto;
            width: 683rpx;
            top: 150rpx;
            bottom: 70rpx;
            background-color: #88C87D;
            border: 4rpx solid #FFFDED;
            border-radius: 34rpx;
            box-sizing: border-box;
            overflow: auto;
        }
    }

</style>
