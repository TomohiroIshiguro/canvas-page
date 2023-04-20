// スタイル
// ----------------------------------------
const FULL_WIDTH = 900; // px
const MIN_HEIGHT = 1000; // px

const MARGIN = 10; // px
const PADDING = 10; // px

// 罫線
const STROKE_RED = "rgb(200, 0, 0)";

// 背景色
const FILL_PURPLE = "rgba(0, 0, 200, 0.5)";

// フォント
const H1_TYPE = "H1";
const H1_SIZE = 48; // px
const H1 = "bold " + H1_SIZE + "px serif";

const H2_TYPE = "H2";
const H2_SIZE = 32; // px
const H2 = "bold " + H2_SIZE + "px serif";

const DEFAULT_SIZE = 18; // px
const DEFAULT = DEFAULT_SIZE + "px serif";

const FONT_BLACK = "rgb(0, 0, 0)";
const FONT_WHITE = "rgb(255, 255, 255)";
const FONT_RED = "rgb(255, 0, 0)";

// 改行
const LINE_BREAK = "\n";

// スタンプ
const STAMP_SIZE = 32; // px

// Canvas へ data を描画する
// ----------------------------------------
function draw() {
  const canvas = document.getElementById("tutorial");
  canvas.width = FULL_WIDTH;

  // canvas の高さを再計算する
  let height = calcRectHeight(draft.sections.length);
  if (height < MIN_HEIGHT) {
    height = MIN_HEIGHT;
  }
  canvas.height = height;

  // canvas に図形・文字を描画する
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    // レイアウト
    for (let i = 0; i < data.sections.length; i++) {
      const r = draft.sections[i]; // rectangle の 'r'
      if (r.rect && r.stroke) {
        // 罫線のみの矩形の場合
        if (r.text) {
          drawText(ctx, r, FONT_BLACK);
          resetRectPosition(i);
        }
        // DEBUG
        const rectangle = new Path2D();
        rectangle.rect(r.rect.x, r.rect.y, r.rect.w, r.rect.h);
        if (r.fill) ctx.fillStyle = r.fill; // 罫線のスタイル
        if (r.stroke) ctx.strokeStyle = r.stroke; // 罫線のスタイル
        if (r.alpha) ctx.globalAlpha = r.alpha; // 透明色のスタイル
        ctx.stroke(rectangle);
      }

      if (r.rect && r.fill) {
        // 背景色をもつ矩形の場合
        const rectangle = new Path2D();
        rectangle.rect(r.rect.x, r.rect.y, r.rect.w, r.rect.h);
        if (r.fill) ctx.fillStyle = r.fill; // 罫線のスタイル
        if (r.stroke) ctx.strokeStyle = r.stroke; // 罫線のスタイル
        if (r.alpha) ctx.globalAlpha = r.alpha; // 透明色のスタイル
        ctx.fill(rectangle);
        if (r.text) {
          drawText(ctx, r, FONT_WHITE);
        }
      }
    }

    // スタンプ
    stamps_data.stamps.map((c) => {
      // circle の 'c'
      if (c.arc) {
        let circle = new Path2D();
        c.arc.map((a) => {
          // arc の 'a'
          if (a.arc) {
            circle.arc(a.x, a.y, a.w, a.h, a.arc, a.close);
          } else {
            circle.moveTo(a.x, a.y);
          }
        });
        if (c.fill) ctx.fillStyle = c.fill; // 罫線のスタイル
        if (c.stroke) ctx.strokeStyle = c.stroke; // 罫線のスタイル
        if (c.alpha) ctx.globalAlpha = c.alpha; // 透明色のスタイル
        ctx.stroke(circle);
        // テキストを描画する
        if (c.text) {
          ctx.fillStyle = FONT_RED;
          ctx.font = H1;
          ctx.fillText(
            c.text,
            c.arc[0].x - (STAMP_SIZE + MARGIN) / 2,
            c.arc[0].y + (STAMP_SIZE + MARGIN) / 2
          );
        }
      }
    });
  }
}

// canvas の上辺から指定のブロックの高さを計算する
function calcRectHeight(max) {
  let height = 0;
  for (let i = 0; i < max; i++) {
    // 2 カラムの時に、セクションの高さを比較して高いほうに合わせる
    if (
      draft.sections[i - 1] &&
      draft.sections[i].rect.y == draft.sections[i - 1].rect.y &&
      draft.sections[i].rect.h < draft.sections[i - 1].rect.h
    ) {
      continue;
    }
    height =
      parseInt(draft.sections[i].rect.y) +
      parseInt(draft.sections[i].rect.h) +
      MARGIN;
  }
  return Math.ceil(height);
}

// テキストを描画する
function drawText(ctx, r, fontColor) {
  ctx.fillStyle = fontColor;
  if (r.heading == H1_TYPE) {
    ctx.font = H1;
    drawTextArea(ctx, r, H1_SIZE);
  } else if (r.heading == H2_TYPE) {
    ctx.font = H2;
    drawTextArea(ctx, r, H2_SIZE);
  } else {
    ctx.font = DEFAULT;
    drawTextArea(ctx, r, DEFAULT_SIZE);
  }
}
function drawTextArea(ctx, r, fontSize) {
  if (r.rect && r.stroke) {
    // 改行を含むテキストを描画する (見出し、本文)
    // NOTE: 改行文字で行を改行する、且つ行がブロックの幅を超えたら自動的に改行する
    const areaWidth = r.rect.w > PADDING * 2 ? r.rect.w - PADDING * 2 : 10; // px
    const lines = r.text.split(LINE_BREAK);
    let y = parseInt(r.rect.y) + fontSize;
    r.rect.h = fontSize + MARGIN;
    for (let i = 0; i < lines.length; i++) {
      // 改行文字で行を改行した時の行ごとに
      let tempLine = "";
      if (lines[i].length == 0 && i < lines.length - 1) {
        // 空行の場合は、ブロックの高さを更新して次の行の処理へ移る
        y += Math.ceil(fontSize * 1.3);
        r.rect.h += Math.ceil(fontSize * 1.3);
        continue;
      }
      for (let j = 0; j < lines[i].length; j++) {
        // 1 文字ずつ加えて、ブロックの幅を超えるか判定する
        tempLine += lines[i][j];
        if (ctx.measureText(tempLine).width > areaWidth) {
          // 行の途中でブロックの幅を超えた時
          ctx.fillText(
            tempLine.substring(0, tempLine.length - 1),
            parseInt(r.rect.x) + MARGIN,
            y
          );
          y += Math.ceil(fontSize * 1.3);
          r.rect.h += Math.ceil(fontSize * 1.3);
          if (j < lines[i].length) j--;
          tempLine = "";
        } else if (j == lines[i].length - 1) {
          // 行末に達した時
          ctx.fillText(tempLine, parseInt(r.rect.x) + MARGIN, y);
          if (i < lines.length - 1) {
            y += Math.ceil(fontSize * 1.3);
            r.rect.h += Math.ceil(fontSize * 1.3);
          }
        }
      }
    }
  } else {
    // 改行を含まないテキストを描画する (プレースホルダー、スタンプなど)
    ctx.fillText(
      r.text,
      parseInt(r.rect.x) + MARGIN,
      parseInt(r.rect.y) + fontSize
    );
  }
}

// 編集中の値を編集する
// ----------------------------------------
// H1 見出しブロックを追加する
function addH1() {
  const y = calcRectHeight(draft.sections.length);
  draft.sections.push({
    heading: H1_TYPE,
    text: "H1",
    rect: { x: 0, y: y, w: FULL_WIDTH, h: H1_SIZE + PADDING },
    stroke: STROKE_RED,
  });
  drawEdited();
}
// H2 見出しブロックを追加する
function addH2() {
  const y = calcRectHeight(draft.sections.length);
  draft.sections.push({
    heading: H2_TYPE,
    text: "H2",
    rect: { x: 0, y: y, w: FULL_WIDTH, h: H2_SIZE + PADDING },
    stroke: STROKE_RED,
  });
  drawEdited();
}
// 本文ブロックを追加する
function addRect() {
  const y = calcRectHeight(draft.sections.length);
  draft.sections.push({
    text: "content",
    rect: { x: 0, y: y, w: FULL_WIDTH, h: DEFAULT_SIZE + MARGIN },
    stroke: STROKE_RED,
  });
  drawEdited();
}

// 動画プレーヤーブロックを追加する
function addImage() {
  const y = calcRectHeight(draft.sections.length);
  draft.sections.push({
    text: "image placeholder",
    url: "https://example.com/test.png",
    rect: { x: 0, y: y, w: 400, h: 250 },
    fill: FILL_PURPLE,
  });
  drawEdited();
}
// 動画プレーヤーブロックを追加する
function addVideoPlayer() {
  const y = calcRectHeight(draft.sections.length);
  draft.sections.push({
    text: "video player placeholder",
    url: "https://example.com/test.png",
    rect: { x: 0, y: y, w: 400, h: 250 },
    fill: FILL_PURPLE,
  });
  drawEdited();
}

// スタンプ (スマイル) を追加する
function addSmileStamp() {
  stamps_draft.stamps.push({ arc: SMILE_MARK_STAMP, stroke: FONT_RED });
  drawEdited();
}
// スタンプ (済み) を追加する
function addDoneStamp() {
  stamps_draft.stamps.push({
    text: "済",
    arc: DONE_MARK_STAMP,
    stroke: FONT_RED,
  });
  drawEdited();
}

// 編集内容をリセットする
function resetEdited() {
  // レイアウト
  draft = JSON.parse(JSON.stringify(initial));
  data = draft;
  // スタンプ
  stamps_draft = JSON.parse(JSON.stringify(stamps_initial));
  stamps_data = stamps_draft;
  drawInitial();
}

// Canvas へ data を再描画する
// ----------------------------------------
function drawInitial() {
  document.getElementById("tutorial").getContext("2d").reset();
  data = initial;
  stamps_data = stamps_initial;
  draw();
  showForms();
}
function drawEdited() {
  document.getElementById("tutorial").getContext("2d").reset();
  data = draft;
  stamps_data = stamps_draft;
  draw();
  showForms();
}
