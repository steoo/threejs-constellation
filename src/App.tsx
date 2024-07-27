import { useRef, useState, useMemo, useEffect, Suspense } from "react";

import {
  Billboard,
  BillboardProps,
  Box,
  Cloud,
  Stars,
  Text,
  TrackballControls,
} from "@react-three/drei";
import { Canvas, useFrame, ThreeEvent, useThree } from "@react-three/fiber";
import { generate } from "random-words";
import * as THREE from "three";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";

import FrustumVisualizer, { LogCameraPosition } from "./FrustumVisualiser";
import GlowingText, { fontProps } from "./GlowingText";

const cameraPosition = [0, 10, 200];
const [x, y, z] = cameraPosition;

const Word: React.FC<React.PropsWithChildren<BillboardProps>> = ({
  children,
  ...props
}) => {
  const color = new THREE.Color();
  const ref = useRef<Mesh>();
  const [hovered, setHovered] = useState(false);
  const over = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), setHovered(true)
  );
  const out = () => setHovered(false);
  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) document.body.style.cursor = "pointer";

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);
  // Tie component to the render-loop

  useFrame(() => {
    if (
      ref.current &&
      ref.current.material &&
      "color" in ref.current.material
    ) {
      (ref.current.material as MeshBasicMaterial).color.lerp(
        color.set(hovered ? "#fa2720" : "white"),
        0.1,
      );
    }
  });

  return (
    <Billboard {...props}>
      <Text
        ref={ref}
        onPointerOver={over}
        onPointerOut={out}
        onClick={() => console.log("clicked")}
        children={children}
        {...fontProps}
      />
    </Billboard>
  );
};

function WordsCloud({
  count = 4,
  radiusX = 40,
  radiusY = 20,
  groupRef,
}: {
  count?: number;
  radiusX?: number;
  radiusY?: number;
  groupRef: React.RefObject<THREE.Group>;
}) {
  // Initialize angles for each word
  const words = useMemo(() => {
    const temp = [];
    const thetaSpan = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const theta = thetaSpan * i;
      temp.push([theta, generate()]);
    }

    return temp;
  }, [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const elapsedTime = clock.getElapsedTime();
      const thetaSpan = (2 * Math.PI) / count;

      groupRef.current.children.forEach((child, i) => {
        const theta = thetaSpan * i + elapsedTime * 0.02; // Adjust the speed here
        const x = radiusX * Math.cos(theta);
        const y = radiusY * Math.sin(theta);

        child.position.set(x, 0, y);
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {words.map(([theta, word], index) => (
        <Word
          key={index}
          position={
            new Vector3(
              radiusX * Math.cos(theta as number),
              0,
              radiusY * Math.sin(theta as number),
            )
          }
          children={word as React.ReactNode}
        />
      ))}
    </group>
  );
}

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
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={["#222222", 0, 80]} />
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
          opacity={0.3}
          color="#cbcbcb"
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
