import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/messages';
import './styles.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token) {
      navigate('/');
      return;
    }

    setCurrentUsername(username || '');
    loadMessages();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    try {
      setSending(true);
      const newMessage = await sendMessage(text.trim());
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
      <div className="chat-header">
        <h1>Чат</h1>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="loading">Загрузка сообщений...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">Нет сообщений</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.username === currentUsername ? 'message-own' : 'message-other'}`}
            >
              <div className="message-bubble">
                <div className="message-username">{message.username}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.created_at)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Введите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={sending || !text.trim()}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
};

export default Chat;