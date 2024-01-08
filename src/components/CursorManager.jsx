import { useEffect } from "react";
import { useStore } from "../stores/store";

export const CursorManager = () => {
  const [scene, canvas] = useStore((s) => [s.scene, s.canvas]);

  useEffect(() => {
    if (!scene || !canvas) return;

    /* quite expensive, better replace with a custom ray at custom interval */
    scene.onPointerMove = function (evt, pickResult) {
      // Check if the pointer is over the specific mesh
      if (pickResult.hit && pickResult.pickedMesh.isEditorMesh) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    };

    return () => {
      scene.onPointerMove = null;
      canvas.style.cursor = "default";
    };
  }, [scene, canvas]);

  return null;
};
