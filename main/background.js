const cors_api_url = 'https://proxy.cors.sh/';
const jsonUrl = 'https://proxy.cors.sh/https://github.com/itsKyro23/listcodes/raw/main/starseed2.json';

// Fungsi untuk mendapatkan Page-Key
async function getPageKey() {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

  try {
    const response = await fetch(`${cors_api_url}https://coupon.withhive.com/2376`, {
      method: 'POST',
      headers: {
        'Origin': 'https://your-website.com', // Gantilah dengan domain asal Anda
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch Page-Key: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    const match = text.match(pattern);

    if (!match) throw new Error('Page-Key not found');
    return match[1];

  } catch (error) {
    console.error(`Error fetching Page-Key: ${error.message}`);
    throw error;
  }
}

// Fungsi untuk mendapatkan kupon dari JSON
async function getCouponsFromJSON() {
  try {
    const response = await fetch(jsonUrl, {
      method: 'GET',
      headers: {
        'Origin': 'https://your-website.com',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch coupons: ${response.status} ${response.statusText}`);
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching coupons: ${error.message}`);
    throw error;
  }
}

// Fungsi untuk menampilkan daftar kupon dalam dropdown
async function populateCouponSelect() {
  try {
    const couponData = await getCouponsFromJSON();
    const couponSelect = document.getElementById('couponSelect');
    couponSelect.innerHTML = ''; // Clear existing options

    couponData.forEach((couponSet, index) => {
      const groupOption = document.createElement('option');
      groupOption.value = index;
      groupOption.textContent = `${couponSet.name} (${couponSet.update})`;
      couponSelect.appendChild(groupOption);
    });

  } catch (error) {
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
}

// Fungsi untuk redeem kupon yang dipilih
async function redeemCoupon(csCode, selectedGroup, pageKey) {
  try {
    const couponData = await getCouponsFromJSON();
    const selectedCoupons = couponData[selectedGroup].coupon;

    const resultElement = document.getElementById('result');
    
    // Loop untuk meredeem setiap kupon
    for (const coupon of selectedCoupons) {
      const redeemResponse = await fetch(`${cors_api_url}https://coupon.withhive.com/tp/coupon/use`, {
        method: 'POST',
        headers: {
          'Page-Key': pageKey,
          'Origin': 'https://your-website.com',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          language: 'en',
          server: '2376|GLOBAL|GLOBAL',
          cs_code: csCode.trim(),
          coupon_code: coupon.trim(),
        }),
      });

      if (!redeemResponse.ok) throw new Error(`Failed to redeem coupon: ${coupon}`);

      const result = (await redeemResponse.json())['msg'];
      const resultMessage = document.createElement('p');
      resultMessage.textContent = `Redeemed coupon: ${coupon} for CS Code: ${csCode}\nResult: ${result}`;
      resultElement.appendChild(resultMessage);
    }

  } catch (error) {
    const resultElement = document.getElementById('result');
    const errorMessage = document.createElement('p');
    errorMessage.textContent = `Error redeeming coupon: ${error.message}`;
    resultElement.appendChild(errorMessage);
  }
}

// Event listener untuk tombol redeem
document.getElementById('redeemButton').addEventListener('click', async () => {
  const csCodeInput = document.getElementById('csCodeInput').value;
  const couponSelect = document.getElementById('couponSelect');
  const selectedGroup = couponSelect.value;

  if (!csCodeInput) {
    document.getElementById('result').innerHTML = '<p>Please enter CS Code!</p>';
    return;
  }

  if (selectedGroup === '') {
    document.getElementById('result').innerHTML = '<p>Please select a coupon group to redeem!</p>';
    return;
  }

  const csCodes = csCodeInput.split(',');
  const pageKey = await getPageKey();

  // Clear previous result
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = '';

  // Redeem semua CS Code yang dimasukkan
  for (const csCode of csCodes) {
    await redeemCoupon(csCode.trim(), selectedGroup, pageKey);
  }
});

// Populasi dropdown kupon saat halaman dimuat
window.onload = populateCouponSelect;
