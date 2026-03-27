# 自动会员系统部署说明

## 架构说明

现在已经实现了完整的自动流程：

```
用户访问网站 → 选择套餐 → 输入邮箱 → 创建订单 → 扫码付款 → 自动获取Token → 配置环境变量 → 使用会员技能
```

全程**不需要人工干预**，自动完成。

## 后端服务部署（需要一台服务器）

### 1. 购买服务器
- 推荐火山引擎云服务器，起步配置 1核2G 足够
- 开放 3000 端口（或者用 Nginx 反向代理）

### 2. 部署步骤

```bash
# 克隆代码
git clone https://github.com/Sxyman/skill-hub-website.git
cd skill-hub-website

# 安装依赖
npm install

# 启动服务
npm start

# 使用 pm2 保持后台运行
npm install -g pm2
pm2 start server.js --name skillhub
pm2 save
pm2 startup
```

### 3. 配置域名（可选但推荐）

使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 修改前端 API 地址

在 `index.html` 中修改：

```javascript
const API_BASE = 'https://your-domain.com'; // 改成你的服务器域名
```

### 5. 配置微信支付

你需要申请微信支付商户号，然后配置 Webhook 回调地址：

```
https://your-domain.com/api/wxpay-callback
```

如果暂时没有微信支付，可以用手动确认方式：
- 用户付款后，用户点击查询，你手动在 `data/members.json` 添加 token

## 会员技能鉴权方式

在你的每个会员技能中，引入 `examples/member-skill-auth.js`，然后：

```javascript
const { verifyMemberShip } = require('./member-skill-auth.js');

async function main() {
  const auth = await verifyMemberShip();
  if (!auth.valid) {
    console.log(auth.message);
    console.log('请访问 https://your-website 获取订阅');
    return;
  }
  // 技能逻辑...
}
```

这样，没有 token 或者 token 过期的用户无法使用，有效防止倒卖。

## 完整工作流程

1. ✅ 用户打开网站 → 看到技能列表
2. ✅ 点击会员技能 → 提示需要订阅 → 打开订阅弹窗
3. ✅ 用户输入邮箱选择套餐 → 创建订单
4. ✅ 显示付款二维码 → 用户扫码付款
5. ✅ 微信支付回调 → 自动将 token 添加到会员列表
6. ✅ 用户查询订单状态 → 支付成功自动显示 token
7. ✅ 用户复制 token → 配置到环境变量 `SKILLHUB_TOKEN`
8. ✅ 会员技能运行时自动验证 token → 通过就能使用

全程自动化，不需要你手动处理！
