# qz_ql

#### 项目介绍
错题库小程序

#### 软件架构
```shell
├── App.vue             # 项目入口组件
├── service             # 存放接口相关文件
├── assets              # 存放项目资源文件，比如图片
├── components          # 存放通用组件
├── directives          # 存放全局自定义指令
├── filters             # 存放全局过滤器
├── main.js             # 项目入口文件
├── mock                # mock数据
├── store               # 状态管理
├── styles              # 全局样式文件
├── utils               # 存放工具函数
└── pages               # 存放视图类组件
```

#### 安装教程
``` bash
# 安装依赖
npm install

# 启动开发模式（热更新），默认端口：8080
npm run dev

# 编译上线
npm run build

# 编译上线 + 包分析
npm run build --report
```

#### 协同开发
分支原则：开发在 dev 分支上，发布使用 master 分支。**因此记得拉取和切换到dev分支做开发**

> 当然，更规范的话，你可以有自己的分支，时不时地往dev分支上合并就可以了。

clone仓库后，默认只能看到本地的master分支，因此你需要创建本地分支并与远程分支关联
```shell
# 在本地创建和远程分支对应的分支，本地和远程分支的名称最好一致；
git checkout -b dev origin/dev
```

在分支上 git pull 失败了，原因是没有指定本地 dev 分支与远程 origin/dev 分支的链接，根据提示，设置 dev 和 origin/dev 的链接
```shell
git branch --set-upstream-to=origin/dev dev
```

#### 使用说明

1. xxxx
2. xxxx
3. xxxx

#### 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request


#### 码云特技

1. 使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2. 码云官方博客 [blog.gitee.com](https://blog.gitee.com)
3. 你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解码云上的优秀开源项目
4. [GVP](https://gitee.com/gvp) 全称是码云最有价值开源项目，是码云综合评定出的优秀开源项目
5. 码云官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6. 码云封面人物是一档用来展示码云会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)