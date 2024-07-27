import React, { useRef, useState, useMemo, useEffect } from "react";

import { Text } from "@react-three/drei";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

interface GlowingTextProps {
  children: React.ReactNode;
  position?: [number, number, number];
}

export const fontProps = {
  font:
    process.env.NODE_ENV === "production"
      ? "/threejs-constellation/times-new-roman.woff"
      : "/times-new-roman.woff",
  fontSize: 2.5,
  letterSpacing: -0.05,
  lineHeight: 1,
  "material-toneMapped": false,
};

const GlowingText: React.FC<GlowingTextProps> = ({
  children,
  position = [0, 0, 0],
}) => {
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [moveOffset, setMoveOffset] = useState(0);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const out = () => setHovered(false);

  useEffect(() => {
    if (hovered) document.body.style.cursor = "pointer";
    else document.body.style.cursor = "auto";
  }, [hovered]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    setMoveOffset(Math.sin(elapsedTime * 2) * 0.1);
    if (textRef.current) {
      textRef.current.position.y = position[1] + moveOffset;
    }
  });

  return (
    <>
      <Text
        ref={textRef}
        position={position}
        onPointerOver={over}
        onPointerOut={out}
        onClick={() => console.log("clicked")}
        {...fontProps}
      >
        {children}
      </Text>
      {/* <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer> */}
    </>
  );
};

export default GlowingText;
