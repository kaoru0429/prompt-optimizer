import { expand } from '../expand/engine.js';
import { renderUserMessage, renderSystemMessage } from './components.js';

let templatesSingle = [];
let templatesChain = [];

async function loadTemplates() {
  try {
    const resSingle = await fetch('./src/templates/single/default.json');
    templatesSingle.push(await resSingle.json());

    const resChain = await fetch('./src/templates/chain/default.json');
    templatesChain.push(await resChain.json());
  } catch (err) {
    console.error('Failed to load templates:', err);
  }
}

function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

function handleSend() {
  const input = document.getElementById('wish-input');
  const wish = input.value.trim();
  if (!wish) return;

  const chatContainer = document.getElementById('chat-container');
  chatContainer.appendChild(renderUserMessage(wish));
  input.value = '';

  const mode = getMode();
  const templates = mode === 'chain' ? templatesChain : templatesSingle;

  try {
    const result = expand(wish, mode, templates);
    chatContainer.appendChild(renderSystemMessage(result));
  } catch (err) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message system';
    errorDiv.textContent = '發生錯誤：' + err.message;
    chatContainer.appendChild(errorDiv);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTemplates();

  document.getElementById('send-btn').addEventListener('click', handleSend);
  document.getElementById('wish-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });
});
