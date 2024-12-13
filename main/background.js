// Fungsi untuk mendapatkan additional info
async function getAdditionalInfo(csCodes) {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

  // Ambil Page-Key
  let pageKey;
  try {
    pageKey = await fetch('https://coupon.withhive.com/2376')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch Page-Key from 2376: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        const match = text.match(pattern);
        if (!match) {
          throw new Error('Page-Key not found in response from 2376');
        }
        return match[1];
      });
  } catch (error) {
    throw new Error(`Error fetching Page-Key: ${error.message}`);
  }

  const results = [];
  
  for (const csCode of csCodes) {
    try {
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
        if (!response.ok) {
          throw new Error(`Failed to fetch server_list for CS Code ${csCode.trim()}: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.serverList || !data.serverList['0'] || !data.serverList['0'].additionalinfo) {
          throw new Error(`Additional info not found for CS Code ${csCode.trim()}`);
        }
        return data.serverList['0'].additionalinfo;
      });

      results.push(`CS Code: ${csCode.trim()} - Additional Info: ${ADDITIONAL_INFO}`);
    } catch (error) {
      results.push(`CS Code: ${csCode.trim()} - Error: ${error.message}`);
    }
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
