# 已上传到 GitHub 后，用 GitHub Pages 的完整步骤

你当前是「从 main 分支的根目录」部署，但根目录是**源码**，不是构建后的网页，所以会 404。按下面做即可。

---

## 方案选择

- **只想用 GitHub Pages 一个链接、不要后端**：用下面的「纯前端（无后端）部署」，题目从仓库里的静态文件读，提交存在各自浏览器里，老师通过「导出/导入」查看弟弟的作答。
- **要后端、要服务器存提交**：用下面的「第一步」起，按「有后端」的方式构建并单独部署后端。

---

## 纯前端（无后端）部署 — 一个链接搞定

特点：**只有前端**，无 Node 后端；题目在仓库里，提交存在**浏览器 localStorage**；弟弟做完可「导出提交记录」发给你，你在老师入口「导入」即可查看。任何设备打开同一 GitHub Pages 链接都能做题。

### 1. 题目文件放到前端里

- 把项目根目录的 **「周末检测」** 文件夹里的 `week_xx.txt` **复制到** `frontend/public/周末检测/` 下（没有就新建）。
- 编辑 **`frontend/public/周末检测/manifest.json`**，把周次写进去，例如：`{"weeks": ["01", "02"]}`（和你的 `week_01.txt`、`week_02.txt` 对应）。

### 2. 本地构建（纯前端模式）

```bash
cd frontend
set VITE_BASE_PATH=/仓库名/
npm run build:pages:standalone
```

把 **仓库名** 换成你 GitHub 仓库名（如 `H----`）。Mac/Linux 用：`export VITE_BASE_PATH=/仓库名/`。

### 3. 推送并设置 Pages

- 把生成的 **`docs`** 文件夹提交并推送（见下文「第三步」「第四步」）。
- GitHub Pages 来源选 **main**、**/docs**，保存。

访问 **`https://你的用户名.github.io/仓库名/`** 即可：选周次 → 做题 → 提交（存本机）→ 结果页看对错与解析；老师入口可导出/导入提交记录。

### 4. 老师如何看弟弟的作答

- 弟弟做完后，在**同一浏览器**打开老师入口，点「导出全部提交记录」，会下载一个 JSON 文件，发给你。
- 你在自己电脑打开该链接，进老师入口，点「导入提交记录」，选择弟弟发来的 JSON 文件，即可看到他的作答和图片。

---

## 第一步：确认仓库名（用来填 base）

GitHub 项目页的地址是：`https://github.com/Sen-illion/仓库名`  
**仓库名**就是 URL 里最后那一段（例如 `H----` 或 `math-weekend-quiz`）。  
部署成功后，访问地址是：**`https://sen-illion.github.io/仓库名/`**（注意最后有斜杠）。

后面步骤里的 **「仓库名」** 都换成你这个实际名字。

---

## 第二步：在本地构建并生成到 docs 文件夹

在项目根目录打开终端，依次执行：

```bash
cd frontend
```

然后**二选一**：

- **没有单独部署后端**（只做静态展示，接口会 404）：
  ```bash
  set VITE_BASE_PATH=/仓库名/
  npm run build:pages
  ```
  把上面的 `仓库名` 换成你第一步确认的名字（如 `H----`）。

- **后端已部署到别处**（例如 Render），要连真实接口：
  ```bash
  set VITE_API_BASE=https://你的后端地址.onrender.com
  set VITE_BASE_PATH=/仓库名/
  npm run build:pages
  ```

（Mac/Linux 把 `set` 改成 `export`，例如：`export VITE_BASE_PATH=/仓库名/`）

执行完后，项目根目录下会多出一个 **`docs`** 文件夹，里面是构建好的网页文件（如 `index.html`、`assets/` 等）。

---

## 第三步：把 docs 推送到 GitHub

```bash
cd ..
git add docs
git commit -m "docs: 添加 GitHub Pages 构建产物"
git push origin main
```

---

## 第四步：改 GitHub Pages 的「发布来源」

1. 打开仓库 → **Settings** → 左侧 **Pages**。
2. 在 **Build and deployment** 里：
   - **Source** 保持 **Deploy from a branch**。
   - **Branch** 选 **main**，右边文件夹从 **/(root)** 改成 **/docs**。
3. 点 **Save**。

等一两分钟，访问：**`https://sen-illion.github.io/仓库名/`**（把「仓库名」换成你的），就能打开页面。

---

## 重要说明：后端不会跑在 GitHub Pages 上

- **GitHub Pages 只能放静态前端**，不能跑 Node 后端。
- 若你**只做上面步骤、没有单独部署后端**：页面能打开，但「获取题目、提交答案、查看记录」等会报错或 404，因为接口没有地方跑。
- 若要让做题、提交、查看记录都正常，需要：
  1. 把**后端**部署到能跑 Node 的地方（如 [Render](https://render.com) 免费档）。
  2. 在**第二步**用带 `VITE_API_BASE=你的后端地址` 的那条命令重新构建，再执行第三、第四步推送并保存设置。

这样就是用 GitHub Pages 放前端，用别的服务跑后端，两者配合使用。
