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
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { generate } from "random-words";
import * as THREE from "three";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";

import FrustumVisualizer, { LogCameraPosition } from "./FrustumVisualiser";

const cameraPosition = [0, 1, 200];
const [x, y, z] = cameraPosition;

const Word: React.FC<React.PropsWithChildren<BillboardProps>> = ({
  children,
  ...props
}) => {
  const color = new THREE.Color();
  const fontProps = {
    font: "/times-new-roman.woff",
    fontSize: 2.5,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };
  const ref = useRef<Mesh>();
  const [hovered, setHovered] = useState(false);
  const over = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), setHovered(true)
  );
  const out = () => setHovered(false);
  // Change the mouse cursor on hover¨
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

function WordsCloud({ count = 4, radius = 20 }) {
  // Create a count x count random words with spherical distribution
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    const cylindrical = new THREE.Cylindrical();
    const phiSpan = Math.PI / (count + 1);
    const thetaSpan = Math.PI / count;

    // for (let i = 1; i < count + 1; i++) {
    //   for (let j = 0; j < count; j++) {
    //     const phi = phiSpan * i;
    //     const theta = thetaSpan * j;
    //     const position = new THREE.Vector3().setFromSpherical(
    //       spherical.set(radius, phi, theta),
    //     );
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    //     temp.push([position, generate()]);
    //     console.log(
    //       `Position ${i},${j}: ${position.x}, ${position.y}, ${position.z}`,
    //     );
    //   }
    // }
    for (let i = 1; i < count + 1; i++) {
      const theta = thetaSpan * i;
      const position = new THREE.Vector3().setFromCylindricalCoords(
        radius,
        theta,
        0,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      temp.push([position, generate()]);
    }

    return temp;
  }, [count, radius]);

  return (
    <group
      rotation={[0, THREE.MathUtils.degToRad(-100), 0]}
      position={[0, 0, 0]}
    >
      {words.map(([pos, word], index) => (
        <Word
          key={index}
          position={pos as Vector3}
          children={word as React.ReactNode}
        />
      ))}
    </group>
  );
}

export default function App() {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 40, 20, 0, Math.PI * 2, false, 0);

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [x, y, z], fov: 90 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={["#222222", 0, 80]} />
      <gridHelper args={[1000, 100]} />
      <axesHelper args={[1000]} />
      <Stars radius={40} depth={50} count={8000} factor={5} fade />
      {/* <mesh visible position={[0, 0, 10]}>
        <lineBasicMaterial />
        <shapeGeometry args={[shape, 32]} />
      </mesh> */}
      <Suspense fallback={null}>
        {/* <Cloud
          opacity={0.3}
          color="#ffffff"
          speed={0.1}
          growth={1}
          scale={50}
          position={new THREE.Vector3(0, 0, z / 2)}
        /> */}
        <WordsCloud count={10} radius={40} />
        <TrackballControls maxDistance={z} />
        {/* <FrustumVisualizer /> */}
        <LogCameraPosition />
      </Suspense>
    </Canvas>
  );
}
