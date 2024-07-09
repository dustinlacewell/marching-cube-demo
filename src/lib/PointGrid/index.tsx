import React, { useState, useEffect, useRef } from 'react'
import { Vector3, Mesh, MeshBasicMaterial } from 'three'
import { useThree } from '@react-three/fiber'
import { Volume } from '@/mc/Volume'

interface PointGridProps {
  size?: number
  spacing?: number
}

const PointGrid: React.FC<PointGridProps> = ({ size = 4, spacing = 1 }) => {
  console.log("Rendering...")
  const { scene } = useThree()

  const [points, setPoints] = useState<boolean[][][]>(() =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        Array.from({ length: size }, () => false)
      )
    )
  )

  const volumeRef = useRef<Volume>(new Volume(size, new Vector3()))
  const meshRefs = useRef<Mesh[]>([])

  const togglePoint = (x: number, y: number, z: number) => {
    setPoints(prev => {
      const newPoints = JSON.parse(JSON.stringify(prev))
      newPoints[x][y][z] = !newPoints[x][y][z]
      console.log(`Toggled point at ${x},${y},${z} to ${newPoints[x][y][z]}`)
      return newPoints
    })
  }

  useEffect(() => {
    const volume = volumeRef.current
    const geometries = volume.updatePoints(points)

    console.log(`Got ${geometries.length} geometries`)

    // Remove old meshes
    meshRefs.current.forEach(mesh => {
      scene.remove(mesh)
    })
    meshRefs.current = []

    // Create new meshes
    geometries.forEach(geometry => {
      const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
      const mesh = new Mesh(geometry, material)
      console.log(`Adding geometry which has ${geometry.getAttribute('position').count}`)
      scene.add(mesh)
      meshRefs.current.push(mesh)
    })
  }, [points, size, scene])

  return (
    <group>
      {points.flatMap((yz, x) =>
        yz.flatMap((z, y) =>
          z.map((active, z) => (
            <mesh
              key={`${x}-${y}-${z}`}
              position={[x * spacing, y * spacing, z * spacing]}
              onClick={() => togglePoint(x, y, z)}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={active ? "green" : "black"} />
            </mesh>
          ))
        )
      )}
    </group>
  )
}

export default PointGrid