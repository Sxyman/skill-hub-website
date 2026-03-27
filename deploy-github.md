# 部署到 GitHub Pages 步骤

## 步骤 1：在 GitHub 创建新仓库

1. 登录 GitHub，点击 "New repository"
2. 仓库名称：`skillhub`（或者你喜欢的名字）
3. 选择 Public（公开）
4. 不要勾选 README / .gitignore / license
5. 点击 "Create repository"

## 步骤 2：把文件推送到 GitHub

在你的本地终端执行（把 `YOUR_GITHUB` 换成你的 GitHub 用户名）：

```bash
# 进入项目目录
cd ~/.openclaw/workspace/skill-hub-website

# 初始化 git
git init

# 添加所有 public 目录文件到根目录
cp -r public/* .

# 添加文件
git add index.html
git add index.json

# 提交
git commit -m "Initial commit: SkillHub website"

# 连接到 GitHub（替换 YOUR_GITHUB 为你的用户名）
git remote add origin https://github.com/YOUR_GITHUB/skillhub.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

## 步骤 3：开启 GitHub Pages

1. 在 GitHub 打开你的仓库
2. 点击 "Settings" → "Pages"
3. "Source" 选择：`Deploy from a branch`
4. "Branch" 选择：`main`，根目录 `/root`
5. 点击 "Save"

## 步骤 4：获取你的域名

GitHub Pages 会自动给你域名：
```
https://YOUR_GITHUB.github.io/skillhub/
```

所以你的 index.json 地址就是：
```
https://YOUR_GITHUB.github.io/skillhub/index.json
```

## 步骤 5：更新 index.html 中的域名

把 `YOUR_DOMAIN/path/index.json` 替换成你的实际地址：
```
https://YOUR_GITHUB.github.io/skillhub/index.json
```

修改完后重新提交推送：

```bash
git add index.html
git commit -m "Update domain"
git push
```

## 完成！

现在用户就可以添加你的源了：
```bash
npx skills source add https://YOUR_GITHUB.github.io/skillhub/index.json
```

用户搜索的时候，OpenClaw 会自动从这里发现你的技能。
