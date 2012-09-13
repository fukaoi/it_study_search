DROP TABLE IF EXiSTS member;

CREATE TABLE `member` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` char(40) NOT NULL COMMENT 'メールアドレス', 
  `status` enum('waiting','active','inactive') NOT NULL COMMENT '会員ステータス',
  `keyword` text NOT NULL COMMENT '勉強会検索キーワード',
  `uid` char(40) NOT NULL COMMENT 'email + keywordでユニーク性を持たせるためのID',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
