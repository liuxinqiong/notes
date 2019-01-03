<template>
    <div class="container">
        <img src="../../assets/img/background.png" class="bg">
        <div class="top">
            <span class="star">
                <span class="text">{{totalStar}}</span>
            </span>
            <a href="/pages/exam-list/main" class="group"></a>
        </div>
        <div class="main-card">
            <div class="content">
                <div class="logo">
                    <img src="./img/subject.png" alt="">
                </div>
                <div class="info">
                    <p class="text">1.通过手机拍照，并且，涂抹答案，录入题库</p>
                    <p class="text">2.点击开始，开始答题，答题后，判断对错。</p>
                    <p class="text">3.根据记忆曲线，给出题库里的类容。</p>
                </div>
                <div class="buttons">
                    <a href="/pages/exam/main?mode=0" class="recite"></a>
                    <a href="/pages/exam/main?mode=1" class="test"></a>
                </div>
            </div>
        </div>
        <button class="add-exam" @click="addExam"></button>
    </div>
</template>
<script>
    import { takePhoto } from "@/utils";
    import {
        getTotalStar
    } from '@/utils/wxDB';
    import { resetPageData } from '@/utils/mixins'
    export default {
        mixins: [resetPageData],
        data(){
            return {
                totalStar:0
            }
        },
        methods: {
            async addExam() {
                try {
                    const tempFilePath = await takePhoto();
                    wx.navigateTo({
                            url: `/pages/cropper/main?src=${tempFilePath}`
                        }
                    )
                } catch (e) {
                    console.log(e)
                }
            },
        },
        async mounted() {
            console.log('index mounted')
        },
        async onShow() {
            this.totalStar = await getTotalStar();
        }
    }

</script>
<style lang="scss" scoped>
    .container {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        .top {
            padding: 32rpx 59rpx 32rpx 52rpx;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            .star {
                width: 166rpx;
                height: 88rpx;
                background: url('./img/star.png') no-repeat;
                background-size: 100% 100%;
                font-size: 26rpx;
                color: #fff;
                text-align: center;
                .text {
                    position: relative;
                    top: 30rpx;
                    left: 30rpx;
                }
            }

            .group {
                width: 217rpx;
                height: 73rpx;
                background: url('./img/group.png') no-repeat;
                background-size: 100% 100%;
            }
        }

        // 边框
        .main-card {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 630rpx;
            transform: translate3d(-50%, -50%, 0);
            background: rgba(136, 200, 125, 1);
            border-top-left-radius: 315rpx 88rpx;
            border-top-right-radius: 315rpx 88rpx;
            border-bottom-left-radius: 44rpx;
            border-bottom-right-radius: 44rpx;
            margin: auto;
            box-sizing: border-box;
            padding: 38rpx 30rpx;
            .content {
                background: rgba(240, 242, 213, 1);
                box-shadow: 0px 4px 0px 0px rgba(255,255,255,0.76);
                border-top-left-radius: 284rpx 80rpx;
                border-top-right-radius: 284rpx 80rpx;
                border-bottom-left-radius: 44rpx;
                border-bottom-right-radius: 44rpx;
                width: 569rpx;
                overflow: hidden;
                .logo {
                    text-align: center;
                    margin-top: 50rpx;
                    img {
                        width: 349rpx;
                        height: 133rpx;
                        vertical-align:middle;
                    }
                }
                .info {
                    margin-top: 12rpx;
                    width: 479rpx;
                    height: 344rpx;
                    margin: auto;
                    background: url('./img/center.png') no-repeat;
                    background-size: 100% 100%;
                    color: #C65D00;
                    font-size: 24rpx;
                    box-sizing: border-box;
                    padding: 80rpx 56rpx 0 65rpx;
                    .text {
                        line-height: 28rpx;
                    }
                    .text + .text {
                        margin-top: 22rpx;
                    }
                }
                .buttons {
                    height: 283rpx;
                    a {
                        display: block;
                        margin: auto;
                        width: 433rpx;
                        height: 150rpx;
                    }
                    .recite {
                        background: url('./img/recite.png') no-repeat;
                        background-size: 100% 100%;
                    }
                    .test {
                        background: url('./img/test.png') no-repeat;
                        background-size: 100% 100%;
                        position: absolute;
                        margin-top: -17rpx;
                        left: 0;
                        right: 0;
                    }
                }
            }
        }

        .add-exam {
            position: absolute;
            bottom: 52rpx;
            right: 90rpx;
            width: 186rpx;
            height: 68rpx;
            background: url('./img/photograph.png') no-repeat;
            background-size: 100% 100%;
            float: right;
        }

    }
</style>
