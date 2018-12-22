<template>
    <div>
        <fixed-view>
            <div class="exam">
                <div class="scroll">
                    <div class="img-wrapper">
                        <img src="https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg"
                            alt="">
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
                    <button class="mode1 error" v-if="mode" @click="leftHandler"></button>
                    <button class="mode0 prev" v-if="!mode" @click="leftHandler"></button>
                    <p class="info">已完成8题目</p>
                    <button class="mode1 right" v-if="mode" @click="rightHander"></button>
                    <button class="mode0 next" v-if="!mode"></button>
                </div>
            </div>
        </fixed-view>
        <layer ref="share">
            <div class="share-layer">
                <div class="share-img">
                    <i class="close" @click="closeShare"></i>
                    <div class="star-container">
                        <star :count="2"></star>
                    </div>
                    <div class="result">完成<span class="num">8</span>题</div>
                    <div class="user">
                        <span class="name">wan啦啦</span>
                    </div>
                    <div class="des">正在使用错题库记忆哦！<br/>快来参加吧</div>
                    <div class="code">
                        <img src="../../assets/img/code.jpg" alt="">
                    </div>
                </div>
                <button class="save-local">保存到本地分享</button>
            </div>
        </layer>
    </div>
</template>
<script>
    import fixedView from '@/components/fixed-view'
    import layer from '@/components/layer'
    import star from '@/components/star/star'
    const MODE = {
        STUDY: 0,
        EXAM: 1
    }
    export default {
        data() {
            return {
                mode: MODE.STUDY
            }
        },
        components: {
            fixedView,
            layer,
            star
        },
        methods: {
            leftHandler(e) {
                this.$refs.share.show()
            },
            rightHander() {
                console.log('right clicked')
            },
            closeShare() {
                this.$refs.share.hide()
            }
        },
        mounted() {
            this.$refs.share.show()
        }
    }

</script>
<style lang="scss" scoped>
    @import '@/styles/mixin.scss';
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

    .share-layer {
        .share-img {
            width: 681rpx;
            height: 998rpx;
            background: url('./img/share-bg.png') no-repeat;
            background-size: 100% 100%;
            margin: auto;
            position: relative;
            overflow: hidden;
            .close {
                position: absolute;
                width: 22rpx;
                height: 22rpx;
                background: url('../../assets/img/close.png') no-repeat;
                background-size: 100% 100%;
                right: 44rpx;
                top: 44rpx;
                @include extend-click;/*it worked, only can't see the element*/
            }
            .star-container {
                margin-top: 147rpx;
            }
            .result {
                margin-top: 32rpx;
                text-align: center;
                font-size: 38rpx;
                color: #75AD82;
                .num {
                    font-size: 74rpx;
                }
            }
            .user {
                margin-top: 57rpx;
                margin-bottom: 49rpx;
                font-size: 24rpx;
                color: #75AD82;
                text-align: center;
            }
            .des {
                text-align: center;
                color: #878787;
                font-size: 24rpx;
            }
            .code {
                margin-top: 51rpx;
                text-align: center;
                img {
                    width: 209rpx;
                    height: 209rpx;
                    border-radius: 14px;
                }
            }
        }
        .save-local {
            width: 515rpx;
            line-height: 99rpx;
            background: url('./img/share-btn.png') no-repeat;
            background-size: 100% 100%;
            font-size: 28rpx;
            color: #fff;
        }
    }
</style>
