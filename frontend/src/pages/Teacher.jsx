import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API, SUBMISSIONS_BASE, isStandalone } from '../config';

const STANDALONE_STORAGE_KEY = 'math_quiz_submissions';

function getStandaloneSubmissions() {
  try {
    const raw = localStorage.getItem(STANDALONE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Teacher() {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (isStandalone) {
      const all = getStandaloneSubmissions();
      const ids = [...new Set(all.map(s => s.weekId))].sort((a, b) => String(a).localeCompare(String(b)));
      setWeeks(ids.map(weekId => ({
        weekId,
        count: all.filter(s => s.weekId === weekId).length
      })));
    } else {
      fetch(`${API}/submissions`)
        .then(r => r.json())
        .then(setWeeks)
        .catch(() => setWeeks([]));
    }
  }, [refresh]);

  useEffect(() => {
    if (!selectedWeek) {
      setList([]);
      setDetail(null);
      return;
    }
    if (isStandalone) {
      const all = getStandaloneSubmissions();
      setList(all.filter(s => s.weekId === selectedWeek).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
      setDetail(null);
    } else {
      fetch(`${API}/submissions/${selectedWeek}`)
        .then(r => r.json())
        .then(setList)
        .catch(() => setList([]));
      setDetail(null);
    }
  }, [selectedWeek, refresh]);

  const exportSubmissions = useCallback(() => {
    const data = JSON.stringify(getStandaloneSubmissions(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `提交记录_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const importSubmissions = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const list = Array.isArray(imported) ? imported : [imported];
        const existing = getStandaloneSubmissions();
        const merged = [...existing, ...list];
        localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(merged));
        setRefresh(r => r + 1);
        alert(`已导入 ${list.length} 条记录`);
      } catch (err) {
        alert('导入失败，请确认是导出的 JSON 文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>提交记录（老师查看）</h1>
      <Link to="/" style={styles.back}>← 返回首页</Link>

      {isStandalone && (
        <div style={styles.exportRow}>
          <button type="button" style={styles.exportBtn} onClick={exportSubmissions}>导出全部提交记录</button>
          <label style={styles.importLabel}>
            <input type="file" accept=".json" onChange={importSubmissions} style={{ display: 'none' }} />
            导入提交记录
          </label>
          <span style={styles.exportHint}>学生可导出后发给你，你在此导入即可查看</span>
        </div>
      )}

      <div style={styles.weeks}>
        {weeks.map(w => (
          <button
            key={w.weekId}
            style={{
              ...styles.weekBtn,
              ...(selectedWeek === w.weekId ? styles.weekBtnActive : {})
            }}
            onClick={() => setSelectedWeek(w.weekId)}
          >
            第{w.weekId}周（{w.count} 份）
          </button>
        ))}
      </div>

      {selectedWeek && (
        <div style={styles.section}>
          <h2>第 {selectedWeek} 周 提交列表</h2>
          {list.length === 0 && <p style={styles.empty}>该周暂无提交</p>}
          {list.map((item, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardHead}>
                <strong>{item.studentName}</strong>
                <span style={styles.time}>
                  {item.submittedAt ? new Date(item.submittedAt).toLocaleString('zh-CN') : ''}
                </span>
              </div>
              <button
                style={styles.viewBtn}
                onClick={() => setDetail(detail?.submitId === item.submitId ? null : item)}
              >
                {detail?.submitId === item.submitId ? '收起详情' : '查看作答与图片'}
              </button>
              {detail?.submitId === item.submitId && (
                <div style={styles.detail}>
                  {(detail.answers || []).map((a, j) => (
                    <div key={j} style={styles.answerRow}>
                      <span style={styles.answerLabel}>第{a.index}题（{a.type}）</span>
                      <span>作答：{a.answer || '(未填)'}{a.hasImage ? ' + 已上传图片' : ''}</span>
                    </div>
                  ))}
                  {(detail.images || []).map((im, j) => (
                    <div key={j} style={styles.imgWrap}>
                      <span>第{im.field?.replace('q', '')}题 图片{im.filename ? `：${im.filename}` : ''}</span>
                      {(im.dataUrl || (!isStandalone && im.filename)) && (
                        <img
                          src={im.dataUrl || `${SUBMISSIONS_BASE}/week_${selectedWeek}/${detail.submitId}/${im.filename}`}
                          alt=""
                          style={styles.preview}
                        />
                      )}
                    </div>
                  ))}
                  {!isStandalone && (!detail.images || detail.images.length === 0) && (detail.files || []).filter(f => f !== 'meta.json').map((f, j) => (
                    <div key={j} style={styles.imgWrap}>
                      <span>图片：{f}</span>
                      <img
                        src={`${SUBMISSIONS_BASE}/week_${selectedWeek}/${detail.submitId}/${f}`}
                        alt={f}
                        style={styles.preview}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 640, margin: '0 auto', padding: 24 },
  title: { fontSize: 22, marginBottom: 8 },
  back: { display: 'inline-block', marginBottom: 24, color: '#4a90d9' },
  exportRow: { marginBottom: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 },
  exportBtn: { marginRight: 12, padding: '8px 12px', border: '1px solid #4a90d9', borderRadius: 8, background: '#fff', color: '#4a90d9', cursor: 'pointer' },
  importLabel: { marginRight: 12, padding: '8px 12px', border: '1px solid #4a90d9', borderRadius: 8, color: '#4a90d9', cursor: 'pointer', display: 'inline-block' },
  exportHint: { display: 'block', marginTop: 8, fontSize: 12, color: '#666' },
  weeks: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  weekBtn: {
    padding: '10px 16px',
    border: '2px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer'
  },
  weekBtnActive: { borderColor: '#4a90d9', background: '#e8f4fd' },
  section: { marginTop: 16 },
  empty: { color: '#999' },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  cardHead: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  time: { fontSize: 13, color: '#666' },
  viewBtn: {
    padding: '8px 12px',
    border: '1px solid #4a90d9',
    borderRadius: 8,
    background: '#fff',
    color: '#4a90d9',
    cursor: 'pointer',
    fontSize: 14
  },
  detail: { marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' },
  answerRow: { marginBottom: 8, fontSize: 14 },
  answerLabel: { display: 'inline-block', width: 120, color: '#666' },
  imgWrap: { marginTop: 12 },
  preview: { maxWidth: '100%', maxHeight: 300, display: 'block', marginTop: 4, borderRadius: 8 }
};
