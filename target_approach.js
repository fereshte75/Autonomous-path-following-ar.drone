var arDrone = require('ar-drone');
var client = new arDrone.createClient();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
require('events').EventEmitter.defaultMaxListeners = 0;

var totalx=0; 	  //X-displacement 	 (X_est)
var totaly=0;	  //Y-displacement 	 (Y_est)

var oldt=0;

/////Y-control
var maxsy=0.08; 	//Max speed to fly in y-axis
primary_limit=400;          // the y deviation limit during the flight  [mm]
final_limit=200             // the y deviation limit at the target  [mm]
//////X-control
var maxs=0.05;   //maximum speed the drone will fly forward with
var mins=0;		 //minimum speed the drone will fly forward with
var target=3000;		//the target distance (mm)
var gap=1000;			//the distance from the target that the drone will lower its speed	
var alpha=(mins-maxs)/gap;
var starts=target-gap;
//////
var array=[];


client.config('control:flying_mode', 0);     //to have free flight
client.config('detect:detect_type', 12);	//to detect the oriented roundel
client.config('general:navdata_demo', 'FALSE');      // to recieve all navdata
client.takeoff();
client
    .after(5000, function() {
    	
      	
	this.on('navdata', function(d) {
	if (d.demo){

//to always have updated state of the drone	

var state=d.demo.controlState;
var batt=d.demo.batteryPercentage;	

console.log(d.demo.controlState);
console.log('batterypercentage:' + d.demo.batteryPercentage);
console.log(d.demo.flyState);	
//////velocity and displacement //////////////////////////

if (state=='CTRL_LANDED'){
var xspeed=d.demo.xVelocity;
var yspeed=d.demo.yVelocity;		
}else{
var xspeed=d.demo.xVelocity*1.20+14.97;
var yspeed=d.demo.yVelocity*1.15+24.05;
}

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
////////////
speed=alpha*(totalx-starts)+maxs;   //x-speed control calculation

console.log('ytotal:' + totaly/10);  //print desiplacements in [cm]
console.log('xtotal:' + totalx/10);

///////////////controling flight////////////
var tag=d.visionDetect.nbDetected;
	
	if (totaly>Primary_limit){
				
				console.log('    moving left to fix y deviation: '+totaly);			
				client.left(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});
				
			}else if (totaly<-Primary_limit){
				
				console.log('      moving right to fix y deviation:'+totaly);			
				client.right(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});
			}else if (totalx<starts){                       
				client.front(maxs);
				console.log('      moving forward with speed '+ maxs);	
		
    		}else if (totalx<target){                
				client.front(speed);
				
				console.log('    moving forward with speed '+ speed);	
					
						
			}else if(totaly>final_limit){
				
				console.log('  moving left to fix y deviation: '+totaly);			
				client.left(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});
			}else if (totaly<-final_limit){
				
				console.log('  moving right to fix y deviation:'+totaly);			
				client.right(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});			
							
			}else{
				client.stop();
				client.land();
                 console.log('                          landing');      						
				
			};
	};	
});
	});
	
