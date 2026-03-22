# 每周新增 week_0n.txt 后要怎么做（GitHub Pages）

你用的是**纯前端 + GitHub Pages**，题目来自 **`docs` 里的 `周末检测`**（由构建从 `frontend/public/周末检测` 复制过去）。每加一周，按下面做即可。

---

## 一、准备题目文件（3 个地方建议保持一致）

1. **根目录**（可选，方便本地用后端或留底）：  
   `周末检测/week_04.txt`（把 `04` 换成当周编号）

2. **给网页用（必做）**：  
   把同一份内容复制到：  
   **`frontend/public/周末检测/week_04.txt`**

3. **登记周次（必做）**：  
   打开 **`frontend/public/周末检测/manifest.json`**，在 `weeks` 里加上 `"04"`，例如：
   ```json
   { "weeks": ["02", "03", "04"] }
   ```
   （编号要和文件名一致：`week_04.txt` → `"04"`）

---

## 二、重新构建

在 **`frontend`** 目录执行（**base 路径**已写在 **`frontend/.env.github`**，一般不用再设环境变量）：

```powershell
cd frontend
npm run build:pages:standalone
```

**或** 双击 **`一键构建-GitHub-Pages.bat`**。

若仓库名**不是** `H------`，请编辑 **`frontend/.env.github`**，把 `VITE_BASE_PATH=/H------/` 改成你的仓库名。

构建完成后，根目录下的 **`docs`** 会更新（含新的 `周末检测/week_04.txt` 和新的 `manifest.json`）。

---

## 三、提交并推送到 GitHub

在项目根目录 `H数学周末检测`：

```bash
git add docs frontend/public/周末检测 周末检测
git commit -m "第4周题目 week_04"
git push origin main
```

（`周末检测` 可加可不加，看你愿不愿意把根目录题目也备份到仓库。）

---

## 四、等 1～2 分钟再打开网站

打开：**https://sen-illion.github.io/H------/**（换成你的链接）  
建议 **Ctrl+Shift+R** 或无痕窗口，避免缓存。

---

## 小结（每次只做这 4 步）

| 步骤 | 做什么 |
|------|--------|
| 1 | 写好 `week_0n.txt`，放到 **`frontend/public/周末检测/`** |
| 2 | 改 **`manifest.json`** 的 `weeks`，加上 `"0n"` |
| 3 | 执行 **`npm run build:pages:standalone`**（仓库名在 **`.env.github`** 里改一次即可） |
| 4 | **`git add docs` +（可选）`frontend/public/周末检测`** → **`commit`** → **`push`** |

---

## 若你有时用本地后端（npm start）

后端读的是根目录 **`周末检测/week_0n.txt`**，只要把新文件放在 **`周末检测/`** 即可，**不必**为了本地做题再构建；只有要**更新 GitHub 网页**时，才需要做上面「复制到 public + manifest + 构建 + push」。
