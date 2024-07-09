import { Vector3, BufferGeometry } from "three";
import { Cube } from "./Cube";
import { cubeCorners } from './lookup'

export type Point = {
    on: boolean
}

export class Volume {
  public cubeGrid: Cube[] = [];
  private points: Point[][][] = [];

  constructor(public size: number, public position: Vector3) {
    this.initializePoints();
    this.generateGrid();
  }

  private initializePoints(): void {
    this.points = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () =>
        Array.from({ length: this.size }, () => ({ on: false } as Point))
      )
    );
  }

  private generateGrid(): void {
    for (let z = 0; z < this.size - 1; z++) {
      for (let y = 0; y < this.size - 1; y++) {
        for (let x = 0; x < this.size - 1; x++) {
          const cubePosition = new Vector3(x, y, z);
          const corners = this.getActiveCorners(x, y, z)
          this.cubeGrid.push(new Cube(cubePosition, 1, corners));
        }
      }
    }
  }
  

  public updatePoints(newPoints: boolean[][][]) {
    for (let z = 0; z < this.size; z++) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            this.points[x][y][z].on = newPoints[x][y][z]
        }
      }
    }

    const geoms = this.getGeometries()

    console.log(`Generated ${geoms.length} geoms`)

    return geoms
  }


  private getActiveCorners(x: number, y: number, z: number): Point[] {
    return cubeCorners.map(([x2, y2, z2]) => this.points[x + x2][y + y2][z + z2])
  }

  public getGeometries(): BufferGeometry[] {
    return this.cubeGrid
      .map(cube => cube.generateGeometry())
      .filter(geometry => {
        const position = geometry.getAttribute('position');
        return position && position.count > 0;
      });
  }
}