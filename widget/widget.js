var onButton = element.find(".switch_on");
var offButton = element.find(".switch_off");


onButton.on("click", function(){
  _.each(scope.Widget.devices, function(d){
    var device = scope.GetNinjaDevice(d);
    device.Emit(' on');
  });
});

offButton.on("click", function(){
  _.each(scope.Widget.devices, function(d){
    var device = scope.GetNinjaDevice(d);
    device.Emit(' off');
  });
});