var test = require('tap').test
  , fs = require('fs')
  , Middle = require('../')
  , BufferedStream = require('bufferedstream')
  , Transformation = require('./transformation')
  ;



test('writes and reads transparently', function(t) {
  t.plan(3)
  var from = new BufferedStream()
  var to = new BufferedStream()
  var middle = new Middle(from, to)
  middle.write('ABCDEFGH')
  middle.on('data', function(d) {
    t.equal(d.toString(), 'ABCDEFGH')
  })
  from.on('data', function(d) {
    t.equal(d.toString(), 'ABCDEFGH')
  })
  to.on('data', function(d) {
    t.equal(d.toString(), 'ABCDEFGH')
  });
})

test('pipes transparently', function(t) {
  var from = fs.createReadStream(__dirname + '/fixtures/fatcat.jpg')
  var to = new BufferedStream
  var middle = new Middle(from, to)
  var resp = ''
  middle.on('data', function(d) {
    resp += d.toString('base64')
  });
  middle.on('end', function() {
    t.equal(resp, fs.readFileSync(__dirname + '/fixtures/fatcat.jpg', 'base64'));
    t.end()
  })
})

test('follows through transformations', function(t) {
  t.plan(1)
  var from = fs.createReadStream(__dirname + '/fixtures/ABCDEF')
  var to = new Transformation(function(d) { return d.toString().toLowerCase() })
  var middle = new Middle(from, to)
  middle.on('data', function(d) {
    t.equal(d.toString(), 'abcdef')
  })
})


test('can pipe to middle', function(t) {
  t.plan(2)
  
  var from = new BufferedStream
  var to = new Transformation(function(d) { return d.toString().toLowerCase() })
  var middle = new Middle(from, to)
  var source = fs.createReadStream(__dirname + '/fixtures/ABCDEF')

  middle.on('data', function(d) {
    t.equal(d.toString(), 'abcdef')
  })

  middle.on('end', function() {
    t.ok(true)
  })

  source.pipe(middle);

})

test('can pipe from middle', function(t) {
  t.plan(2)
  
  var from = new BufferedStream
  var to = new Transformation(function(d) { return d.toString().toLowerCase() })
  var middle = new Middle(from, to)
  var source = fs.createReadStream(__dirname + '/fixtures/ABCDEF')
  var target = new BufferedStream

  target.on('data', function(d) {
    t.equal(d.toString(), 'abcdef')
  })

  target.on('end', function() {
    t.ok(true)
  })

  source.pipe(middle).pipe(target);
})

