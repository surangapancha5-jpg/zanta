import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PaddyField, Animal } from '../types/game';
import { sounds } from '../services/soundEffects';
import {
  Compass,
  Sun,
  Moon,
  CloudRain,
  Sunset,
  Maximize2,
  Minimize2,
  Store,
  X,
  Wheat,
  Milk,
  Egg,
  Sprout,
  DollarSign,
  ArrowRight,
  Sparkles,
  Droplets,
  Trees,
  Bot,
  MessageSquare,
  HelpCircle,
  Coins,
  Flame,
} from 'lucide-react';
import { AiCustomerChatBox } from './AiCustomerChatBox';
import { VILLAGE_CUSTOMERS } from '../services/aiChatService';

interface ThreeFarmWorldProps {
  fields: PaddyField[];
  animals: Animal[];
  barnStock: {
    paddySacks: number;
    cowMilkBottles?: number;
    eggsCount?: number;
    goatMilkBottles?: number;
    seedsCount?: number;
  };
  coins: number;
  onSellPaddyDirect?: (count: number) => void;
  onSellMilkDirect?: (count: number) => void;
  onSellEggsDirect?: (count: number) => void;
  onBuySeeds?: (amount: number, cost: number) => void;
  onNavigateToShop?: () => void;
  onTractorHarvestAll?: () => void;
  onWaterAll?: () => void;
  onBonusCoins?: (amount: number, reason: string) => void;
  onFulfillCustomerDeal?: (item: 'paddy' | 'milk' | 'eggs' | 'seeds', qty: number, coinsEarned: number) => void;
  onOpenSpinWheel?: () => void;
}

type WeatherLightingMode = 'day' | 'sunset' | 'night' | 'rain';
type ShopItemCategory = 'paddy' | 'milk' | 'eggs' | 'seeds' | 'general';
type CameraViewKey = 'overview' | 'shop' | 'trees' | 'fields' | 'tractor' | 'animals' | 'watchtower';

export const ThreeFarmWorld: React.FC<ThreeFarmWorldProps> = ({
  fields,
  animals,
  barnStock,
  coins,
  onSellPaddyDirect,
  onSellMilkDirect,
  onSellEggsDirect,
  onBuySeeds,
  onNavigateToShop,
  onTractorHarvestAll,
  onWaterAll,
  onBonusCoins,
  onFulfillCustomerDeal,
  onOpenSpinWheel,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeCameraView, setActiveCameraView] = useState<CameraViewKey>('overview');
  const [weatherMode, setWeatherMode] = useState<WeatherLightingMode>('day');
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);

  // 3D Shop Modal state
  const [isShopModalOpen, setIsShopModalOpen] = useState<boolean>(false);
  const [selectedShopCategory, setSelectedShopCategory] = useState<ShopItemCategory>('general');
  const [hoveredItemName, setHoveredItemName] = useState<string | null>(null);

  // AI Customer Chat Box Modal state
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState<number>(0);

  // Floating in-canvas event notification toast
  const [interactiveToast, setInteractiveToast] = useState<{ text: string; icon: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const triggerInteractiveToast = (text: string, icon = '✨') => {
    setInteractiveToast({ text, icon });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setInteractiveToast(null);
    }, 2800);
  };

  // References for dynamic updates inside animation loop
  const fieldsRef = useRef<PaddyField[]>(fields);
  const animalsRef = useRef<Animal[]>(animals);
  const barnRef = useRef(barnStock);
  const weatherModeRef = useRef<WeatherLightingMode>(weatherMode);
  const propsRef = useRef({
    onTractorHarvestAll,
    onWaterAll,
    onBonusCoins,
    onFulfillCustomerDeal,
    onOpenSpinWheel,
  });

  useEffect(() => {
    fieldsRef.current = fields;
    animalsRef.current = animals;
    barnRef.current = barnStock;
    weatherModeRef.current = weatherMode;
    propsRef.current = {
      onTractorHarvestAll,
      onWaterAll,
      onBonusCoins,
      onFulfillCustomerDeal,
      onOpenSpinWheel,
    };
  }, [fields, animals, barnStock, weatherMode, onTractorHarvestAll, onWaterAll, onBonusCoins, onFulfillCustomerDeal, onOpenSpinWheel]);

  // Periodic customer rotation for speech thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCustomerIndex((prev) => (prev + 1) % VILLAGE_CUSTOMERS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const currentCustomerData = VILLAGE_CUSTOMERS[activeCustomerIndex % VILLAGE_CUSTOMERS.length];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 450;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0xcce0d0, 35, 115);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 160);
    camera.position.set(0, 24, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Interactive clickable 3D objects registry for Raycasting
    const interactiveObjects: THREE.Object3D[] = [];

    const registerInteractive = (
      obj: THREE.Object3D,
      data: {
        type: string;
        name: string;
        action?: string;
        customHandler?: () => void;
      }
    ) => {
      obj.userData = { ...obj.userData, ...data };
      interactiveObjects.push(obj);
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.userData = { ...child.userData, ...data };
          if (!interactiveObjects.includes(child)) {
            interactiveObjects.push(child);
          }
        }
      });
    };

    // -------------------------------------------------------------
    // LIGHTING RIG
    // -------------------------------------------------------------
    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0x3d4b27, 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff3d0, 1.4);
    dirLight.position.set(18, 32, 16);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 85;
      const d = 32;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);

    const barnLight = new THREE.PointLight(0xffaa44, 0, 18);
    barnLight.position.set(11, 3.5, -5.5);
    scene.add(barnLight);

    const shopLight = new THREE.PointLight(0xffbb55, 0, 16);
    shopLight.position.set(10, 3.5, 5);
    scene.add(shopLight);

    // -------------------------------------------------------------
    // TERRAIN & PATHWAYS
    // -------------------------------------------------------------
    const groundGeo = new THREE.PlaneGeometry(92, 92);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3b5825,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x735538,
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const mainPath = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 62), pathMat);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.set(2, 0.02, 0);
    scene.add(mainPath);

    const crossPath = new THREE.Mesh(new THREE.PlaneGeometry(36, 3.5), pathMat);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.set(-4, 0.02, 2.5);
    scene.add(crossPath);

    // Pathway leading directly to the front of the shop
    const shopEntryPath = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 12), pathMat);
    shopEntryPath.rotation.x = -Math.PI / 2;
    shopEntryPath.position.set(10, 0.02, 9);
    scene.add(shopEntryPath);

    // -------------------------------------------------------------
    // ANIMATED FLOWING IRRIGATION CANAL (ඇළ මාර්ගය සහ ගලා යන ජලය)
    // -------------------------------------------------------------
    const canalBed = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.35, 42),
      new THREE.MeshStandardMaterial({ color: 0x483a2d, roughness: 0.95 })
    );
    canalBed.position.set(-16.5, 0.1, 0);
    scene.add(canalBed);

    const streamGeo = new THREE.PlaneGeometry(2.35, 41.5, 14, 60);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(-16.5, 0.23, 0);
    scene.add(stream);

    const streamInitialPos = (streamGeo.attributes.position.array as Float32Array).slice();

    // Canal river pebbles
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.8 });
    const pebbleGeo = new THREE.DodecahedronGeometry(0.18, 0);
    for (let pb = 0; pb < 24; pb++) {
      const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
      const side = pb % 2 === 0 ? -1.3 : 1.3;
      pebble.position.set(-16.5 + side, 0.28, -19 + pb * 1.6 + (Math.random() - 0.5) * 0.4);
      pebble.scale.set(1 + Math.random() * 0.5, 0.7, 1 + Math.random() * 0.5);
      scene.add(pebble);
    }

    // Rotating Waterwheel on Canal
    let wheelSpinSpeed = 1.6;
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-16.5, 1.25, -6);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 });
    const wRim1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 16), rimMat);
    wRim1.rotation.y = Math.PI / 2;
    const wRim2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 16), rimMat);
    wRim2.rotation.y = Math.PI / 2;
    wRim2.position.x = 0.5;
    wheelGroup.add(wRim1, wRim2);

    for (let p = 0; p < 8; p++) {
      const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), rimMat);
      const angle = (p / 8) * Math.PI * 2;
      paddle.position.set(0.25, Math.sin(angle) * 1.1, Math.cos(angle) * 1.1);
      paddle.rotation.x = angle;
      wheelGroup.add(paddle);
    }
    scene.add(wheelGroup);

    registerInteractive(wheelGroup, {
      type: 'waterwheel',
      name: '🌊 වාරිමාර්ග ජල රෝදය (Waterwheel)',
    });
    registerInteractive(stream, {
      type: 'canal',
      name: '💧 ගලා යන ඇළ මාර්ගය (Flowing Canal)',
    });

    // Waterwheel Water Splash Particle System
    const splashCount = 36;
    const splashGeo = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(splashCount * 3);
    const splashVelocities: { x: number; y: number; z: number }[] = [];

    for (let sp = 0; sp < splashCount; sp++) {
      splashPositions[sp * 3] = -16.5 + (Math.random() - 0.5) * 0.8;
      splashPositions[sp * 3 + 1] = 0.3 + Math.random() * 0.4;
      splashPositions[sp * 3 + 2] = -6 + (Math.random() - 0.5) * 0.8;
      splashVelocities.push({
        x: (Math.random() - 0.5) * 0.8,
        y: 1.2 + Math.random() * 1.5,
        z: 0.8 + Math.random() * 1.2,
      });
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
    });
    const splashParticles = new THREE.Points(splashGeo, splashMat);
    scene.add(splashParticles);

    // -------------------------------------------------------------
    // ANIMATED WIND-SWAYING TREES (පොල් ගස් සහ ගස්කොළන්)
    // -------------------------------------------------------------
    interface AnimatedTree {
      group: THREE.Group;
      type: 'palm' | 'fruit';
      baseRotationZ: number;
      wobbleTimer: number;
      fronds?: THREE.Mesh[];
      canopies?: THREE.Mesh[];
      fruits?: THREE.Mesh[];
    }
    const animatedTrees: AnimatedTree[] = [];

    function createCoconutPalm(x: number, z: number, scale = 1): AnimatedTree {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);
      treeGroup.scale.setScalar(scale);

      const baseMound = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.55, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x54402e, roughness: 0.95 })
      );
      baseMound.position.y = 0.2;
      treeGroup.add(baseMound);

      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5239, roughness: 0.9 });
      const trunkSegments = 5;
      const trunkHeight = 6.2;
      let currentHeight = 0.35;
      let currentX = 0;
      const segLean = (Math.random() - 0.5) * 0.12;

      for (let s = 0; s < trunkSegments; s++) {
        const topR = 0.28 - s * 0.02;
        const botR = 0.32 - s * 0.02;
        const h = trunkHeight / trunkSegments;
        const trunkSeg = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, h, 8), trunkMat);
        trunkSeg.position.set(currentX, currentHeight + h / 2, 0);
        trunkSeg.rotation.z = segLean * s;
        treeGroup.add(trunkSeg);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(botR * 1.05, 0.04, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0x4a3726, roughness: 0.95 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(currentX, currentHeight, 0);
        treeGroup.add(ring);

        currentHeight += h;
        currentX += Math.sin(segLean * s) * h * 0.4;
      }

      const fronds: THREE.Mesh[] = [];
      const crownY = currentHeight;
      const frondGeo = new THREE.ConeGeometry(0.65, 3.4, 4);
      frondGeo.translate(0, 1.7, 0);
      frondGeo.rotateX(Math.PI / 2);

      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });

      const frondCount = 7;
      for (let f = 0; f < frondCount; f++) {
        const angle = (f / frondCount) * Math.PI * 2;
        const frond = new THREE.Mesh(frondGeo, leafMat.clone());
        frond.position.set(currentX, crownY, 0);
        frond.rotation.y = angle;
        frond.rotation.x = 0.75 + (f % 2) * 0.18;
        treeGroup.add(frond);
        fronds.push(frond);
      }

      const fruits: THREE.Mesh[] = [];
      const coconutMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.7 });
      const coconutGeo = new THREE.SphereGeometry(0.24, 6, 6);
      for (let c = 0; c < 4; c++) {
        const cAngle = (c / 4) * Math.PI * 2;
        const nut = new THREE.Mesh(coconutGeo, coconutMat);
        nut.position.set(
          currentX + Math.cos(cAngle) * 0.45,
          crownY - 0.25,
          Math.sin(cAngle) * 0.45
        );
        nut.scale.set(1, 1.25, 1);
        treeGroup.add(nut);
        fruits.push(nut);
      }

      scene.add(treeGroup);

      const animatedTree: AnimatedTree = {
        group: treeGroup,
        type: 'palm',
        baseRotationZ: treeGroup.rotation.z,
        wobbleTimer: 0,
        fronds,
        fruits,
      };

      registerInteractive(treeGroup, {
        type: 'tree_palm',
        name: '🌴 සජීවී පොල් ගස (Coconut Palm)',
        customHandler: () => {
          sounds.playTreeRustle();
          animatedTree.wobbleTimer = 1.0;
          propsRef.current.onBonusCoins?.(5, 'පොල් ගස සොලවා කුරුම්බා කැඩීම');
          triggerInteractiveToast('🥥 පොල් ගස සොලවා නැවුම් කුරුම්බා කැඩුවා! (+5 කොයින්)', '🌴');
        },
      });

      return animatedTree;
    }

    function createFruitTree(x: number, z: number, scale = 1): AnimatedTree {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);
      treeGroup.scale.setScalar(scale);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 })
      );
      trunk.position.y = 1.6;
      treeGroup.add(trunk);

      const canopies: THREE.Mesh[] = [];
      const canopyColors = [0x15803d, 0x16a34a, 0x22c55e, 0x14532d];
      const lobePositions = [
        [0, 3.8, 0, 1.8],
        [-0.9, 3.4, 0.4, 1.3],
        [0.9, 3.5, -0.4, 1.4],
        [0.2, 4.3, 0.6, 1.2],
        [-0.3, 4.4, -0.5, 1.2],
      ];

      lobePositions.forEach(([lx, ly, lz, lr], idx) => {
        const mat = new THREE.MeshStandardMaterial({
          color: canopyColors[idx % canopyColors.length],
          roughness: 0.7,
        });
        const lobe = new THREE.Mesh(new THREE.DodecahedronGeometry(lr, 1), mat);
        lobe.position.set(lx, ly, lz);
        treeGroup.add(lobe);
        canopies.push(lobe);
      });

      const fruits: THREE.Mesh[] = [];
      const fruitMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
      const fruitGeo = new THREE.SphereGeometry(0.18, 6, 6);
      for (let m = 0; m < 5; m++) {
        const mango = new THREE.Mesh(fruitGeo, fruitMat);
        const mAngle = (m / 5) * Math.PI * 2;
        mango.scale.set(0.8, 1.3, 0.8);
        mango.position.set(Math.cos(mAngle) * 1.2, 2.7 + (m % 2) * 0.3, Math.sin(mAngle) * 1.2);
        treeGroup.add(mango);
        fruits.push(mango);
      }

      scene.add(treeGroup);

      const animatedTree: AnimatedTree = {
        group: treeGroup,
        type: 'fruit',
        baseRotationZ: treeGroup.rotation.z,
        wobbleTimer: 0,
        canopies,
        fruits,
      };

      registerInteractive(treeGroup, {
        type: 'tree_fruit',
        name: '🌳 සරුසාර අඹ ගස (Fruit Tree)',
        customHandler: () => {
          sounds.playTreeRustle();
          animatedTree.wobbleTimer = 1.0;
          propsRef.current.onBonusCoins?.(5, 'ඉදුණු අඹ කැඩීම');
          triggerInteractiveToast('🥭 අඹ ගසින් රසවත් ඉදුණු අඹ එකතු විය! (+5 කොයින්)', '🍃');
        },
      });

      return animatedTree;
    }

    animatedTrees.push(createCoconutPalm(-18.5, -13, 1.05));
    animatedTrees.push(createCoconutPalm(-18.5, 14, 1.0));
    animatedTrees.push(createCoconutPalm(17.5, -13, 1.1));
    animatedTrees.push(createCoconutPalm(17.5, 13, 1.0));

    animatedTrees.push(createFruitTree(16.5, -2, 1.05));
    animatedTrees.push(createFruitTree(16.5, 7.5, 0.95));
    animatedTrees.push(createFruitTree(-2, 16.5, 1.0));

    // Floating Leaf Particles
    const leafParticleCount = 28;
    const leafGeo = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafParticleCount * 3);
    for (let lp = 0; lp < leafParticleCount * 3; lp += 3) {
      leafPositions[lp] = (Math.random() - 0.5) * 60;
      leafPositions[lp + 1] = 1 + Math.random() * 8;
      leafPositions[lp + 2] = (Math.random() - 0.5) * 60;
    }
    leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3));
    const leafMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.28,
      transparent: true,
      opacity: 0.8,
    });
    const leafParticles = new THREE.Points(leafGeo, leafMat);
    scene.add(leafParticles);

    // -------------------------------------------------------------
    // FLUTTERING BUTTERFLIES & BIRDS
    // -------------------------------------------------------------
    interface Butterfly {
      group: THREE.Group;
      leftWing: THREE.Mesh;
      rightWing: THREE.Mesh;
      centerX: number;
      centerZ: number;
      radius: number;
      speed: number;
      phase: number;
      height: number;
    }
    const butterflies: Butterfly[] = [];
    const bColors = [0xfef08a, 0x38bdf8, 0xf472b6];

    for (let bf = 0; bf < 3; bf++) {
      const bGroup = new THREE.Group();
      const bBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.25, 4),
        new THREE.MeshStandardMaterial({ color: 0x18181b })
      );
      bBody.rotation.x = Math.PI / 2;
      bGroup.add(bBody);

      const wingGeo = new THREE.PlaneGeometry(0.28, 0.24);
      const wingMat = new THREE.MeshStandardMaterial({
        color: bColors[bf % bColors.length],
        side: THREE.DoubleSide,
      });

      const lWing = new THREE.Mesh(wingGeo, wingMat);
      lWing.position.x = -0.15;
      bGroup.add(lWing);

      const rWing = new THREE.Mesh(wingGeo, wingMat);
      rWing.position.x = 0.15;
      bGroup.add(rWing);

      bGroup.position.set(-6 + bf * 4, 1.8, -2 + bf * 3);
      scene.add(bGroup);

      registerInteractive(bGroup, {
        type: 'butterfly',
        name: '🦋 ලස්සන සමනලයා (Butterfly)',
        customHandler: () => {
          sounds.playWin();
          triggerInteractiveToast('🦋 සමනලයා ලස්සනට පියාඹයි! (Sri Lankan Butterfly)', '✨');
        },
      });

      butterflies.push({
        group: bGroup,
        leftWing: lWing,
        rightWing: rWing,
        centerX: -6 + bf * 4,
        centerZ: -2 + bf * 3,
        radius: 2.5 + bf * 0.8,
        speed: 1.2 + bf * 0.3,
        phase: bf * 2,
        height: 1.6 + bf * 0.4,
      });
    }

    // Soaring Birds
    const birdGroup = new THREE.Group();
    const birdGeo = new THREE.ConeGeometry(0.35, 0.8, 3);
    birdGeo.rotateX(Math.PI / 2);
    const birdMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const bird1 = new THREE.Mesh(birdGeo, birdMat);
    const bird2 = new THREE.Mesh(birdGeo, birdMat);
    bird2.position.set(4, 1, -2);
    birdGroup.add(bird1, bird2);
    birdGroup.position.set(-10, 18, 0);
    scene.add(birdGroup);

    // -------------------------------------------------------------
    // SRI LANKAN WATCHTOWER (පැල්පත / කුඹුරු පැල)
    // -------------------------------------------------------------
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-16, 0, 8);

    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 });
    for (let dx = -1; dx <= 1; dx += 2) {
      for (let dz = -1; dz <= 1; dz += 2) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6, 6), stiltMat);
        stilt.position.set(dx * 1.2, 3, dz * 1.2);
        towerGroup.add(stilt);
      }
    }

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.25, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x785637, roughness: 0.85 })
    );
    platform.position.y = 5.2;
    towerGroup.add(platform);

    const thatchRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 1.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 })
    );
    thatchRoof.rotation.y = Math.PI / 4;
    thatchRoof.position.y = 7.1;
    towerGroup.add(thatchRoof);

    const towerLantern = new THREE.PointLight(0xffcc66, 0, 10);
    towerLantern.position.set(0, 5.8, 0);
    towerGroup.add(towerLantern);
    scene.add(towerGroup);

    registerInteractive(towerGroup, {
      type: 'watchtower',
      name: '🛖 කුඹුරු මුර පැල (Farm Watchtower)',
      customHandler: () => {
        sounds.playCoin();
        setActiveCameraView('watchtower');
        triggerInteractiveToast('🛖 කුඹුරු මුර කුටිය: මුළු ගොවිබිමම ආරක්ෂිතයි!', '🛖');
      },
    });

    // -------------------------------------------------------------
    // 10 PADDY FIELDS (කුඹුරු 10)
    // -------------------------------------------------------------
    const paddyFieldGroups: THREE.Group[] = [];
    const fieldCropMeshes: THREE.Mesh[] = [];

    const fieldWidth = 3.6;
    const fieldDepth = 4.2;
    const startX = -13.5;
    const startZ = -10;

    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const xPos = startX + col * 4.6;
      const zPos = startZ + row * 5.4;

      const fGroup = new THREE.Group();
      fGroup.position.set(xPos, 0.05, zPos);

      const basin = new THREE.Mesh(
        new THREE.BoxGeometry(fieldWidth, 0.2, fieldDepth),
        new THREE.MeshStandardMaterial({ color: 0x3d3023, roughness: 0.7 })
      );
      basin.position.y = 0.1;
      basin.receiveShadow = !isSoftwareGl;
      fGroup.add(basin);

      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(fieldWidth - 0.2, fieldDepth - 0.2),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.15, metalness: 0.35 })
      );
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.21;
      fGroup.add(water);

      const dikeMat = new THREE.MeshStandardMaterial({ color: 0x54402e, roughness: 0.95 });
      const border1 = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth + 0.4, 0.3, 0.3), dikeMat);
      border1.position.set(0, 0.15, fieldDepth / 2 + 0.15);
      const border2 = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth + 0.4, 0.3, 0.3), dikeMat);
      border2.position.set(0, 0.15, -fieldDepth / 2 - 0.15);
      const border3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, fieldDepth), dikeMat);
      border3.position.set(fieldWidth / 2 + 0.15, 0.15, 0);
      const border4 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, fieldDepth), dikeMat);
      border4.position.set(-fieldWidth / 2 - 0.15, 0.15, 0);
      fGroup.add(border1, border2, border3, border4);

      const cropGeo = new THREE.BoxGeometry(fieldWidth - 0.4, 0.7, fieldDepth - 0.4);
      const cropMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
      const cropMesh = new THREE.Mesh(cropGeo, cropMat);
      cropMesh.position.set(0, 0.55, 0);
      cropMesh.castShadow = !isSoftwareGl;
      fGroup.add(cropMesh);
      fieldCropMeshes.push(cropMesh);

      scene.add(fGroup);
      paddyFieldGroups.push(fGroup);

      registerInteractive(fGroup, {
        type: 'field',
        name: `🌾 කුඹුර #${i + 1} (Paddy Field ${i + 1})`,
        customHandler: () => {
          sounds.playHarvest();
          const f = fieldsRef.current[i];
          if (f?.status === 'ripe') {
            triggerInteractiveToast(`🌾 කුඹුර #${i + 1} අස්වැන්න කපා ගැනීමට සූදානම්!`, '🌾');
          } else if (f?.status === 'growing') {
            triggerInteractiveToast(`🌱 කුඹුර #${i + 1} සරුසාරව වැඩෙමින් පවතී...`, '🌱');
          } else {
            triggerInteractiveToast(`🌾 කුඹුර #${i + 1} වී බීජ වැපිරීමට සූදානම්!`, '✨');
          }
        },
      });
    }

    // -------------------------------------------------------------
    // INTERACTIVE TRACTOR HARVESTER (ට්‍රැක්ටරය)
    // -------------------------------------------------------------
    let tractorBounce = 0;
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(-2, 0, 1);

    const tractorBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 1.3, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xd92d20, roughness: 0.3, metalness: 0.25 })
    );
    tractorBody.position.y = 1.3;
    tractorBody.castShadow = !isSoftwareGl;
    tractorGroup.add(tractorBody);

    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 })
    );
    hood.position.set(0, 1.5, 1.5);
    tractorGroup.add(hood);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.3, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.4 })
    );
    cabin.position.set(0, 2.3, -0.1);
    tractorGroup.add(cabin);

    const hlGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
    hlGeo.rotateX(Math.PI / 2);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });
    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-0.6, 1.5, 2.2);
    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(0.6, 1.5, 2.2);
    tractorGroup.add(hlLeft, hlRight);

    const tractorSpotlight = new THREE.SpotLight(0xfffaed, 0, 25, Math.PI / 4, 0.5);
    tractorSpotlight.position.set(0, 1.8, 2.5);
    tractorSpotlight.target.position.set(0, 0, 12);
    tractorGroup.add(tractorSpotlight);
    tractorGroup.add(tractorSpotlight.target);

    const rearTireGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.65, 14);
    rearTireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
    const rlTire = new THREE.Mesh(rearTireGeo, tireMat);
    rlTire.position.set(-1.25, 0.9, -0.8);
    const rrTire = new THREE.Mesh(rearTireGeo, tireMat);
    rrTire.position.set(1.25, 0.9, -0.8);

    const frontTireGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 12);
    frontTireGeo.rotateZ(Math.PI / 2);
    const flTire = new THREE.Mesh(frontTireGeo, tireMat);
    flTire.position.set(-1.15, 0.6, 1.2);
    const frTire = new THREE.Mesh(frontTireGeo, tireMat);
    frTire.position.set(1.15, 0.6, 1.2);
    tractorGroup.add(rlTire, rrTire, flTire, frTire);

    const reelGroup = new THREE.Group();
    reelGroup.position.set(0, 0.6, 2.4);
    const reelCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5, roughness: 0.3 })
    );
    reelCore.rotateZ(Math.PI / 2);
    reelGroup.add(reelCore);
    tractorGroup.add(reelGroup);

    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8 })
    );
    exhaust.position.set(0.7, 2.3, 1.3);
    tractorGroup.add(exhaust);

    const smokeParticles: THREE.Mesh[] = [];
    const smokeGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      transparent: true,
      opacity: 0.4,
      roughness: 1,
    });
    for (let sm = 0; sm < 4; sm++) {
      const puff = new THREE.Mesh(smokeGeo, smokeMat.clone());
      puff.position.set(0.7, 2.9 + sm * 0.4, 1.3);
      tractorGroup.add(puff);
      smokeParticles.push(puff);
    }
    scene.add(tractorGroup);

    registerInteractive(tractorGroup, {
      type: 'tractor',
      name: '🚜 අස්වනු නෙළන ට්‍රැක්ටරය (Tractor Harvester)',
      customHandler: () => {
        sounds.playTractorHorn();
        sounds.playTractor();
        tractorBounce = 1.0;
        const curFields = fieldsRef.current;
        const ripeCount = curFields.filter((f) => f.status === 'ripe').length;

        if (ripeCount > 0 && propsRef.current.onTractorHarvestAll) {
          propsRef.current.onTractorHarvestAll();
          triggerInteractiveToast(
            `🚜 ට්‍රැක්ටරය මගින් සූදානම් කුඹුරු ${ripeCount}ක අස්වැන්න කපා දැමුවා!`,
            '🌾'
          );
        } else {
          triggerInteractiveToast('🚜 ට්‍රැක්ටරය: "පීප් පීප්!" කෙත සූදානම් වූ පසු කපා දැමිය හැකිය!', '🚜');
        }
      },
    });

    // -------------------------------------------------------------
    // PADDY BARN (වී මඩුව)
    // -------------------------------------------------------------
    const barnGroup = new THREE.Group();
    barnGroup.position.set(11, 0, -8);

    const bWalls = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3.4, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.85 })
    );
    bWalls.position.y = 1.7;
    bWalls.castShadow = !isSoftwareGl;
    barnGroup.add(bWalls);

    const bRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.6, 2.4, 4),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 })
    );
    bRoof.rotation.y = Math.PI / 4;
    bRoof.position.y = 4.6;
    bRoof.scale.set(1.15, 1, 1.3);
    bRoof.castShadow = !isSoftwareGl;
    barnGroup.add(bRoof);

    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.9 });
    for (let s = 0; s < 7; s++) {
      const sack = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 8), sackMat);
      sack.rotation.z = Math.PI / 2;
      sack.position.set(-2.0 + (s % 3) * 0.75, 0.35 + Math.floor(s / 3) * 0.45, 3.6);
      sack.castShadow = !isSoftwareGl;
      barnGroup.add(sack);
    }
    scene.add(barnGroup);

    registerInteractive(barnGroup, {
      type: 'barn',
      name: '🏛️ රාජකීය වී මඩුව (Royal Paddy Barn)',
      customHandler: () => {
        sounds.playCoin();
        triggerInteractiveToast(`🏛️ වී මඩුව: ගබඩා කළ වී මලු ${barnRef.current.paddySacks}ක් ඇත!`, '🌾');
      },
    });

    // -------------------------------------------------------------
    // INTERACTIVE 3D MARKET SHOP STALL (ගොවිපොළ කඩය)
    // -------------------------------------------------------------
    const shopGroup = new THREE.Group();
    shopGroup.position.set(10, 0, 5);

    const counterMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.75 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.25, 2.5), counterMat);
    counter.position.y = 0.62;
    counter.castShadow = !isSoftwareGl;
    shopGroup.add(counter);
    registerInteractive(counter, {
      type: 'shop_counter',
      action: 'general',
      name: '🏪 ගොවිපොළ කඩේ කවුන්ටරය',
    });

    const pMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.9, 6), pMat);
    pole1.position.set(-2.2, 1.45, -1.1);
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.9, 6), pMat);
    pole2.position.set(2.2, 1.45, -1.1);
    const pole3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.9, 6), pMat);
    pole3.position.set(-2.2, 1.45, 1.1);
    const pole4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.9, 6), pMat);
    pole4.position.set(2.2, 1.45, 1.1);
    shopGroup.add(pole1, pole2, pole3, pole4);

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.2, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 })
    );
    awning.position.set(0, 2.9, 0);
    awning.rotation.x = 0.15;
    shopGroup.add(awning);
    registerInteractive(awning, {
      type: 'shop_awning',
      action: 'general',
      name: '🏪 ගොවිපොළ කඩය (Farm Stall)',
    });

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.6, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    signBoard.position.set(0, 3.2, 1.55);
    signBoard.rotation.x = 0.15;
    shopGroup.add(signBoard);
    registerInteractive(signBoard, {
      type: 'shop_sign',
      action: 'general',
      name: '🏪 ගොවි කඩේ - Shop Stall',
    });

    const shopIconBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    shopIconBadge.rotation.x = Math.PI / 2;
    shopIconBadge.position.set(0, 4.2, 0);
    shopGroup.add(shopIconBadge);
    registerInteractive(shopIconBadge, {
      type: 'shop_badge',
      action: 'general',
      name: '🏪 ක්ලික් කර කඩය විවෘත කරන්න',
    });

    // Shop Items on Counter
    const paddyGroup = new THREE.Group();
    paddyGroup.position.set(-1.5, 1.35, 0.2);
    for (let ps = 0; ps < 2; ps++) {
      const pSack = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.24, 0.45, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 })
      );
      pSack.rotation.z = Math.PI / 2;
      pSack.position.set(0, ps * 0.35, 0);
      paddyGroup.add(pSack);
    }
    shopGroup.add(paddyGroup);
    registerInteractive(paddyGroup, {
      type: 'shop_item',
      action: 'paddy',
      name: '🌾 වී මලු (Click to Sell Paddy)',
    });

    const milkGroup = new THREE.Group();
    milkGroup.position.set(-0.5, 1.4, 0.3);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.2, roughness: 0.2 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    for (let b = 0; b < 2; b++) {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8), bottleMat);
      bottle.position.set(b * 0.3, 0, 0);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), capMat);
      cap.position.set(b * 0.3, 0.28, 0);
      milkGroup.add(bottle, cap);
    }
    shopGroup.add(milkGroup);
    registerInteractive(milkGroup, {
      type: 'shop_item',
      action: 'milk',
      name: '🥛 නැවුම් එළකිරි (Click to Sell Milk)',
    });

    const eggGroup = new THREE.Group();
    eggGroup.position.set(0.5, 1.35, 0.3);
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.25, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 })
    );
    eggGroup.add(basket);
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    for (let eg = 0; eg < 3; eg++) {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), eggMat);
      egg.scale.set(0.8, 1.2, 0.8);
      egg.position.set((eg - 1) * 0.12, 0.15, 0);
      eggGroup.add(egg);
    }
    shopGroup.add(eggGroup);
    registerInteractive(eggGroup, {
      type: 'shop_item',
      action: 'eggs',
      name: '🥚 ගමේ බිත්තර (Click to Sell Eggs)',
    });

    const seedGroup = new THREE.Group();
    seedGroup.position.set(1.4, 1.35, 0.3);
    const seedPouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.35, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    seedGroup.add(seedPouch);
    shopGroup.add(seedGroup);
    registerInteractive(seedGroup, {
      type: 'shop_item',
      action: 'seeds',
      name: '🌱 වී බීජ මල්ල (Click to Buy Seeds)',
    });

    scene.add(shopGroup);

    // -------------------------------------------------------------
    // ANIMATED CUSTOMERS WALKING UP TO THE SHOP (මිනිස්සු බඩු ගන්න එනවා)
    // -------------------------------------------------------------
    interface WalkingCustomer {
      group: THREE.Group;
      leftLeg: THREE.Mesh;
      rightLeg: THREE.Mesh;
      thoughtMesh: THREE.Mesh;
      targetX: number;
      targetZ: number;
      isArrived: boolean;
      customerIndex: number;
    }

    function createWalkingCharacter(shirtColor: number, hasHat = true, customerIdx = 0): WalkingCustomer {
      const charGroup = new THREE.Group();
      const cBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 1.15, 8),
        new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 })
      );
      cBody.position.y = 0.9;
      charGroup.add(cBody);

      const cHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 })
      );
      cHead.position.y = 1.65;
      charGroup.add(cHead);

      if (hasHat) {
        const hat = new THREE.Mesh(
          new THREE.ConeGeometry(0.72, 0.35, 8),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
        );
        hat.position.y = 1.9;
        charGroup.add(hat);
      }

      // Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.65, 6);
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.16, 0.32, 0);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.16, 0.32, 0);
      charGroup.add(leftLeg, rightLeg);

      // 3D Thought Bubble Indicator floating above customer
      const thoughtGroup = new THREE.Group();
      thoughtGroup.position.set(0, 2.3, 0);
      const thoughtBall1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      thoughtBall1.position.set(0.2, 0, 0);
      const thoughtBall2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        })
      );
      thoughtBall2.position.set(0.4, 0.25, 0);
      thoughtGroup.add(thoughtBall1, thoughtBall2);
      charGroup.add(thoughtGroup);

      scene.add(charGroup);

      const custData = VILLAGE_CUSTOMERS[customerIdx % VILLAGE_CUSTOMERS.length];

      registerInteractive(charGroup, {
        type: 'shop_customer',
        name: `💬 ${custData.name} (Click for AI Chat)`,
        customHandler: () => {
          sounds.playCoin();
          setActiveCustomerIndex(customerIdx);
          setIsAiChatOpen(true);
          setActiveCameraView('shop');
        },
      });

      return {
        group: charGroup,
        leftLeg,
        rightLeg,
        thoughtMesh: thoughtGroup as unknown as THREE.Mesh,
        targetX: 9.2 + customerIdx * 1.5,
        targetZ: 7.0,
        isArrived: false,
        customerIndex: customerIdx,
      };
    }

    // Spawn 2 Village Customers walking up in front of the shop
    const walkingCustomers: WalkingCustomer[] = [];
    const cust1 = createWalkingCharacter(0x9333ea, true, 0); // Gunapala Mama
    cust1.group.position.set(9.2, 0, 16);
    walkingCustomers.push(cust1);

    const cust2 = createWalkingCharacter(0xec4899, false, 1); // Sumana Nanda
    cust2.group.position.set(11.0, 0, 19);
    walkingCustomers.push(cust2);

    // -------------------------------------------------------------
    // ANIMALS & WORKERS (සත්තු සහ ගෝලයෝ)
    // -------------------------------------------------------------
    const animalsGroup = new THREE.Group();
    animalsGroup.position.set(-6, 0, 11);

    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x785637, roughness: 0.9 });
    for (let f = 0; f < 8; f++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), fenceMat);
      post.position.set(-6 + f * 1.7, 0.6, 0);
      animalsGroup.add(post);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 0.1), fenceMat);
    rail.position.set(0, 0.9, 0);
    animalsGroup.add(rail);

    // 3D Cow
    const cowGroup = new THREE.Group();
    cowGroup.position.set(-3.5, 0, 2.2);
    const cowBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.15, 2.3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
    );
    cowBody.position.y = 1.35;
    cowGroup.add(cowBody);

    const cowHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.85, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    cowHead.position.set(0, 1.9, 1.4);
    cowGroup.add(cowHead);

    const cowLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    for (let dx = -1; dx <= 1; dx += 2) {
      for (let dz = -1; dz <= 1; dz += 2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.95, 6), cowLegMat);
        leg.position.set(dx * 0.6, 0.48, dz * 0.85);
        cowGroup.add(leg);
      }
    }
    animalsGroup.add(cowGroup);

    registerInteractive(cowGroup, {
      type: 'cow',
      name: '🐄 නැවුම් කිරි දෙන එළදෙන (Dairy Cow)',
      customHandler: () => {
        sounds.playCow();
        cowGroup.position.y = 0.3;
        triggerInteractiveToast('🐄 එළදෙන: "ම්බෑෑෑ...!" නැවුම් එළකිරි සූදානම්!', '🥛');
      },
    });

    // 3D Goat
    const goatGroup = new THREE.Group();
    goatGroup.position.set(0.6, 0, 2);
    const goatBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.85, 1.35),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    goatBody.position.y = 0.95;
    goatGroup.add(goatBody);
    const goatHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x78716c })
    );
    goatHead.position.set(0, 1.45, 0.85);
    goatGroup.add(goatHead);
    animalsGroup.add(goatGroup);

    registerInteractive(goatGroup, {
      type: 'goat',
      name: '🐐 සෙල්ලක්කාර එළුවා (Playful Goat)',
      customHandler: () => {
        sounds.playGoat();
        goatGroup.position.y = 0.4;
        triggerInteractiveToast('🐐 එළුවා: "බෑෑෑ...!" සතුටින් පනියි!', '🐐');
      },
    });

    // 3D Chicken
    const chickenGroup = new THREE.Group();
    chickenGroup.position.set(3.8, 0, 2);
    const chBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.6 })
    );
    chBody.position.y = 0.45;
    chickenGroup.add(chBody);
    animalsGroup.add(chickenGroup);

    registerInteractive(chickenGroup, {
      type: 'chicken',
      name: '🐔 බිත්තර දමන කිකිළිය (Laying Hen)',
      customHandler: () => {
        sounds.playChicken();
        chickenGroup.position.y = 0.35;
        triggerInteractiveToast('🐔 කිකිළිය: "කොට කොට...!" නැවුම් බිත්තර දමයි!', '🥚');
      },
    });

    scene.add(animalsGroup);

    // Farm Assistants
    function createWorker(shirtColor: number) {
      const charGroup = new THREE.Group();
      const cBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 1.25, 8),
        new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 })
      );
      cBody.position.y = 0.85;
      charGroup.add(cBody);

      const cHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 })
      );
      cHead.position.y = 1.65;
      charGroup.add(cHead);

      const hat = new THREE.Mesh(
        new THREE.ConeGeometry(0.72, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
      );
      hat.position.y = 1.9;
      charGroup.add(hat);
      return charGroup;
    }

    const workerSiripala = createWorker(0x2563eb);
    workerSiripala.position.set(-7, 0, -3);
    scene.add(workerSiripala);
    registerInteractive(workerSiripala, {
      type: 'worker',
      name: '👨‍🌾 සිරිපාල අයියා (Siripala - Farm Assistant)',
      customHandler: () => {
        sounds.playCoin();
        triggerInteractiveToast('👨‍🌾 සිරිපාල: "මල්ලි, කුඹුරු වැඩ ඔක්කොම මං බලාගන්නම්!"', '👨‍🌾');
      },
    });

    const workerBandu = createWorker(0x059669);
    workerBandu.position.set(2, 0, 8);
    scene.add(workerBandu);
    registerInteractive(workerBandu, {
      type: 'worker',
      name: '👨‍🌾 බන්දු මාමා (Bandu - Animal Caretaker)',
      customHandler: () => {
        sounds.playCoin();
        triggerInteractiveToast('👨‍🌾 බන්දු: "හරක්, එළුවන්ට වෙලාවට කෑම දීලා තියෙන්නේ!"', '👨‍🌾');
      },
    });

    // Rain particles
    const rainCount = 180;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount * 3; r += 3) {
      rainPositions[r] = (Math.random() - 0.5) * 55;
      rainPositions[r + 1] = Math.random() * 25;
      rainPositions[r + 2] = (Math.random() - 0.5) * 55;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // -------------------------------------------------------------
    // RAYCASTING & POINTER CLICK DETECTION
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let targetCameraAngle = 0;
    let cameraAngle = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - pointerDownPos.x;
        targetCameraAngle += dx * 0.006;
        pointerDownPos = { x: e.clientX, y: e.clientY };
      } else {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
          const topObj = intersects[0].object;
          const label = topObj.userData?.name || 'ගොවිපොළ අංගය';
          setHoveredItemName(label);
        } else {
          renderer.domElement.style.cursor = 'grab';
          setHoveredItemName(null);
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const elapsed = performance.now() - pointerDownTime;

      if (dist < 6 && elapsed < 400) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
          const clickedObj = intersects[0].object;
          const uData = clickedObj.userData;

          if (typeof uData?.customHandler === 'function') {
            uData.customHandler();
            return;
          }

          if (uData?.type === 'canal' || uData?.type === 'waterwheel') {
            sounds.playWater();
            wheelSpinSpeed = 7.5;
            propsRef.current.onWaterAll?.();
            triggerInteractiveToast('🌊 ඇළ මාර්ගයෙන් කෙත්වලට සජීවී ජලය සැපයේ!', '💧');
            return;
          }

          if (uData?.action) {
            const action = (uData.action as ShopItemCategory) || 'general';
            sounds.playCoin();
            setSelectedShopCategory(action);
            setIsShopModalOpen(true);
            setActiveCameraView('shop');
            return;
          }

          if (uData?.name) {
            sounds.playCoin();
            triggerInteractiveToast(uData.name, '✨');
          }
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // -------------------------------------------------------------
    // ANIMATION & TICK LOOP
    // -------------------------------------------------------------
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera view dampening
      cameraAngle = THREE.MathUtils.damp(cameraAngle, targetCameraAngle, 5, delta);

      let targetX = 0;
      let targetY = 1.2;
      let targetZ = 0;
      let camY = 24;
      let dist = 32;

      if (activeCameraView === 'fields') {
        targetX = -5;
        targetZ = -5;
        camY = 15;
        dist = 22;
      } else if (activeCameraView === 'trees') {
        targetX = -15;
        targetZ = -2;
        camY = 12;
        dist = 18;
      } else if (activeCameraView === 'tractor') {
        targetX = tractorGroup.position.x;
        targetZ = tractorGroup.position.z;
        camY = 9;
        dist = 14;
      } else if (activeCameraView === 'animals') {
        targetX = -6;
        targetZ = 12;
        camY = 10;
        dist = 18;
      } else if (activeCameraView === 'watchtower') {
        targetX = -16;
        targetZ = 8;
        camY = 12;
        dist = 16;
      } else if (activeCameraView === 'shop') {
        targetX = 10;
        targetZ = 6.2;
        camY = 8.5;
        dist = 13.5;
      }

      camera.position.x = targetX + Math.sin(cameraAngle) * dist;
      camera.position.z = targetZ + Math.cos(cameraAngle) * dist;
      camera.position.y = camY;
      camera.lookAt(targetX, targetY, targetZ);

      // 1. ANIMATE FLOWING CANAL WATER RIPPLES
      const posAttr = streamGeo.attributes.position;
      const pArr = posAttr.array as Float32Array;
      for (let i = 0; i < pArr.length; i += 3) {
        const origY = streamInitialPos[i + 1];
        const origX = streamInitialPos[i];
        pArr[i + 2] =
          Math.sin(origY * 0.45 + elapsed * 4.2) * 0.05 +
          Math.cos(origX * 2.8 + elapsed * 3.2) * 0.02;
      }
      posAttr.needsUpdate = true;

      // 2. WATERWHEEL & SPLASHES
      wheelSpinSpeed = THREE.MathUtils.damp(wheelSpinSpeed, 1.6, 2, delta);
      wheelGroup.rotation.x += delta * wheelSpinSpeed;

      const spPos = splashGeo.attributes.position.array as Float32Array;
      for (let sp = 0; sp < splashCount; sp++) {
        const baseIdx = sp * 3;
        const vel = splashVelocities[sp];
        spPos[baseIdx] += vel.x * delta * (wheelSpinSpeed / 1.6);
        spPos[baseIdx + 1] += vel.y * delta;
        spPos[baseIdx + 2] += vel.z * delta * (wheelSpinSpeed / 1.6);
        vel.y -= 9.8 * delta;

        if (spPos[baseIdx + 1] <= 0.22) {
          spPos[baseIdx] = -16.5 + (Math.random() - 0.5) * 0.8;
          spPos[baseIdx + 1] = 0.3 + Math.random() * 0.3;
          spPos[baseIdx + 2] = -6 + (Math.random() - 0.5) * 0.7;
          vel.x = (Math.random() - 0.5) * 0.8;
          vel.y = 1.0 + Math.random() * 1.8 * (wheelSpinSpeed / 1.6);
          vel.z = 0.6 + Math.random() * 1.0;
        }
      }
      splashGeo.attributes.position.needsUpdate = true;

      // 3. ANIMATE CUSTOMERS WALKING UP TO THE SHOP
      walkingCustomers.forEach((wc) => {
        const dz = wc.targetZ - wc.group.position.z;
        if (Math.abs(dz) > 0.15) {
          // Walking towards the counter
          wc.group.position.z += Math.sign(dz) * delta * 1.6;
          wc.group.rotation.y = dz < 0 ? Math.PI : 0;

          // Leg swinging
          const swing = Math.sin(elapsed * 7) * 0.45;
          wc.leftLeg.rotation.x = swing;
          wc.rightLeg.rotation.x = -swing;
        } else {
          // Reached counter: face shop
          wc.isArrived = true;
          wc.group.rotation.y = Math.PI; // Face counter
          wc.leftLeg.rotation.x = 0;
          wc.rightLeg.rotation.x = 0;
        }

        // Thought bubble bobbing above head
        if (wc.thoughtMesh) {
          wc.thoughtMesh.position.y = 2.3 + Math.sin(elapsed * 3 + wc.customerIndex) * 0.12;
        }
      });

      // 4. ANIMATE TREES
      animatedTrees.forEach((atree, tIdx) => {
        let windSway = Math.sin(elapsed * 1.6 + tIdx * 1.3) * 0.035;
        if (atree.wobbleTimer > 0) {
          atree.wobbleTimer -= delta * 2.5;
          windSway += Math.sin(elapsed * 18) * (atree.wobbleTimer * 0.18);
        }
        atree.group.rotation.z = atree.baseRotationZ + windSway;

        if (atree.fronds) {
          atree.fronds.forEach((frond, fIdx) => {
            frond.rotation.x =
              0.75 +
              (fIdx % 2) * 0.18 +
              Math.sin(elapsed * 3.2 + fIdx * 1.2) * 0.06;
          });
        }

        if (atree.canopies) {
          atree.canopies.forEach((lobe, lIdx) => {
            const sc = 1 + Math.sin(elapsed * 2.4 + lIdx) * 0.03;
            lobe.scale.set(sc, sc, sc);
          });
        }
      });

      // 5. ANIMATE DRIFTING LEAF PARTICLES
      const lfPos = leafGeo.attributes.position.array as Float32Array;
      for (let lp = 0; lp < leafParticleCount * 3; lp += 3) {
        lfPos[lp] += delta * 1.8;
        lfPos[lp + 1] += Math.sin(elapsed * 2 + lp) * delta * 0.8;
        lfPos[lp + 2] += delta * 0.9;
        if (lfPos[lp] > 28) lfPos[lp] = -28;
        if (lfPos[lp + 2] > 28) lfPos[lp + 2] = -28;
      }
      leafGeo.attributes.position.needsUpdate = true;

      // 6. ANIMATE BUTTERFLIES & BIRDS
      butterflies.forEach((bf) => {
        const t = elapsed * bf.speed + bf.phase;
        bf.group.position.x = bf.centerX + Math.cos(t) * bf.radius;
        bf.group.position.z = bf.centerZ + Math.sin(t) * (bf.radius * 0.8);
        bf.group.position.y = bf.height + Math.sin(t * 3) * 0.35;
        bf.group.rotation.y = -t + Math.PI / 2;

        const flap = Math.sin(elapsed * 22) * 0.85;
        bf.leftWing.rotation.y = flap;
        bf.rightWing.rotation.y = -flap;
      });

      birdGroup.rotation.y += delta * 0.4;
      bird1.position.y = Math.sin(elapsed * 2) * 0.4;
      bird2.position.y = Math.cos(elapsed * 2.2) * 0.4;

      // 7. ANIMATE CROPS
      const nowMs = Date.now();
      const curFields = fieldsRef.current;
      fieldCropMeshes.forEach((mesh, idx) => {
        const f = curFields[idx];
        if (f) {
          if (f.status === 'ripe') {
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
            mesh.scale.y = 1.35 + Math.sin(elapsed * 2.5 + idx) * 0.08;
          } else if (f.status === 'growing' && f.plantedAt) {
            const progress = Math.min(1, (nowMs - f.plantedAt) / f.growthDuration);
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x10b981);
            mesh.scale.y = 0.3 + progress * 0.95;
          } else {
            mesh.scale.y = 0.05;
          }
        }
      });

      // 8. ANIMATE TRACTOR
      if (tractorBounce > 0) {
        tractorBounce = Math.max(0, tractorBounce - delta * 3);
        tractorGroup.position.y = Math.sin(tractorBounce * Math.PI) * 0.35;
      } else {
        tractorGroup.position.y = 0;
      }
      tractorGroup.position.x = -4 + Math.sin(elapsed * 0.9) * 3.5;
      reelCore.rotation.x += delta * 5;
      rlTire.rotation.x += delta * 4;
      rrTire.rotation.x += delta * 4;

      smokeParticles.forEach((puff) => {
        puff.position.y += delta * 1.5;
        puff.scale.addScalar(delta * 0.4);
        (puff.material as THREE.MeshStandardMaterial).opacity -= delta * 0.5;
        if (puff.position.y > 4.5) {
          puff.position.y = 2.4;
          puff.scale.set(1, 1, 1);
          (puff.material as THREE.MeshStandardMaterial).opacity = 0.5;
        }
      });

      shopIconBadge.rotation.z += delta * 2;
      shopIconBadge.position.y = 4.2 + Math.sin(elapsed * 3) * 0.15;

      // Workers & Animals
      workerSiripala.position.z = -5 + Math.sin(elapsed * 1.2) * 2.5;
      workerSiripala.rotation.y = Math.sin(elapsed * 1.2) > 0 ? 0 : Math.PI;
      workerBandu.position.x = 2 + Math.cos(elapsed * 1.1) * 2;

      cowGroup.position.y = THREE.MathUtils.damp(cowGroup.position.y, 0, 5, delta);
      cowGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.2;

      goatGroup.position.y = THREE.MathUtils.damp(
        goatGroup.position.y,
        Math.abs(Math.sin(elapsed * 2.5)) * 0.15,
        6,
        delta
      );
      chickenGroup.position.y = THREE.MathUtils.damp(
        chickenGroup.position.y,
        Math.abs(Math.sin(elapsed * 5)) * 0.25,
        8,
        delta
      );

      // 9. DYNAMIC WEATHER
      const curMode = weatherModeRef.current;
      if (curMode === 'sunset') {
        scene.background = new THREE.Color(0x381e35);
        scene.fog = new THREE.Fog(0x381e35, 25, 95);
        dirLight.color.setHex(0xf97316);
        dirLight.intensity = 1.1;
        barnLight.intensity = 1.2;
        shopLight.intensity = 1.2;
        towerLantern.intensity = 1.0;
        tractorSpotlight.intensity = 0.8;
        rainMat.opacity = 0;
      } else if (curMode === 'night') {
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.Fog(0x0f172a, 20, 85);
        dirLight.color.setHex(0x38bdf8);
        dirLight.intensity = 0.25;
        barnLight.intensity = 2.5;
        shopLight.intensity = 2.5;
        towerLantern.intensity = 2.0;
        tractorSpotlight.intensity = 2.2;
        rainMat.opacity = 0;
      } else if (curMode === 'rain') {
        scene.background = new THREE.Color(0x475569);
        scene.fog = new THREE.Fog(0x475569, 15, 75);
        dirLight.color.setHex(0x94a3b8);
        dirLight.intensity = 0.6;
        barnLight.intensity = 1.5;
        shopLight.intensity = 1.5;
        towerLantern.intensity = 1.5;
        tractorSpotlight.intensity = 1.2;
        rainMat.opacity = 0.6;

        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < rainCount * 3; i += 3) {
          positions[i] -= delta * 30;
          if (positions[i] < 0) {
            positions[i] = 25;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else {
        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0xcce0d0, 35, 115);
        dirLight.color.setHex(0xfff3d0);
        dirLight.intensity = 1.4;
        barnLight.intensity = 0;
        shopLight.intensity = 0;
        towerLantern.intensity = 0;
        tractorSpotlight.intensity = 0;
        rainMat.opacity = 0;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [activeCameraView]);

  return (
    <div
      className={`space-y-3 transition-all duration-300 ${
        isCinemaMode
          ? 'fixed inset-0 z-50 p-2 bg-stone-950 max-w-none flex flex-col justify-between'
          : ''
      }`}
    >
      {/* 3D Viewport Controls & Weather Switcher */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <div>
            <h2 className="text-xs font-bold text-amber-200">
              3D සජීවී ගොවිපොළ ලෝකය (3D Living Farm)
            </h2>
            <p className="text-[10px] text-stone-400">
              කඩේ ඉදිරිපිට පාරිභෝගිකයින් හා කතාබස් කරන්න, ගොවිතැන් කරන්න!
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-[10px]">
            <button
              onClick={() => setWeatherMode('day')}
              className={`p-1 rounded-lg transition-all ${
                weatherMode === 'day'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="දවාල (Sunny)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeatherMode('sunset')}
              className={`p-1 rounded-lg transition-all ${
                weatherMode === 'sunset'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="හිරු බැසීම (Sunset)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeatherMode('night')}
              className={`p-1 rounded-lg transition-all ${
                weatherMode === 'night'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="රාත්‍රිය (Night)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWeatherMode('rain')}
              className={`p-1 rounded-lg transition-all ${
                weatherMode === 'rain'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="මෝසම් වැස්ස (Rain)"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsCinemaMode((prev) => !prev)}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-all cursor-pointer"
            title={isCinemaMode ? 'Minimize' : 'Fullscreen 3D'}
          >
            {isCinemaMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Box */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-stone-950 ${
          isCinemaMode ? 'flex-1 h-[calc(100vh-140px)] min-h-[420px]' : 'h-[420px]'
        }`}
      >
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top-Left Navigation Guide Pill */}
        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-stone-700/80 text-[10px] text-amber-300 font-bold flex items-center gap-1.5 pointer-events-none">
          <Compass className="w-3.5 h-3.5" />
          <span>ස්පර්ශ කර කරකවන්න (Orbit)</span>
        </div>

        {/* Top-Right Quick Action Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          {/* AI Customer Chat Button */}
          <button
            onClick={() => {
              sounds.playCoin();
              setIsAiChatOpen(true);
              setActiveCameraView('shop');
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-95 text-stone-950 font-black px-2.5 py-1.5 rounded-full shadow-lg border border-emerald-300/60 flex items-center gap-1 text-[11px] cursor-pointer animate-pulse"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI කතාබස් (Chat)</span>
          </button>

          {/* 3D Shop Callout */}
          <button
            onClick={() => {
              sounds.playCoin();
              setSelectedShopCategory('general');
              setIsShopModalOpen(true);
              setActiveCameraView('shop');
            }}
            className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 active:scale-95 text-stone-950 font-black px-2.5 py-1.5 rounded-full shadow-lg border border-yellow-200/60 flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>🏪 කඩය</span>
          </button>
        </div>

        {/* Customer Thought Message Bubble (කඩේ ඉස්සරහ මිනිස්සුන්ගේ අදහස්) */}
        <div className="absolute top-13 left-1/2 -translate-x-1/2 z-20 max-w-[94vw] w-max animate-fade-in pointer-events-auto">
          <button
            onClick={() => {
              sounds.playCoin();
              setIsAiChatOpen(true);
              setActiveCameraView('shop');
            }}
            className="bg-gradient-to-r from-stone-950/95 via-stone-900/95 to-amber-950/95 border-2 border-yellow-400 text-yellow-200 px-3 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-95 transition-all text-left"
          >
            <span className="text-lg animate-bounce">💭</span>
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <span className="text-[9px] text-amber-400 font-bold block">
                {currentCustomerData.name}:
              </span>
              <span className="text-xs font-black text-white truncate block">
                {currentCustomerData.thoughtBubble}
              </span>
            </div>
            <span className="bg-yellow-400 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 shadow">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>කතා කරන්න</span>
            </span>
          </button>
        </div>

        {/* Floating Tooltip when hovering over any 3D Item */}
        {hoveredItemName && (
          <div className="absolute top-26 left-1/2 -translate-x-1/2 z-20 bg-stone-950/90 border border-yellow-400 text-yellow-300 text-[11px] font-black py-1 px-3 rounded-full shadow-xl pointer-events-none animate-fade-in flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>{hoveredItemName}</span>
          </div>
        )}

        {/* In-Canvas Dynamic Event Toast */}
        {interactiveToast && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 border border-amber-400 text-amber-200 text-xs font-black py-1.5 px-4 rounded-full shadow-2xl animate-fade-in flex items-center gap-2 max-w-[90vw] text-center pointer-events-none">
            <span>{interactiveToast.icon}</span>
            <span className="truncate">{interactiveToast.text}</span>
          </div>
        )}

        {/* Collapsible Camera Preset Dock at Bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-amber-500/30 flex items-center gap-1 shadow-2xl overflow-x-auto max-w-[94vw]">
          <button
            onClick={() => setActiveCameraView('overview')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'overview'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🦅 සමස්තය
          </button>
          <button
            onClick={() => setActiveCameraView('shop')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'shop'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-md font-black ring-1 ring-yellow-300'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🏪 3D කඩය & මිනිස්සු
          </button>
          <button
            onClick={() => setActiveCameraView('trees')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'trees'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🌴 ගස් & ඇළ
          </button>
          <button
            onClick={() => setActiveCameraView('fields')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'fields'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🌾 කුඹුරු 10
          </button>
          <button
            onClick={() => setActiveCameraView('tractor')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'tractor'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🚜 ට්‍රැක්ටරය
          </button>
          <button
            onClick={() => setActiveCameraView('animals')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'animals'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🐄 සත්තු
          </button>
          <button
            onClick={() => setActiveCameraView('watchtower')}
            className={`py-1 px-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
              activeCameraView === 'watchtower'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🛖 මුර පැල
          </button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* INTERACTIVE 3D SHOP IN-SCENE MODAL & CASHIER */}
        {/* ----------------------------------------------------------- */}
        {isShopModalOpen && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/50 rounded-3xl p-4 w-full max-w-sm shadow-[0_0_35px_rgba(245,158,11,0.3)] space-y-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
                    🏪
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-200">
                      3D ගොවිපොළ වෙළඳ කුටිය (Farm Stall)
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      කඩේ ඇති භාණ්ඩ සජීවීව විකිණීම සහ මිලදී ගැනීම
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-yellow-300 text-[11px] font-black px-2 py-0.5 rounded-full border border-amber-400/40">
                    🪙 {coins}
                  </span>
                  <button
                    onClick={() => setIsShopModalOpen(false)}
                    className="p-1 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Quick Filter */}
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                <button
                  onClick={() => setSelectedShopCategory('paddy')}
                  className={`py-1 rounded-xl transition-all ${
                    selectedShopCategory === 'paddy'
                      ? 'bg-amber-500 text-stone-950 font-black'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  🌾 වී
                </button>
                <button
                  onClick={() => setSelectedShopCategory('milk')}
                  className={`py-1 rounded-xl transition-all ${
                    selectedShopCategory === 'milk'
                      ? 'bg-cyan-500 text-stone-950 font-black'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  🥛 කිරි
                </button>
                <button
                  onClick={() => setSelectedShopCategory('eggs')}
                  className={`py-1 rounded-xl transition-all ${
                    selectedShopCategory === 'eggs'
                      ? 'bg-yellow-500 text-stone-950 font-black'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  🥚 බිත්තර
                </button>
                <button
                  onClick={() => setSelectedShopCategory('seeds')}
                  className={`py-1 rounded-xl transition-all ${
                    selectedShopCategory === 'seeds'
                      ? 'bg-emerald-500 text-stone-950 font-black'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  🌱 බීජ
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {/* 1. Paddy Sacks */}
                <div className="p-2.5 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌾</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">වී මලු (Paddy Sacks)</h4>
                      <p className="text-[10px] text-amber-300">
                        තොගය: {barnStock.paddySacks} මලු • මිල: +25 කොයින්
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (barnStock.paddySacks > 0 && onSellPaddyDirect) {
                        sounds.playCoin();
                        onSellPaddyDirect(1);
                      }
                    }}
                    disabled={barnStock.paddySacks <= 0}
                    className={`py-1 px-3 rounded-xl text-[10px] font-black transition-all ${
                      barnStock.paddySacks > 0
                        ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95 shadow-md'
                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    විකුණන්න (+25)
                  </button>
                </div>

                {/* 2. Fresh Cow Milk */}
                <div className="p-2.5 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥛</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">නැවුම් එළකිරි (Cow Milk)</h4>
                      <p className="text-[10px] text-cyan-300">
                        තොගය: {barnStock.cowMilkBottles || 0} බෝතල් • මිල: +40 කොයින්
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if ((barnStock.cowMilkBottles || 0) > 0 && onSellMilkDirect) {
                        sounds.playCoin();
                        onSellMilkDirect(1);
                      }
                    }}
                    disabled={(barnStock.cowMilkBottles || 0) <= 0}
                    className={`py-1 px-3 rounded-xl text-[10px] font-black transition-all ${
                      (barnStock.cowMilkBottles || 0) > 0
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer active:scale-95 shadow-md'
                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    විකුණන්න (+40)
                  </button>
                </div>

                {/* 3. Farm Eggs */}
                <div className="p-2.5 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥚</span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">ගමේ බිත්තර (Farm Eggs)</h4>
                      <p className="text-[10px] text-yellow-300">
                        තොගය: {barnStock.eggsCount || 0} බිත්තර • මිල: 2ක් සඳහා +18 කොයින්
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if ((barnStock.eggsCount || 0) >= 2 && onSellEggsDirect) {
                        sounds.playCoin();
                        onSellEggsDirect(2);
                      }
                    }}
                    disabled={(barnStock.eggsCount || 0) < 2}
                    className={`py-1 px-3 rounded-xl text-[10px] font-black transition-all ${
                      (barnStock.eggsCount || 0) >= 2
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-stone-950 cursor-pointer active:scale-95 shadow-md'
                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    2ක් විකුණන්න (+18)
                  </button>
                </div>

                {/* 4. Buy Seeds */}
                <div className="p-2.5 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">වී බීජ තොග (Buy Seeds)</h4>
                      <p className="text-[10px] text-stone-400">
                        වත්මන් බීජ: {barnStock.seedsCount || 0} • බීජ 10ක් (20 කොයින්)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (coins >= 20 && onBuySeeds) {
                        sounds.playHarvest();
                        onBuySeeds(10, 20);
                      }
                    }}
                    disabled={coins < 20}
                    className={`py-1 px-3 rounded-xl text-[10px] font-black transition-all ${
                      coins >= 20
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-md'
                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    මිලදී ගන්න (20)
                  </button>
                </div>
              </div>

              {/* Bottom Jump to AI Chat or Full Shop Page Button */}
              <div className="pt-2 border-t border-stone-800 flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setIsShopModalOpen(false);
                    setIsAiChatOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>පාරිභෝගිකයින් සමග AI කතාබස් (Chat)</span>
                </button>

                {onNavigateToShop && (
                  <button
                    onClick={() => {
                      setIsShopModalOpen(false);
                      onNavigateToShop();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-stone-800 text-stone-300 font-bold text-[11px] flex items-center justify-center gap-1.5 hover:text-white"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>සම්පූර්ණ කඩය පිටුවට යන්න</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* AI CUSTOMER CHAT BOX MODAL (Nova AI Integration) */}
      {/* ----------------------------------------------------------- */}
      <AiCustomerChatBox
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        activeCustomerIndex={activeCustomerIndex}
        barnStock={barnStock}
        coins={coins}
        onFulfillDeal={(item, qty, earned) => {
          propsRef.current.onFulfillCustomerDeal?.(item, qty, earned);
        }}
      />
    </div>
  );
};
