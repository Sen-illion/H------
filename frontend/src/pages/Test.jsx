import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API, isStandalone, staticBase } from '../config';
import { parseQuestions } from '../lib/parseQuestions';

const STANDALONE_STORAGE_KEY = 'math_quiz_submissions';

export default function Test() {
  const { weekId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});           // 题号 -> 最终提交的答案
  const [choicePending, setChoicePending] = useState({}); // 题号 -> 当前选中未确认的选项
  const [fillModal, setFillModal] = useState(null);     // { index, value } 填空弹窗
  const [images, setImages] = useState({});              // 题号 -> File（问答题图片）
  const [studentName, setStudentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [explainOpen, setExplainOpen] = useState(null); // 题号，打开解析的题目

  useEffect(() => {
    if (isStandalone) {
      const file = `week_${String(weekId).padStart(2, '0')}.txt`;
      fetch(`${staticBase}/周末检测/${file}`)
        .then(r => r.text())
        .then(parseQuestions)
        .then(setQuestions)
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    } else {
      fetch(`${API}/weeks/${weekId}/questions`)
        .then(r => r.json())
        .then(setQuestions)
        .finally(() => setLoading(false));
    }
  }, [weekId]);

  const setAnswer = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const openFill = (index) => {
    setFillModal({ index, value: answers[index] ?? '' });
  };

  const confirmFill = () => {
    if (fillModal) {
      setAnswer(fillModal.index, fillModal.value.trim());
      setFillModal(null);
    }
  };

  const selectChoice = (index, option) => {
    setChoicePending(prev => ({ ...prev, [index]: option }));
  };

  const confirmChoice = (index) => {
    const opt = choicePending[index];
    if (opt) {
      setAnswer(index, opt);
      setChoicePending(prev => ({ ...prev, [index]: undefined }));
    }
  };

  const onImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) setImages(prev => ({ ...prev, [index]: file }));
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const submit = async () => {
    if (!studentName.trim()) {
      alert('请先填写姓名或昵称');
      return;
    }
    setSubmitting(true);
    const submitId = `submit_${Date.now()}`;
    try {
      if (isStandalone) {
        const answerList = questions.map(q => ({
          index: q.index,
          type: q.type,
          answer: answers[q.index],
          hasImage: !!images[q.index]
        }));
        const imageList = [];
        for (const q of questions) {
          const file = images[q.index];
          if (file) {
            try {
              const dataUrl = await fileToDataUrl(file);
              if (dataUrl.length < 2 * 1024 * 1024) imageList.push({ field: `q${q.index}`, dataUrl });
            } catch (_) {}
          }
        }
        const record = {
          weekId,
          submitId,
          studentName: studentName.trim(),
          submittedAt: new Date().toISOString(),
          answers: answerList,
          images: imageList
        };
        const raw = localStorage.getItem(STANDALONE_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.push(record);
        localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(list));
        setSubmitDone(true);
      } else {
        const body = new FormData();
        body.append('weekId', weekId);
        body.append('submitId', submitId);
        body.append('studentName', studentName.trim());
        body.append('answers', JSON.stringify(
          questions.map(q => ({
            index: q.index,
            type: q.type,
            answer: answers[q.index],
            hasImage: !!images[q.index]
          }))
        ));
        questions.forEach(q => {
          const file = images[q.index];
          if (file) body.append(`q${q.index}`, file);
        });
        const r = await fetch(`${API}/submit`, { method: 'POST', body });
        const data = await r.json();
        if (data.ok) setSubmitDone(true);
        else alert(data.error || '提交失败');
      }
    } catch (e) {
      alert('提交失败：' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 填空：标准答案里用「或」分隔多种可接受写法时，与任一分支完全一致即判对
  const fillAnswerMatches = (userAns, rightAns) => {
    const u = String(userAns ?? '').trim();
    const r = String(rightAns ?? '').trim();
    if (!r) return u === '';
    if (!r.includes('或')) return u === r;
    const parts = r.split(/\s*或\s*/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return u === r;
    return parts.some((p) => u === p);
  };

  // 判断单题对错（填空、选择可自动判，问答题为 null 表示待批改）
  const isCorrect = (q) => {
    if (q.type === '问答题') return null;
    const userAns = String(answers[q.index] ?? '').trim();
    const rightAns = String(q.answer ?? '').trim();
    if (q.type === '选择') return userAns.toUpperCase() === rightAns.toUpperCase();
    if (q.type === '填空') return fillAnswerMatches(userAns, rightAns);
    return false;
  };

  const correctCount = questions.filter(q => isCorrect(q) === true).length;
  const autoCount = questions.filter(q => q.type !== '问答题').length;

  if (loading) return <div style={styles.center}>加载题目中…</div>;
  if (questions.length === 0) return <div style={styles.center}>本周暂无题目</div>;
  if (submitDone) {
    return (
      <div style={styles.page}>
        <div style={styles.resultHeader}>
          <h2>答题结果</h2>
          <p style={styles.resultSummary}>
            共 {questions.length} 题，自动判题 {autoCount} 题中答对 <strong>{correctCount}</strong> 题
            {questions.some(q => q.type === '问答题') && '，问答题待老师批改'}
          </p>
          {isStandalone && (
            <p style={styles.standaloneHint}>如需发给老师查看，请返回首页进入「老师入口」导出提交记录后发送给老师。</p>
          )}
          <Link to="/" style={styles.backHome}>返回首页</Link>
        </div>
        {questions.map((q) => {
          const correct = isCorrect(q);
          return (
            <section
              key={q.index}
              style={{
                ...styles.resultCard,
                borderLeftColor: correct === true ? '#4caf50' : correct === false ? '#f44336' : '#ff9800'
              }}
            >
              <div style={styles.resultCardHead}>
                <span style={styles.num}>第 {q.index} 题</span>
                <span style={styles.knowledge}>{q.knowledge}</span>
                <span style={{
                  ...styles.resultBadge,
                  ...(correct === true ? styles.resultBadgeRight : correct === false ? styles.resultBadgeWrong : styles.resultBadgePending)
                }}>
                  {correct === true ? '✓ 正确' : correct === false ? '✗ 错误' : '待批改'}
                </span>
              </div>
              <div style={styles.stem}>{q.stem}</div>
              <div style={styles.answerRow}>
                <span>你的答案：</span>
                <strong>{answers[q.index] != null && answers[q.index] !== '' ? answers[q.index] : '—'}</strong>
              </div>
              {(q.type === '填空' || q.type === '选择') && (
                <div style={styles.answerRow}>
                  <span>正确答案：</span>
                  <strong>{q.type === '选择' && q.options?.[q.answer] ? `${q.answer}. ${q.options[q.answer]}` : q.answer}</strong>
                </div>
              )}
              <button
                type="button"
                style={styles.explainBtn}
                onClick={() => setExplainOpen(explainOpen === q.index ? null : q.index)}
              >
                {explainOpen === q.index ? '收起解析' : '查看解析'}
              </button>
              {explainOpen === q.index && q.explanation && (
                <div style={styles.explainBox}>
                  <div style={styles.explainTitle}>解析</div>
                  <div style={styles.explainContent}>{q.explanation}</div>
                </div>
              )}
              {explainOpen === q.index && !q.explanation && (
                <div style={styles.explainBox}>暂无解析</div>
              )}
            </section>
          );
        })}
        <div style={{ ...styles.done, paddingTop: 24 }}>
          <Link to="/" style={styles.backHome}>返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span>第 {weekId} 周检测</span>
        <label style={styles.nameLabel}>
          姓名/昵称：
          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="填写后提交"
            style={styles.nameInput}
          />
        </label>
      </div>

      {questions.map((q) => (
        <section key={q.index} style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.num}>第 {q.index} 题</span>
            <span style={styles.knowledge}>考查知识点：{q.knowledge}</span>
          </div>
          <div style={styles.stem}>{q.stem}</div>

          {q.type === '填空' && (
            <div style={styles.actions}>
              <button type="button" style={styles.answerBtn} onClick={() => openFill(q.index)}>
                {answers[q.index] ? `已作答：${answers[q.index]}` : '作答'}
              </button>
            </div>
          )}

          {q.type === '选择' && (
            <div style={styles.choiceWrap}>
              {['A', 'B', 'C', 'D'].filter(k => q.options?.[k]).map(opt => (
                <div key={opt} style={styles.optionRow}>
                  <button
                    type="button"
                    style={{
                      ...styles.optionBtn,
                      ...((choicePending[q.index] === opt || answers[q.index] === opt) ? styles.optionBtnActive : {})
                    }}
                    onClick={() => selectChoice(q.index, opt)}
                  >
                    {opt}. {q.options[opt]}
                  </button>
                </div>
              ))}
              <button
                type="button"
                style={styles.confirmChoiceBtn}
                onClick={() => confirmChoice(q.index)}
                disabled={!choicePending[q.index]}
              >
                确认选择
              </button>
            </div>
          )}

          {q.type === '问答题' && (
            <div style={styles.actions}>
              <label style={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => onImageChange(q.index, e)}
                  style={{ display: 'none' }}
                />
                {images[q.index] ? `已选图片：${images[q.index].name}` : '拍照 / 上传图片'}
              </label>
            </div>
          )}
        </section>
      ))}

      <div style={styles.footer}>
        <button
          style={styles.submitBtn}
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? '提交中…' : '提交全部作答'}
        </button>
      </div>

      {fillModal !== null && (
        <div style={styles.modalMask} onClick={() => setFillModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>第 {fillModal.index} 题 作答</h3>
            <input
              type="text"
              value={fillModal.value}
              onChange={e => setFillModal(prev => ({ ...prev, value: e.target.value }))}
              placeholder="请输入答案"
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.modalBtns}>
              <button onClick={() => setFillModal(null)}>取消</button>
              <button onClick={confirmFill}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 560, margin: '0 auto', padding: 16, paddingBottom: 80 },
  center: { textAlign: 'center', padding: 48 },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8
  },
  nameLabel: { fontSize: 14 },
  nameInput: { marginLeft: 8, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 8 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  cardHead: { marginBottom: 12 },
  num: { fontWeight: 'bold', marginRight: 12, color: '#4a90d9' },
  knowledge: { fontSize: 13, color: '#666' },
  stem: { whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 16 },
  actions: { marginTop: 8 },
  answerBtn: {
    padding: '10px 20px',
    border: '1px solid #4a90d9',
    borderRadius: 8,
    background: '#fff',
    color: '#4a90d9',
    cursor: 'pointer'
  },
  choiceWrap: { marginTop: 8 },
  optionRow: { marginBottom: 8 },
  optionBtn: {
    width: '100%',
    padding: 12,
    textAlign: 'left',
    border: '2px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer'
  },
  optionBtnActive: { borderColor: '#4a90d9', background: '#e8f4fd' },
  confirmChoiceBtn: {
    marginTop: 12,
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#4a90d9',
    color: '#fff',
    cursor: 'pointer'
  },
  uploadLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    border: '1px dashed #4a90d9',
    borderRadius: 8,
    color: '#4a90d9',
    cursor: 'pointer'
  },
  footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  submitBtn: {
    width: '100%',
    maxWidth: 528,
    margin: '0 auto',
    display: 'block',
    padding: 14,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    background: '#4a90d9',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer'
  },
  done: { textAlign: 'center', padding: 48 },
  resultHeader: { textAlign: 'center', marginBottom: 24 },
  resultSummary: { color: '#555', marginTop: 8, marginBottom: 16 },
  standaloneHint: { fontSize: 13, color: '#666', marginBottom: 12 },
  backHome: { color: '#4a90d9', textDecoration: 'none', fontSize: 15 },
  resultCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #ddd'
  },
  resultCardHead: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultBadge: {
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 'bold'
  },
  resultBadgeRight: { background: '#e8f5e9', color: '#2e7d32' },
  resultBadgeWrong: { background: '#ffebee', color: '#c62828' },
  resultBadgePending: { background: '#fff3e0', color: '#e65100' },
  answerRow: { marginTop: 8, fontSize: 14 },
  explainBtn: {
    marginTop: 12,
    padding: '8px 16px',
    border: '1px solid #4a90d9',
    borderRadius: 8,
    background: '#fff',
    color: '#4a90d9',
    cursor: 'pointer',
    fontSize: 14
  },
  explainBox: { marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8, fontSize: 14 },
  explainTitle: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  explainContent: { whiteSpace: 'pre-wrap', lineHeight: 1.6 },
  modalMask: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: 280
  },
  modalInput: { width: '100%', padding: 12, margin: '16px 0', border: '1px solid #ccc', borderRadius: 8 },
  modalBtns: { display: 'flex', gap: 12, justifyContent: 'flex-end' }
};
