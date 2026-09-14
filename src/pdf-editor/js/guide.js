/* PDF Editor guide only. Converter logic lives in the React tool cards. */
async function initGuide() {
  const modal = document.getElementById('guide-modal');
  const closeButton = document.getElementById('guide-modal-close');
  const body = document.getElementById('guide-modal-body');
  const buttons = document.querySelectorAll('.guide-btn[data-guide="edit"]');
  if (!modal || !closeButton || !body || !buttons.length) return;

  let guideData;
  const close = () => modal.classList.remove('active');
  const open = async () => {
    try {
      if (!guideData) {
        const response = await fetch('./js/guide-data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        guideData = await response.json();
      }
      body.innerHTML = guideData.edit || '<p>Nội dung hướng dẫn đang được cập nhật.</p>';
    } catch (error) {
      console.error('Không thể tải hướng dẫn PDF Editor.', error);
      body.innerHTML = '<p>Không thể tải hướng dẫn. Vui lòng thử lại.</p>';
    }
    modal.classList.add('active');
  };

  buttons.forEach(button => button.addEventListener('click', open));
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', initGuide);
