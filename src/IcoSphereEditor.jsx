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
import { getStore, setStore, useStore } from "./stores/store";
import { createArrow } from "./createArrow";
import { setVisibility } from "./setVisibility";

/* @ts-ignore */
function updateIcoSphereEditor(icosphereEditor, currentSelectedMesh) {
  const {
    ring,
    ctrlRing,
    arrowShaft,
    ctrlArrowShaft,
    arrowTipTop,
    arrowTipBot,
    group,
  } = icosphereEditor;

  // Get the bounding box of the icosphere
  currentSelectedMesh.computeWorldMatrix(true);
  const boundingInfo = currentSelectedMesh.getBoundingInfo();
  const boundingBox = boundingInfo.boundingBox;

  // Calculate the full diameter
  const icosphereDiameter =
    2 * Math.max(boundingBox.extendSizeWorld.x, boundingBox.extendSizeWorld.z);
  // Calculate the full height
  const icosphereHeight = 2 * boundingBox.extendSizeWorld.y;

  // Calculate scaling factors (10% bigger)
  const ringScaleFactor = 1.1 * icosphereDiameter;
  const arrowScaleFactor =
    (1.1 * icosphereHeight) / (arrowShaft.scaling.y + arrowTipTop.scaling.y);

  // Scale the ring and arrow
  ring.scaling.set(ringScaleFactor, ringScaleFactor, ringScaleFactor);
  ctrlRing.scaling.copyFrom(ring.scaling);

  arrowShaft.scaling.y *= arrowScaleFactor;
  arrowTipTop.scaling.y *= arrowScaleFactor;
  arrowTipBot.scaling.y *= arrowScaleFactor;

  ctrlArrowShaft.scaling.copyFrom(arrowShaft.scaling);

  // Adjust arrow tip position
  arrowTipTop.position.y = (arrowShaft.scaling.y + arrowTipTop.scaling.y) / 2;
  arrowTipBot.position.y = (-arrowShaft.scaling.y - arrowTipBot.scaling.y) / 2;

  // Move the ring and arrow to the position of the icosphere
  group.position.copyFrom(currentSelectedMesh.position);
}

export const IcoSphereEditor = () => {
  const [
    scene,
    canvas,
    currentSelected,
    currentSelectedId,
    icosphereEditor,
    minIcoSphereDiameter,
    maxIcoSphereDiameter,
    minIcoSphereSubdivision,
    maxIcoSphereSubdivision,
  ] = useStore((s) => [
    s.scene,
    s.canvas,
    s.allMeshes[s.currentSelectedId],
    s.currentSelectedId,
    s.icosphereEditor,
    s.minIcoSphereDiameter,
    s.maxIcoSphereDiameter,
    s.minIcoSphereSubdivision,
    s.maxIcoSphereSubdivision,
  ]);

  useEffect(() => {
    if (!scene || !canvas) return;

    // Create a parent group
    const group = new Mesh("group", scene);

    // Create the Red Ring
    const ctrlRing = MeshBuilder.CreateTorus(
      "ctrlRing",
      { diameter: 1, thickness: 0.05, tessellation: 30 },
      scene
    );
    const ring = MeshBuilder.CreateTorus(
      "ring",
      { diameter: 1, thickness: 0.05, tessellation: 30 },
      scene
    );
    const ringMaterial = new StandardMaterial("ringMaterial", scene);
    ringMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
    ring.material = ringMaterial;
    const ctrlRingMaterial = new StandardMaterial("ctrlRingMaterial", scene);
    ctrlRingMaterial.diffuseColor = new Color3(0, 0, 1); // Red color
    ctrlRing.material = ctrlRingMaterial;

    // Create the Blue Arrow Shaft
    const arrowMaterial = new StandardMaterial("arrowMaterial", scene);
    arrowMaterial.diffuseColor = new Color3(0, 0, 1);
    const [arrowShaft, ctrlArrowShaft, arrowTipTop, arrowGroup] = createArrow(
      scene,
      arrowMaterial,
      new Vector3(Math.PI / 2, 0, 0),
      2,
      0
    );
    const arrowTipBot = arrowTipTop.clone();
    arrowTipBot.rotation.set(-Math.PI, 0, 0);

    //render the arrow on top
    arrowShaft.renderingGroupId = 1;
    ctrlArrowShaft.renderingGroupId = 1;
    arrowTipTop.renderingGroupId = 1;
    arrowTipBot.renderingGroupId = 1;

    // Set the group as the parent of the ring, shaft, and tip
    ring.parent = group;
    ctrlRing.parent = group;
    arrowShaft.parent = group;
    ctrlArrowShaft.parent = group;
    arrowTipTop.parent = group;
    arrowTipBot.parent = group;

    ring.isEditorMesh = true;
    ctrlRing.isEditorMesh = true;
    arrowShaft.isEditorMesh = true;
    ctrlArrowShaft.isEditorMesh = true;
    arrowTipTop.isEditorMesh = true;
    arrowTipBot.isEditorMesh = true;

    /* for onPointerMove event */
    ring.enablePointerMoveEvents = true;
    ctrlRing.enablePointerMoveEvents = true;
    arrowShaft.enablePointerMoveEvents = true;
    ctrlArrowShaft.enablePointerMoveEvents = true;
    arrowTipTop.enablePointerMoveEvents = true;
    arrowTipBot.enablePointerMoveEvents = true;

    const transparentMaterial = new StandardMaterial(
      "transparentMaterial",
      scene
    );
    transparentMaterial.alpha = 0;
    ctrlArrowShaft.material = transparentMaterial;
    ctrlRing.material = transparentMaterial;

    setVisibility(group, false);

    setStore({
      icosphereEditor: {
        group,
        ring,
        ctrlRing,
        arrowShaft,
        ctrlArrowShaft,
        arrowTipTop,
        arrowTipBot,
      },
    });

    return () => {
      // Dispose of the meshes and materials
      ring.dispose();
      ctrlRing.dispose();
      arrowShaft.dispose();
      ctrlArrowShaft.dispose();
      arrowTipTop.dispose();
      arrowTipBot.dispose();
      ringMaterial.dispose();
      arrowMaterial.dispose();
      setStore({
        icosphereEditor: null,
      });
    };
  }, [scene, canvas]);

  useEffect(() => {
    if (!currentSelected || !icosphereEditor) return;

    const isIcoSphere = currentSelected.type === "icosphere"; // Example condition
    const currentSelectedMesh = currentSelected.mesh;
    if (isIcoSphere) {
      setVisibility(icosphereEditor.group, true);
      updateIcoSphereEditor(icosphereEditor, currentSelectedMesh);
    } else {
      setVisibility(icosphereEditor.group, false);
    }

    //check if currentSelectedMesh (babylon Mesh) has been created from CreateIcoSphere
    //if so, move the above ring and arrow on the position of that mesh
  }, [currentSelectedId, icosphereEditor]);

  /* adjust diameter */
  useEffect(() => {
    if (!scene || !icosphereEditor || !currentSelected) return;
    const currentSelectedMesh = currentSelected.mesh;
    const { ctrlRing } = icosphereEditor;

    // Initialize the drag behavior
    const pointerDragBehavior = new PointerDragBehavior({
      dragAxis: new Vector3(1, 0, 0),
    });

    // Attach drag behavior to the ring
    ctrlRing.addBehavior(pointerDragBehavior);

    // Variables to store initial positions and scaling
    let initialPointerX = 0;
    let initialScale = 0;
    let ringCenterX = 0;

    // On drag start
    pointerDragBehavior.onDragStartObservable.add((event) => {
      initialPointerX = event.dragPlanePoint.x;
      initialScale = ctrlRing.scaling.x; // Store the initial scale of the ring

      // Get the absolute world position of the ctrlRing mesh
      const ringWorldPosition = ctrlRing.getAbsolutePosition();
      // Use the X-coordinate of the world position
      ringCenterX = ringWorldPosition.x;
    });

    // On drag
    pointerDragBehavior.onDragObservable.add((event) => {
      const currentPointerX = event.dragPlanePoint.x;
      let dragDistance = Math.abs(currentPointerX - initialPointerX);

      // Check if dragging is toward or away from the center
      const isDraggingTowardCenter =
        (initialPointerX > ringCenterX && currentPointerX < initialPointerX) ||
        (initialPointerX < ringCenterX && currentPointerX > initialPointerX);
      if (isDraggingTowardCenter) {
        dragDistance *= -1;
      } else {
        dragDistance *= 1;
      }

      // Calculate the new scale based on drag distance
      const newDiameter = Math.min(
        Math.max(initialScale + dragDistance, minIcoSphereDiameter),
        maxIcoSphereDiameter
      ); // Prevent negative scaling

      currentSelectedMesh.onPropertyChanged("radius", null, newDiameter);

      const { allMeshes } = getStore();
      updateIcoSphereEditor(icosphereEditor, allMeshes[currentSelectedId].mesh);
    });

    pointerDragBehavior.onDragEndObservable.add((event) => {
      const { ctrlRing } = icosphereEditor;
      ctrlRing.position.set(0, 0, 0);
    });

    // Cleanup
    return () => {
      ctrlRing.removeBehavior(pointerDragBehavior);
    };
  }, [
    scene,
    icosphereEditor,
    currentSelectedId,
    minIcoSphereDiameter,
    maxIcoSphereDiameter,
  ]);

  /* adjust height */
  useEffect(() => {
    if (!scene || !icosphereEditor || !currentSelected) return;
    const currentSelectedMesh = currentSelected.mesh;
    const { ctrlArrowShaft } = icosphereEditor;

    // Initialize the drag behavior
    const pointerDragBehavior = new PointerDragBehavior({
      dragAxis: new Vector3(0, 1, 0),
    });

    // Attach drag behavior to the ring
    ctrlArrowShaft.addBehavior(pointerDragBehavior);

    // Variables to store initial positions and scaling
    let initialPointerY = 0;
    let initialScale = 0;
    let arrowCenterY = 0;

    // On drag start
    pointerDragBehavior.onDragStartObservable.add((event) => {
      initialPointerY = event.dragPlanePoint.y;
      initialScale = ctrlArrowShaft.scaling.y; // Store the initial scale of the ring

      const ringWorldPosition = ctrlArrowShaft.getAbsolutePosition();
      // Use the X-coordinate of the world position
      arrowCenterY = ringWorldPosition.y;
    });

    // On drag
    pointerDragBehavior.onDragObservable.add((event) => {
      const currentPointerY = event.dragPlanePoint.y;
      let dragDistance = Math.abs(currentPointerY - initialPointerY);

      // Check if dragging is toward or away from the center
      const isDraggingTowardCenter =
        (initialPointerY > arrowCenterY && currentPointerY < initialPointerY) ||
        (initialPointerY < arrowCenterY && currentPointerY > initialPointerY);
      if (isDraggingTowardCenter) {
        dragDistance *= -1;
      } else {
        dragDistance *= 1;
      }

      // Calculate the new scale based on drag distance
      const newSubdivision = Math.min(
        Math.max(
          Math.round(initialScale + dragDistance * 5),
          minIcoSphereSubdivision
        ),
        maxIcoSphereSubdivision
      ); // Prevent negative scaling

      // Optionally, update the icosphere's diameter as well
      currentSelectedMesh.scaling.y = newSubdivision;

      currentSelectedMesh.onPropertyChanged(
        "subdivisions",
        null,
        newSubdivision
      );

      const { allMeshes } = getStore();
      updateIcoSphereEditor(icosphereEditor, allMeshes[currentSelectedId].mesh);
    });

    pointerDragBehavior.onDragEndObservable.add((event) => {
      const { ctrlArrowShaft } = icosphereEditor;
      ctrlArrowShaft.position.set(0, 0, 0);
    });

    //implement custom pointer logic to trigger startDrag since it's located inside the icosphere
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
  }, [
    scene,
    icosphereEditor,
    currentSelectedId,
    minIcoSphereSubdivision,
    maxIcoSphereSubdivision,
  ]);

  return null;
};
