let submitBtn = document.getElementById('sub-btn');

// API কনফিগ
const BIN_ID = '68ae98da43b1c97be92c8452';
const BIN_API = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const API_KEY = '$2a$10$Uy5Sn6efPq3TetXXz4m8uuxCQpD/p3NdzILOjWvV5zvZKhHhPX6CS';

/**
 * পেজ লোড হলে লোকালস্টোরেজ থেকে ডেটা নাও
 */
let totalAsset = Number(localStorage.getItem('totalAsset')) || 5000;
let personal =
  Number(localStorage.getItem('thePersonal')) || Math.round(totalAsset / 3);
let relative =
  Number(localStorage.getItem('theRelatiive')) || Math.round(totalAsset / 3);
let forAllah =
  Number(localStorage.getItem('forAllah')) || Math.round(totalAsset / 3);

updateUI();

/**
 * সাবমিট বাটনে ক্লিক
 */
// submitBtn.addEventListener('click', checkDataType);
submitBtn.addEventListener('click', () => {
  let passKey = document.getElementById('pass').value;
  if (passKey == '12345') checkDataType();
  if (passKey != '12345') alert('please give correct pass key');
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
  saveData(); // প্রতি সাবমিটের পর সেভ করার চেষ্টা
}

/**
 * আগের ভ্যালু নেয়া
 */
function getPreviousValue(x) {
  let theTotalAsset = Number(localStorage.getItem('totalAsset')) || totalAsset;
  let thePersonal = Number(localStorage.getItem('thePersonal')) || personal;
  let theRelatiive = Number(localStorage.getItem('theRelatiive')) || relative;
  let theForAllah = Number(localStorage.getItem('forAllah')) || forAllah;

  let input = document.getElementById('income-amount').value;

  if (x == 'theTotalAsset') return theTotalAsset;
  if (x == 'input') return Number(input);
  if (x == 'personal') return thePersonal;
  if (x == 'forAllah') return theForAllah;
  if (x == 'relative') return theRelatiive;
}

/**
 * Expense হিসাব
 */
function itExpense() {
  let currentAsset =
    getPreviousValue('theTotalAsset') - getPreviousValue('input');
  let itemName = document.getElementById('itemName').value;
  let inputAmount = getPreviousValue('input');

  // total asset update
  localStorage.setItem('totalAsset', currentAsset);

  // কোন ভাগ থেকে খরচ হলো
  if (itemName == '1') {
    let newPersonal = getPreviousValue('personal') - inputAmount;
    localStorage.setItem('thePersonal', newPersonal);
  } else if (itemName == '3') {
    let newForAllah = getPreviousValue('forAllah') - inputAmount;
    localStorage.setItem('forAllah', newForAllah);
  } else {
    let newRelative = getPreviousValue('relative') - inputAmount;
    localStorage.setItem('theRelatiive', newRelative);
  }

  updateUI();
}

/**
 * Income হিসাব
 */
function itIncome() {
  let currentAsset =
    getPreviousValue('theTotalAsset') + getPreviousValue('input');
  let inputAmount = getPreviousValue('input');

  // total asset update
  localStorage.setItem('totalAsset', currentAsset);

  // income ৩ ভাগে ভাগ
  let newPersonal = getPreviousValue('personal') + Math.round(inputAmount / 3);
  let newRelative = getPreviousValue('relative') + Math.round(inputAmount / 3);
  let newForAllah = getPreviousValue('forAllah') + Math.round(inputAmount / 3);

  localStorage.setItem('thePersonal', newPersonal);
  localStorage.setItem('theRelatiive', newRelative);
  localStorage.setItem('forAllah', newForAllah);

  updateUI();
}

/**
 * UI Update ফাংশন
 */
function updateUI() {
  document.getElementById('totalAsset').innerText =
    getPreviousValue('theTotalAsset');
  let bFor = document.querySelectorAll('.b-for');
  bFor[0].innerText = getPreviousValue('personal');
  bFor[1].innerText = getPreviousValue('relative');
  bFor[2].innerText = getPreviousValue('forAllah');
}

/**
 * লোকালস্টোরেজ থেকে সব ডেটা অবজেক্ট বানানো
 */
function getAllData() {
  return {
    id: 'solayman',
    totalAsset: getPreviousValue('theTotalAsset'),
    personal: getPreviousValue('personal'),
    relative: getPreviousValue('relative'),
    forAllah: getPreviousValue('forAllah'),
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * লোকালস্টোরেজে fallback
 */
function saveLocal(data) {
  try {
    localStorage.setItem('backupData', JSON.stringify(data));
    console.log('💾 Saved locally:', data);
    document.getElementById('status').textContent =
      '💾 Saved locally: ' + JSON.stringify(data, null, 2);
  } catch (err) {
    console.error('❌ Local save failed:', err);
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
      saveLocal(data); // সাথে লোকালেও রাখি
    } catch (err) {
      console.error('❌ Error saving to API:', err);
      document.getElementById('status').textContent =
        '❌ API Save Failed: ' + err.message;
      saveLocal(data);
    }
  } else {
    console.warn('📴 Offline mode: saving locally');
    document.getElementById('status').textContent =
      '📴 Offline - Saved locally.';
    saveLocal(data);
  }
}

// আবার অনলাইনে এলে লোকাল ব্যাকআপ সিঙ্ক করবে
window.addEventListener('online', () => {
  const backup = localStorage.getItem('backupData');
  if (backup) {
    try {
      const obj = JSON.parse(backup);
      saveData(obj);
      localStorage.removeItem('backupData');
    } catch (err) {
      console.error('❌ Backup Sync Error:', err);
    }
  }
});
