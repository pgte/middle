# Middle

Get a stream A, pipe it into stream B.

Returns a duplex stream that is the writeable stream part of A and a readable stream part of B

Example:

```javascript
var Middle = require('middle');

var from = // a duplex stream
var to = // another duplex stream
var middle = new Middle(from, to)


// you can also pipe this:
anotherStream.pipe(middle);
```