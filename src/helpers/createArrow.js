import { MeshBuilder, Mesh, StandardMaterial } from "babylonjs";

export function createArrow(scene, arrowMaterial, rotation, height, position) {
  // Create a parent group
  const group = new Mesh("group", scene);

  const transparentMaterial = new StandardMaterial(
    "transparentMaterial",
    scene
  );
  transparentMaterial.alpha = 0;

  const ctrlArrowShaft = MeshBuilder.CreateCylinder(
    "ctrlShaft",
    { diameter: 0.05, height: height },
    scene
  );
  ctrlArrowShaft.material = transparentMaterial;
  const arrowShaft = MeshBuilder.CreateCylinder(
    "shaft",
    { diameter: 0.05, height: height },
    scene
  );
  arrowShaft.position.y = position;
  ctrlArrowShaft.position.y = position;
  arrowShaft.material = arrowMaterial;

  // Create the top Blue Arrow Tip
  const arrowTipTop = MeshBuilder.CreateCylinder(
    "tip",
    { diameterTop: 0, diameterBottom: 0.1, height: 0.2 },
    scene
  );
  arrowTipTop.position.y = height; // Position at the top of the shaft
  arrowTipTop.material = arrowMaterial;

  //render the arrow on top
  arrowShaft.renderingGroupId = 1;
  ctrlArrowShaft.renderingGroupId = 1;
  arrowTipTop.renderingGroupId = 1;

  arrowShaft.isEditorMesh = true;
  ctrlArrowShaft.isEditorMesh = true;
  arrowTipTop.isEditorMesh = true;

  /* for onPointerMove event */
  arrowShaft.enablePointerMoveEvents = true;
  ctrlArrowShaft.enablePointerMoveEvents = true;
  arrowTipTop.enablePointerMoveEvents = true;

  arrowShaft.parent = group;
  ctrlArrowShaft.parent = group;
  arrowTipTop.parent = group;

  group.rotation.copyFrom(rotation);

  return [arrowShaft, ctrlArrowShaft, arrowTipTop, group];
}
