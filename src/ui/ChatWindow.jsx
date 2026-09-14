import { h } from 'preact';
import { CopyButton } from './CopyButton.jsx';

function ArtifactCard({ artifact, mode }) {
  if (mode === 'single' || !artifact.steps) {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{artifact.title}</h3>
          <CopyButton textToCopy={artifact.body} />
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px', margin: 0, fontFamily: 'inherit' }} data-testid="prompt-body">
          {artifact.body}
        </pre>
      </div>
    );
  } else {
    return (
      <div style={{ marginTop: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{artifact.title}</h3>
        <p style={{ margin: '0 0 15px 0' }}>{artifact.body}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {artifact.steps.map((step, idx) => (
            <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px' }} data-testid="step-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>{step.name}</h4>
                <CopyButton textToCopy={step.prompt} />
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px', margin: 0, fontFamily: 'inherit' }}>
                {step.prompt}
              </pre>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export function ChatWindow({ messages }) {
  if (messages.length === 0) {
    return <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>歡迎！請在下方輸入您的需求，讓我為您生成提示詞。</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {messages.map((msg, idx) => {
        if (msg.role === 'user') {
          return (
            <div key={idx} style={{ alignSelf: 'flex-end', backgroundColor: '#eff6ff', padding: '10px 15px', borderRadius: '15px 15px 0 15px', maxWidth: '80%' }}>
              {msg.text}
            </div>
          );
        } else {
          return (
            <div key={idx} style={{ alignSelf: 'flex-start', maxWidth: '100%' }}>
              <div style={{ marginBottom: '10px' }}>{msg.result.explanation}</div>
              {msg.result.artifacts.map((artifact, aIdx) => (
                <ArtifactCard key={aIdx} artifact={artifact} mode={artifact.steps ? 'chain' : 'single'} />
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
