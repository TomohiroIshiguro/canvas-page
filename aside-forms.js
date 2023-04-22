class SideForms {
  #canvasPage;
  #aside;

  #isManual;

  #asideWidth;
  #textAreaWidth;
  #textFieldWidth;

  // コンストラクタ
  // ----------------------------------------
  constructor(canvasPage) {
    this.#canvasPage = canvasPage;
    this.#aside = document.getElementById("config-forms");

    this.#isManual = MANUAL_INITIAL;
    this.#asideWidth = 10; // px
    this.#textAreaWidth = 10; // px
    this.#textFieldWidth = 10; // px
  }

  // サイドバーにフォームをセットする
  // ----------------------------------------
  showForms() {
    let draft = this.#canvasPage.getDraft();

    while (this.#aside.firstChild) {
      this.#aside.removeChild(this.#aside.firstChild);
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
    this.#aside.appendChild(radioBlock);
    radioBlock.style.margin = CONFIG_BLOCK_MARGIN;
    this.#createRadioForm(radioBlock);

    for (let i = 0; i < draft.sections.length; i++) {
      // NOTE: draft.sections[i] の編集フォームを動的に生成する
      const configBlock = document.createElement("div");
      this.#aside.appendChild(configBlock);
      configBlock.style.padding = CONFIG_BLOCK_PADDING;
      configBlock.style.margin = CONFIG_BLOCK_MARGIN;

      if (draft.sections[i].rect && draft.sections[i].stroke) {
        // 罫線のみの矩形の場合
        configBlock.style.background = CONFIG_BLOCK_BLUE;
        this.#createRectStroke(configBlock, draft, i);
      }
      if (draft.sections[i].rect && draft.sections[i].fill) {
        // 背景色をもつ矩形の場合
        configBlock.style.background = CONFIG_BLOCK_PURPLE;
        this.#createRectFilled(configBlock, draft, i);
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
    const blockTitle = document.createElement("label");
    configBlock.appendChild(blockTitle);
    const title = "Rectangle - " + draft.sections[index].text;
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
    heading_optionH1.text = H1_TYPE;
    // 選択肢 H2
    const heading_optionH2 = document.createElement("option");
    heading.appendChild(heading_optionH2);
    heading_optionH2.value = H2_TYPE;
    heading_optionH2.text = H2_TYPE;
    // 選択肢 本文
    const heading_optionDefault = document.createElement("option");
    heading.appendChild(heading_optionDefault);
    heading_optionDefault.value = "";
    heading_optionDefault.text = "DEFAULT";

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
    const blockTitle = document.createElement("label");
    configBlock.appendChild(blockTitle);
    blockTitle.innerHTML = "Rectangle";
    blockTitle.style.display = "block";

    // テキストを編集する入力欄
    const textTitle = document.createElement("label");
    configBlock.appendChild(textTitle);
    textTitle.innerHTML = "Text: ";
    textTitle.style.display = "inline-block";
    textTitle.style.width = CONFIG_ITEM_TITLE_WIDTH + "px";
    textTitle.style.margin = CONFIG_ITEM_MARGIN;
    const text = document.createElement("label");
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

  // ラジオボタンの値の更新
  // ----------------------------------------

  // サイズ編集フォームの表示非表示を変更するイベントリスナー
  changeRadio(e) {
    const page = canvasPage;
    const forms = page.getSideForms();

    forms.#isManual = e.target.value == "On";
    forms.showForms();
  }

  // 設定値の更新
  // ----------------------------------------

  // 編集した要素の type を更新するイベントリスナー
  static changeType(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectType", "");
    draft.sections[index].heading = document.getElementById(e.target.id).value;

    let height = 0;
    switch (draft.sections[index].heading) {
      case H1_TYPE:
        height = H1_SIZE + PADDING;
        break;
      case H2_TYPE:
        height = H2_SIZE + PADDING;
        break;
      default:
        height = DEFAULT_SIZE + PADDING;
        break;
    }
    draft.sections[index].rect.h = height;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の text を更新するイベントリスナー
  static changeText(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectText", "");
    draft.sections[index].text = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の url を更新するイベントリスナー
  static changeUrl(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectUrl", "");
    draft.sections[index].url = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の x position を更新するイベントリスナー
  static changeXPos(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectXPos", "");
    draft.sections[index].rect.x = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の y position を更新するイベントリスナー
  static changeYPos(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectYPos", "");
    draft.sections[index].rect.y = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の width を更新するイベントリスナー
  static changeWidth(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectWidth", "");
    draft.sections[index].rect.w = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // 編集した要素の height を更新するイベントリスナー
  static changeHeight(e) {
    const page = canvasPage;
    const forms = page.getSideForms();
    const draft = page.getDraft();

    const index = e.target.id.replace("rectHeight", "");
    draft.sections[index].rect.h = document.getElementById(e.target.id).value;

    forms.#resetRectPosition(page, draft, index);
    page.drawEdited();
  }

  // type を編集した際の rect の高さ、後続の要素の描画位置をリセットする
  #resetRectPosition(page, draft, index) {
    for (let i = parseInt(index) + 1; i < draft.sections.length; i++) {
      if (
        draft.sections[i - 1] &&
        draft.sections[i].rect.y == draft.sections[i - 1].rect.y
      ) {
        // 2 カラムの場合
        continue;
      }

      // ブロックの位置を修正する
      const position = Math.ceil(page.calcRectHeight(i));
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
}
