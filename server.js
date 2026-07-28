/**
 * Iris 的工作台 - Node.js 后端服务
 * 数据存储在 JSON 文件中，支持云端同步
 * 适用于 Glitch / Render / Railway 等平台
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据存储路径
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '.data');
const DATA_FILE = path.join(DATA_DIR, 'iris-data.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 中间件
app.use(express.json({ limit: '50mb' }));  // 允许大 payload（含图片 base64）
app.use(express.static(path.join(__dirname, 'public')));

// 加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('加载数据失败:', e);
  }
  return { books: [], research: [], shopping: [], todo: [], murmur: [] };
}

// 保存数据
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('保存数据失败:', e);
  }
}

// API: 获取数据
app.get('/api/data', (req, res) => {
  const data = loadData();
  data.serverUpdatedAt = new Date().toISOString();
  res.json(data);
});

// API: 保存数据
app.post('/api/data', (req, res) => {
  const { books, research, shopping, todo, murmur } = req.body;
  const data = {
    books: books || [],
    research: research || [],
    shopping: shopping || [],
    todo: todo || [],
    murmur: murmur || []
  };
  saveData(data);
  res.json({ status: 'ok', serverUpdatedAt: new Date().toISOString() });
});

// API: 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 前端路由回退
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Iris 工作台运行在 http://0.0.0.0:${PORT}`);
});
