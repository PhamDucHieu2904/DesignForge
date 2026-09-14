/* DesignForge workspace composition. Moves existing controls without changing their IDs or events. */
function initEditorLayout() {
  const toolbar = document.querySelector('.edit-top-toolbar');
  const mount = document.getElementById('inspector-properties');
  const stageState = document.querySelector('.editor-stage-state');
  const stageStatus = document.getElementById('editor-stage-status');
  const selectionTitle = document.getElementById('inspector-selection-title');
  const selectionMeta = document.getElementById('inspector-selection-meta');
  const inspectorOrb = document.getElementById('inspector-orb');
  const section = document.getElementById('section-pdf');
  if (!toolbar || !mount || !section) return;

  mount.appendChild(toolbar);

  const setText = (element, value) => {
    if (element && element.textContent !== value) element.textContent = value;
  };

  const updateContext = () => {
    const pages = Array.from(document.querySelectorAll('.edit-thumb'));
    const selected = pages.findIndex(page => page.classList.contains('selected'));
    const objectSelected = Boolean(document.querySelector('.edit-selection-chrome'));
    const ready = selected >= 0;
    if (stageState?.classList.contains('is-ready') !== ready) stageState?.classList.toggle('is-ready', ready);
    setText(stageStatus, ready ? `Trang ${selected + 1} / ${pages.length}` : 'Chưa chọn trang');
    setText(selectionTitle, objectSelected ? 'Đối tượng đang chọn' : ready ? `Trang ${selected + 1}` : 'Chưa chọn trang');
    setText(selectionMeta, objectSelected ? 'Chỉnh thuộc tính bên dưới' : ready ? `${pages.length} trang trong tài liệu` : 'Thêm PDF để bắt đầu');
    setText(inspectorOrb, objectSelected ? 'OBJ' : ready ? String(selected + 1).padStart(2, '0') : '--');
  };

  new MutationObserver(updateContext).observe(section, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  section.addEventListener('click', () => requestAnimationFrame(updateContext));
  updateContext();
}

document.addEventListener('DOMContentLoaded', initEditorLayout);
