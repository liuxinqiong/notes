<template>
    <div class="exam-container">
        <img class="pic-background" src="../../assets/img/background.png">
        <div class="top-bar">
            <back-btn></back-btn>
            <div>
                <span class="add-text">添加</span>
                <img class="circle-btn add-btn" @click="addExam" src="./img/add.png">
            </div>
            <div>
                <span class="edit-text">编辑</span>
                <img class="circle-btn edit-btn" @click="editExam" src="./img/edit.png">
            </div>
        </div>
        <div class="exam-list">
            <div class="real-content">
                <div class="exam-wrapper">
                    <exam-item ref="examItem" v-for="(exam, index) in examList" :item-width='itemWidth' @click="itemClick($event,exam)"
                        :exam="exam" :is-eidt="isEidt" :key="index"></exam-item>
                </div>
            </div>
        </div>
        <div class="buttom-bar">
            <div>
                <img v-if="isEidt" class="oval-btn delete-btn" @click="deleteExam" src="./img/delete.png">
            </div>
            <div>
                <img v-if="isEidt" class="oval-btn cancel-btn" @click="editCancel" src="./img/cancel.png">
            </div>
        </div>
    </div>
</template>
<script>
    import BackBtn from "@/components/back-btn/back-btn";
    import ExamItem from "@/components/exam-item/exam-item";
    import {
        showModal,
        arrayRemove,
        getUserOpenId,
        takePhoto
    } from "@/utils";
    import {
        getTotalStar,
        addTotalStar,
        deleteExamById,
        insertExamData,
        updateTestOrReciteExam,
        loadExamsOrder,
        insertTestRecord,
        finishTestRecord,
        insertAnswerRecord
    } from "@/utils/wxDB";
    import {
        uploadExamImg,
        getTempFileUrl,
        downloadFile,
        deleteFile
    } from "@/utils/wxFile";
    export default {
        data() {
            return {
                isEidt: false,
                pageNum: 1,
                pageSize: 10,
                orderCol: 'last_answer_time',
                itemWidth: 294,
                deleteList: [], //需要删除的列表
                leftListHeight: 0,
                rightListHeight: 0,
                examOtherHeight: 75,
                clomunSegIndex: 0,
                leftList: [],
                rightList: [],
                examList: []
            };
        },
        created() {
            console.log("created");
        },
        onShow() {
            var getList = [{
                    id: 0,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.21",
                    height: 93
                },
                {
                    id: 1,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.22",
                    height: 93
                },
                {
                    id: 2,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.23",
                    height: 93
                },
                {
                    id: 3,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.24",
                    height: 93
                },
                {
                    id: 4,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.25",
                    height: 93
                },
                {
                    id: 5,
                    imgSrc: "cloud://fly-test-0e5941.666c-fly-test-0e5941/exam_img/1545542578132340577.jpg",
                    examTime: "2018.10.12 10.26",
                    height: 240
                },
                {
                    id: 6,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.27",
                    height: 93
                },
                {
                    id: 7,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.28",
                    height: 93
                },
                {
                    id: 8,
                    imgSrc: "https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg",
                    examTime: "2018.10.12 10.29",
                    height: 93
                }
            ];

            //var getList = this.loadData() 加载数据
            this.sortResponseList(getList);

        },
        methods: {
            loadData() {
                //加载数据
                //从云数据库获取数据
                return loadExamsOrder(this.pageNum, this.pageSize, this.orderCol);
            },
            sortResponseList(getList) {
                for (let index = 0; index < getList.length; index++) {
                    const element = getList[index];
                    console.log(this.leftListHeight);
                    console.log(this.rightListHeight);
                    console.log(this.leftListHeight > this.rightListHeight + 80);
                    if (this.leftListHeight > this.rightListHeight + 80) {
                        //+80 防止因为左边高一点点 就换到右边
                        this.examList.push(element);
                        this.rightListHeight =
                            this.examOtherHeight + element.height + this.rightListHeight;
                    } else {
                        this.examList.splice(this.clomunSegIndex, 0, element);
                        this.clomunSegIndex += 1;
                        this.leftListHeight =
                            this.examOtherHeight + element.height + this.leftListHeight;
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
                //const tempFilePath = await takePhoto();
                //console.log("tempFilePath" + tempFilePath);
                console.log(
                    await downloadFile(
                        "cloud://fly-test-0e5941.666c-fly-test-0e5941/exam_img/1545542578132340577.jpg"
                    )
                );
            },
            deleteExam() {
                if (this.deleteList.length <= 0) {
                    showModal("提示", "请选择要删除的题目");
                } else {
                    //去云数据库删除
                    for (let index = 0; index < this.deleteList.length; index++) {
                        const element = this.deleteList[index];
                        console.log(element);
                        arrayRemove(this.examList, function (n) {
                            return n.id === element.id;
                        });
                    }
                    this.isEidt = false;
                    //  this.examList = [];
                }
            },
            editCancel() {
                this.isEidt = false;
            },
            itemClick(checked, exam) {
                if (!this.isEidt) {
                    wx.navigateTo({
                        url: `/pages/exam/main?sort=time`
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
        width: 83rpx;
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
                left: 463rpx;
                top: 36rpx;
            }

            .edit-btn {
                left: 632rpx;
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
