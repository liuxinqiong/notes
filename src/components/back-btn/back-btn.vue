<template>
    <img class='back-btn' src='../../assets/img/back.png' @click='goBack' />
</template>

<script>
    export default {
        methods: {
            goBack: function () {
                const url = "../index/main";
                wx.navigateBack({
                    delta: 1
                })
            }
        }
    }

</script>

<style scoped>
    .back-btn {
        width: 83rpx;
        height: 83rpx;
        position: absolute;
        left: 48rpx;
        top: 36rpx;
    }

</style>
