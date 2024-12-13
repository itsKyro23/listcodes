const CONTEXT_MENU_ID = 'STAR_SEED_COUPON_CONTEXT_MENU';

// Fungsi untuk mengirim kupon
async function redeemCoupons(coupons) {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;
  const csCodeList = (await chrome.storage.sync.get('csCode'))['csCode'];
  const pageKey = await fetch('https://coupon.withhive.com/1614')
      .then(async (response) => {
        const text = await response.text();
        return text.match(pattern)[1];
      });

  for (const csCode of csCodeList) {
    const ADDITIONAL_INFO = await fetch('https://coupon.withhive.com/tp/coupon/server_list', {
      method: 'POST',
      headers: {
        'Page-Key': pageKey
      },
      body: JSON.stringify({
        language: 'ko',
        server: '1614|KR|KR',
        cs_code: csCode,
      })
    }).then(async (response) => {
      return (await response.json())['serverList']['0']['additionalinfo'];
    });

    const promises = coupons.map(async (coupon) => {
      return fetch('https://coupon.withhive.com/tp/coupon/use', {
        method: 'POST',
        headers: {
          'Page-Key': pageKey
        },
        body: JSON.stringify({
          language: 'ko',
          server: '1614|KR|KR',
          cs_code: csCode,
          coupon: coupon.trim(),
          additional_info: ADDITIONAL_INFO
        })
      }).then(async (response) => {
        const result = (await response.json())['msg'];
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '/images/alarm.jpeg',
          title: `Coupon Redeem - CS Code: ${csCode}`,
          message: `${coupon} : ${result}`,
          priority: 2
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

  if (!couponInput) {
    document.getElementById('result').innerText = 'Please enter coupon codes!';
    return;
  }

  const coupons = couponInput.split(',');
  document.getElementById('result').innerText = 'Processing coupons...';

  try {
    await redeemCoupons(coupons);
    document.getElementById('result').innerText = 'Coupons redeemed successfully!';
  } catch (error) {
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
});
