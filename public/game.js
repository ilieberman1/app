import * as THREE from 'three';
import Player from './player.js';
import CopCar from './copcar.js';
import TrafficCar from './trafficcar.js';
import Road from './road.js';
import InputHandler from './inputhandler.js';
import SpeechRecognitionHandler from './speechrecognition.js';
import SettingsMenu from './settingsmenu.js';
import IntroAnimation from './introanimation.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import gsap from 'gsap';

export default class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.copCar = null;
        this.trafficCars = [];
        this.trees = [];
        this.clouds = [];
        this.smokeParticles = [];
        this.score = 0;
        this.gameOver = false;
        this.playerSpeed = 0;
        this.maxSpeed = 0.6;
        this.acceleration = 0.01;
        this.deceleration = 0.02;
        this.copMaxSpeed = 0.5;
        this.copAcceleration = 0.005;
        this.copCurrentSpeed = 0;
        this.currentRotationAngle = 0;
        this.maxRotationAngle = Math.PI / 8;
        this.rotationSpeed = 0.05;
        this.lanePositions = [-3.75, -1.25, 1.25, 3.75];
        this.roadWidth = 10;
        this.roadLength = 20000;
        this.keys = {};
        this.smokeTexture = null;
        this.subtitlesEnabled = true;
        this.subtitleElement = document.getElementById('subtitle');
        this.scoreboard = document.getElementById('scoreboard');
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-button');
        this.modelLoaded = false;
        this.gameStarted = false;
        this.sirenInterval = null;
        this.sirenOn = false;

        // Load the stored number of coins from localStorage
        this.coins = parseInt(localStorage.getItem('coins') || '0', 10);
    }

    async init() {
        this.setupRenderer();
        this.setupCamera();
        this.addLighting();
        this.createProceduralSky();
        this.loadSmokeTexture();
        this.setupEventListeners();
        this.speechRecognitionHandler = new SpeechRecognitionHandler(this);
        this.settingsMenu = new SettingsMenu(this);
        this.road = new Road(this);
        this.road.createRoad();
        this.road.createHighwayLines();
        this.road.createBarriers();
        this.createEnvironment();
        await this.loadPlayerModel();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    }

    addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffddaa, 1);
        this.sunLight.position.set(-50, 100, -50);
        this.scene.add(this.sunLight);

        // Sun object for visual representation
        this.sunMesh = new THREE.Mesh(
            new THREE.CircleGeometry(20, 32),
            new THREE.MeshBasicMaterial({ color: 0xffddaa, side: THREE.DoubleSide })
        );
        this.sunMesh.position.set(-100, 100, -100);
        this.scene.add(this.sunMesh);
    }

    createProceduralSky() {
        const sky = new Sky();
        sky.scale.setScalar(450000);
        this.scene.add(sky);

        const skyUniforms = sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const sunParameters = {
            elevation: 20,
            azimuth: 180
        };

        const phi = THREE.MathUtils.degToRad(90 - sunParameters.elevation);
        const theta = THREE.MathUtils.degToRad(sunParameters.azimuth);

        this.sunLight.position.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(this.sunLight.position);
    }

    loadSmokeTexture() {
        const textureLoader = new THREE.TextureLoader();
        //this.smokeTexture = textureLoader.load('smoke.png');
    }

    setupEventListeners() {
        this.inputHandler = new InputHandler(this);
    }

    createEnvironment() {
        this.createTrees();
        this.createMountain();
        this.createClouds();
    }

    createTrees() {
        const treeGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });

        for (let i = 0; i < 500; i++) {
            const tree = new THREE.Group();

            const leaves = new THREE.Mesh(treeGeometry, treeMaterial);
            leaves.position.y = 1.5;
            tree.add(leaves);

            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.5;
            tree.add(trunk);

            tree.position.set(
                Math.random() > 0.5 ? this.roadWidth / 2 + 2 + Math.random() * 10 : -this.roadWidth / 2 - 2 - Math.random() * 10,
                0,
                -this.roadLength / 2 + Math.random() * this.roadLength
            );
            this.trees.push(tree);
            this.scene.add(tree);
        }
    }

    createMountain() {
        const mountainGeometry = new THREE.ConeGeometry(50, 100, 32);
        const mountainMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        this.mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        this.scene.add(this.mountain);
    }

    createClouds() {
        for (let i = 0; i < 50; i++) {
            this.createCloud();
        }
    }

    createCloud() {
        const cloudGeometry = new THREE.SphereGeometry(5, 32, 32);
        const cloudMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        const cloud = new THREE.Group();

        const puff1 = new THREE.Mesh(cloudGeometry, cloudMaterial);
        const puff2 = new THREE.Mesh(cloudGeometry, cloudMaterial);
        const puff3 = new THREE.Mesh(cloudGeometry, cloudMaterial);

        puff1.position.set(-2, 0, 0);
        puff2.position.set(2, 0, 0);
        puff3.position.set(0, 1.5, 0);

        cloud.add(puff1);
        cloud.add(puff2);
        cloud.add(puff3);

        cloud.scale.setScalar(1 + Math.random() * 2);
        cloud.position.set(
            -200 + Math.random() * 400,
            30 + Math.random() * 20,
            -500 + Math.random() * 1000
        );

        this.scene.add(cloud);
        this.clouds.push(cloud);
    }

    async loadPlayerModel() {
        this.loadingScreen.style.display = 'flex';

        const fbxLoader = new FBXLoader();
        try {
            const object = await fbxLoader.loadAsync('porsche.fbx');
            this.player = new Player(this, object);
            this.scene.add(this.player.mesh);

            // Create cop car
            this.copCar = new CopCar(this);
            this.scene.add(this.copCar.mesh);

            // Create traffic cars
            for (let i = 0; i < 150; i++) {
                const trafficCar = new TrafficCar(this);
                this.trafficCars.push(trafficCar);
                this.scene.add(trafficCar.mesh);
            }

            this.modelLoaded = true;

            this.startButton.disabled = false;
            this.loadingScreen.style.display = 'none';
            this.mainMenu.style.display = 'flex';

            // Update the coin display on the main menu
            document.getElementById('coin-display').textContent = 'Coins: ' + this.coins;

            this.startButton.addEventListener('click', () => {
                if (!this.modelLoaded) {
                    alert('The car model is still loading. Please wait a moment.');
                    return;
                }
                this.mainMenu.style.display = 'none';
                this.startIntroAnimation();
            });
        } catch (error) {
            console.error('Error loading the Porsche model:', error);
            this.loadingScreen.textContent = `Error loading model: ${error.message}. Please check the file path.`;
        }
    }

    startIntroAnimation() {
        this.gameStarted = true;
        this.introAnimation = new IntroAnimation(this);
        this.introAnimation.start();
    }

    animate() {
        if (this.gameOver || !this.player.mesh) return;

        requestAnimationFrame(() => this.animate());

        const deltaTime = 1;
        this.update(deltaTime);

        this.renderer.render(this.scene, this.camera);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.copCar.update(deltaTime);

        this.trafficCars.forEach((trafficCar) => {
            trafficCar.update(deltaTime);
        });

        this.trees.forEach((tree) => {
            tree.position.z -= this.playerSpeed;
            if (tree.position.z < this.player.mesh.position.z - 200) {
                tree.position.z = this.player.mesh.position.z + this.roadLength / 2;
            }
        });

        this.camera.position.set(
            this.player.mesh.position.x,
            5,
            this.player.mesh.position.z - 10
        );
        this.camera.lookAt(this.player.mesh.position);

        this.updateClouds();
        this.updateEnvironment();

        this.score += 1;
        this.scoreboard.textContent = `Score: ${this.score}`;
    }

    updateClouds() {
        this.clouds.forEach((cloud, index) => {
            cloud.position.z += this.playerSpeed * 0.5;
            if (cloud.position.z > this.player.mesh.position.z + 500) {
                this.scene.remove(cloud);
                this.clouds.splice(index, 1);
                this.createCloud();
            }
        });
    }

    updateEnvironment() {
        this.sunMesh.position.set(
            this.player.mesh.position.x - 50,
            this.player.mesh.position.y + 80,
            this.player.mesh.position.z - 100
        );

        this.mountain.position.set(
            this.player.mesh.position.x - 100,
            -50,
            this.player.mesh.position.z - 200
        );

        this.sunMesh.lookAt(this.camera.position);
    }

    gameOverHandler(message) {
        this.gameOver = true;
        // Instead of alert, we show a leaderboard
        // Save the current score
        const currentScore = this.score;

        // Retrieve existing scores from localStorage
        let scores = JSON.parse(localStorage.getItem('highScores') || '[]');

        // Add the current score to the array
        scores.push(currentScore);

        // Sort and keep top 5
        scores.sort((a, b) => b - a);
        scores = scores.slice(0, 5);

        // Save back to localStorage
        localStorage.setItem('highScores', JSON.stringify(scores));

        // Add coins
        let coins = parseInt(localStorage.getItem('coins') || '0', 10);
        coins += currentScore;
        localStorage.setItem('coins', coins.toString());

        // Show the leaderboard overlay
        const leaderboardOverlay = document.getElementById('leaderboard-overlay');
        const finalScoreElement = document.getElementById('final-score');
        const leaderboardList = document.getElementById('leaderboard-list');

        finalScoreElement.textContent = currentScore;

        leaderboardList.innerHTML = '';
        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = score;
            leaderboardList.appendChild(li);
        });

        leaderboardOverlay.style.display = 'block';

        // Stop speech recognition if running
        this.speechRecognitionHandler.stop();

        // Add restart button functionality
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => {
            location.reload();
        });
    }
}
