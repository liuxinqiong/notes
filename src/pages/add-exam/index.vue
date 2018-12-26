<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <canvas canvas-id="addExam" id="canvas" :style="{ height: canvasHeight + 'px', backgroundImage: 'url(' + src + ')', backgroundSize: '100%, 100%'}" disable-scroll="true"
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
        getNodeRect,
        test
    } from '@/utils'
    const canvasId = 'addExam'
    export default {
        data() {
            return {
                src: '',
                context: null,
                canvasHeight: 150,
                tempPath: ''
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
            test() {
                // android 只适用于 fill 填充块合成，用于stroke的线段合成效果都是默认 source-over
                this.context.globalCompositeOperation = 'destination-out'
            },
            async save() {
                // 生成图片
                // wx.canvasToTempFilePath({
                //     x: 0,
                //     y: 0,
                //     width: this.imgInfo.width,
                //     height: this.imgInfo.height,
                //     quality: 1,
                //     canvasId: canvasId,
                //     success: res => {
                //         this.tempPath = res.tempFilePath
                //     }
                // });
                debugger
                var aaa = await test()
                console.log(aaa)
                console.log(123)
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
                this.context.setFillStyle('#fff')
                this.context.beginPath()
                this._draw(e)
            },
            touchmove(e) {
                this._draw(e)
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
            },
            _draw(e) {
                // 先存储在touch属性中，日后看能否进一步优化
                this.touch = {
                    startX: e.touches[0].x,
                    startY: e.touches[0].y
                }
                this.context.arc(this.touch.startX, this.touch.startY, 10, 0, Math.PI * 2)
                this.context.fill()
                this.context.draw(true)
            }
        },
        mounted() {
            this.src = this.$root.$mp.query.src
            this.context = wx.createCanvasContext(canvasId)
            this.init()
        },
        created() {
            this.touch = {} // 触碰点位置
            this.imgStack = [] // 历史栈
            this.imgInfo = {} // 图片信息
        }
    }
</script>
<style lang="scss" scoped>
    .add-exam {
        padding: 52rpx 18rpx;
        overflow: hidden;
        height: 100%;
        box-sizing: border-box;
        .img-wrapper {
            position: relative;
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
