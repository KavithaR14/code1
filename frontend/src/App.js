import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loginpage from './component/Loginpage';
import Sidebar from './component/Sidebar/Sidebar';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/sidebar" element={<Sidebar />} />
      
      </Routes>
    </Router>
  );
}

export default App;