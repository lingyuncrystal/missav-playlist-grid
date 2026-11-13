# MissAV 片单网格化（missav-playlist-grid）

> ⚠️ **本脚本已停止维护（2026-11-13）**：功能已合并进 **MissAV 综合增强（翻页去重 + 标题修正 + 片单网格化）**，
> 请卸载本脚本，改装 <https://sleazyfork.org/zh-CN/scripts/605067>。
> 新脚本包含本脚本的全部功能（且片单页标题也能自动修正），配置面板可独立开关每个模块。

适用于 [MissAV](https://missav.ws/) 的油猴（Tampermonkey / Violentmonkey）用户脚本：

- **片单页网格卡片化**：把「片单 / 播放列表」页面（`/playlists/*`）的竖向列表布局，改造成和「中文字幕」等分类页一样的缩略图网格卡片布局（手机 2 列 / 平板 3 列 / 宽屏 4 列）。
- **标题样式对齐分类页**：封面图下方单行截断标题链接，与分类页卡片完全一致。
- **功能不丢失**：「提交评语」「删除」功能完整保留，默认折叠在卡片下方的「评语 / 删除」开关里，点击展开即可使用。
- **不破坏 Alpine.js**：只调整 class 与节点位置，不触碰 `x-data` / `x-ref` 绑定，删除影片、提交评语照常工作。

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）扩展。
2. 点击脚本文件 [missav-playlist-grid.user.js](./missav-playlist-grid.user.js) 的 Raw 链接，扩展会自动弹出安装界面；或将文件内容复制到扩展中手动新建脚本。
3. 打开任意片单页面（需登录，如 `missav.ws/playlists/xxx`）即可生效。

## 生效范围

```
https://missav.ws/playlists/*
https://missav.ws/cn/playlists/*
https://missav.com/playlists/*
https://missav.com/cn/playlists/*
```

## 实现说明

| 模块 | 说明 |
| --- | --- |
| 容器网格化 | 找到片单列表 `ul`，去掉 `space-y-8`，套用分类页同款 `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5`（站点自带 Tailwind，直接复用其工具类） |
| 卡片改造 | 条目 `li` 去掉 `sm:flex w-72` 等横向布局类；缩略图外层去掉固定宽度，封面铺满卡片 |
| 标题还原 | 把表单里的 `label` 标题换成分类页同款 `div.my-2.text-sm.truncate > a` 结构，并移入 `.thumbnail.group` 内部，DOM 结构与分类页一致 |
| 表单折叠 | 评语表单（textarea + 提交/删除按钮）默认 `display: none`，卡片下方提供「评语 / 删除」展开开关 |
| 就绪等待 | `document-idle` 启动后短轮询（300ms × 20），兼容慢网络 / 客户端渲染 |

## 版本

当前版本：**1.0.3**，详见 [CHANGELOG](./CHANGELOG.md)。

## 发布流程

### 原理

Sleazyfork 没有写入 API，官方支持的自动发布方式是「从 URL 同步 + GitHub Webhook」：

```
push 到 main → GitHub 触发 webhook → Sleazyfork 抓取 raw 文件 → @version 更新时才发布
```

### 一次性配置（只需做一次）

1. 登录 Sleazyfork，打开本脚本的管理页 → **Syncing（同步）设置**：
   - 同步方式选 **Webhook**；
   - 同步地址填 raw 文件地址（注意是 `raw` 地址，不能是 `/blob/` 页面地址）：
     ```
     https://raw.githubusercontent.com/lingyuncrystal/missav-playlist-grid/main/missav-playlist-grid.user.js
     ```
2. 保存后页面会生成本脚本专属的 Webhook URL 和 Secret，复制它们：
   - 到 GitHub 仓库 **Settings → Webhooks → Add webhook**：Payload URL 填该地址，Secret 填生成的密钥，Content type 选 `application/json`，只勾 **push** 事件；
   - 或者在发布时设置环境变量 `SLEAZYFORK_WEBHOOK_URL`，`publish.sh` 会自动完成 webhook 配置。
   - ✅ 本仓库的 webhook 已配置完成（2026-11-12，脚本页：https://sleazyfork.org/zh-CN/scripts/605058 ），此步无需再做。
3. 点一次「Sync now」验证 Sleazyfork 能抓到文件。

### 日常发布（改完代码一键发布）

1. 修改 `missav-playlist-grid.user.js`， bump 头部的 `@version`，并在 `CHANGELOG.md` 添加对应条目；
2. 运行：

   ```bash
   ./scripts/publish.sh            # 可加提交说明：./scripts/publish.sh "fix: 修复xxx"
   ```

   脚本会自动完成：语法检查 → 校验版本号必须大于上一个 tag → 补全 CHANGELOG 日期 → 提交 → 打 tag → 推送 GitHub；
3. push 后几秒内 GitHub 触发 webhook，Sleazyfork 完成同步（**仅当 `@version` 比线上新时才发布新版本**）。若 Sleazyfork 几分钟内没更新，到 GitHub 仓库 **Settings → Webhooks → Sleazyfork 那条 → Recent Deliveries** 查看投递状态，失败点 **Redeliver** 重投即可。

先用 `./scripts/publish.sh --dry-run` 可以只检查不发布。

## 许可证

[MIT](./LICENSE)
