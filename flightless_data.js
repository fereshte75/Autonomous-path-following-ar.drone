var arDrone = require('ar-drone');
var client = new arDrone.createClient();
var lastNavDataMs = 0;

client.config('detect:detect_type', 12); 			//to detect the oriented roundel
client.config('general:navdata_demo', 'FALSE');     // to recieve all navdata
client.config('control:flying_mode', 0);            // to have free flight	
client.config('video:video_channel', 3); 			// to stream the bottom facing camera

client.on('navdata', function(d) {

  var nowMs = new Date().getTime();
  
  if (nowMs - lastNavDataMs > 1000) {        //to show the data every 1 seconds
    lastNavDataMs = nowMs;

	
    if (d.demo){
		
	console.log('tag?:' + d.visionDetect.nbDetected);
	console.log('tag_type:' + d.visionDetect.type);
	console.log('tag_xc:' + d.visionDetect.xc);
	console.log('tag_yc:' + d.visionDetect.yc);
	console.log('tag_width:' + d.visionDetect.width);
	console.log('tag_distance:' + d.visionDetect.dist);
	console.log('tag_orientation Angle:' + d.visionDetect.orientationAngle);
	console.log('altitude:' + d.demo.altitude);
	
	// console.log('time(s):' + d.time);
	// console.log('windspeed:'+ d.windSpeed.speed);
	// console.log('time:' + d.time);
	// console.log('tempreture:' + d.rawMeasures.altTemp);
	// console.log('drone state:' + d.demo.flyState);
	// console.log('accelerometer tempreture:' + d.pressureRaw.temperature.accelerometer);
	// console.log('mx:' + d.magneto.mx);
	// console.log('x velocity:' + d.demo.xVelocity);
	// console.log('z velocity:' + d.demo.zVelocity);
	console.log('..........................')
	};
	
  };
  });


