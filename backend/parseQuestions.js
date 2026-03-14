/**
 * 解析 周末检测 文件夹下的题目文本文档
 * 格式约定：
 * - 第x题
 * - 题型：填空 | 选择 | 问答题（不写则默认为填空）
 * - 考察知识点：xxx
 * - 题干...
 * - 选择题时：A. xxx  B. xxx  C. xxx  D. xxx
 * - 答案：xxx（问答题可无）
 * - 解析：xxx
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = path.resolve(__dirname, '..', '周末检测');

function parseBlock(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  let type = '填空';
  let knowledge = '';
  let stem = '';
  let answer = '';
  let options = null; // { A: '', B: '', C: '', D: '' }
  let explanation = '';
  let i = 0;

  // 第一行通常是 "第x题"
  if (lines[0].match(/^第[一二三四五六七八九十\d]+题/)) i = 1;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('题型：')) {
      type = line.replace('题型：', '').trim();
      if (type === '问答题') type = '问答题';
      else if (type === '选择') type = '选择';
      else type = '填空';
      i++;
      continue;
    }
    if (line.startsWith('考察知识点：')) {
      knowledge = line.replace('考察知识点：', '').trim();
      i++;
      continue;
    }
    if (line.startsWith('答案：')) {
      answer = line.replace('答案：', '').trim();
      i++;
      continue;
    }
    if (line.startsWith('解析：')) {
      explanation = line.replace('解析：', '').trim();
      i++;
      while (i < lines.length && !lines[i].match(/^(第[一二三四五六七八九十\d]+题|题型：|考察知识点：|答案：|A\.|B\.|C\.|D\.)/)) {
        explanation += '\n' + lines[i];
        i++;
      }
      continue;
    }
    const optMatch = line.match(/^([A-D])[\.．]\s*(.+)$/);
    if (optMatch && (type === '选择' || options !== null)) {
      type = '选择';
      if (!options) options = { A: '', B: '', C: '', D: '' };
      options[optMatch[1]] = optMatch[2].trim();
      i++;
      continue;
    }
    // 题干：在 考察知识点 之后、答案/解析/选项 之前的内容
    if (knowledge && !answer && !line.startsWith('解析')) {
      stem = stem ? stem + '\n' + line : line;
      i++;
      continue;
    }
    i++;
  }

  return {
    type: type === '问答题' ? '问答题' : type === '选择' ? '选择' : '填空',
    knowledge,
    stem: stem.trim(),
    answer: answer.trim(),
    options: options || undefined,
    explanation: explanation.trim()
  };
}

/**
 * 按「第x题」分割整篇文档
 */
function parseFile(content) {
  const blocks = content.split(/(?=第[一二三四五六七八九十\d]+题)/).filter(Boolean);
  const questions = [];
  for (const block of blocks) {
    const q = parseBlock(block);
    if (q && q.stem) questions.push(q);
  }
  return questions;
}

/**
 * 获取所有周次（week_01.txt, week_02.txt ...）
 */
export function listWeeks() {
  if (!fs.existsSync(QUESTIONS_DIR)) return [];
  return fs.readdirSync(QUESTIONS_DIR)
    .filter(f => /^week_\d+\.txt$/i.test(f))
    .map(f => {
      const num = f.replace(/^week_(\d+)\.txt$/i, '$1');
      return { id: num, name: `第${parseInt(num, 10)}周`, file: f };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
}

/**
 * 获取某一周的题目列表
 */
export function getQuestions(weekId) {
  const file = path.join(QUESTIONS_DIR, `week_${String(weekId).padStart(2, '0')}.txt`);
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, 'utf-8');
  const list = parseFile(content);
  return list.map((q, index) => ({
    index: index + 1,
    ...q
  }));
}
