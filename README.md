# 意大利语短文背词 PWA

这是一个本地优先的 PWA 应用，用于意大利语单词复习、艾宾浩斯间隔复习、三按钮记忆筛选，以及每日短文背诵。

## 文件说明

- `index.html`：主应用页面
- `manifest.webmanifest`：PWA 应用清单
- `sw.js`：离线缓存 Service Worker
- `icons/`：应用图标

## 本地测试

PWA 的离线缓存和安装能力不能直接通过 `file://` 完整启用，需要通过本地服务器或 HTTPS 访问。

在电脑上可以这样测试：

```bash
cd italian_vocab_app
python3 -m http.server 8080
```

然后用浏览器打开：

```text
http://localhost:8080
```

## 手机上像 App 一样使用

### 最推荐方式

把整个文件夹上传到一个 HTTPS 静态网站空间，例如 Netlify、Vercel、GitHub Pages、Cloudflare Pages 或自己的服务器。然后用手机浏览器打开网址。

### iPhone

1. 用 Safari 打开 HTTPS 网址
2. 点击底部分享按钮
3. 选择“添加到主屏幕”
4. 从桌面图标打开

### Android

1. 用 Chrome 打开 HTTPS 网址
2. 点击浏览器菜单
3. 选择“安装应用”或“添加到主屏幕”
4. 从桌面图标打开

## 数据保存

学习记录保存在当前浏览器本地 `localStorage`。安装成 PWA 后，仍然保存在当前设备本地。换设备前请在应用内导出备份。
