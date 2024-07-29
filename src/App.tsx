import { useRef, useState, useEffect, Suspense } from "react";

import { Billboard, Cloud, Stars, TrackballControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import CameraZoom from "./CameraZoom";
import { cameraPosition } from "./constants";
import EllipseCamera from "./EllipseCamera";
import { LogCameraPosition } from "./FrustumVisualiser";
import GlowingText from "./GlowingText";
import WordsCloud from "./WordsCloud";

export default function App() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 40, 20, 0, Math.PI * 2, false, 0);

  const [x, y, z] = cameraPosition;

  const groupRef = useRef<THREE.Group>(null);

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [x, y, z], fov: 90 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.1} />
      <fog attach="fog" args={["#04000c", 0, 80]} />
      {/* <gridHelper args={[1000, 100]} /> */}
      {/* <axesHelper args={[1000]} /> */}
      <Stars radius={100} depth={50} count={8000} factor={5} fade />
      {/* <mesh visible position={[0, 0, 10]}>
        <lineBasicMaterial />
        <shapeGeometry args={[shape, 32]} />
      </mesh> */}
      <Suspense fallback={null}>
        <WordsCloud groupRef={groupRef} />
        <Cloud
          opacity={0.4}
          color="#04000c"
          speed={0.1}
          growth={1}
          scale={40}
          position={new THREE.Vector3(0, 0, 10)}
        />
        <Billboard>
          <GlowingText>Cosa ti manca per essere felice?</GlowingText>
        </Billboard>
        <TrackballControls maxDistance={z} />
        {/* <EllipseCamera /> */}
        {/* <FrustumVisualizer /> */}
        <LogCameraPosition />
        <CameraZoom groupRef={groupRef} />
      </Suspense>
    </Canvas>
  );
}
