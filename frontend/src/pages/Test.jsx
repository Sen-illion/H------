import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../config';

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

  useEffect(() => {
    fetch(`${API}/weeks/${weekId}/questions`)
      .then(r => r.json())
      .then(setQuestions)
      .finally(() => setLoading(false));
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

  const submit = async () => {
    if (!studentName.trim()) {
      alert('请先填写姓名或昵称');
      return;
    }
    setSubmitting(true);
    const submitId = `submit_${Date.now()}`;
    const body = new FormData();
    body.append('weekId', weekId);
    body.append('submitId', submitId);
    body.append('studentName', studentName.trim());
    body.append('answers', JSON.stringify(
      questions.map((q, i) => ({
        index: q.index,
        type: q.type,
        answer: answers[q.index],
        hasImage: !!images[q.index]
      }))
    ));
    questions.forEach((q) => {
      const file = images[q.index];
      if (file) body.append(`q${q.index}`, file);
    });
    try {
      const r = await fetch(`${API}/submit`, { method: 'POST', body });
      const data = await r.json();
      if (data.ok) setSubmitDone(true);
      else alert(data.error || '提交失败');
    } catch (e) {
      alert('提交失败：' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.center}>加载题目中…</div>;
  if (questions.length === 0) return <div style={styles.center}>本周暂无题目</div>;
  if (submitDone) {
    return (
      <div style={styles.page}>
        <div style={styles.done}>
          <h2>提交成功</h2>
          <p>你的作答已保存，老师可以查看。</p>
          <a href="/">返回首页</a>
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
