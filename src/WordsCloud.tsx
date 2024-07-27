import { useMemo } from "react";

import { useFrame } from "@react-three/fiber";
import { generate } from "random-words";
import * as THREE from "three";

import Word from "./Word";

export default function WordsCloud({
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
            new THREE.Vector3(
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
