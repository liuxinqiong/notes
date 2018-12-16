<template>
    <div class="container" @click="clickHandle('test click', $event)">

        <div class="userinfo" @click="bindViewTap">
            <img class="userinfo-avatar" v-if="userInfo.avatarUrl" :src="userInfo.avatarUrl" background-size="cover" />
            <div class="userinfo-nickname">
                <card :text="userInfo.nickName"></card>
            </div>
        </div>

        <div class="usermotto">
            <div class="user-motto">
                <card :text="motto"></card>
            </div>
        </div>

        <form class="form-container">
            <input type="text" class="form-control" v-model="motto" placeholder="v-model" />
            <input type="text" class="form-control" v-model.lazy="motto" placeholder="v-model.lazy" />
        </form>
        <a href="/pages/counter/main" class="counter">去往Vuex示例页面</a>
        <a @click="takePhote">拍照</a>
        <button @click="test">test</button>
    </div>
</template>

<script>
    import card from "@/components/card";
    import {
        takePhoto
    } from "@/utils";
    export default {
        data() {
            return {
                motto: "Hello World",
                userInfo: {},
                temp: []
            };
        },

        components: {
            card
        },

        methods: {
            bindViewTap() {
                const url = "../logs/main";
                wx.navigateTo({
                    url
                });
            },
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
                });
            },
            clickHandle(msg, ev) {
                console.log("clickHandle:", msg, ev);
            },
            async takePhote() {
                this.temp = await takePhoto();
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
                })
            }
        },

        created() {
            // 调用应用实例的方法获取全局数据
            this.getUserInfo();
        },
        mounted() {}
    };

</script>

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
