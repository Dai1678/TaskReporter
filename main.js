function main() {

  var projectNames = [];

  var daiPrivateProjectNames = getProjectInfo(GET_DAI_PRIVATE_PROJECT_URL);
  var uNoteProjectNames = getProjectInfo(GET_U_NOTE_PROJECT_URL);
  for (var i = 0; i < daiPrivateProjectNames.length; i++) {
    projectNames.push(daiPrivateProjectNames[i]);
  }

  for (var i = 0; i < uNoteProjectNames.length; i++) {
    projectNames.push(uNoteProjectNames[i]);
  }

  var issues = [];
  issues.push(getIssueInfo(GET_MY_PRIVATE_ISSUE_URL, MY_PRIVATE_PROJECT_ID));
  issues.push(getIssueInfo(GET_U_NOTE_ISSUE_URL, JOBGRAM_PROJECT_ID));
  issues.push(getIssueInfo(GET_U_NOTE_ISSUE_URL, MKTG_PROJECT_ID));

  var sendMessage = "@channel\n本日のタスクレポートをお知らせします\n\n";

  for (var i = 0; i < issues.length; i++) {
    sendMessage += createMessage(projectNames[i], issues[i]);
    sendMessage += "--------------------------------------------\n\n";
  }

  sendSlack(sendMessage);
}

function getProjectInfo(url) {
  var archivedQuery = "&archived=false";
  var response = JSON.parse(UrlFetchApp.fetch(url + archivedQuery).getContentText());
  var projectNames = [];

  for (var i = 0; i < response.length; i++) {
    projectNames.push(response[i]["name"]);
  }

  return projectNames;
}

function getIssueInfo(url, projectId) {
  var projectQuery = "&projectId[]=" + projectId;
  var statusQuery = "&statusId[]=1&statusId[]=2";  //ステータス 未対応:1, 処理中:2
  var priorityQuery = "&priorityId[]=2&priorityId[]=3";  //優先度 高:2, 中:3
  var userQuery = "&assigneeId[]=" + MY_USER_ID1 + "&assigneeId[]=" + MY_USER_ID2;
  var sortQuery = "&sort=priority";
  var orderQuery = "&order=asc";
  var countQuery = "&count=100";

  var response = JSON.parse(UrlFetchApp.fetch(url + projectQuery + statusQuery + priorityQuery + userQuery + sortQuery + orderQuery + countQuery).getContentText());
  Logger.log(response);
  return response;
}

function createMessage(projectName, issue) {
  var sendMessage = projectName + " タスク一覧\n";

  for (var i = 0; i < issue.length; i++) {
    var summary = issue[i]["summary"];
    var dueDate = Utilities.formatDate(new Date(issue[i]["dueDate"]), 'Asia/Tokyo', 'MM月dd日');
    var status = issue[i]["status"]["name"] || "未設定";

    sendMessage += "- " + summary + "\n";
    sendMessage += "  期限日: " + dueDate + "  状態: " + status + "\n\n";
  }

  Logger.log(sendMessage);

  return sendMessage;

}

function sendSlack(message) {

  var payloadData = {
    "text": message,
    "channel": SLACK_CHANNEL_ID,
    "parse": "none",
    "as_user": true,
    "link_names": true
  }

  var payload = JSON.stringify(payloadData);

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": payload
  }

  UrlFetchApp.fetch(WEBHOOK_URL, options);

}
