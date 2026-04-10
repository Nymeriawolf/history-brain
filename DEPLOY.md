# 部署指南 🚀

## 方法一：推送到 GitHub（推荐）

### 步骤 1: 在 GitHub 创建仓库

1. 访问 [https://github.com/new](https://github.com/new)
2. 仓库名称填写: `history-brain`
3. 选择 **Public** 或 **Private**
4. **不要**勾选 "Add a README file"
5. 点击 **Create repository**

### 步骤 2: 在本地运行推送脚本

```bash
cd /workspace/history-brain
chmod +x push-to-github.sh
./push-to-github.sh
```

### 步骤 3: 或者手动推送

```bash
cd /workspace/history-brain

# 设置远程仓库
git remote add origin https://github.com/你的用户名/history-brain.git

# 推送代码
git push -u origin main
```

---

## 方法二：部署到 Vercel（一键部署）

### 前提条件
- 项目已推送到 GitHub

### 步骤

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **Add New Project**
4. 选择 `history-brain` 仓库
5. 点击 **Deploy**
6. 等待部署完成，获取访问链接

---

## 方法三：本地运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/history-brain.git
cd history-brain

# 安装依赖
pnpm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

---

## 使用指南

1. **配置 AI**: 访问 `/settings` 页面，配置你的 API Key
2. **添加书籍**: 上传 PDF/TXT 文件或粘贴文本
3. **开始研究**: 点击"开始研究"按钮
4. **查看规律**: 按类别查看提炼的历史规律
5. **关系网络**: 访问 `/network` 查看书籍间的关系

---

## 支持的 AI 服务商

| 服务商 | API 地址 | 获取 Key |
|--------|---------|----------|
| OpenAI | api.openai.com | [获取](https://platform.openai.com/api-keys) |
| Claude | api.anthropic.com | [获取](https://console.anthropic.com/) |
| DeepSeek | api.deepseek.com | [获取](https://platform.deepseek.com/) |

---

## 项目结构

```
history-brain/
├── src/app/           # 页面和API
├── prisma/            # 数据库配置
├── public/            # 静态资源
└── package.json       # 依赖配置
```
