<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <img class="img" src="https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg"
                    alt="">
            </div>
            <div class="buttons">
                <button class="btn back"></button>
                <button class="btn repaint"></button>
                <button class="btn save"></button>
            </div>
        </div>
    </fixed-view>
</template>
<script>
    import fixedView from '@/components/fixed-view'
    export default {
        components: {
            fixedView
        }
    }

</script>
<style lang="scss" scoped>
    .add-exam {
        padding: 52rpx 18rpx;

        .img {
            width: 100%;
        }

        .buttons {
            margin-top: 118rpx;
            display: flex;
        }

        .btn {
            width: 84rpx;
            height: 131rpx;
        }

        .back {
            background: url('./img/back.png') no-repeat;
            background-size: cover;
        }

        .repaint {
            background: url('./img/repaint.png') no-repeat;
            background-size: cover;
        }

        .save {
            background: url('./img/save.png') no-repeat;
            background-size: cover;
        }
    }

</style>
