import { h } from 'preact';

export function ModeToggle({ currentMode, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: '5px', backgroundColor: '#e5e7eb', padding: '4px', borderRadius: '20px' }}>
      <button
        type="button"
        onClick={() => onToggle('single')}
        style={{
          padding: '5px 15px',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          backgroundColor: currentMode === 'single' ? 'white' : 'transparent',
          boxShadow: currentMode === 'single' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          fontWeight: currentMode === 'single' ? 'bold' : 'normal'
        }}
        data-testid="mode-single"
      >
        單一提示詞
      </button>
      <button
        type="button"
        onClick={() => onToggle('chain')}
        style={{
          padding: '5px 15px',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          backgroundColor: currentMode === 'chain' ? 'white' : 'transparent',
          boxShadow: currentMode === 'chain' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          fontWeight: currentMode === 'chain' ? 'bold' : 'normal'
        }}
        data-testid="mode-chain"
      >
        提示詞鏈
      </button>
    </div>
  );
}
