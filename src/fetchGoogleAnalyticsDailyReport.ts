import { Env } from './env'; // gitignoreした設定ファイル(module)

function fetchGoogleAnalyticsDailyReport() {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Env.properties.GSS_SHEET_NAME);
    const lastRow = sheet?.getRange('A:A').getValues().filter(String).length ?? 0;

    const apiURL = `https://analyticsdata.googleapis.com/v1beta/properties/${Env.properties.GA_PROPERTY_ID}:runReport`;
    const payload = {
        'dimensions': [{ "name": "date" }, { "name": "year" }, { "name": "month" }, { "name": "day" }, { "name": "platform" }],
        'metrics': [{ 'name': 'newUsers' }, { 'name': 'active28DayUsers' }, { 'name': 'totalPurchasers' }],
        'dateRanges': { 'startDate': 'yesterday', 'endDate': 'yesterday' },
        "orderBys": [
            { "dimension": { "orderType": "ALPHANUMERIC", "dimensionName": "date" }, "desc": false },
            { "dimension": { "orderType": "ALPHANUMERIC", "dimensionName": "platform" }, "desc": false }
        ]
    };
    const options = {
        'payload': JSON.stringify(payload),
        'myamethod': 'POST',
        'muteHttpExceptions': true,
        'headers': { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
        'contentType': 'application/json'
    };
    const response = UrlFetchApp.fetch(apiURL, options);
    const json = JSON.parse(response.getContentText());
    const rows = json["rows"];
    let ga4Data = [];
    let index = 0;
    let preDate = null;
    let preNewUsers = 0;
    let preMau = 0;
    let prePurchase = 0;
    for (let i = 0; i < rows.length; i++) {
        let date = rows[i]["dimensionValues"][0]["value"];
        let year = rows[i]["dimensionValues"][1]["value"];
        let month = rows[i]["dimensionValues"][2]["value"];
        let day = rows[i]["dimensionValues"][3]["value"];
        let platform = rows[i]["dimensionValues"][4]["value"];
        let newUsers = parseInt(rows[i]["metricValues"][0]["value"]);
        let mau = parseInt(rows[i]["metricValues"][1]["value"]);
        let purchase = parseInt(rows[i]["metricValues"][2]["value"]);
        if (date != preDate && platform == "Android") {
            ga4Data[index] = [year + "/" + month + "/" + day, year + "/" + month, year, month, day, mau, newUsers, purchase];
            index++;
            preDate = date;
            preNewUsers = newUsers;
            preMau = mau;
            prePurchase = purchase;
        }
        else {
            ga4Data[index - 1].push(mau);
            ga4Data[index - 1].push(newUsers);
            ga4Data[index - 1].push(purchase);
            ga4Data[index - 1].push(mau + preMau);
            ga4Data[index - 1].push(newUsers + preNewUsers);
            ga4Data[index - 1].push(purchase + prePurchase);
        }
    }
    sheet?.getRange(lastRow + 1, 1, ga4Data.length, ga4Data[0].length).setValues(ga4Data);
}
