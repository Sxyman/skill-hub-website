#!/usr/bin/node
const fs = require('fs');
const path = require('path');

// 技能数据目录
const dataDir = path.join(__dirname, '..', 'data');
const publicDir = path.join(__dirname, '..', 'public');

// 确保 public 目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 读取所有技能元数据
const skills = [];
const files = fs.readdirSync(dataDir);

for (const file of files) {
  if (file.endsWith('.json')) {
    const filePath = path.join(dataDir, file);
    try {
      const skill = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      // 添加下载地址信息
      if (skill.repository) {
        skill.downloadUrl = skill.repository;
      }
      skills.push(skill);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }
}

// 生成 index.json 符合 SkillHub 格式
const index = {
  version: 1,
  updatedAt: new Date().toISOString(),
  skills: skills,
  total: skills.length
};

// 写入 public 目录
const outputPath = path.join(publicDir, 'index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

console.log(`✅ Built index.json with ${skills.length} skills`);
console.log(`📄 Output: ${outputPath}`);
