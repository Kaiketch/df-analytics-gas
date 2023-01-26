import { Env } from './env'; // gitignoreした設定ファイル(module)

function postDailyReportToSlack() {
    let token = Env.properties.SL_BOT_TOKEN;
    let slackApp = SlackApp.create(token);
    let channelId = Env.properties.SL_CHANNEL_NAME;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Env.properties.GSS_SHEET_NAME);
    const lastRow = sheet?.getRange('A:A').getValues().filter(String).length ?? 0;

    const lastRowValues = sheet?.getRange(lastRow, 1, 1, sheet?.getLastColumn() ?? 0).getValues() ?? [];
    const row = lastRowValues[0];
    const date = row[0].toLocaleDateString('ja-JP');
    const mau = parseInt(row[8]);
    const firstCount = parseInt(row[11]);
    const subCount = parseInt(row[12]);
    const lpCount = parseInt(row[13]);

    const mauRate = Math.floor(parseFloat(row[14])*100);
    const firstCountRate = Math.floor(parseFloat(row[15])*100);
    const subCountRate = Math.floor(parseFloat(row[16])*100);
    const lpCountRate = Math.floor(parseFloat(row[17])*100);

    let message = `${date}\nLP：${lpCount} （${lpCountRate}%） \n新規ユーザー：${firstCount} （${firstCountRate}%）\nMAU：${mau} （${mauRate}%）\n購入：${subCount} （${subCountRate}%）`;
    slackApp.chatPostMessage(channelId, message);
}
