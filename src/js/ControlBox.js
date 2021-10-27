export default class ControlBox {
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  static get markup() {
    return `

    <div class="containerCount">
	<div class="level countBox">
        <h3 class="description level__description">Level: </h3>
		<span class="content level__content ">1</span>

    </div>
    <div class="scores countBox">
        <h3 class="description scores__description">Scores: </h3>
        <span class="content scores__content">0</span>
    </div>
    <div class="record countBox">
        <h3 class="description record__description">Record: </h3>
        <span class="content record__content">0</span>
    </div>
</div>
`;
  }

  redrawControlBox() {
    this.parentEl.insertAdjacentHTML("afterend", this.constructor.markup);
    console.log('!!!')
  }

  showCount(level, scores, record) {
    this.boxLevelEl = level;
    this.boxScoresEl = scores;
    this.boxRecordEl = record;
  }

  get countBoxWrapperEl() {
    return this.parentEl.querySelector(".containerCount");
  }

  get boxLevelEl() {
    return this.parentEl.nextElementSibling.querySelector(".level__content")
      .textContent;
  }

  set boxLevelEl(text) {
    this.parentEl.nextElementSibling.querySelector(
      ".level__content"
    ).textContent = text;
  }

  get boxScoresEl() {
    return this.parentEl.nextElementSibling.querySelector(".scores__content");
  }

  set boxScoresEl(text) {
    this.parentEl.nextElementSibling.querySelector(
      ".scores__content"
    ).textContent = text;
  }

  get boxRecordEl() {
    return this.parentEl.nextElementSibling.querySelector(".record__content");
  }

  set boxRecordEl(text) {
    this.parentEl.nextElementSibling.querySelector(
      ".record__content"
    ).textContent = text;
  }
}
