var X10Device = require('./lib/x10Device')
, util = require('util')
, stream = require('stream')
, net = require('net')
, configHandlers = require('./lib/config-handlers');


// Give our driver a stream interface
util.inherits(x10Driver,stream);

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
  var mochad;
  // this._log = app.log;
  this._opts = opts;
  if (this._opts.ipAddress){
    mochad = net.createConnection(this._opts.port, this._opts.ipAddress);
  };

  if (!this._opts.x10Devices){
    this._opts.x10Devices = [];
  }
  this.registeredDevices = {};

  app.on('client::up',function(){

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
      this.registerAll(mochad);
    }
  }.bind(this));


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
 x10Driver.prototype.config = function(rpc,cb) {

  var self = this;
  // If rpc is null, we should send the user a menu of what he/she
  // can do.
  // Otherwise, we will try action the rpc method
  if (!rpc) {
    return configHandlers.menu.call(this,cb);
  }
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
  }
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


x10Driver.prototype.registerDevice = function (x10Device, mochad) {
  if (typeof(x10Device) !== 'undefined'){
    var device;
    var key = x10Device.houseUnit + x10Device.type;
    if (key in this.registeredDevices){
      device = this.registeredDevices[key];
    } else {
      device = new X10Device(this, x10Device, mochad);
    }
    this.save();
    this.emit('register', device, mochad)
  }
};

x10Driver.prototype.registerAll = function (mochad) {
  if (typeof(this._opts.x10Devices) !== 'undefined'){
    var devices = this._opts.x10Devices;
    for ( var i = 0; i < devices.length; i++){
      this.registerDevice(devices[i], mochad);
    }
  }
};
};


// Export it
module.exports = x10Driver;