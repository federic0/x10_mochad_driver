var util = require('util')
, stream = require('stream')
, net = require('net')
, configHandlers = require('./lib/config-handlers')
, connectionError = null
, connectionToMochadEstablished = false ;


// Give our driver a stream interface
util.inherits(x10Driver,stream);
util.inherits(x10Device,stream);

// Our greeting to the user.
var X10_ANNOUNCEMENT = {
  "contents": [
  { "type": "heading",      "text": "Driver for X10 control using mochad" },
  { "type": "paragraph",    "text": "The X10/mochad driver has been loaded. You should not see this message again." },
  ]
};

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
 
function x10Driver(opts,app) {

  var self = this;
  this._opts = opts;  
  port = opts.port;
  var isAlreadyListenning = true;

  ipAddress = opts.ipAddress;

  // check if we have a mochad server address to connect-to
  if (!this._opts.x10Devices){
    this._opts.x10Devices = [];
  };
  this.registeredDevices = {};

  app.once('client::up',function(){

    // The client is now connected to the Ninja Platform

    // Check if we have sent an announcement before.
    // If not, send one and save the fact that we have.
    if (!opts.hasSentAnnouncement) {
      self.emit('announcement',X10_ANNOUNCEMENT);
      opts.hasSentAnnouncement = true;
      self.save();
    }

    // Register a device
    if (opts.ipAddress){
      self.connectToMochad();
      this.registerAll();
    }
    // Start listening for incoming messages on mochad 
    self.listeningLoop();
  }.bind(this));

  // app.on("device::up", function(device){
  //   console.log('device up: ', util.inspect(device));
  // })

  /**
   * Called when a user prompts a configuration.
   * If `rpc` is null, the user is asking for a menu of actions
   * This menu should have rpc_methods attached to them
   *
   * @param  {Object}   rpc     RPC Object
   * @param  {String}   rpc.method The method from the last payload
   * @param  {Object}   rpc.params Any input data the user provided
   * @param  {Function} cb      Used to match up requests.
   */

  x10Driver.prototype.listeningLoop = function(){
    if (!isAlreadyListenning) {
      self.listenToMochad();
      isAlreadyListenning = true;
    };
    setTimeout(function() {
    self.listeningLoop();
    }, 2000);
  };

  x10Driver.prototype.connectToMochad = function(){

    if (!connectionToMochadEstablished){
      mochad = net.createConnection(port, ipAddress);
    };

    mochad.on('connect', function(){
      app.log.info('x10_mochad_driver: connection to mochad server established');
      app.log.info('x10_mochad_driver: mochad address is: ' + mochad.remoteAddress + ' port: ' + mochad.remotePort);
      connectionToMochadEstablished = true;
      // it's time to listen onto the connection
      isAlreadyListenning = false;
    });

    connectionError = null;

    mochad.once('error', function(err){
      app.log.error('x10_mochad_driver: connection to mochad server error: ' + err.code);
      connectionError = err.code;
      connectionToMochadEstablished = false;
      setTimeout(function(){
        self.connectToMochad();
      }, 5000);
      err = null;
      return;
    });

    mochad.once('end', function(){
      app.log.error('x10_mochad_driver: connection to mochad server ended');
      connectionError = 'ended';
      connectionToMochadEstablished = false;
      setTimeout(function(){
        self.connectToMochad();
      }, 5000);
    });
  };

  x10Driver.prototype.config = function(rpc,cb) {

    var self = this;
    // If rpc is null, we should send the user a menu of what he/she
    // can do.
    // Otherwise, we will try action the rpc method
    if (!rpc) {
      return configHandlers.menu.call(this,cb);
    };
    switch (rpc.method) {
      /* configuring mochad */
      case 'configure_mochad':
      return configHandlers.get_mochad_ip_port.call(this,rpc.params,cb);
      break;
      case 'save_mochad_params':
      return configHandlers.save_mochad_params.call(this,rpc.params,cb);
      break;
      
      /* adding X10 devices */
      case 'configure_x10_device':
      return configHandlers.x10_device_add.call(this,rpc.params,cb);
      break;
      case 'save_x10_params':
      return configHandlers.save_x10_params.call(this,rpc.params,cb);
      break;
      
      /* */
      default: return cb(true); break;
    };
  };

  x10Driver.prototype.listenToMochad = function(){
    var line;
    mochad.on('data', function(chunk) { 

            line = chunk.toString();
            app.emit('x10in', line);
    })
  };


  x10Driver.prototype.setX10 = function(houseUnit, deviceType) {
    var newDevice = {
      'houseUnit':houseUnit,
      'type':deviceType
    };
    this._opts.x10Devices.push(newDevice);
    this.save();
    this.registerDevice(newDevice, mochad);
  };

  x10Driver.prototype.setIpPort = function(ipAddress, port) {
    this._opts.ipAddress = ipAddress;
    this._opts.port = port;
    this.save();
    this.registerDevice();
  };


  x10Driver.prototype.registerDevice = function (device) {
    if (typeof(device) !== 'undefined'){
      var key = device.houseUnit + device.type;
      if (key in this.registeredDevices){
        device = this.registeredDevices[key];
      } else {
        device = new x10Device(this, device, app, opts);
      }
      this.save();
      this.emit('register', device)
    }
  };

  x10Driver.prototype.registerAll = function () {
    if (typeof(this._opts.x10Devices) !== 'undefined'){
      var devices = this._opts.x10Devices;
      for ( var i = 0; i < devices.length; i++){
        this.registerDevice(devices[i]);
      };
    };
  };
};



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
function x10Device(driver, x10Device, app, opts) {

  var self = this;
  this._opts = opts;
  var ipAddress, port;
  port = this._opts.port;
  ipAddress = this._opts.ipAddress;

  this._x10Device = x10Device;
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
    app.on('x10in', function(incommingData){
      if (x10Device.type == 'sensor'){
        if(incommingData.indexOf('RF HouseUnit: ' + x10Device.houseUnit) > -1){
          // the data refers to this device
          if(incommingData.indexOf('Func: On')> -1){
            command = 'ON';
          }
          if(incommingData.indexOf('Func: Off') > -1){
            command = 'OFF'
          }
          if (command){
            // app.log.info('x10_mochad_driver: about to emit command: ' + command);

            self.emit('data', command);
          }
        }
     }
    })
  });
};

  /**
   * Called whenever there is data from the Ninja Platform
   * This is required if x10Device.writable = true
   *
   * @param  {String} data The data received
   */
   x10Device.prototype.write = function(data) {
    /**
    change:
    mochad.write('pl ' + this._x10Device.houseUnit + ' ' + data + '\n');
    to:
    mochad.write('rf ' + this._x10Device.houseUnit + ' ' + data + '\n');
    if you only transmit with radio (no powerline)
    **/
  // I'm being actuated with data!
    mochad.write('pl ' + this._x10Device.houseUnit + ' ' + data + '\n');
  };




// Export it
module.exports = x10Device;
module.exports = x10Driver;