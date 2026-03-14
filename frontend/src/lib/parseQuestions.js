/**
 * 浏览器端解析题目文本文档（与后端格式一致）
 * 无 Node 依赖，用于纯前端 / GitHub Pages 模式
 */
function parseBlock(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  let type = '填空';
  let knowledge = '';
  let stem = '';
  let answer = '';
  let options = null;
  let explanation = '';
  let i = 0;

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
 * 解析整篇文档内容，返回题目列表（带 index）
 */
export function parseQuestions(content) {
  const list = parseFile(content);
  return list.map((q, index) => ({ index: index + 1, ...q }));
}
