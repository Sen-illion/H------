# 修复「打开后 CSS/JS 报 404」

控制台里 `index-xxx.js`、`index-xxx.css` 报 404，说明 **GitHub 上的 docs 里没有这些文件**，或 **index.html 和 assets 不是同一轮构建**（对不上）。按下面做一次「删掉旧 docs → 重新构建 → 整份推送」。

---

## 第 1 步：删掉本地的 docs，重新构建

在项目根目录 `H数学周末检测` 下打开终端，**逐行**执行：

```bash
cd frontend
rd /s /q ..\docs
npm run build:pages:standalone
```

（如果提示没有 `docs` 可忽略；`rd /s /q` 是 Windows 删除文件夹。Mac/Linux 用：`rm -rf ../docs`）

然后**务必**设置 base 再构建一次（否则资源路径会错）：

```bash
set VITE_BASE_PATH=/H------/
npm run build:pages:standalone
```

（仓库名若不是 `H------`，把 `/H------/` 换成你真实的仓库名，例如 `/H数学周末检测/`）

---

## 第 2 步：确认 docs 里文件齐全

在项目根目录执行：

```bash
cd ..
dir docs
dir docs\assets
```

应能看到：
- `docs\index.html`
- `docs\assets\` 下有 **index-xxx.js** 和 **index-xxx.css**（文件名带一串字母数字）
- `docs\周末检测\` 下有 `manifest.json`、`week_02.txt` 等

---

## 第 3 步：整份 docs 加入 Git 并推送

```bash
git add docs
git status
```

在 `git status` 里确认出现：
- `docs/index.html`
- `docs/assets/index-xxx.js`
- `docs/assets/index-xxx.css`
- `docs/周末检测/...`

若没有 `docs/assets/` 下的文件，执行：

```bash
git add docs/
git add docs/assets/
git status
```

然后提交并推送：

```bash
git commit -m "重新构建并完整推送 docs 修复 404"
git push origin main
```

---

## 第 4 步：等 1～2 分钟再打开

打开：**https://sen-illion.github.io/H------/**  
建议用**无痕窗口**或 **Ctrl+Shift+R 强制刷新**，避免旧缓存。

---

## 若还是 404

在 GitHub 上检查：

1. 打开 **https://github.com/Sen-illion/H------/tree/main**
2. 点进 **docs** → 再点进 **assets**
3. 看里面是否有 **index-xxx.js** 和 **index-xxx.css**（名字要和 index.html 里的一致）

若 **assets 是空的** 或 **没有这两个文件**：说明 assets 没被 push 上去。再执行一次：

```bash
git add docs/
git add docs/assets/
git add docs/assets/*
git status
git commit -m "添加 docs 下全部资源"
git push origin main
```

（Mac/Linux 用 `git add docs/` 即可，一般会包含子目录。）

---

## 关于 favicon.ico 的 404

这是浏览器自动请求网站图标，不影响做题。修好 JS/CSS 后页面就能正常用；若想去掉这个 404，以后可以在 `frontend/public` 里放一个 `favicon.ico` 再重新构建。
