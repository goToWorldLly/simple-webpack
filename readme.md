#### 运行自定义的webpack
node custom-webpack 
#### 直接使用webpack打包
npx webpack || npm run build


```js 打包出来的代码
// add.js
Object.defineProperty(exports, "__esModule", {  value: true});
exports["default"] = void 0;
var _default = function _default(a, b) {  return a + b;};
exports["default"] = _default;

//minus.js 模块暴露出来的方法都 挂载到 exports 对象上
Object.defineProperty(exports, "__esModule", {  value: true});
exports["default"] = exports.minus = void 0;
var minus = function minus(a, b) {  return a - b;};
exports.minus = minus;
var _default = function _default(a, b) {  return a + b + '899';};
exports["default"] = _default;

// index.js
var _add = _interopRequireDefault(require("./add"));
var _minus = require("./minus");

function _interopRequireDefault(obj) {
     return obj && obj.__esModule ? obj : { "default": obj }; 
}
var sum = (0, _add["default"])(1, 2);
var division = (0, _minus.minus)(2, 1);
console.log(sum);console.log(division);
var app = document.querySelector('#App');
app.innerHTML = sum + division;
```