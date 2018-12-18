<template>
    <div class='exam-item' @click='doCheck' :style="{width:exam.width+'rpx',height:(exam.height+80)+'rpx'}">
        <img class='item-backgroud' src='./img/examBackground.png' />
        <div class='exam-img-wrapper' :style="{height:exam.height+'rpx'}"><img class='exam-img' :src="exam.imgSrc" /></div>
        <span class='exam-time'>
            {{exam.examTime}}
        </span>
        <div class='exam-check' v-if='isEidt'>
            <img class='exam-checked' src='./img/checked.png' v-if='checked' />
            <span class='exam-uncheck' v-else></span>
        </div>

    </div>
</template>
<script>
    export default {
        data() {
            return {
                checked: false
            }
        },
        props: ['exam', 'isEidt'],
        methods: {
            doCheck() {
                this.checked = this.checked ? false && this.isEidt : true && this.isEidt;
                this.$emit('click', this.checked);
            }
        },
        watch: {
            isEidt(newValue, oldValue) {
                this.checked = false;
            }
        }
    }

</script>
<style lang="scss" scoped>
    .exam-item {
        position: relative;
        width: 278rpx;
        height: 300rpx;
        -moz-page-break-inside: avoid;
        -webkit-column-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 30rpx;

        .item-backgroud {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .exam-img-wrapper {
            width: 247rpx;
            position: absolute;
            left: 17rpx;
            top: 17rpx;
        }

        .exam-img {
            width: 100%;
            height: 100%;

        }

        .exam-time {
            width: 186rpx;
            height: 20rpx;
            font-size: 26rpx;
            font-family: MicrosoftYaHei;
            font-weight: 500;
            color: rgba(187, 187, 187, 1);
            line-height: 25rpx;
            left: 18rpx;
            bottom: 37rpx;
            position: absolute;
        }

        .exam-check {
            width: 34rpx;
            height: 34rpx;
            bottom: 25rpx;
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
                position: absolute;

            }
        }
    }

</style>
