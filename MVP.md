- what I've done so far:

- create functionally moving car that the user controls that responds to the arrow keys
- created road + background that the user drives on
- created a cop car that follows the user and tries to catch up with the user to "tag" it, causing the game to end
- created basic functionality for traffic cars
- created an animation to start the game and a message to end the game
- created homescreen
- added in 3d model of a porsche as the user car
- created subtitles to be able to pick up on words said by the surrounding environment. 
- added local leaderboard (since firebase storage wasn't yet available)
- added coins obtained from the score received each restart -- precursor to garage functionality

Where this is headed:

The main vision for the future is a smoother functionality, more entertaining gameplay, and more opportunities to get different cars. 

P1:

- update functionality of traffic cars to "act more like traffic cars". Essentially what this means is that sometmes their are too many traffic cars or sometimes the traffic cars are too slow or randomly make lane changes that are unnecessary. Fix this so that the traffic cars act more like traffic cars. This shouldn't take too much effort.

- Smoothen the movement of the user's car. The user car at times can go left to right slower than usual and also the movement looks weird and unnatural. Try to smoothen this movement by either getting rid of the car tilt that occurs when you press the left and right keys or smoothen out the tilt. 

- Update the score to add more points and more points as time goes on (concave up on a graph).

- add a garage feature where users can buy new cars. Also, create 3d models for a few cars that the user will be able to purchase with coins. Make it increasingly difficult to buy the later and later cars. 

- add road terrain to effect the level of turning based on the road terrain. Ensure that the road terrain changes randomly with time, but doesn't change too often.

- add 3d models for the cop car and traffic cars 

- add boost feature

- add control Scheme class to control what button leads to different outcomes (boost, windshields wipers/honk in future)

- update leaderboard to be global using firebase storage

P2:

- add weather: rain, snow. Not only will this affect the ground terrain and effect the user's ability to drive, but this should also partially distort the vision of the car. 

- add windshield wiper to clean the rain. Add honk to get traffic cars to move out of the way. 

- Add upgrades to specific cars so that you can upgrade aspects like acceleration, braking, boost, turn, etc..


