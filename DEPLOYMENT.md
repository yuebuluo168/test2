# 众包配送平台 - 生产环境部署手册 (小白友好版)

## 1. 源代码准备
1. 点击网页右上角下载 Zip 包。
2. 解压后，建议上传至你的个人 GitHub 私有仓库。

## 2. 后端服务器部署 (API & 数据库)
我们推荐使用 **Railway.app**，因为它不需要你懂 Linux 命令：
1. 登录 [Railway.app](https://railway.app/)，关联你的 GitHub。
2. 选择本项目仓库，Railway 会自动识别 `server.ts` 并开始构建。
3. **环境变量配置**：在 Railway 后台设置 `NODE_ENV = production`。
4. **数据库**：本项目目前使用 SQLite (`platform.db`)。Railway 会自动持久化这个文件。
   * *进阶建议*：用户量超过 5000 后，请在 Railway 开启 PostgreSQL 服务，并修改 `server.ts` 的连接字符串。

## 3. 安卓 App 编译
1. 下载并安装 **Android Studio**。
2. 选择 "Open Project"，选中本项目的 `/android` 文件夹。
3. 插入安卓手机，点击顶部的绿色“运行”按钮，App 就会安装到你手机上。
4. **高德地图配置**：在 `AndroidManifest.xml` 中填入你在高德后台申请的 Key。

## 4. 出现 Bug 怎么办？
1. **查看日志**：在 Railway 的 "Logs" 面板可以看到所有运行报错。
2. **AI 修复**：将报错信息复制，开启一个新的 AI 对话窗口，发送给 AI 即可获得修复方案。
3. **联系我**：你可以随时回到 AI Studio，上传你的最新代码，我会继续为你迭代。

## 5. 核心技术栈与安全
- **后端**: Node.js + Express + SQLite (可升至 PostgreSQL)
- **安全防护**:
    - **bcryptjs**: 工业级密码哈希加密，数据库不存储明文。
    - **helmet**: 自动配置安全 HTTP 响应头。
    - **express-rate-limit**: 防止暴力破解登录接口。
    - **zod**: 严格的输入数据验证，防止恶意构造请求。
    - **参数化查询**: 彻底杜绝 SQL 注入攻击。
- **前端**: Kotlin + Jetpack Compose (纯原生安卓)
- **实时通信**: Socket.io
