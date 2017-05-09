#!/usr/bin/env node
const Transform = require('stream').Transform;

function parseTree(node, root, outStream) {
  var parentChain = node.parentChain || [];
  var frameName = root ?
    'node' :
    `${node.functionName || '<anonymous>'} (${node.url}:${node.lineNumber})`;
  var chain = Array.prototype.slice.call(parentChain);
  chain.push(frameName);
  if (node.hitCount > 0) {
    outStream.push(chain.join(';') + ' ' + node.hitCount + '\n');
  }
  if (node.children) {
    node.children.forEach(child => {
      child.parentChain = chain;
      parseTree(child, false, outStream);
    });
  }
}

function cpuprofile2stackcollapse() {
  var output = new Transform({
    transform(chunk, encoding, callback) {
      if (!this._bufs) {
        this._bufs = [];
      }
      this._bufs.push(chunk);
      callback();
    },
    flush(callback) {
      var cpuprofile = JSON.parse(Buffer.concat(this._bufs).toString());
      parseTree(cpuprofile.head, true, this);
      callback();
    }
  });
  return output;
}

module.exports = cpuprofile2stackcollapse;

if (require.main === module) {
  process.stdin.pipe(cpuprofile2stackcollapse()).pipe(process.stdout);
}
