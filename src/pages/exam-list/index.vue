<template>
    <div class='exam-container'>
        <img class='pic-background' src='../../assets/img/background.png'>
        <div class='top-bar'>
            <back-btn></back-btn>
            <div>
                <img class='circle-btn add-btn' @click='addExam' src='./img/add.png'>
            </div>
            <div>
                <img class='circle-btn edit-btn' @click='editExam' src='./img/edit.png'>
            </div>
        </div>
        <div class='exam-list'>
            <div class='real-content'>
                <scroll-view scroll-y class='scroll-wrapper' @scrolltoupper="upper" @scrolltolower='lower' @scroll='scroll'
                    scroll-top='100rpx'>
                    <div class='exam-wrapper' ref='eaxmWrapper'>

                        <exam-item ref='examItem' v-for='(exam, index) in examList' :item-width='itemWidth' @click='itemClick($event,exam)'
                            :exam='exam' :is-eidt='isEidt' :key='index'></exam-item>

                    </div>
                </scroll-view>
            </div>
        </div>
        <div class='buttom-bar'>
            <div>
                <img v-if='isEidt' class='oval-btn delete-btn' @click='deleteExam' src='./img/delete.png'>
            </div>
            <div>
                <img v-if='isEidt' class='oval-btn cancel-btn' @click='editCancel' src='./img/cancel.png'>
            </div>
        </div>
    </div>
</template>
<script>
    import BackBtn from "@/components/back-btn/back-btn";
    import ExamItem from "@/components/exam-item/exam-item";
    import {
        resetPageData
    } from "@/utils/mixins";
    import {
        showModal,
        arrayRemove,
        takePhoto,
        showLoading,
        hideLoading,
        showSuccess
    } from "@/utils";
    import {
        insertExamData,
        loadExamsOrder,
        deleteExamCallCloudByIds
    } from "@/utils/wxDB";
    import {
        deleteFile
    } from "@/utils/wxFile";
    export default {
        mixins: [resetPageData],
        data() {
            return {
                isEidt: false,
                pageNum: 1,
                pageSize: 10,
                nextData: true,
                isLock: false,
                orderCol: "last_answer_time",
                itemWidth: 294,
                deleteList: [], //需要删除的列表
                leftListHeight: 0,
                rightListHeight: 0,
                examOtherHeight: 75,
                clomunSegIndex: 0,
                examList: []
            };
        },
        async mounted() {
            await this.reload();
            console.log("exam-list mounted");
        },
        methods: {
            async lower(e) {
                await this.getNextPageData();
            },
            upper(e) {
                //顶部事件
            },
            async reload() {
                //重新加载
                showLoading("数据加载中...");
                this.pageNum = 1;
                this.pageSize = 10;
                this.isEidt = false;
                this.leftListHeight = 0;
                this.rightListHeight = 0;
                this.clomunSegIndex = 0;
                this.examList = [];
                this.deleteList = [];
                this.nextData = true;
                this.isLock = false;
                var getList = await this.loadData(); //加载数据
                if (getList == null || getList.length == 0) {
                    hideLoading();
                    wx.showToast({
                        title: "题库中空空如也，快去录题吧",
                        icon: "none"
                    });
                    return;
                }
                this.sortResponseList(getList);
                this.$nextTick(function () {
                    hideLoading();
                });
            },
            async getNextPageData() {
                if (this.isLock)
                    //防止重复加载
                    return;
                if (!this.nextData) {
                    wx.showToast({
                        title: "没有更多数据了",
                        icon: "none"
                    });
                    return;
                }
                this.isLock = true;
                this.pageNum++;
                showLoading("数据加载中...");
                var getList = await this.loadData(); //加载数据
                this.sortResponseList(getList);
                this.$nextTick(function () {
                    hideLoading();
                    this.isLock = false;
                });
            },
            async loadData() {
                //加载数据
                //从云数据库获取数据
                var getList = await loadExamsOrder(
                    this.pageNum,
                    this.pageSize,
                    this.orderCol
                );
                if (getList.length < this.pageSize) {
                    this.nextData = false; //没有更多数据了
                }
                for (let index = 0; index < getList.length; index++) {
                    getList[index].imgSrc = getList[index].original_img_id;
                    getList[index].examTime = getList[index].last_answer_time.format(
                        "yyyy.MM.dd hh:mm"
                    );
                }
                return getList;
            },
            sortResponseList(getList) {
                for (let index = 0; index < getList.length; index++) {
                    const element = getList[index];
                    if (this.leftListHeight > this.rightListHeight + 80) {
                        //+80 防止因为左边高一点点 就换到右边
                        this.examList.push(element);
                        this.rightListHeight =
                            this.examOtherHeight + element.img_height + this.rightListHeight;
                    } else {
                        this.examList.splice(this.clomunSegIndex, 0, element);
                        this.clomunSegIndex += 1;
                        this.leftListHeight =
                            this.examOtherHeight + element.img_height + this.leftListHeight;
                    }
                }
            },
            async addExam() {
                const tempFilePath = await takePhoto();
                wx.navigateTo({
                    url: `/pages/cropper/main?src=${tempFilePath}`
                });
            },
            async editExam() {
                this.isEidt = !this.isEidt;
                // await insertExamData({
                //     eidted_img_id: 'tm00001',
                //     img_height: '240',
                //     img_width: '320',
                //     is_paint: 1,
                //     original_img_id: 'yt0001'
                // });
            },
            async deleteExam() {
                //TODO
                if (this.deleteList.length <= 0) {
                    showModal("提示", "请选择要删除的题目");
                } else {
                    //去云数据库删除
                    showLoading("正在删除中...");
                    let examIds = [];
                    for (let index = 0; index < this.deleteList.length; index++) {
                        examIds.push(this.deleteList[index]._id);
                    }

                    let deletedNum = await deleteExamCallCloudByIds(examIds); //删除EXAMS集合
                    let fileIds = [];
                    for (let index = 0; index < this.deleteList.length; index++) {
                        //确保数据删除再删除图片
                        fileIds.push(this.deleteList[index].original_img_id); //原图
                        if (
                            this.deleteList[index].eidted_img_id != null &&
                            this.deleteList[index].eidted_img_id != ""
                        ) {
                            //编辑图
                            fileIds.push(this.deleteList[index].eidted_img_id);
                        }
                    }
                    let deleteFiles = await deleteFile(fileIds); //删除文件
                    hideLoading();
                    await this.reload(); //刷新重新加载
                    // arrayRemove(this.examList, function (n) { //不重新加载页面删除元素 后台处理删除
                    //     return n.id === element.id;
                    // });
                }
            },
            editCancel() {
                this.isEidt = false;
            },
            itemClick(checked, exam) {
                if (!this.isEidt) {
                    wx.navigateTo({
                        url: `/pages/exam/main?mode=1&sort=time&_id=` + exam._id
                    });
                    return; //非编辑状态事件无效
                }
                if (checked) {
                    this.deleteList.push(exam);
                } else {
                    var index = this.deleteList.indexOf[exam];
                    arrayRemove(this.deleteList, function (n) {
                        return n.id === exam.id; //根据ID匹配
                    });
                }
            }
        },
        watch: {
            isEidt(newValue, oldValue) {
                if (!newValue) {
                    //取消编辑的时候 清空要删除的数据
                    this.deleteList = [];
                }
            }
        },
        components: {
            BackBtn,
            ExamItem
        }
    };

</script>
<style lang='scss' scoped>
    .circle-btn {
        width: 153rpx;
        height: 83rpx;
        position: absolute;
    }

    .oval-btn {
        width: 211rpx;
        height: 84rpx;
        position: absolute;
    }

    .exam-container {
        width: 100%;
        height: 100%;
        flex-direction: column;
        color: #222222;
        font-size: 30rpx;
        position: absolute;

        .pic-background {
            height: 100%;
            width: 100%;
            position: absolute;
        }

        .top-bar {
            height: 150rpx;
            width: 100%;

            .add-btn {
                left: 393rpx;
                top: 36rpx;
            }

            .edit-btn {
                left: 564rpx;
                top: 36rpx;
            }

            span {
                width: 64rpx;
                height: 29rpx;
                font-size: 30rpx;
                font-family: FZPWJW--GB1-0;
                font-weight: 400;
                color: rgba(255, 255, 255, 1);
                line-height: 35rpx;
                text-shadow: 3rpx 4rpx 9rpx rgba(55, 97, 120, 0.2);
                position: absolute;
            }

            .add-text {
                left: 398rpx;
                top: 66rpx;
            }

            .edit-text {
                left: 569rpx;
                top: 66rpx;
            }
        }

        .exam-list {
            background: #88c87d;
            border: 4rpx solid #fffded;
            border-radius: 34rpx;
            position: absolute;
            left: 34rpx;
            top: 140rpx;
            right: 34rpx;
            bottom: 60rpx;
            overflow: auto;

            .real-content {
                position: absolute;
                top: 50rpx;
                bottom: 40rpx;
                left: 42rpx;
                //right: 45rpx;
                overflow: auto;
            }

            .exam-wrapper {
                column-count: 2;
                //margin-bottom: 40rpx;
                column-gap: 18rpx;
                //float: left;
            }

            .scroll-wrapper {
                height: 100%;
            }
        }

        .buttom-bar {
            height: 150rpx;
            width: 100%;

            .delete-btn {
                left: 101rpx;
                bottom: 120rpx;
            }

            .cancel-btn {
                left: 416rpx;
                bottom: 120rpx;
            }
        }
    }

</style>
