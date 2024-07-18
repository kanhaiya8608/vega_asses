import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ImageSearch from './components/ImageSearch';
import ImageEditor from './components/ImageEditor';
import './App.css';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <Router>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl text-center font-bold">Image Editor with Fabric.js</h1>
        <Routes>
          <Route path="/" element={<ImageSearch onSelectImage={setSelectedImage} />} />
          <Route path="/editor" element={<ImageEditor imageUrl={selectedImage} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
