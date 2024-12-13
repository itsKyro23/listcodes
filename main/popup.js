const csCodeInput = document.querySelector('#csCodeInput');
const saveButton = document.querySelector('#csCodeSaveButton');
const savedCsCode = document.querySelector("#savedCsCode");

window.addEventListener('load', async () => {
  const current = (await chrome.storage.sync.get('csCode'))['csCode'] ?? [];
  current.map((csCode) => {
    const div = document.createElement('div');
    div.className = 'csCodeListItem';
    const span = document.createElement('span');
    span.textContent = csCode;
    const button = document.createElement('input');
    button.type = 'button';
    button.value = '삭제';
    button.addEventListener('click', async (e) => {
      const current = (await chrome.storage.sync.get('csCode'))['csCode'] ?? [];
      const next = current.filter((code) => code !== csCode);
      chrome.storage.sync.set({ 'csCode': next });
      window.close();
    })
    div.appendChild(span);
    div.appendChild(button);
    savedCsCode.appendChild(div);
  });
});

saveButton.addEventListener('click', async () => {
  const current = (await chrome.storage.sync.get('csCode'))['csCode'] ?? [];
  const csCode = csCodeInput.value;
  const next = csCode in current ? current : [...current, csCode];
  chrome.storage.sync.set({ 'csCode': next });
  window.close();
});
