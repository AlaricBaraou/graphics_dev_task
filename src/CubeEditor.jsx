import { useEffect } from "react";
import {
  Color3,
  StandardMaterial,
  MeshBuilder,
  Mesh,
  Vector3,
  PointerDragBehavior,
  Matrix,
} from "babylonjs";
import { setStore, useStore } from "./stores/store";
import { createArrow } from "./createArrow";
import { setVisibility } from "./setVisibility";
import { IndexType } from "typescript";

/* @ts-ignore */
function updateCubeEditor(cubeEditor, currentSelectedMesh) {
  const {
    ring,
    ctrlRing,
    heightArrowShaft,
    heightCtrlArrowShaft,
    arrowTipTop,
    group,
    heightArrowGroup,
  } = cubeEditor;

  // Get the bounding box of the cube
  currentSelectedMesh.computeWorldMatrix(true);
  const boundingInfo = currentSelectedMesh.getBoundingInfo();
  const boundingBox = boundingInfo.boundingBox;

  // Calculate the full height
  const cubeHeight = 2 * boundingBox.extendSizeWorld.y;
  console.log("cubeHeight", cubeHeight);

  // Calculate scaling factors (10% bigger)
  const arrowScaleFactor = (1.1 * cubeHeight) / heightArrowGroup.scaling.y;
  console.log("arrowScaleFactor", arrowScaleFactor);

  // Scale the arrows
  heightArrowGroup.scaling.y *= arrowScaleFactor;

  // Move the ring and arrow to the position of the cube
  group.position.copyFrom(currentSelectedMesh.position);
}

const localAxisDrag = new Vector3(0, 1, 0);
const axisCtrlArrowShift = {
  x: "widthCtrlArrowShaft",
  y: "heightCtrlArrowShaft",
  z: "depthCtrlArrowShaft",
};
const useUpdateAxis = (
  scene,
  cubeEditor,
  currentSelected,
  currentSelectedId,
  min,
  max,
  axis
) => {
  /* adjust height */
  useEffect(() => {
    if (!scene || !cubeEditor || !currentSelected) return;
    const currentSelectedMesh = currentSelected.mesh;
    const ctrlArrowShaft = cubeEditor[axisCtrlArrowShift[axis]];

    // Initialize the drag behavior
    const pointerDragBehavior = new PointerDragBehavior({
      dragAxis: localAxisDrag,
    });

    // Attach drag behavior to the ring
    ctrlArrowShaft.addBehavior(pointerDragBehavior);

    // Variables to store initial positions and scaling
    let initialPointer = 0;
    let initialScale = 0;

    // On drag start
    pointerDragBehavior.onDragStartObservable.add((event) => {
      initialPointer = event.dragPlanePoint[axis];
      initialScale = ctrlArrowShaft.scaling[axis]; // Store the initial scale of the ring
    });

    // On drag
    pointerDragBehavior.onDragObservable.add((event) => {
      const currentPointer = event.dragPlanePoint[axis];
      let dragDistance = Math.abs(currentPointer - initialPointer);

      // Check if dragging is toward or away from the center

      const isDraggingTowardCenter = currentPointer - currentPointer > 0;
      if (isDraggingTowardCenter) {
        dragDistance *= -1;
      } else {
        dragDistance *= 1;
      }

      // Calculate the new scale based on drag distance
      const newScale = Math.min(
        Math.max(initialScale + dragDistance, min),
        max
      ); // Prevent negative scaling

      currentSelectedMesh.scaling[axis] = newScale;

      currentSelectedMesh.onPropertyChanged("scaling", axis, newScale);

      updateCubeEditor(cubeEditor, currentSelectedMesh);
    });

    pointerDragBehavior.onDragEndObservable.add((event) => {
      const ctrlArrowShaft = cubeEditor[axisCtrlArrowShift[axis]];
      ctrlArrowShaft.position.set(0, 0.25, 0);
    });

    //implement custom pointer logic to trigger startDrag since it's located inside the cube
    const onPointerDown = (evt) => {
      const pickRay = scene.createPickingRay(
        scene.pointerX,
        scene.pointerY,
        Matrix.Identity(),
        scene.activeCamera
      );
      const allHits = scene.multiPickWithRay(pickRay);

      let ctrlArrowShaftIsHit = false;
      if (allHits) {
        for (let i = 0; i < allHits.length; i++) {
          if (allHits[i].pickedMesh === ctrlArrowShaft) {
            ctrlArrowShaftIsHit = true;
            break;
          }
        }
      }

      if (ctrlArrowShaftIsHit) {
        // ctrlArrowShaft is one of the meshes hit by the ray
        const pointerId = evt.pointerId;
        const startPickedPoint = allHits.find(
          (hit) => hit.pickedMesh === ctrlArrowShaft
        )?.pickedPoint;
        pointerDragBehavior.startDrag(pointerId, pickRay, startPickedPoint);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    // Cleanup
    return () => {
      ctrlArrowShaft.removeBehavior(pointerDragBehavior);
      scene.onPointerDown = null;
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [scene, cubeEditor, currentSelectedId, min, max]);

  return null;
};

export const CubeEditor = () => {
  const [
    scene,
    canvas,
    currentSelected,
    currentSelectedId,
    cubeEditor,
    minCubeWidth,
    maxCubeWidth,
    minCubeHeight,
    maxCubeHeight,
    minCubeDepth,
    maxCubeDepth,
  ] = useStore((s) => [
    s.scene,
    s.canvas,
    s.allMeshes[s.currentSelectedId],
    s.currentSelectedId,
    s.cubeEditor,
    s.minCubeWidth,
    s.maxCubeWidth,
    s.minCubeHeight,
    s.maxCubeHeight,
    s.minCubeDepth,
    s.maxCubeDepth,
  ]);

  useEffect(() => {
    if (!scene || !canvas) return;

    // Create a parent group
    const group = new Mesh("group", scene);

    const heightArrowMaterial = new StandardMaterial(
      "heightArrowMaterial",
      scene
    );
    heightArrowMaterial.diffuseColor = new Color3(0, 1, 0);
    const widthArrowMaterial = new StandardMaterial(
      "widthArrowMaterial",
      scene
    );
    widthArrowMaterial.diffuseColor = new Color3(0, 0, 1);
    const depthArrowMaterial = new StandardMaterial(
      "depthArrowMaterial",
      scene
    );
    depthArrowMaterial.diffuseColor = new Color3(1, 0, 0);

    const [
      heightArrowShaft,
      heightCtrlArrowShaft,
      heightArrowTipTop,
      heightArrowGroup,
    ] = createArrow(
      scene,
      heightArrowMaterial,
      new Vector3(0, Math.PI / 2, 0),
      0.5,
      0.25
    );
    const [
      widthArrowShaft,
      widthCtrlArrowShaft,
      widthArrowTipTop,
      widthArrowGroup,
    ] = createArrow(
      scene,
      widthArrowMaterial,
      new Vector3(0, 0, Math.PI / 2),
      0.5,
      0.25
    );
    const [
      depthArrowShaft,
      depthCtrlArrowShaft,
      depthArrowTipTop,
      depthArrowGroup,
    ] = createArrow(
      scene,
      depthArrowMaterial,
      new Vector3(Math.PI / 2, 0, 0),
      0.5,
      0.25
    );

    // Set the group as the parent of the ring, shaft, and tip
    heightArrowGroup.parent = group;
    widthArrowGroup.parent = group;
    depthArrowGroup.parent = group;

    setVisibility(group, false);

    setStore({
      cubeEditor: {
        group,
        heightArrowShaft,
        heightCtrlArrowShaft,
        heightArrowTipTop,
        widthArrowShaft,
        widthCtrlArrowShaft,
        widthArrowTipTop,
        depthArrowShaft,
        depthCtrlArrowShaft,
        depthArrowTipTop,
        heightArrowGroup,
        widthArrowGroup,
        depthArrowGroup,
      },
    });

    return () => {
      // Dispose of the meshes and materials
      heightArrowShaft.dispose();
      heightCtrlArrowShaft.dispose();
      heightArrowTipTop.dispose();
      widthArrowShaft.dispose();
      widthCtrlArrowShaft.dispose();
      widthArrowTipTop.dispose();
      depthArrowShaft.dispose();
      depthCtrlArrowShaft.dispose();
      depthArrowTipTop.dispose();
      heightArrowMaterial.dispose();
      widthArrowMaterial.dispose();
      depthArrowMaterial.dispose();
      setStore({
        cubeEditor: null,
      });
    };
  }, [scene, canvas]);

  useEffect(() => {
    if (!currentSelected || !cubeEditor) return;

    const isCube = currentSelected.type === "cube"; // Example condition
    const currentSelectedMesh = currentSelected.mesh;
    if (isCube) {
      setVisibility(cubeEditor.group, true);
      updateCubeEditor(cubeEditor, currentSelectedMesh);
    } else {
      setVisibility(cubeEditor.group, false);
    }

    //check if currentSelectedMesh (babylon Mesh) has been created from CreateCylinder
    //if so, move the above ring and arrow on the position of that mesh
  }, [currentSelectedId, cubeEditor]);

  useUpdateAxis(
    scene,
    cubeEditor,
    currentSelected,
    currentSelectedId,
    minCubeWidth,
    maxCubeWidth,
    "x"
  );
  useUpdateAxis(
    scene,
    cubeEditor,
    currentSelected,
    currentSelectedId,
    minCubeHeight,
    maxCubeHeight,
    "y"
  );
  useUpdateAxis(
    scene,
    cubeEditor,
    currentSelected,
    currentSelectedId,
    minCubeDepth,
    maxCubeDepth,
    "z"
  );

  return null;
};
