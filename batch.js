var {Response} = require('ringo/webapp/response');
var {Member} = require('./model.js'); 
var config = require('./config.js');
var {Service} = require('./service.js');

var {DateTime} = com.google.gdata.data;
var cservice = com.google.gdata.client.calendar.CalendarService("");
var eventFeedUrl = java.net.URL(config.calendarUrl);
var query = com.google.gdata.client.calendar.CalendarQuery(eventFeedUrl);
var events = com.google.gdata.data.calendar.CalendarEventFeed().class;

/**
 * メイン処理
 */
var main = function(email, uid, keyword) {
  var entry = "", text = "";
  query.setFullTextQuery(keyword);
  query.setMinimumStartTime(
    DateTime.parseDateTime(Service.searchTerm.start()));
  query.setMaximumStartTime(
    DateTime.parseDateTime(Service.searchTerm.end()));

  var resultFeed = cservice.query(query, events);
  var count = resultFeed.getEntries().size();

  if(count === 0) {return;}

  for (var i = 0; i < count; i++) {
    entry = resultFeed.getEntries().get(i);
    text += Service.textFormat.batchPart(
      entry.getTitle().getPlainText(),
      Service.modifySummary(entry.getTextContent()
                            .getContent()
                            .getPlainText())
    );
  }
  var textFormat = Service.textFormat.batch(uid, keyword, text);
  Service.sendMail(email, textFormat);
};

/**
 * mainファンクションを呼び出す
 */
if (require.main === module) {
  try {
    var results = Member.getBatchInfo();
    for each(var result in results) {
      main(result.email, result.uid, result.keyword);      
    }
  } catch (error) {
    print(error);
  }
}
