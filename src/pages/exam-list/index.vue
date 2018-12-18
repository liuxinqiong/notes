<template>
    <div class='exam-container'>
        <img class='pic-background' src='../../assets/img/background.png'>
        <div class='top-bar'>
            <back-btn></back-btn>
            <div>
                <span class='add-text'>添加</span>
                <img class='circle-btn add-btn' @click='addExam' src='./img/add.png'>
            </div>
            <div>
                <span class='edit-text'>编辑</span>
                <img class='circle-btn edit-btn' @click='editExam' src='./img/edit.png'>
            </div>
        </div>

        <div class='exam-list'>
            <div class='real-content'>
                <div class='exam-wrapper'>
                    <exam-item ref='examItem' v-for='exam in examList' @click="itemClick($event,exam)" :exam='exam'
                        :isEidt='isEidt' :key='exam.id'></exam-item>
                </div>
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
    import BackBtn from '@/components/BackBtn';
    import ExamItem from '@/components/exam/exam-item';
    import {
        showModal,
        arrayRemove
    } from '@/utils';
    import {
        doTest
    } from '@/utils/wxDB';
    export default {
        data() {
            return {
                isEidt: false,
                deleteList: [], //需要删除的列表
                examList: [{
                    id: 1,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 230,
                    isEidt: false
                }, {
                    id: 2,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 380,
                    isEidt: true
                }, {
                    id: 3,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 210,
                    isEidt: true
                }, {
                    id: 4,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 270,
                    isEidt: true
                }, {
                    id: 5,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 340,
                    isEidt: false
                }, {
                    id: 6,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 350,
                    isEidt: true
                }, {
                    id: 7,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 300,
                    isEidt: true
                }, {
                    id: 8,
                    imgSrc: 'https://gss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/zhidao/wh%3D600%2C800/sign=e7a483cccb3d70cf4cafa20bc8ecfd38/00e93901213fb80ee376b02234d12f2eb83894a4.jpg',
                    examTime: '2018.10.12 10.26',
                    width: 278,
                    height: 330,
                    isEidt: true
                }]
            };
        },
        created() {
            //loadData 加载数据
        },
        methods: {
            doTest: function () {
                doTest();
            },
            loadData: function () { //加载数据
                //从云数据库获取数据
            },
            goBack: function () {
                //返回首页
            },
            addExam: function () {},
            editExam: function () {
                this.isEidt = this.isEidt ? false : true;
            },
            deleteExam: function () {
                if (this.deleteList.length <= 0) {
                    showModal('提示', '请选择要删除的题目');
                } else {
                    //去云数据库删除
                }

            },
            editCancel: function () {
                this.isEidt = false;
            },
            itemClick: function (checked, exam) {
                if (!this.isEidt)
                    return; //非编辑状态事件无效
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
                if (!newValue) { //取消编辑的时候 清空要删除的数据
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
            width: 682rpx;
            background: #88c87d;
            border: 4rpx solid #fffded;
            border-radius: 34rpx;
            position: absolute;
            left: 34rpx;
            top: 140rpx;
            right: 34rpx;
            bottom: 60rpx;
            overflow: scroll;
            //padding: 50rpx 44rpx 40rpx 48rpx;
            //padding-top: 50rpx;
            //padding-bottom: 40rpx;
            //padding-left: 48rpx;


            .real-content {
                width: 682rpx;
                position: absolute;
                top: 50rpx;
                bottom: 40rpx;
                overflow: scroll;

            }

            .exam-wrapper {
                width: 590rpx;
                column-count: 2;
                -moz-column-count: 2;
                /* Firefox */
                -webkit-column-count: 2;
                //@debugmargin-top: 50rpx;
                margin-left: 48rpx;
                //margin-bottom: 40rpx;

                /* Safari 和 Chrome */
                //-moz-column-gap: -5rpx;
                /* Firefox */
                //-webkit-column-gap: -5rpx;
                /* Safari and Chrome */
                //column-gap: -5rpx;
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
