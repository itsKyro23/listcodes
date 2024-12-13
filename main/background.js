// URL JSON yang berisi kupon
const jsonUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/itsKyro23/listcodes/raw/main/starseed2.json'; // Gantilah dengan URL JSON yang sesuai

// Fungsi untuk mendapatkan Page-Key
async function getPageKey() {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;
  const cors_api_url = 'https://cors-anywhere.herokuapp.com/';

  let pageKey;
  try {
    const response = await fetch(cors_api_url + 'https://coupon.withhive.com/2376', {
      method: 'POST',
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

// Fungsi untuk mendapatkan kupon dari JSON
async function getCouponsFromJSON() {
  try {
    const response = await fetch(jsonUrl,{
      method: 'GET',
      headers: {
        'Origin': 'https://your-website.com',
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
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

    // Clear existing options (jika ada)
    couponSelect.innerHTML = '';

    // Menambahkan setiap grup kupon sebagai opsi dalam dropdown
    couponData.forEach((couponSet, index) => {
      const groupOption = document.createElement('option');
      groupOption.value = index; // Simpan index sebagai nilai untuk mengidentifikasi grup
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

    // Loop untuk meredeem setiap kupon dalam grup yang dipilih
    for (const coupon of selectedCoupons) {
      const cors_api_url = 'https://cors-anywhere.herokuapp.com/';
      const redeemResponse = await fetch(cors_api_url + 'https://coupon.withhive.com/tp/coupon/redeem', {
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
          coupon_code: coupon.trim(), // Kirim kupon yang akan di-redeem
        }),
      });

      if (!redeemResponse.ok) {
        throw new Error(`Failed to redeem coupon: ${coupon}`);
      }

      // Ambil pesan dari respons redeem
      const result = (await redeemResponse.json())['msg'];

      // Ambil elemen dengan id 'result'
      const resultElement = document.getElementById('result');
      
      // Buat elemen baru untuk menampilkan hasil redeem kupon
      const resultMessage = document.createElement('p');
      resultMessage.textContent = `Redeemed coupon: ${coupon} for CS Code: ${csCode}\nResult: ${result}`;
      
      // Tambahkan hasil ke dalam elemen 'result' (menambah bukan menggantikan)
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
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = '<p>Please enter CS Code!</p>';
    return;
  }

  if (selectedGroup === '') {
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = '<p>Please select a coupon group to redeem!</p>';
    return;
  }

  const csCodes = csCodeInput.split(',');
  const pageKey = await getPageKey();

  // Clear previous result
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = '';

  // Redeem semua CS Code yang dimasukkan untuk grup kupon yang dipilih
  for (const csCode of csCodes) {
    await redeemCoupon(csCode.trim(), selectedGroup, pageKey);
  }
});

// Populasi dropdown kupon saat halaman dimuat
window.onload = populateCouponSelect;
