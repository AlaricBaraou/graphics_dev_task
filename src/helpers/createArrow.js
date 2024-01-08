import { MeshBuilder, Mesh, StandardMaterial } from "babylonjs";

/**
 * Creates an arrow mesh with control features for editing in BabylonJS.
 * @param {Scene} scene - The BabylonJS scene.
 * @param {StandardMaterial} arrowMaterial - The material to apply to the arrow.
 * @param {Vector3} rotation - The rotation of the arrow.
 * @param {number} height - The height of the arrow shaft.
 * @param {number} position - The position of the arrow shaft.
 * @returns {[Mesh, Mesh, Mesh, Mesh]} - The arrow shaft, control shaft, arrow tip, and the group they belong to.
 */
export function createArrow(scene, arrowMaterial, rotation, height, position) {
  // Create a parent group
  const group = new Mesh("group", scene);

  const ctrlArrowShaft = MeshBuilder.CreateCylinder(
    "ctrlShaft",
    { diameter: 0.05, height: height },
    scene
  );
  ctrlArrowShaft.visibility = 0;
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
