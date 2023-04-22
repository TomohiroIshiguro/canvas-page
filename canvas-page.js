// クラス
class CanvasPage {
  #canvas;
  #sideForms;

  // 初期値、編集中の値
  #initial;
  #stamps_initial;

  #draft;
  #stamps_draft;

  #data;
  #stamps_data;

  // コンストラクタ
  // ----------------------------------------
  constructor(initial, stamps_initial) {
    this.#initial = JSON.parse(JSON.stringify(initial));
    this.#stamps_initial = JSON.parse(JSON.stringify(stamps_initial));

    this.#draft = JSON.parse(JSON.stringify(this.#initial));
    this.#stamps_draft = JSON.parse(JSON.stringify(this.#stamps_initial));

    this.#data = this.#draft;
    this.#stamps_data = this.#stamps_draft;

    this.#canvas = document.getElementById("tutorial");
  }

  // Getter/Setter
  // ----------------------------------------
  getDraft() {
    return this.#draft;
  }

  setDraft(draft) {
    this.#draft = draft;
  }

  getSideForms() {
    return this.#sideForms;
  }

  setSideForms(sideForms) {
    this.#sideForms = sideForms;
  }

  // Canvas へ data を描画する
  // ----------------------------------------
  draw() {
    this.#canvas.width = FULL_WIDTH;

    // canvas の高さを再計算する
    let height = this.calcRectHeight(this.#draft.sections.length);
    if (height < MIN_HEIGHT) {
      height = MIN_HEIGHT;
    }
    this.#canvas.height = height;

    // canvas に図形・文字を描画する
    if (this.#canvas.getContext) {
      const ctx = this.#canvas.getContext("2d");

      // レイアウト
      for (let i = 0; i < this.#data.sections.length; i++) {
        const r = this.#draft.sections[i]; // rectangle の 'r'
        if (r.rect && r.stroke) {
          // 罫線のみの矩形の場合
          if (r.text) {
            this.#drawText(ctx, r, FONT_BLACK);
            this.#resetRectPosition(i);
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
            this.#drawText(ctx, r, FONT_WHITE);
          }
        }
      }

      // スタンプ
      this.#stamps_data.stamps.map((c) => {
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
  calcRectHeight(max) {
    let height = 0;
    for (let i = 0; i < max; i++) {
      // 2 カラムの時に、セクションの高さを比較して高いほうに合わせる
      if (
        this.#draft.sections[i - 1] &&
        this.#draft.sections[i].rect.y == this.#draft.sections[i - 1].rect.y &&
        this.#draft.sections[i].rect.h < this.#draft.sections[i - 1].rect.h
      ) {
        continue;
      }
      height =
        parseInt(this.#draft.sections[i].rect.y) +
        parseInt(this.#draft.sections[i].rect.h) +
        MARGIN;
    }
    return Math.ceil(height);
  }

  // type を編集した際の rect の高さ、後続の要素の描画位置をリセットする
  #resetRectPosition(index) {
    for (let i = parseInt(index) + 1; i < this.#draft.sections.length; i++) {
      if (
        this.#draft.sections[i - 1] &&
        this.#draft.sections[i].rect.y == this.#draft.sections[i - 1].rect.y
      ) {
        // 2 カラムの場合
        continue;
      }

      // ブロックの位置を修正する
      const position = Math.ceil(this.calcRectHeight(i));
      if (
        this.#draft.sections[i + 1] &&
        this.#draft.sections[i].rect.y == this.#draft.sections[i + 1].rect.y
      ) {
        // 2 カラムの場合
        this.#draft.sections[i + 1].rect.y = position;
      }
      this.#draft.sections[i].rect.y = position;
    }
  }

  // テキストを描画する
  #drawText(ctx, r, fontColor) {
    ctx.fillStyle = fontColor;
    if (r.heading == H1_TYPE) {
      ctx.font = H1;
      this.#drawTextArea(ctx, r, H1_SIZE);
    } else if (r.heading == H2_TYPE) {
      ctx.font = H2;
      this.#drawTextArea(ctx, r, H2_SIZE);
    } else {
      ctx.font = DEFAULT;
      this.#drawTextArea(ctx, r, DEFAULT_SIZE);
    }
  }
  #drawTextArea(ctx, r, fontSize) {
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
  addH1() {
    const y = this.calcRectHeight(this.#draft.sections.length);
    this.#draft.sections.push({
      heading: H1_TYPE,
      text: "H1",
      rect: { x: 0, y: y, w: FULL_WIDTH, h: H1_SIZE + PADDING },
      stroke: STROKE_RED,
    });
    this.drawEdited();
  }
  // H2 見出しブロックを追加する
  addH2() {
    const y = this.calcRectHeight(this.#draft.sections.length);
    this.#draft.sections.push({
      heading: H2_TYPE,
      text: "H2",
      rect: { x: 0, y: y, w: FULL_WIDTH, h: H2_SIZE + PADDING },
      stroke: STROKE_RED,
    });
    this.drawEdited();
  }
  // 本文ブロックを追加する
  addRect() {
    const y = this.calcRectHeight(this.#draft.sections.length);
    this.#draft.sections.push({
      text: "content",
      rect: { x: 0, y: y, w: FULL_WIDTH, h: DEFAULT_SIZE + MARGIN },
      stroke: STROKE_RED,
    });
    this.drawEdited();
  }

  // 動画プレーヤーブロックを追加する
  addImage() {
    const y = this.calcRectHeight(this.#draft.sections.length);
    this.#draft.sections.push({
      text: "image placeholder",
      url: "https://example.com/test.png",
      rect: { x: 0, y: y, w: 400, h: 250 },
      fill: FILL_PURPLE,
    });
    this.drawEdited();
  }
  // 動画プレーヤーブロックを追加する
  addVideoPlayer() {
    const y = this.calcRectHeight(this.#draft.sections.length);
    this.#draft.sections.push({
      text: "video player placeholder",
      url: "https://example.com/test.png",
      rect: { x: 0, y: y, w: 400, h: 250 },
      fill: FILL_PURPLE,
    });
    this.drawEdited();
  }

  // スタンプ (スマイル) を追加する
  addSmileStamp() {
    this.#stamps_draft.stamps.push({ arc: SMILE_MARK_STAMP, stroke: FONT_RED });
    this.drawEdited();
  }
  // スタンプ (済み) を追加する
  addDoneStamp() {
    this.#stamps_draft.stamps.push({
      text: "済",
      arc: DONE_MARK_STAMP,
      stroke: FONT_RED,
    });
    this.drawEdited();
  }

  // 編集内容をリセットする
  resetEdited() {
    // レイアウト
    this.#draft = JSON.parse(JSON.stringify(this.#initial));
    this.#data = this.#draft;
    // スタンプ
    this.#stamps_draft = JSON.parse(JSON.stringify(this.#stamps_initial));
    this.#stamps_data = this.#stamps_draft;
    this.drawInitial();
  }

  // Canvas へ data を再描画する
  // ----------------------------------------
  drawInitial() {
    document.getElementById("tutorial").getContext("2d").reset();
    this.#data = this.#initial;
    this.#stamps_data = this.#stamps_initial;
    this.draw();
    if (this.#sideForms) {
      this.#sideForms.showForms();
    }
  }
  drawEdited() {
    document.getElementById("tutorial").getContext("2d").reset();
    this.#data = this.#draft;
    this.#stamps_data = this.#stamps_draft;
    this.draw();
    if (this.#sideForms) {
      this.#sideForms.showForms();
    }
  }
}
