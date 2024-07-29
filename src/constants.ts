import * as THREE from "three";

export const cameraPosition = [0, 10, 200];

export const GlowShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float c;
    uniform float p;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * intensity;
    }
  `,
};

export const phrases = [
  "Il merito della laurea",
  "La stabilità del lavoro",
  "Il futuro dei figli",
  "L’indipendenza della macchina",
  "La sicurezza della casa",
  "La gioia delle feste",
  "La flessibilità della fede",
  "Conoscere le buone maniere",
  "La forza del matrimonio",
  "La ricarica delle vacanze",
];
