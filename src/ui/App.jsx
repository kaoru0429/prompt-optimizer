import { h } from 'preact';
import { useState } from 'preact/hooks';
import { expandPrompt } from '../expand/index.js';

export function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('single'); // 'single' or 'chain'

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Optimize prompt based on input and mode
    const optimizedPrompt = expandPrompt(input, mode);

    const botMessage = { role: 'bot', content: optimizedPrompt };
    setMessages(prev => [...prev, botMessage]);

    setInput('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>提示詞優化器</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '15px' }}>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={mode === 'single'}
            onChange={() => setMode('single')}
          />
          單一提示詞模式
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="chain"
            checked={mode === 'chain'}
            onChange={() => setMode('chain')}
          />
          分步驟提示詞鏈模式
        </label>
      </div>

      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        height: '400px',
        overflowY: 'auto',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '150px' }}>
            請輸入您的簡單需求，我將為您擴充成專業的提示詞。
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '15px',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '10px 15px',
                borderRadius: '8px',
                backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
                border: '1px solid #ddd',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
                textAlign: 'left'
              }}>
                <strong style={{ display: 'block', marginBottom: '5px', color: msg.role === 'user' ? '#1565c0' : '#2e7d32' }}>
                  {msg.role === 'user' ? '您' : '優化結果'}
                </strong>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="例如：幫我寫一個貪吃蛇遊戲"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          送出
        </button>
      </div>
    </div>
  );
}
