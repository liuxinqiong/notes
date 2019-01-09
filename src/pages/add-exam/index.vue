<template>
    <fixed-view>
        <div class="add-exam">
            <div class="tip" v-if="isClear">当前处于橡皮擦模式</div>
            <div class="img-wrapper" id="addExam">
                <img :src="src" :style="{height: canvasHeight, width: canvasWidth}" alt="">
                <canvas canvas-id="addExam" :style="{height: canvasHeight, width: canvasWidth}" disable-scroll="true"
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
        uploadExamImg
    } from '@/utils/wxFile'
    import {
        insertExamData
    } from '@/utils/wxDB'
    import CanvasWrapper from '@/utils/canvasWrapper'
    import {
        resetPageData
    } from '@/utils/mixins'
    import {
        showLoading,
        hideLoading,
        showSuccess,
        showToast,
        computeCanvasInfo
    } from '@/utils'
    const canvasId = 'addExam'
    export default {
        mixins: [resetPageData],
        data() {
            return {
                canvasHeight: '150px',
                canvasWidth: '100%',
                isClear: false,
                src: ''
            }
        },
        components: {
            fixedView
        },
        methods: {
            back() {
                this.canvasWrapper.revoke()
            },
            repaint() {
                this.canvasWrapper.repaint()
            },
            eraser(e) {
                this.isClear = !this.isClear
            },
            async save() {
                showLoading('正在保存')
                const isPaint = this.canvasWrapper.isPaint()
                let original_img_id, edited_img_id
                try {
                    if (isPaint) {
                        const edited_path = await this.canvasWrapper.saveToTempFilePath()
                        const result = await Promise.all([uploadExamImg(this.original_path), uploadExamImg(edited_path)])
                        original_img_id = result[0]
                        edited_img_id = result[1]
                    } else {
                        original_img_id = await uploadExamImg(this.original_path)
                    }
                    var res_id = await insertExamData({
                        original_img_id,
                        edited_img_id,
                        is_paint: isPaint,
                        img_width: this.canvasWrapper.width,
                        img_height: this.canvasWrapper.height
                    })
                    showSuccess('保存成功')
                    setTimeout(() => {
                        wx.redirectTo({
                            url: `/pages/exam-list/main`
                        });
                    }, 1500)
                } catch (e) {
                    showToast('保存失败')
                }
            },
            async init() {
                const canvasInfo = await computeCanvasInfo(this.src, `#${canvasId}`)
                this.canvasWrapper = new CanvasWrapper(canvasId, canvasInfo.canvasWidth, canvasInfo.canvasHeight)
                this.canvasHeight = this.canvasWrapper.height + 'px'
                this.canvasWidth = this.canvasWrapper.width + 'px'
            },
            touchstart(e) {
                this.canvasWrapper.setTouch(e.touches[0].x, e.touches[0].y)
                this._draw(e)
            },
            touchmove(e) {
                this._draw(e)
            },
            touchend(e) {
                this.canvasWrapper.finishOneStep()
            },
            _draw(e) {
                this.isClear ? this.canvasWrapper.eraser(e.touches[0].x, e.touches[0].y) : this.canvasWrapper.scrawl(e.touches[
                    0].x, e.touches[0].y)
            }
        },
        mounted() {
            console.log('add-exam mounted')
            this.src = this.$root.$mp.query.src
            this.original_path = this.src
            this.init()
        }
    }

</script>
<style lang="scss" scoped>
    .add-exam {
        padding: 52rpx 18rpx;
        overflow: hidden;
        height: 100%;
        box-sizing: border-box;
        position: relative;

        .tip {
            background-color: #02BB00;
            position: absolute;
            width: 100%;
            line-height: 50rpx;
            color: #fff;
            font-size: 24rpx;
            text-align: center;
            top: 0;
            left: 0;
        }

        .img-wrapper {
            position: relative;

            img {
                position: absolute;
                left: 0;
                right: 0;
                margin: auto;
            }

            canvas {
                margin: auto;
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
