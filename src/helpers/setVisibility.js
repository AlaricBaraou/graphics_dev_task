/**
 * Sets the visibility of a mesh and all its child meshes.
 * @param {Mesh} mesh - The mesh to change the visibility of.
 * @param {boolean} isVisible - The visibility state to set.
 */
export function setVisibility(mesh, isVisible) {
  if (!mesh) {
    console.warn("setVisibility called with invalid mesh.");
    return;
  }

  mesh.isVisible = isVisible;

  // Recursively set visibility for all child meshes
  mesh.getChildMeshes?.().forEach((child) => setVisibility(child, isVisible));
}
