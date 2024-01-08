import { useEffect, useRef } from "react";
import { getStore, useStore } from "../stores/store";
import { Color3 } from "babylonjs";

export const CursorManager = () => {
  const [scene, canvas, highlightLayer] = useStore((s) => [
    s.scene,
    s.canvas,
    s.highlightLayer,
  ]);
  const hoveredMeshRef = useRef(null);

  useEffect(() => {
    if (!scene || !canvas || !highlightLayer) return;

    scene.onPointerMove = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        canvas.style.cursor = "pointer";

        if (hoveredMeshRef.current !== pickResult.pickedMesh) {
          if (hoveredMeshRef.current && !hoveredMeshRef.current.selected) {
            // Remove the previous mesh from the highlight layer if it's not a selected mesh
            highlightLayer.removeMesh(hoveredMeshRef.current);
          }

          if (
            !pickResult.pickedMesh.isEditorMesh &&
            !pickResult.pickedMesh.selected &&
            pickResult.pickedMesh.selectable
          ) {
            // Add the new mesh to the highlight layer
            highlightLayer.addMesh(pickResult.pickedMesh, Color3.White());
            hoveredMeshRef.current = pickResult.pickedMesh;
          }
        }
      } else {
        canvas.style.cursor = "default";

        if (hoveredMeshRef.current && !hoveredMeshRef.current.selected) {
          // Remove the mesh from the highlight layer when not hovering over it if it's not a selected mesh
          highlightLayer.removeMesh(hoveredMeshRef.current);
          hoveredMeshRef.current = null;
        }
      }
    };

    return () => {
      if (hoveredMeshRef.current) {
        // Ensure to clean up on unmount
        highlightLayer.removeMesh(hoveredMeshRef.current);
      }
      scene.onPointerMove = null;
      canvas.style.cursor = "default";
    };
  }, [scene, canvas, highlightLayer]);

  return null;
};
