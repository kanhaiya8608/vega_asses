import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ImageSearch = ({ onSelectImage }) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const  apiKey= import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  // Retrieve query parameter from URL on component mount
  const initialQuery = searchParams.get('query') || '';
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const searchImages = async () => {
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setSearchParams({ query });

      const response = await axios.get(`${apiUrl}`, {
        params: { query },
        headers: { Authorization: `Client-ID ${apiKey}` },
      });

      if (response.status === 200) {
        setImages(response.data.results);
        if (response.data.results.length === 0) {
          setError('No images found. Try a different search term.');
        }
      } else {
        setError('Error fetching images. Please try again.');
      }
    } catch (err) {
      setError('Error fetching images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchImages();
    }
  };

  const handleSelectImage = (imageUrl) => {
    onSelectImage(imageUrl);
    localStorage.setItem('selectedImageUrl', imageUrl); // Store selected image URL in localStorage
    navigate('/editor');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between space-x-4 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Call searchImages on Enter key press
          placeholder="Search for images"
          className="w-full p-2 border border-gray-300 rounded resize-none" // Use resize-none to prevent resizing
        />
        <button
          onClick={searchImages}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          disabled={loading}
        >
          Search
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image.id} className="flex flex-col h-fulloverflow-hidden">
              <img
                src={image.urls.small}
                alt={image.Ftypedescription || 'No description available'}
                className="h-52 w-full object-cover"
              />
              <div className="py-2">
                <button
                  onClick={() => handleSelectImage(image.urls.regular)}
                  className="py-1 font-semibold w-full bg-blue-600 hover:bg-blue-500 text-white rounded"
                >
                  Add Captions
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading 
        )}
      </div>
    </div>
  );
};

export default ImageSearch;
