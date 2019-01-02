<template>
    <fixed-view>
        <div class="add-exam">
            <div class="tip" v-if="isClear">当前处于橡皮擦模式</div>
            <div class="img-wrapper">
                <canvas canvas-id="addExam" id="addExam" :style="{height: canvasHeight + 'px'}" disable-scroll="true"
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
    import {
        createCanvasWrapper
    } from '@/utils/canvasWrapper'
    import {
        resetPageData
    } from '@/utils/mixins'
    import {
        showLoading,
        hideLoading,
        showSuccess,
        showToast
    } from '@/utils'
    const canvasId = 'addExam'
    export default {
        mixins: [resetPageData],
        data() {
            return {
                canvasHeight: 150,
                isClear: false
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
                        const path = await this.canvasWrapper.saveToTempFilePath()
                        const result = await Promise.all([uploadExamImg(this.canvasWrapper.imageSrc), uploadExamImg(
                            path)])
                        original_img_id = result[0]
                        edited_img_id = result[1]
                    } else {
                        original_img_id = edited_img_id = await uploadExamImg(this.src)
                    }
                    var res_id = await insertExamData({
                        original_img_id,
                        edited_img_id,
                        is_paint: this.canvasWrapper.isPaint(),
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
                this.canvasWrapper = await createCanvasWrapper(this.src, canvasId)
                this.canvasHeight = this.canvasWrapper.height
                this.canvasWrapper.drawImage(true)
            },
            touchstart(e) {
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
