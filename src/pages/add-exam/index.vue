<template>
    <div class="add-exam">
        增加题目页面
        <button class="btn back"></button>
        <button class="btn repaint"></button>
        <button class="btn save"></button>
    </div>
</template>
<script>
    export default {

    }

</script>
<style lang="scss" scoped>
.add-exam {
    .btn {
        width: 84rpx;
        height: 131rpx;
    }
    .back {
        background: url('./img/back.png') no-repeat;
        background-size: cover;
    }
    .repaint {
        background: url('../../../static/img/repaint.png') no-repeat;
        background-size: cover;
    }
    .save {
        background: url('./img/save.png') no-repeat;
        background-size: cover;
    }
}
</style>

