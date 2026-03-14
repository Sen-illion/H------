import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { listWeeks, getQuestions } from './parseQuestions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// 提交记录存放目录（你可以在本地查看所有上交的数据和图片）
const SUBMISSIONS_DIR = path.resolve(__dirname, '..', '提交记录');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { weekId, submitId } = req.body;
    const dir = path.join(SUBMISSIONS_DIR, `week_${weekId}`, submitId || 'unknown');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = (file.originalname || file.fieldname || 'image').replace(/[^\w\u4e00-\u9fa5.-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

// 静态：提交记录里的图片可供前端/老师查看
app.use('/submissions', express.static(SUBMISSIONS_DIR));

// 获取所有周次
app.get('/api/weeks', (req, res) => {
  try {
    const weeks = listWeeks();
    res.json(weeks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 获取某一周的题目（不含答案，仅前端展示用可再过滤）
app.get('/api/weeks/:weekId/questions', (req, res) => {
  try {
    const questions = getQuestions(req.params.weekId);
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 提交作答：先传 JSON（含 weekId, submitId, studentName, answers），问答题图片用 multipart
app.post('/api/submit', upload.array('images', 20), (req, res) => {
  try {
    const { weekId, submitId, studentName, answers } = req.body;
    const dir = path.join(SUBMISSIONS_DIR, `week_${weekId}`, submitId || 'unknown');
    fs.mkdirSync(dir, { recursive: true });

    const meta = {
      weekId,
      submitId: submitId || Date.now().toString(),
      studentName: studentName || '未留名',
      submittedAt: new Date().toISOString(),
      answers: typeof answers === 'string' ? JSON.parse(answers) : (answers || []),
      images: (req.files || []).map(f => ({
        field: f.fieldname,
        filename: f.filename,
        path: `/submissions/week_${weekId}/${submitId}/${f.filename}`
      }))
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
    res.json({ ok: true, submitId: meta.submitId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 老师端：列出某周所有提交
app.get('/api/submissions/:weekId', (req, res) => {
  try {
    const weekDir = path.join(SUBMISSIONS_DIR, `week_${req.params.weekId}`);
    if (!fs.existsSync(weekDir)) return res.json([]);
    const entries = fs.readdirSync(weekDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        const metaPath = path.join(weekDir, d.name, 'meta.json');
        if (!fs.existsSync(metaPath)) return null;
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const files = fs.readdirSync(path.join(weekDir, d.name)).filter(f => f !== 'meta.json');
        return { ...meta, files };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 老师端：列出所有周次及其提交数量
app.get('/api/submissions', (req, res) => {
  try {
    if (!fs.existsSync(SUBMISSIONS_DIR)) return res.json([]);
    const weeks = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(d => fs.statSync(path.join(SUBMISSIONS_DIR, d)).isDirectory() && d.startsWith('week_'))
      .map(d => {
        const weekId = d.replace('week_', '');
        const weekDir = path.join(SUBMISSIONS_DIR, d);
        const count = fs.readdirSync(weekDir, { withFileTypes: true }).filter(x => x.isDirectory()).length;
        return { weekId, count };
      })
      .sort((a, b) => Number(a.weekId) - Number(b.weekId));
    res.json(weeks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 部署时：同一台服务器提供前端页面（前端 build 到 backend/public）
const frontendDir = path.join(__dirname, 'public');
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/submissions')) {
      res.sendFile(path.join(frontendDir, 'index.html'));
    } else next();
  });
}

app.listen(PORT, () => {
  console.log(`后端运行在端口 ${PORT}`);
  console.log(`提交记录目录: ${SUBMISSIONS_DIR}`);
});
