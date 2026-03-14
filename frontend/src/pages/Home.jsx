import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';

export default function Home() {
  const [weeks, setWeeks] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/weeks`)
      .then(r => r.json())
      .then(setWeeks)
      .catch(() => setWeeks([]));
  }, []);

  const startTest = () => {
    if (selected) navigate(`/week/${selected.id}`);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>数学周末检测</h1>
      <p style={styles.subtitle}>请选择周次，开始本周检测</p>

      <div style={styles.weekList}>
        {weeks.length === 0 && <p style={styles.empty}>暂无周次数据，请确保「周末检测」文件夹内有 week_xx.txt</p>}
        {weeks.map(w => (
          <button
            key={w.id}
            style={{
              ...styles.weekBtn,
              ...(selected?.id === w.id ? styles.weekBtnActive : {})
            }}
            onClick={() => setSelected(w)}
          >
            {w.name}
          </button>
        ))}
      </div>

      <button
        style={{ ...styles.startBtn, opacity: selected ? 1 : 0.5 }}
        disabled={!selected}
        onClick={startTest}
      >
        开始本周检测
      </button>

      <a href="/teacher" style={styles.teacherLink}>老师入口：查看提交记录</a>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 420,
    margin: '0 auto',
    padding: 24,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 24, marginBottom: 8, color: '#1a1a2e' },
  subtitle: { color: '#666', marginBottom: 32 },
  weekList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 32
  },
  weekBtn: {
    padding: '12px 20px',
    fontSize: 16,
    border: '2px solid #ddd',
    borderRadius: 12,
    background: '#fff',
    cursor: 'pointer'
  },
  weekBtnActive: {
    borderColor: '#4a90d9',
    background: '#e8f4fd',
    color: '#4a90d9'
  },
  startBtn: {
    padding: '14px 48px',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    background: '#4a90d9',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer'
  },
  empty: { color: '#999', marginBottom: 16 },
  teacherLink: { marginTop: 32, color: '#888', fontSize: 14 }
};
