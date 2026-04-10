#!/bin/bash

# ========================================
# 历史书籍智能研究系统 - GitHub 推送脚本
# ========================================

echo "📦 正在推送到 GitHub..."

# 1. 确保 git 配置正确
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 2. 重命名分支为 main（可选）
git branch -M main

# 3. 提示用户输入 GitHub 用户名
read -p "请输入你的 GitHub 用户名: " USERNAME

# 4. 设置远程仓库（请先在 GitHub 上创建仓库 history-brain）
REPO_URL="https://github.com/${USERNAME}/history-brain.git"

echo ""
echo "🔗 远程仓库地址: $REPO_URL"
echo ""
echo "⚠️  请确保你已经在 GitHub 上创建了名为 'history-brain' 的仓库"
echo "   创建地址: https://github.com/new"
echo ""
read -p "已创建好仓库？按回车继续..."

# 5. 添加远程仓库
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# 6. 推送代码
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo ""
echo "🌐 你的项目地址: https://github.com/${USERNAME}/history-brain"
