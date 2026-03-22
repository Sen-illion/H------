/**
 * 填空判题：支持「或」多答案 + 数学常用简称与标准答案等价
 */

const ABBREV = {
  充要: '充分必要'
};

function norm(s) {
  const t = String(s ?? '').trim();
  return ABBREV[t] ?? t;
}

/**
 * @param {string} userAns
 * @param {string} rightAns 题目里的「答案：」整行内容
 */
export function fillAnswerMatches(userAns, rightAns) {
  const u = norm(userAns);
  const r = String(rightAns ?? '').trim();
  if (!r) return norm(userAns) === '';

  if (!r.includes('或')) {
    return u === norm(r);
  }

  const parts = r.split(/\s*或\s*/).map((s) => norm(s.trim())).filter(Boolean);
  if (parts.length === 0) return u === norm(r);
  return parts.some((p) => u === p);
}
