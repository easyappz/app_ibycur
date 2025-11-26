import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../api/auth';
import './styles.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
        localStorage.setItem('username', userData.username);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
        <div className="profile-card">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
        <div className="profile-card">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/')} className="profile-button">
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id1-react/src/components/Profile/index.jsx">
      <div className="profile-card">
        <h1 className="profile-title">Профиль</h1>
        
        {user && (
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">ID:</span>
              <span className="profile-value">{user.id}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Имя пользователя:</span>
              <span className="profile-value">{user.username}</span>
            </div>
          </div>
        )}

        <div className="profile-buttons">
          <button onClick={handleGoToChat} className="profile-button profile-button-primary">
            К чату
          </button>
          <button onClick={handleLogout} className="profile-button profile-button-secondary">
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;