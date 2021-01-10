'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _glamorous = require('glamorous');

var _glamorous2 = _interopRequireDefault(_glamorous);

var _Resizer = require('./Resizer');

var _Resizer2 = _interopRequireDefault(_Resizer);

var _Pane = require('./Pane');

var _Pane2 = _interopRequireDefault(_Pane);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = false;

var log = function log() {
  var _console;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (debug) (_console = console).log.apply(_console, ['SplitPane'].concat(args));
};

var ColumnStyle = _glamorous2.default.div({
  display: 'flex',
  flex: 1,
  height: '100%',
  outline: 'none',
  overflow: 'hidden',
  userSelect: 'text',

  flexDirection: 'column',
  minHeight: '100%',
  width: '100%'
});

var RowStyle = _glamorous2.default.div({
  display: 'flex',
  flex: 1,
  height: '100%',
  outline: 'none',
  overflow: 'hidden',
  userSelect: 'text',

  flexDirection: 'row'
});

var paneSize = function paneSize(split, dimensions, splitPaneDimensions) {
  //console.log(`paneSize:`, split, dimensions, splitPaneDimensions);
  var sizes = dimensions.map(function (dimension) {
    return (split === 'vertical' ? dimension.width : dimension.height).toFixed(2);
  });

  var ratios = dimensions.map(function (dimension) {
    return split === 'vertical' ? Math.round((dimension.width / splitPaneDimensions.width).toFixed(4) * 100) : Math.round((dimension.height / splitPaneDimensions.height).toFixed(4) * 100);
  });
  return { sizes: sizes, ratios: ratios };
};

var convert = function convert(str, size) {
  var tokens = str.match(/([0-9]+)([px|%]*)/);
  var value = tokens[1];
  var unit = tokens[2];
  return toPx(value, unit, size);
};

var toPx = function toPx(value) {
  var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'px';
  var size = arguments[2];

  switch (unit) {
    case '%':
      {
        return (size * value / 100).toFixed(2);
      }
    default:
      {
        return +value;
      }
  }
};

var SplitPane = function (_Component) {
  _inherits(SplitPane, _Component);

  function SplitPane(props) {
    _classCallCheck(this, SplitPane);

    var _this = _possibleConstructorReturn(this, (SplitPane.__proto__ || Object.getPrototypeOf(SplitPane)).call(this, props));

    log('constructor');
    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onMouseMove = _this.onMouseMove.bind(_this);
    _this.onMouseUp = _this.onMouseUp.bind(_this);
    _this.onTouchStart = _this.onTouchStart.bind(_this);
    _this.onTouchMove = _this.onTouchMove.bind(_this);
    _this.onMove = _this.onMove.bind(_this);
    _this.onDown = _this.onDown.bind(_this);
    _this.calculateSize = _this.calculateSize.bind(_this);
    _this.resize = _this.resize.bind(_this);

    var paneCount = props.children.length;
    _this.state = {
      useInitial: true,
      resized: true,
      active: false,
      dimensions: [],
      sizes: [],
      ratios: Array(paneCount).fill((100 / paneCount).toFixed(2))
    };
    _this.resizeTimer = undefined;
    return _this;
  }

  _createClass(SplitPane, [{
    key: 'resize',
    value: function resize() {
      var _this2 = this;

      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(function () {
        _this2.calculateSize();
      }, 100);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      log('componentDidMount');
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('resize', this.resize);
      this.calculateSize();

      var minSizes = this.getPaneProp('minSize');
      var maxSizes = this.getPaneProp('maxSize');

      log('min, max sizes', minSizes, maxSizes);
      this.setState({
        minSizes: minSizes,
        maxSizes: maxSizes
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      log('componentWillUnmount');
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('touchmove', this.onTouchMove);
      window.removeEventListener('resize', this.resize);
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(event, resizerIndex) {
      log('onMouseDown', resizerIndex);
      this.onDown();
      this.setState({
        resizerIndex: resizerIndex
      });
    }
  }, {
    key: 'onTouchStart',
    value: function onTouchStart(event, resizerIndex) {
      log('onTouchStart', resizerIndex);
      this.onDown();
      this.setState({
        resizerIndex: resizerIndex
      });
    }
  }, {
    key: 'onDown',
    value: function onDown() {
      log('onDown');
      var _props$allowResize = this.props.allowResize,
          allowResize = _props$allowResize === undefined ? true : _props$allowResize;

      if (allowResize) {
        this.setState({
          active: true,
          resized: false
        });
      }
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(event) {
      this.onMove(event.clientX, event.clientY);
    }
  }, {
    key: 'onTouchMove',
    value: function onTouchMove(event) {
      this.onMove(event.touches[0].clientX, event.touches[0].clientY);
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp() {
      log('onMouseUp');
      var split = this.props.split;
      var active = this.state.active;

      var dimensions = this.getPaneDimensions();
      var node = (0, _reactDom.findDOMNode)(this.splitPane);
      var splitPaneDimensions = (0, _reactDom.findDOMNode)(node).getBoundingClientRect();

      var _paneSize = paneSize(split, dimensions, splitPaneDimensions),
          ratios = _paneSize.ratios,
          sizes = _paneSize.sizes;

      if (active) {
        var _this2 = this;
        this.setState({
          active: false,
          dimensions: dimensions,
          sizes: sizes,
          ratios: ratios
        }, function() { _this2.calculateSize(); });
        

        // clearTimeout(this.resizeTimer);
        // this.resizeTimer = setTimeout(function () {
        //   _this2.calculateSize();
        // }, 100);
      }
    }
  }, {
    key: 'calculateSize',
    value: function calculateSize() {
      log('calculateSize', this.state);
      var split = this.props.split;

      var dimensions = this.getPaneDimensions();

      var node = (0, _reactDom.findDOMNode)(this.splitPane);
      if (node) {
        var splitPaneDimensions = (0, _reactDom.findDOMNode)(node).getBoundingClientRect();

        var _paneSize2 = paneSize(split, dimensions, splitPaneDimensions),
            ratios = _paneSize2.ratios,
            sizes = _paneSize2.sizes;

        this.setState({
          useInitial: false,
          resized: true,
          dimensions: dimensions,
          sizes: sizes,
          ratios: ratios
        });
      }
    }
  }, {
    key: 'getPaneProp',
    value: function getPaneProp(key) {
      var refs = this.refs;
      return Object.keys(refs).filter(function (ref) {
        return ref.startsWith('Pane');
      }).map(function (ref) {
        return refs[ref].props[key];
      });
    }
  }, {
    key: 'getPaneDimensions',
    value: function getPaneDimensions() {
      var refs = this.refs;
      return Object.keys(refs).filter(function (ref) {
        return ref.startsWith('Pane');
      }).map(function (ref) {
        return (0, _reactDom.findDOMNode)(refs[ref]).getBoundingClientRect();
      });
    }
  }, {
    key: 'getResizerDimensions',
    value: function getResizerDimensions() {
      var refs = this.refs;
      return Object.keys(refs).filter(function (ref) {
        return ref.startsWith('Resizer');
      }).map(function (ref) {
        return (0, _reactDom.findDOMNode)(refs[ref]).getBoundingClientRect();
      });
    }
  }, {
    key: 'onMove',
    value: function onMove(clientX, clientY) {
      var _props = this.props,
          split = _props.split,
          resizerSize = _props.resizerSize;
      var _state = this.state,
          active = _state.active,
          dimensions = _state.dimensions,
          resizerIndex = _state.resizerIndex,
          minSizes = _state.minSizes,
          maxSizes = _state.maxSizes;


      if (active) {
        log('onMove ' + clientX + ',' + clientY, this.state);
        var node = (0, _reactDom.findDOMNode)(this.splitPane);
        var splitPaneDimensions = (0, _reactDom.findDOMNode)(node).getBoundingClientRect();
        var resizerDimensions = this.getResizerDimensions()[resizerIndex];

        var primary = dimensions[resizerIndex];
        var secondary = dimensions[resizerIndex + 1];

        if (split === 'vertical' && clientX >= primary.left && clientX <= secondary.right || split !== 'vertical' && clientY >= primary.top && clientY <= secondary.bottom) {
          this.setState(function (state) {
            var primarySize = void 0;
            var secondarySize = void 0;
            var splitPaneSize = void 0;

            if (split === 'vertical') {

              var resizerLeft = clientX - resizerSize / 2;
              var resizerRight = clientX + resizerSize / 2;

              primarySize = resizerLeft - primary.left;
              secondarySize = secondary.right - resizerRight;
              splitPaneSize = splitPaneDimensions.width;
            } else {

              var resizerTop = clientY - resizerSize / 2;
              var resizerBottom = clientY + resizerSize / 2;

              primarySize = resizerTop - primary.top;
              secondarySize = secondary.bottom - resizerBottom;
              splitPaneSize = splitPaneDimensions.height;
            }

            var primaryMinSize = convert(minSizes[resizerIndex], splitPaneSize);
            var secondaryMinSize = convert(minSizes[resizerIndex + 1], splitPaneSize);

            var primaryMaxSize = convert(maxSizes[resizerIndex], splitPaneSize);
            var secondaryMaxSize = convert(maxSizes[resizerIndex + 1], splitPaneSize);

            var numResizers = resizerDimensions.length;
            var totalResizerSize = numResizers * resizerSize;

            if (primaryMinSize <= primarySize && primaryMaxSize >= primarySize && secondaryMinSize <= secondarySize && secondaryMaxSize >= secondarySize) {
              var primaryRatio = (primarySize / (splitPaneSize - totalResizerSize)).toFixed(4) * 100;
              var secondaryRatio = (secondarySize / (splitPaneSize - totalResizerSize)).toFixed(4) * 100;

              var ratios = state.ratios,
                  sizes = state.sizes;


              sizes[resizerIndex] = primarySize;
              sizes[resizerIndex + 1] = secondarySize;

              ratios[resizerIndex] = primaryRatio;
              ratios[resizerIndex + 1] = secondaryRatio;

              return _extends({
                useInitial: false,
                ratios: ratios,
                sizes: sizes
              }, state);
            }
            return state;
          });
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      log('render', this.state);
      var _props2 = this.props,
          children = _props2.children,
          className = _props2.className,
          split = _props2.split;
      var _state2 = this.state,
          ratios = _state2.ratios,
          sizes = _state2.sizes,
          resized = _state2.resized,
          useInitial = _state2.useInitial;


      var paneIndex = 0;
      var resizerIndex = 0;

      var elements = children.reduce(function (acc, child) {
        var size = sizes[paneIndex] ? sizes[paneIndex] : 0;
        var pane = void 0;
        var isPane = child.type === _Pane2.default;
        var paneProps = {
          index: paneIndex,
          'data-type': 'Pane',
          size: size,
          split: split,
          ratio: ratios[paneIndex],
          key: 'Pane-' + paneIndex,
          ref: 'Pane-' + paneIndex,
          resized: resized,
          useInitial: useInitial
        };
        if (isPane) {
          log('clone Pane');
          pane = (0, _react.cloneElement)(child, paneProps);
        } else {
          log('wrap with Pane');
          pane = _react2.default.createElement(
            _Pane2.default,
            paneProps,
            child
          );
        }
        paneIndex++;
        if (acc.length === 0) {
          return [].concat(_toConsumableArray(acc), [pane]);
        } else {
          var resizer = _react2.default.createElement(_Resizer2.default, {
            index: resizerIndex,
            key: 'Resizer-' + resizerIndex,
            ref: 'Resizer-' + resizerIndex,
            split: split,
            onMouseDown: _this3.onMouseDown,
            onTouchStart: _this3.onTouchStart,
            onTouchEnd: _this3.onMouseUp
          });
          resizerIndex++;
          return [].concat(_toConsumableArray(acc), [resizer, pane]);
        }
      }, []);

      if (split === 'vertical') {
        return _react2.default.createElement(
          RowStyle,
          {
            className: className,
            'data-type': 'SplitPane',
            'data-split': split,
            ref: function ref(splitPane) {
              return _this3.splitPane = splitPane;
            }
          },
          elements
        );
      } else {
        return _react2.default.createElement(
          ColumnStyle,
          {
            className: className,
            'data-type': 'SplitPane',
            'data-split': split,
            ref: function ref(splitPane) {
              return _this3.splitPane = splitPane;
            }
          },
          elements
        );
      }
    }
  }]);

  return SplitPane;
}(_react.Component);

SplitPane.propTypes = {
  children: _propTypes2.default.arrayOf(_propTypes2.default.node).isRequired,
  className: _propTypes2.default.string,
  split: _propTypes2.default.oneOf(['vertical', 'horizontal']),
  resizerSize: _propTypes2.default.number
};

SplitPane.defaultProps = {
  split: 'vertical',
  resizerSize: 1
};

exports.default = SplitPane;
module.exports = exports['default'];