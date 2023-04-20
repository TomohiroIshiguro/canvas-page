// 画面訪問時の値
// ----------------------------------------

// ページデータ 初期値
// NOTE: 実際には API で取得した値を初期値とする
// NOTE: DynamoDB などを使えば JSON オブジェクト形式のままデータを保持できる
const initial = {
  id: 1,
  sections: [
    {
      rect: { x: 200, y: 0, w: 500, h: H1_SIZE + PADDING },
      stroke: "rgb(200, 0, 0)",
      heading: H1_TYPE,
      text: "Hello, canvas world!",
    },
    {
      rect: { x: 0, y: 68, w: 900, h: 52 },
      stroke: "rgb(200, 0, 0)",
      text: "(※) Javascript の素振りのつもりで書いてみた。\n用意した初期値を、Canvas に描画する + 簡易的なレイアウトを編集する処理だけ。",
    },
    {
      rect: { x: 0, y: 130, w: 900, h: H2_SIZE + PADDING },
      stroke: "rgb(200, 0, 0)",
      heading: H2_TYPE,
      text: "使い方:",
    },
    {
      rect: { x: 0, y: 182, w: 400, h: 250 },
      fill: "rgba(0, 0, 200, 0.5)",
      text: "video player placeholder",
      url: "https://example.com/test.png",
    },
    {
      rect: { x: 410, y: 182, w: 490, h: 270 },
      stroke: "rgb(200, 0, 0)",
      text: "1. Web ブラウザで index.html を開く。 (開発中は Chrome を使っていました)\n2. 初期表示は、index.html の定数が表示されています。 (バックエンドがあれば API で取得してください)\n3. canvas の下にある「編集: 」で見出し、本文ボタンを押してください。canvas に新しい領域が、サイドバーにその領域のフォームが追加されます。\n4. スマイル、済みボタンを押すと canvas の上にスタンプが押せます (今は位置固定)。\n5. 「再描画: 」の初期と編集中ボタンを押すと、処理 (画面訪問時) の状態と編集後の状態を表示できます。",
    },
    {
      rect: { x: 0, y: 460, w: 900, h: H2_SIZE + PADDING },
      stroke: "rgb(200, 0, 0)",
      heading: H2_TYPE,
      text: "結論:",
    },
    {
      rect: { x: 0, y: 512, w: 900, h: 100 },
      stroke: "rgb(200, 0, 0)",
      text: "- 今回スクラッチで描いてみた感想としてだいぶ形になって嬉しい。\n- やってみると、初期値データを JSON オブジェクトのまま保持すればデータは意外といけそう。\n- テキストも canvas に絵で描画するので部分選択してコピーされることのないページになった。\n- 動画ビューアなどのリソースは Canvas 上に位置を指定して設置する。",
    },
    {
      rect: { x: 0, y: 622, w: 900, h: 52 },
      stroke: "rgb(200, 0, 0)",
      text: "- 表示しているテキストを直接編集することはできない。編集するには別途工夫が必要。\n例えば、サイドバーにプロパティ項目一覧を用意して、そこで編集した値でCanvas を再描画するなど。",
    },
    {
      rect: { x: 0, y: 684, w: 900, h: 52 },
      stroke: "rgb(200, 0, 0)",
      text: "- レスポンシブに対応しようとしたら、計算する値が多くて、工夫が必要。\n- メンテナンスは大変そう。",
    },
    {
      rect: { x: 0, y: 746, w: 900, h: H2_SIZE + PADDING },
      stroke: "rgb(200, 0, 0)",
      heading: H2_TYPE,
      text: "Files:",
    },
    {
      rect: { x: 0, y: 798, w: 900, h: 124 },
      stroke: "rgb(200, 0, 0)",
      text: "- index.html ... ページ、初期値データ\n- layout-canvas.html ... 初期値/編集後データを元に canvasへ図形・文字を描画する\n- aside-forms.html ... 初期値/編集後データを元に、サイドにフォームを描画する\n- canvas-data.js ... 初期値/編集後データ\n- style.css ... ページのスタイル",
    },
  ],
};

// スタンプ 初期値
const stamps_initial = {
  stamps: [],
};

// 編集中の値
// ----------------------------------------

var draft = JSON.parse(JSON.stringify(initial));
var stamps_draft = JSON.parse(JSON.stringify(stamps_initial));

// Canvas に描画する値
// ----------------------------------------

var data = draft;
var stamps_data = stamps_draft;

// スタンプ デザイン
// ----------------------------------------

const SMILE_MARK_STAMP = [
  { x: 75, y: 75, w: 50, h: 0, arc: Math.PI * 2, close: true },
  { x: 110, y: 75 },
  { x: 75, y: 75, w: 35, h: 0, arc: Math.PI, close: false },
  { x: 65, y: 65 },
  { x: 60, y: 65, w: 5, h: 0, arc: Math.PI * 2, close: true },
  { x: 95, y: 65 },
  { x: 90, y: 65, w: 5, h: 0, arc: Math.PI * 2, close: true },
]; // 複雑な図形は配列で表現する

const DONE_MARK_STAMP = [
  {
    x: Math.ceil(FULL_WIDTH * 0.9),
    y: 75,
    w: STAMP_SIZE + MARGIN,
    h: 0,
    arc: Math.PI * 2,
    close: true,
  },
];
