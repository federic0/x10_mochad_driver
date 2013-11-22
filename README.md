X10 Driver for Ninjablocks
==========================

this is an X10 driver for Ninja Blocks that works through mochad, a server that can receive TCP (netcat) commands and relay them to X10 via the powerline and RF, it requires a CM15A or a CM19A controller. First of all, apologies as this is my first code ever in javascript. It's completely beta. 

requirements:
-------------

* X10 devices
* CM15A or CM19A X10 Controller
* mochad server (http://sourceforge.net/apps/mediawiki/mochad/index.php?title=Main_Page)

What it does:
-------------

Allows controlling X10 devices though the Ninjablocks dashboard, using X10 devices and sensors in rules...

Configuration of the driver consists of specifying the IP address and port of the mochad server. Then adding X10 devices, for the moment only **ON/OFF** and **sensor** devices are supported.

**ON/OFF** devices can be lamp or appliance modules. They respond to ON and OFF commands.
**Sensors** are X10 PIR sensors.

widget code for ON/OFF devices is provided.

Sensors can be used to trigger rules using the developer mode generic rule components, by using the change trigger and setting the **"change"** widget field to *ON* or *OFF*.

Installation
------------

```
ssh into your block
cd PATH_TO_NINJA_CLIENT/drivers
git clone https://github.com/federic0/x10_mochad_driver.git
cd x10_mochad_driver
npm install
sudo service ninjablock restart
```

You then go to the *settings* tab on your dashboard and click on *configure* from the *block* tab. click on *X10 Mochad Driver* and click on *configure IP & Port*, fill in the fields with the IP address of the mochad server and the port it listens to (default is 1099), **save**. Click once again *configure* and *X10 Mochad Driver*, then click *Configure X10 Device*, select the *device type* and its *house unit* (i.e. A1). Repeat for as many devices as needed. Two devices can have the same house unit code if one is a sensor and the other an ON/OFF module.

Then, on the beta dashboard you will need to go to the widget menu of your device (cog menu) and replace the HTML CSS and JS code with the code found in ```https://gist.github.com/federic0/7596393```. Replace HTML code with view.html, CSS code with style.less and JS with widget.js.

Benefits:
---------

Integrates X10 control under NB
Control of several units is possible from a single widget by using aggregate widgets.
Rules can be used to control X10 devices.
X10 PIR sensors can be used in new ways, they normally control a single device and are set to switch off the device after a certain amount of time. With the driver they can be used as any PIR and actuate on several devices. They can be set to a non used house unit code.

Limitations:
------------

I have not incorporated status information because it is unreliable. mochad provides status information based on command the server has "seen". However, some devices may be actuated on from manual switches which mochad cannot monitor, resulting in inaccurate status reports.

To do:
------

Add dimmable devices
The sensor code could be extended to listen to events such as knowing when a light is turned on? Any interest in this?
Add a friendly name when adding a device so that it is shown on the widget

I will not incorporate security devices since I do not own any and cannot perform testing.

This code has been tested with mochad 0.1.15 and CM15A
