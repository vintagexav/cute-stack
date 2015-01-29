var util = require('util');
var colors = require('colors');
var Table = require('cli-table');

module.exports = cute;
cute.uncute = function () {
  Error.stackTraceLimit = 10;
  Error.prepareStackTrace = null;
}
cute.noStack = function () { cute(null, 0); }

cute.ui = {
  default: pretty,
  pretty: pretty,
  table: table,
  json: JSON.stringify.bind(JSON)
}


cute.ui['pretty-json'] = function (frame) {
  return JSON.stringify(frame, 0, 2);
}


cute.ui['pretty-json'].print = cute.ui.json.print = function (data) {
  return '['+data+']'
}


function cute(type, stackSize) {
  if (typeof stackSize === 'number') {
    Error.stackTraceLimit = stackSize
  }
  type = cute.ui[type] || cute.ui.default;

  if (type.init) { type.init(); }

  Error.prepareStackTrace = function (error, stack) {
    for (var k in error) { console.log(k); }
    return (error+'').bgRed.white 
      + '\n\n' + (type.print||join)(stack.map(function(frame){
        var fn = frame.getFunction();

        return {
          fn: fn,
          file: frame.getFileName()
            .replace(process.cwd(), '.')
            .replace(/\/node_modules\//g, '♦'),
          line: frame.getLineNumber(),
          args: fn.arguments,
          name: frame.getFunctionName(),
          meth: frame.getMethodName(),
          sig: ((fn+'').split('{')[0].trim() + ' { [body] }'),
          id: function () { 
            return this.name || this.meth || this.sig;
          }
        }
      }).map(type))
  }
  return cute;
}

function pretty(frame) {
  return [ 
    frame.file.cyan, 
    (' ' + frame.line + ' ').bgYellow.black,
    (' ' + (frame.id()) + ' ').gray
    ].join(' ') + '\n';
}

function join(a) { 
  return Array.prototype.join.call(a, ''); 
}

table.init = function () { 

  table._ = new Table({
    head: ['file', 'line', 'name/sig'],
    colWidths: [50, 10, 50]
  })


}

table.print = function () { 
  var t = table._ + '';
  table._ = null;
  return t;
}

function table(frame) {
  table._.push([
    frame.file, frame.line, frame.id()
  ])
}