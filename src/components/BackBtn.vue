<template>
    <img class='back-btn' src='../assets/img/back.png' @click='goBack' />
</template>

<script>
    export default {
        methods: {
            goBack: function () {
                const url = "../index/main";
                wx.navigateTo({
                    url
                });
            }
        }
    }

</script>

<style>
    .back-btn {
        width: 72rpx;
        height: 72rpx;
        position: absolute;
        left: 53rpx;
        top: 42rpx;
    }

</style>
