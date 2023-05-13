// クラス
class SideForms {
  #canvasView;
  #canvasRowObject;

  // Canvas ビュー
  #canvasViewObject;

  #asideWidth;
  #textAreaWidth;
  #textFieldWidth;

  // モード切り替え
  #isEditing; // true: 編集モード, false: 表示モード

  // 編集フォーム
  #asideObject;
  #controlBarObject;

  #isManual; // 要素の位置、サイズを設定する: true 手動で指定, false: 自動計算

  // 編集データ
  #draft;
  #stampsDraft;

  // コンストラクタ
  // ----------------------------------------
  constructor(canvasView, aside, controlBar) {
    this.#canvasView = canvasView;
    this.#canvasRowObject = document.getElementById(FLEX_ROW_CONTAINER_ID);
    this.#canvasViewObject = this.#canvasView.getCanvasObject();
    this.#asideObject = aside;
    this.#controlBarObject = controlBar;

    this.#isManual = MANUAL_INITIAL;
    this.#asideWidth = 10; // px
    this.#textAreaWidth = 10; // px
    this.#textFieldWidth = 10; // px
  }

  // サイドバーにフォームをセットする
  // ----------------------------------------
  showForms() {
    this.#asideObject = document.getElementById(ASIDE_FORMS_ID);
    this.#controlBarObject = document.getElementById(CONTROL_BAR_ID);

    // 表示モード時にはフォームを削除する
    this.#isEditing = this.#canvasView.getIsEditing();
    if (!this.#isEditing) {
      if (this.#asideObject) {
        this.#asideObject.remove();
      }
      if (this.#controlBarObject) {
        this.#controlBarObject.remove();
      }
      return;
    }

    // 編集モード時にフォームを動的に生成する
    if (!this.#asideObject) {
      this.#asideObject = document.createElement("div");
      this.#canvasRowObject.appendChild(this.#asideObject);
      this.#asideObject.id = ASIDE_FORMS_ID;
    }
    if (!this.#controlBarObject) {
      this.#controlBarObject = document.createElement("div");
      this.#canvasRowObject.after(this.#controlBarObject);
      this.#controlBarObject.id = CONTROL_BAR_ID;
    }

    this.#draft = this.#canvasView.getDraft();
    this.#stampsDraft = this.#canvasView.getStampsDraft();
    this.#createAsideForms();
    this.#createControlBar();
  }

  #createAsideForms() {
    while (this.#asideObject.firstChild) {
      this.#asideObject.firstChild.remove();
    }

    this.#asideWidth = window.innerWidth - FULL_WIDTH - PADDING * 3; // px
    this.#textAreaWidth =
      this.#asideWidth -
      CONFIG_ITEM_TITLE_WIDTH -
      CONFIG_ITEM_MARGIN_LEFT -
      5 * 2; // px
    this.#textFieldWidth = this.#textAreaWidth; // px

    // サイズ設定の手動選択 On/Off
    const radioBlock = document.createElement("div");
    this.#asideObject.appendChild(radioBlock);
    radioBlock.style.margin = CONFIG_BLOCK_MARGIN;
    this.#createRadioForm(radioBlock);

    for (let i = 0; i < this.#draft.sections.length; i++) {
      // NOTE: draft.sections[i] の編集フォームを動的に生成する
      const configBlock = document.createElement("div");
      this.#asideObject.appendChild(configBlock);
      configBlock.style.padding = CONFIG_BLOCK_PADDING;
      configBlock.style.margin = CONFIG_BLOCK_MARGIN;

      if (this.#draft.sections[i].rect && this.#draft.sections[i].stroke) {
        // 罫線のみの矩形の場合
        configBlock.style.background = CONFIG_BLOCK_BLUE;
        this.#createRectStroke(configBlock, this.#draft, i);
      }
      if (this.#draft.sections[i].rect && this.#draft.sections[i].fill) {
        // 背景色をもつ矩形の場合
        configBlock.style.background = CONFIG_BLOCK_PURPLE;
        this.#createRectFilled(configBlock, this.#draft, i);
      }
    }
  }

  // サイズ編集用フォームの表示非表示ラジオボタンを作る
  #createRadioForm(radioBlock) {
    const radioTitle = document.createElement("label");
    radioBlock.appendChild(radioTitle);
    radioTitle.innerHTML = "※ サイズ設定 手動: ";

    // サイズ編集用フォームを表示する選択肢
    const rOptionOn = document.createElement("input");
    radioBlock.appendChild(rOptionOn);
    rOptionOn.id = "radioOn";
    rOptionOn.value = "On";
    rOptionOn.setAttribute("type", "radio");
    rOptionOn.setAttribute("name", MANUAL_RADIO_GROUP_NAME);
    rOptionOn.addEventListener("change", sideForms.changeRadio);
    const rOptionOnLabel = document.createElement("label");
    radioBlock.appendChild(rOptionOnLabel);
    rOptionOnLabel.setAttribute("for", "radioOn");
    rOptionOnLabel.innerHTML = "On";

    // サイズ編集用フォームを表示しない選択肢
    const rOptionOff = document.createElement("input");
    radioBlock.appendChild(rOptionOff);
    rOptionOff.id = "radioOff";
    rOptionOff.value = "Off";
    rOptionOff.setAttribute("type", "radio");
    rOptionOff.setAttribute("name", MANUAL_RADIO_GROUP_NAME);
    rOptionOff.addEventListener("change", sideForms.changeRadio);
    const rOptionOffLabel = document.createElement("label");
    radioBlock.appendChild(rOptionOffLabel);
    rOptionOffLabel.setAttribute("for", "radioOff");
    rOptionOffLabel.innerHTML = "Off";

    // (再)描画時の初期値セット
    if (this.#isManual) {
      rOptionOn.checked = "checked";
    } else {
      rOptionOff.checked = "checked";
    }
  }

  // 図形の設定値用フォーム (罫線のみの矩形)
  #createRectStroke(configBlock, draft, index) {
    const blockTitle = document.createElement("span");
    configBlock.appendChild(blockTitle);
    let title = "";
    switch (draft.sections[index].heading) {
      case H1_TYPE:
        title += "■ H1 > ";
        break;
      case H2_TYPE:
        title += "■■ H2 > ";
        break;
      default:
        title += "本文 > ";
        break;
    }
    title += draft.sections[index].text;
    blockTitle.innerHTML =
      title.length > 30 ? title.substring(0, 29) + "..." : title;
    blockTitle.style.display = "block";

    // 要素のカテゴリを選択する入力欄
    const headingTitle = document.createElement("label");
    configBlock.appendChild(headingTitle);
    headingTitle.innerHTML = "Type: ";
    headingTitle.style.display = "inline-block";
    headingTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    headingTitle.style.margin = CONFIG_ITEM_MARGIN;
    const heading = document.createElement("select");
    configBlock.appendChild(heading);
    heading.id = "rectType" + index;
    heading.addEventListener("change", SideForms.changeType);
    heading.value = draft.sections[index].heading;
    const headingBr = document.createElement("br");
    configBlock.appendChild(headingBr);

    // 選択肢 H1
    const heading_optionH1 = document.createElement("option");
    heading.appendChild(heading_optionH1);
    heading_optionH1.value = H1_TYPE;
    heading_optionH1.text = "見出し1";
    // 選択肢 H2
    const heading_optionH2 = document.createElement("option");
    heading.appendChild(heading_optionH2);
    heading_optionH2.value = H2_TYPE;
    heading_optionH2.text = "見出し2";
    // 選択肢 本文
    const heading_optionDefault = document.createElement("option");
    heading.appendChild(heading_optionDefault);
    heading_optionDefault.value = "";
    heading_optionDefault.text = "本文";

    // (再)描画時の初期値セット
    switch (draft.sections[index].heading) {
      case H1_TYPE:
        heading_optionH1.selected = true;
        break;
      case H2_TYPE:
        heading_optionH2.selected = true;
        break;
      default:
        heading_optionDefault.selected = true;
        break;
    }

    // テキストを編集する入力欄
    const textTitle = document.createElement("label");
    configBlock.appendChild(textTitle);
    textTitle.innerHTML = "Text: ";
    textTitle.style.display = "inline-block";
    textTitle.style.verticalAlign = "top";
    textTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    textTitle.style.margin = CONFIG_ITEM_MARGIN;
    const text = document.createElement("textarea");
    configBlock.appendChild(text);
    text.id = "rectText" + index;
    text.addEventListener("change", SideForms.changeText);
    text.value = draft.sections[index].text;
    text.style.width = this.#textAreaWidth + "px";
    text.style.resize = "vertical";
    const textBr = document.createElement("br");
    configBlock.appendChild(textBr);

    if (this.#isManual) {
      this.#displaySizeForm(configBlock, draft, index);
    }
  }

  // 図形の設定値用フォーム (背景色をもつ矩形)
  #createRectFilled(configBlock, draft, index) {
    const blockTitle = document.createElement("span");
    configBlock.appendChild(blockTitle);
    blockTitle.innerHTML = "Rectangle";
    blockTitle.style.display = "block";

    // テキストを編集する入力欄
    const textTitle = document.createElement("span");
    configBlock.appendChild(textTitle);
    textTitle.innerHTML = "Text: ";
    textTitle.style.display = "inline-block";
    textTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    textTitle.style.margin = CONFIG_ITEM_MARGIN;
    const text = document.createElement("span");
    configBlock.appendChild(text);
    text.innerHTML = draft.sections[index].text;
    const textBr = document.createElement("br");
    configBlock.appendChild(textBr);

    const urlTitle = document.createElement("label");
    configBlock.appendChild(urlTitle);
    urlTitle.innerHTML = "URL: ";
    urlTitle.style.display = "inline-block";
    urlTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    urlTitle.style.margin = CONFIG_ITEM_MARGIN;
    const url = document.createElement("input");
    configBlock.appendChild(url);
    url.id = "rectUrl" + index;
    url.addEventListener("change", SideForms.changeUrl);
    url.setAttribute("type", "text");
    url.value = draft.sections[index].url;
    url.style.width = this.#textFieldWidth + "px";
    const urlBr = document.createElement("br");
    configBlock.appendChild(urlBr);

    if (this.#isManual) {
      this.#displaySizeForm(configBlock, draft, index);
    }
  }

  // サイズ編集用フォームを作る
  #displaySizeForm(configBlock, draft, index) {
    // y position を編集する入力欄
    const yPosTitle = document.createElement("label");
    configBlock.appendChild(yPosTitle);
    yPosTitle.innerHTML = "Y position: ";
    yPosTitle.style.display = "inline-block";
    yPosTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    yPosTitle.style.margin = CONFIG_ITEM_MARGIN;
    const yPos = document.createElement("input");
    configBlock.appendChild(yPos);
    yPos.id = "rectYPos" + index;
    yPos.addEventListener("change", SideForms.changeYPos);
    yPos.value = draft.sections[index].rect.y;
    yPos.style.width = CONFIG_ITEM_VALUE_WIDTH_SHORT + "px";
    yPos.style.textAlign = "right";
    const yPosUnit = document.createElement("label");
    configBlock.appendChild(yPosUnit);
    yPosUnit.innerHTML = " px";
    const yPosBr = document.createElement("br");
    configBlock.appendChild(yPosBr);

    // x position を編集する入力欄
    const xPosTitle = document.createElement("label");
    configBlock.appendChild(xPosTitle);
    xPosTitle.innerHTML = "X position: ";
    xPosTitle.style.display = "inline-block";
    xPosTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    xPosTitle.style.margin = CONFIG_ITEM_MARGIN;
    const xPos = document.createElement("input");
    configBlock.appendChild(xPos);
    xPos.id = "rectXPos" + index;
    xPos.addEventListener("change", SideForms.changeXPos);
    xPos.value = draft.sections[index].rect.x;
    xPos.style.width = CONFIG_ITEM_VALUE_WIDTH_SHORT + "px";
    xPos.style.textAlign = "right";
    const xPosUnit = document.createElement("label");
    configBlock.appendChild(xPosUnit);
    xPosUnit.innerHTML = " px";
    const xPosBr = document.createElement("br");
    configBlock.appendChild(xPosBr);

    // width を編集する入力欄
    const widthTitle = document.createElement("label");
    configBlock.appendChild(widthTitle);
    widthTitle.innerHTML = "Width: ";
    widthTitle.style.display = "inline-block";
    widthTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    widthTitle.style.margin = CONFIG_ITEM_MARGIN;
    const wid = document.createElement("input");
    configBlock.appendChild(wid);
    wid.id = "rectWidth" + index;
    wid.addEventListener("change", SideForms.changeWidth);
    wid.value = draft.sections[index].rect.w;
    wid.style.width = CONFIG_ITEM_VALUE_WIDTH_SHORT + "px";
    wid.style.textAlign = "right";
    const widUnit = document.createElement("label");
    configBlock.appendChild(widUnit);
    widUnit.innerHTML = " px";
    const widBr = document.createElement("br");
    configBlock.appendChild(widBr);

    // height を編集する入力欄
    const heightTitle = document.createElement("label");
    configBlock.appendChild(heightTitle);
    heightTitle.innerHTML = "Height: ";
    heightTitle.style.display = "inline-block";
    heightTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    heightTitle.style.margin = CONFIG_ITEM_MARGIN;
    const hei = document.createElement("input");
    configBlock.appendChild(hei);
    hei.id = "rectHeight" + index;
    hei.addEventListener("change", SideForms.changeHeight);
    hei.value = draft.sections[index].rect.h;
    hei.style.width = CONFIG_ITEM_VALUE_WIDTH_SHORT + "px";
    hei.style.textAlign = "right";
    const heiUnit = document.createElement("label");
    configBlock.appendChild(heiUnit);
    heiUnit.innerHTML = " px";
    const heiBr = document.createElement("br");
    configBlock.appendChild(heiBr);
  }

  // テキストエリアの高さを計算する
  #calcTextHeight(font, r, fontSize) {
    const ctx = this.#canvasViewObject.getContext("2d");
    ctx.font = font;
    if (r.rect && r.stroke) {
      // 改行を含むテキストを描画する (見出し、本文)
      // NOTE: 改行文字で行を改行する、且つ行がブロックの幅を超えたら自動的に改行する
      const areaWidth = r.rect.w > PADDING * 2 ? r.rect.w - PADDING * 2 : 10; // px
      const lines = r.text.split(LINE_BREAK);
      r.rect.h = fontSize + MARGIN;
      for (let i = 0; i < lines.length; i++) {
        // 改行文字で行を改行した時の行ごとに
        let tempLine = "";
        if (lines[i].length == 0 && i < lines.length - 1) {
          // 空行の場合は、ブロックの高さを更新して次の行の処理へ移る
          r.rect.h += Math.ceil(fontSize * 1.3);
          continue;
        }
        for (let j = 0; j < lines[i].length; j++) {
          // 1 文字ずつ加えて、ブロックの幅を超えるか判定する
          tempLine += lines[i][j];
          if (ctx.measureText(tempLine).width > areaWidth) {
            // 行の途中でブロックの幅を超えた時
            r.rect.h += Math.ceil(fontSize * 1.3);
            if (j < lines[i].length) j--;
            tempLine = "";
          } else if (j == lines[i].length - 1) {
            // 行末に達した時
            if (i < lines.length - 1) {
              r.rect.h += Math.ceil(fontSize * 1.3);
            }
          }
        }
      }
    }
  }

  // canvas の上辺から指定のブロックの高さを計算する
  #calcRectYPosition(max) {
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
  #resetRectYPosition(view, draft, index) {
    for (let i = parseInt(index) + 1; i < draft.sections.length; i++) {
      if (
        draft.sections[i - 1] &&
        draft.sections[i].rect.y == draft.sections[i - 1].rect.y
      ) {
        // 2 カラムの場合
        continue;
      }

      // ブロックの位置を修正する
      const position = this.#calcRectYPosition(i);
      if (
        draft.sections[i + 1] &&
        draft.sections[i].rect.y == draft.sections[i + 1].rect.y
      ) {
        // 2 カラムの場合
        draft.sections[i + 1].rect.y = position;
      }
      draft.sections[i].rect.y = position;
    }
  }

  // コントロールバーを生成する
  // ----------------------------------------
  #createControlBar() {
    if (this.#controlBarObject.firstChild) {
      return;
    }

    // 要素を追加するボタンを生成する
    const rectTitle = document.createElement("label");
    this.#controlBarObject.appendChild(rectTitle);
    rectTitle.innerHTML = "末尾に追加: ";
    rectTitle.style.margin = BUTTON_MARGIN;

    const h1Btn = document.createElement("button");
    this.#controlBarObject.appendChild(h1Btn);
    h1Btn.addEventListener("click", sideForms.addRect);
    h1Btn.innerHTML = "見出し1";
    h1Btn.value = H1_TYPE;
    h1Btn.style.margin = BUTTON_MARGIN;

    const h2Btn = document.createElement("button");
    this.#controlBarObject.appendChild(h2Btn);
    h2Btn.addEventListener("click", sideForms.addRect);
    h2Btn.innerHTML = "見出し2";
    h2Btn.value = H2_TYPE;
    h2Btn.style.margin = BUTTON_MARGIN;

    const bodyBtn = document.createElement("button");
    this.#controlBarObject.appendChild(bodyBtn);
    bodyBtn.addEventListener("click", sideForms.addRect);
    bodyBtn.innerHTML = "本文";
    bodyBtn.style.margin = BUTTON_MARGIN;

    const imageBtn = document.createElement("button");
    this.#controlBarObject.appendChild(imageBtn);
    imageBtn.addEventListener("click", sideForms.addImage);
    imageBtn.innerHTML = "静止画";
    imageBtn.style.margin = BUTTON_MARGIN;

    const videoBtn = document.createElement("button");
    this.#controlBarObject.appendChild(videoBtn);
    videoBtn.addEventListener("click", sideForms.addVideoPlayer);
    videoBtn.innerHTML = "動画";
    videoBtn.style.margin = BUTTON_MARGIN;

    // スタンプを追加するボタンを生成する
    const stampTitle = document.createElement("label");
    this.#controlBarObject.appendChild(stampTitle);
    stampTitle.innerHTML = "スタンプ: ";
    stampTitle.style.margin = BUTTON_MARGIN;

    const smileStampBtn = document.createElement("button");
    this.#controlBarObject.appendChild(smileStampBtn);
    smileStampBtn.addEventListener("click", sideForms.addSmileStamp);
    smileStampBtn.innerHTML = "スマイル";
    smileStampBtn.style.margin = BUTTON_MARGIN;

    const doneStampBtn = document.createElement("button");
    this.#controlBarObject.appendChild(doneStampBtn);
    doneStampBtn.addEventListener("click", sideForms.addDoneStamp);
    doneStampBtn.innerHTML = "済み";
    doneStampBtn.style.margin = BUTTON_MARGIN;

    // 再描画するボタンを生成する
    const renderTitle = document.createElement("label");
    this.#controlBarObject.appendChild(renderTitle);
    renderTitle.innerHTML = "再描画: ";
    renderTitle.style.margin = BUTTON_MARGIN;

    const renderInitialBtn = document.createElement("button");
    this.#controlBarObject.appendChild(renderInitialBtn);
    renderInitialBtn.addEventListener("click", sideForms.drawInitial);
    renderInitialBtn.innerHTML = "初期値";
    renderInitialBtn.style.margin = BUTTON_MARGIN;

    const renderEditedBtn = document.createElement("button");
    this.#controlBarObject.appendChild(renderEditedBtn);
    renderEditedBtn.addEventListener("click", sideForms.drawEdited);
    renderEditedBtn.innerHTML = "編集中";
    renderEditedBtn.style.margin = BUTTON_MARGIN;

    // 再描画するボタンを生成する
    const resetTitle = document.createElement("label");
    this.#controlBarObject.appendChild(resetTitle);
    resetTitle.innerHTML = "初期化: ";
    resetTitle.style.margin = BUTTON_MARGIN;

    const resetEditedBtn = document.createElement("button");
    this.#controlBarObject.appendChild(resetEditedBtn);
    resetEditedBtn.addEventListener("click", sideForms.resetEdited);
    resetEditedBtn.innerHTML = "リセット";
    resetEditedBtn.style.margin = BUTTON_MARGIN;
  }

  // ラジオボタンの値の更新
  // ----------------------------------------

  // サイズ編集フォームの表示非表示を変更するイベントリスナー
  changeRadio(e) {
    const view = canvasView;
    const forms = sideForms;

    forms.#isManual = e.target.value == "On";
    forms.showForms();
  }

  // 設定値の更新
  // ----------------------------------------

  // 編集した要素の type を更新するイベントリスナー
  static changeType(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectType", "");
    draft.sections[index].heading = document.getElementById(e.target.id).value;

    switch (draft.sections[index].heading) {
      case H1_TYPE:
        forms.#calcTextHeight(H1, draft.sections[index], H1_SIZE);
        break;
      case H2_TYPE:
        forms.#calcTextHeight(H2, draft.sections[index], H2_SIZE);
        break;
      default:
        forms.#calcTextHeight(DEFAULT, draft.sections[index], DEFAULT_SIZE);
        break;
    }

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の text を更新するイベントリスナー
  static changeText(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectText", "");
    draft.sections[index].text = document.getElementById(e.target.id).value;

    switch (draft.sections[index].heading) {
      case H1_TYPE:
        forms.#calcTextHeight(H1, draft.sections[index], H1_SIZE);
        break;
      case H2_TYPE:
        forms.#calcTextHeight(H2, draft.sections[index], H2_SIZE);
        break;
      default:
        forms.#calcTextHeight(DEFAULT, draft.sections[index], DEFAULT_SIZE);
        break;
    }

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の url を更新するイベントリスナー
  static changeUrl(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectUrl", "");
    draft.sections[index].url = document.getElementById(e.target.id).value;

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の x position を更新するイベントリスナー
  static changeXPos(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectXPos", "");
    draft.sections[index].rect.x = document.getElementById(e.target.id).value;

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の y position を更新するイベントリスナー
  static changeYPos(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectYPos", "");
    draft.sections[index].rect.y = document.getElementById(e.target.id).value;

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の width を更新するイベントリスナー
  static changeWidth(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectWidth", "");
    draft.sections[index].rect.w = document.getElementById(e.target.id).value;

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集した要素の height を更新するイベントリスナー
  static changeHeight(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();

    const index = e.target.id.replace("rectHeight", "");
    draft.sections[index].rect.h = document.getElementById(e.target.id).value;

    forms.#resetRectYPosition(view, draft, index);
    forms.drawEdited();
  }

  // 編集中の値を編集する
  // ----------------------------------------
  // 文書構造を追加する
  addRect(e) {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }

    const y = forms.#calcRectYPosition(forms.#draft.sections.length);
    const rect = {
      text: "content",
      rect: { x: 0, y: y, w: FULL_WIDTH, h: DEFAULT_SIZE + MARGIN },
      stroke: STROKE_RED,
    };

    const type = e.target.value;
    switch (type) {
      case H1_TYPE:
        // H1 見出しブロックを追加する
        rect.heading = type;
        rect.text = "H1";
        rect.rect.h = H1_SIZE + MARGIN;
        break;
      case H2_TYPE:
        // H2 見出しブロックを追加する
        rect.heading = type;
        rect.text = "H2";
        rect.rect.h = H2_SIZE + MARGIN;
        break;
      default:
        // 本文ブロックを追加する
        break;
    }

    forms.#draft.sections.push(rect);
    forms.drawEdited();
  }

  // 動画プレーヤーブロックを追加する
  addImage() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    const y = forms.#calcRectYPosition(forms.#draft.sections.length);
    forms.#draft.sections.push({
      text: "image placeholder",
      url: "https://example.com/test.png",
      rect: { x: 0, y: y, w: 400, h: 250 },
      fill: FILL_PURPLE,
    });
    forms.drawEdited();
  }
  // 動画プレーヤーブロックを追加する
  addVideoPlayer() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    const y = forms.#calcRectYPosition(forms.#draft.sections.length);
    forms.#draft.sections.push({
      text: "video player placeholder",
      url: "https://example.com/test.png",
      rect: { x: 0, y: y, w: 400, h: 250 },
      fill: FILL_PURPLE,
    });
    forms.drawEdited();
  }

  // スタンプ (スマイル) を追加する
  addSmileStamp() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    forms.#stampsDraft.stamps.push({ arc: SMILE_MARK_STAMP, stroke: FONT_RED });
    forms.drawEdited();
  }
  // スタンプ (済み) を追加する
  addDoneStamp() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    forms.#stampsDraft.stamps.push({
      text: "済",
      arc: DONE_MARK_STAMP,
      stroke: FONT_RED,
    });
    forms.drawEdited();
  }

  // Canvas へ data を再描画する
  // ----------------------------------------
  drawInitial() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    document.getElementById("tutorial").getContext("2d").reset();
    forms.#canvasView.setData(forms.#canvasView.getInitial());
    forms.#canvasView.setStampsData(forms.#canvasView.getStampsInitial());
    forms.#canvasView.draw();
    forms.showForms();
  }
  drawEdited() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    document.getElementById("tutorial").getContext("2d").reset();
    forms.#draft.height = forms.#calcRectYPosition(
      forms.#draft.sections.length
    );
    forms.#canvasView.setData(forms.#canvasView.getDraft());
    forms.#canvasView.setStampsData(forms.#canvasView.getStampsDraft());
    forms.#canvasView.draw();
    forms.showForms();
  }

  // 編集内容をリセットする
  resetEdited() {
    const view = canvasView;
    const forms = sideForms;
    const draft = view.getDraft();
    if (!view.getIsEditing()) {
      return;
    }
    // レイアウト
    forms.#draft = JSON.parse(JSON.stringify(forms.#canvasView.getInitial()));
    forms.#draft.height = forms.#calcRectYPosition(
      forms.#draft.sections.length
    );
    forms.#canvasView.setDraft(forms.#draft);
    // スタンプ
    forms.#stampsDraft = JSON.parse(
      JSON.stringify(forms.#canvasView.getStampsInitial())
    );
    forms.#canvasView.setStampsDraft(forms.#stampsDraft);
    forms.#canvasView.draw();
    forms.showForms();
  }
}
