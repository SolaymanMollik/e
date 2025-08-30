let submitBtn = document.getElementById('sub-btn');

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
submitBtn.addEventListener('click', checkDataType);

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
