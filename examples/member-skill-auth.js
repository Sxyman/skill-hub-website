/**
 * 会员专享技能 - Token 验证示例
 * 
 * 将这个代码放到你的会员技能中，就能验证用户的会员token是否有效
 */

// 从环境变量获取用户配置的token
const USER_TOKEN = process.env.SKILLHUB_TOKEN;
// 你的API服务器地址
const API_BASE = 'https://your-server-domain.com';

/**
 * 验证会员权限
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function verifyMemberShip() {
  if (!USER_TOKEN) {
    return {
      valid: false,
      message: '未配置 SKILLHUB_TOKEN，请先订阅会员获取 Token'
    };
  }

  try {
    const response = await fetch(`${API_BASE}/api/verify?token=${USER_TOKEN}`);
    const result = await response.json();
    
    if (result.valid) {
      return {
        valid: true,
        message: '验证通过'
      };
    } else {
      return {
        valid: false,
        message: `Token 无效：${result.reason}，请检查订阅状态`
      };
    }
  } catch (e) {
    return {
      valid: false,
      message: '验证服务暂时不可用，请稍后重试'
    };
  }
}

// 使用示例：
// async function yourSkillMain() {
//   const auth = await verifyMemberShip();
//   if (!auth.valid) {
//     console.log(auth.message);
//     console.log('请访问 https://你的网站 订阅会员');
//     return;
//   }
//   // 继续执行技能逻辑...
// }

module.exports = { verifyMemberShip };
