<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <canvas canvas-id="addExam" id="canvas" :style="{ height: canvasHeight + 'px' }" disable-scroll="false"
                    @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"></canvas>
            </div>
            <div class="buttons">
                <button class="btn back" @click="back"></button>
                <button class="btn repaint" @click="repaint"></button>
                <button class="btn save" @click="save"></button>
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
    const canvasId = 'addExam'
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
            back() {
                const length = this.imgStack.length
                if(length === 1) {
                    return
                }
                this.imgStack.pop() // 当初当前显示的
                const data = this.imgStack[length - 2];
                this._useShot(data)
            },
            repaint() {
                this.imgStack.length = 1
                const data = this.imgStack[0]
                this._useShot(data)
            },
            save() {

            },
            async init() {
                const data = await Promise.all([getImageInfo(this.src), getNodeRect('#canvas')])
                const [imageInfo, canvasInfo] = data
                const radio = imageInfo.width / imageInfo.height
                this.canvasHeight = canvasInfo.width / radio
                this.imgInfo = {
                    width: canvasInfo.width,
                    height: this.canvasHeight
                }
                this.context.drawImage(this.src, 0, 0, canvasInfo.width, this.canvasHeight)
                this.context.draw(false, this._addShot)
            },
            touchstart(e) {
                this.touch = {
                    startX: e.touches[0].x,
                    startY: e.touches[0].y
                }
                this.context.setStrokeStyle('#fff')
                this.context.setLineWidth(20)
                this.context.setLineCap('round') // 让线条圆润
                this.context.beginPath()
            },
            touchmove(e) {
                var startX1 = e.touches[0].x
                var startY1 = e.touches[0].y
                this.context.moveTo(this.touch.startX, this.touch.startY)
                this.context.lineTo(startX1, startY1)
                this.context.stroke()
                this.touch = {
                    startX: startX1,
                    startY: startY1
                }
                this.context.draw(true)
            },
            touchend(e) {
                // 保存快照
                this._addShot()
            },
            _addShot() {
                wx.canvasGetImageData({
                    canvasId: canvasId,
                    x: 0,
                    y: 0,
                    width: this.imgInfo.width,
                    height: this.canvasHeight,
                    success: (res) => {
                        this.imgStack.push(res.data)
                    }
                })
            },
            _useShot(data) {
                wx.canvasPutImageData({
                    canvasId: canvasId,
                    x: 0,
                    y: 0,
                    width: this.imgInfo.width,
                    height: this.imgInfo.height,
                    data,
                    success: (res) => {
                        console.log(res)
                    }
                })
            }
        },
        mounted() {
            this.src = this.$root.$mp.query.src
            this.context = wx.createCanvasContext(canvasId)
            this.init()
        },
        created() {
            this.touch = {}
            this.imgStack = []
            this.imgInfo = {}
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
