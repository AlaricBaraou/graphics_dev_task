import { SingleMesh } from "./SingleMesh.jsx";
import { useStore } from "../stores/store";

/**
 * Renders all meshes in the scene as a list of SingleMesh components.
 */
export const AllMeshes = () => {
  const scene = useStore((s) => s.scene);
  const allMeshes = useStore((s) => s.allMeshes);

  return (
    <ul>
      {scene &&
        Object.entries(allMeshes).map(([id, mesh]) => (
          <SingleMesh key={id} meshId={id} />
        ))}
    </ul>
  );
};
