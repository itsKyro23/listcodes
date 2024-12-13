// URL JSON yang berisi kupon
const jsonUrl = 'https://api.example.com/coupons'; // Gantilah dengan URL JSON yang sesuai

// Fungsi untuk mendapatkan Page-Key
async function getPageKey() {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;
  const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

  let pageKey;
  try {
    const response = await fetch(cors_api_url + 'https://coupon.withhive.com/2376', {
      method: 'GET',
      headers: {
        'Origin': 'https://your-website.com', // Gantilah dengan domain asal Anda
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Page-Key from 2376: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    const match = text.match(pattern);
    if (!match) {
      throw new Error('Page-Key not found in response');
    }
    pageKey = match[1];
  } catch (error) {
    throw new Error(`Error fetching Page-Key: ${error.message}`);
  }

  return pageKey;
}

// Fungsi untuk mendapatkan info tambahan menggunakan CS Code
async function getAdditionalInfo(csCode, pageKey) {
  const cors_api_url = 'https://cors-anywhere.herokuapp.com/';
  const serverListResponse = await fetch(cors_api_url + 'https://coupon.withhive.com/tp/coupon/server_list', {
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
    }),
  });

  if (!serverListResponse.ok) {
    throw new Error(`Failed to fetch server list for CS Code ${csCode}: ${serverListResponse.status} ${serverListResponse.statusText}`);
  }

  const data = await serverListResponse.json();
  if (!data.serverList || !data.serverList['0'] || !data.serverList['0'].additionalinfo) {
    throw new Error(`Additional info not found for CS Code ${csCode}`);
  }

  return data.serverList['0'].additionalinfo;
}

// Fungsi untuk mendapatkan kupon dari JSON
async function getCouponsFromJSON() {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch coupons: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Mengembalikan seluruh data JSON
  } catch (error) {
    throw new Error(`Error fetching coupons: ${error.message}`);
  }
}

// Fungsi untuk menampilkan daftar kupon dalam dropdown
async function populateCouponSelect() {
  try {
    const couponData = await getCouponsFromJSON();
    const couponSelect = document.getElementById('couponSelect');

    // Menambahkan semua kupon ke dropdown
    couponData.forEach(couponSet => {
      couponSet.coupon.forEach(coupon => {
        const option = document.createElement('option');
        option.value = coupon;
        option.textContent = `${couponSet.name} (${couponSet.update}) - ${coupon}`;
        couponSelect.appendChild(option);
      });
    });
  } catch (error) {
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
}

// Fungsi untuk redeem kupon yang dipilih
async function redeemCoupon(csCode, coupon, pageKey) {
  try {
    const additionalInfo = await getAdditionalInfo(csCode, pageKey);
    document.getElementById('result').innerText = `Successfully redeemed coupon: ${coupon} for CS Code: ${csCode}\nAdditional Info: ${additionalInfo}`;
  } catch (error) {
    document.getElementById('result').innerText = `Error redeeming coupon: ${error.message}`;
  }
}

// Event listener untuk tombol redeem
document.getElementById('redeemButton').addEventListener('click', async () => {
  const csCodeInput = document.getElementById('csCodeInput').value;
  const couponSelect = document.getElementById('couponSelect');
  const selectedCoupon = couponSelect.value;

  if (!csCodeInput) {
    document.getElementById('result').innerText = 'Please enter CS Codes!';
    return;
  }

  if (!selectedCoupon) {
    document.getElementById('result').innerText = 'Please select a coupon to redeem!';
    return;
  }

  const csCodes = csCodeInput.split(',');
  const pageKey = await getPageKey();

  // Redeem semua CS Code yang dimasukkan
  for (const csCode of csCodes) {
    await redeemCoupon(csCode.trim(), selectedCoupon, pageKey);
  }
});

// Populasi dropdown kupon saat halaman dimuat
window.onload = populateCouponSelect;
    
