async function getPageKey() {
  const pattern = /'Page-Key':\s*'([a-zA-Z0-9]*)'/i;

  try {
    // Ambil Page-Key
    const response = await fetch('https://coupon.withhive.com/2376');
    if (!response.ok) {
      throw new Error(`Failed to fetch Page-Key: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const match = text.match(pattern);
    if (!match) {
      throw new Error('Page-Key not found in response');
    }

    return match[1]; // Return the Page-Key
  } catch (error) {
    console.error(`Error fetching Page-Key: ${error.message}`);
    throw error; // Rethrow the error for further handling
  }
}

// Tombol untuk menampilkan Page-Key
document.getElementById('redeemButton').addEventListener('click', async () => {
  try {
    const pageKey = await getPageKey();
    // Tampilkan Page-Key di elemen dengan id 'result'
    document.getElementById('result').innerText = `Page-Key: ${pageKey}`;
  } catch (error) {
    // Tampilkan error di elemen dengan id 'result'
    document.getElementById('result').innerText = `Error: ${error.message}`;
  }
});
