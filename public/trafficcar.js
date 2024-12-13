// trafficcar.js
import * as THREE from 'three';

export default class TrafficCar {
    constructor(game) {
        this.game = game;
        this.mesh = this.createTrafficCar();

        const laneIndex = Math.floor(Math.random() * this.game.lanePositions.length);
        this.lane = this.game.lanePositions[laneIndex];

        // All cars start at same speed
        this.speed = 15; 
        this.maxSpeed = this.speed; 

        // Initial tentative position
        this.mesh.position.set(
            this.lane,
            0.5,
            this.game.player.mesh.position.z + 100 + Math.random() * 5000
        );

        // Ensure no car spawns too close to another car
        // Increase the safe distance to ensure absolutely no hiccups
        const safeDistance = 100; 
        this.ensureSafeStartingDistance(safeDistance);

        // Without lane changing, these are no longer needed
        // this.laneChangeCooldown = 0;
        // this.turnSignal = null;

        this.stuckTimer = 0;
        this.lastPosition = this.mesh.position.clone();
    }

    createTrafficCar() {
        const carGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        carGroup.add(body);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const wheels = [];
        for (let i = 0; i < 4; i++) {
            wheels[i] = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheels[i].rotation.z = Math.PI / 2;
        }
        wheels[0].position.set(-0.7, 0.3, 1.3);
        wheels[1].position.set(0.7, 0.3, 1.3);
        wheels[2].position.set(-0.7, 0.3, -1.3);
        wheels[3].position.set(0.7, 0.3, -1.3);

        wheels.forEach((wheel) => carGroup.add(wheel));

        return carGroup;
    }

    ensureSafeStartingDistance(safeDistance) {
        // If there's any other car too close in front, move this car forward until clear
        let attempts = 0;
        while (this.tooCloseToOtherCars(safeDistance) && attempts < 100) {
            this.mesh.position.z += 50; // push it further ahead
            attempts++;
        }
    }

    tooCloseToOtherCars(distance) {
        for (let i = 0; i < this.game.trafficCars.length; i++) {
            const otherCar = this.game.trafficCars[i];
            if (otherCar !== this) {
                const dz = otherCar.mesh.position.z - this.mesh.position.z;
                const dx = Math.abs(otherCar.mesh.position.x - this.mesh.position.x);
                // If another car is ahead and within 'distance', return true
                if (dz > 0 && dz < distance && dx < 1.0) {
                    return true;
                }
            }
        }
        return false;
    }

    update(deltaTime) {
        if (!deltaTime || deltaTime <= 0) return; // Ensure deltaTime is positive

        const oldPosition = this.mesh.position.clone();

        // Move forward at constant speed
        this.mesh.position.z += this.speed * deltaTime;

        // Maintain max speed (no lane changes or slowdowns)
        this.speed = this.maxSpeed;

        // Handle stuck situations (unlikely now)
        if (this.speed < 1) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
        }

        if (this.stuckTimer > 5) {
            this.resetCarPosition();
        }

        // No lane changing logic
        // No turn signals

        // Avoid player (if desired, we keep them at max speed anyway)
        this.avoidPlayer(deltaTime);

        // Reset if behind player
        this.resetIfBehindPlayer();

        // Check overlaps (should never happen)
        // if (this.checkOverlapWithCars()) {
        //     this.mesh.position.copy(this.lastPosition);
        // }

        // Collision detection with player
        this.checkCollisionWithPlayer();

        // Update lastPosition
        this.lastPosition.copy(oldPosition);
    }

    // Removed attemptLaneChange() and applyLaneChange() entirely

    avoidPlayer(deltaTime) {
        // Keep speed constant to avoid hiccups
        this.speed = this.maxSpeed;
    }

    resetIfBehindPlayer() {
        if (this.mesh.position.z < this.game.player.mesh.position.z - 200) {
            const laneIndex = Math.floor(Math.random() * this.game.lanePositions.length);
            const newLane = this.game.lanePositions[laneIndex];

            this.mesh.position.z = this.game.player.mesh.position.z + 500 + Math.random() * 1000;
            this.lane = newLane;
            this.mesh.position.x = newLane;
            this.speed = this.maxSpeed;
            this.stuckTimer = 0;
        }
    }

    resetCarPosition() {
        const laneIndex = Math.floor(Math.random() * this.game.lanePositions.length);
        const newLane = this.game.lanePositions[laneIndex];

        this.mesh.position.z = this.game.player.mesh.position.z + 2000 + Math.random() * 1000;
        this.lane = newLane;
        this.mesh.position.x = newLane;
        this.speed = this.maxSpeed;
        this.stuckTimer = 0;
    }

    checkOverlapWithCars() {
        for (let i = 0; i < this.game.trafficCars.length; i++) {
            const otherCar = this.game.trafficCars[i];
            if (otherCar !== this) {
                const dx = this.mesh.position.x - otherCar.mesh.position.x;
                const dz = this.mesh.position.z - otherCar.mesh.position.z;
                if (Math.abs(dx) < 1.4 && Math.abs(dz) < 2.8) {
                    return true;
                }
            }
        }
        return false;
    }

    checkCollisionWithPlayer() {
        if (
            Math.abs(this.game.player.mesh.position.x - this.mesh.position.x) < 1.2 &&
            Math.abs(this.game.player.mesh.position.z - this.mesh.position.z) < 4
        ) {
            this.game.gameOverHandler('You crashed into a car! Game Over!');
        }
    }

    // updateTurnSignals() removed completely since no lane changes or signals
}
