<template>
    <fixed-view>
        <div class="add-exam">
            <div class="img-wrapper">
                <canvas canvas-id="addExam" id="canvas" :style="{height: canvasHeight + 'px'}" disable-scroll="true"
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
    import { uploadExamImg } from '@/utils/wxFile'
    import { insertExamData } from '@/utils/wxDB'
    import {
        getImageInfo,
        getNodeRect,
        showLoading,
        hideLoading,
        showSuccess,
        showFail
    } from '@/utils'
    const canvasId = 'addExam'
    export default {
        data() {
            return {
                canvasHeight: 150
            }
        },
        components: {
            fixedView
        },
        methods: {
            back() {
                this.backEnable = false
                this.executeActions.pop()
                // 执行状态为空，则认定为未涂抹
                if(this.executeActions.length === 0) {
                    this.is_paint = false
                }
                this._drawImage(false)
                this.executeActions.forEach(steps => {
                    steps.forEach(action => {
                        this.context.arc(...action)
                    })
                });
                this.context.setFillStyle('#fff')
                this.context.fill()
                this.context.draw(false, () => {
                    this.backEnable = true
                })
            },
            repaint() {
                // 重画认定为未涂抹
                this.is_paint = false
                this._drawImage(true)
            },
            async save() {
                showLoading('正在保存')
                if(this.is_paint) {
                    // 生成图片
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: this.imgInfo.width,
                        height: this.imgInfo.height,
                        quality: 1,
                        canvasId: canvasId,
                        success: async res => {
                            try {
                                var [original_img_id, edited_img_id] = await Promise.all([uploadExamImg(this.src), uploadExamImg(res.tempFilePath)])
                                this.addExam(original_img_id, edited_img_id)
                            } catch(e) {
                                hideLoading()
                                showFail('保存失败')
                            }
                        },
                        fail: (e) => {
                            console.log(e)
                        }
                    });
                } else {
                    const imgId = await uploadExamImg(this.src)
                    this.addExam(imgId, imgId)
                }
            },
            async addExam(original_img_id, edited_img_id) {
                try {
                    var res_id = await insertExamData({
                        original_img_id,
                        edited_img_id,
                        is_paint: this.is_paint,
                        img_width: this.imgInfo.width,
                        img_height: this.imgInfo.height
                    })
                    showSuccess('保存成功')
                    setTimeout(() => {
                        wx.reLaunch({
                            url: `/pages/index/main`
                        });
                    }, 1500)
                } catch(e) {
                    hideLoading()
                    showFail('保存失败')
                }
            },
            async init() {
                try {
                    const data = await Promise.all([getImageInfo(this.src), getNodeRect('#canvas')])
                    const [imageInfo, canvasInfo] = data
                    const radio = imageInfo.width / imageInfo.height
                    this.canvasHeight = canvasInfo.width / radio
                    this.imgInfo = {
                        width: canvasInfo.width,
                        height: this.canvasHeight
                    }
                    this._drawImage(true)
                } catch(e) {
                    console.log(e)
                }
            },
            touchstart(e) {
                this.context.setFillStyle('#fff')
                this.context.beginPath()
                this.stepActions = []
                this._draw(e)
            },
            touchmove(e) {
                this._draw(e)
            },
            touchend(e) {
                this.is_paint = true
                // 保存本次执行的所有动作
                this.executeActions.push(this.stepActions)
            },
            _drawImage(immediate) {
                this.context.drawImage(this.src, 0, 0, this.imgInfo.width, this.imgInfo.height)
                immediate && this.context.draw(false)
            },
            _draw(e) {
                // 先存储在touch属性中，日后看能否进一步优化
                this.touch = {
                    startX: e.touches[0].x,
                    startY: e.touches[0].y
                }
                this.stepActions.push([this.touch.startX, this.touch.startY, 10, 0, Math.PI * 2])
                this.context.arc(this.touch.startX, this.touch.startY, 10, 0, Math.PI * 2)
                this.context.fill()
                this.context.draw(true)
            }
        },
        onShow() {
            this.src = this.$root.$mp.query.src
            this.context = wx.createCanvasContext(canvasId)
            this.touch = {} // 触碰点位置
            this.imgInfo = {} // 图片信息
            this.is_paint = false // 是否涂抹
            this.executeActions = [] // 总操作状态
            this.stepActions = [] // 每步操作状态
            this.backEnable = true
            this.init()
        },
        mounted() {
            console.log('mounted')
        },
        created() {
            console.log('created')
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
