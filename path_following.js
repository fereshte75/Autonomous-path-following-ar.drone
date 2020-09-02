function pause(numberMillis) { 
    var now = new Date(); 
    var exitTime = now.getTime() + numberMillis; 
    while (true) { 
        now = new Date(); 
        if (now.getTime() > exitTime) 
            return; 
    } 
} 

var arDrone = require('ar-drone');
var fs = require('fs');
var client = new arDrone.createClient();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
require('events').EventEmitter.defaultMaxListeners = 0;
var totalx=0; 
var totaly=0;
var oldt=0;
var tag_flag=0;

var array=[];
// x speed control
var maxs=0.06;     //maximum speed the drone will fly forward with
var mins=0;        //minimum speed the drone will fly forward with
var target=3500;   // the distance between tags
var gap=1500;      //the distance from the tag that the drone will lower its speed
var alpha=(mins-maxs)/gap;    //the slope of speed decrease

var starts=target-gap;        // the position from the start that the drone will start decreasing its speed
// y deviation and speed control
var maxsy=0.1;              // maximum speed the drone will fly in its y axis
primary_limit=400;          // the y deviation limit during the flight  [mm]
final_limit=200             // the y deviation limit at the target  [mm]

/////// image stream
var pngStream = client.getPngStream();
var frameCounter = 0;
var period = 50; 			// Save a frame every 50 ms.
var lastFrameTime = 0;

/////


client.config('video:video_channel', 3);                   // to set the image stream to horizontal camera
client.config('control:flying_mode', 2);                   // to make the drone align itself over the oriented roundel tag 
client.config('control:altitude_min',1500);
client.config('control:altitude_max',2500);
client.config('detect:detect_type', 12);                   // to detect the oriented roundel 
client.config('general:navdata_demo', 'FALSE');     	   // to recieve all navdata


client.takeoff();
client
    .after(5000, function() {
      this.up(0.4);
	  console.log('going up' );
	  })

    .after(2000, function() {           //control the altitude by this time
    client.stop()	
      	
	this.on('navdata', function(d) {
	if (d.demo){
////////to always have updated state of the drone	

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

////////////
speed=alpha*(totalx-starts)+maxs;   //x-speed control calculation
///////////////controling stuff////////////
var tag=d.visionDetect.nbDetected;
var angleturn=d.visionDetect.orientationAngle[0];    // orientation angle of the tag 
var angleabs=Math.abs(angleturn);

var cosang=Math.cos(angleturn*3.14/180)

console.log(tag);
console.log(tag_flag);

//////////// uncomment this block incase you want to record and save any variables.
///////////They can be copied to matlab and become a matrix. 
/* var mix='['+d.time+';'+xspeed+';'+yspeed+';'+totalx+';'+totaly+';'+altitude+']';

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
run(); */
////////////////////////////////////////////////



	if (tag==1){
		if (tag_flag==0){
			           
						pause(8000)            // the amount of time that the drone has from seeing the tag until moving again
						                       // increase if drone is unstable at tags but 5 to 10 seconds is best 
						totalx=0;
						totaly=0;
						tag_flag=1;
						
		}else if(cosang<0.94){
			client.front(-0.13);			
			console.log('aligning has not been done right... going back the orientation angle is: '+ angleturn) 
			client.config('control:flying_mode', 2);   //delete incase of not aligning over subsequent tags
		}else{
			client.config('control:flying_mode', 0);   //delete incase of not aligning over subsequent tags
			client.front(0.2);
			console.log('                       after tag... going forward'); 
			tag_flag=1;
					
		}
	
	}else{

			console.log('                          no tag yet---configed for tag hovering---continuing path');
			client.config('control:flying_mode', 2); //delete incase of not aligning over subsequent tags
			tag_flag=0;	
			
			
			if (totaly>primary_limit){ 
				console.log('                          moving left to fix y deviation: '+totaly);			
				client.left(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});
			
				
			}else if (totaly<-primary_limit){
				
				console.log('                          moving right to fix y deviation: '+totaly);			
				client.right(maxsy);
				sleep(600).then(() => {
						client.stop();		
					});
			}else if(totalx<starts){                       
				
				client.front(maxs);				 
				console.log('                          moving forward with speed'+ maxs);	
	
    		}else if (totalx<target){               
				client.front(speedx);
				
				console.log('                          moving forward with speed '+ speedx);	
				
			}else if (totaly>final_limit){
				console.log('                          moving left to fix y deviation: '+totaly);			
				client.left(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});
				
			}else if (totaly<-final_limit){
				
				console.log('                          moving right to fix y deviation:'+totaly);			
				client.right(maxsy);
				sleep(600).then(() => {
						client.stop();		
						});		                       						
							
			}else{
				
				client.front(-0.1);
				console.log('tag should be here but it isnt...going back looking for tag')
			};
	
	};
			};
});
});
	
/////video stream
pngStream
  .on('error', console.log)
  .on('data', function(pngBuffer) {
    var now = (new Date()).getTime();
    if (now - lastFrameTime > period) {
      frameCounter++;
      lastFrameTime = now;
      console.log('Saving frame');
      fs.writeFile('./video/frame' + frameCounter + '.png', pngBuffer, function(err) {
        if (err) {
          console.log('Error saving PNG: ' + err);
        }
      });
    }
  });

	
