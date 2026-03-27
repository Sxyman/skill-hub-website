# SkillHub - 会员制技能仓库

这是一个可直接使用的会员制 SkillHub 网站最小可行原型，支持 OpenClaw 自动发现。

## 📁 项目结构

```
skill-hub-website/
├── data/               # 技能元数据（每个技能一个 JSON 文件）
│   ├── web-search.json
│   ├── smart-ocr.json
│   ├── image-generate.json
│   └── feishu-batch-ops.json
├── scripts/
│   └── build-index.js # 构建 index.json 索引
├── public/             # 静态网站输出（部署这里）
│   ├── index.html      # 网站首页
│   └── index.json      # OpenClaw 可自动发现的索引
├── docs/
│   └── auth.md         # 会员鉴权方案说明
└── package.json
```

## 🚀 本地开发

```bash
npm install
npm run build   # 重新构建索引
npm run dev     # 本地启动预览（http://localhost:8000/public）
```

## 📝 添加新技能

1. 在 `data/` 目录创建 `skill-name.json`
2. 填写技能元数据：
   ```json
   {
     "name": "skill-name",
     "description": "技能描述",
     "author": "你的名字",
     "version": "1.0.0",
     "category": "分类",
     "tier": "free|premium",  // free=免费，premium=会员专享
     "tags": ["标签1", "标签2"],
     "repository": "Git 仓库地址",
     "homepage": "网站地址",
     "license": "Apache-2.0|proprietary",
     "createdAt": "ISO 日期"
   }
   ```
3. 运行 `npm run build` 重新生成索引
4. 部署到你的服务器

## 🌐 部署

你可以部署到任何静态网站托管服务：

- **Vercel**: 直接拖入，自动部署
- **Cloudflare Pages**: 连接仓库，自动部署
- **自己的服务器**: 把 `public/` 目录放到 Nginx 根目录
- **GitHub Pages**: 部署 `public/` 分支

## 🔍 OpenClaw 自动发现

用户添加你的源：

```bash
npx skills source add https://your-domain.com/index.json
```

添加后用户在 OpenClaw 中搜索就能自动发现你的技能了。

## 💰 收费会员准备清单

- [ ] 准备收款码（微信/支付宝/Stripe）
- [ ] 在 `index.html` 中替换二维码图片
- [ ] 决定每个技能的免费/会员分层
- [ ] 选择鉴权方案（参考 `docs/auth.md`）
- [ ] 确定会员价格（推荐：月卡 ¥19，年卡 ¥99）

## 🛡️ 防止倒卖建议

1. 核心技能使用**后端 API 鉴权**（每次调用验证 token）
2. 新技能先对会员开放，延迟公开
3. 为会员提供答疑服务，这是倒卖者给不了的
4. 价格适中，大部分用户会直接订阅懒得折腾

## 📈 增长建议

1. 先收集 10-20 个优质技能再推广
2. 免费技能用来引流，会员技能赚钱
3. 持续更新，保持会员续费动力
4. 接受会员定制技能，额外收费
