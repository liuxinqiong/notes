<template>
    <div class="exam-item" @click="doCheck" :style="{width:itemWidth+'rpx'}">
        <img class="exam-img" mode="widthFix" :src="exam.imgSrc" @error="doError">
        <span class="exam-time">{{exam.examTime}}</span>
        <div class="exam-check" v-if="isEidt">
            <img class="exam-checked" src="./img/checked.png" v-if="checked">
            <span class="exam-uncheck" v-else></span>
        </div>
    </div>
</template>
<script>
    require('../../assets/img/code.jpg');
    export default {
        data() {
            return {
                checked: false
            };
        },
        props: ["exam", "isEidt", 'itemWidth'],
        methods: {
            doCheck() {
                this.checked = this.checked ? false : this.isEidt;
                this.$emit("click", this.checked);
            },
            doError() {
                this.exam.imgSrc = '../../assets/img/code.jpg';
            }
        },
        watch: {
            isEidt(newValue, oldValue) {
                this.checked = false;
            }
        }
    };

</script>
<style lang="scss" scoped>
    .exam-item {
        position: relative;
        break-inside: avoid;
        margin-bottom: 30rpx;
        background: url("./img/examBackground.png") repeat;
        background-size: 100% 100%;
        box-sizing: border-box;
        padding: 20rpx 22rpx 25rpx 25rpx;

        .exam-img {
            width: 100%;
            margin-bottom: 6rpx;
            vertical-align: top;
        }

        .exam-time {
            height: 20rpx;
            font-size: 24rpx;
            font-family: MicrosoftYaHei;
            font-weight: 500;
            color: rgba(187, 187, 187, 1);
            line-height: 20rpx;
        }

        .exam-check {
            width: 34rpx;
            height: 34rpx;
            bottom: 29rpx;
            right: 32rpx;
            position: absolute;

            .exam-checked {
                width: 34rpx;
                height: 34rpx;
            }

            span {
                width: 28rpx;
                height: 28rpx;
                background: rgba(74, 138, 63, 1);
                border: 3rpx solid rgba(146, 221, 133, 1);
                border-radius: 9rpx;
                display: inline-block;
            }
        }
    }

</style>
