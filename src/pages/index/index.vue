<template>
    <div class="container" @click="clickHandle('test click', $event)">
        <img src="../../components/index/img/background.png" class="bg">
        <img src="../../components/index/img/star.png" class="star">

        <div class="main-card">
            <img src="../../components/index/img/center.png" class="center">
            <img src="../../components/index/img/subject.png" class="subject">
            <a href="pages/exam/main">
                <img src="../../components/index/img/recite.png" class="recite">
            </a>
            <a href="pages/exam/main">
                <img src="../../components/index/img/test.png" class="test">
            </a>
            <div class="text">
                <div>
                    1.通过手机拍照，并且，涂抹答案，录入题库
                </div>
                <div>

                    2.点击开始，开始答题，答题后，判断对错。
                </div>
                <div>
                    3.根据记忆曲线，给出题库里的类容。
                </div>
            </div>
        </div>
        <div class="userinfo" @click="bindViewTap">
            <img class="userinfo-avatar" v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" background-size="cover" />
            <div class="userinfo-nickname">
                <card :text="userInfo.nickName"></card>
            </div>
        </div>

        <div class="container" @click="clickHandle('test click', $event)">

            <div class="userinfo" @click="bindViewTap">
                <img class="userinfo-avatar" v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" background-size="cover" />
                <div class="userinfo-nickname">
                    <card :text="userInfo.nickName"></card>
                </div>
            </div>
            >>>>>>> 572fb3e7ef09f267a6af69f9d3c2ba980767406c

            <div class="usermotto">
                <div class="user-motto">
                    <card :text="motto"></card>
                </div>
            </div>

            <form class="form-container">
                <input type="text" class="form-control" v-model="motto" placeholder="v-model" />
                <input type="text" class="form-control" v-model.lazy="motto" placeholder="v-model.lazy" />
            </form>
            <!-- <a href="/pages/counter/main" class="counter">去往Vuex示例页面</a> -->
            <a @click="takePhote">
                <img src="../../components/index/img/photograph.png" class="photo">
            </a>
            <a href="/pages/exam/exam-list/main">
                <img src="../../components/index/img/group.png" class="group">
            </a>

            <!-- <button @click.stop="setCache">set</button>
            <button @click.stop="getCache">get</button> -->
        </div>
</template>

<style lang="scss" scoped>
    .userinfo {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .userinfo-avatar {
        width: 128rpx;
        height: 128rpx;
        margin: 20rpx;
        border-radius: 50%;
    }

    .userinfo-nickname {
        color: #aaa;
    }

    .usermotto {
        margin-top: 150px;
    }

    .form-control {
        display: block;
        padding: 0 12px;
        margin-bottom: 5px;
        border: 1px solid #ccc;
    }

    .counter {
        display: inline-block;
        margin: 10px auto;
        padding: 5px 10px;
        color: blue;
        border: 1px solid blue;
    }
</style>
// <form class="form-container"><input type="text" class="form-control" v-model="motto" placeholder="v-model" /><input
        type="text" class="form-control" v-model.lazy="motto" placeholder="v-model.lazy" /></form><a href="/pages/counter/main"
    class="counter">去往Vuex示例页面</a><a @click="takePhote">拍照</a><button @click="test">test</button></div></template>
<script>
    import card from "@/components/card";
    import './index.scss'
    import {
        takePhoto,
        showSuccess
    } from "@/utils";

    export default {
        data() {
            return {
                motto: "Hello World",
                userInfo: {}
            }

            ;
        },

        components: {
            card
        },

        methods: {
            bindViewTap() {
                const url = "../logs/main";

                wx.navigateTo({
                        url
                    }

                );
            }

            ,
            getUserInfo() {

                // 调用登录接口
                wx.login({
                        success: () => {
                            wx.getUserInfo({
                                success: res => {
                                    this.userInfo = res.userInfo;
                                }
                            });
                        }
                    }

                );
            }

            ,
            clickHandle(msg, ev) {
                console.log("clickHandle:", msg, ev);
            },
            async takePhote() {
                try {
                    const tempFilePath = await takePhoto();

                    console.log(tempFilePath);
                    wx.navigateTo({
                            url: `/pages/cropper/main?src=$ {tempFilePath}`
                        }

                    )
                } catch (e) {
                    console.log(e)
                }
            },
            test() {
                wx.cloud.callFunction({

                        // 云函数名称
                        name: 'add',
                        // 传给云函数的参数
                        data: {
                            a: 1,
                            b: 2,
                        },
                        success(res) {
                            console.log(res.result.sum) // 3
                        },
                        fail: console.error
                    }

                )
            }
        },

        created() {
            // 调用应用实例的方法获取全局数据
            this.getUserInfo();
        },
        mounted() {}
    }

</script>
