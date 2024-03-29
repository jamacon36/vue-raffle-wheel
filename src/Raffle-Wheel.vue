<template>
  <div class="raffle-wheel">
    <button
      v-if="!hideButton"
      class="raffle-wheel__button"
      @click="spin"
      :disabled="blockSpin"
    >
      {{ buttonText }}
    </button>
    <canvas
      class="raffle-wheel__canvas"
      ref="wheel"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "RaffleWheel",
  data() {
    return {
      start: 0,
      arc: 0,
      spinTimeout: null,
      spinTime: 0,
      spinTimeTotal: 0,
      ctx: null,
    };
  },
  props: {
    options: Array,
    blockSpin: Boolean,
    hideButton: Boolean,
    buttonText: {
      type: String,
      default: "Spin",
    },
    slicesFont: {
      type: Object,
      default: {
        style: "bold",
        size: "12px",
        family: "Helvetica, Arial",
      },
    },
    hubFont: {
      type: Object,
      default: {
        style: "bold",
        size: "30px",
        family: "Helvetica, Arial",
      },
    },
    startAngle: {
      type: Number,
      default: 0,
    },
    canvasWidth: {
      type: Number,
      default: 500,
    },
    canvasHeight: {
      type: Number,
      default: 500,
    },
  },
  methods: {
    byte2Hex(n) {
      const nybHexString = "0123456789ABCDEF";
      return (
        String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
        nybHexString.substr(n & 0x0f, 1)
      );
    },
    RGB2Color(r, g, b) {
      return "#" + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);
    },
    getColor(item, maxitem) {
      const phase = 0;
      const center = 128;
      const width = 127;
      const frequency = (Math.PI * 2) / maxitem;

      const red = Math.sin(frequency * item + 2 + phase) * width + center;
      const green = Math.sin(frequency * item + 0 + phase) * width + center;
      const blue = Math.sin(frequency * item + 4 + phase) * width + center;

      return this.RGB2Color(red, green, blue);
    },
    getOptionText(optionIndex) {
      return this.options[optionIndex].text
        ? this.options[optionIndex].text
        : this.options[optionIndex];
    },
    getOptionSliceColor(optionIndex) {
      if (this.options[optionIndex].color)
        return this.options[optionIndex].color;
      return this.getColor(optionIndex, this.options.length);
    },
    getOptionTextColor(optionIndex) {
      if (this.options[optionIndex].fontColor)
        return this.options[optionIndex].fontColor;
      if (this.slicesFont.color) return this.slicesFont.color;
      return "black";
    },
    getHubTextColor(optionIndex) {
      if (!this.hubFont.color) return "black";
      if (this.hubFont.color === "use-slice" && this.slicesFont.color)
        return this.slicesFont.color;
      if (this.hubFont.color === "use-option")
        return this.getOptionTextColor(optionIndex);
      return this.hubFont.color;
    },
    drawRouletteWheel() {
      const canvas = this.$refs["wheel"];
      if (canvas.getContext) {
        const outsideRadius = 200;
        const textRadius = 160;
        const insideRadius = 125;

        this.ctx = canvas.getContext("2d");
        this.ctx.clearRect(0, 0, 500, 500);

        this.ctx.strokeStyle = this.slicesFont.color;
        this.ctx.lineWidth = 2;

        this.ctx.font = `${this.slicesFont.style} ${this.slicesFont.size} ${this.slicesFont.family}`;

        for (let i = 0; i < this.options.length; i++) {
          const angle = this.start + i * this.arc;
          this.ctx.fillStyle = this.getOptionSliceColor(i);
          this.ctx.beginPath();
          this.ctx.arc(250, 250, outsideRadius, angle, angle + this.arc, false);
          this.ctx.arc(250, 250, insideRadius, angle + this.arc, angle, true);
          this.ctx.stroke();
          this.ctx.fill();

          this.ctx.save();
          this.ctx.shadowOffsetX = -1;
          this.ctx.shadowOffsetY = -1;
          this.ctx.shadowBlur = 0;
          this.ctx.shadowColor = "rgb(220,220,220)";
          this.ctx.fillStyle = this.getOptionTextColor(i);
          this.ctx.translate(
            250 + Math.cos(angle + this.arc / 2) * textRadius,
            250 + Math.sin(angle + this.arc / 2) * textRadius
          );
          this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
          const text = this.getOptionText(i);
          this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);
          this.ctx.restore();
        }

        //Arrow
        this.ctx.fillStyle = "black";
        this.ctx.beginPath();
        this.ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
        this.ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
        this.ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
        this.ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
        this.ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
        this.ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
        this.ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
        this.ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
        this.ctx.fill();
      }
    },
    spin() {
      this.$emit("spin-start");
      this.spinAngleStart = Math.random() * 10 + 10;
      this.spinTime = 0;
      this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
      this.rotateWheel();
    },
    rotateWheel() {
      this.spinTime += 30;
      if (this.spinTime >= this.spinTimeTotal) {
        this.stopRotateWheel();
        return;
      }
      const spinAngle =
        this.spinAngleStart -
        this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
      this.start += (spinAngle * Math.PI) / 180;
      this.drawRouletteWheel();
      this.spinTimeout = setTimeout(this.rotateWheel, 30);
    },
    stopRotateWheel() {
      clearTimeout(this.spinTimeout);
      const degrees = (this.start * 180) / Math.PI + 90;
      const arcd = (this.arc * 180) / Math.PI;
      const index = Math.floor((360 - (degrees % 360)) / arcd);
      this.ctx.save();
      this.ctx.font = `${this.hubFont.style} ${this.hubFont.size} ${this.hubFont.family}`;
      const text = this.getOptionText(index);
      this.ctx.fillStyle = this.getHubTextColor(index);
      this.ctx.fillText(
        text,
        250 - this.ctx.measureText(text).width / 2,
        250 + 10
      );
      this.ctx.restore();
      this.$emit("spin-stop", this.options[index]);
    },
    easeOut(t, b, c, d) {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (tc + -3 * ts + 3 * t);
    },
  },
  watch: {
    startAngle() {
      this.start = this.startAngle;
    },
  },
  mounted() {
    this.start = this.startAngle;
    this.arc = Math.PI / (this.options.length / 2);
    this.drawRouletteWheel();
  },
};
</script>
