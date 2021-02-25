# vue-raffle-wheel

A raffle wheel component based on Barney Parker's codepen: https://codepen.io/barney-parker/pen/OPyYqy

## Installation

`npm i vue-raffle-wheel -S`

## Usage

### Global

```js
import RaffleWheel from "vue-raffle-wheel";
// Some Other Code
Vue.use(RaffleWheel);
```

### Individual Component

```js
import RaffleWHeel from "vue-raffle-wheel";
export default {
  name: "my-component"
  ...otherSetup,
  components: { RaffleWheel },
}
```

### In Template

```vue
<template>
  <div class="wrapper">
    <RaffleWheel
      :options="[
        'Shaggy',
        'Scooby',
        'Thelma',
        'Daphne',
        'Fred',
        'The Rest of the Gang',
      ]"
    />
  </div>
</template>
```

## Available Props

| Prop         | Type    | Description                                              | Default Value | Required |
| ------------ | ------- | -------------------------------------------------------- | ------------- | -------- |
| options      | Array   | An array of values to appear in the slices of the wheel. | []            | \*       |
| blockSpin    | Boolean | Used to disable the spin button.                         | false         |          |
| startAngle   | Number  | Set the degrees to which the wheel is initially rotated. | 0             |          |
| canvasWidth  | Number  | Set the width of the canvas element. (Defaults to 500)   | 500           |          |
| canvasHeight | Number  | Set the height of the canvas element. (Defaults to 500)  | 500           |          |

## Available Events

| Event      | Returned Value                                                    | Description                                                  |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| spin-start | null                                                              | The function governing the spinning of the wheel has started |
| spin-stop  | value from options array corresponding to where the wheel stopped | The function governing the spinning of the wheel has stopped |
