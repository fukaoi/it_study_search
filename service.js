/*
 * action.js、batch.jsのビジネスロジックの
 * 定義 
 */

var {Response} = require('ringo/webapp/response');
var email = require('ringo/mail');
var config = require('./config.js');
var strings = require('ringo/utils/strings');
var simpleFormat = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

exports.Service = {
  email: "",
  keyword: "",

  /**
   * トリミング(全角、半角のスペース削除)
   */
  trim : function(key) {
    return key.replace(/^\s+|\s+$/g, '');
  },

  /**
   * カンマ(,)でreplace
   */
   commaReplace: function(key) {
    return key.replace(/\s+/g, ',');
  },

  /**
   * 確認メールを入力されたメールアドレスに送信する
   */
  sendMail: function(to, text) {
    email.send({from: config.email.from, to: to, 
                subject: config.email.subject, text: text});   
  },

  /**
   * ユニークIDの作成
   */ 
  createUniqId: function() {
    return strings.digest(new Date().toString());
  },

  /**
   * GData calendarのSummary的な値を読みやすい形に加工する
   */
  modifySummary : function(content) {
    var CR = "\r\n";
    return content.replace(' JST ', CR)
        .replace('予定のステータス: 確定', '')
        .replace('予定の説明", "詳細内容') + CR;       
  }
};

/**
 * 検索対象期間のDateTimeを取得する
 */
exports.Service.searchTerm = {
  sd: simpleFormat, 
  start: function() {
    return this.sd.format(new Date());
  },
  end: function() {
    var duration = config.durationDays * 24 * 60 * 60 * 1000;
    var now = new Date().getTime();
    return this.sd.format(new Date(now + duration));
  }
};

/**
 * メールフォーマットの作成
 */
exports.Service.textFormat = {
  confirm: function(uid) {
    var sv = exports.Service;
    return Response.skin(module.resolve
                         ('skins/email/confirm.tpl'),
                         { keyword: sv.commaReplace(sv.trim(sv.keyword)),
                           completeUrl: config.fqdn 
                           + "/complete?uid=" + uid}).body;
  },
  batch : function(uid, keyword, text) {
    return Response.skin(module.resolve
                         ('skins/email/batch.tpl'),
                         { keyword: keyword,
                           withdrawUrl: config.fqdn 
                           + "/withdraw?uid=" + uid,
                           textBody: text}).body;
  },
  batchPart : function(studyTitle, plainText) {
    return Response.skin(module.resolve
                         ('skins/email/batchPart.tpl'),
                         { studyTitle: studyTitle,
                           plainText: plainText}).body;
  }
};