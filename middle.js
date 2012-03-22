var util = require("util"),
    Stream = require("stream").Stream;


function MiddleStream(from, to) {
    var self = this;
    Stream.call(this);

    this.writable = true;
    this.readable = true;

    this.__from = from;
    this.__to = to;
    this.__piped = true;

    ['drain', 'error', 'close', 'pipe'].forEach(function(eventType) {
        self.__from.on(eventType, function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(eventType);
          self.emit.apply(self, args);
        });
    });

    ['data', 'end', 'error', 'close'].forEach(function(eventType) {
        self.__to.on(eventType, function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(eventType);
          self.emit.apply(self, args);
        });
    });

    from.pipe(to);

}

util.inherits(MiddleStream, Stream);

MiddleStream.prototype.setEncoding = function setEncoding(encoding) {
    this.__from.setEncoding(encoding);
    this.__to.setEncoding && this.__to.setEncoding(encoding);
}

/**
 * Prevents this stream from emitting `data` events until `resume` is called.
 * This does not prevent writes to this stream.
 */
MiddleStream.prototype.pause = function pause() {
  this.__to.pause();
}

/**
 * Resumes emitting `data` events.
 */
MiddleStream.prototype.resume = function resume() {
  this.__to.resume();
}

/**
 * Writes the given `chunk` of data to this stream. Returns `false` if this
 * stream is full and should not be written to further until drained, `true`
 * otherwise.
 */
MiddleStream.prototype.write = function write(chunk, encoding) {
  if (! this.__piped) {
    this.__piped = true;
    this.__from.pipe(this.__to);
  }


  return this.__from.write(chunk, encoding);
}

MiddleStream.prototype.end = function end(chunk, encoding) {
  this.__from.end();
}

/**
 * Destroys this stream immediately. It is no longer readable or writable. This
 * method should rarely ever be called directly by users as it will be called
 * automatically when using BufferedStream#end.
 */
MiddleStream.prototype.destroy = function destroy() {
  this.__writeStream.destroy && this.__writeStream.destroy();
  this.__readStream.destroy && this.__readStream.destroy();
}


module.exports = MiddleStream;