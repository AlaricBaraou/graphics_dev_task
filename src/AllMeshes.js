import { SingleMesh } from "./SingleMesh";
import { useStore } from "./stores/store";

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
