// Fungsi untuk mendapatkan additional info
async function getAdditionalInfo(csCodes) {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

  // Ambil Page-Key
  const pageKey = await fetch('https://coupon.withhive.com/2376')
    .then(async (response) => {
      const text = await response.text();
      return text.match(pattern)[1];
    });

  const results = [];
  
  for (const csCode of csCodes) {
    // Ambil ADDITIONAL_INFO berdasarkan CS Code
    const ADDITIONAL_INFO = await fetch('https://coupon.withhive.com/tp/coupon/server_list', {
      method: 'POST',
      headers: {
        'Page-Key': pageKey,
      },
      body: JSON.stringify({
        language: 'en',
        server: '2376|GLOBAL|GLOBAL',
        cs_code: csCode.trim(),
      }),
    }).then(async (response) => {
      return (await response.json()).serverList['0'].additionalinfo;
    });

    results.push(`CS Code: ${csCode.trim()} - Additional Info: ${ADDITIONAL_INFO}`);
  }

  // Gabungkan hasil menjadi satu teks
  return results.join('\n');
}

// Tombol untuk mendapatkan informasi tambahan
document.getElementById('redeemButton').addEventListener('click', async () => {
  const csCodeInput = document.getElementById('csCodeInput').value;

  if (!csCodeInput) {
    document.getElementById('result').innerText = 'Please enter CS Codes!';
    return;
  }

  const csCodes = csCodeInput.split(',');
  document.getElementById('result').innerText = 'Processing CS Codes...';

  try {
    const additionalInfo = await getAdditionalInfo(csCodes);
    document.getElementById('result').innerText = additionalInfo;
  } catch (error) {
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
});
