import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';

const App = () => {
  return (
    <div className="bg-[url('/bgImage.svg')] bg-cover bg-no-repeat ">
      <HomePage />
    </div>
  );
};

export default App;
