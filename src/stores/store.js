import { create } from "zustand";

// Creates a store using Zustand for managing the state of 3D objects and scene settings.
const useStoreImpl = create((set, get) => {
  return {
    // Scene objects
    scene: null,
    canvas: null,
    highlightLayer: null,
    shadowGenerator: null,

    // Meshes with properties
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
        selectable: true,
        castShadow: true,
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
        selectable: true,
        castShadow: true,
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
        selectable: true,
        castShadow: true,
      },
      demoPlane: {
        id: "demoPlane",
        name: "Plane",
        type: "plane",
        position: [0, -1, 0],
        rotation: [Math.PI / 2, 0, 0],
        parameters: {
          width: 10,
          height: 10,
        },
        selectable: false,
        castShadow: false,
      },
    },

    // Current selected mesh ID
    currentSelectedId: null,

    // Min and max values for different meshes' properties
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

    /**
     * Updates a mesh with new properties.
     * @param {string} meshId - The ID of the mesh to update.
     * @param {object} props - New properties to be assigned to the mesh.
     */
    updateMesh: (meshId, props) => {
      const { allMeshes } = get();
      allMeshes[meshId] = Object.assign({}, allMeshes[meshId], props);
      set({
        allMeshes,
      });
    },
    /**
     * Adds a new mesh to the store.
     * @param {object} mesh - Mesh object to add.
     */
    addMesh: (mesh) => {
      const { allMeshes } = get();
      allMeshes[mesh.id] = mesh;
      set({
        allMeshes: { ...allMeshes },
      });
    },
    /**
     * Sets the selected state for a mesh.
     * @param {string} id - The ID of the mesh to select or deselect.
     * @param {boolean} isSelected - The selected state to set.
     */
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
