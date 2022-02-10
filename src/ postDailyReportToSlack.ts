import { Env } from './env'; // gitignoreした設定ファイル(module)

function postDailyReportToSlack() {
    let token = Env.properties.SL_BOT_TOKEN;
    let slackApp = SlackApp.create(token);
    let channelId = Env.properties.SL_CHANNEL_NAME;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Env.properties.GSS_SHEET_NAME);
    const lastRow = sheet?.getRange('A:A').getValues().filter(String).length ?? 0;
    const lastRowValues = sheet?.getRange(lastRow, 1, 1, sheet?.getLastColumn() ?? 0).getValues() ?? [];

    const row = lastRowValues[0];
    const date = `${row[2]}年${row[3]}月${row[4]}日`;
    const mau = row[11];
    const firstCount = row[14];
    const subCount = row[15];
    const firstRate = Math.round(parseFloat(row[17]) * 100);
    const subRate = Math.round(parseFloat(row[18]) * 100);
    const mauRate = Math.round(parseFloat(row[19]) * 100);

    let message = `${date}\n初回：${firstCount}（${firstRate}%）\n購読：${subCount}（${subRate}%）\nMAU：${mau}（${mauRate}%）`;
    slackApp.chatPostMessage(channelId, message);
}
