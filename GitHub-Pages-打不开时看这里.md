# 为什么 https://sen-illion.github.io/H------/ 还是打不开？

你本地的 **docs** 已经构建正确（里面有 index.html、assets、周末检测）。  
若线上仍打不开，按下面逐项检查。

---

## 1. 确认 GitHub 上真的有 docs 里的文件

在浏览器打开：

**https://github.com/Sen-illion/H------/tree/main**

（把 `H------` 换成你仓库的真实名字，注意横线数量要和地址栏里一致）

- 看看有没有 **docs** 这个文件夹。
- 点进 **docs**，确认里面有 **index.html** 和 **assets** 文件夹。

如果 **没有 docs** 或 **docs 是空的**：说明构建产物没推上去。在项目里执行：

```bash
git add docs
git status
```

确认 `docs/index.html`、`docs/assets/...` 被列入 “Changes to be committed”，然后：

```bash
git commit -m "添加 GitHub Pages 构建产物"
git push origin main
```

再等 1～2 分钟，重新打开 **https://sen-illion.github.io/H------/**。

---

## 2. 确认 Pages 发布的是 /docs

- 打开：**https://github.com/Sen-illion/H------/settings/pages**
- **Source**：Deploy from a branch  
- **Branch**：main  
- **Folder**：必须是 **/docs**（不能是 / (root)）  
- 点 **Save**，等一两分钟再访问站点。

---

## 3. 排除浏览器缓存

- **强制刷新**：`Ctrl + Shift + R`（Mac：`Cmd + Shift + R`）  
- 或用 **无痕/隐私模式** 打开：**https://sen-illion.github.io/H------/**

---

## 4. 看具体报错（页面空白时）

1. 打开 **https://sen-illion.github.io/H------/**
2. 按 **F12** 打开开发者工具，切到 **Console（控制台）**
3. 看有没有**红色报错**，尤其是 404：

- 若是 **404** 且地址里带 **assets/xxx.js** 或 **周末检测**：  
  多半是 **仓库名和构建时的 base 不一致**。  
  你本机构建用的是 **base: /H------/**，所以仓库名必须和这个一致（包括横线数量）。  
  若你仓库实际是别的名字（例如 `H数学周末检测`），需要按**真实仓库名**重新构建：

  ```bash
  cd frontend
  set VITE_BASE_PATH=/你的真实仓库名/
  npm run build:pages:standalone
  cd ..
  git add docs
  git commit -m "按仓库名重新构建"
  git push origin main
  ```

- 若是 **CORS、Failed to load** 等：把完整报错内容记下来，再按报错查或发给别人看。

---

## 5. 再确认一次本地构建并推送

在项目根目录执行（仓库名按你真实情况改，例如 `H------`）：

```bash
cd frontend
npm install
set VITE_BASE_PATH=/H------/
npm run build:pages:standalone
cd ..
dir docs
```

确认有 **docs\index.html**、**docs\assets**、**docs\周末检测**，然后：

```bash
git add docs
git commit -m "更新 GitHub Pages 构建"
git push origin main
```

等 1～2 分钟后，用无痕窗口打开：**https://sen-illion.github.io/H------/**。

---

## 总结

| 现象 | 优先检查 |
|------|----------|
| 404 或完全打不开 | GitHub 上 main 分支有没有 **docs** 文件夹，里面有没有 **index.html**；Pages 是否选了 **/docs** |
| 页面空白、有标题 | F12 → Console 看是否 404 assets 或 周末检测；仓库名是否和构建时的 **VITE_BASE_PATH** 一致 |
| 之前能开现在不能 | 强制刷新或无痕；确认最近一次 push 包含 **docs** |

按上面顺序做完，再把「具体哪一步和结果」（例如：第 1 步有没有 docs、Console 里第一条红色报错是什么）记下来，方便继续排查。
