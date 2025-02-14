'use client'
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';


// Componente avanzado para un pétalo de orquídea
const OrchidPetal = ({ color, position = [0,0,0], rotation = [0,0,0] }) => {
  // Función paramétrica para generar la forma del pétalo
  // u y v varían entre 0 y 1
  const petalGeometry = useMemo(() => {
    const petalFunc = (u, v, target) => {
      // Escala de la longitud y ancho del pétalo
      const length = 1.0; 
      const maxWidth = 0.4; 

      // u determina la posición a lo largo del pétalo (0 = base, 1 = punta)
      // v determina la posición transversal (0 = borde izquierdo, 1 = borde derecho)
      // Usamos una curva de Bézier simple para el contorno del pétalo
      const curvatura = 0.3 * Math.sin(u * Math.PI); 
      const x = (u * length) + curvatura;
      // El ancho varía de forma que en la base es mayor y en la punta se estrecha
      const y = (v - 0.5) * maxWidth * (1 - u) * 2;
      // Agregamos un ligero efecto de curvatura en z para dar un relieve natural
      const z = 0.1 * Math.sin(u * Math.PI * 2) * (v - 0.5);
      target.set(x, y, z);
    };
    return new ParametricGeometry(petalFunc, 30, 15);

  }, []);

  return (
    <mesh geometry={petalGeometry} position={position} rotation={rotation}>
      <meshStandardMaterial 
        color={color} 
        opacity={0.95} 
        transparent 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

// Componente de la orquídea con varios pétalos y un labellum
const Orchid = ({ position, color, stemHeight, opacity, glowIntensity, windIntensity = 0.1 }) => {
  const flowerRef = useRef();

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    if (flowerRef.current) {
      flowerRef.current.position.x = position[0] + Math.sin(elapsedTime) * windIntensity;
      flowerRef.current.rotation.z = Math.sin(elapsedTime) * (windIntensity * 0.2);
    }
  });

  // Para los pétalos, los distribuimos en círculo y con ligeros desplazamientos para simular la naturalidad
  const petals = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const angle = (i / 5) * Math.PI * 2;
      // Desplazamiento radial para separar cada pétalo
      const pos = [
        Math.cos(angle) * 0.2,
        Math.sin(angle) * 0.2,
        0
      ];
      // Rotación para orientar cada pétalo hacia fuera
      const rot = [0, 0, angle];
      return <OrchidPetal key={i} color={color} position={pos} rotation={rot} />;
    });
  }, [color]);

  // Labellum central: se crea con una forma plana y se le da un material diferente
  const labellumGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.2, 0);
    shape.quadraticCurveTo(0, 0.3, 0.2, 0);
    shape.quadraticCurveTo(0, -0.15, -0.2, 0);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  }, []);

  return (
    <group ref={flowerRef}>
      {/* Tallo */}
      <mesh position={[position[0], position[1] + stemHeight / 2, position[2]]}>
        <cylinderGeometry args={[0.03, 0.03, stemHeight, 8]} />
        <meshStandardMaterial color="green" opacity={opacity} transparent />
      </mesh>

      {/* Flor */}
      <group position={[position[0], position[1] + stemHeight, position[2]]}>
        {petals}
        {/* Labellum */}
        <mesh position={[0, 0, 0.06]}>
          <primitive object={labellumGeometry} attach="geometry" />
          <meshStandardMaterial 
            color={color} 
            opacity={opacity}
            transparent 
            emissive={color}
            emissiveIntensity={glowIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};

// Componente para el pasto
const Grass = ({ opacity, glowIntensity, windIntensity = 0.05 }) => {
  const grassRef = useRef();
  const time = useRef(0);

  useFrame(() => {
    time.current += 0.01;
    if (grassRef.current) {
      grassRef.current.rotation.y = Math.sin(time.current) * (windIntensity * 0.1);
    }
  });

  return (
    <mesh ref={grassRef} position={[0, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshStandardMaterial 
        color="green"
        opacity={opacity}
        transparent
        emissive="green"
        emissiveIntensity={glowIntensity}
        wireframe
      />
    </mesh>
  );
};

// Componente principal
const OrchidGarden = () => {
  const [flowers, setFlowers] = useState([]);
  const [flowerColor, setFlowerColor] = useState('#ff69b4');
  const [stemHeight, setStemHeight] = useState(2);
  const [opacity, setOpacity] = useState(0.8);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [grassOpacity, setGrassOpacity] = useState(0.8);
  const [grassGlow, setGrassGlow] = useState(0.3);

  const addFlower = () => {
    const x = (Math.random() - Math.random()) * 15;
    const z = (Math.random() - Math.random()) * 15;
    setFlowers([...flowers, { position: [x, -2, z], id: Date.now() }]);
  };

  return (
    <div className="w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 space-y-4 bg-black/50 p-4 rounded">
        <button
          onClick={addFlower}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Agregar Orquídea
        </button>
        <div className="space-y-2">
          <label className="block text-white">
            Color:
            <input
              type="color"
              value={flowerColor}
              onChange={(e) => setFlowerColor(e.target.value)}
              className="ml-2"
            />
          </label>
          <label className="block text-white">
            Altura del tallo:
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={stemHeight}
              onChange={(e) => setStemHeight(Number(e.target.value))}
              className="ml-2"
            />
          </label>
          <label className="block text-white">
            Opacidad:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="ml-2"
            />
          </label>
          <label className="block text-white">
            Intensidad del brillo:
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={glowIntensity}
              onChange={(e) => setGlowIntensity(Number(e.target.value))}
              className="ml-2"
            />
          </label>
        </div>
      </div>
      
      <Suspense fallback={<div className="text-white">Cargando escena...</div>}>
        <Canvas camera={{ position: [0, 2, 10], fov: 75 }} className="w-full h-full">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enableZoom={true} enablePan={true} />
          <Grass opacity={grassOpacity} glowIntensity={grassGlow} />
          {flowers.map((flower) => (
            <Orchid
              key={flower.id}
              position={flower.position}
              color={flowerColor}
              stemHeight={stemHeight}
              opacity={opacity}
              glowIntensity={glowIntensity}
            />
          ))}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default OrchidGarden;
