# PromiseHolder

PromiseHolder is an open-source project aimed at simplifying the creation and resolution of Promises in JavaScript.

## Table of Contents

- [PromiseHolder](#promiseholder)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [`new PromiseHolder(executor?: (resolve, reject) => void)`](#new-promiseholderexecutor-resolve-reject--void)
    - [`promise.reject(reason)`](#promiserejectreason)
    - [`promise.resolve(value)`](#promiseresolvevalue)
    - [](#)

## Background

Promises are widely used in modern JavaScript for handling asynchronous code. However, managing multiple promises and their resolutions can become complex. PromiseHolder addresses this challenge by offering a straightforward API to create, store, and resolve promises with ease.

## Installation

To install PromiseHolder, simply use your package manager of choice:

```bash
npm install promise-holder
```

## Usage

Using PromiseHolder is simple. Import it into your project and start managing promises effortlessly:

```javascript
const PromiseHolder = require('promise-holder');

const myPromise = new PromiseHolder();

myPromise.resolve('Data to be resolved');

const value = await myPromise;

console.log(value); // Data to be resolved
```


## API

### `new PromiseHolder(executor?: (resolve, reject) => void)`

Create a new promise. The constructor has the exact same signature than the standard promise object.

### `promise.reject(reason)`

Reject the promise with the given reason. If the promise as already been resolved or rejected, the call will be ignored.

### `promise.resolve(value)`
Resolve the promise with the given reason. If the promise as already been resolved or rejected, the call will be ignore

### 