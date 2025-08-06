function getKuCoinData() {
  const url = "https://kucoin-proxy-efyy.onrender.com/kucoin";
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      endpoint: "/api/v1/accounts",
      method: "GET"
    }),
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.clear();
  sheet.getRange(1, 1).setValue("Type - Coin - Balance");

  let row = 2;
  for (let i = 0; i < data.data.length; i++) {
    const acc = data.data[i];
    sheet.getRange(row, 1).setValue(`${acc.type} - ${acc.currency} - ${acc.balance}`);
    row++;
  }
}
