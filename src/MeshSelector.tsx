import { useEffect } from "react";
import { HighlightLayer, Mesh } from "babylonjs";
import { setStore, useStore } from "./stores/store";

export const MeshSelector = () => {
  /* @ts-ignore */
  const [scene, canvas, setSelected] = useStore((s) => [
    s.scene,
    s.canvas,
    s.setSelected,
  ]);

  useEffect(() => {
    if (!scene || !canvas) return;

    // Create a HighlightLayer for the outline effect on picked mesh
    const highlightLayer = new HighlightLayer("hl1", scene, {
      renderingGroupId: 0,
    });
    setStore({
      highlightLayer,
    });

    const doPick = () => {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);

      if (pickResult && pickResult.pickedMesh instanceof Mesh) {
        if (pickResult.pickedMesh.isEditorMesh) return;
        setSelected(pickResult.pickedMesh.id, true);
      } else {
        setSelected(null, false);
      }
    };
    canvas.addEventListener("pointerdown", doPick);

    return () => {
      canvas.removeEventListener("pointerdown", doPick);
      setStore({
        highlightLayer: null,
      });
    };
  }, [scene, canvas]);

  return null;
};
