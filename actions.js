var {Response} = require('ringo/webapp/response');
var {Member} = require('./model.js'); 
var {Service} = require('./service.js');

/**
 * index page
 */
exports.index = function (req) {
  return Response.skin(module.resolve('skins/index.html'), {
    title: 'IT勉強会サーチ',
    headMessage: '検索したい勉強会キーワードと受け取るメールアドレスを入力してください'
  });
};

/**
 * confirm page (※POST Only)
 */
exports.confirm = {};
exports.confirm.POST = function (req) {
  Service.email = req.params['email'];
  Service.keyword = req.params['keyword'];
  if (Service.email === "" || Service.keyword === "") {
    return Response.skin(module.resolve('skins/index.html'), {
      title: 'エラー',
      errorMessage: '入力した値に問題があります、再度入力してください'
    });
  }

  if (Member.check() === false) {
    return Response.skin(module.resolve('skins/index.html'), {
      title: 'エラー',
      errorMessage: '既に申し込み済みのメールが存在しております、' +
                    'お手元のメールを確認の上そちらを先に登録完了ください'
    });    
  }

  var uid = Service.createUniqId();
  Member.confirm(uid);
  Service.sendMail(Service.email, 
                   Service.textFormat.confirm(uid));
  return Response.skin(module.resolve('skins/index.html'), {
    title: '受付致しました',
    headMessage: '入力いただいたメールアドレスに登録完了のURLを送信しました'
  });
};

/**
 * complete page
 */
exports.complete = {};
exports.complete.GET = function(req) {
  var uid = req.params['uid'];
  if (uid === "") {
    return Response.skin(module.resolve('skins/complete.html'), {
      title: 'エラー',
      errorMessage: 'URLに問題があります'});
  }

  Member.complete(uid);
  return Response.skin(module.resolve('skins/complete.html'), {
    title: '登録が完了しました',
    headMessage: '今後、検索ワードにマッチした勉強会をメールでお知らせ致します'
  });
};

/**
 * withdraw page
 */
exports.withdraw = {};
exports.withdraw.GET = function(req) {
  var uid = req.params['uid'];
  if (uid === "") {
    return Response.skin(module.resolve('skins/complete.html'), 
    { title: 'エラー',
      errorMessage: 'URLに問題があります'});
  }

 Member.withdraw(uid);
  return Response.skin(module.resolve('skins/complete.html'), {
    title: '退会が完了しました',
    headMessage: '今後、IT 勉強会サーチメールは送信されなくなります'
  });  
};