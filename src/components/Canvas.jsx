import { useEffect, useRef } from "react";
import {
  ArcRotateCamera,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Scene,
  ShadowGenerator,
  Vector3,
} from "babylonjs";
import { getStore, setStore } from "../stores/store";

/**
 * Prepares the scene with camera and lighting.
 * @param {object} canvas - The canvas element.
 * @param {Scene} scene - The BabylonJS scene.
 */
function prepareScene(canvas, scene) {
  // Initialize camera with ArcRotateCamera for a 3D rotating perspective
  const camera = new ArcRotateCamera(
    "camera1",
    Math.PI / 2,
    Math.PI / 2.5,
    4,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Set up lighting with HemisphericLight for a wide, soft light
  const hemisphericLight = new HemisphericLight(
    "light1",
    new Vector3(0.5, 1, 0.8).normalize(),
    scene
  );
  hemisphericLight.intensity = 0.5;

  // Use a DirectionalLight for shadows
  const directionalLight = new DirectionalLight(
    "dirLight",
    new Vector3(100, -120, -100),
    scene
  );
  directionalLight.intensity = 0.5;

  // Create a shadow generator
  const shadowGenerator = new ShadowGenerator(1024, directionalLight);
  setStore({ shadowGenerator: shadowGenerator });
}

export const Canvas = ({
  antialias,
  engineOptions = { stencil: true },
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady = () => {},
  children,
  ...props
}) => {
  const reactCanvasRef = useRef(null);

  useEffect(() => {
    const canvasElement = reactCanvasRef.current;
    if (!canvasElement) return;

    const babylonEngine = new Engine(
      canvasElement,
      antialias,
      engineOptions,
      adaptToDeviceRatio
    );
    const babylonScene = new Scene(babylonEngine, sceneOptions);

    setStore({ scene: babylonScene, canvas: canvasElement });

    prepareScene(canvasElement, babylonScene);

    if (babylonScene.isReady()) {
      onSceneReady(babylonScene);
    } else {
      babylonScene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    babylonEngine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(babylonScene);
      babylonScene.render();
    });

    const handleResize = () => {
      babylonScene.getEngine().resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      babylonScene.getEngine().dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
  ]);

  return (
    <>
      <canvas ref={reactCanvasRef} {...props}></canvas>
      {children}
    </>
  );
};
