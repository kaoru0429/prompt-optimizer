import { h } from 'preact';
import { useState } from 'preact/hooks';

export function CopyButton({ textToCopy }) {
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied' | 'error'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 3000);
    }
  };

  let backgroundColor = '#f3f4f6';
  let color = '#374151';
  let text = '複製';

  if (copyState === 'copied') {
    backgroundColor = '#10b981';
    color = 'white';
    text = '已複製！';
  } else if (copyState === 'error') {
    backgroundColor = '#ef4444';
    color = 'white';
    text = '複製失敗，請手動複製';
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid="copy-button"
      style={{
        padding: '5px 10px',
        backgroundColor,
        color,
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem'
      }}
    >
      {text}
    </button>
  );
}
