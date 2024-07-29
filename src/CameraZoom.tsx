import { useEffect, useRef, useState } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { cameraPosition } from "./constants";

export default function CameraZoom({
  groupRef,
}: {
  groupRef: React.RefObject<THREE.Group>;
}) {
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
      const newZ = THREE.MathUtils.lerp(cameraPosition[2], targetZ, easeT);
      camera.position.set(cameraPosition[0], cameraPosition[1], newZ + 10);

      console.log(newZ);

      if (t >= 1) {
        // Stop the animation once the target is reached
        startTime.current = null;
      }
    }
  });

  return null;
}
