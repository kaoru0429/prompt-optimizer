import { expandPrompt } from '../expand/engine.js';

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const messageList = document.getElementById('message-list');
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    let currentMode = 'single';
    modeRadios.forEach(radio => {
      if (radio.checked) {
        currentMode = radio.value;
      }
    });

    appendUserMessage(text);
    userInput.value = '';

    const result = expandPrompt(text, currentMode);
    if (result) {
      appendAiMessage(result);
    }
  });

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  function appendUserMessage(text) {
    const template = document.getElementById('user-message-template');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.message-bubble').textContent = text;
    messageList.appendChild(clone);
    scrollToBottom();
  }

  function appendAiMessage(result) {
    const template = document.getElementById('ai-message-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.explanation').textContent = result.explanation;

    const container = clone.querySelector('.artifact-container');

    if (result.artifact.kind === 'single' || (result.artifact.title && result.artifact.body && !result.artifact.steps)) {
      // Single mode
      const singleTemplate = document.getElementById('single-artifact-template');
      const singleClone = singleTemplate.content.cloneNode(true);

      singleClone.querySelector('.artifact-title').textContent = result.artifact.title;
      singleClone.querySelector('.artifact-body').textContent = result.artifact.body;

      const copyBtn = singleClone.querySelector('.copy-btn');
      const statusSpan = singleClone.querySelector('.copy-status');

      copyBtn.addEventListener('click', () => {
        copyToClipboard(result.artifact.body, statusSpan);
      });

      container.appendChild(singleClone);
    } else if (result.artifact.kind === 'chain' || result.artifact.steps) {
      // Chain mode
      const chainTemplate = document.getElementById('chain-artifact-template');
      const chainClone = chainTemplate.content.cloneNode(true);

      const stepsContainer = chainClone.querySelector('.chain-steps');
      let fullChainText = '';

      result.artifact.steps.forEach((step, index) => {
        const stepTemplate = document.getElementById('chain-step-template');
        const stepClone = stepTemplate.content.cloneNode(true);

        stepClone.querySelector('.step-name').textContent = `步驟 ${index + 1}: ${step.name}`;
        stepClone.querySelector('.step-prompt').textContent = step.prompt;

        const copyStepBtn = stepClone.querySelector('.copy-step-btn');

        copyStepBtn.addEventListener('click', function() {
          const originalText = this.textContent;

          // Use the same fallback-aware copyToClipboard function used elsewhere
          const statusSpan = document.createElement('span');
          statusSpan.style.display = 'none'; // We don't display this span, we just use it for the API signature

          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(step.prompt).then(() => {
              this.textContent = '已複製！';
              setTimeout(() => { this.textContent = originalText; }, 2000);
            }).catch(() => {
              this.textContent = '複製失敗，請手動選取';
              setTimeout(() => { this.textContent = originalText; }, 3000);
            });
          } else {
            // Fallback for non-secure context (e.g. localhost http)
            const textArea = document.createElement("textarea");
            textArea.value = step.prompt;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.prepend(textArea);
            textArea.select();

            try {
              document.execCommand('copy');
              this.textContent = '已複製！';
              setTimeout(() => { this.textContent = originalText; }, 2000);
            } catch (error) {
              this.textContent = '複製失敗，請手動選取';
              setTimeout(() => { this.textContent = originalText; }, 3000);
            } finally {
              textArea.remove();
            }
          }
        });

        stepsContainer.appendChild(stepClone);
        fullChainText += `【步驟 ${index + 1}: ${step.name}】\n${step.prompt}\n\n`;
      });

      const copyAllBtn = chainClone.querySelector('.copy-all-btn');
      const statusSpan = chainClone.querySelector('.copy-status');

      copyAllBtn.addEventListener('click', () => {
        copyToClipboard(fullChainText.trim(), statusSpan);
      });

      container.appendChild(chainClone);
    }

    messageList.appendChild(clone);
    scrollToBottom();
  }

  function copyToClipboard(text, statusElement) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess(statusElement);
      }).catch(err => {
        showCopyFallback(statusElement);
      });
    } else {
      // Fallback for non-secure context
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Move outside of screen to make it invisible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        showCopySuccess(statusElement);
      } catch (error) {
        showCopyFallback(statusElement);
      } finally {
        textArea.remove();
      }
    }
  }

  function showCopySuccess(el) {
    el.textContent = '已複製！';
    el.style.color = '#28a745';
    setTimeout(() => {
      el.textContent = '';
    }, 2000);
  }

  function showCopyFallback(el) {
    el.textContent = '複製失敗，請手動選取複製。';
    el.style.color = '#dc3545';
  }

  function scrollToBottom() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});
