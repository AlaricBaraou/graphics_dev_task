import { useEffect, useRef } from "react";
import {
  Mesh,
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  Quaternion,
  HighlightLayer,
} from "babylonjs";
import { getStore, setStore } from "../stores/store";

function prepareScene(canvas, scene) {
  // Camera
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 2.5,
    4,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Light
  new HemisphericLight("light", new Vector3(0.5, 1, 0.8).normalize(), scene);
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
  const reactCanvas = useRef(null);

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(
      canvas,
      antialias,
      engineOptions,
      adaptToDeviceRatio
    );
    const scene = new Scene(engine, sceneOptions);

    setStore({
      scene,
      canvas,
    });

    prepareScene(canvas, scene);

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
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
      <canvas ref={reactCanvas} {...props}></canvas>
      {children}
    </>
  );
};
