# 历史书籍智能研究系统 📚🧠

一个由AI驱动的历史书籍研究网站，能够深入阅读历史书籍，提炼多维度历史规律，并可视化展示书籍间的印证与冲突关系。

## 功能特性

| 功能 | 描述 |
|-----|------|
| 📖 书籍管理 | 支持PDF/TXT/MD文件上传和文本粘贴 |
| 🧠 AI分析 | 多维度规律提炼（技术/人口/地区/文化/经济/社会） |
| 💾 持久记忆 | SQLite数据库存储，知识持续积累 |
| 🕸️ 关系网络 | D3.js力导向图展示印证/冲突关系 |
| ⚙️ 多AI支持 | OpenAI/Claude/DeepSeek自定义配置 |

## 本地运行

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm

### 安装步骤

```bash
# 1. 进入项目目录
cd /workspace/history-brain

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
npx prisma generate
npx prisma db push

# 4. 启动开发服务器
pnpm dev
```

### 访问地址

- 主页（书籍管理）: http://localhost:3000
- 关系网络: http://localhost:3000/network
- 设置（API配置）: http://localhost:3000/settings

## 使用指南

### 1. 配置AI服务

访问 `/settings` 页面，选择AI服务商并输入API Key：

- **OpenAI**: 需要 OpenAI API Key
- **Claude**: 需要 Anthropic API Key
- **DeepSeek**: 需要 DeepSeek API Key
- **自定义**: 支持任何OpenAI兼容API

### 2. 添加书籍

- 上传PDF、TXT、MD文件
- 或直接粘贴文本内容
- 填写书籍元数据（书名、作者、出版社等）

### 3. 开始研究

点击"开始研究"按钮，AI会：
1. 深入分析书籍内容
2. 提炼历史规律
3. 自动分类归档
4. 检测与其他书籍的关系

### 4. 查看规律

- 按类别筛选规律
- 查看证据来源和置信度
- 了解涉及的历史时期和地区

### 5. 关系网络

在 `/network` 页面：
- 可视化查看书籍间的关系
- 绿色连线 = 印证
- 红色虚线 = 冲突
- 蓝色连线 = 补充

## 项目结构

```
/workspace/history-brain/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── network/page.tsx  # 关系网络
│   │   ├── settings/page.tsx # API配置
│   │   └── api/              # 后端API
│   ├── components/           # React组件
│   ├── lib/
│   │   ├── ai/              # AI服务适配器
│   │   ├── db/              # 数据库客户端
│   │   └── parser/          # 文件解析器
│   └── types/               # TypeScript类型
├── prisma/
│   └── schema.prisma        # 数据库Schema
└── package.json
```

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **可视化**: D3.js 力导向图
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **AI**: 支持 OpenAI / Claude / DeepSeek 等

## API配置示例

### OpenAI
```
Provider: openai
API Key: sk-xxxxxxxx
Base URL: https://api.openai.com/v1
Model: gpt-4-turbo-preview
```

### Claude
```
Provider: claude
API Key: sk-ant-xxxxxxxx
Base URL: https://api.anthropic.com/v1
Model: claude-3-opus-20240229
```

### DeepSeek
```
Provider: deepseek
API Key: sk-xxxxxxxx
Base URL: https://api.deepseek.com/v1
Model: deepseek-chat
```

## 开发命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start

# 数据库迁移
npx prisma migrate dev

# 查看数据库
npx prisma studio
```

## License

MIT
