import { Color3 } from "babylonjs";
import { create } from "zustand";

const useStoreImpl = create((set, get) => {
  return {
    scene: null,
    canvas: null,
    allMeshes: {
      demoCube: {
        id: "demoCube",
        name: "Cube",
        type: "cube",
        rotation: [0, Math.PI, 0],
        parameters: {
          width: 1,
          height: 1,
          depth: 1,
        },
      },
      demoIcosphere: {
        id: "demoIcosphere",
        name: "IcoSphere",
        type: "icosphere",
        position: [-2, 0, 0],
        parameters: {
          radius: 1,
          subdivisions: 4,
        },
      },
      demoCylinder: {
        id: "demoCylinder",
        name: "Cylinder",
        type: "cylinder",
        position: [2, 0, 0],
        parameters: {
          diameter: 1,
          height: 2,
        },
      },
    },
    highlightLayer: null,
    currentSelectedId: null,

    minCylinderDiameter: 0.1,
    maxCylinderDiameter: 2,
    minCylinderHeight: 0.1,
    maxCylinderHeight: 2,
    minIcoSphereDiameter: 0.1,
    maxIcoSphereDiameter: 2,
    minIcoSphereSubdivision: 1,
    maxIcoSphereSubdivision: 10,
    minCubeHeight: 0.1,
    maxCubeHeight: 2,
    minCubeWidth: 0.1,
    maxCubeWidth: 2,
    minCubeDepth: 0.1,
    maxCubeDepth: 2,
    updateMesh: (meshId, props) => {
      const { allMeshes } = get();
      allMeshes[meshId] = Object.assign({}, allMeshes[meshId], props);
      set({
        allMeshes,
      });
    },
    addMesh: (mesh) => {
      const { allMeshes } = get();
      allMeshes[mesh.id] = mesh;
      set({
        allMeshes: { ...allMeshes },
      });
    },
    setSelected: (id, isSelected) => {
      const { allMeshes, updateMesh } = get();
      if (allMeshes[id]) {
        if (isSelected) {
          //unselect all others
          for (const meshId in allMeshes) {
            if (allMeshes[meshId].selected) {
              updateMesh(meshId, {
                selected: false,
              });
            }
          }
        }

        updateMesh(id, {
          selected: isSelected,
        });

        set({
          allMeshes,
          currentSelectedId: id,
        });
      } else {
        console.warn("mesh " + id + " not found");
      }
    },
  };
});

const useStore = (sel) => useStoreImpl(sel);
Object.assign(useStore, useStoreImpl);

const { getState: getStore, setState: setStore } = useStoreImpl;

export { getStore, setStore, useStore };
