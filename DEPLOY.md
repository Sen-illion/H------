# 让弟弟在自己设备上打开链接使用

要做到**弟弟在自己的手机/电脑上打开链接就能做题**，并且**你可以在自己设备上查看提交记录**，可以用下面几种方式。

---

## 方式一：发布到 GitHub，用 Render 生成可直接玩的链接

**可以。** 把项目推到 GitHub 后，用 [Render](https://render.com) 连接仓库并部署，就会得到一个**直接能玩的链接**（如 `https://math-weekend-quiz.onrender.com`），弟弟和你用浏览器打开即可。

**关于费用**：Render 有**免费档（Free）**，选 Free 不会扣钱；有时会要求绑信用卡做验证，但免费使用不会扣费。若你不想绑卡或不想用 Render，可以用下面的「方式二」或「方式二-B」。

### 步骤

1. **把项目推到 GitHub**
   - 在 GitHub 新建一个仓库（如 `math-weekend-quiz`）。
   - 确保 **「周末检测」文件夹**（含 `week_01.txt`、`week_02.txt` 等）**一起提交**到仓库，不要放进 `.gitignore`，这样部署后才有题目。
   - 本地执行：
     ```bash
     git init
     git add .
     git commit -m "init"
     git remote add origin https://github.com/你的用户名/math-weekend-quiz.git
     git push -u origin main
     ```

2. **用 Render 从 GitHub 部署**
   - 打开 [https://render.com](https://render.com)，注册/登录（可用 GitHub 登录）。
   - 点击 **New → Web Service**。
   - **Connect a repository** 选你刚推送的仓库。
   - Render 会读取仓库里的 `render.yaml`，一般会自动填好：
     - **Build Command**：`npm run build`
     - **Start Command**：`npm start`
   - 若没有自动识别，就手动填上面两条；**Root Directory** 留空。
   - 选 **Free** 计划，点 **Create Web Service**。

3. **等构建完成**
   - 构建可能要几分钟（会装依赖并打包前端）。
   - 完成后在服务页面会看到 **Your service is live at** 下面有一个链接，例如：  
     `https://math-weekend-quiz-xxxx.onrender.com`

4. **用这个链接**
   - 把这个链接发给弟弟，他在自己手机/电脑浏览器打开就能做题。
   - 你在自己设备打开同一链接，点「老师入口：查看提交记录」即可查看作答和图片。

### 注意（免费版）

- **提交记录**：Render 免费版重启或重新部署后，服务器上的文件可能会清空，**提交记录不一定长期保留**。若需要长期保存，可升级 Render 的持久化磁盘，或以后把提交存到数据库/云存储。
- **题目**：题目来自仓库里的「周末检测」文件夹，更新题目后改 `week_xx.txt` 并推送到 GitHub，再在 Render 里点 **Manual Deploy** 重新部署即可。

---

## 方式二：完全免费、不用绑卡 —— 同一 WiFi 或 ngrok 临时链接

### 方式二-A：同一 WiFi（零成本）

- 你和你弟弟在**同一 WiFi**（比如家里）。
- 你的电脑上**先运行好**后端和前端（见 README）。
- 在你电脑上查一下本机 IP：
  - Windows：打开 CMD 输入 `ipconfig`，看「IPv4 地址」如 `192.168.1.100`
  - Mac：系统设置 → 网络里能看到
- 弟弟在他自己的手机或电脑浏览器里打开：**`http://你的IP:5173`**（例如 `http://192.168.1.100:5173`）

**限制**：你的电脑必须一直开着并运行着前后端；弟弟必须和你在同一 WiFi。适合临时用一下。

### 方式二-B：ngrok 临时公网链接（弟弟不在家也能打开，仍不花钱）

- 你电脑照常跑后端（`cd backend && npm start`）和前端（`cd frontend && npm run dev`）。
- 到 [ngrok](https://ngrok.com) 免费注册并下载 ngrok，在终端执行：
  ```bash
  ngrok http 5173
  ```
  会显示一行 **Forwarding** 的地址，如 `https://xxxx.ngrok-free.app`，这就是临时公网链接。
- 把这条链接发给弟弟，他在外面用手机/电脑打开即可做题（前端会通过 Vite 代理访问你本机的后端，所以只暴露 5173 即可）。
- **注意**：关掉 ngrok 或重启后链接会变；免费版不扣钱、不强制绑卡。

---

## 方式三：用 GitHub Pages 展示前端（需先构建再上传）

**核心原因**：项目是 Vite 构建的，GitHub Pages 不会帮你跑 `npm run build`，只能托管**已经构建好的**静态文件。直接推源码上去会 404。

### 必须做的两步

1. **在本地先构建出静态产物**
   - 若页面要部署在 **`https://用户名.github.io/仓库名/`** 或 **`/frontend/`** 这类子路径下，需要指定 base（否则资源路径错）：
     ```bash
     cd frontend
     # 部署在 /frontend/ 时：
     set VITE_BASE_PATH=/frontend/
     npm run build
     ```
     （Mac/Linux 用 `export VITE_BASE_PATH=/frontend/`）
   - 若部署在仓库根（如 `xxx.github.io` 根目录），可省略 base，直接 `npm run build`。
   - 构建完成后，**产物在 `frontend/dist` 目录**（一堆 HTML/CSS/JS），不是 `src` 或 `node_modules`。

2. **把构建产物推上去**
   - 把 **`frontend/dist` 里的所有文件**（不是 dist 文件夹本身）复制到你在 GitHub Pages 里配置的目录（例如仓库的 `frontend` 目录、或 `docs`、或 `gh-pages` 分支的根目录）。
   - 提交并推送，等 GitHub Pages 更新后，用你配置的地址访问（如 `https://sen-illion.github.io/frontend/`）。

### 重要：本项目有后端，GitHub Pages 只能放前端

- **GitHub Pages 只支持静态网页**，不能跑 Node.js，所以**不能**把整站（前端+后端）都放在 GitHub Pages。
- 若你**只**把前端部署在 GitHub Pages，那么：
  - **后端必须单独部署**在能跑 Node 的地方（如 Render），否则前端的 `/api` 请求会发到 github.io，得到 404。
  - 构建前端时要**指定后端地址**，让前端去请求你的后端而不是同源：
    ```bash
    cd frontend
    set VITE_API_BASE=https://你的后端地址.onrender.com
    set VITE_BASE_PATH=/frontend/
    npm run build
    ```
    再把 `dist` 里的内容上传到 GitHub 对应目录。

- 若希望**一个链接就搞定**（前端+后端一起），建议用 **方式一（Render 整站部署）**，不必用 GitHub Pages。

---

## 方式四：部署到公网（自己的云服务器）

把项目放到**一台 24 小时在线的服务器**上（如腾讯云、阿里云），得到一个**公网链接**（如 `https://你的域名.com` 或 `https://xxx.vercel.app`）。这样：

- **弟弟**：在自己设备浏览器打开这个链接 → 做题、提交（包括拍照）。
- **你**：在自己设备打开**同一个链接** → 点「老师入口：查看提交记录」→ 查看所有作答和图片。

数据都在服务器上，不依赖你本机是否开机。

### 推荐做法：一台云服务器跑前后端（一个链接搞定）

用**一台云服务器**（如腾讯云、阿里云、或国外 VPS），在同一台机器上同时跑后端和前端，只暴露一个端口，最简单。

#### 1. 准备一台服务器

- 买一台最低配的云主机即可（约几十块/月，或用学生机/免费试用）。
- 系统选 **Ubuntu 22.04** 或 **CentOS**。
- 记下服务器的**公网 IP**（和 SSH 密码/密钥）。

#### 2. 把项目放到服务器上

- 用 Git 克隆到服务器，或本地上传整个项目到服务器（如用 scp、FTP、宝塔等）。
- 确保服务器上有 **Node.js**（建议 v18+）。  
  安装示例（Ubuntu）：
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  ```

#### 3. 在服务器上构建前端并放到后端里

在项目目录下执行（在**你电脑**上或**服务器**上都可以，只要最后服务器上有这些文件）：

```bash
# 进入前端目录
cd frontend
npm install
npm run build:server
```

这会把前端打包到 `backend/public`。这样**同一个后端**既提供 API，又提供网页，前端请求的 `/api` 和 `/submissions` 都是同源，不需要改环境变量。

#### 4. 上传题目文件到服务器

把你在本地的 **「周末检测」** 文件夹（里面有 `week_01.txt`、`week_02.txt` 等）**原样**上传到服务器上的项目根目录，和 `backend`、`frontend` 同级，例如：

```
项目根目录/
  backend/
  frontend/
  周末检测/        ← 这里放 week_01.txt, week_02.txt ...
```

服务器上的 **「提交记录」** 不需要你建，后端第一次收到提交时会自动创建。

#### 5. 在服务器上启动后端（长期运行）

在服务器上：

```bash
cd backend
npm install
node server.js
```

建议用 **pm2** 让进程一直在后台跑，断线也不关：

```bash
sudo npm install -g pm2
cd backend
pm2 start server.js --name math-quiz
pm2 save
pm2 startup   # 按提示做，开机自启
```

后端默认监听 **3001** 端口。

#### 6. 让外网能访问 3001 端口

- **云控制台**：在「安全组」里放行 **3001**（或你改成的端口）。
- 弟弟/你访问的地址就是：**`http://服务器公网IP:3001`**  
  例如：`http://123.45.67.89:3001`

把**这个链接**发给弟弟，他在自己手机或电脑浏览器打开即可做题。你在自己设备打开同一链接，点「老师入口」即可查看提交。

#### 7. 可选：用域名 + 80 端口

- 如果你有域名，把域名解析到这台服务器 IP。
- 在服务器上用 **Nginx** 把 80 端口的请求转到 3001，并可选地配置 HTTPS（如用 Let’s Encrypt）。  
  这样弟弟就可以用 `https://你的域名.com` 访问，更稳定、更好记。

---

## 小结

| 方式       | 弟弟怎么用           | 你在哪看提交           | 适用场景         |
|------------|----------------------|------------------------|------------------|
| 同一 WiFi  | 浏览器打开 `http://你的IP:5173` | 本机或同 WiFi 设备     | 临时、家里       |
| 公网部署   | 浏览器打开一个固定链接（如 `http://服务器IP:3001`） | 任意设备打开同一链接 → 老师入口 | 长期、弟弟随时用 |

**要实现「弟弟在自己设备上自己查看、做题」**，本质就是：**让他能通过一个链接访问你的前端页面**。  
- 不部署：链接 = 你电脑的 IP + 端口（同一 WiFi）。  
- 部署：链接 = 服务器的公网地址（或域名），弟弟和你都可以在任何地方、任何设备打开。

如果你告诉我：是用同一 WiFi 还是打算用云服务器（以及有没有域名），我可以按你的情况写一份更简化的「一步一步」操作清单（只保留你需要的部分）。
