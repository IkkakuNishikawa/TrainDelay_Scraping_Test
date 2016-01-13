var client = require('cheerio-httpcli'); // スクレイピングモジュール読み込み

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport('SMTP', { // ローカルのメールサーバを叩く
    host: 'localhost',
    port: 25
});

// node-cronの定義
var mycron = require('cron').CronJob;
var job = new mycron({
  cronTime: '*/15 * * * * *', //１５秒ごと
  onTick: function() {

    // ページ読み込み
		client.fetch('http://transit.yahoo.co.jp/traininfo/area/5/')
		.then(function (result) {
			var $ = result.$;

		    $('.trouble').find('a').each(function(id) {

		        client.fetch($(this).attr('href'))
		        .then(function (result) {
		            var $ = result.$;
		            var RailName = $('h1[class=title]').text();
		            var detail = $('#mdServiceStatus > dl > dd > p').text();

                var PutString=RailName + ':' + detail;
		            console.log(PutString);
                // unicode文字でメールを送信
                var mailOptions = {
                    from: '鉄道運行情報 <n.traintest@gmail.com>', // sender address
                    to: 'n.traintest@gmail.com', // list of receivers
                    subject: RailName+' 遅延', // Subject line
                    text: PutString // plaintext body
                };
                // 先ほど宣言したトランスポートオブジェクトでメールを送信
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + response.message);
                    }
                });
		        });

		    });

		});

  },
  start: true //newした後即時実行するかどうか
});
job.start();
