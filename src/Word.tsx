import { useEffect, useRef, useState } from "react";

import { Billboard, BillboardProps, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Mesh, MeshBasicMaterial } from "three";

export const fontProps = {
  font:
    process.env.NODE_ENV === "production"
      ? "/threejs-constellation/times-new-roman.woff"
      : "/times-new-roman.woff",
  fontSize: 2.5,
  letterSpacing: -0.05,
  lineHeight: 1,
  color: "#C2BFB6",
  "material-toneMapped": false,
};

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
        color.set(hovered ? "white" : fontProps.color),
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

export default Word;
