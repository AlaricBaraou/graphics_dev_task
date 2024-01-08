import { getStore, useStore } from "../../stores/store";

/**
 * Renders a list of all mesh items.
 */
export const MeshList = () => {
  const allMeshes = useStore((s) => s.allMeshes);

  return (
    <ul id="itemlist">
      {Object.entries(allMeshes).map(([id]) => (
        <MeshItem key={id} meshId={id} />
      ))}
    </ul>
  );
};

/**
 * Represents a single mesh item in the list.
 * @param {object} props - Component props.
 * @param {string} props.meshId - ID of the mesh.
 * @param {object} props.mesh - Mesh object with details.
 */
const MeshItem = ({ meshId }) => {
  const mesh = useStore((s) => s.allMeshes[meshId]);
  const toggleSelect = () => {
    const { setSelected } = getStore();
    setSelected(meshId, !mesh.selected);
  };

  return (
    <li className={mesh.selected ? "selected" : ""} onClick={toggleSelect}>
      {mesh.name}
    </li>
  );
};
