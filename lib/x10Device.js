  var stream = require('stream')
  , util = require('util')

  // Give our x10Device a stream interface
  util.inherits(x10Device,stream);

  // Export it
  module.exports=x10Device;

  /**
   * Creates a new x10Device Object
   *
   * @property {Boolean} readable Whether the x10Device emits data
   * @property {Boolean} writable Whether the data can be actuated
   *
   * @property {Number} G - the channel of this x10Device
   * @property {Number} V - the vendor ID of this x10Device
   * @property {Number} D - the x10Device ID of this x10Device
   *
   * @property {Function} write Called when data is received from the Ninja Platform
   *
   * @fires data - Emit this when you wish to send data to the Ninja Platform
   */
   function x10Device(driver, x10Device, mochad) {

    var self = this;
    this._mochad = mochad;
    this._x10Device = x10Device;
    // This x10Device will emit data
    this.readable = true;
    // This x10Device can be actuated
    if (x10Device.type == 'sensor') {
      this.writeable = false;
    } else {
      this.writeable = true;
    }
    this.name = 'X10 Device - ' + x10Device.houseUnit + ' ' + x10Device.type;
    this.G = x10Device.houseUnit + x10Device.type; //+x10Device.type; // G is a string a represents the channel
    this.V = 0; // 0 is Ninja Blocks' x10Device list
    this.D = 2000; // 2000 is a generic Ninja Blocks sandbox x10Device
    
    process.nextTick(function() {
      var readNextLine = false;
      if (x10Device.type == 'sensor'){

        mochad.on('data', function(chunk) { 
          var line = chunk.toString();
          var command;
          if(line.indexOf('RF HouseUnit: ' + x10Device.houseUnit) > -1){
            if(line.indexOf('Func: On')> -1){
              command = 'ON';
            }

          if(line.indexOf('Func: Off') > -1){
            command = 'OFF'
          }

        }
        
        if (command){
          self.emit('data', command);
        }
      });
};
});
};

  /**
   * Called whenever there is data from the Ninja Platform
   * This is required if x10Device.writable = true
   *
   * @param  {String} data The data received
   */
   x10Device.prototype.write = function(data) {
    // I'm being actuated with data!
    this._mochad.write('pl ' + this._x10Device.houseUnit + ' ' + data + '\n');
  };
