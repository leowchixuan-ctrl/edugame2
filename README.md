# 《有礼貌！我该怎么做？》

离线浏览器版亲子读经班生活礼仪小游戏。主题来自《弟子规》：

> 称尊长，勿呼名；对尊长，勿见能。

游戏用于投影课堂活动，孩子轮流上台回答，最后三题由全班共同完成。没有个人分数、排名、淘汰或惩罚。

## 启动方式

直接用 Google Chrome 或 Microsoft Edge 打开 `index.html`。

推荐显示环境：

- 1920×1080 投影屏幕
- 也可在 1366×768 使用

## 全屏

- 首页点击 `⛶ 全屏`
- 或按键盘 `F`
- 退出全屏可按浏览器默认的 `Esc`

## 键盘快捷键

- `F`：切换全屏
- `M`：切换静音
- `R`：重启当前题
- `←`：上一题
- `→`：下一题，或从成功反馈继续
- `Esc`：浏览器默认退出全屏

## 主持人控制

右下角 `⚙️ 主持人控制` 可打开面板，支持：

- 跳到指定题目
- 重启当前题
- 重置全游戏
- 切换声音
- 回到首页

## 项目结构

```text
index.html
README.md
css/
  style.css
  animations.css
js/
  game.js
  questions.js
  audio.js
assets/
  images/
    characters/
    scenes/
    tree/
  audio/
```

## 题目数据

所有 12 道题都集中在 `js/questions.js` 的 `window.QUESTIONS` 数组中。每题包含题号、章节、标题、情境类型、对话、问题、选项、正确答案、反馈、学习句和小高班讨论提示。

## 替换美术

当前版本使用 CSS 插画、几何图形和少量 emoji，适合作为第一版功能原型。之后可以把正式角色、场景和树的图片放入：

- `assets/images/characters/`
- `assets/images/scenes/`
- `assets/images/tree/`

再在 `css/style.css` 或 `js/game.js` 中替换对应的 CSS 场景。

## 添加本地声音

当前 `js/audio.js` 使用 Web Audio API 生成简短柔和提示音，不依赖外部音频。之后如需替换为本地音频文件，可把文件放入 `assets/audio/`，并在 `js/audio.js` 中将 `play()` 改为播放对应的本地文件。

## 已知限制

- 第一版为 CSS 占位插画，不是正式绘本级角色美术。
- 声音为程序生成提示音，不是真实录制音效。
- 情境插画复用同一套基础元素，后续可逐题替换成更精细的本地图片。
