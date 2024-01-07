import { Animation } from "babylonjs";
//cons, potential long comput time to generate all frame but faster during runtime for complex animations

//ping pong ball  cor = 0.9
export function applyBouncing(
  node,
  amplitude,
  duration,
  cor = 0.9,
  gravity = -9.81,
  useDuration
) {
  const frameRate = 60;
  let keyFrames = [];

  // Initialize parameters
  let ball_position = node.getAbsolutePosition().y + amplitude;
  let ball_velocity = 0;
  const floor_height = node.getAbsolutePosition().y;
  let frame = 0;

  // Calculate totalFrames based on a condition to stop the animation (optional)

  keyFrames.push({ frame: frame, value: ball_position });

  const ball_velocity_modifier = gravity / frameRate;
  while (frame < 9999) {
    //check if ball is about to change direction
    if (
      Math.sign(ball_velocity_modifier) !== Math.sign(ball_velocity) &&
      Math.abs(ball_velocity_modifier) > Math.abs(ball_velocity)
    ) {
      // Calculate the proportion of the frame before the direction change
      let proportionBeforeChange =
        Math.abs(ball_velocity) / Math.abs(ball_velocity_modifier);

      // Update the position for the portion of the frame before the direction change
      ball_position += (ball_velocity * proportionBeforeChange) / frameRate;

      // Update the velocity for the next portion of the frame
      ball_velocity += ball_velocity_modifier;

      // Calculate the proportion of the frame after the direction change
      let proportionAfterChange = 1 - proportionBeforeChange;

      // Update the position for the portion of the frame after the direction change
      ball_position += (ball_velocity * proportionAfterChange) / frameRate;
    } else {
      ball_velocity += ball_velocity_modifier;
      ball_position += ball_velocity / frameRate;
    }

    // Check if the ball hits the floor
    if (ball_position <= floor_height) {
      // Calculate the proportion proportion of the frame spent inside the floor
      let pctToFloor = Math.abs(
        Math.abs(floor_height - ball_position) /
          Math.abs(ball_velocity / frameRate)
      );

      // Update the position for the portion of the frame before hitting the floor
      ball_position = floor_height;

      //cancel the ball_velocity_modifier added to velocity relative to the portion passed after the bounce
      // otherwise it acts as a force in the opposite direction of the regular gravity
      ball_velocity -= ball_velocity_modifier * pctToFloor;

      // Reverse the velocity and apply the coefficient of restitution
      ball_velocity = -ball_velocity * cor;

      //add ball_velocity_modifier relative to the portion passed after the bounce
      ball_velocity += ball_velocity_modifier * pctToFloor;

      // Update the position for the portion of the frame after hitting the floor
      ball_position += (ball_velocity / frameRate) * pctToFloor;

      // Break condition if no more velocity
      if (ball_velocity < 0) {
        ball_position = floor_height;
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
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  if (useDuration) {
    // Original duration in seconds (based on your frame rate and total frame count)
    const originalDuration = frame / frameRate;

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
