import { Vector3, BufferGeometry, Float32BufferAttribute, Vector3Like } from "three";
import { triTable, edgeEndpoints, cubeCorners, } from "./lookup"
import { Point } from "./Volume.js"

export class Cube {
  private geometry: BufferGeometry;

  constructor(private position: Vector3, private size: number, private corners: Point[]) {
    this.geometry = new BufferGeometry();
  }

  public generateGeometry() {
    let cubeindex = 0;
    for (let i = 0; i < 8; i++) {
      if (this.corners[i].on) {
        cubeindex |= 1 << i;
      }
    }

    if (cubeindex > 0) 
        console.log(`Cube at ${this.position.toArray()} with cubeindex ${cubeindex}`);

    const edgeIndexes = triTable[cubeindex]


    const mp = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => [
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        (z1 + z2) / 2,
    ]    

    const c = cubeCorners

    const v = (n: number) => {
        const [cx, cy, cz] = c[n]
        return [
            cx + this.position.x,
            cy + this.position.y,
            cz + this.position.z,
        ] as const
    }

    const e = (en: number) => {
        const [epia, epib] = edgeEndpoints[en]
        const epa = v(epia)
        const epb = v(epib)
        return mp(...epa, ...epb)
    }

    const vertices: number[] = []
    let triangleCount = 0;

    for (let i = 0; i <= 16; i+=3) {

        const ea = edgeIndexes[i]
        const eb = edgeIndexes[i + 1]
        const ec = edgeIndexes[i + 2]

        if (ea === -1) break

        let va = e(ea);
        let vb = e(eb);
        let vc = e(ec);

        const calculateNormal = (va: number[], vb: number[], vc: number[]) => {
            const ab = new Vector3().subVectors(new Vector3(...vb), new Vector3(...va));
            const ac = new Vector3().subVectors(new Vector3(...vc), new Vector3(...va));
            return new Vector3().crossVectors(ab, ac).normalize();
        }
        
        // Inside the triangle generation loop:
        const normal = calculateNormal(va, vb, vc);
        const center = new Vector3().addVectors(new Vector3(...va), new Vector3(...vb)).add(new Vector3(...vc)).divideScalar(3);
        const direction = new Vector3().subVectors(center, this.position);
        
        if (normal.dot(direction) < 0) {
            // Reverse the winding order
            [vb, vc] = [vc, vb];
        }        
        
        // Add a small offset based on the triangle count
        const offset = triangleCount * 0.0;
        vertices.push(
            ...va.map(v => v + offset),
            ...vb.map(v => v + offset),
            ...vc.map(v => v + offset)
        );
        
        triangleCount++;
    }

    console.log(`Generated ${triangleCount} triangles.`)

    this.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.geometry.computeVertexNormals();
    return this.geometry
  }
}