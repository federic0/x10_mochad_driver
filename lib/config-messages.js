exports.menu = {
  "contents":[
    { "type": "paragraph", "text": "Please select an option in order to configure X10/mochad."},
    { "type": "submit", "name": "congigure IP & Port", "rpc_method": "configure_mochad" },
    { "type": "submit", "name": "configure X10 device", "rpc_method": "configure_x10_device" },

  ]
};

exports.x10_device_add = {
  "contents":[
	{ "type": "paragraph", "text": "Please select the type of device and provide its HouseUnit code." },

	{ "type": "input_field_select", "field_name": "x10_device_type", "label": "X10 device type", "options": [
      { "name": "on_off", "value": "ONOFF", "selected": true },
      { "name": "sensor", "value": "sensor", "selected": false },
    ], "required": true },
    { "type": "input_field_text", "field_name": "x10_houseUnit", "value": "", "label": "HouseUnit code", "placeholder": "A1", "required": true},
    { "type": "submit", "name": "Save", "rpc_method": "save_x10_params" },
    { "type": "close", "text": "Cancel" },
   ]
};

exports.mochad = {
	"contents":[
	{ "type": "paragraph",    "text": "The X10/mochad driver has been loaded, please provide the IP and port of your mochad server. You should not see this message again." },
    { "type": "input_field_text", "field_name": "mochad_ip_address", "value": "", "label": "mochad server IP address", "placeholder": "192.168.0.102", "required": true},
    { "type": "input_field_text", "field_name": "mochad_port", "value": "", "label": "mochad server port", "placeholder": "1099", "required": true},
    { "type": "submit", "name": "Save", "rpc_method": "save_mochad_params" },
    { "type": "close", "text": "Cancel" },
   ]
};
exports.finish = {
  "finish": true
};