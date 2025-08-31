let submitBtn = document.getElementById('sub-btn');

// API কনফিগ
const BIN_ID = '68ae98da43b1c97be92c8452';
const BIN_API = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const BIN_LATEST = `${BIN_API}/latest`;
const API_KEY = '$2a$10$Uy5Sn6efPq3TetXXz4m8uuxCQpD/p3NdzILOjWvV5zvZKhHhPX6CS';

// প্রাথমিক ভ্যালু
let totalAsset = 0;
let personal = 0;
let relative = 0;
let forAllah = 0;

// শুরুতে API থেকে ডেটা লোড
fetchDataFromAPI();

/**
 * সাবমিট বাটনে ক্লিক
 */
submitBtn.addEventListener('click', () => {
  let passKey = document.getElementById('pass').value;
  if (passKey == '12345') checkDataType();
  else alert('please give correct pass key');
});

/**
 * কোন টাইপ (expense/income) সেটা চেক করা
 */
function checkDataType() {
  let dataType = document.getElementById('dataType').value;
  if (dataType == 'e') {
    itExpense();
  } else {
    itIncome();
  }
  saveData(); // প্রতি সাবমিটের পর API তে সেভ
}

/**
 * আগের ভ্যালু নেয়া
 */
function getPreviousValue(x) {
  let input = document.getElementById('income-amount').value;

  if (x == 'theTotalAsset') return totalAsset;
  if (x == 'input') return Number(input);
  if (x == 'personal') return personal;
  if (x == 'forAllah') return forAllah;
  if (x == 'relative') return relative;
}

/**
 * Expense হিসাব
 */
function itExpense() {
  let inputAmount = getPreviousValue('input');
  let currentAsset = getPreviousValue('theTotalAsset') - inputAmount;
  let itemName = document.getElementById('itemName').value;

  // total asset update
  totalAsset = currentAsset;

  // কোন ভাগ থেকে খরচ হলো (শুধু ওই ভাগ কমবে)
  if (itemName == '1') {
    personal = getPreviousValue('personal') - inputAmount;
  } else if (itemName == '2') {
    relative = getPreviousValue('relative') - inputAmount;
  } else if (itemName == '3') {
    forAllah = getPreviousValue('forAllah') - inputAmount;
  }

  updateUI();
}

/**
 * Income হিসাব
 */
function itIncome() {
  let inputAmount = getPreviousValue('input');
  let currentAsset = getPreviousValue('theTotalAsset') + inputAmount;

  // total asset update
  totalAsset = currentAsset;

  // income ৩ ভাগে ভাগ
  personal = getPreviousValue('personal') + Math.round(inputAmount / 3);
  relative = getPreviousValue('relative') + Math.round(inputAmount / 3);
  forAllah = getPreviousValue('forAllah') + Math.round(inputAmount / 3);

  updateUI();
}

/**
 * UI Update ফাংশন
 */
function updateUI() {
  document.getElementById('totalAsset').innerText = totalAsset;
  let bFor = document.querySelectorAll('.b-for');
  bFor[0].innerText = personal;
  bFor[1].innerText = relative;
  bFor[2].innerText = forAllah;
}

/**
 * ডেটা অবজেক্ট বানানো
 */
function getAllData() {
  return {
    id: 'solayman',
    totalAsset: totalAsset,
    personal: personal,
    relative: relative,
    forAllah: forAllah,
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * API থেকে ডেটা ফেচ করে অবজেক্টে সেট করা
 */
async function fetchDataFromAPI() {
  try {
    let res = await fetch(BIN_LATEST, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
      },
    });

    if (!res.ok) throw new Error('API থেকে ডেটা আনা যায়নি');

    let result = await res.json();
    let data = result.record;

    // অবজেক্ট আপডেট
    totalAsset = data.totalAsset || 0;
    personal = data.personal || 0;
    relative = data.relative || 0;
    forAllah = data.forAllah || 0;

    console.log('📥 API থেকে ডেটা লোড:', data);

    updateUI();
  } catch (err) {
    console.error('❌ ফেচ সমস্যা:', err.message);
  }
}

/**
 * jsonbin এ ডেটা সেভ করা
 */
async function saveData() {
  const data = getAllData();

  if (navigator.onLine) {
    try {
      let res = await fetch(BIN_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('API error: ' + res.status);

      let result = await res.json();
      console.log('✅ Saved to jsonbin:', result);
      document.getElementById('status').textContent =
        '✅ Saved online: ' + JSON.stringify(result, null, 2);
    } catch (err) {
      console.error('❌ Error saving to API:', err);
      document.getElementById('status').textContent =
        '❌ API Save Failed: ' + err.message;
    }
  } else {
    console.warn('📴 Offline mode: cannot save');
    document.getElementById('status').textContent =
      '📴 Offline - Data not saved (no local backup).';
  }
}
