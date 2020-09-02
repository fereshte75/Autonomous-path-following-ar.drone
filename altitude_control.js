var arDrone = require('ar-drone');              //to include the module 
var client = new arDrone.createClient();

var H_target=2            //the target altitude we want the drone to hover in 
client.config('general:navdata_demo', 'FALSE');    //to recieve all the navdata
client.takeoff();

client
    .after(5000, function() {
           		    	
	this.on('navdata', function(d) {

	if (d.demo){
var	altitude=d.demo.altitude;	
	
	
	if (altitude<H_target){
		console.log('altitude:' + altitude);
		client.up(0.1);
		console.log('going up');
	}else{
		client.stop();
		console.log('altitude:' + altitude);
	
	};	
	
	};	
	 
});
});
