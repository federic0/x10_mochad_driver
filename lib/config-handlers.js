var configMessages = require('./config-messages');

/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function(cb) {

  cb(null,configMessages.menu);
};

/**
 * Called when a user clicks the 'configure IP & Port'
 * button we sent in the menu request
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.get_mochad_ip_port = function(params,cb) {
	var result = configMessages.mochad;
	result['contents'][1]['value'] = this.opts.ipAddress || "192.168.0.100";
  	result['contents'][2]['value'] = this.opts.port || 1099;
  	cb(null, result);
};

exports.save_mochad_params = function (params,cb) {
	this.setIpPort.call(this, params.mochad_ip_address, params.mochad_port);
	cb(null, configMessages.finish);
}

exports.save_x10_params = function (params,cb) {
	this.setX10.call(this, params.x10_houseUnit, params.x10_device_type);
	cb(null, configMessages.finish);
};

exports.x10_device_add = function (params, cb) {
	cb(null, configMessages.x10_device_add);
};

