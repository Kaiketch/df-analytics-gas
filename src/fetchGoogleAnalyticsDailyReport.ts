import { Env } from './env'; // gitignoreした設定ファイル(module)

function fetchGoogleAnalyticsDailyReport() {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Env.properties.GSS_SHEET_NAME);
    const lastRow = sheet?.getRange("A:A").getValues().filter(String).length ?? 0;

    const apiURL = `https://analyticsdata.googleapis.com/v1beta/properties/${Env.properties.GA_PROPERTY_ID}:runReport`;
    const payload = {
        "dimensions": [{ "name": "date" }, { "name": "year" }, { "name": "month" }, { "name": "day" }, { "name": "platform" }],
        "metrics": [{ "name": "newUsers" }, { "name": "active28DayUsers" }, { "name": "totalPurchasers" }],
        "dateRanges": { "startDate": "yesterday", "endDate": "yesterday" },
//        "dateRanges": { "startDate": "2023-01-02", "endDate": "yesterday" },
        "orderBys": [
            { "dimension": { "orderType": "ALPHANUMERIC", "dimensionName": "date" }, "desc": false },
            { "dimension": { "orderType": "ALPHANUMERIC", "dimensionName": "platform" }, "desc": false }
        ]
    };
    const options = {
        "payload": JSON.stringify(payload),
        "myamethod": "POST",
        "muteHttpExceptions": true,
        "headers": { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
        "contentType": "application/json"
    };
    const response = UrlFetchApp.fetch(apiURL, options);
    const json = JSON.parse(response.getContentText());
    const rows = json["rows"];

    const apiURL2 = `https://analyticsdata.googleapis.com/v1beta/properties/${Env.properties.GA_PROPERTY_ID}:runReport`;
    const payload2 = {
        "dimensions": [{ "name": "date" }, { "name": "platform" }],
        "metrics": [{ "name": "eventCount" },],
        "dateRanges": { "startDate": "yesterday", "endDate": "yesterday" },
//        "dateRanges": { "startDate": "2023-01-02", "endDate": "yesterday" },
        "dimensionFilter": {
            "filter": {
              "fieldName": "eventName",
              "stringFilter": {
                "value": "view_lp"
              }
            }
          },
    };
    const options2 = {
        "payload": JSON.stringify(payload2),
        "myamethod": "POST",
        "muteHttpExceptions": true,
        "headers": { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
        "contentType": "application/json"
    };
    const response2 = UrlFetchApp.fetch(apiURL2, options2);
    const json2 = JSON.parse(response2.getContentText());
    const rows2 = json2["rows"];

    let ga4Data = [];
    let index = -1;
    let preDate = null;
    for (let i = 0; i < rows.length; i++) {
        let date = rows[i]["dimensionValues"][0]["value"];
        let year = rows[i]["dimensionValues"][1]["value"];
        let month = rows[i]["dimensionValues"][2]["value"];
        let day = rows[i]["dimensionValues"][3]["value"];
        let platform = rows[i]["dimensionValues"][4]["value"];
        let newUsers = parseInt(rows[i]["metricValues"][0]["value"]);
        let mau = parseInt(rows[i]["metricValues"][1]["value"]);
        let purchase = parseInt(rows[i]["metricValues"][2]["value"]);

        if (date != preDate) {
            ga4Data[++index] = [year + "/" + month + "/" + day, 0, 0, 0, 0, 0, 0, 0];
            preDate = date;

            for (let j = 0; j < rows2.length; j++) {
                let date2 = rows2[j]["dimensionValues"][0]["value"];
                let platform2 = rows2[j]["dimensionValues"][1]["value"];
                let eventCount = parseInt(rows2[j]["metricValues"][0]["value"]);
    
                if(date == date2 && platform2 == "web") {
                    ga4Data[index].splice(7, 1, eventCount);
                }
            }
        }

        if (platform == "Android") {
            ga4Data[index].splice(1, 3, mau, newUsers, purchase);
        }
        else if (platform == "iOS"){
            ga4Data[index].splice(4, 3, mau, newUsers, purchase);
        }
    }
    sheet?.getRange(lastRow + 1, 1, ga4Data.length, ga4Data[0].length).setValues(ga4Data);
}
