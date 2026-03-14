import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Test from './pages/Test';
import Teacher from './pages/Teacher';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/week/:weekId" element={<Test />} />
      <Route path="/teacher" element={<Teacher />} />
    </Routes>
  );
}
