// Fungsi untuk mengirim kupon
async function redeemCoupons(coupons, csCodes) {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

  // Ambil Page-Key
  const pageKey = await fetch('https://coupon.withhive.com/2376')
    .then(async (response) => {
      const text = await response.text();
      return text.match(pattern)[1];
    });

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

    // Kirim kupon menggunakan promises
    const promises = coupons.map(async (coupon) => {
      return fetch('https://coupon.withhive.com/tp/coupon/use', {
        method: 'POST',
        headers: {
          'Page-Key': pageKey,
        },
        body: JSON.stringify({
          language: 'en',
          server: '2376|GLOBAL|GLOBAL',
          cs_code: csCode.trim(),
          coupon: coupon.trim(),
          additional_info: ADDITIONAL_INFO,
        }),
      }).then(async (response) => {
        const result = (await response.json()).msg;
        // Notifikasi hasil
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '/images/alarm.jpeg',
          title: `Coupon Redeem - CS Code: ${csCode}`,
          message: `${coupon} : ${result}`,
          priority: 2,
        });
        return result;
      });
    });

    await Promise.all(promises);
  }
}

// Tombol redeem
document.getElementById('redeemButton').addEventListener('click', async () => {
  const couponInput = document.getElementById('couponInput').value;
  const csCodeInput = document.getElementById('csCodeInput').value;

  if (!couponInput || !csCodeInput) {
    document.getElementById('result').innerText = 'Please enter coupon codes and CS Codes!';
    return;
  }

  const coupons = couponInput.split(',');
  const csCodes = csCodeInput.split(',');
  document.getElementById('result').innerText = 'Processing coupons...';

  try {
    await redeemCoupons(coupons, csCodes);
    document.getElementById('result').innerText = 'Coupons redeemed successfully!';
  } catch (error) {
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
});
