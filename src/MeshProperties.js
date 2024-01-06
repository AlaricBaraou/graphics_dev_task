import { useEffect } from "react";
import { getStore, useStore } from "./stores/store";
import * as dat from "dat.gui";

export const MeshProperties = () => {
  const allMeshes = useStore((s) => s.allMeshes);
  const currentSelected = useStore((s) => s.currentSelected);

  useEffect(() => {
    if (!currentSelected) return;
    const gui = new dat.GUI();

    const mesh = currentSelected.mesh;
    if (mesh) {
      const folderPos = gui.addFolder("position");
      const folderRot = gui.addFolder("rotation");
      const folderScale = gui.addFolder("scaling");

      const guiControllers = {
        position: {
          folder: folderPos,
          x: folderPos.add(mesh.position, "x", -4, 4),
          y: folderPos.add(mesh.position, "y", -4, 4),
          z: folderPos.add(mesh.position, "z", -4, 4),
        },
        rotation: {
          folder: folderRot,
          x: folderRot.add(mesh.position, "x", -Math.PI, Math.PI),
          y: folderRot.add(mesh.position, "y", -Math.PI, Math.PI),
          z: folderRot.add(mesh.position, "z", -Math.PI, Math.PI),
        },
        scaling: {
          folder: folderScale,
          x: folderScale.add(mesh.scaling, "x", 0.1, 2),
          y: folderScale.add(mesh.scaling, "y", 0.1, 2),
          z: folderScale.add(mesh.scaling, "z", 0.1, 2),
        },
      };

      mesh.onPropertyChanged = (property, subProperty, newValue) => {
        if (guiControllers[property] && guiControllers[property][subProperty]) {
          guiControllers[property].folder.open();
          guiControllers[property][subProperty].setValue(newValue);
        }
      };
    }

    return () => {
      gui.destroy(); // Clean up GUI when component unmounts
    };
  }, [currentSelected]);

  return <ul></ul>;
};
