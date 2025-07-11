import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
const firebaseConfig = {
  databaseURL:
    "https://price-comparison-d64e5-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const refInDatabase = ref(database, "lists");

const compareBtn = document.getElementById("compare-btn");
const deleteBtn = document.getElementById("delete");

const product = document.getElementById("product");
const amount = document.getElementById("amount");
const unit = document.getElementById("units");
const price = document.getElementById("price");

const captionEl = document.getElementById("caption-el");
const tableBodyEl = document.getElementById("table-body");

let lists = [];

function getValue() {
  return {
    productV: product.value,
    amountV: Number(amount.value),
    unitV: unit.value,
    priceV: Number(price.value),
  };
}

onValue(refInDatabase, function (snapshot) {
  const doesSnapshot = snapshot.exists();

  if (doesSnapshot) {
    const snapshotValue = snapshot.val();
    lists = Object.values(snapshotValue);
    tableBodyEl.innerHTML = "";
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      renderTable(list[0], list[1], list[2], list[3], i);
    }
    renderCheapest(lists);
  }
});

compareBtn.addEventListener("click", function () {
  getData();
});

//---------------get data from user input
function getData() {
  const values = getValue();
  let inputData = [];
  if (values.productV && values.amountV && values.priceV) {
    inputData = [values.productV, values.amountV, values.unitV, values.priceV];
    push(refInDatabase, inputData);
  } else {
    alert("Please fill in all fields before comparing.");
  }
}

//----------------------------Render function
function renderTable(product, amount, unit, price, i) {
  tableBodyEl.innerHTML += `
            <tr id="row-${i}">
              <th scope="row">${
                unit === "pieces"
                  ? `${amount} ${product}`
                  : `${amount}${unit} of ${product}`
              }</th>
              <td>${amount} ${unit}</td>
              <td>${price}</td>
              <td class="perPrice">💰${calPerPrice(
                unit,
                price,
                amount
              )} per ${unitF(unit, product)}</td>
            </tr>`;
}

function calPerPrice(unit, price, amount) {
  let perPrice;
  if (unit === "g" || unit === "ml") {
    perPrice = price / amount;
  } else if (unit === "kg" || unit === "l") {
    perPrice = price / 1000;
  } else if (unit === "pieces") {
    perPrice = price / amount;
  }
  perPrice = Number(perPrice).toFixed(3);
  return perPrice;
}

function unitF(unit, product) {
  if (unit === "g" || unit === "kg") {
    return "100g";
  } else if (unit === "ml" || unit === "l") {
    return "100ml";
  } else if (unit === "pieces") {
    return product;
  }
}

// -----------------------Render cheapest row
function findCheapest() {
  let perPriceList = [];
  const perPriceEls = document.getElementsByClassName("perPrice");
  const perPriceArr = Object.values(perPriceEls);
  for (let i = 0; i < perPriceArr.length; i++) {
    const ElValue = perPriceArr[i].innerHTML;
    const perPriceValue = ElValue.replace("💰", "").split(" ")[0];
    perPriceList.push(Number(perPriceValue));
  }

  if (perPriceList.length > 0) {
    let cheapest = perPriceList[0];
    let indexCheapest = 0;
    for (let i = 0; i < perPriceList.length; i++) {
      const current = perPriceList[i];
      if (current < cheapest) {
        cheapest = current;
        indexCheapest = i;
      }
    }
    console.log("indexCheapest", indexCheapest);
    return indexCheapest;
  } else {
    return false;
  }
}

function renderCheapest(lists) {
  const allRows = document.querySelectorAll("tr");
  allRows.forEach((row) => {
    row.style.backgroundColor = "";
  });
  const cheapestIndex = findCheapest();

  if (cheapestIndex === false) return;

  const cheapestRow = document.getElementById(`row-${cheapestIndex}`);
  if (cheapestRow) {
    cheapestRow.style.backgroundColor = "#f2f299";
    const cheapestArr = lists[cheapestIndex];
    const cheapestProduct = `${cheapestArr[0]} ${cheapestArr[1]}${cheapestArr[2]}`;
    captionEl.innerHTML = `✅ <span style="background-color: #f2f299">${cheapestProduct}</span> is the better deal`;
    console.log(cheapestIndex, "cheapestIndex");
  }
}

deleteBtn.addEventListener("dblclick", function () {
  remove(refInDatabase);
  tableBodyEl.innerHTML = "";
  captionEl.innerHTML = "";
});
