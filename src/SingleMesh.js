import { useEffect } from "react";
import { Color3, MeshBuilder, Quaternion } from "babylonjs";
import { getStore, useStore } from "./stores/store";

const typeToMethod = {
  cube: "CreateBox",
  icosphere: "CreateIcoSphere",
  cylinder: "CreateCylinder",
};

export const SingleMesh = ({ meshId }) => {
  const updateMesh = useStore((s) => s.updateMesh);
  const scene = useStore((s) => s.scene);
  const meshParams = useStore((s) => s.allMeshes[meshId]);
  const isSelected = useStore((s) => s.allMeshes[meshId].selected);

  useEffect(() => {
    const mesh = MeshBuilder[typeToMethod[meshParams.type]](
      meshParams.id,
      {},
      scene
    );
    mesh.name = meshParams.name;

    if (meshParams.rotation) {
      mesh.rotationQuaternion = Quaternion.FromEulerAngles(
        meshParams.rotation[0],
        meshParams.rotation[1],
        meshParams.rotation[2]
      );
    }

    if (meshParams.position) {
      mesh.position.fromArray(meshParams.position);
    }

    mesh.type = meshParams.type;

    updateMesh(meshParams.id, {
      mesh: mesh,
    });

    return () => {
      mesh.dispose();
    };
  }, []);

  useEffect(() => {
    console.log(meshParams.name, isSelected);
    if (!isSelected) return;
    const { highlightLayer } = getStore();

    highlightLayer.addMesh(meshParams.mesh, Color3.White());

    return () => {
      console.log("remove mesh");
      highlightLayer.removeMesh(meshParams.mesh);
    };
  }, [isSelected]);

  return null;
};
