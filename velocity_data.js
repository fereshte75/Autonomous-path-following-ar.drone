var arDrone = require('ar-drone');
var fs = require('fs');
var client = new arDrone.createClient();
require('events').EventEmitter.defaultMaxListeners = 0;

var totalx=0; 	  //X-displacement 	 (X_est)
var totaly=0;	  //Y-displacement 	 (Y_est)
var oldt=0;

//////X-control
var maxs=0.05;          //speed the drone will fly forward with
var target=3000;		//the approximate distance  to fly to(mm)
var target=2000;

var array=[];
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

client.config('control:flying_mode', 0);     //to have free flight
client.config('detect:detect_type', 12);	//to detect the oriented roundel
client.config('general:navdata_demo', 'FALSE');      // to recieve all navdata
client.takeoff();
client
    .after(6000, function() {
       	
	this.on('navdata', function(d) {
	if (d.demo){	
	

//to always have updated state of the drone	

var state=d.demo.controlState;
var batt=d.demo.batteryPercentage;	

console.log(d.demo.controlState);
console.log('batterypercentage:' + d.demo.batteryPercentage);
console.log(d.demo.flyState);	
//////velocity and displacement //////////////////////////

var xspeed=d.demo.xVelocity;
var yspeed=d.demo.yVelocity;		

if (d.time){

var deltat=d.time - oldt;  ///(milli seconds)

oldt=d.time;
	
if (deltat<100){
var xmove=(xspeed*deltat/1000);
var ymove=(yspeed*deltat/1000);

}else{
var xmove=xspeed*0.005; 
var ymove=yspeed*0.005;
}	

}else{
var xmove=xspeed*0.005; 
var ymove=yspeed*0.005;

}
 /// total horizontal displacement in [mm]
totalx=xmove+totalx;	
totaly=ymove+totaly;

///////for data logging to matlab
var mix='['+d.time+';'+xspeed+';'+yspeed+';'+totalx+';'+totaly+']';

array.push(mix);
async function run() {
  await sleep(0);
  fs.writeFile("./matrixtest.js", array, function(err) {
if(err) {
        console.log(err);
  } 
  else {
    //console.log("Output saved to /matrixtest.js.");
    }
});  
  
}
run();  
/////////////
console.log('ytotal:' + totaly/10);     //print desiplacements in [cm]
console.log('xtotal:' + totalx/10);

///////////////controling ////////////
var tag=d.visionDetect.nbDetected;

	
	if (tag==1){
		
		totalx=0;
		totaly=0;
		client.front(maxs);
	}else{
			if (totalx<target){               
				client.front(maxs);
				
				console.log('      moving forward with speed '+ maxs);	
								
			}else{
				client.stop();
				client.land();
                 console.log('               landing');      						
			};
	};
};	
});
});
	
