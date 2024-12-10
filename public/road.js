// road.js
import * as THREE from 'three';

export default class Road {
    constructor(game) {
        this.game = game;
        this.scene = game.scene; // Correctly reference the game's scene
        this.roadWidth = 10;
        this.roadLength = 20000;

        this.createRoad();
        this.createHighwayLines();
        this.createBarriers();
    }
    // generates the road using three.js
    createRoad() {
        const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, this.roadLength);
        const roadMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2; // Lay flat
        road.position.z = 0; // Centered at z = 0
        this.scene.add(road);
    }
    //generates the highwayLines that show up on the road. Using three.js for their prebuilt visuals. 
    createHighwayLines() {
        const lineGroup = new THREE.Group();
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lineWidth = 0.1;
        const lineLength = 5;
        const gapBetweenLines = 5;
        const numberOfLines = Math.ceil(this.roadLength / (lineLength + gapBetweenLines));
        const lanePositions = [-this.roadWidth / 4, 0, this.roadWidth / 4];

        lanePositions.forEach((xPos) => {
            for (let i = 0; i < numberOfLines; i++) {
                const lineGeometry = new THREE.PlaneGeometry(lineWidth, lineLength);
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(
                    xPos,
                    0.15,
                    -this.roadLength / 2 + i * (lineLength + gapBetweenLines)
                );
                lineGroup.add(line);
            }
        });
        this.scene.add(lineGroup);
    }
    // creates visual (able to be seen playing the game) and physical (blockers that prevent the car from moving past a certain point) barriers
    createBarriers() {
        const barrierGroup = new THREE.Group();
        const barrierGeometry = new THREE.BoxGeometry(0.2, 1, 5);
        const barrierMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const numberOfBarriers = Math.ceil(this.roadLength / 5);
        const positions = [-this.roadWidth / 2 - 0.5, this.roadWidth / 2 + 0.5];

        positions.forEach((xPos) => {
            for (let i = 0; i < numberOfBarriers; i++) {
                const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
                barrier.position.set(xPos, 0.5, -this.roadLength / 2 + i * 5);
                barrierGroup.add(barrier);
            }
        });
        this.scene.add(barrierGroup);
    }
}
