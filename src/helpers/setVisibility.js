export function setVisibility(mesh, isVisible) {
  mesh.isVisible = isVisible;
  if (mesh.getChildMeshes) {
    mesh.getChildMeshes().forEach((child) => setVisibility(child, isVisible));
  }
}
