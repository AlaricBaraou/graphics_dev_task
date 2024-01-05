import { getStore, useStore } from "./stores/store";

export const MeshList = () => {
  const allMeshes = useStore((s) => s.allMeshes);

  return (
    <ul>
      {allMeshes &&
        Object.entries(allMeshes).map(([id, mesh]) => (
          <MeshItem key={id} meshId={id}></MeshItem>
        ))}
    </ul>
  );
};

const MeshItem = ({ meshId }) => {
  const mesh = useStore((s) => s.allMeshes[meshId]);

  return (
    <li
      className={mesh.selected ? "selected" : ""}
      onClick={() => {
        const { setSelected } = getStore();
        setSelected(meshId, !Boolean(mesh.selected));
      }}
    >
      {mesh.name}
    </li>
  );
};
