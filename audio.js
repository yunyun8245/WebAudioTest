function OnButtonClick() {
  
  // canvas要素を取得
  var c = document.getElementById('canvas');
  var cw;
  var ch;

  //bar間隔の取得
  var step_bar_value = document.getElementById("output");     //index.htmlのidがoutputのやつに出力
  step_bar_value.innerText = document.forms.bt1.range.value;  //実際に代入
  var step_bar = parseInt(document.forms.bt1.range.value, 10); //このスクリプトで使うために10進数へ変換して代入(fome id = "bt1",input type="range" から数値をとってきてる)

  //再生ファイル名の指定
  var Music_title = document.forms.bt1.MusicTitle.value;

  //グラデーションの色の指定
  var FirstColor = document.forms.bt1.FirstColor.value;
  var SecondColor = document.forms.bt1.SecondColor.value;
  var InnerBarColor = document.forms.bt1.InnerBarColor.value;

  // canvasサイズをwindowサイズにする
  c.width = cw = window.innerWidth * 0.85;
  //cw = window.innerWidth / 1.0;//バーの横の大きさに影響する
  c.height = ch = window.innerHeight * 0.8;//波の領域の高さ

  //  描画に必要なコンテキスト(canvasに描画するためのAPIにアクセスできるオブジェクト)を取得
  var ctx = c.getContext('2d');

  // AudioNodeを管理するAudioContextの生成
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  /**
   * 音声ファイルローダー
   */
  var Loader = function (url) {
    this.url = url;  // �ǂݍ��މ����f�[�^��URL
  };

  // XMLHttpRequestを利用して音声データ(バッファ)を読み込む。
  Loader.prototype.loadBuffer = function () {
    var loader, request;
    loader = this;
    request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      // 取得したデータをデコードする。
      audioCtx.decodeAudioData(this.response, function (buffer) {
        if (!buffer) {
          console.log('error');
          return;
        }
        loader.playSound(buffer);  // デコードされたデータを再生する。
      }, function (error) {
        console.log('decodeAudioData error');
      });
    };

    request.onerror = function () {
      console.log('Loader: XHR error');
    };

    request.send();
  };

  // 読み込んだ音声データ(バッファ)を再生と波形データの描画を開始する。
  Loader.prototype.playSound = function (buffer) {
    var visualizer = new Visualizer(buffer);
  };


  /**
   * ビジュアライザー
   */
  var Visualizer = function (buffer) {
    this.sourceNode = audioCtx.createBufferSource();  // AudioBufferSourceNodeを作成
    this.sourceNode.buffer = buffer;                  // 取得した音声データ(バッファ)を音源に設定

    this.analyserNode = audioCtx.createAnalyser();    // AnalyserNodeを作成
    this.freqs = new Uint8Array(this.analyserNode.frequencyBinCount);  // 周波数領域の波形データを格納する配列を生成 
    this.sourceNode.connect(this.analyserNode);       // AudioBufferSourceNodeをAnalyserNodeに接続
    this.analyserNode.connect(audioCtx.destination);  // AnalyserNodeをAudioDestinationNodeに接続


    this.sourceNode.start(0);                         // 再生開始
    this.draw();                                      // 描画開始
  };

  Visualizer.prototype.draw = function () {
    // 0~1まで設定でき、0に近いほど描画の更新がスムーズになり, 1に近いほど描画の更新が鈍くなる。
    this.analyserNode.smoothingTimeConstant = 0.67

    // FFTサイズを指定する。デフォルトは2048。
    this.analyserNode.fftSize = 2048;

    // 周波数領域の波形データを引数の配列に格納するメソッド。
    // analyserNode.fftSize / 2の要素がthis.freqsに格納される。今回の配列の要素数は1024。
    this.analyserNode.getByteFrequencyData(this.freqs);

    // 全ての波形データを描画するために、一つの波形データのwidthを算出する。
    var barWidth = cw / this.analyserNode.frequencyBinCount;

    //ここで黒で書き直すことで画面がリセットされる
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, cw * 1, ch);          //左下と右上の点を指定して四角形を描画
    ctx.lineWidth = 10;

    // analyserNode.frequencyBinCountはanalyserNode.fftSize / 2の数値。よって今回は1024。
    for (var i = 0; i < this.analyserNode.frequencyBinCount; i += step_bar) {
      var value1 = this.freqs[i];        // 配列には波形データ 0 ~ 255までの数値が格納されている。
      var percent1 = value1 / 255;       // 255が最大値なので波形データの%が算出できる。
      //if (percent1*100 > 5) percent1 = 5/100;
      if (percent1 * 100 < 1) percent1 = 1 / 100;

      var height1 = ch * percent1 * 0.8; // %に基づく描画する高さを算出
      var height2 = ch * percent1 * 0.8; // %に基づく描画する高さを算出

      //＊バーの位置＊
      //


      //円の中心
      var pos_c_x = cw / 4.0;//割る数字を変えると面白い。２がデフォルト。
      var pos_c_y = ch / 2.0 -50;
      // //バーの先端（円の外周）算出のためにつか変数
      // var hoge_x = i;   //横軸の値を代入
      // var hoge_y;                  //縦軸の値を保存しておく変数
      // var Max_r = pos_c_y;         //半径の最大値を画面縦の高さの半分に設定（縦と横を同じにしたいから）
      // var r = value1 / Max_r;      //半径の大きさ（バーの大きさ）を半径の最大値から算出

      // //円の関数(iを横軸のx,valueを円の半径のrとして算出)
      // hoge_y = Math.sqrt((r * r) - ((hoge_x - pos_c_x) * (hoge_x - pos_c_x))) + pos_c_y;


      var pos_x1 = i * barWidth;
      var pos_y1 = ch / 2;
      var pos_x2 = barWidth;
      var pos_y2 = -height1 / 2;//上向き用
      var pos_y3 = height2 / 2; //下向き用

      //canvasの回転
      ctx.save();         //セーブ
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(((i/this.analyserNode.frequencyBinCount) * 360*2) * Math.PI / 180);
      ctx.translate(-cw / 2, -ch / 2);
      //四角形にグラデーションを書く
      var grd1 = ctx.createLinearGradient(pos_x1, pos_y1, pos_x1, pos_y2);
      if(i*2 > this.analyserNode.frequencyBinCount)
      {
        grd1.addColorStop(0, FirstColor);
        grd1.addColorStop(1, InnerBarColor);
      }
      else
      {
        grd1.addColorStop(0, FirstColor);
        grd1.addColorStop(0.5, SecondColor);  
      }
      ctx.fillStyle = grd1;
      // ctx.fillStyle = 'rgb(255,255,255)';
      // ctx.strokeStyle = 'rgb(255,255,255)';
      ctx.fillRect(pos_c_x, pos_c_y, pos_x2*6, pos_y2);
      //ctx.fillRect(pos_x1, pos_y1, pos_x2, pos_y3);
      ctx.restore();      //ロード
    }

    window.requestAnimationFrame(this.draw.bind(this));
  };

  // requestAnimationFrameを多くのブラウザで利用するためにprefixの記載
  var setUpRAF = function () {
    var requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  };

  setUpRAF();
  var loader = new Loader(Music_title);
  loader.loadBuffer();

}