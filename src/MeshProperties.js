import { useEffect } from "react";
import { getStore, useStore } from "./stores/store";
import * as dat from "dat.gui";
import { applyBouncing } from "./applyBouncing";

const editorConfig = {
  cube: {
    label: "Cube parameters",
    fields: [
      { valueProp: "width", label: "width", min: 0.1, max: 2 },
      { valueProp: "height", label: "height", min: 0.1, max: 2 },
      { valueProp: "depth", label: "depth", min: 0.1, max: 2 },
    ],
  },
  cylinder: {
    label: "Cylinder parameters",
    fields: [
      { valueProp: "diameter", label: "diameter", min: 0.1, max: 2 },
      { valueProp: "height", label: "height", min: 0.1, max: 2 },
    ],
  },
  icosphere: {
    label: "IcoSphere parameters",
    fields: [
      {
        valueProp: "radius",
        label: "diameter",
        min: 0.1,
        max: 2,
        convertValue: (value) => value / 2,
      },
      {
        valueProp: "subdivisions",
        label: "subdivisions",
        min: 1,
        max: 10,
        step: 1,
      },
    ],
  },
};

export const MeshProperties = () => {
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

      if (editorConfig[mesh.type]) {
        const fieldParams = editorConfig[mesh.type];
        const folderOfParams = gui.addFolder(fieldParams.label);
        folderOfParams.open();
        guiControllers.folder = folderOfParams;

        for (let i = 0; i < fieldParams.fields.length; i++) {
          const field = fieldParams.fields[i];
          const guiField = folderOfParams.add(
            currentSelected.parameters,
            field.valueProp,
            field.min,
            field.max,
            field.step
          );

          guiField.name(field.label);

          guiField.onChange((v) => {
            let newVal = v;
            if (field.convertValue) {
              newVal = field.convertValue(v);
            }
            console.log("newVal", newVal);
            const { updateMesh } = getStore();
            updateMesh(currentSelected.id, {
              parameters: Object.assign({}, currentSelected.parameters, {
                [field.valueProp]: newVal,
              }),
            });
          });

          guiControllers[field.valueProp] = guiField;
        }
      }

      // Add animation button to the GUI

      // Define variables for the new fields
      let amplitude = 5; // Default amplitude value
      let duration = 2; // Default duration value
      let useDuration = true; // Default value for the boolean flag

      const folderAnimation = gui.addFolder("animation");
      folderAnimation.open();
      const buttonFunction = () => {
        applyBouncing(mesh, amplitude, duration, 0.9, -9.81, useDuration);
      };
      folderAnimation
        .add({ buttonFunction }, "buttonFunction")
        .name("Run Animation");

      // Add amplitude slider to the GUI
      folderAnimation
        .add({ amplitude: amplitude }, "amplitude", 0.2, 5)
        .onChange((value) => (amplitude = value))
        .name("Amplitude");

      // Add duration slider to the GUI
      folderAnimation
        .add({ duration: duration }, "duration", 1, 10)
        .onChange((value) => (duration = value))
        .name("Duration");

      // Add 'use duration' checkbox to the GUI
      folderAnimation
        .add({ useDuration: useDuration }, "useDuration")
        .onChange((value) => (useDuration = value))
        .name("Use Duration");

      mesh.onPropertyChanged = (property, subProperty, newValue) => {
        if (subProperty) {
          if (
            guiControllers[property] &&
            guiControllers[property][subProperty]
          ) {
            guiControllers[property].folder.open();
            guiControllers[property][subProperty].setValue(newValue);
          }
        } else {
          if (guiControllers[property]) {
            guiControllers.folder.open();
            guiControllers[property].setValue(newValue);
          }
        }
      };
    }

    return () => {
      gui.destroy(); // Clean up GUI when component unmounts
    };
  }, [currentSelected]);

  return <ul></ul>;
};
