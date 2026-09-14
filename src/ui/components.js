export function renderUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'message user';
  div.textContent = text;
  return div;
}

function createCopyButton(textToCopy) {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = '複製';
  btn.onclick = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = btn.textContent;
      btn.textContent = '已複製！';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  };
  return btn;
}

export function renderSystemMessage(expandResult) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message system';

  const textNode = document.createElement('div');
  textNode.textContent = expandResult.explanation;
  wrapper.appendChild(textNode);

  const artifact = expandResult.artifact;
  if (!artifact) return wrapper;

  const artifactDiv = document.createElement('div');
  artifactDiv.className = 'artifact';

  const header = document.createElement('div');
  header.className = 'artifact-header';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = artifact.title;
  header.appendChild(titleSpan);

  // Single mode copy button
  if (!artifact.steps || artifact.steps.length === 0) {
    header.appendChild(createCopyButton(artifact.body));
  }
  artifactDiv.appendChild(header);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'artifact-body';
  bodyDiv.textContent = artifact.body;

  if (artifact.steps && artifact.steps.length > 0) {
    artifact.steps.forEach((step, index) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step';

      const stepHeader = document.createElement('div');
      stepHeader.style.display = 'flex';
      stepHeader.style.justifyContent = 'space-between';
      stepHeader.style.marginBottom = '0.5rem';

      const stepName = document.createElement('strong');
      stepName.textContent = step.name;

      stepHeader.appendChild(stepName);
      stepHeader.appendChild(createCopyButton(step.prompt));

      const stepPrompt = document.createElement('div');
      stepPrompt.textContent = step.prompt;

      stepDiv.appendChild(stepHeader);
      stepDiv.appendChild(stepPrompt);
      bodyDiv.appendChild(stepDiv);
    });
  }

  artifactDiv.appendChild(bodyDiv);
  wrapper.appendChild(artifactDiv);

  return wrapper;
}
