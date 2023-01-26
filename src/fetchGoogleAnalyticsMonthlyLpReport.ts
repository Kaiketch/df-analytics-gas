import { Env } from './env'; // gitignoreした設定ファイル(module)

function fetchGoogleAnalyticsMonthlyLpReport() {

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Env.properties.GSS_SHEET_NAME_LP);
    const lastRow = sheet?.getRange("A:A").getValues().filter(String).length ?? 0;

    const apiURL = `https://analyticsdata.googleapis.com/v1beta/properties/${Env.properties.GA_PROPERTY_ID}:runReport`;
    const payload = {
        "dimensions": [{ "name": "year" }, { "name": "month" }],
        "metrics": [{ "name": "eventCount" },],
        "dateRanges": { "startDate": "29daysAgo", "endDate": "yesterday" },
         "dimensionFilter": {
            "filter": {
              "fieldName": "eventName",
              "stringFilter": {
                "value": "view_lp"
              }
            }
          },
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

    let ga4Data = [];
    let year = rows[0]["dimensionValues"][0]["value"];
    let month = rows[0]["dimensionValues"][1]["value"];
    let lpCount = parseInt(rows[0]["metricValues"][0]["value"]);

    ga4Data[0] = [year + "/" + month, lpCount, 0, 0];

    const payload2 = {
        "dimensions": [{ "name": "year" }, { "name": "month" }],
        "metrics": [{ "name": "eventCount" },],
        "dateRanges": { "startDate": "29daysAgo", "endDate": "yesterday" },
         "dimensionFilter": {
            "filter": {
              "fieldName": "eventName",
              "stringFilter": {
                "value": "view_lp_tp"
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
    const response2 = UrlFetchApp.fetch(apiURL, options2);
    const json2 = JSON.parse(response2.getContentText());
    const rows2 = json2["rows"];

    if(rows2 != null) {
        let lpCount2 = parseInt(rows2[0]["metricValues"][0]["value"]);
        ga4Data[0].splice(2, 1, lpCount2);    
    }

    const payload3 = {
        "dimensions": [{ "name": "year" }, { "name": "month" }],
        "metrics": [{ "name": "eventCount" },],
        "dateRanges": { "startDate": "29daysAgo", "endDate": "yesterday" },
         "dimensionFilter": {
            "filter": {
              "fieldName": "eventName",
              "stringFilter": {
                "value": "view_lp_tt"
              }
            }
          },
    };
    const options3 = {
        "payload": JSON.stringify(payload3),
        "myamethod": "POST",
        "muteHttpExceptions": true,
        "headers": { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
        "contentType": "application/json"
    };
    const response3 = UrlFetchApp.fetch(apiURL, options3);
    const json3 = JSON.parse(response3.getContentText());
    const rows3 = json3["rows"];

    if(rows3 != null) {
        let lpCount3 = parseInt(rows3[0]["metricValues"][0]["value"]);
        ga4Data[0].splice(3, 1, lpCount3);
    }

    sheet?.getRange(lastRow + 1, 1, ga4Data.length, ga4Data[0].length).setValues(ga4Data);
}
