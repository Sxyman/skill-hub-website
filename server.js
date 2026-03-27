/**
 * SkillHub 会员自动验证服务
 * 
 * 功能：
 * 1. 微信收款webhook回调
 * 2. 自动生成会员token
 * 3. 验证token有效性
 * 4. 查询会员信息
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'members.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 初始化数据文件
function initDataFile(file, defaultValue) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
  }
}
initDataFile(DATA_FILE, {});
initDataFile(ORDERS_FILE, {});

// 读取数据
function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return {};
  }
}

// 写入数据
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 生成随机token
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// 计算过期时间（30天）
function getExpireAt() {
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

/**
 * 验证token是否有效
 * GET /api/verify?token=xxx
 */
app.get('/api/verify', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.json({ valid: false, reason: 'No token provided' });
  }

  const members = readData(DATA_FILE);
  const member = members[token];

  if (!member) {
    return res.json({ valid: false, reason: 'Invalid token' });
  }

  if (member.expireAt < Date.now()) {
    return res.json({ valid: false, reason: 'Token expired' });
  }

  res.json({
    valid: true,
    expireAt: member.expireAt,
    createdAt: member.createdAt
  });
});

/**
 * 创建订单（用户点击订阅后创建）
 * POST /api/create-order
 * Body: { email: string, amount: number, days: number }
 */
app.post('/api/create-order', (req, res) => {
  const { email, amount = 19, days = 30 } = req.body;
  
  const orderId = crypto.randomBytes(8).toString('hex');
  const token = generateToken();
  const expireAt = Date.now() + days * 24 * 60 * 60 * 1000;

  const order = {
    orderId,
    token,
    email,
    amount,
    days,
    status: 'pending',
    createdAt: Date.now()
  };

  const orders = readData(ORDERS_FILE);
  orders[orderId] = order;
  writeData(ORDERS_FILE, orders);

  res.json({
    success: true,
    orderId,
    qrcodeUrl: `https://api.qrserver/v1/create-qr-code/?size=256x256&data=weixin://wxpay/bizpayurl?pr=${orderId}`,
    token: token // 对于测试，直接返回token
  });
});

/**
 * 微信支付回调（你需要配置微信支付Webhook到这里）
 * POST /api/wxpay-callback
 */
app.post('/api/wxpay-callback', (req, body) => {
  // 这里处理微信支付回调
  // 微信支付回调后，将token标记为已支付
  const { out_trade_no, transaction_id } = req.body;

  const orders = readData(ORDERS_FILE);
  const order = orders[out_trade_no];

  if (!order) {
    return res.json({ code: 404, message: 'Order not found' });
  }

  if (order.status === 'paid') {
    return res.json({ code: 200, message: 'Already paid' });
  }

  // 更新订单状态
  order.status = 'paid';
  order.paidAt = Date.now();
  order.transactionId = transaction_id;
  writeData(ORDERS_FILE, orders);

  // 添加到会员
  const members = readData(DATA_FILE);
  members[order.token] = {
    email: order.email,
    expireAt: getExpireAt(),
    createdAt: Date.now(),
    orderId: order.orderId
  };
  writeData(DATA_FILE, members);

  res.json({ code: 0, message: 'ok' });
});

/**
 * 查询订单状态
 * GET /api/order-status?orderId=xxx
 */
app.get('/api/order-status', (req, res) => {
  const { orderId } = req.query;
  const orders = readData(ORDERS_FILE);
  const order = orders[orderId];

  if (!order) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    status: order.status,
    token: order.status === 'paid' ? order.token : null,
    expireAt: order.status === 'paid' ? getExpireAt() : null
  });
});

/**
 * 获取公开的价格信息
 */
app.get('/api/info', (req, res) => {
  res.json({
    prices: [
      { name: '月卡', price: 19, days: 30 },
      { name: '年卡', price: 99, days: 365 }
    ]
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SkillHub member API server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Verify: http://localhost:${PORT}/api/verify?token=xxx`);
  });
}

module.exports = app;
