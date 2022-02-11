# LReact
#### 介绍
实现 react 核心方法
#### 使用说明

1.  npm i
2.  npm run babel
3.  打开 index.html

如果 `npm run babel` build 失败，可以尝试 `babel src -d build` 手动编译

#### 版本介绍

- v1.0.0：借助 babel 实现 jsx 转 dom
  需要优化：由于 render 方法递归创建 dom 会阻塞主线程渲染页面 ( 这也是 react 16 版本重构的原因 )
- v2.0.0：currentMode 可以在 `index.html` 中引入 `lang_task.js` 打开 performance 观测
#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
