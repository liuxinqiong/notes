<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <img class="img" :src="src" alt="">
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
    import fixedView from '@/components/fixed-view/fixed-view'
    export default {
        data() {
            return {
                src: ''
            }
        },
        components: {
            fixedView
        },
        mounted () {
            this.src = this.$root.$mp.query.src
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
