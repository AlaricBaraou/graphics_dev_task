import { useEffect } from "react";
import { Color3, MeshBuilder, Quaternion } from "babylonjs";
import { getStore, useStore } from "./stores/store";

const typeToMethod = {
  cube: "CreateBox",
  icosphere: "CreateIcoSphere",
  cylinder: "CreateCylinder",
};

function simulateBounceFall() {}

export const SingleMesh = ({ meshId }) => {
  const updateMesh = useStore((s) => s.updateMesh);
  const scene = useStore((s) => s.scene);
  const meshParams = useStore((s) => s.allMeshes[meshId]);
  const isSelected = useStore((s) => s.allMeshes[meshId].selected);

  useEffect(() => {
    const mesh = MeshBuilder[typeToMethod[meshParams.type]](
      meshParams.id,
      meshParams.parameters,
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
  }, [meshParams.parameters]);

  useEffect(() => {
    if (!isSelected) return;
    const { highlightLayer } = getStore();

    highlightLayer.addMesh(meshParams.mesh, Color3.White());

    return () => {
      highlightLayer.removeMesh(meshParams.mesh);
    };
  }, [isSelected]);

  // simulation at runtime
  //   useEffect(() => {
  //     if (!isSelected) return;

  //     const mesh = meshParams.mesh;
  //     mesh.position.y = 5;

  //     const gravity = -9.81;
  //     const cor = 0.9;
  //     let ball_velocity = 0;
  //     let ball_position = mesh.getAbsolutePosition().y;
  //     const floor_height = 0;

  //     const updatePosition = (deltaTimeInSeconds) => {
  //       let ball_velocity_modifier = gravity * deltaTimeInSeconds;

  //       if (
  //         Math.sign(ball_velocity_modifier) !== Math.sign(ball_velocity) &&
  //         Math.abs(ball_velocity_modifier) > Math.abs(ball_velocity)
  //       ) {
  //         // Calculate the proportion of the frame before the direction change
  //         let proportionBeforeChange =
  //           Math.abs(ball_velocity) / Math.abs(ball_velocity_modifier);

  //         // Update the position for the portion of the frame before the direction change
  //         ball_position +=
  //           ball_velocity * proportionBeforeChange * deltaTimeInSeconds;

  //         // Update the velocity for the next portion of the frame
  //         ball_velocity += ball_velocity_modifier;

  //         // Calculate the proportion of the frame after the direction change
  //         let proportionAfterChange = 1 - proportionBeforeChange;

  //         // Update the position for the portion of the frame after the direction change
  //         ball_position +=
  //           ball_velocity * proportionAfterChange * deltaTimeInSeconds;
  //       } else {
  //         ball_velocity += ball_velocity_modifier;
  //         ball_position += ball_velocity * deltaTimeInSeconds;
  //       }

  //       // Check if the ball hits the floor
  //       if (ball_position <= floor_height) {
  //         // Calculate the proportion proportion of the frame spent inside the floor
  //         let pctToFloor = Math.abs(
  //           Math.abs(floor_height - ball_position) /
  //             Math.abs(ball_velocity * deltaTimeInSeconds)
  //         );

  //         // Update the position for the portion of the frame before hitting the floor
  //         ball_position = floor_height;

  //         //cancel the ball_velocity_modifier added to velocity relative to the portion passed after the bounce
  //         // otherwise it acts as a force in the opposite direction of the regular gravity
  //         ball_velocity -= ball_velocity_modifier * pctToFloor;

  //         // Reverse the velocity and apply the coefficient of restitution
  //         ball_velocity = -ball_velocity * cor;

  //         //add ball_velocity_modifier relative to the portion passed after the bounce
  //         ball_velocity += ball_velocity_modifier * pctToFloor;

  //         // Update the position for the portion of the frame after hitting the floor
  //         ball_position += ball_velocity * deltaTimeInSeconds * pctToFloor;

  //         // Break condition if no more velocity
  //         if (ball_velocity < 0) {
  //           ball_position = floor_height;
  //           scene.onBeforeRenderObservable.remove(observer);
  //         }
  //       }

  //       // Set the new position of the mesh
  //       mesh.position.y = ball_position;
  //     };

  //     const observer = scene.onBeforeRenderObservable.add(() => {
  //       // Get the delta time in milliseconds
  //       const deltaTimeInMillis = scene.getEngine().getDeltaTime();

  //       // Convert milliseconds to seconds
  //       const deltaTimeInSeconds = deltaTimeInMillis / 1000;

  //       updatePosition(deltaTimeInSeconds);
  //     });

  //     return () => {
  //       scene.onBeforeRenderObservable.remove(observer);
  //       mesh.position.y = ball_position;
  //       // Any additional cleanup
  //     };
  //   }, [isSelected, meshParams.mesh, scene]);

  return null;
};
