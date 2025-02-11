let exchangeRate = 26.83; // 25.942654
let isJioCoinToINR = true;
let history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
let autoUpdateInterval;
const resultWrapper = document.querySelector('.result-wrapper');
const autoManual = document.querySelector('.autoManual');
const exchangeRateInput = document.getElementById("exchangeRateInput");

document.getElementById('convert').addEventListener('click', convert);
document.getElementById('increase').addEventListener('click', () => adjustValue(0.5));
document.getElementById('decrease').addEventListener('click', () => adjustValue(-0.5));
document.getElementById('copyResult').addEventListener('click', copyResult);
document.getElementById('shareResult').addEventListener('click', shareResult);
document.getElementById('toggleConverter').addEventListener('click', toggleConverter);
document.getElementById('clearHistory').addEventListener('click', clearHistory);
exchangeRateInput.addEventListener('input', updateExchangeRate);

resultWrapper.style.display = 'none';

/* Jio To INR */
document.querySelectorAll('table').forEach((table, tablei) => {
  if (tablei === 0) {
    table.querySelectorAll('tr').forEach((tableRow) => {     
      const tableValue = tableRow.querySelector('.tableValue');
      const tableRate = tableRow.querySelector('.tableRate');
      tableRate.innerHTML = "Rs." + tableValue.innerHTML * exchangeRate;
    });
  }
  if (tablei === 1) {
    table.querySelectorAll('tr').forEach((tableRow) => {
      const tableValue = tableRow.querySelector('.tableValue');
      const tableRate = tableRow.querySelector('.tableRate');
      tableRate.innerHTML = '₹' + tableRate.innerHTML;
      let value = tableValue.innerHTML / exchangeRate;
      tableRate.innerHTML = value.toFixed(2);
      tableValue.innerHTML = '₹' + tableValue.innerHTML;
    });
  }
});

function fetchExchangeRate() {
  exchangeRate = (25 + Math.random()).toFixed(6);
  exchangeRateInput.value = exchangeRate;
  document.querySelector('#exchangeRateb').innerHTML = exchangeRate;
  document.querySelector('.coinPrice').innerHTML = `<b>Jio: ${exchangeRate}</b>`;
}

function updateExchangeRate() {
  if (autoManual.classList.contains('active')) {
    exchangeRate = parseFloat(exchangeRateInput.value) || exchangeRate;
    document.querySelector('#exchangeRateb').innerHTML = exchangeRate;
    document.querySelector('.coinPrice').innerHTML = `<b>Jio: ${exchangeRate}</b>`;
  }
}

function convert() {
  let inputValue = parseFloat(document.getElementById("valueInput").value);
  if (isNaN(inputValue) || inputValue <= 0) {
    document.querySelector('.required').style.display = 'block';
  } else {
    let outputValue, resultText;
    resultWrapper.style.display = 'block';
    document.querySelector('.required').style.display = 'none';
    
    if (isJioCoinToINR) {
      outputValue = inputValue * exchangeRate;
      resultText = `${inputValue} JioCoins = ₹${outputValue.toFixed(2)} INR`;
    } else {
      outputValue = inputValue / exchangeRate;
      resultText = `₹${inputValue.toFixed(2)} INR = ${outputValue.toFixed(2)} JioCoins`;
    }

    document.querySelector('#result').innerHTML = resultText;
    saveHistory(resultText);
  }
}

function adjustValue(amount) {
  let inputField = document.getElementById("valueInput");
  let currentValue = parseFloat(inputField.value) || 0;
  let newValue = Math.max(0, currentValue + amount);
  inputField.value = newValue.toFixed(2);
}

function shareResult() {
  let resultText = document.getElementById("result").innerText;
  if (navigator.share) {
    navigator.share({ title: "JioCoins to INR Converter", text: resultText });
  }
}

function toggleConverter() {
  isJioCoinToINR = !isJioCoinToINR;
  document.getElementById("converterTitle").innerHTML = isJioCoinToINR ? "JioCoin to INR Converter" : "INR to JioCoin Converter";
  document.getElementById("toggleConverter").innerHTML = isJioCoinToINR ? "INR <i class='fa fa-chevron-right'></i> JioCoin" : "JioCoin <i class='fa fa-chevron-right'></i> INR";
  document.getElementById("inputLabel").innerHTML = isJioCoinToINR ? "Enter JioCoins:" : "Enter INR:";
}

function saveHistory(entry) {
  if (history.some(item => item.text === entry)) return;

  let timestamp = new Date().getTime();
  history.unshift({ text: entry, time: timestamp });

  history = history.filter(item => (timestamp - item.time) < 7 * 24 * 60 * 60 * 1000);
  history = history.slice(0, 10);

  localStorage.setItem("conversionHistory", JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = history.length ? "" : '<div>Not Found</div>';

  history.forEach(item => {
    const li = document.createElement('li');
    const time = new Date(item.time);
    li.innerHTML = `<span>${item.text}</span> <b>${time.toLocaleDateString()}</b>`;
    historyList.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem("conversionHistory");
  history = [];
  displayHistory();
}

exchangeRateInput.setAttribute('disabled', 'disabled');

autoManual.addEventListener('click', () => {
  autoManual.classList.toggle('active');
  if (!autoManual.classList.contains('active')) {
    autoManual.innerHTML = '<i class="fa fas fa-pause"></i>';
    exchangeRateInput.setAttribute('disabled', 'disabled');

    if (!autoUpdateInterval) {
      autoUpdateInterval = setInterval(fetchExchangeRate, 1000);
    }
  } else {
    autoManual.innerHTML = '<i class="fa fa-play"></i>';
    exchangeRateInput.removeAttribute('disabled');

    if (autoUpdateInterval) {
      clearInterval(autoUpdateInterval);
      autoUpdateInterval = null;
    }
  }
  exchangeRateInput.focus();
});

if (!autoUpdateInterval) {
  autoUpdateInterval = setInterval(fetchExchangeRate, 1000);
}

displayHistory();

/* Accordion */
const accordionButtons = document.querySelectorAll("[data-accordion-target]");
let activeAccordionButton = null;

function toggleAccordion(clickedButton) {
  const targetPanel = document.querySelector(clickedButton.dataset.accordionTarget);
  
  if (activeAccordionButton && activeAccordionButton !== clickedButton) {
    const activePanel = document.querySelector(activeAccordionButton.dataset.accordionTarget);
    activePanel.style.maxHeight = null;
    activeAccordionButton.parentElement.classList.remove("active");
  }

  clickedButton.parentElement.classList.toggle("active");
  activeAccordionButton = clickedButton;

  if (targetPanel.style.maxHeight) {
    targetPanel.style.maxHeight = null;
  } else {
    targetPanel.style.maxHeight = `${targetPanel.scrollHeight}px`;
  }
}

accordionButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) {
      button.classList.remove("active");
      document.querySelector(button.dataset.accordionTarget).style.maxHeight = null;
    } else {
      toggleAccordion(button);
    }
  });
});
