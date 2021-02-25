(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.RaffleWheel = {}));
}(this, (function (exports) { 'use strict';

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script = {
    name: "RaffleWheel",
    data: function data() {
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
      byte2Hex: function byte2Hex(n) {
        var nybHexString = "0123456789ABCDEF";
        return (
          String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
          nybHexString.substr(n & 0x0f, 1)
        );
      },
      RGB2Color: function RGB2Color(r, g, b) {
        return "#" + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);
      },
      getColor: function getColor(item, maxitem) {
        var phase = 0;
        var center = 128;
        var width = 127;
        var frequency = (Math.PI * 2) / maxitem;

        var red = Math.sin(frequency * item + 2 + phase) * width + center;
        var green = Math.sin(frequency * item + 0 + phase) * width + center;
        var blue = Math.sin(frequency * item + 4 + phase) * width + center;

        return this.RGB2Color(red, green, blue);
      },
      drawRouletteWheel: function drawRouletteWheel() {
        var canvas = this.$refs["wheel"];
        if (canvas.getContext) {
          var outsideRadius = 200;
          var textRadius = 160;
          var insideRadius = 125;

          this.ctx = canvas.getContext("2d");
          this.ctx.clearRect(0, 0, 500, 500);

          this.ctx.strokeStyle = "black";
          this.ctx.lineWidth = 2;

          this.ctx.font = "bold 12px Helvetica, Arial";

          for (var i = 0; i < this.options.length; i++) {
            var angle = this.start + i * this.arc;
            //this.ctx.fillStyle = colors[i];
            this.ctx.fillStyle = this.getColor(i, this.options.length);

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
            this.ctx.fillStyle = "black";
            this.ctx.translate(
              250 + Math.cos(angle + this.arc / 2) * textRadius,
              250 + Math.sin(angle + this.arc / 2) * textRadius
            );
            this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
            var text = this.options[i];
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
      spin: function spin() {
        this.$emit("spin-start");
        this.spinAngleStart = Math.random() * 10 + 10;
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
        this.rotateWheel();
      },
      rotateWheel: function rotateWheel() {
        this.spinTime += 30;
        if (this.spinTime >= this.spinTimeTotal) {
          this.stopRotateWheel();
          return;
        }
        var spinAngle =
          this.spinAngleStart -
          this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
        this.start += (spinAngle * Math.PI) / 180;
        this.drawRouletteWheel();
        this.spinTimeout = setTimeout(this.rotateWheel, 30);
      },
      stopRotateWheel: function stopRotateWheel() {
        clearTimeout(this.spinTimeout);
        var degrees = (this.start * 180) / Math.PI + 90;
        var arcd = (this.arc * 180) / Math.PI;
        var index = Math.floor((360 - (degrees % 360)) / arcd);
        this.ctx.save();
        this.ctx.font = "bold 30px Helvetica, Arial";
        var text = this.options[index];
        this.ctx.fillText(
          text,
          250 - this.ctx.measureText(text).width / 2,
          250 + 10
        );
        this.ctx.restore();
        this.$emit("spin-stop", this.options[index]);
      },
      easeOut: function easeOut(t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
      },
    },
    watch: {
      startAngle: function startAngle() {
        this.start = this.startAngle;
      },
    },
    mounted: function mounted() {
      this.start = this.startAngle;
      this.arc = Math.PI / (this.options.length / 2);
      this.drawRouletteWheel();
    },
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      var options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      var hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              var originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              var existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "raffle-wheel" }, [
      _c(
        "button",
        {
          staticClass: "raffle-wheel__button",
          attrs: { disabled: _vm.blockSpin },
          on: { click: _vm.spin }
        },
        [_vm._v("\n    Spin\n  ")]
      ),
      _vm._v(" "),
      _c("canvas", {
        ref: "wheel",
        staticClass: "raffle-wheel__canvas",
        attrs: { width: _vm.canvasWidth, height: _vm.canvasHeight }
      })
    ])
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    var __vue_inject_styles__ = undefined;
    /* scoped */
    var __vue_scope_id__ = undefined;
    /* module identifier */
    var __vue_module_identifier__ = undefined;
    /* functional template */
    var __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    var __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      undefined,
      undefined,
      undefined
    );

  // Import vue component

  // Declare install function executed by Vue.use()
  function install(Vue) {
    if (install.installed) { return; }
    install.installed = true;
    Vue.component("RaffleWheel", __vue_component__);
  }

  // Create module definition for Vue.use()
  var plugin = {
    install: install,
  };

  // Auto-install when vue is found (eg. in browser via <script> tag)
  var GlobalVue = null;
  if (typeof window !== "undefined") {
    GlobalVue = window.Vue;
  } else if (typeof global !== "undefined") {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  exports.default = __vue_component__;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
