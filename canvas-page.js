// クラス
class CanvasPage {
  #canvas;

  // 初期値、編集中の値
  #initial;
  #stamps_initial;

  #draft;
  #stamps_draft;

  #data;
  #stamps_data;

  // モード
  #isEditing;

  // コンストラクタ
  // ----------------------------------------
  constructor(initial, stamps_initial, isEditing = false) {
    this.#canvas = document.getElementById("tutorial");

    // 表示データ
    this.#initial = JSON.parse(JSON.stringify(initial));
    this.#stamps_initial = JSON.parse(JSON.stringify(stamps_initial));

    this.#draft = JSON.parse(JSON.stringify(initial));
    this.#stamps_draft = JSON.parse(JSON.stringify(stamps_initial));

    this.#data = this.#draft;
    this.#stamps_data = this.#stamps_draft;

    // モード
    this.#isEditing = isEditing;
  }

  // Getter/Setter
  // ----------------------------------------
  getIsEditing() {
    return this.#isEditing;
  }

  setIsEditing(isEditing) {
    this.#isEditing = isEditing;
  }

  // 編集モードで CanvasPage のデータを取得する
  getInitial() {
    return this.#initial;
  }

  getStampsInitial() {
    return this.#stamps_initial;
  }

  getDraft() {
    return this.#draft;
  }

  getStampsDraft() {
    return this.#stamps_draft;
  }

  // 編集モードでリセットしたデータをセットする
  setDraft(draft) {
    this.#draft = draft;
    this.#data = this.#draft;
  }

  setStampsDraft(stampsDraft) {
    this.#stamps_draft = stampsDraft;
    this.#stamps_data = this.#stamps_draft;
  }

  setData(data) {
    this.#data = data;
  }

  setStampsData(stampsData) {
    this.#stamps_data = stampsData;
  }

  // Canvas へ data を描画する
  // ----------------------------------------
  draw() {
    this.#canvas.width = this.#data.width;
    this.#canvas.height = this.#data.height;

    // canvas に図形・文字を描画する
    if (this.#canvas.getContext) {
      const ctx = this.#canvas.getContext("2d");

      // レイアウト
      for (let i = 0; i < this.#data.sections.length; i++) {
        const r = this.#data.sections[i]; // rectangle の 'r'
        if (r.rect && r.stroke) {
          // 罫線のみの矩形の場合
          if (r.text) {
            this.#drawText(ctx, r, FONT_BLACK);
            this.#resetRectPosition(i);
          }
          if (this.#isEditing) {
            this.#drawRectStroke(ctx, r); // DEBUG
          }
        }

        if (r.rect && r.fill) {
          // 背景色をもつ矩形の場合
          this.#drawFilledRect(ctx, r);
          if (r.text) {
            this.#drawText(ctx, r, FONT_WHITE);
          }
        }
      }

      // スタンプ
      this.#stamps_data.stamps.map((c) => {
        // circle の 'c'
        if (c.arc) {
          this.#drawStamp(ctx, c);
        }
      });
    }
  }

  // テキストを描画する
  #drawText(ctx, r, fontColor) {
    ctx.fillStyle = fontColor;
    switch (r.heading) {
      case H1_TYPE:
        ctx.font = H1;
        this.#drawTextArea(ctx, r, H1_SIZE);
        break;
      case H2_TYPE:
        ctx.font = H2;
        this.#drawTextArea(ctx, r, H2_SIZE);
        break;
      default:
        ctx.font = DEFAULT;
        this.#drawTextArea(ctx, r, DEFAULT_SIZE);
        break;
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

  // 見出し、本文を改行した時の要素の高さ、後続の要素の描画位置をリセットする
  #resetRectPosition(index) {
    for (let i = parseInt(index) + 1; i < this.#data.sections.length; i++) {
      if (
        this.#data.sections[i - 1] &&
        this.#data.sections[i].rect.y == this.#data.sections[i - 1].rect.y
      ) {
        // 2 カラムの場合
        continue;
      }

      // ブロックの位置を修正する
      const position = Math.ceil(this.#calcRectHeight(i));
      if (
        this.#data.sections[i + 1] &&
        this.#data.sections[i].rect.y == this.#data.sections[i + 1].rect.y
      ) {
        // 2 カラムの場合
        this.#data.sections[i + 1].rect.y = position;
      }
      this.#data.sections[i].rect.y = position;
    }
  }
  #calcRectHeight(max) {
    let height = 0;
    for (let i = 0; i < max; i++) {
      // 2 カラムの時に、セクションの高さを比較して高いほうに合わせる
      if (
        this.#data.sections[i - 1] &&
        this.#data.sections[i].rect.y == this.#data.sections[i - 1].rect.y &&
        this.#data.sections[i].rect.h < this.#data.sections[i - 1].rect.h
      ) {
        continue;
      }
      height =
        parseInt(this.#data.sections[i].rect.y) +
        parseInt(this.#data.sections[i].rect.h) +
        MARGIN;
    }
    return Math.ceil(height);
  }

  // 罫線のみの領域を描画する
  #drawRectStroke(ctx, r) {
    const rectangle = new Path2D();
    rectangle.rect(r.rect.x, r.rect.y, r.rect.w, r.rect.h);
    if (r.fill) ctx.fillStyle = r.fill; // 罫線のスタイル
    if (r.stroke) ctx.strokeStyle = r.stroke; // 罫線のスタイル
    if (r.alpha) ctx.globalAlpha = r.alpha; // 透明色のスタイル
    ctx.stroke(rectangle);
  }

  // 背景を塗りつぶした領域を描画する
  #drawFilledRect(ctx, r) {
    const rectangle = new Path2D();
    rectangle.rect(r.rect.x, r.rect.y, r.rect.w, r.rect.h);
    if (r.fill) ctx.fillStyle = r.fill; // 罫線のスタイル
    if (r.stroke) ctx.strokeStyle = r.stroke; // 罫線のスタイル
    if (r.alpha) ctx.globalAlpha = r.alpha; // 透明色のスタイル
    ctx.fill(rectangle);
  }

  // スタンプを描画する
  #drawStamp(ctx, c) {
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
}
