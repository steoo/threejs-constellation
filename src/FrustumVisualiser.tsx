import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineSegments, PerspectiveCamera } from "three";

export default function FrustumVisualizer() {
  const { camera, scene } = useThree();
  const frustumRef = useRef<LineSegments | null>(null);

  useEffect(() => {
    const nearPlane = new THREE.PlaneGeometry(100, 100);
    const nearMaterial = new THREE.MeshBasicMaterial({
      color: "red",
      wireframe: true,
    });
    const nearMesh = new THREE.Mesh(nearPlane, nearMaterial);
    nearMesh.position.z = -camera.near;
    scene.add(nearMesh);

    const farPlane = new THREE.PlaneGeometry(100, 100);
    const farMaterial = new THREE.MeshBasicMaterial({
      color: "green",
      wireframe: true,
    });
    const farMesh = new THREE.Mesh(farPlane, farMaterial);
    farMesh.position.z = -camera.far;
    scene.add(farMesh);

    const frustumGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Near plane
      -0.5,
      -0.5,
      -camera.near,
      0.5,
      -0.5,
      -camera.near,
      0.5,
      0.5,
      -camera.near,
      -0.5,
      0.5,
      -camera.near,
      // Far plane
      -0.5,
      -0.5,
      -camera.far,
      0.5,
      -0.5,
      -camera.far,
      0.5,
      0.5,
      -camera.far,
      -0.5,
      0.5,
      -camera.far,
    ]);
    frustumGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3),
    );
    const frustumEdges = new THREE.EdgesGeometry(frustumGeometry);
    const frustumMaterial = new THREE.LineBasicMaterial({ color: "blue" });
    const frustum = new THREE.LineSegments(frustumEdges, frustumMaterial);
    frustumRef.current = frustum;
    scene.add(frustum);

    return () => {
      scene.remove(nearMesh);
      scene.remove(farMesh);
      scene.remove(frustum);
    };
  }, [camera, scene]);

  useFrame(() => {
    const perspectiveCamera = camera as PerspectiveCamera;

    if (frustumRef.current) {
      const frustumVertices = frustumRef.current.geometry.attributes.position
        .array as Float32Array;
      const nearWidth =
        2 *
        Math.tan(THREE.MathUtils.degToRad(perspectiveCamera.fov) / 2) *
        camera.near;
      const nearHeight = nearWidth / perspectiveCamera.aspect;
      const farWidth =
        2 *
        Math.tan(THREE.MathUtils.degToRad(perspectiveCamera.fov) / 2) *
        camera.far;
      const farHeight = farWidth / perspectiveCamera.aspect;

      frustumVertices[0] = -nearWidth / 2;
      frustumVertices[1] = -nearHeight / 2;
      frustumVertices[3] = nearWidth / 2;
      frustumVertices[4] = -nearHeight / 2;
      frustumVertices[6] = nearWidth / 2;
      frustumVertices[7] = nearHeight / 2;
      frustumVertices[9] = -nearWidth / 2;
      frustumVertices[10] = nearHeight / 2;
      frustumVertices[12] = -farWidth / 2;
      frustumVertices[13] = -farHeight / 2;
      frustumVertices[15] = farWidth / 2;
      frustumVertices[16] = -farHeight / 2;
      frustumVertices[18] = farWidth / 2;
      frustumVertices[19] = farHeight / 2;
      frustumVertices[21] = -farWidth / 2;
      frustumVertices[22] = farHeight / 2;
      frustumRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return null;
}

export function LogCameraPosition() {
  const { camera } = useThree();

  useFrame(() => {
    console.log(
      `Camera position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`,
    );
  });

  return null;
}
