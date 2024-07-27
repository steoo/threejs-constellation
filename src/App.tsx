import { useRef, useState, useEffect, Suspense } from "react";

import { Billboard, Cloud, Stars, TrackballControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { LogCameraPosition } from "./FrustumVisualiser";
import GlowingText from "./GlowingText";
import WordsCloud from "./WordsCloud";

const cameraPosition = [0, 10, 200];
const [x, y, z] = cameraPosition;

function CameraZoom({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
  const { camera } = useThree();

  const duration = 1;
  const startTime = useRef<number | null>(null);
  const [targetZ, setTargetZ] = useState<number>(0);

  const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Set the targetZ dynamically based on the WordsCloud position
      setTargetZ(center.z + size.z / 2 + 15); // Adding a bit of buffer
    }

    startTime.current = performance.now();
  }, [groupRef]);

  useFrame(() => {
    if (startTime.current !== null && targetZ !== 0) {
      const elapsedTime = (performance.now() - startTime.current) / 1000;
      const t = Math.min(elapsedTime / duration, 1);
      const easeT = easeInOutQuad(t);
      const newZ = THREE.MathUtils.lerp(z, targetZ, easeT);
      camera.position.set(x, y, newZ + 10);

      console.log(newZ);

      if (t >= 1) {
        // Stop the animation once the target is reached
        startTime.current = null;
      }
    }
  });

  return null;
}

export default function App() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 40, 20, 0, Math.PI * 2, false, 0);

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
        <WordsCloud count={10} groupRef={groupRef} />
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
        {/* <FrustumVisualizer /> */}
        <LogCameraPosition />
        <CameraZoom groupRef={groupRef} />
      </Suspense>
    </Canvas>
  );
}
