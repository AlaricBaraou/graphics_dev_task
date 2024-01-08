import { Animation } from "babylonjs";
import { getStore } from "../stores/store";
//cons, potential long comput time to generate all frame but faster during runtime for complex animations

// Constants
const FRAME_RATE = 60;
const MAX_FRAMES = 9999; // Consider a more meaningful condition to terminate the loop

/**
 * Applies a bouncing animation to a node in BabylonJS.
 * @param {Mesh} node - The node to animate.
 * @param {number} amplitude - The initial amplitude of the bounce in meters.
 * @param {number} duration - The duration of the animation in seconds.
 * @param {number} cor - Coefficient of Restitution.
 * @param {number} gravity - Gravitational acceleration in meter per seconds.
 * @param {boolean} useDuration - Whether to force a specific duration for the animation.
 */
export function applyBouncing(
  node,
  amplitude,
  duration,
  cor = 0.9,
  gravity = -9.81,
  useDuration
) {
  let keyFrames = [];

  const { allMeshes } = getStore();
  const deomPlane = allMeshes.demoPlane.mesh;

  // Initialize parameters
  const floorPosition = deomPlane.getAbsolutePosition().y;
  let ball_position = amplitude + floorPosition;
  let ball_velocity = 0;

  node.computeWorldMatrix(true);
  const boundingInfo = node.getBoundingInfo();
  const boundingBox = boundingInfo.boundingBox;

  const floor_trigger = floorPosition + boundingBox.extendSizeWorld.y;
  let frame = 0;

  keyFrames.push({ frame: frame, value: ball_position });

  const ball_velocity_modifier = gravity / FRAME_RATE;
  while (frame < MAX_FRAMES) {
    //check if ball is about to change direction
    if (
      Math.sign(ball_velocity_modifier) !== Math.sign(ball_velocity) &&
      Math.abs(ball_velocity_modifier) > Math.abs(ball_velocity)
    ) {
      // Calculate the proportion of the frame before the direction change
      let proportionBeforeChange =
        Math.abs(ball_velocity) / Math.abs(ball_velocity_modifier);

      // Update the position for the portion of the frame before the direction change
      ball_position += (ball_velocity * proportionBeforeChange) / FRAME_RATE;

      // Update the velocity for the next portion of the frame
      ball_velocity += ball_velocity_modifier;

      // Calculate the proportion of the frame after the direction change
      let proportionAfterChange = 1 - proportionBeforeChange;

      // Update the position for the portion of the frame after the direction change
      ball_position += (ball_velocity * proportionAfterChange) / FRAME_RATE;
    } else {
      ball_velocity += ball_velocity_modifier;
      ball_position += ball_velocity / FRAME_RATE;
    }

    // Check if the ball hits the floor
    if (ball_position <= floor_trigger) {
      // Calculate the proportion proportion of the frame spent inside the floor
      let pctToFloor = Math.abs(
        Math.abs(floor_trigger - ball_position) /
          Math.abs(ball_velocity / FRAME_RATE)
      );

      // Update the position for the portion of the frame before hitting the floor
      ball_position = floor_trigger;

      //cancel the ball_velocity_modifier added to velocity relative to the portion passed after the bounce
      // otherwise it acts as a force in the opposite direction of the regular gravity
      ball_velocity -= ball_velocity_modifier * pctToFloor;

      // Reverse the velocity and apply the coefficient of restitution
      ball_velocity = -ball_velocity * cor;

      //add ball_velocity_modifier relative to the portion passed after the bounce
      ball_velocity += ball_velocity_modifier * pctToFloor;

      // Update the position for the portion of the frame after hitting the floor
      ball_position += (ball_velocity / FRAME_RATE) * pctToFloor;

      // Break condition if no more velocity
      if (ball_velocity < 0) {
        ball_position = floor_trigger;
        break;
      }
    }

    // Add the position to keyframes
    frame++;
    keyFrames.push({ frame: frame, value: ball_position });
  }

  // Create the animation object
  const animation = new Animation(
    "bounceAnimation",
    "position.y",
    FRAME_RATE,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  if (useDuration) {
    // Original duration in seconds (based on your frame rate and total frame count)
    const originalDuration = frame / FRAME_RATE;

    // Calculate scale factor
    const scaleFactor = duration / originalDuration;

    // Create a new keyFrames array with adjusted frame numbers
    keyFrames = keyFrames.map((keyFrame) => ({
      frame: Math.round(keyFrame.frame * scaleFactor),
      value: keyFrame.value,
    }));
  }

  // Assign keyframes to the animation
  animation.setKeys(keyFrames);

  // Link the animation to the node
  node.animations = [];
  node.animations.push(animation);

  const scene = node.getScene();
  // Start the animation
  scene.beginAnimation(node, 0, frame, false);
}
