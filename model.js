/*
 * Databaseを操作する
 */

var config = require('./config.js');
var {Service} = require('./service.js');
var Store = require("ringo/storage/sql/store").Store;

/**
 * MySQL接続情報
 */
var store = new Store({
  "url": config.db.url,
  "driver": config.db.driver,
  "username": config.db.username,
  "password": config.db.password
});

/**
 * Member Entity defined
 */
var MAPPING_MEMBER = {
  "table": "member",
  "properties": {
    "email": {"type": "string", "column": "email", "nullable": false},
    "status": {"type": "string", "column": "status", "nullable": false},
    "keyword": {"type": "string", "column": "keyword","nullable": false},
    "uid": {"type": "string", "column": "uid", "nullable": false}
  }    
};

/**
 * Memberオブジェクトを生成、各種メソッドの定義
 */
exports.Member = {
  loadObject: store.defineEntity("Member", MAPPING_MEMBER),

  /**
   * メールアドレスをキーにして多重登録の有無を確認する
   */
  check: function() {
    var result = 
    this.loadObject.query().
        equals('email',Service.email).select();

    if (result.length !== 0) {
      for each(res in result) {
        if (res.status === 'waiting') return false;
      }
    }
    return true;
  },

  /**
   * 仮登録処理
   */
  confirm: function(uid) {
    var member = new this.loadObject();
    member.email = Service.email;
    member.status = 'waiting';
    member.keyword = Service.commaReplace(
                     Service.trim(Service.keyword));
    member.uid = uid;
    member.save();
  },

  /**
   * 登録完了処理
   */
  complete: function(uid) {
    var result = this.loadObject.query()
        .equals('uid', uid).select();
    result[0].status = 'active';
    result[0].save();  
  },

  /**
   * 退会処理
   */
  withdraw: function(uid) {
    var result = this.loadObject.query()
        .equals('uid', uid).select();
    result[0].status = 'inactive';
    result[0].save();  
  },

  /**
   * バッチで使用する対象データーをDBから取得する
   */
  getBatchInfo: function() {
    var result = this.loadObject.query()
        .equals('status', 'active').select();
    return result;
  }
};