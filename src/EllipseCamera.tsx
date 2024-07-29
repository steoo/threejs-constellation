import { useEffect, useRef } from "react";

import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function EllipseControls({ radiusX = 40, radiusY = 20 }) {
  const { camera, gl } = useThree();
  const theta = useRef(0);
  const phi = useRef(0);
  const zoom = useRef(1);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.current.x,
        y: event.clientY - previousMousePosition.current.y,
      };

      theta.current += deltaMove.x * 0.01;
      phi.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, phi.current - deltaMove.y * 0.01),
      );

      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      zoom.current = Math.max(
        0.5,
        Math.min(2, zoom.current + event.deltaY * -0.001),
      );
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  useFrame(() => {
    const x =
      radiusX * Math.cos(theta.current) * Math.cos(phi.current) * zoom.current;
    const y = radiusY * Math.sin(phi.current) * zoom.current;
    const z =
      radiusY * Math.sin(theta.current) * Math.cos(phi.current) * zoom.current;

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
