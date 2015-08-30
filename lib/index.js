'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spawn = spawn;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _worker = require('./worker');

var _worker2 = _interopRequireDefault(_worker);

exports.config = _config2['default'];
exports.Worker = _worker2['default'];
// needed for testing

function spawn() {
  var runnable = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  return new _worker2['default'](runnable);
}

// TODO: export Pool
//# sourceMappingURL=index.js.map