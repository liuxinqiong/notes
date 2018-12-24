<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <canvas canvas-id="addExam" id="canvas" :style="{ height: canvasHeight + 'px' }" disable-scroll="false"
                    @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"></canvas>
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
    import {
        getImageInfo,
        getNodeRect
    } from '@/utils'
    export default {
        data() {
            return {
                src: '',
                context: null,
                canvasHeight: 150
            }
        },
        components: {
            fixedView
        },
        methods: {
            async init() {
                const data = await Promise.all([getImageInfo(this.src), getNodeRect('#canvas')])
                const [imageInfo, canvasInfo] = data
                const radio = imageInfo.width / imageInfo.height
                this.canvasHeight = canvasInfo.width / radio
                this.context.drawImage(this.src, 0, 0, canvasInfo.width, this.canvasHeight)
                this.context.draw()
            },
            touchstart(e) {
                this.touch = {
                    startX: e.touches[0].x,
                    startY: e.touches[0].y
                }
                if (this.isClear) {
                    this.context.setStrokeStyle('#F8F8F8')
                    this.context.setLineCap('round')
                    this.context.setLineJoin('round')
                    this.context.setLineWidth(20)
                    this.context.save()
                    this.context.beginPath()
                    this.context.arc(this.touch.startX, this.touch.startY, 5, 0, 2 * Math.PI, true)
                    this.context.fill();
                    this.context.restore();
                } else {
                    this.context.setStrokeStyle('#fff')
                    this.context.setLineWidth(20)
                    this.context.setLineCap('round') // 让线条圆润
                    this.context.beginPath()
                }
            },
            touchmove(e) {
                var startX1 = e.touches[0].x
                var startY1 = e.touches[0].y
                if (this.isClear) { //判断是否启用的橡皮擦功能 ture表示清除 false表示画画
                    this.context.save(); //保存当前坐标轴的缩放、旋转、平移信息
                    this.context.moveTo(this.touch.startX, this.touch.startY); //把路径移动到画布中的指定点，但不创建线条
                    this.context.lineTo(startX1, startY1); //添加一个新点，然后在画布中创建从该点到最后指定点的线条
                    this.context.stroke(); //对当前路径进行描边
                    this.context.restore() //恢复之前保存过的坐标轴的缩放、旋转、平移信息
                    this.touch = {
                        startX: startX1,
                        startY: startY1
                    }
                } else {
                    this.context.moveTo(this.touch.startX, this.touch.startY)
                    this.context.lineTo(startX1, startY1)
                    this.context.stroke()
                    this.touch = {
                        startX: startX1,
                        startY: startY1
                    }
                }
                this.context.draw(true)
            },
            touchend(e) {

            }
        },
        mounted() {
            this.src = this.$root.$mp.query.src
            this.context = wx.createCanvasContext('addExam')
            this.init()
        },
        created() {
            this.touch = {}
        }
    }
</script>
<style lang="scss" scoped>
    .add-exam {
        padding: 52rpx 18rpx;

        .img-wrapper {
            canvas {
                width: 100%;
            }
        }

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
