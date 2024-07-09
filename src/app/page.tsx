"use client"

import PointGrid from "@/lib/PointGrid"

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import styles from "./page.module.css"
import { useStore } from "@/store"
import { Vector3 } from "three"

export default function Home() {
  return (
    <div className={styles.main}>
      <Canvas camera={{ position: [0, 0, 7]}}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <PointGrid />
        <OrbitControls position={new Vector3(1.5, 1.5, 10.5)} target={[1.5, 1.5, 1.5]} />
      </Canvas>
    </div>
  )
}
