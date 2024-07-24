import { useRef, useState, useMemo, useEffect, Suspense } from "react";

import {
  Billboard,
  BillboardProps,
  Box,
  Stars,
  Text,
  TrackballControls,
} from "@react-three/drei";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { generate } from "random-words";
import * as THREE from "three";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";

const Word: React.FC<React.PropsWithChildren<BillboardProps>> = ({
  children,
  ...props
}) => {
  const color = new THREE.Color();
  const fontProps = {
    font: "/Inter-Bold.woff",
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

function Cloud({ count = 4, radius = 20 }) {
  // Create a count x count random words with spherical distribution
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    const phiSpan = Math.PI / (count + 1);
    const thetaSpan = (Math.PI * 2) / count;

    for (let i = 1; i < count + 1; i++) {
      for (let j = 0; j < count; j++) {
        const phi = phiSpan * i;
        const theta = thetaSpan * j;
        const position = new THREE.Vector3().setFromSpherical(
          spherical.set(radius, phi, theta),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        temp.push([position, generate()]);
        console.log(
          `Position ${i},${j}: ${position.x}, ${position.y}, ${position.z}`,
        );
      }
    }

    return temp;
  }, [count, radius]);

  return (
    /* eslint-disable-next-line react/no-unknown-property */
    <group rotation={[10, 10.5, 10]}>
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
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 35], fov: 90 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <fog attach="fog" args={["#202025", 0, 80]} />
      <Stars radius={10} depth={50} count={5000} factor={4} fade />
      <Suspense fallback={null}>
        <Cloud count={8} radius={20} />
        <TrackballControls />
      </Suspense>
    </Canvas>
  );
}
