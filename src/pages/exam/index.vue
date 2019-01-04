<template>
    <div>
        <fixed-view>
            <div class="exam">
                <div class="tip" v-if="currentMode !== 'normal'">当前处于{{currentMode === 'eraser' ? '橡皮擦' : '涂抹'}}模式</div>
                <div class="scroll">
                    <div class="img-wrapper" id="exam">
                        <canvas canvas-id="exam" :style="{height: canvasHeight, width: canvasWidth}" disable-scroll="true"
                            @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" v-show="showCanvas"></canvas>
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
                    <p class="info">已完成{{currentIndex}}题目</p>
                    <button class="mode1 right" v-if="mode" @click="rightHandler"></button>
                    <button class="mode0 next" v-if="!mode" @click="nextHandle"></button>
                </div>
            </div>
        </fixed-view>
        <layer ref="share" :autoclose="false">
            <div class="share-layer">
                <div class="share-img">
                    <i class="close" @click="closeShare"></i>
                    <div class="star-container">
                        <star :count="starNo"></star>
                    </div>
                    <div class="result">完成<span class="num">{{currentIndex + 1}}</span>题</div>
                    <div class="user">
                        <open-data class="avatar" type="userAvatarUrl"></open-data>
                        <open-data class="name" type="userNickName"></open-data>
                    </div>
                    <div class="des">正在使用错题库记忆哦！<br />快来参加吧</div>
                    <div class="code">
                        <img src="../../assets/img/code.jpg" alt="">
                    </div>
                </div>
                <button class="save-local" open-type="getUserInfo" @getuserinfo="onGotUserInfo">保存到本地分享</button>
            </div>
        </layer>
        <layer ref="result" :autoclose="false">
            <div class="result-layer">
                <div class="result-img">
                    <div class="star-container">
                        <star :count="starNo" mode="two"></star>
                    </div>
                    <div class="result">完成<span class="num">{{currentIndex + 1}}</span>题</div>
                    <div class="btns">
                        <button class="continue" @click="continueTest"></button>
                        <button class="share" @click="share"></button>
                        <button class="index" @click="toIndex"></button>
                    </div>
                </div>
            </div>
        </layer>
        <canvas canvas-id="share" id="share" class="share-canvas"></canvas>
    </div>
</template>
<script>
    import fixedView from '@/components/fixed-view/fixed-view'
    import layer from '@/components/layer/layer'
    import star from '@/components/star/star'
    import {
        loadExamsOrderByAnswerTimeFromOne,
        updateEditedImg,
        loadAllExamsOrderByWeight,
        loadAllExamsOrderByAnswerTime,
        updateTestOrReciteExam,
        insertTestRecord,
        insertAnswerRecord,
        finishTestRecord,
        addTotalStar
    } from '@/utils/wxDB'
    import {
        createCanvasWrapper
    } from '@/utils/canvasWrapper'
    import {
        downloadFile,
        getTempFileUrl,
        deleteFile,
        uploadExamImg
    } from '@/utils/wxFile'
    import {
        showLoading,
        hideLoading,
        showSuccess,
        showToast,
        generateExamList,
        getNodeRect,
        getImageInfo
    } from '@/utils'
    import {
        resetPageData
    } from '@/utils/mixins'
    const MODE = {
        STUDY: 0,
        EXAM: 1
    }
    const UPDATETYPE = {
        RIGHT: 1,
        ERROR: 2,
        RECITE: 3
    }
    export default {
        mixins: [resetPageData],
        data() {
            return {
                mode: MODE.STUDY,
                canvasHeight: '150px',
                canvasWidth: '100%',
                current: {},
                currentMode: 'normal',
                currentIndex: 0,
                rightCount: 0,
                starNo: 0,
                showCanvas: true // canvas 层级太高
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
                if (!isPaint) {
                    showToast('没有修改，无需保存')
                    return
                }
                showLoading('保存中')
                const path = await this.canvasWrapper.saveToTempFilePath()
                const newId = await uploadExamImg(path)
                const res = await updateEditedImg(this.current._id, newId)
                if (res) {
                    showSuccess('保存成功')
                    // 有可能共享数据
                    if (this.current.edited_img_id !== this.current.original_img_id) {
                        await deleteFile([this.current.edited_img_id])
                        console.log('旧图片清理成功')
                    }
                } else {
                    showToast('保存失败')
                }
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
                if (this.currentMode === 'scrawl') {
                    this.canvasWrapper.scrawl(e.touches[0].x, e.touches[0].y)
                } else if (this.currentMode === 'eraser') {
                    this.canvasWrapper.eraser(e.touches[0].x, e.touches[0].y)
                }
            },
            prev() {
                if (this.currentIndex > 0 && this.currentIndex < this.list.length) {
                    this.loadItem(--this.currentIndex)
                } else {
                    showToast('没有更多啦')
                }
            },
            next() {
                if (this.currentIndex >= 0 && this.currentIndex < this.list.length - 1) {
                    this.loadItem(++this.currentIndex)
                } else {
                    showToast('没有更多啦')
                }
            },
            async errorHandler(e) {
                showLoading('更新状态')
                // await insertAnswerRecord({
                //     exam_id: this.current._id,
                //     used_time: Math.round((new Date().getTime() - this.startTime) / 1000),
                //     answer_result: UPDATETYPE.ERROR,
                //     exam_test_id: this.exam_test_id
                // })
                const res = await updateTestOrReciteExam(this.current._id, UPDATETYPE.ERROR)
                // 最后一道
                this.currentIndex === this.list.length - 1 ? this.finishTest() : res && this.next()
            },
            async rightHandler() {
                this.rightCount++
                showLoading('更新状态')
                // await insertAnswerRecord({
                //     exam_id: this.current._id,
                //     used_time: Math.round((new Date().getTime() - this.startTime) / 1000),
                //     answer_result: UPDATETYPE.RIGHT,
                //     exam_test_id: this.exam_test_id
                // })
                const res = await updateTestOrReciteExam(this.current._id, UPDATETYPE.RIGHT)
                this.currentIndex === this.list.length - 1 ? this.finishTest() : res && this.next()
            },
            async finishTest() {
                // 计算星星
                const rate = this.rightCount / this.list.length
                let starNo = 0
                if (rate > 5 / 6 && rate <= 1) {
                    starNo = 3
                } else if (rate > 0.5 && rate <= 5 / 6) {
                    starNo = 2
                } else if (rate > 0 && rate <= 0.5) {
                    starNo = 1
                }
                this.starNo = starNo
                showLoading('正在保存')
                try {
                    await Promise.all([finishTestRecord(this.exam_test_id, starNo), addTotalStar(starNo)])
                    this.showCanvas = false
                    this.$refs.result.show()
                } catch (e) {
                    console.log(e)
                }
                hideLoading()
            },
            async prevHandler() {
                const res = await updateTestOrReciteExam(this.current._id, UPDATETYPE.RECITE)
                res && this.prev()
            },
            async nextHandle() {
                const res = await updateTestOrReciteExam(this.current._id, UPDATETYPE.RECITE)
                res && this.next()
            },
            closeShare() {
                this.$refs.share.hide()
                wx.reLaunch({
                    url: `/pages/index/main`
                });
            },
            share() {
                this.$refs.result.hide()
                this.$refs.share.show()
            },
            toIndex() {
                this.$refs.result.hide()
                wx.reLaunch({
                    url: `/pages/index/main`
                });
            },
            continueTest() {
                this.$refs.result.hide()
                this.showCanvas = true
                this.currentMode = 'normal'
                this.rightCount = 0
                this.list = generateExamList(this.allExams, this.currentIndex + 1, 30)
                this.currentIndex = 0
                this.loadItem(0)
            },
            async onGotUserInfo(e) {
                if(e.mp.detail.userInfo) {
                    showLoading('正在保存')
                    const avatarInfo = await getImageInfo(e.mp.detail.userInfo.avatarUrl)
                    this.saveLocal(avatarInfo.path, e.mp.detail.userInfo.nickName)
                } else {
                    showToast('您取消的授权')
                }
            },
            async saveLocal(avatar, name) {
                const roundRect = function(ctx, x, y, w, h, r) {
                    var min_size = Math.min(w, h);
                    if (r > min_size / 2) r = min_size / 2;
                    // 开始绘制
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.arcTo(x + w, y, x + w, y + h, r);
                    ctx.arcTo(x + w, y + h, x, y + h, r);
                    ctx.arcTo(x, y + h, x, y, r);
                    ctx.arcTo(x, y, x + w, y, r);
                    ctx.closePath();
                }
                const computeStar = function(starNo) {
                    const fullStar = require('@/components/star/img/full1.png')
                    const emptyStar = require('@/components/star/img/empty1.png')
                    if(starNo === 0) {
                        return [emptyStar, emptyStar, emptyStar]
                    } else if(starNo === 1){
                        return [fullStar, emptyStar, emptyStar]
                    } else if(starNo === 2) {
                        return [fullStar, fullStar, emptyStar]
                    } else {
                        return [fullStar, fullStar, fullStar]
                    }
                }
                const drawStar = function(ctx, star1, star2, star3) {
                    ctx.drawImage(star1, 68, 74, 67, 65)
                    ctx.drawImage(star2, 150, 53, 56, 54)
                    ctx.drawImage(star3, 224, 74, 67, 65)
                }
                try {
                    const ctx = wx.createCanvasContext('share')
                    // 处理背景图
                    const shareBg = require('./img/share-bg.png')
                    ctx.drawImage(shareBg, 0, 0, 341, 499)
                    // 处理文字
                    ctx.setFontSize(19)
                    ctx.setFillStyle('#75AD82')
                    ctx.fillText('完成', 121, 186)
                    ctx.fillText('题', 184, 186)
                    ctx.setFontSize(37)
                    ctx.fillText(this.currentIndex + 1, 159, 186)
                    ctx.setFontSize(12)
                    ctx.setFillStyle('#878787')
                    ctx.fillText('正在使用错题库记忆哦！', 106, 288)
                    ctx.fillText('快来参加吧', 137, 310)
                    // 处理星星
                    drawStar(ctx, ...computeStar(this.starNo))
                    // 处理用户信息
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(139, 227, 12, 0, 2 * Math.PI)
                    ctx.clip()
                    ctx.drawImage(avatar, 127, 215, 24, 24)
                    ctx.restore()
                    ctx.setFontSize(12)
                    ctx.setFillStyle('#75AD82')
                    ctx.fillText(name, 158, 232)
                    // 二维码
                    roundRect(ctx, 118, 333, 104, 105, 7)
                    ctx.setFillStyle('#fff')
                    ctx.fill();
                    const code = require('@/assets/img/code.jpg')
                    ctx.drawImage(code, 124, 341, 93, 93)
                    ctx.draw(false, () => {
                        wx.canvasToTempFilePath({
                            x: 0,
                            y: 0,
                            width: 341,
                            height: 499,
                            canvasId: 'share',
                            success(res) {
                                wx.saveImageToPhotosAlbum({
                                    filePath: res.tempFilePath,
                                    success() {
                                        showSuccess('保存相册成功')
                                    },
                                    fail() {
                                        hideLoading()
                                    }
                                })
                            },
                            fail(e) {
                                console.log(e)
                                hideLoading()
                            }
                        })
                    })
                } catch(e) {
                    console.log(e)
                    hideLoading()
                }
            },
            async loadItem(index) {
                showLoading('加载题目中')
                const [original_img_src, edited_img_src] = await Promise.all([
                    downloadFile(this.list[index].original_img_id),
                    downloadFile(this.list[index].edited_img_id)
                ])
                this.current = {
                    ...this.list[index],
                    original_img_src,
                    edited_img_src,
                    last_answer_time: this.list[index].last_answer_time.format('yyyy.MM.dd hh:mm')
                }
                console.log(this.current._id)
                this.canvasWrapper = await createCanvasWrapper(edited_img_src, 'exam', original_img_src)
                this.canvasHeight = this.canvasWrapper.height + 'px'
                this.canvasWidth = this.canvasWrapper.width + 'px'
                this.canvasWrapper.drawImage(true)
                this.startTime = new Date().getTime()
                hideLoading()
            },
            async loadList(func, ...args) {
                showLoading('加载题库中')
                try {
                    this.allExams = await func(...args)
                    if(!this.allExams || this.allExams.length === 0) {
                        showToast('错题库空空如也，先去录题吧')
                        setTimeout(() => {
                            wx.reLaunch({
                                url: `/pages/index/main`
                            });
                        }, 1500)
                        return
                    }
                    if(this.mode === MODE.STUDY) {
                        this.list = this.allExams
                    } else {
                        this.list = generateExamList(this.allExams, 0, 30)
                    }
                    this.currentIndex = 0
                    this.loadItem(0)
                } catch (e) {
                    console.log(e)
                }
            },
            async startTest() {
                // 测验
                if (this.mode == MODE.EXAM) {
                    this.exam_test_id = await insertTestRecord()
                    if (this.fromId) {
                        this.loadList(loadExamsOrderByAnswerTimeFromOne, this.fromId)
                    } else {
                        this.loadList(loadAllExamsOrderByWeight)
                    }
                } else {
                    this.loadList(loadAllExamsOrderByAnswerTime)
                }
            }
        },
        async mounted() {
            console.log('exam mounted')
            this.mode = +this.$root.$mp.query.mode
            this.fromId = this.$root.$mp.query._id
            this.sort = this.$root.$mp.query.sort
            this.allExams = [] // 题库
            this.list = [] // 选取的题目集合
            this.startTest()
            this.$refs.share.show()
        },
        onUnload() {
            console.log('exam onUnload')
            this.$refs.result && this.$refs.result.hide()
            this.$refs.share && this.$refs.share.hide()
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
                margin: auto;
            }

            .time {
                color: #FFF;
                font-size: 20rpx;
            }
        }

        .buttons {
            margin-top: 10rpx;
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

    .result-layer {
        .result-img {
            width: 722rpx;
            height: 826rpx;
            background: url('./img/res-bg.png') no-repeat;
            background-size: 100% 100%;
            margin: auto;
            position: relative;
            overflow: hidden;
        }

        .star-container {
            margin-top: 196rpx;
        }

        .result {
            margin-top: 45rpx;
            text-align: center;
            color: #FFF7ED;
            font-size: 38rpx;

            .num {
                font-size: 74rpx;
            }
        }

        .btns {
            margin-top: 45rpx;
            display: flex;
            margin-left: 144rpx;
            margin-right: 156rpx;

            button {
                width: 102rpx;
                height: 159rpx;
            }

            .continue {
                background: url('./img/res-continue.png') no-repeat;
                background-size: 100% 100%;
            }

            .share {
                background: url('./img/res-share.png') no-repeat;
                background-size: 100% 100%;
            }

            .index {
                background: url('./img/res-index.png') no-repeat;
                background-size: 100% 100%;
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
                @include extend-click;
                /*it worked, only can't see the element*/
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
                font-size: 0;
                color: #75AD82;
                justify-content: center;
                display: flex;
                align-items: center;

                .avatar {
                    border-radius: 50%;
                    width: 49rpx;
                    height: 49rpx;
                    border: 2rpx solid rgba(255, 255, 253, 1);
                    margin-right: 13rpx;
                    display: inline-block;
                    overflow: hidden;
                    vertical-align: middle;
                }

                .name {
                    font-size: 24rpx;
                }
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

    .share-canvas {
        // position: absolute;
        border: 1px solid red;
        // top: -9999px;
        // left: -9999px;
        width: 341px;
        height: 499px;
    }

</style>
