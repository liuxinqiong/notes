<template>
    <div>
        <fixed-view>
            <div class="exam">
                <div class="tip" v-if="currentMode !== 'normal'">当前处于{{currentMode === 'eraser' ? '橡皮擦' : '涂抹'}}模式</div>
                <div class="scroll">
                    <div class="img-wrapper">
                        <canvas canvas-id="exam" id="exam" :style="{height: canvasHeight + 'px'}" disable-scroll="true"
                            @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"></canvas>
                        <p class="time">{{current.last_answer_time}}</p>
                    </div>
                    <div class="buttons">
                        <button class="scrawl" @click="scrawl"></button>
                        <button class="eraser" @click="eraser"></button>
                        <button class="clear" @click="clear"></button>
                        <button class="save" @click="save"></button>
                    </div>
                </div>
                <div class="bottom">
                    <button class="mode1 error" v-if="mode" @click="errorHandler"></button>
                    <button class="mode0 prev" v-if="!mode" @click="prevHandler"></button>
                    <p class="info">已完成8题目</p>
                    <button class="mode1 right" v-if="mode" @click="rightHandler"></button>
                    <button class="mode0 next" v-if="!mode" @click="nextHandle"></button>
                </div>
            </div>
        </fixed-view>
        <layer ref="share">
            <div class="share-layer">
                <div class="share-img">
                    <i class="close" @click="closeShare"></i>
                    <div class="star-container">
                        <star :count="2"></star>
                    </div>
                    <div class="result">完成<span class="num">8</span>题</div>
                    <div class="user">
                        <span class="name">wan啦啦</span>
                    </div>
                    <div class="des">正在使用错题库记忆哦！<br/>快来参加吧</div>
                    <div class="code">
                        <img src="../../assets/img/code.jpg" alt="">
                    </div>
                </div>
                <button class="save-local" @click="saveLocal">保存到本地分享</button>
            </div>
        </layer>
    </div>
</template>
<script>
    import fixedView from '@/components/fixed-view/fixed-view'
    import layer from '@/components/layer/layer'
    import star from '@/components/star/star'
    import { loadExamsOrderByAnswerTimeFromOne, updateEditedImg } from '@/utils/wxDB'
    import { createCanvasWrapper } from '@/utils/canvasWrapper'
    import { downloadFile, getTempFileUrl, deleteFile, uploadExamImg } from '@/utils/wxFile'
    import {
        showLoading,
        hideLoading,
        showSuccess,
        showToast
    } from '@/utils'
    const MODE = {
        STUDY: 0,
        EXAM: 1
    }
    export default {
        data() {
            return {
                mode: MODE.STUDY,
                canvasHeight: 150,
                list: [],
                current: {},
                currentMode: 'normal'
            }
        },
        components: {
            fixedView,
            layer,
            star
        },
        methods: {
            scrawl() {
                this.currentMode = this.currentMode === 'scrawl' ? 'normal' : 'scrawl'
            },
            eraser() {
                this.currentMode = this.currentMode === 'eraser' ? 'normal' : 'eraser'
            },
            clear() {
                this.canvasWrapper.repaint()
            },
            async save() {
                const isPaint = this.canvasWrapper.isPaint()
                if(!isPaint) {
                    showToast('没有修改，无需保存')
                    return
                }
                showLoading('保存中')
                const path = await this.canvasWrapper.saveToTempFilePath()
                const newId = await uploadExamImg(path)
                const res = await updateEditedImg(this.current._id, newId)
                if(res) {
                    showSuccess('保存成功')
                    // 有可能共享数据
                    if(this.current.edited_img_id !== this.current.original_img_id) {
                        await deleteFile([this.current.edited_img_id])
                        console.log('旧图片清理成功')
                    }
                } else {
                    showToast('保存失败')
                }
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
                if(this.currentMode === 'scrawl') {
                    this.canvasWrapper.scrawl(e.touches[0].x, e.touches[0].y)
                } else if(this.currentMode === 'eraser') {
                    this.canvasWrapper.eraser(e.touches[0].x, e.touches[0].y)
                }
            },
            prev() {
                if(this.index > 0 && this.index < this.list.length) {
                    this.loadItem(--this.index)
                }
            },
            next() {
                if(this.index >= 0 && this.index < this.list.length - 1) {
                    this.loadItem(++this.index)
                }
            },
            errorHandler(e) {
                // this.$refs.share.show()
                this.prev()
            },
            rightHandler() {
                this.next()
            },
            prevHandler() {
                this.prev()
            },
            nextHandle() {
                this.next()
            },
            closeShare() {
                this.$refs.share.hide()
            },
            saveLocal() {

            },
            async loadItem(index) {
                showLoading('加载题目中')
                const [original_img_src, edited_img_src] = await Promise.all([downloadFile(this.list[index].original_img_id), downloadFile(this.list[index].edited_img_id)])
                this.current = {
                    ...this.list[index],
                    original_img_src,
                    edited_img_src,
                    last_answer_time: this.list[index].last_answer_time.format('yyyy.MM.dd hh:mm')
                }
                console.log(this.current._id)
                this.canvasWrapper = await createCanvasWrapper(edited_img_src, 'exam', original_img_src)
                this.canvasHeight = this.canvasWrapper.height
                this.canvasWrapper.drawImage(true)
                hideLoading()
            },
            async loadListById() {
                showLoading('加载题库中')
                try {
                    this.list = await loadExamsOrderByAnswerTimeFromOne(this.fromId)
                    if(this.list.length > 0) {
                        this.index = 0
                        this.loadItem(0)
                    }
                } catch(e) {
                    console.log(e)
                }
            }
        },
        mounted() {
           this.mode = +this.$root.$mp.query.mode
           this.fromId = this.$root.$mp.query._id
           this.sort = this.$root.$mp.query.sort
           if(this.fromId) {
               this.loadListById()
           }
        }
    }

</script>
<style lang="scss" scoped>
    @import '@/styles/mixin.scss';
    .exam {
        height: 100%;
        position: relative;

        .scroll {
            position: absolute;
            top: 52rpx;
            bottom: 200rpx;
            left: 18rpx;
            right: 18rpx;
        }

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
            img {
                width: 100%;
            }
            canvas {
                width: 100%;
            }
            .time {
                color: #FFF;
                font-size: 20rpx;
            }
        }

        .buttons {
            margin-top: 88rpx;
            display: flex;

            .scrawl {
                width: 91rpx;
                height: 125rpx;
                background: url('./img/scrawl.png') no-repeat;
                background-size: cover;
            }

            .eraser {
                width: 97rpx;
                height: 129rpx;
                background: url('./img/eraser.png') no-repeat;
                background-size: cover;
            }

            .clear {
                width: 97rpx;
                height: 129rpx;
                background: url('./img/clear.png') no-repeat;
                background-size: cover;
            }

            .save {
                width: 87rpx;
                height: 129rpx;
                background: url('./img/save.png') no-repeat;
                background-size: cover;
            }
        }

        .bottom {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 36rpx;
            display: flex;
            align-items: flex-end;

            .info {
                color: #FEF5E2;
                font-size: 30rpx;
            }

            .mode0 {
                width: 115rpx;
                height: 125rpx;

                &.prev {
                    background: url('./img/prev.png') no-repeat;
                    background-size: cover;
                }

                &.next {
                    background: url('./img/next.png') no-repeat;
                    background-size: cover;
                }
            }

            .mode1 {
                width: 97rpx;
                height: 131rpx;

                &.error {
                    background: url('./img/error.png') no-repeat;
                    background-size: cover;
                }

                &.right {
                    background: url('./img/right.png') no-repeat;
                    background-size: cover;
                }
            }
        }
    }

    .share-layer {
        .share-img {
            width: 681rpx;
            height: 998rpx;
            background: url('./img/share-bg.png') no-repeat;
            background-size: 100% 100%;
            margin: auto;
            position: relative;
            overflow: hidden;
            .close {
                position: absolute;
                width: 22rpx;
                height: 22rpx;
                background: url('../../assets/img/close.png') no-repeat;
                background-size: 100% 100%;
                right: 44rpx;
                top: 44rpx;
                @include extend-click;/*it worked, only can't see the element*/
            }
            .star-container {
                margin-top: 147rpx;
            }
            .result {
                margin-top: 32rpx;
                text-align: center;
                font-size: 38rpx;
                color: #75AD82;
                .num {
                    font-size: 74rpx;
                }
            }
            .user {
                margin-top: 57rpx;
                margin-bottom: 49rpx;
                font-size: 24rpx;
                color: #75AD82;
                text-align: center;
            }
            .des {
                text-align: center;
                color: #878787;
                font-size: 24rpx;
            }
            .code {
                margin-top: 51rpx;
                text-align: center;
                img {
                    width: 209rpx;
                    height: 209rpx;
                    border-radius: 14px;
                }
            }
        }
        .save-local {
            width: 515rpx;
            line-height: 99rpx;
            background: url('./img/share-btn.png') no-repeat;
            background-size: 100% 100%;
            font-size: 28rpx;
            color: #fff;
        }
    }
</style>
