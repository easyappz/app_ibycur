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
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        setLoading(false);
        // If unauthorized, redirect to auth
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
              <span className="profile-label">Имя пользователя:</span>
              <span className="profile-value">{user.username}</span>
            </div>
            
            {user.date_joined && (
              <div className="profile-field">
                <span className="profile-label">Дата регистрации:</span>
                <span className="profile-value">
                  {new Date(user.date_joined).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
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