import { h } from 'preact';
import { useState } from 'preact/hooks';

export function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid="copy-button"
      style={{
        padding: '5px 10px',
        backgroundColor: copied ? '#10b981' : '#f3f4f6',
        color: copied ? 'white' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem'
      }}
    >
      {copied ? '已複製！' : '複製'}
    </button>
  );
}
