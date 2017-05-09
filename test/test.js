var convert = require('../index');
var fs = require('fs');
var path = require('path');
var assert = require('assert');

process.exitCode = 1; // we'll set this right later.
var allPassing = true;

var strm = fs.createReadStream(path.join(__dirname, 'test.cpuprofile'))
               .pipe(convert());
var bufs = [];
strm.on('data', bufs.push.bind(bufs));
strm.on('end', function () {
  var actualLines = Buffer.concat(bufs).toString().split('\n');
  var expectedLines = fs.readFileSync(path.join(__dirname, 'test.stacks'), 'utf8').split('\n');
  var testLength = expectedLines.length;
  console.log('1..'+testLength);
  for (var i = 0; i < testLength; i++) {
    try {
      assert.equal(actualLines[i], expectedLines[i]);
      console.log('ok', i+1, '- line ', i);
    } catch (e) {
      allPassing = false;
      console.log('not ok', i+1, '- line ', i);
    }
  }
  if (allPassing) {
    process.exitCode = 0;
  }
});
