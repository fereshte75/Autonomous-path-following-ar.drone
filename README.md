# Autonomous-path-following-ar.drone
This project is my master's Thesis in politecnico di milano.   It involves using the node.js module from felixge (https://github.com/felixge/node-ar-drone) to program the parrot ar.drone 2.0 to autonomously follow a prepared route in an indoor environment using the oriented roundel tag detectable by the drone. 

Each file is a seperate section of my thesis including comments to make it more clear. 

Flightless_data.js : is about getting the tag detection data section of the NavData of the AR.Drone. It can also be used to get other real-time data of the pack without having the drone actually fly. 

altitude_control: is the code that I used to have the drone fly upwards and then hover at certain altitude. For landing, it requires intervention with the land.js file. 

Velocity_data.js: is the code I used to understand the accuracy of the horizontal velocity estimated by the drone. It involves logging the data to an external file to be analysed in MATLAB afterwards. 


Target_approach.js:  is the code I used to have the drone fly streight to a target in front of it in a pre_defined distance and land when it has reached it. The drone needs to fix the deviations in y-axis. This algorithm also includes a speed control loop so that the drone would slow down when it gets closer to the target. 

Path_following.js: is the final code for the path_following that includes detecting tags and going from one to another. For landing, it requires intervention with the land.js file. 

Videos of using this code can be found in this link: https://www.youtube.com/playlist?list=PLMgMMhA1mz0TW52uztdYwuiSyRUfi9Xbp

My thesis is published in this link: http://hdl.handle.net/10589/166702
