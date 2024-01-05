import { Color3 } from "babylonjs";
import { create } from "zustand";

const useStoreImpl = create((set, get) => {
  return {
    scene: null,
    canvas: null,
    allMeshes: {},
    highlightLayer: null,
    currentSelected: null,
    minCylinderDiameter: 0.1,
    maxCylinderDiameter: 2,
    minCylinderHeight: 0.1,
    maxCylinderHeight: 2,
    minCubeHeight: 0.1,
    maxCubeHeight: 2,
    minCubeWidth: 0.1,
    maxCubeWidth: 2,
    minCubeDepth: 0.1,
    maxCubeDepth: 2,
    storeMesh: (mesh) => {
      const { allMeshes } = get();
      allMeshes[mesh.id] = mesh;
      set({
        allMeshes: { ...allMeshes },
      });
    },
    setSelected: (id, isSelected) => {
      const { allMeshes, highlightLayer } = get();
      if (allMeshes[id]) {
        if (isSelected) {
          //unselect all others
          highlightLayer.removeAllMeshes();
          for (const meshId in allMeshes) {
            allMeshes[meshId] = {
              ...allMeshes[meshId],
              selected: false,
            };
          }
        }

        allMeshes[id] = {
          ...allMeshes[id],
          selected: isSelected,
        };
        highlightLayer.addMesh(allMeshes[id].mesh, Color3.White());

        set({
          allMeshes,
          currentSelected: allMeshes[id],
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
