import { h } from 'preact';
import { useState } from 'preact/hooks';
import { ChatWindow } from './ChatWindow.jsx';
import { ModeToggle } from './ModeToggle.jsx';
import { classify } from '../expand/classify.js';

export function App() {
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('single');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const expandResult = classify(inputValue, mode);
    const assistantMessage = { role: 'assistant', result: expandResult };
    setMessages(prev => [...prev, assistantMessage]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>提示詞優化器</h1>
        <ModeToggle currentMode={mode} onToggle={setMode} />
      </header>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <ChatWindow messages={messages} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onInput={(e) => setInputValue(e.target.value)}
          placeholder="請輸入您的簡單需求..."
          style={{ flex: 1, padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          data-testid="wish-input"
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} data-testid="send-button">
          送出
        </button>
      </form>
    </div>
  );
}
